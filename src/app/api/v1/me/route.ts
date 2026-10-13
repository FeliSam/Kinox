import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get("kinox_token")?.value;
    const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
    const token = tokenCookie || authHeader;

    if (!token) {
      return NextResponse.json({ user: null, profile: null });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null, profile: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profiles: true,
        subscriptions: {
          include: { plan: true },
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null, profile: null });
    }

    const activeProfile =
      user.profiles.find((p) => p.id === payload.profileId) || user.profiles[0] || null;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profiles: user.profiles,
        subscription: user.subscriptions[0] || null,
      },
      profile: activeProfile,
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
