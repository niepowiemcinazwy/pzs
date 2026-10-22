import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'

// skrót commita, z którego zbudowano wersję (w CI z GITHUB_SHA, lokalnie z gita)
function skrotCommita() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try { return execSync('git rev-parse --short=7 HEAD').toString().trim() } catch { return 'nieznany' }
}
const COMMIT = skrotCommita()

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
  },
  server: { port: 5199, strictPort: true },
  preview: { port: 8080, host: true },
})
