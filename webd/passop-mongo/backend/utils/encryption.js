const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_ITERATIONS = 100000;
const KEY_LENGTH = 32;

/**
 * Derives a 256-bit encryption key from the user's master password using PBKDF2.
 * Each password entry gets its own random salt, stored alongside the ciphertext.
 */
function deriveKey(masterPassword, salt) {
  return crypto.pbkdf2Sync(masterPassword, salt, KEY_ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypts a plaintext password using AES-256-GCM.
 * Returns a single string: salt:iv:authTag:ciphertext (all hex-encoded).
 */
function encrypt(plaintext, masterPassword) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(masterPassword, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return [
    salt.toString('hex'),
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted,
  ].join(':');
}

/**
 * Decrypts an AES-256-GCM encrypted string back to plaintext.
 * Expects the format: salt:iv:authTag:ciphertext (all hex-encoded).
 */
function decrypt(encryptedString, masterPassword) {
  const parts = encryptedString.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }

  const [saltHex, ivHex, authTagHex, ciphertext] = parts;

  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = deriveKey(masterPassword, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = { encrypt, decrypt };
