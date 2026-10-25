import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import originalMarkup from "../feed-loves-original.html?raw";
import { getPublishedCatalog } from "../lib/public/server-fns";
import { getCatalogCode } from "../lib/catalog-code";
import { WhatsAppSupportButton } from "../components/whatsapp-support-button";
import { HomeCinematicHeroPt } from "../components/home-cinematic-hero-pt";
import { HomeMultiplatformSectionPt } from "../components/home-multiplatform-section-pt";

// Configure European Portuguese / Euro checkout links
const CHECKOUT_WEEKLY =
  "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=XTSUYU1";
const CHECKOUT_MONTHLY =
  "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=ZVZ9FV7";
const CHECKOUT_ANNUAL =
  "https://checkout.applyfy.com.br/checkout/cmuoezoou05ca01onipslolbi?offer=WH555VJ";

// Adapt HTML markup to European Portuguese and Euro currency
let ptMarkup = originalMarkup
  // Checkout URLs
  .replaceAll("https://pay.wiapy.com/D1rAjQcO8bo_", CHECKOUT_WEEKLY)
  .replaceAll("https://pay.wiapy.com/JQcBx7Tif3vh", CHECKOUT_ANNUAL)
  .replaceAll("https://pay.wiapy.com/KaF1EsAXWGPC", CHECKOUT_MONTHLY)
  // Prices in plans
  .replaceAll("R$ 9,90", "€ 4,90")
  .replaceAll("R$ 99,90", "€ 19,90")
  .replaceAll("R$ 19,90", "€ 9,90")
  .replaceAll("Equivale a R$ 8,33/mês", "Equivale a € 1,65/mês")
  .replaceAll("Equivale a R$ 0,66 por dia", "Equivale a € 0,33 por dia")
  .replaceAll("QUERO 7 DIAS — R$ 9,90", "QUERO 7 DIAS — € 4,90")
  .replaceAll("QUERO 1 ANO — R$ 99,90", "QUERO 1 ANO — € 19,90")
  .replaceAll("QUERO 1 MÊS — R$ 19,90", "QUERO 1 MÊS — € 9,90")
  // Terminology & Spelling (pt-PT)
  .replaceAll("dubladas e legendadas", "dobradas e legendadas")
  .replaceAll("Dublados e legendados", "Dobrados e legendados")
  .replaceAll("Dublado e legendado", "Dobrado e legendado")
  .replaceAll("dublado e legendado", "dobrado e legendado")
  .replaceAll("DUBLADO E LEGENDADO", "DOBRADO E LEGENDADO")
  .replaceAll("DUBLADO", "DOBRADO")
  .replaceAll("Dublados", "Dobrados")
  .replaceAll("Dublado", "Dobrado")
  .replaceAll("celular", "telemóvel")
  .replaceAll("Celular", "Telemóvel")
  .replaceAll("computador", "computador")
  .replaceAll("Notebook", "Portátil")
  .replaceAll("notebook", "portátil")
  .replaceAll("novelinhas", "telenovelas")
  .replaceAll("Novelinhas", "Telenovelas")
  .replaceAll("Assista milhares de histórias", "Veja milhares de histórias")
  .replaceAll("Assista quando quiser", "Veja quando quiser")
  .replaceAll("Assista do seu jeito", "Veja à sua maneira")
  .replaceAll("Aperte o play e só assistir", "Carregue no play e comece a ver")
  .replaceAll("só mais um episódio...", "só mais um episódio...")
  .replaceAll("COMEÇAR A ASSISTIR", "COMEÇAR A VER")
  .replaceAll("Já sou assinante", "Já sou subscritor")
  .replaceAll("ASSINAR AGORA", "SUBSCREVER AGORA")
  .replaceAll("QUERO ASSINAR AGORA", "QUERO SUBSCREVER AGORA")
  .replaceAll("ASSINAR", "SUBSCREVER")
  .replaceAll("Por que assinar", "Porquê subscrever")
  .replaceAll("Sua próxima história", "A sua próxima história")
  .replaceAll("está esperando por você.", "está à sua espera.")
  .replaceAll("Receba no WhatsApp", "Receba no WhatsApp")
  .replaceAll("Receba também por e-mail", "Receba também por e-mail")
  .replaceAll("Ainda com <span class=\"text-primary\">dúvidas?</span>", "Ainda tem <span class=\"text-primary\">dúvidas?</span>");

