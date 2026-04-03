import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import OpenAI from "openai";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { parse as parseCookieHeader, serialize as serializeCookie } from "cookie";
import { createStorage } from "./lib/storage.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "submissions.json");
const ENV_PATH = path.join(__dirname, ".env");

const app = express();
const PORT = process.env.PORT || 4000;
let adminPassword = process.env.ADMIN_PASSWORD || "change-admin-password";
const openAiModel = process.env.OPENAI_MODEL || "gpt-5-mini";
const forceLocalStorage = process.env.STORAGE_MODE === "local";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const frontendUrls = [process.env.FRONTEND_URL, ...(process.env.FRONTEND_URLS || "").split(",")]
  .map((value) => String(value || "").trim())
  .filter(Boolean);
const adminSessions = new Map();
const userSessions = new Map();
const userRefreshSessions = new Map();
const adminRefreshSessions = new Map();
const authAttemptBuckets = new Map();
const accessTokenBlacklist = new Map();
const userLockouts = new Map();
const BIRTHDAY_DISCOUNT_PERCENT = 15;
const OWNER_ADMIN_USERNAME = "owner";
const PASSWORD_RECOVERY_CODE_TTL_MS = 30 * 60 * 1000;
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FAILED_SIGNIN_ATTEMPTS = 10;
const USER_ACCESS_COOKIE = "pem_user_access";
const USER_REFRESH_COOKIE = "pem_user_refresh";
const ADMIN_ACCESS_COOKIE = "pem_admin_access";
const ADMIN_REFRESH_COOKIE = "pem_admin_refresh";
const AUTH_COOKIE_PATH = "/";
const AUTH_ISSUER = "pem-restaurant";
const AUTH_AUDIENCE = "pem-app";
const authJwtSecret =
  process.env.AUTH_JWT_SECRET
  || process.env.JWT_SECRET
  || crypto.createHash("sha256").update(`${adminPassword}|${frontendUrl}|pem-auth`).digest("hex");
const authAttemptPolicies = {
  userSignup: {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    blockMs: 15 * 60 * 1000,
    error: "Too many sign-up attempts. Please wait 15 minutes and try again.",
  },
  userLogin: {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    blockMs: 15 * 60 * 1000,
    error: "Too many sign-in attempts. Please wait 15 minutes and try again.",
  },
  adminLogin: {
    windowMs: 10 * 60 * 1000,
    maxAttempts: 5,
    blockMs: 20 * 60 * 1000,
    error: "Too many admin login attempts. Please wait 20 minutes and try again.",
  },
  passwordRecoveryRequest: {
    windowMs: 30 * 60 * 1000,
    maxAttempts: 4,
    blockMs: 30 * 60 * 1000,
    error: "Too many password recovery attempts. Please wait 30 minutes and try again.",
  },
  passwordReset: {
    windowMs: 30 * 60 * 1000,
    maxAttempts: 5,
    blockMs: 30 * 60 * 1000,
    error: "Too many password reset attempts. Please wait 30 minutes and try again.",
  },
};
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const runtimeIncidents = [];
const MAX_RUNTIME_INCIDENTS = 40;
const ORDER_EDIT_WINDOW_MS = 5 * 60 * 1000;
const branchGeoPresets = {
  "owerri-central": {
    lat: 5.4859,
    lng: 7.0246,
    serviceHints: ["wetheral", "works layout", "okigwe road", "control", "douglas", "tetlow"],
  },
  "new-owerri": {
    lat: 5.5087,
    lng: 7.0326,
    serviceHints: ["new owerri", "world bank", "concorde", "aladinma", "imsu", "port harcourt road"],
  },
  ikenegbu: {
    lat: 5.4957,
    lng: 7.0187,
    serviceHints: ["ikenegbu", "mcc", "area h", "assumpta", "warehouse"],
  },
};
app.disable("x-powered-by");
app.set("trust proxy", 1);
const defaultDeliveryZones = [
  { id: "gwarinpa", label: "Gwarinpa / Life Camp", fee: 1200, eta: "35 to 50 mins" },
  { id: "wuse", label: "Wuse / Utako / Jabi", fee: 1800, eta: "45 to 60 mins" },
  { id: "maitama", label: "Maitama / Asokoro / Guzape", fee: 2200, eta: "50 to 70 mins" },
  { id: "lugbe", label: "Lugbe / Airport Road", fee: 2500, eta: "60 to 85 mins" },
  { id: "owerri", label: "Owerri, Imo State", fee: 4500, eta: "Next-day confirmation with PEM" },
  { id: "custom", label: "Other area", fee: 3000, eta: "Confirmed after order" },
];
const defaultSettings = {
  businessName: "Precious Events Makers",
  appName: "PEM",
  phone: "0803 334 5161",
  whatsappPhone: "2348033345161",
  supportEmail: "hello@pem.local",
  address: "Abuja, Nigeria",
  heroHeadline: "Order with PEM.",
  heroCopy: "Browse the menu and check out.",
  promoBanner: "Local dishes. Premium service.",
  contactPromise: "Meals, catering, and support.",
  businessHoursText: "Open daily in Lagos time.",
  bankName: "PEM Business Account",
  bankAccountName: "Precious Events Makers",
  bankAccountNumber: "0123456789",
  bankInstructions: "After making a bank transfer, add your payment reference so PEM can confirm it faster.",
  minimumOrder: 1500,
  promoCodesText: "WELCOME10|percent|10|5000\nPARTY500|flat|500|7000",
  staffAdminsText: "manager|PemStaff2026|Floor Manager",
  branchLocationsText:
    "owerri-central|PEM Owerri Central|Wetheral Road, Owerri|0803 334 5161|8:00 AM - 9:00 PM|Fast city-center delivery, pickup, and daily meals.\nnew-owerri|PEM New Owerri|New Owerri, Imo State|0803 334 5161|8:30 AM - 9:30 PM|Best for estate drop-offs and premium catering dispatch.\nikenegbu|PEM Ikenegbu|Ikenegbu Layout, Owerri|0803 334 5161|8:00 AM - 8:30 PM|Quick office lunch, table bookings, and evening pickup.",
  receiptFooter: "Thank you for choosing PEM.",
};
const defaultMenuItems = [
  { id: 1, name: "Jollof Rice & Grilled Chicken", category: "Rice", price: 3800, rating: 4.9, reviews: 241, spicy: false, badge: "Popular", description: "Classic Nigerian party jollof with grilled chicken and sweet plantain.", dietaryTags: ["Chicken", "Rice-based", "Mild"], dietaryProfile: "Contains grilled chicken and rice. Mild heat and a balanced, filling profile.", soldOut: false, hidden: false },
  { id: 2, name: "Fried Rice & Beef Stew", category: "Rice", price: 4000, rating: 4.8, reviews: 188, spicy: false, badge: "Signature", description: "Colorful fried rice served with rich beef stew for a hearty PEM favorite.", dietaryTags: ["Beef", "Rice-based", "Mild"], dietaryProfile: "Contains beef stew and fried rice. Hearty and filling, but not suitable for beef-free diets.", soldOut: false, hidden: false },
  { id: 3, name: "Egusi Soup & Pounded Yam", category: "Soup", price: 4500, rating: 4.9, reviews: 214, spicy: false, badge: "Best Seller", description: "Rich egusi soup with assorted protein and soft pounded yam.", dietaryTags: ["Soup", "Swallow", "Rich"], dietaryProfile: "Traditional soup meal with assorted protein and pounded yam. Rich and satisfying.", soldOut: false, hidden: false },
  { id: 4, name: "Pepper Soup (Goat Meat)", category: "Soup", price: 4300, rating: 4.8, reviews: 167, spicy: true, badge: "Hot", description: "Aromatic pepper soup with goat meat, local spices, and deep warming flavor.", dietaryTags: ["Goat meat", "Spicy", "Soup"], dietaryProfile: "Spicy goat meat pepper soup. The closest fit on this menu for guests asking for lower-carb soup options.", soldOut: false, hidden: false },
  { id: 5, name: "Ogbono Soup & Eba", category: "Soup", price: 3900, rating: 4.7, reviews: 151, spicy: false, badge: "Classic", description: "Smooth ogbono soup paired with fresh eba and a balanced local taste.", dietaryTags: ["Soup", "Swallow", "Local"], dietaryProfile: "Traditional ogbono soup served with eba. Mild compared with the hotter soups on the menu.", soldOut: false, hidden: false },
  { id: 6, name: "Delicious Okro Soup", category: "Soup", price: 4100, rating: 4.8, reviews: 132, spicy: true, badge: "Local", description: "Fresh okro soup with a rich blend of stock, spice, and satisfying texture.", dietaryTags: ["Soup", "Spicy", "Local"], dietaryProfile: "Spicier local soup option with rich texture and a more traditional feel.", soldOut: false, hidden: false },
  { id: 7, name: "Delicious Ukwa", category: "Local Special", price: 3600, rating: 4.6, reviews: 98, spicy: false, badge: "Traditional", description: "African breadfruit prepared in a comforting local style for a distinct PEM meal.", dietaryTags: ["Traditional", "Local special", "Mild"], dietaryProfile: "Traditional African breadfruit dish with a comforting local style and mild flavor profile.", soldOut: false, hidden: false },
  { id: 8, name: "Spaghetti Bolognese", category: "Pasta", price: 3500, rating: 4.5, reviews: 89, spicy: false, badge: "Continental", description: "Savory spaghetti in a rich tomato and meat sauce for guests who want variety.", dietaryTags: ["Pasta", "Meat sauce", "Mild"], dietaryProfile: "Pasta dish with meat sauce. Better for guests who want a softer, non-spicy continental option.", soldOut: false, hidden: false },
  { id: 9, name: "Abacha", category: "Local Special", price: 3200, rating: 4.7, reviews: 84, spicy: true, badge: "Eastern Favorite", description: "Traditional African salad with a lively local taste and classic market-style flavor.", dietaryTags: ["Traditional", "Local", "Spicy"], dietaryProfile: "A local specialty with a stronger traditional profile. Good for guests asking for native dishes.", soldOut: false, hidden: false },
  { id: 10, name: "Afang Soup", category: "Soup", price: 4600, rating: 4.9, reviews: 176, spicy: false, badge: "Premium Local", description: "Rich afang soup with deep flavor, hearty texture, and a polished event-ready finish.", dietaryTags: ["Soup", "Local", "Rich"], dietaryProfile: "Rich local soup option with a traditional, filling profile for guests who want premium native dishes.", soldOut: false, hidden: false },
  { id: 11, name: "Asun", category: "Grills", price: 4200, rating: 4.7, reviews: 92, spicy: true, badge: "Smoky", description: "Spicy grilled asun with a bold smoky finish for guests who want something lively.", dietaryTags: ["Grill", "Spicy", "Protein"], dietaryProfile: "A spicy grilled protein option suited to guests who want bold flavor and a meat-focused choice.", soldOut: false, hidden: false },
  { id: 12, name: "Coleslaw", category: "Sides", price: 1500, rating: 4.4, reviews: 41, spicy: false, badge: "Fresh Side", description: "Creamy fresh coleslaw that pairs well with rice dishes, grills, and party packs.", dietaryTags: ["Side", "Fresh", "Mild"], dietaryProfile: "A mild side dish that helps balance heavier or spicier meals.", soldOut: false, hidden: false },
  { id: 13, name: "Moi Moi", category: "Sides", price: 1800, rating: 4.6, reviews: 67, spicy: false, badge: "Protein Side", description: "Soft steamed bean pudding that works well as a side or light meal addition.", dietaryTags: ["Beans", "Side", "Mild"], dietaryProfile: "A lighter bean-based side that can support guests asking for something softer and less spicy.", soldOut: false, hidden: false },
  { id: 14, name: "Oha Soup", category: "Soup", price: 4400, rating: 4.8, reviews: 103, spicy: false, badge: "Native Choice", description: "A warm, comforting oha soup with a beautiful home-style local finish.", dietaryTags: ["Soup", "Traditional", "Local"], dietaryProfile: "Milder native soup option with a home-style feel and strong local appeal.", soldOut: false, hidden: false },
  { id: 15, name: "Parfait", category: "Drinks & Desserts", price: 2500, rating: 4.5, reviews: 38, spicy: false, badge: "Cool Treat", description: "Layered parfait for guests who want a chilled, sweet add-on to their order.", dietaryTags: ["Dessert", "Cool", "Sweet"], dietaryProfile: "A dessert-style add-on rather than a main meal. Good for lighter, chilled indulgence.", soldOut: false, hidden: false },
  { id: 16, name: "Plantain", category: "Sides", price: 1400, rating: 4.7, reviews: 59, spicy: false, badge: "Side Favorite", description: "Golden fried plantain that pairs easily with rice, soup, and grilled meals.", dietaryTags: ["Side", "Sweet", "Mild"], dietaryProfile: "A mild popular side that complements many PEM dishes.", soldOut: false, hidden: false },
  { id: 17, name: "Porridge Beans and Plantain", category: "Local Special", price: 3300, rating: 4.6, reviews: 73, spicy: false, badge: "Comfort Meal", description: "Comforting beans porridge served with sweet plantain for a filling local option.", dietaryTags: ["Beans", "Local", "Mild"], dietaryProfile: "A gentler local comfort meal and one of the softer non-spicy options on the menu.", soldOut: false, hidden: false },
  { id: 18, name: "White Rice and Sauce", category: "Rice", price: 3400, rating: 4.5, reviews: 64, spicy: false, badge: "Simple Choice", description: "Plain white rice served with rich sauce for guests who want a simpler plate.", dietaryTags: ["Rice-based", "Mild", "Simple"], dietaryProfile: "A simpler rice dish for guests who want a less intense flavor profile.", soldOut: false, hidden: false },
  { id: 19, name: "White Soup (Ofe Nsala)", category: "Soup", price: 4700, rating: 4.8, reviews: 88, spicy: false, badge: "Chef's Pick", description: "Delicate white soup with a refined native flavor and rich event-style presentation.", dietaryTags: ["Soup", "Native", "Mild"], dietaryProfile: "A polished native soup option with milder flavor than the hotter soup choices.", soldOut: false, hidden: false },
  { id: 20, name: "Hollandia", category: "Drinks", price: 1200, rating: 4.4, reviews: 22, spicy: false, badge: "Chilled Drink", description: "Cold dairy drink for guests who want something smooth and refreshing with their meal.", dietaryTags: ["Drink", "Cold", "Mild"], dietaryProfile: "A chilled drink option that pairs well with spicy or heavy meals.", soldOut: false, hidden: false },
  { id: 21, name: "Smoothie", category: "Drinks", price: 2200, rating: 4.6, reviews: 31, spicy: false, badge: "Fresh Blend", description: "Fresh smoothie with a cooler, lighter feel for customers who want a premium drink.", dietaryTags: ["Drink", "Cold", "Fresh"], dietaryProfile: "A lighter premium drink option for customers who want something refreshing.", soldOut: false, hidden: false },
  { id: 22, name: "Water", category: "Drinks", price: 500, rating: 4.8, reviews: 18, spicy: false, badge: "Essential", description: "Simple bottled water to complete any PEM order.", dietaryTags: ["Drink", "Hydration", "Zero spice"], dietaryProfile: "The simplest drink choice for every customer.", soldOut: false, hidden: false },
];
const storage = createStorage({
  dataDir: DATA_DIR,
  dbPath: DB_PATH,
  supabaseUrl: forceLocalStorage ? "" : process.env.SUPABASE_URL,
  supabaseServiceRoleKey: forceLocalStorage ? "" : process.env.SUPABASE_SERVICE_ROLE_KEY,
  defaultDeliveryZones,
  defaultMenuItems,
  defaultSettings,
});

const allowedOrigins = [...new Set([...frontendUrls, "http://localhost:5173", "http://127.0.0.1:5173"])];

function isLocalDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(origin || "").trim());
}

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed."));
    },
  }),
);
app.use(express.json({ limit: "300kb" }));

function makeReference(prefix) {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${Date.now()}-${random}`;
}

function createAdminToken() {
  return crypto.randomBytes(24).toString("hex");
}

function getBearerToken(request) {
  const authHeader = request.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice(7);
}

function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function validatePasswordInput(value, minimumLength = 8) {
  return String(value || "").length >= minimumLength;
}

function validateFullNameInput(value) {
  const normalized = normalizeProfileText(value, 80);
  return normalized.length >= 2 ? normalized : "";
}

function validateAddressInput(value) {
  const normalized = normalizeProfileText(value, 180);
  return normalized.length >= 6 ? normalized : "";
}

function validatePhoneInput(value, required = false) {
  const normalized = sanitizePhoneInput(value);
  const digits = normalizePhoneDigits(normalized);
  if (!digits) {
    return required ? "" : normalized;
  }
  if (digits.length < 10 || digits.length > 15) {
    return "";
  }
  return normalized;
}

function cleanupLockouts(now = Date.now()) {
  for (const [email, state] of userLockouts.entries()) {
    if (!state?.lockedUntil) {
      continue;
    }
    if (state.lockedUntil <= now) {
      userLockouts.delete(email);
    }
  }
}

function getUserLockoutState(email) {
  cleanupLockouts();
  return userLockouts.get(String(email || "").trim().toLowerCase()) || null;
}

function registerUserCredentialFailure(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }
  const now = Date.now();
  const current = getUserLockoutState(normalizedEmail) || { failedCount: 0, lockedUntil: 0 };
  const nextFailedCount = Number(current.failedCount || 0) + 1;
  const nextState = {
    failedCount: nextFailedCount,
    lockedUntil: nextFailedCount >= MAX_FAILED_SIGNIN_ATTEMPTS ? now + PASSWORD_RECOVERY_CODE_TTL_MS : 0,
  };
  userLockouts.set(normalizedEmail, nextState);
  return nextState.lockedUntil ? "Too many unsuccessful sign-ins. Start password recovery to unlock this account." : "";
}

function clearUserCredentialFailures(email) {
  userLockouts.delete(String(email || "").trim().toLowerCase());
}

function getAccessTokenFromRequest(request, cookieName) {
  const cookies = parseCookies(request);
  return String(cookies[cookieName] || "").trim() || getBearerToken(request);
}

function getRefreshTokenFromRequest(request, cookieName) {
  const cookies = parseCookies(request);
  return String(cookies[cookieName] || "").trim();
}

function getClientAddress(request) {
  const forwarded = String(request.headers["x-forwarded-for"] || "")
    .split(",")
    .map((value) => value.trim())
    .find(Boolean);
  return forwarded || request.ip || request.socket?.remoteAddress || "unknown";
}

function buildAttemptKey(scope, request, identifier = "") {
  return `${scope}:${getClientAddress(request)}:${String(identifier || "anon").trim().toLowerCase()}`;
}

function cleanupAttemptBucket(bucket, now = Date.now()) {
  if (!bucket) {
    return bucket;
  }
  if (bucket.blockedUntil && bucket.blockedUntil <= now) {
    bucket.blockedUntil = 0;
  }
  bucket.attempts = (bucket.attempts || []).filter((timestamp) => now - timestamp <= bucket.windowMs);
  return bucket;
}

function getAttemptBucket(scope, request, identifier = "") {
  const policy = authAttemptPolicies[scope];
  const key = buildAttemptKey(scope, request, identifier);
  const existing = cleanupAttemptBucket(authAttemptBuckets.get(key), Date.now());
  if (existing) {
    authAttemptBuckets.set(key, existing);
    return { key, policy, bucket: existing };
  }
  const fresh = {
    attempts: [],
    blockedUntil: 0,
    windowMs: policy.windowMs,
  };
  authAttemptBuckets.set(key, fresh);
  return { key, policy, bucket: fresh };
}

function getAttemptLimitError(scope, request, identifier = "") {
  const { bucket, policy } = getAttemptBucket(scope, request, identifier);
  return bucket.blockedUntil && bucket.blockedUntil > Date.now() ? policy.error : "";
}

function registerFailedAttempt(scope, request, identifier = "") {
  const { key, bucket, policy } = getAttemptBucket(scope, request, identifier);
  const now = Date.now();
  bucket.attempts.push(now);
  bucket.attempts = bucket.attempts.filter((timestamp) => now - timestamp <= policy.windowMs);
  if (bucket.attempts.length >= policy.maxAttempts) {
    bucket.blockedUntil = now + policy.blockMs;
  }
  authAttemptBuckets.set(key, bucket);
  return bucket.blockedUntil && bucket.blockedUntil > now ? policy.error : "";
}

function clearAttemptBucket(scope, request, identifier = "") {
  authAttemptBuckets.delete(buildAttemptKey(scope, request, identifier));
}

function issueUserAuth(response, request, session) {
  const accessToken = createAccessToken("user", session.email);
  const refreshToken = issueRefreshToken(userRefreshSessions, "user", session.email, {
    email: session.email,
  });
  setUserAuthCookies(response, request, accessToken, refreshToken);
  return { accessToken, refreshToken };
}

function issueAdminAuth(response, request, session) {
  const accessToken = createAccessToken("admin", session.username, {
    branchId: session.branchId || "",
    isOwner: Boolean(session.isOwner),
    label: session.label || "Owner",
  });
  const refreshToken = issueRefreshToken(adminRefreshSessions, "admin", session.username, {
    branchId: session.branchId || "",
    isOwner: Boolean(session.isOwner),
    label: session.label || "Owner",
    username: session.username,
  });
  setAdminAuthCookies(response, request, accessToken, refreshToken);
  return { accessToken, refreshToken };
}

function getUserSessionFromAccessToken(request) {
  cleanupExpiringEntries(accessTokenBlacklist);
  const token = getAccessTokenFromRequest(request, USER_ACCESS_COOKIE);
  const decoded = token ? decodeAccessToken(token) : null;

  if (decoded?.scope === "user" && decoded?.sub && !accessTokenBlacklist.has(decoded.jti)) {
    return {
      email: String(decoded.sub || "").trim().toLowerCase(),
      createdAt: decoded.iat ? new Date(Number(decoded.iat) * 1000).toISOString() : new Date().toISOString(),
      tokenSource: "cookie",
    };
  }

  const legacyToken = getBearerToken(request);
  const legacySession = legacyToken ? userSessions.get(legacyToken) : null;
  return legacySession ? { ...legacySession, tokenSource: "bearer" } : null;
}

function getAdminSessionFromAccessToken(request) {
  cleanupExpiringEntries(accessTokenBlacklist);
  const token = getAccessTokenFromRequest(request, ADMIN_ACCESS_COOKIE);
  const decoded = token ? decodeAccessToken(token) : null;

  if (decoded?.scope === "admin" && decoded?.sub && !accessTokenBlacklist.has(decoded.jti)) {
    return {
      createdAt: decoded.iat ? new Date(Number(decoded.iat) * 1000).toISOString() : new Date().toISOString(),
      username: String(decoded.sub || "").trim().toLowerCase(),
      label: String(decoded.label || "").trim() || "Owner",
      branchId: String(decoded.branchId || "").trim(),
      isOwner: Boolean(decoded.isOwner),
      tokenSource: "cookie",
    };
  }

  const legacyToken = getBearerToken(request);
  const legacySession = legacyToken ? adminSessions.get(legacyToken) : null;
  return legacySession ? { ...legacySession, tokenSource: "bearer" } : null;
}

function requireAdmin(request, response, next) {
  const session = getAdminSessionFromAccessToken(request);
  if (!session) {
    return response.status(401).json({ error: "Admin login required." });
  }

  request.adminSession = session;
  next();
}

function requireOwnerAdmin(request, response, next) {
  if (request.adminSession?.username !== "owner") {
    return response.status(403).json({ error: "Only the PEM owner account can change global business settings." });
  }
  next();
}

function requireUser(request, response, next) {
  const session = getUserSessionFromAccessToken(request);
  if (!session?.email) {
    return response.status(401).json({ error: "User login required." });
  }

  request.userSession = session;
  next();
}

function getOptionalUserSession(request) {
  return getUserSessionFromAccessToken(request);
}

function getOptionalAdminSession(request) {
  return getAdminSessionFromAccessToken(request);
}

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function cleanupExpiringEntries(store, now = Date.now()) {
  for (const [key, value] of store.entries()) {
    if (!value || Number(value.expiresAt || 0) <= now) {
      store.delete(key);
    }
  }
}

function parseCookies(request) {
  return parseCookieHeader(String(request.headers.cookie || ""));
}

function shouldUseSecureCookies(request) {
  const forwardedProto = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim().toLowerCase();
  return process.env.NODE_ENV === "production" || request.secure || forwardedProto === "https";
}

function buildAuthCookie(name, value, request, maxAgeMs) {
  return serializeCookie(name, value, {
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "strict",
    path: AUTH_COOKIE_PATH,
    maxAge: Math.max(0, Math.floor(maxAgeMs / 1000)),
  });
}

function clearAuthCookie(name, request) {
  return serializeCookie(name, "", {
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "strict",
    path: AUTH_COOKIE_PATH,
    maxAge: 0,
    expires: new Date(0),
  });
}

function appendSetCookie(response, cookies) {
  const existing = response.getHeader("Set-Cookie");
  const current = Array.isArray(existing) ? existing : existing ? [existing] : [];
  response.setHeader("Set-Cookie", [...current, ...cookies]);
}

function createAccessToken(scope, subject, claims = {}) {
  const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS;
  const jti = crypto.randomBytes(16).toString("hex");
  const token = jwt.sign(
    {
      scope,
      ...claims,
    },
    authJwtSecret,
    {
      algorithm: "HS256",
      audience: AUTH_AUDIENCE,
      expiresIn: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
      issuer: AUTH_ISSUER,
      jwtid: jti,
      subject,
    },
  );
  return { token, expiresAt, jti };
}

function decodeAccessToken(token) {
  try {
    return jwt.verify(token, authJwtSecret, {
      algorithms: ["HS256"],
      audience: AUTH_AUDIENCE,
      issuer: AUTH_ISSUER,
    });
  } catch (_error) {
    return null;
  }
}

function blacklistAccessToken(token) {
  const decoded = decodeAccessToken(token);
  if (!decoded?.jti || !decoded?.exp) {
    return;
  }
  accessTokenBlacklist.set(decoded.jti, {
    expiresAt: Number(decoded.exp) * 1000,
  });
}

function issueRefreshToken(store, scope, subject, session = {}) {
  cleanupExpiringEntries(store);
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + REFRESH_TOKEN_TTL_MS;
  store.set(token, {
    ...session,
    expiresAt,
    issuedAt: new Date().toISOString(),
    scope,
    subject,
  });
  return { token, expiresAt };
}

function consumeRefreshToken(store, token, expectedScope) {
  cleanupExpiringEntries(store);
  const session = store.get(token);
  if (!session || session.scope !== expectedScope || Number(session.expiresAt || 0) <= Date.now()) {
    if (session) {
      store.delete(token);
    }
    return null;
  }
  store.delete(token);
  return session;
}

function setUserAuthCookies(response, request, accessToken, refreshToken) {
  appendSetCookie(response, [
    buildAuthCookie(USER_ACCESS_COOKIE, accessToken.token, request, ACCESS_TOKEN_TTL_MS),
    buildAuthCookie(USER_REFRESH_COOKIE, refreshToken.token, request, REFRESH_TOKEN_TTL_MS),
  ]);
}

function clearUserAuthCookies(response, request) {
  appendSetCookie(response, [
    clearAuthCookie(USER_ACCESS_COOKIE, request),
    clearAuthCookie(USER_REFRESH_COOKIE, request),
  ]);
}

function setAdminAuthCookies(response, request, accessToken, refreshToken) {
  appendSetCookie(response, [
    buildAuthCookie(ADMIN_ACCESS_COOKIE, accessToken.token, request, ACCESS_TOKEN_TTL_MS),
    buildAuthCookie(ADMIN_REFRESH_COOKIE, refreshToken.token, request, REFRESH_TOKEN_TTL_MS),
  ]);
}

function clearAdminAuthCookies(response, request) {
  appendSetCookie(response, [
    clearAuthCookie(ADMIN_ACCESS_COOKIE, request),
    clearAuthCookie(ADMIN_REFRESH_COOKIE, request),
  ]);
}

function isBcryptHash(storedHash) {
  return /^\$2[aby]\$\d{2}\$/.test(String(storedHash || ""));
}

function createPasswordHash(password) {
  return bcrypt.hashSync(String(password || ""), 12);
}

function verifyPassword(password, storedHash) {
  const normalizedStoredHash = String(storedHash || "");
  if (!normalizedStoredHash) {
    return { ok: false, needsUpgrade: false };
  }

  if (isBcryptHash(normalizedStoredHash)) {
    return {
      ok: bcrypt.compareSync(String(password || ""), normalizedStoredHash),
      needsUpgrade: false,
    };
  }

  const [salt, hash] = normalizedStoredHash.split(":");
  if (!salt || !hash) {
    return { ok: false, needsUpgrade: false };
  }
  const comparison = crypto.scryptSync(password, salt, 64).toString("hex");
  return {
    ok: crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(comparison, "hex")),
    needsUpgrade: true,
  };
}

function isCardPaymentMethod(method) {
  return ["Pay with card", "Paystack"].includes(String(method || "").trim());
}

function isSupportedCheckoutPaymentMethod(method) {
  return ["Bank transfer", "Pay with card", "Paystack"].includes(String(method || "").trim());
}

function getLagosDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: String(values.year || ""),
    month: String(values.month || ""),
    day: String(values.day || ""),
  };
}

function normalizeBirthday(value) {
  const normalized = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return "";
  }
  const parsed = new Date(`${normalized}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  const today = getLagosDateParts();
  if (normalized > `${today.year}-${today.month}-${today.day}`) {
    return "";
  }
  return normalized;
}

function isBirthdayToday(birthday, now = getLagosDateParts()) {
  const normalized = normalizeBirthday(birthday);
  if (!normalized) {
    return false;
  }
  const [, month, day] = normalized.split("-");
  return month === now.month && day === now.day;
}

function isBirthdayDiscountEligible(user, now = getLagosDateParts()) {
  if (!user || !isBirthdayToday(user.birthday, now)) {
    return false;
  }
  return String(user.birthdayDiscountLastUsedYear || "") !== now.year;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const now = getLagosDateParts();
  const birthdayIsToday = isBirthdayToday(user.birthday, now);
  const birthdayDiscountEligible = isBirthdayDiscountEligible(user, now);
  const { passwordHash, birthdayGreetingYear, birthdayDiscountLastUsedYear, ...rest } = user;
  return {
    ...rest,
    birthday: rest.birthday || "",
    birthdayIsToday,
    birthdayDiscountEligible,
    birthdayDiscountPercent: BIRTHDAY_DISCOUNT_PERCENT,
  };
}

function sanitizePasswordRecoveryRequest(entry) {
  if (!entry) {
    return null;
  }
  const { approvalCodeHash, ...safeEntry } = entry;
  return safeEntry;
}

function createRecoveryCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildLoyaltyTier(points) {
  if (points >= 120) return "gold";
  if (points >= 60) return "silver";
  return "bronze";
}

function createNotification(message, type = "general", metadata = {}) {
  return {
    id: crypto.randomBytes(8).toString("hex"),
    type,
    message,
    createdAt: new Date().toISOString(),
    read: false,
    ...metadata,
  };
}

function pushRuntimeIncident(incident) {
  runtimeIncidents.unshift({
    id: crypto.randomBytes(8).toString("hex"),
    createdAt: new Date().toISOString(),
    ...incident,
  });
  if (runtimeIncidents.length > MAX_RUNTIME_INCIDENTS) {
    runtimeIncidents.length = MAX_RUNTIME_INCIDENTS;
  }
}

