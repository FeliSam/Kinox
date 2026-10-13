import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "kinox_default_secret_fallback_key";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return testHash === originalHash;
}

export function createToken(payload, expiresInHours = 24 * 7) {
  const fullPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInHours * 3600,
  };
  const json = JSON.stringify(fullPayload);
  const base64 = Buffer.from(json).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(base64).digest("base64url");
  return `${base64}.${signature}`;
}

export function verifyToken(token) {
  try {
    if (!token || !token.includes(".")) return null;
    const [base64, signature] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SECRET).update(base64).digest("base64url");
    if (signature !== expectedSig) return null;

    const json = Buffer.from(base64, "base64url").toString("utf-8");
    const payload = JSON.parse(json);
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
