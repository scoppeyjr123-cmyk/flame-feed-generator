import { createFileRoute } from "@tanstack/react-router";
import { Save, Settings } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AdminEmptyState, AdminPageHeader, AdminShell } from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminSettings } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/configuracoes")({
  beforeLoad: requireAdmin,
  loader: () => getAdminSettings(),
  head: () => ({ meta: [{ title: "Configurações | Feed Loves" }] }),
  component: AdminSettings,
});

function jsonText(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function AdminSettings() {
  const { settings } = Route.useLoaderData();
  const [subscriptionSettings, setSubscriptionSettings] = useState(
    jsonText(settings?.subscription_settings),
  );
  const [mediaSettings, setMediaSettings] = useState(jsonText(settings?.media_settings));
  const [contentSettings, setContentSettings] = useState(jsonText(settings?.content_settings));
  const [publicParameters, setPublicParameters] = useState(jsonText(settings?.public_parameters));
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const parse = (value: string) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };
    const parsed = [subscriptionSettings, mediaSettings, contentSettings, publicParameters].map(
      parse,
    );
    if (parsed.some((value) => value === null))
      return setMessage("Revise os blocos JSON antes de salvar.");
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) return setMessage("Sua sessão expirou. Entre novamente.");
    const { error } = await createClient().from("site_settings").upsert(
      {
        id: true,
        subscription_settings: parsed[0],
        media_settings: parsed[1],
        content_settings: parsed[2],
        public_parameters: parsed[3],
        updated_by: user.id,
      },
      { onConflict: "id" },
    );
    if (error) return setMessage(error.message);
    setMessage("Configurações salvas com sucesso.");
  }

  return (
    <AdminShell title="Configurações" description="Parâmetros públicos e regras operacionais.">
      <AdminPageHeader
        title="Configurações da plataforma"
        description="Secrets e credenciais privadas não são armazenados nem exibidos aqui."
      />
      {message ? (
        <p
          className={`admin-alert ${message.includes("sucesso") ? "admin-success" : ""}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
      {settings ? (
        <form className="admin-card admin-panel" onSubmit={(event) => void save(event)}>
          <div className="admin-form-grid">
            <div className="admin-field full">
              <label htmlFor="settings-subscriptions">Assinaturas · JSON público</label>
              <textarea
                id="settings-subscriptions"
                value={subscriptionSettings}
                onChange={(event) => setSubscriptionSettings(event.target.value)}
              />
            </div>
            <div className="admin-field full">
              <label htmlFor="settings-media">Mídia · JSON público</label>
              <textarea
                id="settings-media"
                value={mediaSettings}
                onChange={(event) => setMediaSettings(event.target.value)}
              />
            </div>
            <div className="admin-field full">
              <label htmlFor="settings-content">Conteúdo · JSON público</label>
              <textarea
                id="settings-content"
                value={contentSettings}
                onChange={(event) => setContentSettings(event.target.value)}
              />
            </div>
            <div className="admin-field full">
              <label htmlFor="settings-public">Parâmetros públicos</label>
              <textarea
                id="settings-public"
                value={publicParameters}
                onChange={(event) => setPublicParameters(event.target.value)}
              />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button">
              <Save size={14} /> Salvar configurações
            </button>
          </div>
        </form>
      ) : (
        <AdminEmptyState
          title="Configurações ainda não inicializadas"
          description="Salve os primeiros parâmetros gerais pelo painel Home."
          icon={Settings}
        />
      )}
    </AdminShell>
  );
}
