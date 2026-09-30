import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  CircleUserRound,
  Heart,
  Laptop,
  Menu,
  MonitorPlay,
  Play,
  Search,
  Smartphone,
  Sparkles,
  Tablet,
  Tv,
  X,
} from "lucide-react";
import { useState } from "react";

import brand from "../assets/brand.png.asset.json";
import poster1 from "../assets/poster1.jpg.asset.json";
import poster2 from "../assets/poster2.jpg.asset.json";
import poster3 from "../assets/poster3.jpg.asset.json";
import poster4 from "../assets/poster4.jpg.asset.json";
import poster5 from "../assets/poster5.jpg.asset.json";
import poster6 from "../assets/poster6.jpg.asset.json";
import poster7 from "../assets/poster7.jpg.asset.json";
import poster8 from "../assets/poster8.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Feed Loves — Doramas, séries turcas e novelinhas" },
      { name: "description", content: "Doramas, séries turcas e novelinhas dubladas e legendadas, sem anúncios, em um só lugar." },
      { property: "og:title", content: "Feed Loves — Doramas, séries turcas e novelinhas" },
      { property: "og:description", content: "Milhares de histórias dubladas e legendadas para maratonar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const posters = [
  { image: poster1.url, title: "My Queen, My Rules", genre: "ROMANCE", badge: "NOVO" },
  { image: poster5.url, title: "A Hipótese do Amor", genre: "ROMANCE JUVENIL", badge: "LEGENDADO" },
  { image: poster6.url, title: "Istanbul Gelin", genre: "DRAMA TURCO" },
  { image: poster7.url, title: "O Canto do Pássaro", genre: "ROMANCE", badge: "DUBLADO" },
  { image: poster8.url, title: "Primavera Antecipada", genre: "ROMANCE", badge: "NOVO" },
  { image: poster3.url, title: "Scandal", genre: "ÉPOCA", badge: "LEGENDADO" },
  { image: poster2.url, title: "Dolunay", genre: "ROMANCE", badge: "DUBLADO" },
  { image: poster4.url, title: "Muhtemel Aşk", genre: "COMÉDIA ROMÂNTICA", badge: "NOVO" },
];

const faqs = [
  ["O que é o Feed Loves?", "É uma plataforma com doramas, séries turcas e novelinhas reunidos em um só lugar."],
  ["Quando meu acesso é liberado?", "Logo após a confirmação do pagamento, você recebe as informações de acesso."],
  ["Preciso instalar algum aplicativo?", "Não. Você pode acessar diretamente pelo navegador do seu dispositivo."],
  ["Tem anúncios durante os episódios?", "Não. O conteúdo é exibido sem interrupções publicitárias."],
  ["Posso assistir pelo celular?", "Sim, em celulares Android e iPhone usando o navegador."],
  ["Posso assistir pelo computador?", "Sim, em notebooks e computadores compatíveis."],
  ["Posso assistir na televisão?", "Sim, usando um navegador compatível na Smart TV."],
  ["Existem conteúdos dublados e legendados?", "Sim, as opções variam conforme a disponibilidade de cada título."],
  ["Como funciona o suporte?", "Você conta com atendimento para ajudar quando precisar."],
  ["Como cancelo a renovação?", "Entre em contato com o suporte para solicitar o cancelamento."],
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a className="brand" href="#inicio" aria-label="Feed Loves">
      <img src={brand.url} alt="Feed Loves" />
      {!compact && <span>Feed <b>Loves</b></span>}
    </a>
  );
}

function Cta({ children, href = "#planos", small = false }: { children: React.ReactNode; href?: string; small?: boolean }) {
  return <a className={small ? "cta cta-small" : "cta"} href={href}>{children}</a>;
}

function Heading({ eyebrow, children, light = false }: { eyebrow: string; children: React.ReactNode; light?: boolean }) {
  return <div className={`section-heading${light ? " light" : ""}`}><span>{eyebrow}</span><h2>{children}</h2></div>;
}

function Header() {
  const [open, setOpen] = useState(false);
  return <>
    <div className="offer"><span>✦ OFERTA ESPECIAL · ACESSO COMPLETO AO FEED LOVES</span><a href="#planos">ASSINAR AGORA</a></div>
    <header>
      <Logo />
      <nav className={open ? "open" : ""}>
        <a href="#catalogo">Catálogo</a><a href="#planos">Planos</a><a href="#duvidas">Dúvidas</a><a href="#suporte">Suporte</a>
      </nav>
      <div className="header-actions"><a href="#entrar">Entrar</a><Cta small>ASSINAR</Cta></div>
      <button className="menu" onClick={() => setOpen(!open)} aria-label={open ? "Fechar menu" : "Abrir menu"}>{open ? <X /> : <Menu />}</button>
    </header>
  </>;
}

