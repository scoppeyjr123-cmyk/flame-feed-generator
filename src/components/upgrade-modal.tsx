import { Link } from "@tanstack/react-router";

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  planName?: string | null;
};

export function UpgradeModal({ open, onClose, planName }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="upgrade-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="upgrade-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="upgrade-modal-close" type="button" onClick={onClose} aria-label="Fechar">
          ×
        </button>
        <span className="upgrade-modal-heart">♡</span>
        <h2 id="upgrade-modal-title">Continue essa história com uma assinatura</h2>
        <p>
          {planName ? `Este episódio requer o plano ${planName}. ` : "Este episódio "}
          Escolha um plano e libere todas as histórias e episódios do Feed Loves.
        </p>
        <Link className="upgrade-modal-primary" to="/app/planos" onClick={onClose}>
          VER PLANOS
        </Link>
        <button className="upgrade-modal-secondary" type="button" onClick={onClose}>
          Agora não
        </button>
      </div>
      <style>{`.upgrade-modal-backdrop{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:20px;background:#090409b8;backdrop-filter:blur(8px)}.upgrade-modal{position:relative;width:min(100%,430px);padding:34px 28px 26px;border:1px solid #7f3e68;border-radius:22px;background:linear-gradient(145deg,#2a1126,#120811);box-shadow:0 25px 100px #0009;text-align:center}.upgrade-modal-close{position:absolute;top:12px;right:15px;border:0;background:transparent;color:#caaac0;font-size:25px;cursor:pointer}.upgrade-modal-heart{display:block;color:#f55bad;font-size:42px;line-height:1}.upgrade-modal h2{margin:12px auto 10px;font:700 27px/1.1 Georgia,serif;color:#fff}.upgrade-modal p{margin:0 auto 22px;max-width:330px;color:#d0b8ca;font-size:13px;line-height:1.6}.upgrade-modal-primary,.upgrade-modal-secondary{display:block;width:100%;padding:13px 16px;border-radius:999px;font-size:12px;font-weight:800}.upgrade-modal-primary{background:#f542a5;color:#fff}.upgrade-modal-secondary{margin-top:8px;border:0;background:transparent;color:#d8b6cc;cursor:pointer}`}</style>
    </div>
  );
}
