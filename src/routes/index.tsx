import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import originalMarkup from "../feed-loves-original.html?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Feed Loves | Doramas, séries e histórias para se apaixonar" },
      {
        name: "description",
        content:
          "Descubra romances, doramas, séries turcas e novelinhas para a sua próxima maratona no Feed Loves.",
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
  component: Index,
});

function Index() {
  useEffect(() => {
    const answers: Record<string, string> = {
      "O que é o Feed Loves?":
        "O Feed Loves é uma vitrine de histórias para quem ama romances, doramas, séries turcas e novelinhas.",
      "Quando meu acesso é liberado?":
        "As informações de acesso são enviadas após a confirmação da assinatura.",
      "Preciso instalar algum aplicativo?":
        "Você pode acessar pelo navegador em dispositivos compatíveis.",
      "Tem anúncios durante os episódios?":
        "Os planos apresentados incluem uma experiência sem anúncios durante os episódios.",
      "Posso assistir pelo celular?":
        "Sim, você pode assistir pelo navegador do celular em dispositivos compatíveis.",
      "Posso assistir pelo computador?": "Sim, pelo navegador em computadores compatíveis.",
      "Posso assistir na televisão?":
        "O acesso pode ser feito em navegadores de Smart TVs compatíveis.",
      "Existem conteúdos dublados e legendados?":
        "As opções de áudio e legenda variam conforme o conteúdo.",
      "Como funciona o suporte?":
        "Os canais de atendimento serão informados quando a assinatura estiver disponível.",
      "Como cancelo a renovação?":
        "As condições de cancelamento serão apresentadas antes da contratação.",
    };
    const cleanups: Array<() => void> = [];
    const buttons = Array.from(document.querySelectorAll("button"));
    const faqButtons = buttons.filter((button) => answers[button.textContent?.trim() ?? ""]);

    const catalog = document.querySelector("#catalogo");
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
          <h2 id="home-subscription-title">Assine para assistir</h2>
          <p>Esse conteúdo faz parte do catálogo Feed Loves. Escolha um plano para liberar o acesso e começar sua maratona.</p>
          <a class="home-subscription-cta" href="#planos">VER PLANOS E ASSINAR →</a>
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
        "Assinar para assistir " + (card.querySelector("h3")?.textContent ?? "este conteúdo"),
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
            '<a href="#catalogo">Catálogo</a><a href="#planos">Planos</a><a href="#faq">Dúvidas</a><a href="#faq">Suporte</a>';
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

    const openDialog = () => {
      if (document.querySelector(".copied-dialog-layer")) return;
      const layer = document.createElement("div");
      layer.className = "copied-dialog-layer";
      layer.innerHTML =
        '<div class="copied-dialog" role="dialog" aria-modal="true" aria-labelledby="access-title"><button class="copied-dialog-close" aria-label="Fechar">×</button><div class="copied-shield">♢</div><h2 id="access-title">Acesso Feed Loves</h2><p>A entrada para assinantes ainda não está disponível nesta página.</p><button class="copied-understood">ENTENDI</button></div>';
      document.body.append(layer);
      const close = () => layer.remove();
      layer.querySelector(".copied-dialog-close")?.addEventListener("click", close);
      layer.querySelector(".copied-understood")?.addEventListener("click", close);
      layer.addEventListener("click", (event) => {
        if (event.target === layer) close();
      });
    };
    buttons
      .filter((button) => ["Entrar", "Já sou assinante"].includes(button.textContent?.trim() ?? ""))
      .forEach((button) => {
        const handler = () => {
          window.location.href = "/login";
        };
        button.addEventListener("click", handler);
        cleanups.push(() => button.removeEventListener("click", handler));
      });

    const subscriberButton = buttons.find((button) => button.textContent?.trim() === "Já sou assinante");
    const actions = subscriberButton?.parentElement;
    if (actions && !actions.querySelector(".home-create-account")) {
      const link = document.createElement("a");
      link.className = "home-create-account inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-pink-soft";
      link.href = "/criar-conta";
      link.textContent = "CRIAR CONTA GRÁTIS";
      actions.insertBefore(link, subscriberButton);
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: originalMarkup }} />;
}
