import { createFileRoute, Link } from "@tanstack/react-router";

import { EpisodePlayer } from "../components/episode-player";
import { getPublishedEpisode } from "../lib/public/server-fns";

export const Route = createFileRoute("/app/watch/$episodeId")({
  loader: ({ params }) => getPublishedEpisode({ data: params.episodeId }),
  component: WatchPage,
});

function WatchPage() {
  const { episode, error } = Route.useLoaderData();
  if (!episode) return <p role="alert">{error || "Episódio não encontrado."}</p>;

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
      </section>
    </div>
  );
}
