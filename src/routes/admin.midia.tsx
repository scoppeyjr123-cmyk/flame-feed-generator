import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

import { AdminEmptyState, AdminPageHeader, AdminShell } from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminMedia } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/midia")({
  beforeLoad: requireAdmin,
  loader: () => getAdminMedia(),
  head: () => ({ meta: [{ title: "Mídia | Feed Loves" }] }),
  component: AdminMedia,
});

function AdminMedia() {
  const { media } = Route.useLoaderData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState("image");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function uploadMedia(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setMessage("");
    setUploading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Sua sessão expirou. Entre novamente.");
      setUploading(false);
      return;
    }
    const path = `admin/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const upload = await supabase.storage
      .from("feedloves-media")
      .upload(
        path,
        file,
        file.type ? { upsert: false, contentType: file.type } : { upsert: false },
      );
    if (upload.error) {
      setMessage(upload.error.message);
      setUploading(false);
      return;
    }
    const { data: publicData } = supabase.storage.from("feedloves-media").getPublicUrl(path);
    const { error } = await supabase.from("media").insert({
      storage_path: path,
      public_url: publicData.publicUrl,
      media_type: mediaType,
      mime_type: file.type || null,
      size_bytes: file.size,
      created_by: user.id,
    });
    if (error) {
      await supabase.storage.from("feedloves-media").remove([path]);
      setMessage(error.message);
      setUploading(false);
      return;
    }
    window.location.reload();
  }

  async function removeMedia(item: (typeof media)[number]) {
    if (!window.confirm("Tem certeza que deseja remover esta mídia?")) return;
    const supabase = createClient();
    const storage = await supabase.storage.from("feedloves-media").remove([item.storage_path]);
    if (storage.error) return setMessage(storage.error.message);
    const { error } = await supabase.from("media").delete().eq("id", item.id);
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  return (
    <AdminShell title="Mídia" description="Arquivos públicos organizados no Storage do Supabase.">
      <AdminPageHeader
        title="Biblioteca de mídia"
        description="Capas, banners e thumbnails ficam no Storage; o banco guarda apenas metadados."
        action={
          <>
            <select
              className="admin-ghost-button"
              value={mediaType}
              onChange={(event) => setMediaType(event.target.value)}
              aria-label="Tipo da mídia"
            >
              <option value="image">Imagem</option>
              <option value="cover">Capa</option>
              <option value="banner">Banner</option>
              <option value="thumbnail">Thumbnail</option>
            </select>
            <button
              type="button"
              className="admin-primary-button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={15} /> {uploading ? "Enviando…" : "Enviar arquivo"}
            </button>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept="image/*,video/*"
              onChange={(event) => void uploadMedia(event)}
            />
          </>
        }
      />
      {message ? (
        <p className="admin-alert" role="alert">
          {message}
        </p>
      ) : null}
      {media.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
            gap: 14,
          }}
        >
          {media.map((item) => (
            <article className="admin-card" key={item.id} style={{ overflow: "hidden" }}>
              {item.public_url && item.mime_type?.startsWith("image/") ? (
                <img
                  src={item.public_url}
                  alt={item.alt_text || ""}
                  style={{ width: "100%", aspectRatio: "1.4", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    aspectRatio: "1.4",
                    background: "#1d0e1b",
                    color: "#ed75bf",
                  }}
                >
                  <ImageIcon size={28} />
                </div>
              )}
              <div style={{ padding: 12 }}>
                <strong
                  style={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 11,
                  }}
                >
                  {item.storage_path.split("/").pop()}
                </strong>
                <span className="admin-muted">
                  {item.media_type} · {item.mime_type || "tipo não informado"}
                </span>
                <button
                  type="button"
                  className="admin-ghost-button"
                  style={{ marginTop: 10 }}
                  onClick={() => void removeMedia(item)}
                >
                  <X size={13} /> Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="Nenhuma mídia enviada"
          description="Envie a primeira capa, banner ou thumbnail para o Storage do Supabase."
          icon={ImageIcon}
        />
      )}
    </AdminShell>
  );
}
