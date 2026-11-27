// Test obu historyjek Sprintu 3 razem: logowanie (PZS-6) i „Moje zadania” (PZS-5).
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
// zaloguj, zapiszSesje i PO_ZALOGOWANIU pochodzą z PZS-6, reszta z PZS-5
import { zaloguj, zapiszSesje, PO_ZALOGOWANIU, HASLO_DEMO } from '../src/dane/konta.js'
import { zalogowanaOsoba, mojeZadania, STRONA_LOGOWANIA } from '../src/dane/mojeZadania.js'

// zamiennik sessionStorage: ta sama sesja przechodzi z logowania do strony zadań
const magazyn = () => { const m = new Map(); return { setItem: (k, v) => m.set(k, String(v)), getItem: (k) => m.get(k) ?? null, removeItem: (k) => m.delete(k) } }

test('PZS-6 + PZS-5: po zalogowaniu pracownik widzi tylko swoje zadania', async () => {
  const sesja = magazyn()
  const wynik = await zaloguj('kamil.styn@atlas-software.pl', HASLO_DEMO)
  assert.equal(wynik.ok, true)
  zapiszSesje(sesja, wynik.konto)
  // strona zadań czyta sesję zapisaną przez logowanie: inny klucz sesji = pusta lista
  const osoba = zalogowanaOsoba(sesja)
  assert.equal(osoba, 'kamil')
  const lista = mojeZadania(osoba)
  assert.ok(lista.length > 0)
  assert.ok(lista.every((z) => z.osoba === 'kamil'))
})

test('PZS-6 + PZS-5: logowanie i „Moje zadania” prowadzą do siebie nawzajem', () => {
  // adres po zalogowaniu bierzemy z kodu logowania, nie wpisujemy go na sztywno
  const strona = readFileSync(new URL('../' + PO_ZALOGOWANIU, import.meta.url), 'utf8')
  assert.match(strona, /<h1>Moje zadania<\/h1>/)
  const logowanie = readFileSync(new URL('../' + STRONA_LOGOWANIA, import.meta.url), 'utf8')
  assert.match(logowanie, /<form id="logowanie"/)
})
