"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import QuickViewModal from "@/components/QuickViewModal";
import Footer from "@/components/Footer";
import { Grid, Sparkles } from "lucide-react";

export default function CategoriesPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [titles, setTitles] = useState<any[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/genres")
      .then((r) => r.json())
      .then((data) => {
        const gList = data.genres || [];
        setGenres(gList);
        if (gList.length > 0) {
          setActiveGenre(gList[0].slug);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!activeGenre) return;
    setLoading(true);
    fetch(`/api/v1/titles?genre=${activeGenre}`)
      .then((r) => r.json())
      .then((data) => setTitles(data.titles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeGenre]);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full space-y-8">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Grid className="w-7 h-7 text-red-600" />
            <span>Catégories & Genres</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Parcourez notre catalogue par univers cinématographique.
          </p>
        </div>

        {/* Pilules de genres */}
        <div className="flex flex-wrap gap-2.5">
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGenre(g.slug)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeGenre === g.slug
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105"
                  : "bg-[#141622] text-gray-300 hover:bg-[#202436] hover:text-white border border-gray-800"
              }`}
            >
              {g.name} ({g._count?.titles || 0})
            </button>
          ))}
        </div>

        {/* Résultats du genre */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : titles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {titles.map((t) => (
              <ContentCard
                key={t.id}
                title={t}
                onOpenDetails={(item) => setSelectedTitle(item)}
                aspectRatio="poster"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>Aucun titre répertorié dans cette catégorie pour le moment.</p>
          </div>
        )}
      </main>

      {selectedTitle && (
        <QuickViewModal
          title={selectedTitle}
          onClose={() => setSelectedTitle(null)}
        />
      )}

      <Footer />
    </div>
  );
}
