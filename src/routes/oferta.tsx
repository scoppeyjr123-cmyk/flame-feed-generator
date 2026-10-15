import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clapperboard,
  CreditCard,
  Heart,
  LockKeyhole,
  MonitorPlay,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
} from "lucide-react";
import { EpisodePlayer } from "../components/episode-player";
import {
  getPublicPartTwoSettings,
  getPublicPlans,
  getPublishedCatalog,
  type PublicPlan,
} from "../lib/public/server-fns";
import conversionCss from "../conversion.css?url";

export const Route = createFileRoute("/oferta")({
  loader: async () => {
    const [planResult, catalogResult, video] = await Promise.all([
      getPublicPlans(),
      getPublishedCatalog(),
      getPublicPartTwoSettings(),
    ]);

    return {
      plans: planResult.plans,
      series: catalogResult.series,
      video,
    };
  },
  head: () => ({
    meta: [
      { title: "Assine Feed Loves | Doramas, séries turcas e novelinhas" },
      {
        name: "description",
        content:
          "Escolha seu plano Feed Loves e assista doramas, séries turcas e novelinhas dubladas e legendadas em um só lugar.",
      },
      { property: "og:title", content: "Sua próxima maratona começa no Feed Loves" },
      {
        property: "og:description",
        content: "Conheça o catálogo e escolha seu plano para assistir quando quiser.",
      },
    ],
    links: [
      { rel: "stylesheet", href: conversionCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
      },
    ],
  }),
  component: ConversionPage,
});

const benefits = [
  {
    icon: Clapperboard,
    title: "Histórias para maratonar",
    description: "Doramas, séries turcas e novelinhas reunidos em um catálogo só.",
  },
  {
    icon: Heart,
    title: "Dublado e legendado",
    description: "Encontre opções de áudio e legenda conforme cada título.",
  },
  {
    icon: MonitorPlay,
    title: "Reprodução simples",
    description: "Escolha uma história e continue de onde parou dentro do app.",
  },
  {
    icon: Sparkles,
    title: "Novas histórias",
    description: "Descubra os títulos adicionados ao catálogo Feed Loves.",
  },
  {
    icon: Smartphone,
    title: "Em seus dispositivos",
    description: "Assista no celular, tablet ou computador com navegador compatível.",
  },
  {
    icon: ShieldCheck,
    title: "Sem anúncios nos episódios",
    description: "Sua maratona continua sem intervalos comerciais no player.",
  },
];

const faq = [
  {
    question: "Como recebo o acesso?",
    answer:
      "Após a confirmação do pagamento, crie sua conta usando o mesmo e-mail informado na compra. Se já tem uma conta, entre com esse e-mail para que a assinatura seja vinculada.",
  },
  {
    question: "Posso assistir pelo celular?",
    answer:
      "Sim. O Feed Loves funciona em navegadores compatíveis no celular, tablet e computador.",
  },
  {
    question: "Os conteúdos são dublados?",
    answer:
      "O catálogo reúne títulos dublados e legendados. As opções disponíveis aparecem na página de cada conteúdo.",
  },
  {
    question: "Como funciona a cobrança?",
    answer:
      "Cada plano informa seu preço e período de acesso. Confira as condições de pagamento e renovação no checkout antes de finalizar a compra.",
  },
  {
    question: "E se eu precisar de ajuda?",
    answer:
      "Você pode falar com o suporte pelo WhatsApp. O botão de contato está no rodapé desta página.",
  },
];

function formatPrice(plan: PublicPlan) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: plan.currency }).format(
    plan.price,
  );
}

function periodLabel(plan: PublicPlan) {
  switch (plan.billing_interval) {
    case "week":
      return "7 dias de acesso";
    case "month":
      return "30 dias de acesso";
    case "year":
      return "12 meses de acesso";
    case "lifetime":
      return "Acesso vitalício";
  }
}