// Replace multiplatform section with React slot
const homeMarkup = ptMarkup.replace(
  /<section class="page-shell grid items-center gap-12 py-20 lg:grid-cols-2">[\s\S]*?MULTIPLATAFORMA[\s\S]*?<\/section>/,
  '<div id="home-multiplatform-slot"></div>',
);

export const Route = createFileRoute("/pt")({
  head: () => ({
    meta: [
      { title: "Feed Loves | Doramas, séries e histórias para se apaixonar" },
      {
        name: "description",
        content:
          "Descubra romances, doramas, séries turcas e telenovelas para a sua próxima maratona no Feed Loves.",
      },
      { property: "og:title", content: "Feed Loves | Histórias para se apaixonar" },
      {
        property: "og:description",
        content: "Um universo de doramas, séries e histórias para a sua próxima maratona.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getPublishedCatalog(),
  component: IndexPt,
});

function IndexPt() {
  const { series } = Route.useLoaderData();
  useEffect(() => {
    const answers: Record<string, string> = {
      "O que é o Feed Loves?":
        "O Feed Loves é uma plataforma com histórias para quem adora romances, doramas, séries turcas e telenovelas.",
      "Quando meu acesso é liberado?":
        "Os dados de acesso são enviados imediatamente após a confirmação da subscrição.",
      "Preciso instalar algum aplicativo?":
        "Não. Pode aceder diretamente pelo navegador de internet em dispositivos compatíveis.",
      "Tem anúncios durante os episódios?":
        "Não. Todos os planos incluem uma experiência fluida, sem quaisquer anúncios durante os episódios.",
      "Posso assistir pelo celular?":
        "Sim, pode ver através do navegador do telemóvel em dispositivos compatíveis.",
      "Posso assistir pelo computador?":
        "Sim, pelo navegador em computadores e computadores portáteis compatíveis.",
      "Posso assistir na televisão?":
        "O acesso pode ser feito diretamente no navegador da sua Smart TV compatível.",
      "Existem conteúdos dublados e legendados?":
        "Sim, dispomos de conteúdos dobrados e legendados em português, consoante a disponibilidade de cada título.",
      "Como funciona o suporte?":
        "A nossa equipa de apoio ao cliente está sempre disponível através do WhatsApp e e-mail para ajudar em qualquer questão.",
      "Como cancelo a renovação?":
        "Pode cancelar a renovação automática a qualquer momento com total autonomia e sem complicações.",
    };
    const cleanups: Array<() => void> = [];
    const buttons = Array.from(document.querySelectorAll("button"));
    const faqButtons = buttons.filter((button) => answers[button.textContent?.trim() ?? ""]);

    const catalog = document.querySelector("#catalogo");
    if (catalog && series.length) {
      catalog.innerHTML = "";
      const groups = new Map<string, typeof series>();
      series.forEach((item) => {
        const group = item.category || item.genre || "Feed Loves";
        groups.set(group, [...(groups.get(group) ?? []), item]);
      });
      const orderedGroups = Array.from(groups.entries()).sort(
        ([, firstItems], [, secondItems]) => secondItems.length - firstItems.length,
      );
      orderedGroups.forEach(([category, items]) => {
        const section = document.createElement("section");
        section.className = "home-dynamic-section";
        const heading = document.createElement("div");
        heading.className = "home-dynamic-heading";
        const headingCopy = document.createElement("div");
        const eyebrow = document.createElement("p");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = "CATÁLOGO EM DESTAQUE";
        const headingTitle = document.createElement("h2");
        headingTitle.className = "display-title";
        headingTitle.textContent = category;
        headingCopy.append(eyebrow, headingTitle);
        const controls = document.createElement("div");
        controls.className = "home-carousel-controls";
        const previousButton = document.createElement("button");
        previousButton.type = "button";
        previousButton.className = "home-carousel-button";
        previousButton.setAttribute("aria-label", `Ver títulos anteriores de ${category}`);
        previousButton.textContent = "‹";
        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "home-carousel-button";
        nextButton.setAttribute("aria-label", `Ver mais títulos de ${category}`);
        nextButton.textContent = "›";
        controls.append(previousButton, nextButton);
        heading.append(headingCopy, controls);
        const grid = document.createElement("div");
        grid.className = "home-dynamic-grid";
        items.forEach((item) => {
          const article = document.createElement("article");
          article.className = "home-dynamic-card";
          const link = document.createElement("a");
          link.href = "#planos";
          link.setAttribute("aria-label", `Ver planos para ver ${item.title}`);
          const cover = document.createElement("div");
          cover.className = "home-dynamic-cover";
          const image = document.createElement("img");
          image.src = item.cover_url || item.thumbnail_url || "/assets/poster1.jpg";
          image.alt = `Capa de ${item.title}`;
          image.loading = "lazy";
          image.decoding = "async";
          const playIndicator = document.createElement("span");
          playIndicator.className = "home-dynamic-play";
          playIndicator.setAttribute("aria-hidden", "true");
          cover.append(image, playIndicator);
          const title = document.createElement("h3");
          title.textContent = `${item.title} · ${getCatalogCode(item.id)}`;
          link.append(cover, title);
          article.append(link);
          grid.append(article);
        });
        const scrollCarousel = (direction: number) => {
          grid.scrollBy({
            left: direction * Math.max(grid.clientWidth * 0.82, 260),
            behavior: "smooth",
          });
        };
        const scrollPrevious = () => scrollCarousel(-1);
        const scrollNext = () => scrollCarousel(1);
        previousButton.addEventListener("click", scrollPrevious);
        nextButton.addEventListener("click", scrollNext);
        cleanups.push(() => previousButton.removeEventListener("click", scrollPrevious));
        cleanups.push(() => nextButton.removeEventListener("click", scrollNext));
        section.append(heading, grid);
        catalog.append(section);
      });
      const dynamicStyle = document.createElement("style");
      dynamicStyle.textContent = `.home-dynamic-section{margin-top:44px;content-visibility:auto;contain-intrinsic-size:390px}.home-dynamic-section:first-child{margin-top:0}.home-dynamic-heading{display:flex;align-items:end;justify-content:space-between;gap:18px}.home-dynamic-heading h2{margin-top:8px;text-align:left}.home-carousel-controls{display:flex;gap:7px}.home-carousel-button{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--border);border-radius:50%;background:color-mix(in srgb,var(--card) 92%,transparent);color:var(--foreground);font-size:27px;line-height:1;cursor:pointer;transition:border-color .2s,background .2s,transform .2s}.home-carousel-button:hover,.home-carousel-button:focus-visible{border-color:var(--primary);background:var(--primary);color:var(--primary-foreground);transform:scale(1.04)}.home-dynamic-grid{display:flex;justify-content:safe center;gap:14px;overflow-x:auto;margin-top:20px;padding:1px 2px 12px;scroll-behavior:smooth;scroll-snap-type:x mandatory;scroll-padding-inline:2px;overscroll-behavior-inline:contain;scrollbar-width:none}.home-dynamic-grid::-webkit-scrollbar{display:none}.home-dynamic-card{flex:0 0 clamp(150px,17vw,205px);min-width:0;scroll-snap-align:start}.home-dynamic-card a{display:block;color:inherit;text-decoration:none}.home-dynamic-cover{position:relative;aspect-ratio:2/3;overflow:hidden;border:1px solid var(--border);border-radius:9px;background:#090509}.home-dynamic-cover img{width:100%;height:100%;display:block;object-fit:contain;transition:transform .3s;content-visibility:auto}.home-dynamic-card:hover img,.home-dynamic-card a:focus-visible img{transform:scale(1.025)}.home-dynamic-play{position:absolute;inset:0;z-index:1;display:grid;place-items:center;background:#08040866;opacity:0;transition:opacity .2s ease;pointer-events:none}.home-dynamic-play::before{content:'▶';display:grid;place-items:center;width:54px;height:54px;padding-left:3px;border-radius:50%;background:var(--primary);color:var(--primary-foreground);font-size:20px;box-shadow:0 0 28px #f33ca899;transform:scale(.9);transition:transform .2s ease}.home-dynamic-card:hover .home-dynamic-play,.home-dynamic-card a:focus-visible .home-dynamic-play{opacity:1}.home-dynamic-card:hover .home-dynamic-play::before,.home-dynamic-card a:focus-visible .home-dynamic-play::before{transform:scale(1)}.home-dynamic-card h3{margin:9px 2px 0;font-size:12px;font-weight:700;line-height:1.3;text-align:center}@media(hover:none){.home-dynamic-card:hover img{transform:none}.home-dynamic-card:hover .home-dynamic-play{opacity:0}}@media(max-width:700px){.home-dynamic-play,.home-dynamic-card:hover .home-dynamic-play,.home-dynamic-card a:focus-visible .home-dynamic-play{opacity:0!important}}@media(max-width:639px){.home-dynamic-section{margin-top:30px}.home-dynamic-heading{align-items:center}.home-dynamic-heading .eyebrow{display:none}.home-dynamic-heading h2{margin:0;font-size:18px;line-height:1.2}.home-dynamic-card{flex-basis:calc((100% - 20px)/3)}.home-dynamic-card h3{margin-top:7px;font-size:10px}.home-carousel-button{width:31px;height:31px;font-size:22px}.home-dynamic-grid{gap:10px;margin-top:12px;padding-bottom:8px}}`;
      document.head.append(dynamicStyle);
      cleanups.push(() => dynamicStyle.remove());
    }
    const catalogCards = Array.from(catalog?.querySelectorAll("article") ?? []);
    const catalogStyle = document.createElement("style");
    catalogStyle.textContent = `
      #catalogo article .home-catalog-cover{cursor:pointer}
      #catalogo article .home-catalog-play{position:absolute;inset:0;display:grid;place-items:center;background:#08040888;color:white;opacity:0;transition:opacity .2s ease;border:0;cursor:pointer}
      #catalogo article:hover .home-catalog-play,#catalogo article:focus-within .home-catalog-play{opacity:1}
      #catalogo article .home-catalog-play span{display:grid;place-items:center;width:54px;height:54px;border-radius:50%;background:var(--primary);box-shadow:0 0 28px #f33ca899;transform:scale(.9);transition:transform .2s ease}
      #catalogo article:hover .home-catalog-play span,#catalogo article:focus-within .home-catalog-play span{transform:scale(1)}
      @media (hover:none){#catalogo article .home-catalog-play{opacity:1}}
      .home-subscription-layer{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:#080408cc;backdrop-filter:blur(7px)}
      .home-subscription-dialog{position:relative;width:min(92vw,440px);padding:36px 28px 28px;border:1px solid #ff69c4aa;border-radius:20px;background:linear-gradient(145deg,#270d24,#100611);box-shadow:0 24px 80px #0009,0 0 32px #ff4fb544;text-align:center}
      .home-subscription-dialog h2{font:700 31px/1.1 "Playfair Display",Georgia,serif}
      .home-subscription-dialog p{margin:14px auto 0;max-width:330px;color:#dec8d8;line-height:1.6}
      .home-subscription-dialog .home-subscription-cta{display:inline-flex;margin-top:23px;padding:13px 22px;border-radius:999px;background:var(--primary);color:var(--primary-foreground);font-size:12px;font-weight:800}
      .home-subscription-close{position:absolute;top:10px;right:10px;width:34px;height:34px;border:1px solid #ff69c466;border-radius:50%;background:#180918;color:#f8d5eb;font-size:22px;cursor:pointer}
    `;
    document.head.append(catalogStyle);

    const openSubscriptionDialog = () => {
      if (document.querySelector(".home-subscription-layer")) return;
      const layer = document.createElement("div");
      layer.className = "home-subscription-layer";
      layer.innerHTML = `
        <div class="home-subscription-dialog" role="dialog" aria-modal="true" aria-labelledby="home-subscription-title">
          <button class="home-subscription-close" type="button" aria-label="Fechar">×</button>
          <div style="font-size:30px;color:var(--primary)">♥</div>
          <h2 id="home-subscription-title">Subscreva para ver</h2>
          <p>Este conteúdo faz parte do catálogo Feed Loves. Escolha um plano para libertar o acesso e começar a sua maratona.</p>
          <a class="home-subscription-cta" href="#planos">VER PLANOS E SUBSCREVER →</a>
        </div>
      `;
      document.body.append(layer);
      const close = () => layer.remove();
      layer.querySelector(".home-subscription-close")?.addEventListener("click", close);
      layer.querySelector(".home-subscription-cta")?.addEventListener("click", close);
      layer.addEventListener("click", (event) => {
        if (event.target === layer) close();
      });
    };

    catalogCards.forEach((card) => {
      const cover = card.querySelector("div.relative");
      if (!cover) return;
      cover.classList.add("home-catalog-cover");
      const playButton = document.createElement("button");
      playButton.className = "home-catalog-play";
      playButton.type = "button";
      playButton.setAttribute(
        "aria-label",
        "Subscrever para ver " + (card.querySelector("h3")?.textContent ?? "este conteúdo"),
      );
      playButton.innerHTML = '<span aria-hidden="true">▶</span>';
      playButton.addEventListener("click", openSubscriptionDialog);
      cover.append(playButton);
      cleanups.push(() => playButton.removeEventListener("click", openSubscriptionDialog));
    });
    cleanups.push(() => {
      catalogStyle.remove();
      catalogCards.forEach((card) => card.querySelector(".home-catalog-play")?.remove());
    });

    faqButtons.forEach((button) => {
      const handler = () => {
        const parent = button.parentElement;
        if (!parent) return;
        const existing = parent.querySelector(".copied-faq-answer");
        faqButtons.forEach((other) => {
          if (other !== button) {
            other.setAttribute("aria-expanded", "false");
            other.parentElement?.querySelector(".copied-faq-answer")?.remove();
          }
        });
        if (existing) {
          existing.remove();
          button.setAttribute("aria-expanded", "false");
        } else {
          const answer = document.createElement("p");
          answer.className = "copied-faq-answer";
          answer.textContent = answers[button.textContent?.trim() ?? ""] ?? "";
          parent.append(answer);
          button.setAttribute("aria-expanded", "true");
        }
      };
      button.addEventListener("click", handler);
      cleanups.push(() => button.removeEventListener("click", handler));
    });

    const menuButton = buttons.find((button) => button.getAttribute("aria-label") === "Abrir menu");
    if (menuButton) {
      const handler = () => {
        const header = menuButton.closest("header");
        if (!header) return;
        const existing = header.querySelector(".copied-mobile-menu");
        if (existing) {
          existing.remove();
          menuButton.setAttribute("aria-label", "Abrir menu");
          menuButton.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>';
        } else {
          const nav = document.createElement("nav");
          nav.className = "copied-mobile-menu";
          nav.innerHTML =
            '<a href="/criar-conta">CRIAR CONTA GRÁTIS</a><a href="#catalogo">Catálogo</a><a href="#planos">Planos</a><a href="#faq">Dúvidas</a><a href="#faq">Apoio</a>';
          header.append(nav);
          menuButton.setAttribute("aria-label", "Fechar menu");
          menuButton.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
          nav
            .querySelectorAll("a")
            .forEach((link) => link.addEventListener("click", handler, { once: true }));
        }
      };
      menuButton.addEventListener("click", handler);
      cleanups.push(() => menuButton.removeEventListener("click", handler));
    }

    buttons
      .filter((button) =>
        ["Entrar", "Já sou assinante", "Já sou subscritor"].includes(button.textContent?.trim() ?? ""),
      )
      .forEach((button) => {
        const handler = () => {
          window.location.href = "/login";
        };
        button.addEventListener("click", handler);
        cleanups.push(() => button.removeEventListener("click", handler));
      });

    const subscriberButton = buttons.find((button) =>
      ["Já sou assinante", "Já sou subscritor"].includes(button.textContent?.trim() ?? ""),
    );
    const loginButton = buttons.find((button) => button.textContent?.trim() === "Entrar");
    if (subscriberButton) {
      subscriberButton.textContent = "JÁ SOU SUBSCRITOR";
      subscriberButton.className =
        "home-subscriber-button inline-flex items-center justify-center whitespace-nowrap rounded-md bg-purple-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-purple-500";
      subscriberButton.style.setProperty("color", "#ffffff", "important");
      subscriberButton.style.setProperty("background-color", "#9333ea", "important");
      subscriberButton.style.setProperty("border-color", "transparent", "important");
    }
    const signButton = Array.from(document.querySelectorAll("header a")).find((link) =>
      ["ASSINAR", "SUBSCREVER"].includes(link.textContent?.trim() ?? ""),
    );
    const actions = signButton?.parentElement ?? (subscriberButton ?? loginButton)?.parentElement;
    if (actions && !actions.querySelector(".home-create-account")) {
      const link = document.createElement("a");
      link.className =
        "home-create-account inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-pink-soft";
      link.href = "/criar-conta";
      link.textContent = "CRIAR CONTA GRÁTIS";
      actions.insertBefore(link, signButton ?? subscriberButton ?? loginButton ?? null);
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [series]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: homeMarkup }} />
      <HomeCinematicHeroPt series={series} />
      <HomeMultiplatformSectionPt />
      <WhatsAppSupportButton />
    </>
  );
}
