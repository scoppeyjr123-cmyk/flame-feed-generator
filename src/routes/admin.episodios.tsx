import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Copy, ListVideo, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  AdminEmptyState,
  AdminPageHeader,
  AdminShell,
  AdminStatus,
} from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminPlans, getAdminSeries } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/episodios")({
  beforeLoad: requireAdmin,
  loader: async () => {
    const [seriesData, plansData] = await Promise.all([getAdminSeries(), getAdminPlans()]);
    return { ...seriesData, ...plansData };
  },
  head: () => ({ meta: [{ title: "Episódios | Feed Loves" }] }),
  component: AdminEpisodes,
});

type EpisodeForm = {
  series_id: string;
  episode_number: number;
  title: string;
  description: string;
  video_url: string;
  video_provider: string;
  thumbnail_url: string;
  duration_seconds: string;
  scheduled_at: string;
  status: "draft" | "published" | "scheduled" | "hidden";
  access_type: "free" | "subscriber" | "specific_plan";
  plan_id: string;
};
const emptyEpisode: EpisodeForm = {
  series_id: "",
  episode_number: 1,
  title: "",
  description: "",
  video_url: "",
  video_provider: "vimeo",
  thumbnail_url: "",
  duration_seconds: "",
  scheduled_at: "",
  status: "draft",
  access_type: "subscriber",
  plan_id: "",
};

