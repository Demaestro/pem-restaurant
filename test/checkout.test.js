import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCheckoutItems,
  paystackPaymentMatchesOrder,
  resolveCheckoutDelivery,
} from "../lib/checkout.js";

const menuItems = [
  {
    id: 1,
    name: "Jollof Rice",
    category: "Rice",
    price: 3800,
    stockQuantity: 3,
    soldOut: false,
    hidden: false,
  },
  {
    id: 2,
    name: "Water",
    category: "Drinks",
    price: 500,
    stockQuantity: 0,
    soldOut: false,
    hidden: false,
  },
  {
    id: 3,
    name: "Hidden Soup",
    category: "Soup",
    price: 4000,
    stockQuantity: 8,
    soldOut: false,
    hidden: true,
  },
];

test("normalizes checkout items from server menu data", () => {
  const result = normalizeCheckoutItems(
    [
      { id: 1, name: "Fake", price: 1, quantity: 1 },
      { id: 1, name: "Fake duplicate", price: 1, quantity: 2 },
      { id: 2, quantity: 4 },
    ],
    menuItems,
  );

  assert.equal(result.error, "");
  assert.equal(result.subtotal, 13400);
  assert.deepEqual(
    result.items.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
    [
      { id: 1, name: "Jollof Rice", price: 3800, quantity: 3 },
      { id: 2, name: "Water", price: 500, quantity: 4 },
    ],
  );
});

test("rejects invalid, unavailable, and over-stock checkout items", () => {
  assert.match(
    normalizeCheckoutItems([{ id: 1, quantity: 11 }], menuItems).error,
    /quantity between 1 and 10/i,
  );
  assert.match(
    normalizeCheckoutItems([{ id: 3, quantity: 1 }], menuItems).error,
    /currently unavailable/i,
  );
  assert.match(
    normalizeCheckoutItems([{ id: 1, quantity: 4 }], menuItems).error,
    /limited stock/i,
  );
});

test("resolves delivery server-side and treats pickup as zero delivery", () => {
  const zones = [
    { id: "gwarinpa", label: "Gwarinpa", fee: 1200, eta: "35 mins" },
    { id: "wuse", label: "Wuse", fee: 1800, eta: "45 mins" },
  ];

  assert.deepEqual(resolveCheckoutDelivery({ deliveryZoneId: "wuse" }, zones), {
    delivery: 1800,
    deliveryEta: "45 mins",
    deliveryZone: "Wuse",
    deliveryZoneId: "wuse",
  });
  assert.deepEqual(resolveCheckoutDelivery({ fulfillmentMethod: "pickup" }, zones), {
    delivery: 0,
    deliveryEta: "Pickup time confirmed by PEM",
    deliveryZone: "Pickup at PEM",
    deliveryZoneId: "pickup",
  });
});

test("requires Paystack amount and currency to match the order total", () => {
  const order = { pricing: { total: 5000 } };
  assert.equal(paystackPaymentMatchesOrder({ amount: 500000, currency: "NGN" }, order), true);
  assert.equal(paystackPaymentMatchesOrder({ amount: 499999, currency: "NGN" }, order), false);
  assert.equal(paystackPaymentMatchesOrder({ amount: 500000, currency: "USD" }, order), false);
});
