import { useEffect, useMemo, useState } from "react";
import logo from "./logo.jpg.jpeg";
import jollofImage from "./Jollof Rice & Grilled Chicken.jpg";
import friedRiceImage from "./Fried Rice & Beef Stew.jpg";
import egusiImage from "./Egusi Soup & Pounded Yam.jpg";
import pepperSoupImage from "./Pepper Soup (Goat Meat).jpg";
import ogbonoImage from "./Ogbono Soup & Eba.jpg";
import okroImage from "./Delicious Okro soup.jpg";
import ukwaImage from "./Delicious Ukwa.jpg";
import spaghettiImage from "./Spaghetti Bolognese.jpg";
import abachaImage from "./Abacha.jpg";
import afangImage from "./Afang Soup.jpg";
import asunImage from "./Asun.jpeg";
import coleslawImage from "./Coleslaw.jpg";
import cokeImage from "./coke.webp";
import edikaikongImage from "./Edikaikong Soup.webp";
import fantaImage from "./Fanta.jpg";
import hollandiaImage from "./Hollandia.jpg";
import moiMoiImage from "./Moimoi.jpg";
import nkwobiImage from "./Nkwobi.webp";
import ohaImage from "./Oha soup.jpg";
import parfaitImage from "./Parfaits.jpg";
import plantainImage from "./Plantain.jpg";
import beansPlantainImage from "./Porridge beans and plantain.jpg";
import smallChopsImage from "./Small chops.webp";
import smoothieImage from "./Smoothie.jpg";
import spriteImage from "./Spirite.webp";
import waterImage from "./Water.jpg";
import whiteRiceSauceImage from "./White rice and Sauce.jpeg";
import whiteSoupImage from "./White Soup (Ofe Nsala).jpg";

const menuItems = [
  {
    id: 1,
    name: "Jollof Rice & Grilled Chicken",
    category: "Rice",
    price: 3800,
    rating: 4.9,
    reviews: 241,
    image: jollofImage,
    spicy: false,
    badge: "Popular",
    description: "Classic Nigerian party jollof with grilled chicken and sweet plantain.",
    dietaryTags: ["Chicken", "Rice-based", "Mild"],
    dietaryProfile: "Contains grilled chicken and rice. Mild heat and a balanced, filling profile.",
  },
  {
    id: 2,
    name: "Fried Rice & Beef Stew",
    category: "Rice",
    price: 4000,
    rating: 4.8,
    reviews: 188,
    image: friedRiceImage,
    spicy: false,
    badge: "Signature",
    description: "Colorful fried rice served with rich beef stew for a hearty PEM favorite.",
    dietaryTags: ["Beef", "Rice-based", "Mild"],
    dietaryProfile: "Contains beef stew and fried rice. Hearty and filling, but not suitable for beef-free diets.",
  },
  {
    id: 3,
    name: "Egusi Soup & Pounded Yam",
    category: "Soup",
    price: 4500,
    rating: 4.9,
    reviews: 214,
    image: egusiImage,
    spicy: false,
    badge: "Best Seller",
    description: "Rich egusi soup with assorted protein and soft pounded yam.",
    dietaryTags: ["Soup", "Swallow", "Rich"],
    dietaryProfile: "Traditional soup meal with assorted protein and pounded yam. Rich and satisfying.",
  },
  {
    id: 4,
    name: "Pepper Soup (Goat Meat)",
    category: "Soup",
    price: 4300,
    rating: 4.8,
    reviews: 167,
    image: pepperSoupImage,
    spicy: true,
    badge: "Hot",
    description: "Aromatic pepper soup with goat meat, local spices, and deep warming flavor.",
    dietaryTags: ["Goat meat", "Spicy", "Soup"],
    dietaryProfile: "Spicy goat meat pepper soup. The closest fit on this menu for guests asking for lower-carb soup options.",
  },
  {
    id: 5,
    name: "Ogbono Soup & Eba",
    category: "Soup",
    price: 3900,
    rating: 4.7,
    reviews: 151,
    image: ogbonoImage,
    spicy: false,
    badge: "Classic",
    description: "Smooth ogbono soup paired with fresh eba and a balanced local taste.",
    dietaryTags: ["Soup", "Swallow", "Local"],
    dietaryProfile: "Traditional ogbono soup served with eba. Mild compared with the hotter soups on the menu.",
  },
  {
    id: 6,
    name: "Delicious Okro Soup",
    category: "Soup",
    price: 4100,
    rating: 4.8,
    reviews: 132,
    image: okroImage,
    spicy: true,
    badge: "Local",
    description: "Fresh okro soup with a rich blend of stock, spice, and satisfying texture.",
    dietaryTags: ["Soup", "Spicy", "Local"],
    dietaryProfile: "Spicier local soup option with rich texture and a more traditional feel.",
  },
  {
    id: 7,
    name: "Delicious Ukwa",
    category: "Local Special",
    price: 3600,
    rating: 4.6,
    reviews: 98,
    image: ukwaImage,
    spicy: false,
    badge: "Traditional",
    description: "African breadfruit prepared in a comforting local style for a distinct PEM meal.",
    dietaryTags: ["Traditional", "Local special", "Mild"],
    dietaryProfile: "Traditional African breadfruit dish with a comforting local style and mild flavor profile.",
  },
  {
    id: 8,
    name: "Spaghetti Bolognese",
    category: "Pasta",
    price: 3500,
    rating: 4.5,
    reviews: 89,
    image: spaghettiImage,
    spicy: false,
    badge: "Continental",
    description: "Savory spaghetti in a rich tomato and meat sauce for guests who want variety.",
    dietaryTags: ["Pasta", "Meat sauce", "Mild"],
    dietaryProfile: "Pasta dish with meat sauce. Better for guests who want a softer, non-spicy continental option.",
  },
  {
    id: 9,
    name: "Abacha",
    category: "Local Special",
    price: 3200,
    rating: 4.7,
    reviews: 84,
    image: abachaImage,
    spicy: true,
    badge: "Eastern Favorite",
    description: "Traditional African salad with a lively local taste and classic market-style flavor.",
    dietaryTags: ["Traditional", "Local", "Spicy"],
    dietaryProfile: "A local specialty with a stronger traditional profile. Good for guests asking for native dishes.",
  },
  {
    id: 10,
    name: "Afang Soup",
    category: "Soup",
    price: 4600,
    rating: 4.9,
    reviews: 176,
    image: afangImage,
    spicy: false,
    badge: "Premium Local",
    description: "Rich afang soup with deep flavor, hearty texture, and a polished event-ready finish.",
    dietaryTags: ["Soup", "Local", "Rich"],
    dietaryProfile: "Rich local soup option with a traditional, filling profile for guests who want premium native dishes.",
  },
  {
    id: 11,
    name: "Asun",
    category: "Grills",
    price: 4200,
    rating: 4.7,
    reviews: 92,
    image: asunImage,
    spicy: true,
    badge: "Smoky",
    description: "Spicy grilled asun with a bold smoky finish for guests who want something lively.",
    dietaryTags: ["Grill", "Spicy", "Protein"],
    dietaryProfile: "A spicy grilled protein option suited to guests who want bold flavor and a meat-focused choice.",
  },
  {
    id: 12,
    name: "Coleslaw",
    category: "Sides",
    price: 1500,
    rating: 4.4,
    reviews: 41,
    image: coleslawImage,
    spicy: false,
    badge: "Fresh Side",
    description: "Creamy fresh coleslaw that pairs well with rice dishes, grills, and party packs.",
    dietaryTags: ["Side", "Fresh", "Mild"],
    dietaryProfile: "A mild side dish that helps balance heavier or spicier meals.",
  },
  {
    id: 13,
    name: "Moi Moi",
    category: "Sides",
    price: 1800,
    rating: 4.6,
    reviews: 67,
    image: moiMoiImage,
    spicy: false,
    badge: "Protein Side",
    description: "Soft steamed bean pudding that works well as a side or light meal addition.",
    dietaryTags: ["Beans", "Side", "Mild"],
    dietaryProfile: "A lighter bean-based side that can support guests asking for something softer and less spicy.",
  },
  {
    id: 14,
    name: "Oha Soup",
    category: "Soup",
    price: 4400,
    rating: 4.8,
    reviews: 103,
    image: ohaImage,
    spicy: false,
    badge: "Native Choice",
    description: "A warm, comforting oha soup with a beautiful home-style local finish.",
    dietaryTags: ["Soup", "Traditional", "Local"],
    dietaryProfile: "Milder native soup option with a home-style feel and strong local appeal.",
  },
  {
    id: 15,
    name: "Parfait",
    category: "Drinks & Desserts",
    price: 2500,
    rating: 4.5,
    reviews: 38,
    image: parfaitImage,
    spicy: false,
    badge: "Cool Treat",
    description: "Layered parfait for guests who want a chilled, sweet add-on to their order.",
    dietaryTags: ["Dessert", "Cool", "Sweet"],
    dietaryProfile: "A dessert-style add-on rather than a main meal. Good for lighter, chilled indulgence.",
  },
  {
    id: 16,
    name: "Plantain",
    category: "Sides",
    price: 1400,
    rating: 4.7,
    reviews: 59,
    image: plantainImage,
    spicy: false,
    badge: "Side Favorite",
    description: "Golden fried plantain that pairs easily with rice, soup, and grilled meals.",
    dietaryTags: ["Side", "Sweet", "Mild"],
    dietaryProfile: "A mild popular side that complements many PEM dishes.",
  },
  {
    id: 17,
    name: "Porridge Beans and Plantain",
    category: "Local Special",
    price: 3300,
    rating: 4.6,
    reviews: 73,
    image: beansPlantainImage,
    spicy: false,
    badge: "Comfort Meal",
    description: "Comforting beans porridge served with sweet plantain for a filling local option.",
    dietaryTags: ["Beans", "Local", "Mild"],
    dietaryProfile: "A gentler local comfort meal and one of the softer non-spicy options on the menu.",
  },
  {
    id: 18,
    name: "White Rice and Sauce",
    category: "Rice",
    price: 3400,
    rating: 4.5,
    reviews: 64,
    image: whiteRiceSauceImage,
    spicy: false,
    badge: "Simple Choice",
    description: "Plain white rice served with rich sauce for guests who want a simpler plate.",
    dietaryTags: ["Rice-based", "Mild", "Simple"],
    dietaryProfile: "A simpler rice dish for guests who want a less intense flavor profile.",
  },
  {
    id: 19,
    name: "White Soup (Ofe Nsala)",
    category: "Soup",
    price: 4700,
    rating: 4.8,
    reviews: 88,
    image: whiteSoupImage,
    spicy: false,
    badge: "Chef's Pick",
    description: "Delicate white soup with a refined native flavor and rich event-style presentation.",
    dietaryTags: ["Soup", "Native", "Mild"],
    dietaryProfile: "A polished native soup option with milder flavor than the hotter soup choices.",
  },
  {
    id: 20,
    name: "Hollandia",
    category: "Drinks",
    price: 1200,
    rating: 4.4,
    reviews: 22,
    image: hollandiaImage,
    spicy: false,
    badge: "Chilled Drink",
    description: "Cold dairy drink for guests who want something smooth and refreshing with their meal.",
    dietaryTags: ["Drink", "Cold", "Mild"],
    dietaryProfile: "A chilled drink option that pairs well with spicy or heavy meals.",
  },
  {
    id: 21,
    name: "Smoothie",
    category: "Drinks",
    price: 2200,
    rating: 4.6,
    reviews: 31,
    image: smoothieImage,
    spicy: false,
    badge: "Fresh Blend",
    description: "Fresh smoothie with a cooler, lighter feel for customers who want a premium drink.",
    dietaryTags: ["Drink", "Cold", "Fresh"],
    dietaryProfile: "A lighter premium drink option for customers who want something refreshing.",
  },
  {
    id: 22,
    name: "Water",
    category: "Drinks",
    price: 500,
    rating: 4.8,
    reviews: 18,
    image: waterImage,
    spicy: false,
    badge: "Essential",
    description: "Simple bottled water to complete any PEM order.",
    dietaryTags: ["Drink", "Hydration", "Zero spice"],
    dietaryProfile: "The simplest drink choice for every customer.",
  },
  {
    id: 23,
    name: "Edikaikong Soup",
    category: "Soup",
    price: 4800,
    rating: 4.8,
    reviews: 54,
    image: edikaikongImage,
    spicy: false,
    badge: "Deep Local",
    description: "Rich edikaikong soup prepared with leafy depth, local flavour, and a fuller native finish.",
    dietaryTags: ["Soup", "Local", "Rich"],
    dietaryProfile: "A rich native soup with a deep local profile for customers who want another premium traditional option.",
  },
  {
    id: 24,
    name: "Nkwobi",
    category: "Local Special",
    price: 4500,
    rating: 4.7,
    reviews: 39,
    image: nkwobiImage,
    spicy: true,
    badge: "Spicy Local",
    description: "Bold nkwobi with a spicy palm-oil finish for customers who want a strong traditional bite.",
    dietaryTags: ["Local", "Spicy", "Protein"],
    dietaryProfile: "A bold native delicacy with a spicy profile, better suited to customers who enjoy stronger traditional flavours.",
  },
  {
    id: 25,
    name: "Small Chops",
    category: "Starters",
    price: 3000,
    rating: 4.6,
    reviews: 47,
    image: smallChopsImage,
    spicy: false,
    badge: "Party Tray",
    description: "Assorted small chops for quick snacking, events, and add-on party orders.",
    dietaryTags: ["Starter", "Party", "Shareable"],
    dietaryProfile: "A shareable starter pack that works well for events, office orders, and quick add-ons.",
  },
  {
    id: 26,
    name: "Fanta",
    category: "Drinks",
    price: 700,
    rating: 4.5,
    reviews: 21,
    image: fantaImage,
    spicy: false,
    badge: "Cold Drink",
    description: "Chilled orange soda for customers who want a familiar sweet drink with their meal.",
    dietaryTags: ["Drink", "Cold", "Sweet"],
    dietaryProfile: "A classic soft drink choice that pairs well with rice meals, grills, and party trays.",
  },
  {
    id: 27,
    name: "Coke",
    category: "Drinks",
    price: 700,
    rating: 4.6,
    reviews: 28,
    image: cokeImage,
    spicy: false,
    badge: "Classic Soda",
    description: "Cold Coke served as an easy everyday drink option for lunch, dinner, or event orders.",
    dietaryTags: ["Drink", "Cold", "Classic"],
    dietaryProfile: "A dependable soft drink option for customers who want something simple and familiar.",
  },
  {
    id: 28,
    name: "Sprite",
    category: "Drinks",
    price: 700,
    rating: 4.4,
    reviews: 17,
    image: spriteImage,
    spicy: false,
    badge: "Lemon-Lime",
    description: "Refreshing lemon-lime soda that works nicely with soups, local dishes, and spicy meals.",
    dietaryTags: ["Drink", "Cold", "Refreshing"],
    dietaryProfile: "A crisp soft drink option with a lighter feel for spicy meals and native dishes.",
  },
];

const cateringPackages = [
  {
    title: "Office Catering",
    subtitle: "Reliable food service for meetings and staff events",
    details: "Custom trays, buffet setup, and timed delivery for teams of 20 to 300 guests.",
  },
  {
    title: "Weddings & Celebrations",
    subtitle: "Elegant local menus for your big day",
    details: "Soup stations, rice combinations, small chops, desserts, and serving staff support.",
  },
  {
    title: "Bulk Party Packs",
    subtitle: "Fast order fulfillment for birthdays and naming ceremonies",
    details: "Packaged meal boxes with clear portions, labels, and add-on drinks for guests.",
  },
];

const categories = ["All", ...new Set(menuItems.map((item) => item.category))];
const defaultMenuSchedule = {
  availableFrom: "",
  availableUntil: "",
  availableDays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
};
const menuSections = [
  { id: "all", label: "Everything", categories },
  { id: "mains", label: "Main Meals", categories: ["All", "Rice", "Pasta", "Grills", "Local Special"] },
  { id: "soups", label: "Soups", categories: ["All", "Soup"] },
  { id: "sides", label: "Sides", categories: ["All", "Sides", "Starters"] },
  { id: "drinks", label: "Drinks & Desserts", categories: ["All", "Drinks", "Drinks & Desserts"] },
];
const drinkCount = menuItems.filter((item) => item.category.includes("Drink")).length;
const localDishCount = menuItems.filter(
  (item) => item.category === "Soup" || item.category === "Local Special",
).length;
const dietaryPrompts = [
  "I want something less spicy.",
  "Show me high-protein meals.",
  "I do not want beef.",
  "Recommend more traditional local dishes.",
];

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const defaultDeliveryZones = [
  { id: "gwarinpa", label: "Gwarinpa / Life Camp", fee: 1200, eta: "35 to 50 mins" },
  { id: "wuse", label: "Wuse / Utako / Jabi", fee: 1800, eta: "45 to 60 mins" },
  { id: "maitama", label: "Maitama / Asokoro / Guzape", fee: 2200, eta: "50 to 70 mins" },
  { id: "lugbe", label: "Lugbe / Airport Road", fee: 2500, eta: "60 to 85 mins" },
  { id: "owerri", label: "Owerri, Imo State", fee: 4500, eta: "Next-day confirmation with PEM" },
  { id: "custom", label: "Other area", fee: 3000, eta: "Confirmed after order" },
];

const comboBundles = [
  {
    id: "party-rice",
    title: "Party Rice Combo",
    itemIds: [1, 13, 22],
    description: "Jollof rice, moi moi, and water for a quick balanced order.",
  },
  {
    id: "native-soup",
    title: "Native Soup Combo",
    itemIds: [14, 16, 20],
    description: "Oha soup with plantain and a chilled drink for a fuller local plate.",
  },
  {
    id: "office-lunch",
    title: "Office Lunch Combo",
    itemIds: [18, 12, 21],
    description: "White rice and sauce with coleslaw and smoothie for a lighter lunch set.",
  },
];

const businessHours = [
  { day: "Sunday", open: 10, close: 20 },
  { day: "Monday", open: 8, close: 21 },
  { day: "Tuesday", open: 8, close: 21 },
  { day: "Wednesday", open: 8, close: 21 },
  { day: "Thursday", open: 8, close: 21 },
  { day: "Friday", open: 8, close: 22 },
  { day: "Saturday", open: 9, close: 22 },
];

const initialCheckout = {
  customerName: "",
  phone: "",
  email: "",
  orderType: "self",
  recipientEmail: "",
  giftMessage: "",
  address: "",
  addressMode: "profile",
  landmark: "",
  fulfillmentMethod: "delivery",
  scheduledFor: "",
  deliveryZone: "gwarinpa",
  paymentMethod: "Pay on arrival",
  paymentReference: "",
  promoCode: "",
};

const cardPaymentMethodLabel = "Pay with card";

const checkoutPaymentOptions = [
  { label: "Pay on arrival", icon: "ARR" },
  { label: cardPaymentMethodLabel, icon: "CARD" },
  { label: "Bank transfer", icon: "TRF" },
];

function isCardPaymentMethod(method) {
  return [cardPaymentMethodLabel, "Paystack"].includes(String(method || "").trim());
}

const initialTrackingState = {
  loading: false,
  error: "",
  order: null,
};

const initialDeliveryZoneAdminState = {
  loading: false,
  saving: false,
  error: "",
  success: "",
  zones: defaultDeliveryZones,
};
const initialMenuAdminState = {
  loading: false,
  saving: false,
  error: "",
  success: "",
  items: menuItems.map((item) => ({
    ...defaultMenuSchedule,
    ...item,
    soldOut: false,
    hidden: false,
    stockQuantity: 12,
  })),
};
const menuVisibilityOptions = [
  { value: "available", label: "Available" },
  { value: "sold-out", label: "Sold out" },
  { value: "hidden", label: "Hidden" },
];

const initialContact = {
  name: "",
  phone: "",
  message: "",
};

const initialCatering = {
  name: "",
  phone: "",
  eventDate: "",
  guestCount: "",
  eventType: "",
  details: "",
};

const initialReservation = {
  name: "",
  phone: "",
  date: "",
  time: "",
  guests: "",
  notes: "",
};

const initialReviewForm = {
  rating: "5",
  comment: "",
};

const initialAdminState = {
  loading: false,
  error: "",
  data: {
    orders: [],
    contacts: [],
    catering: [],
    reservations: [],
    reviews: [],
  },
};

const initialDietaryState = {
  loading: false,
  error: "",
  summary: "",
  caution: "",
  matches: [],
  mode: "",
  degraded: false,
};
const initialPromoValidationState = {
  loading: false,
  valid: false,
  amount: 0,
  code: "",
  minimumOrder: 0,
  subtotal: 0,
  error: "",
};

const initialBusinessSettings = {
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
  promoCodesText: "",
  staffAdminsText: "",
  branchLocationsText:
    "owerri-central|PEM Owerri Central|Wetheral Road, Owerri|0803 334 5161|8:00 AM - 9:00 PM|Fast city-center delivery, pickup, and daily meals.\nnew-owerri|PEM New Owerri|New Owerri, Imo State|0803 334 5161|8:30 AM - 9:30 PM|Best for estate drop-offs and premium catering dispatch.\nikenegbu|PEM Ikenegbu|Ikenegbu Layout, Owerri|0803 334 5161|8:00 AM - 8:30 PM|Quick office lunch, table bookings, and evening pickup.",
  receiptFooter: "Thank you for choosing PEM. For urgent support, please contact the team directly.",
};

const initialSettingsAdminState = {
  loading: false,
  saving: false,
  error: "",
  success: "",
  settings: initialBusinessSettings,
};

const initialAccountUser = {
  email: "",
  fullName: "",
  phone: "",
  favoriteItemIds: [],
  savedAddresses: [],
  orderReferences: [],
  notifications: [],
  loyaltyPoints: 0,
  loyaltyTier: "bronze",
  referralCode: "",
  referredBy: "",
  referralCredits: 0,
  createdAt: "",
};

const initialAccountGifts = {
  received: [],
  sent: [],
};

const initialGiftActionState = {
  loadingRef: "",
  error: "",
  success: "",
  openRef: "",
  address: "",
  landmark: "",
  phone: "",
};

const initialAdminSession = {
  username: "",
  label: "",
  branchId: "",
  isOwner: false,
};

const initialAccountForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  referralCode: "",
};

const initialLoginForm = {
  email: "",
  password: "",
};

const initialForgotPasswordForm = {
  email: "",
  phone: "",
};

const orderStatuses = ["all", "awaiting_payment", "received", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
const contactStatuses = ["new", "handled"];
const cateringStatuses = ["new", "contacted", "booked"];
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const CACHE_TTL = {
  account: 10 * 60 * 1000,
  deliveryZones: 30 * 60 * 1000,
  menu: 10 * 60 * 1000,
  settings: 15 * 60 * 1000,
  admin: 2 * 60 * 1000,
  tracking: 10 * 60 * 1000,
};
const ORDER_ITEM_LIMIT = 10;

function apiUrl(pathname) {
  return apiBaseUrl ? `${apiBaseUrl}${pathname}` : pathname;
}

function readCachedJson(key, fallback = null, maxAgeMs = Number.POSITIVE_INFINITY) {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    const parsed = JSON.parse(rawValue);
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Object.prototype.hasOwnProperty.call(parsed, "savedAt") &&
      Object.prototype.hasOwnProperty.call(parsed, "value")
    ) {
      if (
        Number.isFinite(maxAgeMs) &&
        maxAgeMs !== Number.POSITIVE_INFINITY &&
        Date.now() - Number(parsed.savedAt || 0) > maxAgeMs
      ) {
        window.localStorage.removeItem(key);
        return fallback;
      }
      return parsed.value;
    }

    if (Number.isFinite(maxAgeMs) && maxAgeMs !== Number.POSITIVE_INFINITY) {
      window.localStorage.removeItem(key);
      return fallback;
    }

    return parsed;
  } catch {
    return fallback;
  }
}

function writeCachedJson(key, value) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        value,
      }),
    );
  } catch {
    // Ignore cache write failures.
  }
}

function formatPrice(value) {
  return currency.format(value);
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDeliveryZone(zoneId, zones = defaultDeliveryZones) {
  const sourceZones = Array.isArray(zones) && zones.length > 0 ? zones : defaultDeliveryZones;
  return sourceZones.find((zone) => zone.id === zoneId) || sourceZones[0];
}

function formatMinutesAsTime(totalMinutes) {
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

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:00 ${suffix}`;
}

function normalizeScheduleDays(days) {
  const normalized = Array.isArray(days)
    ? days.map((day) => String(day || "").trim().slice(0, 3).toLowerCase()).filter(Boolean)
    : [];
  return normalized.length > 0 ? [...new Set(normalized)] : [...defaultMenuSchedule.availableDays];
}

function parseTimeToMinutes(value) {
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

function getLagosNowParts() {
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

function parseTimeLabelToMinutes(value) {
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

function parseHoursWindow(hoursText) {
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

function isTimeWithinWindow(targetMinutes, window) {
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

function isScheduledWithinBusinessHours(scheduledFor, hoursText) {
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

function getWhatsAppPhone(settings) {
  return String(settings?.whatsappPhone || initialBusinessSettings.whatsappPhone || "").replace(/\D/g, "");
}

function isMenuItemScheduledNow(item, now = getLagosNowParts()) {
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

function formatScheduleLabelLegacy(item) {
  const days = normalizeScheduleDays(item.availableDays);
  const hasCustomDays = days.length < defaultMenuSchedule.availableDays.length;
  const hasTimeWindow = item.availableFrom && item.availableUntil;
  if (!hasCustomDays && !hasTimeWindow) {
    return "";
  }
  const dayLabel = hasCustomDays ? days.map((day) => day.toUpperCase()).join(", ") : "Daily";
  const timeLabel = hasTimeWindow ? `${item.availableFrom} - ${item.availableUntil}` : "All day";
  return `${dayLabel} · ${timeLabel}`;
}

function getBusinessStatus(hoursText, now = getLagosNowParts()) {
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

function mergeMenuCatalog(baseItems, remoteItems) {
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

const branchCoordinateFallbacks = {
  "owerri-central": { latitude: 5.4856, longitude: 7.0355 },
  "new-owerri": { latitude: 5.5093, longitude: 7.0384 },
  ikenegbu: { latitude: 5.4761, longitude: 7.0286 },
};

function parseCoordinate(value, fallback = null) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function parseBranchLocations(rawValue, settings = initialBusinessSettings) {
  const fallbackAddress = String(settings.address || "").trim() || "Address confirmed by PEM";
  const fallbackPhone = String(settings.phone || "").trim() || "Phone confirmed by PEM";
  const fallbackHours = String(settings.businessHoursText || "").trim() || "Hours confirmed by PEM";
  const parsed = String(rawValue || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, address, phone, hours, note, latitudeValue, longitudeValue] = line
        .split("|")
        .map((part) => String(part || "").trim());
      if (!id || !label) {
        return null;
      }
      const branchId = id.toLowerCase();
      const fallbackCoordinates = branchCoordinateFallbacks[branchId] || {};
      return {
        id: branchId,
        label,
        address: address || fallbackAddress,
        phone: phone || fallbackPhone,
        hours: hours || fallbackHours,
        note: note || `Service support from ${label}.`,
        latitude: parseCoordinate(latitudeValue, fallbackCoordinates.latitude ?? null),
        longitude: parseCoordinate(longitudeValue, fallbackCoordinates.longitude ?? null),
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
        latitude: null,
        longitude: null,
        rank: 0,
      },
  ];
}

function calculateDistanceInKm(firstPoint, secondPoint) {
  if (!firstPoint || !secondPoint) {
    return Number.POSITIVE_INFINITY;
  }
  const toRadians = (value) => (Number(value) * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(secondPoint.latitude - firstPoint.latitude);
  const deltaLng = toRadians(secondPoint.longitude - firstPoint.longitude);
  const firstLat = toRadians(firstPoint.latitude);
  const secondLat = toRadians(secondPoint.latitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function getClosestBranch(branches, location) {
  const branchWithDistance = (Array.isArray(branches) ? branches : [])
    .filter((branch) => Number.isFinite(branch.latitude) && Number.isFinite(branch.longitude))
    .map((branch) => ({
      branch,
      distanceKm: calculateDistanceInKm(
        { latitude: Number(location?.latitude), longitude: Number(location?.longitude) },
        { latitude: Number(branch.latitude), longitude: Number(branch.longitude) },
      ),
    }))
    .filter((entry) => Number.isFinite(entry.distanceKm))
    .sort((left, right) => left.distanceKm - right.distanceKm);

  return branchWithDistance[0] || null;
}

function getRecordBranchId(record) {
  return String(record?.branchId || record?.customer?.branchId || "").trim().toLowerCase();
}

function getRecordBranchName(record) {
  return (
    record?.branchName ||
    record?.customer?.branchName ||
    record?.customer?.branchLabel ||
    "Main branch"
  );
}

function getOrderTimeline(order) {
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

function getTrackingStatusSummary(order, selectedZoneLabel = "") {
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

function menuItemMatchesSearch(item, rawSearch, branch, nowParts = getLagosNowParts()) {
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

function getBranchAvailabilityMeta(item, branch, nowParts = getLagosNowParts()) {
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

function getSuggestedAddOns(cartItems, menuCatalog, nowParts = getLagosNowParts()) {
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

function getRelatedMenuItems(item, menuCatalog, nowParts = getLagosNowParts()) {
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

function getBadgeTone(badge) {
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

function getDietaryTagTone(tag) {
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

function parseEtaMinutes(etaLabel) {
  const values = String(etaLabel || "").match(/\d+/g);
  if (!values || values.length === 0) {
    return null;
  }
  return Number(values[values.length - 1]) || null;
}

function getEtaCountdown(order, deliveryZones) {
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

function buildWhatsAppConfirmationUrlLegacy(order, settings, fallbackNumber) {
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

  const targetNumber = getWhatsAppPhone(settings) || String(fallbackNumber || "").replace(/\D/g, "");
  return targetNumber ? `https://wa.me/${targetNumber}?text=${encodeURIComponent(lines.join("\n"))}` : "";
}

function formatScheduleLabel(item) {
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

function buildWhatsAppConfirmationUrl(order, settings) {
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

function StarRatingInputLegacy({ value, onChange }) {
  const numericValue = Number(value) || 0;

  return (
    <div className="star-input" role="radiogroup" aria-label="Select a review rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= numericValue ? "star-input__button is-active" : "star-input__button"}
          aria-checked={star === numericValue}
          role="radio"
          onClick={() => onChange(String(star))}
        >
          {"\u2605"}
        </button>
      ))}
      <span className="star-input__label">{numericValue}/5</span>
    </div>
  );
}

