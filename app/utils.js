import {
  cardPaymentMethodLabel,
  currency,
  defaultDeliveryZones,
  defaultMenuSchedule,
  menuItems,
} from "./data.js";
import { initialBusinessSettings } from "./constants.js";

export function formatPrice(value) {
  return currency.format(value);
}

export function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getDeliveryZone(zoneId, zones = defaultDeliveryZones) {
  const sourceZones = Array.isArray(zones) && zones.length > 0 ? zones : defaultDeliveryZones;
  return sourceZones.find((zone) => zone.id === zoneId) || sourceZones[0];
}

export function formatMinutesAsTime(totalMinutes) {
  const normalizedMinutes = Number(totalMinutes);
  if (!Number.isFinite(normalizedMinutes)) {
    return "time confirmed by PEM";
  }

  const safeMinutes = ((normalizedMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:00 ${suffix}`;
}

export function normalizeScheduleDays(days) {
  const normalized = Array.isArray(days)
    ? days.map((day) => String(day || "").trim().slice(0, 3).toLowerCase()).filter(Boolean)
    : [];
  return normalized.length > 0 ? [...new Set(normalized)] : [...defaultMenuSchedule.availableDays];
}

export function parseTimeToMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

export function getLagosNowParts() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    day: String(values.weekday || "").slice(0, 3).toLowerCase(),
    minutes: (Number(values.hour) || 0) * 60 + (Number(values.minute) || 0),
  };
}

export function parseTimeLabelToMinutes(value) {
  const match = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(String(value || "").trim());
  if (!match) {
    return null;
  }

  let hours = Number(match[1]) || 0;
  const minutes = Number(match[2] || 0) || 0;
  const suffix = String(match[3] || "").toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  if (suffix === "AM") {
    hours = hours === 12 ? 0 : hours;
  } else {
    hours = hours === 12 ? 12 : hours + 12;
  }

  return hours * 60 + minutes;
}

export function parseHoursWindow(hoursText) {
  const [openLabel, closeLabel] = String(hoursText || "")
    .split("-")
    .map((part) => String(part || "").trim());
  const openMinutes = parseTimeLabelToMinutes(openLabel);
  const closeMinutes = parseTimeLabelToMinutes(closeLabel);

  if (openMinutes === null || closeMinutes === null) {
    return null;
  }

  return { openMinutes, closeMinutes };
}

export function isTimeWithinWindow(targetMinutes, window) {
  if (!window || typeof targetMinutes !== "number") {
    return true;
  }

  if (window.openMinutes === window.closeMinutes) {
    return false;
  }

  if (window.openMinutes < window.closeMinutes) {
    return targetMinutes >= window.openMinutes && targetMinutes <= window.closeMinutes;
  }

  return targetMinutes >= window.openMinutes || targetMinutes <= window.closeMinutes;
}

export function isScheduledWithinBusinessHours(scheduledFor, hoursText) {
  if (!scheduledFor) {
    return true;
  }

  const scheduledDate = new Date(scheduledFor);
  if (Number.isNaN(scheduledDate.getTime())) {
    return false;
  }

  const hoursWindow = parseHoursWindow(hoursText);
  if (!hoursWindow) {
    return true;
  }

  return isTimeWithinWindow(
    scheduledDate.getHours() * 60 + scheduledDate.getMinutes(),
    hoursWindow,
  );
}

export function normalizePhoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function sanitizePhoneInput(value) {
  return String(value || "")
    .replace(/[^\d+\s()-]/g, "")
    .replace(/\s{2,}/g, " ")
    .trimStart()
    .slice(0, 22);
}

export function getWhatsAppPhone(settings) {
  return String(settings?.whatsappPhone || initialBusinessSettings.whatsappPhone || "").replace(/\D/g, "");
}

export function isMenuItemScheduledNow(item, now = getLagosNowParts()) {
  const days = normalizeScheduleDays(item.availableDays);
  const startsAt = parseTimeToMinutes(item.availableFrom);
  const endsAt = parseTimeToMinutes(item.availableUntil);

  if (!days.includes(now.day)) {
    return false;
  }

  if (startsAt === null || endsAt === null || startsAt === endsAt) {
    return true;
  }

  if (startsAt < endsAt) {
    return now.minutes >= startsAt && now.minutes <= endsAt;
  }

  return now.minutes >= startsAt || now.minutes <= endsAt;
}

export function getBusinessStatus(hoursText, now = getLagosNowParts()) {
  const normalizedHours = String(hoursText || "").trim();
  if (!normalizedHours) {
    return {
      isOpen: true,
      label: "Hours confirmed by PEM",
    };
  }

  if (/closed/i.test(normalizedHours) && !normalizedHours.includes("-")) {
    return {
      isOpen: false,
      label: normalizedHours,
    };
  }

  const hoursWindow = parseHoursWindow(normalizedHours);
  if (!hoursWindow) {
    return {
      isOpen: false,
      label: normalizedHours,
    };
  }

  const isOpen = isTimeWithinWindow(now.minutes, hoursWindow);
  return {
    isOpen,
    label: isOpen
      ? `Open now until ${formatMinutesAsTime(hoursWindow.closeMinutes)}`
      : `Opens ${formatMinutesAsTime(hoursWindow.openMinutes)} today`,
  };
}

export function mergeMenuCatalog(baseItems, remoteItems) {
  const remoteById = new Map((remoteItems || []).map((item) => [item.id, item]));
  return baseItems.map((item) => ({
    ...item,
    ...(remoteById.get(item.id) || {}),
    image: String(remoteById.get(item.id)?.imageUrl || item.image || "").trim(),
    imageUrl: String(remoteById.get(item.id)?.imageUrl || item.imageUrl || "").trim(),
    stockQuantity: Number(remoteById.get(item.id)?.stockQuantity ?? item.stockQuantity ?? 12) || 0,
    availableFrom: String(remoteById.get(item.id)?.availableFrom ?? item.availableFrom ?? defaultMenuSchedule.availableFrom),
    availableUntil: String(remoteById.get(item.id)?.availableUntil ?? item.availableUntil ?? defaultMenuSchedule.availableUntil),
    availableDays: Array.isArray(remoteById.get(item.id)?.availableDays)
      ? remoteById.get(item.id).availableDays
      : Array.isArray(item.availableDays)
        ? item.availableDays
        : defaultMenuSchedule.availableDays,
    soldOut: Boolean(remoteById.get(item.id)?.soldOut),
    hidden: Boolean(remoteById.get(item.id)?.hidden),
  }));
}

export function parsePromoCodes(rawValue) {
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

export function getPromoDiscount(promoCode, subtotal, promoCodes = []) {
  const normalizedCode = String(promoCode || "").trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, amount: 0, code: "" };
  }

  const promo = promoCodes.find((item) => item.code === normalizedCode);
  if (!promo) {
    return { valid: false, amount: 0, code: normalizedCode, minimumOrder: 0 };
  }

  if ((Number(subtotal) || 0) < promo.minimumOrder) {
    return { valid: false, amount: 0, code: normalizedCode, minimumOrder: promo.minimumOrder };
  }

  const amount = promo.type === "percent"
    ? Math.round((Number(subtotal) || 0) * (promo.amount / 100))
    : promo.amount;

  return {
    valid: true,
    amount: Math.max(0, Math.min(amount, Number(subtotal) || 0)),
    code: normalizedCode,
    minimumOrder: promo.minimumOrder,
  };
}

export function parseBranchLocations(rawValue, settings = initialBusinessSettings) {
  const fallbackAddress = String(settings.address || "").trim() || "Address confirmed by PEM";
  const fallbackPhone = String(settings.phone || "").trim() || "Phone confirmed by PEM";
  const fallbackHours = String(settings.businessHoursText || "").trim() || "Hours confirmed by PEM";
  const parsed = String(rawValue || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, address, phone, hours, note] = line.split("|").map((part) => String(part || "").trim());
      if (!id || !label) {
        return null;
      }
      return {
        id: id.toLowerCase(),
        label,
        address: address || fallbackAddress,
        phone: phone || fallbackPhone,
        hours: hours || fallbackHours,
        note: note || `Service support from ${label}.`,
        rank: index,
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
      address: fallbackAddress,
      phone: fallbackPhone,
      hours: fallbackHours,
      note: `${settings.businessName} main branch.`,
      rank: 0,
    },
  ];
}

export function getRecordBranchId(record) {
  return String(record?.branchId || record?.customer?.branchId || "").trim().toLowerCase();
}

export function getRecordBranchName(record) {
  return (
    record?.branchName ||
    record?.customer?.branchName ||
    record?.customer?.branchLabel ||
    "Main branch"
  );
}

export function getOrderTimeline(order) {
  const currentStatus = String(order?.status || "").toLowerCase();
  const timeline = [
    { key: "received", label: "Received" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "out_for_delivery", label: "Out for delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentIndex = timeline.findIndex((step) => step.key === currentStatus);
  return timeline.map((step, index) => ({
    ...step,
    done: currentIndex >= index,
    active: step.key === currentStatus,
  }));
}

export function getTrackingStatusSummary(order, selectedZoneLabel = "") {
  const status = String(order?.status || "").toLowerCase();
  const zone = order?.customer?.deliveryZone || selectedZoneLabel || "your area";
  const branch = order?.customer?.branchName || "PEM branch";

  if (status === "awaiting_payment") {
    return `PEM is waiting for payment confirmation before ${branch} starts this order.`;
  }
  if (status === "received") {
    return `${branch} has received your order and will confirm the kitchen slot shortly.`;
  }
  if (status === "confirmed") {
    return `${branch} has confirmed your order and queued it for preparation.`;
  }
  if (status === "preparing") {
    return `Your meal is currently being prepared by ${branch}.`;
  }
  if (status === "ready") {
    return order?.customer?.fulfillmentMethod === "pickup"
      ? `Your meal is almost ready for pickup at ${branch}.`
      : `Your meal is packed and being handed over for delivery to ${zone}.`;
  }
  if (status === "out_for_delivery") {
    return `Your rider is on the way to ${zone}. Keep your phone nearby for quick coordination.`;
  }
  if (status === "delivered") {
    return "This order has been delivered. You can now leave a review and reorder it any time.";
  }
  if (status === "cancelled") {
    return "This order was cancelled. If you still need the meal, you can reorder it from the menu.";
  }

  return "Track this reference again in a few minutes if the status does not update immediately.";
}

export function menuItemMatchesSearch(item, rawSearch, branch, nowParts = getLagosNowParts()) {
  const normalizedSearch = String(rawSearch || "").trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  const normalizedBranch = `${branch?.label || ""} ${branch?.address || ""} ${branch?.note || ""}`.toLowerCase();
  const haystack = [
    item.name,
    item.description,
    item.badge,
    item.category,
    item.dietaryProfile,
    ...(item.dietaryTags || []),
    normalizedBranch,
  ]
    .join(" ")
    .toLowerCase();

  const tokens = normalizedSearch.split(/\s+/).filter(Boolean);

  return tokens.every((token) => {
    if (haystack.includes(token)) {
      return true;
    }
    if (["cheap", "budget", "affordable", "value"].includes(token)) {
      return item.price <= 4500;
    }
    if (["premium", "special", "signature"].includes(token)) {
      return item.price >= 5000 || /signature|premium|special/.test(haystack);
    }
    if (["drink", "drinks", "juice", "beverage", "water", "smoothie"].includes(token)) {
      return item.category.toLowerCase().includes("drink") || item.dietaryTags.some((tag) => /drink|cold|fresh|hydration/i.test(tag));
    }
    if (["soup", "swallow", "native", "local"].includes(token)) {
      return /soup|native|local|traditional/.test(haystack);
    }
    if (["rice", "jollof", "fried"].includes(token)) {
      return /rice|jollof|fried/.test(haystack);
    }
    if (["protein", "meat", "chicken", "beef", "goat"].includes(token)) {
      return /protein|meat|chicken|beef|goat/.test(haystack);
    }
    if (["spicy", "hot", "pepper"].includes(token)) {
      return Boolean(item.spicy) || /spicy|pepper/.test(haystack);
    }
    if (["mild", "soft", "gentle"].includes(token)) {
      return !item.spicy || /mild|soft|gentle/.test(haystack);
    }
    if (["available", "today", "now"].includes(token)) {
      return isMenuItemScheduledNow(item, nowParts) && !item.soldOut && !item.hidden;
    }
    return false;
  });
}

export function getBranchAvailabilityMeta(item, branch, nowParts = getLagosNowParts()) {
  const branchLabel = branch?.label || "PEM Branch";

  if (item.hidden) {
    return { label: "Hidden", tone: "muted" };
  }
  if (item.soldOut) {
    return { label: `Unavailable at ${branchLabel}`, tone: "warn" };
  }
  if (!isMenuItemScheduledNow(item, nowParts)) {
    return { label: `Next serving window from ${branchLabel}`, tone: "soft" };
  }
  if (Number(item.stockQuantity || 0) > 0 && Number(item.stockQuantity || 0) <= 4) {
    return { label: `${branchLabel} has limited portions`, tone: "warn" };
  }

  return { label: `Available from ${branchLabel} today`, tone: "ok" };
}

export function getSuggestedAddOns(cartItems, menuCatalog, nowParts = getLagosNowParts()) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return [];
  }

  const cartIds = new Set(cartItems.map((item) => item.id));
  const hasDrink = cartItems.some((item) => item.category.toLowerCase().includes("drink"));
  const hasSide = cartItems.some((item) => /side|dessert/i.test(item.category));
  const hasSoup = cartItems.some((item) => /soup/i.test(item.category));
  const hasRice = cartItems.some((item) => /rice|pasta/i.test(item.name + " " + item.category));

  return menuCatalog
    .filter((item) => !item.hidden && !item.soldOut && isMenuItemScheduledNow(item, nowParts) && !cartIds.has(item.id))
    .filter((item) => {
      if (!hasDrink && item.category.toLowerCase().includes("drink")) {
        return true;
      }
      if (!hasSide && /side|dessert/i.test(item.category)) {
        return true;
      }
      if (hasSoup && /swallow|side/i.test(item.category) && !hasSide) {
        return true;
      }
      if (hasRice && item.category.toLowerCase().includes("drink")) {
        return true;
      }
      return false;
    })
    .sort((left, right) => left.price - right.price)
    .slice(0, 3);
}

export function getRelatedMenuItems(item, menuCatalog, nowParts = getLagosNowParts()) {
  if (!item) {
    return [];
  }

  const normalizedCategory = String(item.category || "").toLowerCase();
  const sourceTags = Array.isArray(item.dietaryTags) ? item.dietaryTags.join(" ").toLowerCase() : "";

  return menuCatalog
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => !candidate.hidden && !candidate.soldOut && isMenuItemScheduledNow(candidate, nowParts))
    .filter((candidate) => {
      const candidateCategory = String(candidate.category || "").toLowerCase();
      const candidateTags = Array.isArray(candidate.dietaryTags) ? candidate.dietaryTags.join(" ").toLowerCase() : "";

      if (normalizedCategory.includes("soup")) {
        return /side|swallow|local special/.test(candidateCategory) || /swallow|side|mild/.test(candidateTags);
      }
      if (normalizedCategory.includes("rice") || normalizedCategory.includes("pasta")) {
        return candidateCategory.includes("drink") || /side|dessert/.test(candidateCategory);
      }
      if (normalizedCategory.includes("drink")) {
        return /dessert|side/.test(candidateCategory);
      }
      return candidateCategory === normalizedCategory || candidateTags.includes(sourceTags);
    })
    .sort((left, right) => left.price - right.price)
    .slice(0, 2);
}

export function getBadgeTone(badge) {
  const normalized = String(badge || "").trim().toLowerCase();
  if (/popular|best seller|favorite/.test(normalized)) {
    return "popular";
  }
  if (/hot|spicy|smoky/.test(normalized)) {
    return "hot";
  }
  if (/signature|premium|chef/.test(normalized)) {
    return "signature";
  }
  if (/local|traditional|native|eastern/.test(normalized)) {
    return "local";
  }
  return "neutral";
}

export function getDietaryTagTone(tag) {
  const normalized = String(tag || "").trim().toLowerCase();
  if (/spicy|hot|pepper/.test(normalized)) {
    return "spicy";
  }
  if (/mild|soft|zero spice/.test(normalized)) {
    return "mild";
  }
  if (/drink|cold|fresh|hydration/.test(normalized)) {
    return "drink";
  }
  if (/local|traditional|native|swallow|soup/.test(normalized)) {
    return "local";
  }
  if (/protein|beef|chicken|goat|meat/.test(normalized)) {
    return "protein";
  }
  return "neutral";
}

export function parseEtaMinutes(etaLabel) {
  const values = String(etaLabel || "").match(/\d+/g);
  if (!values || values.length === 0) {
    return null;
  }
  return Number(values[values.length - 1]) || null;
}

export function getEtaCountdown(order, deliveryZones) {
  if (!order?.createdAt || order?.customer?.fulfillmentMethod === "pickup") {
    return "";
  }

  const zone = deliveryZones.find((entry) => entry.label === order.customer?.deliveryZone);
  const etaMinutes = parseEtaMinutes(order.customer?.deliveryEta || zone?.eta);
  if (!etaMinutes) {
    return "";
  }

  const dueAt = new Date(order.createdAt).getTime() + etaMinutes * 60 * 1000;
  const remainingMs = dueAt - Date.now();

  if (remainingMs <= 0) {
    return "Delivery window is due now.";
  }

  const remainingMinutes = Math.ceil(remainingMs / 60000);
  if (remainingMinutes >= 60) {
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    return `${hours}h ${minutes}m remaining in the current delivery window.`;
  }

  return `${remainingMinutes} min remaining in the current delivery window.`;
}

export function formatScheduleLabel(item) {
  const days = normalizeScheduleDays(item.availableDays);
  const hasCustomDays = days.length < defaultMenuSchedule.availableDays.length;
  const hasTimeWindow = item.availableFrom && item.availableUntil;
  if (!hasCustomDays && !hasTimeWindow) {
    return "";
  }
  const dayLabel = hasCustomDays ? days.map((day) => day.toUpperCase()).join(", ") : "Daily";
  const timeLabel = hasTimeWindow ? `${item.availableFrom} - ${item.availableUntil}` : "All day";
  return `${dayLabel} - ${timeLabel}`;
}

export function buildWhatsAppConfirmationUrl(order, settings) {
  if (!order?.reference) {
    return "";
  }

  const branchName = order.customer?.branchName || settings.appName || "PEM";
  const lines = [
    `Hello ${branchName}, I am confirming my PEM order.`,
    "",
    `Reference: ${order.reference}`,
    `Name: ${order.customer?.customerName || "Customer"}`,
    `Branch: ${branchName}`,
    `Total: ${formatPrice(order.pricing?.total || 0)}`,
    `Status: ${String(order.status || "").replaceAll("_", " ")}`,
    `Payment: ${order.customer?.paymentMethod || "Not stated"}`,
  ];

  const targetNumber = getWhatsAppPhone(settings);
  return targetNumber ? `https://wa.me/${targetNumber}?text=${encodeURIComponent(lines.join("\n"))}` : "";
}

export function isCardPaymentMethod(method) {
  return [cardPaymentMethodLabel, "Paystack"].includes(String(method || "").trim());
}

export function resolvePageFromHash(hashValue = "") {
  const normalized = String(hashValue || "").replace(/^#/, "").split("?")[0].trim().toLowerCase();
  if (["menu", "track", "catering", "contact", "account", "admin"].includes(normalized)) {
    return normalized;
  }
  return "menu";
}

export function getQueryParamFromHash(hashValue = "", key = "") {
  const normalizedHash = String(hashValue || "").replace(/^#/, "");
  const queryStart = normalizedHash.indexOf("?");
  if (queryStart === -1) {
    return "";
  }

  const params = new URLSearchParams(normalizedHash.slice(queryStart + 1));
  return String(params.get(key) || "").trim();
}

export function buildClientDietaryFallback(needs, sourceItems = menuItems) {
  const normalizedNeeds = needs.trim().toLowerCase();
  const needsVegetarian = /\b(vegetarian|vegan|plant[- ]based|no meat|meatless)\b/.test(normalizedNeeds);
  const needsLowSpice = /\b(low spice|less spicy|mild|not spicy|no pepper)\b/.test(normalizedNeeds);
  const needsSpicy = !needsLowSpice && /\b(spicy|hot|pepper|pepper soup)\b/.test(normalizedNeeds);
  const wantsLocal = /\b(local|traditional|native|swallow|soup)\b/.test(normalizedNeeds);
  const wantsBudget = /\b(cheap|budget|affordable|low price)\b/.test(normalizedNeeds);
  const wantsProtein = /\b(high protein|protein|filling|gym)\b/.test(normalizedNeeds);
  const avoidsBeef = /\b(no beef|without beef|avoid beef)\b/.test(normalizedNeeds);

  if (needsVegetarian) {
    return {
      loading: false,
      error: "",
      summary: "PEM does not currently show a clearly vegetarian or vegan main meal in this menu.",
      caution:
        "For strict vegetarian, vegan, allergy, or medical needs, please contact PEM directly before ordering.",
      matches: [],
      mode: "smart-filter",
      degraded: true,
    };
  }

  const matches = sourceItems
    .map((item) => {
      const haystack = [
        item.name,
        item.category,
        item.badge,
        item.description,
        item.dietaryProfile,
        item.dietaryTags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      let score = item.rating;
      let reason = "matches your request more closely than other current menu options";

      if (needsLowSpice && item.spicy) score -= 4;
      if (needsLowSpice && !item.spicy) {
        score += 2;
        reason = "better for a milder spice preference";
      }
      if (needsSpicy && item.spicy) {
        score += 2;
        reason = "good fit for guests who want more heat";
      }
      if (wantsLocal && /\b(local|traditional|native|soup|classic)\b/.test(haystack)) {
        score += 2;
        reason = "closer to the traditional local dishes PEM offers";
      }
      if (wantsBudget && item.price <= 3900) {
        score += 1.5;
        reason = "one of the better-value options on the menu";
      }
      if (wantsProtein && /\b(chicken|beef|goat|protein|meat)\b/.test(haystack)) {
        score += 1.8;
        reason = "more filling for protein-focused orders";
      }
      if (avoidsBeef && /\bbeef\b/.test(haystack)) {
        score -= 4;
      }

      return {
        itemId: item.id,
        score,
        reason,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .filter((item) => item.score > 1)
    .map(({ itemId, reason }) => ({ itemId, reason }));

  return {
    loading: false,
    error: "",
    summary: matches.length
      ? "These dishes are the closest matches to the dietary preference you entered."
      : "PEM could not find a strong exact match from the current menu, but you can still browse or contact the team for a custom recommendation.",
    caution:
      "Dietary guidance is based on current menu descriptions and should be confirmed with PEM for strict needs.",
    matches,
    mode: "smart-filter",
    degraded: true,
  };
}
