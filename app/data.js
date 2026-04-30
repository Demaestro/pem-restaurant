import jollofImage from "../Jollof Rice & Grilled Chicken.jpg";
import friedRiceImage from "../Fried Rice & Beef Stew.jpg";
import egusiImage from "../Egusi Soup & Pounded Yam.jpg";
import pepperSoupImage from "../Pepper Soup (Goat Meat).jpg";
import ogbonoImage from "../Ogbono Soup & Eba.jpg";
import okroImage from "../Delicious Okro soup.jpg";
import ukwaImage from "../Delicious Ukwa.jpg";
import spaghettiImage from "../Spaghetti Bolognese.jpg";
import abachaImage from "../Abacha.jpg";
import afangImage from "../Afang Soup.jpg";
import asunImage from "../Asun.jpeg";
import coleslawImage from "../Coleslaw.jpg";
import cokeImage from "../coke.webp";
import edikaikongImage from "../Edikaikong Soup.webp";
import fantaImage from "../Fanta.jpg";
import hollandiaImage from "../Hollandia.jpg";
import moiMoiImage from "../Moimoi.jpg";
import nkwobiImage from "../Nkwobi.webp";
import ohaImage from "../Oha soup.jpg";
import parfaitImage from "../Parfaits.jpg";
import plantainImage from "../Plantain.jpg";
import beansPlantainImage from "../Porridge beans and plantain.jpg";
import smallChopsImage from "../Small chops.webp";
import smoothieImage from "../Smoothie.jpg";
import spriteImage from "../Spirite.webp";
import waterImage from "../Water.jpg";
import whiteRiceSauceImage from "../White rice and Sauce.jpeg";
import whiteSoupImage from "../White Soup (Ofe Nsala).jpg";

