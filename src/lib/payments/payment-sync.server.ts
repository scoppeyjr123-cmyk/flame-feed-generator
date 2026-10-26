import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "../supabase/database.types";

export type PaymentSyncInput = {
  provider: "wiven" | "wiapy" | "applyfy" | string;
  email: string;
  buyerName?: string | null;
  checkoutId: string;
  paymentStatus: string;
  providerSubscriptionId?: string | null;
  event?: string;
  payload?: unknown;
  startsAt?: string | null;
  expiresAt?: string | null;
  renewsAt?: string | null;
};

export type PaymentSyncResult = {
  ok: boolean;
  received: boolean;
  processed: boolean;
  userId?: string;
  subscriptionId?: string;
  status?: string;
  reason?: string;
};

// Known checkout IDs mapped to plan slugs for maximum resilience
const KNOWN_CHECKOUT_TO_SLUG: Record<string, string> = {
  // Wiven
  "UDRLIC7": "weekly",
  "G2M4G7C": "monthly",
  "84LM9WZ": "annual",
  // Applyfy
  "XTSUYU1": "weekly",
  "ZVZ9FV7": "monthly",
  "WH555VJ": "annual",
  // Wiapy
  "D1rAjQcO8bo_": "weekly",
  "KaF1EsAXWGPC": "monthly",
  "JQcBx7Tif3vh": "annual",
  // Direct slugs
  "weekly": "weekly",
  "monthly": "monthly",
  "annual": "annual",
};

