import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";

import { getCustomerSession } from "../lib/supabase/auth-server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const session = await getCustomerSession();
    if (session.authenticated) throw redirect({ to: "/app" });
  },
  component: CustomerLogin,
});

function CustomerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }
    await navigate({ to: "/app" });
  }

  return (
    <main className="customer-login-page">
      <style>{`.customer-login-page{min-height:100svh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 0%,#4e164244,transparent 48%),#100810;color:var(--foreground)}.customer-login-card{width:min(100%,420px);padding:34px;border:1px solid #5a2d4c;border-radius:20px;background:linear-gradient(145deg,#241124,#140914);box-shadow:0 24px 90px #00000066}.customer-login-brand{display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;font-size:20px;font-weight:800}.customer-login-brand img{width:44px;height:44px;border-radius:50%;object-fit:cover}.customer-login-kicker{margin-top:28px;color:#e66cb7;font-size:9px;font-weight:800;letter-spacing:.2em;text-align:center;text-transform:uppercase}.customer-login-card h1{margin-top:9px;text-align:center;font-size:27px}.customer-login-card>p{margin:8px auto 25px;max-width:300px;color:#b99bad;font-size:12px;line-height:1.6;text-align:center}.customer-login-form{display:grid;gap:15px}.customer-login-field{display:grid;gap:7px}.customer-login-field label{color:#d8bfd1;font-size:11px;font-weight:700}.customer-login-field input{width:100%;border:1px solid #5a2d4c;border-radius:9px;background:#160b16;padding:13px;color:#fff;outline:0}.customer-login-field input:focus{border-color:#e06bbc;box-shadow:0 0 0 3px #f33ca81c}.customer-login-error{border:1px solid #7a3d59;border-radius:9px;background:#2a1223;padding:10px 12px;color:#f0bdd9;font-size:11px}.customer-login-submit{min-height:48px;border:1px solid var(--primary);border-radius:999px;background:var(--primary);color:var(--primary-foreground);font-weight:800;cursor:pointer}.customer-login-submit:disabled{opacity:.65}.customer-login-back{display:block;margin-top:20px;color:#b99bad;text-align:center;font-size:11px}`}</style>
      <section className="customer-login-card" aria-labelledby="customer-login-title">
        <a href="/" className="customer-login-brand">
          <img src="/assets/brand-v4.jpg" alt="" /> Feed{" "}
          <span style={{ color: "var(--primary)" }}>Loves</span>
        </a>
        <p className="customer-login-kicker">Seu universo de histórias</p>
        <h1 id="customer-login-title">Entrar no Feed Loves</h1>
        <p>Acesse suas novelas, episódios e continue assistindo de onde parou.</p>
        <form className="customer-login-form" onSubmit={(event) => void submit(event)}>
          <div className="customer-login-field">
            <label htmlFor="customer-email">E-mail</label>
            <input
              id="customer-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="customer-login-field">
            <label htmlFor="customer-password">Senha</label>
            <input
              id="customer-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? (
            <p className="customer-login-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="customer-login-submit" type="submit" disabled={loading}>
            {loading ? "ENTRANDO…" : "ENTRAR"}
          </button>
        </form>
        <a href="/" className="customer-login-back">
          ← Voltar para o Feed Loves
        </a>
      </section>
    </main>
  );
}
