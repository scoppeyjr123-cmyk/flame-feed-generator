import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

import { EpisodePlayer } from "../components/episode-player";
import {
  getCustomerEpisodeProgress,
  getPublishedEpisode,
  getPublishedSeriesBySlug,
} from "../lib/public/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/app/watch/$episodeId")({
  loader: async ({ params }) => {
    const [episodeResult, progressResult] = await Promise.all([
      getPublishedEpisode({ data: params.episodeId }),
      getCustomerEpisodeProgress({ data: params.episodeId }),
    ]);
    if (!episodeResult.episode) {
      return { ...episodeResult, progress: progressResult.progress, nextEpisode: null };
    }
    const seriesResult = await getPublishedSeriesBySlug({
      data: episodeResult.episode.series.slug,
    });
    const nextEpisode =
      seriesResult.series?.episodes.find(
        (item) => item.episode_number > episodeResult.episode!.episode_number,
      ) ?? null;
    return { ...episodeResult, progress: progressResult.progress, nextEpisode };
  },
  component: WatchPage,
});

function WatchPage() {
  const { episode, error, progress, nextEpisode } = Route.useLoaderData();
  const navigate = useNavigate();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function saveProgress(seconds: number) {
    if (!episode || !Number.isFinite(seconds)) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await supabase.from("watch_progress").upsert(
        {
          user_id: data.user.id,
          episode_id: episode.id,
          position_seconds: Math.max(0, Math.floor(seconds)),
          duration_seconds: episode.duration_seconds ?? 0,
          completed:
            episode.duration_seconds !== null &&
            episode.duration_seconds > 0 &&
            seconds >= episode.duration_seconds - 3,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,episode_id" },
      );
    }, 1000);
  }

  if (!episode)
    return (
      <section className="watch-paywall">
        <style>{`.watch-paywall{max-width:560px;margin:70px auto;border:1px solid #633454;border-radius:18px;background:#170c16;padding:32px;text-align:center}.watch-paywall h1{font:600 30px "Playfair Display",Georgia,serif}.watch-paywall p{margin-top:12px;color:#bda7b9;line-height:1.6}.watch-paywall a{display:inline-flex;margin-top:22px;border-radius:999px;background:#f45db2;color:#180b17;padding:12px 20px;font-size:12px;font-weight:800}`}</style>
        <p className="app-kicker">Acesso exclusivo</p>
        <h1>Este episódio faz parte da sua próxima maratona</h1>
        <p>{error || "Assine um plano Feed Loves para continuar assistindo."}</p>
        <a href="/#planos">Conhecer os planos</a>
      </section>
    );

  return (
    <div className="watch-page">
      <style>{`.watch-page{max-width:900px;margin:0 auto}.watch-back{display:inline-block;margin-bottom:18px;color:#d5b5cb;font-size:12px}.watch-back:hover{color:var(--primary)}.watch-player{overflow:hidden;border:1px solid #4c2850;border-radius:16px;background:#080508}.watch-player .part2-player-frame{height:min(75vh,680px);aspect-ratio:auto;border:0;border-radius:0}.watch-heading{padding:20px 0}.watch-heading h1{font:600 30px "Playfair Display",Georgia,serif}.watch-heading p{margin-top:8px;color:#a992a4;font-size:13px}.watch-badge{display:inline-block;margin-top:12px;border:1px solid #633454;border-radius:999px;padding:5px 9px;color:#f56dbb;font-size:10px;font-weight:800;text-transform:uppercase}`}</style>
      <Link className="watch-back" to="/app/novela/$slug" params={{ slug: episode.series.slug }}>
        ← Voltar para {episode.series.title}
      </Link>
      <section className="watch-player">
        <EpisodePlayer
          videoUrl={episode.video_url || ""}
          posterUrl={episode.thumbnail_url || ""}
          title={episode.title}
          initialSeconds={progress?.completed ? 0 : (progress?.position_seconds ?? 0)}
          onPlaybackSeconds={saveProgress}
          onEnded={() => {
            saveProgress(episode.duration_seconds ?? 0);
            if (nextEpisode) {
              window.setTimeout(() => {
                void navigate({
                  to: "/app/watch/$episodeId",
                  params: { episodeId: nextEpisode.id },
                });
              }, 1200);
            }
          }}
        />
      </section>
      <section className="watch-heading">
        <h1>
          E{episode.episode_number} · {episode.title}
        </h1>
        <p>{episode.description || "Continue sua história no Feed Loves."}</p>
        <span className="watch-badge">
          {episode.access_type === "free" ? "Grátis" : "Assinantes"}
        </span>
        {episode.access_type !== "free" && episode.plans ? (
          <p className="watch-plan">
            Liberado pelo plano{" "}
            {Array.isArray(episode.plans) ? episode.plans[0]?.name : episode.plans.name}.
          </p>
        ) : null}
        {nextEpisode ? (
          <Link
            className="watch-next"
            to="/app/watch/$episodeId"
            params={{ episodeId: nextEpisode.id }}
          >
            Próximo episódio: E{nextEpisode.episode_number} · {nextEpisode.title} →
          </Link>
        ) : null}
      </section>
    </div>
  );
}
