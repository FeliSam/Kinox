import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token =
      cookieStore.get("kinox_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: params.id },
    });

    if (!profile || profile.userId !== payload.userId) {
      return NextResponse.json({ error: "Profil introuvable ou accès refusé." }, { status: 403 });
    }

    const body = await request.json();
    const updated = await prisma.profile.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.avatar && { avatar: body.avatar }),
        ...(body.maturityRating && { maturityRating: body.maturityRating }),
        ...(typeof body.autoPlayNext === "boolean" && { autoPlayNext: body.autoPlayNext }),
        ...(typeof body.autoPlayPreview === "boolean" && { autoPlayPreview: body.autoPlayPreview }),
        ...(typeof body.autoScroll === "boolean" && { autoScroll: body.autoScroll }),
        ...(typeof body.autoScrollSpeed === "number" && { autoScrollSpeed: body.autoScrollSpeed }),
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du profil." }, { status: 500 });
  }
}
