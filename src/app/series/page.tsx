"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import QuickViewModal from "@/components/QuickViewModal";
import Footer from "@/components/Footer";
import { Tv } from "lucide-react";

export default function SeriesPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/titles?type=SERIES")
      .then((r) => r.json())
      .then((d) => setSeries(d.titles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full space-y-6">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Tv className="w-7 h-7 text-red-600" />
            <span>Séries Originales KINOX</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Plongez dans des saisons intégrales avec cliffhangers captivants et son immersif.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : series.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {series.map((s) => (
              <ContentCard
                key={s.id}
                title={s}
                onOpenDetails={(t) => setSelectedTitle(t)}
                aspectRatio="poster"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-500">
            <p>Aucune série disponible pour le moment.</p>
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
