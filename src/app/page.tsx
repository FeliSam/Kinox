"use client";

import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import QuickViewModal from "@/components/QuickViewModal";
import Footer from "@/components/Footer";
import { Film, AlertTriangle, RefreshCw } from "lucide-react";

export default function HomePage() {
  const [homeData, setHomeData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [myListIds, setMyListIds] = useState<Set<string>>(new Set());
  const [selectedTitle, setSelectedTitle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Préférence utilisateur pour le défilement horizontal automatique lent
  const [userAutoScroll, setUserAutoScroll] = useState(false);

  // Charger les données de la page d'accueil
  const loadHome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resHome, resMe, resList] = await Promise.all([
        fetch("/api/v1/home"),
        fetch("/api/v1/me"),
        fetch("/api/v1/my-list"),
      ]);

      if (!resHome.ok) throw new Error("Impossible de charger le flux d'accueil.");

      const dataHome = await resHome.json();
      const dataMe = await resMe.json().catch(() => ({}));
      const dataList = await resList.json().catch(() => ({}));

      setHomeData(dataHome);
      setUserData(dataMe.user || null);
      setActiveProfile(dataMe.profile || null);

      if (dataMe.profile?.autoScroll !== undefined) {
        setUserAutoScroll(dataMe.profile.autoScroll);
      }

      if (dataList.items && Array.isArray(dataList.items)) {
        setMyListIds(new Set(dataList.items.map((it: any) => it.id)));
      }
    } catch (err: any) {
      console.warn("API indisponible (mode statique / GitHub Pages). Chargement du catalogue intégré...");
      const { MOCK_BRAND, MOCK_TITLES, MOCK_HOME_SECTIONS } = await import("@/lib/mockData");
      setHomeData({
        brand: MOCK_BRAND,
        heroTitle: MOCK_TITLES[0],
        sections: MOCK_HOME_SECTIONS,
      });
      // Restaurer Ma Liste depuis localStorage si disponible
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("kinox_my_list");
          if (stored) setMyListIds(new Set(JSON.parse(stored)));
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  // Ajouter / Supprimer de Ma Liste
  const handleToggleMyList = async (titleId: string): Promise<boolean> => {
    const isCurrentlyInList = myListIds.has(titleId);
    const method = isCurrentlyInList ? "DELETE" : "POST";

    try {
      const res = await fetch(`/api/v1/my-list/${titleId}`, { method });
      if (res.ok) {
        setMyListIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlyInList) {
            next.delete(titleId);
          } else {
            next.add(titleId);
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("kinox_my_list", JSON.stringify(Array.from(next)));
          }
          return next;
        });
        return !isCurrentlyInList;
      }
    } catch (e) {
      // Fallback local
      setMyListIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyInList) next.delete(titleId);
        else next.add(titleId);
        if (typeof window !== "undefined") {
          localStorage.setItem("kinox_my_list", JSON.stringify(Array.from(next)));
        }
        return next;
      });
      return !isCurrentlyInList;
    }
    return isCurrentlyInList;
  };

  // Basculer la préférence globale de défilement automatique
  const handleToggleAutoScroll = async (enabled: boolean) => {
    setUserAutoScroll(enabled);
    if (activeProfile?.id) {
      try {
        await fetch(`/api/v1/profiles/${activeProfile.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoScroll: enabled }),
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider uppercase text-gray-400">
          Chargement de KINOX...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Une erreur est survenue</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">{error}</p>
        <button
          onClick={loadHome}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 font-bold rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Réessayer</span>
        </button>
      </div>
    );
  }

  const brand = homeData?.brand || { siteName: "KINOX" };
  const heroTitle = homeData?.heroTitle;
  const sections = homeData?.sections || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white">
      {/* Barre de navigation supérieure */}
      <Navbar
        brandName={brand.siteName}
        user={userData}
        activeProfile={activeProfile}
        onProfileChange={(prof) => {
          setActiveProfile(prof);
          loadHome();
        }}
        autoScrollPreference={userAutoScroll}
        onToggleAutoScroll={handleToggleAutoScroll}
      />

      {/* Hero Banner grand format avec aperçu muet différé */}
      {heroTitle && (
        <HeroBanner
          title={heroTitle}
          onOpenDetails={(t) => setSelectedTitle(t)}
          allowAutoplayPreview={activeProfile?.autoPlayPreview ?? true}
        />
      )}

      {/* Sections d'accueil pilotées dynamiquement par le backend */}
      <main className="flex-1 -mt-16 sm:-mt-24 relative z-20 space-y-4 pb-12">
        {sections.map((sec: any) => (
          <ContentRow
            key={sec.id}
            title={sec.title}
            items={sec.items}
            onOpenDetails={(t) => setSelectedTitle(t)}
            aspectRatio={sec.type === "CONTINUE_WATCHING" ? "landscape" : "poster"}
            autoScrollConfig={sec.autoScrollEnabled}
            userAutoScrollPreference={userAutoScroll}
            myListIds={myListIds}
            onToggleMyList={handleToggleMyList}
          />
        ))}

        {sections.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Aucune section de contenu configurée pour le moment.</p>
          </div>
        )}
      </main>

      {/* Modale d'informations détaillées accessible */}
      {selectedTitle && (
        <QuickViewModal
          title={selectedTitle}
          onClose={() => setSelectedTitle(null)}
          isInMyList={myListIds.has(selectedTitle.id)}
          onToggleMyList={handleToggleMyList}
        />
      )}

      {/* Pied de page */}
      <Footer brandName={brand.siteName} />
    </div>
  );
}
