import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";

async function getOpenPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

async function startFakePaystack() {
  const state = {
    initializeRequests: [],
    verifyAmounts: new Map(),
  };
  const server = http.createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json");

    if (request.method === "POST" && request.url === "/transaction/initialize") {
      const body = await readRequestBody(request);
      state.initializeRequests.push(body);
      response.end(JSON.stringify({
        status: true,
        data: {
          access_code: "test-access-code",
          authorization_url: "https://paystack.test/checkout",
          reference: body.reference,
        },
      }));
      return;
    }

    if (request.method === "GET" && request.url.startsWith("/transaction/verify/")) {
      const reference = decodeURIComponent(request.url.split("/").pop());
      const amount = state.verifyAmounts.get(reference) ?? 1;
      response.end(JSON.stringify({
        status: true,
        data: {
          amount,
          currency: "NGN",
          paid_at: "2026-05-26T12:00:00.000Z",
          reference,
          status: "success",
        },
      }));
      return;
    }

    response.statusCode = 404;
    response.end(JSON.stringify({ status: false, message: "Not found" }));
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
    state,
  };
}

function cookieHeader(headers) {
  const cookies = typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : String(headers.get("set-cookie") || "").split(/,(?=\s*[^;=]+?=)/).filter(Boolean);
  return cookies.map((cookie) => cookie.split(";")[0].trim()).filter(Boolean).join("; ");
}

async function startPemServer(t) {
  const port = await getOpenPort();
  const paystack = await startFakePaystack();
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "pem-server-test-"));
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.resolve("."),
    env: {
      ...process.env,
      ADMIN_PASSWORD: "old-admin-password",
      AUTH_JWT_SECRET: "test-jwt-secret-that-is-long-enough",
      FRONTEND_URL: "http://127.0.0.1:5173",
      NODE_ENV: "test",
      PAYSTACK_BASE_URL: paystack.baseUrl,
      PAYSTACK_SECRET_KEY: "sk_test_local",
      PEM_ADMIN_ENV_PATH: path.join(tempRoot, ".env"),
      PEM_DATA_DIR: path.join(tempRoot, "data"),
      PORT: String(port),
      STORAGE_MODE: "local",
      TRUST_PROXY: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  async function stop() {
    if (!child.killed) {
      child.kill();
      await new Promise((resolve) => child.once("exit", resolve));
    }
    await paystack.close();
    await fs.rm(tempRoot, { recursive: true, force: true });
  }

  t.after(stop);

  const baseUrl = `http://127.0.0.1:${port}`;
  let lastError;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`PEM server exited early.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return { baseUrl, paystack, tempRoot };
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`PEM server did not become ready: ${lastError?.message}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
}

async function requestJson(baseUrl, pathName, { method = "GET", body, cookies = "", headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookies ? { cookie: cookies } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return {
    cookies: cookieHeader(response.headers),
    data,
    response,
  };
}

function cardOrderPayload(email = "card.qa@example.com") {
  return {
    customer: {
      address: "Wetheral Road, Owerri",
      customerName: "Card QA",
      deliveryZoneId: "gwarinpa",
      email,
      paymentMethod: "Pay with card",
      phone: "08033345161",
    },
    items: [
      {
        id: 1,
        name: "Tampered meal",
        price: 1,
        quantity: 1,
      },
    ],
  };
}

test("card orders and Paystack initialization use server-side totals", async (t) => {
  const { baseUrl, paystack } = await startPemServer(t);
  const orderResponse = await requestJson(baseUrl, "/api/orders", {
    method: "POST",
    body: cardOrderPayload(),
  });

  assert.equal(orderResponse.response.status, 201);
  assert.equal(orderResponse.data.order.status, "awaiting_payment");
  assert.equal(orderResponse.data.order.items[0].name, "Jollof Rice & Grilled Chicken");
  assert.equal(orderResponse.data.order.items[0].price, 3800);
  assert.equal(orderResponse.data.order.pricing.subtotal, 3800);
  assert.equal(orderResponse.data.order.pricing.delivery, 1200);
  assert.equal(orderResponse.data.order.pricing.total, 5000);

  const paymentResponse = await requestJson(baseUrl, "/api/payments/paystack/initialize", {
    method: "POST",
    body: {
      amount: 1,
      email: "card.qa@example.com",
      orderReference: orderResponse.data.order.reference,
    },
  });

  assert.equal(paymentResponse.response.status, 200);
  assert.equal(paystack.state.initializeRequests.length, 1);
  assert.equal(paystack.state.initializeRequests[0].amount, 500000);
  assert.equal(paystack.state.initializeRequests[0].metadata.currency, "NGN");
});

test("Paystack verify rejects amount mismatches and accepts exact NGN payments", async (t) => {
  const { baseUrl, paystack } = await startPemServer(t);

  const mismatchOrder = await requestJson(baseUrl, "/api/orders", {
    method: "POST",
    body: cardOrderPayload("mismatch.qa@example.com"),
  });
  assert.equal(mismatchOrder.response.status, 201);
  paystack.state.verifyAmounts.set(mismatchOrder.data.order.reference, 1);

  const mismatchVerify = await requestJson(baseUrl, `/api/payments/paystack/verify/${mismatchOrder.data.order.reference}`);
  assert.equal(mismatchVerify.response.status, 409);
  assert.match(mismatchVerify.data.error, /amount did not match/i);

  const paidOrder = await requestJson(baseUrl, "/api/orders", {
    method: "POST",
    body: cardOrderPayload("paid.qa@example.com"),
  });
  assert.equal(paidOrder.response.status, 201);
  paystack.state.verifyAmounts.set(paidOrder.data.order.reference, 500000);

  const paidVerify = await requestJson(baseUrl, `/api/payments/paystack/verify/${paidOrder.data.order.reference}`);
  assert.equal(paidVerify.response.status, 200);
  assert.equal(paidVerify.data.verified, true);
  assert.equal(paidVerify.data.order.status, "received");
  assert.equal(paidVerify.data.order.payment.status, "paid");
});

test("changing the owner admin password invalidates existing access and refresh sessions", async (t) => {
  const { baseUrl, tempRoot } = await startPemServer(t);

  const login = await requestJson(baseUrl, "/api/admin/login", {
    method: "POST",
    body: {
      password: "old-admin-password",
      username: "owner",
    },
  });
  assert.equal(login.response.status, 200);
  assert.match(login.cookies, /pem_admin_access=/);
  assert.match(login.cookies, /pem_admin_refresh=/);

  const summaryBefore = await requestJson(baseUrl, "/api/admin/summary", {
    cookies: login.cookies,
  });
  assert.equal(summaryBefore.response.status, 200);

  const changePassword = await requestJson(baseUrl, "/api/admin/change-password", {
    method: "POST",
    cookies: login.cookies,
    body: {
      confirmPassword: "new-admin-password",
      currentPassword: "old-admin-password",
      newPassword: "new-admin-password",
    },
  });
  assert.equal(changePassword.response.status, 200);
  assert.match(await fs.readFile(path.join(tempRoot, ".env"), "utf8"), /ADMIN_PASSWORD=new-admin-password/);

  const summaryAfter = await requestJson(baseUrl, "/api/admin/summary", {
    cookies: login.cookies,
  });
  assert.equal(summaryAfter.response.status, 401);

  const refreshAfter = await requestJson(baseUrl, "/api/admin/refresh", {
    method: "POST",
    cookies: login.cookies,
  });
  assert.equal(refreshAfter.response.status, 401);
});
