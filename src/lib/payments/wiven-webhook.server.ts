import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function adminClient() {
  const url = process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SECRET_KEY"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function readPath(value: unknown, paths: string[]) {
  for (const path of paths) {
    let current = value as Record<string, unknown> | null;
    for (const part of path.split(".")) {
      if (!current || typeof current !== "object") {
        current = null;
        break;
      }
      current = current[part] as Record<string, unknown> | null;
    }
    if (typeof current === "string" && current.trim()) return current.trim();
  }
  return null;
}

export async function handleWivenWebhook(request: Request) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const configuredToken = process.env["WIVEN_WEBHOOK_TOKEN"];
  if (configuredToken) {
    const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    if (received !== configuredToken) return new Response("Unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const event = readPath(payload, ["event", "type", "name"]) ?? "unknown";
  const email = readPath(payload, [
    "customer.email",
    "buyer.email",
    "user.email",
    "data.customer.email",
    "data.buyer.email",
    "data.customer_email",
    "data.email",
    "customer_email",
  ])?.toLowerCase() ?? null;
  const checkoutId = readPath(payload, [
    "checkout.id",
    "offer.id",
    "product.id",
    "data.checkout.id",
    "data.offer.id",
    "data.product.id",
    "offer.code",
    "data.offer.code",
    "product.code",
    "data.product.code",
  ]);

  const paymentStatus = (readPath(payload, [
    "payment.status",
    "transaction.status",
    "data.payment.status",
    "data.transaction.status",
    "status",
  ]) ?? event).toLowerCase();
  const providerSubscriptionId = readPath(payload, [
    "subscription.id",
    "payment.id",
    "transaction.id",
    "data.subscription.id",
    "data.payment.id",
    "data.transaction.id",
  ]);

  // Keep the endpoint tolerant while Wiven's first real payload is being verified.
  // Events without the fields required for activation are acknowledged and logged only.
  if (!email || !checkoutId) {
    console.info("Wiven webhook received", { event, hasEmail: Boolean(email), hasCheckoutId: Boolean(checkoutId) });
    return Response.json({ ok: true, received: true, processed: false });
  }

  const supabase = adminClient();
  const { data: profile } = await supabase.from("profiles").select("id").ilike("email", email).maybeSingle();
  const { data: checkout } = await supabase
    .from("checkout_settings")
    .select("plan_id")
    .eq("provider", "wiven")
    .eq("provider_checkout_id", checkoutId)
    .maybeSingle();

  if (!profile?.id || !checkout?.plan_id) {
    await supabase.from("pending_payment_events").upsert(
      {
        provider: "wiven",
        event_key: `${email}:${checkoutId}:${event}`,
        email,
        checkout_id: checkoutId,
        payment_status: event,
        payload,
      },
      { onConflict: "event_key" },
    );
    return Response.json({ ok: true, received: true, processed: false });
  }

  const isActive = ["paid", "approved", "completed", "success", "successful", "active"].some(
    (value) => paymentStatus.includes(value),
  );
  const isCancelled = ["refunded", "chargeback", "chargedback", "cancelled", "canceled", "expired"].some(
    (value) => paymentStatus.includes(value),
  );
  const status = isActive ? "active" : isCancelled ? "cancelled" : "pending";
  const startsAt = readPath(payload, [
    "subscription.starts_at",
    "subscription.start_at",
    "data.subscription.starts_at",
  ]) ?? new Date().toISOString();
  const expiresAt = readPath(payload, [
    "subscription.expires_at",
    "subscription.end_at",
    "subscription.dt_end",
    "data.subscription.expires_at",
  ]);
  const { data: existing } = providerSubscriptionId
    ? await supabase.from("subscriptions").select("id").eq("provider_subscription_id", providerSubscriptionId).maybeSingle()
    : { data: null };
  const record = {
    user_id: profile.id,
    plan_id: checkout.plan_id,
    status,
    starts_at: startsAt,
    expires_at: expiresAt,
    provider_subscription_id: providerSubscriptionId,
    origin: "wiven",
    notes: `Sincronizado via webhook Wiven (${event})`,
  };
  const result = existing
    ? await supabase.from("subscriptions").update(record).eq("id", existing.id).select("id").single()
    : await supabase.from("subscriptions").insert(record).select("id").single();
  if (result.error) {
    console.error("Wiven subscription sync failed", result.error);
    return Response.json({ ok: false, received: true, processed: false }, { status: 500 });
  }
  return Response.json({ ok: true, received: true, processed: true, subscriptionId: result.data.id, status });
}
