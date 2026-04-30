import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import * as Sentry from "@sentry/node";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createStorage } from "./lib/storage.js";
import { createMailer } from "./lib/mailer.js";
import { logger, createHttpLogger } from "./lib/logger.js";
import {
  buildOtpAuthQrDataUrl,
  createTotpSecret,
  generateRecoveryCodes,
  verifyTotpCode,
} from "./lib/totp.js";
import {
  generateToken,
  hashToken,
  createPasswordHash,
  verifyPasswordHash,
  isHashedPassword,
  stripUnsafeText,
  isValidEmail,
  verifyPaystackSignature,
} from "./lib/security.js";

dotenv.config();

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "submissions.json");
const ENV_PATH = path.join(__dirname, ".env");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 4000;
let adminPassword = process.env.ADMIN_PASSWORD || "change-admin-password";
const openAiModel = process.env.OPENAI_MODEL || "gpt-5-mini";
const forceLocalStorage = process.env.STORAGE_MODE === "local";
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const frontendUrls = [process.env.FRONTEND_URL, ...(process.env.FRONTEND_URLS || "").split(",")]
  .map((value) => String(value || "").trim())
  .filter(Boolean);
const sessionTtlMs = Math.max(1, Number(process.env.SESSION_TTL_HOURS) || 168) * 60 * 60 * 1000;
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
const isProduction = process.env.NODE_ENV === "production";
const cookieSecureMode = String(process.env.COOKIE_SECURE || "auto").toLowerCase();
const cookieSecure = cookieSecureMode === "true" || (cookieSecureMode === "auto" && isProduction);
const USER_COOKIE = "pem_user_session";
const ADMIN_COOKIE = "pem_admin_session";

const orderEventSubscribers = new Map();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const mailer = createMailer();
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
  heroHeadline: "Restaurant ordering and catering, designed with a calmer PEM feel.",
  heroCopy:
    "Explore local favorites, choose your quantity, add special notes, and place orders through a cleaner, more elegant PEM experience.",
  promoBanner: "Fresh local dishes, premium catering, and smoother ordering all in one PEM experience.",
  contactPromise: "Professional meals, local flavors, and catering support for all event sizes.",
  businessHoursText: "Open daily in Lagos time. PEM confirms exact delivery windows after checkout.",
  bankName: "PEM Business Account",
  bankAccountName: "Precious Events Makers",
  bankAccountNumber: "0123456789",
  bankInstructions: "After making a bank transfer, add your payment reference so PEM can confirm it faster.",
  minimumOrder: 1500,
  promoCodesText: "WELCOME10|percent|10|5000\nPARTY500|flat|500|7000",
  staffAdminsText: "manager|PemStaff2026|Floor Manager",
  branchLocationsText:
    "owerri-central|PEM Owerri Central|Wetheral Road, Owerri|0803 334 5161|8:00 AM - 9:00 PM|Fast city-center delivery, pickup, and daily meals.\nnew-owerri|PEM New Owerri|New Owerri, Imo State|0803 334 5161|8:30 AM - 9:30 PM|Best for estate drop-offs and premium catering dispatch.\nikenegbu|PEM Ikenegbu|Ikenegbu Layout, Owerri|0803 334 5161|8:00 AM - 8:30 PM|Quick office lunch, table bookings, and evening pickup.",
  receiptFooter: "Thank you for choosing PEM. For urgent support, please contact the team directly.",
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
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", ...allowedOrigins, "https://api.paystack.co"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
  }),
);

app.use(pinoHttp(createHttpLogger()));

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

app.post(
  "/api/payments/paystack/webhook",
  express.raw({ type: "application/json", limit: "100kb" }),
  asyncHandler(handlePaystackWebhook),
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

function buildRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
    skip: (request) => isLocalDevOrigin(request.headers.origin || "") && process.env.NODE_ENV !== "production",
  });
}

const authRateLimiter = buildRateLimiter({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: "Too many auth attempts from this device. Please wait a few minutes and try again.",
});

const orderRateLimiter = buildRateLimiter({
  windowMs: Number(process.env.ORDER_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.ORDER_RATE_LIMIT_MAX) || 30,
  message: "Too many order attempts from this device. Please slow down and try again.",
});

const paymentRateLimiter = buildRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many payment attempts. Please wait a few minutes.",
});

const aiRateLimiter = buildRateLimiter({
  windowMs: 60 * 1000,
  max: 12,
  message: "Slow down and try the dietary assistant again in a moment.",
});

const cookieBaseOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: cookieSecure,
  ...(cookieDomain ? { domain: cookieDomain } : {}),
  path: "/",
};

function setSessionCookie(response, name, token, expiresAt) {
  response.cookie(name, token, {
    ...cookieBaseOptions,
    expires: new Date(expiresAt),
  });
}

