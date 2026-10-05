import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Heart, LockKeyhole, MonitorSmartphone, Play } from "lucide-react";
import { EpisodePlayer } from "../components/episode-player";
import { PricingPlans } from "../components/pricing-plans";
import { SubscriptionModal } from "../components/subscription-modal";
import { getPublicPlans } from "../lib/public/server-fns";

export const Route = createFileRoute("/parte-2")({
  loader: () => getPublicPlans(),
  head: () => ({
    meta: [
      { title: "Parte 2 — a história continua | Feed Loves" },
      {
        name: "description",
        content:
          "Continue a história no Feed Loves e descubra as próximas mini novelas, doramas e episódios.",
      },
      { property: "og:title", content: "Parte 2 — a história continua | Feed Loves" },
      {
        property: "og:description",
        content: "Sua próxima história espera por você no Feed Loves.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PartTwoPage,
});

// Troque por uma URL pública de MP4/HLS quando o vídeo definitivo estiver pronto.
// Também é possível passar ?video=URL&capa=URL&titulo=Nome%20da%20historia na campanha.
const episodeVideoUrl = "https://player.vimeo.com/video/1231112345";
const episodePosterUrl = "";

const posters = [
  {
    title: "My Queen, My Rules",
    category: "ROMANCE",
    src: "/assets/poster1.jpg",
  },
  {
    title: "Dolunay",
    category: "DUBLADO",
    src: "/assets/poster2.jpg",
  },
  {
    title: "Scandal",
    category: "ÉPOCA",
    src: "/assets/poster3.jpg",
  },
  {
    title: "Muhtemel Aşk",
    category: "COMÉDIA ROMÂNTICA",
    src: "/assets/poster4.jpg",
  },
];

const faqItems = [
  {
    question: "Como funciona a assinatura?",
    answer:
      "Escolha o plano que combina com a sua maratona e confira o preço, o período de acesso e as condições no checkout antes de concluir o pagamento.",
  },
  {
    question: "Posso assistir pelo celular?",
    answer:
      "Sim. Você pode assistir pelo navegador do celular em dispositivos compatíveis, além de usar tablet ou computador.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "As condições de cancelamento e renovação são apresentadas antes da contratação. Confira esses detalhes no checkout do plano escolhido.",
  },
  {
    question: "O acesso é liberado na hora?",
    answer: "As informações de acesso são enviadas após a confirmação da assinatura.",
  },
];

function PartTwoPage() {
  const { plans: configuredPlans } = Route.useLoaderData();
  const [videoUrl, setVideoUrl] = useState(episodeVideoUrl);
  const [posterUrl, setPosterUrl] = useState(episodePosterUrl);
  const [episodeTitle, setEpisodeTitle] = useState("Parte 2 — a história continua");
  const [offerUnlocked, setOfferUnlocked] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [plansHighlighted, setPlansHighlighted] = useState(false);
  const unlockDeadlineRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | undefined>(undefined);
  const unlockAfterSeconds = 240; // 240 segundos desde a abertura da página.

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setVideoUrl(params.get("video") || episodeVideoUrl);
    setPosterUrl(params.get("capa") || episodePosterUrl);
    setEpisodeTitle(params.get("titulo") || "Parte 2 — a história continua");

    // Only use a Meta Pixel that the host site has already initialized.
    // No pixel IDs or third-party tracking scripts are added by this route.
    const tracker = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof tracker === "function") {
      tracker("track", "ViewContent", {
        content_name: "Feed Loves — Parte 2",
        content_category: "episode",
      });
    }
  }, []);

  useEffect(() => {
    if (offerUnlocked) return;
    // Um único prazo absoluto impede reinícios em re-renderizações e compensa atrasos da aba.
    if (unlockDeadlineRef.current === null) {
      unlockDeadlineRef.current = Date.now() + unlockAfterSeconds * 1000;
    }
    let timerId: number | undefined;
    const checkDeadline = () => {
      if (timerId !== undefined) window.clearTimeout(timerId);
      const remaining = (unlockDeadlineRef.current ?? Date.now()) - Date.now();
      if (remaining <= 0) {
        setOfferUnlocked(true);
        return;
      }
      timerId = window.setTimeout(checkDeadline, remaining);
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkDeadline();
    };
    checkDeadline();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (timerId !== undefined) window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [offerUnlocked]);

  const scrollToPlans = useCallback(() => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleEpisodeEnded = useCallback(() => {
    setOfferUnlocked(true);
    setIsSubscriptionModalOpen(true);
  }, []);

  const handleSubscriptionContinue = useCallback(() => {
    setOfferUnlocked(true);
    setIsSubscriptionModalOpen(false);
    setPlansHighlighted(true);

    if (highlightTimerRef.current !== undefined) window.clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = window.setTimeout(() => {
      setPlansHighlighted(false);
      highlightTimerRef.current = undefined;
    }, 1600);

    window.requestAnimationFrame(scrollToPlans);
  }, [scrollToPlans]);

  const handleSubscriptionModalClose = useCallback(() => {
    setIsSubscriptionModalOpen(false);
  }, []);

  useEffect(
    () => () => {
      if (highlightTimerRef.current !== undefined) window.clearTimeout(highlightTimerRef.current);
    },
    [],
  );

  return (
    <main className="part2-page">
      <style>{`
        .part2-page{min-height:100vh;overflow:hidden;background:var(--background);color:var(--foreground);font-family:Outfit,Inter,system-ui,sans-serif}
        .part2-page *{box-sizing:border-box}
        .part2-page a{color:inherit;text-decoration:none}
        .part2-shell{width:min(100% - 32px,1080px);margin:0 auto}
        .part2-header{position:sticky;top:0;z-index:30;border-bottom:1px solid color-mix(in oklab,var(--border) 70%,transparent);background:color-mix(in oklab,var(--background) 93%,transparent);backdrop-filter:blur(16px)}
        .part2-header-inner{min-height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px}
        .part2-brand{display:inline-flex;align-items:center;gap:9px;font-size:18px;font-weight:800;letter-spacing:-.3px}
        .part2-brand img{width:36px;height:36px;border-radius:50%;object-fit:cover}
        .part2-brand span{color:var(--primary)}
        .part2-member{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 15px;border:1px solid var(--border);border-radius:999px;color:var(--foreground);font-size:12px;font-weight:600;transition:border-color .2s,color .2s}
        .part2-member:hover{border-color:var(--primary);color:var(--primary)}
        .part2-hero{padding:28px 0 24px;text-align:center;background:radial-gradient(ellipse at 50% 0%,color-mix(in oklab,var(--primary) 11%,transparent),transparent 65%)}
        .part2-eyebrow{display:flex;align-items:center;justify-content:center;gap:7px;color:var(--primary);font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
        .part2-hero h1{margin:11px auto 0;font-family:"Playfair Display",Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.12;letter-spacing:-.025em}
        .part2-hero h1 span,.part2-section-heading h2 span{color:var(--pink-soft,var(--primary))}
        .part2-hero-copy{margin:10px auto 0;max-width:520px;color:var(--muted-foreground);font-size:13px;line-height:1.6}
        .part2-video-section{padding:8px 0 30px}
        .part2-video-wrap{width:min(100%,430px);margin:0 auto;padding:2px;border-radius:20px;background:linear-gradient(145deg,#ff69c4aa,#9d3cff55 48%,#ff4fb588);box-shadow:0 12px 42px #f33ca81c}
        .part2-player-frame{position:relative;aspect-ratio:9/16;width:100%;overflow:hidden;border:1px solid color-mix(in oklab,var(--primary) 72%,#ffb6df);border-radius:18px;background:radial-gradient(ellipse at 50% 35%,#35102b 0%,#170914 50%,#080408 100%);box-shadow:0 14px 45px #f33ca822,0 0 0 1px #f33ca81c,0 0 24px #ff4fb51f;isolation:isolate}
        .part2-player-video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#050305}
        .part2-player-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.22;filter:blur(3px)}
        .part2-player-overlay{position:absolute;inset:0;background:linear-gradient(180deg,#08040840,#08040899 50%,#080408e8)}
        .part2-player-placeholder-content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px;text-align:center}
        .part2-play-icon{display:grid;place-items:center;width:62px;height:62px;border-radius:50%;border:1px solid #ff66ba80;background:var(--primary);color:var(--primary-foreground);box-shadow:0 0 34px #f33ca84d}
        .part2-player-label{margin:22px 0 0;color:#ff79c3;font-size:10px;font-weight:800;letter-spacing:.14em}
        .part2-player-placeholder-content h2{margin:10px 0;font:700 clamp(25px,4vw,34px)/1.12 "Playfair Display",Georgia,serif}
        .part2-player-help{max-width:270px;margin:0;color:#d3bfce;font-size:12px;line-height:1.7}
        .part2-video-caption{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;color:var(--muted-foreground);font-size:11px}
        .part2-video-caption strong{display:block;color:var(--foreground);font-size:13px}
        .part2-exclusive{display:inline-flex;align-items:center;gap:6px;color:var(--primary);white-space:nowrap}
        .part2-delayed-offer{padding:14px 0 8px;text-align:center;background:linear-gradient(180deg,transparent,color-mix(in oklab,var(--primary) 4%,transparent));scroll-margin-top:78px}
        .part2-delayed-copy{margin:0 auto;color:var(--muted-foreground);font-size:clamp(13px,2vw,15px);line-height:1.6;text-align:center}
        .part2-delayed-copy span{color:var(--primary);font-size:18px}
        .part2-watch-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;margin:14px auto 0;padding:13px 26px;border:1px solid var(--primary);border-radius:999px;background:var(--primary);color:var(--primary-foreground)!important;font-size:12px;font-weight:800;letter-spacing:.02em;box-shadow:0 5px 22px #f33ca833;animation:part2-cta-pulse 2.2s ease-in-out infinite;cursor:pointer;min-width:min(100%,280px)}
        .part2-watch-cta:hover{filter:brightness(1.06)}
        @keyframes part2-cta-pulse{0%,100%{box-shadow:0 5px 22px #f33ca822}50%{box-shadow:0 5px 30px #f33ca866}}
        @media(prefers-reduced-motion:reduce){.part2-watch-cta{animation:none}}
        .part2-offer-locked{max-width:620px;margin:0 auto;padding:20px;border:1px solid var(--border);border-radius:14px;background:color-mix(in oklab,var(--card) 72%,var(--background))}
        .part2-offer-locked p{margin:8px 0 0;color:var(--muted-foreground);font-size:12px;line-height:1.65}
        .part2-offer-locked strong{color:var(--foreground)}
        .part2-heart{display:grid;place-items:center;width:42px;height:42px;margin:0 auto 12px;border:1px solid color-mix(in oklab,var(--primary) 36%,var(--border));border-radius:50%;background:color-mix(in oklab,var(--primary) 10%,var(--card));color:var(--primary)}
        .part2-transition h2,.part2-final h2{margin:0;font:700 clamp(25px,4vw,36px)/1.15 "Playfair Display",Georgia,serif}
        .part2-transition>p{max-width:560px;margin:10px auto 0;color:var(--muted-foreground);font-size:13px;line-height:1.7}
        .part2-benefits{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 18px;margin:20px auto 0;padding:0;list-style:none;color:var(--muted-foreground);font-size:12px}
        .part2-benefits li{display:flex;align-items:center;gap:6px}
        .part2-benefits svg{color:var(--primary);flex:none}
        .part2-scroll-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;margin-top:20px;padding:12px 22px;border-radius:999px;background:var(--primary);color:var(--primary-foreground)!important;font-size:12px;font-weight:800;box-shadow:0 8px 30px #f33ca82b;transition:transform .2s,background .2s}
        .part2-scroll-cta:hover{transform:translateY(-1px);background:var(--pink-soft)}
        .part2-pricing{padding:34px 0 40px;scroll-margin-top:78px}
        .part2-pricing.is-highlighted{animation:part2-plans-highlight 1.6s ease-out both}
        @keyframes part2-plans-highlight{0%{filter:drop-shadow(0 0 0 transparent)}25%{filter:drop-shadow(0 0 18px #ff4fb566)}100%{filter:drop-shadow(0 0 0 transparent)}}
        .part2-modal-overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;overflow:auto;padding:max(20px,env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left));background:#070307cc;backdrop-filter:blur(6px);animation:part2-modal-fade-in .24s ease-out both;overscroll-behavior:contain}
        .part2-subscription-modal{position:relative;width:min(90vw,470px);max-height:calc(100dvh - 40px);overflow:auto;padding:42px clamp(22px,6vw,42px) 30px;border:1px solid #ff69c4aa;border-radius:22px;background:radial-gradient(ellipse at 50% 0%,#7d1b5a55,transparent 58%),linear-gradient(145deg,#260d23,#100611 72%);box-shadow:0 24px 80px #00000099,0 0 0 1px #ff4fb52b,0 0 34px #ff4fb533;text-align:center;animation:part2-modal-scale-in .24s ease-out both}
        .part2-subscription-modal-close{position:absolute;top:12px;right:12px;display:grid;place-items:center;width:38px;height:38px;border:1px solid #ff69c466;border-radius:50%;background:#180918;color:#f8d5eb;cursor:pointer;transition:background .2s,color .2s,border-color .2s}
        .part2-subscription-modal-close:hover,.part2-subscription-modal-close:focus-visible{border-color:var(--primary);background:#3b1232;color:#fff;outline:none}
        .part2-subscription-modal-icon{display:block;color:#ff79c3;font-size:29px;line-height:1;text-shadow:0 0 20px #ff4fb588}
        .part2-subscription-modal h2{margin:17px auto 0;max-width:360px;font:700 clamp(27px,6vw,38px)/1.1 "Playfair Display",Georgia,serif;letter-spacing:-.025em}
        .part2-subscription-modal p{margin:15px auto 0;max-width:350px;color:#dec8d8;font-size:14px;line-height:1.7}
        .part2-subscription-modal-cta{display:flex;align-items:center;justify-content:center;width:100%;min-height:52px;margin:24px auto 0;padding:14px 18px;border:1px solid var(--primary);border-radius:999px;background:var(--primary);color:var(--primary-foreground);font-size:12px;font-weight:800;letter-spacing:.015em;box-shadow:0 8px 30px #f33ca855;cursor:pointer;transition:filter .2s,transform .2s}
        .part2-subscription-modal-cta:hover{filter:brightness(1.08);transform:translateY(-1px)}
        .part2-subscription-modal-cta:focus-visible{outline:2px solid #ffd5ee;outline-offset:3px}
        .part2-subscription-modal small{display:block;margin-top:14px;color:#c7aec0;font-size:11px;line-height:1.5}
        @keyframes part2-modal-fade-in{from{opacity:0}to{opacity:1}}
        @keyframes part2-modal-scale-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
        @media(prefers-reduced-motion:reduce){.part2-pricing.is-highlighted{animation:none;box-shadow:0 0 0 2px #ff4fb566}.part2-modal-overlay,.part2-subscription-modal{animation:none}.part2-subscription-modal-cta{transition:none}}
        .part2-section-heading{text-align:center}
        .part2-section-heading h2{margin:10px 0 0;font:700 clamp(27px,4.5vw,42px)/1.15 "Playfair Display",Georgia,serif}
        .part2-section-heading>p:not(.part2-eyebrow){margin:11px auto 0;color:var(--muted-foreground);font-size:13px;line-height:1.65}
        .part2-plan-perks{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 18px;margin-top:17px;color:var(--muted-foreground);font-size:11px}
        .part2-plan-perks span{display:flex;align-items:center;gap:5px}.part2-plan-perks svg{color:var(--primary)}
        .part2-plan-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch;gap:15px;margin-top:32px}
        .part2-plan-card{position:relative;display:flex;flex-direction:column;min-width:0;padding:24px 20px 20px;border:1px solid var(--border);border-radius:12px;background:var(--card);box-shadow:0 12px 35px #00000014}
        .part2-plan-card.is-featured{border-color:var(--primary);box-shadow:0 0 0 1px color-mix(in oklab,var(--primary) 20%,transparent),0 12px 38px #f33ca812}
        .part2-plan-badge{position:absolute;top:-12px;left:50%;display:flex;align-items:center;gap:5px;transform:translateX(-50%);white-space:nowrap;padding:6px 12px;border-radius:999px;background:var(--primary);color:var(--primary-foreground);font-size:9px;font-weight:800}
        .part2-plan-label{margin:0;color:var(--primary);font-size:10px;font-weight:800;letter-spacing:.14em}
        .part2-plan-card h3{margin:12px 0 0;font-size:34px;line-height:1.1;font-weight:800;letter-spacing:-.04em}
        .part2-plan-duration{margin:8px 0 0;color:var(--muted-foreground);font-size:12px}
        .part2-plan-highlight{min-height:19px;margin:9px 0 0;color:var(--primary);font-size:12px;font-weight:700}
        .part2-plan-card ul{display:grid;gap:11px;margin:20px 0 22px;padding:17px 0 0;border-top:1px solid var(--border);list-style:none;color:var(--muted-foreground);font-size:12px;line-height:1.4}
        .part2-plan-card li{display:flex;align-items:flex-start;gap:8px}.part2-plan-card li svg{flex:none;color:var(--primary)}
        .part2-plan-cta{display:flex;align-items:center;justify-content:center;gap:5px;min-height:42px;margin-top:auto;padding:10px 12px;border:1px solid var(--border);border-radius:999px;color:var(--foreground)!important;text-align:center;font-size:10px;font-weight:800;transition:background .2s,border-color .2s}
        .part2-plan-cta:hover{border-color:var(--primary);background:color-mix(in oklab,var(--primary) 8%,transparent)}
        .part2-plan-cta.is-primary{border-color:var(--primary);background:var(--primary);color:var(--primary-foreground)!important;box-shadow:0 5px 22px #f33ca825}
        .part2-access-note{margin-top:27px;text-align:center}
        .part2-access-title{margin:0;color:var(--primary);font-size:11px;font-weight:800}
        .part2-access-note>p:not(.part2-access-title){margin:8px 0 0;color:var(--muted-foreground);font-size:12px;line-height:1.6}
        .part2-access-note>div{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 17px;margin-top:15px;color:var(--muted-foreground);font-size:10px}
        .part2-access-note small{display:block;margin-top:18px;color:var(--muted-foreground);font-size:10px}
        .part2-catalog{padding:36px 0 42px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:color-mix(in oklab,var(--card) 48%,var(--background))}
        .part2-catalog h2{text-align:center;margin:0;font:700 clamp(25px,4vw,34px)/1.15 "Playfair Display",Georgia,serif}
        .part2-catalog h2 span{color:var(--primary)}
        .part2-catalog-sub{margin:10px 0 0;text-align:center;color:var(--muted-foreground);font-size:12px}
        .part2-poster-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:24px}
        .part2-poster{min-width:0}
        .part2-poster-image{position:relative;overflow:hidden;aspect-ratio:3/4;border:1px solid var(--border);border-radius:9px;background:var(--card)}
        .part2-poster-image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}
        .part2-poster:hover img{transform:scale(1.04)}
        .part2-poster-image span{position:absolute;top:8px;left:8px;max-width:calc(100% - 16px);padding:5px 7px;border-radius:4px;background:var(--primary);color:var(--primary-foreground);font-size:8px;font-weight:800}
        .part2-poster h3{margin:9px 0 0;font-size:12px;font-weight:700}
        .part2-poster p{margin:4px 0 0;color:var(--primary);font-size:9px;font-weight:800;letter-spacing:.08em}
        .part2-faq{padding:40px 0}
        .part2-faq h2{text-align:center;margin:0 0 22px;font:700 clamp(26px,4vw,34px)/1.15 "Playfair Display",Georgia,serif}
        .part2-faq-list{max-width:760px;margin:0 auto;border-top:1px solid var(--border)}
        .part2-faq details{border-bottom:1px solid var(--border)}
        .part2-faq summary{position:relative;cursor:pointer;list-style:none;padding:17px 34px 17px 3px;font-size:13px;font-weight:600}
        .part2-faq summary::-webkit-details-marker{display:none}
        .part2-faq summary:after{content:"+";position:absolute;right:4px;top:13px;color:var(--primary);font-size:21px;font-weight:400}
        .part2-faq details[open] summary:after{content:"−"}
        .part2-faq details p{margin:0;padding:0 28px 17px 3px;color:var(--muted-foreground);font-size:12px;line-height:1.75}
        .part2-final{padding:36px 16px 42px;text-align:center;background:radial-gradient(ellipse at 50% 100%,color-mix(in oklab,var(--primary) 12%,transparent),transparent 70%)}
        .part2-final p{margin:10px 0 0;color:var(--muted-foreground);font-size:12px}
        .part2-footer{border-top:1px solid var(--border);padding:20px 0;color:var(--muted-foreground);font-size:10px}
        .part2-footer-inner{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
        .part2-footer-links{display:flex;flex-wrap:wrap;gap:15px}
        .part2-footer a:hover{color:var(--primary)}
        @media(max-width:700px){.part2-shell{width:min(100% - 28px,520px)}.part2-header-inner{min-height:58px}.part2-brand{font-size:16px}.part2-brand img{width:31px;height:31px}.part2-member{min-height:35px;padding:7px 11px;font-size:11px}.part2-hero{padding:22px 0 17px}.part2-hero h1{font-size:30px}.part2-hero-copy{font-size:12px;margin-top:8px}.part2-video-section{padding-top:4px;padding-bottom:24px}.part2-video-wrap{width:min(100%,360px)}.part2-player-frame{border-radius:13px}.part2-video-caption{font-size:10px}.part2-video-caption strong{font-size:12px}.part2-delayed-offer{padding-top:18px}.part2-offer-locked{padding:17px}.part2-transition h2{font-size:27px}.part2-transition>p{font-size:12px}.part2-benefits{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:min(100%,360px);justify-content:start;gap:11px;font-size:11px;text-align:left}.part2-scroll-cta{width:100%;max-width:360px}.part2-pricing{padding:28px 0 32px}.part2-section-heading h2{font-size:29px}.part2-plan-perks{gap:9px 12px;font-size:10px}.part2-plan-grid{grid-template-columns:1fr;gap:17px;width:min(100%,390px);margin:29px auto 0}.part2-plan-card{padding:23px 20px 19px}.part2-plan-card h3{font-size:32px}.part2-plan-highlight{min-height:unset}.part2-plan-card ul{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px;font-size:11px}.part2-plan-cta{min-height:46px;font-size:11px}.part2-access-note>div{gap:9px 12px}.part2-catalog{padding:30px 0 32px}.part2-poster-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:17px 12px;margin-top:20px}.part2-poster h3{font-size:11px}.part2-faq{padding:32px 0}.part2-faq summary{font-size:12px}.part2-final{padding:30px 14px 35px}.part2-footer-inner{justify-content:center;text-align:center}.part2-footer-links{justify-content:center}}
        @media(prefers-reduced-motion:reduce){.part2-page *{scroll-behavior:auto!important;transition:none!important}}
      `}</style>

      <header className="part2-header">
        <div className="part2-shell part2-header-inner">
          <Link to="/" className="part2-brand" aria-label="Feed Loves — página inicial">
            <img src="/assets/brand-v3.png" alt="" />
            <span style={{ color: "var(--foreground)" }}>
              Feed <span>Loves</span>
            </span>
          </Link>
          <a className="part2-member" href="/#planos">
            Já sou assinante
          </a>
        </div>
      </header>

      <section className="part2-hero">
        <div className="part2-shell">
          <p className="part2-eyebrow">
            <Play size={12} fill="currentColor" /> CONTINUAÇÃO EXCLUSIVA
          </p>
          <h1>
            {(() => {
              const [first, ...rest] = episodeTitle.split("—");
              return rest.length ? (
                <>
                  {first?.trim()} <span>— {rest.join("—").trim()}</span>
                </>
              ) : (
                <>
                  {episodeTitle} <span>— a história continua</span>
                </>
              );
            })()}
          </h1>
          <p className="part2-hero-copy">
            Você chegou até aqui. Agora descubra o que acontece depois.
          </p>
        </div>
      </section>

      <section className="part2-video-section" aria-label="Assistir à Parte 2">
        <div className="part2-shell">
          <div className="part2-video-wrap">
            <EpisodePlayer
              videoUrl={videoUrl}
              posterUrl={posterUrl}
              title={episodeTitle}
              onEnded={handleEpisodeEnded}
            />
            <div className="part2-video-caption">
              <div>
                <strong>{episodeTitle}</strong>
                <span>Feed Loves · Mini novelas</span>
              </div>
              <span className="part2-exclusive">
                <LockKeyhole size={13} /> Continuação
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="part2-delayed-offer" id="continuar" aria-live="polite">
        <div className="part2-shell">
          {offerUnlocked ? (
            <>
              <button type="button" className="part2-watch-cta" onClick={scrollToPlans}>
                <Play size={15} fill="currentColor" /> CONTINUE ASSISTINDO
              </button>
              <div id="planos-revelados">
                <PricingPlans
                  remotePlans={configuredPlans}
                  className={plansHighlighted ? "is-highlighted" : ""}
                />
              </div>
            </>
          ) : (
            <p className="part2-delayed-copy">
              Aqui você vai maratonar, se emocionar, chorar e rir muito! <span>♡</span>
            </p>
          )}
        </div>
      </section>

      <section className="part2-catalog">
        <div className="part2-shell">
          <h2>
            E isso é <span>só o começo…</span>
          </h2>
          <p className="part2-catalog-sub">Explore outras histórias disponíveis no Feed Loves.</p>
          <div className="part2-poster-grid">
            {posters.map((poster) => (
              <article className="part2-poster" key={poster.title}>
                <div className="part2-poster-image">
                  <img src={poster.src} alt={`Capa de ${poster.title}`} loading="lazy" />
                  <span>{poster.category}</span>
                </div>
                <h3>{poster.title}</h3>
                <p>{poster.category}</p>
              </article>
            ))}
          </div>
          {offerUnlocked ? (
            <div style={{ textAlign: "center", paddingTop: 24 }}>
              <button type="button" className="part2-watch-cta" onClick={scrollToPlans}>
                <Play size={15} fill="currentColor" /> CONTINUE ASSISTINDO
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="part2-faq">
        <div className="part2-shell">
          <h2>Dúvidas frequentes</h2>
          <div className="part2-faq-list">
            {faqItems.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {offerUnlocked ? (
        <section className="part2-final">
          <h2>Pronta para a próxima história?</h2>
          <p>Escolha seu plano e continue sua maratona no Feed Loves.</p>
          <button type="button" className="part2-watch-cta" onClick={scrollToPlans}>
            <Play size={15} fill="currentColor" /> CONTINUE ASSISTINDO
          </button>
        </section>
      ) : null}

      <footer className="part2-footer">
        <div className="part2-shell part2-footer-inner">
          <Link to="/" className="part2-brand" aria-label="Feed Loves — página inicial">
            <img src="/assets/brand-v3.png" alt="" />
            <span style={{ color: "var(--foreground)" }}>
              Feed <span>Loves</span>
            </span>
          </Link>
          <span>Histórias para se apaixonar, capítulo a capítulo.</span>
          <nav className="part2-footer-links" aria-label="Links legais">
            <a href="/#catalogo">Catálogo</a>
            <a href="/#planos">Planos</a>
            <a href="/#faq">Dúvidas</a>
          </nav>
        </div>
      </footer>

      <SubscriptionModal
        open={isSubscriptionModalOpen}
        onClose={handleSubscriptionModalClose}
        onContinue={handleSubscriptionContinue}
      />
    </main>
  );
}
