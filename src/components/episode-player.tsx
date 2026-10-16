import { Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type VimeoPlayerInstance = {
  setCurrentTime: (seconds: number) => Promise<number>;
  setVolume: (volume: number) => Promise<number>;
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
  unmute?: () => void;
  setVolume?: (volume: number) => void;
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
  autoPlay?: boolean;
  maxPlaybackSeconds?: number;
  settings?: {
    accentColor?: string;
    backgroundColor?: string;
    borderRadius?: number;
    logoUrl?: string;
    showBrand?: boolean;
  };
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
  autoPlay = false,
  settings,
  maxPlaybackSeconds,
}: EpisodePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bunnyPlayerRef = useRef<PlayerJsInstance | null>(null);
  const vimeoPlayerRef = useRef<VimeoPlayerInstance | null>(null);
  const restoredRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSoundEnabled(false);
  }, [videoUrl]);

  useEffect(() => {
    const isBunny = Boolean(
      videoUrl && /(?:iframe|player)\.mediadelivery\.net\/(?:embed|play|video)\//i.test(videoUrl),
    );
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
      bunnyPlayerRef.current = player;

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
        if (seconds !== null)
          onPlaybackSeconds?.(
            maxPlaybackSeconds == null ? seconds : Math.min(seconds, maxPlaybackSeconds),
          );
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
      bunnyPlayerRef.current = null;
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
      vimeoPlayerRef.current = player;
      if (initialSeconds > 0 && !restoredRef.current) {
        restoredRef.current = true;
        void player.setCurrentTime(initialSeconds);
      }
      player.on("play", () => onPlaybackStateChange?.(true));
      player.on("pause", () => onPlaybackStateChange?.(false));
      player.on("timeupdate", (data) => {
        if (typeof data?.seconds === "number")
          onPlaybackSeconds?.(
            maxPlaybackSeconds == null ? data.seconds : Math.min(data.seconds, maxPlaybackSeconds),
          );
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
      vimeoPlayerRef.current = null;
      if (player) {
        player.off("play", () => onPlaybackStateChange?.(true));
        player.off("pause", () => onPlaybackStateChange?.(false));
      }
      existingScript?.removeEventListener("load", attachPlayer);
    };
  }, [videoUrl, initialSeconds, onEnded, onPlaybackSeconds, onPlaybackStateChange]);

  const activateSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
    } else if (vimeoPlayerRef.current) {
      void vimeoPlayerRef.current.setVolume(1);
    } else if (bunnyPlayerRef.current) {
      bunnyPlayerRef.current.unmute?.();
      bunnyPlayerRef.current.setVolume?.(100);
    } else if (iframeRef.current) {
      const frame = iframeRef.current;
      const frameUrl = new URL(frame.src);
      if (/youtube(?:-nocookie)?\.com$/i.test(frameUrl.hostname)) {
        frame.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "unMute", args: [] }),
          frameUrl.origin,
        );
      } else {
        frame.contentWindow?.postMessage(
          JSON.stringify({ method: "setVolume", value: 100 }),
          frameUrl.origin,
        );
      }
    }
    setSoundEnabled(true);
  };

  if (videoUrl) {
    const isTelegramMessageUrl = /(?:^|\.)t\.me\//i.test(videoUrl);
    if (isTelegramMessageUrl) {
      return (
        <div
          className="part2-player-frame part2-player-placeholder"
          aria-label="Fonte do vídeo não reproduzível"
        >
          {posterUrl ? <img src={posterUrl} alt="" className="part2-player-poster" /> : null}
          <div className="part2-player-overlay" />
          <div className="part2-player-placeholder-content">
            <span className="part2-play-icon">
              <Play size={27} fill="currentColor" />
            </span>
            <p className="part2-player-label">VÍDEO DO TELEGRAM</p>
            <h2>{title}</h2>
            <p className="part2-player-help">
              Este link abre uma mensagem do Telegram, não um arquivo de vídeo. O vídeo precisa ser
              importado pelo Admin para o Bunny Stream.
            </p>
          </div>
        </div>
      );
    }
    const isDirectVideo = /\.(mp4|webm|ogg|m3u8)(?:[?#]|$)/i.test(videoUrl);
    const embeddableVideoUrl = toEmbeddableVideoUrl(videoUrl);

    return (
      <div
        className="part2-player-frame"
        style={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          background: settings?.backgroundColor || "#000",
          borderColor: settings?.accentColor,
          borderRadius: settings?.borderRadius,
        }}
      >
        {isDirectVideo ? (
          <video
            className="part2-player-video"
            ref={videoRef}
            controls
            playsInline
            autoPlay={autoPlay}
            muted={autoPlay}
            preload="metadata"
            poster={posterUrl || undefined}
            src={videoUrl}
            aria-label={title}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "contain",
              background: "#000",
            }}
            onTimeUpdate={(event) => {
              const seconds = event.currentTarget.currentTime;
              onPlaybackSeconds?.(
                maxPlaybackSeconds == null ? seconds : Math.min(seconds, maxPlaybackSeconds),
              );
              if (maxPlaybackSeconds != null && seconds >= maxPlaybackSeconds)
                event.currentTarget.pause();
            }}
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
            src={(() => {
              const playerUrl = new URL(embeddableVideoUrl);
              if (/vimeo\.com\/video\//.test(embeddableVideoUrl)) {
                playerUrl.searchParams.set("api", "1");
                playerUrl.searchParams.set("player_id", "feedloves-episode");
              }
              if (autoPlay) {
                if (/youtube(?:-nocookie)?\.com$/i.test(playerUrl.hostname)) {
                  playerUrl.searchParams.set("autoplay", "1");
                  playerUrl.searchParams.set("playsinline", "1");
                  playerUrl.searchParams.set("mute", "1");
                  playerUrl.searchParams.set("enablejsapi", "1");
                  playerUrl.searchParams.set("origin", window.location.origin);
                } else {
                  playerUrl.searchParams.set("autoplay", "true");
                  playerUrl.searchParams.set("muted", "true");
                  playerUrl.searchParams.set("playsinline", "true");
                }
              }
              return playerUrl.toString();
            })()}
            title={title}
            id="feedloves-episode"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              border: 0,
              background: "#000",
            }}
          />
        )}
        {autoPlay ? (
          <button
            type="button"
            className="episode-sound-button"
            onClick={activateSound}
            aria-label={soundEnabled ? "Som ativado" : "Ativar som do vídeo"}
            aria-pressed={soundEnabled}
          >
            <Volume2 size={18} aria-hidden="true" />
            {soundEnabled ? "SOM ATIVADO" : "ATIVAR SOM"}
          </button>
        ) : null}
        {settings?.showBrand && settings.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 2,
              maxWidth: 110,
              maxHeight: 30,
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        ) : null}
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