function Index() {
  return <main id="inicio">
    <Header />
    <section className="hero">
      <div className="eyebrow-pill">✦ MILHARES DE HISTÓRIAS ESPERANDO POR VOCÊ</div>
      <img className="hero-logo" src={brand.url} alt="Feed Loves" />
      <h1>Doramas, séries turcas e<br /> novelinhas<br /><em>em um só lugar</em></h1>
      <p>Assista milhares de histórias <strong>dubladas e legendadas</strong>, sem anúncios e sem<br className="desktop" /> precisar ficar procurando em várias plataformas.</p>
    </section>

    <section className="video-section">
      <Heading eyebrow="CONTINUAÇÃO">Parte 2 — <em>a história continua</em></Heading>
      <p className="section-copy">Assista à continuação da apresentação e descubra o que espera por<br className="desktop" /> você no Feed Loves.</p>
      <div className="video-frame">
        <iframe src="https://player.vimeo.com/video/1231112345?title=0&byline=0&portrait=0" title="Parte 2 — a história continua" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      </div>
      <Cta>CONTINUAR ASSISTINDO</Cta>
    </section>

    <section className="showcase-dark">
      <div className="floating-posters left"><img src={poster1.url} alt="My Queen, My Rules" /><img src={poster2.url} alt="Dolunay" /></div>
      <div className="phone">
        <div className="phone-top"><Logo compact /><span>REPRODUZINDO</span></div>
        <div className="phone-screen"><img src={poster1.url} alt="Feed Loves em reprodução" /><div className="play-circle"><Play fill="currentColor" /></div></div>
        <div className="phone-nav"><span>⌂</span><CircleUserRound /></div>
      </div>
      <div className="floating-posters right"><img src={poster3.url} alt="Scandal" /><img src={poster4.url} alt="Muhtemel Aşk" /></div>
      <Cta>QUERO ACESSAR O FEED LOVES</Cta>
      <div className="benefit-strip"><span>Acesso imediato</span><span>Assista quando quiser</span><span>Sem anúncios</span><span>Suporte pelo WhatsApp</span></div>
      <a className="already" href="#entrar">Já sou assinante</a>
    </section>

    <section className="universe">
      <Heading eyebrow="TUDO REUNIDO">Um universo de histórias<br /> <em>em um só lugar</em></Heading>
      <p className="section-copy">Encontre doramas, séries turcas e diferentes estilos de história sem precisar ficar procurando em vários lugares.</p>
      <div className="category-grid">
        {[["✦","Doramas","Coreia, Japão e China."],["◈","Séries Turcas","Os dramas de Istambul."],["♡","Novelinhas","Romance e emoção todo dia."],["▶","Dublados","Aperte o play e só assistir."]].map(([icon,title,text])=><article key={title}><i>{icon}</i><h3>{title}</h3><p>{text}</p></article>)}
      </div>
      <div className="detail-pill">CATEGORIAS DETALHADAS DENTRO DA PLATAFORMA</div>
    </section>

    <section className="catalog" id="catalogo">
      <Heading eyebrow="CATÁLOGO EM DESTAQUE">Escolhidos para sua<br /> <em>próxima maratona</em></Heading>
      <p className="section-copy">Doramas e séries turcas — uma amostra do que espera por você.</p>
      <div className="poster-grid">{posters.map((item)=><article className="poster-card" key={item.title}><div><img src={item.image} alt={`Capa de ${item.title}`} />{item.badge && <span>{item.badge}</span>}</div><h3>{item.title}</h3><p>{item.genre}</p></article>)}</div>
    </section>

    <section className="devices">
      <Heading eyebrow="MULTIPLATAFORMA">Do sofá para<br /> <em>o seu mundo</em></Heading>
      <p className="section-copy">Assista do seu jeito, na tela que preferir.</p>
      <div className="device-row">
        <article><Smartphone /><h3>Smartphone</h3><p>Android e iPhone<br />pelo navegador.</p></article>
        <article><Tablet /><h3>Tablet</h3><p>Tela maior, mesma<br />experiência.</p></article>
        <article><Laptop /><h3>Notebook</h3><p>Perfeito para<br />maratonar à noite.</p></article>
        <article><Tv /><h3>Smart TV</h3><p>Navegador compatível<br />na sala.</p></article>
      </div>
      <div className="app-preview">
        <div className="app-bar"><Logo /><div><Search /><span>⋮</span><Heart /></div></div>
        <div className="featured-show"><img src={poster1.url} alt="Prévia de My Queen, My Rules" /><div><span>DESTAQUE</span><h3>My Queen,<br />My Rules</h3><button aria-label="Assistir My Queen, My Rules"><Play fill="currentColor" /> ASSISTIR</button></div></div>
        <p>CONTINUE ASSISTINDO</p><div className="continue-row">{[poster5,poster6,poster7,poster8].map((p,i)=><img key={i} src={p.url} alt="Título para continuar assistindo" />)}</div>
      </div>
    </section>

    <section className="advantages">
      <Heading eyebrow="VANTAGENS">Por que assinar o<br /> <em>Feed Loves?</em></Heading>
      <div className="adv-grid">{[
        [<Heart key="i" />,"HISTÓRIAS APAIXONANTES","Uma seleção para quem ama romance, emoção e boas histórias."],
        [<Play key="i" />,"ACESSO SIMPLES","Entre e comece a assistir sem complicação."],
        [<MonitorPlay key="i" />,"DUBLADO E LEGENDADO","Diferentes opções de áudio e legenda conforme disponibilidade."],
        [<Smartphone key="i" />,"MULTIPLATAFORMA","Assista em diferentes dispositivos compatíveis."],
        [<X key="i" />,"SEM ANÚNCIOS","Aproveite seus conteúdos sem interrupções publicitárias."],
        [<Sparkles key="i" />,"SUPORTE","Conte com atendimento quando precisar."],
      ].map(([icon,title,text])=><article key={String(title)}>{icon}<h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="love-banner">
      <Heading eyebrow="">Feito para quem ama<br /> <em>doramas e séries turcas</em></Heading>
      <p>De Seul a Istambul: romance, emoção, reviravoltas e aquelas histórias<br className="desktop" /> que fazem você dizer “só mais um episódio...”</p>
      <Cta>COMEÇAR A ASSISTIR</Cta>
    </section>

    <section className="plans" id="planos">
      <Heading eyebrow="PLANOS" light>Escolha como você quer<br /> <em>maratonar ♡</em></Heading>
      <p>Um único acesso para curtir doramas, séries turcas e novelinhas sem anúncios.</p>
      <div className="plan-benefits"><span>✓ Acesso imediato</span><span>✓ Dublado e legendado</span><span>✓ Sem anúncios</span><span>✓ Dispositivos compatíveis</span></div>
      <div className="plan-grid">
        <Plan name="SEMANAL" price="9,90" period="7 dias de acesso ilimitado" sub="Maratone à vontade a semana inteira" href="https://pay.wiapy.com/D1rAjQcO8bo_" button="QUERO 7 DIAS — R$ 9,90" />
        <Plan featured name="ANUAL" price="99,90" period="12 meses de acesso ilimitado" sub="Equivale a R$ 8,33/mês" href="https://pay.wiapy.com/P5HvC_I9cE7v" button="QUERO 1 ANO — R$ 99,90" />
        <Plan name="MENSAL" price="19,90" period="30 dias de acesso ilimitado" sub="Equivale a R$ 0,66 por dia" href="https://pay.wiapy.com/B6PXI-V_JEr" button="QUERO 1 MÊS — R$ 19,90" />
      </div>
      <div className="instant"><b>✦ ACESSO IMEDIATO APÓS A CONFIRMAÇÃO</b><p>Assim que o pagamento for confirmado, você receberá as informações de acesso.</p><div><span>📱 Receba no WhatsApp</span><span>✉️ Receba também por e-mail</span><span>🚫 Sem anúncios</span><span>📺 Dispositivos compatíveis</span></div></div>
      <p className="safe">Pagamento seguro • Acesso simples • Sem taxas escondidas</p>
    </section>

    <section className="faq" id="duvidas">
      <Heading eyebrow="PERGUNTAS FREQUENTES">Ainda com dúvidas?</Heading>
      <div>{faqs.map(([q,a])=><details key={q}><summary>{q}<ChevronDown /></summary><p>{a}</p></details>)}</div>
    </section>

    <section className="closing" id="suporte"><Logo compact /><h2>Sua próxima história<br /><em>está esperando por você.</em></h2><p>Entre para o Feed Loves e descubra doramas, séries turcas e<br className="desktop" /> novas histórias para maratonar.</p><Cta>QUERO ASSINAR AGORA</Cta></section>
  </main>;
}

function Plan({ name, price, period, sub, href, button, featured = false }: { name:string; price:string; period:string; sub:string; href:string; button:string; featured?:boolean }) {
  return <article className={`plan${featured ? " featured" : ""}`}>{featured && <div className="best">⭐ MAIOR ECONOMIA</div>}<span>{name}</span><h3><small>R$</small> {price}</h3><b>{period}</b><p>{sub}</p><ul>{["Acesso completo ao catálogo","Doramas, séries turcas e novelinhas","Dublado e legendado","Sem anúncios","Dispositivos compatíveis","Liberação imediata"].map(x=><li key={x}><Check />{x}</li>)}</ul><Cta href={href}>{button}</Cta></article>;
}