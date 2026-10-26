import { syncCustomerSubscriptionFromPayment } from "./payment-sync.server";

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

export async function handleApplyfyWebhook(request: Request) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const configuredToken = process.env["APPLYFY_WEBHOOK_TOKEN"];
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

  const event = readPath(payload, ["event", "type", "name", "action"]) ?? "unknown";
  const email =
    readPath(payload, [
      "customer.email",
      "buyer.email",
      "client.email",
      "user.email",
      "data.customer.email",
      "data.buyer.email",
      "data.client.email",
      "data.email",
      "email",
    ])?.toLowerCase() ?? null;

  const buyerName = readPath(payload, [
    "customer.name",
    "customer.full_name",
    "buyer.name",
    "client.name",
    "user.name",
    "data.customer.name",
    "data.buyer.name",
    "data.client.name",
    "data.name",
    "name",
  ]);

  const checkoutId = readPath(payload, [
    "offer.code",
    "offer.id",
    "product.code",
    "product.id",
    "checkout.id",
    "data.offer.code",
    "data.offer.id",
    "data.product.code",
    "data.product.id",
    "data.checkout.id",
    "code",
  ]);

  const paymentStatus = (
    readPath(payload, [
      "status",
      "payment.status",
      "transaction.status",
      "data.status",
      "data.payment.status",
      "data.transaction.status",
    ]) ?? event
  ).toLowerCase();

  const providerSubscriptionId = readPath(payload, [
    "subscription.id",
    "payment.id",
    "transaction.id",
    "data.subscription.id",
    "data.payment.id",
    "data.transaction.id",
    "id",
  ]);

  const startsAt = readPath(payload, [
    "subscription.starts_at",
    "subscription.start_at",
    "data.subscription.starts_at",
    "created_at",
  ]);

  const expiresAt = readPath(payload, [
    "subscription.expires_at",
    "subscription.end_at",
    "subscription.dt_end",
    "data.subscription.expires_at",
  ]);

  const renewsAt = readPath(payload, [
    "subscription.next_billing",
    "subscription.renews_at",
    "data.subscription.next_billing",
  ]);

  if (!email || !checkoutId) {
    console.info("Applyfy webhook received with incomplete info", {
      event,
      hasEmail: Boolean(email),
      hasCheckoutId: Boolean(checkoutId),
    });
    return Response.json({ ok: true, received: true, processed: false });
  }

  const result = await syncCustomerSubscriptionFromPayment({
    provider: "applyfy",
    email,
    buyerName,
    checkoutId,
    paymentStatus,
    providerSubscriptionId,
    event,
    payload,
    startsAt,
    expiresAt,
    renewsAt,
  });

  return Response.json(result, { status: result.ok ? 200 : 500 });
}
