"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import QuickViewModal from "@/components/QuickViewModal";
import Footer from "@/components/Footer";
import { Bookmark, Film, Play } from "lucide-react";

export default function MyListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadList = () => {
    setLoading(true);
    fetch("/api/v1/my-list")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleToggleMyList = async (titleId: string) => {
    try {
      const res = await fetch(`/api/v1/my-list/${titleId}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== titleId));
        return false;
      }
    } catch (e) {
      console.error(e);
    }
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full space-y-6">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-red-600" />
            <span>Ma Liste</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Les films et séries que vous avez sauvegardés pour les regarder plus tard.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {items.map((item) => (
              <ContentCard
                key={item.id}
                title={item}
                onOpenDetails={(t) => setSelectedTitle(t)}
                aspectRatio="poster"
                isInMyList={true}
                onToggleMyList={handleToggleMyList}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#10121A] rounded-2xl border border-gray-800 max-w-xl mx-auto p-8 space-y-4">
            <Bookmark className="w-12 h-12 text-gray-600 mx-auto" />
            <h2 className="text-lg font-bold text-white">Votre liste est encore vide</h2>
            <p className="text-sm text-gray-400">
              Explorez le catalogue KINOX et cliquez sur le bouton « + » pour ajouter des œuvres à votre sélection personnalisée.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 font-bold text-sm rounded-lg transition-colors"
            >
              <Film className="w-4 h-4" />
              <span>Explorer le catalogue</span>
            </Link>
          </div>
        )}
      </main>

      {selectedTitle && (
        <QuickViewModal
          title={selectedTitle}
          onClose={() => setSelectedTitle(null)}
          isInMyList={true}
          onToggleMyList={handleToggleMyList}
        />
      )}

      <Footer />
    </div>
  );
}
