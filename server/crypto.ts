import crypto from 'crypto';

/**
 * Módulo de criptografia para proteger requisições à API externa
 * Usa AES-256-GCM para criptografia simétrica
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

// Gera uma chave derivada do JWT_SECRET para criptografia
function getEncryptionKey(): Buffer {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Criptografa dados sensíveis antes de armazenar ou transmitir
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Retorna: iv + authTag + encrypted (tudo em hex)
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

/**
 * Descriptografa dados previamente criptografados
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  
  // Extrai iv, authTag e dados criptografados
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
  const authTag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2), 'hex');
  const encrypted = encryptedData.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Gera um hash SHA-256 de uma string
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

