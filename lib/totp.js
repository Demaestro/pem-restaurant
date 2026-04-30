import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { generateToken } from "./security.js";

const ISSUER = "PEM Admin";

export function createTotpSecret() {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

export function buildTotp(secret, accountName) {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: accountName || "owner",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

export function buildOtpAuthUrl(secret, accountName) {
  return buildTotp(secret, accountName).toString();
}

export async function buildOtpAuthQrDataUrl(secret, accountName) {
  return QRCode.toDataURL(buildOtpAuthUrl(secret, accountName), { width: 240 });
}

export function verifyTotpCode(secret, code) {
  if (!secret || !code) return false;
  try {
    const totp = buildTotp(secret, "owner");
    const delta = totp.validate({ token: String(code).replace(/\D/g, ""), window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

export function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => generateToken(5));
}
