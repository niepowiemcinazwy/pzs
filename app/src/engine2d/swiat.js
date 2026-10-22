// Budowa świata 2D: warstwa tła (podłogi + ściany + dekoracje), meble jako obiekty z głębią, siatka ruchu.
import { iso } from './iso.js'
import { sprite } from './sprite.js'
import { Siatka } from './nawigacja.js'
import { zbudujArchitekture, segmentSzkla } from './wektor.js'
import {
  SZEROKOSC as W, GLEBOKOSC as D, WYS_SCIANY as HS, POKOJE, SCIANKI, NA_SCIANACH, STANOWISKA,
  WYPOSAZENIE, SZAFY, MIEJSCA_SPOTKAN, MIEJSCA_KUCHNIA, PUNKTY_KAWA,
} from './plan.js'

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mn = (c, k) => [c[0] * k, c[1] * k, c[2] * k]

function losowy(ziarno) {
  let s = ziarno >>> 0 || 1
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000 }
}
// deterministyczny "szum" dla kafla
const szumK = (a, b, c = 0) => {
  let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791)
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) % 1000 / 1000
}

// ---------------------------------------------------------------- budowa
export function zbudujSwiat() {
  const siatka = new Siatka(W, D, 0.5)
  const swiat = {
    siatka, obiekty: [], stanowiska: [], szafy: [], swiatla: [], monitory: [], okna: [],
    etykietyPokoi: [], granice: null,
  }

  // ---------- architektura (wektorowa: ostra przy każdym przybliżeniu)
  const SZER_OKNA = 3.2, OKNO_Y0 = 27, OKNO_Y1 = 56
  const dekoracje = []
  for (const n of NA_SCIANACH) {
    if (n.typ === 'okno') { swiat.okna.push({ ...n, szer: SZER_OKNA, y0: OKNO_Y0, y1: OKNO_Y1 }); continue }
    const dek = dekoracja(n.typ)
    if (!dek) continue
    const pol = dek.width / 32
    if (n.sciana === 'z0') { const p = iso(n.poz - pol, 0, n.y); dekoracje.push({ img: dek, x: p.sx, y: p.sy, skos: 0.5 }) }
    else { const p = iso(0, n.poz + pol, n.y); dekoracje.push({ img: dek, x: p.sx, y: p.sy, skos: -0.5, ciemniej: true }) }
  }
  const arch = zbudujArchitekture(swiat.okna, dekoracje)
  swiat.rysujTlo = arch.rysujTlo
  swiat.rysujPrzod = arch.rysujPrzod
  swiat.krokiTla = arch.krokiTla
  swiat.krokiPrzodu = arch.krokiPrzodu
  swiat.granice = { minX: -D * 16, maxX: W * 16, minY: -HS, maxY: (W + D) * 8 + 10 }

  // krawędzie biura i ściany tylne blokują ruch
  siatka.zablokujProstokat(0, 0, W, 0.4)
  siatka.zablokujProstokat(0, 0, 0.4, D)
  siatka.zablokujProstokat(W - 0.3, 0, W, D)
  siatka.zablokujProstokat(0, D - 0.3, W, D)

  const dodaj = (o) => { swiat.obiekty.push(o); return o }
  const blokuj = (x, z, w, d, m = 0.05) => siatka.zablokujProstokat(x - w / 2 - m, z - d / 2 - m, x + w / 2 + m, z + d / 2 + m)

  // ---------- szklane ścianki działowe (segmenty po 1 kaflu, żeby dobrze się sortowały z postaciami)
  for (const s of SCIANKI) {
    for (let t = s.od; t < s.do - 0.01; t += 1) {
      const dl = Math.min(1, s.do - t)
      dodaj(segmentSzkla(s.os, s.os === 'x' ? s.z : s.x, t, dl))
    }
    if (s.os === 'x') siatka.zablokujProstokat(s.od, s.z - 0.2, s.do, s.z + 0.2)
    else siatka.zablokujProstokat(s.x - 0.2, s.od, s.x + 0.2, s.do)
  }

  // ---------- wyposażenie
  for (const w of WYPOSAZENIE) {
    const sp = sprite(w.s, !!w.odb)
    dodaj({ x: w.x, z: w.z, y: w.y ?? 0, sp, glebia: w.plaski ? -1000 + w.x + w.z : w.x + w.z + (w.y ? 0.3 : 0), typ: 'mebel' })
    if (w.blok !== false && !w.plaski) blokuj(w.x, w.z, sp.w, sp.d)
    if (w.swiatlo) swiat.swiatla.push({ x: w.x, z: w.z, y: 40, kolor: '255,190,110', r: 70, sila: 0.22 })
  }

  // ---------- stanowiska
  for (const st of STANOWISKA) {
    const sp = sprite(st.model, st.odbite)
    dodaj({ x: st.x, z: st.z, sp, glebia: st.x + st.z, typ: 'biurko' })
    blokuj(st.x, st.z, sp.w, sp.d, 0.02)
    const wysBlatu = st.model.startsWith('biurko_') && !['biurko_laptop', 'biurko_krzeslo'].includes(st.model) ? 22 : 18
    // monitory na biurku (ekran w stronę osoby)
    const monOdb = st.orient === 'A'
    for (let k = 0; k < st.monitory; k++) {
      const przes = st.monitory === 1 ? 0 : (k - 0.5) * 0.9
      const mx = st.orient === 'A' ? st.x - 0.12 : st.x + przes
      const mz = st.orient === 'A' ? st.z + przes : st.z - 0.12
      dodaj({ x: mx, z: mz, y: wysBlatu, sp: sprite('monitor', monOdb), glebia: st.x + st.z + 0.05 + k * 0.01, typ: 'monitor' })
      swiat.monitory.push({ x: mx, z: mz, y: wysBlatu + 12 })
    }
    if (st.lampka) {
      const lx = st.orient === 'A' ? st.x - 0.1 : st.x + 1.05
      const lz = st.orient === 'A' ? st.z - 1.05 : st.z - 0.1
      dodaj({ x: lx, z: lz, y: wysBlatu, sp: sprite('lampka'), glebia: st.x + st.z + 0.04, typ: 'lampka' })
      swiat.swiatla.push({ x: lx, z: lz, y: wysBlatu + 14, kolor: '255,196,120', r: 46, sila: 0.26 })
    }
    if (st.rzeczy) for (const r of st.rzeczy) dodaj({ x: st.x + r.dx, z: st.z + r.dz, y: wysBlatu, sp: sprite(r.s), glebia: st.x + st.z + 0.03, typ: 'drobiazg' })
    const s = st.siedzisko
    let krzeslo = null
    if (st.krzeslo) krzeslo = dodaj({ x: s.x, z: s.z, sp: sprite(st.krzeslo, st.orient === 'B'), glebia: s.x + s.z + 0.2, typ: 'krzeslo' })
    siatka.odblokuj(s.x, s.z)
    swiat.stanowiska.push({ ...st, wysBlatu, krzeslo, biurko: { x: st.x, z: st.z } })
  }

  // ---------- sala konferencyjna: krzesła
  for (const m of MIEJSCA_SPOTKAN) {
    dodaj({ x: m.x, z: m.z, sp: sprite('krzeslo_drewno_' + m.kier), glebia: m.x + m.z - 0.15, typ: 'krzeslo' })
    siatka.odblokuj(m.x, m.z)
  }
  for (const m of MIEJSCA_KUCHNIA) {
    dodaj({ x: m.x, z: m.z, sp: sprite('krzeslo_drewno_' + m.kier), glebia: m.x + m.z - 0.15, typ: 'krzeslo' })
    siatka.odblokuj(m.x, m.z)
  }
  for (const m of PUNKTY_KAWA) siatka.odblokuj(m.x, m.z)

  // ---------- szafy serwerowe
  for (const s of SZAFY) {
    const o = dodaj({ x: s.x, z: s.z, sp: sprite('serwer_0'), glebia: s.x + s.z, typ: 'szafa', id: s.id, klikalny: true })
    blokuj(s.x, s.z, 0.9, 1.0)
    const punkt = { x: s.x, z: s.z + 1.25 }
    siatka.odblokuj(punkt.x, punkt.z)
    swiat.szafy.push({ id: s.id, obiekt: o, punkt, faza: Math.floor(Math.random() * 3), alarmAktywny: false, x: s.x, z: s.z })
  }
  swiat.swiatla.push({ x: 44, z: 21, y: 60, kolor: '90,180,255', r: 150, sila: 0.16 })

  // ---------- etykiety pokoi (przy przedniej krawędzi)
  for (const p of POKOJE) {
    if (p.ukryty) continue
    swiat.etykietyPokoi.push({ pokoj: p, x: (p.x0 + p.x1) / 2, z: p.z1 - 0.6, y: 6 })
  }
  return swiat
}

