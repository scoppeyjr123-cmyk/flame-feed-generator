import { Play } from "lucide-react";
import { useEffect, useRef } from "react";

type VimeoPlayerInstance = {
  on: (event: "play" | "pause" | "timeupdate" | "ended", handler: (data?: { seconds?: number }) => void) => void;
  off: (event: "play" | "pause" | "timeupdate" | "ended", handler: (data?: { seconds?: number }) => void) => void;
};

type VimeoGlobal = {
  Player: new (element: HTMLIFrameElement) => VimeoPlayerInstance;
};

type VimeoPlayerMessage = {
  event?: string;
  data?: {
    seconds?: unknown;
  };
};

type EpisodePlayerProps = {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
  onPlaybackSeconds?: (seconds: number) => void;
  onPlaybackStateChange?: (playing: boolean) => void;
  onEnded?: () => void;
};

export function EpisodePlayer({
  videoUrl = "",
  posterUrl,
  title = "Parte 2 — a história continua",
  onPlaybackSeconds,
  onPlaybackStateChange,
  onEnded,
}: EpisodePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const isVimeo = Boolean(videoUrl && /player\.vimeo\.com\/video\//.test(videoUrl));
    if (!isVimeo || !iframeRef.current) return;

    let cancelled = false;
    let player: VimeoPlayerInstance | null = null;
    const frame = iframeRef.current;

    const attachPlayer = () => {
      if (cancelled || !frame || player) return;
      const Vimeo = (window as Window & { Vimeo?: VimeoGlobal }).Vimeo;
      if (!Vimeo) return;
      player = new Vimeo.Player(frame);
      player.on("play", () => onPlaybackStateChange?.(true));
      player.on("pause", () => onPlaybackStateChange?.(false));
      player.on("timeupdate", (data) => {
        if (typeof data?.seconds === "number") onPlaybackSeconds?.(data.seconds);
      });
      player.on("ended", () => {
        onPlaybackStateChange?.(false);
        onEnded?.();
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://player.vimeo.com/api/player.js"]');
    if (existingScript) {
      attachPlayer();
      existingScript.addEventListener("load", attachPlayer);
    } else {
      const script = document.createElement("script");
      script.src = "https://player.vimeo.com/api/player.js";
      script.async = true;
      script.addEventListener("load", attachPlayer);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (player) {
        player.off("play", () => onPlaybackStateChange?.(true));
        player.off("pause", () => onPlaybackStateChange?.(false));
      }
      existingScript?.removeEventListener("load", attachPlayer);
    };
  }, [videoUrl, onEnded, onPlaybackSeconds, onPlaybackStateChange]);

  useEffect(() => {
    const registerVimeoEvents = () => {
      const frame = document.getElementById("feedloves-episode") as HTMLIFrameElement | null;
      if (!frame?.contentWindow) return;
      ["play", "pause", "timeupdate", "ended"].forEach((name) =>
        frame.contentWindow?.postMessage(
          JSON.stringify({ method: "addEventListener", value: name }),
          "https://player.vimeo.com",
        ),
      );
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://player.vimeo.com") return;
      let parsedData: unknown;
      try {
        parsedData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!parsedData || typeof parsedData !== "object") return;
      const data = parsedData as VimeoPlayerMessage;
      const eventName = data?.event;
      if (eventName === "ready") registerVimeoEvents();
      if (eventName === "play") onPlaybackStateChange?.(true);
      if (eventName === "pause" || eventName === "ended") onPlaybackStateChange?.(false);
      if (eventName === "ended") onEnded?.();
      if (eventName === "timeupdate" && typeof data?.data?.seconds === "number") onPlaybackSeconds?.(data.data.seconds);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onEnded, onPlaybackSeconds, onPlaybackStateChange]);

  if (videoUrl) {
    const isDirectVideo = /\.(mp4|webm|ogg|m3u8)(?:[?#]|$)/i.test(videoUrl);

    return (
      <div className="part2-player-frame">
        {isDirectVideo ? (
          <video
            className="part2-player-video"
            controls
            playsInline
            preload="metadata"
            poster={posterUrl || undefined}
            src={videoUrl}
            aria-label={title}
            onTimeUpdate={(event) => onPlaybackSeconds?.(event.currentTarget.currentTime)}
            onPlay={() => onPlaybackStateChange?.(true)}
            onPause={() => onPlaybackStateChange?.(false)}
            onEnded={() => {
              onPlaybackStateChange?.(false);
              onEnded?.();
            }}
          >
            Seu navegador não suporta vídeo HTML5.
          </video>
        ) : (
          <iframe
            className="part2-player-video"
            ref={iframeRef}
            src={/vimeo\.com\/video\//.test(videoUrl) ? `${videoUrl}${videoUrl.includes("?") ? "&" : "?"}api=1&player_id=feedloves-episode` : videoUrl}
            title={title}
            id="feedloves-episode"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={(event) => {
              const frame = event.currentTarget;
              if (!/player\.vimeo\.com/.test(frame.src)) return;
              registerVimeoEvents();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="part2-player-frame part2-player-placeholder" aria-label="Player de vídeo aguardando configuração">
      {posterUrl ? <img src={posterUrl} alt="" className="part2-player-poster" /> : null}
      <div className="part2-player-overlay" />
      <div className="part2-player-placeholder-content">
        <span className="part2-play-icon"><Play size={27} fill="currentColor" /></span>
        <p className="part2-player-label">CONTINUAÇÃO EXCLUSIVA</p>
        <h2>{title}</h2>
        <p className="part2-player-help">
          Configure o endereço do vídeo da Parte 2 para exibir o episódio aqui.
        </p>
      </div>
    </div>
  );
}

