import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const type = searchParams.get("type"); // MOVIE, SERIES, DOCUMENTARY
    const genre = searchParams.get("genre");

    if (!q && !type && !genre) {
      return NextResponse.json({ results: [] });
    }

    const where: any = { isPublished: true };

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { synopsis: { contains: q } },
      ];
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    if (genre) {
      where.genres = {
        some: {
          genre: { slug: genre.toLowerCase() },
        },
      };
    }

    const results = await prisma.title.findMany({
      where,
      include: {
        genres: { include: { genre: true } },
      },
      take: 24,
      orderBy: [{ ratingScore: "desc" }, { releaseYear: "desc" }],
    });

    return NextResponse.json({ results, query: q, total: results.length });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Erreur lors de la recherche." }, { status: 500 });
  }
}
