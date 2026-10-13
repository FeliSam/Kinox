# PROMPT MAÎTRE — Plateforme de streaming inspirée de Netflix avec défilement automatique

## Mission
Tu es une équipe senior produit, design, architecture, frontend, backend, vidéo, sécurité et QA. Développe une plateforme de streaming premium pour films, séries, documentaires et vidéos, accessible sur ordinateur, tablette et mobile. L’expérience doit être familière aux utilisateurs des grandes plateformes OTT : ambiance cinématographique, grands visuels, rangées horizontales, recommandations, reprise de lecture et navigation fluide. Crée cependant une identité originale : ne copie pas le logo, le nom, les illustrations, les textes ni les écrans propriétaires de Netflix. Utilise uniquement des contenus et médias dont les droits sont détenus ou autorisés.

Travaille sur le dépôt existant après l’avoir inspecté. Préserve les choix techniques pertinents. Si le dépôt est vide, adopte la stack proposée ci-dessous. Commence par résumer l’architecture, les hypothèses et le plan, puis implémente étape par étape. Ne prétends jamais qu’une fonction est terminée sans l’avoir réalisée et testée.

## 1. Objectifs du produit
- Application web responsive, rapide, élégante, immersive et accessible.
- Page d’accueil administrable avec un hero et des rangées de contenus.
- Catalogue de films, séries, saisons, épisodes, documentaires et genres.
- Recherche, filtres, fiches détaillées et contenus similaires.
- Comptes, profils, Ma liste, historique et reprise de lecture.
- Lecteur vidéo avec sous-titres, qualité adaptative et commandes.
- Interface d’administration pour gérer catalogue, médias et sections d’accueil.
- Architecture permettant d’ajouter des abonnements, paiements, DRM, recommandations et applications mobiles ultérieurement.
- Aucun bouton factice : chaque action doit fonctionner ou être explicitement signalée comme indisponible.

## 2. Exigence prioritaire : défilement automatique

### 2.1 Rangées horizontales
Chaque rangée — Tendances, Nouveautés, Reprendre la lecture, Films, Séries, Documentaires, Recommandés, Ma liste — doit prendre en charge :
- défilement horizontal fluide par boutons précédent/suivant ;
- glissement tactile sur mobile et tablette ;
- utilisation au clavier avec focus visible ;
- comportement naturel à la molette et au trackpad, sans détourner agressivement le défilement vertical ;
- option de défilement horizontal automatique lent, configurable par préférence ;
- pause immédiate au survol, au focus clavier, au toucher ou après une interaction ;
- arrêt lorsque l’onglet est inactif ou la rangée hors écran ;
- reprise uniquement lorsque cela ne surprend pas l’utilisateur ;
- indicateur discret de progression si utile ;
- aucune boucle rapide, aucun saut brutal et aucun piège de focus.

Le défilement automatique doit être désactivé par défaut ou activable dans les préférences après validation UX. Respecte `prefers-reduced-motion` et désactive les animations automatiques si l’utilisateur préfère réduire les mouvements.

### 2.2 Défilement vertical
La page défile naturellement de haut en bas. Charge les sections et images progressivement lorsqu’elles approchent de la zone visible. Ne force jamais des sauts automatiques entre sections, ne bloque pas les commandes normales du navigateur et ne déplace pas la page sous l’utilisateur. Restaure raisonnablement la position après le retour d’une fiche de contenu. Un en-tête collant peut devenir opaque au défilement, sans masquer les contenus ni provoquer de saut de mise en page.

### 2.3 Aperçus au survol
Sur ordinateur, une bande-annonce ou un aperçu muet peut démarrer après un délai configurable de 500 à 800 ms. Il doit s’arrêter au départ du pointeur, à la perte de visibilité ou au lancement d’un autre aperçu. Un seul aperçu peut fonctionner à la fois. Sur mobile, n’active pas l’aperçu au simple toucher ; montre une couverture et un bouton explicite. Prévois une préférence pour désactiver les aperçus et respecte les préférences de mouvement.

### 2.4 Lecture et reprise
La lecture avec son commence uniquement après une action explicite. Enregistre périodiquement la progression et lors de la pause, de la fin ou de la sortie. Le bouton « Reprendre » repart au dernier point sauvegardé ; propose aussi « Recommencer ». Pour les séries, affiche l’épisode suivant avec un compte à rebours annulable, selon les préférences du profil. Les actions « Passer l’intro » et « Passer le générique » n’apparaissent que si les métadonnées temporelles existent.

