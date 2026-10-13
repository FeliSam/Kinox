import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("🎬 Démarrage du peuplement de la base de données KINOX...");

  // Nettoyage préalable
  await prisma.adminAuditLog.deleteMany();
  await prisma.watchEvent.deleteMany();
  await prisma.watchProgress.deleteMany();
  await prisma.myListItem.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.timedSegment.deleteMany();
  await prisma.playbackSource.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.titleGenre.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.title.deleteMany();
  await prisma.homeSection.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteBrandSetting.deleteMany();

  // 1. Paramètres de marque KINOX
  await prisma.siteBrandSetting.create({
    data: {
      id: "singleton",
      siteName: "KINOX",
      tagline: "Le streaming cinématographique haute fidélité",
      logoText: "KINOX",
      accentColor: "#E50914",
      secondaryColor: "#F59E0B",
      footerLinks: JSON.stringify([
        { label: "Centre d'aide", url: "/help" },
        { label: "Conditions d'utilisation", url: "/terms" },
        { label: "Confidentialité & Cookies", url: "/privacy" },
        { label: "Mentions légales", url: "/legal" },
        { label: "Contact", url: "/contact" }
      ]),
    },
  });

  // 2. Plans d'abonnement
  const planFree = await prisma.plan.create({
    data: {
      name: "KINOX Gratuit (Découverte)",
      slug: "free",
      price: 0.0,
      currency: "EUR",
      interval: "month",
      maxScreens: 1,
      maxQuality: "720p",
      hasAds: true,
      features: JSON.stringify(["Catalogue sélectionné", "Qualité HD 720p", "Accès sur 1 écran simultané"]),
    },
  });

  const planPremium = await prisma.plan.create({
    data: {
      name: "KINOX Cinéma 4K Ultra",
      slug: "premium-4k",
      price: 13.99,
      currency: "EUR",
      interval: "month",
      maxScreens: 4,
      maxQuality: "4K+HDR",
      hasAds: false,
      features: JSON.stringify(["Catalogue illimité sans publicité", "Ultra HD 4K, HDR & Dolby Atmos", "4 écrans simultanés", "Téléchargement hors-ligne"]),
    },
  });

  // 3. Utilisateurs et Profils de test
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@kinox.tv",
      passwordHash: hashPassword("Kinox2026!"),
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@kinox.tv",
      passwordHash: hashPassword("Kinox2026!"),
      role: "USER",
      status: "ACTIVE",
    },
  });

  const profileAlex = await prisma.profile.create({
    data: {
      userId: demoUser.id,
      name: "Alex",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      language: "fr",
      maturityRating: "18+",
      autoPlayNext: true,
      autoPlayPreview: true,
      autoScroll: false,
      autoScrollSpeed: 25,
    },
  });

  const profileEmma = await prisma.profile.create({
    data: {
      userId: demoUser.id,
      name: "Emma (Jeunesse)",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      language: "fr",
      maturityRating: "12+",
      autoPlayNext: true,
      autoPlayPreview: false,
      autoScroll: false,
      autoScrollSpeed: 20,
    },
  });

  // Abonnement actif pour le compte démo
  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      planId: planPremium.id,
      status: "ACTIVE",
      provider: "STRIPE_TEST",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });

  // 4. Genres
  const genreSciFi = await prisma.genre.create({ data: { name: "Science-Fiction", slug: "science-fiction" } });
  const genreAction = await prisma.genre.create({ data: { name: "Action", slug: "action" } });
  const genreAdventure = await prisma.genre.create({ data: { name: "Aventure", slug: "aventure" } });
  const genreAnimation = await prisma.genre.create({ data: { name: "Animation", slug: "animation" } });
  const genreDoc = await prisma.genre.create({ data: { name: "Documentaire", slug: "documentaire" } });
  const genreFantasy = await prisma.genre.create({ data: { name: "Fantastique", slug: "fantastique" } });
  const genreThriller = await prisma.genre.create({ data: { name: "Thriller", slug: "thriller" } });

  // 5. Titres & Médias autorisés (Open Movies Blender & Test HLS)
  const title1 = await prisma.title.create({
    data: {
      name: "Tears of Steel",
      slug: "tears-of-steel",
      synopsis: "Dans un futur dystopique à Amsterdam, un groupe de survivants et scientifiques tente de réparer le passé pour sauver la Terre d'une armée de robots destructeurs.",
      type: "MOVIE",
      releaseYear: 2024,
      maturityRating: "12+",
      featured: true,
      durationMinutes: 72,
      ratingScore: 9.2,
      posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      audioLanguages: JSON.stringify(["Français (5.1)", "Anglais (Original)"]),
      subtitleLanguages: JSON.stringify(["Français", "Anglais", "Allemand"]),
    },
  });
  await prisma.titleGenre.createMany({
    data: [
      { titleId: title1.id, genreId: genreSciFi.id },
      { titleId: title1.id, genreId: genreAction.id },
    ],
  });
  // Segment d'introduction pour tester "Passer l'intro"
  await prisma.timedSegment.create({
    data: {
      titleId: title1.id,
      type: "INTRO",
      startSeconds: 2.0,
      endSeconds: 16.0,
      label: "Passer l'introduction",
    },
  });

  const title2 = await prisma.title.create({
    data: {
      name: "Neon Horizon: 2084",
      slug: "neon-horizon-2084",
      synopsis: "Une inspectrice cybernétique traque une entité quantique rebelle infiltrant les flux neuronaux de la mégapole d'Onyx. Une série originale KINOX intense et visuellement époustouflante.",
      type: "SERIES",
      releaseYear: 2025,
      maturityRating: "16+",
      featured: true,
      ratingScore: 9.4,
      posterUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
  });
  await prisma.titleGenre.createMany({
    data: [
      { titleId: title2.id, genreId: genreSciFi.id },
      { titleId: title2.id, genreId: genreThriller.id },
    ],
  });
  // Saisons et Épisodes pour Neon Horizon
  const season1 = await prisma.season.create({
    data: {
      titleId: title2.id,
      seasonNumber: 1,
      name: "Saison 1 : Signal Zéro",
      synopsis: "Les premières anomalies du réseau commencent à se manifester dans les sous-sols de la ville.",
    },
  });
  const ep1 = await prisma.episode.create({
    data: {
      titleId: title2.id,
      seasonId: season1.id,
      episodeNumber: 1,
      name: "Épisode 1 : L'Éveil du Néon",
      synopsis: "Kira découvre un fragment de code crypté dans la puce mémorielle d'un agent déchu.",
      durationSeconds: 2700,
      thumbnailUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
      hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
  });
  const ep2 = await prisma.episode.create({
    data: {
      titleId: title2.id,
      seasonId: season1.id,
      episodeNumber: 2,
      name: "Épisode 2 : Fréquences Fantômes",
      synopsis: "La traque s'accélère alors que les serveurs centraux subissent une série de pannes inexpliquées.",
      durationSeconds: 2850,
      thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
      hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
  });

  const title3 = await prisma.title.create({
    data: {
      name: "Sintel : La Quête du Dragon",
      slug: "sintel",
      synopsis: "Une jeune guerrière solitaire brave les sommets enneigés et les déserts impitoyables pour retrouver son compagnon dragonneau capturé par des forces obscures.",
      type: "MOVIE",
      releaseYear: 2023,
      maturityRating: "10+",
      featured: false,
      durationMinutes: 52,
      ratingScore: 8.8,
      posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    },
  });
  await prisma.titleGenre.createMany({
    data: [
      { titleId: title3.id, genreId: genreFantasy.id },
      { titleId: title3.id, genreId: genreAdventure.id },
    ],
  });

  const title4 = await prisma.title.create({
    data: {
      name: "Big Buck Bunny : La Forêt Rebelle",
      slug: "big-buck-bunny",
      synopsis: "Un lapin géant et débonnaire décide d'apprendre les bonnes manières à trois rongeurs farceurs qui terrorisent les créatures innocentes de la clairière.",
      type: "MOVIE",
      releaseYear: 2024,
      maturityRating: "Tous publics",
      featured: false,
      durationMinutes: 45,
      ratingScore: 8.5,
      posterUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=600&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  });
  await prisma.titleGenre.createMany({
    data: [
      { titleId: title4.id, genreId: genreAnimation.id },
      { titleId: title4.id, genreId: genreAdventure.id },
    ],
  });

  const title5 = await prisma.title.create({
    data: {
      name: "Chroniques de la Terre Sauvage",
      slug: "chroniques-terre-sauvage",
      synopsis: "Une immersion visuelle et sonore sans précédent au cœur des réserves naturelles les plus reculées d'Afrique et d'Asie.",
      type: "DOCUMENTARY",
      releaseYear: 2025,
      maturityRating: "Tous publics",
      featured: false,
      durationMinutes: 88,
      ratingScore: 9.5,
      posterUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    },
  });
  await prisma.titleGenre.create({
    data: { titleId: title5.id, genreId: genreDoc.id },
  });

  const title6 = await prisma.title.create({
    data: {
      name: "Vitesse Pure : Apex Horizon",
      slug: "vitesse-pure-apex-horizon",
      synopsis: "Des pilotes d'essai d'élite repoussent les limites de bolides hybrides sur les circuits les plus périlleux du monde.",
      type: "MOVIE",
      releaseYear: 2024,
      maturityRating: "12+",
      featured: false,
      durationMinutes: 95,
      ratingScore: 8.7,
      posterUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
  });
  await prisma.titleGenre.createMany({
    data: [
      { titleId: title6.id, genreId: genreAction.id },
      { titleId: title6.id, genreId: genreAdventure.id },
    ],
  });

  const title7 = await prisma.title.create({
    data: {
      name: "Cosmos Express : Traversée Stellaire",
      slug: "cosmos-express",
      synopsis: "Une navette commerciale perdue aux confins de la ceinture d'astéroïdes doit négocier sa survie avec une colonie minière clandestine.",
      type: "SERIES",
      releaseYear: 2025,
      maturityRating: "12+",
      featured: false,
      ratingScore: 8.9,
      posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    },
  });
  await prisma.titleGenre.create({
    data: { titleId: title7.id, genreId: genreSciFi.id },
  });

  // 6. Données de Progression et Ma Liste pour le profil Alex
  await prisma.watchProgress.create({
    data: {
      profileId: profileAlex.id,
      titleId: title1.id,
      positionSeconds: 1420.0, // 23min environ
      durationSeconds: 4320.0,
      completed: false,
    },
  });

  await prisma.myListItem.createMany({
    data: [
      { profileId: profileAlex.id, titleId: title1.id },
      { profileId: profileAlex.id, titleId: title2.id },
      { profileId: profileAlex.id, titleId: title5.id },
    ],
  });

  // 7. Sections d'accueil configurées (dynamiques et pilotées par le backend)
  await prisma.homeSection.createMany({
    data: [
      {
        title: "Reprendre la lecture",
        type: "CONTINUE_WATCHING",
        displayOrder: 1,
        autoScrollEnabled: false,
        isVisible: true,
      },
      {
        title: "Tendances KINOX",
        type: "TRENDING",
        displayOrder: 2,
        autoScrollEnabled: true,
        isVisible: true,
      },
      {
        title: "Nouveautés & Exclusivités",
        type: "RECENT",
        displayOrder: 3,
        autoScrollEnabled: false,
        isVisible: true,
      },
      {
        title: "Science-Fiction & Mondes Futurs",
        type: "GENRE",
        genreSlug: "science-fiction",
        displayOrder: 4,
        autoScrollEnabled: false,
        isVisible: true,
      },
      {
        title: "Action & Sensations Fortes",
        type: "GENRE",
        genreSlug: "action",
        displayOrder: 5,
        autoScrollEnabled: false,
        isVisible: true,
      },
      {
        title: "Documentaires d'Exception",
        type: "GENRE",
        genreSlug: "documentaire",
        displayOrder: 6,
        autoScrollEnabled: false,
        isVisible: true,
      },
      {
        title: "Ma Sélection Personnelle",
        type: "MY_LIST",
        displayOrder: 7,
        autoScrollEnabled: false,
        isVisible: true,
      },
    ],
  });

  console.log("✅ Peuplement de KINOX réussi avec succès !");
  console.log("   - Compte Admin : admin@kinox.tv / Kinox2026!");
  console.log("   - Compte Démo  : demo@kinox.tv  / Kinox2026!");
  console.log("   - Profils      : Alex (adulte), Emma (jeunesse)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