export const menuItems = [
  { id: 1, name: "Jollof Rice & Grilled Chicken", category: "Rice", price: 3800, rating: 4.9, reviews: 241, image: jollofImage, spicy: false, badge: "Popular", description: "Classic Nigerian party jollof with grilled chicken and sweet plantain.", dietaryTags: ["Chicken", "Rice-based", "Mild"], dietaryProfile: "Contains grilled chicken and rice. Mild heat and a balanced, filling profile." },
  { id: 2, name: "Fried Rice & Beef Stew", category: "Rice", price: 4000, rating: 4.8, reviews: 188, image: friedRiceImage, spicy: false, badge: "Signature", description: "Colorful fried rice served with rich beef stew for a hearty PEM favorite.", dietaryTags: ["Beef", "Rice-based", "Mild"], dietaryProfile: "Contains beef stew and fried rice. Hearty and filling, but not suitable for beef-free diets." },
  { id: 3, name: "Egusi Soup & Pounded Yam", category: "Soup", price: 4500, rating: 4.9, reviews: 214, image: egusiImage, spicy: false, badge: "Best Seller", description: "Rich egusi soup with assorted protein and soft pounded yam.", dietaryTags: ["Soup", "Swallow", "Rich"], dietaryProfile: "Traditional soup meal with assorted protein and pounded yam. Rich and satisfying." },
  { id: 4, name: "Pepper Soup (Goat Meat)", category: "Soup", price: 4300, rating: 4.8, reviews: 167, image: pepperSoupImage, spicy: true, badge: "Hot", description: "Aromatic pepper soup with goat meat, local spices, and deep warming flavor.", dietaryTags: ["Goat meat", "Spicy", "Soup"], dietaryProfile: "Spicy goat meat pepper soup. The closest fit on this menu for guests asking for lower-carb soup options." },
  { id: 5, name: "Ogbono Soup & Eba", category: "Soup", price: 3900, rating: 4.7, reviews: 151, image: ogbonoImage, spicy: false, badge: "Classic", description: "Smooth ogbono soup paired with fresh eba and a balanced local taste.", dietaryTags: ["Soup", "Swallow", "Local"], dietaryProfile: "Traditional ogbono soup served with eba. Mild compared with the hotter soups on the menu." },
  { id: 6, name: "Delicious Okro Soup", category: "Soup", price: 4100, rating: 4.8, reviews: 132, image: okroImage, spicy: true, badge: "Local", description: "Fresh okro soup with a rich blend of stock, spice, and satisfying texture.", dietaryTags: ["Soup", "Spicy", "Local"], dietaryProfile: "Spicier local soup option with rich texture and a more traditional feel." },
  { id: 7, name: "Delicious Ukwa", category: "Local Special", price: 3600, rating: 4.6, reviews: 98, image: ukwaImage, spicy: false, badge: "Traditional", description: "African breadfruit prepared in a comforting local style for a distinct PEM meal.", dietaryTags: ["Traditional", "Local special", "Mild"], dietaryProfile: "Traditional African breadfruit dish with a comforting local style and mild flavor profile." },
  { id: 8, name: "Spaghetti Bolognese", category: "Pasta", price: 3500, rating: 4.5, reviews: 89, image: spaghettiImage, spicy: false, badge: "Continental", description: "Savory spaghetti in a rich tomato and meat sauce for guests who want variety.", dietaryTags: ["Pasta", "Meat sauce", "Mild"], dietaryProfile: "Pasta dish with meat sauce. Better for guests who want a softer, non-spicy continental option." },
  { id: 9, name: "Abacha", category: "Local Special", price: 3200, rating: 4.7, reviews: 84, image: abachaImage, spicy: true, badge: "Eastern Favorite", description: "Traditional African salad with a lively local taste and classic market-style flavor.", dietaryTags: ["Traditional", "Local", "Spicy"], dietaryProfile: "A local specialty with a stronger traditional profile. Good for guests asking for native dishes." },
  { id: 10, name: "Afang Soup", category: "Soup", price: 4600, rating: 4.9, reviews: 176, image: afangImage, spicy: false, badge: "Premium Local", description: "Rich afang soup with deep flavor, hearty texture, and a polished event-ready finish.", dietaryTags: ["Soup", "Local", "Rich"], dietaryProfile: "Rich local soup option with a traditional, filling profile for guests who want premium native dishes." },
  { id: 11, name: "Asun", category: "Grills", price: 4200, rating: 4.7, reviews: 92, image: asunImage, spicy: true, badge: "Smoky", description: "Spicy grilled asun with a bold smoky finish for guests who want something lively.", dietaryTags: ["Grill", "Spicy", "Protein"], dietaryProfile: "A spicy grilled protein option suited to guests who want bold flavor and a meat-focused choice." },
  { id: 12, name: "Coleslaw", category: "Sides", price: 1500, rating: 4.4, reviews: 41, image: coleslawImage, spicy: false, badge: "Fresh Side", description: "Creamy fresh coleslaw that pairs well with rice dishes, grills, and party packs.", dietaryTags: ["Side", "Fresh", "Mild"], dietaryProfile: "A mild side dish that helps balance heavier or spicier meals." },
  { id: 13, name: "Moi Moi", category: "Sides", price: 1800, rating: 4.6, reviews: 67, image: moiMoiImage, spicy: false, badge: "Protein Side", description: "Soft steamed bean pudding that works well as a side or light meal addition.", dietaryTags: ["Beans", "Side", "Mild"], dietaryProfile: "A lighter bean-based side that can support guests asking for something softer and less spicy." },
  { id: 14, name: "Oha Soup", category: "Soup", price: 4400, rating: 4.8, reviews: 103, image: ohaImage, spicy: false, badge: "Native Choice", description: "A warm, comforting oha soup with a beautiful home-style local finish.", dietaryTags: ["Soup", "Traditional", "Local"], dietaryProfile: "Milder native soup option with a home-style feel and strong local appeal." },
  { id: 15, name: "Parfait", category: "Drinks & Desserts", price: 2500, rating: 4.5, reviews: 38, image: parfaitImage, spicy: false, badge: "Cool Treat", description: "Layered parfait for guests who want a chilled, sweet add-on to their order.", dietaryTags: ["Dessert", "Cool", "Sweet"], dietaryProfile: "A dessert-style add-on rather than a main meal. Good for lighter, chilled indulgence." },
  { id: 16, name: "Plantain", category: "Sides", price: 1400, rating: 4.7, reviews: 59, image: plantainImage, spicy: false, badge: "Side Favorite", description: "Golden fried plantain that pairs easily with rice, soup, and grilled meals.", dietaryTags: ["Side", "Sweet", "Mild"], dietaryProfile: "A mild popular side that complements many PEM dishes." },
  { id: 17, name: "Porridge Beans and Plantain", category: "Local Special", price: 3300, rating: 4.6, reviews: 73, image: beansPlantainImage, spicy: false, badge: "Comfort Meal", description: "Comforting beans porridge served with sweet plantain for a filling local option.", dietaryTags: ["Beans", "Local", "Mild"], dietaryProfile: "A gentler local comfort meal and one of the softer non-spicy options on the menu." },
  { id: 18, name: "White Rice and Sauce", category: "Rice", price: 3400, rating: 4.5, reviews: 64, image: whiteRiceSauceImage, spicy: false, badge: "Simple Choice", description: "Plain white rice served with rich sauce for guests who want a simpler plate.", dietaryTags: ["Rice-based", "Mild", "Simple"], dietaryProfile: "A simpler rice dish for guests who want a less intense flavor profile." },
  { id: 19, name: "White Soup (Ofe Nsala)", category: "Soup", price: 4700, rating: 4.8, reviews: 88, image: whiteSoupImage, spicy: false, badge: "Chef's Pick", description: "Delicate white soup with a refined native flavor and rich event-style presentation.", dietaryTags: ["Soup", "Native", "Mild"], dietaryProfile: "A polished native soup option with milder flavor than the hotter soup choices." },
  { id: 20, name: "Hollandia", category: "Drinks", price: 1200, rating: 4.4, reviews: 22, image: hollandiaImage, spicy: false, badge: "Chilled Drink", description: "Cold dairy drink for guests who want something smooth and refreshing with their meal.", dietaryTags: ["Drink", "Cold", "Mild"], dietaryProfile: "A chilled drink option that pairs well with spicy or heavy meals." },
  { id: 21, name: "Smoothie", category: "Drinks", price: 2200, rating: 4.6, reviews: 31, image: smoothieImage, spicy: false, badge: "Fresh Blend", description: "Fresh smoothie with a cooler, lighter feel for customers who want a premium drink.", dietaryTags: ["Drink", "Cold", "Fresh"], dietaryProfile: "A lighter premium drink option for customers who want something refreshing." },
  { id: 22, name: "Water", category: "Drinks", price: 500, rating: 4.8, reviews: 18, image: waterImage, spicy: false, badge: "Essential", description: "Simple bottled water to complete any PEM order.", dietaryTags: ["Drink", "Hydration", "Zero spice"], dietaryProfile: "The simplest drink choice for every customer." },
  { id: 23, name: "Edikaikong Soup", category: "Soup", price: 4800, rating: 4.8, reviews: 54, image: edikaikongImage, spicy: false, badge: "Deep Local", description: "Rich edikaikong soup prepared with leafy depth, local flavour, and a fuller native finish.", dietaryTags: ["Soup", "Local", "Rich"], dietaryProfile: "A rich native soup with a deep local profile for customers who want another premium traditional option." },
  { id: 24, name: "Nkwobi", category: "Local Special", price: 4500, rating: 4.7, reviews: 39, image: nkwobiImage, spicy: true, badge: "Spicy Local", description: "Bold nkwobi with a spicy palm-oil finish for customers who want a strong traditional bite.", dietaryTags: ["Local", "Spicy", "Protein"], dietaryProfile: "A bold native delicacy with a spicy profile, better suited to customers who enjoy stronger traditional flavours." },
  { id: 25, name: "Small Chops", category: "Starters", price: 3000, rating: 4.6, reviews: 47, image: smallChopsImage, spicy: false, badge: "Party Tray", description: "Assorted small chops for quick snacking, events, and add-on party orders.", dietaryTags: ["Starter", "Party", "Shareable"], dietaryProfile: "A shareable starter pack that works well for events, office orders, and quick add-ons." },
  { id: 26, name: "Fanta", category: "Drinks", price: 700, rating: 4.5, reviews: 21, image: fantaImage, spicy: false, badge: "Cold Drink", description: "Chilled orange soda for customers who want a familiar sweet drink with their meal.", dietaryTags: ["Drink", "Cold", "Sweet"], dietaryProfile: "A classic soft drink choice that pairs well with rice meals, grills, and party trays." },
  { id: 27, name: "Coke", category: "Drinks", price: 700, rating: 4.6, reviews: 28, image: cokeImage, spicy: false, badge: "Classic Soda", description: "Cold Coke served as an easy everyday drink option for lunch, dinner, or event orders.", dietaryTags: ["Drink", "Cold", "Classic"], dietaryProfile: "A dependable soft drink option for customers who want something simple and familiar." },
  { id: 28, name: "Sprite", category: "Drinks", price: 700, rating: 4.4, reviews: 17, image: spriteImage, spicy: false, badge: "Lemon-Lime", description: "Refreshing lemon-lime soda that works nicely with soups, local dishes, and spicy meals.", dietaryTags: ["Drink", "Cold", "Refreshing"], dietaryProfile: "A crisp soft drink option with a lighter feel for spicy meals and native dishes." },
];

