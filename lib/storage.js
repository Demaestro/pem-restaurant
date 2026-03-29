import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function nextNumericId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function reverseCopy(items) {
  return [...items].reverse();
}

function normalizeEmailValue(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhoneDigitsValue(value) {
  return String(value || "").replace(/\D/g, "");
}

function orderMatchesGuestIdentity(order, { email = "", phone = "" } = {}) {
  const normalizedEmail = normalizeEmailValue(email);
  const normalizedPhone = normalizePhoneDigitsValue(phone);
  const orderEmail = normalizeEmailValue(order?.customer?.email);
  const orderPhone = normalizePhoneDigitsValue(order?.customer?.phone);

  if (normalizedEmail && orderEmail && normalizedEmail === orderEmail) {
    return true;
  }

  if (normalizedPhone && orderPhone && normalizedPhone === orderPhone) {
    return true;
  }

  return false;
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
        const [ordersRes, contactsRes, cateringRes, reservationsRes, reviewsRes, recoveryRes] = await Promise.all([
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("contacts").select("*").order("created_at", { ascending: false }),
          supabase
            .from("catering_requests")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase.from("reservations").select("*").order("created_at", { ascending: false }),
          supabase.from("reviews").select("*").order("created_at", { ascending: false }),
          supabase.from("password_recovery_requests").select("*").order("created_at", { ascending: false }),
        ]);

        if (ordersRes.error) throw ordersRes.error;
        if (contactsRes.error) throw contactsRes.error;
        if (cateringRes.error) throw cateringRes.error;
        if (reservationsRes.error && reservationsRes.error.code !== "42P01") throw reservationsRes.error;
        if (reviewsRes.error && reviewsRes.error.code !== "42P01") throw reviewsRes.error;
        if (recoveryRes.error && recoveryRes.error.code !== "42P01") throw recoveryRes.error;

        return {
          orders: ordersRes.data.map(mapOrderFromDb),
          contacts: contactsRes.data.map(mapContactFromDb),
          catering: cateringRes.data.map(mapCateringFromDb),
          reservations: (reservationsRes.data || []).map(mapReservationFromDb),
          reviews: (reviewsRes.data || []).map(mapReviewFromDb),
          passwordRecoveryRequests: (recoveryRes.data || []).map(mapPasswordRecoveryRequestFromDb),
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
      async getUserByReferralCode(referralCode) {
        const { data, error } = await supabase.from("users").select("*").eq("referral_code", referralCode).maybeSingle();
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
      async getOrdersByGuestIdentity({ email = "", phone = "" } = {}) {
        const normalizedEmail = normalizeEmailValue(email);
        const normalizedPhone = normalizePhoneDigitsValue(phone);
        if (!normalizedEmail && !normalizedPhone) {
          return [];
        }
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data || [])
          .map(mapOrderFromDb)
          .filter((order) => orderMatchesGuestIdentity(order, { email: normalizedEmail, phone: normalizedPhone }));
      },
      async getSentGiftsByEmail(email) {
        const { data, error } = await supabase
          .from("gifts")
          .select("*")
          .eq("sender_email", email)
          .order("created_at", { ascending: false });
        if (error) {
          if (error.code === "42P01") {
            return [];
          }
          throw error;
        }
        return (data || []).map(mapGiftFromDb);
      },
      async getReceivedGiftsByEmail(email) {
        const { data, error } = await supabase
          .from("gifts")
          .select("*")
          .eq("recipient_email", email)
          .order("created_at", { ascending: false });
        if (error) {
          if (error.code === "42P01") {
            return [];
          }
          throw error;
        }
        return (data || []).map(mapGiftFromDb);
      },
      async createGift(gift) {
        const { data, error } = await supabase.from("gifts").insert(mapGiftToDb(gift)).select().single();
        if (error) throw error;
        return mapGiftFromDb(data);
      },
      async getPasswordRecoveryRequests() {
        const { data, error } = await supabase
          .from("password_recovery_requests")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) {
          if (error.code === "42P01") {
            return [];
          }
          throw error;
        }
        return (data || []).map(mapPasswordRecoveryRequestFromDb);
      },
      async createPasswordRecoveryRequest(entry) {
        const { data, error } = await supabase
          .from("password_recovery_requests")
          .insert(mapPasswordRecoveryRequestToDb(entry))
          .select()
          .single();
        if (error) throw error;
        return mapPasswordRecoveryRequestFromDb(data);
      },
      async getPasswordRecoveryRequestByReference(reference) {
        const { data, error } = await supabase
          .from("password_recovery_requests")
          .select("*")
          .eq("reference", reference)
          .maybeSingle();
        if (error) {
          if (error.code === "42P01") {
            return null;
          }
          throw error;
        }
        return data ? mapPasswordRecoveryRequestFromDb(data) : null;
      },
      async updatePasswordRecoveryRequest(reference, updates) {
        const payload = mapPasswordRecoveryRequestToDb({
          reference,
          ...updates,
        });
        delete payload.reference;
        const { data, error } = await supabase
          .from("password_recovery_requests")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("reference", reference)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data ? mapPasswordRecoveryRequestFromDb(data) : null;
      },
      async getGiftByReference(reference) {
        const { data, error } = await supabase
          .from("gifts")
          .select("*")
          .eq("reference", reference)
          .maybeSingle();
        if (error) {
          if (error.code === "42P01") {
            return null;
          }
          throw error;
        }
        return data ? mapGiftFromDb(data) : null;
      },
      async updateGift(reference, updates) {
        const payload = mapGiftToDb({
          reference,
          ...updates,
        });
        delete payload.reference;
        const { data, error } = await supabase
          .from("gifts")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("reference", reference)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data ? mapGiftFromDb(data) : null;
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
      async updateOrder(reference, updates) {
        const payload = mapOrderToDb({
          reference,
          ...updates,
        });
        delete payload.reference;
        const { data, error } = await supabase
          .from("orders")
          .update({
            ...payload,
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
      async createReservation(entry) {
        const { data, error } = await supabase.from("reservations").insert(mapReservationToDb(entry)).select().single();
        if (error) throw error;
        return mapReservationFromDb(data);
      },
      async updateReservationStatus(reference, status) {
        const { data, error } = await supabase
          .from("reservations")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("reference", reference)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data ? mapReservationFromDb(data) : null;
      },
      async createReview(entry) {
        const { data, error } = await supabase.from("reviews").insert(mapReviewToDb(entry)).select().single();
        if (error) throw error;
        return mapReviewFromDb(data);
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
              reservations: [],
              reviews: [],
              gifts: [],
              passwordRecoveryRequests: [],
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
        reservations: reverseCopy(db.reservations),
        reviews: reverseCopy(db.reviews),
        passwordRecoveryRequests: reverseCopy(db.passwordRecoveryRequests),
      };
    },
    async getUserByEmail(email) {
      const db = await readLocalDb(dbPath);
      return db.users.find((user) => user.email === email) ?? null;
    },
    async getUserByReferralCode(referralCode) {
      const db = await readLocalDb(dbPath);
      return db.users.find((user) => user.referralCode === referralCode) ?? null;
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
    async getOrdersByGuestIdentity({ email = "", phone = "" } = {}) {
      const normalizedEmail = normalizeEmailValue(email);
      const normalizedPhone = normalizePhoneDigitsValue(phone);
      if (!normalizedEmail && !normalizedPhone) {
        return [];
      }
      const db = await readLocalDb(dbPath);
      return reverseCopy(
        db.orders.filter((order) =>
          orderMatchesGuestIdentity(order, { email: normalizedEmail, phone: normalizedPhone })),
      );
    },
    async getSentGiftsByEmail(email) {
      const db = await readLocalDb(dbPath);
      return reverseCopy(db.gifts.filter((gift) => gift.senderEmail === email));
    },
    async getReceivedGiftsByEmail(email) {
      const db = await readLocalDb(dbPath);
      return reverseCopy(db.gifts.filter((gift) => gift.recipientEmail === email));
    },
    async createGift(gift) {
      const db = await readLocalDb(dbPath);
      const saved = { ...gift, id: nextNumericId(db.gifts) };
      db.gifts.push(saved);
      await writeLocalDb(dbPath, db);
      return saved;
    },
    async getPasswordRecoveryRequests() {
      const db = await readLocalDb(dbPath);
      return reverseCopy(db.passwordRecoveryRequests);
    },
    async createPasswordRecoveryRequest(entry) {
      const db = await readLocalDb(dbPath);
      const saved = { ...entry, id: nextNumericId(db.passwordRecoveryRequests) };
      db.passwordRecoveryRequests.push(saved);
      await writeLocalDb(dbPath, db);
      return saved;
    },
    async getPasswordRecoveryRequestByReference(reference) {
      const db = await readLocalDb(dbPath);
      return db.passwordRecoveryRequests.find((item) => item.reference === reference) ?? null;
    },
    async updatePasswordRecoveryRequest(reference, updates) {
      const db = await readLocalDb(dbPath);
      const entry = db.passwordRecoveryRequests.find((item) => item.reference === reference);
      if (!entry) return null;
      Object.assign(entry, updates, { updatedAt: new Date().toISOString() });
      await writeLocalDb(dbPath, db);
      return entry;
    },
    async getGiftByReference(reference) {
      const db = await readLocalDb(dbPath);
      return db.gifts.find((gift) => gift.reference === reference) ?? null;
    },
    async updateGift(reference, updates) {
      const db = await readLocalDb(dbPath);
      const entry = db.gifts.find((gift) => gift.reference === reference);
      if (!entry) return null;
      Object.assign(entry, updates, { updatedAt: new Date().toISOString() });
      await writeLocalDb(dbPath, db);
      return entry;
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
    async updateOrder(reference, updates) {
      const db = await readLocalDb(dbPath);
      const entry = db.orders.find((item) => item.reference === reference);
      if (!entry) return null;
      Object.assign(entry, updates, { updatedAt: new Date().toISOString() });
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
    async createReservation(entry) {
      const db = await readLocalDb(dbPath);
      const saved = { ...entry, id: nextNumericId(db.reservations) };
      db.reservations.push(saved);
      await writeLocalDb(dbPath, db);
      return saved;
    },
    async updateReservationStatus(reference, status) {
      const db = await readLocalDb(dbPath);
      const entry = db.reservations.find((item) => item.reference === reference);
      if (!entry) return null;
      entry.status = status;
      entry.updatedAt = new Date().toISOString();
      await writeLocalDb(dbPath, db);
      return entry;
    },
    async createReview(entry) {
      const db = await readLocalDb(dbPath);
      const saved = { ...entry, id: nextNumericId(db.reviews) };
      db.reviews.push(saved);
      await writeLocalDb(dbPath, db);
      return saved;
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
  if (!Array.isArray(data.reservations)) {
    data.reservations = [];
  }
  if (!Array.isArray(data.reviews)) {
    data.reviews = [];
  }
  if (!Array.isArray(data.gifts)) {
    data.gifts = [];
  }
  if (!Array.isArray(data.passwordRecoveryRequests)) {
    data.passwordRecoveryRequests = [];
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
    branch_id: order.customer.branchId ?? "",
    branch_name: order.customer.branchName ?? "",
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
        branchId: row.branch_id ?? "",
        branchName: row.branch_name ?? "",
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
    branch_id: entry.branchId ?? "",
    branch_name: entry.branchName ?? "",
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
    branchId: row.branch_id ?? row.branchId ?? "",
    branchName: row.branch_name ?? row.branchName ?? "",
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
    branch_id: entry.branchId ?? "",
    branch_name: entry.branchName ?? "",
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
    branchId: row.branch_id ?? row.branchId ?? "",
    branchName: row.branch_name ?? row.branchName ?? "",
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
    stock_quantity: Number(item.stockQuantity) || 0,
    available_from: item.availableFrom ?? "",
    available_until: item.availableUntil ?? "",
    available_days: item.availableDays ?? [],
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
    stockQuantity: Number(row.stock_quantity ?? row.stockQuantity) || 0,
    availableFrom: row.available_from ?? row.availableFrom ?? "",
    availableUntil: row.available_until ?? row.availableUntil ?? "",
    availableDays: row.available_days ?? row.availableDays ?? [],
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
    birthday: user.birthday ? String(user.birthday).trim() : null,
    favorite_item_ids: user.favoriteItemIds ?? [],
    saved_addresses: user.savedAddresses ?? [],
    order_references: user.orderReferences ?? [],
    notifications: user.notifications ?? [],
    loyalty_points: Number(user.loyaltyPoints) || 0,
    loyalty_tier: user.loyaltyTier ?? "bronze",
    referral_code: user.referralCode ?? "",
    referred_by: user.referredBy ?? "",
    referral_credits: Number(user.referralCredits) || 0,
    birthday_greeting_year: user.birthdayGreetingYear ?? "",
    birthday_discount_last_used_year: user.birthdayDiscountLastUsedYear ?? "",
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
    birthday: row.birthday ?? "",
    favoriteItemIds: row.favorite_item_ids ?? row.favoriteItemIds ?? [],
    savedAddresses: row.saved_addresses ?? row.savedAddresses ?? [],
    orderReferences: row.order_references ?? row.orderReferences ?? [],
    notifications: row.notifications ?? [],
    loyaltyPoints: Number(row.loyalty_points ?? row.loyaltyPoints) || 0,
    loyaltyTier: row.loyalty_tier ?? row.loyaltyTier ?? "bronze",
    referralCode: row.referral_code ?? row.referralCode ?? "",
    referredBy: row.referred_by ?? row.referredBy ?? "",
    referralCredits: Number(row.referral_credits ?? row.referralCredits) || 0,
    birthdayGreetingYear: row.birthday_greeting_year ?? row.birthdayGreetingYear ?? "",
    birthdayDiscountLastUsedYear: row.birthday_discount_last_used_year ?? row.birthdayDiscountLastUsedYear ?? "",
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function mapGiftToDb(gift) {
  return {
    reference: gift.reference,
    sender_email: gift.senderEmail,
    sender_name: gift.senderName ?? "",
    sender_phone: gift.senderPhone ?? "",
    recipient_email: gift.recipientEmail,
    recipient_name: gift.recipientName ?? "",
    branch_id: gift.branchId ?? "",
    branch_name: gift.branchName ?? "",
    branch_address: gift.branchAddress ?? "",
    branch_phone: gift.branchPhone ?? "",
    delivery_zone: gift.deliveryZone ?? "",
    delivery_eta: gift.deliveryEta ?? "",
    gift_message: gift.giftMessage ?? "",
    recipient_address: gift.recipientAddress ?? "",
    recipient_landmark: gift.recipientLandmark ?? "",
    recipient_phone: gift.recipientPhone ?? "",
    items: gift.items ?? [],
    pricing: gift.pricing ?? {},
    payment: gift.payment ?? {},
    status: gift.status ?? "pending_acceptance",
    order_reference: gift.orderReference ?? "",
    created_at: gift.createdAt,
    updated_at: gift.updatedAt ?? null,
    responded_at: gift.respondedAt ?? null,
  };
}

function mapGiftFromDb(row) {
  return {
    id: row.id,
    reference: row.reference,
    senderEmail: row.sender_email ?? row.senderEmail ?? "",
    senderName: row.sender_name ?? row.senderName ?? "",
    senderPhone: row.sender_phone ?? row.senderPhone ?? "",
    recipientEmail: row.recipient_email ?? row.recipientEmail ?? "",
    recipientName: row.recipient_name ?? row.recipientName ?? "",
    branchId: row.branch_id ?? row.branchId ?? "",
    branchName: row.branch_name ?? row.branchName ?? "",
    branchAddress: row.branch_address ?? row.branchAddress ?? "",
    branchPhone: row.branch_phone ?? row.branchPhone ?? "",
    deliveryZone: row.delivery_zone ?? row.deliveryZone ?? "",
    deliveryEta: row.delivery_eta ?? row.deliveryEta ?? "",
    giftMessage: row.gift_message ?? row.giftMessage ?? "",
    recipientAddress: row.recipient_address ?? row.recipientAddress ?? "",
    recipientLandmark: row.recipient_landmark ?? row.recipientLandmark ?? "",
    recipientPhone: row.recipient_phone ?? row.recipientPhone ?? "",
    items: row.items ?? [],
    pricing: row.pricing ?? {},
    payment: row.payment ?? {},
    status: row.status ?? "pending_acceptance",
    orderReference: row.order_reference ?? row.orderReference ?? "",
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
    respondedAt: row.responded_at ?? row.respondedAt ?? null,
  };
}

function mapPasswordRecoveryRequestToDb(entry) {
  return {
    reference: entry.reference,
    user_email: entry.userEmail,
    full_name: entry.fullName ?? "",
    phone_last4: entry.phoneLast4 ?? "",
    status: entry.status ?? "pending_review",
    approval_code_hash: entry.approvalCodeHash ?? "",
    approval_code_expires_at: entry.approvalCodeExpiresAt ?? null,
    reviewed_by: entry.reviewedBy ?? "",
    reviewed_at: entry.reviewedAt ?? null,
    completed_at: entry.completedAt ?? null,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt ?? null,
  };
}

function mapPasswordRecoveryRequestFromDb(row) {
  return {
    id: row.id,
    reference: row.reference,
    userEmail: row.user_email ?? row.userEmail ?? "",
    fullName: row.full_name ?? row.fullName ?? "",
    phoneLast4: row.phone_last4 ?? row.phoneLast4 ?? "",
    status: row.status ?? "pending_review",
    approvalCodeHash: row.approval_code_hash ?? row.approvalCodeHash ?? "",
    approvalCodeExpiresAt: row.approval_code_expires_at ?? row.approvalCodeExpiresAt ?? null,
    reviewedBy: row.reviewed_by ?? row.reviewedBy ?? "",
    reviewedAt: row.reviewed_at ?? row.reviewedAt ?? null,
    completedAt: row.completed_at ?? row.completedAt ?? null,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function mapReservationToDb(entry) {
  return {
    reference: entry.reference,
    name: entry.name,
    phone: entry.phone,
    date: entry.date,
    time: entry.time,
    guests: entry.guests,
    notes: entry.notes,
    branch_id: entry.branchId ?? "",
    branch_name: entry.branchName ?? "",
    status: entry.status,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt ?? null,
  };
}

function mapReservationFromDb(row) {
  return {
    id: row.id,
    reference: row.reference,
    name: row.name,
    phone: row.phone,
    date: row.date,
    time: row.time,
    guests: row.guests,
    notes: row.notes,
    branchId: row.branch_id ?? row.branchId ?? "",
    branchName: row.branch_name ?? row.branchName ?? "",
    status: row.status ?? "new",
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  };
}

function mapReviewToDb(entry) {
  return {
    reference: entry.reference,
    order_reference: entry.orderReference,
    customer_name: entry.customerName,
    branch_id: entry.branchId ?? "",
    branch_name: entry.branchName ?? "",
    rating: entry.rating,
    comment: entry.comment,
    created_at: entry.createdAt,
  };
}

function mapReviewFromDb(row) {
  return {
    id: row.id,
    reference: row.reference,
    orderReference: row.order_reference ?? row.orderReference,
    customerName: row.customer_name ?? row.customerName,
    branchId: row.branch_id ?? row.branchId ?? "",
    branchName: row.branch_name ?? row.branchName ?? "",
    rating: Number(row.rating) || 0,
    comment: row.comment ?? "",
    createdAt: row.created_at ?? row.createdAt,
  };
}
