import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import originalMarkup from "../feed-loves-original.html?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Feed Loves | Doramas, séries e histórias para se apaixonar" },
      { name: "description", content: "Descubra romances, doramas, séries turcas e novelinhas para a sua próxima maratona no Feed Loves." },
      { property: "og:title", content: "Feed Loves | Histórias para se apaixonar" },
      { property: "og:description", content: "Um universo de doramas, séries e histórias para a sua próxima maratona." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    const answers: Record<string, string> = {
      "O que é o Feed Loves?": "O Feed Loves é uma vitrine de histórias para quem ama romances, doramas, séries turcas e novelinhas.",
      "Quando meu acesso é liberado?": "As informações de acesso são enviadas após a confirmação da assinatura.",
      "Preciso instalar algum aplicativo?": "Você pode acessar pelo navegador em dispositivos compatíveis.",
      "Tem anúncios durante os episódios?": "Os planos apresentados incluem uma experiência sem anúncios durante os episódios.",
      "Posso assistir pelo celular?": "Sim, você pode assistir pelo navegador do celular em dispositivos compatíveis.",
      "Posso assistir pelo computador?": "Sim, pelo navegador em computadores compatíveis.",
      "Posso assistir na televisão?": "O acesso pode ser feito em navegadores de Smart TVs compatíveis.",
      "Existem conteúdos dublados e legendados?": "As opções de áudio e legenda variam conforme o conteúdo.",
      "Como funciona o suporte?": "Os canais de atendimento serão informados quando a assinatura estiver disponível.",
      "Como cancelo a renovação?": "As condições de cancelamento serão apresentadas antes da contratação.",
    };
    const cleanups: Array<() => void> = [];
    const buttons = Array.from(document.querySelectorAll("button"));
    const faqButtons = buttons.filter((button) => answers[button.textContent?.trim() ?? ""]);

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
          answer.textContent = answers[button.textContent?.trim() ?? ""];
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
          menuButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>';
        } else {
          const nav = document.createElement("nav");
          nav.className = "copied-mobile-menu";
          nav.innerHTML = '<a href="#catalogo">Catálogo</a><a href="#planos">Planos</a><a href="#faq">Dúvidas</a><a href="#faq">Suporte</a>';
          header.append(nav);
          menuButton.setAttribute("aria-label", "Fechar menu");
          menuButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
          nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", handler, { once: true }));
        }
      };
      menuButton.addEventListener("click", handler);
      cleanups.push(() => menuButton.removeEventListener("click", handler));
    }

    const openDialog = () => {
      if (document.querySelector(".copied-dialog-layer")) return;
      const layer = document.createElement("div");
      layer.className = "copied-dialog-layer";
      layer.innerHTML = '<div class="copied-dialog" role="dialog" aria-modal="true" aria-labelledby="access-title"><button class="copied-dialog-close" aria-label="Fechar">×</button><div class="copied-shield">♢</div><h2 id="access-title">Acesso Feed Loves</h2><p>A entrada para assinantes ainda não está disponível nesta página.</p><button class="copied-understood">ENTENDI</button></div>';
      document.body.append(layer);
      const close = () => layer.remove();
      layer.querySelector(".copied-dialog-close")?.addEventListener("click", close);
      layer.querySelector(".copied-understood")?.addEventListener("click", close);
      layer.addEventListener("click", (event) => { if (event.target === layer) close(); });
    };
    buttons.filter((button) => ["Entrar", "Já sou assinante"].includes(button.textContent?.trim() ?? "")).forEach((button) => {
      button.addEventListener("click", openDialog);
      cleanups.push(() => button.removeEventListener("click", openDialog));
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: originalMarkup }} />;
}