function createBirthdayNotification(fullName) {
  const firstName = String(fullName || "").trim().split(/\s+/)[0] || "there";
  return createNotification(
    `Happy Birthday, ${firstName}. Your first PEM order today gets ${BIRTHDAY_DISCOUNT_PERCENT}% off.`,
    "birthday",
  );
}

function withBirthdayGreeting(user, now = getLagosDateParts()) {
  if (!user || !isBirthdayToday(user.birthday, now) || String(user.birthdayGreetingYear || "") === now.year) {
    return user;
  }
  return {
    ...user,
    notifications: [
      createBirthdayNotification(user.fullName),
      ...(user.notifications || []),
    ].slice(0, 15),
    birthdayGreetingYear: now.year,
    updatedAt: new Date().toISOString(),
  };
}

function getBirthdayDiscountAmount(user, subtotal, now = getLagosDateParts()) {
  if (!isBirthdayDiscountEligible(user, now)) {
    return 0;
  }
  return Math.max(0, Math.round((Number(subtotal) || 0) * (BIRTHDAY_DISCOUNT_PERCENT / 100)));
}

async function recoverGuestOrdersForUser(user) {
  if (!user) {
    return { user: null, recoveredOrders: [] };
  }

  const normalizedEmail = normalizeEmail(user.email);
  const normalizedPhone = normalizePhoneDigits(user.phone);
  if (!normalizedEmail && !normalizedPhone) {
    return { user, recoveredOrders: [] };
  }

  const matchedOrders = await storage.getOrdersByGuestIdentity({
    email: normalizedEmail,
    phone: normalizedPhone,
  });
  const eligibleOrders = matchedOrders.filter((order) => {
    const orderEmail = normalizeEmail(order.customer?.email);
    const orderPhone = normalizePhoneDigits(order.customer?.phone);

    if (normalizedEmail && orderEmail) {
      return orderEmail === normalizedEmail;
    }

    if (!orderEmail && normalizedPhone && orderPhone) {
      return orderPhone === normalizedPhone;
    }

    return false;
  });

  const existingReferences = new Set(
    (user.orderReferences || []).map((reference) => String(reference || "").trim().toUpperCase()),
  );
  const recoveredOrders = eligibleOrders.filter(
    (order) => !existingReferences.has(String(order.reference || "").trim().toUpperCase()),
  );

  if (recoveredOrders.length === 0) {
    return { user, recoveredOrders: [] };
  }

  const nextOrderReferences = [
    ...eligibleOrders.map((order) => order.reference),
    ...(user.orderReferences || []),
  ].filter((reference, index, items) => reference && items.indexOf(reference) === index).slice(0, 20);

  const nextSavedAddresses = [
    ...(user.savedAddresses || []),
    ...eligibleOrders
      .map((order) => String(order.customer?.address || "").trim())
      .filter(Boolean),
  ].filter((address, index, items) => address && items.indexOf(address) === index).slice(0, 5);

  const recoveredPhone = eligibleOrders
    .map((order) => sanitizePhoneInput(order.customer?.phone))
    .find((value) => normalizePhoneDigits(value).length >= 10);

  const updatedUser = await storage.updateUser(user.email, {
    ...user,
    phone: user.phone || recoveredPhone || "",
    savedAddresses: nextSavedAddresses,
    orderReferences: nextOrderReferences,
    notifications: [
      createNotification(
        `PEM restored ${recoveredOrders.length} earlier order${recoveredOrders.length === 1 ? "" : "s"} to your account.`,
        "account",
        { recoveredOrderCount: recoveredOrders.length },
      ),
      ...(user.notifications || []),
    ].slice(0, 15),
    updatedAt: new Date().toISOString(),
  });

  return {
    user: updatedUser || {
      ...user,
      phone: user.phone || recoveredPhone || "",
      savedAddresses: nextSavedAddresses,
      orderReferences: nextOrderReferences,
    },
    recoveredOrders,
  };
}

function parsePromoCodes(rawValue) {
  return String(rawValue || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [code, type, amount, minimumOrder = "0"] = line.split("|").map((part) => String(part || "").trim());
      if (!code || !type || !amount) {
        return null;
      }
      return {
        code: code.toUpperCase(),
        type: type === "percent" ? "percent" : "flat",
        amount: Number(amount) || 0,
        minimumOrder: Number(minimumOrder) || 0,
      };
    })
    .filter(Boolean);
}

function getPromoDiscount(promoCode, subtotal, promoCodes = []) {
  const normalizedCode = String(promoCode || "").trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, amount: 0, code: "", type: "", minimumOrder: 0 };
  }

  const promo = promoCodes.find((item) => item.code === normalizedCode);
  if (!promo) {
    return { valid: false, amount: 0, code: normalizedCode, type: "", minimumOrder: 0 };
  }

  if ((Number(subtotal) || 0) < promo.minimumOrder) {
    return { valid: false, amount: 0, code: normalizedCode, type: promo.type, minimumOrder: promo.minimumOrder };
  }

  const discountAmount = promo.type === "percent"
    ? Math.round((Number(subtotal) || 0) * (promo.amount / 100))
    : promo.amount;

  return {
    valid: true,
    amount: Math.max(0, Math.min(discountAmount, Number(subtotal) || 0)),
    code: normalizedCode,
    type: promo.type,
    minimumOrder: promo.minimumOrder,
  };
}

function normalizePhoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeProfileText(value, maxLength = 120) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizePhoneInput(value) {
  return String(value || "")
    .replace(/[^\d+\s()-]/g, "")
    .replace(/\s{2,}/g, " ")
    .trimStart()
    .slice(0, 22);
}

function parseTimeLabelToMinutes(label) {
  const normalized = String(label || "").trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]) % 12;
  const minutes = Number(match[2] || 0);
  if (match[3] === "PM") {
    hour += 12;
  }

  return hour * 60 + minutes;
}

function parseHoursWindow(hoursLabel) {
  const [openLabel = "", closeLabel = ""] = String(hoursLabel || "").split("-").map((part) => part.trim());
  const openMinutes = parseTimeLabelToMinutes(openLabel);
  const closeMinutes = parseTimeLabelToMinutes(closeLabel);

  if (openMinutes === null || closeMinutes === null) {
    return null;
  }

  return {
    open: openMinutes,
    close: closeMinutes,
  };
}

function isTimeWithinWindow(minutes, window) {
  if (!window) {
    return true;
  }

  if (window.open === window.close) {
    return true;
  }

  if (window.open < window.close) {
    return minutes >= window.open && minutes <= window.close;
  }

  return minutes >= window.open || minutes <= window.close;
}

function isScheduledWithinBusinessHours(scheduledFor, hoursLabel) {
  const scheduledDate = new Date(scheduledFor);
  if (Number.isNaN(scheduledDate.getTime())) {
    return false;
  }

  const hoursWindow = parseHoursWindow(hoursLabel);
  if (!hoursWindow) {
    return true;
  }

  return isTimeWithinWindow(
    scheduledDate.getHours() * 60 + scheduledDate.getMinutes(),
    hoursWindow,
  );
}

function parseStaffAdmins(rawValue) {
  return String(rawValue || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [username, password, label = "PEM Staff", branchId = ""] = line.split("|").map((part) => String(part || "").trim());
      if (!username || !password) {
        return null;
      }
      return {
        username: username.toLowerCase(),
        password,
        label,
        branchId: branchId.toLowerCase(),
      };
    })
    .filter(Boolean);
}

function parseBranchLocations(rawValue, settings = defaultSettings) {
  const parsed = String(rawValue || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, label, address, phone, hours, note, lat, lng, serviceHintsText] = line.split("|").map((part) => String(part || "").trim());
      if (!id || !label) {
        return null;
      }
      const preset = branchGeoPresets[String(id || "").trim().toLowerCase()] || {};
      return {
        id: id.toLowerCase(),
        label,
        address: address || settings.address,
        phone: phone || settings.phone,
        hours: hours || settings.businessHoursText,
        note: note || `${label} branch support.`,
        lat: Number.isFinite(Number(lat)) ? Number(lat) : preset.lat ?? null,
        lng: Number.isFinite(Number(lng)) ? Number(lng) : preset.lng ?? null,
        serviceHints: (serviceHintsText
          ? serviceHintsText.split(",").map((item) => item.trim()).filter(Boolean)
          : preset.serviceHints || []),
      };
    })
    .filter(Boolean);

  if (parsed.length > 0) {
    return parsed;
  }

  return [
    {
      id: "main-branch",
      label: `${settings.appName} Main Branch`,
      address: settings.address,
      phone: settings.phone,
      hours: settings.businessHoursText,
      note: `${settings.businessName} main branch.`,
      lat: null,
      lng: null,
      serviceHints: [],
    },
  ];
}

function normalizeSearchableText(value) {
  return String(value || "").trim().toLowerCase();
}

