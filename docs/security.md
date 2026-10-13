# Politique de Sécurité & Confidentialité KINOX

## 1. Mots de passe et Authentification
- Hachage cryptographique des mots de passe avec algorithme sécurisé (SHA-256 avec sel ou Argon2/Bcrypt).
- Aucun mot de passe stocké en clair.
- Jetons de session JWT signés avec secret fort, transmis via en-têtes ou cookies HttpOnly avec indicateur `SameSite=Lax`.

## 2. Contrôle d'accès & Isolation
- Chaque requête vers `/api/v1/profiles`, `/api/v1/my-list`, `/api/v1/progress` est strictement isolée par identifiant de profil et de compte.
- Les utilisateurs standard ne peuvent en aucun cas accéder aux données d'audit ou modifier les catalogues.
- Accès au back-office `/admin` et aux routes `/api/v1/admin/*` strictement restreint aux utilisateurs ayant le rôle `ADMIN`.

## 3. Données Bancaires et Paiement
- Aucune coordonnée bancaire n'est enregistrée sur les serveurs de KINOX.
- Les abonnements reposent sur un identifiant externe de client et des événements webhooks vérifiés avec signature cryptographique.
- Idempotence garantie via la table `PaymentEvent` (champ `externalId` unique).

## 4. Protection des Médias
- Fichiers maîtres stockés dans un espace de stockage privé.
- Accès aux flux de lecture accordé uniquement après validation des droits (statut actif, restrictions territoriales, classification d'âge du profil).
