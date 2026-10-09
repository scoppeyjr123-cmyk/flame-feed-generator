import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, Mail, MessageCircle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/obrigado")({
  head: () => ({
    meta: [
      { title: "Obrigado pela sua assinatura | Feed Loves" },
      { name: "description", content: "Finalize seu acesso ao Feed Loves." },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const supportUrl = "https://wa.me/5511919332419?text=Preciso%20de%20ajuda%20com%20o%20acesso%20ao%20app";

  return (
    <main className="thank-you-page">
      <style>{` .thank-you-page{min-height:100svh;display:grid;place-items:center;padding:28px 16px;background:radial-gradient(circle at 50% 0%,#63154855,transparent 48%),#100810;color:var(--foreground);font-family:Outfit,Inter,system-ui,sans-serif}.thank-you-page *{box-sizing:border-box}.thank-you-card{width:min(100%,620px);padding:38px clamp(22px,5vw,52px);border:1px solid #6d315b;border-radius:24px;background:linear-gradient(145deg,#281126,#140914);box-shadow:0 26px 90px #0008;text-align:center}.thank-you-brand{display:inline-flex;align-items:center;gap:9px;color:#fff;text-decoration:none;font-size:19px;font-weight:800}.thank-you-brand img{width:42px;height:42px;border-radius:50%;object-fit:cover}.thank-you-brand span{color:var(--primary)}.thank-you-icon{display:grid;place-items:center;width:64px;height:64px;margin:28px auto 18px;border:1px solid #ff69c4aa;border-radius:50%;background:#481434;color:#ff73c4;box-shadow:0 0 30px #ff3ca844}.thank-you-card h1{margin:0;font-family:"Playfair Display",Georgia,serif;font-size:clamp(30px,6vw,44px);line-height:1.08}.thank-you-lead{max-width:460px;margin:13px auto 0;color:#dec8d8;font-size:14px;line-height:1.65}.thank-you-steps{display:grid;gap:12px;margin:28px 0 0;text-align:left}.thank-you-step{display:flex;align-items:flex-start;gap:12px;padding:14px;border:1px solid #4d2943;border-radius:13px;background:#1a0d19}.thank-you-step-icon{display:grid;place-items:center;flex:none;width:26px;height:26px;border-radius:50%;background:var(--primary);color:var(--primary-foreground)}.thank-you-step strong{display:block;font-size:13px}.thank-you-step p{margin:4px 0 0;color:#bda7b8;font-size:11px;line-height:1.5}.thank-you-email{color:var(--primary);font-weight:800}.thank-you-actions{display:grid;gap:10px;margin-top:27px}.thank-you-button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border:1px solid var(--primary);border-radius:999px;background:var(--primary);color:var(--primary-foreground);font-size:12px;font-weight:800;text-decoration:none;transition:filter .2s,transform .2s}.thank-you-button:hover{filter:brightness(1.08);transform:translateY(-1px)}.thank-you-button.secondary{border-color:#74416a;background:transparent;color:#f1d7e9}.thank-you-button.whatsapp{border-color:#25d366;background:#25d366;color:#062b14}.thank-you-button.whatsapp:hover{background:#35e275}.thank-you-note{display:flex;justify-content:center;align-items:center;gap:6px;margin:21px 0 0;color:#a98c9f;font-size:10px}.thank-you-note svg{color:#d86fb5}@media(max-width:520px){.thank-you-card{padding:28px 18px}.thank-you-card h1{font-size:32px}}`}</style>
      <section className="thank-you-card" aria-labelledby="thank-you-title">
        <Link className="thank-you-brand" to="/" aria-label="Feed Loves — página inicial">
          <img src="/assets/brand-v4.jpg" alt="" /> Feed <span>Loves</span>
        </Link>
        <div className="thank-you-icon" aria-hidden="true"><Check size={31} strokeWidth={3} /></div>
        <h1 id="thank-you-title">Parabéns pela sua assinatura! ♡</h1>
        <p className="thank-you-lead">Seu plano foi contratado com sucesso. Siga os passos abaixo para acessar o Web App Feed Loves.</p>
        <div className="thank-you-steps">
          <div className="thank-you-step"><span className="thank-you-step-icon">1</span><div><strong>Use o mesmo e-mail da compra</strong><p>Para vincular automaticamente sua assinatura, utilize no cadastro o mesmo e-mail informado no checkout.</p></div></div>
          <div className="thank-you-step"><span className="thank-you-step-icon">2</span><div><strong>Crie sua conta ou entre</strong><p>Se ainda não possui conta, crie uma agora. Se já possui, basta fazer login.</p></div></div>
          <div className="thank-you-step"><span className="thank-you-step-icon">3</span><div><strong>Acesse o catálogo completo</strong><p>Após a confirmação do pagamento, o acesso Premium será liberado automaticamente.</p></div></div>
        </div>
        <div className="thank-you-actions">
          <Link className="thank-you-button" to="/criar-conta">CRIAR MINHA CONTA <ChevronRight size={15} /></Link>
          <Link className="thank-you-button secondary" to="/login">JÁ TENHO UMA CONTA · ENTRAR</Link>
          <a className="thank-you-button whatsapp" href={supportUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> FALAR COM O SUPORTE</a>
        </div>
        <p className="thank-you-note"><Mail size={13} /> Confira também o e-mail usado na compra.</p>
        <p className="thank-you-note"><ShieldCheck size={13} /> O acesso é vinculado automaticamente pelo seu e-mail.</p>
      </section>
    </main>
  );
}
