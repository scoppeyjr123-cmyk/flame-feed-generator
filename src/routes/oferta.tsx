import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { SubscriptionModal } from "../components/subscription-modal";
import {
  getPublicOfferSettings,
  getPublicPlans,
  getPublishedCatalog,
  type PartTwoSettings,
  type PublicPlan,
} from "../lib/public/server-fns";
import conversionCss from "../conversion.css?url";

export const Route = createFileRoute("/oferta")({
  loader: async () => {
    const [planResult, catalogResult, video] = await Promise.all([
      getPublicPlans(),
      getPublishedCatalog(),
      getPublicOfferSettings(),
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
  component: OfferRoute,
});

function OfferRoute() {
  return <ConversionPage {...Route.useLoaderData()} />;
}

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

const catalogHighlights = [
  "Doramas",
  "Dramas-K",
  "Séries turcas",
  "Novelinhas",
  "Dublados",
  "Legendados",
  "Romances",
  "Suspense",
  "Minha lista",
  "Continue assistindo",
];

const experienceHighlights = [
  {
    icon: Clapperboard,
    title: "Escolha sua próxima história",
    description: "Navegue pelas categorias e encontre um título para começar.",
  },
  {
    icon: Play,
    title: "Assista no seu ritmo",
    description: "Continue de onde parou e acompanhe seus episódios no app.",
  },
  {
    icon: Heart,
    title: "Guarde seus favoritos",
    description: "Crie sua lista para voltar às histórias que mais gostou.",
  },
  {
    icon: Smartphone,
    title: "Assista onde preferir",
    description: "Acesse pelo navegador no celular, tablet ou computador compatível.",
  },
];

const testimonials = [
  {
    name: "Ana Beatriz",
    quote:
      "Eu pagava 4 streamings diferentes e ainda assim não achava meus doramas. Aqui tem tudo, dublado, e nunca trava!",
  },
  {
    name: "Carolina Mendes",
    quote:
      "O catálogo é gigante. Já vi mais de 30 doramas e sempre tem novidade. Vale cada centavo.",
  },
  {
    name: "Júlia Ferreira",
    quote:
      "Saí do Telegram e nunca mais voltei. Qualidade HD, sem propaganda, suporte responde rápido.",
  },
  {
    name: "Luzia Fernandes",
    quote: "Muito boa a plataforma, valeu cada centavo. já recomendei pras amigas.",
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

export function ConversionPage({
  plans,
  series,
  video,
  isPartTwo = false,
}: {
  plans: PublicPlan[];
  series: Awaited<ReturnType<typeof getPublishedCatalog>>["series"];
  video: PartTwoSettings;
  isPartTwo?: boolean;
}) {
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [campaignVideo, setCampaignVideo] = useState({
    url: video.videoUrl,
    poster: video.posterUrl,
    title: video.headline,
  });
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  useEffect(() => {
    if (!isPartTwo) return;
    const params = new URLSearchParams(window.location.search);
    setCampaignVideo({
      url: params.get("video") || video.videoUrl,
      poster: params.get("capa") || video.posterUrl,
      title: params.get("titulo") || video.headline,
    });
    const tracker = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof tracker === "function") {
      tracker("track", "ViewContent", {
        content_name: "Feed Loves — Parte 2",
        content_category: "episode",
      });
    }
  }, [isPartTwo, video]);
  const availablePlans = plans.filter((plan) => plan.checkout_url);
  const featuredPlan = availablePlans.find((plan) => plan.featured) ?? availablePlans[0];
  const covers = series.filter((item) => item.cover_url || item.thumbnail_url).slice(0, 30);
  const catalogMilestone =
    series.length > 10 ? Math.floor((series.length - 1) / 10) * 10 : series.length - 1;
  const showcaseCover = covers[showcaseIndex] ?? covers[0];
  const customOfferHeadline = !isPartTwo
    ? video.offerHeadline
        ?.split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 3)
    : null;
  const heroLines = customOfferHeadline?.length
    ? customOfferHeadline
    : [
        series.length >= 2 ? "ASSISTA MAIS DE" : "DESCUBRA NOVOS",
        series.length >= 2 ? `${catalogMilestone} DRAMAS` : "DRAMAS",
        "SEM LIMITES",
      ];

  return (
    <main className={`conversion-page${isPartTwo ? " conversion-page-part-two" : ""}`}>
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
          <Sparkles size={14} aria-hidden="true" />{" "}
          {isPartTwo ? video.eyebrow : "CONTEÚDO ATUALIZADO · CATÁLOGO FEED LOVES"}
        </p>
        <h1 id="conversion-title">
          {heroLines[0]}
          {heroLines[1] ? <span>{heroLines[1]}</span> : null}
          {heroLines[2] ? <em>{heroLines[2]}</em> : null}
        </h1>
        <p className="conversion-hero-copy">
          {isPartTwo
            ? `${campaignVideo.title}. ${video.subheadline}`
            : "Doramas coreanos, séries turcas e novelinhas — dublados e legendados para assistir quando quiser. Tudo em um só lugar."}
        </p>

        <div className={`conversion-video-frame${isPartTwo ? " conversion-video-portrait" : ""}`}>
          {campaignVideo.url ? (
            <EpisodePlayer
              videoUrl={campaignVideo.url}
              posterUrl={campaignVideo.poster}
              title={isPartTwo ? campaignVideo.title : "Conheça o Feed Loves"}
              autoPlay
              {...(isPartTwo ? { onEnded: () => setIsSubscriptionModalOpen(true) } : {})}
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
            <Play size={16} fill="currentColor" aria-hidden="true" />{" "}
            {isPartTwo ? video.ctaText : "QUERO ASSISTIR AGORA"}
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
            Uma assinatura, várias categorias para maratonar.
          </p>
          <div className="conversion-content-grid" aria-label="Explore tipos de conteúdo">
            {catalogHighlights.map((title) => (
              <div className="conversion-content-tile" key={title}>
                <span>{title}</span>
              </div>
            ))}
          </div>
          <p className="conversion-together-footnote">E MUITAS HISTÓRIAS PARA DESCOBRIR...</p>
        </div>
      </section>

      <section className="conversion-catalog" aria-labelledby="conversion-catalog-title">
        <div className="conversion-shell">
          <p className="conversion-kicker">HISTÓRIAS PARA SE APAIXONAR</p>
          <h2 id="conversion-catalog-title" className="conversion-heading">
            EXPLORE O <span>CATÁLOGO</span>
          </h2>
          <p className="conversion-section-copy">
            {video.catalogSubtitle || `${series.length} títulos publicados para você descobrir.`}
          </p>
        </div>
        {covers.length > 0 ? (
          <div className="conversion-cover-rail" aria-label="Capas do catálogo em movimento">
            <div className={`conversion-cover-track${covers.length < 2 ? " is-static" : ""}`}>
              {[0, 1].map((copy) => (
                <div
                  className="conversion-cover-group"
                  key={copy}
                  aria-hidden={copy === 1 || undefined}
                >
                  {covers.map((item) =>
                    copy === 0 ? (
                      <a
                        href="#planos"
                        key={item.id}
                        title={`Ver planos para assistir ${item.title}`}
                      >
                        <img
                          src={item.cover_url || item.thumbnail_url || ""}
                          alt={`Capa de ${item.title}`}
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                    ) : (
                      <span className="conversion-cover-copy" key={item.id}>
                        <img
                          src={item.cover_url || item.thumbnail_url || ""}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                    ),
                  )}
                </div>
              ))}
            </div>
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

      <section className="conversion-experience" aria-labelledby="conversion-experience-title">
        <div className="conversion-shell">
          <p className="conversion-kicker">FEITO PARA A SUA MARATONA</p>
          <h2 className="conversion-heading" id="conversion-experience-title">
            UMA EXPERIÊNCIA PARA <span>SE APAIXONAR</span>
          </h2>
          <p className="conversion-section-copy">
            Encontre, acompanhe e salve as histórias que você ama.
          </p>
          <div className="conversion-experience-grid">
            {experienceHighlights.map(({ icon: Icon, title, description }) => (
              <article key={title}>
                <Icon size={25} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="conversion-testimonials" aria-labelledby="conversion-testimonials-title">
        <div className="conversion-shell">
          <p className="conversion-kicker">A VOZ DE QUEM ASSISTE</p>
          <h2 className="conversion-heading" id="conversion-testimonials-title">
            O QUE ESTÃO <span>DIZENDO</span>
          </h2>
          <p className="conversion-section-copy">Relatos compartilhados para esta página.</p>
          <div className="conversion-testimonials-grid">
            {testimonials.map(({ name, quote }) => (
              <figure className="conversion-testimonial-card" key={name}>
                <Heart size={18} fill="currentColor" aria-hidden="true" />
                <blockquote>“{quote}”</blockquote>
                <figcaption>
                  <span className="conversion-testimonial-avatar" aria-hidden="true">
                    {name.charAt(0)}
                  </span>
                  <strong>{name}</strong>
                </figcaption>
              </figure>
            ))}
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
          <p className="conversion-section-copy">Veja o que muda ao escolher uma assinatura.</p>
          <div className="conversion-compare-scroll">
            <table className="conversion-compare-table">
              <caption className="sr-only">
                Comparação entre conta grátis e assinatura Feed Loves
              </caption>
              <thead>
                <tr>
                  <th scope="col">RECURSO</th>
                  <th scope="col">CONTA GRÁTIS</th>
                  <th scope="col">ASSINATURA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Explorar o catálogo</th>
                  <td>Sim</td>
                  <td>Sim</td>
                </tr>
                <tr>
                  <th scope="row">Tempo de reprodução</th>
                  <td>20 minutos no total</td>
                  <td>Sem limite de minutos no período contratado</td>
                </tr>
                <tr>
                  <th scope="row">Acesso ao catálogo completo</th>
                  <td>Após assinar</td>
                  <td>
                    <Check size={18} aria-label="Incluído" />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Continue de onde parou</th>
                  <td>
                    <Check size={18} aria-label="Incluído" />
                  </td>
                  <td>
                    <Check size={18} aria-label="Incluído" />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Minha lista</th>
                  <td>
                    <Check size={18} aria-label="Incluído" />
                  </td>
                  <td>
                    <Check size={18} aria-label="Incluído" />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Suporte por WhatsApp</th>
                  <td>
                    <Check size={18} aria-label="Incluído" />
                  </td>
                  <td>
                    <Check size={18} aria-label="Incluído" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <a href="#planos" className="conversion-button">
            QUERO ASSINAR AGORA <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      {showcaseCover && (
        <section className="conversion-showcase" aria-labelledby="conversion-showcase-title">
          <div className="conversion-shell">
            <p className="conversion-kicker">ESCOLHA SUA PRÓXIMA HISTÓRIA</p>
            <h2 className="conversion-heading" id="conversion-showcase-title">
              VEJA O QUE ESTÁ NO <span>CATÁLOGO</span>
            </h2>
            <p className="conversion-section-copy">Capas de títulos publicados no Feed Loves.</p>
            <div className="conversion-showcase-stage">
              <button
                type="button"
                aria-label="Capa anterior"
                onClick={() =>
                  setShowcaseIndex((index) => (index - 1 + covers.length) % covers.length)
                }
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <figure>
                <img
                  src={showcaseCover.cover_url || showcaseCover.thumbnail_url || ""}
                  alt={`Capa de ${showcaseCover.title}`}
                  loading="lazy"
                />
                <figcaption>{showcaseCover.title}</figcaption>
              </figure>
              <button
                type="button"
                aria-label="Próxima capa"
                onClick={() => setShowcaseIndex((index) => (index + 1) % covers.length)}
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </div>
            <div className="conversion-showcase-dots" aria-label="Escolher capa">
              {covers.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={showcaseIndex === index ? "is-active" : ""}
                  aria-label={`Mostrar capa de ${item.title}`}
                  aria-current={showcaseIndex === index ? "true" : undefined}
                  onClick={() => setShowcaseIndex(index)}
                />
              ))}
            </div>
            <a href="#planos" className="conversion-button">
              QUERO ASSINAR AGORA <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
      )}

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
      {isPartTwo ? (
        <SubscriptionModal
          open={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          onContinue={() => {
            setIsSubscriptionModalOpen(false);
            document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      ) : null}
    </main>
  );
}
