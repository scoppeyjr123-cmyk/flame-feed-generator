import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { requireCustomer } from "../lib/customer/guard";
import { createClient } from "../lib/supabase/client";

export const Route = createFileRoute("/app/perfil")({
  beforeLoad: requireCustomer,
  component: ProfilePage,
});

function ProfilePage() {
  const session = Route.useRouteContext();
  const router = useRouter();
  async function logout() {
    await createClient().auth.signOut();
    await router.navigate({ to: "/login" });
  }
  return (
    <div className="profile-page">
      <style>{`.profile-page{max-width:600px}.profile-page h1{font:600 36px "Playfair Display",Georgia,serif}.profile-box{margin-top:22px;border:1px solid #42243c;border-radius:14px;background:#170c16;padding:22px}.profile-box p{color:#bea9ba;margin-top:8px}.profile-actions{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap}.profile-actions a,.profile-actions button{border:1px solid #633359;border-radius:999px;background:#211120;color:#f7dbea;padding:11px 16px;cursor:pointer}.profile-actions button{background:#f45db2;border-color:#f45db2;color:#180b17;font-weight:800}`}</style>
      <p className="app-kicker">Sua conta</p>
      <h1>Perfil</h1>
      <div className="profile-box">
        <strong>{session.user.email}</strong>
        <p>Gerencie sua experiência Feed Loves e acompanhe suas histórias favoritas.</p>
        <div className="profile-actions">
          <Link to="/app/minha-lista">Minha lista</Link>
          <button onClick={logout}>Sair da conta</button>
        </div>
      </div>
    </div>
  );
}