function clearSessionCookie(response, name) {
  response.clearCookie(name, cookieBaseOptions);
}

function makeReference(prefix) {
  const random = generateToken(6);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

function createSessionToken() {
  return generateToken(32);
}

function getRequestToken(request, cookieName) {
  if (cookieName && request.cookies && request.cookies[cookieName]) {
    return String(request.cookies[cookieName]);
  }
  const authHeader = request.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return "";
}

async function loadSession(request, cookieName, scope) {
  const token = getRequestToken(request, cookieName);
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await storage.getSessionByTokenHash(tokenHash);
  if (!session || session.scope !== scope) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await storage.deleteSessionByTokenHash(tokenHash).catch(() => {});
    return null;
  }
  return { token, tokenHash, ...session };
}

async function persistSession({ scope, email = null, username = null, data = {} }) {
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + sessionTtlMs).toISOString();
  await storage.createSession({
    tokenHash,
    scope,
    email: email || "",
    username: username || "",
    data,
    createdAt,
    expiresAt,
  });
  return { token, tokenHash, createdAt, expiresAt };
}

function requireAdmin(request, response, next) {
  Promise.resolve(loadSession(request, ADMIN_COOKIE, "admin"))
    .then((session) => {
      if (!session) {
        return response.status(401).json({ error: "Admin login required." });
      }
      request.adminSession = { ...session.data, ...session };
      request.adminToken = session.token;
      next();
    })
    .catch(next);
}

function requireOwnerAdmin(request, response, next) {
  if (request.adminSession?.username !== "owner") {
    return response.status(403).json({ error: "Only the PEM owner account can change global business settings." });
  }
  next();
}

function requireUser(request, response, next) {
  Promise.resolve(loadSession(request, USER_COOKIE, "user"))
    .then((session) => {
      if (!session?.email) {
        return response.status(401).json({ error: "User login required." });
      }
      request.userSession = { email: session.email, ...session.data };
      request.userToken = session.token;
      next();
    })
    .catch(next);
}

async function getOptionalUserSession(request) {
  const session = await loadSession(request, USER_COOKIE, "user");
  return session?.email ? { email: session.email, ...session.data } : null;
}

async function getOptionalAdminSession(request) {
  const session = await loadSession(request, ADMIN_COOKIE, "admin");
  return session ? { ...session.data, ...session } : null;
}

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function recordAudit(request, entry) {
  const ip = request?.ip || request?.headers?.["x-forwarded-for"] || "";
  return storage
    .createAuditLog({
      ...entry,
      ip: typeof ip === "string" ? ip.split(",")[0].trim() : ip,
      createdAt: new Date().toISOString(),
    })
    .catch((error) => {
      logger.warn({ err: error.message, action: entry?.action }, "audit log write failed");
    });
}

function isCardPaymentMethod(method) {
  return ["Pay with card", "Paystack"].includes(String(method || "").trim());
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const { passwordHash, ...rest } = user;
  return rest;
}

function buildLoyaltyTier(points) {
  if (points >= 120) return "gold";
  if (points >= 60) return "silver";
  return "bronze";
}

function createNotification(message, type = "general", metadata = null) {
  const notification = {
    id: crypto.randomBytes(8).toString("hex"),
    type,
    message: stripUnsafeText(message, 280),
    createdAt: new Date().toISOString(),
    read: false,
  };
  if (metadata && typeof metadata === "object") {
    Object.assign(notification, metadata);
  }
  return notification;
}

async function sendVerificationEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return;
  const token = generateToken(24);
  const tokenHash = hashToken(token);
  await storage.deleteEmailVerificationsForEmail(normalized, "signup").catch(() => {});
  await storage.createEmailVerification({
    tokenHash,
    email: normalized,
    purpose: "signup",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  const link = `${frontendUrl.replace(/\/$/, "")}/?verify=${encodeURIComponent(token)}`;
  return mailer.sendVerificationEmail({ to: normalized, link });
}

function publishOrderEvent(reference, payload) {
  const subscribers = orderEventSubscribers.get(reference);
  if (!subscribers || subscribers.size === 0) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const subscriber of subscribers) {
    try {
      subscriber.write(data);
    } catch {
      subscribers.delete(subscriber);
    }
  }
}

