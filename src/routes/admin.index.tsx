import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Film, ListVideo, Tags, Users } from "lucide-react";

import {
  AdminEmptyState,
  AdminLink,
  AdminPageHeader,
  AdminShell,
  AdminStatus,
} from "../components/admin/admin-shell";
import { getAdminDashboard } from "../lib/admin/server-fns";
import { requireAdmin } from "../lib/admin/guard";

export const Route = createFileRoute("/admin/")({
  beforeLoad: requireAdmin,
  loader: () => getAdminDashboard(),
  head: () => ({ meta: [{ title: "Dashboard | Feed Loves" }] }),
  component: AdminDashboard,
});

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: number;
  note: string;
  icon: typeof Users;
}) {
  return (
    <article className="admin-card admin-metric">
      <div className="admin-metric-top">
        <span>{label}</span>
        <span className="admin-metric-icon">
          <Icon size={15} />
        </span>
      </div>
      <strong className="admin-metric-value">{value}</strong>
      <p className="admin-metric-note">{note}</p>
    </article>
  );
}

function AdminDashboard() {
  const data = Route.useLoaderData();
  return (
    <AdminShell title="Dashboard" description="Visão geral da operação do Feed Loves.">
      <AdminPageHeader
        title="Resumo da plataforma"
        description="Indicadores calculados diretamente do Supabase."
        action={<AdminLink href="/admin/novelas">Gerenciar conteúdo</AdminLink>}
      />
      <section className="admin-metric-grid" aria-label="Métricas principais">
        <MetricCard
          label="Clientes totais"
          value={data.metrics.customers}
          note="Perfis cadastrados"
          icon={Users}
        />
        <MetricCard
          label="Assinaturas ativas"
          value={data.metrics.activeSubscriptions}
          note={`${data.metrics.subscriptions} registros no total`}
          icon={CreditCard}
        />
        <MetricCard
          label="Pendentes"
          value={data.metrics.pendingSubscriptions}
          note="Aguardando confirmação"
          icon={CreditCard}
        />
        <MetricCard
          label="Planos ativos"
          value={data.metrics.plans}
          note="Configurados no banco"
          icon={Tags}
        />
        <MetricCard
          label="Novelas publicadas"
          value={data.metrics.publishedSeries}
          note={`${data.metrics.series} novelas no total`}
          icon={Film}
        />
        <MetricCard
          label="Episódios"
          value={data.metrics.episodes}
          note="Cadastrados no catálogo"
          icon={ListVideo}
        />
        <MetricCard
          label="Novelas totais"
          value={data.metrics.series}
          note="Inclui rascunhos e ocultas"
          icon={Film}
        />
        <MetricCard
          label="Assinaturas totais"
          value={data.metrics.subscriptions}
          note="Histórico operacional"
          icon={CreditCard}
        />
      </section>
      <section className="admin-grid-2">
        <article className="admin-card admin-panel">
          <div className="admin-panel-title">
            <h3>Clientes recentes</h3>
            <AdminLink href="/admin/clientes">Ver todos</AdminLink>
          </div>
          {data.recentCustomers.length ? (
            <div className="admin-list">
              {data.recentCustomers.map((customer) => (
                <div className="admin-list-row" key={customer.id}>
                  <div className="admin-list-main">
                    <strong>{customer.name || "Sem nome"}</strong>
                    <span>{customer.email || "E-mail não informado"}</span>
                  </div>
                  <span className="admin-muted">
                    {new Date(customer.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="Nenhum cliente encontrado"
              description="Os clientes criados no Supabase aparecerão aqui."
              icon={Users}
            />
          )}
        </article>
        <article className="admin-card admin-panel">
          <div className="admin-panel-title">
            <h3>Conteúdos recentes</h3>
            <AdminLink href="/admin/novelas">Gerenciar</AdminLink>
          </div>
          {data.recentSeries.length ? (
            <div className="admin-list">
              {data.recentSeries.map((series) => (
                <div className="admin-list-row" key={series.id}>
                  <div className="admin-list-main">
                    <strong>{series.title}</strong>
                    <span>{new Date(series.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <AdminStatus status={series.status} />
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="Nenhuma novela cadastrada"
              description="Cadastre a primeira novela quando o conteúdo estiver pronto para entrar no catálogo."
              icon={Film}
            />
          )}
        </article>
      </section>
      <section className="admin-card admin-panel" style={{ marginTop: 16 }}>
        <div className="admin-panel-title">
          <h3>Últimas ações administrativas</h3>
          <AdminLink href="/admin/auditoria">Abrir auditoria</AdminLink>
        </div>
        {data.recentAudit.length ? (
          <div className="admin-list">
            {data.recentAudit.map((log) => (
              <div className="admin-list-row" key={log.id}>
                <div className="admin-list-main">
                  <strong>
                    {log.action} · {log.entity_type}
                  </strong>
                  <span>{log.entity_id || "Sem identificador"}</span>
                </div>
                <span className="admin-muted">
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="Nenhuma ação registrada"
            description="As alterações feitas pelo painel aparecerão aqui automaticamente."
          />
        )}
      </section>
    </AdminShell>
  );
}
