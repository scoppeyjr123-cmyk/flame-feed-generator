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
  offerHeadline: "ASSISTA MAIS DE\n7.000 DRAMAS\nSEM LIMITES",
  catalogSubtitle: "7.000 títulos publicados para você descobrir.",
  subheadline: "Você chegou até aqui. Agora descubra o que acontece depois.",
  videoUrl: "https://player.vimeo.com/video/1231112345",
  posterUrl: "",
  videoProvider: "url",
  eyebrow: "CONTINUAÇÃO EXCLUSIVA",
  ctaText: "CONTINUE ASSISTINDO",
  checkoutWeeklyUrl: "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=XTSUYU1",
  checkoutMonthlyUrl: "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=ZVZ9FV7",
  checkoutAnnualUrl: "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=WH555VJ",
  priceWeekly: "4.90",
  priceMonthly: "9.90",
  priceAnnual: "29.90",
  currency: "EUR",
};
type EditorProps = {
  content: Record<string, unknown>;
  contentKey: string;
  label: string;
  path: string;
};

function PartTwoEditor({ content, contentKey, label, path }: EditorProps) {
  const isOffer = contentKey === "offer" || contentKey === "offer2" || contentKey === "offer3";
  const fallbackOffer =
    contentKey === "offer3"
      ? (content["offer2"] ?? content["offer"] ?? content["partTwo"])
      : contentKey === "offer2"
        ? (content["offer"] ?? content["partTwo"])
        : content["partTwo"];
  const rawValue = content[contentKey] ?? (isOffer ? fallbackOffer : null);
  const value =
    rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)
      ? (rawValue as Record<string, unknown>)
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
            data: {
              title: isOffer
                ? contentKey === "offer3"
                  ? "Feed Loves — oferta 3"
                  : contentKey === "offer2"
                    ? "Feed Loves — oferta 2"
                    : "Feed Loves — oferta"
                : String(form.headline),
            },
          });
          await uploadFileToBunnyTus(file, bunny.upload, setUploadProgress);
          videoUrl = bunny.embedUrl;
        } else {
          const sanitizedPath = path.replace(/^\/+/, "");
          const storagePath = `${sanitizedPath}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
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
            <>
              <div className="admin-field full">
                <label htmlFor={`${contentKey}-headline`}>Headline da {label}</label>
                <textarea
                  id={`${contentKey}-headline`}
                  rows={3}
                  maxLength={180}
                  value={String(form.offerHeadline || "")}
                  placeholder={"ASSISTA MAIS DE\n7.000 DRAMAS\nSEM LIMITES"}
                  onChange={(e) => setForm({ ...form, offerHeadline: e.target.value })}
                />
                <small>
                  Use até três linhas. Deixe em branco para mostrar a contagem automática de títulos
                  publicados.
                </small>
              </div>
              <div className="admin-field full">
                <label htmlFor={`${contentKey}-catalog-subtitle`}>Texto abaixo de Explore o Catálogo</label>
                <input
                  id={`${contentKey}-catalog-subtitle`}
                  maxLength={140}
                  value={String(form.catalogSubtitle || "")}
                  onChange={(e) => setForm({ ...form, catalogSubtitle: e.target.value })}
                />
              </div>
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
            </>
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
          {contentKey === "offer2" ? (
            <>
              <div
                className="admin-field full"
                style={{
                  marginTop: 10,
                  paddingTop: 16,
                  borderTop: "1px solid #3a2335",
                }}
              >
                <strong style={{ fontSize: 13, color: "#fff" }}>
                  Links de Checkout e Preços (/oferta-2)
                </strong>
                <small style={{ color: "#a8889d" }}>
                  Configure os links e valores específicos da plataforma parceira (Applyfy, etc.).
                </small>
              </div>
              <div className="admin-field">
                <label>Preço Semanal</label>
                <input
                  value={String(form.priceWeekly ?? "4.90")}
                  onChange={(e) => setForm({ ...form, priceWeekly: e.target.value })}
                  placeholder="4.90"
                />
              </div>
              <div className="admin-field">
                <label>URL Checkout Semanal (Applyfy)</label>
                <input
                  type="url"
                  value={String(form.checkoutWeeklyUrl ?? "")}
                  onChange={(e) => setForm({ ...form, checkoutWeeklyUrl: e.target.value })}
                  placeholder="https://checkout.applyfy.com.br/..."
                />
              </div>
              <div className="admin-field">
                <label>Preço Mensal</label>
                <input
                  value={String(form.priceMonthly ?? "9.90")}
                  onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })}
                  placeholder="9.90"
                />
              </div>
              <div className="admin-field">
                <label>URL Checkout Mensal (Applyfy)</label>
                <input
                  type="url"
                  value={String(form.checkoutMonthlyUrl ?? "")}
                  onChange={(e) => setForm({ ...form, checkoutMonthlyUrl: e.target.value })}
                  placeholder="https://checkout.applyfy.com.br/..."
                />
              </div>
              <div className="admin-field">
                <label>Preço Anual</label>
                <input
                  value={String(form.priceAnnual ?? "39.90")}
                  onChange={(e) => setForm({ ...form, priceAnnual: e.target.value })}
                  placeholder="39.90"
                />
              </div>
              <div className="admin-field">
                <label>URL Checkout Anual (Applyfy)</label>
                <input
                  type="url"
                  value={String(form.checkoutAnnualUrl ?? "")}
                  onChange={(e) => setForm({ ...form, checkoutAnnualUrl: e.target.value })}
                  placeholder="https://checkout.applyfy.com.br/..."
                />
              </div>
              <div className="admin-field full">
                <label>Moeda</label>
                <select
                  value={String(form.currency ?? "EUR")}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  <option value="EUR">Euro (€ - EUR)</option>
                  <option value="BRL">Real (R$ - BRL)</option>
                  <option value="USD">Dólar ($ - USD)</option>
                </select>
              </div>
            </>
          ) : null}
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
      title="Páginas & Ofertas"
      description="Edite as páginas de continuação (Parte 2) e as páginas de oferta (/oferta, /oferta-2 e /oferta-3)."
    >
      <AdminPageHeader
        title="Personalização das páginas de Oferta e Parte 2"
        description="Cada versão possui vídeo independente e textos customizáveis. Use Bunny Stream, upload direto ou URL externa."
      />
      <PartTwoEditor content={content} contentKey="offer" label="Página Oferta" path="/oferta" />
      <PartTwoEditor
        content={content}
        contentKey="offer2"
        label="Página Oferta 2"
        path="/oferta-2"
      />
      <PartTwoEditor
        content={content}
        contentKey="offer3"
        label="Página Oferta 3 (Vídeo 9:16)"
        path="/oferta-3"
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
    </AdminShell>
  );
}
