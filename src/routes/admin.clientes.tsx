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
  const { customers, subscriptions } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const rows = useMemo(
    () =>
      customers.filter((customer) =>
        `${customer.name ?? ""} ${customer.email ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [customers, query],
  );
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
                    <td>{plan}</td>
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
