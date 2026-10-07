import { createFileRoute, Link } from "@tanstack/react-router";

import { getPublicPlans, type PublicPlan } from "../lib/public/server-fns";

export const Route = createFileRoute("/app/planos")({
  loader: () => getPublicPlans(),
  staleTime: 5 * 60 * 1000,
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
      <style>{`.plans-page{padding:24px 0 80px}.plans-back{display:inline-flex;margin-bottom:42px;color:#f2c4df;font-size:13px}.plans-page>h1{text-align:center;font:700 clamp(34px,6vw,58px)/1.08 "Playfair Display",Georgia,serif}.plans-page>h1:after{content:" ♡";color:#f45db2}.plans-page>.app-kicker{text-align:center}.plans-page>p:not(.app-kicker){margin:12px auto 0;color:#c9afc1;text-align:center}.plans-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin:48px auto 0;max-width:1180px}.plan-card{display:flex;flex-direction:column;min-height:480px;padding:28px;border:1px solid #4a3045;border-radius:10px;background:#130a12}.plan-card.featured{position:relative;border-color:#f45db2;box-shadow:0 0 28px #f45db226}.plan-card.featured:before{content:"★ MAIOR ECONOMIA";position:absolute;top:-16px;left:50%;transform:translateX(-50%);border-radius:999px;background:#f45db2;padding:8px 17px;color:#160912;font-size:11px;font-weight:800;white-space:nowrap}.plan-card h2{margin:0;color:#f45db2;font-size:12px;letter-spacing:.18em;text-transform:uppercase}.plan-price{margin-top:28px;color:#fff;font-size:38px;font-weight:800}.plan-price small{color:#c6afbf;font-size:12px;font-weight:400}.plan-card>p{margin-top:8px!important;text-align:left!important;color:#c6afbf!important;font-size:13px}.plan-card ul{display:grid;gap:13px;margin:28px 0;padding:24px 0;border-top:1px solid #4a3045;list-style:none;color:#f8eaf4;font-size:13px}.plan-card li:before{content:"✓";margin-right:10px;color:#f45db2;font-weight:800}.plan-card a,.plan-card>span{display:block;margin-top:auto;border:1px solid #69505f;border-radius:6px;padding:12px;text-align:center;color:#fff;font-size:13px;font-weight:800}.plan-card.featured a{border-color:#f45db2;background:#f45db2;color:#170a12}@media(max-width:800px){.plans-grid{grid-template-columns:1fr;gap:30px;margin-top:40px}.plan-card{min-height:0}.plans-page{padding-top:18px}}`}</style>
      <Link className="plans-back" to="/app/perfil">
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
