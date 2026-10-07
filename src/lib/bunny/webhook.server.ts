import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getBunnyLibraryId, getBunnyVideo, normalizeBunnyStatus } from "./stream.server";

type BunnyWebhookPayload = {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;
};

function secureEqualHex(a: string, b: string) {
  if (!/^[0-9a-f]{64}$/.test(a) || !/^[0-9a-f]{64}$/.test(b)) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

function getSupabaseAdmin() {
  const url = process.env["VITE_SUPABASE_URL"];
  const serviceRoleKey = process.env["SUPABASE_SECRET_KEY"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url) throw new Error("VITE_SUPABASE_URL is missing");
  if (!serviceRoleKey) throw new Error("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is missing");

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function handleBunnyWebhook(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-bunnystream-signature") ?? "";
  const version = request.headers.get("x-bunnystream-signature-version") ?? "";
  const algorithm = request.headers.get("x-bunnystream-signature-algorithm") ?? "";
  const readOnlyKey = process.env["BUNNY_STREAM_READ_ONLY_API_KEY"];

  if (!readOnlyKey) {
    console.error("BUNNY_STREAM_READ_ONLY_API_KEY is missing");
    return new Response("Webhook not configured", { status: 503 });
  }

  if (version !== "v1" || algorithm !== "hmac-sha256") {
    return new Response("Invalid signature headers", { status: 401 });
  }

  const expected = createHmac("sha256", readOnlyKey).update(rawBody, "utf8").digest("hex");
  if (!secureEqualHex(signature, expected)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: BunnyWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as BunnyWebhookPayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (
    !Number.isInteger(payload.VideoLibraryId) ||
    typeof payload.VideoGuid !== "string" ||
    !Number.isInteger(payload.Status)
  ) {
    return new Response("Invalid payload", { status: 400 });
  }

  if (payload.VideoLibraryId !== getBunnyLibraryId()) {
    return new Response("Wrong library", { status: 403 });
  }

  const video = await getBunnyVideo(payload.VideoGuid);
  const status = normalizeBunnyStatus(video.status);
  const errorMessage =
    status === "error"
      ? video.transcodingMessages
          ?.map((item) => item.message)
          .filter(Boolean)
          .join("; ") || "Bunny encoding failed"
      : null;

  const supabase = getSupabaseAdmin();
  const { data: episode, error } = await supabase
    .from("episodes")
    .update({
      video_processing_status: status,
      video_encode_progress: video.encodeProgress ?? null,
      video_storage_bytes: video.storageSize ?? null,
      duration_seconds: video.length || null,
      video_error: errorMessage,
      video_ready_at: status === "ready" ? new Date().toISOString() : null,
    })
    .eq("bunny_video_id", payload.VideoGuid)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Bunny webhook database update failed", error);
    return new Response("Database update failed", { status: 500 });
  }

  if (!episode) {
    return new Response("Video not linked to an episode", { status: 202 });
  }

  return Response.json({
    ok: true,
    episodeId: episode.id,
    status,
    encodeProgress: video.encodeProgress ?? 0,
  });
}
