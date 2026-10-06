import { Play } from "lucide-react";
import { useEffect, useRef } from "react";

type VimeoPlayerInstance = {
  setCurrentTime: (seconds: number) => Promise<number>;
  on: (
    event: "play" | "pause" | "timeupdate" | "ended",
    handler: (data?: { seconds?: number }) => void,
  ) => void;
  off: (
    event: "play" | "pause" | "timeupdate" | "ended",
    handler: (data?: { seconds?: number }) => void,
  ) => void;
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
  initialSeconds?: number;
};

export function EpisodePlayer({
  videoUrl = "",
  posterUrl,
  title = "Parte 2 — a história continua",
  onPlaybackSeconds,
  onPlaybackStateChange,
  onEnded,
  initialSeconds = 0,
}: EpisodePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const restoredRef = useRef(false);

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
      if (initialSeconds > 0 && !restoredRef.current) {
        restoredRef.current = true;
        void player.setCurrentTime(initialSeconds);
      }
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

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://player.vimeo.com/api/player.js"]',
    );
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
  }, [videoUrl, initialSeconds, onEnded, onPlaybackSeconds, onPlaybackStateChange]);

  if (videoUrl) {
    const isDirectVideo = /\.(mp4|webm|ogg|m3u8)(?:[?#]|$)/i.test(videoUrl);

    return (
      <div className="part2-player-frame">
        {isDirectVideo ? (
          <video
            className="part2-player-video"
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            poster={posterUrl || undefined}
            src={videoUrl}
            aria-label={title}
            onTimeUpdate={(event) => onPlaybackSeconds?.(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => {
              if (initialSeconds > 0 && !restoredRef.current) {
                restoredRef.current = true;
                event.currentTarget.currentTime = initialSeconds;
              }
            }}
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
            src={
              /vimeo\.com\/video\//.test(videoUrl)
                ? `${videoUrl}${videoUrl.includes("?") ? "&" : "?"}api=1&player_id=feedloves-episode`
                : videoUrl
            }
            title={title}
            id="feedloves-episode"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="part2-player-frame part2-player-placeholder"
      aria-label="Player de vídeo aguardando configuração"
    >
      {posterUrl ? <img src={posterUrl} alt="" className="part2-player-poster" /> : null}
      <div className="part2-player-overlay" />
      <div className="part2-player-placeholder-content">
        <span className="part2-play-icon">
          <Play size={27} fill="currentColor" />
        </span>
        <p className="part2-player-label">CONTINUAÇÃO EXCLUSIVA</p>
        <h2>{title}</h2>
        <p className="part2-player-help">
          Configure o endereço do vídeo da Parte 2 para exibir o episódio aqui.
        </p>
      </div>
    </div>
  );
}

