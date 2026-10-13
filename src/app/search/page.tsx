"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import QuickViewModal from "@/components/QuickViewModal";
import Footer from "@/components/Footer";
import { Search, Filter, X } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<any | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!query.trim() && !type) {
      setResults([]);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (type) params.set("type", type);

    fetch(`/api/v1/search?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setResults(d.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, type]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full space-y-6">
        {/* Champ de recherche principal */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un film, une série, un réalisateur..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#12141C] border border-[#2B3044] rounded-full py-3.5 pl-12 pr-12 text-sm sm:text-base text-white focus:outline-none focus:border-red-600 transition-all shadow-xl"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                router.push("/search");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Filtres par type */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {["", "MOVIE", "SERIES", "DOCUMENTARY"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                type === t
                  ? "bg-red-600 border-red-500 text-white"
                  : "bg-[#141622] border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {t === "" ? "Tout" : t === "MOVIE" ? "Films" : t === "SERIES" ? "Séries" : "Documentaires"}
            </button>
          ))}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              {results.length} résultat{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {results.map((r) => (
                <ContentCard
                  key={r.id}
                  title={r}
                  onOpenDetails={(t) => setSelectedTitle(t)}
                  aspectRatio="poster"
                />
              ))}
            </div>
          </div>
        ) : query.trim() ? (
          <div className="text-center py-20 text-gray-400 space-y-2">
            <p className="text-lg font-bold text-white">Aucun résultat pour « {query} »</p>
            <p className="text-sm">Vérifiez l'orthographe ou essayez d'autres mots-clés ou genres.</p>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>Saisissez un mot-clé pour lancer la recherche.</p>
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090C] flex items-center justify-center text-white">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
