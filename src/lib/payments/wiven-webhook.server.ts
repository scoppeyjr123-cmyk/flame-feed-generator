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

export async function handleWivenWebhook(request: Request) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  let payload: unknown;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const configuredToken = process.env["WIVEN_WEBHOOK_TOKEN"];
  if (configuredToken) {
    const authorizationToken =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const payloadToken = readPath(payload, ["token"]) ?? "";
    if (authorizationToken !== configuredToken && payloadToken !== configuredToken) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const event = readPath(payload, ["event", "type", "name"]) ?? "unknown";
  const email =
    readPath(payload, [
      "client.email",
      "customer.email",
      "buyer.email",
      "user.email",
      "data.customer.email",
      "data.buyer.email",
      "data.customer_email",
      "data.email",
      "customer_email",
    ])?.toLowerCase() ?? null;

  const buyerName = readPath(payload, [
    "client.name",
    "customer.name",
    "customer.full_name",
    "buyer.name",
    "user.name",
    "data.customer.name",
    "data.buyer.name",
    "data.name",
  ]);

  const checkoutId = readPath(payload, [
    "offerCode",
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
    "items.0.product.externalId",
    "transaction.orderItems.0.product.externalId",
  ]);

  const normalizedEvent = event.toLowerCase();
  const eventStatus = normalizedEvent.includes("expired")
    ? "expired"
    : normalizedEvent.includes("cancel")
      ? "cancelled"
      : normalizedEvent.includes("refund") || normalizedEvent.includes("charged_back")
        ? "refunded"
        : null;
  const paymentStatus = (
    eventStatus ??
    readPath(payload, [
      "payment.status",
      "transaction.status",
      "subscription.status",
      "data.payment.status",
      "data.transaction.status",
      "data.subscription.status",
      "status",
    ]) ??
    event
  ).toLowerCase();

  const providerSubscriptionId = readPath(payload, [
    "subscription.id",
    "payment.id",
    "transaction.id",
    "data.subscription.id",
    "data.payment.id",
    "data.transaction.id",
  ]);

  const startsAt = readPath(payload, [
    "subscription.startAt",
    "subscription.starts_at",
    "subscription.start_at",
    "data.subscription.starts_at",
  ]);

  const expiresAt = readPath(payload, [
    "subscription.nextChargeAt",
    "subscription.expires_at",
    "subscription.end_at",
    "subscription.dt_end",
    "data.subscription.expires_at",
  ]);

  const renewsAt = readPath(payload, [
    "subscription.nextChargeAt",
    "subscription.next_billing",
    "subscription.renews_at",
    "data.subscription.next_billing",
  ]);

  if ((!email || !checkoutId) && !providerSubscriptionId) {
    console.info("Wiven webhook received with incomplete info", {
      event,
      hasEmail: Boolean(email),
      hasCheckoutId: Boolean(checkoutId),
    });
    return Response.json({ ok: true, received: true, processed: false });
  }

  const result = await syncCustomerSubscriptionFromPayment({
    provider: "wiven",
    email: email ?? "",
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
