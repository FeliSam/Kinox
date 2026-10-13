import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email valide et mot de passe de minimum 6 caractères requis." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "Cette adresse email est déjà utilisée." }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        profiles: {
          create: {
            name: name?.trim() || "Profil Principal",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            language: "fr",
            maturityRating: "18+",
          },
        },
      },
      include: {
        profiles: true,
      },
    });

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      profileId: user.profiles[0]?.id,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profiles: user.profiles,
      },
      token,
    });

    response.cookies.set({
      name: "kinox_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la création du compte." }, { status: 500 });
  }
}
