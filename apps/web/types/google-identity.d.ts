/// <reference types="google.accounts" />

declare global {
  interface Window {
    google?: {
      accounts: typeof google.accounts;
    };
  }
}

export {};