export function getAdminSupabaseClient(): SupabaseClient<Database> {
  const url =
    process.env["VITE_SUPABASE_URL"] ??
    process.env["SUPABASE_URL"] ??
    "";
  const key =
    process.env["SUPABASE_SECRET_KEY"] ??
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
    "";

  if (!url || !key) {
    throw new Error("Supabase server credentials are not configured");
  }

  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Resolves the plan ID from a checkout ID or product code.
 */
export async function resolvePlanId(
  supabase: SupabaseClient<Database>,
  checkoutId: string,
): Promise<{ planId: string | null; billingInterval?: Database["public"]["Enums"]["billing_interval"] | undefined }> {
  const cleanedId = checkoutId.trim();

  // 1. Try finding in checkout_settings
  const { data: checkout } = await supabase
    .from("checkout_settings")
    .select("plan_id, plans(billing_interval)")
    .ilike("provider_checkout_id", cleanedId)
    .maybeSingle();

  if (checkout?.plan_id) {
    const planInfo = checkout.plans as unknown as { billing_interval: Database["public"]["Enums"]["billing_interval"] } | null;
    return {
      planId: checkout.plan_id,
      billingInterval: planInfo?.billing_interval ?? undefined,
    };
  }

  // 2. Try known mapped slug
  const targetSlug = KNOWN_CHECKOUT_TO_SLUG[cleanedId];
  if (targetSlug) {
    const { data: plan } = await supabase
      .from("plans")
      .select("id, billing_interval")
      .eq("slug", targetSlug)
      .maybeSingle();

    if (plan?.id) {
      return { planId: plan.id, billingInterval: plan.billing_interval };
    }
  }

  // 3. Try checking if cleanedId itself matches a plan slug
  const { data: directPlan } = await supabase
    .from("plans")
    .select("id, billing_interval")
    .ilike("slug", cleanedId)
    .maybeSingle();

  if (directPlan?.id) {
    return { planId: directPlan.id, billingInterval: directPlan.billing_interval };
  }

  return { planId: null };
}

/**
 * Finds an existing user by email or provisions a new user via Supabase Auth Admin.
 * Preserves the existing user ID if already registered.
 */
export async function findOrCreateUser(
  supabase: SupabaseClient<Database>,
  email: string,
  buyerName?: string | null,
): Promise<{ userId: string | null; isNew: boolean }> {
  const normalized = normalizeEmail(email);

  // 1. Check if user already exists in public.profiles
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email, name")
    .ilike("email", normalized)
    .maybeSingle();

  if (existingProfile?.id) {
    // If the existing user has no name and a buyer name was supplied, enrich it
    if (!existingProfile.name && buyerName?.trim()) {
      await supabase
        .from("profiles")
        .update({ name: buyerName.trim(), updated_at: new Date().toISOString() })
        .eq("id", existingProfile.id);
    }
    return { userId: existingProfile.id, isNew: false };
  }

  // 2. Not in profiles: try creating via Supabase Auth Admin API (passwordless)
  let userId: string | null = null;
  let isNew = false;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: normalized,
    email_confirm: true,
    user_metadata: buyerName?.trim() ? { name: buyerName.trim() } : {},
  });

  if (created?.user?.id) {
    userId = created.user.id;
    isNew = true;
  } else if (createError) {
    // User might already exist in auth.users without a profile entry
    // Search auth users by email to recover the ID
    const { data: listData } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 50,
    });
    const match = listData?.users?.find(
      (u) => u.email?.toLowerCase() === normalized,
    );
    if (match) {
      userId = match.id;
      isNew = false;
    } else {
      console.error("Failed to provision or find auth user for email:", normalized, createError);
    }
  }

  // 3. Ensure profiles and user_roles are created/updated
  if (userId) {
    await supabase.from("profiles").upsert(
      {
        id: userId,
        email: normalized,
        name: buyerName?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    await supabase.from("user_roles").upsert(
      {
        user_id: userId,
        role: "customer",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }

  return { userId, isNew };
}

/**
 * Calculates expiration timestamp based on startsAt and the plan billing interval.
 */
function calculateExpiration(
  startsAt: string,
  interval?: Database["public"]["Enums"]["billing_interval"],
): string | null {
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return null;

  switch (interval) {
    case "week":
      return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case "month":
      return new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    case "year":
      return new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    case "lifetime":
      return null;
    default:
      // Default to 30 days if unspecified
      return new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
}

/**
 * Universal payment sync handler:
 * - Validates inputs and normalizes email
 * - Finds or provisions user identity in Supabase Auth
 * - Associates or updates subscription idempotently
 * - Records audit trail and subscription history
 * - Resolves pending payment claims
 */
export async function syncCustomerSubscriptionFromPayment(
  input: PaymentSyncInput,
): Promise<PaymentSyncResult> {
  const email = normalizeEmail(input.email);
  const checkoutId = input.checkoutId.trim();
  const event = input.event || "payment";
  const provider = input.provider || "checkout";

  if (!email || !checkoutId) {
    return {
      ok: false,
      received: true,
      processed: false,
      reason: "Missing email or checkoutId",
    };
  }

  const supabase = getAdminSupabaseClient();

  // 1. Resolve plan
  const { planId, billingInterval } = await resolvePlanId(supabase, checkoutId);

  // 2. Find or provision user
  const { userId, isNew } = await findOrCreateUser(supabase, email, input.buyerName);

  // If user or plan could not be resolved, save in pending_payment_events for manual/later review
  if (!userId || !planId) {
    console.warn("Saving pending payment event (unmapped user or plan):", {
      provider,
      email,
      checkoutId,
      hasUserId: Boolean(userId),
      hasPlanId: Boolean(planId),
    });

    const eventKey = `${provider}:${email}:${checkoutId}:${input.providerSubscriptionId || Date.now()}`;
    await supabase.from("pending_payment_events").upsert(
      {
        provider,
        event_key: eventKey,
        email,
        checkout_id: checkoutId,
        payment_status: input.paymentStatus,
        payload: (input.payload && typeof input.payload === "object" ? (input.payload as Json) : {}),
      },
      { onConflict: "event_key" },
    );

    return {
      ok: true,
      received: true,
      processed: false,
      reason: "User or plan could not be resolved; stored in pending_payment_events",
    };
  }

  // 3. Determine status
  const normalizedStatus = input.paymentStatus.toLowerCase();
  const isActive = [
    "paid",
    "approved",
    "completed",
    "success",
    "successful",
    "active",
  ].some((s) => normalizedStatus.includes(s));

  const isCancelled = [
    "refunded",
    "chargeback",
    "chargedback",
    "cancelled",
    "canceled",
  ].some((s) => normalizedStatus.includes(s));

  const isExpired = ["expired"].some((s) => normalizedStatus.includes(s));

  const status: Database["public"]["Enums"]["subscription_status"] = isActive
    ? "active"
    : isCancelled
      ? "cancelled"
      : isExpired
        ? "expired"
        : "pending";

  const startsAt = input.startsAt || new Date().toISOString();
  const expiresAt =
    input.expiresAt ||
    (isActive ? calculateExpiration(startsAt, billingInterval) : null);
  const renewsAt = input.renewsAt || null;

  // 4. Idempotency check:
  // Look for existing subscription by providerSubscriptionId or (user_id, plan_id, active/pending)
  let existingId: string | null = null;
  let beforeData: unknown = null;

  if (input.providerSubscriptionId) {
    const { data: foundByProvider } = await supabase
      .from("subscriptions")
      .select("id, status, plan_id, starts_at, expires_at, renews_at")
      .eq("provider_subscription_id", input.providerSubscriptionId)
      .maybeSingle();

    if (foundByProvider) {
      existingId = foundByProvider.id;
      beforeData = foundByProvider;
    }
  }

  if (!existingId) {
    const { data: foundByUser } = await supabase
      .from("subscriptions")
      .select("id, status, plan_id, starts_at, expires_at, renews_at")
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .in("status", ["active", "pending", "lifetime"])
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (foundByUser) {
      existingId = foundByUser.id;
      beforeData = foundByUser;
    }
  }

  const record: Database["public"]["Tables"]["subscriptions"]["Insert"] = {
    user_id: userId,
    plan_id: planId,
    status,
    starts_at: startsAt,
    expires_at: expiresAt,
    renews_at: renewsAt,
    origin: provider,
    provider_subscription_id: input.providerSubscriptionId || null,
    notes: `Sincronizado automaticamente via webhook ${provider} (${event})`,
    updated_at: new Date().toISOString(),
  };

  let subscriptionId: string | undefined;

  if (existingId) {
    const { data: updated, error: updateError } = await supabase
      .from("subscriptions")
      .update(record)
      .eq("id", existingId)
      .select("id")
      .single();

    if (updateError) {
      console.error("Failed to update subscription via payment sync:", updateError);
      return { ok: false, received: true, processed: false, reason: updateError.message };
    }
    subscriptionId = updated.id;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("subscriptions")
      .insert(record)
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to insert subscription via payment sync:", insertError);
      return { ok: false, received: true, processed: false, reason: insertError.message };
    }
    subscriptionId = inserted.id;
  }

  // 5. Record subscription history
  const historyAction = isActive
    ? existingId
      ? "renewed_via_webhook"
      : isNew
        ? "provisioned_and_activated"
        : "activated_via_webhook"
    : isCancelled
      ? "cancelled_via_webhook"
      : isExpired
        ? "expired_via_webhook"
        : "updated_via_webhook";

  await supabase.from("subscription_history").insert({
    subscription_id: subscriptionId,
    user_id: userId,
    action: historyAction,
    before_data: (beforeData && typeof beforeData === "object" ? (beforeData as Json) : null),
    after_data: (record as unknown as Json),
  });

  // 6. Record audit log
  await supabase.from("audit_logs").insert({
    action: "webhook_payment_sync",
    entity_type: "subscription",
    entity_id: subscriptionId,
    metadata: {
      provider,
      email,
      checkoutId,
      event,
      paymentStatus: input.paymentStatus,
      status,
      isNewUser: isNew,
    },
  });

  // 7. Mark pending payment events for this email as processed
  await supabase
    .from("pending_payment_events")
    .update({ processed_at: new Date().toISOString() })
    .ilike("email", email)
    .is("processed_at", null);

  console.info("Payment synced successfully:", {
    email,
    userId,
    subscriptionId,
    status,
    isNewUser: isNew,
    provider,
  });

  return {
    ok: true,
    received: true,
    processed: true,
    userId,
    subscriptionId,
    status,
  };
}
