const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const DEFAULT_JWT_SECRET = "nexacart_jwt_super_secret_key_2026_production_grade";
const DEFAULT_ENCRYPTION_KEY = "nexacart_aes256_gcm_payload_encryption_key_2026";

const getJwtSecret = () => process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

const getEncryptionKey = () => {
  const rawSecret =
    process.env.JWT_ENCRYPTION_KEY || process.env.JWT_SECRET || DEFAULT_ENCRYPTION_KEY;
  return crypto.createHash("sha256").update(rawSecret).digest();
};

/**
 * Encrypt sensitive token claims using AES-256-GCM before signing the JWT.
 */
const encryptPayload = (payload) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const serialized = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(serialized, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
};

/**
 * Decrypt AES-256-GCM ciphertext stored inside a verified JWT.
 */
const decryptPayload = (encryptedToken) => {
  if (!encryptedToken || typeof encryptedToken !== "string") {
    throw new Error("Invalid encrypted token payload");
  }

  const parts = encryptedToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed encrypted payload format");
  }

  const [ivB64, tagB64, cipherB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const encrypted = Buffer.from(cipherB64, "base64url");

  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");

  return JSON.parse(decrypted);
};

/**
 * Generate a signed JWT whose sensitive claims (id, role, jti) are AES-256-GCM encrypted.
 */
const generateToken = (id, role = "customer") => {
  const jti = crypto.randomUUID();
  const enc = encryptPayload({
    id: String(id),
    role,
    jti,
    issuedAt: Date.now(),
  });

  return jwt.sign(
    { enc, v: 2 },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

/**
 * Verify JWT signature/expiry and decrypt the embedded claims payload.
 * Supports legacy plain JWT claims if encountered during migration.
 */
const verifyToken = (token) => {
  const decoded = jwt.verify(token, getJwtSecret());

  if (decoded && decoded.enc) {
    const claims = decryptPayload(decoded.enc);
    return {
      ...claims,
      iat: decoded.iat,
      exp: decoded.exp,
      isEncrypted: true,
    };
  }

  return decoded;
};

generateToken.generateToken = generateToken;
generateToken.verifyToken = verifyToken;
generateToken.encryptPayload = encryptPayload;
generateToken.decryptPayload = decryptPayload;

module.exports = generateToken;
