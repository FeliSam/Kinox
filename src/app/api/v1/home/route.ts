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
    const session = token ? verifyToken(token) : null;

    // Récupérer le profil actif
    let activeProfileId: string | null = session?.profileId || null;
    if (session?.userId && !activeProfileId) {
      const p = await prisma.profile.findFirst({ where: { userId: session.userId } });
      activeProfileId = p?.id || null;
    }

    // Récupérer les paramètres de marque
    const brand = await prisma.siteBrandSetting.findUnique({ where: { id: "singleton" } });

    // Récupérer le titre hero vedette
    const heroTitle = await prisma.title.findFirst({
      where: { featured: true, isPublished: true },
      include: {
        genres: { include: { genre: true } },
        timedSegments: true,
      },
    });

    // Récupérer les sections d'accueil ordonnées
    const rawSections = await prisma.homeSection.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
    });

    const sections = [];

    for (const section of rawSections) {
      let items: any[] = [];

      switch (section.type) {
        case "CONTINUE_WATCHING":
          if (activeProfileId) {
            const progresses = await prisma.watchProgress.findMany({
              where: {
                profileId: activeProfileId,
                completed: false,
              },
              include: {
                title: {
                  include: {
                    genres: { include: { genre: true } },
                  },
                },
              },
              orderBy: { lastWatchedAt: "desc" },
              take: 12,
            });
            items = progresses.map((wp) => ({
              ...wp.title,
              watchProgress: {
                positionSeconds: wp.positionSeconds,
                durationSeconds: wp.durationSeconds,
                percentage:
                  wp.durationSeconds > 0
                    ? Math.round((wp.positionSeconds / wp.durationSeconds) * 100)
                    : 0,
              },
            }));
          }
          break;

        case "TRENDING":
          items = await prisma.title.findMany({
            where: { isPublished: true },
            orderBy: [{ ratingScore: "desc" }, { createdAt: "desc" }],
            include: { genres: { include: { genre: true } } },
            take: 12,
          });
          break;

        case "RECENT":
          items = await prisma.title.findMany({
            where: { isPublished: true },
            orderBy: [{ releaseYear: "desc" }, { createdAt: "desc" }],
            include: { genres: { include: { genre: true } } },
            take: 12,
          });
          break;

        case "GENRE":
          if (section.genreSlug) {
            items = await prisma.title.findMany({
              where: {
                isPublished: true,
                genres: {
                  some: {
                    genre: { slug: section.genreSlug },
                  },
                },
              },
              include: { genres: { include: { genre: true } } },
              take: 12,
            });
          }
          break;

        case "MY_LIST":
          if (activeProfileId) {
            const listItems = await prisma.myListItem.findMany({
              where: { profileId: activeProfileId },
              include: {
                title: {
                  include: { genres: { include: { genre: true } } },
                },
              },
              orderBy: { addedAt: "desc" },
              take: 12,
            });
            items = listItems.map((li) => li.title);
          }
          break;

        default:
          items = await prisma.title.findMany({
            where: { isPublished: true },
            include: { genres: { include: { genre: true } } },
            take: 10,
          });
      }

      // N'inclure les sections vides que si ce n'est pas CONTINUE_WATCHING ou MY_LIST
      if (items.length > 0 || (section.type !== "CONTINUE_WATCHING" && section.type !== "MY_LIST")) {
        sections.push({
          id: section.id,
          title: section.title,
          type: section.type,
          autoScrollEnabled: section.autoScrollEnabled,
          items,
        });
      }
    }

    return NextResponse.json({
      brand: brand || {
        siteName: "KINOX",
        tagline: "Le streaming cinématographique haute fidélité",
        logoText: "KINOX",
        accentColor: "#E50914",
      },
      heroTitle,
      sections,
    });
  } catch (error) {
    console.error("Home API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
