import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function nextNumericId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function reverseCopy(items) {
  return [...items].reverse();
}

function mergeDeliveryZones(defaultZones, storedZones) {
  const storedById = new Map((storedZones || []).map((zone) => [zone.id, zone]));
  const merged = defaultZones.map((zone) => storedById.get(zone.id) || zone);
  const extraZones = (storedZones || []).filter(
    (zone) => !defaultZones.some((defaultZone) => defaultZone.id === zone.id),
  );
  return [...merged, ...extraZones];
}

export function createStorage({
  dataDir,
  dbPath,
  supabaseUrl,
  supabaseServiceRoleKey,
  defaultDeliveryZones,
  defaultMenuItems,
  defaultSettings,
}) {
  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    return {
      mode: "supabase",
      async init() {
        return true;
      },
      async getSummary() {
        const [ordersRes, contactsRes, cateringRes] = await Promise.all([
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("contacts").select("*").order("created_at", { ascending: false }),
          supabase
            .from("catering_requests")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (ordersRes.error) throw ordersRes.error;
        if (contactsRes.error) throw contactsRes.error;
        if (cateringRes.error) throw cateringRes.error;

        return {
          orders: ordersRes.data.map(mapOrderFromDb),
          contacts: contactsRes.data.map(mapContactFromDb),
          catering: cateringRes.data.map(mapCateringFromDb),
        };
      },
      async getUserByEmail(email) {
        const { data, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
        if (error) {
          if (error.code === "42P01") {
            return null;
          }
          throw error;
        }
        return data ? mapUserFromDb(data) : null;
      },
      async createUser(user) {
        const { data, error } = await supabase.from("users").insert(mapUserToDb(user)).select().single();
        if (error) throw error;
        return mapUserFromDb(data);
      },
      async updateUser(email, updates) {
        const payload = mapUserToDb({
          email,
          ...updates,
        });
        delete payload.email;
        const { data, error } = await supabase
          .from("users")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("email", email)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data ? mapUserFromDb(data) : null;
      },
      async getOrdersByReferences(references) {
        if (!Array.isArray(references) || references.length === 0) {
          return [];
        }
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .in("reference", references)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []).map(mapOrderFromDb);
      },
      async getSettings() {
        const { data, error } = await supabase
          .from("business_settings")
          .select("*")
          .eq("singleton", "default")
          .maybeSingle();

        if (error) {
          if (error.code === "42P01") {
            return defaultSettings;
          }
          throw error;
        }

        if (!data) {
          const payload = {
            singleton: "default",
            data: defaultSettings,
            updated_at: new Date().toISOString(),
          };
          const { error: seedError } = await supabase.from("business_settings").upsert(payload, {
            onConflict: "singleton",
          });
          if (seedError) throw seedError;
          return defaultSettings;
        }

        return { ...defaultSettings, ...(data.data || {}) };
      },
      async updateSettings(settings) {
        const payload = {
          singleton: "default",
          data: settings,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from("business_settings").upsert(payload, {
          onConflict: "singleton",
        });
        if (error) throw error;
        return settings;
      },
      async getMenuItems() {
        const { data, error } = await supabase.from("menu_items").select("*").order("item_id", { ascending: true });

        if (error) {
          if (error.code === "42P01") {
            return defaultMenuItems;
          }
          throw error;
        }

        if (!data || data.length === 0) {
          const seeded = defaultMenuItems.map(mapMenuItemToDb);
          const { error: seedError } = await supabase.from("menu_items").upsert(seeded, {
            onConflict: "item_id",
          });
          if (seedError) throw seedError;
          return defaultMenuItems;
        }

        return data.map(mapMenuItemFromDb);
      },
      async updateMenuItems(items) {
        const payload = items.map(mapMenuItemToDb);
        const { error } = await supabase.from("menu_items").upsert(payload, {
          onConflict: "item_id",
        });
        if (error) throw error;
        return items;
      },
      async getDeliveryZones() {
        const { data, error } = await supabase
          .from("delivery_zones")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) {
          if (error.code === "42P01") {
            return defaultDeliveryZones;
          }
          throw error;
        }

        if (!data || data.length === 0) {
          const seeded = defaultDeliveryZones.map((zone, index) => mapDeliveryZoneToDb(zone, index));
          const { error: seedError } = await supabase.from("delivery_zones").upsert(seeded, {
            onConflict: "zone_key",
          });

          if (seedError) throw seedError;
          return defaultDeliveryZones;
        }

        const mergedZones = mergeDeliveryZones(defaultDeliveryZones, data.map(mapDeliveryZoneFromDb));
        const missingZones = mergedZones.filter(
          (zone) => !data.some((row) => (row.zone_key ?? row.id) === zone.id),
        );

        if (missingZones.length > 0) {
          const { error: seedMissingError } = await supabase.from("delivery_zones").upsert(
            mergedZones.map((zone, index) => mapDeliveryZoneToDb(zone, index)),
            {
              onConflict: "zone_key",
            },
          );

          if (seedMissingError) throw seedMissingError;
        }

        return mergedZones;
      },
      async updateDeliveryZones(zones) {
        const payload = zones.map((zone, index) => mapDeliveryZoneToDb(zone, index));
        const { error } = await supabase.from("delivery_zones").upsert(payload, {
          onConflict: "zone_key",
        });

        if (error) throw error;
        return zones;
      },
      async createOrder(order) {
        const payload = mapOrderToDb(order);
        const { data, error } = await supabase
          .from("orders")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return mapOrderFromDb(data);
      },
      async getOrderByReference(reference) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("reference", reference)
          .maybeSingle();

        if (error) throw error;
        return data ? mapOrderFromDb(data) : null;
      },
      async updateOrderStatus(reference, status) {
        const { data, error } = await supabase
          .from("orders")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("reference", reference)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data ? mapOrderFromDb(data) : null;
      },
      async updateOrderPayment(reference, payment, status) {
        const nextUpdate = {
          payment,
          updated_at: new Date().toISOString(),
        };
        if (status) {
          nextUpdate.status = status;
        }
        const { data, error } = await supabase
          .from("orders")
          .update(nextUpdate)
          .eq("reference", reference)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data ? mapOrderFromDb(data) : null;
      },
      async createContact(entry) {
        const payload = mapContactToDb(entry);
        const { data, error } = await supabase
          .from("contacts")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return mapContactFromDb(data);
      },
      async updateContactStatus(reference, status) {
        const { data, error } = await supabase
          .from("contacts")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("reference", reference)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data ? mapContactFromDb(data) : null;
      },
      async createCatering(entry) {
        const payload = mapCateringToDb(entry);
        const { data, error } = await supabase
          .from("catering_requests")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return mapCateringFromDb(data);
      },
      async updateCateringStatus(reference, status) {
        const { data, error } = await supabase
          .from("catering_requests")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("reference", reference)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data ? mapCateringFromDb(data) : null;
      },
    };
  }

  return {
    mode: "local",
    async init() {
      await fs.mkdir(dataDir, { recursive: true });

      try {
        await fs.access(dbPath);
      } catch {
        await fs.writeFile(
          dbPath,
          JSON.stringify(
            {
              orders: [],
              contacts: [],
              catering: [],
              deliveryZones: defaultDeliveryZones,
              menuItems: defaultMenuItems,
              settings: defaultSettings,
              users: [],
            },
            null,
            2,
          ),
          "utf8",
        );
      }
    },
    async getSummary() {
      const db = await readLocalDb(dbPath);
      return {
        orders: reverseCopy(db.orders),
        contacts: reverseCopy(db.contacts),
        catering: reverseCopy(db.catering),
      };
    },
    async getUserByEmail(email) {
      const db = await readLocalDb(dbPath);
      return db.users.find((user) => user.email === email) ?? null;
    },
    async createUser(user) {
      const db = await readLocalDb(dbPath);
      const saved = { ...user, id: nextNumericId(db.users) };
      db.users.push(saved);
      await writeLocalDb(dbPath, db);
      return saved;
    },
    async updateUser(email, updates) {
      const db = await readLocalDb(dbPath);
      const entry = db.users.find((user) => user.email === email);
      if (!entry) return null;
      Object.assign(entry, updates, { updatedAt: new Date().toISOString() });
      await writeLocalDb(dbPath, db);
      return entry;
    },
    async getOrdersByReferences(references) {
      const db = await readLocalDb(dbPath);
      return reverseCopy(db.orders.filter((order) => references.includes(order.reference)));
    },
    async getSettings() {
      const db = await readLocalDb(dbPath);
      return { ...defaultSettings, ...(db.settings || {}) };
    },
    async updateSettings(settings) {
      const db = await readLocalDb(dbPath);
      db.settings = settings;
      await writeLocalDb(dbPath, db);
      return settings;
    },
    async getMenuItems() {
      const db = await readLocalDb(dbPath);
      return Array.isArray(db.menuItems) && db.menuItems.length > 0 ? db.menuItems : defaultMenuItems;
    },
    async updateMenuItems(items) {
      const db = await readLocalDb(dbPath);
      db.menuItems = items;
      await writeLocalDb(dbPath, db);
      return items;
    },
    async getDeliveryZones() {
      const db = await readLocalDb(dbPath);
      return Array.isArray(db.deliveryZones) && db.deliveryZones.length > 0
        ? mergeDeliveryZones(defaultDeliveryZones, db.deliveryZones)
        : defaultDeliveryZones;
    },
    async updateDeliveryZones(zones) {
      const db = await readLocalDb(dbPath);
      db.deliveryZones = zones;
      await writeLocalDb(dbPath, db);
      return zones;
    },
    async createOrder(order) {
      const db = await readLocalDb(dbPath);
      const entry = { ...order, id: nextNumericId(db.orders) };
      db.orders.push(entry);
      await writeLocalDb(dbPath, db);
      return entry;
    },
    async getOrderByReference(reference) {
      const db = await readLocalDb(dbPath);
      return db.orders.find((item) => item.reference === reference) ?? null;
    },
    async updateOrderStatus(reference, status) {
      const db = await readLocalDb(dbPath);
      const entry = db.orders.find((item) => item.reference === reference);
      if (!entry) return null;
      entry.status = status;
      entry.updatedAt = new Date().toISOString();
      await writeLocalDb(dbPath, db);
      return entry;
    },
    async updateOrderPayment(reference, payment, status) {
      const db = await readLocalDb(dbPath);
      const entry = db.orders.find((item) => item.reference === reference);
      if (!entry) return null;
      entry.payment = payment;
      if (status) {
        entry.status = status;
      }
      entry.updatedAt = new Date().toISOString();
      await writeLocalDb(dbPath, db);
      return entry;
    },
    async createContact(entry) {
      const db = await readLocalDb(dbPath);
      const saved = { ...entry, id: nextNumericId(db.contacts) };
      db.contacts.push(saved);
      await writeLocalDb(dbPath, db);
      return saved;
    },
    async updateContactStatus(reference, status) {
      const db = await readLocalDb(dbPath);
      const entry = db.contacts.find((item) => item.reference === reference);
      if (!entry) return null;
      entry.status = status;
      entry.updatedAt = new Date().toISOString();
      await writeLocalDb(dbPath, db);
      return entry;
    },
    async createCatering(entry) {
      const db = await readLocalDb(dbPath);
      const saved = { ...entry, id: nextNumericId(db.catering) };
      db.catering.push(saved);
      await writeLocalDb(dbPath, db);
      return saved;
    },
    async updateCateringStatus(reference, status) {
      const db = await readLocalDb(dbPath);
      const entry = db.catering.find((item) => item.reference === reference);
      if (!entry) return null;
      entry.status = status;
      entry.updatedAt = new Date().toISOString();
      await writeLocalDb(dbPath, db);
      return entry;
    },
  };
}

