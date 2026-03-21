import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  {
    ignores: ['*.config.js', '*.config.ts', 'cdk.out/**', 'node_modules/**', 'dist/**'],
  },

  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },

  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  prettier,
];
