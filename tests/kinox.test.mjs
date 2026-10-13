import test from "node:test";
import assert from "node:assert";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword, createToken, verifyToken } from "../src/lib/auth.mjs";

const prisma = new PrismaClient();

test("Sécurité & Authentification — Hachage PBKDF2 et jetons signés", async (t) => {
  const password = "MonSuperMotDePasse2026!";
  const hash = hashPassword(password);

  assert.ok(hash.includes(":"), "Le hachage doit inclure sel et empreinte séparés par :");
  assert.strictEqual(verifyPassword(password, hash), true, "Le mot de passe valide doit être accepté");
  assert.strictEqual(verifyPassword("FauxMotDePasse", hash), false, "Un mauvais mot de passe doit être rejeté");

  const token = createToken({
    userId: "test-user-1",
    email: "test@kinox.tv",
    role: "ADMIN",
  });
  assert.ok(token.includes("."), "Le jeton doit contenir payload et signature");

  const verified = verifyToken(token);
  assert.ok(verified, "Le jeton légitime doit être décodé");
  assert.strictEqual(verified.email, "test@kinox.tv");
  assert.strictEqual(verified.role, "ADMIN");

  const tamperedToken = token.slice(0, -4) + "XXXX";
  assert.strictEqual(verifyToken(tamperedToken), null, "Un jeton falsifié doit être rejeté");
});

test("Catalogue & Données — Vérification des entités KINOX", async (t) => {
  const titles = await prisma.title.findMany({
    include: {
      genres: { include: { genre: true } },
      timedSegments: true,
    },
  });

  assert.ok(titles.length >= 5, "Le catalogue doit contenir au moins 5 titres de démonstration");

  const tearsOfSteel = titles.find((t) => t.slug === "tears-of-steel");
  assert.ok(tearsOfSteel, "Tears of Steel doit être présent dans le catalogue");
  assert.ok(tearsOfSteel.hlsManifestUrl, "Le titre doit disposer d'un manifeste HLS");
  assert.ok(tearsOfSteel.mp4FallbackUrl, "Le titre doit disposer d'une source de repli MP4");
  assert.ok(tearsOfSteel.timedSegments.length > 0, "Le titre doit disposer d'un segment temporel pour 'Passer l\\'intro'");
});

test("Ma Liste — Contrainte d'unicité et absence de doublons", async (t) => {
  const profile = await prisma.profile.findFirst();
  const title = await prisma.title.findFirst();

  assert.ok(profile && title, "Un profil et un titre de test doivent exister");

  // Premier ajout
  const item1 = await prisma.myListItem.upsert({
    where: {
      profileId_titleId: {
        profileId: profile.id,
        titleId: title.id,
      },
    },
    update: { addedAt: new Date() },
    create: {
      profileId: profile.id,
      titleId: title.id,
    },
  });

  // Second ajout identique (doit mettre à jour sans dupliquer)
  const item2 = await prisma.myListItem.upsert({
    where: {
      profileId_titleId: {
        profileId: profile.id,
        titleId: title.id,
      },
    },
    update: { addedAt: new Date() },
    create: {
      profileId: profile.id,
      titleId: title.id,
    },
  });

  assert.strictEqual(item1.id, item2.id, "L'identifiant doit rester identique (zéro doublon)");

  const count = await prisma.myListItem.count({
    where: { profileId: profile.id, titleId: title.id },
  });
  assert.strictEqual(count, 1, "Il ne doit y avoir qu'une seule occurrence");
});

test("Progression & Reprise de lecture", async (t) => {
  const profile = await prisma.profile.findFirst();
  const title = await prisma.title.findFirst();

  const progress = await prisma.watchProgress.upsert({
    where: {
      profileId_titleId: {
        profileId: profile.id,
        titleId: title.id,
      },
    },
    update: {
      positionSeconds: 125.5,
      durationSeconds: 1800,
      completed: false,
    },
    create: {
      profileId: profile.id,
      titleId: title.id,
      positionSeconds: 125.5,
      durationSeconds: 1800,
      completed: false,
    },
  });

  assert.strictEqual(progress.positionSeconds, 125.5, "La position sauvegardée doit être exacte");
  assert.strictEqual(progress.completed, false);
});
