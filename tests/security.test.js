import { describe, expect, it } from "vitest";
import {
  createPasswordHash,
  generateToken,
  hashToken,
  isHashedPassword,
  isValidEmail,
  stripUnsafeText,
  verifyPasswordHash,
  verifyPaystackSignature,
} from "../lib/security.js";
import crypto from "node:crypto";

describe("generateToken", () => {
  it("returns hex of the requested byte length", () => {
    const token = generateToken(16);
    expect(token).toMatch(/^[a-f0-9]{32}$/);
  });

  it("produces different tokens on subsequent calls", () => {
    expect(generateToken()).not.toBe(generateToken());
  });
});

describe("hashToken", () => {
  it("returns a stable sha256 digest", () => {
    expect(hashToken("hello")).toBe(hashToken("hello"));
    expect(hashToken("hello")).not.toBe(hashToken("world"));
    expect(hashToken("hello")).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("createPasswordHash + verifyPasswordHash", () => {
  it("hashes with the scrypt$ prefix and verifies", () => {
    const hash = createPasswordHash("S3curePass!");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(verifyPasswordHash("S3curePass!", hash)).toBe(true);
  });

  it("rejects the wrong password", () => {
    const hash = createPasswordHash("rightPass");
    expect(verifyPasswordHash("wrongPass", hash)).toBe(false);
  });

  it("verifies the legacy salt:hash format", () => {
    const salt = crypto.randomBytes(16).toString("hex");
    const digest = crypto.scryptSync("legacyPass", salt, 64).toString("hex");
    const legacyHash = `${salt}:${digest}`;
    expect(verifyPasswordHash("legacyPass", legacyHash)).toBe(true);
    expect(verifyPasswordHash("nope", legacyHash)).toBe(false);
  });

  it("returns false for empty/undefined hashes", () => {
    expect(verifyPasswordHash("anything", "")).toBe(false);
    expect(verifyPasswordHash("anything", undefined)).toBe(false);
    expect(verifyPasswordHash("anything", "not-a-hash")).toBe(false);
  });
});

describe("isHashedPassword", () => {
  it("recognizes scrypt$ and salt:hash formats", () => {
    expect(isHashedPassword("scrypt$abc$def")).toBe(true);
    expect(isHashedPassword("abcd1234:abcd1234")).toBe(true);
  });

  it("rejects plaintext", () => {
    expect(isHashedPassword("plain-password")).toBe(false);
    expect(isHashedPassword("")).toBe(false);
  });
});

describe("stripUnsafeText", () => {
  it("removes html tags and dangerous attributes", () => {
    const dirty = '<script>alert(1)</script><b onClick="x">hi</b>';
    expect(stripUnsafeText(dirty)).toBe("alert(1)hi");
  });

  it("strips javascript: prefixes", () => {
    expect(stripUnsafeText("Visit javascript:steal()")).toBe("Visit steal()");
  });

  it("trims and bounds length", () => {
    const long = "x".repeat(5000);
    expect(stripUnsafeText(long, 50)).toHaveLength(50);
  });

  it("returns empty string for null/undefined", () => {
    expect(stripUnsafeText(null)).toBe("");
    expect(stripUnsafeText(undefined)).toBe("");
  });
});

describe("isValidEmail", () => {
  it("accepts valid addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.domain.co")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(`${"a".repeat(260)}@b.co`)).toBe(false);
  });
});

describe("verifyPaystackSignature", () => {
  it("verifies an HMAC-SHA512 signature", () => {
    const secret = "sk_test_abc";
    const body = Buffer.from(JSON.stringify({ event: "charge.success" }));
    const signature = crypto.createHmac("sha512", secret).update(body).digest("hex");
    expect(verifyPaystackSignature(body, signature, secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const secret = "sk_test_abc";
    const body = Buffer.from(JSON.stringify({ event: "charge.success" }));
    const signature = crypto.createHmac("sha512", secret).update(body).digest("hex");
    const tampered = Buffer.from(JSON.stringify({ event: "charge.failed" }));
    expect(verifyPaystackSignature(tampered, signature, secret)).toBe(false);
  });

  it("rejects with wrong secret or missing signature", () => {
    const body = Buffer.from("payload");
    const sig = crypto.createHmac("sha512", "real").update(body).digest("hex");
    expect(verifyPaystackSignature(body, sig, "fake")).toBe(false);
    expect(verifyPaystackSignature(body, "", "real")).toBe(false);
  });
});
