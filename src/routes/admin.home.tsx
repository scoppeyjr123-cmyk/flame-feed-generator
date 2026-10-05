import { createFileRoute } from "@tanstack/react-router";
import { Home, Save } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AdminEmptyState, AdminPageHeader, AdminShell } from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminSettings } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/home")({
  beforeLoad: requireAdmin,
  loader: () => getAdminSettings(),
  head: () => ({ meta: [{ title: "Home | Feed Loves" }] }),
  component: AdminHomeSettings,
});

function AdminHomeSettings() {
  const { settings, sections } = Route.useLoaderData();
  const [platformName, setPlatformName] = useState(settings?.platform_name ?? "Feed Loves");
  const [logoUrl, setLogoUrl] = useState(settings?.logo_url ?? "");
  const [faviconUrl, setFaviconUrl] = useState(settings?.favicon_url ?? "");
  const [message, setMessage] = useState("");

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) return setMessage("Sua sessão expirou. Entre novamente.");
    const { error } = await createClient()
      .from("site_settings")
      .upsert(
        {
          id: true,
          platform_name: platformName,
          logo_url: logoUrl || null,
          favicon_url: faviconUrl || null,
          updated_by: user.id,
        },
        { onConflict: "id" },
      );
    if (error) return setMessage(error.message);
    setMessage("Configurações da home salvas.");
  }

  async function toggleSection(id: string, visible: boolean) {
    const { error } = await createClient()
      .from("home_sections")
      .update({ visible: !visible })
      .eq("id", id);
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  return (
    <AdminShell title="Home" description="Controle o que aparece no catálogo público.">
      <AdminPageHeader
        title="Home e catálogo"
        description="As alterações ficam centralizadas no Supabase para a próxima integração pública."
      />
      {message ? (
        <p className="admin-alert admin-success" role="status">
          {message}
        </p>
      ) : null}
      <form className="admin-card admin-panel" onSubmit={(event) => void saveSettings(event)}>
        <div className="admin-panel-title">
          <h3>Identidade pública</h3>
          <Save size={15} color="#ed75bf" />
        </div>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="home-platform-name">Nome da plataforma</label>
            <input
              id="home-platform-name"
              value={platformName}
              onChange={(event) => setPlatformName(event.target.value)}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="home-logo-url">URL do logo</label>
            <input
              id="home-logo-url"
              type="url"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="home-favicon-url">URL do favicon</label>
            <input
              id="home-favicon-url"
              type="url"
              value={faviconUrl}
              onChange={(event) => setFaviconUrl(event.target.value)}
            />
          </div>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button">
            Salvar configurações
          </button>
        </div>
      </form>
      <section className="admin-card admin-panel" style={{ marginTop: 16 }}>
        <div className="admin-panel-title">
          <h3>Seções da home</h3>
        </div>
        {sections.length ? (
          <div className="admin-list">
            {sections.map((section) => (
              <div className="admin-list-row" key={section.id}>
                <div className="admin-list-main">
                  <strong>{section.title}</strong>
                  <span>
                    {section.section_key} · ordem {section.sort_order}
                  </span>
                </div>
                <button
                  type="button"
                  className="admin-ghost-button"
                  onClick={() => void toggleSection(section.id, section.visible)}
                >
                  {section.visible ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="Nenhuma seção configurada"
            description="As seções serão criadas quando o catálogo público passar a consumir esta configuração."
            icon={Home}
          />
        )}
      </section>
    </AdminShell>
  );
}
