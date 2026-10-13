import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // MOVIE, SERIES, DOCUMENTARY
    const genre = searchParams.get("genre");
    const limit = Math.min(Number(searchParams.get("limit")) || 24, 50);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const where: any = { isPublished: true };
    if (type) where.type = type.toUpperCase();
    if (genre) {
      where.genres = {
        some: {
          genre: { slug: genre.toLowerCase() },
        },
      };
    }

    const [titles, total] = await Promise.all([
      prisma.title.findMany({
        where,
        include: {
          genres: { include: { genre: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ ratingScore: "desc" }, { releaseYear: "desc" }],
      }),
      prisma.title.count({ where }),
    ]);

    return NextResponse.json({
      titles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Titles error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement des titres." }, { status: 500 });
  }
}
