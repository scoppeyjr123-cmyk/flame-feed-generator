import { createFileRoute } from "@tanstack/react-router";
import { Save, Upload } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { AdminPageHeader, AdminShell } from "../components/admin/admin-shell";
import { createPartTwoBunnyAsset } from "../lib/admin/bunny-server-fns";
import { uploadFileToBunnyTus } from "../lib/bunny/tus-upload";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminSettings } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";

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

function AdminPartTwo() {
  const { settings } = Route.useLoaderData();
  const content = settings?.content_settings && typeof settings.content_settings === "object" && !Array.isArray(settings.content_settings) ? settings.content_settings as Record<string, unknown> : {};
  const value = content["partTwo"] && typeof content["partTwo"] === "object" && !Array.isArray(content["partTwo"]) ? content["partTwo"] as Record<string, unknown> : {};
  const [form, setForm] = useState({ ...fallback, ...value, videoProvider: String(value["videoProvider"] || fallback.videoProvider) });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function uploadVideo(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    if (!selected.type.startsWith("video/")) return setMessage("Selecione um arquivo de vídeo válido.");
    setFile(selected);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sua sessão expirou. Entre novamente.");
      let videoUrl = String(form.videoUrl || "").trim();
      if (file) {
        if (form.videoProvider === "bunny") {
          const bunny = await createPartTwoBunnyAsset({ data: { title: String(form.headline) } });
          await uploadFileToBunnyTus(file, bunny.upload, setUploadProgress);
          videoUrl = bunny.embedUrl;
        } else {
          const path = `part-2/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
          const upload = await supabase.storage.from("feedloves-media").upload(path, file, { upsert: false, contentType: file.type });
          if (upload.error) throw new Error(upload.error.message);
          videoUrl = supabase.storage.from("feedloves-media").getPublicUrl(path).data.publicUrl;
        }
      }
      const updatedContent = { ...content, partTwo: { ...form, videoUrl, videoProvider: form.videoProvider } };
      const { error } = await supabase.from("site_settings").upsert({ id: true, content_settings: updatedContent, updated_by: auth.user.id }, { onConflict: "id" });
      if (error) throw new Error(error.message);
      setForm((current) => ({ ...current, videoUrl })); setFile(null); setMessage("Página da Parte 2 salva com sucesso.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar."); }
    finally { setSaving(false); }
  }

  return <AdminShell title="Parte 2" description="Edite a página pública de continuação e o vídeo exibido.">
    <AdminPageHeader title="Personalização da Parte 2" description="As alterações aparecem em /parte-2 depois de salvar." />
    {message ? <p className={`admin-alert ${message.includes("sucesso") ? "admin-success" : ""}`} role="status">{message}</p> : null}
    <form className="admin-card admin-panel" onSubmit={(event) => void save(event)}>
      <div className="admin-form-grid">
        <div className="admin-field full"><label htmlFor="part2-eyebrow">Etiqueta superior</label><input id="part2-eyebrow" value={String(form.eyebrow)} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} /></div>
        <div className="admin-field full"><label htmlFor="part2-headline">Headline</label><input id="part2-headline" required value={String(form.headline)} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
        <div className="admin-field full"><label htmlFor="part2-subheadline">Subheadline</label><textarea id="part2-subheadline" value={String(form.subheadline)} onChange={(e) => setForm({ ...form, subheadline: e.target.value })} /></div>
        <div className="admin-field"><label htmlFor="part2-provider">Fonte do vídeo</label><select id="part2-provider" value={String(form.videoProvider)} onChange={(e) => setForm({ ...form, videoProvider: e.target.value })}><option value="url">URL externa</option><option value="bunny">Bunny Stream</option></select></div>
        <div className="admin-field"><label htmlFor="part2-cta">Texto do CTA</label><input id="part2-cta" value={String(form.ctaText)} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} /></div>
        <div className="admin-field full"><label htmlFor="part2-video-url">URL do vídeo</label><input id="part2-video-url" type="url" value={String(form.videoUrl)} placeholder="https://..." onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} /><small>Use uma URL direta ou uma URL de player compatível, como Vimeo/Bunny. Link de mensagem do Telegram não funciona como vídeo.</small></div>
        <div className="admin-field full"><label htmlFor="part2-video-file">Ou enviar arquivo</label><input id="part2-video-file" type="file" accept="video/*,.mkv,.mov,.avi,.webm" onChange={(e) => void uploadVideo(e)} /><small>{file ? <><Upload size={13} style={{ display: "inline", marginRight: 4 }} />{file.name} será enviado para {form.videoProvider === "bunny" ? "o Bunny Stream" : "o Storage público"}.</> : form.videoProvider === "bunny" ? "Arquivos grandes serão enviados diretamente ao Bunny Stream, sem o limite do Storage do Supabase." : "O upload substitui a URL atual e gera uma URL pública."}</small>{saving && file && form.videoProvider === "bunny" ? <><progress value={uploadProgress} max={100} style={{ width: "100%" }} /><small>Enviando… {uploadProgress}%</small></> : null}</div>
        <div className="admin-field full"><label htmlFor="part2-poster">URL da capa/poster</label><input id="part2-poster" type="url" value={String(form.posterUrl)} placeholder="https://..." onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} /></div>
      </div>
      <div className="admin-form-actions"><button type="submit" className="admin-primary-button" disabled={saving}><Save size={14} /> {saving ? "Salvando…" : "Salvar Parte 2"}</button></div>
    </form>
  </AdminShell>;
}
