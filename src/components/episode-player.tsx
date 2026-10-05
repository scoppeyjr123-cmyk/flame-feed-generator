import { Play } from "lucide-react";
import { useEffect } from "react";

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

