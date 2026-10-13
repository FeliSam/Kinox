"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Play, Plus, Check, Info, Star } from "lucide-react";
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
  const [inList, setInList] = useState(isInMyList);
  const [listLoading, setListLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInList(isInMyList);
  }, [isInMyList]);

  // Gestion de l'aperçu vidéo différé au survol (600ms)
  const handleMouseEnter = () => {
    setIsHovered(true);

    if (
      !allowHoverPreview ||
      !title.trailerUrl ||
      (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      return;
    }

    previewTimerRef.current = setTimeout(() => {
      setIsPlayingPreview(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlayingPreview(false);
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  };

  const handleListClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (listLoading) return;

    setListLoading(true);
    try {
      if (onToggleMyList) {
        const newState = await onToggleMyList(title.id);
        setInList(newState);
      } else {
        // Requête directe fallback
        const method = inList ? "DELETE" : "POST";
        const res = await fetch(`/api/v1/my-list/${title.id}`, { method });
        if (res.ok) {
          const data = await res.json();
          setInList(data.inList);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const imageUrl =
    imgError || (!title.posterUrl && !title.bannerUrl)
      ? "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
      : aspectRatio === "landscape"
      ? title.bannerUrl || title.posterUrl
      : title.posterUrl || title.bannerUrl;

  const genres = title.genres?.map((g: any) => g.genre?.name || g.name) || [];
  const progress = title.watchProgress;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group flex-none rounded-lg overflow-hidden bg-[#12141C] border border-[#222638] transition-all duration-300 transform-gpu hover:z-20 hover:scale-[1.04] hover:shadow-xl hover:shadow-black/70 hover:border-red-600/50 ${
        aspectRatio === "landscape"
          ? "w-[240px] sm:w-[280px] lg:w-[320px] aspect-video"
          : "w-[150px] sm:w-[180px] lg:w-[200px] aspect-[2/3]"
      }`}
    >
      {/* Visuel d'affiche ou aperçu vidéo muet */}
      <div className="relative w-full h-full overflow-hidden bg-[#0D0F15]">
        {isPlayingPreview && title.trailerUrl ? (
          <video
            src={title.trailerUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={imageUrl}
            alt={title.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Dégradé bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

        {/* Barre de progression si le contenu a été commencé */}
        {progress && progress.percentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
            <div
              className="h-full bg-red-600 rounded-r"
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Titre et badges visibles par défaut */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 pointer-events-none group-hover:opacity-0 transition-opacity duration-200">
        <h3 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow">
          {title.name}
        </h3>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-300 mt-0.5">
          <span>{title.releaseYear}</span>
          <span className="border border-gray-600 px-1 py-0.2 rounded text-[10px]">
            {title.maturityRating || "12+"}
          </span>
          <span className="text-amber-400 font-semibold flex items-center gap-0.5 ml-auto">
            <Star className="w-2.5 h-2.5 fill-current" />
            {title.ratingScore || "8.5"}
          </span>
        </div>
      </div>

      {/* Panneau interactif qui apparaît au survol */}
      <div
        className={`absolute inset-0 p-3 flex flex-col justify-between bg-black/85 backdrop-blur-xs transition-opacity duration-200 ${
          isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Titre et badges */}
        <div>
          <div className="flex items-start justify-between gap-1">
            <h4 className="text-xs sm:text-sm font-black text-white line-clamp-2 leading-tight">
              {title.name}
            </h4>
            <span className="text-[10px] bg-red-600/30 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
              {title.type === "MOVIE" ? "Film" : "Série"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-300 mt-1.5">
            <span className="text-amber-400 font-bold">★ {title.ratingScore}</span>
            <span>{title.releaseYear}</span>
            {title.durationMinutes && <span>{formatDuration(title.durationMinutes)}</span>}
          </div>

          {genres.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-1 truncate">
              {genres.slice(0, 2).join(" • ")}
            </p>
          )}
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
          <Link
            href={`/watch/${title.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors shadow focus-visible:outline-none"
            title="Lancer la lecture"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Lire</span>
          </Link>

          <button
            onClick={handleListClick}
            disabled={listLoading}
            className={`p-1.5 rounded border transition-colors ${
              inList
                ? "bg-red-600/20 border-red-500 text-red-400"
                : "bg-white/10 border-gray-600 text-white hover:bg-white/20"
            }`}
            title={inList ? "Retirer de ma liste" : "Ajouter à ma liste"}
            aria-label={inList ? "Retirer de ma liste" : "Ajouter à ma liste"}
          >
            {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(title);
            }}
            className="p-1.5 rounded border border-gray-600 bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Détails"
            aria-label="Voir les détails"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