## 3. Pages et parcours

### Accueil
- navigation : logo, Accueil, Films, Séries, Catégories, Ma liste ;
- recherche et menu de profil ;
- grande bannière hero avec image/vidéo autorisée, dégradé de lisibilité, titre, résumé, année, durée ou saisons, genres et classification ;
- boutons « Lire » et « Plus d’informations » ;
- rangées horizontales pilotées par le backend, non codées en dur ;
- sections typiques : Reprendre la lecture, Tendances, Nouveautés, Films recommandés, Séries populaires, Documentaires, Parce que vous avez regardé…, Ma liste ;
- pied de page : aide, confidentialité, conditions et contact.

### Cartes de contenu
- affiches 2:3 pour films/séries et miniatures 16:9 lorsque cela convient ;
- titre, année, classification, durée et genres ;
- barre de progression de lecture si nécessaire ;
- actions rapides Lire, Ma liste, Détails ;
- état de chargement, image de remplacement et erreurs gérées ;
- agrandissement au survol modéré, sans recouvrir de façon gênante les cartes voisines ;
- panneau d’informations secondaire accessible ;
- comportement tactile non ambigu ;
- libellés accessibles et navigation clavier.

### Fiche de contenu
Visuel hero, titre, synopsis, année, durée, genres, classification, langues audio et sous-titres disponibles, Lire, Ma liste, saisons/épisodes pour une série, contenus similaires et disponibilité territoriale si applicable.

### Recherche et catégories
Recherche avec états de chargement, erreur et résultat vide. Filtres par type, genre, année, langue et classification si les données existent. Les catégories proviennent du backend. Les URL peuvent être partageables. Les recherches récentes sont facultatives, contrôlables et supprimables.

### Ma liste
Ajout/suppression, synchronisation avec le compte, état vide utile, absence de doublons, gestion des erreurs réseau.

### Lecteur
Commandes lecture/pause, progression navigable au clavier, volume/muet, plein écran, qualité disponible, langue audio, sous-titres, vitesse si supportée, raccourcis documentés, retour, prochain épisode, erreurs compréhensibles, bouton réessayer, reprise et écran de fin. Choisis un lecteur maintenu, par exemple HTML5 avec HLS.js lorsque HLS n’est pas pris en charge nativement. Vérifie les navigateurs cibles et ne considère pas une simple balise vidéo comme une solution complète de streaming adaptatif.

## 4. Direction artistique et personnalisation
Créer une interface sombre, cinématographique, premium et originale :
- fond noir/anthracite, surfaces différenciées, texte très lisible ;
- couleur d’accent originale et configurable ;
- typographie moderne, grands visuels et dégradés subtils ;
- transitions discrètes, espaces maîtrisés et hiérarchie claire ;
- éviter bordures, ombres et effets décoratifs excessifs.

Centralise les design tokens : couleurs de fond/surface/texte/accent/états, typographie, espacements, rayons, ombres, durées d’animation, largeur de contenu, hauteur d’en-tête et ratios d’images. Les composants doivent utiliser ces tokens. Permets à l’administrateur de modifier le nom du service, le logo, les couleurs, les liens de pied de page, les sections d’accueil et leur ordre. Fournis une prévisualisation avant publication.

Responsive à tester sur petit mobile, grand mobile, tablette, ordinateur portable et grand écran. Adapte le nombre de cartes visibles, la navigation, la taille du hero et son point focal. Ne crée pas l’interface sous forme d’une capture d’écran fixe : tous les éléments doivent être de vrais composants fonctionnels.

Accessibilité : contraste suffisant, clavier complet, focus visible, textes alternatifs, boutons nommés, sous-titres accessibles, cibles tactiles adéquates, aucune information uniquement transmise par la couleur et respect de `prefers-reduced-motion`.

## 5. Stack technique
Si le dépôt ne contient pas déjà des choix pertinents :
- monorepo pnpm workspaces, Turborepo si utile ;
- Next.js App Router, React et TypeScript strict ;
- Tailwind CSS et composants accessibles réutilisables ;
- TanStack Query ou RTK Query : choisis une approche principale ;
- React Hook Form et Zod ;
- backend Node.js avec NestJS ou Express modulaire : choisis une seule solution ;
- PostgreSQL ;
- Prisma ou Drizzle : choisis un ORM ;
- authentification avec sessions sécurisées ou fournisseur fiable ;
- stockage objet privé compatible S3 ou service vidéo spécialisé, transcodage asynchrone et CDN ;
- Vitest, tests API et Playwright ;
- Docker, migrations versionnées, CI et configuration par environnement.

