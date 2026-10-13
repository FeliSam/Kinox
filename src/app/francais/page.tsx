"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import QuickViewModal from "@/components/QuickViewModal";
import Footer from "@/components/Footer";
import { Film, Search, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { getFrenchCinemaCatalog, TMDBMedia } from "@/lib/tmdb";

const GENRE_FILTERS = [
  { id: "all", label: "Tous les films (100+)" },
  { id: "comedie", label: "Comédies françaises" },
  { id: "thriller", label: "Polars & Thrillers" },
  { id: "action", label: "Action & Aventure" },
  { id: "drame", label: "Drames & Émotion" },
  { id: "animation", label: "Animation & Famille" },
];

export default function FrenchCinemaPage() {
  const [films, setFilms] = useState<TMDBMedia[]>([]);
  const [activeGenre, setActiveGenre] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFrenchCinemaCatalog(1, activeGenre)
      .then((data) => {
        setFilms(data.items);
      })
      .catch((err) => {
        console.error("Erreur chargement films français:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeGenre]);

  // Filtrage local instantané par recherche
  const filteredFilms = films.filter((f) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.name.toLowerCase().includes(term) ||
      (f.originalName && f.originalName.toLowerCase().includes(term)) ||
      f.synopsis.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full space-y-8">
        {/* En-tête héroïque Cinéma Français */}
        <div className="relative rounded-2xl p-6 sm:p-10 overflow-hidden bg-gradient-to-r from-red-950/40 via-blue-950/30 to-black/80 border border-red-900/30 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collection Exclusive — Version Française</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              <span>🇫🇷 Cinéma Français & VF</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              Plus de <span className="text-white font-extrabold underline decoration-red-600">100 films en streaming</span> français et internationaux en version française intégrale. Comédies cultes, polars percutants, drames primés et bandes-annonces Haute Définition.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Mises à jour quotidiennes TMDB
              </span>
              <span>•</span>
              <span>Bandes-annonces HD en VF</span>
              <span>•</span>
              <span className="bg-red-600/30 text-red-300 px-2 py-0.5 rounded font-bold">
                {filteredFilms.length} titres affichés
              </span>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />
        </div>

        {/* Barre d'outils : Filtres par genres et recherche */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
          {/* Boutons de genres */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {GENRE_FILTERS.map((g) => {
              const active = activeGenre === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveGenre(g.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                    active
                      ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 scale-105"
                      : "bg-[#141622] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          {/* Recherche rapide */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher parmi les films..."
              className="w-full bg-[#141622] border border-gray-800 text-white text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-red-600 transition-colors placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Grille de 100+ films */}
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Chargement de plus de 100 films français en direct...
            </p>
          </div>
        ) : filteredFilms.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {filteredFilms.map((film) => (
                <ContentCard
                  key={film.id}
                  title={film}
                  onOpenDetails={(t) => setSelectedTitle(t)}
                  aspectRatio="poster"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-[#141622]/50 border border-gray-800/80 rounded-2xl p-8 space-y-3">
            <Filter className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-base font-bold text-gray-300">
              Aucun film ne correspond à votre recherche "{searchTerm}"
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveGenre("all");
              }}
              className="text-xs text-red-500 hover:text-red-400 font-bold underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>

      {/* Modale de fiche détaillée avec lecteur de bande-annonce et notes */}
      {selectedTitle && (
        <QuickViewModal
          title={selectedTitle}
          onClose={() => setSelectedTitle(null)}
          currentLang="fr-FR"
        />
      )}

      <Footer />
    </div>
  );
}