export const cateringPackages = [
  { title: "Office Catering", subtitle: "Reliable food service for meetings and staff events", details: "Custom trays, buffet setup, and timed delivery for teams of 20 to 300 guests." },
  { title: "Weddings & Celebrations", subtitle: "Elegant local menus for your big day", details: "Soup stations, rice combinations, small chops, desserts, and serving staff support." },
  { title: "Bulk Party Packs", subtitle: "Fast order fulfillment for birthdays and naming ceremonies", details: "Packaged meal boxes with clear portions, labels, and add-on drinks for guests." },
];

export const categories = ["All", ...new Set(menuItems.map((item) => item.category))];

export const defaultMenuSchedule = {
  availableFrom: "",
  availableUntil: "",
  availableDays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
};

export const menuSections = [
  { id: "all", label: "Everything", categories },
  { id: "mains", label: "Main Meals", categories: ["All", "Rice", "Pasta", "Grills", "Local Special"] },
  { id: "soups", label: "Soups", categories: ["All", "Soup"] },
  { id: "sides", label: "Sides", categories: ["All", "Sides", "Starters"] },
  { id: "drinks", label: "Drinks & Desserts", categories: ["All", "Drinks", "Drinks & Desserts"] },
];

export const drinkCount = menuItems.filter((item) => item.category.includes("Drink")).length;

