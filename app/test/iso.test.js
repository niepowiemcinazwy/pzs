// Testy przeliczania współrzędnych izometrycznych (silnik 2D).
import test from 'node:test'
import assert from 'node:assert/strict'
import { iso, zIso, strona, KW, KH } from '../src/engine2d/iso.js'

test('kafel (1, 0) leży pół kafla w prawo i w dół', () => {
  assert.deepEqual(iso(1, 0), { sx: KW / 2, sy: KH / 2 })
})

test('wysokość y przesuwa punkt w górę ekranu', () => {
  assert.equal(iso(2, 3, 10).sy, iso(2, 3).sy - 10)
})

test('zIso odwraca iso dla punktu na podłodze', () => {
  const { sx, sy } = iso(4.5, 7.25)
  const p = zIso(sx, sy)
  assert.ok(Math.abs(p.x - 4.5) < 1e-9)
  assert.ok(Math.abs(p.z - 7.25) < 1e-9)
})

test('strona ruchu wybiera dominującą oś', () => {
  assert.equal(strona(1, 0.2), 'SE')
  assert.equal(strona(-1, 0.2), 'NW')
  assert.equal(strona(0.1, 1), 'SW')
  assert.equal(strona(0.1, -1), 'NE')
})
