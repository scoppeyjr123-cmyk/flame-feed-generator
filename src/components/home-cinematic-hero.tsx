import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";

type HeroSeries = {
  id: string;
  title: string;
  short_description: string | null;
  category: string | null;
  genre: string | null;
  cover_url: string | null;
  banner_url: string | null;
  thumbnail_url: string | null;
  featured: boolean;
};

const ROTATION_INTERVAL = 7000;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function HomeCinematicHero({ series }: { series: HeroSeries[] }) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);

  const highlights = useMemo(
    () =>
      series
        .filter((item) => item.banner_url || item.cover_url || item.thumbnail_url)
        .sort((first, second) => Number(second.featured) - Number(first.featured))
        .slice(0, 5),
    [series],
  );

  useEffect(() => {
    const header = document.querySelector("#inicio > header");
    if (!header) return;
    const mount = document.createElement("div");
    mount.className = "home-cinematic-hero-mount";
    header.insertAdjacentElement("afterend", mount);
    setPortalTarget(mount);
    return () => mount.remove();
  }, []);

  useEffect(() => {
    // Reduced motion removes zoom/crossfade effects, but the catalog still
    // advances so the autoplay promise remains consistent for every visitor.
    if (highlights.length < 2) return;
    const timer = window.setInterval(() => {
      const current = activeIndexRef.current;
      const next = (current + 1) % highlights.length;
      setPreviousIndex(current);
      activeIndexRef.current = next;
      setActiveIndex(next);
    }, ROTATION_INTERVAL);
    return () => window.clearInterval(timer);
  }, [highlights.length, reducedMotion]);

  useEffect(() => {
    if (!highlights.length) return;
    const next = highlights[(activeIndex + 1) % highlights.length];
    const source = next?.banner_url || next?.cover_url || next?.thumbnail_url;
    if (source) {
      const image = new Image();
      image.src = source;
    }
    railRef.current?.querySelector<HTMLElement>(`[data-slide="${activeIndex}"]`)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex, highlights, reducedMotion]);

  if (!highlights.length) return null;

  const hideLegacyHero = <style>{`.hero-atmosphere{display:none!important}`}</style>;

  if (!portalTarget) return hideLegacyHero;

  const active = highlights[activeIndex] ?? highlights[0];
  if (!active) return hideLegacyHero;
  const previous = previousIndex === null ? null : (highlights[previousIndex] ?? null);
  const activeImage = active.banner_url || active.cover_url || active.thumbnail_url || "";
  const previousImage =
    previous?.banner_url || previous?.cover_url || previous?.thumbnail_url || "";

  const chooseSlide = (index: number) => {
    if (index === activeIndex) return;
    setPreviousIndex(activeIndex);
    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
    event.currentTarget.style.setProperty("--hero-shift-x", `${x}px`);
    event.currentTarget.style.setProperty("--hero-shift-y", `${y}px`);
  };

  const resetParallax = () => {
    sectionRef.current?.style.setProperty("--hero-shift-x", "0px");
    sectionRef.current?.style.setProperty("--hero-shift-y", "0px");
  };

  return (
    <>
      {hideLegacyHero}
      {createPortal(
        <section
          className="cinematic-hero"
          aria-labelledby="cinematic-hero-title"
          ref={sectionRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetParallax}
        >
          <style>{`
        .cinematic-hero{--hero-shift-x:0px;--hero-shift-y:0px;position:relative;min-height:min(780px,calc(100svh - 100px));overflow:hidden;background:#080408;color:#fff;isolation:isolate}
        .cinematic-hero-bg{position:absolute;inset:-18px;z-index:-4;width:calc(100% + 36px);height:calc(100% + 36px);object-fit:cover;object-position:72% 28%;transform:translate3d(var(--hero-shift-x),var(--hero-shift-y),0) scale(1.04);filter:saturate(.9) contrast(1.05);opacity:0;transition:opacity 1.25s ease,transform 1.1s ease}
        .cinematic-hero-bg.is-active{animation:cinematic-hero-fade-in 1.25s ease both,cinematic-hero-zoom 8s ease-out both}
        .cinematic-hero-bg.is-previous{animation:cinematic-hero-fade-out 1.25s ease both}
        .cinematic-hero:before{content:"";position:absolute;inset:0;z-index:-3;background:linear-gradient(90deg,#090408 3%,#120711f2 29%,#180915a3 56%,#12071138 78%),linear-gradient(0deg,#090408 0%,transparent 40%),radial-gradient(circle at 72% 22%,#e83b9b24,transparent 38%)}
        .cinematic-hero:after{content:"";position:absolute;inset:auto 0 0;z-index:-2;height:34%;background:linear-gradient(0deg,#0d070d 2%,transparent 100%);pointer-events:none}
        .cinematic-hero-shell{width:min(1240px,calc(100% - 44px));min-height:inherit;margin:auto;display:grid;grid-template-columns:minmax(0,640px) 1fr;align-items:center;padding:clamp(70px,9vw,126px) 0 360px}
        .cinematic-hero-copy{position:relative;z-index:2;text-shadow:0 2px 28px #000}
        .cinematic-hero-kicker{display:inline-flex;align-items:center;gap:8px;border:1px solid #ff62b35c;border-radius:999px;background:#170b16b8;padding:8px 13px;color:#ff8dcc;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;backdrop-filter:blur(12px)}
        .cinematic-hero h1{max-width:650px;margin:20px 0 0;font:700 clamp(48px,6vw,82px)/.97 "Playfair Display",Georgia,serif;letter-spacing:-.045em;text-wrap:balance}
        .cinematic-hero-subtitle{max-width:590px;margin:22px 0 0;color:#eadbe5;font-size:clamp(15px,1.5vw,18px);line-height:1.65;text-shadow:0 2px 16px #000}
        .cinematic-hero-current{display:flex;align-items:center;gap:8px;margin-top:20px;color:#ffd5eb;font-size:12px;font-weight:700}
        .cinematic-hero-current span{width:28px;height:1px;background:#f45db2}
        .cinematic-hero-cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:54px;margin-top:28px;border:1px solid #ff83c5;border-radius:999px;background:#f45db2;padding:0 27px;color:#190713;font-size:12px;font-weight:900;letter-spacing:.04em;text-decoration:none;box-shadow:0 14px 38px #d72f8a3b;transition:transform .25s ease,filter .25s ease,box-shadow .25s ease}
        .cinematic-hero-cta:hover,.cinematic-hero-cta:focus-visible{transform:translateY(-3px);filter:brightness(1.08);box-shadow:0 18px 48px #e33a973f;outline:2px solid #fff;outline-offset:3px}
        .cinematic-hero-rail{position:absolute;right:0;bottom:34px;left:0;z-index:3}
        .cinematic-hero-rail-inner{width:min(1240px,calc(100% - 44px));margin:auto}
        .cinematic-hero-rail-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;color:#e8d3df;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
        .cinematic-hero-rail-heading span:last-child{color:#f45db2}
        .cinematic-hero-rail-track{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 8px;scrollbar-width:none;overscroll-behavior-inline:contain}
        .cinematic-hero-rail-track::-webkit-scrollbar{display:none}
        .cinematic-hero-card{position:relative;flex:0 0 clamp(98px,11vw,132px);aspect-ratio:2/3;overflow:hidden;border:1px solid #ffffff24;border-radius:10px;background:#160b15;padding:0;cursor:pointer;box-shadow:0 12px 34px #0008;opacity:.68;transition:opacity .3s ease,transform .3s ease,border-color .3s ease}
        .cinematic-hero-card:hover,.cinematic-hero-card:focus-visible,.cinematic-hero-card.is-active{opacity:1;transform:translateY(-5px);border-color:#f45db2;outline:0}
        .cinematic-hero-card img{width:100%;height:100%;object-fit:cover}
        .cinematic-hero-card:after{content:"";position:absolute;inset:38% 0 0;background:linear-gradient(transparent,#080408e8)}
        .cinematic-hero-card strong{position:absolute;right:8px;bottom:8px;left:8px;z-index:1;color:#fff;font-size:10px;line-height:1.2;text-align:left;text-shadow:0 1px 8px #000}
        @keyframes cinematic-hero-zoom{from{transform:translate3d(var(--hero-shift-x),var(--hero-shift-y),0) scale(1.04)}to{transform:translate3d(var(--hero-shift-x),var(--hero-shift-y),0) scale(1.095)}}
        @keyframes cinematic-hero-fade-in{from{opacity:0}to{opacity:1}}
        @keyframes cinematic-hero-fade-out{from{opacity:1}to{opacity:0}}
        @media(max-width:760px){
          .cinematic-hero{min-height:760px}
          .cinematic-hero-bg{inset:-10px;width:calc(100% + 20px);height:62%;object-position:center 16%;transform:scale(1.04)}
          .cinematic-hero:before{background:linear-gradient(0deg,#0b050b 36%,#0b050bc4 53%,#0b050b18 78%),linear-gradient(90deg,#10070e7d,transparent 68%)}
          .cinematic-hero-shell{width:min(100% - 32px,620px);display:block;padding:330px 0 205px}
          .cinematic-hero h1{margin-top:16px;font-size:clamp(39px,12vw,58px);line-height:.98}
          .cinematic-hero-subtitle{margin-top:16px;font-size:14px;line-height:1.55}
          .cinematic-hero-current{margin-top:14px}
          .cinematic-hero-cta{width:calc(100% - 76px);min-height:52px;margin-top:22px;padding:0 18px;font-size:11px}
          .cinematic-hero-rail{bottom:20px}
          .cinematic-hero-rail-inner{width:calc(100% - 32px)}
          .cinematic-hero-card{flex-basis:92px}
        }
        @media(prefers-reduced-motion:reduce){.cinematic-hero *{scroll-behavior:auto!important}.cinematic-hero-bg,.cinematic-hero-card,.cinematic-hero-cta{animation:none!important;transition:none!important}.cinematic-hero-bg.is-active{opacity:1!important}.cinematic-hero-bg.is-previous{opacity:0!important}}
      `}</style>
          {previousImage ? (
            <img
              key={previous?.id}
              className="cinematic-hero-bg is-previous"
              src={previousImage}
              alt=""
              aria-hidden="true"
            />
          ) : null}
          <img
            key={active.id}
            className="cinematic-hero-bg is-active"
            src={activeImage}
            alt=""
            aria-hidden="true"
            loading={activeIndex === 0 ? "eager" : "lazy"}
            fetchPriority={activeIndex === 0 ? "high" : "auto"}
            decoding="async"
          />
          <div className="cinematic-hero-shell">
            <div className="cinematic-hero-copy">
              <p className="cinematic-hero-kicker">✦ Uma história para cada emoção</p>
              <h1 id="cinematic-hero-title">Histórias que fazem você esquecer do tempo.</h1>
              <p className="cinematic-hero-subtitle">
                Doramas, séries turcas e novelinhas em um só lugar. Assista suas histórias favoritas
                quando e onde quiser.
              </p>
              <p className="cinematic-hero-current">
                <span aria-hidden="true" /> Em destaque: {active.title}
              </p>
              <a className="cinematic-hero-cta" href="#planos">
                <span aria-hidden="true">▶</span> QUERO COMEÇAR A ASSISTIR
              </a>
            </div>
          </div>
          <div className="cinematic-hero-rail" aria-label="Novelas em destaque">
            <div className="cinematic-hero-rail-inner">
              <div className="cinematic-hero-rail-heading">
                <span>Agora no Feed Loves</span>
                <span>
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(highlights.length).padStart(2, "0")}
                </span>
              </div>
              <div className="cinematic-hero-rail-track" ref={railRef}>
                {highlights.map((item, index) => (
                  <button
                    className={`cinematic-hero-card${index === activeIndex ? " is-active" : ""}`}
                    type="button"
                    data-slide={index}
                    aria-label={`Destacar ${item.title}`}
                    aria-pressed={index === activeIndex}
                    onClick={() => chooseSlide(index)}
                    key={item.id}
                  >
                    <img
                      src={item.cover_url || item.thumbnail_url || item.banner_url || ""}
                      alt=""
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <strong>{item.title}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>,
        portalTarget,
      )}
    </>
  );
}
