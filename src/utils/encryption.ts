import CryptoJS from 'crypto-js';

// In a production environment, this would be stored securely and not in the code
const SECRET_KEY =
  process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this';

/**
 * Encrypt text using AES encryption
 * @param text Plain text to encrypt
 * @returns Encrypted text
 */
export const encryptText = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

/**
 * Decrypt text that was encrypted using AES encryption
 * @param encryptedText Encrypted text
 * @returns Decrypted text
 */
export const decryptText = (encryptedText: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
