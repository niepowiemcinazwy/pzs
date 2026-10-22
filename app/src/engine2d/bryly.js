// Pikselowe bryły izometryczne rysowane w kodzie (w stylu paczki mebli): szafy serwerowe, stół, kuchnia,
// kanapy, ścianki działowe, krzesła biurowe od tyłu. Każda bryła = kilka prostopadłościanów rasteryzowanych piksel po pikselu.
import { zarejestruj } from './sprite.js'

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const jasniej = (c, k) => c.map((v) => Math.max(0, Math.min(255, Math.round(v * k))))
const OBRYS = hex('#1d1418')

function losowy(ziarno) {
  let s = ziarno >>> 0 || 1
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1000) / 1000 }
}

/**
 * Rasteryzuje bryłę złożoną z prostopadłościanów.
 * czesci: [{ x, z, y, w, d, h, kolor:'#hex', gora?, wzor?(sciana, u, v, px, py) }]
 * x,z,w,d w kaflach (względem rogu podstawy), y,h w pikselach.
 * Zwraca canvas i meta z podstawą (W, D) całej bryły.
 */
export function bryla(W, D, czesci, { obrys = true, ziarno = 1, szum = 5 } = {}) {
  const maxH = Math.max(...czesci.map((c) => (c.y ?? 0) + c.h))
  const ox = Math.ceil(D * 16) + 1, oy = maxH + 1
  const szer = Math.ceil((W + D) * 16) + 3, wys = Math.ceil((W + D) * 8) + maxH + 3
  const c = document.createElement('canvas')
  c.width = szer; c.height = wys
  const g = c.getContext('2d')
  const img = g.createImageData(szer, wys)
  const d = img.data
  const los = losowy(ziarno)
  // malarz: od tyłu do przodu
  const posort = [...czesci].sort((a, b) => (a.x + a.z + (a.w + a.d) / 2) - (b.x + b.z + (b.w + b.d) / 2) || (a.y ?? 0) - (b.y ?? 0))
  for (const cz of posort) {
    const baza = hex(cz.kolor)
    const kGora = cz.gora ? hex(cz.gora) : jasniej(baza, 1.18)
    const kLewa = jasniej(baza, 0.92), kPrawa = jasniej(baza, 0.74)
    const y0 = cz.y ?? 0
    for (let py = 0; py < wys; py++) {
      for (let px = 0; px < szer; px++) {
        const sx = px - ox + 0.5, sy = py - oy + 0.5
        let kol = null, sciana = null, u = 0, v = 0
        // góra (płaszczyzna y = y0 + h)
        {
          const yy = sy + y0 + cz.h
          const a = sx / 16, b = yy / 8
          const x = (a + b) / 2, z = (b - a) / 2
          if (x >= cz.x && x <= cz.x + cz.w && z >= cz.z && z <= cz.z + cz.d) { sciana = 'gora'; u = (x - cz.x) / cz.w; v = (z - cz.z) / cz.d; kol = kGora }
        }
        if (!sciana) { // prawa ściana: płaszczyzna x = cz.x + cz.w (widoczna z prawej-dołu)
          const xw = cz.x + cz.w
          const z = xw - sx / 16
          const y = (xw + z) * 8 - sy
          if (z >= cz.z && z <= cz.z + cz.d && y >= y0 && y <= y0 + cz.h) { sciana = 'prawa'; u = (z - cz.z) / cz.d; v = (y - y0) / cz.h; kol = kPrawa }
        }
        if (!sciana) { // lewa ściana: płaszczyzna z = cz.z + cz.d (widoczna z lewej-dołu)
          const zd = cz.z + cz.d
          const x = sx / 16 + zd
          const y = (x + zd) * 8 - sy
          if (x >= cz.x && x <= cz.x + cz.w && y >= y0 && y <= y0 + cz.h) { sciana = 'lewa'; u = (x - cz.x) / cz.w; v = (y - y0) / cz.h; kol = kLewa }
        }
        if (!sciana) continue
        const w = cz.wzor?.(sciana, u, v, px, py, kol)
        if (w === 'pomin') continue
        let k = w ? (typeof w === 'string' ? hex(w) : w) : kol
        // krawędzie ścian ciemniejsze, góra jaśniejsza krawędź
        const brzeg = sciana === 'gora' ? Math.min(u, v, 1 - u, 1 - v) * Math.min(cz.w, cz.d) * 16 : Math.min(u * (sciana === 'prawa' ? cz.d : cz.w) * 16, (1 - u) * (sciana === 'prawa' ? cz.d : cz.w) * 16, v * cz.h, (1 - v) * cz.h)
        if (brzeg < 1) k = jasniej(k, sciana === 'gora' ? 1.12 : 0.8)
        const n = (los() - 0.5) * szum
        const i = (py * szer + px) * 4
        d[i] = Math.max(0, Math.min(255, k[0] + n)); d[i + 1] = Math.max(0, Math.min(255, k[1] + n)); d[i + 2] = Math.max(0, Math.min(255, k[2] + n)); d[i + 3] = 255
      }
    }
  }
  if (obrys) {
    const kopia = new Uint8ClampedArray(d)
    for (let py = 0; py < wys; py++) for (let px = 0; px < szer; px++) {
      const i = (py * szer + px) * 4
      if (kopia[i + 3]) continue
      const sas = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => {
        const x = px + a, y = py + b
        return x >= 0 && y >= 0 && x < szer && y < wys && kopia[(y * szer + x) * 4 + 3]
      })
      if (sas) { d[i] = OBRYS[0]; d[i + 1] = OBRYS[1]; d[i + 2] = OBRYS[2]; d[i + 3] = 255 }
    }
  }
  g.putImageData(img, 0, 0)
  return { canvas: c, meta: { w: W, d: D, ax: ox + (W - D) * 8, ay: oy + (W + D) * 4 } }
}

