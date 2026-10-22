// Pikselowe postacie pracowników rysowane w kodzie (bez plików graficznych).
// Klatka 24 x 38 px, stopy w punkcie (12, 37). Widoki: 'przod' (twarzą do kamery) i 'tyl'; lewo/prawo = odbicie.
// Pozy: 'stoi', 'idzie' (4 klatki), 'siedzi' (2 klatki pisania), 'siedzi_przod', 'gest'.

export const SZER = 24, WYS = 38, STOPA_X = 12, STOPA_Y = 37

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const zmien = (c, k) => c.map((v) => Math.max(0, Math.min(255, Math.round(v * k))))
const OBRYS = hex('#22161c')

class Plotno {
  constructor() {
    this.c = document.createElement('canvas')
    this.c.width = SZER; this.c.height = WYS
    this.g = this.c.getContext('2d')
    this.img = this.g.createImageData(SZER, WYS)
  }
  px(x, y, kol) {
    if (x < 0 || y < 0 || x >= SZER || y >= WYS || !kol) return
    const i = (y * SZER + x) * 4, d = this.img.data
    d[i] = kol[0]; d[i + 1] = kol[1]; d[i + 2] = kol[2]; d[i + 3] = 255
  }
  rect(x, y, w, h, kol) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, kol) }
  obrys() {
    const d = this.img.data, kopia = new Uint8ClampedArray(d)
    for (let y = 0; y < WYS; y++) for (let x = 0; x < SZER; x++) {
      if (kopia[(y * SZER + x) * 4 + 3]) continue
      const sas = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => {
        const xx = x + a, yy = y + b
        return xx >= 0 && yy >= 0 && xx < SZER && yy < WYS && kopia[(yy * SZER + xx) * 4 + 3]
      })
      if (sas) this.px(x, y, OBRYS)
    }
  }
  koniec() { this.obrys(); this.g.putImageData(this.img, 0, 0); return this.c }
}

/** Wygląd: { skora, wlosy, fryzura, gora, kolorGory, dol, kolorDolu, okulary, sluchawki, krawat } */
function paleta(w) {
  const skora = hex(w.skora ?? '#e8b48c')
  const wlosy = hex(w.wlosy ?? '#2a2320')
  const gora = hex(w.kolorGory ?? '#3f6fb5')
  const dol = hex(w.kolorDolu ?? '#2b2f3a')
  return {
    skora, skoraC: zmien(skora, 0.84), skoraJ: zmien(skora, 1.06),
    wlosy, wlosyJ: zmien(wlosy, 1.35), wlosyC: zmien(wlosy, 0.75),
    gora, goraC: zmien(gora, 0.74), goraJ: zmien(gora, 1.22),
    dol, dolC: zmien(dol, 0.75),
    buty: hex(w.buty ?? '#1e1a1c'), oko: hex('#1c1820'), bialy: hex('#f2efe8'), krawat: hex(w.krawat ?? '#c0392b'),
    marynarka: hex(w.kolorGory ?? '#2b2f3a'), pasek: hex('#24202a'), klamra: hex('#d8b23a'),
    okulary: hex('#1a1a22'), szklo: hex('#9fd3ff'), sluchawki: hex('#2c2c34'),
  }
}

