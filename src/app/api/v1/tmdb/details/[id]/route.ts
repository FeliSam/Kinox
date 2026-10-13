import { NextResponse } from "next/server";
import { getTMDBDetails } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get("lang") as "fr-FR" | "en-US") || "fr-FR";
    const type = (searchParams.get("type") as "MOVIE" | "SERIES") || "MOVIE";

    // Extraire le tmdbId numérique depuis "tmdb-12345" ou "12345"
    const rawId = params.id.replace("tmdb-", "");
    const tmdbId = parseInt(rawId);

    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: "Identifiant TMDB invalide." }, status(400));
    }

    const details = await getTMDBDetails(tmdbId, type, lang);
    if (!details) {
      return NextResponse.json({ error: "Titre non trouvé sur TMDB." }, { status: 404 });
    }

    return NextResponse.json({ success: true, details });
  } catch (error) {
    console.error("TMDB details error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
function status(arg0: number): { status: any; } | undefined {
  return { status: arg0 };
}
