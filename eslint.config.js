import { defineConfig } from 'eslint/config';
import jhipster from 'generator-jhipster/eslint';

export default defineConfig(
  {
    ignores: ['coverage/**', 'node_modules/**'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
  jhipster.recommended,
);
