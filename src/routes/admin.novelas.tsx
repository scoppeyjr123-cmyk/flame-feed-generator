import { createFileRoute } from "@tanstack/react-router";
import { Film, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  AdminEmptyState,
  AdminPageHeader,
  AdminShell,
  AdminStatus,
} from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminSeries } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/novelas")({
  beforeLoad: requireAdmin,
  loader: () => getAdminSeries(),
  head: () => ({ meta: [{ title: "Novelas | Feed Loves" }] }),
  component: AdminSeries,
});

type SeriesForm = {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  genre: string;
  cover_url: string;
  banner_url: string;
  status: "draft" | "published" | "hidden";
  featured: boolean;
};
const emptyForm: SeriesForm = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  category: "",
  genre: "",
  cover_url: "",
  banner_url: "",
  status: "draft",
  featured: false,
};

function AdminSeries() {
  const { series, episodes } = Route.useLoaderData();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const episodeCount = new Map<string, number>();
  episodes.forEach((episode) =>
    episodeCount.set(episode.series_id, (episodeCount.get(episode.series_id) ?? 0) + 1),
  );

  async function createSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setMessage("Sua sessão expirou. Entre novamente.");
    const { error } = await supabase.from("series").insert({
      ...form,
      created_by: user.id,
      updated_by: user.id,
      published_at: form.status === "published" ? new Date().toISOString() : null,
    });
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  async function changeStatus(id: string, status: "draft" | "published" | "hidden") {
    const { error } = await createClient()
      .from("series")
      .update({ status, published_at: status === "published" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  async function removeSeries(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir esta novela e seus episódios?")) return;
    const { error } = await createClient().from("series").delete().eq("id", id);
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  return (
    <AdminShell title="Novelas" description="Catálogo editorial e publicação de histórias.">
      <AdminPageHeader
        title="Novelas"
        description="Crie, publique, oculte e organize o catálogo."
        action={
          <button
            type="button"
            className="admin-primary-button"
            onClick={() => setShowForm((value) => !value)}
          >
            <Plus size={15} /> Nova novela
          </button>
        }
      />
      {message ? (
        <p className="admin-alert" role="alert">
          {message}
        </p>
      ) : null}
      {showForm ? (
        <form
          className="admin-card admin-panel"
          onSubmit={(event) => void createSeries(event)}
          style={{ marginBottom: 16 }}
        >
          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="series-title">Título</label>
              <input
                id="series-title"
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="series-slug">Slug</label>
              <input
                id="series-slug"
                required
                value={form.slug}
                onChange={(event) =>
                  setForm({ ...form, slug: event.target.value.toLowerCase().replace(/\s+/g, "-") })
                }
              />
            </div>
            <div className="admin-field">
              <label htmlFor="series-category">Categoria</label>
              <input
                id="series-category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="series-genre">Gênero</label>
              <input
                id="series-genre"
                value={form.genre}
                onChange={(event) => setForm({ ...form, genre: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="series-cover">URL da capa</label>
              <input
                id="series-cover"
                type="url"
                value={form.cover_url}
                onChange={(event) => setForm({ ...form, cover_url: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="series-banner">URL do banner</label>
              <input
                id="series-banner"
                type="url"
                value={form.banner_url}
                onChange={(event) => setForm({ ...form, banner_url: event.target.value })}
              />
            </div>
            <div className="admin-field full">
              <label htmlFor="series-short">Descrição curta</label>
              <input
                id="series-short"
                value={form.short_description}
                onChange={(event) => setForm({ ...form, short_description: event.target.value })}
              />
            </div>
            <div className="admin-field full">
              <label htmlFor="series-description">Descrição completa</label>
              <textarea
                id="series-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="series-status">Status</label>
              <select
                id="series-status"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as typeof form.status })
                }
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="hidden">Oculto</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="series-featured">Destaque</label>
              <select
                id="series-featured"
                value={form.featured ? "yes" : "no"}
                onChange={(event) => setForm({ ...form, featured: event.target.value === "yes" })}
              >
                <option value="no">Não</option>
                <option value="yes">Sim</option>
              </select>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-ghost-button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="admin-primary-button">
              Salvar novela
            </button>
          </div>
        </form>
      ) : null}
      {series.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Novela</th>
                <th>Categoria</th>
                <th>Episódios</th>
                <th>Status</th>
                <th>Destaque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {series.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <br />
                    <span className="admin-muted">/{item.slug}</span>
                  </td>
                  <td>{item.genre || item.category || "—"}</td>
                  <td>{episodeCount.get(item.id) ?? 0}</td>
                  <td>
                    <AdminStatus status={item.status} />
                  </td>
                  <td>{item.featured ? "Sim" : "Não"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="admin-ghost-button"
                        onClick={() =>
                          void changeStatus(
                            item.id,
                            item.status === "published" ? "hidden" : "published",
                          )
                        }
                      >
                        {item.status === "published" ? "Ocultar" : "Publicar"}
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button"
                        aria-label={`Excluir ${item.title}`}
                        onClick={() => void removeSeries(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <AdminEmptyState
          title="Nenhuma novela cadastrada"
          description="Use o botão acima para criar a primeira novela do catálogo."
          icon={Film}
        />
      )}
    </AdminShell>
  );
}
