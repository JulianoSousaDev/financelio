import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      '.expo/**',
      'dist/**',
      'metro.config.js',
      'test-entry.js',
    ],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
);
