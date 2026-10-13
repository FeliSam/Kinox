"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Play, Plus, Check, ChevronDown, ThumbsUp, Star, Volume2, VolumeX } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface ContentCardProps {
  title: any;
  onOpenDetails: (title: any) => void;
  aspectRatio?: "poster" | "landscape";
  allowHoverPreview?: boolean;
  isInMyList?: boolean;
  onToggleMyList?: (titleId: string) => Promise<boolean>;
}

export default function ContentCard({
  title,
  onOpenDetails,
  aspectRatio = "poster",
  allowHoverPreview = true,
  isInMyList = false,
  onToggleMyList,
}: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [inList, setInList] = useState(isInMyList);
  const [listLoading, setListLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInList(isInMyList);
  }, [isInMyList]);

  const handleMouseEnter = () => {
    // Démarrage différé de la carte de prévisualisation (350ms comme Netflix)
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(true);
      if (allowHoverPreview && (title.trailerUrl || title.youtubeTrailerKey)) {
        setIsPlayingPreview(true);
      }
    }, 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHovered(false);
    setIsPlayingPreview(false);
  };

  const handleListClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (listLoading) return;
    setListLoading(true);
    try {
      if (onToggleMyList) {
        const nextState = await onToggleMyList(title.id);
        setInList(nextState);
      } else {
        const method = inList ? "DELETE" : "POST";
        const res = await fetch(`/api/v1/my-list/${title.id}`, { method });
        if (res.ok) {
          const d = await res.json();
          setInList(d.inList);
        }
      }
    } finally {
      setListLoading(false);
    }
  };

  const imageUrl =
    aspectRatio === "landscape"
      ? title.bannerUrl || title.posterUrl
      : title.posterUrl || title.bannerUrl;

  const genres = Array.isArray(title.genres)
    ? title.genres.map((g: any) => (typeof g === "string" ? g : g.genre?.name || g.name))
    : ["Cinéma"];

  const matchPercent = title.matchScore || Math.min(99, Math.round((title.ratingScore || 8.5) * 10) + 5);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex-none rounded-md transition-all duration-300 select-none ${
        aspectRatio === "landscape"
          ? "w-[240px] sm:w-[280px] aspect-video"
          : "w-[155px] sm:w-[185px] lg:w-[200px] aspect-[2/3]"
      }`}
    >
      {/* Carte normale par défaut */}
      <div
        onClick={() => onOpenDetails(title)}
        className="w-full h-full rounded-md overflow-hidden bg-[#12141C] border border-[#222638] cursor-pointer shadow-lg"
      >
        <img
          src={imageUrl}
          alt={title.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* Dégradé discret avec titre sur l'affiche normale */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
          <p className="text-xs font-bold text-white truncate drop-shadow">{title.name}</p>
          <div className="flex items-center gap-2 text-[10px] text-gray-300 mt-0.5">
            <span className="text-emerald-400 font-bold">{matchPercent}%</span>
            <span>{title.releaseYear}</span>
            <span className="border border-gray-600 px-1 py-0.2 rounded text-[9px]">
              {title.maturityRating || "12+"}
            </span>
          </div>
        </div>

        {/* Barre de progression de lecture si commencé */}
        {title.watchProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div
              className="h-full bg-red-600"
              style={{ width: `${Math.min(title.watchProgress.percentage || 30, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Mini-Player Card Expandable Netflix (au survol après 350ms) */}
      {isHovered && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[300px] sm:w-[330px] rounded-xl overflow-hidden bg-[#181B26] border border-[#32374E] shadow-[0_12px_40px_rgba(0,0,0,0.9)] z-50 animate-fadeIn"
          style={{ transformOrigin: "center center" }}
        >
          {/* Média en tête (Bande-annonce vidéo muette ou grande bannière) */}
          <div className="relative w-full aspect-video bg-black overflow-hidden">
            {isPlayingPreview && title.trailerUrl ? (
              <video
                src={title.trailerUrl}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={title.bannerUrl || title.posterUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            )}

            {/* Dégradé bas sous la vidéo */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181B26] via-transparent to-transparent" />

            {/* Titre sur la vidéo de la mini-card */}
            <div className="absolute bottom-3 left-3 right-12">
              <h4 className="text-sm font-black text-white drop-shadow-md truncate">
                {title.name}
              </h4>
            </div>

            {/* Bouton Muet / Son */}
            {isPlayingPreview && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white border border-gray-600"
                aria-label={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Panneau de détails et actions façon Netflix */}
          <div className="p-4 space-y-3">
            {/* Boutons circulaires d'action */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Bouton Play blanc rond */}
                <Link
                  href={`/watch?id=${title.id}`}
                  className="w-9 h-9 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                  title="Lecture"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </Link>

                {/* Bouton Ajouter à Ma Liste */}
                <button
                  onClick={handleListClick}
                  disabled={listLoading}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${
                    inList
                      ? "bg-red-600/30 border-red-500 text-red-400"
                      : "bg-[#282C3D] border-gray-600 text-white hover:border-white"
                  }`}
                  title={inList ? "Dans ma liste" : "Ajouter à ma liste"}
                >
                  {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>

                {/* Bouton Like / J'aime */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${
                    isLiked
                      ? "bg-red-600/30 border-red-500 text-red-400"
                      : "bg-[#282C3D] border-gray-600 text-white hover:border-white"
                  }`}
                  title="J'aime ce titre"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>

              {/* Bouton Chevron Plus d'infos */}
              <button
                onClick={() => onOpenDetails(title)}
                className="w-9 h-9 rounded-full bg-[#282C3D] hover:bg-[#343A50] border border-gray-600 hover:border-white text-white flex items-center justify-center transition-transform hover:scale-110"
                title="Plus d'informations"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Métadonnées & Badges */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-extrabold">{matchPercent}% de concordance</span>
              <span className="border border-gray-600 text-gray-300 px-1 py-0.2 rounded text-[10px] font-bold">
                {title.maturityRating || "16+"}
              </span>
              <span className="text-gray-300 text-xs">
                {title.type === "SERIES" ? "Série" : title.durationMinutes ? formatDuration(title.durationMinutes) : "2h"}
              </span>
              <span className="bg-red-950/80 text-red-400 border border-red-600/40 px-1.5 py-0.2 rounded text-[9px] font-black uppercase ml-auto">
                Ultra HD
              </span>
            </div>

            {/* Genres séparés par des puces */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-300 pt-1">
              {genres.slice(0, 3).map((g: string, i: number) => (
                <React.Fragment key={g}>
                  <span className="hover:underline">{g}</span>
                  {i < Math.min(genres.length, 3) - 1 && (
                    <span className="text-red-600 font-black">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