Évite les dépendances redondantes. Verrouille les versions, conserve le lockfile et documente les commandes.

## 6. Architecture
Modules métier : identité/authentification, profils, catalogue, saisons/épisodes, genres, collections, sections d’accueil, recherche, Ma liste, historique/progression, lecture, abonnements, administration, notifications et analytics minimales respectueuses de la vie privée.

Sépare clairement frontend, API métier, base de données, tâches vidéo asynchrones, stockage des médias et CDN. Commence par un monolithe modulaire ; ne crée des microservices que si un besoin concret le justifie. Le transcodage ne doit pas bloquer les requêtes web.

## 7. Modèle de données
Créer les migrations, relations, index, contraintes et horodatages pour :
- `User` : email normalisé, identifiant d’authentification, statut et dates ;
- `Profile` : propriétaire, nom, avatar, langue, préférences et restrictions d’âge ;
- `Subscription` : plan, statut, fournisseur, périodes et identifiant externe ;
- `Title` : titre, slug, synopsis, type, année, classification et publication ;
- `Season` : série parente, numéro, titre et synopsis ;
- `Episode` : saison, numéro, titre, durée et métadonnées de lecture ;
- `Genre` et `TitleGenre` ;
- `MediaAsset` : type, stockage, état de traitement, durée, codec, résolution, poster et miniature ;
- `PlaybackSource` : contenu, manifeste ou identifiant fournisseur, état et droits territoriaux ;
- `TimedSegment` : intro/récapitulatif/générique ;
- `Collection` et `CollectionItem` ;
- `HomeSection` : titre, type, ordre, critères, visibilité et ciblage ;
- `WatchProgress` : profil, contenu, position en secondes et date ;
- `WatchEvent` : événements nécessaires à l’historique et au diagnostic ;
- `MyListItem` : profil, titre, date et contrainte d’unicité ;
- `SearchHistory` facultatif et supprimable ;
- `Plan` : prix, devise, limites et fonctionnalités ;
- `PaymentEvent` : identifiant externe, type, statut et idempotence, sans données de carte ;
- `AdminAuditLog` : acteur, action, cible, horodatage et métadonnées minimisées.

Définis correctement les relations film/série/épisode, les règles de suppression et les index pour les requêtes fréquentes. Dates en UTC.

## 8. Pipeline vidéo et droits
Ne te limite pas à servir directement des fichiers vidéo depuis un dossier public. Construis un pipeline :
1. administrateur téléverse un fichier autorisé ;
2. validation du type, de la taille, du hash et des permissions ;
3. stockage privé temporaire ;
4. tâche asynchrone de transcodage ;
5. génération de renditions adaptatives, segments HLS/DASH, miniatures et métadonnées ;
6. validation des résultats ;
7. publication vers stockage/CDN ;
8. contenu visible uniquement lorsque le traitement est terminé et les droits confirmés.

Exigences : sources privées, URLs signées à durée limitée ou autorisation équivalente, limites de taille, vérification de type et signature de fichier, analyse de fichiers selon l’infrastructure, gestion/reprise des tâches échouées, nettoyage des temporaires, pistes de sous-titres WebVTT, sauvegardes et rétention. Les clés secrètes ne doivent jamais arriver dans le frontend.

Pour un service commercial, évalue les licences, droits de diffusion, restrictions territoriales, DRM (Widevine/FairPlay/PlayReady selon les appareils) et obligations légales. Ne prétends pas fournir un DRM complet sans fournisseur, contrats et tests réels. N’utilise jamais de contenus piratés ou de médias récupérés sans autorisation.

## 9. Comptes, profils et abonnements
- Inscription, connexion, déconnexion et réinitialisation de mot de passe sécurisée.
- Vérification email si nécessaire, sessions révocables, limitation des tentatives.
- Plusieurs profils par compte si le modèle commercial le prévoit.
- Avatar, nom, langue, préférences, historique et liste séparés par profil.
- Contrôle parental si prévu, avec code sécurisé.
- Plans configurables : gratuit, financé par publicité ou payant selon décision produit.
- Limites et droits vérifiés côté serveur.
- Prestataire de paiement compatible avec les pays visés.
- Webhooks signés, idempotence, états explicites, annulation et expiration.
- Historique de facturation et reçus.
- Aucune donnée de carte bancaire stockée directement.
- Environnement de test ; aucune fausse transaction présentée comme réelle.

