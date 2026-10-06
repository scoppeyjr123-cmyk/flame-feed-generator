import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { requireCustomer } from "../lib/customer/guard";
import { getCustomerAccount } from "../lib/public/server-fns";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/app/perfil")({
  beforeLoad: requireCustomer,
  loader: () => getCustomerAccount(),
  component: ProfilePage,
});

function ProfilePage() {
  const { session, subscription, history = [] } = Route.useLoaderData();
  const [name, setName] = useState(session.user?.name ?? "");
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function logout() {
    await createClient().auth.signOut();
    await router.navigate({ to: "/login" });
  }
  async function saveProfile() {
    const user = (await createClient().auth.getUser()).data.user;
    if (!user) return;
    const { error } = await createClient().from("profiles").update({ name }).eq("id", user.id);
    setMessage(error ? "Não foi possível salvar seu nome." : "Perfil atualizado.");
  }
  async function changePassword() {
    const password = window.prompt("Digite sua nova senha (mínimo de 8 caracteres):");
    if (!password) return;
    const { error } = await createClient().auth.updateUser({ password });
    setMessage(error ? error.message : "Senha atualizada.");
  }
  return (
    <div className="profile-page">
      <style>{`.profile-page{max-width:600px}.profile-page h1{font:600 36px "Playfair Display",Georgia,serif}.profile-box{margin-top:22px;border:1px solid #42243c;border-radius:14px;background:#170c16;padding:22px}.profile-box p{color:#bea9ba;margin-top:8px}.profile-field{display:grid;gap:7px;margin-top:18px;color:#bda7b9;font-size:12px}.profile-field input{border:1px solid #55304d;border-radius:9px;background:#0f080f;color:white;padding:11px}.profile-actions{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap}.profile-actions a,.profile-actions button{border:1px solid #633359;border-radius:999px;background:#211120;color:#f7dbea;padding:11px 16px;cursor:pointer}.profile-actions button{background:#f45db2;border-color:#f45db2;color:#180b17;font-weight:800}`}</style>
      <p className="app-kicker">Sua conta</p>
      <h1>Perfil</h1>
      <div className="profile-box">
        <strong>{session.user?.email}</strong>
        <label className="profile-field">
          Nome
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
          />
        </label>
        <p>
          {subscription
            ? `Plano ${Array.isArray(subscription.plans) ? subscription.plans[0]?.name : subscription.plans?.name} · ${subscription.status === "lifetime" ? "acesso vitalício" : "assinatura ativa"}.`
            : "Você está no acesso gratuito. Assine para liberar o catálogo completo."}
        </p>
        {subscription ? (
          <p>
            Vencimento:{" "}
            {subscription.expires_at
              ? new Date(subscription.expires_at).toLocaleDateString("pt-BR")
              : "sem vencimento"}{" "}
            · Renovação:{" "}
            {subscription.renews_at
              ? new Date(subscription.renews_at).toLocaleDateString("pt-BR")
              : "não definida"}
          </p>
        ) : null}
        {history.length ? (
          <div style={{ marginTop: 18 }}>
            <strong>Histórico da assinatura</strong>
            {history.map((item) => (
              <p key={`${item.created_at}-${item.action}`}>
                {item.action} · {new Date(item.created_at).toLocaleDateString("pt-BR")}
              </p>
            ))}
          </div>
        ) : null}
        <div className="profile-actions">
          <Link to="/app/minha-lista">Minha lista</Link>
          {!subscription ? <a href="/#planos">Ver planos</a> : null}
          <button onClick={saveProfile}>Salvar perfil</button>
          <button onClick={changePassword}>Alterar senha</button>
          <button onClick={logout}>Sair da conta</button>
        </div>
        {message ? <p role="status">{message}</p> : null}
      </div>
    </div>
  );
}
