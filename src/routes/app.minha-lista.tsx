import { createFileRoute, Link } from "@tanstack/react-router";

import { getCustomerWatchlist } from "../lib/public/server-fns";

export const Route = createFileRoute("/app/minha-lista")({
  loader: () => getCustomerWatchlist(),
  component: WatchlistPage,
});

function WatchlistPage() {
  const { items, error } = Route.useLoaderData();
  return (
    <div>
      <style>{`.list-page h1{font:600 36px "Playfair Display",Georgia,serif}.list-page p{color:#bda7b9}.list-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:24px}.list-card img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:10px;border:1px solid #42243c}.list-card h2{margin-top:8px;font-size:13px}@media(max-width:800px){.list-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`}</style>
      <div className="list-page">
        <p className="app-kicker">Sua biblioteca</p>
        <h1>Minha lista</h1>
        {error ? (
          <p style={{ marginTop: 16 }}>{error}</p>
        ) : items.length ? (
          <div className="list-grid">
            {items.map((item) => {
              const series = Array.isArray(item.series) ? item.series[0] : item.series;
              return series ? (
                <Link
                  className="list-card"
                  to="/app/novela/$slug"
                  params={{ slug: series.slug }}
                  key={series.id}
                >
                  <img
                    src={series.cover_url || "/assets/poster1.jpg"}
                    alt={`Capa de ${series.title}`}
                  />
                  <h2>{series.title}</h2>
                </Link>
              ) : null;
            })}
          </div>
        ) : (
          <p style={{ marginTop: 16 }}>
            Sua lista está vazia. Explore o catálogo para salvar uma história.
          </p>
        )}
      </div>
    </div>
  );
}
