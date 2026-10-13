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
      return NextResponse.json({ progress: [] });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ progress: [] });
    }

    let profileId = payload.profileId;
    if (!profileId) {
      const p = await prisma.profile.findFirst({ where: { userId: payload.userId } });
      profileId = p?.id;
    }

    if (!profileId) {
      return NextResponse.json({ progress: [] });
    }

    const progressItems = await prisma.watchProgress.findMany({
      where: {
        profileId,
        completed: false,
      },
      include: {
        title: {
          include: { genres: { include: { genre: true } } },
        },
        episode: true,
      },
      orderBy: { lastWatchedAt: "desc" },
    });

    return NextResponse.json({ progress: progressItems });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