function getDistanceKm(fromLat, fromLng, toLat, toLng) {
  const sourceLat = Number(fromLat);
  const sourceLng = Number(fromLng);
  const targetLat = Number(toLat);
  const targetLng = Number(toLng);
  if (![sourceLat, sourceLng, targetLat, targetLng].every(Number.isFinite)) {
    return Number.POSITIVE_INFINITY;
  }
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(targetLat - sourceLat);
  const deltaLng = toRadians(targetLng - sourceLng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(sourceLat)) * Math.cos(toRadians(targetLat)) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestBranchByCoordinates(branches, latitude, longitude) {
  const candidates = branches
    .map((branch) => ({
      ...branch,
      distanceKm: getDistanceKm(latitude, longitude, branch.lat, branch.lng),
    }))
    .filter((branch) => Number.isFinite(branch.distanceKm))
    .sort((left, right) => left.distanceKm - right.distanceKm);
  return candidates[0] || null;
}

function suggestBranchFromAddress(address, settings = defaultSettings) {
  const normalizedAddress = normalizeSearchableText(address);
  if (!normalizedAddress) {
    return resolveBranchSelection("", settings);
  }
  const branches = parseBranchLocations(settings.branchLocationsText, settings);
  const scoredBranches = branches
    .map((branch) => {
      const haystack = [
        branch.label,
        branch.address,
        branch.note,
        ...(branch.serviceHints || []),
      ]
        .map(normalizeSearchableText)
        .join(" ");
      const score = (branch.serviceHints || []).reduce((sum, hint) => (
        normalizedAddress.includes(normalizeSearchableText(hint)) ? sum + 4 : sum
      ), 0)
        + (normalizedAddress.includes(normalizeSearchableText(branch.label)) ? 3 : 0)
        + (normalizedAddress.includes(normalizeSearchableText(branch.address)) ? 2 : 0)
        + (haystack && normalizedAddress.split(/[,\s/]+/).filter(Boolean).reduce((sum, token) => (
          haystack.includes(token) ? sum + 0.2 : sum
        ), 0));
      return { branch, score };
    })
    .sort((left, right) => right.score - left.score);
  return scoredBranches[0]?.score > 0 ? scoredBranches[0].branch : resolveBranchSelection("", settings);
}

function resolveBranchSelection(inputBranchId, settings = defaultSettings) {
  const branches = parseBranchLocations(settings.branchLocationsText, settings);
  const normalizedBranchId = String(inputBranchId || "").trim().toLowerCase();
  return branches.find((branch) => branch.id === normalizedBranchId) || branches[0];
}

function normalizeOrderOperations(input = {}) {
  const current = input && typeof input === "object" ? input : {};
  const normalizedRiderPhone = sanitizePhoneInput(current.riderPhone || "");
  return {
    kitchenStation: normalizeProfileText(current.kitchenStation, 80),
    prepEtaMinutes: Math.max(0, Math.min(180, Number(current.prepEtaMinutes) || 0)),
    riderName: normalizeProfileText(current.riderName, 80),
    riderPhone: normalizedRiderPhone,
    dispatchNote: normalizeProfileText(current.dispatchNote, 180),
    confirmedAt: current.confirmedAt || "",
    preparingAt: current.preparingAt || "",
    readyAt: current.readyAt || "",
    outForDeliveryAt: current.outForDeliveryAt || "",
    deliveredAt: current.deliveredAt || "",
    lastUpdatedAt: current.lastUpdatedAt || "",
  };
}

function applyOrderStatusTimestamp(operations, status) {
  const timestamp = new Date().toISOString();
  const nextOperations = {
    ...normalizeOrderOperations(operations),
    lastUpdatedAt: timestamp,
  };
  if (status === "confirmed") {
    nextOperations.confirmedAt = timestamp;
  } else if (status === "preparing") {
    nextOperations.preparingAt = timestamp;
  } else if (status === "ready") {
    nextOperations.readyAt = timestamp;
  } else if (status === "out_for_delivery") {
    nextOperations.outForDeliveryAt = timestamp;
  } else if (status === "delivered") {
    nextOperations.deliveredAt = timestamp;
  }
  return nextOperations;
}

function buildOrderStatusNotification(order, status) {
  const branchLabel = order?.customer?.branchName || "PEM";
  const reference = order?.reference || "your order";
  const messages = {
    received: `${branchLabel} received order ${reference}.`,
    confirmed: `${branchLabel} confirmed order ${reference}.`,
    preparing: `${branchLabel} is preparing order ${reference}.`,
    ready: order?.customer?.fulfillmentMethod === "pickup"
      ? `Order ${reference} is ready for pickup at ${branchLabel}.`
      : `Order ${reference} is packed and ready for dispatch from ${branchLabel}.`,
    out_for_delivery: `Order ${reference} is out for delivery.`,
    delivered: `Order ${reference} was delivered.`,
    cancelled: `Order ${reference} was cancelled.`,
  };
  return createNotification(messages[status] || `Order ${reference} was updated.`, "order", {
    orderReference: reference,
    status,
  });
}

function canEditOrderCustomerWindow(order) {
  const createdAt = order?.createdAt ? new Date(order.createdAt).getTime() : NaN;
  const status = String(order?.status || "").trim();
  if (!Number.isFinite(createdAt)) {
    return false;
  }
  if (!["awaiting_payment", "received", "confirmed"].includes(status)) {
    return false;
  }
  return Date.now() - createdAt <= ORDER_EDIT_WINDOW_MS;
}

function buildOrderEditNotification(order) {
  const reference = order?.reference || "your order";
  return createNotification(`Order ${reference} details were updated.`, "order", {
    orderReference: reference,
    status: order?.status || "",
    orderUpdate: "customer_edit",
  });
}

function buildOrderOperationsNotification(order, previousOperations = {}, nextOperations = {}) {
  const reference = order?.reference || "your order";
  const changes = [];
  const previousPrepEta = Number(previousOperations.prepEtaMinutes || 0);
  const nextPrepEta = Number(nextOperations.prepEtaMinutes || 0);
  const previousRiderName = String(previousOperations.riderName || "").trim();
  const nextRiderName = String(nextOperations.riderName || "").trim();
  const previousRiderPhone = String(previousOperations.riderPhone || "").trim();
  const nextRiderPhone = String(nextOperations.riderPhone || "").trim();
  const previousDispatchNote = String(previousOperations.dispatchNote || "").trim();
  const nextDispatchNote = String(nextOperations.dispatchNote || "").trim();

  if (nextPrepEta > 0 && nextPrepEta !== previousPrepEta) {
    changes.push(`Prep time for order ${reference} is now about ${nextPrepEta} mins.`);
  }
  if (nextRiderName && nextRiderName !== previousRiderName) {
    changes.push(`${nextRiderName} is handling order ${reference}.`);
  } else if (nextRiderPhone && nextRiderPhone !== previousRiderPhone) {
    changes.push(`Rider contact was updated for order ${reference}.`);
  }
  if (nextDispatchNote && nextDispatchNote !== previousDispatchNote) {
    changes.push(`PEM added a delivery note for order ${reference}.`);
  }

  if (changes.length === 0) {
    return null;
  }

  return createNotification(changes[0], "order", {
    orderReference: reference,
    status: order?.status || "",
    orderUpdate: "operations",
  });
}

function getRecordBranchId(record) {
  return String(record?.branchId || record?.customer?.branchId || "").trim().toLowerCase();
}

function filterSummaryByBranch(summary, branchId) {
  const normalizedBranchId = String(branchId || "").trim().toLowerCase();
  if (!normalizedBranchId) {
    return summary;
  }

  const matchesBranch = (entry) => getRecordBranchId(entry) === normalizedBranchId;
  return {
    orders: (summary.orders || []).filter(matchesBranch),
    contacts: (summary.contacts || []).filter(matchesBranch),
    catering: (summary.catering || []).filter(matchesBranch),
    reservations: (summary.reservations || []).filter(matchesBranch),
    reviews: (summary.reviews || []).filter(matchesBranch),
    passwordRecoveryRequests: [],
  };
}

function canAccessBranchRecord(session, record) {
  return !session?.branchId || getRecordBranchId(record) === session.branchId;
}

function createReferralCode(fullName) {
  const prefix = String(fullName || "pem")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 6) || "pem";
  return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

function normalizeDietaryText(value) {
  return String(value || "").trim().toLowerCase();
}

function extractJsonBlock(value) {
  const text = String(value || "").trim();

  if (!text) {
    throw new Error("Empty AI response.");
  }

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

function sanitizeMenuItems(menuItems) {
  if (!Array.isArray(menuItems)) {
    return [];
  }

  return menuItems
    .slice(0, 24)
    .map((item) => ({
      id: Number(item.id),
      name: String(item.name || "").trim(),
      category: String(item.category || "").trim(),
      price: Number(item.price) || 0,
      rating: Number(item.rating) || 0,
      spicy: Boolean(item.spicy),
      badge: String(item.badge || "").trim(),
      description: String(item.description || "").trim(),
      dietaryProfile: String(item.dietaryProfile || "").trim(),
      dietaryTags: Array.isArray(item.dietaryTags)
        ? item.dietaryTags.map((tag) => String(tag || "").trim()).filter(Boolean).slice(0, 8)
        : [],
    }))
    .filter((item) => item.id && item.name);
}

function sanitizeDietaryResponse(payload, menuItems, mode) {
  const availableIds = new Set(menuItems.map((item) => item.id));
  const matches = Array.isArray(payload?.matches)
    ? payload.matches
        .map((match) => ({
          itemId: Number(match?.itemId),
          reason: String(match?.reason || "").trim(),
        }))
        .filter((match) => availableIds.has(match.itemId))
    : [];

  const uniqueMatches = matches.filter(
    (match, index) => matches.findIndex((candidate) => candidate.itemId === match.itemId) === index,
  );

  return {
    mode,
    summary: String(payload?.summary || "").trim(),
    caution: String(payload?.caution || "").trim(),
    matches: uniqueMatches.slice(0, 4),
  };
}

function buildFallbackDietaryResponse(needs, menuItems) {
  const normalizedNeeds = normalizeDietaryText(needs);
  const needsVegetarian = /\b(vegetarian|vegan|plant[- ]based|no meat|meatless)\b/.test(normalizedNeeds);
  const needsLowSpice = /\b(low spice|less spicy|mild|not spicy|no pepper)\b/.test(normalizedNeeds);
  const needsSpicy = !needsLowSpice && /\b(spicy|hot|pepper soup|peppery|extra pepper)\b/.test(normalizedNeeds);
  const needsHighProtein = /\b(high protein|protein|filling|bodybuilding|gym)\b/.test(normalizedNeeds);
  const needsBudget = /\b(cheap|budget|affordable|low price)\b/.test(normalizedNeeds);
  const wantsLocal = /\b(local|traditional|native|swallow|soup)\b/.test(normalizedNeeds);
  const avoidsBeef = /\b(no beef|without beef|avoid beef)\b/.test(normalizedNeeds);
  const avoidsGoat = /\b(no goat|without goat|avoid goat)\b/.test(normalizedNeeds);
  const wantsChicken = /\b(chicken)\b/.test(normalizedNeeds);
  const wantsRice = /\b(rice|jollof|fried rice)\b/.test(normalizedNeeds);
  const wantsLowCarb = /\b(low carb|keto|less carbs)\b/.test(normalizedNeeds);

  const rankedItems = menuItems
    .map((item) => {
      const haystack = normalizeDietaryText(
        [item.name, item.category, item.badge, item.description, item.dietaryProfile, item.dietaryTags.join(" ")]
          .join(" "),
      );
      let score = item.rating || 0;
      const reasons = [];

      if (needsVegetarian && /\b(chicken|beef|goat|meat|assorted)\b/.test(haystack)) {
        score -= 8;
      }

      if (avoidsBeef && /\bbeef\b/.test(haystack)) {
        score -= 5;
      }

      if (avoidsGoat && /\bgoat\b/.test(haystack)) {
        score -= 5;
      }

      if (needsLowSpice && item.spicy && !needsSpicy) {
        score -= 9;
      }

      if (needsSpicy && item.spicy) {
        score += 2.4;
        reasons.push("good fit for guests who want more heat");
      }

      if (needsLowSpice && !item.spicy) {
        score += 2.1;
        reasons.push("better for a milder spice preference");
      }

      if (needsHighProtein && /\b(chicken|beef|goat|protein)\b/.test(haystack)) {
        score += 2.3;
        reasons.push("more filling for protein-focused orders");
      }

      if (needsBudget) {
        score += Math.max(0, (4300 - item.price) / 500);
        if (item.price <= 3900) {
          reasons.push("one of the better-value options on the menu");
        }
      }

      if (wantsLocal && /\b(local special|soup|traditional|classic|local)\b/.test(haystack)) {
        score += 2.2;
        reasons.push("closer to the traditional local dishes PEM offers");
      }

      if (wantsChicken && /\bchicken\b/.test(haystack)) {
        score += 2;
        reasons.push("matches a chicken preference");
      }

      if (wantsRice && /\brice|jollof|fried rice\b/.test(haystack)) {
        score += 1.8;
        reasons.push("fits a rice-based meal choice");
      }

      if (wantsLowCarb) {
        if (/\bpepper soup\b/.test(haystack)) {
          score += 3;
          reasons.push("the closest lower-carb option in the current menu");
        } else if (/\brice|yam|eba|spaghetti|ukwa\b/.test(haystack)) {
          score -= 2.2;
        }
      }

      return {
        itemId: item.id,
        score,
        reason: reasons[0] || "matches your request more closely than the other available dishes",
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .filter((item) => item.score > 1);

  if (needsVegetarian) {
    return sanitizeDietaryResponse(
      {
        summary:
          "PEM does not currently show a clearly vegetarian or vegan meal in this menu, so a strict match is not available right now.",
        caution:
          "For vegetarian, vegan, allergy, or medical food needs, please contact PEM directly before ordering so the kitchen can confirm ingredients or offer a custom option.",
        matches: [],
      },
      menuItems,
      "smart-filter",
    );
  }

  const summary = rankedItems.length
    ? "These dishes are the closest matches to the dietary preference you entered."
    : "PEM could not find a strong exact match from the current menu, but you can still browse or contact the team for a custom recommendation.";

  const caution = /\b(allergy|allergic|gluten|dairy|nut|medical|halal)\b/.test(normalizedNeeds)
    ? "Please confirm any allergy, medical, or religious dietary requirement directly with PEM before placing the order."
    : "Dietary guidance is based on the current menu descriptions and should be confirmed with PEM for strict needs.";

  return sanitizeDietaryResponse(
    {
      summary,
      caution,
      matches: rankedItems,
    },
    menuItems,
    "smart-filter",
  );
}

async function buildAiDietaryResponse(needs, menuItems) {
  const response = await openai.responses.create({
    model: openAiModel,
    reasoning: { effort: "low" },
    instructions:
      "You are a careful restaurant dietary recommendation assistant for Precious Events Makers (PEM). Recommend only meals that exist in the provided PEM menu. Never invent dishes. Be conservative with allergies, medical diets, halal, gluten-free, and vegan claims. If there is no strong fit, say so clearly. Return valid JSON only with keys summary, caution, and matches. matches must be an array of up to 4 objects with itemId and reason.",
    input: JSON.stringify({
      request: needs,
      menu: menuItems,
    }),
  });

  const parsed = JSON.parse(extractJsonBlock(response.output_text));
  return sanitizeDietaryResponse(parsed, menuItems, "ai");
}

async function persistAdminPassword(nextPassword) {
  let envContent = "";

  try {
    envContent = await fs.readFile(ENV_PATH, "utf8");
  } catch {
    envContent = "";
  }

  const lines = envContent
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "" && !line.trim().startsWith("ADMIN_PASSWORD="));

  lines.push(`ADMIN_PASSWORD=${nextPassword}`);
  await fs.writeFile(ENV_PATH, `${lines.join("\n")}\n`, "utf8");
  adminPassword = nextPassword;
}

async function initializePaystackTransaction({ email, amount, reference, metadata }) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      reference,
      callback_url: `${frontendUrl}/?payment=paystack`,
      metadata,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === false) {
    throw new Error(data.message || "Unable to initialize card payment.");
  }

  return data.data;
}

async function verifyPaystackTransaction(reference) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === false) {
    throw new Error(data.message || "Unable to verify card payment.");
  }

  return data.data;
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    storageMode: storage.mode,
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    paystackConfigured: Boolean(paystackSecretKey),
    cookieAuth: true,
    runtimeIncidentCount: runtimeIncidents.length,
    allowedOrigins,
  });
});

app.post("/api/runtime-incidents", asyncHandler(async (request, response) => {
  const payload = request.body || {};
  pushRuntimeIncident({
    source: normalizeProfileText(payload.source, 40) || "client",
    message: normalizeProfileText(payload.message, 220) || "Unknown client error",
    path: normalizeProfileText(payload.path, 200) || "",
    build: normalizeProfileText(payload.build, 80) || "",
    userAgent: normalizeProfileText(payload.userAgent, 180) || "",
  });
  response.status(202).json({ ok: true });
}));

app.get("/api/menu", asyncHandler(async (_request, response) => {
  const menuItems = await storage.getMenuItems();
  response.json({ menuItems });
}));

app.get("/api/settings", asyncHandler(async (request, response) => {
  const settings = await storage.getSettings();
  const adminSession = getOptionalAdminSession(request);
  const settingsPayload = {
    ...settings,
    cardPaymentEnabled: Boolean(paystackSecretKey),
  };
  response.json({
    settings: adminSession
      ? settingsPayload
      : {
          ...settingsPayload,
          promoCodesText: "",
          staffAdminsText: "",
        },
  });
}));

app.post("/api/promo/validate", asyncHandler(async (request, response) => {
  const settings = await storage.getSettings();
  const subtotal = Number(request.body?.subtotal) || 0;
  const promoCode = String(request.body?.promoCode || "").trim();

  if (!promoCode) {
    return response.json({
      promo: { valid: false, amount: 0, code: "", minimumOrder: 0 },
    });
  }

  const promoCodes = parsePromoCodes(settings.promoCodesText);
  const promo = getPromoDiscount(promoCode, subtotal, promoCodes);
  response.json({ promo });
}));

app.post("/api/auth/refresh", asyncHandler(async (request, response) => {
  const refreshToken = getRefreshTokenFromRequest(request, USER_REFRESH_COOKIE);
  if (!refreshToken) {
    clearUserAuthCookies(response, request);
    return response.status(401).json({ error: "Your sign-in session has expired. Please sign in again." });
  }

  const refreshSession = consumeRefreshToken(userRefreshSessions, refreshToken, "user");
  if (!refreshSession?.email) {
    clearUserAuthCookies(response, request);
    return response.status(401).json({ error: "Your sign-in session has expired. Please sign in again." });
  }

  const user = await storage.getUserByEmail(refreshSession.email);
  if (!user) {
    clearUserAuthCookies(response, request);
    return response.status(401).json({ error: "Your sign-in session has expired. Please sign in again." });
  }

  issueUserAuth(response, request, {
    email: user.email,
    createdAt: new Date().toISOString(),
  });
  response.json({ user: sanitizeUser(user) });
}));

app.post("/api/auth/signup", asyncHandler(async (request, response) => {
  const { fullName, email, password, phone, address, birthday, referralCode } = request.body || {};
  const normalizedEmail = normalizeEmail(email);
  const normalizedFullName = validateFullNameInput(fullName);
  const normalizedAddress = validateAddressInput(address);
  const normalizedBirthday = normalizeBirthday(birthday);
  const normalizedPhone = validatePhoneInput(phone);
  const now = getLagosDateParts();
  const attemptLimitError = getAttemptLimitError("userSignup", request, normalizedEmail || "anon");
  if (attemptLimitError) {
    return response.status(429).json({ error: attemptLimitError });
  }

  if (!normalizedFullName || !normalizedEmail || !password || !isValidEmailAddress(normalizedEmail)) {
    registerFailedAttempt("userSignup", request, normalizedEmail || "anon");
    return response.status(400).json({ error: "PEM could not create the account with those details." });
  }

  if (!normalizedBirthday) {
    registerFailedAttempt("userSignup", request, normalizedEmail);
    return response.status(400).json({ error: "PEM could not create the account with those details." });
  }

  if (!validatePasswordInput(password, 8)) {
    registerFailedAttempt("userSignup", request, normalizedEmail);
    return response.status(400).json({ error: "PEM could not create the account with those details." });
  }

  if (String(phone || "").trim() && !normalizedPhone) {
    registerFailedAttempt("userSignup", request, normalizedEmail);
    return response.status(400).json({ error: "PEM could not create the account with those details." });
  }

  if (String(address || "").trim() && !normalizedAddress) {
    registerFailedAttempt("userSignup", request, normalizedEmail);
    return response.status(400).json({ error: "PEM could not create the account with those details." });
  }

  const existingUser = await storage.getUserByEmail(normalizedEmail);
  if (existingUser) {
    registerFailedAttempt("userSignup", request, normalizedEmail);
    return response.status(400).json({ error: "PEM could not create the account with those details." });
  }
  const normalizedReferralCode = String(referralCode || "").trim().toLowerCase();
  const referrer = normalizedReferralCode ? await storage.getUserByReferralCode(normalizedReferralCode) : null;
  const welcomeNotifications = [createNotification("Welcome to PEM. Your account is ready to use.", "welcome")];
  const birthdayIsToday = isBirthdayToday(normalizedBirthday, now);
  if (birthdayIsToday) {
    welcomeNotifications.unshift(createBirthdayNotification(normalizedFullName));
  }

  const user = await storage.createUser({
    email: normalizedEmail,
    passwordHash: createPasswordHash(password),
    fullName: normalizedFullName,
    phone: normalizedPhone,
    birthday: normalizedBirthday,
    favoriteItemIds: [],
    savedAddresses: normalizedAddress ? [normalizedAddress] : [],
    orderReferences: [],
    notifications: welcomeNotifications,
    loyaltyPoints: referrer ? 5 : 0,
    loyaltyTier: "bronze",
    referralCode: createReferralCode(fullName),
    referredBy: referrer ? normalizedReferralCode : "",
    referralCredits: 0,
    birthdayGreetingYear: birthdayIsToday ? now.year : "",
    birthdayDiscountLastUsedYear: "",
    createdAt: new Date().toISOString(),
  });
  const recoveryResult = await recoverGuestOrdersForUser(user);
  const activeUser = recoveryResult.user || user;

  if (referrer && referrer.email !== normalizedEmail) {
    const rewardPoints = 10;
    const nextReferralCredits = (Number(referrer.referralCredits) || 0) + 1;
    const nextLoyaltyPoints = (Number(referrer.loyaltyPoints) || 0) + rewardPoints;
    await storage.updateUser(referrer.email, {
      ...referrer,
      referralCredits: nextReferralCredits,
      loyaltyPoints: nextLoyaltyPoints,
      loyaltyTier: buildLoyaltyTier(nextLoyaltyPoints),
      notifications: [
        createNotification(
          `${normalizedFullName} joined PEM with your referral code. You earned ${rewardPoints} points.`,
          "referral",
          { referredUserEmail: normalizedEmail },
        ),
        ...(referrer.notifications || []),
      ].slice(0, 20),
      updatedAt: new Date().toISOString(),
    });
  }

  const token = createAdminToken();
  const session = { email: activeUser.email, createdAt: new Date().toISOString() };
  userSessions.set(token, session);
  issueUserAuth(response, request, session);
  clearAttemptBucket("userSignup", request, normalizedEmail);
  clearUserCredentialFailures(normalizedEmail);

  response.status(201).json({
    token,
    user: sanitizeUser(activeUser),
    recoveredOrderCount: recoveryResult.recoveredOrders.length,
  });
}));

