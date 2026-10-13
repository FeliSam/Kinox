// KINOX - Service Officiel TMDB (The Movie Database)
// Support bilingue Français (fr-FR) et Anglais (en-US) avec mise à jour continue

const TMDB_API_KEY = process.env.TMDB_API_KEY || "4e44d9029b1270a757cddc766a1bcb63";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface TMDBMedia {
  id: string | number;
  tmdbId: number;
  name: string;
  originalName?: string;
  slug: string;
  synopsis: string;
  type: "MOVIE" | "SERIES";
  releaseYear: number;
  maturityRating: string;
  ratingScore: number;
  matchScore: number;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl?: string;
  youtubeTrailerKey?: string;
  hlsManifestUrl?: string;
  mp4FallbackUrl?: string;
  genres: string[];
  durationMinutes?: number;
  seasonsCount?: number;
  cast?: string[];
  director?: string;
  topRank?: number;
}

// Cache en mémoire pour réduire la latence
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${query.toString()}`;
  const now = Date.now();
  const cached = cache.get(url);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();
    cache.set(url, { timestamp: now, data });
    return data;
  } catch (err) {
    console.error(`TMDB fetch error on ${endpoint}:`, err);
    return null;
  }
}

// Mapper un résultat brut TMDB vers un objet KINOX Media
export function formatTMDBItem(item: any, type: "MOVIE" | "SERIES" = "MOVIE", rank?: number): TMDBMedia {
  const isMovie = type === "MOVIE" || item.media_type === "movie" || !!item.title;
  const name = item.title || item.name || "Titre inconnu";
  const releaseDate = item.release_date || item.first_air_date || "2025";
  const releaseYear = parseInt(releaseDate.split("-")[0]) || 2025;
  const voteAverage = item.vote_average ? Math.round(item.vote_average * 10) / 10 : 8.5;

  // Calcul d'un "score de recommandation" façon Netflix (ex: 98% compatible)
  const matchScore = Math.min(99, Math.max(78, Math.round(voteAverage * 10) + (item.vote_count > 500 ? 5 : 0)));

  const posterPath = item.poster_path
    ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}`
    : "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80";

  const bannerPath = item.backdrop_path
    ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}`
    : posterPath;

  const slugBase = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Genres de base mappés
  const genreNames = Array.isArray(item.genres)
    ? item.genres.map((g: any) => g.name)
    : ["Cinéma", isMovie ? "Action" : "Série"];

  return {
    id: `tmdb-${item.id}`,
    tmdbId: item.id,
    name,
    originalName: item.original_title || item.original_name,
    slug: `${slugBase}-${item.id}`,
    synopsis: item.overview || "Synopsis non communiqué pour cette œuvre dans la langue choisie.",
    type: isMovie ? "MOVIE" : "SERIES",
    releaseYear,
    maturityRating: item.adult ? "18+" : voteAverage >= 8 ? "16+" : "12+",
    ratingScore: voteAverage,
    matchScore,
    posterUrl: posterPath,
    bannerUrl: bannerPath,
    genres: genreNames,
    topRank: rank,
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  };
}

// Récupérer la bande-annonce officielle YouTube (FR ou VO)
export async function getOfficialTrailerKey(tmdbId: number, type: "MOVIE" | "SERIES" = "MOVIE", lang = "fr-FR"): Promise<string | null> {
  const endpoint = type === "MOVIE" ? `/movie/${tmdbId}/videos` : `/tv/${tmdbId}/videos`;

  // 1. Essai dans la langue demandée (fr-FR)
  let data = await fetchFromTMDB(endpoint, { language: lang });
  let trailers = data?.results?.filter(
    (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );

  if (trailers && trailers.length > 0) {
    return trailers[0].key;
  }

  // 2. Si non trouvé, repli sur la version originale (en-US)
  if (lang !== "en-US") {
    data = await fetchFromTMDB(endpoint, { language: "en-US" });
    trailers = data?.results?.filter(
      (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    );
    if (trailers && trailers.length > 0) {
      return trailers[0].key;
    }
  }

  return null;
}

// Obtenir le catalogue complet en direct pour la page d'accueil Netflix (150+ films et séries)
export async function getLiveCatalog(lang: "fr-FR" | "en-US" = "fr-FR") {
  const [
    trendingMoviesData,
    trendingSeriesData,
    nowPlayingData,
    topRatedData,
    actionMoviesData,
    sciFiMoviesData,
    frenchBoxOfficeData,
    frenchComediesData,
    frenchThrillersData,
    frenchClassicsData,
    frenchAnimationData,
  ] = await Promise.all([
    fetchFromTMDB("/trending/movie/day", { language: lang }),
    fetchFromTMDB("/trending/tv/day", { language: lang }),
    fetchFromTMDB("/movie/now_playing", { language: lang, page: "1" }),
    fetchFromTMDB("/movie/top_rated", { language: lang, page: "1" }),
    fetchFromTMDB("/discover/movie", { language: lang, with_genres: "28", sort_by: "popularity.desc" }),
    fetchFromTMDB("/discover/movie", { language: lang, with_genres: "878", sort_by: "popularity.desc" }),
    fetchFromTMDB("/discover/movie", { language: lang, with_original_language: "fr", sort_by: "popularity.desc", page: "1" }),
    fetchFromTMDB("/discover/movie", { language: lang, with_original_language: "fr", with_genres: "35", sort_by: "popularity.desc" }),
    fetchFromTMDB("/discover/movie", { language: lang, with_original_language: "fr", with_genres: "53", sort_by: "popularity.desc" }),
    fetchFromTMDB("/discover/movie", { language: lang, with_original_language: "fr", sort_by: "vote_average.desc", "vote_count.gte": "150" }),
    fetchFromTMDB("/discover/movie", { language: lang, with_genres: "16", region: "FR", sort_by: "popularity.desc" }),
  ]);

  const trendingMovies: TMDBMedia[] = (trendingMoviesData?.results || [])
    .slice(0, 10)
    .map((item: any, idx: number) => formatTMDBItem(item, "MOVIE", idx + 1));

  const trendingSeries: TMDBMedia[] = (trendingSeriesData?.results || [])
    .slice(0, 10)
    .map((item: any, idx: number) => formatTMDBItem(item, "SERIES", idx + 1));

  const nowPlaying: TMDBMedia[] = (nowPlayingData?.results || [])
    .slice(0, 15)
    .map((item: any) => formatTMDBItem(item, "MOVIE"));

  const topRated: TMDBMedia[] = (topRatedData?.results || [])
    .slice(0, 15)
    .map((item: any) => formatTMDBItem(item, "MOVIE"));

  const actionMovies: TMDBMedia[] = (actionMoviesData?.results || [])
    .slice(0, 15)
    .map((item: any) => formatTMDBItem(item, "MOVIE"));

  const sciFiMovies: TMDBMedia[] = (sciFiMoviesData?.results || [])
    .slice(0, 15)
    .map((item: any) => formatTMDBItem(item, "MOVIE"));

  const frenchBoxOffice: TMDBMedia[] = (frenchBoxOfficeData?.results || [])
    .slice(0, 18)
    .map((item: any) => formatTMDBItem(item, "MOVIE"));

  const frenchComedies: TMDBMedia[] = (frenchComediesData?.results || [])
    .slice(0, 18)
    .map((item: any) => formatTMDBItem(item, "MOVIE"));

  const frenchThrillers: TMDBMedia[] = (frenchThrillersData?.results || [])
    .slice(0, 18)
    .map((item: any) => formatTMDBItem(item, "MOVIE"));

  const frenchClassics: TMDBMedia[] = (frenchClassicsData?.results || [])
    .slice(0, 18)
    .map((item: any) => formatTMDBItem(item, "MOVIE"));

  const frenchAnimation: TMDBMedia[] = (frenchAnimationData?.results || [])
    .slice(0, 18)
    .map((item: any) => formatTMDBItem(item, "MOVIE"));

  // Les 5 titres phares pour le carrousel Hero Banner dynamique
  const heroTitles = trendingMovies.slice(0, 5);

  return {
    heroTitles,
    sections: [
      {
        id: "top-10-movies",
        title: lang === "fr-FR" ? "Top 10 des films en France aujourd'hui" : "Top 10 Movies Today",
        type: "TOP_10",
        items: trendingMovies,
        autoScrollEnabled: false,
      },
      {
        id: "french-box-office",
        title: lang === "fr-FR" ? "🇫🇷 Cinéma Français — Les plus grands succès" : "French Cinema Hits",
        type: "TRENDING",
        items: frenchBoxOffice,
        autoScrollEnabled: true,
      },
      {
        id: "trending-now",
        title: lang === "fr-FR" ? "Tendances internationales en VF" : "Trending Now",
        type: "TRENDING",
        items: trendingMovies.slice(0, 12),
        autoScrollEnabled: true,
      },
      {
        id: "french-comedies",
        title: lang === "fr-FR" ? "🇫🇷 Comédies Françaises populaires & cultes" : "Popular French Comedies",
        type: "GENRE",
        items: frenchComedies,
        autoScrollEnabled: false,
      },
      {
        id: "popular-series",
        title: lang === "fr-FR" ? "Séries incontournables (VF / VOST)" : "Popular TV Shows",
        type: "SERIES",
        items: trendingSeries,
        autoScrollEnabled: false,
      },
      {
        id: "french-thrillers",
        title: lang === "fr-FR" ? "🇫🇷 Polars & Thrillers français" : "French Crime & Thrillers",
        type: "GENRE",
        items: frenchThrillers,
        autoScrollEnabled: false,
      },
      {
        id: "now-playing",
        title: lang === "fr-FR" ? "Nouveautés & Sorties récentes au cinéma" : "New Releases in Theaters",
        type: "RECENT",
        items: nowPlaying,
        autoScrollEnabled: false,
      },
      {
        id: "french-classics",
        title: lang === "fr-FR" ? "🇫🇷 Chefs-d'œuvre du cinéma français" : "French Cinema Masterpieces",
        type: "RECOMMENDED",
        items: frenchClassics,
        autoScrollEnabled: false,
      },
      {
        id: "action-blockbusters",
        title: lang === "fr-FR" ? "Films d'action et d'adrénaline" : "Action & Thrillers",
        type: "GENRE",
        items: actionMovies,
        autoScrollEnabled: false,
      },
      {
        id: "french-animation",
        title: lang === "fr-FR" ? "Animation & Famille en Français" : "Animation & Family in French",
        type: "GENRE",
        items: frenchAnimation,
        autoScrollEnabled: false,
      },
      {
        id: "sci-fi-dystopia",
        title: lang === "fr-FR" ? "Science-Fiction & Mondes Futuristes" : "Sci-Fi & Cyberpunk",
        type: "GENRE",
        items: sciFiMovies,
        autoScrollEnabled: false,
      },
      {
        id: "critically-acclaimed",
        title: lang === "fr-FR" ? "Les chefs-d'œuvre les mieux notés" : "Critically Acclaimed",
        type: "RECOMMENDED",
        items: topRated,
        autoScrollEnabled: false,
      },
    ],
  };
}

// Récupérer plus de 100 films français avec pagination pour la page Cinéma Français
export async function getFrenchCinemaCatalog(page = 1, genre = "all", lang: "fr-FR" | "en-US" = "fr-FR") {
  const genreMap: Record<string, string> = {
    comedie: "35",
    action: "28",
    thriller: "53",
    drame: "18",
    animation: "16",
    romance: "10749",
  };

  const params: Record<string, string> = {
    language: lang,
    with_original_language: "fr",
    sort_by: "popularity.desc",
    page: String(page),
  };

  if (genre !== "all" && genreMap[genre]) {
    params.with_genres = genreMap[genre];
  }

  // Si l'utilisateur demande page 1, nous pouvons agréger plusieurs pages pour lui fournir plus de 100 films d'un coup !
  const [p1, p2, p3, p4, p5] = await Promise.all([
    fetchFromTMDB("/discover/movie", { ...params, page: "1" }),
    fetchFromTMDB("/discover/movie", { ...params, page: "2" }),
    fetchFromTMDB("/discover/movie", { ...params, page: "3" }),
    fetchFromTMDB("/discover/movie", { ...params, page: "4" }),
    fetchFromTMDB("/discover/movie", { ...params, page: "5" }),
  ]);

  const allRaw = [
    ...(p1?.results || []),
    ...(p2?.results || []),
    ...(p3?.results || []),
    ...(p4?.results || []),
    ...(p5?.results || []),
  ];

  // Déduplication par ID
  const seen = new Set<number>();
  const uniqueItems: TMDBMedia[] = [];

  for (const item of allRaw) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      uniqueItems.push(formatTMDBItem(item, "MOVIE"));
    }
  }

  return {
    items: uniqueItems,
    totalCount: uniqueItems.length,
    totalPages: p1?.total_pages || 10,
  };
}

// Recherche instantanée TMDB
export async function searchTMDB(query: string, lang: "fr-FR" | "en-US" = "fr-FR") {
  if (!query.trim()) return [];
  const data = await fetchFromTMDB("/search/multi", {
    language: lang,
    query: query.trim(),
    include_adult: "false",
  });

  return (data?.results || [])
    .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
    .map((item: any) => formatTMDBItem(item, item.media_type === "tv" ? "SERIES" : "MOVIE"));
}

// Fiche détaillée d'un titre avec casting et vidéos
export async function getTMDBDetails(tmdbId: number, type: "MOVIE" | "SERIES" = "MOVIE", lang: "fr-FR" | "en-US" = "fr-FR") {
  const endpoint = type === "MOVIE" ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
  const [details, credits, videos, similar] = await Promise.all([
    fetchFromTMDB(endpoint, { language: lang }),
    fetchFromTMDB(`${endpoint}/credits`, { language: lang }),
    fetchFromTMDB(`${endpoint}/videos`, { language: lang }),
    fetchFromTMDB(`${endpoint}/similar`, { language: lang }),
  ]);

  if (!details) return null;

  const base = formatTMDBItem(details, type);
  const trailerKey = await getOfficialTrailerKey(tmdbId, type, lang);

  const castList = (credits?.cast || []).slice(0, 8).map((c: any) => ({
    name: c.name,
    character: c.character,
    profileUrl: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : null,
  }));

  const similarItems = (similar?.results || []).slice(0, 9).map((s: any) => formatTMDBItem(s, type));

  return {
    ...base,
    youtubeTrailerKey: trailerKey,
    cast: castList,
    director: credits?.crew?.find((c: any) => c.job === "Director")?.name || null,
    similarTitles: similarItems,
    durationMinutes: details.runtime || details.episode_run_time?.[0] || 120,
    seasonsCount: details.number_of_seasons || 1,
    episodesCount: details.number_of_episodes || 10,
  };
}
