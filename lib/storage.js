import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function nextNumericId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function reverseCopy(items) {
  return [...items].reverse();
}

export function createStorage({
  dataDir,
  dbPath,
  supabaseUrl,
  supabaseServiceRoleKey,
  defaultDeliveryZones,
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

        return data.map(mapDeliveryZoneFromDb);
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
          JSON.stringify({ orders: [], contacts: [], catering: [], deliveryZones: defaultDeliveryZones }, null, 2),
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
    async getDeliveryZones() {
      const db = await readLocalDb(dbPath);
      return Array.isArray(db.deliveryZones) && db.deliveryZones.length > 0
        ? db.deliveryZones
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
