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

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  const titles = await prisma.title.findMany({
    include: {
      genres: { include: { genre: true } },
      seasons: { include: { episodes: true } },
      mediaAssets: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ titles });
}

export async function POST(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      synopsis,
      type,
      releaseYear,
      maturityRating,
      posterUrl,
      bannerUrl,
      trailerUrl,
      hlsManifestUrl,
      mp4FallbackUrl,
      featured,
      isPublished,
      genreIds,
    } = body;

    if (!name?.trim() || !synopsis?.trim()) {
      return NextResponse.json({ error: "Le titre et le synopsis sont requis." }, { status: 400 });
    }

    // Slug generation
    const slugBase = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const newTitle = await prisma.title.create({
      data: {
        name: name.trim(),
        slug,
        synopsis: synopsis.trim(),
        type: type || "MOVIE",
        releaseYear: Number(releaseYear) || new Date().getFullYear(),
        maturityRating: maturityRating || "12+",
        posterUrl: posterUrl || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
        bannerUrl: bannerUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
        trailerUrl: trailerUrl || null,
        hlsManifestUrl: hlsManifestUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        mp4FallbackUrl: mp4FallbackUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        featured: !!featured,
        isPublished: isPublished !== false,
      },
    });

    if (Array.isArray(genreIds) && genreIds.length > 0) {
      await prisma.titleGenre.createMany({
        data: genreIds.map((gid: string) => ({
          titleId: newTitle.id,
          genreId: gid,
        })),
      });
    }

    await prisma.adminAuditLog.create({
      data: {
        userId: admin.userId,
        action: "TITLE_CREATED",
        target: newTitle.id,
        metadata: JSON.stringify({ name: newTitle.name, slug: newTitle.slug }),
      },
    });

    return NextResponse.json({ success: true, title: newTitle });
  } catch (error) {
    console.error("Admin create title error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du titre." }, { status: 500 });
  }
}
