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
  Moon,
  PlaySquare,
  Settings,
  Sun,
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
  { href: "/admin/parte-2", label: "Parte 2 & Ofertas", icon: PlaySquare },
  { href: "/admin/midia", label: "Mídia", icon: ImageIcon },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/auditoria", label: "Auditoria", icon: ClipboardList },
] as const;

const adminStyles = `
  .admin-page{
    --admin-bg:#100810;
    --admin-text:#f5edf4;
    --admin-text-strong:#ffffff;
    --admin-muted:#a8889d;
    --admin-sidebar-bg:linear-gradient(180deg,#1b0b19,#100810 72%);
    --admin-sidebar-border:#3a2335;
    --admin-nav-color:#bfaaba;
    --admin-nav-hover-bg:#2e132a;
    --admin-nav-hover-border:#6a3159;
    --admin-nav-hover-color:#ffffff;
    --admin-nav-active-bg:#2e132a;
    --admin-nav-active-border:#6a3159;
    --admin-nav-active-color:#ffffff;
    --admin-topbar-bg:#100810e8;
    --admin-topbar-border:#34202f;
    --admin-card-bg:linear-gradient(145deg,#211020,#160b16);
    --admin-card-border:#3a2335;
    --admin-card-shadow:0 14px 35px #0000001c;
    --admin-field-bg:#160b16;
    --admin-field-border:#523147;
    --admin-field-color:#f8edf5;
    --admin-field-label:#bda7b9;
    --admin-field-focus-border:#cc62aa;
    --admin-btn-ghost-bg:#1d0e1b;
    --admin-btn-ghost-border:#543147;
    --admin-btn-ghost-color:#d8c2d4;
    --admin-btn-ghost-hover-bg:#32152e;
    --admin-btn-ghost-hover-border:#b74e95;
    --admin-btn-ghost-hover-color:#ffffff;
    --admin-table-wrap-border:#3a2335;
    --admin-table-th-bg:#1b0c19;
    --admin-table-th-color:#9e8296;
    --admin-table-td-border:#34202f;
    --admin-table-td-color:#d8c5d3;
    --admin-table-row-hover:#21101f;
    --admin-table-strong:#ffffff;
    --admin-divider:#3a2335;
    --admin-list-row-border:#33202d;
    --admin-metric-icon-bg:#3a1733;
    --admin-metric-icon-color:#ed75bf;
    --admin-empty-icon-bg:#32142e;
    --admin-empty-icon-border:#66385a;
    --admin-empty-icon-color:#ed75bf;
    --admin-alert-bg:#2a1223;
    --admin-alert-border:#7a3d59;
    --admin-alert-color:#f0bdd9;
    --admin-success-bg:#12281c;
    --admin-success-border:#34654a;
    --admin-success-color:#a5ddb7;
    --admin-avatar-bg:#2e132a;
    --admin-avatar-border:#85416f;
    --admin-avatar-color:#ff7cc9;
    --admin-badge-success-bg:#11271c;
    --admin-badge-success-border:#35644b;
    --admin-badge-success-color:#91d3a8;
    --admin-badge-warning-bg:#2a220e;
    --admin-badge-warning-border:#75602e;
    --admin-badge-warning-color:#e6ca73;
    --admin-badge-danger-bg:#2d1119;
    --admin-badge-danger-border:#713d4a;
    --admin-badge-danger-color:#ed9bab;
    --admin-badge-muted-bg:#211722;
    --admin-badge-muted-border:#493644;
    --admin-badge-muted-color:#b89eaf;
    min-height:100svh;
    background:var(--admin-bg);
    color:var(--admin-text);
    transition:background .2s ease,color .2s ease;
  }

  .admin-page.admin-theme-light,
  [data-admin-theme="light"] {
    --admin-bg:#f9f6f9;
    --admin-text:#241423;
    --admin-text-strong:#120611;
    --admin-muted:#70596c;
    --admin-sidebar-bg:linear-gradient(180deg,#ffffff 0%,#fbf6fa 85%);
    --admin-sidebar-border:#e8dbe6;
    --admin-nav-color:#5f4a5b;
    --admin-nav-hover-bg:#fcebf5;
    --admin-nav-hover-border:#ea93c4;
    --admin-nav-hover-color:#a8176c;
    --admin-nav-active-bg:#fbe5f3;
    --admin-nav-active-border:#d95ca3;
    --admin-nav-active-color:#92125d;
    --admin-topbar-bg:rgba(255, 255, 255, 0.92);
    --admin-topbar-border:#e8dbe6;
    --admin-card-bg:#ffffff;
    --admin-card-border:#e8dbe6;
    --admin-card-shadow:0 6px 24px rgba(60, 16, 52, 0.05), 0 1px 3px rgba(0, 0, 0, 0.04);
    --admin-field-bg:#ffffff;
    --admin-field-border:#d8c5d4;
    --admin-field-color:#1f111d;
    --admin-field-label:#4a3646;
    --admin-field-focus-border:#d33b8f;
    --admin-btn-ghost-bg:#ffffff;
    --admin-btn-ghost-border:#d8c5d4;
    --admin-btn-ghost-color:#4a3646;
    --admin-btn-ghost-hover-bg:#fdf0f7;
    --admin-btn-ghost-hover-border:#d33b8f;
    --admin-btn-ghost-hover-color:#92125d;
    --admin-table-wrap-border:#e8dbe6;
    --admin-table-th-bg:#fcf7fb;
    --admin-table-th-color:#664f62;
    --admin-table-td-border:#eee2ec;
    --admin-table-td-color:#3d2b3a;
    --admin-table-row-hover:#fdf4fa;
    --admin-table-strong:#150813;
    --admin-divider:#eedfe9;
    --admin-list-row-border:#eee2ec;
    --admin-metric-icon-bg:#fceaf5;
    --admin-metric-icon-color:#c01e7d;
    --admin-empty-icon-bg:#fceaf5;
    --admin-empty-icon-border:#f2aed8;
    --admin-empty-icon-color:#c01e7d;
    --admin-alert-bg:#fdf0f5;
    --admin-alert-border:#f3b6cc;
    --admin-alert-color:#9c1a44;
    --admin-success-bg:#ebf9f1;
    --admin-success-border:#a3e2bb;
    --admin-success-color:#136335;
    --admin-avatar-bg:#fceaf5;
    --admin-avatar-border:#e07cb5;
    --admin-avatar-color:#c01e7d;
    --admin-badge-success-bg:#e7f7ee;
    --admin-badge-success-border:#7fc89b;
    --admin-badge-success-color:#11522a;
    --admin-badge-warning-bg:#fef8e8;
    --admin-badge-warning-border:#e4bf67;
    --admin-badge-warning-color:#6e5005;
    --admin-badge-danger-bg:#fdf0f2;
    --admin-badge-danger-border:#e79ea8;
    --admin-badge-danger-color:#7c1c2c;
    --admin-badge-muted-bg:#f4edf3;
    --admin-badge-muted-border:#ccbfcc;
    --admin-badge-muted-color:#564453;
  }

  .admin-sidebar{position:fixed;inset:0 auto 0 0;z-index:60;width:252px;border-right:1px solid var(--admin-sidebar-border);background:var(--admin-sidebar-bg);display:flex;flex-direction:column;padding:24px 14px;transition:transform .2s ease,background .2s ease,border-color .2s ease}
  .admin-brand{display:flex;align-items:center;gap:10px;padding:0 10px 25px;border-bottom:1px solid var(--admin-sidebar-border);font-weight:800;letter-spacing:-.02em;color:var(--admin-text-strong)}
  .admin-brand img{width:34px;height:34px;border-radius:50%;object-fit:cover;box-shadow:0 0 18px #f33ca844}
  .admin-brand span span{color:var(--primary)}
  .admin-eyebrow{margin:24px 10px 10px;color:var(--admin-muted);font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
  .admin-nav{display:grid;gap:3px}
  .admin-nav a{display:flex;align-items:center;gap:11px;border:1px solid transparent;border-radius:10px;padding:10px 11px;color:var(--admin-nav-color);font-size:12px;transition:background .15s,color .15s,border-color .15s}
  .admin-nav a:hover{border-color:var(--admin-nav-hover-border);background:var(--admin-nav-hover-bg);color:var(--admin-nav-hover-color)}
  .admin-nav a[aria-current=true]{border-color:var(--admin-nav-active-border);background:var(--admin-nav-active-bg);color:var(--admin-nav-active-color);font-weight:600}
  .admin-nav svg{width:16px;height:16px;color:var(--primary)}
  .admin-sidebar-footer{margin-top:auto;padding:14px 10px 0;border-top:1px solid var(--admin-sidebar-border);color:var(--admin-muted);font-size:10px;line-height:1.5}
  .admin-theme-toggle-sidebar{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin-bottom:12px;padding:8px 10px;border:1px solid var(--admin-btn-ghost-border);border-radius:8px;background:var(--admin-btn-ghost-bg);color:var(--admin-btn-ghost-color);font-size:11px;font-weight:700;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
  .admin-theme-toggle-sidebar:hover{background:var(--admin-btn-ghost-hover-bg);border-color:var(--admin-btn-ghost-hover-border);color:var(--admin-btn-ghost-hover-color)}
  .admin-main{min-height:100svh;margin-left:252px}
  .admin-topbar{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:72px;padding:16px clamp(18px,4vw,46px);border-bottom:1px solid var(--admin-topbar-border);background:var(--admin-topbar-bg);backdrop-filter:blur(15px);transition:background .2s ease,border-color .2s ease}
  .admin-topbar h1{font-size:19px;font-weight:700;letter-spacing:-.02em;color:var(--admin-text-strong)}.admin-topbar p{margin-top:3px;color:var(--admin-muted);font-size:11px}
  .admin-topbar-actions{display:flex;align-items:center;gap:10px}.admin-user{display:flex;align-items:center;gap:9px;color:var(--admin-text);font-size:11px}.admin-avatar{display:grid;place-items:center;width:31px;height:31px;border:1px solid var(--admin-avatar-border);border-radius:50%;background:var(--admin-avatar-bg);color:var(--admin-avatar-color)}
  .admin-icon-button,.admin-ghost-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--admin-btn-ghost-border);border-radius:9px;background:var(--admin-btn-ghost-bg);color:var(--admin-btn-ghost-color);cursor:pointer;transition:background .15s,border-color .15s,color .15s}.admin-icon-button{width:36px;height:36px}.admin-ghost-button{padding:9px 12px;font-size:11px}.admin-icon-button:hover,.admin-ghost-button:hover{border-color:var(--admin-btn-ghost-hover-border);background:var(--admin-btn-ghost-hover-bg);color:var(--admin-btn-ghost-hover-color)}
  .admin-content{padding:28px clamp(18px,4vw,46px) 54px}.admin-content-inner{max-width:1440px;margin:auto}
  .admin-toolbar{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:24px}.admin-toolbar h2{font-size:24px;font-weight:700;letter-spacing:-.03em;color:var(--admin-text-strong)}.admin-toolbar p{margin-top:5px;color:var(--admin-muted);font-size:12px}.admin-primary-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;border:1px solid var(--primary);border-radius:9px;background:var(--primary);padding:9px 14px;color:var(--primary-foreground);font-size:11px;font-weight:800;cursor:pointer;box-shadow:0 8px 25px #f33ca82b;transition:filter .15s,transform .15s}.admin-primary-button:hover{filter:brightness(1.08);transform:translateY(-1px)}
  .admin-metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.admin-card{border:1px solid var(--admin-card-border);border-radius:13px;background:var(--admin-card-bg);box-shadow:var(--admin-card-shadow);transition:background .2s ease,border-color .2s ease}
  .admin-metric{padding:17px}.admin-metric-top{display:flex;align-items:center;justify-content:space-between;color:var(--admin-muted);font-size:10px}.admin-metric-icon{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:var(--admin-metric-icon-bg);color:var(--admin-metric-icon-color)}.admin-metric-value{margin-top:13px;font-size:26px;font-weight:700;letter-spacing:-.04em;color:var(--admin-text-strong)}.admin-metric-note{margin-top:4px;color:var(--admin-muted);font-size:10px}
  .admin-grid-2{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,1fr);gap:16px;margin-top:16px}.admin-panel{padding:18px}.admin-panel-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:15px}.admin-panel-title h3{font-size:13px;font-weight:700;color:var(--admin-text-strong)}.admin-panel-title a{color:var(--primary);font-size:10px}.admin-list{display:grid;gap:7px}.admin-list-row{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid var(--admin-list-row-border);padding:11px 0;color:var(--admin-text);font-size:11px}.admin-list-row:first-child{border-top:0;padding-top:0}.admin-list-row:last-child{padding-bottom:0}.admin-list-main{min-width:0}.admin-list-main strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--admin-text-strong)}.admin-list-main span{display:block;margin-top:3px;color:var(--admin-muted);font-size:10px}.admin-muted{color:var(--admin-muted);font-size:11px}
  .admin-table-wrap{overflow-x:auto;border:1px solid var(--admin-table-wrap-border);border-radius:13px}.admin-table{width:100%;min-width:720px;border-collapse:collapse}.admin-table th{padding:12px 14px;background:var(--admin-table-th-bg);color:var(--admin-table-th-color);text-align:left;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.admin-table td{border-top:1px solid var(--admin-table-td-border);padding:13px 14px;color:var(--admin-table-td-color);font-size:11px}.admin-table tbody tr:hover{background:var(--admin-table-row-hover)}.admin-table strong{color:var(--admin-table-strong);font-weight:600}.admin-badge{display:inline-flex;border:1px solid var(--admin-badge-muted-border);border-radius:999px;padding:4px 8px;background:var(--admin-badge-muted-bg);color:var(--admin-badge-muted-color);font-size:9px;font-weight:700;text-transform:capitalize}.admin-badge.success{border-color:var(--admin-badge-success-border);background:var(--admin-badge-success-bg);color:var(--admin-badge-success-color)}.admin-badge.warning{border-color:var(--admin-badge-warning-border);background:var(--admin-badge-warning-bg);color:var(--admin-badge-warning-color)}.admin-badge.danger{border-color:var(--admin-badge-danger-border);background:var(--admin-badge-danger-bg);color:var(--admin-badge-danger-color)}.admin-badge.muted{border-color:var(--admin-badge-muted-border);background:var(--admin-badge-muted-bg);color:var(--admin-badge-muted-color)}
  .admin-empty{display:grid;place-items:center;min-height:230px;padding:28px;text-align:center;color:var(--admin-text)}.admin-empty-icon{display:grid;place-items:center;width:42px;height:42px;margin-bottom:12px;border:1px solid var(--admin-empty-icon-border);border-radius:12px;background:var(--admin-empty-icon-bg);color:var(--admin-empty-icon-color)}.admin-empty h3{font-size:13px;font-weight:700;color:var(--admin-text-strong)}.admin-empty p{max-width:380px;margin-top:6px;color:var(--admin-muted);font-size:11px;line-height:1.6}
  .admin-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.admin-field{display:grid;gap:6px}.admin-field.full{grid-column:1/-1}.admin-field label{color:var(--admin-field-label);font-size:10px;font-weight:700}.admin-field input,.admin-field textarea,.admin-field select{width:100%;border:1px solid var(--admin-field-border);border-radius:9px;background:var(--admin-field-bg);padding:10px 11px;color:var(--admin-field-color);font-size:12px;outline:0;transition:border-color .15s,box-shadow .15s,background .2s,color .2s}.admin-field select option{background:var(--admin-field-bg);color:var(--admin-field-color)}.admin-field textarea{min-height:100px;resize:vertical}.admin-field input:focus,.admin-field textarea:focus,.admin-field select:focus{border-color:var(--admin-field-focus-border);box-shadow:0 0 0 3px #f33ca81a}.admin-form-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}.admin-divider{height:1px;margin:20px 0;background:var(--admin-divider)}.admin-alert{margin-bottom:15px;border:1px solid var(--admin-alert-border);border-radius:10px;background:var(--admin-alert-bg);padding:11px 13px;color:var(--admin-alert-color);font-size:11px}.admin-success,.admin-alert.admin-success{border-color:var(--admin-success-border);background:var(--admin-success-bg);color:var(--admin-success-color)}.admin-help{margin:4px 0 10px;color:var(--admin-muted);font-size:11px;line-height:1.5}
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("feedloves-admin-theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        document.documentElement.setAttribute("data-admin-theme", stored);
      } else {
        document.documentElement.setAttribute("data-admin-theme", "dark");
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      window.localStorage.setItem("feedloves-admin-theme", next);
      document.documentElement.setAttribute("data-admin-theme", next);
    } catch {
      // ignore
    }
  }

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
    <div
      className={`admin-page ${theme === "light" ? "admin-theme-light" : "admin-theme-dark"}`}
      data-admin-theme={theme}
    >
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
          <img src="/assets/brand-v4.jpg" alt="" />
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
          <button
            type="button"
            className="admin-theme-toggle-sidebar"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          >
            {theme === "dark" ? (
              <>
                <Sun size={13} /> Modo Claro
              </>
            ) : (
              <>
                <Moon size={13} /> Modo Escuro
              </>
            )}
          </button>
          <div>
            Dados reais do Supabase
            <br />
            RLS e auditoria ativos
          </div>
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
            <button
              type="button"
              className="admin-icon-button"
              aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
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
