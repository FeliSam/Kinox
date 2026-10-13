import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token =
      cookieStore.get("kinox_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ items: [] });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ items: [] });
    }

    // Récupérer le profil actif
    let profileId = payload.profileId;
    if (!profileId) {
      const p = await prisma.profile.findFirst({ where: { userId: payload.userId } });
      profileId = p?.id;
    }

    if (!profileId) {
      return NextResponse.json({ items: [] });
    }

    const listItems = await prisma.myListItem.findMany({
      where: { profileId },
      include: {
        title: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json({
      items: listItems.map((item) => ({
        ...item.title,
        addedAt: item.addedAt,
      })),
    });
  } catch (error) {
    console.error("My List error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération de la liste." }, { status: 500 });
  }
}
