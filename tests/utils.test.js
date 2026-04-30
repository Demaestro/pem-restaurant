import { describe, expect, it } from "vitest";
import {
  buildClientDietaryFallback,
  formatPrice,
  getBadgeTone,
  getDeliveryZone,
  getDietaryTagTone,
  getOrderTimeline,
  getPromoDiscount,
  getQueryParamFromHash,
  getTrackingStatusSummary,
  isCardPaymentMethod,
  isMenuItemScheduledNow,
  isScheduledWithinBusinessHours,
  isTimeWithinWindow,
  menuItemMatchesSearch,
  mergeMenuCatalog,
  normalizePhoneDigits,
  normalizeScheduleDays,
  parseEtaMinutes,
  parseHoursWindow,
  parsePromoCodes,
  parseTimeLabelToMinutes,
  parseTimeToMinutes,
  resolvePageFromHash,
  sanitizePhoneInput,
} from "../app/utils.js";
import { defaultDeliveryZones } from "../app/data.js";

describe("formatPrice", () => {
  it("formats numbers as Naira currency without decimals", () => {
    expect(formatPrice(1500)).toMatch(/1,500/);
    expect(formatPrice(0)).toMatch(/0/);
  });
});

describe("normalizePhoneDigits", () => {
  it("strips non-digits", () => {
    expect(normalizePhoneDigits("+234 (803) 334-5161")).toBe("2348033345161");
    expect(normalizePhoneDigits("")).toBe("");
  });
});

describe("sanitizePhoneInput", () => {
  it("keeps digits, +, spaces, parens, hyphens and bounds length", () => {
    expect(sanitizePhoneInput("+234 803 334 5161")).toBe("+234 803 334 5161");
    expect(sanitizePhoneInput("abc123def456")).toBe("123456");
    expect(sanitizePhoneInput("1".repeat(50))).toHaveLength(22);
  });
});

describe("parsePromoCodes + getPromoDiscount", () => {
  const text = "WELCOME10|percent|10|5000\nPARTY500|flat|500|7000";

  it("parses valid promo lines", () => {
    const codes = parsePromoCodes(text);
    expect(codes).toHaveLength(2);
    expect(codes[0]).toMatchObject({ code: "WELCOME10", type: "percent", amount: 10, minimumOrder: 5000 });
  });

  it("returns valid percent discount above the minimum", () => {
    const codes = parsePromoCodes(text);
    const discount = getPromoDiscount("welcome10", 6000, codes);
    expect(discount.valid).toBe(true);
    expect(discount.amount).toBe(600);
  });

  it("returns invalid below the minimum", () => {
    const codes = parsePromoCodes(text);
    const discount = getPromoDiscount("WELCOME10", 1000, codes);
    expect(discount.valid).toBe(false);
    expect(discount.minimumOrder).toBe(5000);
  });

  it("caps the discount at the subtotal", () => {
    const codes = parsePromoCodes("BIG|flat|9000|0");
    const discount = getPromoDiscount("BIG", 5000, codes);
    expect(discount.valid).toBe(true);
    expect(discount.amount).toBe(5000);
  });

  it("treats unknown codes as invalid", () => {
    expect(getPromoDiscount("NOPE", 9999, parsePromoCodes(text)).valid).toBe(false);
  });
});

describe("parseTimeToMinutes / parseTimeLabelToMinutes", () => {
  it("parses 24h HH:mm strings", () => {
    expect(parseTimeToMinutes("08:30")).toBe(8 * 60 + 30);
    expect(parseTimeToMinutes("23:59")).toBe(23 * 60 + 59);
    expect(parseTimeToMinutes("invalid")).toBeNull();
    expect(parseTimeToMinutes("25:00")).toBeNull();
  });

  it("parses AM/PM labels", () => {
    expect(parseTimeLabelToMinutes("8:00 AM")).toBe(480);
    expect(parseTimeLabelToMinutes("12:00 PM")).toBe(720);
    expect(parseTimeLabelToMinutes("12:00 AM")).toBe(0);
    expect(parseTimeLabelToMinutes("9:30 PM")).toBe(21 * 60 + 30);
    expect(parseTimeLabelToMinutes("not a time")).toBeNull();
  });
});

describe("parseHoursWindow + isTimeWithinWindow", () => {
  it("parses an open-close window", () => {
    expect(parseHoursWindow("8:00 AM - 9:00 PM")).toEqual({ openMinutes: 480, closeMinutes: 1260 });
  });

  it("matches times inside a normal window", () => {
    const window = parseHoursWindow("8:00 AM - 9:00 PM");
    expect(isTimeWithinWindow(600, window)).toBe(true);
    expect(isTimeWithinWindow(60, window)).toBe(false);
  });

  it("handles wrap-around windows (e.g. 10pm-2am)", () => {
    const window = parseHoursWindow("10:00 PM - 2:00 AM");
    expect(isTimeWithinWindow(23 * 60, window)).toBe(true);
    expect(isTimeWithinWindow(60, window)).toBe(true);
    expect(isTimeWithinWindow(12 * 60, window)).toBe(false);
  });
});

describe("isScheduledWithinBusinessHours", () => {
  it("returns true when scheduledFor is empty", () => {
    expect(isScheduledWithinBusinessHours("", "8:00 AM - 9:00 PM")).toBe(true);
  });

  it("returns false for invalid scheduledFor", () => {
    expect(isScheduledWithinBusinessHours("not-a-date", "8:00 AM - 9:00 PM")).toBe(false);
  });
});

