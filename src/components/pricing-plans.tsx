import { Check, ChevronRight, Sparkles } from "lucide-react";
import type { PublicPlan } from "../lib/public/server-fns";

const fallbackPlans = [
  {
    id: "weekly",
    label: "SEMANAL",
    price: "R$ 9,90",
    duration: "7 dias de acesso ilimitado",
    highlight: "Maratone à vontade a semana inteira",
    cta: "QUERO 7 DIAS — R$ 9,90",
    checkout: "https://pay.wiapy.com/D1rAjQcO8bo_",
    featured: false,
  },
  {
    id: "annual",
    label: "ANUAL",
    price: "R$ 99,90",
    duration: "12 meses de acesso ilimitado",
    highlight: "Equivale a R$ 8,33/mês",
    cta: "QUERO 1 ANO — R$ 99,90",
    checkout: "https://pay.wiapy.com/JQcBx7Tif3vh",
    featured: true,
  },
  {
    id: "monthly",
    label: "MENSAL",
    price: "R$ 19,90",
    duration: "30 dias de acesso ilimitado",
    highlight: "Equivale a R$ 0,66 por dia",
    cta: "QUERO 1 MÊS — R$ 19,90",
    checkout: "https://pay.wiapy.com/KaF1EsAXWGPC",
    featured: false,
  },
] as const;

const benefits = [
  "Acesso completo ao catálogo",
  "Doramas, séries turcas e novelinhas",
  "Dublado e legendado",
  "Sem anúncios",
  "Dispositivos compatíveis",
  "Liberação imediata",
];

function carryTrackingParameters(checkoutUrl: string) {
  const target = new URL(checkoutUrl);
  const current = new URLSearchParams(window.location.search);

  current.forEach((value, key) => {
    if (!target.searchParams.has(key)) target.searchParams.append(key, value);
  });

  return target.toString();
}

function trackCheckoutClick(planId: string) {
  const tracker = (
    window as Window & {
      fbq?: (...args: unknown[]) => void;
    }
  ).fbq;

  // Reuse an existing Meta Pixel only; this component never injects a pixel.
  if (typeof tracker === "function") {
    tracker("track", "InitiateCheckout", {
      content_name: planId,
      content_category: "subscription",
    });
  }
}

function formatPlanPrice(plan: PublicPlan) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: plan.currency }).format(
    plan.price,
  );
}

function formatPlanDuration(plan: PublicPlan) {
  if (plan.description) return plan.description;
  if (plan.billing_interval === "week") return "7 dias de acesso ilimitado";
  if (plan.billing_interval === "year") return "12 meses de acesso ilimitado";
  if (plan.billing_interval === "lifetime") return "Acesso vitalício";
  return "30 dias de acesso ilimitado";
}

export function PricingPlans({
  className = "",
  remotePlans = [],
}: {
  className?: string;
  remotePlans?: PublicPlan[];
}) {
  const configuredPlans = remotePlans
    .map((plan) => ({
      id: plan.slug,
      label: plan.name.toUpperCase(),
      price: formatPlanPrice(plan),
      duration: formatPlanDuration(plan),
      highlight: plan.description || "Acesso completo ao Feed Loves",
      cta: `ASSINAR — ${formatPlanPrice(plan)}`,
      checkout: plan.checkout_url || "",
      featured: plan.featured,
    }))
    .filter((plan) => plan.checkout.length > 0);
  const plans = remotePlans.length ? configuredPlans : fallbackPlans;
  return (
    <section
      className={`part2-pricing ${className}`.trim()}
      id="planos"
      aria-labelledby="part2-plans-title"
    >
      <div className="part2-section-heading">
        <p className="part2-eyebrow">SUA PRÓXIMA HISTÓRIA ESTÁ A UM CLIQUE</p>
        <h2 id="part2-plans-title">
          Escolha como você quer <span>maratonar ♡</span>
        </h2>
        <p>Um único acesso para curtir doramas, séries turcas e novelinhas sem anúncios.</p>
        <div className="part2-plan-perks">
          <span>
            <Check size={14} /> Acesso imediato
          </span>
          <span>
            <Check size={14} /> Dublado e legendado
          </span>
          <span>
            <Check size={14} /> Sem anúncios
          </span>
          <span>
            <Check size={14} /> Dispositivos compatíveis
          </span>
        </div>
      </div>

      <div className="part2-plan-grid">
        {plans.map((plan) => (
          <article
            className={`part2-plan-card ${plan.featured ? "is-featured" : ""}`}
            key={plan.id}
          >
            {plan.featured ? (
              <span className="part2-plan-badge">
                <Sparkles size={13} /> MAIOR ECONOMIA
              </span>
            ) : null}
            <p className="part2-plan-label">{plan.label}</p>
            <h3>{plan.price}</h3>
            <p className="part2-plan-duration">{plan.duration}</p>
            <p className="part2-plan-highlight">{plan.highlight}</p>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit}>
                  <Check size={16} /> <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <a
              className={`part2-plan-cta ${plan.featured ? "is-primary" : ""}`}
              href={plan.checkout}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                event.currentTarget.href = carryTrackingParameters(plan.checkout);
                trackCheckoutClick(plan.id);
              }}
            >
              {plan.cta} <ChevronRight size={16} />
            </a>
          </article>
        ))}
      </div>

      <div className="part2-access-note">
        <p className="part2-access-title">✦ ACESSO IMEDIATO APÓS A CONFIRMAÇÃO</p>
        <p>Assim que o pagamento for confirmado, você receberá as informações de acesso.</p>
        <div>
          <span>📱 Receba no WhatsApp</span>
          <span>✉️ Receba também por e-mail</span>
          <span>🚫 Sem anúncios</span>
          <span>📺 Dispositivos compatíveis</span>
        </div>
        <small>Pagamento seguro • Acesso simples • Sem taxas escondidas</small>
      </div>
    </section>
  );
}
