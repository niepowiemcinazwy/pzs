// Sprite'y mebli (PNG) + bryły rysowane w kodzie. Każdy sprite ma podstawę (w, d w kaflach) i punkt zaczepienia
// (ax, ay) = środek podstawy na obrazku. Odbicie w poziomie zamienia osie podstawy (w <-> d).
import META from './sprite_meta.json'

const obrazy = new Map() // nazwa -> { img, meta, odbity }

export async function wczytajSprite(postep = () => {}) {
  const nazwy = Object.keys(META)
  let n = 0
  await Promise.all(nazwy.map((nazwa) => new Promise((ok, blad) => {
    const img = new Image()
    img.onload = () => {
      obrazy.set(nazwa, { img, meta: META[nazwa], odbity: odbij(img) })
      postep(++n / nazwy.length)
      ok()
    }
    img.onerror = () => blad(new Error('Nie wczytano sprite: ' + nazwa))
    img.src = `./sprites/${nazwa}.png`
  })))
}

function odbij(img) {
  const c = document.createElement('canvas')
  c.width = img.width; c.height = img.height
  const g = c.getContext('2d')
  g.translate(img.width, 0); g.scale(-1, 1)
  g.drawImage(img, 0, 0)
  return c
}

/** Rejestruje sprite narysowany w kodzie (canvas + meta). */
export function zarejestruj(nazwa, canvas, meta) {
  obrazy.set(nazwa, { img: canvas, meta: { szer: canvas.width, wys: canvas.height, ...meta }, odbity: odbij(canvas) })
}

/** Dane do narysowania: obraz, przesunięcie od punktu podłogi i wymiary podstawy (już po odbiciu). */
export function sprite(nazwa, odbity = false) {
  const s = obrazy.get(nazwa)
  if (!s) throw new Error('Brak sprite: ' + nazwa)
  const m = s.meta
  return odbity
    ? { img: s.odbity, ox: -(m.szer - m.ax), oy: -m.ay, w: m.d, d: m.w, szer: m.szer, wys: m.wys }
    : { img: s.img, ox: -m.ax, oy: -m.ay, w: m.w, d: m.d, szer: m.szer, wys: m.wys }
}

export const jest = (nazwa) => obrazy.has(nazwa)
