import { timingSafeEqual } from "node:crypto";
import { syncCustomerSubscriptionFromPayment } from "./payment-sync.server";

type WiapyPayload = {
  payment?: { id?: string; status?: string; type?: string } | null;
  subscription?: {
    id?: string;
    status?: string;
    active?: boolean;
    dt_start?: string;
    dt_end?: string;
    next_billing?: string;
  } | null;
  customer?: { email?: string; name?: string } | null;
  checkout?: { id?: string; title?: string } | null;
};

function secureToken(expected: string, received: string) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function handleWiapyWebhook(request: Request) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const token = process.env["WIAPY_WEBHOOK_TOKEN"];
  const received = request.headers.get("authorization") ?? "";
  if (!token || !secureToken(token, received.replace(/^Bearer\s+/i, ""))) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: WiapyPayload;
  try {
    payload = JSON.parse(await request.text()) as WiapyPayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const email = payload.customer?.email?.trim().toLowerCase();
  const checkoutId = payload.checkout?.id;
  const paymentStatus = payload.payment?.status;
  if (!email || !checkoutId || !paymentStatus) {
    return new Response("Incomplete payload", { status: 400 });
  }

  const buyerName = payload.customer?.name || null;
  const subscription = payload.subscription;
  const providerSubscriptionId = subscription?.id || payload.payment?.id || null;

  const result = await syncCustomerSubscriptionFromPayment({
    provider: "wiapy",
    email,
    buyerName,
    checkoutId,
    paymentStatus,
    providerSubscriptionId,
    event: "wiapy_webhook",
    payload,
    startsAt: subscription?.dt_start || null,
    expiresAt: subscription?.dt_end || null,
    renewsAt: subscription?.next_billing || null,
  });

  return Response.json(result, { status: result.ok ? 200 : 500 });
}
