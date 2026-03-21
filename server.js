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
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
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

function requireUser(request, response, next) {
  const token = getBearerToken(request);
  const session = userSessions.get(token);

  if (!token || !session?.email) {
    return response.status(401).json({ error: "User login required." });
  }

  request.userSession = session;
  next();
}

function getOptionalUserSession(request) {
  const token = getBearerToken(request);
  return token ? userSessions.get(token) || null : null;
}

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function createPasswordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) {
    return false;
  }
  const comparison = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(comparison, "hex"));
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

function createNotification(message, type = "general") {
  return {
    id: crypto.randomBytes(8).toString("hex"),
    type,
    message,
    createdAt: new Date().toISOString(),
    read: false,
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
    throw new Error(data.message || "Unable to initialize Paystack payment.");
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
    throw new Error(data.message || "Unable to verify Paystack payment.");
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

app.get("/api/settings", asyncHandler(async (_request, response) => {
  const settings = await storage.getSettings();
  response.json({ settings });
}));

app.post("/api/auth/signup", asyncHandler(async (request, response) => {
  const { fullName, email, password, phone } = request.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!fullName || !normalizedEmail || !password) {
    return response.status(400).json({ error: "Full name, email, and password are required." });
  }

  if (String(password).length < 6) {
    return response.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const existingUser = await storage.getUserByEmail(normalizedEmail);
  if (existingUser) {
    return response.status(409).json({ error: "An account with that email already exists." });
  }

  const user = await storage.createUser({
    email: normalizedEmail,
    passwordHash: createPasswordHash(password),
    fullName: String(fullName).trim(),
    phone: String(phone || "").trim(),
    favoriteItemIds: [],
    savedAddresses: [],
    orderReferences: [],
    notifications: [createNotification("Welcome to PEM. Your account is ready to use.", "welcome")],
    loyaltyPoints: 0,
    loyaltyTier: "bronze",
    createdAt: new Date().toISOString(),
  });

  const token = createAdminToken();
  userSessions.set(token, { email: user.email, createdAt: new Date().toISOString() });

  response.status(201).json({
    token,
    user: sanitizeUser(user),
  });
}));

app.post("/api/auth/login", asyncHandler(async (request, response) => {
  const { email, password } = request.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = await storage.getUserByEmail(normalizedEmail);

  if (!user || !verifyPassword(String(password || ""), user.passwordHash)) {
    return response.status(401).json({ error: "Incorrect email or password." });
  }

  const token = createAdminToken();
  userSessions.set(token, { email: user.email, createdAt: new Date().toISOString() });

  response.json({
    token,
    user: sanitizeUser(user),
  });
}));

app.post("/api/auth/forgot-password", asyncHandler(async (request, response) => {
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

  if (String(newPassword || "").length < 6) {
    return response.status(400).json({ error: "New password must be at least 6 characters long." });
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

  response.json({
    message: "Password updated successfully. You can now log in.",
    user: sanitizeUser(savedUser),
  });
}));

app.post("/api/auth/logout", requireUser, (request, response) => {
  const token = getBearerToken(request);
  userSessions.delete(token);
  response.json({ ok: true });
});

app.get("/api/account", requireUser, asyncHandler(async (request, response) => {
  const user = await storage.getUserByEmail(request.userSession.email);
  const orders = await storage.getOrdersByReferences(user?.orderReferences || []);
  response.json({
    user: sanitizeUser(user),
    orders,
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

app.put("/api/admin/settings", requireAdmin, asyncHandler(async (request, response) => {
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

app.put("/api/admin/menu", requireAdmin, asyncHandler(async (request, response) => {
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
    dietaryTags: Array.isArray(item.dietaryTags) ? item.dietaryTags : [],
    dietaryProfile: String(item.dietaryProfile || "").trim(),
    soldOut: Boolean(item.soldOut),
    hidden: Boolean(item.hidden),
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

  if (!customer?.customerName || !customer?.phone || !customer?.address) {
    return response.status(400).json({ error: "Customer name, phone, and address are required." });
  }

  if (String(customer.phone || "").replace(/\D/g, "").length < 10) {
    return response.status(400).json({ error: "Please enter a valid phone number." });
  }

  if (customer.paymentMethod === "Paystack" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customer.email || "").trim())) {
    return response.status(400).json({ error: "A valid email address is required for Paystack checkout." });
  }

  if (customer.paymentMethod === "Bank transfer" && String(customer.paymentReference || "").trim().length < 3) {
    return response.status(400).json({ error: "Add your bank transfer payment reference before placing this order." });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ error: "At least one order item is required." });
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

  const order = {
    reference: makeReference("PEM-ORD"),
    customer,
    items,
    pricing: {
      subtotal,
      delivery,
      discount,
      total,
    },
    payment: {
      method: customer?.paymentMethod || "Pay on delivery",
      status: customer?.paymentMethod === "Paystack" ? "pending" : "unpaid",
      reference: String(customer?.paymentReference || "").trim(),
      paidAt: null,
    },
    createdAt: new Date().toISOString(),
    status: customer?.paymentMethod === "Paystack" ? "awaiting_payment" : "received",
  };
  const savedOrder = await storage.createOrder(order);

  const optionalSession = getOptionalUserSession(request);
  const candidateEmail = String(optionalSession?.email || customer?.email || "").trim().toLowerCase();
  const linkedUser = candidateEmail ? await storage.getUserByEmail(candidateEmail) : null;

  if (linkedUser) {
    const orderReferences = [
      savedOrder.reference,
      ...(linkedUser.orderReferences || []).filter((reference) => reference !== savedOrder.reference),
    ].slice(0, 20);
    const notifications = [
      createNotification(`Order ${savedOrder.reference} has been received by PEM.`, "order"),
      ...(linkedUser.notifications || []),
    ].slice(0, 15);
    const nextSavedAddresses = customer?.address
      ? [
          customer.address,
          ...(linkedUser.savedAddresses || []).filter((item) => item !== customer.address),
        ].slice(0, 5)
      : linkedUser.savedAddresses || [];
    const addedPoints = Math.max(1, Math.floor((Number(savedOrder.pricing?.total) || 0) / 2500));
    const loyaltyPoints = (Number(linkedUser.loyaltyPoints) || 0) + addedPoints;

    await storage.updateUser(linkedUser.email, {
      ...linkedUser,
      phone: linkedUser.phone || String(customer?.phone || "").trim(),
      orderReferences,
      notifications,
      savedAddresses: nextSavedAddresses,
      loyaltyPoints,
      loyaltyTier: buildLoyaltyTier(loyaltyPoints),
      updatedAt: new Date().toISOString(),
    });
  }

  return response.status(201).json({
    message: "Order received.",
    order: savedOrder,
  });
}));

app.post("/api/payments/paystack/initialize", asyncHandler(async (request, response) => {
  if (!paystackSecretKey) {
    return response.status(400).json({ error: "Paystack is not configured on the server." });
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
    method: "Paystack",
    status: "pending",
    reference: orderReference,
    paidAt: null,
  });

  response.json({ payment });
}));

app.get("/api/payments/paystack/verify/:reference", asyncHandler(async (request, response) => {
  if (!paystackSecretKey) {
    return response.status(400).json({ error: "Paystack is not configured on the server." });
  }

  const reference = String(request.params.reference || "").trim();
  const payment = await verifyPaystackTransaction(reference);
  let order = await storage.getOrderByReference(reference);

  if (payment.status === "success" && order && order.status === "awaiting_payment") {
    order = await storage.updateOrderPayment(
      reference,
      {
        ...(order.payment || {}),
        method: "Paystack",
        status: "paid",
        reference: payment.reference || reference,
        paidAt: payment.paid_at || new Date().toISOString(),
      },
      "received",
    );

    const customerEmail = String(order?.customer?.email || "").trim().toLowerCase();
    const linkedUser = customerEmail ? await storage.getUserByEmail(customerEmail) : null;
    if (linkedUser) {
      await storage.updateUser(linkedUser.email, {
        ...linkedUser,
        notifications: [
          createNotification(`Payment was confirmed for order ${reference}.`, "payment"),
          ...(linkedUser.notifications || []),
        ].slice(0, 15),
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

app.patch("/api/admin/orders/:reference/status", requireAdmin, asyncHandler(async (request, response) => {
  const { reference } = request.params;
  const { status } = request.body || {};
  const allowedStatuses = ["received", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];

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
