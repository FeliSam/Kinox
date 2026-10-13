"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Play, Plus, Check, Star, Calendar, Clock, Globe, Volume2, VolumeX } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface QuickViewModalProps {
  title: any | null;
  onClose: () => void;
  isInMyList?: boolean;
  onToggleMyList?: (titleId: string) => Promise<boolean>;
  currentLang?: "fr-FR" | "en-US";
}

export default function QuickViewModal({
  title,
  onClose,
  isInMyList = false,
  onToggleMyList,
  currentLang = "fr-FR",
}: QuickViewModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [inList, setInList] = useState(isInMyList);
  const [activeTab, setActiveTab] = useState<"overview" | "episodes" | "similar">("overview");

  useEffect(() => {
    setInList(isInMyList);
  }, [isInMyList]);

  useEffect(() => {
    if (!title) return;
    setLoading(true);

    const tmdbId = title.tmdbId || (typeof title.id === "string" && title.id.startsWith("tmdb-") ? title.id.replace("tmdb-", "") : null);

    if (tmdbId) {
      // Charger les détails officiels TMDB avec casting, réalisateur et bande-annonce YouTube
      fetch(`/api/v1/tmdb/details/${tmdbId}?type=${title.type || "MOVIE"}&lang=${currentLang}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.details) setDetails(data.details);
          else setDetails(title);
        })
        .catch(() => setDetails(title))
        .finally(() => setLoading(false));
    } else if (title.slug) {
      // Charger via l'API locale
      fetch(`/api/v1/titles/${title.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.title) setDetails({ ...data.title, similarTitles: data.similarTitles });
          else setDetails(title);
        })
        .catch(() => setDetails(title))
        .finally(() => setLoading(false));
    } else {
      setDetails(title);
      setLoading(false);
    }
  }, [title, currentLang]);

  // Fermeture par touche Echap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!title) return null;

  const current = details || title;
  const genres = Array.isArray(current.genres)
    ? current.genres.map((g: any) => (typeof g === "string" ? g : g.genre?.name || g.name))
    : ["Cinéma"];

  const similar = current.similarTitles || [];
  const cast = current.cast || [];
  const matchScore = current.matchScore || Math.min(99, Math.round((current.ratingScore || 8.5) * 10) + 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-[#141622] border border-[#2B3044] rounded-2xl shadow-2xl overflow-hidden my-8 text-white max-h-[92vh] flex flex-col">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black text-gray-300 hover:text-white border border-gray-700 transition-colors"
          aria-label="Fermer la fiche d'information"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête Vidéo ou Bannière HD */}
        <div className="relative w-full aspect-video sm:h-96 shrink-0 bg-black overflow-hidden">
          {current.youtubeTrailerKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${current.youtubeTrailerKey}?autoplay=1&mute=1&controls=1&modestbranding=1&loop=1&playlist=${current.youtubeTrailerKey}`}
              className="w-full h-full border-0 pointer-events-auto"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <img
              src={current.bannerUrl || current.posterUrl}
              alt={current.name}
              className="w-full h-full object-cover object-top sm:object-center"
            />
          )}

          {/* Dégradés bas et gauche */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141622] via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141622]/60 via-transparent to-transparent pointer-events-none" />

          {/* Titre et actions sur la bannière */}
          <div className="absolute bottom-6 left-6 right-6 pointer-events-auto z-20">
            <h2 className="text-2xl sm:text-4xl font-black drop-shadow-lg text-white">
              {current.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Link
                href={`/watch?id=${current.id}`}
                className="inline-flex items-center gap-2 px-7 py-2.5 bg-white hover:bg-gray-200 text-black font-extrabold rounded-md shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Lecture</span>
              </Link>

              {onToggleMyList && (
                <button
                  onClick={async () => {
                    const res = await onToggleMyList(current.id);
                    setInList(res);
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md border font-bold text-sm transition-all ${
                    inList
                      ? "bg-red-600/30 border-red-500 text-red-400"
                      : "bg-[#282C3D] border-gray-600 hover:border-white text-white"
                  }`}
                >
                  {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{inList ? "Dans Ma liste" : "Ajouter à Ma liste"}</span>
                </button>
              )}

              <span className="text-emerald-400 font-extrabold text-sm ml-auto hidden sm:inline">
                {matchScore}% de concordance
              </span>
            </div>
          </div>
        </div>

        {/* Corps de la modale scrollable */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Métadonnées et Synopsis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
                <span className="text-emerald-400 font-bold">{matchScore}% compatible</span>
                <span className="flex items-center gap-1 text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {current.releaseYear}
                </span>
                <span className="border border-gray-600 px-1.5 py-0.5 rounded text-xs">
                  {current.maturityRating || "16+"}
                </span>
                <span className="bg-red-950/60 text-red-400 border border-red-600/40 px-2 py-0.5 rounded text-xs font-semibold">
                  Ultra HD 4K
                </span>
                <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-xs font-bold">
                  Spatial Audio
                </span>
              </div>

              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {current.synopsis}
              </p>
            </div>

            {/* Panneau latéral détails & distribution */}
            <div className="space-y-3 text-xs text-gray-400 bg-[#1C1F2E] p-4 rounded-xl border border-gray-800">
              {current.director && (
                <div>
                  <span className="text-gray-500 block mb-0.5 font-semibold">Réalisation</span>
                  <span className="text-white font-medium">{current.director}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500 block mb-0.5 font-semibold">Genres</span>
                <span className="text-gray-200">{genres.join(", ")}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-semibold">Langues audio</span>
                <span className="text-gray-200">Français [5.1], Anglais [Audio description]</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-semibold">Sous-titres</span>
                <span className="text-gray-200">Français, Anglais</span>
              </div>
            </div>
          </div>

          {/* Distribution (Casting avec photos) */}
          {cast.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Distribution Principale
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {cast.slice(0, 4).map((actor: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-[#1C1F2E] border border-gray-800">
                    {actor.profileUrl ? (
                      <img
                        src={actor.profileUrl}
                        alt={actor.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {actor.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{actor.character || "Acteur"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Titres Similaires */}
          {similar.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <h3 className="text-base font-bold text-white">Titres Similaires Recommandés</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {similar.slice(0, 6).map((sim: any) => (
                  <div
                    key={sim.id}
                    onClick={() => setDetails(sim)}
                    className="p-2.5 rounded-lg bg-[#1C1F2E] hover:bg-[#25293D] border border-gray-800 cursor-pointer transition-all hover:scale-102 group"
                  >
                    <div className="relative aspect-video rounded overflow-hidden bg-black mb-2">
                      <img
                        src={sim.bannerUrl || sim.posterUrl}
                        alt={sim.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-1 right-1 bg-black/70 text-emerald-400 font-bold text-[9px] px-1 rounded">
                        {sim.matchScore || 95}%
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{sim.name}</p>
                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{sim.synopsis}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
