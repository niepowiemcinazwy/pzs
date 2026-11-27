// Testy listy „Moje zadania” (PZS-5).
import test from 'node:test'
import assert from 'node:assert/strict'
import { mojeZadania, zmienStatus, podsumowanie, STATUSY } from '../src/dane/mojeZadania.js'

const DANE = [
  { klucz: 'A-1', tytul: 'a', osoba: 'kamil', status: 'zrobione', termin: '2026-11-01' },
  { klucz: 'A-2', tytul: 'b', osoba: 'kamil', status: 'w_trakcie', termin: '2026-11-20' },
  { klucz: 'A-3', tytul: 'c', osoba: 'kamil', status: 'do_zrobienia', termin: '2026-11-10' },
  { klucz: 'A-4', tytul: 'd', osoba: 'mateusz', status: 'w_trakcie', termin: '2026-11-05' },
]

test('lista zawiera tylko zadania jednej osoby', () => {
  const lista = mojeZadania('kamil', DANE)
  assert.equal(lista.length, 3)
  assert.ok(lista.every((z) => z.osoba === 'kamil'))
})

test('niezrobione są na górze, posortowane po terminie', () => {
  assert.deepEqual(mojeZadania('kamil', DANE).map((z) => z.klucz), ['A-3', 'A-2', 'A-1'])
})

test('zmiana statusu działa na liście i nie zmienia danych źródłowych', () => {
  const zmiany = zmienStatus({}, 'A-3', 'zrobione')
  assert.equal(mojeZadania('kamil', DANE, zmiany).find((z) => z.klucz === 'A-3').status, 'zrobione')
  assert.equal(DANE[2].status, 'do_zrobienia')
})

test('nieznany status jest odrzucany', () => {
  assert.throws(() => zmienStatus({}, 'A-3', 'gotowe'), /Nieznany status/)
})

test('podsumowanie liczy zadania w każdym statusie', () => {
  const s = podsumowanie(mojeZadania('kamil', DANE))
  assert.deepEqual(Object.keys(s), STATUSY)
  assert.equal(s.zrobione + s.w_trakcie + s.do_zrobienia + s.do_review, 3)
})
