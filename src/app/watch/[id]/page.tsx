"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const titleId = params.id as string;

  const [playbackData, setPlaybackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!titleId) return;

    setLoading(true);
    fetch(`/api/v1/playback/${titleId}/session`, { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Impossible d'initialiser le flux vidéo.");
        }
        return res.json();
      })
      .then((data) => {
        setPlaybackData(data);
      })
      .catch(async (err) => {
        console.warn("API indisponible (GitHub Pages). Recherche dans le catalogue local...");
        const { MOCK_TITLES } = await import("@/lib/mockData");
        const found = MOCK_TITLES.find((t) => t.id === titleId || t.slug === titleId) || MOCK_TITLES[0];
        setPlaybackData({
          title: found,
          timedSegments: found.timedSegments || [],
          resumePositionSeconds: 0,
        });
      })
      .finally(() => setLoading(false));
  }, [titleId]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Chargement du flux haute fidélité...
        </p>
      </div>
    );
  }

  if (error || !playbackData) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Erreur de lecture</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">{error || "Contenu indisponible."}</p>
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
