import {
  BarChart3,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  Film,
  Home,
  ImageIcon,
  LayoutDashboard,
  Link2,
  ListVideo,
  LogOut,
  Menu,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { createClient } from "../../lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/assinaturas", label: "Assinaturas", icon: CreditCard },
  { href: "/admin/novelas", label: "Novelas", icon: Film },
  { href: "/admin/episodios", label: "Episódios", icon: ListVideo },
  { href: "/admin/planos", label: "Planos", icon: Tags },
  { href: "/admin/checkout", label: "Checkout", icon: Link2 },
  { href: "/admin/home", label: "Home", icon: Home },
  { href: "/admin/midia", label: "Mídia", icon: ImageIcon },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/auditoria", label: "Auditoria", icon: ClipboardList },
] as const;

const adminStyles = `
  .admin-page{min-height:100svh;background:#100810;color:var(--foreground)}
  .admin-sidebar{position:fixed;inset:0 auto 0 0;z-index:60;width:252px;border-right:1px solid #3a2335;background:linear-gradient(180deg,#1b0b19,#100810 72%);display:flex;flex-direction:column;padding:24px 14px;transition:transform .2s ease}
  .admin-brand{display:flex;align-items:center;gap:10px;padding:0 10px 25px;border-bottom:1px solid #3a2335;font-weight:800;letter-spacing:-.02em}
  .admin-brand img{width:34px;height:34px;border-radius:50%;object-fit:cover;box-shadow:0 0 18px #f33ca844}
  .admin-brand span span{color:var(--primary)}
  .admin-eyebrow{margin:24px 10px 10px;color:#9f8297;font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
  .admin-nav{display:grid;gap:3px}
  .admin-nav a{display:flex;align-items:center;gap:11px;border:1px solid transparent;border-radius:10px;padding:10px 11px;color:#bfaaba;font-size:12px;transition:background .15s,color .15s,border-color .15s}
  .admin-nav a:hover,.admin-nav a[aria-current=true]{border-color:#6a3159;background:#2e132a;color:#fff}
  .admin-nav svg{width:16px;height:16px;color:#d16bac}
  .admin-sidebar-footer{margin-top:auto;padding:12px 10px 0;border-top:1px solid #3a2335;color:#8e7187;font-size:10px;line-height:1.5}
  .admin-main{min-height:100svh;margin-left:252px}
  .admin-topbar{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:72px;padding:16px clamp(18px,4vw,46px);border-bottom:1px solid #34202f;background:#100810e8;backdrop-filter:blur(15px)}
  .admin-topbar h1{font-size:19px;font-weight:700;letter-spacing:-.02em}.admin-topbar p{margin-top:3px;color:#a8889d;font-size:11px}
  .admin-topbar-actions{display:flex;align-items:center;gap:10px}.admin-user{display:flex;align-items:center;gap:9px;color:#cdb6c7;font-size:11px}.admin-avatar{display:grid;place-items:center;width:31px;height:31px;border:1px solid #85416f;border-radius:50%;background:#2e132a;color:#ff7cc9}
  .admin-icon-button,.admin-ghost-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid #543147;border-radius:9px;background:#1d0e1b;color:#d8c2d4;cursor:pointer;transition:background .15s,border-color .15s,color .15s}.admin-icon-button{width:36px;height:36px}.admin-ghost-button{padding:9px 12px;font-size:11px}.admin-icon-button:hover,.admin-ghost-button:hover{border-color:#b74e95;background:#32152e;color:#fff}
  .admin-content{padding:28px clamp(18px,4vw,46px) 54px}.admin-content-inner{max-width:1440px;margin:auto}
  .admin-toolbar{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:24px}.admin-toolbar h2{font-size:24px;font-weight:700;letter-spacing:-.03em}.admin-toolbar p{margin-top:5px;color:#a8889d;font-size:12px}.admin-primary-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;border:1px solid var(--primary);border-radius:9px;background:var(--primary);padding:9px 14px;color:var(--primary-foreground);font-size:11px;font-weight:800;cursor:pointer;box-shadow:0 8px 25px #f33ca82b;transition:filter .15s,transform .15s}.admin-primary-button:hover{filter:brightness(1.08);transform:translateY(-1px)}
  .admin-metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.admin-card{border:1px solid #3a2335;border-radius:13px;background:linear-gradient(145deg,#211020,#160b16);box-shadow:0 14px 35px #0000001c}.admin-metric{padding:17px}.admin-metric-top{display:flex;align-items:center;justify-content:space-between;color:#a8889d;font-size:10px}.admin-metric-icon{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:#3a1733;color:#ed75bf}.admin-metric-value{margin-top:13px;font-size:26px;font-weight:700;letter-spacing:-.04em}.admin-metric-note{margin-top:4px;color:#8e7187;font-size:10px}
  .admin-grid-2{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,1fr);gap:16px;margin-top:16px}.admin-panel{padding:18px}.admin-panel-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:15px}.admin-panel-title h3{font-size:13px;font-weight:700}.admin-panel-title a{color:#ef72bd;font-size:10px}.admin-list{display:grid;gap:7px}.admin-list-row{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid #33202d;padding:11px 0;color:#d7c5d2;font-size:11px}.admin-list-row:first-child{border-top:0;padding-top:0}.admin-list-row:last-child{padding-bottom:0}.admin-list-main{min-width:0}.admin-list-main strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.admin-list-main span{display:block;margin-top:3px;color:#907388;font-size:10px}.admin-muted{color:#907388;font-size:11px}
  .admin-table-wrap{overflow-x:auto;border:1px solid #3a2335;border-radius:13px}.admin-table{width:100%;min-width:720px;border-collapse:collapse}.admin-table th{padding:12px 14px;background:#1b0c19;color:#9e8296;text-align:left;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.admin-table td{border-top:1px solid #34202f;padding:13px 14px;color:#d8c5d3;font-size:11px}.admin-table tbody tr:hover{background:#21101f}.admin-table strong{color:#fff;font-weight:600}.admin-badge{display:inline-flex;border:1px solid #70405f;border-radius:999px;padding:4px 8px;color:#e6b6d6;font-size:9px;font-weight:700;text-transform:capitalize}.admin-badge.success{border-color:#35644b;background:#11271c;color:#91d3a8}.admin-badge.warning{border-color:#75602e;background:#2a220e;color:#e6ca73}.admin-badge.danger{border-color:#713d4a;background:#2d1119;color:#ed9bab}.admin-badge.muted{border-color:#493644;background:#211722;color:#b89eaf}
  .admin-empty{display:grid;place-items:center;min-height:230px;padding:28px;text-align:center}.admin-empty-icon{display:grid;place-items:center;width:42px;height:42px;margin-bottom:12px;border:1px solid #66385a;border-radius:12px;background:#32142e;color:#ed75bf}.admin-empty h3{font-size:13px;font-weight:700}.admin-empty p{max-width:380px;margin-top:6px;color:#987b90;font-size:11px;line-height:1.6}
  .admin-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.admin-field{display:grid;gap:6px}.admin-field.full{grid-column:1/-1}.admin-field label{color:#bda7b9;font-size:10px;font-weight:700}.admin-field input,.admin-field textarea,.admin-field select{width:100%;border:1px solid #523147;border-radius:9px;background:#160b16;padding:10px 11px;color:#f8edf5;font-size:12px;outline:0}.admin-field textarea{min-height:100px;resize:vertical}.admin-field input:focus,.admin-field textarea:focus,.admin-field select:focus{border-color:#cc62aa;box-shadow:0 0 0 3px #f33ca81a}.admin-form-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}.admin-divider{height:1px;margin:20px 0;background:#3a2335}.admin-alert{margin-bottom:15px;border:1px solid #7a3d59;border-radius:10px;background:#2a1223;padding:11px 13px;color:#f0bdd9;font-size:11px}.admin-success{border-color:#34654a;background:#12281c;color:#a5ddb7}
  .admin-mobile-menu{display:none}.admin-drawer-backdrop{display:none}
  @media(max-width:1000px){.admin-metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.admin-grid-2{grid-template-columns:1fr}}
  @media(max-width:700px){.admin-sidebar{transform:translateX(-100%);box-shadow:20px 0 60px #00000066}.admin-sidebar.open{transform:translateX(0)}.admin-main{margin-left:0}.admin-topbar{min-height:64px;padding:12px 15px}.admin-mobile-menu{display:inline-flex}.admin-drawer-backdrop{display:block;position:fixed;inset:0;z-index:50;background:#0009}.admin-toolbar{align-items:flex-start;flex-direction:column}.admin-toolbar h2{font-size:21px}.admin-content{padding:22px 15px 42px}.admin-user span{display:none}.admin-form-grid{grid-template-columns:1fr}.admin-field.full{grid-column:auto}.admin-primary-button{width:100%}}
  @media(max-width:430px){.admin-metric-grid{grid-template-columns:1fr}.admin-panel{padding:14px}.admin-topbar h1{font-size:16px}}
`;

type AdminShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminShell({ children, title, description, actions }: AdminShellProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    void createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active) setEmail(data.user?.email ?? "");
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    await createClient().auth.signOut();
    window.location.assign("/admin/login");
  }

  return (
    <div className="admin-page">
      <style>{adminStyles}</style>
      {open ? (
        <button
          type="button"
          className="admin-drawer-backdrop"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <a href="/admin" className="admin-brand" onClick={() => setOpen(false)}>
          <img src="/assets/brand-v2.png" alt="" />
          <span>
            Feed <span>Loves</span>
          </span>
        </a>
        <p className="admin-eyebrow">Painel de operação</p>
        <nav className="admin-nav" aria-label="Navegação administrativa">
          {navItems.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              aria-current={
                typeof window !== "undefined" && window.location.pathname === href
                  ? "true"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          Dados reais do Supabase
          <br />
          RLS e auditoria ativos
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-actions">
            <button
              type="button"
              className="admin-icon-button admin-mobile-menu"
              aria-label="Abrir menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={17} />
            </button>
            <div>
              <h1>{title}</h1>
              {description ? <p>{description}</p> : null}
            </div>
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-user">
              <span>{email || "Administrador"}</span>
              <span className="admin-avatar">
                <CircleUserRound size={16} />
              </span>
            </div>
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Sair do painel"
              onClick={() => void handleLogout()}
            >
              <LogOut size={16} />
            </button>
            {open ? (
              <button
                type="button"
                className="admin-icon-button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </header>
        <main className="admin-content">
          <div className="admin-content-inner">
            {actions ? (
              <div className="admin-toolbar">
                <div />
                <div>{actions}</div>
              </div>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-toolbar">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  icon: Icon = BarChart3,
}: {
  title: string;
  description: string;
  icon?: typeof BarChart3;
}) {
  return (
    <div className="admin-card admin-empty">
      <div className="admin-empty-icon">
        <Icon size={19} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function AdminStatus({ status }: { status: string }) {
  const tone = ["active", "published", "lifetime"].includes(status)
    ? "success"
    : ["pending", "scheduled"].includes(status)
      ? "warning"
      : ["cancelled", "expired"].includes(status)
        ? "danger"
        : "muted";
  return <span className={`admin-badge ${tone}`}>{status}</span>;
}

export function AdminLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="admin-ghost-button">
      <span>{children}</span>
      <ChevronRight size={14} />
    </a>
  );
}

