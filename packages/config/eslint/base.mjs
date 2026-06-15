import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

/** Shared TypeScript rules for Node / library packages. */
export default defineConfig(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**'],
  },
  {
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
  },
  eslintConfigPrettier,
);
