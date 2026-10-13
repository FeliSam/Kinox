import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const title = await prisma.title.findUnique({
      where: { slug: params.slug },
      include: {
        genres: { include: { genre: true } },
        seasons: {
          include: {
            episodes: {
              orderBy: { episodeNumber: "asc" },
              include: { timedSegments: true },
            },
          },
          orderBy: { seasonNumber: "asc" },
        },
        episodes: {
          where: { seasonId: null },
          orderBy: { episodeNumber: "asc" },
        },
        timedSegments: true,
      },
    });

    if (!title || !title.isPublished) {
      return NextResponse.json({ error: "Contenu introuvable." }, { status: 404 });
    }

    // Récupérer les titres similaires ayant au moins un genre commun
    const genreIds = title.genres.map((g) => g.genreId);
    const similarTitles = await prisma.title.findMany({
      where: {
        id: { not: title.id },
        isPublished: true,
        genres: {
          some: {
            genreId: { in: genreIds },
          },
        },
      },
      include: {
        genres: { include: { genre: true } },
      },
      take: 6,
    });

    return NextResponse.json({
      title,
      similarTitles,
    });
  } catch (error) {
    console.error("Title slug error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
