"use client";

import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import QuickViewModal from "@/components/QuickViewModal";
import Footer from "@/components/Footer";
import { Film, AlertTriangle, RefreshCw } from "lucide-react";
import { getLiveCatalog } from "@/lib/tmdb";

export default function HomePage() {
  const [homeData, setHomeData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [myListIds, setMyListIds] = useState<Set<string>>(new Set());
  const [selectedTitle, setSelectedTitle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Langue active (Français par défaut, commutable en Anglais)
  const [currentLang, setCurrentLang] = useState<"fr-FR" | "en-US">("fr-FR");

  // Préférence utilisateur pour le défilement horizontal automatique lent
  const [userAutoScroll, setUserAutoScroll] = useState(false);

  // Initialisation de la langue depuis le navigateur ou localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("kinox_lang");
      if (savedLang === "en-US" || savedLang === "fr-FR") {
        setCurrentLang(savedLang);
      }
    }
  }, []);

  // Charger le catalogue en direct (150+ films TMDB officiel + profil + Ma Liste)
  const loadHome = useCallback(async (langToLoad: "fr-FR" | "en-US" = currentLang) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Essai de chargement depuis l'API locale si disponible
      let feedData: any = null;
      try {
        const resFeed = await fetch(`/api/v1/tmdb/feed?lang=${langToLoad}`);
        if (resFeed.ok) {
          feedData = await resFeed.json();
        }
      } catch (e) {
        // Fallback sur le service direct
      }

      // 2. Si sur GitHub Pages ou fallback, charger directement via getLiveCatalog
      if (!feedData || !feedData.sections || feedData.sections.length < 5) {
        feedData = await getLiveCatalog(langToLoad);
      }

      setHomeData({
        brand: { siteName: "KINOX" },
        heroTitles: feedData.heroTitles || [],
        heroTitle: feedData.heroTitles?.[0] || null,
        sections: feedData.sections || [],
      });

      // Charger l'état utilisateur et Ma Liste
      try {
        const [resMe, resList] = await Promise.all([
          fetch("/api/v1/me").catch(() => null),
          fetch("/api/v1/my-list").catch(() => null),
        ]);
        if (resMe?.ok) {
          const dataMe = await resMe.json();
          setUserData(dataMe.user);
          setActiveProfile(dataMe.profile);
        }
        if (resList?.ok) {
          const dataList = await resList.json();
          if (dataList.items) setMyListIds(new Set(dataList.items.map((it: any) => it.id)));
        }
      } catch (e) {
        // Fallback localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("kinox_my_list");
          if (stored) setMyListIds(new Set(JSON.parse(stored)));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur de chargement du catalogue.");
    } finally {
      setLoading(false);
    }
  }, [currentLang]);

  useEffect(() => {
    loadHome(currentLang);
  }, [loadHome, currentLang]);

  // Changer de langue (FR / EN)
  const handleLanguageChange = (newLang: "fr-FR" | "en-US") => {
    setCurrentLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("kinox_lang", newLang);
    }
    loadHome(newLang);
  };

  // Ajouter / Supprimer de Ma Liste avec persistance
  const handleToggleMyList = async (titleId: string): Promise<boolean> => {
    const isCurrentlyInList = myListIds.has(titleId);
    const next = new Set(myListIds);
    if (isCurrentlyInList) next.delete(titleId);
    else next.add(titleId);
    setMyListIds(next);

    if (typeof window !== "undefined") {
      localStorage.setItem("kinox_my_list", JSON.stringify(Array.from(next)));
    }

    try {
      await fetch(`/api/v1/my-list/${titleId}`, {
        method: isCurrentlyInList ? "DELETE" : "POST",
      });
    } catch (e) {}

    return !isCurrentlyInList;
  };

  const handleToggleAutoScroll = async (enabled: boolean) => {
    setUserAutoScroll(enabled);
    if (activeProfile?.id) {
      try {
        await fetch(`/api/v1/profiles/${activeProfile.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoScroll: enabled }),
        });
      } catch (e) {}
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-extrabold tracking-widest uppercase text-gray-400">
          Chargement du flux KINOX • {currentLang === "fr-FR" ? "Français" : "English"}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Erreur de chargement</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">{error}</p>
        <button
          onClick={() => loadHome(currentLang)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 font-bold rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Réessayer</span>
        </button>
      </div>
    );
  }

  const brand = homeData?.brand || { siteName: "KINOX" };
  const heroTitles = homeData?.heroTitles || (homeData?.heroTitle ? [homeData.heroTitle] : []);
  const sections = homeData?.sections || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white overflow-x-hidden">
      {/* Navigation KINOX avec sélecteur de langue bilingue FR/EN */}
      <Navbar
        brandName={brand.siteName}
        user={userData}
        activeProfile={activeProfile}
        onProfileChange={(prof) => {
          setActiveProfile(prof);
          loadHome(currentLang);
        }}
        autoScrollPreference={userAutoScroll}
        onToggleAutoScroll={handleToggleAutoScroll}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
      />

      {/* Hero Banner Carrousel Dynamique façon Netflix (Top 5 en rotation continue) */}
      {heroTitles.length > 0 && (
        <HeroBanner
          titles={heroTitles}
          onOpenDetails={(t) => setSelectedTitle(t)}
          allowAutoplayPreview={activeProfile?.autoPlayPreview ?? true}
        />
      )}

      {/* Rangées de Contenus (Top 10 Netflix, Tendances, Séries, Nouveautés, etc.) */}
      <main className="flex-1 -mt-16 sm:-mt-24 relative z-20 space-y-6 pb-16">
        {sections.map((sec: any) => (
          <ContentRow
            key={sec.id}
            title={sec.title}
            type={sec.type}
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

      {/* Fiche d'information QuickViewModal enrichie avec bande-annonce YouTube et casting */}
      {selectedTitle && (
        <QuickViewModal
          title={selectedTitle}
          onClose={() => setSelectedTitle(null)}
          isInMyList={myListIds.has(selectedTitle.id)}
          onToggleMyList={handleToggleMyList}
          currentLang={currentLang}
        />
      )}

      <Footer brandName={brand.siteName} />
    </div>
  );
}