async function handlePaystackWebhook(request, response) {
  if (!paystackSecretKey) {
    return response.status(503).json({ error: "Paystack is not configured." });
  }
  const signature = request.headers["x-paystack-signature"] || "";
  const rawBody = request.body instanceof Buffer ? request.body : Buffer.from(JSON.stringify(request.body || {}));
  if (!verifyPaystackSignature(rawBody, signature, paystackSecretKey)) {
    return response.status(401).json({ error: "Invalid webhook signature." });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return response.status(400).json({ error: "Invalid JSON payload." });
  }

  if (event.event !== "charge.success" || !event.data?.reference) {
    return response.json({ ok: true, ignored: true });
  }

  const reference = String(event.data.reference);
  const order = await storage.getOrderByReference(reference);
  if (!order) {
    return response.json({ ok: true, unknownOrder: true });
  }

  if (order.status === "awaiting_payment") {
    const updated = await storage.updateOrderPayment(
      reference,
      {
        ...(order.payment || {}),
        method: "Pay with card",
        status: "paid",
        reference: event.data.reference || reference,
        paidAt: event.data.paid_at || new Date().toISOString(),
      },
      "received",
    );

    publishOrderEvent(reference, { type: "status", status: "received", order: updated });

    const customerEmail = String(updated?.customer?.email || "").trim().toLowerCase();
    const linkedUser = customerEmail ? await storage.getUserByEmail(customerEmail) : null;
    if (linkedUser) {
      const addedPoints = Math.max(1, Math.floor((Number(updated?.pricing?.total) || 0) / 2500));
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

    if (customerEmail) {
      mailer.sendOrderConfirmation({
        to: customerEmail,
        customerName: updated?.customer?.customerName || "PEM customer",
        reference,
        total: updated?.pricing?.total || 0,
        etaLabel: updated?.customer?.deliveryEta || "",
      }).catch(() => {});
    }
  }

  response.json({ ok: true });
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
      const [username, secret, label = "PEM Staff", branchId = ""] = line
        .split("|")
        .map((part) => String(part || "").trim());
      if (!username || !secret) {
        return null;
      }
      const isHashed = isHashedPassword(secret);
      return {
        username: username.toLowerCase(),
        passwordHash: isHashed ? secret : "",
        password: isHashed ? "" : secret,
        label,
        branchId: branchId.toLowerCase(),
      };
    })
    .filter(Boolean);
}

function hashStaffAdminsText(rawValue) {
  let mutated = false;
  const lines = String(rawValue || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => String(part || "").trim());
      const [username, secret, label = "PEM Staff", branchId = ""] = parts;
      if (!username || !secret) return null;
      if (isHashedPassword(secret)) {
        return [username.toLowerCase(), secret, label, branchId.toLowerCase()].join("|");
      }
      mutated = true;
      const hashed = createPasswordHash(secret);
      return [username.toLowerCase(), hashed, label, branchId.toLowerCase()].join("|");
    })
    .filter(Boolean);
  return { text: lines.join("\n"), mutated };
}

function parseBranchLocations(rawValue, settings = defaultSettings) {
  const parsed = String(rawValue || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, label, address, phone, hours, note] = line.split("|").map((part) => String(part || "").trim());
      if (!id || !label) {
        return null;
      }
      return {
        id: id.toLowerCase(),
        label,
        address: address || settings.address,
        phone: phone || settings.phone,
        hours: hours || settings.businessHoursText,
        note: note || `${label} branch support.`,
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
    },
  ];
}

function resolveBranchSelection(inputBranchId, settings = defaultSettings) {
  const branches = parseBranchLocations(settings.branchLocationsText, settings);
  const normalizedBranchId = String(inputBranchId || "").trim().toLowerCase();
  return branches.find((branch) => branch.id === normalizedBranchId) || branches[0];
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
    allowedOrigins,
  });
});

app.get("/api/menu", asyncHandler(async (_request, response) => {
  const menuItems = await storage.getMenuItems();
  response.json({ menuItems });
}));

