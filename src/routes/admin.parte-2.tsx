import { createFileRoute } from "@tanstack/react-router";
import { Save, Upload } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { AdminPageHeader, AdminShell } from "../components/admin/admin-shell";
import { createPartTwoBunnyAsset } from "../lib/admin/bunny-server-fns";
import { uploadFileToBunnyTus } from "../lib/bunny/tus-upload";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminSettings } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";
import type { Json } from "../lib/supabase/database.types";

export const Route = createFileRoute("/admin/parte-2")({
  beforeLoad: requireAdmin,
  loader: () => getAdminSettings(),
  head: () => ({ meta: [{ title: "Parte 2 | Feed Loves" }] }),
  component: AdminPartTwo,
});
const fallback = {
  headline: "Parte 2 — a história continua",
  subheadline: "Você chegou até aqui. Agora descubra o que acontece depois.",
  videoUrl: "https://player.vimeo.com/video/1231112345",
  posterUrl: "",
  videoProvider: "url",
  eyebrow: "CONTINUAÇÃO EXCLUSIVA",
  ctaText: "CONTINUE ASSISTINDO",
};
type EditorProps = {
  content: Record<string, unknown>;
  contentKey: string;
  label: string;
  path: string;
};

function PartTwoEditor({ content, contentKey, label, path }: EditorProps) {
  const isOffer = contentKey === "offer";
  const value =
    (content[contentKey] ?? (isOffer ? content["partTwo"] : null)) &&
    typeof (content[contentKey] ?? (isOffer ? content["partTwo"] : null)) === "object" &&
    !Array.isArray(content[contentKey] ?? (isOffer ? content["partTwo"] : null))
      ? ((content[contentKey] ?? content["partTwo"]) as Record<string, unknown>)
      : {};
  const [form, setForm] = useState({
    ...fallback,
    ...value,
    videoProvider: String(value["videoProvider"] || fallback.videoProvider),
  });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    if (!selected.type.startsWith("video/"))
      return setMessage("Selecione um arquivo de vídeo válido.");
    setFile(selected);
    setMessage("");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setUploadProgress(0);
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sua sessão expirou. Entre novamente.");
      let videoUrl = String(form.videoUrl || "").trim();
      if (file) {
        if (form.videoProvider === "bunny") {
          const bunny = await createPartTwoBunnyAsset({
            data: { title: isOffer ? "Feed Loves — oferta" : String(form.headline) },
          });
          await uploadFileToBunnyTus(file, bunny.upload, setUploadProgress);
          videoUrl = bunny.embedUrl;
        } else {
          const storagePath = `${path}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
          const upload = await supabase.storage
            .from("feedloves-media")
            .upload(storagePath, file, { upsert: false, contentType: file.type });
          if (upload.error) throw new Error(upload.error.message);
          videoUrl = supabase.storage.from("feedloves-media").getPublicUrl(storagePath)
            .data.publicUrl;
        }
      }
      const { data: latest, error: readError } = await supabase
        .from("site_settings")
        .select("content_settings")
        .eq("id", true)
        .maybeSingle();
      if (readError) throw new Error(readError.message);
      const latestContent =
        latest?.content_settings &&
        typeof latest.content_settings === "object" &&
        !Array.isArray(latest.content_settings)
          ? (latest.content_settings as Record<string, unknown>)
          : {};
      const updatedContent = {
        ...latestContent,
        [contentKey]: { ...form, videoUrl, videoProvider: form.videoProvider },
      };
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          { id: true, content_settings: updatedContent as Json, updated_by: auth.user.id },
          { onConflict: "id" },
        );
      if (error) throw new Error(error.message);
      setForm((current) => ({ ...current, videoUrl }));
      setFile(null);
      setMessage(`${label} salva com sucesso.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="admin-card admin-panel" style={{ marginBottom: 24 }}>
      <h2 style={{ marginTop: 0 }}>{label}</h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
        URL pública: <code>{path}</code>
      </p>
      {message ? (
        <p
          className={`admin-alert ${message.includes("sucesso") ? "admin-success" : ""}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
      <form onSubmit={(event) => void save(event)}>
        <div className="admin-form-grid">
          {!isOffer ? (
            <>
              <div className="admin-field full">
                <label>Etiqueta superior</label>
                <input
                  value={String(form.eyebrow)}
                  onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                />
              </div>
              <div className="admin-field full">
                <label>Headline</label>
                <input
                  required
                  value={String(form.headline)}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                />
              </div>
              <div className="admin-field full">
                <label>Subheadline</label>
                <textarea
                  value={String(form.subheadline)}
                  onChange={(e) => setForm({ ...form, subheadline: e.target.value })}
                />
              </div>
              <div className="admin-field">
                <label>Fonte do vídeo</label>
                <select
                  value={String(form.videoProvider)}
                  onChange={(e) => setForm({ ...form, videoProvider: e.target.value })}
                >
                  <option value="url">URL externa</option>
                  <option value="bunny">Bunny Stream</option>
                </select>
              </div>
              <div className="admin-field">
                <label>Texto do CTA</label>
                <input
                  value={String(form.ctaText)}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div className="admin-field full">
              <label>Fonte do vídeo</label>
              <select
                value={String(form.videoProvider)}
                onChange={(e) => setForm({ ...form, videoProvider: e.target.value })}
              >
                <option value="url">URL externa</option>
                <option value="bunny">Bunny Stream</option>
              </select>
            </div>
          )}
          <div className="admin-field full">
            <label>URL do vídeo</label>
            <input
              type="url"
              value={String(form.videoUrl)}
              placeholder="https://..."
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            />
            <small>
              Use URL direta ou player compatível. Links de mensagens do Telegram não são vídeos
              reproduzíveis.
            </small>
          </div>
          <div className="admin-field full">
            <label>Ou enviar arquivo</label>
            <input type="file" accept="video/*,.mkv,.mov,.avi,.webm" onChange={selectFile} />
            <small>
              {file ? (
                <>
                  <Upload size={13} style={{ display: "inline", marginRight: 4 }} />
                  {file.name} será enviado para{" "}
                  {form.videoProvider === "bunny" ? "o Bunny Stream" : "o Storage público"}.
                </>
              ) : form.videoProvider === "bunny" ? (
                "Arquivos grandes serão enviados diretamente ao Bunny Stream."
              ) : (
                "O upload substitui a URL atual."
              )}
            </small>
            {saving && file && form.videoProvider === "bunny" ? (
              <>
                <progress value={uploadProgress} max={100} style={{ width: "100%" }} />
                <small>Enviando… {uploadProgress}%</small>
              </>
            ) : null}
          </div>
          <div className="admin-field full">
            <label>URL da capa/poster</label>
            <input
              type="url"
              value={String(form.posterUrl)}
              placeholder="https://..."
              onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
            />
          </div>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button" disabled={saving}>
            <Save size={14} /> {saving ? "Salvando…" : `Salvar ${label}`}
          </button>
        </div>
      </form>
    </section>
  );
}

function AdminPartTwo() {
  const { settings } = Route.useLoaderData();
  const content =
    settings?.content_settings &&
    typeof settings.content_settings === "object" &&
    !Array.isArray(settings.content_settings)
      ? (settings.content_settings as Record<string, unknown>)
      : {};
  return (
    <AdminShell
      title="Parte 2"
      description="Edite as três páginas de continuação e o vídeo da oferta."
    >
      <AdminPageHeader
        title="Personalização das páginas Parte 2"
        description="Cada versão possui vídeo independente. Use Bunny Stream ou URL externa."
      />
      <PartTwoEditor
        content={content}
        contentKey="partTwo"
        label="Parte 2 principal"
        path="/parte-2"
      />
      <PartTwoEditor
        content={content}
        contentKey="partTwoCopy1"
        label="Parte 2 — versão 1"
        path="/parte-2-1"
      />
      <PartTwoEditor
        content={content}
        contentKey="partTwoCopy2"
        label="Parte 2 — versão 2"
        path="/parte-2-2"
      />
      <PartTwoEditor
        content={content}
        contentKey="offer"
        label="Vídeo da página Oferta"
        path="/oferta"
      />
    </AdminShell>
  );
}
