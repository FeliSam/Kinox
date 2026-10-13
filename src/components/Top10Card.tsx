"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Plus, Check, Info, Star } from "lucide-react";

interface Top10CardProps {
  rank: number;
  title: any;
  onOpenDetails: (title: any) => void;
  isInMyList?: boolean;
  onToggleMyList?: (titleId: string) => Promise<boolean>;
}

export default function Top10Card({
  rank,
  title,
  onOpenDetails,
  isInMyList = false,
  onToggleMyList,
}: Top10CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [inList, setInList] = useState(isInMyList);
  const [listLoading, setListLoading] = useState(false);

  const handleListClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (listLoading || !onToggleMyList) return;
    setListLoading(true);
    try {
      const res = await onToggleMyList(title.id);
      setInList(res);
    } finally {
      setListLoading(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex-none flex items-center group cursor-pointer transition-transform duration-300 hover:scale-105 z-10"
      style={{ width: "240px", height: "260px" }}
    >
      {/* Numéro géant stylisé Netflix (1 à 10) */}
      <div className="relative w-28 h-full flex items-center justify-center select-none pointer-events-none">
        <span
          className="text-[140px] font-black leading-none tracking-tighter"
          style={{
            color: "#08090C",
            WebkitTextStroke: "4px #595F7A",
            textShadow: "0 0 20px rgba(0,0,0,0.8)",
            fontFamily: "Impact, sans-serif",
          }}
        >
          {rank}
        </span>
      </div>

      {/* Affiche du film posée contre le numéro */}
      <div
        onClick={() => onOpenDetails(title)}
        className="relative -ml-6 w-[150px] h-[225px] rounded-md overflow-hidden bg-[#12141C] border border-[#25293A] shadow-2xl group-hover:border-red-600 transition-all duration-300"
      >
        <img
          src={title.posterUrl}
          alt={title.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge "TOP 10" en coin supérieur */}
        <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
          TOP {rank}
        </div>

        {/* Dégradé bas avec titre et match score */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-end p-2.5">
          <p className="text-xs font-black text-white truncate drop-shadow">{title.name}</p>
          <div className="flex items-center justify-between text-[10px] text-gray-300 mt-0.5">
            <span className="text-emerald-400 font-bold">{title.matchScore || 98}% match</span>
            <span className="text-gray-400">{title.releaseYear}</span>
          </div>
        </div>

        {/* Boutons d'action rapides au survol */}
        <div
          className={`absolute inset-0 bg-black/80 flex flex-col justify-between p-3 transition-opacity duration-200 ${
            isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div>
            <span className="text-[10px] bg-red-600/30 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded font-bold uppercase">
              N° {rank} en France
            </span>
            <p className="text-xs font-bold text-white line-clamp-2 mt-2">{title.name}</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
              Recommandé à {title.matchScore || 98}%
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-800">
            <Link
              href={`/watch/${title.id}`}
              className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs flex items-center justify-center gap-1"
              title="Lecture"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Lire</span>
            </Link>

            <button
              onClick={handleListClick}
              disabled={listLoading}
              className={`p-1.5 rounded border ${
                inList ? "bg-red-600/20 border-red-500 text-red-400" : "bg-white/10 border-gray-600 text-white"
              }`}
              title="Ma liste"
            >
              {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onOpenDetails(title)}
              className="p-1.5 rounded border border-gray-600 bg-white/10 text-white"
              title="Plus d'infos"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
