import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react";

import { getCustomerSession, loginCustomerByEmail } from "../lib/supabase/auth-server-fns";

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

function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Por favor, digite um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginCustomerByEmail({ data: normalizedEmail });
      if (!result.ok) {
        setError(
          result.reason === "account_not_found"
            ? "Não encontramos uma conta com este e-mail. Confirme o e-mail usado na compra ou fale com nosso suporte."
            : result.reason === "invalid_email"
              ? "Por favor, digite um e-mail válido."
              : "Não foi possível acessar sua conta agora. Tente novamente em alguns instantes.",
        );
        return;
      }

      window.location.assign("/app");
    } catch {
      setError("Não foi possível acessar sua conta agora. Tente novamente em alguns instantes.");
    } finally {
      setLoading(false);
    }
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

        <div className="customer-login-kicker-center">
          <span className="customer-login-kicker">✦ Bem-vindo de volta à FeedLoves!</span>
        </div>
        <h1 id="customer-login-title">Entre na FeedLoves</h1>
        <p className="customer-login-subtitle">
          Use o mesmo e-mail informado na compra para acessar suas novelas favoritas.
        </p>

        <form className="customer-login-form" onSubmit={(event) => void handleLogin(event)}>
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
              Digite o mesmo e-mail utilizado na compra da sua assinatura para acessar suas novelas.
            </p>
          </div>

          <div className="customer-login-badge-box">
            <Sparkles size={14} color="#f45db2" />
            Sem código. Sem senha. Acesso imediato.
          </div>

          {error ? (
            <p className="customer-login-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="customer-login-submit" type="submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> ACESSANDO…
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
      </section>
    </main>
  );
}
