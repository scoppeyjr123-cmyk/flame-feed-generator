import { createFileRoute, Link } from "@tanstack/react-router";

import { getPublicPlans, type PublicPlan } from "../lib/public/server-fns";

export const Route = createFileRoute("/app/planos")({
  loader: () => getPublicPlans(),
  component: PlansPage,
});

function formatPrice(plan: PublicPlan) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: plan.currency || "BRL",
  }).format(plan.price);
}

function PlansPage() {
  const { plans, error } = Route.useLoaderData();
  return (
    <div className="plans-page">
      <Link className="plans-back" to="/app">
        ← Voltar ao perfil
      </Link>
      <p className="app-kicker">Acesso premium</p>
      <h1>Escolha seu plano</h1>
      <p>Veja o que cada plano libera e continue sua maratona no Feed Loves.</p>
      {error ? <p role="alert">Não foi possível carregar os planos agora.</p> : null}
      {plans.length ? (
        <div className="plans-grid">
          {plans.map((plan) => (
            <article className={"plan-card" + (plan.featured ? " featured" : "")} key={plan.id}>
              <h2>{plan.name}</h2>
              <div className="plan-price">
                {formatPrice(plan)}{" "}
                <small>
                  /{plan.billing_interval === "lifetime" ? "único" : plan.billing_interval}
                </small>
              </div>
              <p>{plan.description || "Acesso ao catálogo premium Feed Loves."}</p>
              {Array.isArray(plan.benefits) ? (
                <ul>
                  {plan.benefits.map((benefit, index) => (
                    <li key={plan.id + "-" + index}>{String(benefit)}</li>
                  ))}
                </ul>
              ) : null}
              {plan.checkout_url ? (
                <a href={plan.checkout_url}>Assinar plano</a>
              ) : (
                <span>Disponível em breve</span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="profile-box">
          <strong>Planos em configuração</strong>
          <p>Os planos aparecerão aqui assim que forem publicados pelo administrador.</p>
        </div>
      )}
    </div>
  );
}