const DREWNO = '#9a5a3a', DREWNO_JASNE = '#b9774b', DREWNO_GORA = '#8b4b34'

/** Rejestruje wszystkie bryły rysowane w kodzie. */
export function zbudujBryly() {
  // --- szafa serwerowa: 3 klatki diod + wersja z alarmem (front = lewa ściana, czyli strona +z)
  const ledy = (faza, alarm) => (sc, u, v, px, py) => {
    if (sc !== 'lewa') return null
    if (u < 0.1 || u > 0.9 || v < 0.06 || v > 0.94) return '#2b3140'
    const rzad = Math.floor(v * 14)
    if (Math.floor(v * 28) % 2 === 0) return '#151a24'
    const kol = Math.floor(u * 8)
    if (kol === 6 || kol === 5) {
      const h = (rzad * 7 + kol * 13 + faza * 5) % 11
      if (alarm && h < 5) return '#ff3b3b'
      if (h < 3) return '#3cff7a'
      if (h < 4) return '#ffd23c'
      if (h < 5) return '#3cc8ff'
    }
    return kol < 4 ? '#222838' : '#1a1f2c'
  }
  for (let f = 0; f < 3; f++) {
    for (const alarm of [false, true]) {
      const { canvas, meta } = bryla(0.9, 1.0, [{ x: 0, z: 0, w: 0.9, d: 1.0, h: 50, kolor: '#2a303e', gora: alarm && f % 2 ? '#7a1f26' : '#363e50', wzor: ledy(f, alarm) }], { ziarno: 7 + f })
      zarejestruj(`serwer_${alarm ? 'alarm_' : ''}${f}`, canvas, meta)
    }
  }

  // --- stół konferencyjny (długi wzdłuż z)
  {
    const { canvas, meta } = bryla(2.4, 5.2, [
      { x: 0.15, z: 0.2, w: 0.25, d: 0.25, h: 13, kolor: '#5a3424' }, { x: 2.0, z: 0.2, w: 0.25, d: 0.25, h: 13, kolor: '#5a3424' },
      { x: 0.15, z: 4.75, w: 0.25, d: 0.25, h: 13, kolor: '#5a3424' }, { x: 2.0, z: 4.75, w: 0.25, d: 0.25, h: 13, kolor: '#5a3424' },
      { x: 0, z: 0, y: 13, w: 2.4, d: 5.2, h: 4, kolor: DREWNO, gora: DREWNO_GORA, wzor: (sc, u, v) => (sc === 'gora' && (Math.floor(v * 26) % 6 === 0) ? '#7f4230' : null) },
    ], { ziarno: 11 })
    zarejestruj('stol_konferencyjny', canvas, meta)
  }
  // --- stolik kawowy / okrągły zastąpiony kwadratowym
  {
    const { canvas, meta } = bryla(1.3, 1.3, [
      { x: 0.55, z: 0.55, w: 0.2, d: 0.2, h: 14, kolor: '#4a2c20' },
      { x: 0, z: 0, y: 14, w: 1.3, d: 1.3, h: 3, kolor: DREWNO_JASNE, gora: '#a3633f' },
    ], { ziarno: 12 })
    zarejestruj('stolik', canvas, meta)
  }
  // --- blat kuchenny z szafkami (front = lewa, strona +z), długi wzdłuż x
  {
    const drzwiczki = (sc, u, v) => {
      if (sc !== 'lewa') return null
      if (v > 0.86) return '#e8e1d2'
      const seg = (u * 6) % 1
      if (seg < 0.06 || seg > 0.94 || v < 0.08) return '#b9ab93'
      if (Math.abs(seg - 0.5) < 0.05 && v > 0.55 && v < 0.7) return '#5b4b3b'
      return null
    }
    const { canvas, meta } = bryla(6, 1.2, [{ x: 0, z: 0, w: 6, d: 1.2, h: 22, kolor: '#d8cdb6', gora: '#e9e3d6', wzor: drzwiczki }], { ziarno: 13 })
    zarejestruj('blat_kuchenny', canvas, meta)
  }
  // --- lodówka
  {
    const { canvas, meta } = bryla(1.2, 1.2, [{ x: 0, z: 0, w: 1.2, d: 1.2, h: 46, kolor: '#cfd6dc', gora: '#e4e9ec', wzor: (sc, u, v) => (sc === 'lewa' && Math.abs(v - 0.62) < 0.02 ? '#8d979f' : sc === 'lewa' && u > 0.82 && u < 0.88 && (v > 0.68 && v < 0.85 || v > 0.3 && v < 0.5) ? '#7d878f' : null) }], { ziarno: 14 })
    zarejestruj('lodowka', canvas, meta)
  }
  // --- ekspres do kawy (na blacie)
  {
    const { canvas, meta } = bryla(0.55, 0.55, [
      { x: 0, z: 0, w: 0.55, d: 0.55, h: 14, kolor: '#2b2b33', gora: '#3a3a46', wzor: (sc, u, v) => (sc === 'lewa' && v > 0.25 && v < 0.55 && u > 0.3 && u < 0.7 ? '#151519' : sc === 'lewa' && v > 0.75 && u > 0.2 && u < 0.4 ? '#ff5d3b' : null) },
    ], { ziarno: 15 })
    zarejestruj('ekspres', canvas, meta)
  }
  // --- dystrybutor wody
  {
    const { canvas, meta } = bryla(0.6, 0.6, [
      { x: 0, z: 0, w: 0.6, d: 0.6, h: 22, kolor: '#e6e9ee', gora: '#f2f4f6' },
      { x: 0.1, z: 0.1, y: 22, w: 0.4, d: 0.4, h: 12, kolor: '#6fc7f2', gora: '#9fdcf8' },
    ], { ziarno: 16 })
    zarejestruj('dystrybutor', canvas, meta)
  }
  // --- kanapy, długie wzdłuż z. Wersja podstawowa: oparcie od strony -x (siedzi się w stronę +x).
  //     Wersja _r: oparcie od strony +x (siedzi się w stronę -x). Odbicie lustrzane zamienia osie x/z.
  for (const [nazwa, kolor] of [['kanapa', '#7a3b46'], ['kanapa_turkus', '#2f7d78'], ['kanapa_szara', '#5d6474']]) {
    const k = hex(kolor), ciemny = '#' + jasniej(k, 0.8).map((v) => v.toString(16).padStart(2, '0')).join('')
    for (const odwrocona of [false, true]) {
      const oparcieX = odwrocona ? 0.9 : 0, siedzX = odwrocona ? 0 : 0.4
      const { canvas, meta } = bryla(1.3, 3.0, [
        { x: 0, z: 0, w: 1.3, d: 3.0, h: 8, kolor: ciemny },
        { x: oparcieX, z: 0, y: 8, w: 0.4, d: 3.0, h: 12, kolor },
        { x: siedzX, z: 0, y: 8, w: 0.9, d: 0.35, h: 6, kolor }, { x: siedzX, z: 2.65, y: 8, w: 0.9, d: 0.35, h: 6, kolor },
        { x: siedzX, z: 0.35, y: 8, w: 0.9, d: 2.3, h: 3, kolor, wzor: (sc, u, v) => (sc === 'gora' && Math.abs(v - 0.5) < 0.02 ? ciemny : null) },
      ], { ziarno: 17 })
      zarejestruj(odwrocona ? nazwa + '_r' : nazwa, canvas, meta)
    }
  }
  // --- drewniane krzesła skierowane w daną stronę (SE: +x, NW: -x, SW: +z, NE: -z); oparcie z tyłu
  const DR = '#9a5f3a', DR_C = '#6e4026', SIEDZ = '#7a2f36'
  const oparcia = { SE: { x: 0, z: 0.05, w: 0.1, d: 0.5 }, NW: { x: 0.5, z: 0.05, w: 0.1, d: 0.5 }, SW: { x: 0.05, z: 0, w: 0.5, d: 0.1 }, NE: { x: 0.05, z: 0.5, w: 0.5, d: 0.1 } }
  for (const [kier, op] of Object.entries(oparcia)) {
    const nogi = [[0.04, 0.04], [0.48, 0.04], [0.04, 0.48], [0.48, 0.48]].map(([x, z]) => ({ x, z, w: 0.08, d: 0.08, h: 10, kolor: DR_C }))
    const szczeble = (sc, u, v) => (sc === 'gora' || v > 0.8 || v < 0.12 ? null : (Math.floor(u * 5) % 2 ? '#7d4a2c' : null))
    const { canvas, meta } = bryla(0.6, 0.6, [
      ...nogi,
      { x: 0, z: 0, y: 10, w: 0.6, d: 0.6, h: 2, kolor: DR, gora: SIEDZ },
      { ...op, y: 12, h: 15, kolor: DR, gora: '#b5764a', wzor: szczeble },
    ], { ziarno: 31 })
    zarejestruj('krzeslo_drewno_' + kier, canvas, meta)
  }
  // --- telewizor na szafce (ekran od strony +x)
  {
    const { canvas, meta } = bryla(0.9, 3.0, [
      { x: 0, z: 0, w: 0.9, d: 3.0, h: 12, kolor: '#5a3424', gora: '#6e4030' },
      { x: 0.35, z: 0.2, y: 12, w: 0.15, d: 2.6, h: 26, kolor: '#1b1e26', wzor: (sc, u, v) => (sc === 'prawa' && u > 0.04 && u < 0.96 && v > 0.08 && v < 0.94 ? (v > 0.5 ? '#2f7fc1' : '#4aa3e0') : null) },
    ], { ziarno: 18 })
    zarejestruj('telewizor', canvas, meta)
  }
  // --- tablica z wykresami na nóżkach (ekran od strony +x)
  {
    const wykres = (sc, u, v) => {
      if (sc !== 'prawa') return null
      if (u < 0.05 || u > 0.95 || v < 0.06 || v > 0.94) return '#6b4a2b'
      const kol = Math.floor(u * 7), wys = [0.3, 0.55, 0.4, 0.75, 0.6, 0.85, 0.5][kol]
      if (u > 0.12 && u < 0.88 && (u * 7) % 1 > 0.25 && (u * 7) % 1 < 0.75 && v > 0.15 && v < 0.15 + wys * 0.7) return kol % 2 ? '#ff7a45' : '#2ec4b6'
      if (Math.abs(v - 0.13) < 0.02) return '#3a3a3a'
      return '#f3efe2'
    }
    const { canvas, meta } = bryla(0.4, 2.0, [
      { x: 0.15, z: 0.2, w: 0.1, d: 0.1, h: 14, kolor: '#555b66' }, { x: 0.15, z: 1.7, w: 0.1, d: 0.1, h: 14, kolor: '#555b66' },
      { x: 0.12, z: 0, y: 14, w: 0.16, d: 2.0, h: 26, kolor: '#e9e5d8', wzor: wykres },
    ], { ziarno: 19 })
    zarejestruj('tablica', canvas, meta)
  }
  // --- ścianki działowe (segment 1 kafla) wzdłuż x i wzdłuż z
  const scianka = (sc, u, v) => (v > 0.8 ? (sc === 'gora' ? '#c48a5a' : '#a8703f') : null)
  {
    const a = bryla(1, 0.25, [{ x: 0, z: 0, w: 1, d: 0.25, h: 13, kolor: '#8c5634', gora: '#c48a5a', wzor: scianka }], { obrys: false, ziarno: 20 })
    zarejestruj('scianka_x', a.canvas, a.meta)
    const b = bryla(0.25, 1, [{ x: 0, z: 0, w: 0.25, d: 1, h: 13, kolor: '#8c5634', gora: '#c48a5a', wzor: scianka }], { obrys: false, ziarno: 21 })
    zarejestruj('scianka_z', b.canvas, b.meta)
  }
  // --- krzesło biurowe widziane od tyłu: oparcie od strony +x (osoba patrzy w -x)
  for (const [nazwa, kolor] of [['krzeslo_tyl', '#2d3a4a'], ['krzeslo_tyl_turkus', '#24695f'], ['krzeslo_tyl_czerwone', '#7a2f36']]) {
    const { canvas, meta } = bryla(0.7, 0.7, [
      { x: 0.3, z: 0.3, w: 0.1, d: 0.1, h: 7, kolor: '#30333b' },
      { x: 0.05, z: 0.3, w: 0.6, d: 0.1, h: 2, kolor: '#30333b' }, { x: 0.3, z: 0.05, w: 0.1, d: 0.6, h: 2, kolor: '#30333b' },
      { x: 0.1, z: 0.12, y: 7, w: 0.5, d: 0.46, h: 3, kolor },
      { x: 0.52, z: 0.08, y: 10, w: 0.14, d: 0.54, h: 14, kolor },
    ], { ziarno: 22 })
    zarejestruj(nazwa, canvas, meta)
  }
  // --- kosz na śmieci, skrzynka z kablami
  {
    const { canvas, meta } = bryla(0.4, 0.4, [{ x: 0, z: 0, w: 0.4, d: 0.4, h: 10, kolor: '#5d6474', gora: '#3c414c' }], { ziarno: 23 })
    zarejestruj('kosz', canvas, meta)
  }
}
