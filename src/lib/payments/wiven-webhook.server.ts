import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function adminClient() {
  const url = process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SECRET_KEY"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function readPath(value: unknown, paths: string[]) {
  for (const path of paths) {
    let current: unknown = value;
    for (const part of path.split(".")) {
      if (!current || typeof current !== "object") {
        current = null;
        break;
      }
      current = (current as Record<string, unknown>)[part];
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
  ])?.toLowerCase() ?? null;
  const checkoutId = readPath(payload, [
    "checkout.id",
    "offer.id",
    "product.id",
    "data.checkout.id",
    "data.offer.id",
    "data.product.id",
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

  return Response.json({ ok: true, received: true, processed: false, matched: true });
}
