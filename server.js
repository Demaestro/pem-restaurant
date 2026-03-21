import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createStorage } from "./lib/storage.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "submissions.json");
const ENV_PATH = path.join(__dirname, ".env");

const app = express();
const PORT = process.env.PORT || 4000;
let adminPassword = process.env.ADMIN_PASSWORD || "pem-admin-1234";
const openAiModel = process.env.OPENAI_MODEL || "gpt-5-mini";
const forceLocalStorage = process.env.STORAGE_MODE === "local";
const adminSessions = new Map();
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const defaultDeliveryZones = [
  { id: "gwarinpa", label: "Gwarinpa / Life Camp", fee: 1200, eta: "35 to 50 mins" },
  { id: "wuse", label: "Wuse / Utako / Jabi", fee: 1800, eta: "45 to 60 mins" },
  { id: "maitama", label: "Maitama / Asokoro / Guzape", fee: 2200, eta: "50 to 70 mins" },
  { id: "lugbe", label: "Lugbe / Airport Road", fee: 2500, eta: "60 to 85 mins" },
  { id: "owerri", label: "Owerri, Imo State", fee: 4500, eta: "Next-day confirmation with PEM" },
  { id: "custom", label: "Other area", fee: 3000, eta: "Confirmed after order" },
];
const storage = createStorage({
  dataDir: DATA_DIR,
  dbPath: DB_PATH,
  supabaseUrl: forceLocalStorage ? "" : process.env.SUPABASE_URL,
  supabaseServiceRoleKey: forceLocalStorage ? "" : process.env.SUPABASE_SERVICE_ROLE_KEY,
  defaultDeliveryZones,
});

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed."));
    },
  }),
);
app.use(express.json());

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

function requireAdmin(request, response, next) {
  const token = getBearerToken(request);

  if (!token || !adminSessions.has(token)) {
    return response.status(401).json({ error: "Admin login required." });
  }

  request.adminSession = adminSessions.get(token);
  next();
}

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
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

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/delivery-zones", asyncHandler(async (_request, response) => {
  const deliveryZones = await storage.getDeliveryZones();
  response.json({ deliveryZones });
}));

app.post("/api/admin/login", (request, response) => {
  const { password } = request.body || {};

  if (!password) {
    return response.status(400).json({ error: "Password is required." });
  }

  if (password !== adminPassword) {
    return response.status(401).json({ error: "Incorrect admin password." });
  }

  const token = createAdminToken();
  const session = {
    createdAt: new Date().toISOString(),
  };

  adminSessions.set(token, session);

  return response.json({
    token,
  });
});

app.post("/api/admin/logout", requireAdmin, (request, response) => {
  const token = getBearerToken(request);
  adminSessions.delete(token);
  response.json({ ok: true });
});

app.post("/api/admin/change-password", requireAdmin, asyncHandler(async (request, response) => {
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

app.get("/api/admin/summary", requireAdmin, asyncHandler(async (_request, response) => {
  const summary = await storage.getSummary();
  response.json(summary);
}));

app.put("/api/admin/delivery-zones", requireAdmin, asyncHandler(async (request, response) => {
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

app.post("/api/orders", asyncHandler(async (request, response) => {
  const { customer, items, pricing } = request.body || {};

  if (!customer?.customerName || !customer?.phone || !customer?.address) {
    return response.status(400).json({ error: "Customer name, phone, and address are required." });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ error: "At least one order item is required." });
  }

  const order = {
    reference: makeReference("PEM-ORD"),
    customer,
    items,
    pricing,
    createdAt: new Date().toISOString(),
    status: "received",
  };
  const savedOrder = await storage.createOrder(order);

  return response.status(201).json({
    message: "Order received.",
    order: savedOrder,
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

app.patch("/api/admin/orders/:reference/status", requireAdmin, asyncHandler(async (request, response) => {
  const { reference } = request.params;
  const { status } = request.body || {};
  const allowedStatuses = ["received", "preparing", "ready", "delivered", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    return response.status(400).json({ error: "Invalid order status." });
  }

  const order = await storage.updateOrderStatus(reference, status);
  if (!order) {
    return response.status(404).json({ error: "Order not found." });
  }

  return response.json({
    message: "Order status updated.",
    order,
  });
}));

app.post("/api/contact", asyncHandler(async (request, response) => {
  const { name, phone, message } = request.body || {};

  if (!name || !phone || !message) {
    return response.status(400).json({ error: "Name, phone, and message are required." });
  }

  const entry = {
    reference: makeReference("PEM-MSG"),
    name,
    phone,
    message,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const savedEntry = await storage.createContact(entry);

  return response.status(201).json({
    message: savedEntry,
  });
}));

app.post("/api/catering", asyncHandler(async (request, response) => {
  const { name, phone, eventDate, guestCount, eventType, details } = request.body || {};

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
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const savedEntry = await storage.createCatering(entry);

  return response.status(201).json({
    request: savedEntry,
  });
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

  const entry = await storage.updateContactStatus(reference, status);
  if (!entry) {
    return response.status(404).json({ error: "Contact message not found." });
  }

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

  const entry = await storage.updateCateringStatus(reference, status);
  if (!entry) {
    return response.status(404).json({ error: "Catering request not found." });
  }

  return response.json({
    message: "Catering status updated.",
    request: entry,
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