function resolvePageFromHash(hashValue = "") {
  const normalized = String(hashValue || "").replace(/^#/, "").split("?")[0].trim().toLowerCase();
  if (["menu", "track", "catering", "contact", "account", "admin"].includes(normalized)) {
    return normalized;
  }
  return "menu";
}

function getQueryParamFromHash(hashValue = "", key = "") {
  const normalizedHash = String(hashValue || "").replace(/^#/, "");
  const queryStart = normalizedHash.indexOf("?");
  if (queryStart === -1) {
    return "";
  }

  const params = new URLSearchParams(normalizedHash.slice(queryStart + 1));
  return String(params.get(key) || "").trim();
}

function buildClientDietaryFallback(needs, sourceItems = menuItems) {
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

async function postJson(url, payload, headers = {}) {
  return requestJson(url, {
    method: "POST",
    payload,
    headers,
  });
}

async function requestJson(url, { method = "GET", payload, headers = {}, retryOnTimeout = method === "GET", attempt = 1 } = {}) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("You're offline right now. Reconnect and try again.");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(apiUrl(url), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      if (retryOnTimeout && attempt < 2) {
        return requestJson(url, {
          method,
          payload,
          headers,
          retryOnTimeout,
          attempt: attempt + 1,
        });
      }
      throw new Error("PEM is taking too long to respond. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("PEM could not reach the server. Check your internet or refresh and try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function RatingStars({ rating }) {
  const filled = Math.round(rating);

  return (
    <div className="rating">
      <div className="rating__stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= filled ? "rating__star rating__star--filled" : "rating__star"}
          >
            {"\u2605"}
          </span>
        ))}
      </div>
      <span>{rating.toFixed(1)}</span>
    </div>
  );
}

function StarRatingInput({ value, onChange }) {
  const numericValue = Number(value) || 0;

  return (
    <div className="star-input" role="radiogroup" aria-label="Select a review rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= numericValue ? "star-input__button is-active" : "star-input__button"}
          aria-checked={star === numericValue}
          role="radio"
          onClick={() => onChange(String(star))}
        >
          ★
        </button>
      ))}
      <span className="star-input__label">{numericValue}/5</span>
    </div>
  );
}

function CleanStarRatingInput({ value, onChange }) {
  const numericValue = Number(value) || 0;

  return (
    <div className="star-input" role="radiogroup" aria-label="Select a review rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= numericValue ? "star-input__button is-active" : "star-input__button"}
          aria-checked={star === numericValue}
          role="radio"
          onClick={() => onChange(String(star))}
        >
          {"\u2605"}
        </button>
      ))}
      <span className="star-input__label">{numericValue}/5</span>
    </div>
  );
}

function QuantityControl({ value, onDecrease, onIncrease, disabled = false }) {
  return (
    <div className="qty-control">
      <button type="button" onClick={onDecrease} aria-label="Decrease quantity" disabled={disabled}>
        -
      </button>
      <span>{value}</span>
      <button type="button" onClick={onIncrease} aria-label="Increase quantity" disabled={disabled}>
        +
      </button>
    </div>
  );
}

