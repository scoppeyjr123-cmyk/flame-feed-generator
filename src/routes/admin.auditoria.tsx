import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

import { AdminEmptyState, AdminPageHeader, AdminShell } from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminAuditLogs } from "../lib/admin/server-fns";

export const Route = createFileRoute("/admin/auditoria")({
  beforeLoad: requireAdmin,
  loader: () => getAdminAuditLogs(),
  head: () => ({ meta: [{ title: "Auditoria | Feed Loves" }] }),
  component: AdminAudit,
});

function AdminAudit() {
  const { logs } = Route.useLoaderData();
  return (
    <AdminShell title="Auditoria" description="Histórico de alterações administrativas.">
      <AdminPageHeader
        title="Auditoria"
        description="Alterações críticas são registradas por triggers no banco."
      />
      {logs.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>ID</th>
                <th>Administrador</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString("pt-BR")}</td>
                  <td>{log.action}</td>
                  <td>{log.entity_type}</td>
                  <td>{log.entity_id || "—"}</td>
                  <td>{log.admin_id || "Sistema"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <AdminEmptyState
          title="Nenhuma ação registrada"
          description="As alterações feitas pelo painel aparecerão nesta lista."
          icon={ClipboardList}
        />
      )}
    </AdminShell>
  );
}
