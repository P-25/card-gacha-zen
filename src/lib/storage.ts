/* eslint-disable @typescript-eslint/no-explicit-any */
import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-secret-key-change-me";

/**
 * Encrypts data and saves it to localStorage.
 * @param key The localStorage key.
 * @param data The data to save (will be JSON stringified).
 */
export const saveSecureData = (key: string, data: any): void => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    if (typeof window !== "undefined") {
      localStorage.setItem(key, encrypted);
    }
  } catch (error) {
    console.error("Error saving secure data:", error);
  }
};

/**
 * Loads and decrypts data from localStorage.
 * @param key The localStorage key.
 * @returns The decrypted data or null if not found or error.
 */
export const loadSecureData = <T>(key: string): T | null => {
  try {
    if (typeof window === "undefined") return null;

    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) return null;

    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error("Error loading secure data:", error);
    return null;
  }
};
