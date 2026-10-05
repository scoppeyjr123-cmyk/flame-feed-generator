import { X } from "lucide-react";
import { useEffect, useRef } from "react";

type SubscriptionModalProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export function SubscriptionModal({ open, onClose, onContinue }: SubscriptionModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElementRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="part2-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="part2-subscription-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="part2-subscription-modal-title"
        aria-describedby="part2-subscription-modal-description"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="part2-subscription-modal-close"
          aria-label="Fechar convite de assinatura"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <span className="part2-subscription-modal-icon" aria-hidden="true">
          ♡
        </span>
        <h2 id="part2-subscription-modal-title">A história não precisa terminar aqui ♡</h2>
        <p id="part2-subscription-modal-description">
          Assine o Feed Loves e continue assistindo novas histórias e episódios completos.
        </p>
        <button type="button" className="part2-subscription-modal-cta" onClick={onContinue}>
          ASSINE PARA CONTINUAR ASSISTINDO
        </button>
        <small>Novas histórias, episódios completos e acesso imediato.</small>
      </section>
    </div>
  );
}
