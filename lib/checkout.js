export const MAX_ORDER_ITEM_QUANTITY = 10;
export const PAYSTACK_CURRENCY = "NGN";

const fallbackDeliveryZones = [
  { id: "custom", label: "Delivery area confirmed by PEM", fee: 0, eta: "Confirmed after order" },
];

export function resolveCheckoutDelivery(customer = {}, deliveryZones = fallbackDeliveryZones) {
  const fulfillmentMethod = String(customer?.fulfillmentMethod || "delivery").trim().toLowerCase();
  if (fulfillmentMethod === "pickup") {
    return {
      delivery: 0,
      deliveryEta: "Pickup time confirmed by PEM",
      deliveryZone: "Pickup at PEM",
      deliveryZoneId: "pickup",
    };
  }

  const zones = Array.isArray(deliveryZones) && deliveryZones.length > 0 ? deliveryZones : fallbackDeliveryZones;
  const requestedValues = [
    customer?.deliveryZoneId,
    customer?.deliveryZoneKey,
    customer?.deliveryZone,
    customer?.deliveryZoneLabel,
  ]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
  const selectedZone = zones.find((zone) => {
    const id = String(zone.id || "").trim().toLowerCase();
    const label = String(zone.label || "").trim().toLowerCase();
    return requestedValues.includes(id) || requestedValues.includes(label);
  }) || zones[0];

  return {
    delivery: Math.max(0, Math.round(Number(selectedZone?.fee) || 0)),
    deliveryEta: String(selectedZone?.eta || "Confirmed after order"),
    deliveryZone: String(selectedZone?.label || "Delivery area confirmed by PEM"),
    deliveryZoneId: String(selectedZone?.id || ""),
  };
}

export function normalizeCheckoutItems(rawItems, menuItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { error: "At least one order item is required.", items: [], subtotal: 0 };
  }

  const menuById = new Map((menuItems || []).map((item) => [Number(item.id), item]));
  const quantityById = new Map();

  for (const rawItem of rawItems) {
    const itemId = Number(rawItem?.id);
    const quantity = Number(rawItem?.quantity);
    if (!Number.isInteger(itemId) || !menuById.has(itemId)) {
      return { error: "One of the selected menu items is no longer available.", items: [], subtotal: 0 };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_ITEM_QUANTITY) {
      return {
        error: `Choose a quantity between 1 and ${MAX_ORDER_ITEM_QUANTITY} for each menu item.`,
        items: [],
        subtotal: 0,
      };
    }

    const menuItem = menuById.get(itemId);
    if (menuItem.hidden || menuItem.soldOut) {
      return { error: `${menuItem.name} is currently unavailable. Please remove it and try again.`, items: [], subtotal: 0 };
    }

    const nextQuantity = (quantityById.get(itemId) || 0) + quantity;
    if (nextQuantity > MAX_ORDER_ITEM_QUANTITY) {
      return {
        error: `Choose no more than ${MAX_ORDER_ITEM_QUANTITY} portions of ${menuItem.name}.`,
        items: [],
        subtotal: 0,
      };
    }

    const stockQuantity = Number(menuItem.stockQuantity || 0);
    if (stockQuantity > 0 && nextQuantity > stockQuantity) {
      return { error: `${menuItem.name} only has limited stock left right now.`, items: [], subtotal: 0 };
    }

    quantityById.set(itemId, nextQuantity);
  }

  const items = [...quantityById.entries()].map(([itemId, quantity]) => {
    const menuItem = menuById.get(itemId);
    return {
      id: Number(menuItem.id),
      name: String(menuItem.name || ""),
      category: String(menuItem.category || ""),
      price: Math.max(0, Math.round(Number(menuItem.price) || 0)),
      quantity,
      spicy: Boolean(menuItem.spicy),
      badge: menuItem.badge || "",
      description: menuItem.description || "",
      dietaryTags: Array.isArray(menuItem.dietaryTags) ? menuItem.dietaryTags : [],
      dietaryProfile: menuItem.dietaryProfile || "",
      imageUrl: menuItem.imageUrl || "",
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { error: "", items, subtotal };
}

export function paystackPaymentMatchesOrder(payment, order) {
  const expectedAmount = Math.round((Number(order?.pricing?.total) || 0) * 100);
  const paidAmount = Number(payment?.amount);
  const paidCurrency = String(payment?.currency || PAYSTACK_CURRENCY).trim().toUpperCase();
  return expectedAmount > 0 && paidAmount === expectedAmount && paidCurrency === PAYSTACK_CURRENCY;
}
