const supportUrl =
  "https://wa.me/5511919332419?text=Preciso%20de%20ajuda%20com%20o%20acesso%20ao%20app";

export function WhatsAppSupportButton() {
  return (
    <a
      className="feed-whatsapp-button"
      style={{
        position: "fixed",
        right: 20,
        bottom: "calc(82px + env(safe-area-inset-bottom))",
        zIndex: 60,
        display: "grid",
        placeItems: "center",
        width: 54,
        height: 54,
        borderRadius: "50%",
        background: "#25d366",
        color: "#062b14",
        boxShadow: "0 8px 24px #0008",
        transition: "transform .2s, filter .2s",
      }}
      href={supportUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com o suporte pelo WhatsApp"
      title="Falar com o suporte"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
        style={{ width: 30, height: 30, fill: "currentColor" }}
      >
        <path d="M16 3.2a12.7 12.7 0 0 0-10.9 19.2L3.4 28.8l6.6-1.7A12.8 12.8 0 1 0 16 3.2Zm0 23.2a10.4 10.4 0 0 1-5.3-1.5l-.4-.2-3.9 1 1-3.8-.3-.4a10.4 10.4 0 1 1 8.9 4.9Zm5.7-7.8c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.8-3.2-.3-.5.3-.5.9-1.6.1-.2.1-.4 0-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.1 1.3 3.3c.2.2 2.2 3.4 5.3 4.7 2 .9 2.7.9 3.7.8.6-.1 1.8-.7 2-1.3.3-.7.3-1.2.2-1.3-.1-.2-.3-.3-.6-.4Z" />
      </svg>
    </a>
  );
}
