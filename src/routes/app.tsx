import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { requireCustomer } from "../lib/customer/guard";
import { getCustomerAccount } from "../lib/public/server-fns";

export const Route = createFileRoute("/app")({
  beforeLoad: requireCustomer,
  loader: () => getCustomerAccount(),
  component: AppShell,
});

function AppShell() {
  const { subscription } = Route.useLoaderData();
  const hasSubscription = Boolean(subscription && (subscription.status === "active" || subscription.status === "lifetime"));
  return (
    <main className="feed-app">
      <style>{`.feed-app{min-height:100svh;background:#0d070d;color:var(--foreground)}.feed-app-header{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px clamp(18px,4vw,56px);border-bottom:1px solid #3b1d35;background:#0d070de8;backdrop-filter:blur(18px)}.feed-app-brand{display:flex;align-items:center;gap:9px;font-weight:800}.feed-app-brand img{width:34px;height:34px;border-radius:50%;object-fit:cover}.feed-app-brand span{color:var(--primary)}.feed-app-nav{display:flex;align-items:center;gap:22px;color:#cdb5c8;font-size:12px}.feed-app-nav a:hover{color:var(--primary)}.feed-app-content{width:min(1180px,calc(100% - 36px));margin:0 auto;padding:30px 0 100px}.feed-app-mobile-nav{position:fixed;right:0;bottom:0;left:0;z-index:40;display:none;justify-content:space-around;border-top:1px solid #3b1d35;background:#130a13f2;padding:10px 8px;color:#cdb5c8;font-size:10px}@media(max-width:700px){.feed-app-nav{display:none}.feed-app-mobile-nav{display:flex}}`}</style>
      <header className="feed-app-header">
        <Link to="/app" className="feed-app-brand">
          <img src="/assets/brand-v4.jpg" alt="" /> Feed <span>Loves</span>
        </Link>
        <nav className="feed-app-nav" aria-label="Navegação principal">
          <Link to="/app">Início</Link>
          <Link to="/app">Doramas</Link>
          <Link to="/app">Séries Turcas</Link>
          <Link to="/app">Novelinhas</Link>
          <Link to="/app/minha-lista">Minha Lista</Link>
          <Link to="/app/planos" preload="intent">Planos</Link>
        </nav>
        <Link to="/app/perfil" className="feed-app-brand" aria-label="Perfil">
          Perfil
        </Link>
      </header>
      <div className="feed-app-content">
        <style>{`.feed-free-banner{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px;padding:14px 18px;border:1px solid #72395d;border-radius:14px;background:#241022}.feed-free-banner div{display:grid;gap:4px}.feed-free-banner strong{font-size:13px}.feed-free-banner span{color:#c7aabd;font-size:11px}.feed-free-banner a{flex-shrink:0;border-radius:999px;background:var(--primary);padding:10px 14px;color:#fff;font-size:10px;font-weight:800}@media(max-width:650px){.feed-free-banner{align-items:stretch;flex-direction:column}.feed-free-banner a{text-align:center}}`}</style>
        {!hasSubscription ? <div className="feed-free-banner"><div><strong>Você está usando o Feed Loves Grátis ♡</strong><span>Assine para liberar todo o catálogo e assistir sem limitações.</span></div><Link to="/app/planos" preload="intent">LIBERAR TODO O CATÁLOGO</Link></div> : null}
        <Outlet />
      </div>
      <nav className="feed-app-mobile-nav" aria-label="Navegação mobile">
        <Link to="/app/buscar">
          ⌂<br />
          Início
        </Link>
        <Link to="/app/minha-lista">
          ⌕<br />
          Buscar
        </Link>
        <Link to="/app/perfil">
          ♡<br />
          Minha Lista
        </Link>
        <Link to="/app">
          ◉<br />
          Perfil
        </Link>
      </nav>
    </main>
  );
}
