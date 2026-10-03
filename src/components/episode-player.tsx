import { Play } from "lucide-react";

type EpisodePlayerProps = {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
};

export function EpisodePlayer({
  videoUrl = "",
  posterUrl,
  title = "Parte 2 — a história continua",
}: EpisodePlayerProps) {
  if (videoUrl) {
    const isDirectVideo = /\\.(mp4|webm|ogg|m3u8)(?:[?#]|$)/i.test(videoUrl);

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
          >
            Seu navegador não suporta vídeo HTML5.
          </video>
        ) : (
          <iframe
            className="part2-player-video"
            src={videoUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
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