## 10. Administration
Créer un back-office protégé par rôles pour :
- créer, modifier, publier, dépublier et archiver films, séries, saisons et épisodes ;
- téléverser posters, bannières, bandes-annonces et vidéos ;
- consulter l’état et les erreurs du pipeline vidéo, relancer les tâches ;
- modifier synopsis, genres, année, classification, langues et sous-titres ;
- gérer dates et territoires de disponibilité ;
- créer/réordonner les sections d’accueil et choisir les contenus vedettes ;
- renseigner les segments intro/générique ;
- gérer utilisateurs, profils, abonnements et signalements avec accès restreint ;
- consulter les journaux d’audit ;
- personnaliser l’identité de marque et prévisualiser les changements.

Demande une confirmation pour les actions destructrices et conserve une trace des modifications sensibles.

## 11. Sécurité et confidentialité
- mots de passe hachés avec un algorithme adapté, jamais en clair ;
- cookies `HttpOnly`, `Secure` en production et `SameSite` approprié ;
- protection CSRF selon le mécanisme d’authentification ;
- validation serveur de toutes les entrées et requêtes paramétrées ;
- contrôle d’accès sur chaque ressource, pas seulement dans l’UI ;
- limitation de débit et protection contre l’énumération de comptes ;
- CORS restrictif, CSP et headers de sécurité ;
- secrets hors du code, URLs médias privées et webhooks vérifiés ;
- logs sans mots de passe, tokens, cookies ou données sensibles ;
- sauvegardes chiffrées et restaurations testées ;
- procédures de suppression/export des données ;
- politique de confidentialité et cookies adaptée aux pays ciblés, dont RGPD si applicable.

## 12. API indicative
Créer une API versionnée, documentée et validée par schémas. Adapter les routes aux choix d’architecture :
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/password/reset`
- `GET /api/v1/me`
- `GET /api/v1/profiles`
- `POST /api/v1/profiles`
- `GET /api/v1/home`
- `GET /api/v1/titles`
- `GET /api/v1/titles/:slug`
- `GET /api/v1/search?q=...`
- `GET /api/v1/genres`
- `GET /api/v1/my-list`
- `POST /api/v1/my-list/:titleId`
- `DELETE /api/v1/my-list/:titleId`
- `GET /api/v1/progress`
- `PUT /api/v1/progress/:playableId`
- `POST /api/v1/playback/:playableId/session`
- `POST /api/v1/playback/:playableId/heartbeat`
- `GET /api/v1/admin/titles`
- `POST /api/v1/admin/titles`
- `POST /api/v1/admin/media/upload`
- `GET /api/v1/admin/media/jobs`
- `POST /api/v1/billing/webhooks/:provider`

Les routes de lecture vérifient authentification, profil, abonnement éventuel, droits territoriaux, fenêtres de disponibilité et autorisation média. Documente pagination, schémas, erreurs, codes HTTP et limites. Ne révèle jamais le chemin d’un fichier source privé.

## 13. Performance
- page initiale rapide, sans décalages de mise en page ;
- images au bon format et à la bonne taille ;
- lazy loading des images hors écran et placeholders dimensionnés ;
- précharger uniquement les ressources critiques ;
- pagination et chargement progressif du catalogue ;
- cache public sûr, sans mélanger des réponses privées entre utilisateurs ;
- un seul aperçu vidéo actif ;
- CDN pour les médias ;
- mesures réelles des erreurs, temps de réponse, démarrage vidéo et buffering.
Ne prétends pas avoir atteint un score ou une performance sans mesure réelle.

## 14. SEO
Métadonnées propres à chaque page publique, titres/descriptions uniques, Open Graph avec visuels autorisés, sitemap et robots.txt. Exclure de l’indexation les pages privées et données personnelles. Ne publier que des contenus autorisés.

## 15. Tests et critères d’acceptation

### Défilement
- boutons précédent/suivant ciblent la bonne rangée ;
- glissement tactile fonctionnel ;
- défilement automatique stoppé au survol, au focus, au toucher et lorsque l’onglet est inactif ;
- `prefers-reduced-motion` respecté ;
- aucune interaction piégée ;
- défilement vertical naturel ;
- commandes accessibles au clavier.

### Catalogue et parcours
- accueil basé sur les sections serveur ;
- cartes ouvrant le bon contenu ;
- recherche avec état vide et erreurs ;
- Ma liste ajoute/supprime sans doublons ;
- fiches et épisodes corrects ;
- chargement progressif et erreurs d’images gérés.

### Lecture et sécurité
- son/lecture démarrés après action autorisée ;
- progression sauvegardée et reprise correcte ;
- erreurs réseau gérées ;
- sous-titres sélectionnables s’ils existent ;
- lecture adaptative testée sur les navigateurs cibles ;
- segments intro/générique affichés uniquement si connus ;
- accès anonyme refusé aux routes privées ;
- un utilisateur ne peut pas consulter la progression d’un autre profil ;
- administration limitée aux rôles autorisés ;
- média privé inaccessible sans autorisation ;
- webhooks idempotents ;
- secrets absents du code client.

### Qualité
TypeScript strict, lint, migrations, tests critiques et build production réussis. Les commandes de démarrage doivent être reproductibles et documentées.

## 16. Données de démonstration
Créer un catalogue fictif avec affiches/bannières originales, libres de droits ou placeholders, genres variés, profils de test et progression de démonstration. Les vidéos de démonstration doivent être autorisées. Les identifiants de test ne sont disponibles qu’en développement. Aucun compte admin avec mot de passe connu en production.

## 17. Arborescence indicative
Adapter au dépôt ; ne crée pas de dossiers vides juste pour suivre cet exemple.

```text
streaming-platform/
  apps/
    web/
      app/
      components/
      features/
      lib/
      styles/
    api/
      src/modules/
        auth/
        profiles/
        catalog/
        search/
        watchlist/
        progress/
        playback/
        billing/
        admin/
  packages/
    ui/
    contracts/
    config/
  infra/
    docker/
    deployment/
  docs/
    architecture.md
    api.md
    video-pipeline.md
    security.md
  .env.example
  docker-compose.yml
  pnpm-workspace.yaml
  README.md
