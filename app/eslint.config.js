// Konfiguracja ESLint (job "lint" w CI). Zestaw js/recommended + zmienne środowiska.
import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['dist/', 'release/', 'node_modules/', 'public/'] },
  js.configs.recommended,
  {
    // pusty catch {} jest u nas celowy (np. localStorage zablokowany w trybie prywatnym)
    rules: { 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
  {
    // kod aplikacji działa w przeglądarce / oknie Electrona
    files: ['src/**/*.js'],
    languageOptions: { globals: { ...globals.browser, __COMMIT__: 'readonly' } },
  },
  {
    // konfiguracja Vite, testy i skrypty uruchamia Node.js
    files: ['*.js', 'test/**/*.js', 'scripts/**/*.{js,cjs}', 'electron/**/*.cjs', 'narzedzia/**/*.{js,cjs,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
  },
]
