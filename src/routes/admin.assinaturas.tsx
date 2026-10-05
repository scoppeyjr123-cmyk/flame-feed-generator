import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";

import {
  AdminEmptyState,
  AdminPageHeader,
  AdminShell,
  AdminStatus,
} from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminCustomers } from "../lib/admin/server-fns";

export const Route = createFileRoute("/admin/assinaturas")({
  beforeLoad: requireAdmin,
  loader: () => getAdminCustomers(),
  head: () => ({ meta: [{ title: "Assinaturas | Feed Loves" }] }),
  component: AdminSubscriptions,
});

function AdminSubscriptions() {
  const { customers, subscriptions } = Route.useLoaderData();
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  return (
    <AdminShell title="Assinaturas" description="Acesso e ciclo de vida das assinaturas.">
      <AdminPageHeader
        title="Assinaturas"
        description="Os registros abaixo são protegidos pelo RLS de administrador."
      />
      {subscriptions.length ? (
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
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => {
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
                    <td>{plan}</td>
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
