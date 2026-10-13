"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import QuickViewModal from "@/components/QuickViewModal";
import Footer from "@/components/Footer";
import { Film } from "lucide-react";

export default function FilmsPage() {
  const [films, setFilms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/genres")
      .then((r) => r.json())
      .then((d) => setGenres(d.genres || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({ type: "MOVIE" });
    if (selectedGenre) query.set("genre", selectedGenre);

    fetch(`/api/v1/titles?${query.toString()}`)
      .then((r) => r.json())
      .then((d) => setFilms(d.titles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedGenre]);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Film className="w-7 h-7 text-red-600" />
              <span>Films KINOX</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Explorez nos longs-métrages en Ultra Haute Définition.
            </p>
          </div>

          {/* Filtre par genre */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Genre :</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-[#12141C] border border-[#2B3044] text-white text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-600"
            >
              <option value="">Tous les genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : films.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {films.map((f) => (
              <ContentCard
                key={f.id}
                title={f}
                onOpenDetails={(t) => setSelectedTitle(t)}
                aspectRatio="poster"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-500">
            <p>Aucun film trouvé pour cette sélection.</p>
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