export const localDishCount = menuItems.filter(
  (item) => item.category === "Soup" || item.category === "Local Special",
).length;

export const dietaryPrompts = [
  "I want something less spicy.",
  "Show me high-protein meals.",
  "I do not want beef.",
  "Recommend more traditional local dishes.",
];

export const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const defaultDeliveryZones = [
  { id: "gwarinpa", label: "Gwarinpa / Life Camp", fee: 1200, eta: "35 to 50 mins" },
  { id: "wuse", label: "Wuse / Utako / Jabi", fee: 1800, eta: "45 to 60 mins" },
  { id: "maitama", label: "Maitama / Asokoro / Guzape", fee: 2200, eta: "50 to 70 mins" },
  { id: "lugbe", label: "Lugbe / Airport Road", fee: 2500, eta: "60 to 85 mins" },
  { id: "owerri", label: "Owerri, Imo State", fee: 4500, eta: "Next-day confirmation with PEM" },
  { id: "custom", label: "Other area", fee: 3000, eta: "Confirmed after order" },
];

export const comboBundles = [
  { id: "party-rice", title: "Party Rice Combo", itemIds: [1, 13, 22], description: "Jollof rice, moi moi, and water for a quick balanced order." },
  { id: "native-soup", title: "Native Soup Combo", itemIds: [14, 16, 20], description: "Oha soup with plantain and a chilled drink for a fuller local plate." },
  { id: "office-lunch", title: "Office Lunch Combo", itemIds: [18, 12, 21], description: "White rice and sauce with coleslaw and smoothie for a lighter lunch set." },
];

export const businessHours = [
  { day: "Sunday", open: 10, close: 20 },
  { day: "Monday", open: 8, close: 21 },
  { day: "Tuesday", open: 8, close: 21 },
  { day: "Wednesday", open: 8, close: 21 },
  { day: "Thursday", open: 8, close: 21 },
  { day: "Friday", open: 8, close: 22 },
  { day: "Saturday", open: 9, close: 22 },
];

export const cardPaymentMethodLabel = "Pay with card";

export const checkoutPaymentOptions = [
  { label: "Pay on arrival", icon: "ARR" },
  { label: cardPaymentMethodLabel, icon: "CARD" },
  { label: "Bank transfer", icon: "TRF" },
];

export const menuVisibilityOptions = [
  { value: "available", label: "Available" },
  { value: "sold-out", label: "Sold out" },
  { value: "hidden", label: "Hidden" },
];