app.get("/api/settings", asyncHandler(async (request, response) => {
  const settings = await storage.getSettings();
  const adminSession = await getOptionalAdminSession(request);
  response.json({
    settings: adminSession
      ? settings
      : {
          ...settings,
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

app.post("/api/auth/signup", authRateLimiter, asyncHandler(async (request, response) => {
  const { fullName, email, password, phone, address, referralCode } = request.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedAddress = stripUnsafeText(address, 200);
  const normalizedFullName = stripUnsafeText(fullName, 80);

  if (!normalizedFullName || !normalizedEmail || !password) {
    return response.status(400).json({ error: "Full name, email, and password are required." });
  }

  if (!isValidEmail(normalizedEmail)) {
    return response.status(400).json({ error: "Please enter a valid email address." });
  }

  if (String(password).length < 8) {
    return response.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const existingUser = await storage.getUserByEmail(normalizedEmail);
  if (existingUser) {
    return response.status(409).json({ error: "An account with that email already exists." });
  }
  const normalizedReferralCode = String(referralCode || "").trim().toLowerCase().slice(0, 24);

  const user = await storage.createUser({
    email: normalizedEmail,
    passwordHash: createPasswordHash(password),
    fullName: normalizedFullName,
    phone: stripUnsafeText(phone, 22),
    favoriteItemIds: [],
    savedAddresses: normalizedAddress ? [normalizedAddress] : [],
    orderReferences: [],
    notifications: [createNotification("Welcome to PEM. Your account is ready to use.", "welcome")],
    loyaltyPoints: normalizedReferralCode ? 5 : 0,
    loyaltyTier: "bronze",
    referralCode: createReferralCode(normalizedFullName),
    referredBy: normalizedReferralCode,
    referralCredits: 0,
    emailVerified: false,
    createdAt: new Date().toISOString(),
  });

  await sendVerificationEmail(user.email).catch((error) => {
    logger.error({ err: error.message }, "signup verification email send failed");
  });

  const session = await persistSession({ scope: "user", email: user.email });
  setSessionCookie(response, USER_COOKIE, session.token, session.expiresAt);

  response.status(201).json({
    user: sanitizeUser(user),
    session: { expiresAt: session.expiresAt },
    requiresEmailVerification: !user.emailVerified,
  });
}));

app.post("/api/auth/login", authRateLimiter, asyncHandler(async (request, response) => {
  const { email, password } = request.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = await storage.getUserByEmail(normalizedEmail);

  if (!user || !verifyPasswordHash(String(password || ""), user.passwordHash)) {
    return response.status(401).json({ error: "Incorrect email or password." });
  }

  const session = await persistSession({ scope: "user", email: user.email });
  setSessionCookie(response, USER_COOKIE, session.token, session.expiresAt);

  response.json({
    user: sanitizeUser(user),
    session: { expiresAt: session.expiresAt },
    requiresEmailVerification: !user.emailVerified,
  });
}));

app.post("/api/auth/forgot-password", authRateLimiter, asyncHandler(async (request, response) => {
  const { email, phone, newPassword } = request.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").replace(/\D/g, "");
  const user = await storage.getUserByEmail(normalizedEmail);

  if (!user) {
    return response.status(404).json({ error: "No PEM account was found for that email." });
  }

  if (!normalizedPhone || String(user.phone || "").replace(/\D/g, "") !== normalizedPhone) {
    return response.status(401).json({ error: "The recovery phone number did not match this account." });
  }

  if (String(newPassword || "").length < 8) {
    return response.status(400).json({ error: "New password must be at least 8 characters long." });
  }

  const savedUser = await storage.updateUser(user.email, {
    ...user,
    passwordHash: createPasswordHash(newPassword),
    notifications: [
      createNotification("Your PEM account password was updated.", "security"),
      ...(user.notifications || []),
    ].slice(0, 15),
    updatedAt: new Date().toISOString(),
  });

  await storage.deleteSessionsByEmail(user.email, "user").catch(() => {});

  await mailer.send({
    to: user.email,
    subject: "PEM password updated",
    text: "Your PEM account password was just updated. If this was not you, please contact PEM support immediately.",
  }).catch(() => {});

  response.json({
    message: "Password updated successfully. You can now log in.",
    user: sanitizeUser(savedUser),
  });
}));

app.post("/api/auth/logout", asyncHandler(async (request, response) => {
  const token = getRequestToken(request, USER_COOKIE);
  if (token) {
    await storage.deleteSessionByTokenHash(hashToken(token)).catch(() => {});
  }
  clearSessionCookie(response, USER_COOKIE);
  response.json({ ok: true });
}));

app.get("/api/auth/me", asyncHandler(async (request, response) => {
  const session = await getOptionalUserSession(request);
  if (!session?.email) {
    return response.json({ user: null });
  }
  const user = await storage.getUserByEmail(session.email);
  response.json({
    user: sanitizeUser(user),
    requiresEmailVerification: user ? !user.emailVerified : false,
  });
}));

app.post("/api/auth/resend-verification", authRateLimiter, requireUser, asyncHandler(async (request, response) => {
  const user = await storage.getUserByEmail(request.userSession.email);
  if (!user) {
    return response.status(404).json({ error: "Account not found." });
  }
  if (user.emailVerified) {
    return response.json({ ok: true, alreadyVerified: true });
  }
  await sendVerificationEmail(user.email);
  response.json({ ok: true });
}));

app.post("/api/auth/verify-email", authRateLimiter, asyncHandler(async (request, response) => {
  const rawToken = String(request.body?.token || request.query?.token || "").trim();
  if (!rawToken) {
    return response.status(400).json({ error: "Verification token is required.", code: "missing" });
  }
  const tokenHash = hashToken(rawToken);
  const verification = await storage.getEmailVerificationByTokenHash(tokenHash);
  if (!verification || verification.purpose !== "signup") {
    return response.status(400).json({ error: "This verification link is invalid.", code: "invalid" });
  }
  if (verification.consumedAt) {
    return response.json({ ok: true, alreadyVerified: true });
  }
  if (new Date(verification.expiresAt).getTime() < Date.now()) {
    return response.status(400).json({ error: "This verification link has expired.", code: "expired" });
  }
  const user = await storage.getUserByEmail(verification.email);
  if (user) {
    await storage.updateUser(user.email, {
      ...user,
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  await storage.consumeEmailVerification(tokenHash).catch(() => {});
  await storage.deleteEmailVerificationsForEmail(verification.email, "signup").catch(() => {});
  response.json({ ok: true });
}));

app.get("/api/account", requireUser, asyncHandler(async (request, response) => {
  const user = await storage.getUserByEmail(request.userSession.email);
  const [orders, receivedGifts, sentGifts] = await Promise.all([
    storage.getOrdersByReferences(user?.orderReferences || []),
    storage.getReceivedGiftsByEmail(request.userSession.email),
    storage.getSentGiftsByEmail(request.userSession.email),
  ]);
  response.json({
    user: sanitizeUser(user),
    orders,
    receivedGifts,
    sentGifts,
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
  };
  const savedUser = await storage.updateUser(user.email, nextUser);
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

app.post("/api/gifts", requireUser, asyncHandler(async (request, response) => {
  const { customer, items, pricing, recipientEmail, giftMessage } = request.body || {};
  const sender = await storage.getUserByEmail(request.userSession.email);
  const settings = await storage.getSettings();
  const promoCodes = parsePromoCodes(settings.promoCodesText);
  const selectedBranch = resolveBranchSelection(customer?.branchId, settings);
  const sanitizedPhone = sanitizePhoneInput(customer?.phone || sender?.phone);
  const normalizedRecipientEmail = String(recipientEmail || "").trim().toLowerCase();
  const normalizedSenderName = stripUnsafeText(customer?.customerName || sender?.fullName, 80);
  const normalizedGiftMessage = stripUnsafeText(giftMessage, 400);
  const normalizedPaymentReference = stripUnsafeText(customer?.paymentReference, 60);

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

app.post("/api/admin/login", authRateLimiter, asyncHandler(async (request, response) => {
  const { username, password, totpCode } = request.body || {};

  if (!password) {
    return response.status(400).json({ error: "Password is required." });
  }

  const settings = await storage.getSettings();
  const staffAdmins = parseStaffAdmins(settings.staffAdminsText);
  const normalizedUsername = String(username || "").trim().toLowerCase();
  const matchedStaffAdmin = normalizedUsername
    ? staffAdmins.find((item) => {
        if (item.username !== normalizedUsername) return false;
        if (item.passwordHash) return verifyPasswordHash(password, item.passwordHash);
        return item.password === password;
      })
    : null;

  const ownerMatch = !matchedStaffAdmin && (
    isHashedPassword(adminPassword)
      ? verifyPasswordHash(password, adminPassword)
      : password === adminPassword
  );

  if (!matchedStaffAdmin && !ownerMatch) {
    await recordAudit(request, {
      actorType: "admin",
      actorId: normalizedUsername || "unknown",
      action: "admin.login.failed",
    });
    return response.status(401).json({ error: "Incorrect admin credentials." });
  }

  const resolvedUsername = matchedStaffAdmin?.username || "owner";
  const credential = await storage.getAdminCredential(resolvedUsername);
  if (credential?.totpEnabled) {
    if (!totpCode) {
      return response.status(401).json({ error: "Two-factor code required.", requiresTotp: true });
    }
    if (!verifyTotpCode(credential.totpSecret, totpCode)) {
      await recordAudit(request, {
        actorType: "admin",
        actorId: resolvedUsername,
        action: "admin.login.totp_failed",
      });
      return response.status(401).json({ error: "Invalid two-factor code.", requiresTotp: true });
    }
  }

  const sessionData = {
    username: resolvedUsername,
    label: matchedStaffAdmin?.label || "Owner",
    branchId: matchedStaffAdmin?.branchId || "",
    isOwner: !matchedStaffAdmin,
    totpEnabled: Boolean(credential?.totpEnabled),
  };
  const session = await persistSession({
    scope: "admin",
    username: sessionData.username,
    data: sessionData,
  });
  setSessionCookie(response, ADMIN_COOKIE, session.token, session.expiresAt);

  await recordAudit(request, {
    actorType: "admin",
    actorId: sessionData.username,
    action: "admin.login.success",
  });

  return response.json({
    admin: { ...sessionData, createdAt: session.createdAt },
    session: { expiresAt: session.expiresAt },
  });
}));

app.post("/api/admin/2fa/setup", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const username = request.adminSession.username;
  const secret = createTotpSecret();
  const recoveryCodes = generateRecoveryCodes();
  const recoveryCodeHashes = recoveryCodes.map((code) => hashToken(code));
  await storage.upsertAdminCredential({
    username,
    totpSecret: secret,
    totpEnabled: false,
    recoveryCodeHashes,
  });
  const otpAuthQr = await buildOtpAuthQrDataUrl(secret, username);
  await recordAudit(request, {
    actorType: "admin",
    actorId: username,
    action: "admin.2fa.setup_started",
  });
  response.json({ secret, otpAuthQr, recoveryCodes });
}));

app.post("/api/admin/2fa/enable", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const username = request.adminSession.username;
  const credential = await storage.getAdminCredential(username);
  if (!credential?.totpSecret) {
    return response.status(400).json({ error: "Run 2FA setup first." });
  }
  if (!verifyTotpCode(credential.totpSecret, request.body?.totpCode)) {
    return response.status(401).json({ error: "Invalid two-factor code." });
  }
  await storage.upsertAdminCredential({ ...credential, totpEnabled: true });
  await recordAudit(request, {
    actorType: "admin",
    actorId: username,
    action: "admin.2fa.enabled",
  });
  response.json({ ok: true });
}));

app.post("/api/admin/2fa/disable", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const username = request.adminSession.username;
  const credential = await storage.getAdminCredential(username);
  if (credential?.totpEnabled && !verifyTotpCode(credential.totpSecret, request.body?.totpCode)) {
    return response.status(401).json({ error: "Invalid two-factor code." });
  }
  await storage.upsertAdminCredential({
    username,
    totpSecret: "",
    totpEnabled: false,
    recoveryCodeHashes: [],
  });
  await recordAudit(request, {
    actorType: "admin",
    actorId: username,
    action: "admin.2fa.disabled",
  });
  response.json({ ok: true });
}));

app.get("/api/admin/audit-log", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const limit = Math.min(500, Math.max(1, Number(request.query?.limit) || 100));
  const offset = Math.max(0, Number(request.query?.offset) || 0);
  const entries = await storage.listAuditLogs({ limit, offset });
  response.json({ entries });
}));

app.post("/api/admin/logout", asyncHandler(async (request, response) => {
  const token = getRequestToken(request, ADMIN_COOKIE);
  if (token) {
    await storage.deleteSessionByTokenHash(hashToken(token)).catch(() => {});
  }
  clearSessionCookie(response, ADMIN_COOKIE);
  response.json({ ok: true });
}));

app.get("/api/admin/me", asyncHandler(async (request, response) => {
  const session = await getOptionalAdminSession(request);
  if (!session) {
    return response.json({ admin: null });
  }
  response.json({
    admin: {
      username: session.username,
      label: session.data?.label || session.label || "PEM admin",
      branchId: session.data?.branchId || session.branchId || "",
      isOwner: session.username === "owner",
      createdAt: session.createdAt,
    },
  });
}));

app.post("/api/admin/change-password", requireAdmin, requireOwnerAdmin, asyncHandler(async (request, response) => {
  const { currentPassword, newPassword, confirmPassword } = request.body || {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    return response.status(400).json({ error: "All password fields are required." });
  }

  const currentMatches = isHashedPassword(adminPassword)
    ? verifyPasswordHash(currentPassword, adminPassword)
    : currentPassword === adminPassword;

  if (!currentMatches) {
    return response.status(401).json({ error: "Current password is incorrect." });
  }

  if (String(newPassword).length < 12) {
    return response.status(400).json({ error: "New admin password must be at least 12 characters long." });
  }

  if (newPassword !== confirmPassword) {
    return response.status(400).json({ error: "New password and confirmation do not match." });
  }

  if (newPassword === currentPassword) {
    return response.status(400).json({ error: "Choose a different password from the current one." });
  }

  const hashed = createPasswordHash(newPassword);
  await persistAdminPassword(hashed);
  await storage.deleteSessionsByEmail("", "admin").catch(() => {});

  await recordAudit(request, {
    actorType: "admin",
    actorId: request.adminSession.username,
    action: "admin.password_changed",
  });

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
    admin: request.adminSession,
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
    staffAdminsText: hashStaffAdminsText(String(payload.staffAdminsText || defaultSettings.staffAdminsText).trim()).text,
    branchLocationsText: String(payload.branchLocationsText || defaultSettings.branchLocationsText).trim(),
    receiptFooter: String(payload.receiptFooter || defaultSettings.receiptFooter).trim(),
  };

  if (!settings.businessName || !settings.appName || !settings.phone) {
    return response.status(400).json({ error: "Business name, app name, and phone are required." });
  }

  const savedSettings = await storage.updateSettings(settings);
  await recordAudit(request, {
    actorType: "admin",
    actorId: request.adminSession.username,
    action: "admin.settings.updated",
  });
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

app.post("/api/orders", orderRateLimiter, asyncHandler(async (request, response) => {
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

  if (isCardPaymentMethod(customer.paymentMethod) && !paystackSecretKey) {
    return response.status(400).json({ error: "Card payment is not available right now. Please use bank transfer or pay on arrival." });
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

  const order = {
    reference: makeReference("PEM-ORD"),
    customer: {
      ...customer,
      phone: sanitizedPhone,
      branchId: selectedBranch.id,
      branchName: selectedBranch.label,
      branchAddress: selectedBranch.address,
      branchPhone: selectedBranch.phone,
    },
    items,
    pricing: {
      subtotal,
      delivery,
      discount,
      total,
    },
    payment: {
      method: customer?.paymentMethod || "Pay on arrival",
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

  const optionalSession = await getOptionalUserSession(request);
  const candidateEmail = String(optionalSession?.email || customer?.email || "").trim().toLowerCase();
  const linkedUser = candidateEmail ? await storage.getUserByEmail(candidateEmail) : null;

  if (linkedUser) {
    const orderReferences = [
      savedOrder.reference,
      ...(linkedUser.orderReferences || []).filter((reference) => reference !== savedOrder.reference),
    ].slice(0, 20);
    const notifications = [
      createNotification(
        awaitingCardPayment
          ? `Order ${savedOrder.reference} is waiting for your card payment before ${selectedBranch.label} confirms it.`
          : `Order ${savedOrder.reference} has been received by ${selectedBranch.label}.`,
        "order",
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
      updatedAt: new Date().toISOString(),
    });
  }

  return response.status(201).json({
    message: awaitingCardPayment ? "Order saved. Payment is required before confirmation." : "Order received.",
    order: savedOrder,
  });
}));

app.post("/api/payments/paystack/initialize", paymentRateLimiter, asyncHandler(async (request, response) => {
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

app.get("/api/payments/paystack/verify/:reference", paymentRateLimiter, asyncHandler(async (request, response) => {
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

app.get("/api/orders/:reference/stream", asyncHandler(async (request, response) => {
  const reference = String(request.params.reference || "").trim();
  if (!reference) {
    return response.status(400).json({ error: "Order reference is required." });
  }
  const order = await storage.getOrderByReference(reference);
  if (!order) {
    return response.status(404).json({ error: "Order not found." });
  }

  response.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  response.flushHeaders?.();
  response.write(`data: ${JSON.stringify({ type: "snapshot", status: order.status, order })}\n\n`);

  if (!orderEventSubscribers.has(reference)) {
    orderEventSubscribers.set(reference, new Set());
  }
  const subscribers = orderEventSubscribers.get(reference);
  subscribers.add(response);

  const heartbeat = setInterval(() => {
    try {
      response.write(": ping\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 25_000);

  request.on("close", () => {
    clearInterval(heartbeat);
    subscribers.delete(response);
    if (subscribers.size === 0) {
      orderEventSubscribers.delete(reference);
    }
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
  const order = await storage.updateOrderStatus(reference, status);

  await recordAudit(request, {
    actorType: "admin",
    actorId: request.adminSession.username,
    action: "admin.order.status_changed",
    targetType: "order",
    targetId: reference,
    metadata: { status },
  });

  publishOrderEvent(reference, { type: "status", status, order });

  if (status === "delivered" || status === "out_for_delivery") {
    const customerEmail = String(order?.customer?.email || "").trim().toLowerCase();
    if (customerEmail) {
      mailer.send({
        to: customerEmail,
        subject: `Update on PEM order ${reference}`,
        text: `Your PEM order ${reference} status changed to: ${status.replace(/_/g, " ")}.`,
      }).catch(() => {});
    }
  }

  return response.json({
    message: "Order status updated.",
    order,
  });
}));

app.post("/api/contact", orderRateLimiter, asyncHandler(async (request, response) => {
  const { name, phone, message, branchId, branchName } = request.body || {};
  const settings = await storage.getSettings();
  const selectedBranch = resolveBranchSelection(branchId, settings);

  const cleanName = stripUnsafeText(name, 80);
  const cleanPhone = sanitizePhoneInput(phone);
  const cleanMessage = stripUnsafeText(message, 1500);

  if (!cleanName || !cleanPhone || !cleanMessage) {
    return response.status(400).json({ error: "Name, phone, and message are required." });
  }

  if (normalizePhoneDigits(cleanPhone).length < 10) {
    return response.status(400).json({ error: "Please enter a valid phone number." });
  }

  const entry = {
    reference: makeReference("PEM-MSG"),
    name: cleanName,
    phone: cleanPhone,
    message: cleanMessage,
    branchId: selectedBranch.id,
    branchName: stripUnsafeText(branchName, 80) || selectedBranch.label,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const savedEntry = await storage.createContact(entry);

  return response.status(201).json({
    message: savedEntry,
  });
}));

app.post("/api/catering", orderRateLimiter, asyncHandler(async (request, response) => {
  const { name, phone, eventDate, guestCount, eventType, details, branchId, branchName } = request.body || {};
  const settings = await storage.getSettings();
  const selectedBranch = resolveBranchSelection(branchId, settings);

  const cleanName = stripUnsafeText(name, 80);
  const cleanPhone = sanitizePhoneInput(phone);
  const cleanDetails = stripUnsafeText(details, 2000);

  if (!cleanName || !cleanPhone || !eventDate || !guestCount || !cleanDetails) {
    return response.status(400).json({
      error: "Name, phone, event date, guest count, and event details are required.",
    });
  }

  if (normalizePhoneDigits(cleanPhone).length < 10) {
    return response.status(400).json({ error: "Please enter a valid phone number." });
  }

  const entry = {
    reference: makeReference("PEM-CAT"),
    name: cleanName,
    phone: cleanPhone,
    eventDate: stripUnsafeText(eventDate, 60),
    guestCount: stripUnsafeText(guestCount, 20),
    eventType: stripUnsafeText(eventType, 80),
    details: cleanDetails,
    branchId: selectedBranch.id,
    branchName: stripUnsafeText(branchName, 80) || selectedBranch.label,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const savedEntry = await storage.createCatering(entry);

  return response.status(201).json({
    request: savedEntry,
  });
}));

app.post("/api/reservations", orderRateLimiter, asyncHandler(async (request, response) => {
  const { name, phone, date, time, guests, notes, branchId, branchName } = request.body || {};
  const settings = await storage.getSettings();
  const selectedBranch = resolveBranchSelection(branchId, settings);

  const cleanName = stripUnsafeText(name, 80);
  const cleanPhone = sanitizePhoneInput(phone);

  if (!cleanName || !cleanPhone || !date || !time || !guests) {
    return response.status(400).json({ error: "Name, phone, date, time, and guest count are required." });
  }

  if (normalizePhoneDigits(cleanPhone).length < 10) {
    return response.status(400).json({ error: "Please enter a valid phone number." });
  }

  const reservation = await storage.createReservation({
    reference: makeReference("PEM-RES"),
    name: cleanName,
    phone: cleanPhone,
    date: stripUnsafeText(date, 60),
    time: stripUnsafeText(time, 30),
    guests: stripUnsafeText(guests, 20),
    notes: stripUnsafeText(notes, 1000),
    branchId: selectedBranch.id,
    branchName: stripUnsafeText(branchName, 80) || selectedBranch.label,
    status: "new",
    createdAt: new Date().toISOString(),
  });

  response.status(201).json({ reservation });
}));

app.post("/api/reviews", orderRateLimiter, asyncHandler(async (request, response) => {
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
    customerName: stripUnsafeText(order.customer.customerName, 80),
    branchId: order.customer.branchId || String(branchId || "").trim().toLowerCase(),
    branchName: order.customer.branchName || stripUnsafeText(branchName, 80) || "PEM Branch",
    rating: normalizedRating,
    comment: stripUnsafeText(comment, 800),
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

app.post("/api/ai/dietary-match", aiRateLimiter, asyncHandler(async (request, response) => {
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
    logger.warn({ err: error.message }, "dietary AI request failed, using fallback matcher");
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

app.use((_request, response) => {
  response.status(404).json({ error: "Not found." });
});

app.use((error, request, response, _next) => {
  const status = Number(error?.status) || Number(error?.statusCode) || 500;
  const requestId = crypto.randomBytes(6).toString("hex");
  const safeMessage = status >= 400 && status < 500 && typeof error?.message === "string"
    ? error.message
    : "Something went wrong on the server.";
  logger.error(
    { requestId, method: request.method, path: request.path, err: error?.message || String(error) },
    "api error",
  );
  if (process.env.SENTRY_DSN && status >= 500) {
    Sentry.captureException(error, { tags: { requestId } });
  }
  if (response.headersSent) return;
  response.status(status).json({ error: safeMessage, requestId });
});

async function migrateStaffAdminPasswordsAtRest() {
  try {
    const settings = await storage.getSettings();
    const { text, mutated } = hashStaffAdminsText(settings.staffAdminsText);
    if (mutated) {
      await storage.updateSettings({ ...settings, staffAdminsText: text });
      logger.info("startup: hashed plaintext staff admin passwords in business settings");
    }
  } catch (error) {
    logger.error({ err: error.message }, "startup: failed to migrate staff admin passwords");
  }
}

function startSessionJanitor() {
  setInterval(() => {
    storage.deleteExpiredSessions().catch(() => {});
  }, 30 * 60 * 1000).unref?.();
}

storage.init()
  .then(async () => {
    await migrateStaffAdminPasswordsAtRest();
    startSessionJanitor();
    if (!isHashedPassword(adminPassword) && process.env.ADMIN_PASSWORD) {
      logger.warn("startup: ADMIN_PASSWORD is plaintext. Run /api/admin/change-password to upgrade.");
    }
    app.listen(PORT, () => {
      logger.info({ port: PORT, mode: storage.mode }, "PEM API server running");
    });
  })
  .catch((error) => {
    logger.fatal({ err: error.message }, "failed to start server");
    process.exit(1);
  });
