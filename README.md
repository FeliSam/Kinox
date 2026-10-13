# KINOX — Plateforme de Streaming Cinématographique Haute Fidélité

**KINOX** est une plateforme de streaming vidéo premium (films, séries, documentaires) inspirée de l'ergonomie OTT contemporaine, dotée d'une identité visuelle originale sombre et élégante, et d'un système de **défilement horizontal automatique lent et accessible**.

---

## 🌟 Fonctionnalités Clés

### 1. Défilement Automatique & Ergonomie Fluide
- **Rangées Horizontales** : Défilement fluide par boutons précédent/suivant, glissement tactile sur mobile/tablette, navigation intégrale au clavier.
- **Défilement Automatique Lent** : Configurable dans les préférences du profil (25 px/sec).
- **Pause Immédiate** : Se met en pause instantanément lors du survol de souris, du focus clavier, d'un événement tactile, d'une interaction utilisateur, lorsque l'onglet est en arrière-plan (`document.hidden`), ou lorsque la rangée est hors de la zone visible (`IntersectionObserver`).
- **Accessibilité & Respect du Mouvement** : Respecte scrupuleusement `prefers-reduced-motion` et désactive les animations automatiques si requis par le système de l'utilisateur.

### 2. Expérience de Visionnage & Lecteur Vidéo Adaptatif
- **Lecteur HTML5 + HLS.js** : Streaming adaptatif multi-débit (Auto, 1080p, 720p, 480p) avec repli automatique MP4.
- **Reprise de Lecture** : Sauvegarde continue de la position en secondes toutes les 5s et à la fermeture. Bouton « Reprendre à XX:XX » et « Du début ».
- **Segments Temporels** : Bouton « Passer l'introduction » contextuel (apparaît uniquement entre les marqueurs définis).
- **Enchaînement d'Épisodes** : Compte à rebours de 10s pour l'épisode suivant avec bouton d'annulation ou d'exécution immédiate.
- **Raccourcis Clavier** : Espace/K (Lecture/Pause), F (Plein écran), M (Muet), Flèches gauche/droite (Recul/Avance 10s).

### 3. Catalogue Dynamique & Parcours Utilisateur
- **Accueil Piloté par le Backend** : Bannières hero avec aperçu muet différé de 750ms, sections d'accueil modulaires (Reprendre la lecture, Tendances, Nouveautés, Par genre, Ma sélection).
- **Recherche Instantanée & Filtres** : Recherche full-text multicritères (titre, synopsis, genre, type) avec URL partageables et état vide soigné.
- **Ma Liste** : Ajout et suppression sans rechargement, contrainte d'unicité garantie sans aucun doublon.
- **Comptes & Profils Multiples** : Gestion d'avatars, restrictions d'âge (Tous publics, 10+, 12+, 16+, 18+), préférences de lecture et d'auto-défilement par profil.

### 4. Back-Office d'Administration
- Consultation et ajout d'œuvres au catalogue avec métadonnées, bannières et manifestes HLS.
- Personnalisation de l'identité de marque (Nom du service, Logo, Couleurs d'accent et secondaires) avec prévisualisation en direct.
- Journal d'audit et suivi du pipeline vidéo.

---

## 🔑 Identifiants de Test (Développement)

| Rôle | Email | Mot de passe | Description |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@kinox.tv` | `Kinox2026!` | Accès complet au catalogue et au back-office `/admin` |
| **Spectateur Démo** | `demo@kinox.tv` | `Kinox2026!` | Profils "Alex" et "Emma" avec historique et Ma Liste |

*Un bouton de remplissage 1-clic est également disponible directement sur la page `/login`.*

---

## 🚀 Démarrage Rapide

### 1. Installation des Dépendances
```bash
npm install
```

### 2. Base de Données & Peuplement
```bash
# Génération du client Prisma et création de la base
npm run db:push

# Peuplement avec les titres de démo et flux HLS autorisés
npm run db:seed
```

### 3. Lancement du Serveur de Développement
```bash
npm run dev
```
Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### 4. Exécution des Tests Automatisés
```bash
npm run test
```

### 5. Build de Production
```bash
npm run build
npm start
```

---

## 🐳 Déploiement Docker

Pour lancer KINOX avec son conteneur PostgreSQL 16 de production :
```bash
docker-compose up --build -d
```