describe("normalizeScheduleDays + isMenuItemScheduledNow", () => {
  it("normalizes mixed input to lower 3-letter day codes", () => {
    expect(normalizeScheduleDays(["MONDAY", "Tuesday"])).toEqual(["mon", "tue"]);
  });

  it("falls back to all days when input is empty", () => {
    expect(normalizeScheduleDays([])).toEqual(["sun", "mon", "tue", "wed", "thu", "fri", "sat"]);
  });

  it("rejects items not scheduled today", () => {
    const item = { availableDays: ["xxx"], availableFrom: "", availableUntil: "" };
    expect(isMenuItemScheduledNow(item, { day: "mon", minutes: 600 })).toBe(false);
  });

  it("accepts items inside their daily window", () => {
    const item = { availableDays: ["mon"], availableFrom: "08:00", availableUntil: "17:00" };
    expect(isMenuItemScheduledNow(item, { day: "mon", minutes: 600 })).toBe(true);
    expect(isMenuItemScheduledNow(item, { day: "mon", minutes: 60 })).toBe(false);
  });
});

describe("mergeMenuCatalog", () => {
  it("merges remote overrides into base items", () => {
    const base = [{ id: 1, name: "Jollof", price: 1000, dietaryTags: ["Rice"] }];
    const remote = [{ id: 1, price: 1200, soldOut: true }];
    const merged = mergeMenuCatalog(base, remote);
    expect(merged[0].price).toBe(1200);
    expect(merged[0].soldOut).toBe(true);
    expect(merged[0].name).toBe("Jollof");
  });
});

describe("menuItemMatchesSearch", () => {
  const item = {
    name: "Jollof Rice",
    description: "Smoky party jollof",
    badge: "Popular",
    category: "Rice",
    dietaryProfile: "rice based",
    dietaryTags: ["Rice", "Mild"],
    price: 3800,
    spicy: false,
    soldOut: false,
    hidden: false,
    availableDays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    availableFrom: "",
    availableUntil: "",
  };

  it("returns true on empty search", () => {
    expect(menuItemMatchesSearch(item, "", null)).toBe(true);
  });

  it("matches direct name tokens", () => {
    expect(menuItemMatchesSearch(item, "jollof", null)).toBe(true);
  });

  it("supports synonym tokens (cheap → price ≤ 4500)", () => {
    expect(menuItemMatchesSearch(item, "cheap", null)).toBe(true);
  });
});

describe("getDeliveryZone", () => {
  it("returns the matching zone or first fallback", () => {
    const zone = getDeliveryZone("wuse", defaultDeliveryZones);
    expect(zone.id).toBe("wuse");
    const fallback = getDeliveryZone("nonexistent", defaultDeliveryZones);
    expect(fallback.id).toBe(defaultDeliveryZones[0].id);
  });
});

describe("getOrderTimeline", () => {
  it("marks steps before current as done", () => {
    const timeline = getOrderTimeline({ status: "preparing" });
    const preparing = timeline.find((step) => step.key === "preparing");
    const received = timeline.find((step) => step.key === "received");
    const delivered = timeline.find((step) => step.key === "delivered");
    expect(received.done).toBe(true);
    expect(preparing.active).toBe(true);
    expect(delivered.done).toBe(false);
  });
});

describe("getTrackingStatusSummary", () => {
  it("produces a sentence per status", () => {
    expect(getTrackingStatusSummary({ status: "received", customer: { branchName: "X" } })).toMatch(/X/);
    expect(getTrackingStatusSummary({ status: "delivered" })).toMatch(/delivered/i);
  });
});

describe("parseEtaMinutes", () => {
  it("returns the last numeric value in a label", () => {
    expect(parseEtaMinutes("35 to 50 mins")).toBe(50);
    expect(parseEtaMinutes("Confirmed after order")).toBeNull();
  });
});

describe("isCardPaymentMethod", () => {
  it("matches both card-method labels", () => {
    expect(isCardPaymentMethod("Pay with card")).toBe(true);
    expect(isCardPaymentMethod("Paystack")).toBe(true);
    expect(isCardPaymentMethod("Bank transfer")).toBe(false);
  });
});

describe("resolvePageFromHash + getQueryParamFromHash", () => {
  it("returns known page or menu fallback", () => {
    expect(resolvePageFromHash("#account")).toBe("account");
    expect(resolvePageFromHash("")).toBe("menu");
    expect(resolvePageFromHash("#weird")).toBe("menu");
  });

  it("extracts query params from hash", () => {
    expect(getQueryParamFromHash("#account?ref=abc", "ref")).toBe("abc");
    expect(getQueryParamFromHash("#account", "ref")).toBe("");
  });
});

describe("getBadgeTone + getDietaryTagTone", () => {
  it("returns the right tone for badges", () => {
    expect(getBadgeTone("Best Seller")).toBe("popular");
    expect(getBadgeTone("Hot")).toBe("hot");
    expect(getBadgeTone("Signature")).toBe("signature");
    expect(getBadgeTone("plain")).toBe("neutral");
  });

  it("returns the right tone for dietary tags", () => {
    expect(getDietaryTagTone("Spicy")).toBe("spicy");
    expect(getDietaryTagTone("Drink")).toBe("drink");
    expect(getDietaryTagTone("Local")).toBe("local");
    expect(getDietaryTagTone("Mild")).toBe("mild");
  });
});

describe("buildClientDietaryFallback", () => {
  it("returns a vegetarian disclaimer", () => {
    const result = buildClientDietaryFallback("I want vegetarian options");
    expect(result.matches).toEqual([]);
    expect(result.summary).toMatch(/vegetarian/i);
  });

  it("returns ranked matches for a budget request", () => {
    const result = buildClientDietaryFallback("budget mild");
    expect(Array.isArray(result.matches)).toBe(true);
  });
});
