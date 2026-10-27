import { CheckCircle2, Sparkles, UserPlus, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { createAdminCustomerAccount } from "../../lib/admin/server-fns";

export type PlanItem = {
  id: string;
  name: string;
  slug: string;
  billing_interval: "week" | "month" | "year" | "lifetime";
  price?: number;
  active?: boolean;
};

type CreateCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  plans: PlanItem[];
  onSuccess?: (result: { userId: string; isNew: boolean }) => void;
};

function intervalLabel(interval: string) {
  switch (interval) {
    case "week":
      return "Semanal";
    case "month":
      return "Mensal";
    case "year":
      return "Anual";
    case "lifetime":
      return "Vitalício";
    default:
      return interval;
  }
}

export function CreateCustomerModal({ open, onClose, plans, onSuccess }: CreateCustomerModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grantAccess, setGrantAccess] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>(() => plans[0]?.id ?? "lifetime");
  const [status, setStatus] = useState<"active" | "lifetime" | "pending" | "paused">("active");
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper to calculate expiration date
  function calculateSuggestedExpiration(planIdOrLifetime: string, startDateStr: string) {
    if (planIdOrLifetime === "lifetime") return "";
    const foundPlan = plans.find((p) => p.id === planIdOrLifetime);
    const start = startDateStr ? new Date(`${startDateStr}T12:00:00`) : new Date();
    if (Number.isNaN(start.getTime())) return "";

    const daysToAdd =
      foundPlan?.billing_interval === "week"
        ? 7
        : foundPlan?.billing_interval === "year"
          ? 365
          : 30;

    const expDate = new Date(start.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return expDate.toISOString().slice(0, 10);
  }

  // Update expiration when plan or start date changes
  useEffect(() => {
    if (selectedPlan === "lifetime") {
      setStatus("lifetime");
      setExpiresAt("");
    } else {
      if (status === "lifetime") setStatus("active");
      setExpiresAt(calculateSuggestedExpiration(selectedPlan, startsAt));
    }
  }, [selectedPlan, startsAt]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setGrantAccess(true);
      const initialPlan = plans[0]?.id ?? "lifetime";
      setSelectedPlan(initialPlan);
      setStatus("active");
      const today = new Date().toISOString().slice(0, 10);
      setStartsAt(today);
      setExpiresAt(calculateSuggestedExpiration(initialPlan, today));
      setNotes("");
      setError("");
      setSuccess("");
      setLoading(false);
    }
  }, [open, plans]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open && !loading) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Por favor, informe um endereço de e-mail válido.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const isLifetime = selectedPlan === "lifetime" || status === "lifetime";
      const planId = isLifetime ? null : selectedPlan;

      const result = await createAdminCustomerAccount({
        data: {
          name: name.trim() || null,
          email: email.trim(),
          password: password.trim() || null,
          grantAccess,
          planId: grantAccess ? planId : null,
          status: grantAccess ? (isLifetime ? "lifetime" : status) : undefined,
          startsAt: grantAccess ? startsAt : null,
          expiresAt: grantAccess && !isLifetime && expiresAt ? expiresAt : null,
          notes: notes.trim() || null,
        },
      });

      setSuccess(result.message);
      if (onSuccess) {
        onSuccess({ userId: result.userId ?? "", isNew: result.isNew });
      }
      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao criar o cliente.");
      setLoading(false);
    }
  }

  const isLifetime = selectedPlan === "lifetime" || status === "lifetime";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-customer-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "grid",
        placeItems: "center",
        backgroundColor: "rgba(8, 4, 8, 0.82)",
        backdropFilter: "blur(12px)",
        padding: "16px",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="admin-card"
        style={{
          width: "min(100%, 580px)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 18,
          border: "1px solid var(--admin-card-border, #5a2d4c)",
          background: "var(--admin-card-bg, linear-gradient(150deg, #241124 0%, #160b17 100%))",
          boxShadow: "var(--admin-card-shadow, 0 28px 90px rgba(0, 0, 0, 0.85))",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "22px 24px 18px",
            borderBottom: "1px solid var(--admin-card-border, #3d2236)",
            background: "linear-gradient(180deg, rgba(243,60,168,0.06), transparent)",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--primary)",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: ".15em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              <UserPlus size={13} />
              Área Administrativa
            </div>
            <h3 id="create-customer-title" style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--admin-text-strong, #fff)" }}>
              Criar Conta de Cliente
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--admin-muted, #a8889d)", fontSize: 11, lineHeight: 1.5 }}>
              Provisiona o cliente para login sem senha (OTP) e libera o acesso ao Web App.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="admin-icon-button"
            style={{ width: 32, height: 32, borderRadius: 8 }}
            aria-label="Fechar"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content & Form */}
        <form
          onSubmit={(event) => void handleSubmit(event)}
          style={{ padding: "20px 24px 24px", overflowY: "auto", display: "grid", gap: 16 }}
        >
          {error ? (
            <p className="admin-alert" role="alert" style={{ margin: 0 }}>
              {error}
            </p>
          ) : null}

          {success ? (
            <div
              className="admin-alert admin-success"
              role="status"
              style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
            >
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          ) : null}

          {/* Section: Customer identity */}
          <div style={{ display: "grid", gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#e66cb7", textTransform: "uppercase", letterSpacing: ".1em" }}>
              1. Identificação do Cliente
            </span>

            <div className="admin-field">
              <label htmlFor="customer-modal-name">Nome do cliente (opcional)</label>
              <input
                id="customer-modal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Juliana Mendes"
                disabled={loading}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="customer-modal-email">
                E-mail de acesso <strong style={{ color: "var(--primary)" }}>*</strong>
              </label>
              <input
                id="customer-modal-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: juliana@email.com"
                disabled={loading}
              />
              <span className="admin-muted" style={{ fontSize: 10, marginTop: 2 }}>
                O cliente utilizará este e-mail para receber o código OTP no login sem senha.
              </span>
            </div>

            <div className="admin-field">
              <label htmlFor="customer-modal-password">
                Senha inicial <span style={{ color: "#8e7187" }}>(opcional)</span>
              </label>
              <input
                id="customer-modal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Deixe em branco para acesso exclusivo sem senha (OTP)"
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-divider" style={{ margin: "6px 0" }} />

          {/* Section: Web App Access */}
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--admin-card-border, #4a2441)",
                background: "var(--admin-btn-ghost-bg, #1e0e1e)",
              }}
            >
              <div>
                <label
                  htmlFor="grant-access-checkbox"
                  style={{ fontWeight: 700, fontSize: 12, color: "var(--admin-text-strong, #fff)", cursor: "pointer", display: "block" }}
                >
                  Liberar acesso ao Web App imediatamente
                </label>
                <p className="admin-muted" style={{ margin: "2px 0 0", fontSize: 10 }}>
                  Concede assinatura ativa para assistir às mininovelas sem necessidade de compra.
                </p>
              </div>
              <input
                id="grant-access-checkbox"
                type="checkbox"
                checked={grantAccess}
                onChange={(e) => setGrantAccess(e.target.checked)}
                disabled={loading}
                style={{ width: 18, height: 18, accentColor: "var(--primary)", cursor: "pointer" }}
              />
            </div>

            {grantAccess ? (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid var(--admin-card-border, #3e1f36)",
                  background: "var(--admin-field-bg, #170b16)",
                }}
              >
                <div className="admin-form-grid" style={{ margin: 0 }}>
                  <div className="admin-field">
                    <label htmlFor="customer-modal-plan">Plano de Assinatura</label>
                    <select
                      id="customer-modal-plan"
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      disabled={loading}
                    >
                      <option value="lifetime">⭐ Acesso Vitalício (Lifetime)</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({intervalLabel(p.billing_interval)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="customer-modal-status">Status</label>
                    <select
                      id="customer-modal-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as typeof status)}
                      disabled={loading || isLifetime}
                    >
                      <option value="active">Ativa (Acesso Liberado)</option>
                      <option value="lifetime">Vitalícia (Sem Expiração)</option>
                      <option value="pending">Pendente</option>
                      <option value="paused">Pausada</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-grid" style={{ margin: 0 }}>
                  <div className="admin-field">
                    <label htmlFor="customer-modal-starts-at">Data de Início</label>
                    <input
                      id="customer-modal-starts-at"
                      type="date"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="admin-field">
                    <label htmlFor="customer-modal-expires-at">
                      Data de Expiração {isLifetime ? "(Vitalício)" : ""}
                    </label>
                    <input
                      id="customer-modal-expires-at"
                      type="date"
                      value={isLifetime ? "" : expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      disabled={loading || isLifetime}
                      placeholder={isLifetime ? "Sem expiração" : "YYYY-MM-DD"}
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="customer-modal-notes">Observações internas</label>
                  <input
                    id="customer-modal-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Cortesia de suporte, Venda manual via WhatsApp, etc."
                    disabled={loading}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick instructions badge */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--admin-card-border, #4f2545)",
              background: "var(--admin-metric-icon-bg, #200e1f)",
              display: "flex",
              alignItems: "flex-start",
              gap: 9,
              color: "var(--admin-text, #d8c0d3)",
              fontSize: 11,
              lineHeight: 1.5,
            }}
          >
            <Sparkles size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
            <span>
              Ao salvar, a conta estará pronta. O cliente pode acessar{" "}
              <strong style={{ color: "var(--admin-text-strong, #fff)" }}>/login</strong>, digitar este e-mail e receber o código OTP
              instantaneamente para entrar no Web App.
            </span>
          </div>

          {/* Actions */}
          <div className="admin-form-actions" style={{ marginTop: 6 }}>
            <button
              type="button"
              className="admin-ghost-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="admin-primary-button"
              disabled={loading}
              style={{ minWidth: 160 }}
            >
              {loading ? (
                "Criando conta…"
              ) : grantAccess ? (
                <>
                  <UserPlus size={14} /> Criar conta e liberar acesso
                </>
              ) : (
                <>
                  <UserPlus size={14} /> Criar conta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