function rysuj(w, widok, poza, n) {
  const p = new Plotno()
  const P = paleta(w)
  const siedzi = poza === 'siedzi' || poza === 'siedzi_przod'
  const idzie = poza === 'idzie'
  const bob = idzie && (n === 1 || n === 3) ? -1 : 0
  const typ = poza === 'siedzi' && n === 1 ? 1 : 0 // ruch rąk przy pisaniu
  const oy = (siedzi ? 6 : 0) + bob // przesunięcie całej postaci (siedząca niższa)
  const przod = widok === 'przod'

  // ---------- nogi
  if (!siedzi) {
    const krokL = idzie ? [0, -2, 0, 1][n] : 0
    const krokP = idzie ? [0, 1, 0, -2][n] : 0
    if (w.dol === 'spodnica') {
      p.rect(7, 25 + oy, 10, 5, P.dol); p.rect(7, 25 + oy, 2, 5, P.dolC)
      p.rect(8, 30 + oy + Math.min(0, krokL), 3, 4 - Math.min(0, krokL) + krokL * 0, P.skoraC)
      p.rect(13, 30 + oy + Math.min(0, krokP), 3, 4, P.skoraC)
    } else {
      p.rect(8, 25 + oy, 4, 9 + krokL, P.dol); p.rect(8, 25 + oy, 1, 9 + krokL, P.dolC)
      p.rect(13, 25 + oy, 4, 9 + krokP, P.dol); p.rect(16, 25 + oy, 1, 9 + krokP, P.dolC)
    }
    p.rect(7, 34 + oy + krokL, 5, 2, P.buty)
    p.rect(13, 34 + oy + krokP, 5, 2, P.buty)
  } else if (poza === 'siedzi_przod') {
    // uda w stronę kamery + łydki
    p.rect(8, 25 + oy, 4, 3, P.dol); p.rect(13, 25 + oy, 4, 3, P.dol)
    p.rect(8, 28 + oy, 4, 3, P.dolC); p.rect(13, 28 + oy, 4, 3, P.dolC)
    p.rect(7, 31 + oy, 5, 1, P.buty); p.rect(13, 31 + oy, 5, 1, P.buty)
  }

  // ---------- tułów
  const ty = 15 + oy
  const tulow = w.gora === 'garnitur' ? P.marynarka : P.gora
  const tulowC = zmien(tulow, 0.74), tulowJ = zmien(tulow, 1.2)
  p.rect(7, ty, 11, 10, tulow)
  p.rect(7, ty, 2, 10, tulowC)
  p.rect(7, ty, 11, 1, tulowJ)
  if (przod) {
    if (w.gora === 'garnitur') {
      p.rect(10, ty, 5, 6, P.bialy); p.rect(12, ty + 1, 1, 6, P.krawat); p.rect(11, ty + 6, 3, 1, P.krawat)
      p.px(10, ty + 1, tulowJ); p.px(14, ty + 1, tulowJ); p.px(10, ty + 2, tulowJ); p.px(14, ty + 2, tulowJ)
    } else if (w.gora === 'bluza') {
      p.rect(9, ty - 1, 7, 2, tulowJ); p.px(11, ty + 1, P.bialy); p.px(13, ty + 1, P.bialy); p.px(11, ty + 2, P.bialy); p.px(13, ty + 2, P.bialy)
      p.rect(9, ty + 6, 7, 3, tulowC)
    } else if (w.gora === 'sweter') {
      p.rect(10, ty, 5, 2, P.bialy); p.rect(7, ty + 8, 11, 2, tulowC)
      for (let x = 8; x < 17; x += 2) p.px(x, ty + 5, tulowJ)
    } else { // koszula
      p.rect(10, ty, 2, 2, P.bialy); p.rect(13, ty, 2, 2, P.bialy); p.px(12, ty + 2, tulowC)
      p.rect(12, ty + 3, 1, 6, tulowC)
      if (w.krawat) { p.rect(12, ty + 1, 1, 6, P.krawat) }
    }
  } else {
    if (w.gora === 'bluza') p.rect(8, ty, 9, 3, tulowJ) // kaptur na plecach
    p.rect(12, ty + 2, 1, 7, tulowC)
  }
  // pasek
  if (w.dol !== 'spodnica') { p.rect(7, ty + 9, 11, 1, P.pasek); if (przod) p.px(12, ty + 9, P.klamra) }

  // ---------- ręce
  const reka = w.gora === 'garnitur' ? zmien(P.marynarka, 0.86) : tulowC
  if (siedzi && !przod) {
    // ręce wysunięte do klawiatury (widać tylko łokcie)
    p.rect(5, ty + 2 + typ, 2, 6, reka); p.rect(18, ty + 2 + (1 - typ), 2, 6, reka)
  } else if (poza === 'gest') {
    p.rect(5, ty + 1, 2, 9, reka); p.rect(5, ty + 9, 2, 2, P.skora)
    p.rect(18, ty - 7, 2, 8, reka); p.rect(18, ty - 9, 2, 2, P.skora)
  } else {
    const machL = idzie ? [0, 1, 0, -1][n] : 0
    p.rect(5, ty + 1 + machL, 2, 8, reka); p.rect(5, ty + 9 + machL, 2, 2, P.skora)
    p.rect(18, ty + 1 - machL, 2, 8, reka); p.rect(18, ty + 9 - machL, 2, 2, P.skora)
  }

  // ---------- głowa
  const hy = 4 + oy
  p.rect(11, hy + 9, 3, 2, P.skoraC) // szyja
  p.rect(7, hy, 11, 10, P.skora)
  p.rect(16, hy + 1, 2, 9, P.skoraC)
  if (przod) {
    // oczy, usta, policzki
    if (w.okulary) {
      p.rect(8, hy + 5, 4, 2, P.okulary); p.rect(13, hy + 5, 4, 2, P.okulary)
      p.rect(9, hy + 5, 2, 1, P.szklo); p.rect(14, hy + 5, 2, 1, P.szklo)
    } else {
      p.rect(9, hy + 5, 2, 2, P.oko); p.rect(14, hy + 5, 2, 2, P.oko)
      p.px(9, hy + 5, P.bialy); p.px(14, hy + 5, P.bialy)
    }
    p.rect(11, hy + 8, 3, 1, P.skoraC)
    p.px(8, hy + 7, zmien(P.skora, 0.92)); p.px(16, hy + 7, zmien(P.skora, 0.92))
  }
  // ---------- włosy
  const f = w.fryzura ?? 'krotkie'
  const W_ = P.wlosy, WJ = P.wlosyJ, WC = P.wlosyC
  if (f === 'lyse') {
    p.rect(7, hy + 2, 1, 4, W_); p.rect(17, hy + 2, 1, 4, W_)
    if (!przod) p.rect(8, hy + 5, 9, 3, W_)
    p.px(10, hy, P.skoraJ); p.px(11, hy, P.skoraJ)
  } else {
    p.rect(7, hy - 1, 11, 3, W_); p.rect(8, hy - 2, 9, 1, W_)
    p.rect(9, hy - 1, 5, 1, WJ)
    p.rect(6, hy, 1, 6, W_); p.rect(18, hy, 1, 6, W_)
    if (przod) {
      p.rect(7, hy + 2, 2, 2, W_); p.rect(16, hy + 2, 2, 3, W_)
      if (f === 'grzywka') p.rect(8, hy + 2, 7, 1, W_)
    } else {
      p.rect(7, hy, 11, 8, W_); p.rect(8, hy + 1, 3, 4, WJ); p.rect(16, hy + 2, 2, 6, WC)
    }
    if (f === 'dlugie') {
      p.rect(5, hy + 1, 2, 12, W_); p.rect(18, hy + 1, 2, 12, W_)
      if (!przod) p.rect(7, hy + 8, 11, 5, W_), p.rect(8, hy + 9, 3, 3, WJ)
    }
    if (f === 'kucyk') {
      if (przod) p.rect(17, hy + 3, 2, 3, W_)
      else { p.rect(11, hy + 8, 3, 7, W_); p.rect(12, hy + 9, 1, 4, WJ) }
    }
    if (f === 'kok') { p.rect(10, hy - 5, 5, 4, W_); p.rect(11, hy - 5, 2, 1, WJ) }
    if (f === 'loki') { for (let x = 6; x < 19; x += 2) p.rect(x, hy - 2 + (x % 4 ? 0 : 1), 2, 2, WJ); p.rect(5, hy + 1, 2, 8, W_); p.rect(18, hy + 1, 2, 8, W_) }
  }
  if (w.sluchawki) {
    p.rect(8, hy - 3, 9, 1, P.sluchawki)
    p.rect(5, hy + 3, 2, 4, P.sluchawki); p.rect(18, hy + 3, 2, 4, P.sluchawki)
    if (przod) p.rect(7, hy + 7, 2, 1, P.sluchawki)
  }
  return p.koniec()
}

