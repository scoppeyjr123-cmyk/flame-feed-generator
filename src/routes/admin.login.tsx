import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";

import { getAdminSession } from "../lib/supabase/auth-server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    const session = await getAdminSession();
    if (session.isAdmin) throw redirect({ to: "/admin" });
  },
  head: () => ({
    meta: [
      { title: "Entrar no painel | Feed Loves" },
      { name: "description", content: "Acesso administrativo do Feed Loves." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    const session = await getAdminSession();
    if (!session.isAdmin) {
      await createClient().auth.signOut();
      setError("Esta conta não tem permissão de administrador.");
      setLoading(false);
      return;
    }

    await navigate({ to: "/admin" });
  }

  return (
    <main className="admin-login-page">
      <style>{`
        .admin-login-page{display:grid;place-items:center;min-height:100svh;padding:24px;background:radial-gradient(circle at 50% 0%,#4e164244,transparent 46%),#100810;color:var(--foreground)}
        .admin-login-card{width:min(100%,410px);border:1px solid #5a2d4c;border-radius:18px;background:linear-gradient(145deg,#241124,#140914);padding:34px;box-shadow:0 24px 90px #00000066}
        .admin-login-brand{display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;font-size:19px;font-weight:800}.admin-login-brand img{width:42px;height:42px;border-radius:50%;box-shadow:0 0 24px #f33ca855}.admin-login-brand span{color:var(--primary)}
        .admin-login-kicker{margin-top:28px;color:#e66cb7;font-size:9px;font-weight:800;letter-spacing:.2em;text-align:center;text-transform:uppercase}.admin-login-card h1{margin-top:9px;font-size:25px;font-weight:700;letter-spacing:-.04em;text-align:center}.admin-login-card>p{margin:8px auto 25px;max-width:290px;color:#a88a9e;font-size:12px;line-height:1.6;text-align:center}
        .admin-login-form{display:grid;gap:15px}.admin-login-field{display:grid;gap:7px}.admin-login-field label{color:#cbb3c5;font-size:10px;font-weight:700}.admin-login-field input{width:100%;border:1px solid #5a2d4c;border-radius:9px;background:#160b16;padding:12px;color:#fff;font-size:13px;outline:0}.admin-login-field input:focus{border-color:#e06bbc;box-shadow:0 0 0 3px #f33ca81c}.admin-login-error{border:1px solid #7a3d59;border-radius:9px;background:#2a1223;padding:10px 12px;color:#f0bdd9;font-size:11px}.admin-login-submit{min-height:46px;border:1px solid var(--primary);border-radius:999px;background:var(--primary);color:var(--primary-foreground);font-size:11px;font-weight:800;cursor:pointer;box-shadow:0 8px 26px #f33ca833}.admin-login-submit:disabled{cursor:wait;opacity:.65}.admin-login-back{display:block;margin-top:20px;color:#a88a9e;font-size:11px;text-align:center}.admin-login-back:hover{color:#f28bc9}
      `}</style>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <a href="/" className="admin-login-brand">
          <img src="/assets/brand.png" alt="" /> Feed{" "}
          <span>Loves</span>
        </a>
        <p className="admin-login-kicker">Área administrativa</p>
        <h1 id="admin-login-title">Entrar no painel</h1>
        <p>Gerencie assinaturas, histórias, episódios e configurações da plataforma.</p>
        <form className="admin-login-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="admin-login-field">
            <label htmlFor="admin-email">E-mail</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="admin-login-field">
            <label htmlFor="admin-password">Senha</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="admin-login-submit" type="submit" disabled={loading}>
            {loading ? "ENTRANDO…" : "ENTRAR NO PAINEL"}
          </button>
        </form>
        <a className="admin-login-back" href="/">
          ← Voltar para o Feed Loves
        </a>
      </section>
    </main>
  );
}
