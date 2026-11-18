// Strona po zbudowaniu musi pokazywać skrót commita (sprawdza to też test po wdrożeniu).
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

test('index.html ma miejsce na skrót commita', () => {
  assert.match(html, /<div id="wersja"[^>]*>wersja %COMMIT%<\/div>/)
})

test('strona ma tytuł Team Environment', () => {
  assert.match(html, /<title>[^<]*Team Environment[^<]*<\/title>/)
})
