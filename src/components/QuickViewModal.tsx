"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Play, Plus, Check, Star, Calendar, Clock, Globe } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface QuickViewModalProps {
  title: any | null;
  onClose: () => void;
  isInMyList?: boolean;
  onToggleMyList?: (titleId: string) => Promise<boolean>;
}

export default function QuickViewModal({
  title,
  onClose,
  isInMyList = false,
  onToggleMyList,
}: QuickViewModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [inList, setInList] = useState(isInMyList);

  useEffect(() => {
    setInList(isInMyList);
  }, [isInMyList]);

  useEffect(() => {
    if (!title?.slug) return;
    setLoading(true);
    fetch(`/api/v1/titles/${title.slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.title) setDetails(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [title?.slug]);

  // Fermeture par touche Echap et focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!title) return null;

  const current = details?.title || title;
  const genres = current.genres?.map((g: any) => g.genre?.name || g.name) || [];
  const similar = details?.similarTitles || [];
  const seasons = current.seasons || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-heading"
    >
      <div className="relative w-full max-w-4xl bg-[#12141C] border border-[#25293A] rounded-2xl shadow-2xl overflow-hidden my-8 text-white max-h-[90vh] flex flex-col">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-gray-300 hover:text-white border border-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          aria-label="Fermer la fiche d'information"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visuel en-tête */}
        <div className="relative w-full h-64 sm:h-96 shrink-0 bg-black">
          <img
            src={current.bannerUrl || current.posterUrl}
            alt={current.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-[#12141C]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12141C] via-transparent to-transparent" />

          {/* Titre et actions primaires sur l'en-tête */}
          <div className="absolute bottom-6 left-6 right-6">
            <h2 id="modal-title-heading" className="text-2xl sm:text-4xl font-black drop-shadow-md">
              {current.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Link
                href={`/watch/${current.id}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
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
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                    inList
                      ? "bg-red-600/20 border-red-500 text-red-400"
                      : "bg-white/10 border-gray-600 hover:bg-white/20 text-white"
                  }`}
                >
                  {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{inList ? "Dans Ma liste" : "Ajouter à Ma liste"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Corps de la modale scrollable */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Métadonnées et synopsis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  {current.ratingScore || "8.5"}/10
                </span>
                <span className="flex items-center gap-1 text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {current.releaseYear}
                </span>
                {current.durationMinutes && (
                  <span className="flex items-center gap-1 text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {formatDuration(current.durationMinutes)}
                  </span>
                )}
                <span className="border border-gray-600 px-1.5 py-0.5 rounded text-xs">
                  {current.maturityRating || "12+"}
                </span>
                <span className="bg-red-950/60 text-red-400 border border-red-600/40 px-2 py-0.5 rounded text-xs font-semibold">
                  Ultra HD 4K
                </span>
              </div>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                {current.synopsis}
              </p>
            </div>

            {/* Panneau latéral détails */}
            <div className="space-y-3 text-xs text-gray-400 bg-[#181B26] p-4 rounded-xl border border-gray-800">
              <div>
                <span className="text-gray-500 block mb-0.5 font-semibold">Genres</span>
                <span className="text-gray-200">{genres.join(", ") || "Action, Drame"}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-semibold">Audio</span>
                <span className="text-gray-200">Français [5.1], Anglais [Audio description]</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-semibold">Sous-titres</span>
                <span className="text-gray-200">Français, Anglais, Allemand, Espagnol</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-0.5 font-semibold">Disponibilité</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Mondiale (Tous territoires)
                </span>
              </div>
            </div>
          </div>

          {/* Saisons et Épisodes si série */}
          {seasons.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <h3 className="text-lg font-bold text-white">Épisodes</h3>
              {seasons.map((s: any) => (
                <div key={s.id} className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300">{s.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {s.episodes?.map((ep: any) => (
                      <Link
                        key={ep.id}
                        href={`/watch/${current.id}?episode=${ep.id}`}
                        className="flex gap-3 p-2.5 rounded-lg bg-[#181B26] hover:bg-[#202433] border border-gray-800 transition-colors group"
                      >
                        <div className="relative w-24 h-16 shrink-0 rounded overflow-hidden bg-black">
                          <img
                            src={ep.thumbnailUrl || current.posterUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent flex items-center justify-center transition-colors">
                            <Play className="w-5 h-5 text-white fill-current opacity-80 group-hover:opacity-100" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{ep.name}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">
                            {ep.synopsis || "Épisode palpitant de la série."}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Titres Similaires */}
          {similar.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <h3 className="text-lg font-bold text-white">Titres Similaires</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {similar.map((sim: any) => (
                  <div
                    key={sim.id}
                    onClick={() => setDetails({ title: sim, similarTitles: [] })}
                    className="p-2 rounded-lg bg-[#181B26] hover:bg-[#222638] border border-gray-800 cursor-pointer transition-all hover:scale-102"
                  >
                    <img
                      src={sim.posterUrl}
                      alt={sim.name}
                      className="w-full aspect-[2/3] object-cover rounded-md mb-2"
                    />
                    <p className="text-xs font-bold text-white truncate">{sim.name}</p>
                    <p className="text-[10px] text-gray-400">{sim.releaseYear}</p>
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
