// OMDb API Integration for IMDb ratings, Rotten Tomatoes scores & awards

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || "e8ba3365";
const OMDB_BASE_URL = "https://www.omdbapi.com";

export interface OmdbMovieData {
  Title?: string;
  Year?: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID?: string;
  Type?: string;
  BoxOffice?: string;
  Response?: string;
  Error?: string;
}

export async function fetchOmdbByImdbId(imdbId: string): Promise<OmdbMovieData | null> {
  if (!imdbId) return null;
  try {
    const res = await fetch(`${OMDB_BASE_URL}/?i=${encodeURIComponent(imdbId)}&apikey=${OMDB_API_KEY}`);
    const data = await res.json();
    if (data.Response === "True") return data;
    return null;
  } catch (err) {
    console.error("OMDb fetch error:", err);
    return null;
  }
}

export async function fetchOmdbByTitle(title: string, year?: string | number): Promise<OmdbMovieData | null> {
  if (!title) return null;
  try {
    let url = `${OMDB_BASE_URL}/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
    if (year) url += `&y=${year}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.Response === "True") return data;
    return null;
  } catch (err) {
    console.error("OMDb fetch error by title:", err);
    return null;
  }
}

/**
 * Extrait le score Rotten Tomatoes et IMDb sous forme lisible
 */
export function extractScores(omdbData?: OmdbMovieData | null) {
  if (!omdbData) return { imdb: null, rottenTomatoes: null, metascore: null, awards: null };

  const rtRating = omdbData.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value;
  const metascore = omdbData.Metascore && omdbData.Metascore !== "N/A" ? `${omdbData.Metascore}/100` : null;
  const imdb = omdbData.imdbRating && omdbData.imdbRating !== "N/A" ? `★ ${omdbData.imdbRating}/10` : null;
  const awards = omdbData.Awards && omdbData.Awards !== "N/A" ? omdbData.Awards : null;

  return {
    imdb,
    rottenTomatoes: rtRating || null,
    metascore,
    awards,
  };
}
