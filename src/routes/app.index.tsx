import { createFileRoute, Link } from "@tanstack/react-router";

import { getCustomerProgress, getPublishedCatalog } from "../lib/public/server-fns";

export const Route = createFileRoute("/app/")({
  loader: async () => {
    const [catalog, progress] = await Promise.all([getPublishedCatalog(), getCustomerProgress()]);
    return { ...catalog, progress: progress.items };
  },
  component: AppHome,
});

function AppHome() {
  const { series, error, progress } = Route.useLoaderData();
  const featured = series.find((item) => item.featured) ?? series[0];
  return (
    <div className="app-home">
      <style>{`.app-hero{position:relative;min-height:390px;display:flex;align-items:end;overflow:hidden;border:1px solid #3b1d35;border-radius:22px;background:#180b18;margin-bottom:38px}.app-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55}.app-hero:after{position:absolute;inset:0;content:"";background:linear-gradient(90deg,#100710f5 0%,#100710b8 45%,#10071032 100%),linear-gradient(0deg,#100710 0%,transparent 55%)}.app-hero-copy{position:relative;z-index:1;max-width:540px;padding:clamp(24px,5vw,56px)}.app-kicker{color:#f56dbb;font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.app-hero h1{margin-top:10px;font:700 clamp(32px,6vw,62px)/1.02 "Playfair Display",Georgia,serif}.app-hero p{margin-top:14px;color:#d2bbce;line-height:1.6}.app-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}.app-action{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:12px 20px;background:var(--primary);color:var(--primary-foreground);font-size:12px;font-weight:800}.app-action.alt{border:1px solid #6c3a60;background:#1a0d1a;color:#f7dbea}.app-section{margin-top:34px}.app-section h2{font:600 25px "Playfair Display",Georgia,serif}.app-section h2 span{color:var(--primary)}.app-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:15px}.app-card{min-width:0}.app-card-cover{position:relative;aspect-ratio:3/4;overflow:hidden;border:1px solid #42243c;border-radius:10px;background:#1b0d1a}.app-card-cover img{width:100%;height:100%;object-fit:cover;transition:transform .25s}.app-card:hover img{transform:scale(1.04)}.app-card h3{margin-top:8px;font-size:13px}.app-card p{margin-top:3px;color:#a992a4;font-size:10px}.continue-section{margin-bottom:38px}.continue-heading{display:flex;align-items:end;justify-content:space-between;gap:20px}.continue-heading h2{margin-top:4px}.continue-heading>a{color:#f56dbb;font-size:12px}.continue-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}.continue-card{display:grid;grid-template-columns:120px 1fr;gap:12px;padding:10px;border:1px solid #42243c;border-radius:12px;background:#170c16}.continue-card img{width:120px;height:76px;object-fit:cover;border-radius:7px}.continue-card strong{font-size:12px}.continue-card p{margin-top:5px;color:#bda7b9;font-size:10px}.continue-card small{display:block;margin-top:5px;color:#a992a4;font-size:9px}.progress-track{height:4px;margin-top:13px;overflow:hidden;border-radius:99px;background:#382131}.progress-track span{display:block;height:100%;border-radius:inherit;background:#f45db2}@media(max-width:800px){.app-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.continue-grid{grid-template-columns:1fr}}`}</style>
      {error ? <p role="alert">Não foi possível carregar o catálogo agora.</p> : null}
      {featured ? (
        <section className="app-hero">
          <img src={featured.banner_url || featured.cover_url || "/assets/poster1.jpg"} alt="" />
          <div className="app-hero-copy">
            <p className="app-kicker">Em destaque no Feed Loves</p>
            <h1>{featured.title}</h1>
            <p>
              {featured.short_description ||
                featured.description ||
                "Uma nova história espera por você."}
            </p>
            <div className="app-actions">
              <Link className="app-action" to="/app/novela/$slug" params={{ slug: featured.slug }}>
                ▶ Assistir
              </Link>
              <Link
                className="app-action alt"
                to="/app/novela/$slug"
                params={{ slug: featured.slug }}
              >
                ＋ Minha Lista
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="app-hero">
          <div className="app-hero-copy">
            <p className="app-kicker">Feed Loves</p>
            <h1>Seu próximo romance começa aqui.</h1>
            <p>Quando o Admin publicar novelas, elas aparecerão automaticamente neste catálogo.</p>
          </div>
        </section>
      )}
      <section className="app-section">
        {progress.length ? (
          <section className="continue-section">
            <div className="continue-heading">
              <div>
                <p className="app-kicker">Retome de onde parou</p>
                <h2>
                  Continuar <span>assistindo</span>
                </h2>
              </div>
              <Link to="/app/minha-lista">Ver minha lista →</Link>
            </div>
            <div className="continue-grid">
              {progress.map((item) => {
                const episode = Array.isArray(item.episodes) ? item.episodes[0] : item.episodes;
                const seriesItem =
                  episode && (Array.isArray(episode.series) ? episode.series[0] : episode.series);
                if (!episode || !seriesItem) return null;
                const percent = item.duration_seconds
                  ? Math.min(100, Math.round((item.position_seconds / item.duration_seconds) * 100))
                  : 0;
                return (
                  <Link
                    className="continue-card"
                    to="/app/watch/$episodeId"
                    params={{ episodeId: episode.id }}
                    key={episode.id}
                  >
                    <img
                      src={episode.thumbnail_url || seriesItem.cover_url || "/assets/poster1.jpg"}
                      alt=""
                    />
                    <div>
                      <strong>{seriesItem.title}</strong>
                      <p>
                        E{episode.episode_number} · {episode.title}
                      </p>
                      <div className="progress-track">
                        <span style={{ width: `${percent}%` }} />
                      </div>
                      <small>{percent}% assistido</small>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
        <h2>
          Em alta no <span>Feed Loves</span>
        </h2>
        {series.length ? (
          <div className="app-grid">
            {series.map((item) => (
              <Link
                className="app-card"
                to="/app/novela/$slug"
                params={{ slug: item.slug }}
                key={item.id}
              >
                <div className="app-card-cover">
                  <img
                    src={item.cover_url || item.thumbnail_url || "/assets/poster1.jpg"}
                    alt={`Capa de ${item.title}`}
                  />
                </div>
                <h3>{item.title}</h3>
                <p>{item.category || item.genre || "Feed Loves"}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: "#a992a4", marginTop: 12 }}>Nenhuma novela publicada ainda.</p>
        )}
      </section>
    </div>
  );
}
