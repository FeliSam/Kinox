# Architecture Technique KINOX

## 1. Vue d'ensemble
KINOX est une plateforme de streaming vidéo de haute qualité conçue selon une architecture de monolithe modulaire moderne avec Next.js 14 (App Router), React 18, TypeScript strict, Tailwind CSS et Prisma ORM.

## 2. Découpage Modulaire

```text
kinox/
├── prisma/
│   └── schema.prisma         # Modèle relationnel complet (17+ entités)
├── public/                   # Actifs statiques, posters, sous-titres VTT, avatars
├── scripts/
│   └── seed.mjs              # Peuplement avec catalogue cinématique et flux autorisés
├── src/
│   ├── app/
│   │   ├── api/v1/           # API REST versionnée et documentée
│   │   │   ├── auth/         # Authentification, sessions sécurisées, mot de passe
│   │   │   ├── profiles/     # Profils multiples, avatars, préférences de défilement
│   │   │   ├── titles/       # Catalogue, fiches, métadonnées
│   │   │   ├── home/         # Sections d'accueil pilotées dynamiquement
│   │   │   ├── search/       # Recherche fulltext et filtres multicritères
│   │   │   ├── genres/       # Liste des genres et contenus associés
│   │   │   ├── my-list/      # Favoris et gestion sans doublon
│   │   │   ├── progress/     # Reprise de lecture, positions en secondes
│   │   │   ├── playback/     # Sessions HLS/MP4, heartbeat, contrôle de droits
│   │   │   ├── admin/        # Back-office, gestion de catalogue, marque, métriques
│   │   │   └── billing/      # Plans d'abonnement, webhooks sécurisés et idempotents
│   │   ├── watch/[id]/       # Lecteur vidéo immersif (Hls.js, sous-titres, intro skip)
│   │   ├── title/[slug]/     # Fiche détaillée avec casting, saisons, épisodes, similaires
│   │   ├── categories/       # Exploration par genre/catégorie
│   │   ├── my-list/          # Ma Liste personnelle
│   │   ├── search/           # Page de recherche avec filtres
│   │   ├── admin/            # Dashboard d'administration complet
│   │   ├── profiles/         # Sélecteur et gestionnaire de profils
│   │   ├── login/            # Authentification sécurisée
│   │   ├── layout.tsx        # En-tête collant dynamique, design tokens, navigation
│   │   └── page.tsx          # Accueil cinématographique piloté par le backend
│   ├── components/
│   │   ├── ui/               # Boutons, badges, modales, design tokens
│   │   ├── Navbar.tsx        # Navigation responsive avec recherche et profil actif
│   │   ├── HeroBanner.tsx    # Grande bannière avec aperçu muet différé (500-800ms)
│   │   ├── ContentRow.tsx    # Rangée horizontale à défilement tactile/clavier et auto-scroll
│   │   ├── ContentCard.tsx   # Carte avec aperçu au survol, progression et actions rapides
│   │   ├── VideoPlayer.tsx   # Lecteur HLS adaptatif avec passer intro/générique et reprise
│   │   ├── QuickViewModal.tsx# Modale d'informations détaillées accessible
│   │   └── Footer.tsx        # Pied de page paramétrable
│   ├── lib/
│   │   ├── db.ts             # Instance singleton Prisma
│   │   ├── auth.ts           # Hachage bcrypt, JWT et helpers de session
│   │   └── utils.ts          # Helpers de formatage (durée, classification, dates)
│   └── types/                # Définitions TypeScript partagées
├── docs/                     # Documentation technique complète
├── Dockerfile                # Image de production multi-stage
├── docker-compose.yml        # Orchestration avec PostgreSQL
└── README.md
```

## 3. Choix Technologiques
- **Framework Web & API** : Next.js 14 App Router (RSC + Client Components ciblés).
- **Langage** : TypeScript en mode strict.
- **Style** : Tailwind CSS avec design tokens cinéma KINOX (Anthracite #08090C, Accents Crimson & Ambre, Ratios 2:3 et 16:9).
- **Base de données** : SQLite en développement local (zéro latence, zéro installation lourde requise) et PostgreSQL 16 en production via Docker.
- **ORM** : Prisma 5 avec relations typées, cascades de suppression et intégrité référentielle.
- **Lecteur Vidéo** : Intégration HTML5 + HLS.js, flux adaptatifs HLS et replis MP4 haute qualité (médias du Blender Studio Open Projects sous licence Creative Commons).
