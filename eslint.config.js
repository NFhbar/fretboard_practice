import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // legacy reference files are scheduled for deletion — don't lint them
  { ignores: ['dist', 'node_modules', 'fretboard-practice.jsx', 'src/LegacyApp.jsx'] },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // shared modules export hooks + helpers together by design
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['scripts/**'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
];
