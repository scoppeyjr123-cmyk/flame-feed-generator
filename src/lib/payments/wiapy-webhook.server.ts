import { timingSafeEqual } from "node:crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type WiapyPayload = {
  payment?: { id?: string; status?: string; type?: string } | null;
  subscription?: { id?: string; status?: string; active?: boolean; dt_start?: string; dt_end?: string; next_billing?: string } | null;
  customer?: { email?: string } | null;
  checkout?: { id?: string; title?: string } | null;
};

function secureToken(expected: string, received: string) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function adminClient() {
  const url = process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SECRET_KEY"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function handleWiapyWebhook(request: Request) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const token = process.env["WIAPY_WEBHOOK_TOKEN"];
  const received = request.headers.get("authorization") ?? "";
  if (!token || !secureToken(token, received.replace(/^Bearer\s+/i, ""))) return new Response("Unauthorized", { status: 401 });

  let payload: WiapyPayload;
  try { payload = JSON.parse(await request.text()) as WiapyPayload; } catch { return new Response("Invalid JSON", { status: 400 }); }
  const email = payload.customer?.email?.trim().toLowerCase();
  const checkoutId = payload.checkout?.id;
  const paymentStatus = payload.payment?.status;
  if (!email || !checkoutId || !paymentStatus) return new Response("Incomplete payload", { status: 400 });

  const supabase = adminClient();
  const [{ data: profile }, { data: checkout }] = await Promise.all([
    supabase.from("profiles").select("id,email").ilike("email", email).maybeSingle(),
    supabase.from("checkout_settings").select("plan_id").eq("provider_checkout_id", checkoutId).maybeSingle(),
  ]);
  if (!profile?.id || !checkout?.plan_id) {
    console.warn("Wiapy webhook accepted without local mapping", { email, checkoutId });
    return Response.json({ ok: true, processed: false, reason: "Customer or checkout not mapped" });
  }

  const subscription = payload.subscription;
  const providerSubscriptionId = subscription?.id || payload.payment?.id || null;
  const active = paymentStatus === "paid" && (subscription ? subscription.active !== false : true);
  const status = active ? "active" : paymentStatus === "refunded" || paymentStatus === "chargedback" ? "cancelled" : "expired";
  const { data: existing } = providerSubscriptionId
    ? await supabase.from("subscriptions").select("id").eq("provider_subscription_id", providerSubscriptionId).maybeSingle()
    : { data: null };
  const record = {
    user_id: profile.id,
    plan_id: checkout.plan_id,
    status,
    starts_at: subscription?.dt_start || new Date().toISOString(),
    expires_at: subscription?.dt_end || null,
    renews_at: subscription?.next_billing || null,
    origin: "wiapy",
    provider_subscription_id: providerSubscriptionId,
    notes: "Sincronizado via webhook Wiapy",
  };
  const result = existing
    ? await supabase.from("subscriptions").update(record).eq("id", existing.id).select("id").single()
    : await supabase.from("subscriptions").insert(record).select("id").single();
  if (result.error) return new Response("Subscription update failed", { status: 500 });
  return Response.json({ ok: true, subscriptionId: result.data.id, status });
}
