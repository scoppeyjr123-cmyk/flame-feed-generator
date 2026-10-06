import { createFileRoute } from "@tanstack/react-router";
import { ListVideo, Pencil, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  AdminEmptyState,
  AdminPageHeader,
  AdminShell,
  AdminStatus,
} from "../components/admin/admin-shell";
import {
  createEpisodeBunnyAsset,
  markEpisodeBunnyUploadComplete,
  refreshEpisodeBunnyStatus,
} from "../lib/admin/bunny-server-fns";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminPlans, getAdminSeries } from "../lib/admin/server-fns";
import { uploadFileToBunnyTus } from "../lib/bunny/tus-upload";
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
  thumbnail_url: string;
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
  thumbnail_url: "",
  scheduled_at: "",
  status: "draft",
  access_type: "subscriber",
  plan_id: "",
};

function videoStatusLabel(status?: string | null, progress?: number | null) {
  if (!status || status === "none") return "Não enviado";
  if (status === "uploading") return "Enviando";
  if (status === "processing") return `Processando ${progress ?? 0}%`;
  if (status === "ready") return "Pronto";
  if (status === "error") return "Erro";
  return "Criado";
}

function AdminEpisodes() {
  const { series, episodes, plans } = Route.useLoaderData();
  const [form, setForm] = useState<EpisodeForm>({
    ...emptyEpisode,
    series_id: series[0]?.id ?? "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const seriesMap = new Map(series.map((item) => [item.id, item.title]));

  function startEdit(episode: (typeof episodes)[number]) {
    setEditingId(episode.id);
    setVideoFile(null);
    setUploadProgress(0);
    setForm({
      series_id: episode.series_id,
      episode_number: episode.episode_number,
      title: episode.title,
      description: episode.description ?? "",
      thumbnail_url: episode.thumbnail_url ?? "",
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

  async function uploadEpisodeVideo(episodeId: string, title: string, file: File) {
    const session = await createEpisodeBunnyAsset({ data: { episodeId, title } });
    await uploadFileToBunnyTus(file, session.upload, setUploadProgress);
    await markEpisodeBunnyUploadComplete({ data: { episodeId } });
  }

  async function saveEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!form.series_id) return setMessage("Cadastre uma novela antes de adicionar episódios.");

    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) return setMessage("Sua sessão expirou. Entre novamente.");

    setIsSaving(true);
    try {
      const payload = {
        series_id: form.series_id,
        episode_number: Number(form.episode_number),
        title: form.title,
        description: form.description || null,
        thumbnail_url: form.thumbnail_url || null,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        status: form.status,
        access_type: form.access_type,
        plan_id: form.access_type === "specific_plan" ? form.plan_id || null : null,
        sort_order: Number(form.episode_number),
      };

      let episodeId = editingId;
      if (editingId) {
        const { error } = await createClient().from("episodes").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await createClient()
          .from("episodes")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        episodeId = data.id;
      }

      if (videoFile && episodeId) {
        const existing = episodes.find((episode) => episode.id === episodeId);
        if (existing?.bunny_video_id) {
          throw new Error("Este episódio já possui um vídeo no Bunny. A substituição será adicionada em uma etapa separada.");
        }
        await uploadEpisodeVideo(episodeId, form.title, videoFile);
      }

      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o episódio.");
    } finally {
      setIsSaving(false);
    }
  }

  async function syncVideoStatus(id: string) {
    setMessage("");
    try {
      await refreshEpisodeBunnyStatus({ data: { episodeId: id } });
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar o status.");
    }
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

  return (
    <AdminShell title="Episódios" description="Vídeos, acesso e publicação por novela.">
      <AdminPageHeader
        title="Episódios"
        description="Envie o vídeo diretamente ao Bunny Stream, defina o acesso e publique quando estiver pronto."
        action={
          <button
            type="button"
            className="admin-primary-button"
            onClick={() => {
              setEditingId(null);
              setVideoFile(null);
              setUploadProgress(0);
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
              <label htmlFor="episode-thumb">URL da thumbnail</label>
              <input
                id="episode-thumb"
                type="url"
                value={form.thumbnail_url}
                onChange={(event) => setForm({ ...form, thumbnail_url: event.target.value })}
              />
            </div>

            <div className="admin-field full">
              <label htmlFor="episode-video-file">Arquivo do episódio</label>
              <input
                id="episode-video-file"
                type="file"
                accept="video/*,.mkv,.mov,.avi,.webm"
                onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
              />
              <small>
                O vídeo vai direto do navegador para o Bunny Stream. A chave privada não é exposta.
              </small>
              {videoFile ? (
                <small>
                  <Upload size={13} style={{ display: "inline", marginRight: 4 }} />
                  {videoFile.name} · {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                </small>
              ) : null}
              {isSaving && videoFile ? (
                <div>
                  <progress value={uploadProgress} max={100} style={{ width: "100%" }} />
                  <small>{uploadProgress < 100 ? `Enviando... ${uploadProgress}%` : "Upload concluído. Processando..."}</small>
                </div>
              ) : null}
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
            <button
              type="button"
              className="admin-ghost-button"
              onClick={() => setShowForm(false)}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button type="submit" className="admin-primary-button" disabled={isSaving}>
              {isSaving
                ? videoFile
                  ? `Enviando vídeo... ${uploadProgress}%`
                  : "Salvando..."
                : editingId
                  ? "Salvar alterações"
                  : "Salvar episódio"}
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
                    {episode.video_error ? <small>{episode.video_error}</small> : null}
                  </td>
                  <td>{seriesMap.get(episode.series_id) || "—"}</td>
                  <td>{episode.access_type}</td>
                  <td>
                    <AdminStatus status={episode.status} />
                  </td>
                  <td>
                    <strong>
                      {videoStatusLabel(
                        episode.video_processing_status,
                        episode.video_encode_progress,
                      )}
                    </strong>
                    {episode.bunny_video_id ? (
                      <small style={{ display: "block" }}>Bunny conectado</small>
                    ) : null}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="admin-ghost-button"
                        onClick={() => startEdit(episode)}
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      {episode.bunny_video_id ? (
                        <button
                          type="button"
                          className="admin-ghost-button"
                          onClick={() => void syncVideoStatus(episode.id)}
                        >
                          <RefreshCw size={13} /> Atualizar vídeo
                        </button>
                      ) : null}
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
