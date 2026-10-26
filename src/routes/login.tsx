import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, Mail, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";

import {
  getCustomerAccessStatus,
  getCustomerSession,
  type CustomerAccessStatus,
} from "../lib/supabase/auth-server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const session = await getCustomerSession();
    if (session.authenticated) throw redirect({ to: "/app" });
  },
  head: () => ({
    meta: [
      { title: "Entre na FeedLoves | Acesso sem senha" },
      {
        name: "description",
        content: "Acesse suas novelas e histórias favoritas no Feed Loves sem precisar de senha.",
      },
    ],
  }),
  component: CustomerLogin,
});

type LoginStep = "email" | "otp" | "status_feedback";

function CustomerLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [accessStatus, setAccessStatus] = useState<CustomerAccessStatus | null>(null);

  // Countdown timer for resending OTP code
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  // Step 1: Send OTP to customer email
  async function handleSendOtp(event?: FormEvent) {
    if (event) event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Por favor, digite um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        if (otpError.message.toLowerCase().includes("rate") || otpError.status === 429) {
          setError(
            "Muitas tentativas em pouco tempo. Por favor, aguarde alguns instantes antes de solicitar um novo código.",
          );
        } else {
          setError(
            "Não foi possível enviar o código no momento. Verifique o e-mail digitado e tente novamente.",
          );
        }
        setLoading(false);
        return;
      }

      setStep("otp");
      setCooldown(60);
    } catch {
      setError("Ocorreu um erro ao enviar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP code
  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setError("");

    const cleanCode = otpCode.trim();
    if (cleanCode.length < 6) {
      setError("Digite o código de verificação recebido no seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();

      // Verify OTP with Supabase
      let { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanCode,
        type: "email",
      });

      // Fallback for new user signups
      if (verifyError && verifyError.message.toLowerCase().includes("signup")) {
        const fallback = await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token: cleanCode,
          type: "signup",
        });
        if (!fallback.error) {
          data = fallback.data;
          verifyError = null;
        }
      }

      if (verifyError || !data.session) {
        setError(
          "Código inválido ou expirado. Verifique os números digitados ou solicite um novo código.",
        );
        setLoading(false);
        return;
      }

      // Check real subscription status on backend
      const statusResult = await getCustomerAccessStatus();
      setAccessStatus(statusResult);

      if (statusResult.hasActiveSubscription) {
        // Active subscriber: proceed directly to app
        await navigate({ to: "/app" });
      } else {
        // Needs renewal, plans, or pending review
        setStep("status_feedback");
      }
    } catch {
      setError("Não foi possível validar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToEmail() {
    setError("");
    setOtpCode("");
    setStep("email");
  }

  return (
    <main className="customer-login-page">
      <style>{`
        .customer-login-page {
          min-height: 100svh;
          display: grid;
          place-items: center;
          padding: 24px 16px;
          background: radial-gradient(circle at 50% 0%, #4e164244, transparent 55%),
                      radial-gradient(circle at 80% 80%, #300c2833, transparent 50%),
                      #100810;
          color: var(--foreground);
        }
        .customer-login-card {
          width: min(100%, 430px);
          padding: 38px 30px;
          border: 1px solid #5a2d4c;
          border-radius: 24px;
          background: linear-gradient(155deg, #251125 0%, #170a17 60%, #110611 100%);
          box-shadow: 0 28px 90px #00000088, 0 0 36px #f33ca81c;
          position: relative;
        }
        .customer-login-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #fff;
          font-size: 21px;
          font-weight: 800;
          text-decoration: none;
        }
        .customer-login-brand img {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 0 20px #f33ca844;
        }
        .customer-login-brand span {
          color: var(--primary);
        }
        .customer-login-kicker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin: 24px auto 0;
          padding: 6px 14px;
          border: 1px solid #ff62b344;
          border-radius: 999px;
          background: #2b1126a8;
          color: #ff94d1;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
          text-align: center;
        }
        .customer-login-kicker-center {
          display: flex;
          justify-content: center;
        }
        .customer-login-card h1 {
          margin-top: 14px;
          text-align: center;
          font: 700 30px/1.1 "Playfair Display", Georgia, serif;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .customer-login-subtitle {
          margin: 10px auto 26px;
          max-width: 330px;
          color: #d1b8ca;
          font-size: 13px;
          line-height: 1.6;
          text-align: center;
        }
        .customer-login-form {
          display: grid;
          gap: 16px;
        }
        .customer-login-field {
          display: grid;
          gap: 8px;
        }
        .customer-login-field label {
          color: #dec8d8;
          font-size: 12px;
          font-weight: 700;
        }
        .customer-login-input-wrap {
          position: relative;
        }
        .customer-login-field input {
          width: 100%;
          border: 1px solid #5a2d4c;
          border-radius: 12px;
          background: #160b16;
          padding: 14px 16px;
          color: #fff;
          font-size: 14px;
          outline: 0;
          transition: border-color .2s, box-shadow .2s;
        }
        .customer-login-field input:focus {
          border-color: #f45db2;
          box-shadow: 0 0 0 3px #f33ca82b;
        }
        .customer-login-field input.otp-input {
          text-align: center;
          font-size: 24px;
          letter-spacing: 0.28em;
          font-weight: 800;
          padding: 12px 16px;
        }
        .customer-login-helper {
          color: #b99bad;
          font-size: 11px;
          line-height: 1.5;
        }
        .customer-login-badge-box {
          margin-top: 4px;
          padding: 10px 14px;
          border: 1px solid #6b2e57;
          border-radius: 10px;
          background: #250d2188;
          color: #ffd6ee;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }
        .customer-login-error {
          border: 1px solid #8e3860;
          border-radius: 10px;
          background: #311124;
          padding: 11px 14px;
          color: #ffd1e7;
          font-size: 12px;
          line-height: 1.45;
        }
        .customer-login-submit {
          min-height: 50px;
          margin-top: 6px;
          border: 1px solid #ff7bc1;
          border-radius: 999px;
          background: var(--primary);
          color: #1a0615;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .03em;
          cursor: pointer;
          transition: transform .2s, filter .2s, box-shadow .2s;
          box-shadow: 0 10px 30px #f45db240;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .customer-login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 14px 38px #f45db255;
        }
        .customer-login-submit:disabled {
          opacity: .65;
          cursor: wait;
        }
        .customer-login-resend {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 18px;
          color: #dec8d8;
          font-size: 12px;
        }
        .customer-login-resend button {
          border: 0;
          background: transparent;
          color: #f45db2;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          text-decoration: underline;
          padding: 4px 6px;
        }
        .customer-login-resend button:disabled {
          color: #8c7183;
          text-decoration: none;
          cursor: not-allowed;
        }
        .customer-login-change-email {
          border: 0;
          background: transparent;
          color: #ff95d2;
          font-size: 11px;
          cursor: pointer;
          text-decoration: underline;
          margin-top: 4px;
        }
        .customer-login-footer {
          margin-top: 26px;
          padding-top: 20px;
          border-top: 1px solid #3b1933;
          display: grid;
          gap: 12px;
          text-align: center;
        }
        .customer-login-plans-link {
          color: #e5b9d7;
          font-size: 12px;
          text-decoration: none;
          transition: color .2s;
        }
        .customer-login-plans-link:hover {
          color: #f45db2;
        }
        .customer-login-plans-link strong {
          color: #f45db2;
          text-decoration: underline;
        }
        .customer-login-back-home {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #a88a9e;
          font-size: 11px;
          text-decoration: none;
          transition: color .2s;
        }
        .customer-login-back-home:hover {
          color: #ff9fd7;
        }

        /* Status feedback styles */
        .status-feedback-box {
          text-align: center;
          padding: 10px 0;
        }
        .status-feedback-icon {
          display: grid;
          place-items: center;
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          border-radius: 50%;
        }
        .status-feedback-icon.active {
          background: #17422a;
          color: #55df98;
          border: 1px solid #2ea163;
        }
        .status-feedback-icon.expired {
          background: #46221c;
          color: #ff8c75;
          border: 1px solid #943d2c;
        }
        .status-feedback-icon.pending {
          background: #3e3215;
          color: #ffd15d;
          border: 1px solid #8e7225;
        }
        .status-feedback-icon.none {
          background: #381530;
          color: #ff7bc1;
          border: 1px solid #7d2668;
        }
        .status-feedback-title {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .status-feedback-desc {
          color: #dec8d8;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 22px;
        }
        .status-feedback-actions {
          display: grid;
          gap: 10px;
        }
        .status-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          border-radius: 999px;
          background: var(--primary);
          color: #170413;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }
        .status-btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          border: 1px solid #6b2e57;
          border-radius: 999px;
          background: #1b0a1a;
          color: #e8d0e1;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        @media(max-width: 480px) {
          .customer-login-card {
            padding: 28px 20px;
            border-radius: 20px;
          }
          .customer-login-card h1 {
            font-size: 26px;
          }
        }
      `}</style>

      <section className="customer-login-card" aria-labelledby="customer-login-title">
        <Link to="/" className="customer-login-brand">
          <img src="/assets/brand-v4.jpg" alt="" />
          Feed <span>Loves</span>
        </Link>

        {/* STEP 1: EMAIL INPUT */}
        {step === "email" && (
          <>
            <div className="customer-login-kicker-center">
              <span className="customer-login-kicker">✦ Bem-vindo de volta à FeedLoves!</span>
            </div>
            <h1 id="customer-login-title">Entre na FeedLoves</h1>
            <p className="customer-login-subtitle">
              Use o mesmo e-mail informado na compra para acessar suas novelas favoritas.
            </p>

            <form className="customer-login-form" onSubmit={(e) => void handleSendOtp(e)}>
              <div className="customer-login-field">
                <label htmlFor="customer-email">E-mail</label>
                <div className="customer-login-input-wrap">
                  <input
                    id="customer-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Seu e-mail da compra"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <p className="customer-login-helper">
                  Digite o mesmo e-mail utilizado na compra da sua assinatura para acessar suas
                  novelas.
                </p>
              </div>

              <div className="customer-login-badge-box">
                <Sparkles size={14} color="#f45db2" />
                Sem cadastro. Sem senha. Simples assim.
              </div>

              {error ? (
                <p className="customer-login-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button className="customer-login-submit" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> ENVIANDO CÓDIGO…
                  </>
                ) : (
                  "ACESSAR MINHA CONTA"
                )}
              </button>
            </form>

            <div className="customer-login-footer">
              <a href="/#planos" className="customer-login-plans-link">
                Ainda não assina? <strong>Conhecer os planos</strong>
              </a>
              <Link to="/" className="customer-login-back-home">
                <ArrowLeft size={13} /> Voltar para o início
              </Link>
            </div>
          </>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === "otp" && (
          <>
            <div className="customer-login-kicker-center">
              <span className="customer-login-kicker">✦ CÓDIGO DE VERIFICAÇÃO</span>
            </div>
            <h1 id="customer-login-title">Verifique seu e-mail</h1>
            <p className="customer-login-subtitle">
              Enviamos um código de acesso para o seu e-mail <strong>{email}</strong>. Digite o
              código abaixo para continuar.
              <br />
              <button
                type="button"
                className="customer-login-change-email"
                onClick={handleBackToEmail}
              >
                (Digitar outro e-mail)
              </button>
            </p>

            <form className="customer-login-form" onSubmit={(e) => void handleVerifyOtp(e)}>
              <div className="customer-login-field">
                <label htmlFor="customer-otp">Código de acesso (6 dígitos)</label>
                <input
                  id="customer-otp"
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  placeholder="000000"
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ""))}
                  disabled={loading}
                />
              </div>

              {error ? (
                <p className="customer-login-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button className="customer-login-submit" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> VERIFICANDO…
                  </>
                ) : (
                  "Confirmar e entrar"
                )}
              </button>
            </form>

            <div className="customer-login-resend">
              <span>Não recebeu o código?</span>
              <button
                type="button"
                disabled={cooldown > 0 || loading}
                onClick={() => void handleSendOtp()}
              >
                {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
              </button>
            </div>

            <div className="customer-login-footer">
              <button
                type="button"
                className="customer-login-back-home"
                onClick={handleBackToEmail}
                style={{ border: 0, background: "transparent", cursor: "pointer" }}
              >
                <ArrowLeft size={13} /> Voltar para o campo de e-mail
              </button>
            </div>
          </>
        )}

        {/* STEP 3: ACCESS STATUS FEEDBACK (If no active subscription found) */}
        {step === "status_feedback" && accessStatus && (
          <div className="status-feedback-box">
            {accessStatus.status === "expired" && (
              <>
                <div className="status-feedback-icon expired">
                  <Clock size={32} />
                </div>
                <h2 className="status-feedback-title">Sua assinatura expirou</h2>
                <p className="status-feedback-desc">
                  Sua assinatura{accessStatus.planName ? ` (${accessStatus.planName})` : ""} expirou.
                  Renove agora para continuar assistindo suas novelas de onde parou.
                </p>
                <div className="status-feedback-actions">
                  <Link to="/app/planos" className="status-btn-primary">
                    RENOVAR ASSINATURA
                  </Link>
                  <Link to="/app" className="status-btn-secondary">
                    Continuar no app gratuito
                  </Link>
                </div>
              </>
            )}

            {accessStatus.status === "pending" && (
              <>
                <div className="status-feedback-icon pending">
                  <Clock size={32} />
                </div>
                <h2 className="status-feedback-title">Pagamento em processamento</h2>
                <p className="status-feedback-desc">
                  Identificamos sua compra e ela está sendo confirmada pela operadora. O seu acesso
                  será liberado automaticamente em alguns instantes.
                </p>
                <div className="status-feedback-actions">
                  <Link to="/app" className="status-btn-primary">
                    ENTRAR NO APLICATIVO
                  </Link>
                  <button
                    type="button"
                    className="status-btn-secondary"
                    onClick={() => {
                      void getCustomerAccessStatus().then((res) => {
                        setAccessStatus(res);
                        if (res.hasActiveSubscription) void navigate({ to: "/app" });
                      });
                    }}
                  >
                    Verificar novamente
                  </button>
                </div>
              </>
            )}

            {accessStatus.status === "none" && (
              <>
                <div className="status-feedback-icon none">
                  <Mail size={32} />
                </div>
                <h2 className="status-feedback-title">Nenhuma assinatura ativa</h2>
                <p className="status-feedback-desc">
                  A conta <strong>{accessStatus.email}</strong> foi identificada, mas não possui uma
                  assinatura ativa no momento. Escolha um plano para liberar todo o catálogo!
                </p>
                <div className="status-feedback-actions">
                  <a href="/#planos" className="status-btn-primary">
                    VER PLANOS E ASSINAR
                  </a>
                  <Link to="/app" className="status-btn-secondary">
                    Explorar catálogo gratuito
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
