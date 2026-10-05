import { createFileRoute, Link } from "@tanstack/react-router";

import { getPublishedSeriesBySlug } from "../lib/public/server-fns";

export const Route = createFileRoute("/app/novela/$slug")({
  loader: ({ params }) => getPublishedSeriesBySlug({ data: params.slug }),
  component: NovelPage,
});

function NovelPage() {
  const { series, error } = Route.useLoaderData();
  if (!series) return <p role="alert">{error || "Novela não encontrada."}</p>;

  return (
    <div className="novel-page">
      <style>{`.novel-backdrop{position:relative;min-height:360px;display:flex;align-items:end;overflow:hidden;border:1px solid #3b1d35;border-radius:22px;background:#180b18}.novel-backdrop>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5}.novel-backdrop:after{position:absolute;inset:0;content:"";background:linear-gradient(90deg,#100710f5,#10071070 65%,#10071026),linear-gradient(0deg,#100710,transparent 62%)}.novel-copy{position:relative;z-index:1;max-width:650px;padding:34px}.novel-kicker{color:#f56dbb;font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.novel-copy h1{margin-top:10px;font:700 clamp(34px,6vw,60px)/1.02 "Playfair Display",Georgia,serif}.novel-copy p{margin-top:14px;color:#d2bbce;line-height:1.65}.novel-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;color:#dcbfd3;font-size:11px}.novel-episodes{margin-top:38px}.novel-episodes h2{font:600 27px "Playfair Display",Georgia,serif}.novel-episode{display:grid;grid-template-columns:170px 1fr auto;align-items:center;gap:18px;padding:16px 0;border-bottom:1px solid #3b1d35}.novel-episode-thumb{aspect-ratio:16/9;overflow:hidden;border-radius:9px;background:#241126}.novel-episode-thumb img{width:100%;height:100%;object-fit:cover}.novel-episode h3{font-size:15px}.novel-episode p{margin-top:6px;color:#a992a4;font-size:12px;line-height:1.5}.novel-episode-action{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:var(--primary);padding:10px 16px;color:var(--primary-foreground);font-size:11px;font-weight:800}@media(max-width:650px){.novel-copy{padding:24px}.novel-episode{grid-template-columns:110px 1fr;gap:12px}.novel-episode-action{grid-column:2;justify-self:start}.novel-episode h3{font-size:13px}}`}</style>
      <section className="novel-backdrop">
        <img src={series.banner_url || series.cover_url || "/assets/poster1.jpg"} alt="" />
        <div className="novel-copy">
          <p className="novel-kicker">{series.category || "Feed Loves"}</p>
          <h1>{series.title}</h1>
          <p>{series.description || series.short_description || "Uma história para acompanhar."}</p>
          <div className="novel-meta">
            <span>{series.genre || "Romance"}</span>
            <span>•</span>
            <span>{series.episodes.length} episódios</span>
          </div>
        </div>
      </section>
      <section className="novel-episodes">
        <h2>Episódios</h2>
        {series.episodes.length ? (
          series.episodes.map((episode) => (
            <article className="novel-episode" key={episode.id}>
              <div className="novel-episode-thumb">
                <img
                  src={episode.thumbnail_url || series.cover_url || "/assets/poster1.jpg"}
                  alt=""
                />
              </div>
              <div>
                <h3>
                  E{episode.episode_number} · {episode.title}
                </h3>
                <p>{episode.description || "Assista agora no Feed Loves."}</p>
              </div>
              <Link
                className="novel-episode-action"
                to="/app/watch/$episodeId"
                params={{ episodeId: episode.id }}
              >
                ▶ Assistir
              </Link>
            </article>
          ))
        ) : (
          <p style={{ color: "#a992a4", marginTop: 12 }}>Nenhum episódio publicado ainda.</p>
        )}
      </section>
    </div>
  );
}