app.post("/api/auth/login", asyncHandler(async (request, response) => {
  const { email, password } = request.body || {};
  const normalizedEmail = normalizeEmail(email);
  const attemptLimitError = getAttemptLimitError("userLogin", request, normalizedEmail);
  if (attemptLimitError) {
    return response.status(429).json({ error: attemptLimitError });
  }

  const lockoutState = getUserLockoutState(normalizedEmail);
  if (lockoutState?.lockedUntil && lockoutState.lockedUntil > Date.now()) {
    return response.status(423).json({ error: "Too many unsuccessful sign-ins. Start password recovery to unlock this account." });
  }

  const user = await storage.getUserByEmail(normalizedEmail);
  const passwordCheck = verifyPassword(String(password || ""), user?.passwordHash);

  if (!normalizedEmail || !isValidEmailAddress(normalizedEmail) || !validatePasswordInput(password, 1) || !user || !passwordCheck.ok) {
    const blockedError = registerFailedAttempt("userLogin", request, normalizedEmail);
    const lockoutError = registerUserCredentialFailure(normalizedEmail);
    return response.status(blockedError ? 429 : lockoutError ? 423 : 401).json({
      error: blockedError || lockoutError || "Incorrect email or password.",
    });
  }

  if (passwordCheck.needsUpgrade) {
    user.passwordHash = createPasswordHash(password);
    user.updatedAt = new Date().toISOString();
    await storage.updateUser(user.email, user);
  }

  const greetedUser = withBirthdayGreeting(user);
  const birthdayAwareUser = greetedUser === user ? user : await storage.updateUser(user.email, greetedUser);
  const recoveryResult = await recoverGuestOrdersForUser(birthdayAwareUser);
  const activeUser = recoveryResult.user || birthdayAwareUser;

  const token = createAdminToken();
  const session = { email: activeUser.email, createdAt: new Date().toISOString() };
  userSessions.set(token, session);
  issueUserAuth(response, request, session);
  clearAttemptBucket("userLogin", request, normalizedEmail);
  clearUserCredentialFailures(normalizedEmail);

  response.json({
    token,
    user: sanitizeUser(activeUser),
    recoveredOrderCount: recoveryResult.recoveredOrders.length,
  });
}));

app.post("/api/auth/forgot-password", asyncHandler(async (request, response) => {
  const { email, phone } = request.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = normalizePhoneDigits(phone);
  if (!normalizedEmail || !normalizedPhone || !isValidEmailAddress(normalizedEmail)) {
    return response.status(400).json({ error: "Email and phone number are required." });
  }

  const attemptLimitError = getAttemptLimitError("passwordRecoveryRequest", request, normalizedEmail);
  if (attemptLimitError) {
    return response.status(429).json({ error: attemptLimitError });
  }

  const genericMessage =
    "If the details match a PEM account, a recovery request has been created for owner review.";
  const user = await storage.getUserByEmail(normalizedEmail);

  if (!user || String(user.phone || "").replace(/\D/g, "") !== normalizedPhone) {
    registerFailedAttempt("passwordRecoveryRequest", request, normalizedEmail);
    return response.json({ message: genericMessage });
  }

  const recoveryRequest = await storage.createPasswordRecoveryRequest({
    reference: makeReference("PEM-REC"),
    userEmail: user.email,
    fullName: user.fullName,
    phoneLast4: normalizedPhone.slice(-4),
    status: "pending_review",
    approvalCodeHash: "",
    approvalCodeExpiresAt: null,
    reviewedBy: "",
    reviewedAt: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  });
  clearAttemptBucket("passwordRecoveryRequest", request, normalizedEmail);

  response.json({
    message: "Recovery request received. PEM will review it and share the next step.",
    reference: recoveryRequest.reference,
  });
}));

app.post("/api/auth/reset-password", asyncHandler(async (request, response) => {
  const { email, requestReference, approvalCode, newPassword, confirmPassword } = request.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedReference = String(requestReference || "").trim().toUpperCase();
  const normalizedApprovalCode = String(approvalCode || "").trim();

  if (!normalizedEmail || !normalizedReference || !normalizedApprovalCode || !newPassword || !confirmPassword) {
    return response.status(400).json({ error: "Email, recovery reference, approval code, and new password are required." });
  }

  if (!validatePasswordInput(newPassword, 8)) {
    return response.status(400).json({ error: "New password must be at least 8 characters long." });
  }

  if (String(newPassword) !== String(confirmPassword)) {
    return response.status(400).json({ error: "The new password fields did not match." });
  }

  const attemptLimitError = getAttemptLimitError("passwordReset", request, normalizedEmail);
  if (attemptLimitError) {
    return response.status(429).json({ error: attemptLimitError });
  }

  const [user, recoveryRequest] = await Promise.all([
    storage.getUserByEmail(normalizedEmail),
    storage.getPasswordRecoveryRequestByReference(normalizedReference),
  ]);

  const invalidResetError = "The recovery details were invalid or have expired.";
  if (
    !user ||
    !recoveryRequest ||
    recoveryRequest.userEmail !== normalizedEmail ||
    recoveryRequest.status !== "approved" ||
    !recoveryRequest.approvalCodeHash ||
    !recoveryRequest.approvalCodeExpiresAt ||
    new Date(recoveryRequest.approvalCodeExpiresAt).getTime() <= Date.now() ||
    !verifyPassword(normalizedApprovalCode, recoveryRequest.approvalCodeHash).ok
  ) {
    const blockedError = registerFailedAttempt("passwordReset", request, normalizedEmail);
    return response.status(blockedError ? 429 : 401).json({ error: blockedError || invalidResetError });
  }

  await storage.updateUser(user.email, {
    ...user,
    passwordHash: createPasswordHash(newPassword),
    notifications: [
      createNotification("Your PEM account password was updated.", "security"),
      ...(user.notifications || []),
    ].slice(0, 15),
    updatedAt: new Date().toISOString(),
  });

  await storage.updatePasswordRecoveryRequest(recoveryRequest.reference, {
    ...recoveryRequest,
    status: "completed",
    approvalCodeHash: "",
    approvalCodeExpiresAt: null,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  clearAttemptBucket("passwordReset", request, normalizedEmail);
  clearUserCredentialFailures(normalizedEmail);

  response.json({
    message: "Password updated successfully. You can now log in.",
  });
}));

app.post("/api/auth/logout", requireUser, (request, response) => {
  const token = getBearerToken(request);
  const accessToken = getAccessTokenFromRequest(request, USER_ACCESS_COOKIE);
  const refreshToken = getRefreshTokenFromRequest(request, USER_REFRESH_COOKIE);
  if (token) {
    userSessions.delete(token);
  }
  if (accessToken) {
    blacklistAccessToken(accessToken);
  }
  if (refreshToken) {
    userRefreshSessions.delete(refreshToken);
  }
  clearUserAuthCookies(response, request);
  response.json({ ok: true });
});

app.get("/api/account", requireUser, asyncHandler(async (request, response) => {
  const user = await storage.getUserByEmail(request.userSession.email);
  const greetedUser = user ? withBirthdayGreeting(user) : null;
  const birthdayAwareUser = greetedUser && greetedUser !== user ? await storage.updateUser(user.email, greetedUser) : user;
  const recoveryResult = await recoverGuestOrdersForUser(birthdayAwareUser);
  const activeUser = recoveryResult.user || birthdayAwareUser;
  const [orders, receivedGifts, sentGifts] = await Promise.all([
    storage.getOrdersByReferences(activeUser?.orderReferences || []),
    storage.getReceivedGiftsByEmail(request.userSession.email),
    storage.getSentGiftsByEmail(request.userSession.email),
  ]);
  response.json({
    user: sanitizeUser(activeUser),
    orders,
    receivedGifts,
    sentGifts,
    recoveredOrderCount: recoveryResult.recoveredOrders.length,
  });
}));

app.put("/api/account/profile", requireUser, asyncHandler(async (request, response) => {
  const user = await storage.getUserByEmail(request.userSession.email);
  if (!user) {
    return response.status(404).json({ error: "User account not found." });
  }

  const nextUser = {
    ...user,
    fullName: String(request.body?.fullName || user.fullName).trim(),
    phone: String(request.body?.phone || user.phone || "").trim(),
    birthday: request.body?.birthday === undefined ? (user.birthday || "") : normalizeBirthday(request.body?.birthday),
  };
  if (request.body?.birthday !== undefined && !nextUser.birthday) {
    return response.status(400).json({ error: "Enter a valid birthday before saving your profile." });
  }
  const preparedUser = withBirthdayGreeting(nextUser);
  const savedUser = await storage.updateUser(user.email, preparedUser);
  response.json({ user: sanitizeUser(savedUser) });
}));

app.put("/api/account/addresses", requireUser, asyncHandler(async (request, response) => {
  const user = await storage.getUserByEmail(request.userSession.email);
  if (!user) {
    return response.status(404).json({ error: "User account not found." });
  }

  const savedAddresses = Array.isArray(request.body?.savedAddresses)
    ? request.body.savedAddresses.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 5)
    : [];
  const savedUser = await storage.updateUser(user.email, {
    ...user,
    savedAddresses,
  });
  response.json({ user: sanitizeUser(savedUser) });
}));

app.put("/api/account/favorites", requireUser, asyncHandler(async (request, response) => {
  const user = await storage.getUserByEmail(request.userSession.email);
  if (!user) {
    return response.status(404).json({ error: "User account not found." });
  }

  const favoriteItemIds = Array.isArray(request.body?.favoriteItemIds)
    ? request.body.favoriteItemIds.map((item) => Number(item)).filter(Boolean)
    : [];
  const savedUser = await storage.updateUser(user.email, {
    ...user,
    favoriteItemIds,
  });
  response.json({ user: sanitizeUser(savedUser) });
}));

app.patch("/api/account/notifications/:id/read", requireUser, asyncHandler(async (request, response) => {
  const user = await storage.getUserByEmail(request.userSession.email);
  if (!user) {
    return response.status(404).json({ error: "User account not found." });
  }

  const notifications = (user.notifications || []).map((item) =>
    item.id === request.params.id ? { ...item, read: true } : item,
  );
  const savedUser = await storage.updateUser(user.email, {
    ...user,
    notifications,
  });
  response.json({ user: sanitizeUser(savedUser) });
}));

app.patch("/api/account/notifications/read-all", requireUser, asyncHandler(async (request, response) => {
  const user = await storage.getUserByEmail(request.userSession.email);
  if (!user) {
    return response.status(404).json({ error: "User account not found." });
  }
  const notifications = (user.notifications || []).map((item) => ({
    ...item,
    read: true,
  }));
  const savedUser = await storage.updateUser(user.email, {
    ...user,
    notifications,
  });
  response.json({ user: sanitizeUser(savedUser) });
}));

app.post("/api/gifts", requireUser, asyncHandler(async (request, response) => {
  const { customer, items, pricing, recipientEmail, giftMessage } = request.body || {};
  const sender = await storage.getUserByEmail(request.userSession.email);
  const settings = await storage.getSettings();
  const promoCodes = parsePromoCodes(settings.promoCodesText);
  const selectedBranch = resolveBranchSelection(customer?.branchId, settings);
  const sanitizedPhone = sanitizePhoneInput(customer?.phone || sender?.phone);
  const normalizedRecipientEmail = String(recipientEmail || "").trim().toLowerCase();
  const normalizedSenderName = String(customer?.customerName || sender?.fullName || "").trim();
  const normalizedGiftMessage = String(giftMessage || "").trim();
  const normalizedPaymentReference = String(customer?.paymentReference || "").trim();

  if (!sender) {
    return response.status(401).json({ error: "Sign in to send a meal gift through PEM." });
  }

  if (!normalizedSenderName || !sanitizedPhone) {
    return response.status(400).json({ error: "Your name and phone number are required before sending a gift." });
  }

  if (normalizePhoneDigits(sanitizedPhone).length < 10) {
    return response.status(400).json({ error: "Please enter a valid phone number before sending a gift." });
  }

  if (!normalizedRecipientEmail) {
    return response.status(400).json({ error: "Enter your friend's PEM email address." });
  }

  if (normalizedRecipientEmail === sender.email) {
    return response.status(400).json({ error: "Use the normal checkout if you are ordering for yourself." });
  }

  const recipient = await storage.getUserByEmail(normalizedRecipientEmail);
  if (!recipient) {
    return response.status(404).json({ error: "That email is not linked to a PEM account yet." });
  }

  if ((customer?.fulfillmentMethod || "delivery") !== "delivery") {
    return response.status(400).json({ error: "Gift orders are delivered after your friend accepts them." });
  }

  if (customer?.scheduledFor && Number.isNaN(new Date(customer.scheduledFor).getTime())) {
    return response.status(400).json({ error: "Scheduled gift time is invalid." });
  }

  if (customer?.scheduledFor && !isScheduledWithinBusinessHours(customer.scheduledFor, selectedBranch.hours)) {
    return response.status(400).json({ error: "Scheduled gifts must fall within branch business hours." });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ error: "Add at least one meal before sending a gift." });
  }

  if ((Number(pricing?.total) || 0) < (Number(settings.minimumOrder) || 0)) {
    return response.status(400).json({
      error: `The current minimum order is NGN ${Number(settings.minimumOrder || 0).toLocaleString("en-NG")}.`,
    });
  }

  if (String(customer?.paymentMethod || "").trim() !== "Bank transfer") {
    return response.status(400).json({ error: "Choose bank transfer to send a meal gift." });
  }

  if (normalizedPaymentReference.length < 3) {
    return response.status(400).json({ error: "Add your transfer reference before sending this gift." });
  }

  const subtotal = Number(pricing?.subtotal) || 0;
  const delivery = Number(pricing?.delivery) || 0;
  const promo = getPromoDiscount(customer?.promoCode, subtotal, promoCodes);

  if (String(customer?.promoCode || "").trim() && !promo.valid) {
    return response.status(400).json({
      error: promo.minimumOrder
        ? `This promo code needs a minimum subtotal of NGN ${promo.minimumOrder.toLocaleString("en-NG")}.`
        : "That promo code is not valid right now.",
    });
  }

  const discount = promo.valid ? promo.amount : 0;
  const total = Math.max(0, subtotal + delivery - discount);

  const menuItems = await storage.getMenuItems();
  const soldOutItems = items.filter((item) =>
    menuItems.some((menuItem) => menuItem.id === Number(item.id) && menuItem.soldOut),
  );

  if (soldOutItems.length > 0) {
    return response.status(400).json({
      error: `${soldOutItems[0].name} is currently sold out. Please remove it and try again.`,
    });
  }

  const unavailableStockItem = items.find((item) => {
    const menuItem = menuItems.find((entry) => entry.id === Number(item.id));
    return menuItem && Number(menuItem.stockQuantity || 0) > 0 && Number(item.quantity || 0) > Number(menuItem.stockQuantity || 0);
  });

  if (unavailableStockItem) {
    return response.status(400).json({
      error: `${unavailableStockItem.name} only has limited stock left right now.`,
    });
  }

  const gift = await storage.createGift({
    reference: makeReference("PEM-GFT"),
    senderEmail: sender.email,
    senderName: normalizedSenderName,
    senderPhone: sanitizedPhone,
    recipientEmail: recipient.email,
    recipientName: recipient.fullName || recipient.email.split("@")[0],
    branchId: selectedBranch.id,
    branchName: selectedBranch.label,
    branchAddress: selectedBranch.address,
    branchPhone: selectedBranch.phone,
    deliveryZone: String(customer?.deliveryZone || ""),
    deliveryEta: String(customer?.deliveryEta || ""),
    giftMessage: normalizedGiftMessage,
    items,
    pricing: {
      subtotal,
      delivery,
      discount,
      total,
    },
    payment: {
      method: "Bank transfer",
      status: "reference_submitted",
      reference: normalizedPaymentReference,
      paidAt: null,
    },
    status: "pending_acceptance",
    orderReference: "",
    createdAt: new Date().toISOString(),
  });

  await storage.updateUser(sender.email, {
    ...sender,
    phone: sender.phone || sanitizedPhone,
    notifications: [
      createNotification(
        `Gift ${gift.reference} was sent to ${gift.recipientName}. PEM will wait for them to accept it.`,
        "gift",
        {
          giftReference: gift.reference,
          giftStatus: gift.status,
          giftRole: "sender",
          counterpartyEmail: gift.recipientEmail,
          counterpartyName: gift.recipientName,
        },
      ),
      ...(sender.notifications || []),
    ].slice(0, 20),
    updatedAt: new Date().toISOString(),
  });

  await storage.updateUser(recipient.email, {
    ...recipient,
    notifications: [
      createNotification(
        `${gift.senderName} sent you a meal gift from ${gift.branchName}. Accept it in your PEM account or decline it if you do not want it.`,
        "gift",
        {
          giftReference: gift.reference,
          giftStatus: gift.status,
          giftRole: "recipient",
          counterpartyEmail: gift.senderEmail,
          counterpartyName: gift.senderName,
        },
      ),
      ...(recipient.notifications || []),
    ].slice(0, 20),
    updatedAt: new Date().toISOString(),
  });

  response.status(201).json({
    message: "Gift request sent. Your friend can now accept it and choose their current address.",
    gift,
  });
}));

