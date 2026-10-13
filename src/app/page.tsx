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

  // Charger le catalogue en direct (TMDB officiel + profil + Ma Liste)
  const loadHome = useCallback(async (langToLoad: "fr-FR" | "en-US" = currentLang) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Essai de chargement du flux TMDB officiel
      let feedData: any = null;
      try {
        const resFeed = await fetch(`/api/v1/tmdb/feed?lang=${langToLoad}`);
        if (resFeed.ok) {
          feedData = await resFeed.json();
        }
      } catch (e) {
        console.warn("Route serveur non disponible, bascule sur fetch TMDB direct...");
      }

      // 2. Si sur GitHub Pages (statique), fetch direct vers l'API TMDB officielle
      if (!feedData || !feedData.sections) {
        const TMDB_KEY = "4e44d9029b1270a757cddc766a1bcb63";
        const [resTrendingMovies, resTrendingTV] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_KEY}&language=${langToLoad}`).then((r) => r.json()),
          fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${TMDB_KEY}&language=${langToLoad}`).then((r) => r.json()),
        ]);

        const formatItem = (item: any, type: "MOVIE" | "SERIES", rank?: number) => ({
          id: `tmdb-${item.id}`,
          tmdbId: item.id,
          name: item.title || item.name,
          slug: (item.title || item.name || "").toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-"),
          synopsis: item.overview || "Synopsis officiel indisponible.",
          type,
          releaseYear: parseInt((item.release_date || item.first_air_date || "2025").split("-")[0]),
          ratingScore: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 8.5,
          matchScore: Math.min(99, Math.max(80, Math.round((item.vote_average || 8) * 10) + 5)),
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
          bannerUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          genres: ["Cinéma", type === "MOVIE" ? "Action" : "Série"],
          topRank: rank,
          trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
          hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        });

        const trendingMovies = (resTrendingMovies?.results || []).slice(0, 10).map((m: any, i: number) => formatItem(m, "MOVIE", i + 1));
        const trendingSeries = (resTrendingTV?.results || []).slice(0, 10).map((s: any, i: number) => formatItem(s, "SERIES", i + 1));

        feedData = {
          heroTitles: trendingMovies.slice(0, 5),
          sections: [
            {
              id: "top-10-movies",
              title: langToLoad === "fr-FR" ? "Top 10 des films en France aujourd'hui" : "Top 10 Movies in France Today",
              type: "TOP_10",
              items: trendingMovies,
              autoScrollEnabled: false,
            },
            {
              id: "trending-movies",
              title: langToLoad === "fr-FR" ? "Tendances actuelles" : "Trending Now",
              type: "TRENDING",
              items: trendingMovies,
              autoScrollEnabled: true,
            },
            {
              id: "trending-series",
              title: langToLoad === "fr-FR" ? "Séries les plus populaires" : "Popular TV Shows",
              type: "SERIES",
              items: trendingSeries,
              autoScrollEnabled: false,
            },
          ],
        };
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
