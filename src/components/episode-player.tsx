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

type PlayerJsInstance = {
  on: (event: string, handler: (data?: unknown) => void) => void;
  off?: (event: string, handler: (data?: unknown) => void) => void;
  setCurrentTime?: (seconds: number) => void;
};

type PlayerJsGlobal = {
  Player: new (element: HTMLIFrameElement | string) => PlayerJsInstance;
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

function toEmbeddableVideoUrl(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId = url.searchParams.get("v");
      if (videoId) {
        const embed = new URL(`https://www.youtube.com/embed/${encodeURIComponent(videoId)}`);
        const playlist = url.searchParams.get("list");
        const index = url.searchParams.get("index");
        embed.searchParams.set("modestbranding", "1");
        embed.searchParams.set("rel", "0");
        embed.searchParams.set("iv_load_policy", "3");
        embed.searchParams.set("playsinline", "1");
        if (playlist) embed.searchParams.set("list", playlist);
        if (index) embed.searchParams.set("index", index);
        return embed.toString();
      }
    }

    if (hostname === "youtu.be") {
      const videoId = url.pathname.slice(1);
      if (videoId) {
        const embed = new URL(`https://www.youtube.com/embed/${encodeURIComponent(videoId)}`);
        embed.searchParams.set("modestbranding", "1");
        embed.searchParams.set("rel", "0");
        embed.searchParams.set("iv_load_policy", "3");
        embed.searchParams.set("playsinline", "1");
        return embed.toString();
      }
    }

    return videoUrl;
  } catch {
    return videoUrl;
  }
}

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
    const isBunny = Boolean(videoUrl && /(?:iframe|player)\.mediadelivery\.net\/embed\//.test(videoUrl));
    if (!isBunny || !iframeRef.current) return;

    let cancelled = false;
    let player: PlayerJsInstance | null = null;
    const frame = iframeRef.current;

    const readSeconds = (data?: unknown) => {
      if (typeof data === "number") return data;
      if (!data || typeof data !== "object") return null;
      const value = data as { seconds?: unknown; currentTime?: unknown; time?: unknown };
      for (const candidate of [value.seconds, value.currentTime, value.time]) {
        if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
      }
      return null;
    };

    const attach = () => {
      if (cancelled || player) return;
      const playerjs = (window as Window & { playerjs?: PlayerJsGlobal }).playerjs;
      if (!playerjs) return;
      player = new playerjs.Player(frame);

      player.on("ready", () => {
        if (initialSeconds > 0 && !restoredRef.current && player?.setCurrentTime) {
          restoredRef.current = true;
          player.setCurrentTime(initialSeconds);
        }
      });
      player.on("play", () => onPlaybackStateChange?.(true));
      player.on("pause", () => onPlaybackStateChange?.(false));
      player.on("timeupdate", (data) => {
        const seconds = readSeconds(data);
        if (seconds !== null) onPlaybackSeconds?.(seconds);
      });
      player.on("ended", () => {
        onPlaybackStateChange?.(false);
        onEnded?.();
      });
    };

    const src = "https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js";
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      attach();
      existing.addEventListener("load", attach);
    } else {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.addEventListener("load", attach);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      existing?.removeEventListener("load", attach);
    };
  }, [videoUrl, initialSeconds, onEnded, onPlaybackSeconds, onPlaybackStateChange]);

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
    const embeddableVideoUrl = toEmbeddableVideoUrl(videoUrl);

    return (
      <div className="part2-player-frame" style={{ width: "100%", height: "100%", minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#000" }}>
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
            style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", background: "#000" }}
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
              /vimeo\.com\/video\//.test(embeddableVideoUrl)
                ? `${embeddableVideoUrl}${embeddableVideoUrl.includes("?") ? "&" : "?"}api=1&player_id=feedloves-episode`
                : embeddableVideoUrl
            }
            title={title}
            id="feedloves-episode"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ width: "100%", height: "100%", display: "block", border: 0, background: "#000" }}
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