function ThemeToggle({ theme, onToggle, floating = false }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={floating ? (isDark ? "theme-fab is-dark is-floating" : "theme-fab is-floating") : isDark ? "theme-fab is-dark" : "theme-fab"}
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-fab__track" aria-hidden="true">
        <span className="theme-fab__thumb" />
      </span>
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useState("light");
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [lagosNowTick, setLagosNowTick] = useState(() => Date.now());
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [branchSuggestionState, setBranchSuggestionState] = useState({ loading: false, error: "", success: "" });
  const [isCompactHeader, setIsCompactHeader] = useState(false);
  const [activePage, setActivePage] = useState(() =>
    typeof window === "undefined" ? "menu" : resolvePageFromHash(window.location.hash),
  );
  const [activeMenuSection, setActiveMenuSection] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState("reviews");
  const [minimumRating, setMinimumRating] = useState(0);
  const [menuCatalog, setMenuCatalog] = useState(() => mergeMenuCatalog(menuItems, []));
  const [cart, setCart] = useState({});
  const [notes, setNotes] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [savedReferences, setSavedReferences] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [branchCarts, setBranchCarts] = useState({});
  const [branchCartHydrated, setBranchCartHydrated] = useState(false);
  const [accountToken, setAccountToken] = useState("");
  const [accountUser, setAccountUser] = useState(initialAccountUser);
  const [accountOrders, setAccountOrders] = useState([]);
  const [accountGifts, setAccountGifts] = useState(initialAccountGifts);
  const [accountState, setAccountState] = useState({ loading: false, error: "", success: "" });
  const [giftActionState, setGiftActionState] = useState(initialGiftActionState);
  const [accountHydrated, setAccountHydrated] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [signupForm, setSignupForm] = useState(initialAccountForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [forgotPasswordForm, setForgotPasswordForm] = useState(initialForgotPasswordForm);
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });
  const [addressDraft, setAddressDraft] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState("");
  const [lastAddedItemId, setLastAddedItemId] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [checkoutForm, setCheckoutForm] = useState(initialCheckout);
  const [customCheckoutAddress, setCustomCheckoutAddress] = useState("");
  const [checkoutState, setCheckoutState] = useState({ loading: false, error: "" });
  const [checkoutFieldErrors, setCheckoutFieldErrors] = useState({});
  const [contactForm, setContactForm] = useState(initialContact);
  const [contactState, setContactState] = useState({ loading: false, success: "", error: "" });
  const [cateringForm, setCateringForm] = useState(initialCatering);
  const [cateringState, setCateringState] = useState({ loading: false, success: "", error: "" });
  const [reservationForm, setReservationForm] = useState(initialReservation);
  const [reservationState, setReservationState] = useState({ loading: false, success: "", error: "" });
  const [trackingReference, setTrackingReference] = useState("");
  const [trackingState, setTrackingState] = useState(initialTrackingState);
  const [deliveryZoneAdminState, setDeliveryZoneAdminState] = useState(initialDeliveryZoneAdminState);
  const [menuAdminState, setMenuAdminState] = useState(initialMenuAdminState);
  const [settingsAdminState, setSettingsAdminState] = useState(initialSettingsAdminState);
  const [deliveryZones, setDeliveryZones] = useState(defaultDeliveryZones);
  const [businessSettings, setBusinessSettings] = useState(initialBusinessSettings);
  const [dietaryNeeds, setDietaryNeeds] = useState("");
  const [dietaryState, setDietaryState] = useState(initialDietaryState);
  const [promoValidationState, setPromoValidationState] = useState(initialPromoValidationState);
  const [showDietaryMatchesOnly, setShowDietaryMatchesOnly] = useState(false);
  const [adminState, setAdminState] = useState(initialAdminState);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [adminSession, setAdminSession] = useState(initialAdminSession);
  const [adminLoginState, setAdminLoginState] = useState({ loading: false, error: "" });
  const [adminQuery, setAdminQuery] = useState("");
  const [menuAdminQuery, setMenuAdminQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedOrderReferences, setSelectedOrderReferences] = useState([]);
  const [bulkOrderStatus, setBulkOrderStatus] = useState("received");
  const [adminBranchFilter, setAdminBranchFilter] = useState("all");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordState, setPasswordState] = useState({ loading: false, error: "", success: "" });
  const [orderActionState, setOrderActionState] = useState({ loadingRef: "", error: "", success: "" });
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [reviewState, setReviewState] = useState({ loading: false, success: "", error: "" });
  const [publicReviews, setPublicReviews] = useState([]);
  const branchLocations = useMemo(
    () => parseBranchLocations(businessSettings.branchLocationsText, businessSettings),
    [businessSettings],
  );
  const lagosNow = useMemo(() => getLagosNowParts(), [lagosNowTick]);
  const selectedBranch =
    branchLocations.find((branch) => branch.id === selectedBranchId) || branchLocations[0] || null;
  const businessStatus = useMemo(
    () => getBusinessStatus(selectedBranch?.hours || businessSettings.businessHoursText, lagosNow),
    [businessSettings.businessHoursText, lagosNow, selectedBranch?.hours],
  );
  const recommendedItemIds = dietaryState.matches.map((match) => match.itemId);
  const visibleMenuItems = menuCatalog.filter((item) => !item.hidden && isMenuItemScheduledNow(item, lagosNow));
  const toggleTheme = () => setTheme((current) => (current === "light" ? "dark" : "light"));

  function validateCheckoutField(field, value) {
    let error = "";
    if (field === "customerName" && String(value || "").trim().length < 2) {
      error = "Enter your full name";
    }
    if (field === "phone" && normalizePhoneDigits(value).length < 10) {
      error = "Phone must be at least 10 digits";
    }
    if (field === "email") {
      const normalizedValue = String(value || "").trim();
      if (isCardPaymentMethod(checkoutForm.paymentMethod) && !normalizedValue) {
        error = "Email is required for card payment";
      } else if (normalizedValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)) {
        error = "Enter a valid email";
      }
    }
    if (
      field === "address" &&
      !isGiftOrder &&
      checkoutForm.fulfillmentMethod !== "pickup" &&
      (usingProfileAddress ? savedProfileAddress : String(value || "").trim()).length < 5
    ) {
      error = "Enter a delivery address";
    }
    if (field === "recipientEmail") {
      const normalizedValue = String(value || "").trim().toLowerCase();
      if (!normalizedValue) {
        error = "Enter your friend's PEM email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)) {
        error = "Enter a valid email";
      } else if (normalizedValue === String(accountUser.email || "").trim().toLowerCase()) {
        error = "Use the normal checkout if you are ordering for yourself";
      }
    }
    setCheckoutFieldErrors((previous) => ({ ...previous, [field]: error }));
  }

  function getCheckoutAccountDefaults() {
    return {
      customerName: accountUser.fullName || "",
      phone: accountUser.phone || "",
      email: accountUser.email || "",
      address: accountUser.savedAddresses?.[0] || "",
    };
  }

  async function handleUseClosestBranch() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setBranchSuggestionState({
        loading: false,
        error: "This device cannot share location right now. Choose the branch manually instead.",
        success: "",
      });
      return;
    }

    setBranchSuggestionState({ loading: true, error: "", success: "" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const closestBranch = getClosestBranch(branchLocations, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (!closestBranch?.branch) {
          setBranchSuggestionState({
            loading: false,
            error: "PEM could not match your location to a branch yet. Please choose the branch manually.",
            success: "",
          });
          return;
        }

        setSelectedBranchId(closestBranch.branch.id);
        setBranchSuggestionState({
          loading: false,
          error: "",
          success: `Closest branch selected: ${closestBranch.branch.label}${Number.isFinite(closestBranch.distanceKm) ? ` (${closestBranch.distanceKm.toFixed(1)} km away)` : ""}.`,
        });
      },
      () => {
        setBranchSuggestionState({
          loading: false,
          error: "Allow location access to let PEM suggest the closest branch to you.",
          success: "",
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  }

  function setCheckoutAddressMode(mode) {
    if (mode === "profile") {
      const savedAddress = String(accountUser.savedAddresses?.[0] || "").trim();
      const nextCustomAddress =
        checkoutForm.addressMode === "current" && checkoutForm.address.trim() ? checkoutForm.address : customCheckoutAddress;
      setCustomCheckoutAddress(nextCustomAddress);
      setCheckoutForm((previous) => ({
        ...previous,
        addressMode: "profile",
        address: savedAddress,
      }));
    } else {
      const restoredCustomAddress =
        customCheckoutAddress || (checkoutForm.addressMode === "current" ? checkoutForm.address : "");
      setCheckoutForm((previous) => ({
        ...previous,
        addressMode: "current",
        address: restoredCustomAddress,
      }));
    }
    setCheckoutFieldErrors((previous) => ({ ...previous, address: "" }));
  }

  function buildCheckoutMissingFieldsMessage(fieldErrors = {}) {
    const missingFields = Object.entries(fieldErrors)
      .filter(([, message]) => Boolean(message))
      .map(([field]) => field);

    if (missingFields.length === 0) {
      return "Almost there. Review your details and place the order again.";
    }

    const labelMap = {
      customerName: "your full name",
      phone: "your phone number",
      email: "your email address",
      recipientEmail: "your friend's PEM email",
      address: "your delivery address",
      scheduledFor: "a valid delivery time",
      paymentReference: "your transfer reference",
      promoCode: "your promo code",
    };
    const readableFields = missingFields.map((field) => labelMap[field] || "the highlighted details");

    if (readableFields.length === 1) {
      const suggestion = missingFields[0] === "address" && accountToken
        ? "Add it once and PEM will keep it for your next order."
        : "Update it and place the order again.";
      return `Almost there. Add ${readableFields[0]} to continue. ${suggestion}`;
    }

    const lastField = readableFields.at(-1);
    const leadingFields = readableFields.slice(0, -1);
    return `Almost there. Add ${leadingFields.join(", ")} and ${lastField} to continue.`;
  }

  function focusCheckoutField(field) {
    if (typeof document === "undefined" || !field) {
      return;
    }

    window.requestAnimationFrame(() => {
      const fieldElement = document.querySelector(
        `[data-checkout-field="${field}"] input, [data-checkout-field="${field}"] textarea, [data-checkout-field="${field}"] select`,
      );

      if (fieldElement instanceof HTMLElement) {
        fieldElement.focus();
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  function failCheckout(error, fieldErrors = {}, focusField = "") {
    setCheckoutState({ loading: false, error });
    if (Object.keys(fieldErrors).length > 0) {
      setCheckoutFieldErrors((previous) => ({ ...previous, ...fieldErrors }));
    }
    focusCheckoutField(focusField);
  }

  function trackView(itemId) {
    setRecentlyViewed((previous) => [itemId, ...previous.filter((id) => id !== itemId)].slice(0, 6));
  }

  function rememberPlacedOrderLocally(order) {
    if (!order?.reference) {
      return;
    }

    const nextSavedReferences = [
      order.reference,
      ...savedReferences.filter((reference) => reference !== order.reference),
    ].slice(0, 5);
    setSavedReferences(nextSavedReferences);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pem-order-history", JSON.stringify(nextSavedReferences));
    }

    if (!accountToken) {
      return;
    }

    const nextAccountUser = {
      ...accountUser,
      phone: accountUser.phone || order.customer?.phone || "",
      savedAddresses: order.customer?.address
        ? [
            order.customer.address,
            ...(accountUser.savedAddresses || []).filter((item) => item !== order.customer.address),
          ].slice(0, 5)
        : accountUser.savedAddresses || [],
      orderReferences: [
        order.reference,
        ...(accountUser.orderReferences || []).filter((reference) => reference !== order.reference),
      ].slice(0, 20),
    };
    const nextAccountOrders = [
      order,
      ...accountOrders.filter((existingOrder) => existingOrder.reference !== order.reference),
    ];

    setAccountUser(nextAccountUser);
    setAccountOrders(nextAccountOrders);
    writeCachedJson("pem-account-cache", {
      user: nextAccountUser,
      orders: nextAccountOrders,
      gifts: accountGifts,
    });
  }

  function rememberGiftLocally(gift, direction = "sent") {
    if (!gift?.reference || !accountToken) {
      return;
    }

    const nextAccountGifts = {
      received:
        direction === "received"
          ? [gift, ...(accountGifts.received || []).filter((entry) => entry.reference !== gift.reference)]
          : accountGifts.received || [],
      sent:
        direction === "sent"
          ? [gift, ...(accountGifts.sent || []).filter((entry) => entry.reference !== gift.reference)]
          : accountGifts.sent || [],
    };

    setAccountGifts(nextAccountGifts);
    writeCachedJson("pem-account-cache", {
      user: accountUser,
      orders: accountOrders,
      gifts: nextAccountGifts,
    });
  }

  function resetCheckoutAfterOrder() {
    const accountDefaults = getCheckoutAccountDefaults();
    const nextAddressMode = accountDefaults.address ? "profile" : "current";
    setShowCart(false);
    setCart({});
    setNotes({});
    setBranchCarts((previous) => (
      selectedBranchId
        ? {
            ...previous,
            [selectedBranchId]: { cart: {}, notes: {} },
          }
        : previous
    ));
    setCheckoutForm({
      ...initialCheckout,
      ...accountDefaults,
      addressMode: nextAddressMode,
      deliveryZone: checkoutForm.deliveryZone || initialCheckout.deliveryZone,
    });
    setCustomCheckoutAddress("");
    setCheckoutFieldErrors({});
    setPromoValidationState(initialPromoValidationState);
    if (typeof window !== "undefined") {
      if (selectedBranchId) {
        try {
          const persistedBranchCarts = JSON.parse(window.localStorage.getItem("pem-branch-carts") || "{}");
          window.localStorage.setItem(
            "pem-branch-carts",
            JSON.stringify({
              ...persistedBranchCarts,
              [selectedBranchId]: { cart: {}, notes: {} },
            }),
          );
        } catch {
          // Ignore local storage write issues.
        }
      }
      window.localStorage.removeItem("pem-checkout-draft");
    }
  }

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pem-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    function handleHashChange() {
      setActivePage(resolvePageFromHash(window.location.hash));
      setBranchMenuOpen(false);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    function handleHeaderScroll() {
      setIsCompactHeader(window.scrollY > 32);
    }

    handleHeaderScroll();
    window.addEventListener("scroll", handleHeaderScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleHeaderScroll);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLagosNowTick(Date.now());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    setIsInstalled(Boolean(standaloneMode));

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPromptEvent(event);
    }

    function handleInstalled() {
      setIsInstalled(true);
      setInstallPromptEvent(null);
      setOrderPlaced("PEM has been installed on this device.");
      window.setTimeout(() => {
        setOrderPlaced("");
      }, 4000);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    try {
      const savedCheckout = JSON.parse(window.localStorage.getItem("pem-checkout-draft") || "null");
      if (savedCheckout && typeof savedCheckout === "object") {
        setCheckoutForm((previous) => ({
          ...previous,
          customerName: savedCheckout.customerName || previous.customerName,
          phone: savedCheckout.phone || previous.phone,
          orderType: savedCheckout.orderType || previous.orderType,
          recipientEmail: savedCheckout.recipientEmail || previous.recipientEmail,
          giftMessage: savedCheckout.giftMessage || previous.giftMessage,
          address: savedCheckout.address || previous.address,
          addressMode: savedCheckout.addressMode || previous.addressMode,
          deliveryZone: savedCheckout.deliveryZone || previous.deliveryZone,
          fulfillmentMethod: savedCheckout.fulfillmentMethod || previous.fulfillmentMethod,
          landmark: savedCheckout.landmark || previous.landmark,
        }));
        setCustomCheckoutAddress(savedCheckout.customAddress || savedCheckout.address || "");
      }
    } catch {
      // Ignore corrupted draft.
    }
  }, []);

  useEffect(() => {
    try {
      const storedFavorites = JSON.parse(window.localStorage.getItem("pem-favorites") || "[]");
      const storedReferences = JSON.parse(window.localStorage.getItem("pem-order-history") || "[]");
      const storedBranchId = window.localStorage.getItem("pem-selected-branch") || "";
      const storedBranchCarts = JSON.parse(window.localStorage.getItem("pem-branch-carts") || "{}");
      const storedRecentlyViewed = JSON.parse(window.localStorage.getItem("pem-recently-viewed") || "[]");
      if (Array.isArray(storedFavorites)) {
        setFavorites(storedFavorites);
      }
      if (Array.isArray(storedReferences)) {
        setSavedReferences(storedReferences);
      }
      if (storedBranchId) {
        setSelectedBranchId(storedBranchId);
      }
      if (storedBranchCarts && typeof storedBranchCarts === "object") {
        setBranchCarts(storedBranchCarts);
      }
      if (Array.isArray(storedRecentlyViewed)) {
        setRecentlyViewed(storedRecentlyViewed);
      }
    } catch {
      setFavorites([]);
      setSavedReferences([]);
      setBranchCarts({});
      setRecentlyViewed([]);
    }
    setBranchCartHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("pem-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("pem-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem("pem-recently-viewed", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    window.localStorage.setItem("pem-order-history", JSON.stringify(savedReferences));
  }, [savedReferences]);

  useEffect(() => {
    if (!accountToken) {
      return;
    }

    writeCachedJson("pem-account-cache", {
      user: accountUser,
      orders: accountOrders,
      gifts: accountGifts,
    });
  }, [accountGifts, accountOrders, accountToken, accountUser]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "pem-checkout-draft",
        JSON.stringify({
          customerName: checkoutForm.customerName,
          phone: checkoutForm.phone,
          orderType: checkoutForm.orderType,
          recipientEmail: checkoutForm.recipientEmail,
          giftMessage: checkoutForm.giftMessage,
          address: checkoutForm.address,
          addressMode: checkoutForm.addressMode,
          customAddress: customCheckoutAddress,
          deliveryZone: checkoutForm.deliveryZone,
          fulfillmentMethod: checkoutForm.fulfillmentMethod,
          landmark: checkoutForm.landmark,
        }),
      );
    } catch {
      // Ignore local storage write issues.
    }
  }, [
    checkoutForm.address,
    checkoutForm.addressMode,
    checkoutForm.customerName,
    checkoutForm.deliveryZone,
    checkoutForm.fulfillmentMethod,
    checkoutForm.giftMessage,
    checkoutForm.landmark,
    checkoutForm.phone,
    checkoutForm.orderType,
    checkoutForm.recipientEmail,
    customCheckoutAddress,
  ]);

  useEffect(() => {
    if (availableCheckoutPaymentOptions.some((option) => option.label === checkoutForm.paymentMethod)) {
      return;
    }

    setCheckoutForm((previous) => ({
      ...previous,
      paymentMethod: availableCheckoutPaymentOptions[0]?.label || initialCheckout.paymentMethod,
      paymentReference: "",
    }));
  }, [availableCheckoutPaymentOptions, checkoutForm.paymentMethod]);

  useEffect(() => {
    const savedAccountToken = window.localStorage.getItem("pem-account-token");
    if (savedAccountToken) {
      setAccountToken(savedAccountToken);
    } else {
      setAccountHydrated(true);
    }
  }, []);

  useEffect(() => {
    const savedAdminToken = window.localStorage.getItem("pem-admin-token");
    let savedAdminProfile = null;
    try {
      savedAdminProfile = JSON.parse(window.localStorage.getItem("pem-admin-profile") || "null");
    } catch {
      savedAdminProfile = null;
    }
    if (savedAdminToken) {
      setAdminToken(savedAdminToken);
    }
    if (savedAdminProfile) {
      setAdminSession({ ...initialAdminSession, ...savedAdminProfile });
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      window.localStorage.setItem("pem-admin-token", adminToken);
      loadAdminData(adminToken);
      loadDeliveryZones(adminToken);
      loadMenuCatalog(adminToken);
      loadPublicSettings(adminToken);
    } else {
      window.localStorage.removeItem("pem-admin-token");
      window.localStorage.removeItem("pem-admin-profile");
      setAdminSession(initialAdminSession);
      setAdminState(initialAdminState);
    }
  }, [adminToken]);

  useEffect(() => {
    if (!adminToken) {
      return;
    }
    window.localStorage.setItem("pem-admin-profile", JSON.stringify(adminSession));
  }, [adminSession, adminToken]);

  useEffect(() => {
    if (accountToken) {
      window.localStorage.setItem("pem-account-token", accountToken);
      loadAccount(accountToken);
    } else {
      window.localStorage.removeItem("pem-account-token");
      setAccountUser(initialAccountUser);
      setAccountOrders([]);
      setAccountGifts(initialAccountGifts);
      setGiftActionState(initialGiftActionState);
      setProfileForm({ fullName: "", phone: "" });
      setCustomCheckoutAddress("");
      setAccountHydrated(true);
    }
  }, [accountToken]);

  useEffect(() => {
    loadPublicDeliveryZones();
    loadMenuCatalog();
    loadPublicSettings();
  }, []);

  useEffect(() => {
    loadPublicReviews(selectedBranch?.id || "");
  }, [selectedBranch?.id]);

  useEffect(() => {
    function handleOnlineChange() {
      setIsOnline(window.navigator.onLine);
    }

    window.addEventListener("online", handleOnlineChange);
    window.addEventListener("offline", handleOnlineChange);
    return () => {
      window.removeEventListener("online", handleOnlineChange);
      window.removeEventListener("offline", handleOnlineChange);
    };
  }, []);

  useEffect(() => {
    if (!selectedBranchId && branchLocations.length > 0) {
      setSelectedBranchId(branchLocations[0].id);
      return;
    }

    if (selectedBranchId && !branchLocations.some((branch) => branch.id === selectedBranchId)) {
      setSelectedBranchId(branchLocations[0]?.id || "");
    }
  }, [branchLocations, selectedBranchId]);

  useEffect(() => {
    if (!deliveryZones.length) {
      return;
    }

    if (!deliveryZones.some((zone) => zone.id === checkoutForm.deliveryZone)) {
      setCheckoutForm((previous) => ({
        ...previous,
        deliveryZone: deliveryZones[0].id,
      }));
    }
  }, [checkoutForm.deliveryZone, deliveryZones]);

  useEffect(() => {
    if (!selectedBranchId) {
      return;
    }
    window.localStorage.setItem("pem-selected-branch", selectedBranchId);
  }, [selectedBranchId]);

  useEffect(() => {
    if (!selectedBranchId || !branchCartHydrated) {
      return;
    }

    const scopedState = branchCarts[selectedBranchId] || { cart: {}, notes: {} };
    setCart(scopedState.cart || {});
    setNotes(scopedState.notes || {});
  }, [branchCartHydrated, branchCarts, selectedBranchId]);

  useEffect(() => {
    if (!selectedBranchId || !branchCartHydrated) {
      return;
    }

    setBranchCarts((previous) => {
      const nextEntry = { cart, notes };
      const existingEntry = previous[selectedBranchId];
      if (
        existingEntry &&
        JSON.stringify(existingEntry.cart || {}) === JSON.stringify(cart) &&
        JSON.stringify(existingEntry.notes || {}) === JSON.stringify(notes)
      ) {
        return previous;
      }
      return {
        ...previous,
        [selectedBranchId]: nextEntry,
      };
    });
  }, [branchCartHydrated, cart, notes, selectedBranchId]);

  useEffect(() => {
    if (!branchCartHydrated) {
      return;
    }
    window.localStorage.setItem("pem-branch-carts", JSON.stringify(branchCarts));
  }, [branchCartHydrated, branchCarts]);

  useEffect(() => {
    if (!accountToken || !accountHydrated) {
      return;
    }

    const nextFavorites = JSON.stringify(favorites);
    const accountFavorites = JSON.stringify(accountUser.favoriteItemIds || []);

    if (nextFavorites === accountFavorites) {
      return;
    }

    syncFavoritesToAccount(favorites);
  }, [accountHydrated, accountToken, accountUser.favoriteItemIds, favorites]);

  useEffect(() => {
    if (adminSession.branchId) {
      setAdminBranchFilter(adminSession.branchId);
    }
  }, [adminSession.branchId]);

  useEffect(() => {
    if (!accountToken) {
      return;
    }

    const accountDefaults = getCheckoutAccountDefaults();
    setCheckoutForm((previous) => ({
      ...previous,
      customerName: previous.customerName || accountDefaults.customerName,
      phone: previous.phone || accountDefaults.phone,
      email: previous.email || accountDefaults.email,
      address:
        previous.addressMode === "current"
          ? previous.address
          : previous.address || accountDefaults.address,
      addressMode: previous.addressMode || (accountDefaults.address ? "profile" : "current"),
    }));
  }, [accountToken, accountUser.email, accountUser.fullName, accountUser.phone, accountUser.savedAddresses]);

  useEffect(() => {
    if (canUseProfileAddress && checkoutForm.addressMode !== "current" && checkoutForm.address !== savedProfileAddress) {
      setCheckoutForm((previous) => ({
        ...previous,
        address: savedProfileAddress,
        addressMode: "profile",
      }));
      return;
    }

    if (!canUseProfileAddress && checkoutForm.addressMode !== "current") {
      setCheckoutForm((previous) => ({
        ...previous,
        addressMode: "current",
      }));
    }
  }, [canUseProfileAddress, checkoutForm.address, checkoutForm.addressMode, savedProfileAddress]);

  useEffect(() => {
    if (accountToken || adminToken) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const referralCode = searchParams.get("ref") || getQueryParamFromHash(window.location.hash, "ref");
    const normalizedReferralCode = String(referralCode || "").trim();
    if (!normalizedReferralCode) {
      return;
    }

    setSignupForm((previous) => ({
      ...previous,
      referralCode: previous.referralCode || normalizedReferralCode,
    }));
    setAuthView("signup");
  }, [accountToken, adminToken]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const reference = params.get("reference");

    if (payment !== "paystack" || !reference) {
      return;
    }

    async function verifyPayment() {
      try {
        const data = await requestJson(`/api/payments/paystack/verify/${encodeURIComponent(reference)}`);
        if (!data.verified) {
          throw new Error("Payment is still pending. Please confirm the card transaction and try again.");
        }
        setOrderPlaced(`Payment confirmed for order ${reference}. PEM will continue processing it.`);
        setTrackingReference(reference);
        if (data.order) {
          setTrackingState({
            loading: false,
            error: "",
            order: data.order,
          });
          setReceiptOrder(data.order);
          rememberPlacedOrderLocally(data.order);
        }
        resetCheckoutAfterOrder();
        if (accountToken) {
          loadAccount();
        }
      } catch (error) {
        setOrderPlaced(error.message);
      } finally {
        const url = new URL(window.location.href);
        url.searchParams.delete("payment");
        url.searchParams.delete("reference");
        window.history.replaceState({}, "", url.toString());
      }
    }

    verifyPayment();
  }, [accountToken]);

  const visibleCategories = useMemo(() => {
    const availableCategories = [
      "All",
      ...new Set(menuCatalog.filter((item) => !item.hidden && isMenuItemScheduledNow(item, lagosNow)).map((item) => item.category)),
    ];
    const section = menuSections.find((item) => item.id === activeMenuSection);
    if (!section) {
      return availableCategories;
    }
    return section.id === "all"
      ? availableCategories
      : ["All", ...section.categories.filter((category) => category !== "All" && availableCategories.includes(category))];
  }, [activeMenuSection, lagosNow, menuCatalog]);

  useEffect(() => {
    if (!visibleCategories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, visibleCategories]);

  const filteredItems = useMemo(() => {
    const recommendedIdSet = new Set(recommendedItemIds);

    let items = menuCatalog.filter((item) => {
      const section = menuSections.find((menuSection) => menuSection.id === activeMenuSection);
      const matchesSection = !section || section.id === "all" || section.categories.includes(item.category);
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesRating = item.rating >= minimumRating;
      const matchesFavorites = !showFavoritesOnly || favorites.includes(item.id);
      const matchesAvailability = !item.hidden && isMenuItemScheduledNow(item, lagosNow);
      const matchesPriceRange =
        priceRange === "all" ||
        (priceRange === "under-2000" && item.price < 2000) ||
        (priceRange === "2000-4000" && item.price >= 2000 && item.price <= 4000) ||
        (priceRange === "above-4000" && item.price > 4000);
      const matchesDietarySelection =
        !showDietaryMatchesOnly || recommendedIdSet.size === 0 || recommendedIdSet.has(item.id);
      const matchesSearch = menuItemMatchesSearch(item, search, selectedBranch, lagosNow);

      return (
        matchesSection &&
        matchesCategory &&
        matchesRating &&
        matchesAvailability &&
        matchesPriceRange &&
        matchesFavorites &&
        matchesSearch &&
        matchesDietarySelection
      );
    });

    if (sortBy === "price-low") {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      items = [...items].sort((a, b) => b.price - a.price);
    } else if (sortBy === "reviews") {
      items = [...items].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }

    return items;
  }, [activeCategory, activeMenuSection, favorites, lagosNow, menuCatalog, minimumRating, priceRange, recommendedItemIds, search, selectedBranch, showDietaryMatchesOnly, showFavoritesOnly, sortBy]);

  const cartItems = Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const item = menuCatalog.find((menuItem) => menuItem.id === Number(id));
      if (!item) {
        return null;
      }
      return {
        ...item,
        quantity,
        note: notes[id] || "",
      };
    })
    .filter(Boolean);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedDeliveryZone =
    deliveryZones.find((zone) => zone.id === checkoutForm.deliveryZone) || getDeliveryZone(checkoutForm.deliveryZone, deliveryZones);
  const delivery = subtotal > 0 && checkoutForm.fulfillmentMethod !== "pickup" ? selectedDeliveryZone.fee : 0;
  const discount = promoValidationState.valid ? promoValidationState.amount : 0;
  const total = Math.max(0, subtotal + delivery - discount);
  useEffect(() => {
    const normalizedPromoCode = checkoutForm.promoCode.trim().toUpperCase();

    if (!normalizedPromoCode || subtotal <= 0) {
      setPromoValidationState(initialPromoValidationState);
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setPromoValidationState((previous) => ({
          ...previous,
          loading: true,
          error: "",
          code: normalizedPromoCode,
          subtotal,
        }));

        const data = await requestJson("/api/promo/validate", {
          method: "POST",
          payload: {
            promoCode: normalizedPromoCode,
            subtotal,
          },
          retryOnTimeout: true,
        });
        const promo = data.promo || initialPromoValidationState;
        setPromoValidationState({
          loading: false,
          valid: Boolean(promo.valid),
          amount: Number(promo.amount) || 0,
          code: String(promo.code || normalizedPromoCode),
          minimumOrder: Number(promo.minimumOrder) || 0,
          subtotal,
          error: "",
        });
      } catch (error) {
        setPromoValidationState({
          loading: false,
          valid: false,
          amount: 0,
          code: normalizedPromoCode,
          minimumOrder: 0,
          subtotal,
          error: error.message,
        });
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [checkoutForm.promoCode, subtotal]);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryEtaLabel = checkoutForm.fulfillmentMethod === "pickup"
    ? `Pickup from ${selectedBranch?.label || `${businessSettings.appName} Branch`} will be confirmed by PEM.`
    : `${selectedDeliveryZone.eta} from ${selectedBranch?.label || `${businessSettings.appName} Branch`}.`;
  const smartCartSuggestions = useMemo(() => getSuggestedAddOns(cartItems, menuCatalog, lagosNow), [cartItems, lagosNow, menuCatalog]);
  const recentOrderItems = useMemo(() => {
    const recentIds = [];
    accountOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!recentIds.includes(item.id)) {
          recentIds.push(item.id);
        }
      });
    });

    return recentIds
      .map((itemId) => menuCatalog.find((item) => item.id === itemId))
      .filter((item) => item && !item.hidden && !item.soldOut && isMenuItemScheduledNow(item, lagosNow))
      .slice(0, 4);
  }, [accountOrders, lagosNow, menuCatalog]);
  const lowStockMenuItems = useMemo(
    () =>
      menuAdminState.items
        .filter((item) => !item.hidden && !item.soldOut && Number(item.stockQuantity || 0) > 0 && Number(item.stockQuantity || 0) <= 3)
        .sort((left, right) => Number(left.stockQuantity || 0) - Number(right.stockQuantity || 0))
        .slice(0, 6),
    [menuAdminState.items],
  );
  const trustHighlights = [
    {
      title: "Fresh local dishes",
      text: "PEM focuses on native meals, reliable portions, and branch-based preparation windows.",
    },
    {
      title: "Clear delivery coordination",
      text: "Each order carries branch details, delivery area timing, and landmark notes for easier handoff.",
    },
    {
      title: "Fast support",
      text: "Customers can move from the app to WhatsApp support without losing their order context.",
    },
  ];
  const receiptWhatsAppUrl = receiptOrder ? buildWhatsAppConfirmationUrl(receiptOrder, businessSettings) : "";
  const receiptEtaCountdown = receiptOrder ? getEtaCountdown(receiptOrder, deliveryZones) : "";
  const trackingEtaCountdown = trackingState.order ? getEtaCountdown(trackingState.order, deliveryZones) : "";
  const unavailableCartItem = cartItems.find((item) => item.soldOut || item.hidden || !isMenuItemScheduledNow(item, lagosNow));
  const overStockCartItem = cartItems.find((item) => Number(item.stockQuantity || 0) > 0 && item.quantity > Number(item.stockQuantity || 0));
  const normalizedAdminQuery = adminQuery.trim().toLowerCase();
  const normalizedMenuAdminQuery = menuAdminQuery.trim().toLowerCase();
  const effectiveAdminBranchId = adminSession.branchId || adminBranchFilter;
  const branchOptions = branchLocations.map((branch) => ({
    value: branch.id,
    label: branch.label,
  }));
  const branchScopedOrders = adminState.data.orders.filter((order) => {
    return effectiveAdminBranchId === "all" || !effectiveAdminBranchId
      ? true
      : getRecordBranchId(order) === effectiveAdminBranchId;
  });
  const branchScopedContacts = adminState.data.contacts.filter((message) => {
    return effectiveAdminBranchId === "all" || !effectiveAdminBranchId
      ? true
      : getRecordBranchId(message) === effectiveAdminBranchId;
  });
  const branchScopedCatering = adminState.data.catering.filter((request) => {
    return effectiveAdminBranchId === "all" || !effectiveAdminBranchId
      ? true
      : getRecordBranchId(request) === effectiveAdminBranchId;
  });
  const branchScopedReservations = adminState.data.reservations.filter((reservation) => {
    return effectiveAdminBranchId === "all" || !effectiveAdminBranchId
      ? true
      : getRecordBranchId(reservation) === effectiveAdminBranchId;
  });
  const branchScopedReviews = adminState.data.reviews.filter((review) => {
    return effectiveAdminBranchId === "all" || !effectiveAdminBranchId
      ? true
      : getRecordBranchId(review) === effectiveAdminBranchId;
  });
  const totalRevenue = branchScopedOrders.reduce((sum, order) => sum + (Number(order.pricing?.total) || 0), 0);
  const paidRevenue = branchScopedOrders.reduce(
    (sum, order) => sum + (order.payment?.status === "paid" ? Number(order.pricing?.total) || 0 : 0),
    0,
  );
  const todayOrders = branchScopedOrders.filter((order) => {
    if (!order.createdAt) {
      return false;
    }
    return new Date(order.createdAt).toDateString() === new Date().toDateString();
  }).length;
  const topMeals = Object.values(
    branchScopedOrders.reduce((accumulator, order) => {
      order.items.forEach((item) => {
        if (!accumulator[item.id]) {
          accumulator[item.id] = { id: item.id, name: item.name, quantity: 0 };
        }
        accumulator[item.id].quantity += Number(item.quantity) || 0;
      });
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 5);
  const kitchenBoardOrders = branchScopedOrders.filter((order) =>
    ["received", "confirmed", "preparing", "ready"].includes(order.status),
  );
  const riderBoardOrders = branchScopedOrders.filter((order) =>
    ["ready", "out_for_delivery"].includes(order.status),
  );
  const statusChart = orderStatuses
    .filter((status) => status !== "all")
    .map((status) => ({
      status,
      count: branchScopedOrders.filter((order) => order.status === status).length,
    }))
    .filter((entry) => entry.count > 0);
  const branchSalesChart = Object.entries(
    adminState.data.orders.reduce((accumulator, order) => {
      const branchName = getRecordBranchName(order);
      accumulator[branchName] = (accumulator[branchName] || 0) + (Number(order.pricing?.total) || 0);
      return accumulator;
    }, {}),
  )
    .map(([label, totalAmount]) => ({
      label,
      totalAmount,
    }))
    .sort((left, right) => right.totalAmount - left.totalAmount)
    .slice(0, 5);
  const chartMaxCount = Math.max(1, ...statusChart.map((entry) => entry.count));
  const chartMaxRevenue = Math.max(1, ...branchSalesChart.map((entry) => entry.totalAmount));
  const activeWelcomeName = String(
    accountUser.fullName ||
      accountUser.email?.split("@")[0] ||
      adminSession.username ||
      adminSession.label ||
      "Customer",
  ).trim();
  const savedProfileAddress = String(accountUser.savedAddresses?.[0] || "").trim();
  const canUseProfileAddress = Boolean(accountToken && savedProfileAddress);
  const usingProfileAddress = canUseProfileAddress && checkoutForm.addressMode !== "current";
  const effectiveCheckoutAddress = usingProfileAddress ? savedProfileAddress : String(checkoutForm.address || "").trim();
  const isGiftOrder = checkoutForm.orderType === "gift";
  const supportWhatsAppPhone = getWhatsAppPhone(businessSettings);
  const supportWhatsAppUrl = supportWhatsAppPhone
    ? `https://wa.me/${supportWhatsAppPhone}?text=${encodeURIComponent(
        `Hello ${businessSettings.appName}, I need help with my order.`,
      )}`
    : "#";
  const selectedPaymentIsCard = isCardPaymentMethod(checkoutForm.paymentMethod);
  const availableCheckoutPaymentOptions = isGiftOrder
    ? checkoutPaymentOptions.filter((option) => option.label === "Bank transfer")
    : checkoutPaymentOptions;
  const checkoutValidationNoticeVisible = Object.values(checkoutFieldErrors).some(Boolean);
  const checkoutProfileNotice = accountToken
    ? isGiftOrder
      ? `Sending as ${activeWelcomeName}. Your friend will accept this gift and choose their current delivery address in PEM.`
      : usingProfileAddress
      ? `Ordering as ${activeWelcomeName}. PEM is using your saved profile address for this order.`
      : effectiveCheckoutAddress
        ? `Ordering as ${activeWelcomeName}. This order will go to your current location, not your saved profile address.`
        : `Ordering as ${activeWelcomeName}. Add this order's delivery location without changing your saved profile address.`
    : "";
  const bankTransferReady = Boolean(
    String(businessSettings.bankName || "").trim() &&
      String(businessSettings.bankAccountName || "").trim() &&
      String(businessSettings.bankAccountNumber || "").trim(),
  );
  const unreadNotifications = (accountUser.notifications || []).filter((item) => !item.read);
  const pendingReceivedGifts = (accountGifts.received || []).filter((gift) => gift.status === "pending_acceptance");
  const loyaltyProgress = Math.min(
    100,
    Math.round(
      ((Number(accountUser.loyaltyPoints) || 0) /
        (accountUser.loyaltyTier === "gold" ? 120 : accountUser.loyaltyTier === "silver" ? 120 : 60)) *
        100,
    ),
  );

  const filteredAdminOrders = adminState.data.orders.filter((order) => {
    const matchesQuery =
      normalizedAdminQuery === "" ||
      order.reference.toLowerCase().includes(normalizedAdminQuery) ||
      order.customer.customerName.toLowerCase().includes(normalizedAdminQuery) ||
      order.customer.phone.toLowerCase().includes(normalizedAdminQuery) ||
      order.customer.address.toLowerCase().includes(normalizedAdminQuery) ||
      order.items.some((item) => item.name.toLowerCase().includes(normalizedAdminQuery));

    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    const matchesBranch =
      effectiveAdminBranchId === "all" || !effectiveAdminBranchId || getRecordBranchId(order) === effectiveAdminBranchId;
    return matchesQuery && matchesStatus && matchesBranch;
  });
  const adminUnreadOrders = branchScopedOrders.filter((order) => ["awaiting_payment", "received", "confirmed"].includes(order.status)).length;
  const adminUnreadContacts = branchScopedContacts.filter((message) => message.status === "new").length;
  const adminUnreadCatering = branchScopedCatering.filter((request) => request.status === "new").length;
  const topDeliveryZones = Object.entries(
    branchScopedOrders.reduce((accumulator, order) => {
      const zone = order.customer.deliveryZone || "Unspecified";
      accumulator[zone] = (accumulator[zone] || 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);

  const filteredAdminContacts = adminState.data.contacts.filter((message) => {
    const matchesBranch =
      effectiveAdminBranchId === "all" || !effectiveAdminBranchId || getRecordBranchId(message) === effectiveAdminBranchId;
    return matchesBranch && (
      normalizedAdminQuery === "" ||
      message.reference.toLowerCase().includes(normalizedAdminQuery) ||
      message.name.toLowerCase().includes(normalizedAdminQuery) ||
      message.phone.toLowerCase().includes(normalizedAdminQuery) ||
      message.message.toLowerCase().includes(normalizedAdminQuery)
    );
  });

  const filteredAdminCatering = adminState.data.catering.filter((request) => {
    const matchesBranch =
      effectiveAdminBranchId === "all" || !effectiveAdminBranchId || getRecordBranchId(request) === effectiveAdminBranchId;
    return matchesBranch && (
      normalizedAdminQuery === "" ||
      request.reference.toLowerCase().includes(normalizedAdminQuery) ||
      request.name.toLowerCase().includes(normalizedAdminQuery) ||
      request.phone.toLowerCase().includes(normalizedAdminQuery) ||
      (request.eventType || "").toLowerCase().includes(normalizedAdminQuery) ||
      request.details.toLowerCase().includes(normalizedAdminQuery)
    );
  });
  const filteredAdminReservations = adminState.data.reservations.filter((reservation) => {
    const matchesBranch =
      effectiveAdminBranchId === "all" || !effectiveAdminBranchId || getRecordBranchId(reservation) === effectiveAdminBranchId;
    return matchesBranch && (
      normalizedAdminQuery === "" ||
      reservation.reference.toLowerCase().includes(normalizedAdminQuery) ||
      reservation.name.toLowerCase().includes(normalizedAdminQuery) ||
      reservation.phone.toLowerCase().includes(normalizedAdminQuery)
    );
  });
  const recentReviews = branchScopedReviews.slice(0, 6);

  useEffect(() => {
    setSelectedOrderReferences((previous) =>
      previous.filter((reference) => filteredAdminOrders.some((order) => order.reference === reference)),
    );
  }, [filteredAdminOrders]);

  const filteredMenuAdminItems = menuAdminState.items.filter((item) => {
    return (
      normalizedMenuAdminQuery === "" ||
      item.name.toLowerCase().includes(normalizedMenuAdminQuery) ||
      item.category.toLowerCase().includes(normalizedMenuAdminQuery) ||
      item.badge.toLowerCase().includes(normalizedMenuAdminQuery)
    );
  });

  useEffect(() => {
    const unavailableItems = Object.entries(cart)
      .filter(([, quantity]) => quantity > 0)
      .map(([id]) => menuCatalog.find((item) => item.id === Number(id)))
      .filter((item) => item && (item.soldOut || item.hidden || !isMenuItemScheduledNow(item, lagosNow)));

    if (unavailableItems.length === 0) {
      return;
    }

    const unavailableIds = new Set(unavailableItems.map((item) => item.id));

    setCart((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([id, quantity]) => quantity > 0 && !unavailableIds.has(Number(id))),
      ),
    );
    setNotes((previous) =>
      Object.fromEntries(Object.entries(previous).filter(([id]) => !unavailableIds.has(Number(id)))),
    );
    setOrderPlaced(
      `${unavailableItems.map((item) => item.name).join(", ")} ${
        unavailableItems.length > 1 ? "were" : "was"
      } removed from your cart because ${unavailableItems.length > 1 ? "they are" : "it is"} unavailable.`,
    );

    const timeoutId = window.setTimeout(() => {
      setOrderPlaced("");
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [cart, menuCatalog]);

  function updateQuantity(itemId, delta) {
    const item = menuCatalog.find((menuItem) => menuItem.id === itemId);
    if (item?.soldOut && delta > 0) {
      return;
    }
    if ((cart[itemId] || 0) >= ORDER_ITEM_LIMIT && delta > 0) {
      setOrderPlaced(`You can order up to ${ORDER_ITEM_LIMIT} portions of ${item?.name || "this meal"} at once.`);
      window.setTimeout(() => setOrderPlaced(""), 3200);
      return;
    }
    if (delta > 0) {
      trackView(itemId);
      setLastAddedItemId(itemId);
      window.setTimeout(() => setLastAddedItemId((current) => (current === itemId ? null : current)), 900);
    }
    setCart((previous) => {
      const nextValue = Math.max(0, Math.min(ORDER_ITEM_LIMIT, (previous[itemId] || 0) + delta));
      return {
        ...previous,
        [itemId]: nextValue,
      };
    });
  }

  function setQuantity(itemId, quantity) {
    const item = menuCatalog.find((menuItem) => menuItem.id === itemId);
    if (item?.soldOut && quantity > 0) {
      return;
    }
    if (quantity > ORDER_ITEM_LIMIT) {
      setOrderPlaced(`You can order up to ${ORDER_ITEM_LIMIT} portions of ${item?.name || "this meal"} at once.`);
      window.setTimeout(() => setOrderPlaced(""), 3200);
    }
    if (quantity > 0) {
      trackView(itemId);
      setLastAddedItemId(itemId);
      window.setTimeout(() => setLastAddedItemId((current) => (current === itemId ? null : current)), 900);
    }
    setCart((previous) => ({
      ...previous,
      [itemId]: Math.max(0, Math.min(ORDER_ITEM_LIMIT, quantity)),
    }));
  }

  function updateNote(itemId, value) {
    setNotes((previous) => ({
      ...previous,
      [itemId]: value,
    }));
  }

  function toggleFavorite(itemId) {
    setFavorites((previous) =>
      previous.includes(itemId)
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId],
    );
  }

  function addComboToCart(combo) {
    setCart((previous) => {
      const nextCart = { ...previous };
      combo.itemIds.forEach((itemId) => {
        const item = menuCatalog.find((menuItem) => menuItem.id === itemId);
        if (!item?.soldOut && !item?.hidden) {
          nextCart[itemId] = Math.min(ORDER_ITEM_LIMIT, (nextCart[itemId] || 0) + 1);
          trackView(itemId);
          setLastAddedItemId(itemId);
          window.setTimeout(() => setLastAddedItemId((current) => (current === itemId ? null : current)), 900);
        }
      });
      return nextCart;
    });
    setShowCart(true);
  }

  function applyOrderToCart(order) {
    const nextCart = {};
    const nextNotes = {};

    order.items.forEach((item) => {
      const liveItem = menuCatalog.find((menuItem) => menuItem.id === item.id);
      if (!liveItem?.soldOut && !liveItem?.hidden) {
        nextCart[item.id] = Math.min(ORDER_ITEM_LIMIT, (nextCart[item.id] || 0) + item.quantity);
        trackView(item.id);
        if (item.note) {
          nextNotes[item.id] = item.note;
        }
      }
    });

    setCart(nextCart);
    setNotes(nextNotes);
    setShowCart(true);
  }

  function updateMenuAdminItem(itemId, updates) {
    setMenuAdminState((previous) => ({
      ...previous,
      success: "",
      items: previous.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    }));
  }

  function handleMenuAvailabilityChange(itemId, nextValue) {
    updateMenuAdminItem(itemId, {
      soldOut: nextValue === "sold-out",
      hidden: nextValue === "hidden",
    });
  }

  function updateSettingsField(field, value) {
    setSettingsAdminState((previous) => ({
      ...previous,
      success: "",
      settings: {
        ...previous.settings,
        [field]: value,
      },
    }));
  }

  async function handleInstallApp() {
    if (!installPromptEvent) {
      setOrderPlaced("Open PEM in Chrome on your Samsung phone and tap Add to Home screen if the install prompt does not appear.");
      window.setTimeout(() => {
        setOrderPlaced("");
      }, 4500);
      return;
    }

    await installPromptEvent.prompt();
    await installPromptEvent.userChoice.catch(() => null);
    setInstallPromptEvent(null);
  }

  function navigateToPage(nextPage) {
    const resolvedPage = resolvePageFromHash(nextPage);
    setActivePage(resolvedPage);
    setBranchMenuOpen(false);
    if (typeof window !== "undefined") {
      const nextHash = resolvedPage === "menu" ? "#menu" : `#${resolvedPage}`;
      window.history.replaceState({}, "", nextHash);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleQuickNav(event) {
    event?.preventDefault?.();
    const href = event?.currentTarget?.getAttribute?.("href") || "#menu";
    navigateToPage(href);
  }

  function handleBranchSelect(branchId) {
    setSelectedBranchId(branchId);
    setBranchMenuOpen(false);
    setShowCart(false);
    setBranchSuggestionState({ loading: false, error: "", success: "" });
  }

  function handleBranchMenuScroll(event) {
    const container = event.currentTarget;
    const canScroll = container.scrollHeight > container.clientHeight + 8;
    if (!canScroll) {
      return;
    }

    const reachedEnd = container.scrollTop + container.clientHeight >= container.scrollHeight - 12;
    if (reachedEnd) {
      setBranchMenuOpen(false);
    }
  }

  function getUserAuthHeaders(tokenOverride = accountToken) {
    return tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : {};
  }

  async function loadAccount(tokenOverride = accountToken) {
    if (!tokenOverride) {
      return;
    }

    try {
      setAccountState((previous) => ({ ...previous, loading: true, error: "" }));
      const data = await requestJson("/api/account", {
        headers: getUserAuthHeaders(tokenOverride),
      });
      const nextUser = { ...initialAccountUser, ...(data.user || {}) };
      const nextGifts = {
        received: Array.isArray(data.receivedGifts) ? data.receivedGifts : [],
        sent: Array.isArray(data.sentGifts) ? data.sentGifts : [],
      };
      setAccountUser(nextUser);
      setAccountOrders(Array.isArray(data.orders) ? data.orders : []);
      setAccountGifts(nextGifts);
      setProfileForm({
        fullName: nextUser.fullName || "",
        phone: nextUser.phone || "",
      });
      setFavorites(Array.isArray(nextUser.favoriteItemIds) ? nextUser.favoriteItemIds : []);
      setSavedReferences(Array.isArray(nextUser.orderReferences) ? nextUser.orderReferences.slice(0, 5) : []);
      writeCachedJson("pem-account-cache", {
        user: nextUser,
        orders: Array.isArray(data.orders) ? data.orders : [],
        gifts: nextGifts,
      });
      setCheckoutForm((previous) => ({
        ...previous,
        customerName: previous.customerName || nextUser.fullName || "",
        phone: previous.phone || nextUser.phone || "",
        email: previous.email || nextUser.email || "",
        address: previous.address || (previous.addressMode === "current" ? previous.address : nextUser.savedAddresses?.[0] || ""),
        addressMode: previous.addressMode || (nextUser.savedAddresses?.[0] ? "profile" : "current"),
      }));
      setAccountState((previous) => ({
        ...previous,
        loading: false,
        error: "",
      }));
    } catch (error) {
      const cachedAccount = readCachedJson("pem-account-cache", null, CACHE_TTL.account);
      if (cachedAccount?.user) {
        const nextUser = { ...initialAccountUser, ...(cachedAccount.user || {}) };
        const nextGifts = {
          received: Array.isArray(cachedAccount.gifts?.received) ? cachedAccount.gifts.received : [],
          sent: Array.isArray(cachedAccount.gifts?.sent) ? cachedAccount.gifts.sent : [],
        };
        setAccountUser(nextUser);
        setAccountOrders(Array.isArray(cachedAccount.orders) ? cachedAccount.orders : []);
        setAccountGifts(nextGifts);
        setProfileForm({
          fullName: nextUser.fullName || "",
          phone: nextUser.phone || "",
        });
        setFavorites(Array.isArray(nextUser.favoriteItemIds) ? nextUser.favoriteItemIds : []);
        setSavedReferences(Array.isArray(nextUser.orderReferences) ? nextUser.orderReferences.slice(0, 5) : []);
        setCheckoutForm((previous) => ({
          ...previous,
          customerName: previous.customerName || nextUser.fullName || "",
          phone: previous.phone || nextUser.phone || "",
          email: previous.email || nextUser.email || "",
          address: previous.address || (previous.addressMode === "current" ? previous.address : nextUser.savedAddresses?.[0] || ""),
          addressMode: previous.addressMode || (nextUser.savedAddresses?.[0] ? "profile" : "current"),
        }));
      }
      setAccountState((previous) => ({
        ...previous,
        loading: false,
        error: cachedAccount?.user ? "You are offline. Showing your last synced account data." : error.message,
      }));
      if (!cachedAccount?.user) {
        setAccountToken("");
      }
    } finally {
      setAccountHydrated(true);
    }
  }

  async function syncFavoritesToAccount(nextFavorites) {
    try {
      const data = await requestJson("/api/account/favorites", {
        method: "PUT",
        headers: getUserAuthHeaders(),
        payload: {
          favoriteItemIds: nextFavorites,
        },
      });
      if (data.user) {
        setAccountUser((previous) => ({ ...previous, ...data.user }));
      }
    } catch {
      // Keep local favorites responsive even if sync fails.
    }
  }

  async function loadPublicDeliveryZones() {
    try {
      const data = await requestJson("/api/delivery-zones");
      if (Array.isArray(data.deliveryZones) && data.deliveryZones.length > 0) {
        setDeliveryZones(data.deliveryZones);
        writeCachedJson("pem-delivery-zones-cache", data.deliveryZones);
        setDeliveryZoneAdminState((previous) => ({
          ...previous,
          zones: data.deliveryZones,
        }));
      }
    } catch {
      const cachedZones = readCachedJson("pem-delivery-zones-cache", defaultDeliveryZones, CACHE_TTL.deliveryZones);
      setDeliveryZones(Array.isArray(cachedZones) && cachedZones.length > 0 ? cachedZones : defaultDeliveryZones);
    }
  }

  async function loadMenuCatalog(tokenOverride = adminToken) {
    try {
      setMenuAdminState((previous) => ({
        ...previous,
        loading: true,
        error: "",
      }));
      const data = await requestJson("/api/menu", {
        headers: tokenOverride
          ? {
              Authorization: `Bearer ${tokenOverride}`,
            }
          : {},
      });
      const mergedItems = mergeMenuCatalog(menuItems, data.menuItems || []);
      setMenuCatalog(mergedItems);
      writeCachedJson("pem-menu-cache", mergedItems);
      setMenuAdminState({
        loading: false,
        saving: false,
        error: "",
        success: "",
        items: mergedItems,
      });
    } catch (error) {
      const cachedMenu = readCachedJson("pem-menu-cache", null, CACHE_TTL.menu);
      setMenuCatalog(Array.isArray(cachedMenu) && cachedMenu.length > 0 ? mergeMenuCatalog(menuItems, cachedMenu) : mergeMenuCatalog(menuItems, []));
      setMenuAdminState((previous) => ({
        ...previous,
        loading: false,
        error: Array.isArray(cachedMenu) && cachedMenu.length > 0 ? "You are offline. Showing the last synced menu." : error.message,
      }));
    }
  }

  async function loadPublicSettings(tokenOverride = adminToken) {
    const cacheKey = tokenOverride ? "pem-admin-settings-cache" : "pem-settings-cache";

    try {
      setSettingsAdminState((previous) => ({
        ...previous,
        loading: true,
        error: "",
      }));
      const data = await requestJson("/api/settings", {
        headers: tokenOverride
          ? {
              Authorization: `Bearer ${tokenOverride}`,
            }
          : {},
      });
      const nextSettings = { ...initialBusinessSettings, ...(data.settings || {}) };
      const cachedSettingsValue = tokenOverride
        ? nextSettings
        : {
            ...nextSettings,
            promoCodesText: "",
            staffAdminsText: "",
          };
      setBusinessSettings(nextSettings);
      writeCachedJson(cacheKey, cachedSettingsValue);
      setSettingsAdminState({
        loading: false,
        saving: false,
        error: "",
        success: "",
        settings: nextSettings,
      });
    } catch (error) {
      const cachedSettings = readCachedJson(cacheKey, null, CACHE_TTL.settings);
      if (cachedSettings) {
        setBusinessSettings({
          ...initialBusinessSettings,
          ...cachedSettings,
          promoCodesText: tokenOverride ? cachedSettings.promoCodesText : "",
          staffAdminsText: tokenOverride ? cachedSettings.staffAdminsText : "",
        });
      }
      setSettingsAdminState((previous) => ({
        ...previous,
        loading: false,
        error: cachedSettings ? "You are offline. Showing your last synced business settings." : error.message,
      }));
    }
  }

  async function loadDeliveryZones(tokenOverride = adminToken) {
    if (!tokenOverride) {
      return;
    }

    try {
      setDeliveryZoneAdminState((previous) => ({
        ...previous,
        loading: true,
        error: "",
        success: "",
      }));
      const response = await fetch(apiUrl("/api/delivery-zones"), {
        headers: {
          Authorization: `Bearer ${tokenOverride}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to load delivery zones.");
      }
      const zones = Array.isArray(data.deliveryZones) && data.deliveryZones.length > 0
        ? data.deliveryZones
        : defaultDeliveryZones;
      setDeliveryZones(zones);
      setDeliveryZoneAdminState({
        loading: false,
        saving: false,
        error: "",
        success: "",
        zones,
      });
    } catch (error) {
      setDeliveryZoneAdminState((previous) => ({
        ...previous,
        loading: false,
        error: error.message,
      }));
    }
  }

  async function loadPublicReviews(branchId = selectedBranch?.id || "") {
    try {
      const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
      const data = await requestJson(`/api/reviews${query}`);
      setPublicReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch {
      setPublicReviews([]);
    }
  }

  async function loadAdminData(tokenOverride = adminToken) {
    if (!tokenOverride) {
      return;
    }

    try {
      setAdminState((previous) => ({
        ...previous,
        loading: true,
        error: "",
      }));

      const response = await fetch(apiUrl("/api/admin/summary"), {
        headers: {
          Authorization: `Bearer ${tokenOverride}`,
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to load admin records right now.");
      }

      setAdminSession({ ...initialAdminSession, ...(data.admin || {}) });
      writeCachedJson("pem-admin-summary-cache", data);
      setAdminState({
        loading: false,
        error: "",
        data: {
          orders: Array.isArray(data.orders) ? data.orders : [],
          contacts: Array.isArray(data.contacts) ? data.contacts : [],
          catering: Array.isArray(data.catering) ? data.catering : [],
          reservations: Array.isArray(data.reservations) ? data.reservations : [],
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
        },
      });
    } catch (error) {
      if (error.message === "Admin login required.") {
        setAdminToken("");
      }
      const cachedAdmin = readCachedJson("pem-admin-summary-cache", null, CACHE_TTL.admin);
      if (cachedAdmin && error.message !== "Admin login required.") {
        setAdminState({
          loading: false,
          error: "You are offline. Showing the last synced admin data.",
          data: {
            orders: Array.isArray(cachedAdmin.orders) ? cachedAdmin.orders : [],
            contacts: Array.isArray(cachedAdmin.contacts) ? cachedAdmin.contacts : [],
            catering: Array.isArray(cachedAdmin.catering) ? cachedAdmin.catering : [],
            reservations: Array.isArray(cachedAdmin.reservations) ? cachedAdmin.reservations : [],
            reviews: Array.isArray(cachedAdmin.reviews) ? cachedAdmin.reviews : [],
          },
        });
        return;
      }
      setAdminState((previous) => ({
        ...previous,
        loading: false,
        error: error.message,
      }));
    }
  }

  async function handleAdminLogin(event) {
    event.preventDefault();

    try {
      setAdminLoginState({ loading: true, error: "" });
      const result = await postJson("/api/admin/login", {
        username: adminUsername,
        password: adminPassword,
      });
      setAdminUsername("");
      setAdminPassword("");
      setAdminLoginState({ loading: false, error: "" });
      setAdminSession({ ...initialAdminSession, ...(result.admin || {}) });
      setAdminToken(result.token);
    } catch (error) {
      setAdminLoginState({
        loading: false,
        error: error.message,
      });
    }
  }

  async function handleAdminLogout() {
    try {
      if (adminToken) {
        await fetch(apiUrl("/api/admin/logout"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
      }
    } finally {
      setAdminSession(initialAdminSession);
      setAdminToken("");
      setAdminPassword("");
      setAdminLoginState({ loading: false, error: "" });
    }
  }

  async function handleAdminPasswordChange(event) {
    event.preventDefault();

    try {
      setPasswordState({ loading: true, error: "", success: "" });
      const result = await fetch(apiUrl("/api/admin/change-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(passwordForm),
      });
      const data = await result.json().catch(() => ({}));

      if (!result.ok) {
        throw new Error(data.error || "Unable to change admin password.");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordState({
        loading: false,
        error: "",
        success: data.message || "Password updated successfully.",
      });

      window.setTimeout(() => {
        handleAdminLogout();
      }, 1200);
    } catch (error) {
      setPasswordState({
        loading: false,
        error: error.message,
        success: "",
      });
    }
  }

  async function handleDeliveryZonesSave(event) {
    event.preventDefault();

    try {
      setDeliveryZoneAdminState((previous) => ({
        ...previous,
        saving: true,
        error: "",
        success: "",
      }));

      const response = await fetch(apiUrl("/api/admin/delivery-zones"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          deliveryZones: deliveryZoneAdminState.zones,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to update delivery zones.");
      }

      setDeliveryZones(data.deliveryZones);
      setDeliveryZoneAdminState((previous) => ({
        ...previous,
        saving: false,
        error: "",
        success: "Delivery zones updated successfully.",
        zones: data.deliveryZones,
      }));
    } catch (error) {
      setDeliveryZoneAdminState((previous) => ({
        ...previous,
        saving: false,
        error: error.message,
        success: "",
      }));
    }
  }

  async function handleMenuSave(event) {
    event.preventDefault();

    try {
      setMenuAdminState((previous) => ({
        ...previous,
        saving: true,
        error: "",
        success: "",
      }));
      const response = await fetch(apiUrl("/api/admin/menu"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          menuItems: menuAdminState.items,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to save the PEM menu.");
      }
      const mergedItems = mergeMenuCatalog(menuItems, data.menuItems || []);
      setMenuCatalog(mergedItems);
      setMenuAdminState({
        loading: false,
        saving: false,
        error: "",
        success: "Menu updated successfully.",
        items: mergedItems,
      });
    } catch (error) {
      setMenuAdminState((previous) => ({
        ...previous,
        saving: false,
        error: error.message,
        success: "",
      }));
    }
  }

  async function handleSettingsSave(event) {
    event.preventDefault();

    try {
      setSettingsAdminState((previous) => ({
        ...previous,
        saving: true,
        error: "",
        success: "",
      }));

      const response = await fetch(apiUrl("/api/admin/settings"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          settings: settingsAdminState.settings,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to save business settings.");
      }

      const nextSettings = { ...initialBusinessSettings, ...(data.settings || {}) };
      setBusinessSettings(nextSettings);
      setSettingsAdminState({
        loading: false,
        saving: false,
        error: "",
        success: "Business settings updated successfully.",
        settings: nextSettings,
      });
    } catch (error) {
      setSettingsAdminState((previous) => ({
        ...previous,
        saving: false,
        error: error.message,
        success: "",
      }));
    }
  }

  function addDeliveryZoneRow() {
    setDeliveryZoneAdminState((previous) => ({
      ...previous,
      zones: [
        ...previous.zones,
        {
          id: `zone-${Date.now()}`,
          label: "",
          fee: 0,
          eta: "",
        },
      ],
    }));
  }

  function removeDeliveryZoneRow(zoneId) {
    setDeliveryZoneAdminState((previous) => ({
      ...previous,
      zones:
        previous.zones.length > 1
          ? previous.zones.filter((zone) => zone.id !== zoneId)
          : previous.zones,
    }));
  }

  async function handleOrderStatusChange(reference, status) {
    try {
      setOrderActionState({ loadingRef: reference, error: "", success: "" });

      const response = await fetch(apiUrl(`/api/admin/orders/${reference}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to update order status.");
      }

      setAdminState((previous) => ({
        ...previous,
        data: {
          ...previous.data,
          orders: previous.data.orders.map((order) =>
            order.reference === reference ? data.order : order,
          ),
        },
      }));
      setOrderActionState({ loadingRef: "", error: "", success: `Updated ${reference} to ${status}.` });
    } catch (error) {
      setOrderActionState({ loadingRef: "", error: error.message, success: "" });
    }
  }

  async function handleBulkOrderStatusUpdate() {
    if (selectedOrderReferences.length === 0) {
      setOrderActionState({
        loadingRef: "",
        error: "Select at least one order before running a bulk status update.",
        success: "",
      });
      return;
    }

    try {
      setOrderActionState({
        loadingRef: "bulk",
        error: "",
        success: "",
      });

      for (const reference of selectedOrderReferences) {
        const response = await fetch(apiUrl(`/api/admin/orders/${reference}/status`), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: bulkOrderStatus }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || `Unable to update ${reference}.`);
        }
        setAdminState((previous) => ({
          ...previous,
          data: {
            ...previous.data,
            orders: previous.data.orders.map((order) =>
              order.reference === reference ? data.order : order,
            ),
          },
        }));
      }

      setSelectedOrderReferences([]);
      setOrderActionState({
        loadingRef: "",
        error: "",
        success: `Updated ${selectedOrderReferences.length} order(s) to ${bulkOrderStatus}.`,
      });
    } catch (error) {
      setOrderActionState({ loadingRef: "", error: error.message, success: "" });
    }
  }

  async function handleContactStatusChange(reference, status) {
    try {
      setOrderActionState({ loadingRef: reference, error: "", success: "" });

      const response = await fetch(apiUrl(`/api/admin/contacts/${reference}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to update contact status.");
      }

      setAdminState((previous) => ({
        ...previous,
        data: {
          ...previous.data,
          contacts: previous.data.contacts.map((item) =>
            item.reference === reference ? data.contact : item,
          ),
        },
      }));
      setOrderActionState({ loadingRef: "", error: "", success: `Updated ${reference} to ${status}.` });
    } catch (error) {
      setOrderActionState({ loadingRef: "", error: error.message, success: "" });
    }
  }

  async function handleCateringStatusChange(reference, status) {
    try {
      setOrderActionState({ loadingRef: reference, error: "", success: "" });

      const response = await fetch(apiUrl(`/api/admin/catering/${reference}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to update catering status.");
      }

      setAdminState((previous) => ({
        ...previous,
        data: {
          ...previous.data,
          catering: previous.data.catering.map((item) =>
            item.reference === reference ? data.request : item,
          ),
        },
      }));
      setOrderActionState({ loadingRef: "", error: "", success: `Updated ${reference} to ${status}.` });
    } catch (error) {
      setOrderActionState({ loadingRef: "", error: error.message, success: "" });
    }
  }

  function printOrderSlip(order) {
    const slipWindow = window.open("", "_blank", "width=760,height=900");
    if (!slipWindow) {
      setOrderActionState({
        loadingRef: "",
        error: "Popup blocked. Please allow popups to print order slips.",
        success: "",
      });
      return;
    }

    const itemsMarkup = order.items
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(item.price)}</td>
            <td>${formatPrice(item.price * item.quantity)}</td>
          </tr>
          ${item.note ? `<tr><td colspan="4" style="font-size:12px;color:#555;">Note: ${item.note}</td></tr>` : ""}
        `,
      )
      .join("");

    slipWindow.document.write(`
      <html>
        <head>
          <title>PEM Order Slip - ${order.reference}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f1f1f; }
            h1, p { margin: 0 0 10px; }
            .meta { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f5f5f5; }
            .totals { margin-top: 18px; }
            .totals p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <h1>PEM Order Slip</h1>
          <p>${order.reference}</p>
          <div class="meta">
            <p><strong>Customer:</strong> ${order.customer.customerName}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Address:</strong> ${order.customer.address}</p>
            <p><strong>Landmark:</strong> ${order.customer.landmark || "-"}</p>
            <p><strong>Fulfillment:</strong> ${order.customer.fulfillmentMethod || "delivery"}</p>
            <p><strong>Scheduled For:</strong> ${order.customer.scheduledFor ? formatDateTime(order.customer.scheduledFor) : "-"}</p>
            <p><strong>Payment:</strong> ${order.customer.paymentMethod}</p>
            <p><strong>Payment Status:</strong> ${order.payment?.status || "unpaid"}</p>
            <p><strong>Payment Reference:</strong> ${order.payment?.reference || "-"}</p>
            <p><strong>Created:</strong> ${formatDateTime(order.createdAt)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Meal</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${itemsMarkup}</tbody>
          </table>
          <div class="totals">
            <p><strong>Subtotal:</strong> ${formatPrice(order.pricing.subtotal)}</p>
            <p><strong>Delivery:</strong> ${formatPrice(order.pricing.delivery)}</p>
            <p><strong>Discount:</strong> ${formatPrice(order.pricing.discount || 0)}</p>
            <p><strong>Grand Total:</strong> ${formatPrice(order.pricing.total)}</p>
          </div>
          <p style="margin-top:20px;font-size:12px;color:#666;">${businessSettings.receiptFooter}</p>
        </body>
      </html>
    `);
    slipWindow.document.close();
    slipWindow.focus();
    slipWindow.print();
  }

  function downloadOrderReceipt(order) {
    const receiptMarkup = `
      <html>
        <head>
          <title>${order.reference} Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f1f1f; }
            h1, h2, p { margin: 0 0 10px; }
            .block { margin-bottom: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f6f6f6; }
          </style>
        </head>
        <body>
          <h1>${businessSettings.appName} Receipt</h1>
          <p>${businessSettings.businessName}</p>
          <p>${order.reference}</p>
          <div class="block">
            <h2>Customer</h2>
            <p>Branch: ${order.customer.branchName || selectedBranch?.label || "PEM Branch"}</p>
            <p>${order.customer.customerName}</p>
            <p>${order.customer.phone}</p>
            <p>${order.customer.address}</p>
          </div>
          <div class="block">
            <h2>Payment</h2>
            <p>Method: ${order.customer.paymentMethod}</p>
            <p>Status: ${order.payment?.status || "unpaid"}</p>
            <p>Reference: ${order.payment?.reference || "-"}</p>
            <p>Paid At: ${formatDateTime(order.payment?.paidAt)}</p>
          </div>
          <table>
            <thead>
              <tr><th>Meal</th><th>Qty</th><th>Unit</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatPrice(item.price)}</td><td>${formatPrice(item.price * item.quantity)}</td></tr>`,
                )
                .join("")}
            </tbody>
          </table>
          <div class="block" style="margin-top:18px;">
            <p>Subtotal: ${formatPrice(order.pricing.subtotal)}</p>
            <p>Delivery: ${formatPrice(order.pricing.delivery)}</p>
            <p><strong>Total: ${formatPrice(order.pricing.total)}</strong></p>
          </div>
          <p>${businessSettings.receiptFooter}</p>
        </body>
      </html>
    `;
    const blob = new Blob([receiptMarkup], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${order.reference}-receipt.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadCsv(filename, rows) {
    const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportOrdersCsv() {
    downloadCsv(
      "pem-orders.csv",
      [
        ["Reference", "Branch", "Customer", "Phone", "Address", "Landmark", "Promo Code", "Items", "Status", "Payment Method", "Payment Status", "Payment Reference", "Discount", "Total", "Created At"],
        ...filteredAdminOrders.map((order) => [
          order.reference,
          getRecordBranchName(order),
          order.customer.customerName,
          order.customer.phone,
          order.customer.address,
          order.customer.landmark || "",
          order.customer.promoCode || "",
          order.items.map((item) => `${item.name} x${item.quantity}`).join(" | "),
          order.status,
          order.customer.paymentMethod,
          order.payment?.status || "unpaid",
          order.payment?.reference || "",
          order.pricing.discount || 0,
          order.pricing.total,
          order.createdAt,
        ]),
      ],
    );
  }

  function exportContactsCsv() {
    downloadCsv(
      "pem-contact-messages.csv",
      [
        ["Reference", "Branch", "Name", "Phone", "Message", "Created At"],
        ...filteredAdminContacts.map((message) => [
          message.reference,
          getRecordBranchName(message),
          message.name,
          message.phone,
          message.message,
          message.createdAt,
        ]),
      ],
    );
  }

  function exportCateringCsv() {
    downloadCsv(
      "pem-catering-requests.csv",
      [
        ["Reference", "Branch", "Name", "Phone", "Event Date", "Guest Count", "Event Type", "Details", "Created At"],
        ...filteredAdminCatering.map((request) => [
          request.reference,
          getRecordBranchName(request),
          request.name,
          request.phone,
          request.eventDate,
          request.guestCount,
          request.eventType,
          request.details,
          request.createdAt,
        ]),
      ],
    );
  }

  async function handleSignup(event) {
    event.preventDefault();

    try {
      setAccountState({ loading: true, error: "", success: "" });
      const data = await postJson("/api/auth/signup", signupForm);
      setAccountToken(data.token || "");
      setSignupForm(initialAccountForm);
      setLoginForm(initialLoginForm);
      setAccountState({
        loading: false,
        error: "",
        success: "Your PEM account is ready. You can now save meals, addresses, and order history.",
      });
    } catch (error) {
      setAccountState({
        loading: false,
        error: error.message,
        success: "",
      });
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setAccountState({ loading: true, error: "", success: "" });
      const data = await postJson("/api/auth/login", loginForm);
      setAccountToken(data.token || "");
      setLoginForm(initialLoginForm);
      setAccountState({
        loading: false,
        error: "",
        success: "Welcome back to PEM.",
      });
    } catch (error) {
      setAccountState({
        loading: false,
        error: error.message,
        success: "",
      });
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();

    try {
      setAccountState({ loading: true, error: "", success: "" });
      const data = await postJson("/api/auth/forgot-password", forgotPasswordForm);
      setForgotPasswordForm(initialForgotPasswordForm);
      setAccountState({
        loading: false,
        error: "",
        success: data.message || "Recovery request sent successfully.",
      });
    } catch (error) {
      setAccountState({
        loading: false,
        error: error.message,
        success: "",
      });
    }
  }

  async function handleAccountLogout() {
    try {
      if (accountToken) {
        await requestJson("/api/auth/logout", {
          method: "POST",
          headers: getUserAuthHeaders(),
        });
      }
    } catch {
      // Ignore logout request failures and clear local state anyway.
    } finally {
      setAccountToken("");
      setAuthView("login");
      setAccountState({ loading: false, error: "", success: "You have signed out." });
    }
  }

  async function handleProfileSave(event) {
    event.preventDefault();

    try {
      setAccountState({ loading: true, error: "", success: "" });
      const data = await requestJson("/api/account/profile", {
        method: "PUT",
        headers: getUserAuthHeaders(),
        payload: profileForm,
      });
      const nextUser = { ...initialAccountUser, ...(data.user || {}) };
      setAccountUser(nextUser);
      setCheckoutForm((previous) => ({
        ...previous,
        customerName: nextUser.fullName || previous.customerName,
        phone: nextUser.phone || previous.phone,
      }));
      setAccountState({
        loading: false,
        error: "",
        success: "Your PEM profile has been updated.",
      });
    } catch (error) {
      setAccountState({
        loading: false,
        error: error.message,
        success: "",
      });
    }
  }

  async function saveAddresses(nextAddresses, successMessage = "Saved addresses updated.") {
    try {
      setAccountState({ loading: true, error: "", success: "" });
      const data = await requestJson("/api/account/addresses", {
        method: "PUT",
        headers: getUserAuthHeaders(),
        payload: {
          savedAddresses: nextAddresses,
        },
      });
      const nextUser = { ...initialAccountUser, ...(data.user || {}) };
      setAccountUser(nextUser);
      setAddressDraft("");
      setCheckoutForm((previous) => ({
        ...previous,
        address: previous.address || nextUser.savedAddresses?.[0] || "",
      }));
      setAccountState({
        loading: false,
        error: "",
        success: successMessage,
      });
    } catch (error) {
      setAccountState({
        loading: false,
        error: error.message,
        success: "",
      });
    }
  }

  async function handleAddAddress(event) {
    event.preventDefault();
    const normalizedAddress = addressDraft.trim();
    if (!normalizedAddress) {
      setAccountState({ loading: false, error: "Add an address first.", success: "" });
      return;
    }
    const nextAddresses = [
      normalizedAddress,
      ...(accountUser.savedAddresses || []).filter((item) => item !== normalizedAddress),
    ].slice(0, 5);
    await saveAddresses(nextAddresses, "Address saved to your PEM account.");
  }

  async function handleRemoveAddress(address) {
    const nextAddresses = (accountUser.savedAddresses || []).filter((item) => item !== address);
    await saveAddresses(nextAddresses, "Address removed from your PEM account.");
  }

  async function handleNotificationRead(notificationId) {
    try {
      const data = await requestJson(`/api/account/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: getUserAuthHeaders(),
      });
      if (data.user) {
        setAccountUser({ ...initialAccountUser, ...data.user });
      }
    } catch {
      // Do not block the rest of the account page if notification sync fails.
    }
  }

  function handleCheckoutOrderTypeChange(nextType) {
    setCheckoutForm((previous) => ({
      ...previous,
      orderType: nextType,
      recipientEmail: nextType === "gift" ? previous.recipientEmail : "",
      giftMessage: nextType === "gift" ? previous.giftMessage : "",
      fulfillmentMethod: nextType === "gift" ? "delivery" : previous.fulfillmentMethod,
      paymentMethod: nextType === "gift" ? "Bank transfer" : previous.paymentMethod,
      paymentReference: nextType === "gift" || previous.paymentMethod === "Bank transfer" ? previous.paymentReference : "",
    }));
    setCheckoutFieldErrors((previous) => ({
      ...previous,
      recipientEmail: "",
    }));
    setCheckoutState({ loading: false, error: "" });
  }

  function openGiftAcceptForm(gift) {
    setGiftActionState({
      loadingRef: "",
      error: "",
      success: "",
      openRef: gift.reference,
      address: String(accountUser.savedAddresses?.[0] || "").trim(),
      landmark: "",
      phone: sanitizePhoneInput(accountUser.phone || ""),
    });
  }

  async function handleGiftAccept(reference) {
    const normalizedAddress = String(giftActionState.address || "").trim();
    const normalizedPhone = sanitizePhoneInput(giftActionState.phone);
    const normalizedLandmark = String(giftActionState.landmark || "").trim();

    if (!normalizedAddress) {
      setGiftActionState((previous) => ({
        ...previous,
        error: "Add the address where PEM should deliver this gift.",
        success: "",
      }));
      return;
    }

    if (normalizePhoneDigits(normalizedPhone).length < 10) {
      setGiftActionState((previous) => ({
        ...previous,
        error: "Add a valid phone number before accepting this gift.",
        success: "",
      }));
      return;
    }

    try {
      setGiftActionState((previous) => ({
        ...previous,
        loadingRef: reference,
        error: "",
        success: "",
      }));
      const data = await requestJson(`/api/gifts/${encodeURIComponent(reference)}/accept`, {
        method: "POST",
        headers: getUserAuthHeaders(),
        payload: {
          address: normalizedAddress,
          landmark: normalizedLandmark,
          phone: normalizedPhone,
        },
      });

      if (data.order) {
        setTrackingReference(data.order.reference);
        setTrackingState({
          loading: false,
          error: "",
          order: data.order,
        });
        setReceiptOrder(data.order);
        rememberPlacedOrderLocally(data.order);
      }
      if (data.user) {
        setAccountUser({ ...initialAccountUser, ...data.user });
      }
      await loadAccount();
      setGiftActionState({
        loadingRef: "",
        error: "",
        success: data.message || "Gift accepted.",
        openRef: "",
        address: "",
        landmark: "",
        phone: "",
      });
      setOrderPlaced(data.message || "Gift accepted successfully.");
      window.setTimeout(() => setOrderPlaced(""), 4500);
    } catch (error) {
      setGiftActionState((previous) => ({
        ...previous,
        loadingRef: "",
        error: error.message || "PEM could not accept this gift right now.",
        success: "",
      }));
    }
  }

  async function handleGiftDecline(reference) {
    try {
      setGiftActionState((previous) => ({
        ...previous,
        loadingRef: reference,
        error: "",
        success: "",
      }));
      const data = await requestJson(`/api/gifts/${encodeURIComponent(reference)}/decline`, {
        method: "POST",
        headers: getUserAuthHeaders(),
      });
      if (data.user) {
        setAccountUser({ ...initialAccountUser, ...data.user });
      }
      await loadAccount();
      setGiftActionState({
        loadingRef: "",
        error: "",
        success: data.message || "Gift declined.",
        openRef: "",
        address: "",
        landmark: "",
        phone: "",
      });
    } catch (error) {
      setGiftActionState((previous) => ({
        ...previous,
        loadingRef: "",
        error: error.message || "PEM could not decline this gift right now.",
        success: "",
      }));
    }
  }

  async function handlePlaceOrder() {
    const normalizedCustomerName = String(checkoutForm.customerName || "").trim();
    const normalizedCheckoutPhone = sanitizePhoneInput(checkoutForm.phone);
    const normalizedEmail = String(checkoutForm.email || "").trim();
    const normalizedRecipientEmail = String(checkoutForm.recipientEmail || "").trim().toLowerCase();
    const normalizedAddress = effectiveCheckoutAddress;
    const normalizedPromoCode = checkoutForm.promoCode.trim().toUpperCase();
    const normalizedPaymentReference = String(checkoutForm.paymentReference || "").trim();
    const nextFieldErrors = {};

    setCheckoutState({ loading: false, error: "" });
    setCheckoutFieldErrors({});

    if (cartItems.length === 0) {
      failCheckout("Add at least one meal before checkout.");
      return;
    }

    if (unavailableCartItem) {
      failCheckout(`${unavailableCartItem.name} is no longer available. Please remove it or choose another meal.`);
      return;
    }

    if (overStockCartItem) {
      failCheckout(`${overStockCartItem.name} does not have enough remaining stock for that quantity.`);
      return;
    }

    if (total < Number(businessSettings.minimumOrder || 0)) {
      failCheckout(`The current minimum order is ${formatPrice(Number(businessSettings.minimumOrder || 0))}.`);
      return;
    }

    if (!businessStatus.isOpen && !checkoutForm.scheduledFor) {
      failCheckout(
        `PEM is currently closed. ${businessStatus.label}. Schedule this order for later to continue.`,
        {},
        "scheduledFor",
      );
      return;
    }

    if (normalizedCustomerName.length < 2) {
      nextFieldErrors.customerName = "Enter your full name";
    }

    if (normalizePhoneDigits(normalizedCheckoutPhone).length < 10) {
      nextFieldErrors.phone = "Phone must be at least 10 digits";
    }

    if (selectedPaymentIsCard && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail || accountUser.email || "")) {
      nextFieldErrors.email = "Enter a valid email for card payment";
    }

    if (!isGiftOrder && checkoutForm.fulfillmentMethod !== "pickup" && normalizedAddress.length < 5) {
      nextFieldErrors.address = "Enter a delivery address";
    }

    if (isGiftOrder) {
      if (!accountToken) {
        failCheckout("Sign in before you send a meal gift through PEM.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedRecipientEmail)) {
        nextFieldErrors.recipientEmail = "Enter your friend's PEM email";
      } else if (normalizedRecipientEmail === String(accountUser.email || "").trim().toLowerCase()) {
        nextFieldErrors.recipientEmail = "Use the normal checkout if you are ordering for yourself";
      }

      if (checkoutForm.fulfillmentMethod !== "delivery") {
        failCheckout("Gift orders are delivered after your friend accepts them.", {}, "fulfillmentMethod");
        return;
      }

      if (checkoutForm.paymentMethod !== "Bank transfer") {
        failCheckout(
          "Gift orders use bank transfer so your friend never gets asked to pay on delivery.",
          {},
          "paymentMethod",
        );
        return;
      }
    }

    if (
      checkoutForm.scheduledFor &&
      !isScheduledWithinBusinessHours(checkoutForm.scheduledFor, selectedBranch?.hours || businessSettings.businessHoursText)
    ) {
      nextFieldErrors.scheduledFor = "Choose a time within PEM business hours";
    }

    if (checkoutForm.paymentMethod === "Bank transfer" && normalizedPaymentReference.length < 3) {
      nextFieldErrors.paymentReference = "Add your transfer reference";
    }

    if (checkoutForm.paymentMethod === "Bank transfer" && !bankTransferReady) {
      failCheckout(
        "PEM has not finished setting up bank transfer details yet. Please use pay on arrival or contact the team.",
      );
      return;
    }

    const firstInvalidField = Object.keys(nextFieldErrors).find((field) => nextFieldErrors[field]);
    if (firstInvalidField) {
      failCheckout(buildCheckoutMissingFieldsMessage(nextFieldErrors), nextFieldErrors, firstInvalidField);
      return;
    }

    if (normalizedPromoCode && promoValidationState.loading) {
      failCheckout("Please wait while PEM validates your promo code.", {}, "promoCode");
      return;
    }

    if (
      normalizedPromoCode &&
      (
        promoValidationState.error ||
        promoValidationState.code !== normalizedPromoCode ||
        promoValidationState.subtotal !== subtotal ||
        !promoValidationState.valid
      )
    ) {
      failCheckout(
        promoValidationState.minimumOrder
          ? `This promo code needs a minimum subtotal of ${formatPrice(promoValidationState.minimumOrder)}.`
          : "That promo code is not valid right now.",
        {},
        "promoCode",
      );
      return;
    }

    try {
      setCheckoutState({ loading: true, error: "" });

      const payload = {
        customer: {
          ...checkoutForm,
          customerName: normalizedCustomerName,
          phone: normalizedCheckoutPhone,
          promoCode: normalizedPromoCode,
          branchId: selectedBranch?.id || "",
          branchName: selectedBranch?.label || "",
          branchAddress: selectedBranch?.address || businessSettings.address,
          branchPhone: selectedBranch?.phone || businessSettings.phone,
          email: normalizedEmail || accountUser.email || "",
          address: isGiftOrder ? "" : normalizedAddress,
          deliveryZone: checkoutForm.fulfillmentMethod === "pickup" ? "Pickup at PEM" : selectedDeliveryZone.label,
          deliveryEta: checkoutForm.fulfillmentMethod === "pickup" ? "Pickup time confirmed by PEM" : selectedDeliveryZone.eta,
          paymentReference: normalizedPaymentReference,
        },
        items: cartItems,
        pricing: {
          subtotal,
          delivery,
          discount,
          total,
        },
      };

      if (isGiftOrder) {
        const giftResult = await postJson(
          "/api/gifts",
          {
            ...payload,
            recipientEmail: normalizedRecipientEmail,
            giftMessage: String(checkoutForm.giftMessage || "").trim(),
          },
          getUserAuthHeaders(),
        );
        if (giftResult.gift) {
          rememberGiftLocally(giftResult.gift, "sent");
        }
        setOrderPlaced(
          giftResult.message ||
            `Gift ${giftResult.gift?.reference || ""} sent. Your friend can accept it and choose their current address in PEM.`,
        );
        setReceiptOrder(null);
        setTrackingState(initialTrackingState);
        resetCheckoutAfterOrder();
        setCheckoutState({ loading: false, error: "" });
        if (accountToken) {
          loadAccount();
        }
        window.setTimeout(() => {
          setOrderPlaced("");
        }, 6000);
        return;
      }

      const result = await postJson("/api/orders", payload, getUserAuthHeaders());

      if (selectedPaymentIsCard) {
        const finalizeOrderState = (message) => {
          setOrderPlaced(message);
          setReceiptOrder(result.order);
          setTrackingReference(result.order.reference);
          setTrackingState({
            loading: false,
            error: "",
            order: result.order,
          });
          rememberPlacedOrderLocally(result.order);
          setCheckoutState({ loading: false, error: "" });
          loadAdminData();
          if (accountToken) {
            loadAccount();
          }
        };

        try {
          const paymentResult = await postJson(
            "/api/payments/paystack/initialize",
            {
              orderReference: result.order.reference,
              email: normalizedEmail || accountUser.email || "",
              amount: result.order.pricing?.total || total,
              customerName: normalizedCustomerName,
            },
            getUserAuthHeaders(),
          );

          if (!paymentResult.payment?.authorization_url) {
            throw new Error("PEM could not open card payment right now.");
          }

          finalizeOrderState(`Redirecting you to secure card payment for order ${result.order.reference}.`);
          window.location.assign(paymentResult.payment.authorization_url);
          return;
        } catch (paymentError) {
          finalizeOrderState(
            `Order ${result.order.reference} was saved, but card payment could not start. ${
              paymentError.message || "Please try again or contact PEM."
            }`,
          );
          window.setTimeout(() => {
            setOrderPlaced("");
          }, 8000);
          return;
        }
      }

      setOrderPlaced(`Order ${result.order.reference} submitted successfully.`);
      setReceiptOrder(result.order);
      setTrackingReference(result.order.reference);
      setTrackingState({
        loading: false,
        error: "",
        order: result.order,
      });
      rememberPlacedOrderLocally(result.order);
      resetCheckoutAfterOrder();
      setCheckoutState({ loading: false, error: "" });
      loadAdminData();
      if (accountToken) {
        loadAccount();
      }

      window.setTimeout(() => {
        setOrderPlaced("");
      }, 5000);
    } catch (error) {
      failCheckout(error.message || "PEM could not place this order right now. Please try again.");
    }
  }

  function handleWhatsAppOrder() {
    if (cartItems.length === 0) {
      setCheckoutState({ loading: false, error: "Add at least one meal before sending to WhatsApp." });
      return;
    }

    if (!checkoutForm.customerName || !checkoutForm.phone) {
      setCheckoutState({
        loading: false,
        error: "Add your name and phone number before sending your cart to WhatsApp.",
      });
      return;
    }

    const itemLines = cartItems.map((item) => {
      const noteText = item.note ? ` | Note: ${item.note}` : "";
      return `- ${item.name} x${item.quantity}${noteText}`;
    });

    const message = [
      `Hello ${businessSettings.appName}, I want to ${isGiftOrder ? "send a meal gift" : "place an order"}.`,
      "",
      `Name: ${checkoutForm.customerName}`,
      `Branch: ${selectedBranch?.label || businessSettings.appName}`,
      `Phone: ${sanitizePhoneInput(checkoutForm.phone)}`,
      ...(isGiftOrder
        ? [
            `Recipient email: ${checkoutForm.recipientEmail || "Will confirm on WhatsApp"}`,
            `Gift note: ${checkoutForm.giftMessage || "None"}`,
            `Recipient address: They will confirm it after accepting in PEM`,
          ]
        : [
            `Address: ${effectiveCheckoutAddress || "Will confirm on WhatsApp"}`,
            `Landmark: ${checkoutForm.landmark || "Will confirm on WhatsApp"}`,
          ]),
      `Area: ${selectedDeliveryZone.label}`,
      `Estimated delivery time: ${selectedDeliveryZone.eta}`,
      `Payment: ${checkoutForm.paymentMethod}`,
      `Payment reference: ${checkoutForm.paymentReference || "Will confirm later"}`,
      `Promo code: ${checkoutForm.promoCode || "None"}`,
      `Fulfillment: ${checkoutForm.fulfillmentMethod === "pickup" ? "Pickup" : "Delivery"}`,
      "",
      "Order items:",
      ...itemLines,
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      `Delivery: ${formatPrice(delivery)}`,
      `Discount: ${formatPrice(discount)}`,
      `Total: ${formatPrice(total)}`,
    ].join("\n");

    const targetPhone = getWhatsAppPhone(businessSettings);
    if (!targetPhone) {
      setCheckoutState({
        loading: false,
        error: "PEM WhatsApp support is not configured right now.",
      });
      return;
    }
    setOrderPlaced("Opening WhatsApp with your PEM order summary.");
    window.setTimeout(() => setOrderPlaced(""), 3500);
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function copyBankTransferDetail(label, value) {
    const text = String(value || "").trim();
    if (!text) {
      setOrderPlaced(`No ${label.toLowerCase()} is available to copy yet.`);
      window.setTimeout(() => setOrderPlaced(""), 2800);
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "true");
        helper.style.position = "absolute";
        helper.style.left = "-9999px";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
      }
      setOrderPlaced(`${label} copied.`);
    } catch {
      setOrderPlaced(`Could not copy ${label.toLowerCase()}.`);
    }

    window.setTimeout(() => setOrderPlaced(""), 2800);
  }

  async function handleContactSubmit(event) {
    event.preventDefault();

    try {
      setContactState({ loading: true, success: "", error: "" });
      const result = await postJson("/api/contact", {
        ...contactForm,
        branchId: selectedBranch?.id || "",
        branchName: selectedBranch?.label || "",
      });
      setContactForm(initialContact);
      setContactState({
        loading: false,
        success: `Message received. Reference: ${result.message.reference}`,
        error: "",
      });
      loadAdminData();
    } catch (error) {
      setContactState({
        loading: false,
        success: "",
        error: error.message,
      });
    }
  }

  async function handleCateringSubmit(event) {
    event.preventDefault();

    try {
      setCateringState({ loading: true, success: "", error: "" });
      const result = await postJson("/api/catering", {
        ...cateringForm,
        branchId: selectedBranch?.id || "",
        branchName: selectedBranch?.label || "",
      });
      setCateringForm(initialCatering);
      setCateringState({
        loading: false,
        success: `Catering request received. Reference: ${result.request.reference}`,
        error: "",
      });
      loadAdminData();
    } catch (error) {
      setCateringState({
        loading: false,
        success: "",
        error: error.message,
      });
    }
  }

  async function handleReservationSubmit(event) {
    event.preventDefault();

    try {
      setReservationState({ loading: true, success: "", error: "" });
      const result = await postJson("/api/reservations", {
        ...reservationForm,
        branchId: selectedBranch?.id || "",
        branchName: selectedBranch?.label || "",
      });
      setReservationForm(initialReservation);
      setReservationState({
        loading: false,
        success: `Reservation received. Reference: ${result.reservation.reference}`,
        error: "",
      });
      loadAdminData();
    } catch (error) {
      setReservationState({
        loading: false,
        success: "",
        error: error.message,
      });
    }
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    if (!trackingState.order?.reference) {
      setReviewState({ loading: false, success: "", error: "Track a delivered order first." });
      return;
    }

    try {
      setReviewState({ loading: true, success: "", error: "" });
      await postJson("/api/reviews", {
        orderReference: trackingState.order.reference,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
        branchId: trackingState.order.customer?.branchId || selectedBranch?.id || "",
        branchName: trackingState.order.customer?.branchName || selectedBranch?.label || "",
      });
      setReviewForm(initialReviewForm);
      setReviewState({
        loading: false,
        success: "Thank you. Your review has been saved.",
        error: "",
      });
      loadPublicReviews(trackingState.order.customer?.branchId || selectedBranch?.id || "");
      loadAdminData();
    } catch (error) {
      setReviewState({
        loading: false,
        success: "",
        error: error.message,
      });
    }
  }

  async function handleDietarySubmit(event) {
    event.preventDefault();

    if (dietaryNeeds.trim().length < 3) {
      setDietaryState({
        ...initialDietaryState,
        error: "Tell PEM a little about the dietary need first.",
      });
      return;
    }

    try {
      setDietaryState({
        ...initialDietaryState,
        loading: true,
      });

      const result = await postJson("/api/ai/dietary-match", {
        needs: dietaryNeeds,
        menuItems: menuCatalog.filter((item) => !item.hidden).map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          rating: item.rating,
          spicy: item.spicy,
          badge: item.badge,
          description: item.description,
          dietaryProfile: item.dietaryProfile,
          dietaryTags: item.dietaryTags,
        })),
      });

      setDietaryState({
        loading: false,
        error: "",
        summary: result.summary || "",
        caution: result.caution || "",
        matches: Array.isArray(result.matches) ? result.matches : [],
        mode: result.mode || "",
        degraded: Boolean(result.degraded),
      });
      setShowDietaryMatchesOnly(Array.isArray(result.matches) && result.matches.length > 0);
    } catch (error) {
      const fallbackResult = buildClientDietaryFallback(dietaryNeeds, menuCatalog.filter((item) => !item.hidden));
      setDietaryState(fallbackResult);
      setShowDietaryMatchesOnly(fallbackResult.matches.length > 0);
    }
  }

  function clearDietaryAssistant() {
    setDietaryNeeds("");
    setDietaryState(initialDietaryState);
    setShowDietaryMatchesOnly(false);
  }

  async function handleTrackOrder(event) {
    event.preventDefault();
    const normalizedReference = trackingReference.trim().toUpperCase();

    if (!normalizedReference) {
      setTrackingState({
        ...initialTrackingState,
        error: "Enter your order reference first.",
      });
      return;
    }

    try {
      setTrackingState({
        loading: true,
        error: "",
        order: null,
      });

      const data = await requestJson(`/api/orders/${encodeURIComponent(normalizedReference)}`);

      setTrackingState({
        loading: false,
        error: "",
        order: data.order,
      });
      writeCachedJson(`pem-track-${normalizedReference}`, data.order);
      if (data.order?.customer?.branchId) {
        setSelectedBranchId(data.order.customer.branchId);
      }
      setTrackingReference(normalizedReference);
      setSavedReferences((previous) => [
        normalizedReference,
        ...previous.filter((reference) => reference !== normalizedReference),
      ].slice(0, 5));
    } catch (error) {
      const cachedOrder = readCachedJson(`pem-track-${normalizedReference}`, null, CACHE_TTL.tracking);
      if (cachedOrder) {
        setTrackingState({
          loading: false,
          error: "You are offline. Showing the last synced tracking details.",
          order: cachedOrder,
        });
        return;
      }
      setTrackingState({
        loading: false,
        error: error.message,
        order: null,
      });
    }
  }

  if (!accountHydrated) {
    return (
      <div className="auth-shell">
        <ThemeToggle theme={theme} onToggle={toggleTheme} floating />

        <section className="auth-hero">
          <div className="auth-hero__brand">
            <span className="brand__mark">
              <img src={logo} alt="Precious Events Makers logo" />
            </span>
            <div className="brand__text">
              <strong>{businessSettings.appName}</strong>
              <small>{businessSettings.businessName}</small>
            </div>
          </div>
          <div className="auth-loading-card">
            <p className="eyebrow">Loading account access</p>
            <h1>Preparing your PEM experience.</h1>
            <p>Please wait a moment while we check your sign-in session.</p>
          </div>
        </section>
      </div>
    );
  }

  if (!accountToken && !adminToken) {
    return (
      <div className="auth-shell">
        <ThemeToggle theme={theme} onToggle={toggleTheme} floating />

        <section className="auth-hero">
          <div className={authView === "login" ? "auth-hero__copy auth-hero__copy--login reveal reveal--up" : "auth-hero__copy reveal reveal--up"}>
            {authView === "login" ? (
              <>
                <h1>Welcome to the PEM experience.</h1>
                <div className="auth-hero__logo-showcase">
                  <span className="auth-hero__logo-mark">
                    <img src={logo} alt="Precious Events Makers logo" />
                  </span>
                  <div className="auth-hero__logo-copy">
                    <strong>{businessSettings.appName}</strong>
                    <small>{businessSettings.businessName}</small>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="auth-hero__brand">
                  <span className="brand__mark">
                    <img src={logo} alt="Precious Events Makers logo" />
                  </span>
                  <div className="brand__text">
                    <strong>{businessSettings.appName}</strong>
                    <small>{businessSettings.businessName}</small>
                  </div>
                </div>

                <p className="eyebrow">Welcome to PEM</p>
                <h1>{authView === "signup" ? "Create your PEM account." : "Recover your PEM account."}</h1>
                <p>
                  {authView === "signup"
                    ? "Create your PEM account once, then keep your saved meals, delivery addresses, notifications, and order history in one place."
                    : "Use your email and phone number to reset your password and get back into PEM quickly."}
                </p>
              </>
            )}

            <div className="branch-selector-card">
              <div>
                <p className="eyebrow">Current branch</p>
                <strong>{selectedBranch?.label || `${businessSettings.appName} Main Branch`}</strong>
                <span>{selectedBranch?.address || businessSettings.address}</span>
              </div>
              <label className="field">
                <span>Choose branch</span>
                <select value={selectedBranch?.id || ""} onChange={(event) => handleBranchSelect(event.target.value)}>
                  {branchLocations.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="branch-selector-card__actions">
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={handleUseClosestBranch}
                  disabled={branchSuggestionState.loading}
                >
                  {branchSuggestionState.loading ? "Checking location..." : "Use closest branch"}
                </button>
                {branchSuggestionState.error ? (
                  <small className="field__error">{branchSuggestionState.error}</small>
                ) : branchSuggestionState.success ? (
                  <small className="field__success">{branchSuggestionState.success}</small>
                ) : null}
              </div>
            </div>

          </div>

          <div className="auth-hero__forms">
            {authView === "login" ? (
              <form className="service-form auth-card reveal reveal--up reveal--delay-1" onSubmit={handleLogin}>
                <div className="auth-card__top">
                  <div>
                    <p className="eyebrow">Account Access</p>
                    <h3>Log in to your account</h3>
                  </div>
                </div>

                <div className="service-form__grid service-form__grid--single auth-form-stack">
                  <label className="field" data-checkout-field="customerName">
                    <span>Email address</span>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((previous) => ({ ...previous, email: event.target.value }))
                      }
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="field" data-checkout-field="phone">
                    <span>Password</span>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((previous) => ({ ...previous, password: event.target.value }))
                      }
                      placeholder="Your PEM password"
                    />
                  </label>
                </div>

                {accountState.error ? <p className="form-message form-message--error">{accountState.error}</p> : null}
                {accountState.success ? <p className="form-message form-message--success">{accountState.success}</p> : null}

                <div className="auth-card__actions auth-card__actions--login">
                  <button type="submit" className="button button--primary" disabled={accountState.loading}>
                    {accountState.loading ? "Signing in..." : "Log In"}
                  </button>
                  <button type="button" className="auth-link auth-link--action" onClick={() => setAuthView("forgot")}>
                    Forgot password?
                  </button>
                </div>

                {!isInstalled ? (
                  <button type="button" className="button button--ghost button--small auth-install-button" onClick={handleInstallApp}>
                    Install PEM App
                  </button>
                ) : null}

                <div className="auth-card__divider">
                  <span>Other options</span>
                </div>

                <div className="auth-links auth-links--premium">
                  <p className="auth-links__row">
                    <span>Are you a staff member?</span>
                    <button type="button" className="auth-link" onClick={() => setAuthView("admin")}>
                      Admin login
                    </button>
                  </p>
                  <p className="auth-links__row">
                    <span>Do not have an account?</span>
                    <button type="button" className="auth-link" onClick={() => setAuthView("signup")}>
                      Sign up
                    </button>
                  </p>
                </div>
              </form>
            ) : null}

            {authView === "signup" ? (
              <form className="service-form auth-card reveal reveal--up reveal--delay-1" onSubmit={handleSignup}>
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">New customer</p>
                    <h3>Create your PEM account</h3>
                  </div>
                  <span>Signup</span>
                </div>

                <div className="service-form__grid">
                  <label className="field" data-checkout-field="customerName">
                    <span>Full name</span>
                    <input
                      type="text"
                      value={signupForm.fullName}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, fullName: event.target.value }))
                      }
                      placeholder="Your full name"
                    />
                  </label>

                  <label className="field" data-checkout-field="phone">
                    <span>Phone number</span>
                    <input
                      type="tel"
                      value={signupForm.phone}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, phone: sanitizePhoneInput(event.target.value) }))
                      }
                      placeholder="0803 334 5161"
                    />
                  </label>

                  <label className="field" data-checkout-field="email">
                    <span>Email</span>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, email: event.target.value }))
                      }
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="field" data-checkout-field="customerName">
                    <span>Password</span>
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, password: event.target.value }))
                      }
                      placeholder="At least 6 characters"
                    />
                  </label>

                  <label className="field" data-checkout-field="phone">
                    <span>Delivery address</span>
                    <input
                      type="text"
                      value={signupForm.address}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, address: event.target.value }))
                      }
                      placeholder="Street, area, city"
                    />
                    <small className="cart-help">PEM will save this so checkout feels faster next time.</small>
                  </label>

                  <label className="field" data-checkout-field="email">
                    <span>Referral code</span>
                    <input
                      type="text"
                      value={signupForm.referralCode}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, referralCode: event.target.value }))
                      }
                      placeholder="Optional referral code"
                    />
                  </label>
                </div>

                {accountState.error ? <p className="form-message form-message--error">{accountState.error}</p> : null}
                {accountState.success ? <p className="form-message form-message--success">{accountState.success}</p> : null}

                <button type="submit" className="button button--primary" disabled={accountState.loading}>
                  {accountState.loading ? "Creating account..." : "Create Account"}
                </button>

                <div className="auth-links">
                  <p className="auth-links__row">
                    <span>Already have an account?</span>
                    <button type="button" className="auth-link" onClick={() => setAuthView("login")}>
                      Log in
                    </button>
                  </p>
                </div>
              </form>
            ) : null}

            {authView === "forgot" ? (
              <form className="service-form auth-card reveal reveal--up reveal--delay-1" onSubmit={handleForgotPassword}>
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">Forgot password?</p>
                    <h3>Request account recovery</h3>
                  </div>
                  <span>Recovery</span>
                </div>

                <p className="auth-card__helper">
                  Enter the email and phone number linked to your PEM account. PEM will verify the request before
                  helping you regain access.
                </p>

                <div className="service-form__grid">
                  <label className="field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={forgotPasswordForm.email}
                      onChange={(event) =>
                        setForgotPasswordForm((previous) => ({ ...previous, email: event.target.value }))
                      }
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="field">
                    <span>Phone number</span>
                    <input
                      type="tel"
                      value={forgotPasswordForm.phone}
                      onChange={(event) =>
                        setForgotPasswordForm((previous) => ({ ...previous, phone: sanitizePhoneInput(event.target.value) }))
                      }
                      placeholder="The number on your account"
                    />
                  </label>
                </div>

                {accountState.error ? <p className="form-message form-message--error">{accountState.error}</p> : null}
                {accountState.success ? <p className="form-message form-message--success">{accountState.success}</p> : null}

                <button type="submit" className="button button--primary" disabled={accountState.loading}>
                  {accountState.loading ? "Sending request..." : "Request recovery"}
                </button>

                <div className="auth-links">
                  <p className="auth-links__row">
                    <span>Remembered your password?</span>
                    <button type="button" className="auth-link" onClick={() => setAuthView("login")}>
                      Back to login
                    </button>
                  </p>
                </div>
              </form>
            ) : null}

            {authView === "admin" ? (
              <form className="service-form auth-card reveal reveal--up reveal--delay-1" onSubmit={handleAdminLogin}>
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">Admin Access</p>
                    <h3>Log in as PEM staff</h3>
                  </div>
                  <span>Admin</span>
                </div>

                <div className="service-form__grid">
                  <label className="field">
                    <span>Username</span>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(event) => setAdminUsername(event.target.value)}
                      placeholder="owner or manager"
                    />
                  </label>

                  <label className="field">
                    <span>Password</span>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(event) => setAdminPassword(event.target.value)}
                      placeholder="Your admin password"
                    />
                  </label>
                </div>

                {adminLoginState.error ? <p className="form-message form-message--error">{adminLoginState.error}</p> : null}

                <button type="submit" className="button button--primary" disabled={adminLoginState.loading}>
                  {adminLoginState.loading ? "Signing in..." : "Enter Admin"}
                </button>

                <div className="auth-links">
                  <p className="auth-links__row">
                    <span>Back to customer access?</span>
                    <button type="button" className="auth-link" onClick={() => setAuthView("login")}>
                      Customer login
                    </button>
                  </p>
                </div>
              </form>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className={isCompactHeader ? "topbar is-compact" : "topbar"}>
        <div className="topbar__identity">
          <button
            type="button"
            className="brand"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="brand__mark">
              <img src={logo} alt="Precious Events Makers logo" />
            </span>
            <span className="brand__text">
              <strong>{businessSettings.appName}</strong>
              <small>{businessSettings.businessName}</small>
            </span>
          </button>
          <div className="topbar__welcome">
            <span>WELCOME</span>
            <strong>{activeWelcomeName}</strong>
          </div>
        </div>

        <nav className="topbar__nav">
          <button type="button" className={activePage === "menu" ? "topbar__nav-link is-active" : "topbar__nav-link"} onClick={() => navigateToPage("menu")}>Menu</button>
          <button type="button" className={activePage === "track" ? "topbar__nav-link is-active" : "topbar__nav-link"} onClick={() => navigateToPage("track")}>Track Order</button>
          <button type="button" className={activePage === "catering" ? "topbar__nav-link is-active" : "topbar__nav-link"} onClick={() => navigateToPage("catering")}>Catering</button>
          <button type="button" className={activePage === "contact" ? "topbar__nav-link is-active" : "topbar__nav-link"} onClick={() => navigateToPage("contact")}>Contact</button>
          <button type="button" className={activePage === "account" ? "topbar__nav-link is-active" : "topbar__nav-link"} onClick={() => navigateToPage("account")}>Account</button>
          <button type="button" className={activePage === "admin" ? "topbar__nav-link is-active" : "topbar__nav-link"} onClick={() => navigateToPage("admin")}>{adminToken ? "Admin" : "Admin Access"}</button>
        </nav>

        <div className="topbar__actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button type="button" className="cart-toggle" onClick={() => setShowCart(true)}>
            <span>Order</span>
            <strong>{totalItems}</strong>
          </button>
        </div>
      </header>

      {orderPlaced ? (
        <div className="toast" role="status">
          {orderPlaced}
        </div>
      ) : null}

      {!isOnline ? (
        <div className="toast toast--warning" role="status">
          You are offline. PEM is showing cached menu and account data where available, but new orders and updates still need internet access.
        </div>
      ) : null}

      <a
        className="support-fab"
        href={supportWhatsAppUrl}
        target="_blank"
        rel="noreferrer"
      >
        Need Help?
      </a>
      {!showCart ? (
        <button type="button" className="cart-fab" onClick={() => setShowCart(true)}>
          <span>Cart</span>
          <strong>{totalItems}</strong>
        </button>
      ) : null}

      <main>
        <section className="branch-bar">
          <button
            type="button"
            className={branchMenuOpen ? "branch-bar__toggle is-open" : "branch-bar__toggle"}
            onClick={() => setBranchMenuOpen((current) => !current)}
          >
            <div>
              <span className="branch-bar__eyebrow">Serving from</span>
              <strong>{selectedBranch?.label || `${businessSettings.appName} Branch`}</strong>
              <small>{selectedBranch?.address || businessSettings.address}</small>
            </div>
            <span>{branchMenuOpen ? "Close" : "Switch"}</span>
          </button>

          <div className="branch-bar__summary">
            <span>{selectedBranch?.hours || businessSettings.businessHoursText}</span>
            <strong>{selectedBranch?.phone || businessSettings.phone}</strong>
            <button
              type="button"
              className="button button--ghost button--small branch-bar__location-button"
              onClick={handleUseClosestBranch}
              disabled={branchSuggestionState.loading}
            >
              {branchSuggestionState.loading ? "Finding closest..." : "Use closest branch"}
            </button>
          </div>
        </section>

        {branchSuggestionState.error ? (
          <p className="form-message form-message--error branch-feedback">{branchSuggestionState.error}</p>
        ) : branchSuggestionState.success ? (
          <p className="form-message form-message--success branch-feedback">{branchSuggestionState.success}</p>
        ) : null}

        {branchMenuOpen ? (
          <section className="branch-menu" onScroll={handleBranchMenuScroll}>
            {branchLocations.map((branch) => (
              <button
                key={branch.id}
                type="button"
                className={branch.id === selectedBranch?.id ? "branch-menu__item is-active" : "branch-menu__item"}
                onClick={() => handleBranchSelect(branch.id)}
              >
                <strong>{branch.label}</strong>
                <span>{branch.address}</span>
                <small>{branch.note}</small>
              </button>
            ))}
          </section>
        ) : null}

        {businessSettings.promoBanner ? (
          <section className="promo-banner">
            <p>{businessSettings.promoBanner}</p>
          </section>
        ) : null}

        {receiptOrder ? (
          <section className="receipt-section">
              <div className="receipt-card reveal reveal--up">
                <div className="account-card__header">
                  <div>
                  <p className="eyebrow">{receiptOrder.status === "awaiting_payment" ? "Payment pending" : "Checkout complete"}</p>
                  <h2>{receiptOrder.reference}</h2>
                  </div>
                  <span>{receiptOrder.status.replaceAll("_", " ")}</span>
                </div>
              <p>
                {receiptOrder.status === "awaiting_payment" ? (
                  <>
                    PEM saved your order for <strong>{formatPrice(receiptOrder.pricing.total)}</strong>, but it will only be confirmed after your card payment succeeds.
                    Complete payment to move it into the kitchen queue.
                  </>
                ) : (
                  <>
                    PEM received your order for <strong>{formatPrice(receiptOrder.pricing.total)}</strong>.
                    You can track it below, download the receipt, or continue browsing the menu.
                  </>
                )}
              </p>
              <p className="cart-help">Branch: <strong>{receiptOrder.customer?.branchName || selectedBranch?.label || "PEM Branch"}</strong></p>
              {receiptEtaCountdown ? <p className="cart-help">{receiptEtaCountdown}</p> : null}
              <div className="account-list__actions">
                <button type="button" className="button button--primary" onClick={() => downloadOrderReceipt(receiptOrder)}>
                  Download Receipt
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => {
                    setCheckoutForm((previous) => ({
                      ...previous,
                      customerName: receiptOrder.customer?.customerName || previous.customerName,
                      phone: receiptOrder.customer?.phone || previous.phone,
                      address: receiptOrder.customer?.address || previous.address,
                      landmark: receiptOrder.customer?.landmark || previous.landmark,
                      deliveryZone: deliveryZones.find((zone) => zone.label === receiptOrder.customer?.deliveryZone)?.id || previous.deliveryZone,
                    }));
                    setShowCart(true);
                  }}
                >
                  Edit Order Details
                </button>
                {receiptWhatsAppUrl ? (
                  <a
                    href={receiptWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button button--ghost"
                  >
                    Confirm On WhatsApp
                  </a>
                ) : null}
                <button type="button" className="button button--ghost" onClick={() => setReceiptOrder(null)}>
                  Dismiss
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {activePage === "account" ? (
        <section className="account-section" id="account">
          <div className="section-heading reveal reveal--up">
            <p className="eyebrow">Customer Account</p>
            <h2>Create a PEM account for faster repeat ordering.</h2>
            <p>
              Save your details, keep favorite meals across devices, reuse delivery addresses, and
              follow your order history from one place.
            </p>
          </div>

          {!accountToken && !adminToken ? (
            <div className="account-grid">
              <form className="service-form reveal reveal--up" onSubmit={handleSignup}>
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">New here?</p>
                    <h3>Create your PEM account</h3>
                  </div>
                  <span>Signup</span>
                </div>

                <div className="service-form__grid">
                  <label className="field">
                    <span>Full name</span>
                    <input
                      type="text"
                      value={signupForm.fullName}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, fullName: event.target.value }))
                      }
                      placeholder="Your full name"
                    />
                  </label>

                  <label className="field">
                    <span>Phone number</span>
                    <input
                      type="tel"
                      value={signupForm.phone}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, phone: event.target.value }))
                      }
                      placeholder="0803 334 5161"
                    />
                  </label>

                  <label className="field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, email: event.target.value }))
                      }
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="field">
                    <span>Password</span>
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(event) =>
                        setSignupForm((previous) => ({ ...previous, password: event.target.value }))
                      }
                      placeholder="At least 6 characters"
                    />
                  </label>
                </div>

                {accountState.error ? <p className="form-message form-message--error">{accountState.error}</p> : null}
                {accountState.success ? <p className="form-message form-message--success">{accountState.success}</p> : null}

                <button type="submit" className="button button--primary" disabled={accountState.loading}>
                  {accountState.loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <form className="service-form reveal reveal--up reveal--delay-1" onSubmit={handleLogin}>
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">Already registered?</p>
                    <h3>Sign in to continue</h3>
                  </div>
                  <span>Login</span>
                </div>

                <div className="service-form__grid">
                  <label className="field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((previous) => ({ ...previous, email: event.target.value }))
                      }
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="field">
                    <span>Password</span>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((previous) => ({ ...previous, password: event.target.value }))
                      }
                      placeholder="Your PEM password"
                    />
                  </label>
                </div>

                <p className="account-helper">
                  Sign in to sync favorites, addresses, notifications, and order history across devices.
                </p>

                <button type="submit" className="button button--ghost" disabled={accountState.loading}>
                  {accountState.loading ? "Signing in..." : "Sign In"}
                </button>
                {!isInstalled ? (
                  <button type="button" className="button button--ghost button--small" onClick={handleInstallApp}>
                    Install PEM App
                  </button>
                ) : null}
              </form>
            </div>
          ) : accountToken ? (
            <div className="account-grid">
              <article className="account-card reveal reveal--up">
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">PEM profile</p>
                    <h3>{accountUser.fullName || "Your account"}</h3>
                  </div>
                  <button type="button" className="button button--ghost button--small" onClick={handleAccountLogout}>
                    Sign Out
                  </button>
                </div>

                <div className="account-kpis">
                  <div>
                    <strong>{accountOrders.length}</strong>
                    <span>Orders</span>
                  </div>
                  <div>
                    <strong>{favorites.length}</strong>
                    <span>Saved meals</span>
                  </div>
                  <div>
                    <strong>{accountUser.savedAddresses.length}</strong>
                    <span>Saved addresses</span>
                  </div>
                </div>
                <p className="account-helper">
                  Your referral code: <strong>{accountUser.referralCode || "Will appear after signup"}</strong>
                </p>
                {accountUser.referralCode ? (
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={async () => {
                      const referralLink = `${window.location.origin}${window.location.pathname}?ref=${accountUser.referralCode}#account`;
                      try {
                        await navigator.clipboard.writeText(referralLink);
                        setOrderPlaced("Referral link copied.");
                        window.setTimeout(() => setOrderPlaced(""), 2200);
                      } catch {
                        setOrderPlaced("Copy failed. You can share your referral code manually.");
                        window.setTimeout(() => setOrderPlaced(""), 2200);
                      }
                    }}
                  >
                    Copy Referral Link
                  </button>
                ) : null}
                {!isInstalled ? (
                  <button type="button" className="button button--ghost button--small" onClick={handleInstallApp}>
                    Install PEM App
                  </button>
                ) : (
                  <p className="account-helper">PEM is already installed on this device.</p>
                )}

                <form className="service-form account-card__panel" onSubmit={handleProfileSave}>
                  <div className="service-form__grid">
                    <label className="field">
                      <span>Full name</span>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(event) =>
                          setProfileForm((previous) => ({ ...previous, fullName: event.target.value }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Phone number</span>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(event) =>
                          setProfileForm((previous) => ({ ...previous, phone: event.target.value }))
                        }
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span>Email</span>
                    <input type="email" value={accountUser.email} disabled />
                  </label>

                  <button type="submit" className="button button--primary" disabled={accountState.loading}>
                    {accountState.loading ? "Saving..." : "Save Profile"}
                  </button>
                </form>

                {accountState.error ? <p className="form-message form-message--error">{accountState.error}</p> : null}
                {accountState.success ? <p className="form-message form-message--success">{accountState.success}</p> : null}
              </article>

              <article className="account-card reveal reveal--up reveal--delay-1">
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">Loyalty</p>
                    <h3>{accountUser.loyaltyTier} tier</h3>
                  </div>
                  <span>{accountUser.loyaltyPoints} pts</span>
                </div>

                <div className="account-progress">
                  <div className="account-progress__bar">
                    <span style={{ width: `${loyaltyProgress}%` }} />
                  </div>
                  <p>
                    Earn points whenever you place an order through your PEM account. Bronze upgrades to
                    silver at 60 points, then gold at 120 points.
                  </p>
                </div>

                <form className="service-form account-card__panel" onSubmit={handleAddAddress}>
                  <div className="account-card__header">
                    <div>
                      <p className="eyebrow">Saved addresses</p>
                      <h3>Reuse delivery locations</h3>
                    </div>
                    <span>{accountUser.savedAddresses.length}/5</span>
                  </div>

                  <label className="field">
                    <span>Add another address</span>
                    <input
                      type="text"
                      value={addressDraft}
                      onChange={(event) => setAddressDraft(event.target.value)}
                      placeholder="Your preferred delivery address"
                    />
                  </label>

                  <button type="submit" className="button button--ghost" disabled={accountState.loading}>
                    Save Address
                  </button>

                  {accountUser.savedAddresses.length > 0 ? (
                    <div className="account-list">
                      {accountUser.savedAddresses.map((address) => (
                        <div key={address} className="account-list__item">
                          <div>
                            <strong>{address}</strong>
                          </div>
                          <div className="account-list__actions">
                            <button
                              type="button"
                              className="button button--ghost button--small"
                              onClick={() => {
                                setCustomCheckoutAddress(address);
                                setCheckoutForm((previous) => ({
                                  ...previous,
                                  addressMode: "current",
                                  address,
                                }));
                              }}
                            >
                              Use in checkout
                            </button>
                            <button
                              type="button"
                              className="button button--ghost button--small"
                              onClick={() => handleRemoveAddress(address)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="account-helper">Save your most-used delivery addresses here.</p>
                  )}
                </form>
              </article>

              <article className="account-card reveal reveal--up">
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">Notifications</p>
                    <h3>Order and payment updates</h3>
                  </div>
                  <span>{unreadNotifications.length} unread</span>
                </div>

                <div className="account-list">
                  {(accountUser.notifications || []).length > 0 ? (
                    accountUser.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={notification.read ? "account-list__item" : "account-list__item is-unread"}
                      >
                        <div>
                          <strong>{notification.message}</strong>
                          <p>{formatDateTime(notification.createdAt)}</p>
                        </div>
                        {!notification.read ? (
                          <button
                            type="button"
                            className="button button--ghost button--small"
                            onClick={() => handleNotificationRead(notification.id)}
                          >
                            Mark Read
                          </button>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="account-helper">PEM account updates will show here once you start ordering.</p>
                  )}
                </div>
              </article>

              <article className="account-card reveal reveal--up reveal--delay-1">
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">Gift meals</p>
                    <h3>Send and receive food gifts</h3>
                  </div>
                  <span>{pendingReceivedGifts.length} pending</span>
                </div>

                {giftActionState.error ? <p className="form-message form-message--error">{giftActionState.error}</p> : null}
                {giftActionState.success ? <p className="form-message form-message--success">{giftActionState.success}</p> : null}

                <div className="gift-summary">
                  <div>
                    <strong>{pendingReceivedGifts.length}</strong>
                    <span>Waiting for you</span>
                  </div>
                  <div>
                    <strong>{accountGifts.sent.length}</strong>
                    <span>Sent by you</span>
                  </div>
                </div>

                {(accountGifts.received || []).length > 0 ? (
                  <>
                    <p className="eyebrow">Received gifts</p>
                    <div className="account-list">
                      {accountGifts.received.map((gift) => (
                        <div key={gift.reference} className={gift.status === "pending_acceptance" ? "account-list__item is-unread" : "account-list__item"}>
                          <div className="gift-card__content">
                            <strong>{gift.senderName} sent you a meal gift</strong>
                            <p>
                              {gift.reference} • {gift.branchName} • {formatPrice(Number(gift.pricing?.total) || 0)}
                            </p>
                            {gift.giftMessage ? <p className="gift-card__message">"{gift.giftMessage}"</p> : null}
                            <div className="gift-card__meta">
                              <span className={`gift-pill gift-pill--${gift.status}`}>{gift.status.replaceAll("_", " ")}</span>
                              <span>{gift.deliveryZone || "Delivery details confirmed after acceptance"}</span>
                            </div>
                            {gift.status === "pending_acceptance" ? (
                              <div className="gift-card__actions">
                                <button
                                  type="button"
                                  className="button button--primary button--small"
                                  onClick={() =>
                                    giftActionState.openRef === gift.reference
                                      ? setGiftActionState(initialGiftActionState)
                                      : openGiftAcceptForm(gift)
                                  }
                                >
                                  {giftActionState.openRef === gift.reference ? "Hide" : "Accept"}
                                </button>
                                <button
                                  type="button"
                                  className="button button--ghost button--small"
                                  onClick={() => handleGiftDecline(gift.reference)}
                                  disabled={giftActionState.loadingRef === gift.reference}
                                >
                                  {giftActionState.loadingRef === gift.reference ? "Working..." : "Decline"}
                                </button>
                              </div>
                            ) : gift.orderReference ? (
                              <div className="gift-card__actions">
                                <button
                                  type="button"
                                  className="button button--ghost button--small"
                                  onClick={() => {
                                    setTrackingReference(gift.orderReference);
                                    navigateToPage("#track");
                                  }}
                                >
                                  Track Order
                                </button>
                              </div>
                            ) : null}

                            {giftActionState.openRef === gift.reference ? (
                              <div className="gift-accept-form">
                                <div className="checkout-group__header">
                                  <strong>Choose where PEM should deliver this gift</strong>
                                  <span>Your saved profile address stays unchanged unless you edit it inside Account.</span>
                                </div>
                                {accountUser.savedAddresses.length > 0 ? (
                                  <div className="gift-address-list">
                                    {accountUser.savedAddresses.map((address) => (
                                      <button
                                        key={address}
                                        type="button"
                                        className="button button--ghost button--small"
                                        onClick={() =>
                                          setGiftActionState((previous) => ({
                                            ...previous,
                                            address,
                                          }))
                                        }
                                      >
                                        Use saved address
                                      </button>
                                    ))}
                                  </div>
                                ) : null}
                                <label className="field">
                                  <span>Current delivery address</span>
                                  <textarea
                                    rows="3"
                                    value={giftActionState.address}
                                    onChange={(event) =>
                                      setGiftActionState((previous) => ({
                                        ...previous,
                                        address: event.target.value,
                                      }))
                                    }
                                    placeholder="Street, area, city"
                                  />
                                </label>
                                <label className="field">
                                  <span>Phone number</span>
                                  <input
                                    type="tel"
                                    value={giftActionState.phone}
                                    onChange={(event) =>
                                      setGiftActionState((previous) => ({
                                        ...previous,
                                        phone: sanitizePhoneInput(event.target.value),
                                      }))
                                    }
                                    placeholder="0803 334 5161"
                                  />
                                </label>
                                <label className="field">
                                  <span>Nearest landmark (optional)</span>
                                  <input
                                    type="text"
                                    value={giftActionState.landmark}
                                    onChange={(event) =>
                                      setGiftActionState((previous) => ({
                                        ...previous,
                                        landmark: event.target.value,
                                      }))
                                    }
                                    placeholder="Bus stop, estate gate, popular shop"
                                  />
                                </label>
                                <div className="gift-card__actions">
                                  <button
                                    type="button"
                                    className="button button--primary button--small"
                                    onClick={() => handleGiftAccept(gift.reference)}
                                    disabled={giftActionState.loadingRef === gift.reference}
                                  >
                                    {giftActionState.loadingRef === gift.reference ? "Confirming..." : "Confirm gift"}
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="account-helper">When another PEM user buys a meal for you, it will appear here for acceptance.</p>
                )}

                {(accountGifts.sent || []).length > 0 ? (
                  <>
                    <p className="eyebrow">Sent gifts</p>
                    <div className="account-list">
                      {accountGifts.sent.map((gift) => (
                        <div key={gift.reference} className="account-list__item">
                          <div className="gift-card__content">
                            <strong>Gift to {gift.recipientName || gift.recipientEmail}</strong>
                            <p>
                              {gift.reference} • {formatPrice(Number(gift.pricing?.total) || 0)} • {formatDateTime(gift.createdAt)}
                            </p>
                            <div className="gift-card__meta">
                              <span className={`gift-pill gift-pill--${gift.status}`}>{gift.status.replaceAll("_", " ")}</span>
                              <span>{gift.orderReference ? `Order ${gift.orderReference}` : "Waiting on your friend"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </article>

              <article className="account-card reveal reveal--up reveal--delay-1">
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">Order history</p>
                    <h3>Quick reorder and receipts</h3>
                  </div>
                  <span>{accountOrders.length}</span>
                </div>

                <div className="account-list">
                  {accountOrders.length > 0 ? (
                    accountOrders.map((order) => (
                      <div key={order.reference} className="account-list__item">
                        <div>
                          <strong>{order.reference}</strong>
                          <p>
                            {formatDateTime(order.createdAt)} • {formatPrice(order.pricing.total)} • {order.status}
                          </p>
                        </div>
                        <div className="account-list__actions">
                          <button
                            type="button"
                            className="button button--ghost button--small"
                            onClick={() => applyOrderToCart(order)}
                          >
                            Reorder
                          </button>
                          <button
                            type="button"
                            className="button button--ghost button--small"
                            onClick={() => downloadOrderReceipt(order)}
                          >
                            Receipt
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="account-helper">Your placed orders will appear here once you checkout with your PEM account.</p>
                  )}
                </div>
              </article>
            </div>
          ) : (
            <div className="account-grid">
              <article className="account-card reveal reveal--up">
                <div className="account-card__header">
                  <div>
                    <p className="eyebrow">Admin session</p>
                    <h3>{adminSession.label || "PEM Admin"}</h3>
                  </div>
                  <button type="button" className="button button--ghost button--small" onClick={handleAdminLogout}>
                    Sign Out
                  </button>
                </div>

                <p className="account-helper">
                  You are signed in as <strong>{adminSession.username || "owner"}</strong>.
                  Use the Admin section to manage orders, branches, menu items, and business settings.
                </p>

                <div className="account-kpis">
                  <div>
                    <strong>{adminSession.isOwner ? "Owner" : "Staff"}</strong>
                    <span>Access level</span>
                  </div>
                  <div>
                    <strong>{adminSession.branchId || "All"}</strong>
                    <span>Branch scope</span>
                  </div>
                  <div>
                    <strong>{adminToken ? "Active" : "Signed out"}</strong>
                    <span>Session</span>
                  </div>
                </div>
              </article>
            </div>
          )}
        </section>
        ) : null}

        {activePage === "track" ? (
        <section className="tracking-section" id="track">
          <div className="section-heading reveal reveal--up">
            <p className="eyebrow">Order Tracking</p>
            <h2>Check the status of your PEM order with your reference.</h2>
          </div>

          <div className="tracking-grid">
            <form className="service-form reveal reveal--up" onSubmit={handleTrackOrder}>
              <label className="field">
                <span>Order reference</span>
                <input
                  type="text"
                  value={trackingReference}
                  onChange={(event) => setTrackingReference(event.target.value)}
                  placeholder="PEM-ORD-1234567890-1234"
                />
              </label>

              {trackingState.error ? (
                <p className="form-message form-message--error">{trackingState.error}</p>
              ) : null}

              <button type="submit" className="button button--primary" disabled={trackingState.loading}>
                {trackingState.loading ? "Checking..." : "Track Order"}
              </button>

              {savedReferences.length > 0 ? (
                <div className="tracking-history">
                  <span className="field-label">Recent references</span>
                  <div className="tracking-history__list">
                    {savedReferences.map((reference) => (
                      <button
                        key={reference}
                        type="button"
                        className="category-pill"
                        onClick={() => setTrackingReference(reference)}
                      >
                        {reference}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </form>

            <div className="tracking-card reveal reveal--up reveal--delay-1">
              {trackingState.order ? (
                <>
                  <div className="tracking-card__top">
                    <div>
                      <p className="eyebrow">Latest status</p>
                      <h3>{trackingState.order.reference}</h3>
                    </div>
                    <span className={`status-pill status-pill--${trackingState.order.status}`}>
                      {trackingState.order.status}
                    </span>
                  </div>
                  <p>
                    Ordered by <strong>{trackingState.order.customer.customerName}</strong> on{" "}
                    {formatDateTime(trackingState.order.updatedAt || trackingState.order.createdAt)}.
                  </p>
                  <div className="tracking-status-banner">
                    <strong>{String(trackingState.order.status || "").replaceAll("_", " ")}</strong>
                    <p>{getTrackingStatusSummary(trackingState.order, selectedDeliveryZone.label)}</p>
                  </div>
                  <p>
                    Branch: <strong>{trackingState.order.customer.branchName || "PEM Branch"}</strong>
                  </p>
                  <p>
                    Fulfillment: <strong>{trackingState.order.customer.fulfillmentMethod || "delivery"}</strong>
                    {trackingState.order.customer.scheduledFor ? (
                      <> • Scheduled for <strong>{formatDateTime(trackingState.order.customer.scheduledFor)}</strong></>
                    ) : null}
                  </p>
                  <div className="tracking-card__meta">
                    <div>
                      <span>Total</span>
                      <strong>{formatPrice(trackingState.order.pricing.total)}</strong>
                    </div>
                    <div>
                      <span>Items</span>
                      <strong>{trackingState.order.items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                    </div>
                    <div>
                      <span>Payment</span>
                      <strong>{trackingState.order.customer.paymentMethod}</strong>
                    </div>
                    <div>
                      <span>Payment Status</span>
                      <strong>{trackingState.order.payment?.status || "unpaid"}</strong>
                    </div>
                  </div>
                  <div className="tracking-timeline">
                    {getOrderTimeline(trackingState.order).map((step) => (
                      <div
                        key={step.key}
                        className={step.active ? "tracking-timeline__step is-active" : step.done ? "tracking-timeline__step is-done" : "tracking-timeline__step"}
                      >
                        <strong>{step.label}</strong>
                      </div>
                    ))}
                  </div>
                  <p>
                    Payment reference: <strong>{trackingState.order.payment?.reference || "Not added yet"}</strong>
                  </p>
                  {trackingState.order.payment?.paidAt ? (
                    <p>Paid at {formatDateTime(trackingState.order.payment.paidAt)}.</p>
                  ) : null}
                  {trackingState.order.customer.deliveryEta ? (
                    <p>
                      Delivery ETA: <strong>{trackingState.order.customer.deliveryEta}</strong>
                    </p>
                  ) : null}
                  {trackingEtaCountdown ? <p className="tracking-card__hint">{trackingEtaCountdown}</p> : null}
                  {trackingState.order.customer.landmark ? (
                    <p>Landmark: <strong>{trackingState.order.customer.landmark}</strong></p>
                  ) : null}
                  {trackingState.order.status === "awaiting_payment" ? (
                    <p className="tracking-card__hint">
                      PEM is waiting for payment confirmation before the kitchen starts preparing this order.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => downloadOrderReceipt(trackingState.order)}
                  >
                    Download Receipt
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => applyOrderToCart(trackingState.order)}
                  >
                    Add These Items To Cart
                  </button>
                  {trackingState.order.status === "delivered" ? (
                    <form className="service-form account-card__panel" onSubmit={handleReviewSubmit}>
                      <label className="field" data-checkout-field="recipientEmail">
                        <span>Tap the stars to rate this order</span>
                        <CleanStarRatingInput
                          value={reviewForm.rating}
                          onChange={(nextRating) =>
                            setReviewForm((previous) => ({ ...previous, rating: nextRating }))
                          }
                        />
                      </label>
                      <label className="note-field">
                        <span>Comment</span>
                        <textarea
                          rows="3"
                          value={reviewForm.comment}
                          onChange={(event) => setReviewForm((previous) => ({ ...previous, comment: event.target.value }))}
                          placeholder="Tell PEM how the meal and delivery went."
                        />
                      </label>
                      {reviewState.error ? <p className="form-message form-message--error">{reviewState.error}</p> : null}
                      {reviewState.success ? <p className="form-message form-message--success">{reviewState.success}</p> : null}
                      <button type="submit" className="button button--ghost" disabled={reviewState.loading}>
                        {reviewState.loading ? "Sending review..." : "Send Review"}
                      </button>
                    </form>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="eyebrow">How it works</p>
                  <h3>Enter your order reference to see whether PEM has received, prepared, or delivered it.</h3>
                  <p>
                    After checkout, PEM gives you a reference code. Save that code and use it here anytime.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
        ) : null}

        {activePage === "account" && recentlyViewed.length > 0 ? (
          <section className="recently-viewed-section">
            <div className="section-heading section-heading--compact reveal reveal--up">
              <p className="eyebrow">Recently Viewed</p>
              <h2>Pick up where you left off.</h2>
            </div>
            <div className="combo-grid">
              {recentlyViewed
                .map((itemId) => menuCatalog.find((item) => item.id === itemId && !item.hidden))
                .filter(Boolean)
                .map((item) => {
                  const quantity = cart[item.id] || 0;
                  return (
                    <article key={item.id} className="combo-card reveal reveal--up">
                      <img
                        src={item.imageUrl || item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "16px",
                          marginBottom: "0.9rem",
                        }}
                      />
                      <p className="eyebrow">{item.category}</p>
                      <h3>{item.name}</h3>
                      <p>{formatPrice(item.price)}</p>
                      <button
                        type="button"
                        className="button button--ghost"
                        disabled={item.soldOut}
                        onClick={() => {
                          updateQuantity(item.id, 1);
                          setShowCart(true);
                        }}
                      >
                        {item.soldOut ? "Unavailable" : quantity > 0 ? `Add again (${quantity} in cart)` : "Add to cart"}
                      </button>
                    </article>
                  );
                })}
            </div>
          </section>
        ) : null}

        {activePage === "account" ? (
        <section className="combo-section">
          <div className="section-heading section-heading--compact reveal reveal--up">
            <p className="eyebrow">Quick Combos</p>
            <h2>Start faster with PEM bundle suggestions.</h2>
          </div>
          <div className="combo-grid">
            {comboBundles.map((combo) => (
              <article key={combo.id} className="combo-card reveal reveal--up">
                <p className="eyebrow">{combo.title}</p>
                <h3>{combo.description}</h3>
                <p>
                  {combo.itemIds
                    .map((itemId) => menuCatalog.find((item) => item.id === itemId && !item.hidden)?.name)
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <button type="button" className="button button--ghost" onClick={() => addComboToCart(combo)}>
                  Add Combo To Cart
                </button>
              </article>
            ))}
          </div>
        </section>
        ) : null}

        {activePage === "menu" ? (
        <section className="menu-section" id="menu">
          <div className="section-heading section-heading--compact reveal reveal--up">
            <p className="eyebrow">Menu</p>
            <div className="menu-status-row">
              <span className={businessStatus.isOpen ? "status-pill status-pill--delivered" : "status-pill status-pill--cancelled"}>
                {businessStatus.isOpen ? "Open now" : "Closed now"}
              </span>
              <small>{businessStatus.label}</small>
            </div>
          </div>

          {recentOrderItems.length > 0 ? (
            <section className="quick-repeat reveal reveal--up reveal--delay-1">
              <div className="section-heading section-heading--compact">
                <p className="eyebrow">Order Again</p>
                <h2>Repeat what worked last time.</h2>
              </div>
              <div className="combo-grid combo-grid--compact">
                {recentOrderItems.map((item) => (
                  <article key={item.id} className="combo-card">
                    <p className="eyebrow">{item.category}</p>
                    <h3>{item.name}</h3>
                    <p>{formatPrice(item.price)}</p>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      Order Again
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="dietary-assistant reveal reveal--up reveal--delay-1" aria-label="Dietary meal assistant">
            <div className="dietary-assistant__intro">
              <p className="eyebrow">PEM Meal Guide</p>
              <h2>Find meals that fit your dietary needs.</h2>
              <p>
                Tell PEM what you prefer or avoid, and the assistant will recommend the closest
                dishes from the current menu.
              </p>

              <div className="dietary-assistant__chips">
                {dietaryPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="dietary-chip"
                    onClick={() => setDietaryNeeds(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form className="dietary-form" onSubmit={handleDietarySubmit}>
              <label className="note-field dietary-form__field">
                <span>Dietary needs or preferences</span>
                <textarea
                  rows="4"
                  value={dietaryNeeds}
                  onChange={(event) => setDietaryNeeds(event.target.value)}
                  placeholder="Example: I want something less spicy, no beef, and more local."
                />
              </label>

              <div className="dietary-form__actions">
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={dietaryState.loading || !isOnline}
                >
                  {dietaryState.loading ? "Finding matches..." : "Suggest meals"}
                </button>
                <button type="button" className="button button--ghost" onClick={clearDietaryAssistant}>
                  Clear
                </button>
              </div>

              {dietaryState.error ? (
                <p className="form-message form-message--error">{dietaryState.error}</p>
              ) : null}

              {dietaryState.summary ? (
                <div className="dietary-result">
                  <div className="dietary-result__header">
                    <div>
                      <p className="eyebrow">Suggested for you</p>
                      <h3>{dietaryState.summary}</h3>
                    </div>
                    {dietaryState.mode ? (
                      <span className="dietary-result__mode">
                        {dietaryState.mode === "ai" ? "AI matched" : "Smart filter"}
                      </span>
                    ) : null}
                  </div>

                  {dietaryState.matches.length > 0 ? (
                    <div className="dietary-result__list">
                      {dietaryState.matches.map((match) => {
                        const item = menuCatalog.find((menuItem) => menuItem.id === match.itemId);

                        if (!item) {
                          return null;
                        }

                        return (
                          <article key={match.itemId} className="dietary-result__item">
                            <div>
                              <strong>{item.name}</strong>
                              <p>{match.reason}</p>
                            </div>
                            <span>{formatPrice(item.price)}</span>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="dietary-result__empty">
                      No exact meal match was found in the current PEM menu.
                    </p>
                  )}

                  {dietaryState.caution ? (
                    <p className="dietary-result__caution">{dietaryState.caution}</p>
                  ) : null}
                  {dietaryState.degraded ? (
                    <p className="dietary-result__hint">
                      PEM used its built-in smart matcher because the AI service was unavailable.
                    </p>
                  ) : null}

                  {dietaryState.matches.length > 0 ? (
                    <label className="dietary-result__toggle">
                      <input
                        type="checkbox"
                        checked={showDietaryMatchesOnly}
                        onChange={(event) => setShowDietaryMatchesOnly(event.target.checked)}
                      />
                      <span>Show recommended dishes only</span>
                    </label>
                  ) : null}
                </div>
              ) : null}
            </form>
          </section>

          <div className="menu-section__header reveal reveal--up reveal--delay-1">
            <div className="menu-structure" aria-label="Menu sections">
              {menuSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={section.id === activeMenuSection ? "category-pill is-active" : "category-pill"}
                  onClick={() => setActiveMenuSection(section.id)}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          <div className="controls reveal reveal--up reveal--delay-1">
            <label className="search-field">
              <span>Search meals</span>
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Egusi, budget meals, drinks, spicy soups..."
              />
              {searchInput && searchInput !== search ? <small className="cart-help">Searching...</small> : null}
            </label>

            <label className="field">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="reviews">Top review</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>

            <label className="field">
              <span>Minimum star</span>
              <select
                value={minimumRating}
                onChange={(event) => setMinimumRating(Number(event.target.value))}
              >
                <option value={0}>All ratings</option>
                <option value={4}>4.0 and above</option>
                <option value={4.5}>4.5 and above</option>
                <option value={4.8}>4.8 and above</option>
              </select>
            </label>

            <label className="field">
              <span>Price range</span>
              <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
                <option value="all">All prices</option>
                <option value="under-2000">Under ₦2,000</option>
                <option value="2000-4000">₦2,000 - ₦4,000</option>
                <option value="above-4000">Above ₦4,000</option>
              </select>
            </label>

            <label className="field field--toggle">
              <span>Saved meals</span>
              <button
                type="button"
                className={showFavoritesOnly ? "category-pill is-active" : "category-pill"}
                onClick={() => setShowFavoritesOnly((previous) => !previous)}
              >
                {showFavoritesOnly ? "Showing favorites" : "Show favorites only"}
              </button>
            </label>
          </div>

          <div className="category-row reveal reveal--up reveal--delay-2" aria-label="Meal categories">
            {visibleCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={category === activeCategory ? "category-pill is-active" : "category-pill"}
                onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
          </div>

          <div className="menu-summary reveal reveal--up reveal--delay-2">
            <span>{filteredItems.length} items showing</span>
            <span>
              {menuSections.find((section) => section.id === activeMenuSection)?.label || "Everything"}
            </span>
          </div>
          <p className="menu-search-helper reveal reveal--up reveal--delay-2">
            Search by dish name, budget, spice level, category, drink, local soup, or what is available today.
          </p>

          {menuAdminState.loading ? (
            <div className="menu-skeleton-grid" aria-hidden="true">
              {[1, 2, 3, 4].map((slot) => (
                <div key={slot} className="meal-skeleton-card">
                  <div className="meal-skeleton-card__media" />
                  <div className="meal-skeleton-card__line meal-skeleton-card__line--title" />
                  <div className="meal-skeleton-card__line" />
                  <div className="meal-skeleton-card__line meal-skeleton-card__line--short" />
                </div>
              ))}
            </div>
          ) : null}

          {filteredItems.length === 0 ? (
            <div className="empty-state reveal reveal--up">
              <div className="empty-state__icon" aria-hidden="true">🍽</div>
              <h3>No meals matched that search yet.</h3>
              <p>Try another category, clear your filters, or use the dietary assistant for guided suggestions.</p>
              <div className="empty-state__actions">
                <button type="button" className="button button--ghost" onClick={() => {
                  setActiveCategory("All");
                  setActiveMenuSection("all");
                  setPriceRange("all");
                  setMinimumRating(0);
                  setSearchInput("");
                  setSearch("");
                }}>
                  Clear Filters
                </button>
                <button type="button" className="button button--ghost" onClick={() => setDietaryNeeds("Show me local dishes available today")}>
                  Try Dietary Guide
                </button>
              </div>
            </div>
          ) : (
          <div className={menuAdminState.loading ? "menu-grid menu-grid--loading" : "menu-grid"}>
            {filteredItems.map((item) => {
              const quantity = cart[item.id] || 0;
              const branchAvailability = getBranchAvailabilityMeta(item, selectedBranch, lagosNow);
              const relatedItems = getRelatedMenuItems(item, menuCatalog, lagosNow);
              const isExpanded = Boolean(expandedDescriptions[item.id]);
              const needsDescriptionToggle = String(item.description || "").length > 88;
              const dietaryTagList = Array.isArray(item.dietaryTags) ? item.dietaryTags.slice(0, 4) : [];

              return (
                <article
                  key={item.id}
                  className={
                    recommendedItemIds.includes(item.id)
                      ? "meal-card meal-card--recommended reveal reveal--up"
                      : lastAddedItemId === item.id
                        ? "meal-card meal-card--fresh reveal reveal--up"
                        : item.soldOut
                          ? "meal-card meal-card--sold-out reveal reveal--up"
                          : "meal-card reveal reveal--up"
                  }
                >
                  <div className="meal-card__media">
                    <img src={item.imageUrl || item.image} alt={item.name} />
                    <div className="meal-card__gradient" />
                    {item.soldOut ? <div className="meal-card__overlay">Sold Out</div> : null}
                    <div className="meal-card__chips">
                      <small className={`chip chip--${getBadgeTone(item.badge)}`}>{item.badge}</small>
                      {item.spicy ? <small className="chip chip--hot">Spicy</small> : null}
                      {recommendedItemIds.includes(item.id) ? <small className="chip chip--signature">Dietary match</small> : null}
                    </div>
                  </div>

                  <div className="meal-card__body">
                    <div className="meal-card__top">
                      <div>
                        <p className="meal-card__category">{item.category}</p>
                        <h3>{item.name}</h3>
                      </div>
                      <div className="meal-card__actions">
                        <button
                          type="button"
                          className={favorites.includes(item.id) ? "favorite-button is-active" : "favorite-button"}
                          onClick={() => toggleFavorite(item.id)}
                          aria-label={favorites.includes(item.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          {favorites.includes(item.id) ? "Saved" : "Save"}
                        </button>
                        <p className="meal-card__price">{formatPrice(item.price)}</p>
                      </div>
                    </div>

                    <p className="meal-card__description">
                      {isExpanded || !needsDescriptionToggle
                        ? item.description
                        : `${String(item.description || "").slice(0, 88).trim()}...`}
                    </p>
                    {needsDescriptionToggle ? (
                      <button
                        type="button"
                        className="meal-card__description-toggle"
                        onClick={() =>
                          setExpandedDescriptions((previous) => ({
                            ...previous,
                            [item.id]: !previous[item.id],
                          }))
                        }
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    ) : null}
                    {formatScheduleLabel(item) ? <p className="meal-card__schedule">{formatScheduleLabel(item)}</p> : null}

                    <div className="meal-card__tags">
                      {dietaryTagList.map((tag) => (
                        <span key={tag} className={`dietary-tag dietary-tag--${getDietaryTagTone(tag)}`}>{tag}</span>
                      ))}
                    </div>

                    <div className="meal-card__meta">
                      <RatingStars rating={item.rating} />
                      <span>{item.reviews} reviews</span>
                    </div>
                    <p className={`meal-card__availability meal-card__availability--${branchAvailability.tone}`}>
                      {branchAvailability.label}
                    </p>
                    {relatedItems.length > 0 ? (
                      <div className="meal-card__related">
                        <span>Pairs well with:</span>
                        <div className="meal-card__related-list">
                          {relatedItems.map((relatedItem) => (
                            <button
                              key={relatedItem.id}
                              type="button"
                              className="meal-card__related-pill"
                              onClick={() => updateQuantity(relatedItem.id, 1)}
                            >
                              {relatedItem.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="meal-card__order">
                      <QuantityControl
                        value={quantity}
                        onDecrease={() => updateQuantity(item.id, -1)}
                        onIncrease={() => updateQuantity(item.id, 1)}
                        disabled={item.soldOut}
                      />

                      <button
                        type="button"
                        className="button button--primary button--small"
                        onClick={() => setQuantity(item.id, quantity === 0 ? 1 : 0)}
                        disabled={item.soldOut}
                      >
                        {item.soldOut ? "Unavailable" : lastAddedItemId === item.id ? "Added" : quantity === 0 ? "Add meal" : "Reset"}
                      </button>
                    </div>

                    <label className="note-field">
                      <span>Order note</span>
                      <textarea
                        rows="3"
                        value={notes[item.id] || ""}
                        onChange={(event) => updateNote(item.id, event.target.value)}
                        placeholder="Extra pepper, no onions, soft swallow..."
                        disabled={item.soldOut}
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
          )}
        </section>
        ) : null}

        {activePage === "contact" ? (
        <>
        {publicReviews.length > 0 ? (
          <section className="reviews-section">
            <div className="section-heading section-heading--compact reveal reveal--up">
              <p className="eyebrow">Customer Reviews</p>
              <h2>Trusted by customers across PEM branches.</h2>
              <p>Recent feedback from delivered orders helps new customers choose with more confidence.</p>
            </div>
            <div className="combo-grid">
              {publicReviews.map((review) => (
                <article key={review.reference} className="combo-card reveal reveal--up">
                  <div className="testimonial-card__header">
                    <div>
                      <strong>{review.customerName}</strong>
                      <p>{review.branchName || selectedBranch?.label || "PEM Branch"}</p>
                    </div>
                    <RatingStars rating={Number(review.rating) || 0} />
                  </div>
                  <p className="testimonial-card__comment">
                    {review.comment || "Loved the PEM experience."}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="trust-section">
          <div className="section-heading section-heading--compact reveal reveal--up">
            <p className="eyebrow">Why Customers Trust PEM</p>
            <h2>Clear ordering, local taste, and branch-based support.</h2>
          </div>
          <div className="combo-grid">
            {trustHighlights.map((item) => (
              <article key={item.title} className="combo-card reveal reveal--up">
                <p className="eyebrow">PEM promise</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
        </>
        ) : null}

        {activePage === "catering" ? (
        <section className="catering-section" id="catering">
          <div className="section-heading section-heading--light reveal reveal--up">
            <p className="eyebrow">Catering Service</p>
            <h2>PEM also serves events, celebrations, and business gatherings.</h2>
          </div>

          <div className="catering-grid">
            {cateringPackages.map((pkg) => (
              <article key={pkg.title} className="catering-card reveal reveal--up">
                <p className="catering-card__subtitle">{pkg.subtitle}</p>
                <h3>{pkg.title}</h3>
                <p>{pkg.details}</p>
              </article>
            ))}
          </div>

          <form className="service-form service-form--light reveal reveal--up reveal--delay-2" onSubmit={handleCateringSubmit}>
            <p className="cart-help">Branch handling this request: <strong>{selectedBranch?.label || `${businessSettings.appName} Branch`}</strong></p>
            <div className="service-form__grid">
              <label className="field">
                <span>Full name</span>
                <input
                  type="text"
                  value={cateringForm.name}
                  onChange={(event) =>
                    setCateringForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                  placeholder="Your full name"
                />
              </label>

              <label className="field">
                <span>Phone number</span>
                <input
                  type="tel"
                  value={cateringForm.phone}
                  onChange={(event) =>
                    setCateringForm((previous) => ({ ...previous, phone: event.target.value }))
                  }
                  placeholder="0803 334 5161"
                />
              </label>

              <label className="field">
                <span>Event date</span>
                <input
                  type="date"
                  value={cateringForm.eventDate}
                  onChange={(event) =>
                    setCateringForm((previous) => ({ ...previous, eventDate: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Guest count</span>
                <input
                  type="number"
                  min="1"
                  value={cateringForm.guestCount}
                  onChange={(event) =>
                    setCateringForm((previous) => ({ ...previous, guestCount: event.target.value }))
                  }
                  placeholder="150"
                />
              </label>

              <label className="field">
                <span>Event type</span>
                <input
                  type="text"
                  value={cateringForm.eventType}
                  onChange={(event) =>
                    setCateringForm((previous) => ({ ...previous, eventType: event.target.value }))
                  }
                  placeholder="Wedding, office event..."
                />
              </label>
            </div>

            <label className="note-field">
              <span>Details</span>
              <textarea
                rows="4"
                value={cateringForm.details}
                onChange={(event) =>
                  setCateringForm((previous) => ({ ...previous, details: event.target.value }))
                }
                placeholder="Tell PEM the menu, location, and any special requests."
              />
            </label>

            {cateringState.error ? (
              <p className="form-message form-message--error">{cateringState.error}</p>
            ) : null}
            {cateringState.success ? (
              <p className="form-message form-message--success">{cateringState.success}</p>
            ) : null}

            <button
              type="submit"
              className="button button--ghost service-form__button"
              disabled={cateringState.loading || !isOnline}
            >
              {cateringState.loading ? "Sending..." : "Request Catering"}
            </button>
          </form>
        </section>
        ) : null}

        {activePage === "contact" ? (
        <>
        <section className="contact-section">
          <div className="section-heading reveal reveal--up">
            <p className="eyebrow">Reservations</p>
            <h2>Book a table or tasting slot with PEM.</h2>
          </div>

          <form className="service-form reveal reveal--up" onSubmit={handleReservationSubmit}>
            <p className="cart-help">Reservation branch: <strong>{selectedBranch?.label || `${businessSettings.appName} Branch`}</strong></p>
            <div className="service-form__grid">
              <label className="field">
                <span>Full name</span>
                <input
                  type="text"
                  value={reservationForm.name}
                  onChange={(event) => setReservationForm((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="Your full name"
                />
              </label>
              <label className="field">
                <span>Phone number</span>
                <input
                  type="tel"
                  value={reservationForm.phone}
                  onChange={(event) => setReservationForm((previous) => ({ ...previous, phone: event.target.value }))}
                  placeholder="0803 334 5161"
                />
              </label>
              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={reservationForm.date}
                  onChange={(event) => setReservationForm((previous) => ({ ...previous, date: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Time</span>
                <input
                  type="time"
                  value={reservationForm.time}
                  onChange={(event) => setReservationForm((previous) => ({ ...previous, time: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Number of guests</span>
                <input
                  type="number"
                  min="1"
                  value={reservationForm.guests}
                  onChange={(event) => setReservationForm((previous) => ({ ...previous, guests: event.target.value }))}
                  placeholder="4"
                />
              </label>
            </div>
            <label className="note-field">
              <span>Notes</span>
              <textarea
                rows="3"
                value={reservationForm.notes}
                onChange={(event) => setReservationForm((previous) => ({ ...previous, notes: event.target.value }))}
                placeholder="Birthday dinner, tasting session, or special seating request."
              />
            </label>
            {reservationState.error ? <p className="form-message form-message--error">{reservationState.error}</p> : null}
            {reservationState.success ? <p className="form-message form-message--success">{reservationState.success}</p> : null}
            <button type="submit" className="button button--primary" disabled={reservationState.loading || !isOnline}>
              {reservationState.loading ? "Booking..." : "Book Reservation"}
            </button>
          </form>
        </section>

        <section className="contact-section" id="contact">
          <div className="section-heading reveal reveal--up">
            <p className="eyebrow">Contact</p>
            <h2>Make ordering easy for customers and inquiries easy for event clients.</h2>
          </div>

            <div className="contact-grid">
            <div className="contact-card">
              <h3>Business Name</h3>
              <p>{businessSettings.businessName}</p>
            </div>
            <div className="contact-card">
              <h3>App Name</h3>
              <p>{businessSettings.appName}</p>
            </div>
            <div className="contact-card">
              <h3>Phone / WhatsApp</h3>
              <p>{businessSettings.phone}</p>
            </div>
            <div className="contact-card">
              <h3>Service Promise</h3>
              <p>{businessSettings.contactPromise}</p>
            </div>
            <div className="contact-card">
              <h3>Business Hours</h3>
              <p>{selectedBranch?.hours || businessSettings.businessHoursText || businessStatus.label}</p>
            </div>
            <div className="contact-card">
              <h3>Support Email</h3>
              <p>{businessSettings.supportEmail}</p>
            </div>
            <div className="contact-card">
              <h3>Business Address</h3>
              <p>{businessSettings.address}</p>
            </div>
            <div className="contact-card">
              <h3>Current Branch</h3>
              <p>{selectedBranch?.label || `${businessSettings.appName} Branch`}</p>
            </div>
          </div>

          <form className="service-form reveal reveal--up reveal--delay-2" onSubmit={handleContactSubmit}>
            <p className="cart-help">Message will go to: <strong>{selectedBranch?.label || `${businessSettings.appName} Branch`}</strong></p>
            <div className="service-form__grid service-form__grid--three">
              <label className="field">
                <span>Full name</span>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(event) =>
                    setContactForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                  placeholder="Your name"
                />
              </label>

              <label className="field">
                <span>Phone number</span>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(event) =>
                    setContactForm((previous) => ({ ...previous, phone: event.target.value }))
                  }
                  placeholder="0803 334 5161"
                />
              </label>
            </div>

            <label className="note-field">
              <span>Message</span>
              <textarea
                rows="4"
                value={contactForm.message}
                onChange={(event) =>
                  setContactForm((previous) => ({ ...previous, message: event.target.value }))
                }
                placeholder="Tell PEM what you need help with."
              />
            </label>

            {contactState.error ? (
              <p className="form-message form-message--error">{contactState.error}</p>
            ) : null}
            {contactState.success ? (
              <p className="form-message form-message--success">{contactState.success}</p>
            ) : null}

            <button
              type="submit"
              className="button button--primary service-form__button"
              disabled={contactState.loading || !isOnline}
            >
              {contactState.loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>
        </>
        ) : null}

        {activePage === "admin" ? (
        <section className="admin-section" id="admin">
          <div className="section-heading reveal reveal--up">
            <p className="eyebrow">Admin</p>
            <h2>Track orders, messages, and catering requests in one place.</h2>
          </div>

          {!adminToken ? (
            <form className="service-form admin-login reveal reveal--up reveal--delay-1" onSubmit={handleAdminLogin}>
              <div className="admin-login__copy">
                <h3>Admin sign in</h3>
                <p>Enter your PEM admin password to unlock orders, contact messages, and catering records.</p>
                <p className="admin-login__hint">
                  Forgot the password? Open your local <code>.env</code> file and set a new
                  <code> ADMIN_PASSWORD</code> value, then restart the app.
                </p>
              </div>

              <label className="field">
                <span>Admin username</span>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(event) => setAdminUsername(event.target.value)}
                  placeholder="Leave blank for owner login"
                />
              </label>

              <label className="field">
                <span>Admin password</span>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder="Enter admin password"
                />
              </label>

              {adminLoginState.error ? (
                <p className="form-message form-message--error">{adminLoginState.error}</p>
              ) : null}

              <button
                type="submit"
                className="button button--primary service-form__button"
                disabled={adminLoginState.loading}
              >
                {adminLoginState.loading ? "Signing in..." : "Unlock Admin"}
              </button>
            </form>
          ) : (
            <>
              <div className="admin-toolbar reveal reveal--up reveal--delay-1">
                <div className="hero__stats admin-stats">
                  <div>
                    <strong>{adminState.data.orders.length}</strong>
                    <span>Orders</span>
                  </div>
                  <div>
                    <strong>{adminUnreadOrders}</strong>
                    <span>Need attention</span>
                  </div>
                  <div>
                    <strong>{adminUnreadContacts}</strong>
                    <span>New messages</span>
                  </div>
                  <div>
                    <strong>{adminUnreadCatering}</strong>
                    <span>New catering requests</span>
                  </div>
                  <div>
                    <strong>{filteredAdminReservations.length}</strong>
                    <span>Reservations</span>
                  </div>
                </div>

                <div className="admin-toolbar__actions">
                  <span className="status-pill status-pill--received">
                    {adminSession.branchId ? `${adminSession.label} · ${branchLocations.find((branch) => branch.id === adminSession.branchId)?.label || "Assigned branch"}` : `${adminSession.label || "Owner"} · All branches`}
                  </span>
                  <button type="button" className="button button--ghost" onClick={() => navigateToPage("menu")}>
                    Back to Menu
                  </button>

                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => loadAdminData()}
                    disabled={adminState.loading}
                  >
                    {adminState.loading ? "Refreshing..." : "Refresh Admin Data"}
                  </button>

                  <button type="button" className="button button--ghost" onClick={handleAdminLogout}>
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="admin-filters reveal reveal--up reveal--delay-1">
                <label className="search-field">
                  <span>Search admin records</span>
                  <input
                    type="text"
                    value={adminQuery}
                    onChange={(event) => setAdminQuery(event.target.value)}
                    placeholder="Search by name, phone, reference, meal..."
                  />
                </label>

                <label className="field">
                  <span>Order status</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(event) => setOrderStatusFilter(event.target.value)}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status === "all" ? "All statuses" : status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Branch view</span>
                  <select
                    value={adminSession.branchId || adminBranchFilter}
                    onChange={(event) => setAdminBranchFilter(event.target.value)}
                    disabled={Boolean(adminSession.branchId)}
                  >
                    <option value="all">All branches</option>
                    {branchOptions.map((branch) => (
                      <option key={branch.value} value={branch.value}>
                        {branch.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="admin-export-group">
                  <span className="field-label">Exports</span>
                  <div className="admin-toolbar__actions">
                    <button type="button" className="button button--ghost" onClick={exportOrdersCsv}>
                      Export Orders CSV
                    </button>
                    <button type="button" className="button button--ghost" onClick={exportContactsCsv}>
                      Export Messages CSV
                    </button>
                    <button type="button" className="button button--ghost" onClick={exportCateringCsv}>
                      Export Catering CSV
                    </button>
                  </div>
                </div>
              </div>

              {adminState.error ? (
                <p className="form-message form-message--error">{adminState.error}</p>
              ) : null}
              {orderActionState.error ? (
                <p className="form-message form-message--error">{orderActionState.error}</p>
              ) : null}
              {orderActionState.success ? (
                <p className="form-message form-message--success">{orderActionState.success}</p>
              ) : null}

              <div className="admin-grid">
                <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Analytics</h3>
                    <span>{todayOrders}</span>
                  </div>
                  <div className="hero__stats admin-stats">
                    <div>
                      <strong>{formatPrice(totalRevenue)}</strong>
                      <span>Total revenue</span>
                    </div>
                    <div>
                      <strong>{formatPrice(paidRevenue)}</strong>
                      <span>Paid revenue</span>
                    </div>
                    <div>
                      <strong>{todayOrders}</strong>
                      <span>Orders today</span>
                    </div>
                  </div>
                  <div className="admin-list">
                    {topDeliveryZones.length > 0 ? (
                      topDeliveryZones.map(([zone, count]) => (
                        <div key={zone} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{zone}</strong>
                            <span>{count} delivery orders</span>
                          </div>
                        </div>
                      ))
                    ) : null}
                    {topMeals.length === 0 ? (
                      <p className="admin-empty">Top meals will appear after orders come in.</p>
                    ) : (
                      topMeals.map((meal) => (
                        <div key={meal.id} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{meal.name}</strong>
                            <span>{meal.quantity} ordered</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {statusChart.length > 0 ? (
                    <div className="admin-chart">
                      <p className="field-label">Order flow</p>
                      {statusChart.map((entry) => (
                        <div key={entry.status} className="admin-chart__row">
                          <span>{entry.status.replaceAll("_", " ")}</span>
                          <div className="admin-chart__bar">
                            <span style={{ width: `${(entry.count / chartMaxCount) * 100}%` }} />
                          </div>
                          <strong>{entry.count}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {branchSalesChart.length > 0 ? (
                    <div className="admin-chart">
                      <p className="field-label">Branch sales</p>
                      {branchSalesChart.map((entry) => (
                        <div key={entry.label} className="admin-chart__row">
                          <span>{entry.label}</span>
                          <div className="admin-chart__bar">
                            <span style={{ width: `${(entry.totalAmount / chartMaxRevenue) * 100}%` }} />
                          </div>
                          <strong>{formatPrice(entry.totalAmount)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>

                <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Kitchen Board</h3>
                    <span>{kitchenBoardOrders.length}</span>
                  </div>
                  {kitchenBoardOrders.length === 0 ? (
                    <p className="admin-empty">No active kitchen orders right now.</p>
                  ) : (
                    <div className="admin-list">
                      {kitchenBoardOrders.slice(0, 8).map((order) => (
                        <div key={order.reference} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{order.reference}</strong>
                            <span className={`status-pill status-pill--${order.status}`}>{order.status.replaceAll("_", " ")}</span>
                          </div>
                          <p>{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
                          <p className="admin-item__subtle">{getRecordBranchName(order)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Rider Dispatch</h3>
                    <span>{riderBoardOrders.length}</span>
                  </div>
                  {riderBoardOrders.length === 0 ? (
                    <p className="admin-empty">No ready or in-transit deliveries yet.</p>
                  ) : (
                    <div className="admin-list">
                      {riderBoardOrders.slice(0, 8).map((order) => (
                        <div key={order.reference} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{order.customer.customerName}</strong>
                            <span className={`status-pill status-pill--${order.status}`}>{order.status.replaceAll("_", " ")}</span>
                          </div>
                          <p>{order.customer.address}</p>
                          {order.customer.landmark ? <p>Landmark: {order.customer.landmark}</p> : null}
                          <div className="admin-item__row">
                            <span>{order.customer.phone}</span>
                            <strong>{order.reference}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                {adminSession.isOwner ? (
                  <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Business Settings</h3>
                    <span>{settingsAdminState.settings.appName}</span>
                  </div>
                  <form className="admin-zone-form" onSubmit={handleSettingsSave}>
                    <div className="service-form__grid">
                      <label className="field" data-checkout-field="recipientEmail">
                        <span>Business name</span>
                        <input
                          type="text"
                          value={settingsAdminState.settings.businessName}
                          onChange={(event) => updateSettingsField("businessName", event.target.value)}
                        />
                      </label>
                      <label className="field">
                        <span>App name</span>
                        <input
                          type="text"
                          value={settingsAdminState.settings.appName}
                          onChange={(event) => updateSettingsField("appName", event.target.value)}
                        />
                      </label>
                      <label className="field">
                        <span>Phone</span>
                        <input
                          type="text"
                          value={settingsAdminState.settings.phone}
                          onChange={(event) => updateSettingsField("phone", event.target.value)}
                        />
                      </label>
                      <label className="field">
                        <span>WhatsApp number</span>
                        <input
                          type="text"
                          value={settingsAdminState.settings.whatsappPhone}
                          onChange={(event) => updateSettingsField("whatsappPhone", event.target.value)}
                        />
                      </label>
                      <label className="field">
                        <span>Support email</span>
                        <input
                          type="email"
                          value={settingsAdminState.settings.supportEmail}
                          onChange={(event) => updateSettingsField("supportEmail", event.target.value)}
                        />
                      </label>
                      <label className="field">
                        <span>Minimum order (NGN)</span>
                        <input
                          type="number"
                          min="0"
                          value={settingsAdminState.settings.minimumOrder}
                          onChange={(event) => updateSettingsField("minimumOrder", Number(event.target.value) || 0)}
                        />
                      </label>
                    </div>

                    <label className="field" data-checkout-field="address">
                      <span>Business address</span>
                      <input
                        type="text"
                        value={settingsAdminState.settings.address}
                        onChange={(event) => updateSettingsField("address", event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span>Business hours note</span>
                      <input
                        type="text"
                        value={settingsAdminState.settings.businessHoursText}
                        onChange={(event) => updateSettingsField("businessHoursText", event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span>Promo banner</span>
                      <input
                        type="text"
                        value={settingsAdminState.settings.promoBanner}
                        onChange={(event) => updateSettingsField("promoBanner", event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span>Contact promise</span>
                      <input
                        type="text"
                        value={settingsAdminState.settings.contactPromise}
                        onChange={(event) => updateSettingsField("contactPromise", event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span>Hero headline</span>
                      <input
                        type="text"
                        value={settingsAdminState.settings.heroHeadline}
                        onChange={(event) => updateSettingsField("heroHeadline", event.target.value)}
                      />
                    </label>
                    <label className="note-field">
                      <span>Hero copy</span>
                      <textarea
                        rows="3"
                        value={settingsAdminState.settings.heroCopy}
                        onChange={(event) => updateSettingsField("heroCopy", event.target.value)}
                      />
                    </label>
                    <div className="service-form__grid">
                      <label className="field">
                        <span>Bank name</span>
                        <input
                          type="text"
                          value={settingsAdminState.settings.bankName}
                          onChange={(event) => updateSettingsField("bankName", event.target.value)}
                        />
                      </label>
                      <label className="field">
                        <span>Bank account name</span>
                        <input
                          type="text"
                          value={settingsAdminState.settings.bankAccountName}
                          onChange={(event) => updateSettingsField("bankAccountName", event.target.value)}
                        />
                      </label>
                      <label className="field">
                        <span>Bank account number</span>
                        <input
                          type="text"
                          value={settingsAdminState.settings.bankAccountNumber}
                          onChange={(event) => updateSettingsField("bankAccountNumber", event.target.value)}
                        />
                      </label>
                    </div>
                    <label className="field">
                      <span>Bank instructions</span>
                      <input
                        type="text"
                        value={settingsAdminState.settings.bankInstructions}
                        onChange={(event) => updateSettingsField("bankInstructions", event.target.value)}
                      />
                    </label>
                    <label className="note-field">
                      <span>Promo codes</span>
                      <textarea
                        rows="3"
                        value={settingsAdminState.settings.promoCodesText}
                        onChange={(event) => updateSettingsField("promoCodesText", event.target.value)}
                        placeholder={"WELCOME10|percent|10|5000\nPARTY500|flat|500|7000"}
                      />
                    </label>
                    <label className="note-field">
                      <span>Staff admin logins</span>
                      <textarea
                        rows="3"
                        value={settingsAdminState.settings.staffAdminsText}
                        onChange={(event) => updateSettingsField("staffAdminsText", event.target.value)}
                        placeholder={"manager|PemStaff2026|Floor Manager|owerri-central"}
                      />
                    </label>
                    <label className="note-field">
                      <span>Branch locations</span>
                      <textarea
                        rows="5"
                        value={settingsAdminState.settings.branchLocationsText}
                        onChange={(event) => updateSettingsField("branchLocationsText", event.target.value)}
                        placeholder={"owerri-central|PEM Owerri Central|Wetheral Road, Owerri|0803 334 5161|8:00 AM - 9:00 PM|Fast city-center dispatch"}
                      />
                    </label>
                    <label className="note-field">
                      <span>Receipt footer</span>
                      <textarea
                        rows="2"
                        value={settingsAdminState.settings.receiptFooter}
                        onChange={(event) => updateSettingsField("receiptFooter", event.target.value)}
                      />
                    </label>
                    {settingsAdminState.error ? (
                      <p className="form-message form-message--error">{settingsAdminState.error}</p>
                    ) : null}
                    {settingsAdminState.success ? (
                      <p className="form-message form-message--success">{settingsAdminState.success}</p>
                    ) : null}
                    <button
                      type="submit"
                      className="button button--primary"
                      disabled={settingsAdminState.saving || settingsAdminState.loading}
                    >
                      {settingsAdminState.saving ? "Saving settings..." : "Save Business Settings"}
                    </button>
                  </form>
                  </article>
                ) : null}

                {adminSession.isOwner ? (
                  <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Delivery Zones</h3>
                    <span>{deliveryZoneAdminState.zones.length}</span>
                  </div>
                  <form className="admin-zone-form" onSubmit={handleDeliveryZonesSave}>
                    <div className="admin-list">
                      {deliveryZoneAdminState.zones.map((zone, index) => (
                        <div key={zone.id} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{zone.label || `Delivery Zone ${index + 1}`}</strong>
                            <button
                              type="button"
                              className="button button--ghost button--small"
                              onClick={() => removeDeliveryZoneRow(zone.id)}
                              disabled={deliveryZoneAdminState.zones.length === 1}
                            >
                              Remove
                            </button>
                          </div>
                          <div className="service-form__grid">
                            <label className="field">
                              <span>Area label</span>
                              <input
                                type="text"
                                value={zone.label}
                                onChange={(event) =>
                                  setDeliveryZoneAdminState((previous) => ({
                                    ...previous,
                                    zones: previous.zones.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, label: event.target.value } : item,
                                    ),
                                  }))
                                }
                              />
                            </label>
                            <label className="field">
                              <span>Fee (NGN)</span>
                              <input
                                type="number"
                                min="0"
                                value={zone.fee}
                                onChange={(event) =>
                                  setDeliveryZoneAdminState((previous) => ({
                                    ...previous,
                                    zones: previous.zones.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, fee: Number(event.target.value) || 0 } : item,
                                    ),
                                  }))
                                }
                              />
                            </label>
                          </div>
                          <label className="field">
                            <span>Estimated delivery time</span>
                            <input
                              type="text"
                              value={zone.eta}
                              onChange={(event) =>
                                setDeliveryZoneAdminState((previous) => ({
                                  ...previous,
                                  zones: previous.zones.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, eta: event.target.value } : item,
                                  ),
                                }))
                              }
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="button button--ghost" onClick={addDeliveryZoneRow}>
                      Add Delivery Zone
                    </button>
                    {deliveryZoneAdminState.error ? (
                      <p className="form-message form-message--error">{deliveryZoneAdminState.error}</p>
                    ) : null}
                    {deliveryZoneAdminState.success ? (
                      <p className="form-message form-message--success">{deliveryZoneAdminState.success}</p>
                    ) : null}
                    <button
                      type="submit"
                      className="button button--primary"
                      disabled={deliveryZoneAdminState.saving || deliveryZoneAdminState.loading}
                    >
                      {deliveryZoneAdminState.saving ? "Saving zones..." : "Save Delivery Zones"}
                    </button>
                  </form>
                  </article>
                ) : null}

                {adminSession.isOwner ? (
                  <article className="admin-card reveal reveal--up reveal--delay-1">
                  <div className="admin-card__header">
                    <h3>Menu Manager</h3>
                    <span>{filteredMenuAdminItems.length}</span>
                  </div>
                  <form className="admin-zone-form" onSubmit={handleMenuSave}>
                    <label className="search-field">
                      <span>Search menu items</span>
                      <input
                        type="text"
                        value={menuAdminQuery}
                        onChange={(event) => setMenuAdminQuery(event.target.value)}
                        placeholder="Search by meal name, category, or badge"
                      />
                    </label>
                    <div className="admin-list">
                      {filteredMenuAdminItems.map((item) => (
                        <div key={item.id} className="admin-item">
                          <div className="admin-item__row">
                            <div>
                              <strong>{item.name}</strong>
                              <p className="admin-item__subtle">{item.category}</p>
                            </div>
                            <span className={`status-pill ${item.hidden ? "status-pill--new" : item.soldOut ? "status-pill--cancelled" : "status-pill--delivered"}`}>
                              {item.hidden ? "hidden" : item.soldOut ? "sold out" : "available"}
                            </span>
                          </div>

                          <div className="service-form__grid">
                            <label className="field">
                              <span>Price (NGN)</span>
                              <input
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={(event) =>
                                  updateMenuAdminItem(item.id, { price: Number(event.target.value) || 0 })
                                }
                              />
                            </label>

                            <label className="field">
                              <span>Availability</span>
                              <select
                                value={item.hidden ? "hidden" : item.soldOut ? "sold-out" : "available"}
                                onChange={(event) => handleMenuAvailabilityChange(item.id, event.target.value)}
                              >
                                {menuVisibilityOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="field">
                              <span>Stock quantity</span>
                              <input
                                type="number"
                                min="0"
                                value={item.stockQuantity || 0}
                                onChange={(event) =>
                                  updateMenuAdminItem(item.id, { stockQuantity: Number(event.target.value) || 0 })
                                }
                              />
                            </label>
                            <label className="field">
                              <span>Available from</span>
                              <input
                                type="time"
                                value={item.availableFrom || ""}
                                onChange={(event) => updateMenuAdminItem(item.id, { availableFrom: event.target.value })}
                              />
                            </label>
                            <label className="field">
                              <span>Available until</span>
                              <input
                                type="time"
                                value={item.availableUntil || ""}
                                onChange={(event) => updateMenuAdminItem(item.id, { availableUntil: event.target.value })}
                              />
                            </label>
                          </div>

                          <label className="field">
                            <span>Menu badge</span>
                            <input
                              type="text"
                              value={item.badge}
                              onChange={(event) => updateMenuAdminItem(item.id, { badge: event.target.value })}
                            />
                          </label>

                          <label className="note-field">
                            <span>Description</span>
                            <textarea
                              rows="3"
                              value={item.description}
                              onChange={(event) =>
                                updateMenuAdminItem(item.id, { description: event.target.value })
                              }
                            />
                          </label>

                          <label className="field">
                            <span>Image URL</span>
                            <input
                              type="url"
                              value={item.imageUrl || ""}
                              onChange={(event) => updateMenuAdminItem(item.id, { imageUrl: event.target.value })}
                              placeholder="https://..."
                            />
                          </label>

                          <label className="field">
                            <span>Available days</span>
                            <input
                              type="text"
                              value={normalizeScheduleDays(item.availableDays).join(", ")}
                              onChange={(event) =>
                                updateMenuAdminItem(item.id, {
                                  availableDays: event.target.value
                                    .split(",")
                                    .map((day) => day.trim().slice(0, 3).toLowerCase())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="mon, tue, wed, thu, fri"
                            />
                          </label>
                        </div>
                      ))}
                    </div>

                    {filteredMenuAdminItems.length === 0 ? (
                      <p className="admin-empty">No menu items matched that search.</p>
                    ) : null}

                    {menuAdminState.error ? (
                      <p className="form-message form-message--error">{menuAdminState.error}</p>
                    ) : null}
                    {menuAdminState.success ? (
                      <p className="form-message form-message--success">{menuAdminState.success}</p>
                    ) : null}

                    <button
                      type="submit"
                      className="button button--primary"
                      disabled={menuAdminState.saving || menuAdminState.loading}
                    >
                      {menuAdminState.saving ? "Saving menu..." : "Save Menu Changes"}
                    </button>
                  </form>
                  </article>
                ) : (
                  <article className="admin-card reveal reveal--up reveal--delay-1">
                    <div className="admin-card__header">
                      <h3>Branch Staff Access</h3>
                      <span>{adminSession.label || "Staff"}</span>
                    </div>
                    <p className="admin-empty">
                      Branch staff can manage live orders, messages, catering, reservations, and reviews. Global business settings stay with the owner account.
                    </p>
                  </article>
                )}

                <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Recent Orders</h3>
                    <span>{filteredAdminOrders.length}</span>
                  </div>
                  {filteredAdminOrders.length > 0 ? (
                    <div className="admin-bulk-bar">
                      <label className="field">
                        <span>Bulk status</span>
                        <select value={bulkOrderStatus} onChange={(event) => setBulkOrderStatus(event.target.value)}>
                          {orderStatuses
                            .filter((status) => status !== "all")
                            .map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={handleBulkOrderStatusUpdate}
                        disabled={orderActionState.loadingRef === "bulk" || selectedOrderReferences.length === 0}
                      >
                        {orderActionState.loadingRef === "bulk"
                          ? "Updating..."
                          : `Update ${selectedOrderReferences.length} selected`}
                      </button>
                    </div>
                  ) : null}

                  {filteredAdminOrders.length === 0 ? (
                    <p className="admin-empty">No orders yet.</p>
                  ) : (
                    <div className="admin-list">
                      {filteredAdminOrders.map((order) => (
                        <div key={order.reference} className="admin-item">
                          <div className="admin-item__row">
                            <label className="admin-check">
                              <input
                                type="checkbox"
                                checked={selectedOrderReferences.includes(order.reference)}
                                onChange={(event) =>
                                  setSelectedOrderReferences((previous) =>
                                    event.target.checked
                                      ? [...previous, order.reference]
                                      : previous.filter((reference) => reference !== order.reference),
                                  )
                                }
                              />
                              <strong>{order.customer.customerName}</strong>
                            </label>
                            <span>{order.reference}</span>
                          </div>
                          <p className="admin-item__subtle">{getRecordBranchName(order)}</p>
                          <p>
                            {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                          </p>
                          <p>
                            {order.customer.fulfillmentMethod || "delivery"}
                            {order.customer.scheduledFor ? ` • ${formatDateTime(order.customer.scheduledFor)}` : ""}
                          </p>
                          <div className="admin-item__row">
                            <span>{order.customer.phone}</span>
                            <strong>{formatPrice(order.pricing.total)}</strong>
                          </div>
                          {order.customer.landmark ? <p>Landmark: {order.customer.landmark}</p> : null}
                          {order.customer.promoCode ? <p>Promo code: {order.customer.promoCode}</p> : null}
                          <p>
                            Payment: {order.customer.paymentMethod} | {order.payment?.status || "unpaid"} | Ref:{" "}
                            {order.payment?.reference || "Not added"}
                          </p>
                          {order.payment?.paidAt ? <p>Paid at {formatDateTime(order.payment.paidAt)}</p> : null}
                          <div className="admin-status-row">
                            <span className={`status-pill status-pill--${order.status}`}>{order.status}</span>
                            <div className="admin-status-actions">
                              <select
                                value={order.status}
                                onChange={(event) =>
                                  handleOrderStatusChange(order.reference, event.target.value)
                                }
                                disabled={orderActionState.loadingRef === order.reference}
                              >
                                {orderStatuses
                                  .filter((status) => status !== "all")
                                  .map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                              </select>
                              <button
                                type="button"
                                className="button button--ghost button--small"
                                onClick={() => printOrderSlip(order)}
                              >
                                Print Slip
                              </button>
                              <button
                                type="button"
                                className="button button--ghost button--small"
                                onClick={() => downloadOrderReceipt(order)}
                              >
                                Receipt
                              </button>
                            </div>
                          </div>
                          <p>{formatDateTime(order.updatedAt || order.createdAt)}</p>
                          <p>{order.customer.address}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Low Stock Alert</h3>
                    <span>{lowStockMenuItems.length}</span>
                  </div>
                  {lowStockMenuItems.length === 0 ? (
                    <p className="admin-empty">No low-stock items right now.</p>
                  ) : (
                    <div className="admin-list">
                      {lowStockMenuItems.map((item) => (
                        <div key={item.id} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{item.name}</strong>
                            <span>{item.stockQuantity} left</span>
                          </div>
                          <p className="admin-item__subtle">{item.category}</p>
                          <p>Flag this item in Menu Manager before it runs out completely.</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="admin-card reveal reveal--up reveal--delay-1">
                  <div className="admin-card__header">
                    <h3>Contact Messages</h3>
                    <span>{filteredAdminContacts.length}</span>
                  </div>

                  {filteredAdminContacts.length === 0 ? (
                    <p className="admin-empty">No messages yet.</p>
                  ) : (
                    <div className="admin-list">
                      {filteredAdminContacts.map((message) => (
                        <div key={message.reference} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{message.name}</strong>
                            <span>{message.reference}</span>
                          </div>
                          <p className="admin-item__subtle">{getRecordBranchName(message)}</p>
                          <p>{message.phone}</p>
                          <div className="admin-status-row">
                            <span className={`status-pill status-pill--${message.status || "new"}`}>
                              {message.status || "new"}
                            </span>
                            <select
                              value={message.status || "new"}
                              onChange={(event) =>
                                handleContactStatusChange(message.reference, event.target.value)
                              }
                              disabled={orderActionState.loadingRef === message.reference}
                            >
                              {contactStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                          <p>{formatDateTime(message.updatedAt || message.createdAt)}</p>
                          <p>{message.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="admin-card reveal reveal--up reveal--delay-2">
                  <div className="admin-card__header">
                    <h3>Catering Requests</h3>
                    <span>{filteredAdminCatering.length}</span>
                  </div>

                  {filteredAdminCatering.length === 0 ? (
                    <p className="admin-empty">No catering requests yet.</p>
                  ) : (
                    <div className="admin-list">
                      {filteredAdminCatering.map((request) => (
                        <div key={request.reference} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{request.name}</strong>
                            <span>{request.reference}</span>
                          </div>
                          <p className="admin-item__subtle">{getRecordBranchName(request)}</p>
                          <p>
                            {request.eventType || "Event"} on {request.eventDate} for {request.guestCount} guests
                          </p>
                          <p>{request.phone}</p>
                          <div className="admin-status-row">
                            <span className={`status-pill status-pill--${request.status || "new"}`}>
                              {request.status || "new"}
                            </span>
                            <select
                              value={request.status || "new"}
                              onChange={(event) =>
                                handleCateringStatusChange(request.reference, event.target.value)
                              }
                              disabled={orderActionState.loadingRef === request.reference}
                            >
                              {cateringStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                          <p>{formatDateTime(request.updatedAt || request.createdAt)}</p>
                          <p>{request.details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Reservations</h3>
                    <span>{filteredAdminReservations.length}</span>
                  </div>

                  {filteredAdminReservations.length === 0 ? (
                    <p className="admin-empty">No reservations yet.</p>
                  ) : (
                    <div className="admin-list">
                      {filteredAdminReservations.map((reservation) => (
                        <div key={reservation.reference} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{reservation.name}</strong>
                            <span>{reservation.reference}</span>
                          </div>
                          <p className="admin-item__subtle">{getRecordBranchName(reservation)}</p>
                          <p>{reservation.date} at {reservation.time} for {reservation.guests} guest(s)</p>
                          <p>{reservation.phone}</p>
                          <span className={`status-pill status-pill--${reservation.status || "new"}`}>{reservation.status || "new"}</span>
                          <p>{reservation.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Recent Reviews</h3>
                    <span>{recentReviews.length}</span>
                  </div>

                  {recentReviews.length === 0 ? (
                    <p className="admin-empty">No reviews yet.</p>
                  ) : (
                    <div className="admin-list">
                      {recentReviews.map((review) => (
                        <div key={review.reference} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{review.customerName}</strong>
                            <span>{review.rating}/5</span>
                          </div>
                          <p className="admin-item__subtle">{getRecordBranchName(review)}</p>
                          <p>{review.comment || "No written comment."}</p>
                          <p>{formatDateTime(review.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </div>

              {adminSession.isOwner ? (
                <form className="admin-password-card service-form reveal reveal--up reveal--delay-2" onSubmit={handleAdminPasswordChange}>
                <div className="admin-login__copy">
                  <h3>Change admin password</h3>
                  <p>
                    Update the PEM admin password here. This will rewrite your local `.env` file and sign
                    you out once the change is saved.
                  </p>
                </div>

                <div className="service-form__grid">
                  <label className="field" data-checkout-field="paymentReference">
                    <span>Current password</span>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({
                          ...previous,
                          currentPassword: event.target.value,
                        }))
                      }
                      placeholder="Current password"
                    />
                  </label>

                  <label className="field" data-checkout-field="promoCode">
                    <span>New password</span>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({
                          ...previous,
                          newPassword: event.target.value,
                        }))
                      }
                      placeholder="At least 8 characters"
                    />
                  </label>

                  <label className="field">
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((previous) => ({
                          ...previous,
                          confirmPassword: event.target.value,
                        }))
                      }
                      placeholder="Repeat new password"
                    />
                  </label>
                </div>

                {passwordState.error ? (
                  <p className="form-message form-message--error">{passwordState.error}</p>
                ) : null}
                {passwordState.success ? (
                  <p className="form-message form-message--success">{passwordState.success}</p>
                ) : null}

                <button
                  type="submit"
                  className="button button--primary service-form__button"
                  disabled={passwordState.loading}
                >
                  {passwordState.loading ? "Saving..." : "Update Password"}
                </button>
                </form>
              ) : null}
            </>
          )}
        </section>
        ) : null}
      </main>

      <div className="mobile-quickbar">
        <button type="button" className={activePage === "menu" ? "is-active" : ""} onClick={() => navigateToPage("menu")}>
          Menu
        </button>
        <button type="button" className={activePage === "track" ? "is-active" : ""} onClick={() => navigateToPage("track")}>
          Track
        </button>
        <button type="button" className={activePage === "catering" ? "is-active" : ""} onClick={() => navigateToPage("catering")}>
          Catering
        </button>
        <button type="button" className={activePage === "contact" ? "is-active" : ""} onClick={() => navigateToPage("contact")}>
          Contact
        </button>
        <button type="button" className={activePage === "account" ? "is-active" : ""} onClick={() => navigateToPage("account")}>
          Account
        </button>
      </div>

      <aside className={showCart ? "cart-drawer is-open" : "cart-drawer"} aria-hidden={!showCart}>
        <div className="cart-drawer__backdrop" onClick={() => setShowCart(false)} />
        <div className="cart-drawer__panel">
          <div className="cart-drawer__header">
            <div>
              <p className="eyebrow">Your Order</p>
              <h2>PEM cart</h2>
            </div>
            <button type="button" className="cart-close" onClick={() => setShowCart(false)}>
              x
            </button>
          </div>

          <div className="cart-drawer__body">
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <strong>No meal added yet.</strong>
                <p>Select dishes, set the quantity, and leave any special notes you want.</p>
              </div>
            ) : (
              <>
                {cartItems.map((item) => (
                  <article key={item.id} className="cart-item">
                    <div className="cart-item__top">
                      <div>
                        <h3>{item.name}</h3>
                        <p>{formatPrice(item.price)} each</p>
                        {item.soldOut ? <p className="cart-item__note">This item is currently sold out.</p> : null}
                      </div>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>

                    <QuantityControl
                      value={item.quantity}
                      onDecrease={() => updateQuantity(item.id, -1)}
                      onIncrease={() => updateQuantity(item.id, 1)}
                      disabled={item.soldOut}
                    />

                    {item.note ? <p className="cart-item__note">Note: {item.note}</p> : null}
                  </article>
                ))}

                <div className="checkout-fields">
                  <p className="checkout-fields__title">Delivery details</p>
                  <p className="cart-help">Minimum order: {formatPrice(Number(businessSettings.minimumOrder || 0))}</p>
                  {checkoutProfileNotice ? (
                    <p className="form-message form-message--notice form-message--compact">{checkoutProfileNotice}</p>
                  ) : null}
                  <div className="checkout-group">
                    <div className="checkout-group__header">
                      <strong>Contact</strong>
                      <span>Who PEM should reach</span>
                    </div>
                  <div className="delivery-zone-card delivery-zone-card--accent">
                    <p className="delivery-zone-card__title">Estimated handoff</p>
                    <strong>{deliveryEtaLabel}</strong>
                    <span>
                      {checkoutForm.fulfillmentMethod === "pickup"
                        ? "PEM will text or call when your meal is ready for collection."
                        : "Timing depends on your branch, your area, and kitchen volume."}
                    </span>
                  </div>
                  <div className="delivery-zone-card">
                    <p className="delivery-zone-card__title">Chosen branch</p>
                    <strong>{selectedBranch?.label || `${businessSettings.appName} Branch`}</strong>
                    <span>{selectedBranch?.address || businessSettings.address}</span>
                    <small>{selectedBranch?.note || businessSettings.contactPromise}</small>
                  </div>
                  <label className="field">
                    <span>Customer name</span>
                    <input
                      type="text"
                      value={checkoutForm.customerName}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          customerName: event.target.value,
                        }))
                      }
                      onBlur={(event) => validateCheckoutField("customerName", event.target.value)}
                      placeholder="Your full name"
                    />
                    {checkoutFieldErrors.customerName ? <small className="field__error">{checkoutFieldErrors.customerName}</small> : null}
                  </label>

                  <label className="field">
                    <span>Phone number</span>
                    <input
                      type="tel"
                      value={checkoutForm.phone}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          phone: sanitizePhoneInput(event.target.value),
                        }))
                      }
                      onBlur={(event) => validateCheckoutField("phone", event.target.value)}
                      placeholder="0803 334 5161"
                    />
                    {checkoutFieldErrors.phone ? <small className="field__error">{checkoutFieldErrors.phone}</small> : null}
                  </label>

                  <label className="field">
                    <span>{selectedPaymentIsCard ? "Email address" : "Email address (optional)"}</span>
                    <input
                      type="email"
                      value={checkoutForm.email}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                      onBlur={(event) => validateCheckoutField("email", event.target.value)}
                      placeholder="you@example.com"
                    />
                    {checkoutFieldErrors.email ? <small className="field__error">{checkoutFieldErrors.email}</small> : null}
                    {selectedPaymentIsCard && !checkoutFieldErrors.email ? (
                      <small className="cart-help">PEM needs your email to open secure card payment.</small>
                    ) : null}
                  </label>

                  <div className="checkout-location-mode checkout-location-mode--tight">
                    <div className="checkout-group__header">
                      <strong>Who is this order for?</strong>
                      <span>Send a meal to yourself or another PEM user.</span>
                    </div>
                    <div className="segmented-toggle">
                      <button
                        type="button"
                        className={!isGiftOrder ? "is-active" : ""}
                        onClick={() => handleCheckoutOrderTypeChange("self")}
                      >
                        For me
                      </button>
                      <button
                        type="button"
                        className={isGiftOrder ? "is-active" : ""}
                        onClick={() => handleCheckoutOrderTypeChange("gift")}
                      >
                        Buy for a friend
                      </button>
                    </div>
                  </div>

                  {isGiftOrder ? (
                    <>
                      <label className="field">
                        <span>Friend's PEM email</span>
                        <input
                          type="email"
                          value={checkoutForm.recipientEmail}
                          onChange={(event) =>
                            setCheckoutForm((previous) => ({
                              ...previous,
                              recipientEmail: event.target.value,
                            }))
                          }
                          onBlur={(event) => validateCheckoutField("recipientEmail", event.target.value)}
                          placeholder="friend@example.com"
                        />
                        {checkoutFieldErrors.recipientEmail ? (
                          <small className="field__error">{checkoutFieldErrors.recipientEmail}</small>
                        ) : (
                          <small className="cart-help">PEM will notify them in-app so they can accept or decline the gift.</small>
                        )}
                      </label>

                      <label className="field">
                        <span>Gift note (optional)</span>
                        <textarea
                          rows="2"
                          value={checkoutForm.giftMessage}
                          onChange={(event) =>
                            setCheckoutForm((previous) => ({
                              ...previous,
                              giftMessage: event.target.value,
                            }))
                          }
                          placeholder="A short note for your friend"
                        />
                      </label>
                    </>
                  ) : null}
                  </div>

                  <div className="checkout-group">
                    <div className="checkout-group__header">
                      <strong>Delivery</strong>
                      <span>Where and when the meal should get to you</span>
                    </div>
                  <label className="field">
                    <span>Fulfillment</span>
                    <select
                      value={checkoutForm.fulfillmentMethod}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          fulfillmentMethod: event.target.value,
                        }))
                      }
                    >
                      <option value="delivery">Delivery</option>
                      <option value="pickup">Pickup</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Schedule for later</span>
                    <input
                      type="datetime-local"
                      value={checkoutForm.scheduledFor}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          scheduledFor: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="field">
                    <span>Delivery area</span>
                    <select
                      disabled={checkoutForm.fulfillmentMethod === "pickup"}
                      value={checkoutForm.deliveryZone}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          deliveryZone: event.target.value,
                        }))
                      }
                    >
                      {deliveryZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {`${zone.label} - ${formatPrice(zone.fee)} - ${zone.eta}`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="delivery-zone-card">
                    <p className="delivery-zone-card__title">
                      {checkoutForm.fulfillmentMethod === "pickup" ? "Pickup" : "Area delivery estimate"}
                    </p>
                    <strong>{checkoutForm.fulfillmentMethod === "pickup" ? "No delivery fee" : formatPrice(selectedDeliveryZone.fee)}</strong>
                    <span>{checkoutForm.fulfillmentMethod === "pickup" ? "PEM will confirm your pickup time." : selectedDeliveryZone.eta}</span>
                    {checkoutForm.fulfillmentMethod !== "pickup" && (selectedDeliveryZone.id === "owerri" || selectedDeliveryZone.id === "custom") ? (
                      <small>PEM will confirm final timing with you after the order is received.</small>
                    ) : null}
                  </div>

                  {isGiftOrder ? (
                    <div className="delivery-zone-card delivery-zone-card--muted">
                      <p className="delivery-zone-card__title">Friend delivery flow</p>
                      <strong>They choose the final address</strong>
                      <small>
                        Choose the branch and area that best matches your friend. After PEM notifies them, they will accept the gift and enter their current delivery address.
                      </small>
                    </div>
                  ) : null}

                  {!isGiftOrder && checkoutForm.fulfillmentMethod !== "pickup" && canUseProfileAddress ? (
                    <div className="checkout-location-mode">
                      <div className="checkout-group__header">
                        <strong>Delivery location for this order</strong>
                        <span>Your saved profile address stays unchanged unless you edit it inside Account.</span>
                      </div>
                      <div className="segmented-toggle">
                        <button
                          type="button"
                          className={usingProfileAddress ? "is-active" : ""}
                          onClick={() => setCheckoutAddressMode("profile")}
                        >
                          Same as profile
                        </button>
                        <button
                          type="button"
                          className={!usingProfileAddress ? "is-active" : ""}
                          onClick={() => setCheckoutAddressMode("current")}
                        >
                          Different for this order
                        </button>
                      </div>
                      {usingProfileAddress ? (
                        <div className="delivery-zone-card delivery-zone-card--muted">
                          <p className="delivery-zone-card__title">Saved profile address</p>
                          <strong>{savedProfileAddress}</strong>
                          <small>Switch to a different location whenever you are ordering from work, school, or while travelling.</small>
                        </div>
                      ) : (
                        <p className="cart-help">PEM will use the address below for this order only.</p>
                      )}
                    </div>
                  ) : null}

                  {!isGiftOrder && checkoutForm.fulfillmentMethod !== "pickup" && !usingProfileAddress ? (
                    <label className="field" data-checkout-field="address">
                      <span>Delivery address</span>
                      <textarea
                        rows="3"
                        value={checkoutForm.address}
                        onChange={(event) => {
                          const nextAddress = event.target.value;
                          setCustomCheckoutAddress(nextAddress);
                          setCheckoutForm((previous) => ({
                            ...previous,
                            address: nextAddress,
                          }));
                        }}
                        onBlur={(event) => validateCheckoutField("address", event.target.value)}
                        placeholder="Street, area, city"
                      />
                      {checkoutFieldErrors.address ? <small className="field__error">{checkoutFieldErrors.address}</small> : null}
                    </label>
                  ) : null}

                  {!isGiftOrder ? (
                  <label className="field" data-checkout-field="paymentReference">
                    <span>Nearest landmark</span>
                    <input
                      type="text"
                      value={checkoutForm.landmark}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          landmark: event.target.value,
                        }))
                      }
                      placeholder="Bus stop, estate gate, popular shop"
                    />
                  </label>
                  ) : null}
                  </div>

                  <div className="checkout-group">
                    <div className="checkout-group__header">
                      <strong>Payment</strong>
                      <span>Choose how you want to pay</span>
                    </div>
<div className="payment-options">
                      {availableCheckoutPaymentOptions.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          className={checkoutForm.paymentMethod === option.label ? "payment-option is-active" : "payment-option"}
                          onClick={() =>
                            setCheckoutForm((previous) => ({
                              ...previous,
                              paymentMethod: option.label,
                              paymentReference: option.label === "Bank transfer" ? previous.paymentReference : "",
                            }))
                          }
                        >
                          <span aria-hidden="true">{option.icon}</span>
                          <strong>{option.label}</strong>
                        </button>
                      ))}
                    </div>

                  {isGiftOrder ? (
                    <small className="cart-help">
                      Gift orders use bank transfer so your friend never gets asked to pay on delivery.
                    </small>
                  ) : null}

                  <label className="field" data-checkout-field="promoCode">
                    <span>Payment reference</span>
                    <input
                      type="text"
                      disabled={checkoutForm.paymentMethod !== "Bank transfer"}
                      value={checkoutForm.paymentReference}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          paymentReference: event.target.value,
                        }))
                      }
                      placeholder="Bank transfer reference"
                    />
                  </label>

                  <label className="field">
                    <span>Promo code</span>
                    <input
                      type="text"
                      value={checkoutForm.promoCode}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          promoCode: event.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="WELCOME10"
                    />
                    {checkoutForm.promoCode.trim() ? (
                      <small className={promoValidationState.valid ? "field__success" : promoValidationState.error ? "field__error" : "cart-help"}>
                        {promoValidationState.loading
                          ? "Validating promo code..."
                          : promoValidationState.valid
                            ? `Promo applied: -${formatPrice(promoValidationState.amount)}`
                            : promoValidationState.error
                              ? promoValidationState.error
                              : promoValidationState.minimumOrder
                                ? `Promo needs a minimum subtotal of ${formatPrice(promoValidationState.minimumOrder)}.`
                        : "That promo code is not valid right now."}
                      </small>
                    ) : null}
                  </label>
                  </div>

                  {checkoutForm.paymentMethod === "Bank transfer" ? (
                    bankTransferReady ? (
                      <div className="delivery-zone-card transfer-card">
                        <div className="transfer-card__header">
                          <div>
                            <p className="delivery-zone-card__title">Bank transfer details</p>
                            <strong>{businessSettings.bankName}</strong>
                          </div>
                          <button
                            type="button"
                            className="button button--ghost button--small"
                            onClick={() =>
                              copyBankTransferDetail(
                                "bank details",
                                `${businessSettings.bankName}\n${businessSettings.bankAccountName}\n${businessSettings.bankAccountNumber}`,
                              )
                            }
                          >
                            Copy all
                          </button>
                        </div>
                        <div className="transfer-card__row">
                          <div>
                            <span className="transfer-card__label">Account name</span>
                            <strong className="transfer-card__value">{businessSettings.bankAccountName}</strong>
                          </div>
                          <button
                            type="button"
                            className="button button--ghost button--small"
                            onClick={() => copyBankTransferDetail("account name", businessSettings.bankAccountName)}
                          >
                            Copy
                          </button>
                        </div>
                        <div className="transfer-card__row">
                          <div>
                            <span className="transfer-card__label">Account number</span>
                            <strong className="transfer-card__value">{businessSettings.bankAccountNumber}</strong>
                          </div>
                          <button
                            type="button"
                            className="button button--ghost button--small"
                            onClick={() => copyBankTransferDetail("account number", businessSettings.bankAccountNumber)}
                          >
                            Copy
                          </button>
                        </div>
                        <small>{businessSettings.bankInstructions}</small>
                      </div>
                    ) : (
                      <div className="delivery-zone-card">
                        <p className="delivery-zone-card__title">Bank transfer details</p>
                        <strong>Bank transfer not set yet</strong>
                        <small>PEM has not added transfer details in Admin. Use pay on arrival or contact the team.</small>
                      </div>
                    )
                  ) : null}

                  {selectedPaymentIsCard ? (
                    <div className="delivery-zone-card">
                      <p className="delivery-zone-card__title">Card payment</p>
                      <strong>Secure online checkout</strong>
                      <small>PEM will open a secure card payment page after your order is created.</small>
                    </div>
                  ) : null}
                </div>

                {smartCartSuggestions.length > 0 ? (
                  <div className="cart-suggestions">
                    <div className="cart-suggestions__header">
                      <p className="eyebrow">Suggested Add-ons</p>
                      <h3>Complete this order with one tap.</h3>
                    </div>
                    <div className="cart-suggestions__list">
                      {smartCartSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="cart-suggestion"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.category}</span>
                          </div>
                          <em>{formatPrice(item.price)}</em>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="cart-drawer__footer">
            {checkoutState.error ? (
              <p className={checkoutValidationNoticeVisible ? "form-message form-message--notice" : "form-message form-message--error"}>
                {checkoutState.error}
              </p>
            ) : null}

            <p className="cart-help">
              {isGiftOrder
                ? "Prefer chat? Send this gift request to PEM on WhatsApp and continue it there."
                : "Prefer chat? Send this cart to PEM on WhatsApp and continue the order there."}
            </p>
            <div className="cart-footer__highlights">
              <span>{checkoutForm.fulfillmentMethod === "pickup" ? "Pickup ready confirmation by PEM" : deliveryEtaLabel}</span>
              <span>{selectedBranch?.label || `${businessSettings.appName} Branch`}</span>
            </div>
            <div className="cart-order-summary">
              <div>
                <span>Branch</span>
                <strong>{selectedBranch?.label || `${businessSettings.appName} Branch`}</strong>
              </div>
              <div>
                <span>Area</span>
                <strong>{checkoutForm.fulfillmentMethod === "pickup" ? "Pickup" : selectedDeliveryZone.label}</strong>
              </div>
            </div>

            <div className="cart-total">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="cart-total">
              <span>Delivery</span>
              <strong>{formatPrice(delivery)}</strong>
            </div>
            {discount > 0 ? (
              <div className="cart-total">
                <span>Promo discount</span>
                <strong>-{formatPrice(discount)}</strong>
              </div>
            ) : null}
            <div className="cart-total cart-total--grand">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <button
              type="button"
              className="button button--ghost button--full cart-button--secondary"
              onClick={handleWhatsAppOrder}
              disabled={!isOnline}
            >
              Send Order To WhatsApp
            </button>
            <button
              type="button"
              className="button button--primary button--full"
              onClick={handlePlaceOrder}
              disabled={checkoutState.loading || !isOnline}
            >
              {checkoutState.loading
                ? isGiftOrder
                  ? "Sending gift..."
                  : selectedPaymentIsCard
                  ? "Opening secure card payment..."
                  : "Submitting order..."
                : isGiftOrder
                  ? "Send Gift Request"
                  : selectedPaymentIsCard
                  ? "Proceed to card payment"
                  : "Place Order"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
