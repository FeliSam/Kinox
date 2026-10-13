"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Info, Volume2, VolumeX, Sparkles, Calendar, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface HeroBannerProps {
  titles?: any[];
  title?: any; // Fallback single title
  onOpenDetails: (title: any) => void;
  allowAutoplayPreview?: boolean;
}

export default function HeroBanner({
  titles = [],
  title,
  onOpenDetails,
  allowAutoplayPreview = true,
}: HeroBannerProps) {
  // Liste des titres hero disponibles pour la rotation (top 5)
  const heroList = titles.length > 0 ? titles.slice(0, 5) : title ? [title] : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTitle = heroList[currentIndex] || title;

  // Rotation automatique toutes les 9 secondes si l'utilisateur n'interagit pas
  useEffect(() => {
    if (heroList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroList.length);
    }, 9000);

    return () => clearInterval(interval);
  }, [heroList.length]);

  // Démarrage différé de la bande-annonce vidéo au changement de slide
  useEffect(() => {
    setIsPlayingVideo(false);
    if (!allowAutoplayPreview || !activeTitle?.trailerUrl) return;

    videoTimerRef.current = setTimeout(() => {
      setIsPlayingVideo(true);
    }, 1200);

    return () => {
      if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
    };
  }, [currentIndex, activeTitle?.id, allowAutoplayPreview]);

  if (!activeTitle) return null;

  const genres = Array.isArray(activeTitle.genres)
    ? activeTitle.genres.map((g: any) => (typeof g === "string" ? g : g.genre?.name || g.name))
    : ["Cinéma"];

  const matchPercent = activeTitle.matchScore || Math.min(99, Math.round((activeTitle.ratingScore || 8.5) * 10) + 5);

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[88vh] bg-[#08090C] overflow-hidden select-none">
      {/* Arrière-plan Cinématique (Image ou Vidéo avec transition de fondu) */}
      <div className="absolute inset-0">
        {isPlayingVideo && activeTitle.trailerUrl ? (
          <video
            key={activeTitle.id}
            src={activeTitle.trailerUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover transition-opacity duration-1000 opacity-90"
          />
        ) : (
          <img
            key={activeTitle.id}
            src={activeTitle.bannerUrl || activeTitle.posterUrl}
            alt={activeTitle.name}
            className="w-full h-full object-cover object-top sm:object-center transition-all duration-1000 scale-102 animate-fadeIn"
          />
        )}

        {/* Dégradés sombres multidirectionnels cinématographiques façon Netflix */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#08090C]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090C] via-[#08090C]/70 to-transparent w-full sm:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090C]/80 via-transparent to-[#08090C]" />
      </div>

      {/* Contenu textuel et actions Hero */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-16 sm:pb-24 z-20">
        <div className="max-w-2xl space-y-4">
          {/* Badge TOP 10 Netflix */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-600 text-white font-black text-[11px] uppercase tracking-wider shadow-lg">
              <Sparkles className="w-3 h-3 fill-current" />
              TOP 10
            </span>
            <span className="text-white font-extrabold text-xs sm:text-sm drop-shadow">
              N° {currentIndex + 1} des films aujourd'hui
            </span>
          </div>

          {/* Grand Titre Officiel */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-xl">
            {activeTitle.name}
          </h1>

          {/* Métadonnées & Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-200">
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              ★ {activeTitle.ratingScore || "8.5"} ({matchPercent}% compatible)
            </span>

            <span className="flex items-center gap-1 text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {activeTitle.releaseYear}
            </span>

            <span className="border border-gray-500 px-1.5 py-0.5 rounded text-[11px] font-bold text-gray-200">
              {activeTitle.maturityRating || "16+"}
            </span>

            <span className="bg-red-950/80 text-red-400 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-black uppercase">
              Ultra HD 4K
            </span>

            <span className="bg-white/10 text-gray-200 px-2 py-0.5 rounded text-[10px] font-bold">
              Dolby Vision • 5.1
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed drop-shadow max-w-xl">
            {activeTitle.synopsis}
          </p>

          {/* Boutons d'Action Principaux façon Netflix */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href={`/watch?id=${activeTitle.id}`}
              className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-3 bg-white hover:bg-gray-200 text-black font-extrabold text-sm sm:text-base rounded-md transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Regarder</span>
            </Link>

            <button
              onClick={() => onOpenDetails(activeTitle)}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-gray-600/60 hover:bg-gray-600/80 text-white font-bold text-sm sm:text-base rounded-md backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              <Info className="w-5 h-5" />
              <span>Plus d'infos</span>
            </button>

            {/* Bouton Muet / Son */}
            {isPlayingVideo && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="ml-auto p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-gray-600 transition-all"
                aria-label={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Points indicateurs de la rotation Hero (Carousel Dots) */}
      {heroList.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:right-12 z-30 flex items-center gap-2">
          {heroList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === idx
                  ? "w-8 bg-red-600"
                  : "w-2.5 bg-gray-600 hover:bg-gray-400"
              }`}
              aria-label={`Aller au film ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
