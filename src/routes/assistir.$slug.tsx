import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Clapperboard, LockKeyhole, Play, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/assistir/$slug")({
  head: () => ({
    meta: [
      { title: "Continue assistindo | Feed Loves" },
      { name: "description", content: "Continue sua história favorita no Feed Loves. Assine para desbloquear os próximos episódios." },
    ],
  }),
  component: WatchPage,
});

const plans = [
  { name: "Essencial", price: "R$ 9,90", detail: "Acesso ao catálogo", featured: false },
  { name: "Completo", price: "R$ 19,90", detail: "Catálogo completo e novos episódios", featured: true },
  { name: "Premium", price: "R$ 99,90", detail: "Acesso estendido conforme as condições do plano", featured: false },
];

function WatchPage() {
  const { slug } = Route.useParams();
  const [showPlans, setShowPlans] = useState(false);
  const title = decodeURIComponent(slug || "uma-historia-especial").replace(/[-_]+/g, " ");
  const prettyTitle = title.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());

  return (
    <main className="watch-page">
      <style>{`
        .watch-page{min-height:100vh;background:#080408;color:#fff;font-family:Outfit,Inter,system-ui,sans-serif}
        .watch-page *{box-sizing:border-box}
        .watch-topline{height:7px;background:#f33ca8}
        .watch-nav{height:76px;border-bottom:1px solid #29121f;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(18px,6vw,92px);background:#0b060b}
        .watch-brand{font-weight:900;letter-spacing:-.7px;font-size:22px}.watch-brand span{color:#f33ca8}
        .watch-back{display:inline-flex;align-items:center;gap:8px;color:#e8dce5;text-decoration:none;font-size:14px}
        .watch-container{max-width:1180px;margin:0 auto;padding:34px 22px 80px}
        .watch-breadcrumb{font-size:12px;color:#b9a4b3;margin-bottom:24px}
        .watch-breadcrumb b{color:#ff4eb1}
        .watch-layout{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(250px,.8fr);gap:26px;align-items:start}
        .watch-player{position:relative;aspect-ratio:16/9;border:1px solid #442039;border-radius:16px;overflow:hidden;background:radial-gradient(ellipse at 50% 42%,#3c1231 0%,#1c0918 44%,#090509 78%);display:flex;align-items:center;justify-content:center;text-align:center}
        .watch-player:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,transparent 30%,#ff3ca80b 50%,transparent 70%)}
        .watch-player-content{position:relative;padding:24px;max-width:440px}
        .watch-play{width:66px;height:66px;border-radius:50%;display:grid;place-items:center;margin:0 auto 18px;background:#f33ca8;color:#fff;box-shadow:0 0 36px #f33ca84d}
        .watch-kicker{color:#ff69ba;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:800}
        .watch-player h1{font-family:Georgia,serif;font-size:clamp(25px,3.5vw,43px);line-height:1.08;margin:12px 0}
        .watch-player p{color:#d6c4d1;font-size:13px;line-height:1.7;margin:0 auto 20px}
        .watch-btn{border:0;border-radius:999px;background:#f33ca8;color:#fff;font-weight:800;padding:13px 22px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:9px;box-shadow:0 7px 24px #f33ca82c;text-decoration:none}
        .watch-btn:hover{background:#ff5bb8;transform:translateY(-1px)}
        .watch-meta{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:16px 2px 0;color:#bba8b7;font-size:12px}
        .watch-pill{border:1px solid #533047;border-radius:99px;padding:6px 10px;color:#f6d8eb}
        .watch-card{border:1px solid #382032;background:linear-gradient(145deg,#160b14,#0d070c);border-radius:16px;padding:22px}
        .watch-card h2{font:700 22px/1.2 Georgia,serif;margin:8px 0 12px}.watch-card p{font-size:13px;color:#c7b4c2;line-height:1.65}
        .watch-divider{height:1px;background:#382032;margin:18px 0}
        .watch-benefit{display:flex;gap:10px;align-items:flex-start;color:#e9dbe6;font-size:13px;line-height:1.5;margin:13px 0}
        .watch-benefit svg{color:#ff58b5;flex:none;margin-top:1px}
        .watch-lock{display:flex;gap:10px;align-items:center;color:#ff8bc9;font-size:12px;font-weight:700}
        .watch-section{margin-top:54px}.watch-section-title{font:700 clamp(25px,3vw,34px)/1.1 Georgia,serif;text-align:center;margin:0 0 10px}
        .watch-section-title span{color:#ff45ad}.watch-section-sub{text-align:center;color:#bca9b8;font-size:13px;margin:0 0 26px}
        .watch-episodes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
        .watch-episode{background:#110911;border:1px solid #35202f;border-radius:12px;padding:17px;min-height:138px}
        .watch-episode strong{display:block;margin:12px 0 6px;font-size:14px}.watch-episode p{margin:0;color:#bca9b8;font-size:12px;line-height:1.5}
        .watch-episode.locked{border-color:#79365d;background:linear-gradient(145deg,#211020,#100910)}
        .watch-episode-top{display:flex;align-items:center;justify-content:space-between;color:#ff66b8;font-size:11px}
        .watch-pricing{margin-top:28px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
        .watch-plan{border:1px solid #3b2636;border-radius:13px;padding:20px;background:#110911}
        .watch-plan.featured{border-color:#f33ca8;box-shadow:0 0 0 1px #f33ca82b}
        .watch-plan h3{margin:0 0 12px;font-size:14px}.watch-price{font-size:26px;font-weight:900}.watch-plan p{min-height:35px;color:#bca9b8;font-size:12px;line-height:1.5}
        .watch-plan .watch-btn{width:100%;font-size:12px;padding:11px 12px}
        .watch-note{text-align:center;font-size:11px;line-height:1.6;color:#917f8d;margin:18px auto 0;max-width:680px}
        .watch-footer{border-top:1px solid #29121f;padding:26px;text-align:center;color:#897584;font-size:12px}
        @media(max-width:760px){.watch-nav{height:64px;padding:0 18px}.watch-layout{grid-template-columns:1fr}.watch-container{padding:24px 15px 56px}.watch-card{padding:18px}.watch-episodes{grid-template-columns:1fr}.watch-episode{min-height:unset}.watch-pricing{grid-template-columns:1fr}.watch-plan p{min-height:unset}.watch-meta{align-items:flex-start;flex-direction:column}.watch-section{margin-top:42px}}
      `}</style>
      <div className="watch-topline" />
      <header className="watch-nav">
        <Link to="/" className="watch-back"><ArrowLeft size={17} /> Voltar ao catálogo</Link>
        <div className="watch-brand">Feed <span>Loves</span></div>
        <button className="watch-btn" onClick={() => setShowPlans(true)}>Assinar agora</button>
      </header>

      <div className="watch-container">
        <div className="watch-breadcrumb">Feed Loves　/　Doramas　/　<b>Continue assistindo</b></div>
        <div className="watch-layout">
          <section>
            <div className="watch-player">
              <div className="watch-player-content">
                <div className="watch-play"><Play size={27} fill="currentColor" /></div>
                <div className="watch-kicker">Sua próxima cena começa aqui</div>
                <h1>{prettyTitle}</h1>
                <p>Você chegou à parte mais emocionante da história. Desbloqueie o episódio para descobrir o que acontece agora.</p>
                <button className="watch-btn" onClick={() => setShowPlans(true)}><LockKeyhole size={16} /> Desbloquear parte 2</button>
              </div>
            </div>
            <div className="watch-meta"><span>Parte 2 · Próximo episódio</span><span className="watch-pill">🔒 Exclusivo para assinantes</span></div>
          </section>

          <aside className="watch-card">
            <div className="watch-kicker">Não pare agora</div>
            <h2>A história continua… <span style={{color:"#ff45ad"}}>♥</span></h2>
            <p>Descubra os próximos capítulos e mergulhe em um catálogo feito para quem ama doramas, romances e séries turcas.</p>
            <div className="watch-divider" />
            <div className="watch-benefit"><Check size={17} /> Histórias e episódios para maratonar</div>
            <div className="watch-benefit"><Check size={17} /> Acesso pelo celular ou computador</div>
            <div className="watch-benefit"><Check size={17} /> Novas histórias para descobrir</div>
            <div className="watch-benefit"><ShieldCheck size={17} /> Planos e condições apresentados antes de assinar</div>
            <button className="watch-btn" style={{width:"100%",marginTop:12}} onClick={() => setShowPlans(true)}>Ver planos de assinatura <span>→</span></button>
          </aside>
        </div>

        <section className="watch-section">
          <h2 className="watch-section-title">Não perca nenhum <span>capítulo</span></h2>
          <p className="watch-section-sub">Escolha como continuar sua próxima maratona.</p>
          <div className="watch-episodes">
            <article className="watch-episode"><div className="watch-episode-top"><span>EPISÓDIO 01</span><Check size={15}/></div><strong>O começo de tudo</strong><p>Você já chegou até aqui. Relembre como essa história começou.</p></article>
            <article className="watch-episode locked"><div className="watch-episode-top"><span>EPISÓDIO 02</span><LockKeyhole size={15}/></div><strong>A história continua</strong><p>Assine para desbloquear a próxima parte e descobrir o que vem a seguir.</p></article>
            <article className="watch-episode locked"><div className="watch-episode-top"><span>PRÓXIMOS EPISÓDIOS</span><LockKeyhole size={15}/></div><strong>Mais emoções esperam por você</strong><p>Veja os episódios disponíveis conforme seu plano de acesso.</p></article>
          </div>
        </section>

        {showPlans && <section className="watch-section" id="planos" aria-live="polite">
          <h2 className="watch-section-title">Escolha seu plano e <span>continue assistindo</span></h2>
          <p className="watch-section-sub">Confira as opções e as condições antes de concluir sua assinatura.</p>
          <div className="watch-pricing">
            {plans.map((plan) => <article className={`watch-plan ${plan.featured ? "featured" : ""}`} key={plan.name}>
              <h3>{plan.featured && <Sparkles size={14} style={{display:"inline",verticalAlign:"middle",color:"#ff45ad"}}/>} {plan.name}</h3>
              <div className="watch-price">{plan.price}</div>
              <p>{plan.detail}</p>
              <a className="watch-btn" href="/#planos">Ver assinatura <span>→</span></a>
            </article>)}
          </div>
          <p className="watch-note">Os preços e benefícios acima são referências visuais. Confirme os valores, periodicidade, benefícios e a URL real de checkout antes de publicar esta página. O botão leva à seção de planos da página principal.</p>
        </section>}

        <section className="watch-section" style={{textAlign:"center"}}>
          <div className="watch-kicker">Feito para quem ama</div>
          <h2 className="watch-section-title">Doramas, romances e séries <span>inesquecíveis</span></h2>
          <p className="watch-section-sub">Sua próxima história favorita está esperando por você.</p>
          <button className="watch-btn" onClick={() => setShowPlans(true)}><Clapperboard size={16}/> Quero continuar assistindo</button>
        </section>
      </div>
      <footer className="watch-footer">Feed Loves · Histórias para se apaixonar</footer>
    </main>
  );
}
