// eslint.config.js
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import pkgGlobals from 'globals';

const compat = new FlatCompat({ baseDirectory: import.meta.url });

// Деструктурируем глобалы из пакета `globals`
const { node: nodeGlobals, jest: jestGlobals } = pkgGlobals;

export default [
  // 1. Core ESLint recommended
  js.configs.recommended,

  // 2. TypeScript rules
  ...compat.extends('plugin:@typescript-eslint/recommended'),

  // 3. Import plugin rules
  ...compat.extends('plugin:import/recommended', 'plugin:import/typescript'),

  // 4. Prettier integration (disables conflicts + runs format)
  ...compat.extends('plugin:prettier/recommended'),

  // 5. Игнорируем артефактные папки/файлы
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.env'],
  },

  // 6. Базовые правила для всех JS/TS файлов
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...nodeGlobals,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Форматирование
      'prettier/prettier': 'error',

      // Современный синтаксис
      'no-var': 'error',
      'prefer-const': 'error',

      // Структура и возвраты
      curly: ['error', 'all'],
      'consistent-return': 'error',

      // Читаемость и безопасность
      'no-implicit-coercion': 'error',
      'no-nested-ternary': 'error',
      'no-await-in-loop': 'error',
      'no-return-await': 'error',
      'array-callback-return': 'error',

      // Логирование
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // 7. Отдельная секция для тестов в папке `tests/`
  {
    files: ['tests/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...jestGlobals,
      },
    },
  },
];
