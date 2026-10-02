import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, LockKeyhole, Heart, ChevronLeft, Check, Sparkles, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/assistir")({
  head: () => ({
    meta: [
      { title: "Assistir episódio | Feed Loves" },
      { name: "description", content: "Continue sua história favorita no Feed Loves." },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const [showPlans, setShowPlans] = useState(false);
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const title = params.get("titulo") || "A história continua";
  const episode = params.get("episodio") || "Parte 2";
  const videoUrl = params.get("video");
  const poster = params.get("capa");

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="bg-primary text-primary-foreground">
        <div className="page-shell flex h-8 items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[.14em]">
          <span>✦ OFERTA ESPECIAL · ACESSO COMPLETO AO FEED LOVES</span>
          <a className="shrink-0 rounded-full bg-primary-foreground px-3 py-1 text-[9px] text-primary hover:opacity-80" href="/#planos">ASSINAR AGORA</a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="page-shell flex h-17 items-center justify-between gap-5">
          <Link to="/" aria-label="Feed Loves — início" className="inline-flex shrink-0 items-center gap-2.5">
            <img alt="" className="size-11 rounded-full" src="/__l5e/assets-v1/93a77862-54bb-4a64-aedc-f2f5ba7697a3/brand.png"/>
            <span className="font-sans text-lg font-bold tracking-normal text-foreground">Feed <span className="text-primary">Loves</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link to="/#catalogo" className="hover:text-primary">Catálogo</Link>
            <Link to="/#planos" className="hover:text-primary">Planos</Link>
            <Link to="/#faq" className="hover:text-primary">Dúvidas</Link>
          </nav>
          <Link to="/#planos" className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-pink-soft">ASSINAR</Link>
        </div>
      </header>

      <section className="hero-atmosphere pb-10 pt-8 text-center sm:pt-12">
        <div className="page-shell">
          <Link to="/" className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/15"><ChevronLeft size={14}/> VOLTAR AO CATÁLOGO</Link>
          <p className="eyebrow">✦ SUA PRÓXIMA MARATONA</p>
          <h1 className="display-title mx-auto mt-4 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">{title}<br/><span className="text-pink-soft">{episode} — a história continua</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">Cada capítulo guarda uma surpresa. Continue sua história favorita no Feed Loves.</p>
        </div>
      </section>

      <section className="section-atmosphere border-y border-border/50 py-10 sm:py-14">
        <div className="page-shell">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
                {videoUrl ? (
                  <video className="absolute inset-0 size-full bg-background object-contain" controls playsInline poster={poster || undefined} src={videoUrl}>Seu navegador não suporta vídeo HTML5.</video>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-card px-5 text-center">
                    {poster && <img src={poster} alt="" className="absolute inset-0 size-full object-cover opacity-20 blur-sm"/>}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20"/>
                    <div className="relative flex size-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary"><Play size={25} fill="currentColor"/></div>
                    <p className="display-title relative mt-5 text-2xl sm:text-3xl">A história continua</p>
                    <p className="relative mt-3 max-w-md text-sm leading-6 text-muted-foreground">O próximo capítulo está esperando por você. O vídeo será exibido aqui quando o endereço do episódio for configurado.</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 py-4">
                <div><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{episode} · Feed Loves</p></div>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Heart size={14} className="text-primary"/> Feito para quem ama histórias</span>
              </div>
            </div>

            <aside className="section-atmosphere rounded-lg border border-border bg-card p-5 sm:p-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary"><LockKeyhole size={13}/> ACESSO COMPLETO</span>
              <h2 className="display-title mt-5 text-3xl leading-tight">Não pare a história <span className="text-pink-soft">por aqui.</span></h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Assine o Feed Loves para desbloquear os episódios disponíveis e continuar sua maratona de romances, doramas e séries turcas.</p>
              <ul className="my-5 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><Check size={16} className="shrink-0 text-primary}/> Histórias para assistir quando quiser</li>
                <li className="flex gap-2"><Check size={16} className="shrink-0 text-primary}/> Catálogo de romances e dramas</li>
                <li className="flex gap-2"><Check size={16} className="shrink-0 text-primary}/> Acesso conforme o plano escolhido</li>
              </ul>
              <a href="/#planos" className="pink-glow inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-pink-soft">VER PLANOS E ASSINAR <ChevronRight size={17}/></a>
              <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">Consulte valores, condições e detalhes de acesso antes de assinar.</p>
              <button onClick={() => setShowPlans(!showPlans)} className="mt-4 w-full border-t border-border/60 pt-4 text-xs text-muted-foreground transition hover:text-foreground">{showPlans ? "Ocultar detalhes −" : "Como funciona a assinatura? +"}</button>
              {showPlans && <p className="mt-3 text-xs leading-5 text-muted-foreground">Escolha um dos planos na página inicial e confira preço, período de cobrança, conteúdo incluído e regras de cancelamento no checkout.</p>}
            </aside>
          </div>
        </div>
      </section>

      <section className="hero-atmosphere border-b border-border/40 px-4 py-14 text-center sm:py-20">
        <div className="page-shell">
          <p className="eyebrow">✦ SÓ MAIS UM CAPÍTULO…</p>
          <h2 className="display-title mx-auto mt-4 max-w-2xl text-3xl sm:text-5xl">Sua próxima história <span className="text-pink-soft">está esperando por você.</span></h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-muted-foreground">Encontre sua próxima história favorita e escolha o plano que combina com a sua maratona.</p>
          <a href="/#planos" className="pink-glow mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-pink-soft">QUERO CONTINUAR ASSISTINDO <ChevronRight size={17}/></a>
        </div>
      </section>

      <footer className="border-t border-border/50 bg-background py-8">
        <div className="page-shell flex flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-foreground"><img alt="" className="size-8 rounded-full" src="/__l5e/assets-v1/93a77862-54bb-4a64-aedc-f2f5ba7697a3/brand.png"/> Feed <span className="text-primary">Loves</span></Link>
          <span>Histórias para se apaixonar, capítulo a capítulo.</span>
          <Link to="/#planos" className="hover:text-primary">Conhecer os planos</Link>
        </div>
      </footer>
    </main>
  );
}
