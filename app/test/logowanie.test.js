// Testy logowania (PZS-6).
import test from 'node:test'
import assert from 'node:assert/strict'
import { zaloguj, zapiszSesje, odczytajSesje, wyloguj, KONTA, HASLO_DEMO } from '../src/dane/konta.js'

// prosty zamiennik sessionStorage do testów w Node.js
const magazyn = () => { const m = new Map(); return { setItem: (k, v) => m.set(k, String(v)), getItem: (k) => m.get(k) ?? null, removeItem: (k) => m.delete(k) } }

test('każdy pracownik ma konto z firmowym e-mailem', () => {
  assert.ok(KONTA.length > 0)
  assert.ok(KONTA.some((k) => k.email === 'mateusz.sobczak@atlas-software.pl'))
  for (const k of KONTA) assert.match(k.email, /^[a-z]+\.[a-z]+@atlas-software\.pl$/)
})

test('poprawny e-mail i hasło logują (wielkość liter w e-mailu bez znaczenia)', async () => {
  const w = await zaloguj(' Mateusz.Sobczak@atlas-software.pl ', HASLO_DEMO)
  assert.equal(w.ok, true)
  assert.equal(w.konto.osoba, 'mateusz')
})

test('złe hasło i nieznany e-mail dają ten sam komunikat', async () => {
  const a = await zaloguj('mateusz.sobczak@atlas-software.pl', 'zle-haslo')
  const b = await zaloguj('nie.ma@atlas-software.pl', HASLO_DEMO)
  assert.equal(a.ok, false)
  assert.equal(a.blad, b.blad)
})

test('puste pola nie logują', async () => {
  assert.equal((await zaloguj('', '')).ok, false)
})

test('sesja zapisuje, odczytuje i usuwa zalogowaną osobę', async () => {
  const m = magazyn()
  const { konto } = await zaloguj('mateusz.sobczak@atlas-software.pl', HASLO_DEMO)
  zapiszSesje(m, konto)
  assert.equal(odczytajSesje(m), 'mateusz')
  wyloguj(m)
  assert.equal(odczytajSesje(m), null)
})
