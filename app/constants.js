import { defaultDeliveryZones, defaultMenuSchedule, menuItems } from "./data.js";

export const orderStatuses = [
  "all",
  "awaiting_payment",
  "received",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const contactStatuses = ["new", "handled"];
export const cateringStatuses = ["new", "contacted", "booked"];

export const CACHE_TTL = {
  account: 10 * 60 * 1000,
  deliveryZones: 30 * 60 * 1000,
  menu: 10 * 60 * 1000,
  settings: 15 * 60 * 1000,
  admin: 2 * 60 * 1000,
  tracking: 10 * 60 * 1000,
};

export const ORDER_ITEM_LIMIT = 10;

export const initialReviewForm = {
  rating: "5",
  comment: "",
};

export const initialAdminState = {
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

export const initialDietaryState = {
  loading: false,
  error: "",
  summary: "",
  caution: "",
  matches: [],
  mode: "",
  degraded: false,
};

export const initialPromoValidationState = {
  loading: false,
  valid: false,
  amount: 0,
  code: "",
  minimumOrder: 0,
  subtotal: 0,
  error: "",
};

export const initialBusinessSettings = {
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

export const initialSettingsAdminState = {
  loading: false,
  saving: false,
  error: "",
  success: "",
  settings: initialBusinessSettings,
};

export const initialAccountUser = {
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

export const initialAdminSession = {
  username: "",
  label: "",
  branchId: "",
  isOwner: false,
};

export const initialAccountForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  referralCode: "",
};

export const initialAccountGifts = {
  received: [],
  sent: [],
};

export const initialGiftActionState = {
  loadingRef: "",
  error: "",
  success: "",
  openRef: "",
  address: "",
  landmark: "",
  phone: "",
};

export const initialLoginForm = {
  email: "",
  password: "",
};

export const initialForgotPasswordForm = {
  email: "",
  phone: "",
  newPassword: "",
};

export const initialCheckout = {
  customerName: "",
  phone: "",
  email: "",
  orderType: "self",
  recipientEmail: "",
  giftMessage: "",
  address: "",
  landmark: "",
  fulfillmentMethod: "delivery",
  scheduledFor: "",
  deliveryZone: "gwarinpa",
  paymentMethod: "Pay on arrival",
  paymentReference: "",
  promoCode: "",
};

export const initialTrackingState = {
  loading: false,
  error: "",
  order: null,
};

export const initialDeliveryZoneAdminState = {
  loading: false,
  saving: false,
  error: "",
  success: "",
  zones: defaultDeliveryZones,
};

export const initialMenuAdminState = {
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

export const initialContact = {
  name: "",
  phone: "",
  message: "",
};

export const initialCatering = {
  name: "",
  phone: "",
  eventDate: "",
  guestCount: "",
  eventType: "",
  details: "",
};

export const initialReservation = {
  name: "",
  phone: "",
  date: "",
  time: "",
  guests: "",
  notes: "",
};
