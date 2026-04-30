import crypto from "node:crypto";

const CONTROL_CHARS_REGEX = new RegExp("[\\u0000-\\u001F\\u007F]", "g");

export function generateToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function createPasswordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPasswordHash(password, storedHash) {
  if (!storedHash) return false;
  const stored = String(storedHash);
  let salt;
  let hash;
  if (stored.startsWith("scrypt$")) {
    const [, s, h] = stored.split("$");
    salt = s;
    hash = h;
  } else if (stored.includes(":")) {
    [salt, hash] = stored.split(":");
  } else {
    return false;
  }
  if (!salt || !hash) return false;
  let comparison;
  try {
    comparison = crypto.scryptSync(String(password), salt, 64).toString("hex");
  } catch {
    return false;
  }
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(comparison, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function isHashedPassword(value) {
  return typeof value === "string" && (value.startsWith("scrypt$") || /^[a-f0-9]+:[a-f0-9]+$/i.test(value));
}

export function stripUnsafeText(value, maxLength = 2000) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  text = text.replace(/<\/?[a-z][\s\S]*?>/gi, "");
  text = text.replace(CONTROL_CHARS_REGEX, "");
  text = text.replace(/javascript:/gi, "");
  text = text.replace(/on\w+\s*=/gi, "");
  text = text.replace(/\s{3,}/g, "  ");
  return text.trim().slice(0, maxLength);
}

export function isValidEmail(value) {
  const text = String(value || "").trim();
  if (!text || text.length > 254) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(text);
}

export function verifyPaystackSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(String(signature), "hex");
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
