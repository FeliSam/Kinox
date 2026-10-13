import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      include: {
        _count: {
          select: { titles: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ genres });
  } catch (error) {
    console.error("Genres error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
