// eslint.config.js
// Flat config for ESLint v9 (ESM, package.json has "type": "module")
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

const compat = new FlatCompat({ baseDirectory: import.meta.url });
const { node: nodeGlobals, jest: jestGlobals } = globals;

export default [
  // 1. Core ESLint rules
  js.configs.recommended,

  // 2. TypeScript recommended rules
  ...compat.extends('plugin:@typescript-eslint/recommended'),

  // 3. Import plugin rules
  ...compat.extends('plugin:import/recommended', 'plugin:import/typescript'),

  // 4. Prettier integration
  ...compat.extends('plugin:prettier/recommended'),

  // 5. Ignore patterns: node_modules, coverage, configs
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '.env',
      '*.config.js', // eslint and vitest config files
      'tests/setup.js',
    ],
  },

  // 6. Base JS/TS rules
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { ...nodeGlobals },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      curly: ['error', 'all'],
      'consistent-return': 'error',
      'no-implicit-coercion': 'error',
      'no-nested-ternary': 'error',
      'no-await-in-loop': 'error',
      'no-return-await': 'error',
      'array-callback-return': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // 7. Disable consistent-return and console checks in middleware and routes
  {
    files: ['middleware/**/*.js', 'routes/**/*.js'],
    rules: {
      'consistent-return': 'off',
    },
  },

  // 8. Test files override
  {
    files: ['tests/**/*.test.{js,ts}', 'tests/**/*.spec.{js,ts}'],
    languageOptions: {
      globals: { ...nodeGlobals, ...jestGlobals },
    },
    rules: {
      'no-await-in-loop': 'off',
    },
  },
];