function checkoutClick(event: React.MouseEvent<HTMLAnchorElement>, plan: PublicPlan) {
  if (!plan.checkout_url) return;
  const url = new URL(plan.checkout_url);
  const tracking = new URLSearchParams(window.location.search);
  tracking.forEach((value, key) => {
    if (!url.searchParams.has(key)) url.searchParams.append(key, value);
  });
  event.currentTarget.href = url.toString();

  const pixel = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof pixel === "function") {
    pixel("track", "InitiateCheckout", {
      content_name: plan.slug,
      content_category: "subscription",
    });
  }
}

function ConversionPage() {
  const { plans, series, video } = Route.useLoaderData();
  const availablePlans = plans.filter((plan) => plan.checkout_url);
  const featuredPlan = availablePlans.find((plan) => plan.featured) ?? availablePlans[0];
  const covers = series.filter((item) => item.cover_url || item.thumbnail_url).slice(0, 14);

  return (
    <main className="conversion-page">
      <div className="conversion-offer-strip">
        <Sparkles size={14} aria-hidden="true" />
        <span>ESCOLHA SEU PLANO E COMECE SUA PRÓXIMA MARATONA</span>
      </div>

      <header className="conversion-header">
        <div className="conversion-shell conversion-header-inner">
          <a className="conversion-brand" href="/" aria-label="Feed Loves — página inicial">
            <img src="/assets/brand-v4.jpg" alt="" width="44" height="44" />
            <span>
              Feed <strong>Loves</strong>
            </span>
          </a>
          <div className="conversion-header-actions">
            <a className="conversion-login" href="/login?redirect=%2Fapp">
              JÁ SOU ASSINANTE
            </a>
            <a className="conversion-button conversion-button-small" href="#planos">
              ASSINAR <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <section className="conversion-hero conversion-shell" aria-labelledby="conversion-title">
        <p className="conversion-pill">
          <Sparkles size={14} aria-hidden="true" /> SEU PRÓXIMO VÍCIO ESTÁ AQUI
        </p>
        <h1 id="conversion-title">
          ASSISTA DORAMAS
          <span>SÉRIES TURCAS</span>
          <em>SEM LIMITES</em>
        </h1>
        <p className="conversion-hero-copy">
          Romances, reviravoltas e histórias para maratonar. Conteúdos dublados e legendados,
          reunidos em um só lugar para você assistir quando quiser.
        </p>

        <div className="conversion-video-frame">
          {video.videoUrl ? (
            <EpisodePlayer
              videoUrl={video.videoUrl}
              posterUrl={video.posterUrl}
              title="Conheça o Feed Loves"
            />
          ) : (
            <div className="conversion-video-empty">
              <Play size={44} aria-hidden="true" />
              <span>Descubra as histórias do Feed Loves</span>
            </div>
          )}
        </div>
        <div className="conversion-hero-links">
          <a className="conversion-button" href="#planos">
            <Play size={16} fill="currentColor" aria-hidden="true" /> QUERO ASSISTIR AGORA
          </a>
          <a className="conversion-text-link" href="#beneficios">
            VER BENEFÍCIOS <ChevronDown size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="conversion-trust-line">
          <span>
            <Check size={15} aria-hidden="true" /> Acesso após confirmação
          </span>
          <span>
            <Check size={15} aria-hidden="true" /> Dublado e legendado
          </span>
          <span>
            <Check size={15} aria-hidden="true" /> Sem anúncios nos episódios
          </span>
        </div>
      </section>

      <section className="conversion-together" aria-labelledby="conversion-together-title">
        <div className="conversion-shell">
          <p className="conversion-kicker">SEU CATÁLOGO EM UM SÓ LUGAR</p>
          <h2 id="conversion-together-title" className="conversion-heading">
            TUDO EM UM SÓ <span>LUGAR</span>
          </h2>
          <p className="conversion-section-copy">
            Abra o app, escolha a história e continue assistindo quando quiser.
          </p>
          <div className="conversion-type-pills" aria-label="Tipos de conteúdo">
            <span>Doramas</span>
            <span>Séries turcas</span>
            <span>Novelinhas</span>
            <span>Romance</span>
            <span>Drama</span>
            <span>Dublado</span>
            <span>Legendado</span>
          </div>
        </div>
      </section>

      <section className="conversion-catalog" aria-labelledby="conversion-catalog-title">
        <div className="conversion-shell">
          <p className="conversion-kicker">HISTÓRIAS PARA SE APAIXONAR</p>
          <h2 id="conversion-catalog-title" className="conversion-heading">
            EXPLORE O <span>CATÁLOGO</span>
          </h2>
        </div>
        {covers.length > 0 ? (
          <div className="conversion-cover-rail" aria-label="Capas de títulos do catálogo">
            {covers.map((item) => (
              <a href="#planos" key={item.id} title={`Ver planos para assistir ${item.title}`}>
                <img
                  src={item.cover_url || item.thumbnail_url || ""}
                  alt={`Capa de ${item.title}`}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="conversion-section-copy conversion-no-covers">
            Histórias novas estão chegando ao catálogo.
          </p>
        )}
      </section>

      <section className="conversion-benefits conversion-shell" id="beneficios">
        <p className="conversion-kicker">POR QUE ASSINAR</p>
        <h2 className="conversion-heading">
          TUDO O QUE VOCÊ AMA <span>EM UM LUGAR SÓ</span>
        </h2>
        <div className="conversion-benefits-grid">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article key={title}>
              <div className="conversion-icon">
                <Icon size={19} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="conversion-how">
        <div className="conversion-shell">
          <p className="conversion-kicker">COMECE EM POUCOS PASSOS</p>
          <h2 className="conversion-heading">
            SUA MARATONA <span>COMEÇA AQUI</span>
          </h2>
          <div className="conversion-steps">
            <article>
              <span>01</span>
              <h3>Escolha um plano</h3>
              <p>Veja os períodos de acesso e escolha o ideal para você.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Finalize a compra</h3>
              <p>Confira as condições no checkout e conclua o pagamento.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Acesse o app</h3>
              <p>Crie sua conta com o e-mail da compra ou entre na conta que já usa.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="conversion-pricing conversion-shell" id="planos">
        <p className="conversion-pill">
          <Heart size={14} aria-hidden="true" /> PLANOS FEED LOVES
        </p>
        <h2 className="conversion-heading">
          ESCOLHA SEU <span>PLANO</span>
        </h2>
        <p className="conversion-section-copy">
          Preço e período de acesso apresentados antes de você comprar.
        </p>
        {availablePlans.length ? (
          <div className="conversion-plan-grid">
            {availablePlans.map((plan) => (
              <article
                className={`conversion-plan ${plan.id === featuredPlan?.id ? "conversion-plan-featured" : ""}`}
                key={plan.id}
              >
                {plan.id === featuredPlan?.id ? (
                  <p className="conversion-plan-ribbon">
                    <Star size={13} fill="currentColor" aria-hidden="true" /> DESTAQUE
                  </p>
                ) : null}
                <p className="conversion-plan-label">{plan.name.toUpperCase()}</p>
                <h3>{periodLabel(plan)}</h3>
                <p className="conversion-price">{formatPrice(plan)}</p>
                {plan.description ? (
                  <p className="conversion-plan-description">{plan.description}</p>
                ) : null}
                <div className="conversion-plan-divider" />
                <ul>
                  <li>
                    <Check size={16} aria-hidden="true" /> Acesso ao catálogo completo
                  </li>
                  <li>
                    <Check size={16} aria-hidden="true" /> Doramas, séries e novelinhas
                  </li>
                  <li>
                    <Check size={16} aria-hidden="true" /> Dublado e legendado
                  </li>
                  <li>
                    <Check size={16} aria-hidden="true" /> Sem anúncios nos episódios
                  </li>
                  <li>
                    <Check size={16} aria-hidden="true" /> Assista em dispositivos compatíveis
                  </li>
                </ul>
                <a
                  href={plan.checkout_url || "#planos"}
                  className="conversion-button conversion-plan-cta"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => checkoutClick(event, plan)}
                >
                  ASSINAR AGORA <ArrowRight size={16} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="conversion-plans-unavailable" role="status">
            Os planos estão indisponíveis no momento. Tente novamente em breve.
          </div>
        )}
        <p className="conversion-checkout-note">
          <LockKeyhole size={15} aria-hidden="true" /> Pagamento no checkout seguro do parceiro ·
          acesso após confirmação
        </p>
      </section>

      <section className="conversion-compare">
        <div className="conversion-shell">
          <p className="conversion-kicker">TUDO ORGANIZADO PARA VOCÊ</p>
          <h2 className="conversion-heading">
            POR QUE ESCOLHER <span>FEED LOVES</span>
          </h2>
          <div
            className="conversion-compare-table"
            role="table"
            aria-label="O que está incluído no Feed Loves"
          >
            <div className="conversion-compare-row conversion-compare-head" role="row">
              <span role="columnheader">RECURSO</span>
              <span role="columnheader">FEED LOVES</span>
            </div>
            <div className="conversion-compare-row" role="row">
              <span role="cell">Doramas, séries turcas e novelinhas</span>
              <strong role="cell">
                <Check size={18} aria-label="Incluído" />
              </strong>
            </div>
            <div className="conversion-compare-row" role="row">
              <span role="cell">Continue de onde parou</span>
              <strong role="cell">
                <Check size={18} aria-label="Incluído" />
              </strong>
            </div>
            <div className="conversion-compare-row" role="row">
              <span role="cell">Minha lista de favoritos</span>
              <strong role="cell">
                <Check size={18} aria-label="Incluído" />
              </strong>
            </div>
            <div className="conversion-compare-row" role="row">
              <span role="cell">Sem anúncios nos episódios</span>
              <strong role="cell">
                <Check size={18} aria-label="Incluído" />
              </strong>
            </div>
            <div className="conversion-compare-row" role="row">
              <span role="cell">Suporte por WhatsApp</span>
              <strong role="cell">
                <Check size={18} aria-label="Incluído" />
              </strong>
            </div>
          </div>
          <a href="#planos" className="conversion-button">
            QUERO ASSINAR AGORA <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="conversion-faq conversion-shell" aria-labelledby="conversion-faq-title">
        <p className="conversion-kicker">TIRANDO SUAS DÚVIDAS</p>
        <h2 className="conversion-heading" id="conversion-faq-title">
          SEM MISTÉRIO. <span>TUDO CLARO.</span>
        </h2>
        <div className="conversion-faq-grid">
          {faq.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="conversion-final">
        <div className="conversion-shell">
          <Heart size={27} fill="currentColor" aria-hidden="true" />
          <h2 className="conversion-heading">
            SUA PRÓXIMA HISTÓRIA
            <br />
            <span>COMEÇA HOJE.</span>
          </h2>
          <p>
            Um catálogo para rir, torcer, se emocionar e apertar “próximo episódio” mais uma vez.
          </p>
          <a href="#planos" className="conversion-button">
            ESCOLHER MEU PLANO <ArrowRight size={16} aria-hidden="true" />
          </a>
          <small>
            <CreditCard size={13} aria-hidden="true" /> Confira as condições no checkout antes de
            pagar
          </small>
        </div>
      </section>

      <footer className="conversion-footer">
        <div className="conversion-shell conversion-footer-inner">
          <div>
            <a className="conversion-brand" href="/" aria-label="Feed Loves — página inicial">
              <img src="/assets/brand-v4.jpg" alt="" width="40" height="40" />
              <span>
                Feed <strong>Loves</strong>
              </span>
            </a>
            <p>Doramas, séries turcas e histórias para se apaixonar.</p>
          </div>
          <nav aria-label="Links da página">
            <a href="#beneficios">Benefícios</a>
            <a href="#planos">Planos</a>
            <a href="/login?redirect=%2Fapp">Entrar</a>
            <a
              href="https://wa.me/5511919332419?text=Preciso%20de%20ajuda%20com%20o%20acesso%20ao%20app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Suporte
            </a>
          </nav>
          <p className="conversion-copyright">© 2026 Feed Loves. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
