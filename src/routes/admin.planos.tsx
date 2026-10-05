import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Tags } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  AdminEmptyState,
  AdminPageHeader,
  AdminShell,
  AdminStatus,
} from "../components/admin/admin-shell";
import { requireAdmin } from "../lib/admin/guard";
import { getAdminPlans } from "../lib/admin/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/planos")({
  beforeLoad: requireAdmin,
  loader: () => getAdminPlans(),
  head: () => ({ meta: [{ title: "Planos | Feed Loves" }] }),
  component: AdminPlans,
});

type PlanForm = {
  slug: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  billing_interval: "week" | "month" | "year" | "lifetime";
  benefits: string;
  active: boolean;
  featured: boolean;
  sort_order: string;
};
const emptyPlan: PlanForm = {
  slug: "",
  name: "",
  description: "",
  price: "",
  currency: "BRL",
  billing_interval: "month",
  benefits: "",
  active: true,
  featured: false,
  sort_order: "0",
};

function AdminPlans() {
  const { plans } = Route.useLoaderData();
  const [form, setForm] = useState<PlanForm>(emptyPlan);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  function startEdit(plan: (typeof plans)[number]) {
    setEditingId(plan.id);
    setForm({
      slug: plan.slug,
      name: plan.name,
      description: plan.description ?? "",
      price: String(plan.price),
      currency: plan.currency,
      billing_interval: plan.billing_interval,
      benefits: Array.isArray(plan.benefits) ? plan.benefits.join("\n") : "",
      active: plan.active,
      featured: plan.featured,
      sort_order: String(plan.sort_order),
    });
    setShowForm(true);
  }

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = createClient();
    const payload = {
      slug: form.slug.trim().toLowerCase(),
      name: form.name.trim(),
      description: form.description || null,
      price: Number(form.price),
      currency: form.currency.toUpperCase(),
      billing_interval: form.billing_interval,
      benefits: form.benefits
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      active: form.active,
      featured: form.featured,
      sort_order: Number(form.sort_order),
    };
    const result = editingId
      ? await supabase.from("plans").update(payload).eq("id", editingId)
      : await supabase.from("plans").insert(payload);
    if (result.error) return setMessage(result.error.message);
    window.location.reload();
  }

  return (
    <AdminShell title="Planos" description="Preços, benefícios e disponibilidade comercial.">
      <AdminPageHeader
        title="Planos de assinatura"
        description="Os preços só mudam quando um administrador salva uma alteração."
        action={
          <button
            type="button"
            className="admin-primary-button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyPlan);
              setShowForm((value) => !value);
            }}
          >
            <Plus size={15} /> Novo plano
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
          onSubmit={(event) => void savePlan(event)}
          style={{ marginBottom: 16 }}
        >
          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="plan-name">Nome</label>
              <input
                id="plan-name"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="plan-slug">Slug</label>
              <input
                id="plan-slug"
                required
                value={form.slug}
                onChange={(event) =>
                  setForm({ ...form, slug: event.target.value.toLowerCase().replace(/\s+/g, "-") })
                }
              />
            </div>
            <div className="admin-field">
              <label htmlFor="plan-price">Preço</label>
              <input
                id="plan-price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="plan-currency">Moeda</label>
              <input
                id="plan-currency"
                maxLength={3}
                required
                value={form.currency}
                onChange={(event) => setForm({ ...form, currency: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="plan-interval">Periodicidade</label>
              <select
                id="plan-interval"
                value={form.billing_interval}
                onChange={(event) =>
                  setForm({
                    ...form,
                    billing_interval: event.target.value as PlanForm["billing_interval"],
                  })
                }
              >
                <option value="week">Semanal</option>
                <option value="month">Mensal</option>
                <option value="year">Anual</option>
                <option value="lifetime">Vitalício</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="plan-order">Ordem</label>
              <input
                id="plan-order"
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(event) => setForm({ ...form, sort_order: event.target.value })}
              />
            </div>
            <div className="admin-field full">
              <label htmlFor="plan-description">Descrição</label>
              <input
                id="plan-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <div className="admin-field full">
              <label htmlFor="plan-benefits">Benefícios (um por linha)</label>
              <textarea
                id="plan-benefits"
                value={form.benefits}
                onChange={(event) => setForm({ ...form, benefits: event.target.value })}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="plan-active">Status</label>
              <select
                id="plan-active"
                value={form.active ? "active" : "inactive"}
                onChange={(event) => setForm({ ...form, active: event.target.value === "active" })}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <div className="admin-field">
              <label htmlFor="plan-featured">Destaque</label>
              <select
                id="plan-featured"
                value={form.featured ? "featured" : "normal"}
                onChange={(event) =>
                  setForm({ ...form, featured: event.target.value === "featured" })
                }
              >
                <option value="normal">Normal</option>
                <option value="featured">Em destaque</option>
              </select>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-ghost-button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="admin-primary-button">
              {editingId ? "Salvar alterações" : "Criar plano"}
            </button>
          </div>
        </form>
      ) : null}
      {plans.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plano</th>
                <th>Preço</th>
                <th>Periodicidade</th>
                <th>Status</th>
                <th>Destaque</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <strong>{plan.name}</strong>
                    <br />
                    <span className="admin-muted">{plan.slug}</span>
                  </td>
                  <td>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: plan.currency,
                    }).format(plan.price)}
                  </td>
                  <td>{plan.billing_interval}</td>
                  <td>
                    <AdminStatus status={plan.active ? "active" : "inactive"} />
                  </td>
                  <td>{plan.featured ? "Sim" : "Não"}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-ghost-button"
                      onClick={() => startEdit(plan)}
                    >
                      <Pencil size={13} /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <AdminEmptyState
          title="Nenhum plano configurado"
          description="Cadastre os planos comerciais reais da plataforma antes de conectar os checkouts."
          icon={Tags}
        />
      )}
    </AdminShell>
  );
}