app.post("/api/gifts/:reference/accept", requireUser, asyncHandler(async (request, response) => {
  const reference = String(request.params.reference || "").trim();
  const recipient = await storage.getUserByEmail(request.userSession.email);
  const gift = await storage.getGiftByReference(reference);
  const menuItems = await storage.getMenuItems();
  const recipientAddress = String(request.body?.address || "").trim();
  const recipientLandmark = String(request.body?.landmark || "").trim();
  const recipientPhone = sanitizePhoneInput(request.body?.phone || recipient?.phone);

  if (!recipient) {
    return response.status(401).json({ error: "Recipient account not found." });
  }

  if (!gift) {
    return response.status(404).json({ error: "Gift request not found." });
  }

  if (gift.recipientEmail !== recipient.email) {
    return response.status(403).json({ error: "Only the intended recipient can accept this gift." });
  }

  if (gift.status !== "pending_acceptance") {
    return response.status(400).json({ error: "This gift is no longer waiting for acceptance." });
  }

  if (recipientAddress.length < 5) {
    return response.status(400).json({ error: "Add your current delivery address before accepting this gift." });
  }

  if (normalizePhoneDigits(recipientPhone).length < 10) {
    return response.status(400).json({ error: "Add a valid phone number before accepting this gift." });
  }

  const soldOutItems = (gift.items || []).filter((item) =>
    menuItems.some((menuItem) => menuItem.id === Number(item.id) && menuItem.soldOut),
  );

  if (soldOutItems.length > 0) {
    return response.status(400).json({
      error: `${soldOutItems[0].name} is no longer available. Please ask the sender to update the gift.`,
    });
  }

  const unavailableStockItem = (gift.items || []).find((item) => {
    const menuItem = menuItems.find((entry) => entry.id === Number(item.id));
    return menuItem && Number(menuItem.stockQuantity || 0) > 0 && Number(item.quantity || 0) > Number(menuItem.stockQuantity || 0);
  });

  if (unavailableStockItem) {
    return response.status(400).json({
      error: `${unavailableStockItem.name} no longer has enough stock for this gift.`,
    });
  }

  const order = await storage.createOrder({
    reference: makeReference("PEM-ORD"),
    customer: {
      customerName: recipient.fullName || gift.recipientName || recipient.email.split("@")[0],
      phone: recipientPhone,
      email: recipient.email,
      address: recipientAddress,
      landmark: recipientLandmark,
      paymentMethod: gift.payment?.method || "Bank transfer",
      paymentReference: gift.payment?.reference || "",
      branchId: gift.branchId,
      branchName: gift.branchName,
      branchAddress: gift.branchAddress,
      branchPhone: gift.branchPhone,
      deliveryZone: gift.deliveryZone,
      deliveryEta: gift.deliveryEta,
      isGift: true,
      giftReference: gift.reference,
      giftedBy: {
        email: gift.senderEmail,
        name: gift.senderName,
      },
      giftMessage: gift.giftMessage || "",
    },
    items: gift.items || [],
    pricing: gift.pricing || {},
    payment: {
      method: gift.payment?.method || "Bank transfer",
      status: "unpaid",
      reference: gift.payment?.reference || "",
      paidAt: gift.payment?.paidAt || null,
    },
    createdAt: new Date().toISOString(),
    status: "received",
  });

  const nextMenuItems = menuItems.map((menuItem) => {
    const orderedItem = (gift.items || []).find((item) => Number(item.id) === Number(menuItem.id));
    if (!orderedItem || Number(menuItem.stockQuantity || 0) <= 0) {
      return menuItem;
    }
    const remainingStock = Math.max(0, Number(menuItem.stockQuantity || 0) - Number(orderedItem.quantity || 0));
    return {
      ...menuItem,
      stockQuantity: remainingStock,
      soldOut: remainingStock === 0 ? true : menuItem.soldOut,
    };
  });
  await storage.updateMenuItems(nextMenuItems);

  const savedGift = await storage.updateGift(reference, {
    ...gift,
    status: "accepted",
    recipientAddress,
    recipientLandmark,
    recipientPhone,
    orderReference: order.reference,
    respondedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const recipientOrderReferences = [
    order.reference,
    ...(recipient.orderReferences || []).filter((entry) => entry !== order.reference),
  ].slice(0, 20);
  const recipientSavedAddresses = [
    recipientAddress,
    ...(recipient.savedAddresses || []).filter((entry) => entry !== recipientAddress),
  ].slice(0, 5);
  const recipientNotifications = [
    createNotification(
      `You accepted gift ${gift.reference}. PEM created order ${order.reference} for delivery to your current address.`,
      "gift",
      {
        giftReference: gift.reference,
        giftStatus: "accepted",
        giftRole: "recipient",
        orderReference: order.reference,
        counterpartyEmail: gift.senderEmail,
        counterpartyName: gift.senderName,
      },
    ),
    ...(recipient.notifications || []).map((item) =>
      item.giftReference === gift.reference ? { ...item, read: true, giftStatus: "accepted" } : item,
    ),
  ].slice(0, 20);
  const savedRecipient = await storage.updateUser(recipient.email, {
    ...recipient,
    phone: recipientPhone,
    savedAddresses: recipientSavedAddresses,
    orderReferences: recipientOrderReferences,
    notifications: recipientNotifications,
    updatedAt: new Date().toISOString(),
  });

  const sender = await storage.getUserByEmail(gift.senderEmail);
  if (sender) {
    await storage.updateUser(sender.email, {
      ...sender,
      notifications: [
        createNotification(
          `${recipient.fullName || recipient.email.split("@")[0]} accepted your gift ${gift.reference}. PEM created order ${order.reference}.`,
          "gift",
          {
            giftReference: gift.reference,
            giftStatus: "accepted",
            giftRole: "sender",
            orderReference: order.reference,
            counterpartyEmail: recipient.email,
            counterpartyName: recipient.fullName || recipient.email.split("@")[0],
          },
        ),
        ...(sender.notifications || []).map((item) =>
          item.giftReference === gift.reference ? { ...item, giftStatus: "accepted" } : item,
        ),
      ].slice(0, 20),
      updatedAt: new Date().toISOString(),
    });
  }

  response.json({
    message: `Gift accepted. PEM created order ${order.reference}.`,
    gift: savedGift,
    order,
    user: sanitizeUser(savedRecipient),
  });
}));

app.post("/api/gifts/:reference/decline", requireUser, asyncHandler(async (request, response) => {
  const reference = String(request.params.reference || "").trim();
  const recipient = await storage.getUserByEmail(request.userSession.email);
  const gift = await storage.getGiftByReference(reference);

  if (!recipient) {
    return response.status(401).json({ error: "Recipient account not found." });
  }

  if (!gift) {
    return response.status(404).json({ error: "Gift request not found." });
  }

  if (gift.recipientEmail !== recipient.email) {
    return response.status(403).json({ error: "Only the intended recipient can decline this gift." });
  }

  if (gift.status !== "pending_acceptance") {
    return response.status(400).json({ error: "This gift is no longer waiting for acceptance." });
  }

  const savedGift = await storage.updateGift(reference, {
    ...gift,
    status: "declined",
    respondedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const savedRecipient = await storage.updateUser(recipient.email, {
    ...recipient,
    notifications: [
      createNotification(
        `You declined gift ${gift.reference}. PEM will let the sender know.`,
        "gift",
        {
          giftReference: gift.reference,
          giftStatus: "declined",
          giftRole: "recipient",
          counterpartyEmail: gift.senderEmail,
          counterpartyName: gift.senderName,
        },
      ),
      ...(recipient.notifications || []).map((item) =>
        item.giftReference === gift.reference ? { ...item, read: true, giftStatus: "declined" } : item,
      ),
    ].slice(0, 20),
    updatedAt: new Date().toISOString(),
  });

  const sender = await storage.getUserByEmail(gift.senderEmail);
  if (sender) {
    await storage.updateUser(sender.email, {
      ...sender,
      notifications: [
        createNotification(
          `${recipient.fullName || recipient.email.split("@")[0]} declined gift ${gift.reference}.`,
          "gift",
          {
            giftReference: gift.reference,
            giftStatus: "declined",
            giftRole: "sender",
            counterpartyEmail: recipient.email,
            counterpartyName: recipient.fullName || recipient.email.split("@")[0],
          },
        ),
        ...(sender.notifications || []).map((item) =>
          item.giftReference === gift.reference ? { ...item, giftStatus: "declined" } : item,
        ),
      ].slice(0, 20),
      updatedAt: new Date().toISOString(),
    });
  }

  response.json({
    message: "Gift declined.",
    gift: savedGift,
    user: sanitizeUser(savedRecipient),
  });
}));

app.get("/api/delivery-zones", asyncHandler(async (_request, response) => {
  const deliveryZones = await storage.getDeliveryZones();
  response.json({ deliveryZones });
}));

app.post("/api/admin/refresh", asyncHandler(async (request, response) => {
  const refreshToken = getRefreshTokenFromRequest(request, ADMIN_REFRESH_COOKIE);
  if (!refreshToken) {
    clearAdminAuthCookies(response, request);
    return response.status(401).json({ error: "Your admin session has expired. Please sign in again." });
  }

  const refreshSession = consumeRefreshToken(adminRefreshSessions, refreshToken, "admin");
  if (!refreshSession?.username) {
    clearAdminAuthCookies(response, request);
    return response.status(401).json({ error: "Your admin session has expired. Please sign in again." });
  }

  const session = {
    createdAt: new Date().toISOString(),
    username: refreshSession.username,
    label: refreshSession.label || "Owner",
    branchId: refreshSession.branchId || "",
    isOwner: Boolean(refreshSession.isOwner),
  };
  issueAdminAuth(response, request, session);
  response.json({ admin: session });
}));

app.post("/api/admin/login", asyncHandler(async (request, response) => {
  const { username, password } = request.body || {};
  const normalizedUsername = String(username || "").trim().toLowerCase();

  if (!normalizedUsername || !password) {
    return response.status(400).json({ error: "Username and password are required." });
  }

  const attemptLimitError = getAttemptLimitError("adminLogin", request, normalizedUsername);
  if (attemptLimitError) {
    return response.status(429).json({ error: attemptLimitError });
  }

  const settings = await storage.getSettings();
  const staffAdmins = parseStaffAdmins(settings.staffAdminsText);
  const matchedStaffAdmin = staffAdmins.find(
    (item) => item.username === normalizedUsername && item.password === password,
  );
  const isOwnerLogin = normalizedUsername === OWNER_ADMIN_USERNAME && password === adminPassword;

  if (!matchedStaffAdmin && !isOwnerLogin) {
    const blockedError = registerFailedAttempt("adminLogin", request, normalizedUsername);
    return response.status(blockedError ? 429 : 401).json({ error: blockedError || "Incorrect admin credentials." });
  }

  const token = createAdminToken();
  const session = {
    createdAt: new Date().toISOString(),
    username: matchedStaffAdmin?.username || OWNER_ADMIN_USERNAME,
    label: matchedStaffAdmin?.label || "Owner",
    branchId: matchedStaffAdmin?.branchId || "",
    isOwner: !matchedStaffAdmin,
  };

  adminSessions.set(token, session);
  issueAdminAuth(response, request, session);
  clearAttemptBucket("adminLogin", request, normalizedUsername);

  return response.json({
    token,
    admin: session,
  });
}));

app.post("/api/admin/logout", requireAdmin, (request, response) => {
  const token = getBearerToken(request);
  const accessToken = getAccessTokenFromRequest(request, ADMIN_ACCESS_COOKIE);
  const refreshToken = getRefreshTokenFromRequest(request, ADMIN_REFRESH_COOKIE);
  if (token) {
    adminSessions.delete(token);
  }
  if (accessToken) {
    blacklistAccessToken(accessToken);
  }
  if (refreshToken) {
    adminRefreshSessions.delete(refreshToken);
  }
  clearAdminAuthCookies(response, request);
  response.json({ ok: true });
});

app.post("/api/admin/change-password", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const { currentPassword, newPassword, confirmPassword } = request.body || {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    return response.status(400).json({ error: "All password fields are required." });
  }

  if (currentPassword !== adminPassword) {
    return response.status(401).json({ error: "Current password is incorrect." });
  }

  if (newPassword.length < 8) {
    return response.status(400).json({ error: "New password must be at least 8 characters long." });
  }

  if (newPassword !== confirmPassword) {
    return response.status(400).json({ error: "New password and confirmation do not match." });
  }

  if (newPassword === currentPassword) {
    return response.status(400).json({ error: "Choose a different password from the current one." });
  }

  await persistAdminPassword(newPassword);
  adminSessions.clear();

  response.json({
    message: "Admin password updated successfully. Please sign in again.",
  });
}));

app.get("/api/admin/summary", requireAdmin, asyncHandler(async (request, response) => {
  const summary = await storage.getSummary();
  const filteredSummary = request.adminSession?.branchId
    ? filterSummaryByBranch(summary, request.adminSession.branchId)
    : summary;
  response.json({
    ...filteredSummary,
    passwordRecoveryRequests: (filteredSummary.passwordRecoveryRequests || []).map(sanitizePasswordRecoveryRequest),
    runtimeIncidents: runtimeIncidents.slice(0, 12),
    diagnostics: {
      cookieAuth: true,
      storageMode: storage.mode,
      aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      paystackConfigured: Boolean(paystackSecretKey),
      allowedOriginsCount: allowedOrigins.length,
    },
    admin: request.adminSession,
  });
}));

app.post("/api/admin/password-recovery/:reference/approve", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const reference = String(request.params.reference || "").trim().toUpperCase();
  const recoveryRequest = await storage.getPasswordRecoveryRequestByReference(reference);

  if (!recoveryRequest) {
    return response.status(404).json({ error: "Recovery request not found." });
  }

  if (!["pending_review", "approved"].includes(recoveryRequest.status)) {
    return response.status(400).json({ error: "This recovery request can no longer be approved." });
  }

  const approvalCode = createRecoveryCode();
  const updatedRequest = await storage.updatePasswordRecoveryRequest(reference, {
    ...recoveryRequest,
    status: "approved",
    approvalCodeHash: createPasswordHash(approvalCode),
    approvalCodeExpiresAt: new Date(Date.now() + PASSWORD_RECOVERY_CODE_TTL_MS).toISOString(),
    reviewedBy: request.adminSession.username,
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const user = await storage.getUserByEmail(recoveryRequest.userEmail);
  if (user) {
    await storage.updateUser(user.email, {
      ...user,
      notifications: [
        createNotification("Your password recovery request was approved. Use the code from PEM to finish resetting your password.", "security"),
        ...(user.notifications || []),
      ].slice(0, 15),
      updatedAt: new Date().toISOString(),
    });
  }

  response.json({
    message: "Recovery request approved. Share the code with the customer within 30 minutes.",
    approvalCode,
    request: sanitizePasswordRecoveryRequest(updatedRequest),
  });
}));

app.post("/api/admin/password-recovery/:reference/reject", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const reference = String(request.params.reference || "").trim().toUpperCase();
  const recoveryRequest = await storage.getPasswordRecoveryRequestByReference(reference);

  if (!recoveryRequest) {
    return response.status(404).json({ error: "Recovery request not found." });
  }

  if (!["pending_review", "approved"].includes(recoveryRequest.status)) {
    return response.status(400).json({ error: "This recovery request can no longer be declined." });
  }

  const updatedRequest = await storage.updatePasswordRecoveryRequest(reference, {
    ...recoveryRequest,
    status: "rejected",
    approvalCodeHash: "",
    approvalCodeExpiresAt: null,
    reviewedBy: request.adminSession.username,
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const user = await storage.getUserByEmail(recoveryRequest.userEmail);
  if (user) {
    await storage.updateUser(user.email, {
      ...user,
      notifications: [
        createNotification("Your password recovery request was declined. Please contact PEM support if you still need help.", "security"),
        ...(user.notifications || []),
      ].slice(0, 15),
      updatedAt: new Date().toISOString(),
    });
  }

  response.json({
    message: "Recovery request declined.",
    request: sanitizePasswordRecoveryRequest(updatedRequest),
  });
}));

app.put("/api/admin/settings", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const payload = request.body?.settings || {};
  const settings = {
    ...defaultSettings,
    businessName: String(payload.businessName || defaultSettings.businessName).trim(),
    appName: String(payload.appName || defaultSettings.appName).trim(),
    phone: String(payload.phone || defaultSettings.phone).trim(),
    whatsappPhone: String(payload.whatsappPhone || defaultSettings.whatsappPhone).replace(/\D/g, ""),
    supportEmail: String(payload.supportEmail || defaultSettings.supportEmail).trim(),
    address: String(payload.address || defaultSettings.address).trim(),
    heroHeadline: String(payload.heroHeadline || defaultSettings.heroHeadline).trim(),
    heroCopy: String(payload.heroCopy || defaultSettings.heroCopy).trim(),
    promoBanner: String(payload.promoBanner || "").trim(),
    contactPromise: String(payload.contactPromise || defaultSettings.contactPromise).trim(),
    businessHoursText: String(payload.businessHoursText || defaultSettings.businessHoursText).trim(),
    bankName: String(payload.bankName || "").trim(),
    bankAccountName: String(payload.bankAccountName || "").trim(),
    bankAccountNumber: String(payload.bankAccountNumber || "").trim(),
    bankInstructions: String(payload.bankInstructions || "").trim(),
    minimumOrder: Math.max(0, Number(payload.minimumOrder) || 0),
    promoCodesText: String(payload.promoCodesText || defaultSettings.promoCodesText).trim(),
    staffAdminsText: String(payload.staffAdminsText || defaultSettings.staffAdminsText).trim(),
    branchLocationsText: String(payload.branchLocationsText || defaultSettings.branchLocationsText).trim(),
    receiptFooter: String(payload.receiptFooter || defaultSettings.receiptFooter).trim(),
  };

  if (!settings.businessName || !settings.appName || !settings.phone) {
    return response.status(400).json({ error: "Business name, app name, and phone are required." });
  }

  const savedSettings = await storage.updateSettings(settings);
  response.json({
    message: "Business settings updated successfully.",
    settings: savedSettings,
  });
}));

