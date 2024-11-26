import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import { default as eslint, default as js } from '@eslint/js';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/.emulator-data/',
      '**/.github/',
      '**/.storybook/',
      '**/.vscode/',
      '**/coverage/',
      '**/apps-scripts/',
      '**/coverage/',
      '**/dist/',
      '**/firebase-export-*/',
      'functions/node_modules/',
      '**/maps/',
      '**/node_modules/',
      '**/package-lock.json',
      '**/package.json',
      'public/assets/**/*',
      '**/cloudrun/',
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:react-hooks/recommended',
      'plugin:react/jsx-runtime',
      'prettier',
    ),
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      prettier,
      'jsx-a11y': fixupPluginRules(jsxA11Y),
      'react-hooks': fixupPluginRules(reactHooks),
      'react-refresh': reactRefresh,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],

    rules: {
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
);