```

## 18. Livrables
1. Application web responsive.
2. API fonctionnelle et documentée.
3. Schéma de données et migrations.
4. Accueil avec sections configurables.
5. Rangées horizontales, commandes tactiles/clavier et défilement automatique accessible.
6. Recherche et fiches de contenu.
7. Authentification/profils si prévus.
8. Ma liste et reprise de lecture.
9. Lecteur vidéo avec source de test autorisée.
10. Administration du catalogue et des médias.
11. Architecture d’abonnements intégrable.
12. Tests automatisés.
13. `.env.example` sans secrets.
14. Docker et instructions de lancement.
15. Documentation, limites et intégrations externes restant à configurer.

## 19. Plan d’exécution obligatoire

**Phase 1 — Fondations**
- inspecter le dépôt ;
- choisir et documenter l’architecture ;
- mettre en place TypeScript, lint, formatage et environnement ;
- configurer PostgreSQL, migrations et Docker.

**Phase 2 — Interface**
- système de design ;
- navigation responsive ;
- hero ;
- cartes et rangées ;
- défilement horizontal accessible et automatique configurable ;
- données de démonstration.

**Phase 3 — Catalogue**
- modèles, fiches, genres, recherche et sections pilotées par le backend.

**Phase 4 — Comptes**
- authentification, profils, Ma liste, historique et progression.

**Phase 5 — Vidéo**
- lecteur, HLS/DASH, pipeline de transcodage, sous-titres, reprise et contrôle d’accès.

**Phase 6 — Administration**
- gestion du catalogue, uploads, statuts vidéo, ordre des sections et marque.

**Phase 7 — Abonnements**
- plans, paiement en mode test, webhooks, sécurité, sauvegardes et monitoring.

**Phase 8 — Validation**
- tests unitaires/API/E2E, responsive, appareils et navigateurs cibles, accessibilité, sécurité, build et documentation.

## 20. Instructions finales à l’agent
- Lis ce prompt intégralement avant de coder.
- Inspecte le dépôt et explique brièvement les hypothèses.
- N’implémente pas tout dans un composant géant.
- Utilise des composants réutilisables, modules séparés et types cohérents.
- Ne mets aucune clé secrète dans le frontend.
- N’invente ni droits de diffusion, ni transactions, ni résultats de tests.
- Ne laisse pas l’interface dépendre uniquement de données codées en dur.
- Ne sacrifie pas l’accessibilité pour les animations.
- Priorise une version fonctionnelle et testée avant les finitions.
- À la fin de chaque phase, indique les fichiers créés/modifiés, commandes exécutées, tests/résultats et limites restantes.
- Si une information manque, documente une hypothèse raisonnable et continue, sauf blocage réel.

**Commence maintenant par inspecter le dépôt, présenter brièvement le plan technique, puis implémenter la Phase 1.**
