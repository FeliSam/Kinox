import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function getAuthUser(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("kinox_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const payload = verifyToken(token);
  return payload;
}

export async function GET(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    // If not authenticated, return demo public profile list for preview
    const demo = await prisma.profile.findMany({ take: 2 });
    return NextResponse.json({ profiles: demo });
  }

  const profiles = await prisma.profile.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, avatar, maturityRating, autoScroll, autoScrollSpeed } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Le nom du profil est requis." }, { status: 400 });
    }

    const count = await prisma.profile.count({ where: { userId: auth.userId } });
    if (count >= 5) {
      return NextResponse.json({ error: "Limite de 5 profils atteinte pour ce compte." }, { status: 400 });
    }

    const newProfile = await prisma.profile.create({
      data: {
        userId: auth.userId,
        name: name.trim(),
        avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        maturityRating: maturityRating || "18+",
        autoScroll: !!autoScroll,
        autoScrollSpeed: autoScrollSpeed ? Number(autoScrollSpeed) : 30,
      },
    });

    return NextResponse.json({ success: true, profile: newProfile });
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du profil." }, { status: 500 });
  }
}