// ---------------------------------------------------------------- dekoracje ścienne (małe pikselowe obrazki)
function dekoracja(typ) {
  const c = document.createElement('canvas')
  const g = c.getContext('2d')
  const px = (x, y, w, h, k) => { g.fillStyle = k; g.fillRect(x, y, w, h) }
  if (typ === 'szyld') {
    const tekst = 'TEAM ENVIRONMENT'
    g.font = '8px "Tiny5"'
    const szer = Math.ceil(g.measureText(tekst).width) + 8
    c.width = szer; c.height = 13
    px(0, 0, szer, 13, '#14213d')
    g.font = '8px "Tiny5"'; g.fillStyle = '#ffc145'; g.textBaseline = 'alphabetic'
    g.fillText(tekst, 4, 10)
    progowanie(c)
    px(0, 0, szer, 1, '#ffc145'); px(0, 12, szer, 1, '#ffc145'); px(0, 0, 1, 13, '#ffc145'); px(szer - 1, 0, 1, 13, '#ffc145')
    return c
  }
  if (typ === 'obraz') {
    c.width = 22; c.height = 16
    px(0, 0, 22, 16, '#4a2c1a'); px(2, 2, 18, 12, '#7fb2d8'); px(2, 8, 18, 6, '#5f8f4a'); px(13, 3, 3, 3, '#ffe28a')
    for (let x = 2; x < 20; x++) px(x, 8 - Math.round(2 + Math.sin(x * 0.7) * 2), 1, 2, '#41633a')
    return c
  }
  if (typ === 'tablica_korkowa') {
    c.width = 28; c.height = 18
    px(0, 0, 28, 18, '#6b4a2b'); px(1, 1, 26, 16, '#c69c6d')
    const kartki = [['#fff4a8', 3, 3], ['#ffb3c1', 11, 4], ['#a8e6ff', 19, 3], ['#bff2b2', 6, 10], ['#fff4a8', 15, 10]]
    for (const [k, x, y] of kartki) { px(x, y, 6, 5, k); px(x + 2, y, 1, 1, '#d33') }
    return c
  }
  if (typ === 'zegar') {
    c.width = 12; c.height = 12
    px(2, 0, 8, 12, '#2a2a33'); px(0, 2, 12, 8, '#2a2a33'); px(2, 2, 8, 8, '#f4f1e8'); px(1, 3, 10, 6, '#f4f1e8')
    px(5, 3, 1, 3, '#222'); px(6, 5, 3, 1, '#c33')
    return c
  }
  return null
}

function progowanie(c) {
  // bez wygładzania tekstu: każdy piksel albo tło, albo kolor napisu
  const g = c.getContext('2d')
  const d = g.getImageData(0, 0, c.width, c.height)
  for (let i = 0; i < d.data.length; i += 4) {
    const jas = d.data[i] + d.data[i + 1] + d.data[i + 2]
    if (d.data[i] > 140) { d.data[i] = 255; d.data[i + 1] = 193; d.data[i + 2] = 69 } else { d.data[i] = 20; d.data[i + 1] = 33; d.data[i + 2] = 61 }
    d.data[i + 3] = 255
  }
  g.putImageData(d, 0, 0)
  return c
}
