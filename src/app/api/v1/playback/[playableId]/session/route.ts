import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { playableId: string } }
) {
  try {
    const { playableId } = params;

    // Récupérer le titre ou l'épisode
    const title = await prisma.title.findUnique({
      where: { id: playableId },
      include: {
        timedSegments: true,
        seasons: {
          include: {
            episodes: { orderBy: { episodeNumber: "asc" } },
          },
          orderBy: { seasonNumber: "asc" },
        },
        episodes: { orderBy: { episodeNumber: "asc" } },
      },
    });

    if (!title || !title.isPublished) {
      return NextResponse.json({ error: "Flux vidéo indisponible ou non publié." }, { status: 404 });
    }

    // Progression actuelle pour ce profil si connecté
    const cookieStore = cookies();
    const token =
      cookieStore.get("kinox_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");
    const session = token ? verifyToken(token) : null;

    let resumePositionSeconds = 0;
    if (session?.profileId) {
      const prog = await prisma.watchProgress.findUnique({
        where: {
          profileId_titleId: {
            profileId: session.profileId,
            titleId: title.id,
          },
        },
      });
      if (prog && !prog.completed) {
        resumePositionSeconds = prog.positionSeconds;
      }
    }

    // Trouver l'épisode suivant si c'est une série
    let nextEpisode = null;
    if (title.type === "SERIES" && title.seasons.length > 0) {
      const allEpisodes = title.seasons.flatMap((s) => s.episodes);
      if (allEpisodes.length > 1) {
        nextEpisode = allEpisodes[1]; // Proposition de l'épisode suivant
      }
    }

    return NextResponse.json({
      title: {
        id: title.id,
        name: title.name,
        slug: title.slug,
        type: title.type,
        posterUrl: title.posterUrl,
        bannerUrl: title.bannerUrl,
        maturityRating: title.maturityRating,
        hlsManifestUrl: title.hlsManifestUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        mp4FallbackUrl: title.mp4FallbackUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        audioLanguages: JSON.parse(title.audioLanguages || "[]"),
        subtitleLanguages: JSON.parse(title.subtitleLanguages || "[]"),
      },
      timedSegments: title.timedSegments,
      resumePositionSeconds,
      nextEpisode,
    });
  } catch (error) {
    console.error("Playback session error:", error);
    return NextResponse.json({ error: "Erreur d'initialisation de la session de lecture." }, { status: 500 });
  }
}
