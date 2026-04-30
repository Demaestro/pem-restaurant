import { expect, request as pwRequest, test } from "@playwright/test";

const API_BASE = process.env.PLAYWRIGHT_API_BASE_URL
  || `http://localhost:${process.env.API_PORT || 4000}`;

let api;

test.beforeAll(async () => {
  api = await pwRequest.newContext({ baseURL: API_BASE });
});

test.afterAll(async () => {
  await api?.dispose();
});

test.describe("PEM admin entry", () => {
  test("rejects an empty admin login", async () => {
    const response = await api.post("/api/admin/login", { data: {} });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/password is required/i);
  });

  test("rejects bad admin credentials", async () => {
    const response = await api.post("/api/admin/login", {
      data: { username: "owner", password: "definitely-not-the-right-password" },
    });
    expect(response.status()).toBe(401);
  });

  test("audit log endpoint requires admin auth", async () => {
    const response = await api.get("/api/admin/audit-log");
    expect(response.status()).toBe(401);
  });

  test("health endpoint reports storage + integrations", async () => {
    const response = await api.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(typeof body.storageMode).toBe("string");
  });
});
