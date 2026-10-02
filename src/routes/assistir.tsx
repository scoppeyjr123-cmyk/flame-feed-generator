import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, LockKeyhole, Heart, ChevronLeft, Check, Sparkles } from "lucide-react";

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
  const plansUrl = "/#planos";

  return (
    <main className="min-h-screen bg-[#080408] text-white">
      <div className="h-2 bg-[#ff3eae]" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090509]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Feed Loves — início">
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-700 text-lg">♥</span>
            <span className="text-lg font-bold">Feed <span className="text-[#ff3eae]">Loves</span></span>
          </Link>
          <Link to="/#planos" className="rounded-full bg-[#ff3eae] px-5 py-2 text-xs font-extrabold text-black transition hover:bg-pink-300">ASSINAR AGORA</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-[#ff3eae]"><ChevronLeft size={16}/> Voltar ao catálogo</Link>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-[#ff3eae]">SUA PRÓXIMA MARATONA</p>
            <h1 className="text-2xl font-black sm:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-white/55">{episode} · Prepare-se para descobrir o que acontece agora.</p>
          </div>
          <span className="rounded-full border border-[#ff3eae]/40 bg-[#ff3eae]/10 px-3 py-1.5 text-xs text-pink-200">Romance • Drama</span>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#160b15] shadow-[0_20px_80px_rgba(255,62,174,.09)]">
              {videoUrl ? (
                <video className="size-full bg-black object-contain" controls playsInline poster={poster || undefined} src={videoUrl}>
                  Seu navegador não suporta vídeo HTML5.
                </video>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-5 text-center">
                  {poster && <img src={poster} alt="" className="absolute inset-0 size-full object-cover opacity-25 blur-sm" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080408] via-[#080408]/55 to-[#080408]/20" />
                  <div className="relative flex size-16 items-center justify-center rounded-full border border-[#ff3eae]/60 bg-[#ff3eae]/15 text-[#ff3eae]"><Play fill="currentColor" size={25}/></div>
                  <p className="relative mt-5 text-lg font-bold sm:text-2xl">O próximo capítulo começa aqui</p>
                  <p className="relative mt-2 max-w-md text-sm text-white/60">Adicione o endereço do vídeo deste episódio para disponibilizar a reprodução nesta área.</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.03] p-4">
              <div><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-white/50">{episode} · Feed Loves</p></div>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/55"><Heart size={14} className="text-[#ff3eae]"/> Feito para quem ama histórias</span>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#ff3eae]/25 bg-gradient-to-b from-[#251020] to-[#100910] p-5 sm:p-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ff3eae]/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#ff78c7]"><LockKeyhole size={13}/> Continue com acesso completo</span>
            <h2 className="mt-4 text-2xl font-black leading-tight">Não pare a história <span className="text-[#ff3eae]">por aqui.</span></h2>
            <p className="mt-3 text-sm leading-6 text-white/65">Assine o Feed Loves para desbloquear os episódios disponíveis e continuar sua maratona de romances, doramas e séries turcas.</p>
            <ul className="my-5 space-y-3 text-sm text-white/80">
              <li className="flex gap-2"><Check size={17} className="shrink-0 text-[#ff3eae]"/> Histórias para assistir quando quiser</li>
              <li className="flex gap-2"><Check size={17} className="shrink-0 text-[#ff3eae]"/> Catálogo de romances e dramas</li>
              <li className="flex gap-2"><Check size={17} className="shrink-0 text-[#ff3eae]"/> Acesso conforme o plano escolhido</li>
            </ul>
            <a href={plansUrl} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff3eae] px-4 py-3.5 text-sm font-black text-[#160611] transition hover:bg-pink-300">VER PLANOS E ASSINAR <Sparkles size={16}/></a>
            <p className="mt-3 text-center text-[11px] leading-5 text-white/40">Consulte os valores, condições e detalhes de acesso antes de assinar.</p>
            <button onClick={() => setShowPlans(!showPlans)} className="mt-4 w-full border-t border-white/10 pt-4 text-xs text-white/55 hover:text-white">{showPlans ? "Ocultar detalhes" : "Como funciona a assinatura?"}</button>
            {showPlans && <p className="mt-3 text-xs leading-5 text-white/60">Escolha um dos planos apresentados na página inicial e confira preço, período de cobrança, conteúdo incluído e regras de cancelamento no checkout.</p>}
          </aside>
        </div>
      </section>

      <section className="border-y border-white/[.07] bg-[#100810] py-12">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-[#ff3eae]">SÓ MAIS UM CAPÍTULO…</p>
          <h2 className="mx-auto mt-3 max-w-xl text-2xl font-black sm:text-3xl">Tem muita emoção esperando por você <span className="text-[#ff3eae]">♥</span></h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55">Encontre sua próxima história favorita e escolha o plano que combina com a sua maratona.</p>
          <a href={plansUrl} className="mt-6 inline-flex rounded-full bg-[#ff3eae] px-7 py-3 text-sm font-extrabold text-black transition hover:bg-pink-300">QUERO CONTINUAR ASSISTINDO →</a>
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link to="/" className="font-bold text-white/75">Feed <span className="text-[#ff3eae]">Loves</span></Link>
        <span>Histórias para se apaixonar, capítulo a capítulo.</span>
        <Link to="/#planos" className="hover:text-[#ff3eae]">Conhecer os planos</Link>
      </footer>
    </main>
  );
}
