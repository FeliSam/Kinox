# Pipeline Vidéo et Droits de Diffusion KINOX

## 1. Principes
Le service ne sert aucun contenu piraté. Pour la démonstration et les tests, KINOX exploite les œuvres de référence libres sous licence Creative Commons (Tears of Steel, Sintel, Big Buck Bunny, Cosmos Laundromat de la fondation Blender).

## 2. Étapes du Pipeline de Traitement
1. **Téléversement privé** : Fichier source téléversé sur un stockage objet privé (`/uploads/raw/`).
2. **Validation & Analyse** : Vérification de la signature du fichier, codec conteneur (MP4, MKV, ProRes), débit et intégrité.
3. **File d'attente asynchrone** : Enregistrement de la tâche dans `MediaAsset` avec statut `PROCESSING`.
4. **Encodage & Transcodage adaptatif (HLS / DASH)** :
   - Génération des flux vidéo multi-débits (1080p, 720p, 480p, 360p en H.264/AAC).
   - Découpage en segments `.ts` de 4 à 6 secondes.
   - Génération du manifeste maître `master.m3u8` et des playlists de variantes.
5. **Génération des miniatures et bandes d'aperçu** :
   - Génération d'une mosaïque VTT pour le scrubber du lecteur.
   - Extrait d'aperçu muet optimisé de 10-15s pour le survol de la carte.
6. **Contrôle qualité & Publication** :
   - Vérification de l'intégrité des segments HLS.
   - Passage du statut à `READY`.
7. **Distribution CDN & URL Sécurisées** :
   - Les médias finaux sont servis avec vérification de jeton de session / URL signée à durée de vie limitée (TTL 2h).
   - Les sources brutes ne sont jamais exposées publiquement.
