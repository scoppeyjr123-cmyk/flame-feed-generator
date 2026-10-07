import { createHash } from "node:crypto";

const BUNNY_API_BASE = "https://video.bunnycdn.com";
const BUNNY_TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

export type BunnyVideo = {
  videoLibraryId: number;
  guid: string;
  title: string;
  status: number;
  length: number;
  encodeProgress: number;
  storageSize: number;
  availableResolutions?: string | null;
  thumbnailFileName?: string | null;
  transcodingMessages?: Array<{ message?: string | null; level?: number }> | null;
};

function getConfig() {
  const libraryId = process.env["BUNNY_STREAM_LIBRARY_ID"];
  const apiKey = process.env["BUNNY_STREAM_API_KEY"];
  const tokenKey = process.env["BUNNY_STREAM_TOKEN_KEY"];

  if (!libraryId || !/^\d+$/.test(libraryId)) {
    throw new Error("BUNNY_STREAM_LIBRARY_ID is missing or invalid");
  }
  if (!apiKey) throw new Error("BUNNY_STREAM_API_KEY is missing");

  return { libraryId: Number(libraryId), apiKey, tokenKey };
}

async function bunnyRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { apiKey } = getConfig();
  const response = await fetch(`${BUNNY_API_BASE}${path}`, {
    ...init,
    headers: {
      AccessKey: apiKey,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Bunny Stream request failed (${response.status}): ${body.slice(0, 500)}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function getBunnyLibraryId() {
  return getConfig().libraryId;
}

export function createBunnySignedEmbedUrl(videoId: string, ttlSeconds = 2 * 60 * 60) {
  const { libraryId, tokenKey } = getConfig();
  if (!tokenKey) throw new Error("BUNNY_STREAM_TOKEN_KEY is missing");

  const expires = Math.floor(Date.now() / 1000) + Math.max(60, ttlSeconds);
  const token = createHash("sha256")
    .update(`${tokenKey}${videoId}${expires}`)
    .digest("hex");

  return {
    url: `https://iframe.mediadelivery.net/embed/${libraryId}/${encodeURIComponent(videoId)}?token=${token}&expires=${expires}`,
    expires,
  };
}

export async function createBunnyVideo(title: string) {
  const { libraryId } = getConfig();
  return bunnyRequest<BunnyVideo>(`/library/${libraryId}/videos`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function createBunnyTusCredentials(videoId: string) {
  const { libraryId, apiKey } = getConfig();
  const expirationTime = Math.floor(Date.now() / 1000) + 6 * 60 * 60;
  const signature = createHash("sha256")
    .update(`${libraryId}${apiKey}${expirationTime}${videoId}`)
    .digest("hex");

  return {
    endpoint: BUNNY_TUS_ENDPOINT,
    libraryId: String(libraryId),
    videoId,
    expirationTime,
    signature,
  };
}

export async function getBunnyVideo(videoId: string) {
  const { libraryId } = getConfig();
  return bunnyRequest<BunnyVideo>(`/library/${libraryId}/videos/${encodeURIComponent(videoId)}`);
}

export async function deleteBunnyVideo(videoId: string) {
  const { libraryId } = getConfig();
  return bunnyRequest<void>(`/library/${libraryId}/videos/${encodeURIComponent(videoId)}`, {
    method: "DELETE",
  });
}

export function normalizeBunnyStatus(
  status: number,
): "created" | "uploading" | "processing" | "ready" | "error" {
  if (status === 5) return "error";
  if (status === 6 || status === 7) return "uploading";
  if (status === 3 || status === 4 || status === 8) return "ready";
  if (status === 1 || status === 2) return "processing";
  return "created";
}