async function readLocalDb(dbPath) {
  const raw = await fs.readFile(dbPath, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data.deliveryZones)) {
    data.deliveryZones = [];
  }
  if (!Array.isArray(data.menuItems)) {
    data.menuItems = [];
  }
  if (!Array.isArray(data.users)) {
    data.users = [];
  }
  if (!data.settings || typeof data.settings !== "object") {
    data.settings = {};
  }
  return data;
}

async function writeLocalDb(dbPath, data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf8");
}

function mapOrderToDb(order) {
  return {
    reference: order.reference,
    customer_name: order.customer.customerName,
    customer_phone: order.customer.phone,
    customer_address: order.customer.address,
    payment_method: order.customer.paymentMethod,
    customer: order.customer,
    items: order.items,
    pricing: order.pricing,
    payment: order.payment ?? {},
    status: order.status,
    created_at: order.createdAt,
    updated_at: order.updatedAt ?? null,
  };
}

function mapOrderFromDb(row) {
  return {
    id: row.id,
    reference: row.reference,
    customer:
      row.customer ?? {
        customerName: row.customer_name,
        phone: row.customer_phone,
        address: row.customer_address,
        paymentMethod: row.payment_method,
      },
    items: row.items ?? [],
    pricing: row.pricing ?? { subtotal: 0, delivery: 0, total: 0 },
    payment: row.payment ?? {},
    status: row.status,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function mapContactToDb(entry) {
  return {
    reference: entry.reference,
    name: entry.name,
    phone: entry.phone,
    message: entry.message,
    status: entry.status,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt ?? null,
  };
}

function mapContactFromDb(row) {
  return {
    id: row.id,
    reference: row.reference,
    name: row.name,
    phone: row.phone,
    message: row.message,
    status: row.status ?? "new",
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function mapCateringToDb(entry) {
  return {
    reference: entry.reference,
    name: entry.name,
    phone: entry.phone,
    event_date: entry.eventDate,
    guest_count: entry.guestCount,
    event_type: entry.eventType,
    details: entry.details,
    status: entry.status,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt ?? null,
  };
}

function mapCateringFromDb(row) {
  return {
    id: row.id,
    reference: row.reference,
    name: row.name,
    phone: row.phone,
    eventDate: row.event_date ?? row.eventDate,
    guestCount: row.guest_count ?? row.guestCount,
    eventType: row.event_type ?? row.eventType,
    details: row.details,
    status: row.status ?? "new",
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function mapDeliveryZoneToDb(zone, index) {
  return {
    zone_key: zone.id,
    label: zone.label,
    fee: zone.fee,
    eta: zone.eta,
    sort_order: index,
  };
}

function mapDeliveryZoneFromDb(row) {
  return {
    id: row.zone_key ?? row.id,
    label: row.label,
    fee: Number(row.fee) || 0,
    eta: row.eta,
  };
}

function mapMenuItemToDb(item) {
  return {
    item_id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    rating: item.rating,
    reviews: item.reviews,
    spicy: item.spicy,
    badge: item.badge,
    description: item.description,
    image_url: item.imageUrl ?? "",
    dietary_tags: item.dietaryTags ?? [],
    dietary_profile: item.dietaryProfile ?? "",
    sold_out: Boolean(item.soldOut),
    hidden: Boolean(item.hidden),
  };
}

function mapMenuItemFromDb(row) {
  return {
    id: Number(row.item_id ?? row.id),
    name: row.name,
    category: row.category,
    price: Number(row.price) || 0,
    rating: Number(row.rating) || 0,
    reviews: Number(row.reviews) || 0,
    spicy: Boolean(row.spicy),
    badge: row.badge ?? "",
    description: row.description ?? "",
    imageUrl: row.image_url ?? row.imageUrl ?? "",
    dietaryTags: row.dietary_tags ?? row.dietaryTags ?? [],
    dietaryProfile: row.dietary_profile ?? row.dietaryProfile ?? "",
    soldOut: Boolean(row.sold_out ?? row.soldOut),
    hidden: Boolean(row.hidden),
  };
}

function mapUserToDb(user) {
  return {
    email: user.email,
    password_hash: user.passwordHash,
    full_name: user.fullName,
    phone: user.phone ?? "",
    favorite_item_ids: user.favoriteItemIds ?? [],
    saved_addresses: user.savedAddresses ?? [],
    order_references: user.orderReferences ?? [],
    notifications: user.notifications ?? [],
    loyalty_points: Number(user.loyaltyPoints) || 0,
    loyalty_tier: user.loyaltyTier ?? "bronze",
    created_at: user.createdAt,
    updated_at: user.updatedAt ?? null,
  };
}

function mapUserFromDb(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash ?? row.passwordHash,
    fullName: row.full_name ?? row.fullName,
    phone: row.phone ?? "",
    favoriteItemIds: row.favorite_item_ids ?? row.favoriteItemIds ?? [],
    savedAddresses: row.saved_addresses ?? row.savedAddresses ?? [],
    orderReferences: row.order_references ?? row.orderReferences ?? [],
    notifications: row.notifications ?? [],
    loyaltyPoints: Number(row.loyalty_points ?? row.loyaltyPoints) || 0,
    loyaltyTier: row.loyalty_tier ?? row.loyaltyTier ?? "bronze",
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}