function AdminEpisodes() {
  const { series, episodes, plans } = Route.useLoaderData();
  const router = useRouter();
  const [form, setForm] = useState<EpisodeForm>({
    ...emptyEpisode,
    series_id: series[0]?.id ?? "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const seriesMap = new Map(series.map((item) => [item.id, item.title]));

  function startEdit(episode: (typeof episodes)[number]) {
    setEditingId(episode.id);
    setForm({
      series_id: episode.series_id,
      episode_number: episode.episode_number,
      title: episode.title,
      description: episode.description ?? "",
      video_url: episode.video_url ?? "",
      video_provider: episode.video_provider ?? "",
      thumbnail_url: episode.thumbnail_url ?? "",
      duration_seconds: episode.duration_seconds ? String(episode.duration_seconds) : "",
      scheduled_at: episode.scheduled_at
        ? new Date(episode.scheduled_at).toISOString().slice(0, 16)
        : "",
      status: episode.status,
      access_type: episode.access_type,
      plan_id: episode.plan_id ?? "",
    });
    setMessage("");
    setShowForm(true);
  }

  async function saveEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!form.series_id) return setMessage("Cadastre uma novela antes de adicionar episódios.");
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) return setMessage("Sua sessão expirou. Entre novamente.");
    const payload = {
      series_id: form.series_id,
      episode_number: Number(form.episode_number),
      title: form.title,
      description: form.description || null,
      video_url: form.video_url || null,
      video_provider: form.video_provider || null,
      thumbnail_url: form.thumbnail_url || null,
      duration_seconds: form.duration_seconds ? Number(form.duration_seconds) : null,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      status: form.status,
      access_type: form.access_type,
      plan_id: form.access_type === "specific_plan" ? form.plan_id || null : null,
      sort_order: Number(form.episode_number),
    };
    const { error } = editingId
      ? await createClient().from("episodes").update(payload).eq("id", editingId)
      : await createClient().from("episodes").insert(payload);
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  async function changeStatus(id: string, status: "draft" | "published" | "scheduled" | "hidden") {
    const { error } = await createClient().from("episodes").update({ status }).eq("id", id);
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  async function removeEpisode(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir este episódio?")) return;
    const { error } = await createClient().from("episodes").delete().eq("id", id);
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  async function duplicateEpisode(episode: (typeof episodes)[number]) {
    if (!window.confirm("Duplicar este episódio?\n\nSerá criada uma cópia como rascunho e o vídeo não será duplicado.")) return;
    setMessage("");
    const siblings = episodes.filter((item) => item.series_id === episode.series_id);
    const nextNumber = Math.max(0, ...siblings.map((item) => item.episode_number)) + 1;
    const nextNumberLabel = String(nextNumber).padStart(2, "0");
    const titleWithoutEpisodePrefix = episode.title.replace(/^EP\s*\d+\s*:\s*/i, "");
    const duplicatedTitle = `EP${nextNumberLabel}: ${titleWithoutEpisodePrefix}`;
    const { data, error } = await createClient()
      .from("episodes")
      .insert({
        series_id: episode.series_id,
        episode_number: nextNumber,
        title: duplicatedTitle,
        description: episode.description,
        video_url: null,
        video_provider: null,
        thumbnail_url: episode.thumbnail_url,
        duration_seconds: null,
        scheduled_at: null,
        status: "draft",
        access_type: episode.access_type,
        plan_id: episode.access_type === "specific_plan" ? episode.plan_id : null,
        sort_order: nextNumber,
      })
      .select("*")
      .single();
    if (error || !data) {
      setMessage(error?.message || "Não foi possível duplicar o episódio.");
      return;
    }
    setMessage("Episódio duplicado com sucesso. A cópia foi criada como rascunho.");
    startEdit(data);
    await router.invalidate();
  }

  return (
    <AdminShell title="Episódios" description="Vídeos, acesso e publicação por novela.">
      <AdminPageHeader
        title="Episódios"
        description="Cadastre o vídeo, defina o acesso e publique quando estiver pronto."
        action={
          <button
            type="button"
            className="admin-primary-button"
            onClick={() => {
              setEditingId(null);
              setForm({ ...emptyEpisode, series_id: series[0]?.id ?? "" });
              setShowForm((value) => !value);
            }}
          >
            <Plus size={15} /> Novo episódio
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
          onSubmit={(event) => void saveEpisode(event)}
          style={{ marginBottom: 16 }}
        >
          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="episode-series">Novela</label>
              <select
                id="episode-series"
                required
                value={form.series_id}
                onChange={(event) => setForm({ ...form, series_id: event.target.value })}
              >
                <option value="">Selecione</option>
                {series.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="episode-number">Número</label>
              <input
                id="episode-number"
                type="number"
                min="1"
                required
                value={form.episode_number}
                onChange={(event) =>
                  setForm({ ...form, episode_number: Number(event.target.value) })
                }
              />
            </div>
            <div className="admin-field">
              <label htmlFor="episode-title">Título</label>
              <input
                id="episode-title"
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="episode-provider">Provider do vídeo</label>
              <input
                id="episode-provider"
                value={form.video_provider}
                onChange={(event) => setForm({ ...form, video_provider: event.target.value })}
              />
            </div>
            <div className="admin-field full">
              <label htmlFor="episode-video">URL do vídeo</label>
              <input
                id="episode-video"
                type="url"
                value={form.video_url}
                onChange={(event) => setForm({ ...form, video_url: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="episode-thumb">URL da thumbnail</label>
              <input
                id="episode-thumb"
                type="url"
                value={form.thumbnail_url}
                onChange={(event) => setForm({ ...form, thumbnail_url: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="episode-duration">Duração em segundos</label>
              <input
                id="episode-duration"
                type="number"
                min="0"
                value={form.duration_seconds}
                onChange={(event) => setForm({ ...form, duration_seconds: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="episode-status">Status</label>
              <select
                id="episode-status"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as EpisodeForm["status"] })
                }
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="scheduled">Agendado</option>
                <option value="hidden">Oculto</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="episode-scheduled-at">Publicar em</label>
              <input
                id="episode-scheduled-at"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(event) => setForm({ ...form, scheduled_at: event.target.value })}
                disabled={form.status !== "scheduled"}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="episode-access">Tipo de acesso</label>
              <select
                id="episode-access"
                value={form.access_type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    access_type: event.target.value as EpisodeForm["access_type"],
                  })
                }
              >
                <option value="free">Grátis</option>
                <option value="subscriber">Assinantes</option>
                <option value="specific_plan">Plano específico</option>
              </select>
            </div>
            {form.access_type === "specific_plan" ? (
              <div className="admin-field">
                <label htmlFor="episode-plan">Plano permitido</label>
                <select
                  id="episode-plan"
                  required
                  value={form.plan_id}
                  onChange={(event) => setForm({ ...form, plan_id: event.target.value })}
                >
                  <option value="">Selecione</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="admin-field full">
              <label htmlFor="episode-description">Descrição</label>
              <textarea
                id="episode-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-ghost-button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="admin-primary-button">
              {editingId ? "Salvar alterações" : "Salvar episódio"}
            </button>
          </div>
        </form>
      ) : null}
      {episodes.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Episódio</th>
                <th>Novela</th>
                <th>Acesso</th>
                <th>Status</th>
                <th>Vídeo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {episodes.map((episode) => (
                <tr key={episode.id}>
                  <td>
                    <strong>
                      #{episode.episode_number} · {episode.title}
                    </strong>
                  </td>
                  <td>{seriesMap.get(episode.series_id) || "—"}</td>
                  <td>{episode.access_type}</td>
                  <td>
                    <AdminStatus status={episode.status} />
                  </td>
                  <td>{episode.video_url ? "Configurado" : "Não configurado"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="admin-ghost-button"
                        onClick={() => startEdit(episode)}
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      <button
                        type="button"
                        className="admin-ghost-button"
                        onClick={() => void duplicateEpisode(episode)}
                      >
                        <Copy size={13} /> Duplicar
                      </button>
                      <button
                        type="button"
                        className="admin-ghost-button"
                        onClick={() =>
                          void changeStatus(
                            episode.id,
                            episode.status === "published" ? "hidden" : "published",
                          )
                        }
                      >
                        {episode.status === "published" ? "Ocultar" : "Publicar"}
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button"
                        aria-label={`Excluir ${episode.title}`}
                        onClick={() => void removeEpisode(episode.id)}
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
          title="Nenhum episódio cadastrado"
          description="Crie uma novela e adicione o primeiro vídeo pelo botão acima."
          icon={ListVideo}
        />
      )}
    </AdminShell>
  );
}
