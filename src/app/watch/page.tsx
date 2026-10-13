"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

function WatchPlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const titleId = searchParams.get("id") || "t-1";

  const [playbackData, setPlaybackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!titleId) return;

    setLoading(true);
    setError(null);

    // 1. Si c'est un titre TMDB (ex: tmdb-533535)
    if (titleId.startsWith("tmdb-")) {
      const tmdbId = titleId.replace("tmdb-", "");
      const TMDB_KEY = "4e44d9029b1270a757cddc766a1bcb63";
      const savedLang = typeof window !== "undefined" ? localStorage.getItem("kinox_lang") || "fr-FR" : "fr-FR";

      Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_KEY}&language=${savedLang}`)
          .then((r) => r.json())
          .catch(() => null),
        fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_KEY}&language=${savedLang}`)
          .then((r) => r.json())
          .catch(() => null),
      ])
        .then(([movieData, videoData]) => {
          let trailerKey = videoData?.results?.find(
            (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
          )?.key;

          // Si pas de bande-annonce FR, chercher en VO anglais
          if (!trailerKey) {
            fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_KEY}&language=en-US`)
              .then((r) => r.json())
              .then((enVideoData) => {
                const enTrailer = enVideoData?.results?.find(
                  (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
                )?.key;
                setPlaybackData({
                  title: {
                    id: titleId,
                    name: movieData?.title || "Film KINOX",
                    slug: titleId,
                    type: "MOVIE",
                    youtubeTrailerKey: enTrailer || "KT-8QL04x40",
                    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                    mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                    audioLanguages: ["Français", "Anglais"],
                    subtitleLanguages: ["Français", "Anglais"],
                  },
                  timedSegments: [],
                  resumePositionSeconds: 0,
                });
                setLoading(false);
              })
              .catch(() => {
                setLoading(false);
              });
            return;
          }

          setPlaybackData({
            title: {
              id: titleId,
              name: movieData?.title || "Film KINOX",
              slug: titleId,
              type: "MOVIE",
              youtubeTrailerKey: trailerKey,
              hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
              mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
              audioLanguages: ["Français", "Anglais"],
              subtitleLanguages: ["Français", "Anglais"],
            },
            timedSegments: [],
            resumePositionSeconds: 0,
          });
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
      return;
    }

    // 2. Si c'est un titre standard du catalogue local
    fetch(`/api/v1/playback/${titleId}/session`, { method: "POST" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Contenu non trouvé.");
        return res.json();
      })
      .then((data) => {
        setPlaybackData(data);
        setLoading(false);
      })
      .catch(async () => {
        // Fallback local mockData
        const { MOCK_TITLES } = await import("@/lib/mockData");
        const found =
          MOCK_TITLES.find((t) => t.id === titleId || t.slug === titleId) || MOCK_TITLES[0];
        setPlaybackData({
          title: found,
          timedSegments: found.timedSegments || [],
          resumePositionSeconds: 0,
        });
        setLoading(false);
      });
  }, [titleId]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-black uppercase tracking-widest text-gray-400">
          Chargement du flux KINOX Haute Définition...
        </p>
      </div>
    );
  }

  if (error || !playbackData) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Erreur de lecture</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">{error || "Vidéo momentanément indisponible."}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 font-bold rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 font-semibold rounded-lg transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <VideoPlayer
      titleId={titleId}
      playbackData={playbackData}
      onBack={() => router.push("/")}
    />
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen bg-black flex items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WatchPlayerContent />
    </Suspense>
  );
}