app.put("/api/admin/delivery-zones", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const zones = Array.isArray(request.body?.deliveryZones) ? request.body.deliveryZones : [];

  if (zones.length === 0) {
    return response.status(400).json({ error: "At least one delivery zone is required." });
  }

  const normalized = zones.map((zone, index) => ({
    id: String(zone.id || `zone-${index + 1}`)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-"),
    label: String(zone.label || "").trim(),
    fee: Number(zone.fee) || 0,
    eta: String(zone.eta || "").trim(),
  }));

  if (normalized.some((zone) => !zone.label || !zone.eta || zone.fee < 0)) {
    return response.status(400).json({ error: "Each delivery zone needs a label, fee, and ETA." });
  }

  const uniqueIds = new Set(normalized.map((zone) => zone.id));
  if (uniqueIds.size !== normalized.length) {
    return response.status(400).json({ error: "Delivery zone IDs must be unique." });
  }

  const deliveryZones = await storage.updateDeliveryZones(normalized);
  response.json({
    message: "Delivery zones updated.",
    deliveryZones,
  });
}));

app.put("/api/admin/menu", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const menuItems = Array.isArray(request.body?.menuItems) ? request.body.menuItems : [];

  if (menuItems.length === 0) {
    return response.status(400).json({ error: "At least one menu item is required." });
  }

  const normalized = menuItems.map((item) => ({
    id: Number(item.id),
    name: String(item.name || "").trim(),
    category: String(item.category || "").trim(),
    price: Number(item.price) || 0,
    rating: Number(item.rating) || 0,
    reviews: Number(item.reviews) || 0,
    spicy: Boolean(item.spicy),
    badge: String(item.badge || "").trim(),
    description: String(item.description || "").trim(),
    imageUrl: String(item.imageUrl || "").trim(),
    availableFrom: String(item.availableFrom || "").trim(),
    availableUntil: String(item.availableUntil || "").trim(),
    availableDays: Array.isArray(item.availableDays)
      ? item.availableDays.map((day) => String(day || "").trim().slice(0, 3).toLowerCase()).filter(Boolean)
      : [],
    dietaryTags: Array.isArray(item.dietaryTags) ? item.dietaryTags : [],
    dietaryProfile: String(item.dietaryProfile || "").trim(),
    soldOut: Boolean(item.soldOut),
    hidden: Boolean(item.hidden),
    stockQuantity: Math.max(0, Number(item.stockQuantity) || 0),
  }));

  if (normalized.some((item) => !item.id || !item.name || !item.category || item.price < 0)) {
    return response.status(400).json({ error: "Each menu item needs an id, name, category, and valid price." });
  }

  const saved = await storage.updateMenuItems(normalized);
  response.json({
    message: "Menu updated successfully.",
    menuItems: saved,
  });
}));

app.post("/api/orders", asyncHandler(async (request, response) => {
  const { customer, items, pricing } = request.body || {};
  const settings = await storage.getSettings();
  const promoCodes = parsePromoCodes(settings.promoCodesText);
  const selectedBranch = resolveBranchSelection(customer?.branchId, settings);
  const sanitizedPhone = sanitizePhoneInput(customer?.phone);

  if (!customer?.customerName || !sanitizedPhone) {
    return response.status(400).json({ error: "Customer name and phone are required." });
  }

  if ((customer.fulfillmentMethod || "delivery") !== "pickup" && !customer?.address) {
    return response.status(400).json({ error: "Delivery address is required unless this is a pickup order." });
  }

  if (normalizePhoneDigits(sanitizedPhone).length < 10) {
    return response.status(400).json({ error: "Please enter a valid phone number." });
  }

  if (!isSupportedCheckoutPaymentMethod(customer.paymentMethod)) {
    return response.status(400).json({ error: "Choose bank transfer or card payment to continue in PEM." });
  }

  if (isCardPaymentMethod(customer.paymentMethod) && !paystackSecretKey) {
    return response.status(400).json({ error: "Card payment is not available right now. Choose bank transfer to continue in PEM." });
  }

  if (isCardPaymentMethod(customer.paymentMethod) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customer.email || "").trim())) {
    return response.status(400).json({ error: "A valid email address is required for card checkout." });
  }

  if (customer.paymentMethod === "Bank transfer" && String(customer.paymentReference || "").trim().length < 3) {
    return response.status(400).json({ error: "Add your bank transfer payment reference before placing this order." });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ error: "At least one order item is required." });
  }

  if (customer.scheduledFor && Number.isNaN(new Date(customer.scheduledFor).getTime())) {
    return response.status(400).json({ error: "Scheduled order time is invalid." });
  }

  if (customer.scheduledFor && !isScheduledWithinBusinessHours(customer.scheduledFor, selectedBranch.hours)) {
    return response.status(400).json({ error: "Scheduled orders must fall within branch business hours." });
  }

  if ((Number(pricing?.total) || 0) < (Number(settings.minimumOrder) || 0)) {
    return response.status(400).json({
      error: `The current minimum order is NGN ${Number(settings.minimumOrder || 0).toLocaleString("en-NG")}.`,
    });
  }

  const optionalSession = getOptionalUserSession(request);
  const candidateEmail = String(optionalSession?.email || "").trim().toLowerCase();
  const linkedUser = candidateEmail ? await storage.getUserByEmail(candidateEmail) : null;
  const now = getLagosDateParts();
  const subtotal = Number(pricing?.subtotal) || 0;
  const delivery = Number(pricing?.delivery) || 0;
  const promo = getPromoDiscount(customer?.promoCode, subtotal, promoCodes);

  if (String(customer?.promoCode || "").trim() && !promo.valid) {
    return response.status(400).json({
      error: promo.minimumOrder
        ? `This promo code needs a minimum subtotal of NGN ${promo.minimumOrder.toLocaleString("en-NG")}.`
        : "That promo code is not valid right now.",
      });
  }

  const promoDiscount = promo.valid ? promo.amount : 0;
  const birthdayDiscount = getBirthdayDiscountAmount(linkedUser, subtotal, now);
  const birthdayDiscountApplied = birthdayDiscount > promoDiscount;
  const discount = birthdayDiscountApplied ? birthdayDiscount : promoDiscount;
  const total = Math.max(0, subtotal + delivery - discount);

  const menuItems = await storage.getMenuItems();
  const soldOutItems = items.filter((item) =>
    menuItems.some((menuItem) => menuItem.id === Number(item.id) && menuItem.soldOut),
  );

  if (soldOutItems.length > 0) {
    return response.status(400).json({
      error: `${soldOutItems[0].name} is currently sold out. Please remove it and try again.`,
    });
  }

  const unavailableStockItem = items.find((item) => {
    const menuItem = menuItems.find((entry) => entry.id === Number(item.id));
    return menuItem && Number(menuItem.stockQuantity || 0) > 0 && Number(item.quantity || 0) > Number(menuItem.stockQuantity || 0);
  });

  if (unavailableStockItem) {
    return response.status(400).json({
      error: `${unavailableStockItem.name} only has limited stock left right now.`,
    });
  }

  const order = {
    reference: makeReference("PEM-ORD"),
    customer: {
      ...customer,
      phone: sanitizedPhone,
      branchId: selectedBranch.id,
      branchName: selectedBranch.label,
      branchAddress: selectedBranch.address,
      branchPhone: selectedBranch.phone,
      operations: normalizeOrderOperations(customer?.operations),
    },
    items,
    pricing: {
      subtotal,
      delivery,
      discount,
      discountLabel: birthdayDiscountApplied ? "birthday" : promo.valid ? "promo" : "",
      total,
    },
    payment: {
      method: customer?.paymentMethod || "Bank transfer",
      status: isCardPaymentMethod(customer?.paymentMethod) ? "pending" : "unpaid",
      reference: String(customer?.paymentReference || "").trim(),
      paidAt: null,
    },
    createdAt: new Date().toISOString(),
    status: isCardPaymentMethod(customer?.paymentMethod) ? "awaiting_payment" : "received",
  };
  const savedOrder = await storage.createOrder(order);
  const awaitingCardPayment = isCardPaymentMethod(customer?.paymentMethod);

  const nextMenuItems = menuItems.map((menuItem) => {
    const orderedItem = items.find((item) => Number(item.id) === Number(menuItem.id));
    if (!orderedItem || Number(menuItem.stockQuantity || 0) <= 0) {
      return menuItem;
    }
    const remainingStock = Math.max(0, Number(menuItem.stockQuantity || 0) - Number(orderedItem.quantity || 0));
    return {
      ...menuItem,
      stockQuantity: remainingStock,
      soldOut: remainingStock === 0 ? true : menuItem.soldOut,
    };
  });
  await storage.updateMenuItems(nextMenuItems);

  if (linkedUser) {
    const orderReferences = [
      savedOrder.reference,
      ...(linkedUser.orderReferences || []).filter((reference) => reference !== savedOrder.reference),
    ].slice(0, 20);
    const notifications = [
      ...(birthdayDiscountApplied
        ? [createNotification(`Happy Birthday. PEM applied ${BIRTHDAY_DISCOUNT_PERCENT}% off to order ${savedOrder.reference}.`, "birthday", { orderReference: savedOrder.reference })]
        : []),
      createNotification(
        awaitingCardPayment
          ? `Order ${savedOrder.reference} is waiting for your card payment before ${selectedBranch.label} confirms it.`
          : `Order ${savedOrder.reference} has been received by ${selectedBranch.label}.`,
        "order",
        {
          orderReference: savedOrder.reference,
          status: savedOrder.status,
          branchId: selectedBranch.id,
          branchName: selectedBranch.label,
        },
      ),
      ...(linkedUser.notifications || []),
    ].slice(0, 15);
    const nextSavedAddresses = customer?.address
      ? [
          customer.address,
          ...(linkedUser.savedAddresses || []).filter((item) => item !== customer.address),
        ].slice(0, 5)
      : linkedUser.savedAddresses || [];
    const addedPoints = awaitingCardPayment ? 0 : Math.max(1, Math.floor((Number(savedOrder.pricing?.total) || 0) / 2500));
    const loyaltyPoints = (Number(linkedUser.loyaltyPoints) || 0) + addedPoints;

    await storage.updateUser(linkedUser.email, {
      ...linkedUser,
      phone: linkedUser.phone || sanitizedPhone,
      orderReferences,
      notifications,
      savedAddresses: nextSavedAddresses,
      loyaltyPoints,
      loyaltyTier: buildLoyaltyTier(loyaltyPoints),
      birthdayDiscountLastUsedYear: birthdayDiscountApplied ? now.year : linkedUser.birthdayDiscountLastUsedYear || "",
      updatedAt: new Date().toISOString(),
    });
  }

  return response.status(201).json({
    message: awaitingCardPayment ? "Order saved. Payment is required before confirmation." : "Order received.",
    order: savedOrder,
  });
}));

app.post("/api/payments/paystack/initialize", asyncHandler(async (request, response) => {
  if (!paystackSecretKey) {
    return response.status(400).json({ error: "Card payment is not configured on the server." });
  }

  const { orderReference, email, amount, customerName } = request.body || {};
  if (!orderReference || !email || !amount) {
    return response.status(400).json({ error: "Order reference, email, and amount are required." });
  }

  const payment = await initializePaystackTransaction({
    email,
    amount: Math.round(Number(amount) * 100),
    reference: orderReference,
    metadata: {
      orderReference,
      customerName,
    },
  });

  await storage.updateOrderPayment(orderReference, {
    method: "Pay with card",
    status: "pending",
    reference: orderReference,
    paidAt: null,
  });

  response.json({ payment });
}));

