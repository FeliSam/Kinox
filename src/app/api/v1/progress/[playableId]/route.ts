import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { playableId: string } }
) {
  try {
    const cookieStore = cookies();
    const token =
      cookieStore.get("kinox_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    let profileId = payload.profileId;
    if (!profileId) {
      const p = await prisma.profile.findFirst({ where: { userId: payload.userId } });
      profileId = p?.id;
    }

    if (!profileId) {
      return NextResponse.json({ error: "Profil manquant" }, { status: 400 });
    }

    const body = await request.json();
    const { positionSeconds, durationSeconds, completed, episodeId } = body;

    const titleId = params.playableId;

    const progress = await prisma.watchProgress.upsert({
      where: {
        profileId_titleId: {
          profileId,
          titleId,
        },
      },
      update: {
        positionSeconds: Number(positionSeconds) || 0,
        durationSeconds: Number(durationSeconds) || 0,
        completed: !!completed,
        episodeId: episodeId || null,
        lastWatchedAt: new Date(),
      },
      create: {
        profileId,
        titleId,
        episodeId: episodeId || null,
        positionSeconds: Number(positionSeconds) || 0,
        durationSeconds: Number(durationSeconds) || 0,
        completed: !!completed,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Save progress error:", error);
    return NextResponse.json({ error: "Erreur enregistrement progression." }, { status: 500 });
  }
}
