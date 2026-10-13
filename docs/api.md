# Spécification de l'API KINOX (v1)

Toutes les routes API sont préfixées par `/api/v1/`.

## 1. Authentification & Utilisateurs
- `POST /api/v1/auth/register` : Création de compte avec email normalisé et mot de passe sécurisé.
- `POST /api/v1/auth/login` : Authentification et émission de cookie de session HttpOnly / token JWT.
- `POST /api/v1/auth/logout` : Révocation de session.
- `GET /api/v1/me` : Données de l'utilisateur connecté et ses profils.

## 2. Profils
- `GET /api/v1/profiles` : Liste des profils du compte.
- `POST /api/v1/profiles` : Création d'un profil (nom, avatar, préférences auto-scroll, restriction d'âge).
- `PUT /api/v1/profiles/:id` : Mise à jour des préférences (notamment défilement automatique, vitesse, sous-titres).

## 3. Catalogue & Accueil
- `GET /api/v1/home` : Sections d'accueil dynamiques configurées côté serveur (Tendances, Nouveautés, Reprendre la lecture, Par Genre).
- `GET /api/v1/titles` : Liste paginée des titres avec filtres (type, genre, année).
- `GET /api/v1/titles/:slug` : Fiche détaillée d'un titre, saisons, épisodes, segments temporels et titres similaires.
- `GET /api/v1/genres` : Liste des genres disponibles et nombre d'œuvres.
- `GET /api/v1/search?q=...` : Recherche multi-critères avec suggestion et filtre par genre/type.

## 4. Ma Liste & Progression de lecture
- `GET /api/v1/my-list` : Liste des titres sauvegardés pour le profil actif.
- `POST /api/v1/my-list/:titleId` : Ajout idempotent (évite les doublons).
- `DELETE /api/v1/my-list/:titleId` : Suppression d'un titre de la liste.
- `GET /api/v1/progress` : Titres en cours de visionnage pour le profil actif.
- `PUT /api/v1/progress/:playableId` : Sauvegarde périodique de la position de lecture (secondes, complétion).

## 5. Lecture & Sessions
- `POST /api/v1/playback/:playableId/session` : Initialise une session de lecture avec manifeste HLS/MP4 autorisé, sous-titres et segments (intro/générique).
- `POST /api/v1/playback/:playableId/heartbeat` : Télémétrie de lecture et actualisation de position.

## 6. Administration & Gestion
- `GET /api/v1/admin/titles` : Gestion complète du catalogue.
- `POST /api/v1/admin/titles` : Création/mise à jour d'un titre, saisons et épisodes.
- `POST /api/v1/admin/media/upload` : Téléversement et enregistrement d'actifs médias.
- `GET /api/v1/admin/media/jobs` : Suivi du pipeline de transcodage et encodage.
- `GET /api/v1/admin/settings` : Récupération des tokens de marque (couleurs, nom, logo).
- `PUT /api/v1/admin/settings` : Personnalisation dynamique de la plateforme.

## 7. Facturation & Abonnements
- `GET /api/v1/billing/plans` : Liste des plans disponibles (Gratuit, Standard, Premium 4K).
- `POST /api/v1/billing/webhooks/:provider` : Réception des événements de paiement sécurisés et idempotents.
