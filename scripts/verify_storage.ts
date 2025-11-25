/**
 * Verification script for Redux Persistence.
 * Note: This needs to run in a browser environment or a mocked environment
 * because it relies on localStorage.
 *
 * Since we are in a node environment, we will mock localStorage and verify
 * the encryption/decryption logic and store behavior.
 */

import { saveSecureData, loadSecureData } from "../src/lib/storage";
import { store } from "../src/store/store";
import { addGems } from "../src/store/slices/playerSlice";
import CryptoJS from "crypto-js";

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

// Mock Window for storage check
Object.defineProperty(global, "window", {
  value: {},
});

function verifyStorage() {
  console.log("Starting Storage Verification...");

  // 1. Test Encryption/Decryption directly
  console.log("1. Testing Encryption/Decryption...");
  const testData = { foo: "bar", num: 123 };
  saveSecureData("test_key", testData);

  const encrypted = localStorage.getItem("test_key");
  console.log("   Encrypted Data in Storage:", encrypted);

  if (!encrypted || encrypted.includes("foo")) {
    console.error("FAIL: Data does not appear to be encrypted.");
  } else {
    console.log("PASS: Data is encrypted.");
  }

  const decrypted = loadSecureData("test_key");
  console.log("   Decrypted Data:", decrypted);

  if (JSON.stringify(decrypted) === JSON.stringify(testData)) {
    console.log("PASS: Decryption matches original data.");
  } else {
    console.error("FAIL: Decryption mismatch.");
  }

  // 2. Test Redux Persistence
  console.log("\n2. Testing Redux Persistence...");

  // Dispatch action
  console.log("   Dispatching addGems(500)...");
  store.dispatch(addGems(500));

  const state = store.getState();
  console.log("   Current Redux State Gems:", state.player.gems);

  // Check storage
  const savedPlayerState = loadSecureData<any>("player_state");
  console.log("   Saved Player State in Storage:", savedPlayerState);

  if (savedPlayerState && savedPlayerState.gems === state.player.gems) {
    console.log("PASS: Redux state automatically saved to storage.");
  } else {
    console.error("FAIL: Redux state not saved correctly.");
  }
}

verifyStorage();
