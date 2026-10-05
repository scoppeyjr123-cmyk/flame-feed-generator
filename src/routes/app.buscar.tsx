import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { getPublishedCatalog } from "../lib/public/server-fns";

export const Route = createFileRoute("/app/buscar")({
  loader: () => getPublishedCatalog(),
  component: SearchPage,
});

function SearchPage() {
  const { series } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return series;
    return series.filter((item) =>
      [item.title, item.category, item.genre, item.short_description]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalized)),
    );
  }, [query, series]);

  return (
    <div className="app-search">
      <style>{`.app-search h1{font:600 36px "Playfair Display",Georgia,serif}.app-search input{width:100%;margin:20px 0 26px;border:1px solid #55304d;border-radius:12px;background:#190d18;color:#fff;padding:15px 16px;outline:none}.app-search input:focus{border-color:#f45db2;box-shadow:0 0 0 3px #f45db22b}.search-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.search-card{min-width:0}.search-card img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:10px;border:1px solid #42243c}.search-card h2{margin-top:8px;font-size:13px}.search-card p{margin-top:3px;color:#a992a4;font-size:10px}@media(max-width:800px){.search-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`}</style>
      <p className="app-kicker">Catálogo Feed Loves</p>
      <h1>Encontre sua próxima história</h1>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar novelas, doramas e séries turcas"
        aria-label="Buscar no catálogo"
      />
      {results.length ? (
        <div className="search-grid">
          {results.map((item) => (
            <Link
              className="search-card"
              to="/app/novela/$slug"
              params={{ slug: item.slug }}
              key={item.id}
            >
              <img
                src={item.cover_url || item.thumbnail_url || "/assets/poster1.jpg"}
                alt={`Capa de ${item.title}`}
              />
              <h2>{item.title}</h2>
              <p>{item.category || item.genre || "Feed Loves"}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>Nenhum resultado encontrado.</p>
      )}
    </div>
  );
}
