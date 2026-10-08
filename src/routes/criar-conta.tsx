import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";

import { getCustomerSession } from "../lib/supabase/auth-server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/criar-conta")({
  beforeLoad: async () => {
    const session = await getCustomerSession();
    if (session.authenticated) throw redirect({ to: "/app" });
  },
  component: CreateAccount,
});

function CreateAccount() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("As senhas não conferem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (signUpError) {
      setError(signUpError.message.toLowerCase().includes("already") ? "Este e-mail já possui uma conta." : "Não foi possível criar sua conta.");
      setLoading(false);
      return;
    }
    if (data.session) {
      await navigate({ to: "/app" });
      return;
    }
    setCreated(true);
    setLoading(false);
  }

  return (
    <main className="customer-login-page">
      <style>{`.customer-login-page{min-height:100svh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 0%,#4e164244,transparent 48%),#100810;color:var(--foreground)}.customer-login-card{width:min(100%,520px);padding:34px;border:1px solid #5a2d4c;border-radius:20px;background:linear-gradient(145deg,#241124,#140914);box-shadow:0 24px 90px #00000066}.customer-login-brand{display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;font-size:20px;font-weight:800}.customer-login-brand img{width:44px;height:44px;border-radius:50%;object-fit:cover}.customer-login-kicker{margin-top:28px;color:#e66cb7;font-size:9px;font-weight:800;letter-spacing:.2em;text-align:center;text-transform:uppercase}.customer-login-card h1{margin-top:9px;text-align:center;font-size:27px}.customer-login-card>p{margin:8px auto 25px;max-width:430px;color:#b99bad;font-size:12px;line-height:1.6;text-align:center}.create-account-benefits{display:grid;gap:7px;margin:0 0 24px;color:#d8bfd1;font-size:12px;line-height:1.4}.create-account-benefits span{color:#f56dbb}.customer-login-form{display:grid;gap:15px}.customer-login-field{display:grid;gap:7px}.customer-login-field label{color:#d8bfd1;font-size:11px;font-weight:700}.customer-login-field input{width:100%;border:1px solid #5a2d4c;border-radius:9px;background:#160b16;padding:13px;color:#fff;outline:0}.customer-login-field input:focus{border-color:#e06bbc;box-shadow:0 0 0 3px #f33ca81c}.customer-login-error{border:1px solid #7a3d59;border-radius:9px;background:#2a1223;padding:10px 12px;color:#f0bdd9;font-size:11px}.customer-login-submit{min-height:48px;border:1px solid var(--primary);border-radius:999px;background:var(--primary);color:var(--primary-foreground);font-weight:800;cursor:pointer}.customer-login-submit:disabled{opacity:.65}.customer-login-back{display:block;margin-top:20px;color:#b99bad;text-align:center;font-size:11px}.create-account-success{border:1px solid #5d9d7b;border-radius:9px;background:#173024;padding:12px;color:#bde5cb;font-size:12px;line-height:1.5}@media(max-width:540px){.customer-login-page{padding:14px}.customer-login-card{padding:25px 20px}}`}</style>
      <section className="customer-login-card" aria-labelledby="create-account-title">
        <Link to="/" className="customer-login-brand">
          <img src="/assets/brand-v4.jpg" alt="" /> Feed <span style={{ color: "var(--primary)" }}>Loves</span>
        </Link>
        <p className="customer-login-kicker">Acesso gratuito ao Web App</p>
        <h1 id="create-account-title">Crie sua conta grátis ♡</h1>
        <p>Comece a assistir gratuitamente e conheça o Feed Loves. Alguns conteúdos ficam disponíveis para contas gratuitas e você pode assinar quando quiser para liberar todo o catálogo.</p>
        <div className="create-account-benefits"><div><span>✓</span> Acesso gratuito ao Web App</div><div><span>✓</span> Alguns episódios e histórias liberados</div><div><span>✓</span> Assista pelo celular ou computador</div><div><span>✓</span> Faça upgrade quando quiser</div></div>
        {created ? <p className="create-account-success">Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre no Feed Loves.</p> : <form className="customer-login-form" onSubmit={(event) => void submit(event)}>
          <div className="customer-login-field"><label htmlFor="create-name">Nome</label><input id="create-name" required value={name} onChange={(event) => setName(event.target.value)} /></div>
          <div className="customer-login-field"><label htmlFor="create-email">E-mail</label><input id="create-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          <div className="customer-login-field"><label htmlFor="create-password">Senha</label><input id="create-password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          <div className="customer-login-field"><label htmlFor="create-confirmation">Confirmar senha</label><input id="create-confirmation" type="password" autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
          {error ? <p className="customer-login-error" role="alert">{error}</p> : null}
          <button className="customer-login-submit" type="submit" disabled={loading}>{loading ? "CRIANDO…" : "CRIAR MINHA CONTA GRÁTIS"}</button>
        </form>}
        <p className="customer-login-back">Já tem uma conta? <Link to="/login" style={{ color: "var(--primary)" }}>Entrar</Link></p>
      </section>
    </main>
  );
}
