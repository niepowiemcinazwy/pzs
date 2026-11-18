// Testy danych przykładowych i warstwy api (to, co widzi szef w panelach).
import test from 'node:test'
import assert from 'node:assert/strict'
import * as api from '../src/dane/api.js'

test('każdy pracownik należy do istniejącego działu', () => {
  for (const p of api.pracownicy()) assert.ok(api.dzial(p.dzial), `brak działu ${p.dzial} dla ${p.id}`)
})

test('każde zadanie ma przypisaną istniejącą osobę', () => {
  for (const p of api.pracownicy()) {
    for (const z of api.zadaniaOsoby(p.id)) assert.equal(z.osoba, p.id)
  }
  const wszystkie = api.pracownicy().flatMap((p) => api.zadaniaOsoby(p.id))
  assert.ok(wszystkie.length > 0)
})

test('liczba osób w działach sumuje się do wszystkich pracowników', () => {
  const suma = api.dzialy().reduce((s, d) => s + api.pracownicyDzialu(d.id).length, 0)
  assert.equal(suma, api.pracownicy().length)
})

test('czasTemu opisuje czas po polsku', () => {
  const teraz = Date.now()
  assert.equal(api.czasTemu(teraz), 'teraz')
  assert.equal(api.czasTemu(teraz - 5 * 60000), '5 min temu')
  assert.equal(api.czasTemu(teraz - 3 * 3600000), '3 godz. temu')
  assert.equal(api.czasTemu(teraz - 2 * 86400000), '2 dni temu')
})

test('imieNazwisko zwraca id, gdy osoby nie ma', () => {
  assert.equal(api.imieNazwisko('nie-ma-takiej-osoby'), 'nie-ma-takiej-osoby')
})
