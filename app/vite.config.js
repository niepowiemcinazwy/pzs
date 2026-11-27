import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// skrót commita, z którego zbudowano wersję (w CI z GITHUB_SHA, lokalnie z gita)
function skrotCommita() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try { return execSync('git rev-parse --short=7 HEAD').toString().trim() } catch { return 'nieznany' }
}
const COMMIT = skrotCommita()

// każda strona .html w folderze app to osobny punkt wejścia (biuro, logowanie, moje zadania…)
const KATALOG = fileURLToPath(new URL('.', import.meta.url))
const STRONY = Object.fromEntries(
  readdirSync(KATALOG).filter((f) => f.endsWith('.html')).map((f) => [f.replace('.html', ''), resolve(KATALOG, f)]),
)

export default defineConfig({
  base: './',
  define: { __COMMIT__: JSON.stringify(COMMIT) },
  plugins: [{
    name: 'wersja-commita',
    transformIndexHtml: (html) => html.replaceAll('%COMMIT%', COMMIT),
  }],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: { input: STRONY },
  },
  server: { port: 5199, strictPort: true },
  preview: { port: 8080, host: true },
})
