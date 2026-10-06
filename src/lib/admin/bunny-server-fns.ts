import { createServerFn } from "@tanstack/react-start";

import { createBunnyVideo, getBunnyLibraryId, getBunnyVideo, normalizeBunnyStatus } from "../bunny/stream.server";
import { createClient } from "../supabase/server";

async function assertAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const { data: role, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || role?.role !== "admin") throw new Error("FORBIDDEN");
  return { supabase, user };
}

export const createEpisodeBunnyAsset = createServerFn({ method: "POST" })
  .inputValidator((input: { episodeId: string; title: string }) => input)
  .handler(async ({ data }) => {
    const { supabase, user } = await assertAdmin();
    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .select("id,bunny_video_id")
      .eq("id", data.episodeId)
      .single();
    if (episodeError || !episode) throw new Error("EPISODE_NOT_FOUND");
    if (episode.bunny_video_id) throw new Error("BUNNY_ASSET_ALREADY_EXISTS");

    const video = await createBunnyVideo(data.title);
    const { error } = await supabase
      .from("episodes")
      .update({
        video_provider: "bunny",
        bunny_video_id: video.guid,
        bunny_library_id: getBunnyLibraryId(),
        video_processing_status: normalizeBunnyStatus(video.status),
        video_encode_progress: video.encodeProgress ?? 0,
        video_error: null,
      })
      .eq("id", data.episodeId);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "bunny_video_created",
      entity_type: "episode",
      entity_id: data.episodeId,
      metadata: { bunny_video_id: video.guid },
    });

    // Deliberately return no API key. Browser receives identifiers/status only.
    return { videoId: video.guid, libraryId: getBunnyLibraryId(), status: normalizeBunnyStatus(video.status) };
  });

export const refreshEpisodeBunnyStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { episodeId: string }) => input)
  .handler(async ({ data }) => {
    const { supabase } = await assertAdmin();
    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .select("id,bunny_video_id")
      .eq("id", data.episodeId)
      .single();
    if (episodeError || !episode?.bunny_video_id) throw new Error("BUNNY_ASSET_NOT_FOUND");

    const video = await getBunnyVideo(episode.bunny_video_id);
    const status = normalizeBunnyStatus(video.status);
    const errorMessage = status === "error"
      ? video.transcodingMessages?.map((item) => item.message).filter(Boolean).join("; ") || "Bunny encoding failed"
      : null;

    const { error } = await supabase
      .from("episodes")
      .update({
        video_processing_status: status,
        video_encode_progress: video.encodeProgress ?? null,
        video_storage_bytes: video.storageSize ?? null,
        duration_seconds: video.length || null,
        video_error: errorMessage,
        video_ready_at: status === "ready" ? new Date().toISOString() : null,
      })
      .eq("id", data.episodeId);
    if (error) throw new Error(error.message);

    return { status, encodeProgress: video.encodeProgress ?? 0, durationSeconds: video.length ?? null };
  });
