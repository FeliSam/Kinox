"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  FastForward,
  SkipForward,
  Settings,
  Subtitles,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatTimeSeconds } from "@/lib/utils";

interface TimedSegment {
  id: string;
  type: string;
  startSeconds: number;
  endSeconds: number;
  label: string;
}

interface VideoPlayerProps {
  titleId: string;
  playbackData: any;
  onBack?: () => void;
}

export default function VideoPlayer({
  titleId,
  playbackData,
  onBack,
}: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // États du lecteur
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeSegment, setActiveSegment] = useState<TimedSegment | null>(null);
  const [hasPromptedResume, setHasPromptedResume] = useState(false);
  const [savedResumeTime, setSavedResumeTime] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Qualités & Pistes
  const [levels, setLevels] = useState<{ id: number; height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState<number | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialisation du flux (HLS ou MP4 natif)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackData?.title) return;

    const manifestUrl = playbackData.title.hlsManifestUrl;
    const mp4Url = playbackData.title.mp4FallbackUrl;
    const initialResumeTime = playbackData.resumePositionSeconds || 0;

    if (initialResumeTime > 10) {
      setSavedResumeTime(initialResumeTime);
      setHasPromptedResume(true);
    }

    if (Hls.isSupported() && manifestUrl) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(manifestUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(
          data.levels.map((lvl, index) => ({
            id: index,
            height: lvl.height,
            bitrate: lvl.bitrate,
          }))
        );
        if (initialResumeTime > 0) {
          video.currentTime = initialResumeTime;
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS network error, tentation de récupération...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS media error, récupération...");
              hls.recoverMediaError();
              break;
            default:
              console.error("HLS unrecoverable error, bascule sur MP4 fallback");
              hls.destroy();
              if (mp4Url) {
                video.src = mp4Url;
                video.load();
              } else {
                setPlaybackError("Le flux vidéo n'a pas pu être chargé.");
              }
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Support HLS natif pour Safari / iOS
      video.src = manifestUrl;
      if (initialResumeTime > 0) {
        video.currentTime = initialResumeTime;
      }
    } else if (mp4Url) {
      // Fallback MP4 direct
      video.src = mp4Url;
      if (initialResumeTime > 0) {
        video.currentTime = initialResumeTime;
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [playbackData]);

  // Sauvegarde périodique de la progression de lecture (toutes les 5 secondes)
  const saveProgress = useCallback(
    async (completed = false) => {
      const video = videoRef.current;
      if (!video || !titleId) return;

      try {
        await fetch(`/api/v1/progress/${titleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            positionSeconds: Math.floor(video.currentTime),
            durationSeconds: Math.floor(video.duration || 0),
            completed,
          }),
        });
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    },
    [titleId]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        saveProgress();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, saveProgress]);

  // Sauvegarder lors de la sortie de la page
  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, [saveProgress]);

  // Gestion des segments temporels (Passer l'intro)
  useEffect(() => {
    const segments: TimedSegment[] = playbackData?.timedSegments || [];
    const active = segments.find(
      (s) => currentTime >= s.startSeconds && currentTime <= s.endSeconds
    );
    setActiveSegment(active || null);
  }, [currentTime, playbackData]);

  // Gestion de la fin de vidéo et prochain épisode
  useEffect(() => {
    if (duration > 0 && currentTime >= duration - 2) {
      saveProgress(true);
      if (playbackData?.nextEpisode) {
        setNextEpisodeCountdown(10);
      }
    }
  }, [currentTime, duration, playbackData, saveProgress]);

  // Compte à rebours du prochain épisode
  useEffect(() => {
    if (nextEpisodeCountdown === null) return;
    if (nextEpisodeCountdown <= 0) {
      if (playbackData?.nextEpisode) {
        router.push(`/watch/${playbackData.title.id}?episode=${playbackData.nextEpisode.id}`);
      }
      return;
    }

    const timer = setTimeout(() => {
      setNextEpisodeCountdown((c) => (c ? c - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [nextEpisodeCountdown, playbackData, router]);

  // Masquage automatique des commandes
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    } else {
      video.pause();
      setIsPlaying(false);
      saveProgress();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    video.muted = val === 0;
    setIsMuted(val === 0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const skipSegment = () => {
    const video = videoRef.current;
    if (!video || !activeSegment) return;
    video.currentTime = activeSegment.endSeconds + 0.5;
    setActiveSegment(null);
  };

  const handleLevelChange = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentLevel(levelId);
    }
    setSettingsOpen(false);
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setSettingsOpen(false);
  };

  // Raccourcis clavier (Espace, Flèches, F, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ne pas intercepter si l'utilisateur est sur un input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
          e.preventDefault();
          seekRelative(-10);
          break;
        case "arrowright":
          e.preventDefault();
          seekRelative(10);
          break;
        case "escape":
          if (settingsOpen) setSettingsOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, settingsOpen]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* Balise Vidéo */}
      <video
        ref={videoRef}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          saveProgress(true);
        }}
        onError={() => setPlaybackError("Erreur lors de la lecture du fichier média.")}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Message d'erreur avec bouton réessayer */}
      {playbackError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-50">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Impossible de lire cette vidéo</h2>
          <p className="text-gray-400 text-sm max-w-md mb-6">{playbackError}</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setPlaybackError(null);
                if (videoRef.current) videoRef.current.load();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Réessayer</span>
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      )}

      {/* Notification de Reprise de lecture */}
      {hasPromptedResume && savedResumeTime > 0 && (
        <div className="absolute top-20 left-6 sm:left-12 z-40 bg-[#12141C]/95 border border-[#2B3044] rounded-xl p-4 shadow-2xl flex items-center gap-4 text-white animate-fadeIn">
          <div>
            <p className="text-xs text-gray-400">Reprise de lecture</p>
            <p className="text-sm font-bold">Reprendre à {formatTimeSeconds(savedResumeTime)} ?</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setHasPromptedResume(false);
                if (videoRef.current) {
                  videoRef.current.currentTime = savedResumeTime;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-bold rounded"
            >
              Reprendre
            </button>
            <button
              onClick={() => {
                setHasPromptedResume(false);
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded"
            >
              Du début
            </button>
          </div>
        </div>
      )}

      {/* Bouton "Passer l'introduction" */}
      {activeSegment && (
        <button
          onClick={skipSegment}
          className="absolute bottom-24 right-6 sm:right-12 z-40 px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/40 backdrop-blur-md rounded-lg font-bold text-sm text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <FastForward className="w-4 h-4" />
          <span>{activeSegment.label}</span>
        </button>
      )}

      {/* Bannière du Prochain Épisode avec compte à rebours */}
      {nextEpisodeCountdown !== null && playbackData?.nextEpisode && (
        <div className="absolute bottom-24 right-6 sm:right-12 z-40 bg-[#12141C]/95 border border-red-600/50 rounded-xl p-5 shadow-2xl text-white max-w-sm">
          <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">
            Épisode suivant dans {nextEpisodeCountdown}s
          </p>
          <h3 className="font-extrabold text-sm truncate mb-3">
            {playbackData.nextEpisode.name}
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                router.push(`/watch/${playbackData.title.id}?episode=${playbackData.nextEpisode.id}`);
              }}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold rounded flex items-center justify-center gap-2"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Lire maintenant</span>
            </button>
            <button
              onClick={() => setNextEpisodeCountdown(null)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Commandes de Contrôle (Barre Supérieure & Inférieure) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-t from-black/90 via-transparent to-black/70 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Barre Supérieure : Retour & Titre */}
        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={() => (onBack ? onBack() : router.back())}
            className="p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors flex items-center gap-2"
            aria-label="Retour"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="text-center">
            <h1 className="text-sm sm:text-lg font-bold text-white drop-shadow">
              {playbackData?.title?.name}
            </h1>
            <p className="text-xs text-gray-400">
              {playbackData?.title?.type === "MOVIE" ? "Film KINOX" : "Série KINOX"}
            </p>
          </div>

          <div className="w-10" />
        </div>

        {/* Barre Inférieure : Scrubber, Boutons de Lecture et Réglages */}
        <div className="space-y-3 pointer-events-auto">
          {/* Scrubber de progression temporel */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-300 font-mono w-12 text-right">
              {formatTimeSeconds(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const target = parseFloat(e.target.value);
                if (videoRef.current) {
                  videoRef.current.currentTime = target;
                  setCurrentTime(target);
                }
              }}
              className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2.5 transition-all"
              aria-label="Position de lecture"
            />
            <span className="text-xs text-gray-300 font-mono w-12">
              {formatTimeSeconds(duration)}
            </span>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Lecture / Pause */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                aria-label={isPlaying ? "Mettre en pause" : "Lancer la lecture"}
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-current" />}
              </button>

              {/* Recul 10s */}
              <button
                onClick={() => seekRelative(-10)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Reculer de 10 secondes"
                aria-label="Reculer de 10 secondes"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Avance 10s */}
              <button
                onClick={() => seekRelative(10)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Avancer de 10 secondes"
                aria-label="Avancer de 10 secondes"
              >
                <FastForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                  aria-label={isMuted ? "Activer le son" : "Couper le son"}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-red-600 opacity-80 group-hover/vol:opacity-100"
                  aria-label="Contrôle du volume"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 relative">
              {/* Menu Réglages (Qualité & Vitesse) */}
              <div className="relative">
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                  title="Paramètres vidéo"
                  aria-label="Paramètres de qualité et vitesse"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 bottom-12 w-56 bg-[#12141C] border border-[#2B3044] rounded-xl shadow-2xl p-3 space-y-3 z-50 text-xs text-white animate-fadeIn">
                    {/* Qualité Adaptative */}
                    <div>
                      <p className="font-bold text-gray-400 uppercase text-[10px] mb-1">Qualité HLS</p>
                      <button
                        onClick={() => handleLevelChange(-1)}
                        className={`w-full flex items-center justify-between p-1.5 rounded hover:bg-white/10 ${
                          currentLevel === -1 ? "text-red-400 font-bold" : ""
                        }`}
                      >
                        <span>Automatique</span>
                        {currentLevel === -1 && <Check className="w-3.5 h-3.5" />}
                      </button>
                      {levels.map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => handleLevelChange(lvl.id)}
                          className={`w-full flex items-center justify-between p-1.5 rounded hover:bg-white/10 ${
                            currentLevel === lvl.id ? "text-red-400 font-bold" : ""
                          }`}
                        >
                          <span>{lvl.height}p</span>
                          {currentLevel === lvl.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>

                    {/* Vitesse de lecture */}
                    <div className="border-t border-gray-800 pt-2">
                      <p className="font-bold text-gray-400 uppercase text-[10px] mb-1">Vitesse</p>
                      <div className="grid grid-cols-4 gap-1">
                        {[0.75, 1, 1.25, 1.5].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => handleSpeedChange(spd)}
                            className={`py-1 rounded text-center border ${
                              playbackSpeed === spd
                                ? "bg-red-600/30 border-red-500 text-white font-bold"
                                : "border-gray-700 text-gray-300 hover:bg-white/5"
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Plein Écran */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
                aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
