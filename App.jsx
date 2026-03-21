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
import hollandiaImage from "./Hollandia.jpg";
import moiMoiImage from "./Moimoi.jpg";
import ohaImage from "./Oha soup.jpg";
import parfaitImage from "./Parfaits.jpg";
import plantainImage from "./Plantain.jpg";
import beansPlantainImage from "./Porridge beans and plantain.jpg";
import smoothieImage from "./Smoothie.jpg";
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
const menuSections = [
  { id: "all", label: "Everything", categories },
  { id: "mains", label: "Main Meals", categories: ["All", "Rice", "Pasta", "Grills", "Local Special"] },
  { id: "soups", label: "Soups", categories: ["All", "Soup"] },
  { id: "sides", label: "Sides", categories: ["All", "Sides"] },
  { id: "drinks", label: "Drinks & Desserts", categories: ["All", "Drinks", "Drinks & Desserts"] },
];
const drinkCount = menuItems.filter((item) => item.category.includes("Drink")).length;
const localDishCount = menuItems.filter(
  (item) => item.category === "Soup" || item.category === "Local Special",
).length;
const whatsappPhone = "2348033345161";
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
  address: "",
  deliveryZone: "gwarinpa",
  paymentMethod: "Pay on delivery",
};

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

const initialAdminState = {
  loading: false,
  error: "",
  data: {
    orders: [],
    contacts: [],
    catering: [],
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

const orderStatuses = ["all", "received", "preparing", "ready", "delivered", "cancelled"];
const contactStatuses = ["new", "handled"];
const cateringStatuses = ["new", "contacted", "booked"];
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function apiUrl(pathname) {
  return apiBaseUrl ? `${apiBaseUrl}${pathname}` : pathname;
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

function getDeliveryZone(zoneId) {
  return defaultDeliveryZones.find((zone) => zone.id === zoneId) || defaultDeliveryZones[0];
}

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:00 ${suffix}`;
}

function getBusinessStatus() {
  const formatter = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    hour: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hourValue = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const schedule = businessHours.find((entry) => entry.day === weekday) || businessHours[0];
  const isOpen = hourValue >= schedule.open && hourValue < schedule.close;

  return {
    isOpen,
    label: isOpen
      ? `Open now until ${formatHour(schedule.close)}`
      : `Opens ${formatHour(schedule.open)} today`,
  };
}

async function postJson(url, payload) {
  const response = await fetch(apiUrl(url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
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
            *
          </span>
        ))}
      </div>
      <span>{rating.toFixed(1)}</span>
    </div>
  );
}

function QuantityControl({ value, onDecrease, onIncrease }) {
  return (
    <div className="qty-control">
      <button type="button" onClick={onDecrease} aria-label="Decrease quantity">
        -
      </button>
      <span>{value}</span>
      <button type="button" onClick={onIncrease} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

export default function App() {
  const businessStatus = getBusinessStatus();
  const [theme, setTheme] = useState("light");
  const [activeMenuSection, setActiveMenuSection] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState("reviews");
  const [minimumRating, setMinimumRating] = useState(0);
  const [cart, setCart] = useState({});
  const [notes, setNotes] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [savedReferences, setSavedReferences] = useState([]);
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState("");
  const [checkoutForm, setCheckoutForm] = useState(initialCheckout);
  const [checkoutState, setCheckoutState] = useState({ loading: false, error: "" });
  const [contactForm, setContactForm] = useState(initialContact);
  const [contactState, setContactState] = useState({ loading: false, success: "", error: "" });
  const [cateringForm, setCateringForm] = useState(initialCatering);
  const [cateringState, setCateringState] = useState({ loading: false, success: "", error: "" });
  const [trackingReference, setTrackingReference] = useState("");
  const [trackingState, setTrackingState] = useState(initialTrackingState);
  const [deliveryZoneAdminState, setDeliveryZoneAdminState] = useState(initialDeliveryZoneAdminState);
  const [deliveryZones, setDeliveryZones] = useState(defaultDeliveryZones);
  const [dietaryNeeds, setDietaryNeeds] = useState("");
  const [dietaryState, setDietaryState] = useState(initialDietaryState);
  const [showDietaryMatchesOnly, setShowDietaryMatchesOnly] = useState(false);
  const [adminState, setAdminState] = useState(initialAdminState);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [adminLoginState, setAdminLoginState] = useState({ loading: false, error: "" });
  const [adminQuery, setAdminQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordState, setPasswordState] = useState({ loading: false, error: "", success: "" });
  const [orderActionState, setOrderActionState] = useState({ loadingRef: "", error: "", success: "" });
  const recommendedItemIds = dietaryState.matches.map((match) => match.itemId);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pem-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    try {
      const storedFavorites = JSON.parse(window.localStorage.getItem("pem-favorites") || "[]");
      const storedReferences = JSON.parse(window.localStorage.getItem("pem-order-history") || "[]");
      if (Array.isArray(storedFavorites)) {
        setFavorites(storedFavorites);
      }
      if (Array.isArray(storedReferences)) {
        setSavedReferences(storedReferences);
      }
    } catch {
      setFavorites([]);
      setSavedReferences([]);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("pem-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("pem-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem("pem-order-history", JSON.stringify(savedReferences));
  }, [savedReferences]);

  useEffect(() => {
    const savedAdminToken = window.localStorage.getItem("pem-admin-token");
    if (savedAdminToken) {
      setAdminToken(savedAdminToken);
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      window.localStorage.setItem("pem-admin-token", adminToken);
      loadAdminData(adminToken);
      loadDeliveryZones(adminToken);
    } else {
      window.localStorage.removeItem("pem-admin-token");
      setAdminState(initialAdminState);
    }
  }, [adminToken]);

  useEffect(() => {
    loadPublicDeliveryZones();
  }, []);

  const visibleCategories = useMemo(() => {
    const section = menuSections.find((item) => item.id === activeMenuSection);
    return section ? section.categories : categories;
  }, [activeMenuSection]);

  useEffect(() => {
    if (!visibleCategories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, visibleCategories]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const recommendedIdSet = new Set(recommendedItemIds);

    let items = menuItems.filter((item) => {
      const section = menuSections.find((menuSection) => menuSection.id === activeMenuSection);
      const matchesSection = !section || section.id === "all" || section.categories.includes(item.category);
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesRating = item.rating >= minimumRating;
      const matchesFavorites = !showFavoritesOnly || favorites.includes(item.id);
      const matchesDietarySelection =
        !showDietaryMatchesOnly || recommendedIdSet.size === 0 || recommendedIdSet.has(item.id);
      const matchesSearch =
        normalizedSearch === "" ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch) ||
        item.badge.toLowerCase().includes(normalizedSearch) ||
        item.dietaryTags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      return (
        matchesSection &&
        matchesCategory &&
        matchesRating &&
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
  }, [activeCategory, activeMenuSection, favorites, minimumRating, recommendedItemIds, search, showDietaryMatchesOnly, showFavoritesOnly, sortBy]);

  const cartItems = Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const item = menuItems.find((menuItem) => menuItem.id === Number(id));
      return {
        ...item,
        quantity,
        note: notes[id] || "",
      };
    });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedDeliveryZone =
    deliveryZones.find((zone) => zone.id === checkoutForm.deliveryZone) || deliveryZones[0] || getDeliveryZone();
  const delivery = subtotal > 0 ? selectedDeliveryZone.fee : 0;
  const total = subtotal + delivery;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const normalizedAdminQuery = adminQuery.trim().toLowerCase();

  const filteredAdminOrders = adminState.data.orders.filter((order) => {
    const matchesQuery =
      normalizedAdminQuery === "" ||
      order.reference.toLowerCase().includes(normalizedAdminQuery) ||
      order.customer.customerName.toLowerCase().includes(normalizedAdminQuery) ||
      order.customer.phone.toLowerCase().includes(normalizedAdminQuery) ||
      order.customer.address.toLowerCase().includes(normalizedAdminQuery) ||
      order.items.some((item) => item.name.toLowerCase().includes(normalizedAdminQuery));

    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const filteredAdminContacts = adminState.data.contacts.filter((message) => {
    return (
      normalizedAdminQuery === "" ||
      message.reference.toLowerCase().includes(normalizedAdminQuery) ||
      message.name.toLowerCase().includes(normalizedAdminQuery) ||
      message.phone.toLowerCase().includes(normalizedAdminQuery) ||
      message.message.toLowerCase().includes(normalizedAdminQuery)
    );
  });

  const filteredAdminCatering = adminState.data.catering.filter((request) => {
    return (
      normalizedAdminQuery === "" ||
      request.reference.toLowerCase().includes(normalizedAdminQuery) ||
      request.name.toLowerCase().includes(normalizedAdminQuery) ||
      request.phone.toLowerCase().includes(normalizedAdminQuery) ||
      (request.eventType || "").toLowerCase().includes(normalizedAdminQuery) ||
      request.details.toLowerCase().includes(normalizedAdminQuery)
    );
  });

  function updateQuantity(itemId, delta) {
    setCart((previous) => {
      const nextValue = Math.max(0, (previous[itemId] || 0) + delta);
      return {
        ...previous,
        [itemId]: nextValue,
      };
    });
  }

  function setQuantity(itemId, quantity) {
    setCart((previous) => ({
      ...previous,
      [itemId]: Math.max(0, quantity),
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
        nextCart[itemId] = (nextCart[itemId] || 0) + 1;
      });
      return nextCart;
    });
    setShowCart(true);
  }

  function applyOrderToCart(order) {
    const nextCart = {};
    const nextNotes = {};

    order.items.forEach((item) => {
      nextCart[item.id] = (nextCart[item.id] || 0) + item.quantity;
      if (item.note) {
        nextNotes[item.id] = item.note;
      }
    });

    setCart(nextCart);
    setNotes(nextNotes);
    setShowCart(true);
  }

  async function loadPublicDeliveryZones() {
    try {
      const response = await fetch(apiUrl("/api/delivery-zones"));
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to load delivery zones.");
      }
      if (Array.isArray(data.deliveryZones) && data.deliveryZones.length > 0) {
        setDeliveryZones(data.deliveryZones);
        setDeliveryZoneAdminState((previous) => ({
          ...previous,
          zones: data.deliveryZones,
        }));
      }
    } catch {
      setDeliveryZones(defaultDeliveryZones);
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

      setAdminState({
        loading: false,
        error: "",
        data,
      });
    } catch (error) {
      if (error.message === "Admin login required.") {
        setAdminToken("");
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
        password: adminPassword,
      });
      setAdminPassword("");
      setAdminLoginState({ loading: false, error: "" });
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
            <p><strong>Payment:</strong> ${order.customer.paymentMethod}</p>
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
            <p><strong>Grand Total:</strong> ${formatPrice(order.pricing.total)}</p>
          </div>
        </body>
      </html>
    `);
    slipWindow.document.close();
    slipWindow.focus();
    slipWindow.print();
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
        ["Reference", "Customer", "Phone", "Address", "Items", "Status", "Total", "Created At"],
        ...filteredAdminOrders.map((order) => [
          order.reference,
          order.customer.customerName,
          order.customer.phone,
          order.customer.address,
          order.items.map((item) => `${item.name} x${item.quantity}`).join(" | "),
          order.status,
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
        ["Reference", "Name", "Phone", "Message", "Created At"],
        ...filteredAdminContacts.map((message) => [
          message.reference,
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
        ["Reference", "Name", "Phone", "Event Date", "Guest Count", "Event Type", "Details", "Created At"],
        ...filteredAdminCatering.map((request) => [
          request.reference,
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

  async function handlePlaceOrder() {
    if (cartItems.length === 0) {
      setCheckoutState({ loading: false, error: "Add at least one meal before checkout." });
      return;
    }

    if (!checkoutForm.customerName || !checkoutForm.phone || !checkoutForm.address) {
      setCheckoutState({
        loading: false,
        error: "Please enter your name, phone number, and delivery address.",
      });
      return;
    }

    try {
      setCheckoutState({ loading: true, error: "" });

      const result = await postJson("/api/orders", {
        customer: {
          ...checkoutForm,
          deliveryZone: selectedDeliveryZone.label,
          deliveryEta: selectedDeliveryZone.eta,
        },
        items: cartItems,
        pricing: {
          subtotal,
          delivery,
          total,
        },
      });

      setOrderPlaced(`Order ${result.order.reference} submitted successfully.`);
      setTrackingReference(result.order.reference);
      setTrackingState({
        loading: false,
        error: "",
        order: result.order,
      });
      setSavedReferences((previous) => [
        result.order.reference,
        ...previous.filter((reference) => reference !== result.order.reference),
      ].slice(0, 5));
      setShowCart(false);
      setCart({});
      setNotes({});
      setCheckoutForm(initialCheckout);
      setCheckoutState({ loading: false, error: "" });
      loadAdminData();

      window.setTimeout(() => {
        setOrderPlaced("");
      }, 5000);
    } catch (error) {
      setCheckoutState({
        loading: false,
        error: error.message,
      });
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
      "Hello PEM, I want to place an order.",
      "",
      `Name: ${checkoutForm.customerName}`,
      `Phone: ${checkoutForm.phone}`,
      `Address: ${checkoutForm.address || "Will confirm on WhatsApp"}`,
      `Area: ${selectedDeliveryZone.label}`,
      `Estimated delivery time: ${selectedDeliveryZone.eta}`,
      `Payment: ${checkoutForm.paymentMethod}`,
      "",
      "Order items:",
      ...itemLines,
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      `Delivery: ${formatPrice(delivery)}`,
      `Total: ${formatPrice(total)}`,
    ].join("\n");

    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function handleContactSubmit(event) {
    event.preventDefault();

    try {
      setContactState({ loading: true, success: "", error: "" });
      const result = await postJson("/api/contact", contactForm);
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
      const result = await postJson("/api/catering", cateringForm);
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
        menuItems: menuItems.map((item) => ({
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
      setDietaryState({
        ...initialDietaryState,
        error: error.message,
      });
      setShowDietaryMatchesOnly(false);
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

      const response = await fetch(apiUrl(`/api/orders/${encodeURIComponent(normalizedReference)}`));
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to find that order right now.");
      }

      setTrackingState({
        loading: false,
        error: "",
        order: data.order,
      });
      setTrackingReference(normalizedReference);
      setSavedReferences((previous) => [
        normalizedReference,
        ...previous.filter((reference) => reference !== normalizedReference),
      ].slice(0, 5));
    } catch (error) {
      setTrackingState({
        loading: false,
        error: error.message,
        order: null,
      });
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="brand"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="brand__mark">
            <img src={logo} alt="Precious Events Makers logo" />
          </span>
          <span className="brand__text">
            <strong>PEM</strong>
            <small>Precious Events Makers</small>
          </span>
        </button>

        <nav className="topbar__nav">
          <a href="#menu">Menu</a>
          <a href="#track">Track Order</a>
          <a href="#catering">Catering</a>
          <a href="#contact">Contact</a>
          {adminToken ? <a href="#admin">Admin</a> : null}
        </nav>

        <div className="topbar__actions">
          {!adminToken ? (
            <a href="#admin" className="admin-access-link">
              Admin Access
            </a>
          ) : null}

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>

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

      <main>
        <section className="hero">
          <div className="hero__content reveal reveal--up">
            <p className="eyebrow">Local dishes. Premium experience.</p>
            <h1>Restaurant ordering and catering, designed with a calmer PEM feel.</h1>
            <p className="hero__copy">
              Explore local favorites, choose your quantity, add special notes, and place orders
              through a cleaner, more elegant PEM experience.
            </p>
            <p className="hero__status">
              <span className={businessStatus.isOpen ? "status-pill status-pill--delivered" : "status-pill status-pill--new"}>
                {businessStatus.isOpen ? "Open now" : "Closed now"}
              </span>
              <strong>{businessStatus.label}</strong>
            </p>

            <div className="hero__actions">
              <a href="#menu" className="button button--primary">
                Start Ordering
              </a>
              <a href="#track" className="button button--ghost">
                Track Order
              </a>
              <a href="#catering" className="button button--ghost">
                Explore Catering
              </a>
            </div>

            <div className="hero__stats">
              <div>
                <strong>{menuItems.length}</strong>
                <span>Food and drink items</span>
              </div>
              <div>
                <strong>4.8</strong>
                <span>Average customer rating</span>
              </div>
              <div>
                <strong>{drinkCount + localDishCount}</strong>
                <span>Local dishes and drinks</span>
              </div>
            </div>
          </div>

          <div className="hero__panel reveal reveal--float">
            <div className="hero-card">
              <div className="hero-card__image">
                <img src={logo} alt="PEM brand artwork" />
              </div>
              <div className="hero-card__body">
                <div className="hero-card__topline">
                  <span>PEM Signature Experience</span>
                  <span>Trusted local taste</span>
                </div>
                <h2>Classy ordering for daily meals and memorable events.</h2>
                <p>
                  A refined interface built around your brand, with more visual meal browsing and a
                  cleaner overall feel.
                </p>
              </div>
            </div>
          </div>
        </section>

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
                  <div className="tracking-card__meta">
                    <div>
                      <span>Total</span>
                      <strong>{formatPrice(trackingState.order.pricing.total)}</strong>
                    </div>
                    <div>
                      <span>Items</span>
                      <strong>{trackingState.order.items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => applyOrderToCart(trackingState.order)}
                  >
                    Add These Items To Cart
                  </button>
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
                    .map((itemId) => menuItems.find((item) => item.id === itemId)?.name)
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

        <section className="menu-section" id="menu">
          <div className="section-heading section-heading--compact reveal reveal--up">
            <p className="eyebrow">Menu</p>
          </div>

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
                  disabled={dietaryState.loading}
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
                        const item = menuItems.find((menuItem) => menuItem.id === match.itemId);

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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Egusi, jollof, ukwa..."
              />
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

          <div className="menu-grid">
            {filteredItems.map((item) => {
              const quantity = cart[item.id] || 0;

              return (
                <article
                  key={item.id}
                  className={
                    recommendedItemIds.includes(item.id)
                      ? "meal-card meal-card--recommended reveal reveal--up"
                      : "meal-card reveal reveal--up"
                  }
                >
                  <div className="meal-card__media">
                    <img src={item.image} alt={item.name} />
                    <div className="meal-card__gradient" />
                    <div className="meal-card__chips">
                      <small>{item.badge}</small>
                      {item.spicy ? <small>Spicy</small> : null}
                      {recommendedItemIds.includes(item.id) ? <small>Dietary match</small> : null}
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

                    <p className="meal-card__description">{item.description}</p>

                    <div className="meal-card__tags">
                      {item.dietaryTags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <div className="meal-card__meta">
                      <RatingStars rating={item.rating} />
                      <span>{item.reviews} reviews</span>
                    </div>

                    <div className="meal-card__order">
                      <QuantityControl
                        value={quantity}
                        onDecrease={() => updateQuantity(item.id, -1)}
                        onIncrease={() => updateQuantity(item.id, 1)}
                      />

                      <button
                        type="button"
                        className="button button--primary button--small"
                        onClick={() => setQuantity(item.id, quantity === 0 ? 1 : 0)}
                      >
                        {quantity === 0 ? "Add meal" : "Reset"}
                      </button>
                    </div>

                    <label className="note-field">
                      <span>Order note</span>
                      <textarea
                        rows="3"
                        value={notes[item.id] || ""}
                        onChange={(event) => updateNote(item.id, event.target.value)}
                        placeholder="Extra pepper, no onions, soft swallow..."
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

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
              disabled={cateringState.loading}
            >
              {cateringState.loading ? "Sending..." : "Request Catering"}
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
              <p>Precious Events Makers</p>
            </div>
            <div className="contact-card">
              <h3>App Name</h3>
              <p>PEM</p>
            </div>
            <div className="contact-card">
              <h3>Phone / WhatsApp</h3>
              <p>0803 334 5161</p>
            </div>
            <div className="contact-card">
              <h3>Service Promise</h3>
              <p>Professional meals, local flavors, and catering support for all event sizes.</p>
            </div>
            <div className="contact-card">
              <h3>Business Hours</h3>
              <p>{businessStatus.label}</p>
            </div>
          </div>

          <form className="service-form reveal reveal--up reveal--delay-2" onSubmit={handleContactSubmit}>
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
              disabled={contactState.loading}
            >
              {contactState.loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>

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
                    <strong>{adminState.data.contacts.length}</strong>
                    <span>Messages</span>
                  </div>
                  <div>
                    <strong>{adminState.data.catering.length}</strong>
                    <span>Catering requests</span>
                  </div>
                </div>

                <div className="admin-toolbar__actions">
                  <a href="#menu" className="button button--ghost">
                    Back to Menu
                  </a>

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
                    <h3>Delivery Zones</h3>
                    <span>{deliveryZoneAdminState.zones.length}</span>
                  </div>
                  <form className="admin-zone-form" onSubmit={handleDeliveryZonesSave}>
                    <div className="admin-list">
                      {deliveryZoneAdminState.zones.map((zone, index) => (
                        <div key={zone.id} className="admin-item">
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

                <article className="admin-card reveal reveal--up">
                  <div className="admin-card__header">
                    <h3>Recent Orders</h3>
                    <span>{filteredAdminOrders.length}</span>
                  </div>

                  {filteredAdminOrders.length === 0 ? (
                    <p className="admin-empty">No orders yet.</p>
                  ) : (
                    <div className="admin-list">
                      {filteredAdminOrders.map((order) => (
                        <div key={order.reference} className="admin-item">
                          <div className="admin-item__row">
                            <strong>{order.customer.customerName}</strong>
                            <span>{order.reference}</span>
                          </div>
                          <p>
                            {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                          </p>
                          <div className="admin-item__row">
                            <span>{order.customer.phone}</span>
                            <strong>{formatPrice(order.pricing.total)}</strong>
                          </div>
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
                            </div>
                          </div>
                          <p>{formatDateTime(order.updatedAt || order.createdAt)}</p>
                          <p>{order.customer.address}</p>
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
              </div>

              <form className="admin-password-card service-form reveal reveal--up reveal--delay-2" onSubmit={handleAdminPasswordChange}>
                <div className="admin-login__copy">
                  <h3>Change admin password</h3>
                  <p>
                    Update the PEM admin password here. This will rewrite your local `.env` file and sign
                    you out once the change is saved.
                  </p>
                </div>

                <div className="service-form__grid">
                  <label className="field">
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

                  <label className="field">
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
            </>
          )}
        </section>
      </main>

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
                      </div>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>

                    <QuantityControl
                      value={item.quantity}
                      onDecrease={() => updateQuantity(item.id, -1)}
                      onIncrease={() => updateQuantity(item.id, 1)}
                    />

                    {item.note ? <p className="cart-item__note">Note: {item.note}</p> : null}
                  </article>
                ))}

                <div className="checkout-fields">
                  <p className="checkout-fields__title">Delivery details</p>
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
                      placeholder="Your full name"
                    />
                  </label>

                  <label className="field">
                    <span>Phone number</span>
                    <input
                      type="tel"
                      value={checkoutForm.phone}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="0803 334 5161"
                    />
                  </label>

                  <label className="field">
                    <span>Delivery area</span>
                    <select
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
                          {zone.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="delivery-zone-card">
                    <p className="delivery-zone-card__title">Area delivery estimate</p>
                    <strong>{formatPrice(selectedDeliveryZone.fee)}</strong>
                    <span>{selectedDeliveryZone.eta}</span>
                  </div>

                  <label className="field">
                    <span>Delivery address</span>
                    <textarea
                      rows="3"
                      value={checkoutForm.address}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          address: event.target.value,
                        }))
                      }
                      placeholder="Street, area, city"
                    />
                  </label>

                  <label className="field">
                    <span>Payment method</span>
                    <select
                      value={checkoutForm.paymentMethod}
                      onChange={(event) =>
                        setCheckoutForm((previous) => ({
                          ...previous,
                          paymentMethod: event.target.value,
                        }))
                      }
                    >
                      <option>Pay on delivery</option>
                      <option>Bank transfer</option>
                      <option>POS on delivery</option>
                    </select>
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="cart-drawer__footer">
            {checkoutState.error ? (
              <p className="form-message form-message--error">{checkoutState.error}</p>
            ) : null}

            <p className="cart-help">
              Prefer chat? Send this cart to PEM on WhatsApp and continue the order there.
            </p>

            <div className="cart-total">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="cart-total">
              <span>Delivery</span>
              <strong>{formatPrice(delivery)}</strong>
            </div>
            <div className="cart-total">
              <span>Area</span>
              <strong>{selectedDeliveryZone.label}</strong>
            </div>
            <div className="cart-total cart-total--grand">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <button
              type="button"
              className="button button--ghost button--full"
              onClick={handleWhatsAppOrder}
            >
              Send Order To WhatsApp
            </button>
            <button
              type="button"
              className="button button--primary button--full"
              onClick={handlePlaceOrder}
              disabled={checkoutState.loading}
            >
              {checkoutState.loading ? "Submitting order..." : "Place Order"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
