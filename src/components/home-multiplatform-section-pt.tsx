import { Download, MonitorSmartphone, Play, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const artwork = "/assets/segredo-curandeira-multiplatform.webp";

export function HomeMultiplatformSectionPt() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.querySelector<HTMLElement>("#home-multiplatform-slot"));
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <section className="multiplatform-showcase" aria-labelledby="multiplatform-title">
      <style>{`
        .multiplatform-showcase{position:relative;overflow:hidden;border-block:1px solid #311329;background:radial-gradient(circle at 72% 48%,#8b17502b,transparent 35%),linear-gradient(135deg,#070306 0%,#10050d 58%,#160810 100%);color:#fff;content-visibility:auto;contain-intrinsic-size:760px}
        .multiplatform-showcase:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 40%,#f1379320 64%,transparent 82%);opacity:.7}
        .multiplatform-shell{position:relative;width:min(1240px,calc(100% - 44px));margin:auto;display:grid;grid-template-columns:minmax(0,520px) minmax(520px,1fr);align-items:center;gap:clamp(38px,6vw,84px);padding:clamp(86px,9vw,126px) 0}
        .multiplatform-copy{position:relative;z-index:3}
        .multiplatform-eyebrow{color:#ff5db3;font-size:10px;font-weight:900;letter-spacing:.23em;text-transform:uppercase}
        .multiplatform-title{margin:18px 0 0;font:700 clamp(45px,4.7vw,68px)/.98 "Playfair Display",Georgia,serif;letter-spacing:-.04em;text-wrap:balance}
        .multiplatform-title span{display:block;color:#f43ba2}
        .multiplatform-lead{max-width:560px;margin:24px 0 0;color:#d6c1cf;font-size:16px;line-height:1.65}
        .multiplatform-benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:30px}
        .multiplatform-benefit{min-height:126px;padding:20px 16px;border:1px solid #583048;border-radius:17px;background:linear-gradient(145deg,#1c0c18cc,#10070eee);box-shadow:inset 0 1px #ffffff09;transition:transform .25s ease,border-color .25s ease,background .25s ease}
        .multiplatform-benefit:hover{transform:translateY(-4px);border-color:#e7449a;background:#210d1c}
        .multiplatform-benefit svg{width:30px;height:30px;color:#f43ba2;stroke-width:1.7}
        .multiplatform-benefit strong{display:block;margin-top:14px;font-size:13px;line-height:1.25}
        .multiplatform-cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:56px;margin-top:30px;padding:0 27px;border:1px solid #ff78c5;border-radius:999px;background:#f43ba2;color:#16040e;font-size:12px;font-weight:900;letter-spacing:.02em;text-decoration:none;box-shadow:0 16px 42px #d92c873b;transition:transform .25s ease,filter .25s ease,box-shadow .25s ease}
        .multiplatform-cta:hover,.multiplatform-cta:focus-visible{transform:translateY(-3px);filter:brightness(1.08);box-shadow:0 20px 50px #e83e974f;outline:2px solid #fff;outline-offset:3px}
        .multiplatform-visual{position:relative;min-height:545px;perspective:1200px;isolation:isolate}
        .multiplatform-halo{position:absolute;inset:13% 4% 2% 7%;z-index:-1;border-radius:50%;background:#f0379754;filter:blur(80px);opacity:.62}
        .multiplatform-device{position:absolute;overflow:hidden;border:1px solid #e94c9b8a;background:#090408;box-shadow:0 28px 70px #000b,0 0 28px #ed3a9133}
        .multiplatform-device img{width:100%;height:100%;display:block;object-fit:cover}
        .multiplatform-tv{top:0;right:0;width:88%;aspect-ratio:16/9;border-radius:18px;transform:rotateY(-2deg);animation:multiplatform-float 6s ease-in-out infinite}
        .multiplatform-tv img{object-position:center 25%}
        .multiplatform-tv:after,.multiplatform-laptop-screen:after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,#fff0 45%,#ffffff0e 62%,transparent 75%),linear-gradient(0deg,#090408a8 0%,transparent 34%);pointer-events:none}
        .multiplatform-player{position:absolute;right:7%;bottom:9%;left:7%;z-index:2;display:flex;align-items:center;gap:9px}
        .multiplatform-player-line{height:3px;flex:1;border-radius:999px;background:linear-gradient(90deg,#f43ba2 0 44%,#fff 44% 45.5%,#c6b6c2a8 45.5%)}
        .multiplatform-player svg{width:16px;height:16px;fill:#fff;color:#fff}
        .multiplatform-tv-stand{position:absolute;top:49.5%;right:26%;width:36%;height:70px;border-radius:0 0 18px 18px;background:linear-gradient(90deg,#170913,#3b102d 47%,#170913);box-shadow:0 20px 30px #0008;transform:perspective(500px) rotateX(58deg)}
        .multiplatform-laptop{position:absolute;left:0;bottom:18px;z-index:3;width:61%;filter:drop-shadow(0 30px 28px #000b);transform:rotateY(4deg);animation:multiplatform-float 6s ease-in-out -2s infinite}
        .multiplatform-laptop-screen{position:relative;overflow:hidden;aspect-ratio:16/10;border:7px solid #160913;border-bottom-width:12px;border-radius:15px 15px 5px 5px;background:#070307;box-shadow:0 0 0 1px #ed4da77a}
        .multiplatform-laptop-screen img{object-position:center 27%}
        .multiplatform-laptop-base{height:15px;margin:-1px -8% 0;border-radius:3px 3px 14px 14px;background:linear-gradient(#7c4b69,#2e1626 60%,#120910);transform:perspective(260px) rotateX(52deg);transform-origin:top}
        .multiplatform-phone{right:1%;bottom:0;z-index:5;width:20%;aspect-ratio:9/19;border:6px solid #130812;border-radius:25px;background:#070307;animation:multiplatform-float 6s ease-in-out -4s infinite}
        .multiplatform-phone img{object-position:center center}
        .multiplatform-phone:before{content:"";position:absolute;top:7px;left:50%;z-index:2;width:36%;height:10px;border-radius:999px;background:#080408;transform:translateX(-50%)}
        .multiplatform-phone-controls{position:absolute;right:8px;bottom:9px;left:8px;z-index:3;padding:8px;border-radius:12px;background:#090408db;backdrop-filter:blur(8px)}
        .multiplatform-phone-controls span{display:block;height:3px;border-radius:999px;background:linear-gradient(90deg,#f43ba2 0 38%,#d7c9d2 38%)}
        .multiplatform-sync{position:absolute;inset:0;z-index:4;width:100%;height:100%;overflow:visible;pointer-events:none}
        .multiplatform-sync path{fill:none;stroke:#ff4faf;stroke-width:2.5;stroke-linecap:round;filter:drop-shadow(0 0 7px #ff3b9f);stroke-dasharray:10 8;animation:multiplatform-dash 2.2s linear infinite}
        .multiplatform-sync circle{fill:#fff;filter:drop-shadow(0 0 7px #ff3b9f)}
        .multiplatform-resume{position:absolute;right:18%;bottom:26%;z-index:6;display:flex;align-items:center;gap:10px;min-height:55px;padding:0 20px;border:1px solid #ff70c4;border-radius:16px;background:#481334e8;color:#fff;font-size:13px;font-weight:700;box-shadow:0 0 34px #f43ba254;backdrop-filter:blur(15px);animation:multiplatform-pulse 3.5s ease-in-out infinite}
        .multiplatform-resume-icon{display:grid;place-items:center;width:34px;height:34px;border:1px solid #ff9bd6;border-radius:50%;background:#9f236d}
        .multiplatform-resume-icon svg{width:15px;height:15px;fill:#fff}
        @keyframes multiplatform-float{0%,100%{translate:0 0}50%{translate:0 -7px}}
        @keyframes multiplatform-dash{to{stroke-dashoffset:-36}}
        @keyframes multiplatform-pulse{0%,100%{box-shadow:0 0 26px #f43ba23d}50%{box-shadow:0 0 44px #f43ba275}}
        @media(max-width:1000px){.multiplatform-shell{grid-template-columns:minmax(0,430px) minmax(430px,1fr);gap:30px}.multiplatform-title{font-size:48px}.multiplatform-benefit{padding:16px 12px}.multiplatform-visual{min-height:480px}}
        @media(max-width:800px){
          .multiplatform-showcase{background:radial-gradient(circle at 50% 68%,#8b175038,transparent 36%),linear-gradient(180deg,#080407,#11060e)}
          .multiplatform-shell{width:min(100% - 30px,620px);display:flex;flex-direction:column;gap:42px;padding:72px 0 62px}
          .multiplatform-copy{text-align:center}
          .multiplatform-title{margin-top:14px;font-size:clamp(40px,11vw,56px)}
          .multiplatform-lead{margin:20px auto 0;font-size:14px;line-height:1.6}
          .multiplatform-benefits{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:26px}
          .multiplatform-benefit{min-height:105px;padding:15px 8px;border-radius:14px}
          .multiplatform-benefit svg{width:25px;height:25px}
          .multiplatform-benefit strong{margin-top:11px;font-size:11px}
          .multiplatform-cta{width:100%;min-height:54px;margin-top:22px;padding:0 16px;font-size:11px}
          .multiplatform-visual{width:100%;min-height:430px}
          .multiplatform-tv{top:0;right:2%;width:96%;border-radius:13px;transform:none}
          .multiplatform-tv-stand{top:45%;right:25%;width:42%}
          .multiplatform-laptop{left:0;bottom:19px;width:67%;transform:none}
          .multiplatform-phone{right:2%;bottom:0;width:25%;border-width:5px;border-radius:20px}
          .multiplatform-resume{right:8%;bottom:25%;min-height:48px;padding:0 13px;border-radius:14px;font-size:10px}
          .multiplatform-resume-icon{width:29px;height:29px}
        }
        @media(max-width:420px){.multiplatform-shell{padding-top:62px}.multiplatform-visual{min-height:370px}.multiplatform-resume{right:5%;bottom:24%;max-width:185px}.multiplatform-tv-stand{top:42%}}
        @media(prefers-reduced-motion:reduce){.multiplatform-showcase *{animation:none!important;transition:none!important}.multiplatform-sync path{stroke-dasharray:none}}
      `}</style>

      <div className="multiplatform-shell">
        <div className="multiplatform-copy">
          <p className="multiplatform-eyebrow">Veja à sua maneira</p>
          <h2 className="multiplatform-title" id="multiplatform-title">
            Comece no telemóvel.
            <span>Continue de onde parou.</span>
          </h2>
          <p className="multiplatform-lead">
            O seu progresso fica guardado automaticamente para poder ver quando quiser, em qualquer
            dispositivo.
          </p>
          <div className="multiplatform-benefits" aria-label="Vantagens multiplataforma">
            <div className="multiplatform-benefit">
              <MonitorSmartphone aria-hidden="true" />
              <strong>Qualquer ecrã</strong>
            </div>
            <div className="multiplatform-benefit">
              <RefreshCcw aria-hidden="true" />
              <strong>Progresso sincronizado</strong>
            </div>
            <div className="multiplatform-benefit">
              <Download aria-hidden="true" />
              <strong>Sem instalar aplicação</strong>
            </div>
          </div>
          <a className="multiplatform-cta" href="#planos">
            <Play aria-hidden="true" size={17} fill="currentColor" />
            QUERO VER EM QUALQUER ECRÃ
          </a>
        </div>

        <div className="multiplatform-visual" aria-label="Feed Loves em diferentes dispositivos">
          <div className="multiplatform-halo" aria-hidden="true" />
          <div className="multiplatform-device multiplatform-tv">
            <img
              src={artwork}
              alt="O Segredo da Curandeira reproduzido na televisão"
              loading="lazy"
              decoding="async"
            />
            <div className="multiplatform-player" aria-hidden="true">
              <div className="multiplatform-player-line" />
              <Play />
            </div>
          </div>
          <div className="multiplatform-tv-stand" aria-hidden="true" />

          <div className="multiplatform-laptop">
            <div className="multiplatform-laptop-screen">
              <img
                src={artwork}
                alt="O Segredo da Curandeira no computador portátil"
                loading="lazy"
                decoding="async"
              />
              <div className="multiplatform-player" aria-hidden="true">
                <div className="multiplatform-player-line" />
                <Play />
              </div>
            </div>
            <div className="multiplatform-laptop-base" aria-hidden="true" />
          </div>

          <div className="multiplatform-device multiplatform-phone">
            <img
              src={artwork}
              alt="Capa de O Segredo da Curandeira no telemóvel"
              loading="lazy"
              decoding="async"
            />
            <div className="multiplatform-phone-controls" aria-hidden="true">
              <span />
            </div>
          </div>

          <svg className="multiplatform-sync" viewBox="0 0 650 545" aria-hidden="true">
            <path d="M253 369 C309 330 345 329 386 315" />
            <path d="M386 234 C398 270 420 287 446 314" />
            <path d="M527 338 C572 336 594 347 615 373" />
            <circle cx="253" cy="369" r="6" />
            <circle cx="386" cy="234" r="6" />
            <circle cx="615" cy="373" r="6" />
          </svg>

          <div className="multiplatform-resume">
            <span className="multiplatform-resume-icon" aria-hidden="true">
              <Play />
            </span>
            Continuar do minuto 18:42
          </div>
        </div>
      </div>
    </section>,
    portalTarget,
  );
}
