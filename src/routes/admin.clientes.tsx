import { createFileRoute } from "@tanstack/react-router";
import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AdminEmptyState,
  AdminPageHeader,
  AdminShell,
  AdminStatus,
} from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminCustomers } from "../lib/admin/server-fns";

export const Route = createFileRoute("/admin/clientes")({
  beforeLoad: requireAdmin,
  loader: () => getAdminCustomers(),
  head: () => ({ meta: [{ title: "Clientes | Feed Loves" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const { customers, subscriptions, roles } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const planOptions = useMemo(
    () =>
      Array.from(
        new Map(
          subscriptions
            .filter((subscription) => subscription.plan_id)
            .map((subscription) => {
              const plan =
                subscription &&
                "plans" in subscription &&
                subscription.plans &&
                typeof subscription.plans === "object" &&
                "name" in subscription.plans
                  ? String(subscription.plans.name)
                  : "Plano vinculado";
              return [subscription.plan_id as string, plan];
            }),
        ),
      ),
    [subscriptions],
  );
  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const latestSubscription = new Map(
      subscriptions.map((subscription) => [subscription.user_id, subscription]),
    );
    const roleMap = new Map(roles.map((role) => [role.user_id, role.role]));
    return customers.filter((customer) => {
      const subscription = latestSubscription.get(customer.id);
      const accountType = roleMap.get(customer.id) === "admin" ? "admin" : subscription && ["active", "lifetime"].includes(subscription.status) ? "subscriber" : "free";
      return (
        `${customer.name ?? ""} ${customer.email ?? ""}`.toLowerCase().includes(normalizedQuery) &&
        (statusFilter === "all" ||
          (statusFilter === "none" ? !subscription : subscription?.status === statusFilter)) &&
        (planFilter === "all" || subscription?.plan_id === planFilter) &&
        (accountTypeFilter === "all" || accountType === accountTypeFilter)
      );
    });
  }, [accountTypeFilter, customers, planFilter, query, roles, statusFilter, subscriptions]);
  const latestSubscription = new Map(
    subscriptions.map((subscription) => [subscription.user_id, subscription]),
  );

  return (
    <AdminShell title="Clientes" description="Perfis reais cadastrados no Supabase.">
      <AdminPageHeader
        title="Clientes e assinantes"
        description="Pesquise e acompanhe o estado atual de cada cliente."
      />
      <div className="admin-card admin-panel" style={{ marginBottom: 16 }}>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="customer-search">Pesquisar cliente</label>
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{ position: "absolute", left: 11, top: 11, color: "#a8889d" }}
              />
              <input
                id="customer-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nome ou e-mail"
                style={{ paddingLeft: 34 }}
              />
            </div>
          </div>
          <div className="admin-field">
            <label htmlFor="customer-status-filter">Status</label>
            <select
              id="customer-status-filter"
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
              <option value="none">Sem assinatura</option>
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="customer-account-type-filter">Tipo de conta</label>
            <select id="customer-account-type-filter" value={accountTypeFilter} onChange={(event) => setAccountTypeFilter(event.target.value)}>
              <option value="all">Todos</option><option value="free">Grátis</option><option value="subscriber">Assinantes</option><option value="admin">Admin</option>
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="customer-plan-filter">Plano</label>
            <select
              id="customer-plan-filter"
              value={planFilter}
              onChange={(event) => setPlanFilter(event.target.value)}
            >
              <option value="all">Todos</option>
              {planOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {rows.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th>Último acesso</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((customer) => {
                const subscription = latestSubscription.get(customer.id);
                const role = roles.find((item) => item.user_id === customer.id)?.role;
                const accountType = role === "admin" ? "ADMIN" : subscription && ["active", "lifetime"].includes(subscription.status) ? "ASSINANTE" : "FREE";
                const plan =
                  subscription &&
                  "plans" in subscription &&
                  subscription.plans &&
                  typeof subscription.plans === "object" &&
                  "name" in subscription.plans
                    ? String(subscription.plans.name)
                    : subscription?.plan_id
                      ? "Plano vinculado"
                      : "—";
                return (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.name || "Sem nome"}</strong>
                      <br />
                      <span className="admin-muted">
                        {customer.email || "E-mail não informado"}
                      </span>
                    </td>
                    <td>{plan}<br /><span className="admin-muted">{accountType}</span></td>
                    <td>
                      {subscription ? (
                        <AdminStatus status={subscription.status} />
                      ) : (
                        <AdminStatus status="sem assinatura" />
                      )}
                    </td>
                    <td>{new Date(customer.created_at).toLocaleDateString("pt-BR")}</td>
                    <td>
                      {customer.last_login_at
                        ? new Date(customer.last_login_at).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td>
                      <a
                        href={`/admin/assinaturas?cliente=${customer.id}`}
                        className="admin-ghost-button"
                      >
                        Gerenciar
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <AdminEmptyState
          title="Nenhum cliente encontrado"
          description={
            query ? "Tente outro nome ou e-mail." : "Os perfis criados no Supabase aparecerão aqui."
          }
          icon={Users}
        />
      )}
    </AdminShell>
  );
}