app.get("/api/payments/paystack/verify/:reference", asyncHandler(async (request, response) => {
  if (!paystackSecretKey) {
    return response.status(400).json({ error: "Card payment is not configured on the server." });
  }

  const reference = String(request.params.reference || "").trim();
  const payment = await verifyPaystackTransaction(reference);
  let order = await storage.getOrderByReference(reference);

  if (payment.status === "success" && order && order.status === "awaiting_payment") {
    order = await storage.updateOrderPayment(
      reference,
      {
        ...(order.payment || {}),
        method: "Pay with card",
        status: "paid",
        reference: payment.reference || reference,
        paidAt: payment.paid_at || new Date().toISOString(),
      },
      "received",
    );

    const customerEmail = String(order?.customer?.email || "").trim().toLowerCase();
    const linkedUser = customerEmail ? await storage.getUserByEmail(customerEmail) : null;
    if (linkedUser) {
      const addedPoints = Math.max(1, Math.floor((Number(order?.pricing?.total) || 0) / 2500));
      const loyaltyPoints = (Number(linkedUser.loyaltyPoints) || 0) + addedPoints;
      await storage.updateUser(linkedUser.email, {
        ...linkedUser,
        notifications: [
          createNotification(`Payment was confirmed for order ${reference}. PEM has now confirmed the order.`, "payment"),
          ...(linkedUser.notifications || []),
        ].slice(0, 15),
        loyaltyPoints,
        loyaltyTier: buildLoyaltyTier(loyaltyPoints),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  response.json({
    payment,
    verified: payment.status === "success",
    order,
  });
}));

app.get("/api/orders/:reference", asyncHandler(async (request, response) => {
  const reference = String(request.params.reference || "").trim();

  if (!reference) {
    return response.status(400).json({ error: "Order reference is required." });
  }

  const order = await storage.getOrderByReference(reference);
  if (!order) {
    return response.status(404).json({ error: "Order not found." });
  }

  return response.json({
    order,
  });
}));

app.patch("/api/orders/:reference/customer-edit", asyncHandler(async (request, response) => {
  const reference = String(request.params.reference || "").trim();
  const existingOrder = await storage.getOrderByReference(reference);
  if (!existingOrder) {
    return response.status(404).json({ error: "Order not found." });
  }

  if (!canEditOrderCustomerWindow(existingOrder)) {
    return response.status(400).json({ error: "This order can no longer be edited in PEM." });
  }

  const optionalSession = getOptionalUserSession(request);
  const sessionEmail = normalizeEmail(optionalSession?.email || "");
  const orderEmail = normalizeEmail(existingOrder.customer?.email || "");
  const verificationPhone = sanitizePhoneInput(request.body?.verificationPhone || "");
  const verifiedBySession = Boolean(sessionEmail && orderEmail && sessionEmail === orderEmail);
  const verifiedByPhone =
    normalizePhoneDigits(verificationPhone).length >= 10 &&
    normalizePhoneDigits(verificationPhone) === normalizePhoneDigits(existingOrder.customer?.phone || "");

  if (!verifiedBySession && !verifiedByPhone) {
    return response.status(403).json({ error: "PEM could not verify this order edit request." });
  }

  const normalizedPhone = sanitizePhoneInput(request.body?.phone || existingOrder.customer?.phone || "");
  const normalizedAddress = normalizeProfileText(request.body?.address || existingOrder.customer?.address || "", 220);
  const normalizedLandmark = normalizeProfileText(request.body?.landmark || existingOrder.customer?.landmark || "", 120);
  const normalizedDeliveryNote = normalizeProfileText(request.body?.deliveryNote || existingOrder.customer?.deliveryNote || "", 180);
  const fulfillmentMethod = String(existingOrder.customer?.fulfillmentMethod || "delivery").trim().toLowerCase();

  if (normalizePhoneDigits(normalizedPhone).length < 10) {
    return response.status(400).json({ error: "Please enter a valid phone number." });
  }
  if (fulfillmentMethod !== "pickup" && normalizedAddress.length < 5) {
    return response.status(400).json({ error: "Delivery address is required for this update." });
  }

  const updatedCustomer = {
    ...(existingOrder.customer || {}),
    phone: normalizedPhone,
    address: fulfillmentMethod === "pickup" ? "" : normalizedAddress,
    landmark: fulfillmentMethod === "pickup" ? "" : normalizedLandmark,
    deliveryNote: normalizedDeliveryNote,
  };

  const order = await storage.updateOrder(reference, {
    ...existingOrder,
    customer: updatedCustomer,
  });

  const linkedUser = orderEmail ? await storage.getUserByEmail(orderEmail) : null;
  if (linkedUser) {
    const nextSavedAddresses =
      updatedCustomer.address && fulfillmentMethod !== "pickup"
        ? [
            updatedCustomer.address,
            ...(linkedUser.savedAddresses || []).filter((item) => item !== updatedCustomer.address),
          ].slice(0, 5)
        : linkedUser.savedAddresses || [];
    await storage.updateUser(linkedUser.email, {
      ...linkedUser,
      phone: normalizedPhone,
      savedAddresses: nextSavedAddresses,
      notifications: [
        buildOrderEditNotification(order),
        ...(linkedUser.notifications || []),
      ].slice(0, 20),
      updatedAt: new Date().toISOString(),
    });
  }

  return response.json({
    message: "Order details updated.",
    order,
  });
}));

app.patch("/api/admin/orders/:reference/status", requireAdmin, asyncHandler(async (request, response) => {
  const { reference } = request.params;
  const { status } = request.body || {};
  const allowedStatuses = ["received", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    return response.status(400).json({ error: "Invalid order status." });
  }

  const existingOrder = await storage.getOrderByReference(reference);
  if (!existingOrder) {
    return response.status(404).json({ error: "Order not found." });
  }
  if (!canAccessBranchRecord(request.adminSession, existingOrder)) {
    return response.status(403).json({ error: "You can only update orders assigned to your branch." });
  }
  const updatedCustomer = {
    ...(existingOrder.customer || {}),
    operations: applyOrderStatusTimestamp(existingOrder.customer?.operations, status),
  };
  const order = await storage.updateOrder(reference, {
    ...existingOrder,
    status,
    customer: updatedCustomer,
  });

  const customerEmail = String(order?.customer?.email || "").trim().toLowerCase();
  const linkedUser = customerEmail ? await storage.getUserByEmail(customerEmail) : null;
  if (linkedUser) {
    await storage.updateUser(linkedUser.email, {
      ...linkedUser,
      notifications: [
        buildOrderStatusNotification(order, status),
        ...(linkedUser.notifications || []),
      ].slice(0, 20),
      updatedAt: new Date().toISOString(),
    });
  }

  return response.json({
    message: "Order status updated.",
    order,
  });
}));

app.patch("/api/admin/orders/:reference/operations", requireAdmin, asyncHandler(async (request, response) => {
  const { reference } = request.params;
  const existingOrder = await storage.getOrderByReference(reference);
  if (!existingOrder) {
    return response.status(404).json({ error: "Order not found." });
  }
  if (!canAccessBranchRecord(request.adminSession, existingOrder)) {
    return response.status(403).json({ error: "You can only update orders assigned to your branch." });
  }

  const previousOperations = normalizeOrderOperations(existingOrder.customer?.operations || {});
  const nextOperations = normalizeOrderOperations({
    ...previousOperations,
    ...(request.body?.operations || {}),
    lastUpdatedAt: new Date().toISOString(),
  });
  const order = await storage.updateOrder(reference, {
    ...existingOrder,
    customer: {
      ...(existingOrder.customer || {}),
      operations: nextOperations,
    },
  });

  const customerEmail = normalizeEmail(order?.customer?.email || "");
  const linkedUser = customerEmail ? await storage.getUserByEmail(customerEmail) : null;
  const operationsNotification = linkedUser
    ? buildOrderOperationsNotification(order, previousOperations, nextOperations)
    : null;
  if (linkedUser && operationsNotification) {
    await storage.updateUser(linkedUser.email, {
      ...linkedUser,
      notifications: [
        operationsNotification,
        ...(linkedUser.notifications || []),
      ].slice(0, 20),
      updatedAt: new Date().toISOString(),
    });
  }

  return response.json({
    message: "Order operations updated.",
    order,
  });
}));

app.post("/api/contact", asyncHandler(async (request, response) => {
  const { name, phone, message, branchId, branchName } = request.body || {};
  const settings = await storage.getSettings();
  const selectedBranch = resolveBranchSelection(branchId, settings);

  if (!name || !phone || !message) {
    return response.status(400).json({ error: "Name, phone, and message are required." });
  }

  const entry = {
    reference: makeReference("PEM-MSG"),
    name,
    phone,
    message,
    branchId: selectedBranch.id,
    branchName: branchName || selectedBranch.label,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const savedEntry = await storage.createContact(entry);

  return response.status(201).json({
    message: savedEntry,
  });
}));

app.post("/api/catering", asyncHandler(async (request, response) => {
  const { name, phone, eventDate, guestCount, eventType, details, branchId, branchName } = request.body || {};
  const settings = await storage.getSettings();
  const selectedBranch = resolveBranchSelection(branchId, settings);

  if (!name || !phone || !eventDate || !guestCount || !details) {
    return response.status(400).json({
      error: "Name, phone, event date, guest count, and event details are required.",
    });
  }

  const entry = {
    reference: makeReference("PEM-CAT"),
    name,
    phone,
    eventDate,
    guestCount,
    eventType,
    details,
    branchId: selectedBranch.id,
    branchName: branchName || selectedBranch.label,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const savedEntry = await storage.createCatering(entry);

  return response.status(201).json({
    request: savedEntry,
  });
}));

app.post("/api/reservations", asyncHandler(async (request, response) => {
  const { name, phone, date, time, guests, notes, branchId, branchName } = request.body || {};
  const settings = await storage.getSettings();
  const selectedBranch = resolveBranchSelection(branchId, settings);

  if (!name || !phone || !date || !time || !guests) {
    return response.status(400).json({ error: "Name, phone, date, time, and guest count are required." });
  }

  const reservation = await storage.createReservation({
    reference: makeReference("PEM-RES"),
    name: String(name).trim(),
    phone: String(phone).trim(),
    date,
    time,
    guests: String(guests).trim(),
    notes: String(notes || "").trim(),
    branchId: selectedBranch.id,
    branchName: branchName || selectedBranch.label,
    status: "new",
    createdAt: new Date().toISOString(),
  });

  response.status(201).json({ reservation });
}));

app.post("/api/reviews", asyncHandler(async (request, response) => {
  const { orderReference, rating, comment, branchId, branchName } = request.body || {};
  const order = await storage.getOrderByReference(String(orderReference || "").trim());

  if (!order) {
    return response.status(404).json({ error: "Order not found." });
  }

  if (order.status !== "delivered") {
    return response.status(400).json({ error: "Reviews can only be submitted after delivery." });
  }

  const normalizedRating = Math.max(1, Math.min(5, Number(rating) || 0));
  if (!normalizedRating) {
    return response.status(400).json({ error: "A rating is required." });
  }

  const review = await storage.createReview({
    reference: makeReference("PEM-REV"),
    orderReference: order.reference,
    customerName: order.customer.customerName,
    branchId: order.customer.branchId || String(branchId || "").trim().toLowerCase(),
    branchName: order.customer.branchName || branchName || "PEM Branch",
    rating: normalizedRating,
    comment: String(comment || "").trim(),
    createdAt: new Date().toISOString(),
  });

  response.status(201).json({ review });
}));

app.get("/api/reviews", asyncHandler(async (request, response) => {
  const summary = await storage.getSummary();
  const branchId = String(request.query?.branchId || "").trim().toLowerCase();
  const reviews = (summary.reviews || [])
    .filter((review) => !branchId || String(review.branchId || "").trim().toLowerCase() === branchId)
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    .slice(0, 6);

  response.json({ reviews });
}));

app.post("/api/ai/dietary-match", asyncHandler(async (request, response) => {
  const needs = String(request.body?.needs || "").trim();
  const menuItems = sanitizeMenuItems(request.body?.menuItems);

  if (needs.length < 3) {
    return response.status(400).json({ error: "Tell PEM at least a little about the dietary need." });
  }

  if (needs.length > 400) {
    return response.status(400).json({ error: "Please keep the dietary request under 400 characters." });
  }

  if (menuItems.length === 0) {
    return response.status(400).json({ error: "Menu items are required for the dietary assistant." });
  }

  if (!openai) {
    return response.json(buildFallbackDietaryResponse(needs, menuItems));
  }

  try {
    const recommendation = await buildAiDietaryResponse(needs, menuItems);
    return response.json(recommendation);
  } catch (error) {
    console.error("Dietary AI request failed, using fallback matcher.", error);
    return response.json({
      ...buildFallbackDietaryResponse(needs, menuItems),
      degraded: true,
    });
  }
}));

app.patch("/api/admin/contacts/:reference/status", requireAdmin, asyncHandler(async (request, response) => {
  const { reference } = request.params;
  const { status } = request.body || {};
  const allowedStatuses = ["new", "handled"];

  if (!allowedStatuses.includes(status)) {
    return response.status(400).json({ error: "Invalid contact status." });
  }

  const summary = await storage.getSummary();
  const existingEntry = (summary.contacts || []).find((item) => item.reference === reference);
  if (!existingEntry) {
    return response.status(404).json({ error: "Contact message not found." });
  }
  if (!canAccessBranchRecord(request.adminSession, existingEntry)) {
    return response.status(403).json({ error: "You can only update messages assigned to your branch." });
  }
  const entry = await storage.updateContactStatus(reference, status);

  return response.json({
    message: "Contact status updated.",
    contact: entry,
  });
}));

app.patch("/api/admin/catering/:reference/status", requireAdmin, asyncHandler(async (request, response) => {
  const { reference } = request.params;
  const { status } = request.body || {};
  const allowedStatuses = ["new", "contacted", "booked"];

  if (!allowedStatuses.includes(status)) {
    return response.status(400).json({ error: "Invalid catering status." });
  }

  const summary = await storage.getSummary();
  const existingEntry = (summary.catering || []).find((item) => item.reference === reference);
  if (!existingEntry) {
    return response.status(404).json({ error: "Catering request not found." });
  }
  if (!canAccessBranchRecord(request.adminSession, existingEntry)) {
    return response.status(403).json({ error: "You can only update catering assigned to your branch." });
  }
  const entry = await storage.updateCateringStatus(reference, status);

  return response.json({
    message: "Catering status updated.",
    request: entry,
  });
}));

app.patch("/api/admin/reservations/:reference/status", requireAdmin, asyncHandler(async (request, response) => {
  const { reference } = request.params;
  const { status } = request.body || {};
  const allowedStatuses = ["new", "confirmed", "seated", "completed", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    return response.status(400).json({ error: "Invalid reservation status." });
  }

  const summary = await storage.getSummary();
  const existingEntry = (summary.reservations || []).find((item) => item.reference === reference);
  if (!existingEntry) {
    return response.status(404).json({ error: "Reservation not found." });
  }
  if (!canAccessBranchRecord(request.adminSession, existingEntry)) {
    return response.status(403).json({ error: "You can only update reservations assigned to your branch." });
  }
  const entry = await storage.updateReservationStatus(reference, status);

  return response.json({
    message: "Reservation status updated.",
    reservation: entry,
  });
}));

app.use((error, _request, response, _next) => {
  console.error("API error:", error);
  response.status(500).json({
    error: error?.message || "Something went wrong on the server.",
  });
});

storage.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`PEM API server running on http://localhost:${PORT} using ${storage.mode} storage`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