const pamiec = new Map()
const odbite = new Map()

/** Klatka postaci (canvas). strona: SE/SW (przód), NE/NW (tył). */
export function klatka(id, wyglad, strona, poza, n = 0) {
  const widok = strona === 'SE' || strona === 'SW' ? 'przod' : 'tyl'
  // przód rysowany jako SW (patrzy w lewo-dół), tył jako NW; SE i NE to odbicia
  const odbij = strona === 'SE' || strona === 'NE'
  const klucz = `${id}|${widok}|${poza}|${n}`
  let c = pamiec.get(klucz)
  if (!c) { c = rysuj(wyglad, widok, poza, n); pamiec.set(klucz, c) }
  if (!odbij) return c
  let o = odbite.get(klucz)
  if (!o) {
    o = document.createElement('canvas')
    o.width = SZER; o.height = WYS
    const g = o.getContext('2d')
    g.translate(SZER, 0); g.scale(-1, 1); g.drawImage(c, 0, 0)
    odbite.set(klucz, o)
  }
  return o
}

/** Portret (data URL) do interfejsu: głowa i tułów z przodu, powiększone pikselowo. */
export function portret(id, wyglad, skala = 4) {
  const klucz = `portret|${id}|${skala}`
  if (pamiec.has(klucz)) return pamiec.get(klucz)
  const zrodlo = rysuj(wyglad, 'przod', 'stoi', 0)
  const c = document.createElement('canvas')
  const kw = 18, kh = 22
  c.width = kw * skala; c.height = kh * skala
  const g = c.getContext('2d')
  g.imageSmoothingEnabled = false
  g.drawImage(zrodlo, 3, 0, kw, kh, 0, 0, kw * skala, kh * skala)
  const url = c.toDataURL()
  pamiec.set(klucz, url)
  return url
}
