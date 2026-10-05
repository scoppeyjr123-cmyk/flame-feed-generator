import { createFileRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { useState } from "react";

import { AdminEmptyState, AdminPageHeader, AdminShell } from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminPlans } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/checkout")({
  beforeLoad: requireAdmin,
  loader: () => getAdminPlans(),
  head: () => ({ meta: [{ title: "Checkout | Feed Loves" }] }),
  component: AdminCheckout,
});

function AdminCheckout() {
  const { plans, checkout } = Route.useLoaderData();
  const [message, setMessage] = useState("");
  const checkoutMap = new Map(checkout.map((item) => [item.plan_id, item]));

  async function saveCheckout(planId: string, form: HTMLFormElement) {
    setMessage("");
    const data = new FormData(form);
    const result = await createClient()
      .from("checkout_settings")
      .upsert(
        {
          plan_id: planId,
          provider: String(data.get("provider") || "").trim() || null,
          primary_url: String(data.get("primary_url") || "").trim() || null,
          alternate_url: String(data.get("alternate_url") || "").trim() || null,
          primary_enabled: data.get("primary_enabled") === "on",
          alternate_enabled: data.get("alternate_enabled") === "on",
        },
        { onConflict: "plan_id" },
      );
    if (result.error) return setMessage(result.error.message);
    setMessage("Checkout atualizado com sucesso.");
  }

  return (
    <AdminShell
      title="Checkout"
      description="URLs centrais por plano, sem editar o código público."
    >
      <AdminPageHeader
        title="Configuração de checkout"
        description="Os parâmetros de campanha continuam sendo tratados no fluxo público existente."
      />
      {message ? (
        <p className="admin-alert admin-success" role="status">
          {message}
        </p>
      ) : null}
      {plans.length ? (
        <div style={{ display: "grid", gap: 15 }}>
          {plans.map((plan) => {
            const config = checkoutMap.get(plan.id);
            return (
              <form
                className="admin-card admin-panel"
                key={plan.id}
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveCheckout(plan.id, event.currentTarget);
                }}
              >
                <div className="admin-panel-title">
                  <div>
                    <h3>{plan.name}</h3>
                    <p className="admin-muted">
                      {plan.slug} · {plan.currency} {plan.price}
                    </p>
                  </div>
                  <span className="admin-badge">{config?.provider || "Não configurado"}</span>
                </div>
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label htmlFor={`provider-${plan.id}`}>Provider</label>
                    <input
                      id={`provider-${plan.id}`}
                      name="provider"
                      defaultValue={config?.provider ?? ""}
                      placeholder="Ex.: wiapy"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor={`primary-${plan.id}`}>Checkout principal</label>
                    <input
                      id={`primary-${plan.id}`}
                      name="primary_url"
                      type="url"
                      defaultValue={config?.primary_url ?? ""}
                      placeholder="https://…"
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor={`alternate-${plan.id}`}>Checkout alternativo</label>
                    <input
                      id={`alternate-${plan.id}`}
                      name="alternate_url"
                      type="url"
                      defaultValue={config?.alternate_url ?? ""}
                      placeholder="https://…"
                    />
                  </div>
                  <div className="admin-field">
                    <label>
                      <input
                        type="checkbox"
                        name="primary_enabled"
                        defaultChecked={config?.primary_enabled ?? true}
                      />{" "}
                      Principal ativo
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="alternate_enabled"
                        defaultChecked={config?.alternate_enabled ?? false}
                      />{" "}
                      Alternativo ativo
                    </label>
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-primary-button">
                    Salvar checkout
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      ) : (
        <AdminEmptyState
          title="Cadastre um plano primeiro"
          description="Cada checkout precisa estar vinculado a um plano existente."
          icon={Link2}
        />
      )}
    </AdminShell>
  );
}
