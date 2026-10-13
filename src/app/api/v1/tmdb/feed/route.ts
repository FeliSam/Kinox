import { NextResponse } from "next/server";
import { getLiveCatalog, searchTMDB } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get("lang") as "fr-FR" | "en-US") || "fr-FR";
    const query = searchParams.get("q");

    if (query) {
      const results = await searchTMDB(query, lang);
      return NextResponse.json({ results });
    }

    const catalog = await getLiveCatalog(lang);
    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      ...catalog,
    });
  } catch (error) {
    console.error("TMDB Feed Error:", error);
    return NextResponse.json({ error: "Erreur de récupération du flux TMDB." }, { status: 500 });
  }
}
