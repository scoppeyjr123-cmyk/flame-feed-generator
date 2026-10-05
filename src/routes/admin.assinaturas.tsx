import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Plus } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import {
  AdminEmptyState,
  AdminPageHeader,
  AdminShell,
  AdminStatus,
} from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminCustomers, getAdminPlans } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/assinaturas")({
  beforeLoad: requireAdmin,
  loader: async () => {
    const [customerData, planData] = await Promise.all([getAdminCustomers(), getAdminPlans()]);
    return { ...customerData, ...planData };
  },
  head: () => ({ meta: [{ title: "Assinaturas | Feed Loves" }] }),
  component: AdminSubscriptions,
});

type SubscriptionStatus = "active" | "pending" | "paused" | "cancelled" | "expired" | "lifetime";

type SubscriptionForm = {
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string;
  renews_at: string;
  notes: string;
};

const emptyForm: SubscriptionForm = {
  user_id: "",
  plan_id: "",
  status: "active",
  starts_at: "",
  expires_at: "",
  renews_at: "",
  notes: "",
};

function toIsoDate(value: string) {
  return value ? new Date(`${value}T12:00:00`).toISOString() : null;
}

function AdminSubscriptions() {
  const { customers, subscriptions, plans } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SubscriptionForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const customerMap = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers],
  );

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return subscriptions.filter((subscription) => {
      const customer = customerMap.get(subscription.user_id);
      const plan =
        subscription &&
        "plans" in subscription &&
        subscription.plans &&
        typeof subscription.plans === "object" &&
        "name" in subscription.plans
          ? String(subscription.plans.name)
          : "";
      const matchesQuery = `${customer?.name ?? ""} ${customer?.email ?? ""} ${plan}`
        .toLowerCase()
        .includes(normalizedQuery);
      return (
        matchesQuery &&
        (statusFilter === "all" || subscription.status === statusFilter) &&
        (planFilter === "all" || subscription.plan_id === planFilter)
      );
    });
  }, [customerMap, planFilter, query, statusFilter, subscriptions]);

  function openCreateForm() {
    setMessage("");
    setForm({ ...emptyForm, user_id: customers[0]?.id ?? "", plan_id: plans[0]?.id ?? "" });
    setShowForm(true);
  }

  async function saveSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return setMessage("Sua sessão expirou. Entre novamente.");
    }
    if (!form.user_id) {
      setSaving(false);
      return setMessage("Selecione um cliente.");
    }
    if (form.status !== "lifetime" && !form.plan_id) {
      setSaving(false);
      return setMessage("Selecione um plano ou conceda acesso vitalício.");
    }

    const { data: created, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: form.user_id,
        plan_id: form.status === "lifetime" ? null : form.plan_id,
        status: form.status,
        starts_at: toIsoDate(form.starts_at),
        expires_at: toIsoDate(form.expires_at),
        renews_at: toIsoDate(form.renews_at),
        origin: "manual",
        notes: form.notes || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();
    if (error || !created) {
      setSaving(false);
      return setMessage(error?.message ?? "Não foi possível criar a assinatura.");
    }
    const history = await supabase.from("subscription_history").insert({
      subscription_id: created.id,
      user_id: created.user_id,
      action: "manual_access_granted",
      before_data: null,
      after_data: created,
      performed_by: user.id,
    });
    if (history.error) {
      setSaving(false);
      return setMessage(history.error.message);
    }
    window.location.reload();
  }

  async function changeStatus(
    subscription: (typeof subscriptions)[number],
    status: SubscriptionStatus,
  ) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setMessage("Sua sessão expirou. Entre novamente.");
    setMessage("");
    const update = {
      status,
      updated_by: user.id,
      ...(status === "lifetime" ? { plan_id: null, expires_at: null, renews_at: null } : {}),
    };
    const { data: updated, error } = await supabase
      .from("subscriptions")
      .update(update)
      .eq("id", subscription.id)
      .select()
      .single();
    if (error || !updated) return setMessage(error?.message ?? "Não foi possível atualizar.");
    const history = await supabase.from("subscription_history").insert({
      subscription_id: updated.id,
      user_id: updated.user_id,
      action: `status_changed_to_${status}`,
      before_data: subscription,
      after_data: updated,
      performed_by: user.id,
    });
    if (history.error) return setMessage(history.error.message);
    window.location.reload();
  }

  async function changePlan(subscription: (typeof subscriptions)[number], planId: string) {
    if (!planId || planId === subscription.plan_id) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setMessage("Sua sessão expirou. Entre novamente.");
    const { data: updated, error } = await supabase
      .from("subscriptions")
      .update({ plan_id: planId, updated_by: user.id })
      .eq("id", subscription.id)
      .select()
      .single();
    if (error || !updated) return setMessage(error?.message ?? "Não foi possível alterar o plano.");
    const history = await supabase.from("subscription_history").insert({
      subscription_id: updated.id,
      user_id: updated.user_id,
      action: "plan_changed",
      before_data: subscription,
      after_data: updated,
      performed_by: user.id,
    });
    if (history.error) return setMessage(history.error.message);
    window.location.reload();
  }

  return (
    <AdminShell title="Assinaturas" description="Acesso e ciclo de vida das assinaturas.">
      <AdminPageHeader
        title="Assinaturas"
        description="As ações abaixo alteram o acesso real do usuário e geram histórico administrativo."
        action={
          <button type="button" className="admin-primary-button" onClick={openCreateForm}>
            <Plus size={15} /> Nova assinatura
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
          onSubmit={(event) => void saveSubscription(event)}
          style={{ marginBottom: 16 }}
        >
          <div className="admin-panel-title">
            <h3>Conceder acesso manual</h3>
          </div>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="subscription-user">Cliente</label>
              <select
                id="subscription-user"
                required
                value={form.user_id}
                onChange={(event) => setForm({ ...form, user_id: event.target.value })}
              >
                <option value="">Selecione</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.email || customer.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="subscription-plan">Plano</label>
              <select
                id="subscription-plan"
                value={form.plan_id}
                onChange={(event) => setForm({ ...form, plan_id: event.target.value })}
                disabled={form.status === "lifetime"}
              >
                <option value="">Selecione</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="subscription-status">Status</label>
              <select
                id="subscription-status"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as SubscriptionStatus })
                }
              >
                <option value="active">Ativa</option>
                <option value="pending">Pendente</option>
                <option value="paused">Pausada</option>
                <option value="cancelled">Cancelada</option>
                <option value="expired">Expirada</option>
                <option value="lifetime">Vitalícia</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="subscription-start">Início</label>
              <input
                id="subscription-start"
                type="date"
                value={form.starts_at}
                onChange={(event) => setForm({ ...form, starts_at: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="subscription-expiry">Vencimento</label>
              <input
                id="subscription-expiry"
                type="date"
                value={form.expires_at}
                onChange={(event) => setForm({ ...form, expires_at: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="subscription-renewal">Renovação</label>
              <input
                id="subscription-renewal"
                type="date"
                value={form.renews_at}
                onChange={(event) => setForm({ ...form, renews_at: event.target.value })}
              />
            </div>
            <div className="admin-field full">
              <label htmlFor="subscription-notes">Observações</label>
              <textarea
                id="subscription-notes"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-ghost-button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="admin-primary-button" disabled={saving}>
              {saving ? "Salvando…" : "Conceder acesso"}
            </button>
          </div>
        </form>
      ) : null}
      <div className="admin-card admin-panel" style={{ marginBottom: 16 }}>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="subscription-search">Pesquisar</label>
            <input
              id="subscription-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nome, e-mail ou plano"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="subscription-filter-status">Status</label>
            <select
              id="subscription-filter-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Ativa</option>
              <option value="pending">Pendente</option>
              <option value="paused">Pausada</option>
              <option value="cancelled">Cancelada</option>
              <option value="expired">Expirada</option>
              <option value="lifetime">Vitalícia</option>
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="subscription-filter-plan">Plano</label>
            <select
              id="subscription-filter-plan"
              value={planFilter}
              onChange={(event) => setPlanFilter(event.target.value)}
            >
              <option value="all">Todos</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {filteredSubscriptions.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Início</th>
                <th>Vencimento</th>
                <th>Renovação</th>
                <th>Origem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((subscription) => {
                const customer = customerMap.get(subscription.user_id);
                const plan =
                  subscription &&
                  "plans" in subscription &&
                  subscription.plans &&
                  typeof subscription.plans === "object" &&
                  "name" in subscription.plans
                    ? String(subscription.plans.name)
                    : subscription.plan_id
                      ? "Plano vinculado"
                      : "Vitalícia";
                return (
                  <tr key={subscription.id}>
                    <td>
                      <strong>{customer?.name || "Sem nome"}</strong>
                      <br />
                      <span className="admin-muted">{customer?.email || subscription.user_id}</span>
                    </td>
                    <td>
                      <select
                        aria-label={`Plano de ${customer?.name || "cliente"}`}
                        value={subscription.plan_id ?? ""}
                        onChange={(event) => void changePlan(subscription, event.target.value)}
                        disabled={subscription.status === "lifetime"}
                      >
                        <option value="">{plan}</option>
                        {plans.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <AdminStatus status={subscription.status} />
                    </td>
                    <td>
                      {subscription.starts_at
                        ? new Date(subscription.starts_at).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td>
                      {subscription.expires_at
                        ? new Date(subscription.expires_at).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td>
                      {subscription.renews_at
                        ? new Date(subscription.renews_at).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td>{subscription.origin}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {subscription.status === "active" ? (
                          <button
                            type="button"
                            className="admin-ghost-button"
                            onClick={() => void changeStatus(subscription, "paused")}
                          >
                            Pausar
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-ghost-button"
                            onClick={() => void changeStatus(subscription, "active")}
                          >
                            Ativar
                          </button>
                        )}
                        {subscription.status !== "cancelled" ? (
                          <button
                            type="button"
                            className="admin-ghost-button"
                            onClick={() => {
                              if (
                                window.confirm("Tem certeza que deseja cancelar esta assinatura?")
                              ) {
                                void changeStatus(subscription, "cancelled");
                              }
                            }}
                          >
                            Cancelar
                          </button>
                        ) : null}
                        {subscription.status !== "lifetime" ? (
                          <button
                            type="button"
                            className="admin-ghost-button"
                            onClick={() => void changeStatus(subscription, "lifetime")}
                          >
                            Vitalícia
                          </button>
                        ) : null}
                        {subscription.status !== "expired" ? (
                          <button
                            type="button"
                            className="admin-ghost-button"
                            onClick={() => {
                              if (window.confirm("Tem certeza que deseja remover o acesso?")) {
                                void changeStatus(subscription, "expired");
                              }
                            }}
                          >
                            Remover acesso
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <AdminEmptyState
          title="Nenhuma assinatura encontrada"
          description="Assinaturas confirmadas por checkout ou concedidas manualmente aparecerão aqui."
          icon={CreditCard}
        />
      )}
    </AdminShell>
  );
}
