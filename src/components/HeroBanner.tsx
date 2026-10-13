"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Info, Volume2, VolumeX, Sparkles, Clock, Calendar, ShieldAlert } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface HeroBannerProps {
  title: any;
  onOpenDetails: (title: any) => void;
  allowAutoplayPreview?: boolean;
}

export default function HeroBanner({
  title,
  onOpenDetails,
  allowAutoplayPreview = true,
}: HeroBannerProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Si l'utilisateur a réduit les mouvements, ne pas jouer d'aperçu automatique
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!allowAutoplayPreview || !title?.trailerUrl) {
      return;
    }

    // Démarrage différé après 700ms pour ne pas surprendre l'utilisateur
    timerRef.current = setTimeout(() => {
      setIsPlayingPreview(true);
    }, 750);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title?.id, allowAutoplayPreview]);

  // Arrêter l'aperçu si l'onglet devient invisible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlayingPreview) {
        setIsPlayingPreview(false);
        if (videoRef.current) videoRef.current.pause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPlayingPreview]);

  if (!title) return null;

  const genres = title.genres?.map((g: any) => g.genre?.name || g.name) || [];

  return (
    <div className="relative w-full h-[65vh] sm:h-[75vh] lg:h-[85vh] bg-[#08090C] overflow-hidden select-none">
      {/* Fond Visuel : Image ou Vidéo d'aperçu muet */}
      <div className="absolute inset-0">
        {isPlayingPreview && title.trailerUrl ? (
          <video
            ref={videoRef}
            src={title.trailerUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onCanPlay={() => setIsVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null}

        {/* Image de secours / de fond de haute qualité */}
        <img
          src={title.bannerUrl || title.posterUrl}
          alt={title.name}
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
            isPlayingPreview && isVideoLoaded ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Dégradés cinématiques KINOX pour assurer une parfaite lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#08090C]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090C] via-[#08090C]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090C]/60 via-transparent to-[#08090C]" />
      </div>

      {/* Contenu textuel et actions du Hero */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-16 sm:pb-24 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Badge Original KINOX */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-red-400" />
              Exclusivité KINOX
            </span>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              ★ {title.ratingScore || "9.0"}
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md leading-tight">
            {title.name}
          </h1>

          {/* Métadonnées : Année, Durée, Classification, Genres */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
            <span className="flex items-center gap-1 text-white font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {title.releaseYear}
            </span>

            {title.durationMinutes && (
              <span className="flex items-center gap-1 text-gray-300">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {formatDuration(title.durationMinutes)}
              </span>
            )}

            {title.type === "SERIES" && (
              <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-200">
                Série Multi-épisodes
              </span>
            )}

            <span className="border border-gray-600 px-1.5 py-0.5 rounded text-[11px] font-semibold text-gray-300">
              {title.maturityRating || "12+"}
            </span>

            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-bold">
              4K HDR
            </span>

            {genres.length > 0 && (
              <span className="text-gray-400 hidden sm:inline">
                • {genres.join(", ")}
              </span>
            )}
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed drop-shadow max-w-xl">
            {title.synopsis}
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/watch/${title.id}`}
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Lire</span>
            </Link>

            <button
              onClick={() => onOpenDetails(title)}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-lg backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Info className="w-5 h-5" />
              <span>Plus d'infos</span>
            </button>

            {/* Bouton muet/son pour l'aperçu si vidéo active */}
            {isPlayingPreview && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="ml-auto p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-gray-700 transition-all focus-visible:outline-none"
                aria-label={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
