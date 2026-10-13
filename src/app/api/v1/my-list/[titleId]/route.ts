import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function getActiveProfileId(request: Request): Promise<string | null> {
  const cookieStore = cookies();
  const token =
    cookieStore.get("kinox_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  if (payload.profileId) return payload.profileId;
  const p = await prisma.profile.findFirst({ where: { userId: payload.userId } });
  return p?.id || null;
}

export async function POST(
  request: Request,
  { params }: { params: { titleId: string } }
) {
  try {
    const profileId = await getActiveProfileId(request);
    if (!profileId) {
      return NextResponse.json({ error: "Connectez-vous pour ajouter ce titre à votre liste." }, { status: 401 });
    }

    const { titleId } = params;
    const titleExists = await prisma.title.findUnique({ where: { id: titleId } });
    if (!titleExists) {
      return NextResponse.json({ error: "Titre inexistant." }, { status: 404 });
    }

    // Upsert pour garantir l'absence absolue de doublon
    const item = await prisma.myListItem.upsert({
      where: {
        profileId_titleId: {
          profileId,
          titleId,
        },
      },
      update: { addedAt: new Date() },
      create: {
        profileId,
        titleId,
      },
    });

    return NextResponse.json({ success: true, item, inList: true });
  } catch (error) {
    console.error("Add my-list error:", error);
    return NextResponse.json({ error: "Erreur lors de l'ajout à la liste." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { titleId: string } }
) {
  try {
    const profileId = await getActiveProfileId(request);
    if (!profileId) {
      return NextResponse.json({ error: "Connectez-vous pour modifier votre liste." }, { status: 401 });
    }

    const { titleId } = params;

    await prisma.myListItem.deleteMany({
      where: {
        profileId,
        titleId,
      },
    });

    return NextResponse.json({ success: true, inList: false });
  } catch (error) {
    console.error("Delete my-list error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }
}
