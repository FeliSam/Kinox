import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function verifyAdmin(request: Request) {
  const cookieStore = cookies();
  const token =
    cookieStore.get("kinox_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function GET() {
  const settings = await prisma.siteBrandSetting.findUnique({
    where: { id: "singleton" },
  });

  return NextResponse.json({
    settings: settings || {
      siteName: "KINOX",
      tagline: "Le streaming cinématographique haute fidélité",
      logoText: "KINOX",
      accentColor: "#E50914",
      secondaryColor: "#F59E0B",
    },
  });
}

export async function PUT(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé. Rôle administrateur requis." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { siteName, tagline, logoText, logoUrl, accentColor, secondaryColor, footerLinks } = body;

    const updated = await prisma.siteBrandSetting.upsert({
      where: { id: "singleton" },
      update: {
        ...(siteName && { siteName: siteName.trim() }),
        ...(tagline && { tagline: tagline.trim() }),
        ...(logoText && { logoText: logoText.trim() }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(accentColor && { accentColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(footerLinks && { footerLinks: typeof footerLinks === "string" ? footerLinks : JSON.stringify(footerLinks) }),
      },
      create: {
        id: "singleton",
        siteName: siteName?.trim() || "KINOX",
        tagline: tagline?.trim() || "Le streaming cinématographique haute fidélité",
        logoText: logoText?.trim() || "KINOX",
        accentColor: accentColor || "#E50914",
        secondaryColor: secondaryColor || "#F59E0B",
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        userId: admin.userId,
        action: "SETTINGS_UPDATED",
        target: "siteBrandSetting",
        metadata: JSON.stringify({ siteName: updated.siteName, accentColor: updated.accentColor }),
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour des paramètres." }, { status: 500 });
  }
}
