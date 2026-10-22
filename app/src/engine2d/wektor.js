// Wektorowe rysowanie architektury: podłogi, ściany, okna, szkło. Ścieżki budowane raz (we współrzędnych świata),
// a rysowane w każdej klatce przez transformację kamery - dzięki temu są ostre przy każdym przybliżeniu.
// Pixel-art zostaje tylko dla mebli, postaci i drobnych dodatków.
import { iso } from './iso.js'
import { SZEROKOSC as W, GLEBOKOSC as D, WYS_SCIANY as HS, POKOJE } from './plan.js'
import { DZIALY } from '../dane/przykladowe.js'

const szum = (a, b, c = 0) => {
  let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791)
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) % 1000 / 1000
}
function przyciemnij(hex, k) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)))
  return `rgb(${f(r)},${f(g)},${f(b)})`
}

/** Ścieżka czworokąta na podłodze (x0..x1, z0..z1) na wysokości y. */
function quad(p, x0, z0, x1, z1, y = 0) {
  const a = iso(x0, z0, y), b = iso(x1, z0, y), c = iso(x1, z1, y), d = iso(x0, z1, y)
  p.moveTo(a.sx, a.sy); p.lineTo(b.sx, b.sy); p.lineTo(c.sx, c.sy); p.lineTo(d.sx, d.sy); p.closePath()
}
/** Ścieżka prostokąta w płaszczyźnie ściany z = zc (od x0 do x1, wysokości h0..h1). */
function scianaZ(p, zc, x0, x1, h0, h1) {
  const a = iso(x0, zc, h0), b = iso(x1, zc, h0), c = iso(x1, zc, h1), d = iso(x0, zc, h1)
  p.moveTo(a.sx, a.sy); p.lineTo(b.sx, b.sy); p.lineTo(c.sx, c.sy); p.lineTo(d.sx, d.sy); p.closePath()
}
/** Ścieżka prostokąta w płaszczyźnie ściany x = xc (od z0 do z1, wysokości h0..h1). */
function scianaX(p, xc, z0, z1, h0, h1) {
  const a = iso(xc, z0, h0), b = iso(xc, z1, h0), c = iso(xc, z1, h1), d = iso(xc, z0, h1)
  p.moveTo(a.sx, a.sy); p.lineTo(b.sx, b.sy); p.lineTo(c.sx, c.sy); p.lineTo(d.sx, d.sy); p.closePath()
}
function linia(p, a, b) { p.moveTo(a.sx, a.sy); p.lineTo(b.sx, b.sy) }

// ---------------------------------------------------------------- podłogi
const STYL_PODLOG = {
  szachownica: { baza: '#c99c62', druga: '#b3864f', fuga: '#8f6a3c', kafel: 1 },
  szachownica_chlodna: { baza: '#bcc3ca', druga: '#98a2ad', fuga: '#78828d', kafel: 1 },
  deski_ciemne: { deski: '#6e4329', fuga: '#4a2b19' },
  deski_jasne: { deski: '#a87346', fuga: '#7a5030' },
  deski_korytarz: { deski: '#8d5c37', fuga: '#623e23' },
  wykladzina_bordo: { baza: '#7a2f3a', fuga: '#6a2832', siatka: 2 },
  wykladzina_zielona: { baza: '#3d6650', fuga: '#345846', siatka: 2 },
  wykladzina_fiolet: { baza: '#4f4878', fuga: '#443e68', siatka: 2 },
  plytki: { baza: '#e2dbcb', fuga: '#b5ac98', siatka: 0.5 },
  kratka: { baza: '#4a5260', fuga: '#5d6676', siatka: 0.5, kropki: true },
}

function budujPodlogi() {
  const warstwy = [] // { path, fill?, stroke?, szer? }
  for (const p of POKOJE) {
    const st = STYL_PODLOG[p.podloga]
    const caly = new Path2D(); quad(caly, p.x0, p.z0, p.x1, p.z1)
    if (st.deski) {
      // deski wzdłuż x, rzędy co 0.5 kafla, przesunięte łączenia, kilka odcieni
      warstwy.push({ path: caly, fill: st.deski })
      const odcienie = [0.9, 0.97, 1.04, 1.1].map((k) => ({ path: new Path2D(), fill: przyciemnij(st.deski, k) }))
      const fugi = new Path2D()
      for (let r = 0; p.z0 + r * 0.5 < p.z1; r++) {
        const z0 = p.z0 + r * 0.5, z1 = Math.min(p.z1, z0 + 0.5)
        let x = p.x0 - szum(r, p.x0) * 2.5
        let n = 0
        while (x < p.x1) {
          const dl = 2 + szum(r, n, p.z0) * 1.5
          const a = Math.max(p.x0, x), b = Math.min(p.x1, x + dl)
          quad(odcienie[Math.floor(szum(r, n, 7) * 4)].path, a, z0, b, z1)
          if (x + dl < p.x1) linia(fugi, iso(x + dl, z0), iso(x + dl, z1))
          x += dl; n++
        }
        linia(fugi, iso(p.x0, z0), iso(p.x1, z0))
      }
      warstwy.push(...odcienie)
      warstwy.push({ path: fugi, stroke: st.fuga, szer: 0.7 })
    } else {
      warstwy.push({ path: caly, fill: st.baza })
      if (st.druga) {
        const druga = new Path2D()
        for (let x = p.x0; x < p.x1; x++) for (let z = p.z0; z < p.z1; z++) if ((x + z) % 2) quad(druga, x, z, x + 1, z + 1)
        warstwy.push({ path: druga, fill: st.druga })
        // jasna krawędź kafla (od strony światła)
        const blask = new Path2D()
        for (let x = p.x0; x < p.x1; x++) for (let z = p.z0; z < p.z1; z++) { linia(blask, iso(x + 0.06, z + 0.06), iso(x + 0.94, z + 0.06)) }
        warstwy.push({ path: blask, stroke: 'rgba(255,255,255,0.12)', szer: 0.8 })
      }
      const k = st.kafel ?? st.siatka
      if (k) {
        const fugi = new Path2D()
        for (let x = p.x0; x <= p.x1 + 1e-6; x += k) linia(fugi, iso(x, p.z0), iso(x, p.z1))
        for (let z = p.z0; z <= p.z1 + 1e-6; z += k) linia(fugi, iso(p.x0, z), iso(p.x1, z))
        warstwy.push({ path: fugi, stroke: st.fuga, szer: st.druga ? 0.7 : 0.6 })
      }
      if (st.kropki) {
        const kr = new Path2D()
        for (let x = p.x0 + 0.25; x < p.x1; x += 0.5) for (let z = p.z0 + 0.25; z < p.z1; z += 0.5) quad(kr, x - 0.04, z - 0.04, x + 0.04, z + 0.04)
        warstwy.push({ path: kr, fill: '#363c48' })
      }
    }
  }
  // cień przy tylnych ścianach
  const c1 = new Path2D(); quad(c1, 0, 0, W, 0.35); quad(c1, 0, 0.35, 0.35, D)
  const c2 = new Path2D(); quad(c2, 0, 0.35, W, 0.8); quad(c2, 0.35, 0.8, 0.8, D)
  warstwy.push({ path: c1, fill: 'rgba(0,0,0,0.22)' }, { path: c2, fill: 'rgba(0,0,0,0.1)' })
  // krawędź płyty biura z przodu
  const plytaP = new Path2D(); scianaX(plytaP, W, 0, D, -10, 0)
  const plytaL = new Path2D(); scianaZ(plytaL, D, 0, W, -10, 0)
  warstwy.push({ path: plytaP, fill: '#4a2f1d' }, { path: plytaL, fill: '#5d3c25' })
  const listwa = new Path2D(); linia(listwa, iso(W, 0, 0), iso(W, D, 0)); linia(listwa, iso(0, D, 0), iso(W, D, 0))
  warstwy.push({ path: listwa, stroke: '#c48a5a', szer: 1.5 })
  return warstwy
}

// ---------------------------------------------------------------- ściany tylne
const SZ_OKNA = 3.2, OKNO_H0 = 27, OKNO_H1 = 56

function budujScianyTylne(okna) {
  const w = []
  // korpus
  const gornaZ = new Path2D(); scianaZ(gornaZ, 0, 0, W, 25, HS)
  const gornaX = new Path2D(); scianaX(gornaX, 0, 0, D, 25, HS)
  const boazZ = new Path2D(); scianaZ(boazZ, 0, 0, W, 0, 22)
  const boazX = new Path2D(); scianaX(boazX, 0, 0, D, 0, 22)
  const listZ = new Path2D(); scianaZ(listZ, 0, 0, W, 22, 25)
  const listX = new Path2D(); scianaX(listX, 0, 0, D, 22, 25)
  w.push({ path: gornaZ, fill: '#34446e' }, { path: gornaX, fill: '#2b3a5f' })
  w.push({ path: boazZ, fill: '#7a4a2c' }, { path: boazX, fill: '#683e24' })
  w.push({ path: listZ, fill: '#b07745' }, { path: listX, fill: '#97643a' })
  // listwy boazerii (pionowe)
  const pion = new Path2D()
  for (let x = 0.5; x < W; x += 0.5) linia(pion, iso(x, 0, 1), iso(x, 0, 21))
  for (let z = 0.5; z < D; z += 0.5) linia(pion, iso(0, z, 1), iso(0, z, 21))
  w.push({ path: pion, stroke: 'rgba(30,15,8,0.45)', szer: 0.6 })
  const cokol = new Path2D(); scianaZ(cokol, 0, 0, W, 0, 2); scianaX(cokol, 0, 0, D, 0, 2)
  w.push({ path: cokol, fill: '#3a2414' })
  // tapeta: delikatne pionowe pasy
  const pasy = new Path2D()
  for (let x = 1; x < W; x += 1) linia(pasy, iso(x, 0, 26), iso(x, 0, HS - 1))
  for (let z = 1; z < D; z += 1) linia(pasy, iso(0, z, 26), iso(0, z, HS - 1))
  w.push({ path: pasy, stroke: 'rgba(255,255,255,0.05)', szer: 0.6 })
  // okna
  for (const o of okna) {
    const naZ = o.sciana === 'z0'
    const sc = naZ ? (p, a, b, h0, h1) => scianaZ(p, 0, a, b, h0, h1) : (p, a, b, h0, h1) => scianaX(p, 0, a, b, h0, h1)
    const L = (a, h) => (naZ ? iso(a, 0, h) : iso(0, a, h))
    const a = o.poz - SZ_OKNA / 2, b = o.poz + SZ_OKNA / 2
    const rama = new Path2D(); sc(rama, a, b, OKNO_H0, OKNO_H1)
    const szyba = new Path2D(); sc(szyba, a + 0.18, o.poz - 0.08, OKNO_H0 + 2, OKNO_H1 - 2); sc(szyba, o.poz + 0.08, b - 0.18, OKNO_H0 + 2, OKNO_H1 - 2)
    const zaluzje = new Path2D()
    for (let h = OKNO_H0 + 4; h < OKNO_H1 - 2; h += 2.5) { linia(zaluzje, L(a + 0.18, h), L(o.poz - 0.08, h)); linia(zaluzje, L(o.poz + 0.08, h), L(b - 0.18, h)) }
    const parapet = new Path2D(); sc(parapet, a - 0.15, b + 0.15, OKNO_H0 - 3, OKNO_H0)
    w.push({ path: rama, fill: naZ ? '#5b3a22' : '#4d311c' })
    w.push({ path: szyba, fill: naZ ? '#ffcf7a' : '#e8b866' })
    w.push({ path: zaluzje, stroke: 'rgba(160,90,30,0.45)', szer: 0.8 })
    w.push({ path: parapet, fill: naZ ? '#d29c69' : '#b9875a' })
  }
  // gzyms (górna krawędź ściany, widoczna grubość)
  const gzymsZ = new Path2D(); quad(gzymsZ, -0.25, -0.25, W, 0, HS)
  const gzymsX = new Path2D(); quad(gzymsX, -0.25, 0, 0, D, HS)
  w.push({ path: gzymsZ, fill: '#c99766' }, { path: gzymsX, fill: '#b5845a' })
  const gzL = new Path2D(); linia(gzL, iso(0, 0, HS), iso(W, 0, HS)); linia(gzL, iso(0, 0, HS), iso(0, D, HS)); linia(gzL, iso(0, 0, 0), iso(0, 0, HS))
  w.push({ path: gzL, stroke: '#1d120c', szer: 1 })
  return w
}

// ---------------------------------------------------------------- ściany zewnętrzne od strony kamery
function budujScianyPrzednie() {
  const w = []
  const korpusP = new Path2D(); scianaX(korpusP, W, 0, D, 9, HS)
  const korpusL = new Path2D(); scianaZ(korpusL, D, 0, W, 9, HS)
  const cokolP = new Path2D(); scianaX(cokolP, W, 0, D, 0, 9)
  const cokolL = new Path2D(); scianaZ(cokolL, D, 0, W, 0, 9)
  w.push({ path: korpusP, fill: '#33405e' }, { path: korpusL, fill: '#3d4b6c' })
  w.push({ path: cokolP, fill: '#3b2c25' }, { path: cokolL, fill: '#47362d' })
  const pasy = new Path2D()
  for (const h of [18, 36, 54]) { linia(pasy, iso(W, 0, h), iso(W, D, h)); linia(pasy, iso(0, D, h), iso(W, D, h)) }
  w.push({ path: pasy, stroke: 'rgba(0,0,0,0.18)', szer: 0.7 })
  // okna co 5 kafli
  const ramy = new Path2D(), szyby = new Path2D(), blik = new Path2D()
  for (let z = 1.2; z + 2.6 <= D; z += 5) {
    scianaX(ramy, W, z, z + 2.6, 26, 54); scianaX(szyby, W, z + 0.15, z + 1.22, 28, 52); scianaX(szyby, W, z + 1.38, z + 2.45, 28, 52)
    linia(blik, iso(W, z + 0.3, 34), iso(W, z + 0.9, 46))
  }
  for (let x = 1.2; x + 2.6 <= W; x += 5) {
    scianaZ(ramy, D, x, x + 2.6, 26, 54); scianaZ(szyby, D, x + 0.15, x + 1.22, 28, 52); scianaZ(szyby, D, x + 1.38, x + 2.45, 28, 52)
    linia(blik, iso(x + 0.3, D, 34), iso(x + 0.9, D, 46))
  }
  w.push({ path: ramy, fill: '#c99766' }, { path: szyby, fill: '#22304b' }, { path: blik, stroke: 'rgba(160,190,240,0.5)', szer: 1.2 })
  return w
}
function budujGzymsPrzedni() {
  const w = []
  const gz = new Path2D(); quad(gz, W, 0, W + 0.25, D + 0.25, HS); quad(gz, 0, D, W, D + 0.25, HS)
  w.push({ path: gz, fill: '#c99766' })
  const kr = new Path2D()
  linia(kr, iso(W, 0, 0), iso(W, 0, HS)); linia(kr, iso(0, D, 0), iso(0, D, HS)); linia(kr, iso(W, D, 0), iso(W, D, HS))
  linia(kr, iso(W, 0, HS), iso(W, D, HS)); linia(kr, iso(0, D, HS), iso(W, D, HS))
  w.push({ path: kr, stroke: '#1d120c', szer: 1.2 })
  return w
}

function rysujWarstwy(g, warstwy, zoom) {
  for (const l of warstwy) {
    if (l.fill) { g.fillStyle = l.fill; g.fill(l.path) }
    if (l.stroke) { g.strokeStyle = l.stroke; g.lineWidth = Math.max(l.szer / Math.max(1, zoom * 0.55), 1 / zoom); g.stroke(l.path) }
  }
}

/** Buduje rysowanie architektury. Zwraca funkcje do silnika. */
export function zbudujArchitekture(okna, dekoracje) {
  for (const d of dekoracje) {
    if (!d.ciemniej) continue
    const c = document.createElement('canvas'); c.width = d.img.width; c.height = d.img.height
    const g = c.getContext('2d'); g.drawImage(d.img, 0, 0)
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(0, 0, c.width, c.height)
    d.img = c; d.ciemniej = false
  }
  const podlogi = budujPodlogi()
  const tylne = budujScianyTylne(okna)
  const przednie = budujScianyPrzednie()
  const gzyms = budujGzymsPrzedni()
  // kroki rysowania (do budowania bufora po kawałku, w kilku klatkach)
  const krok = (l) => (g, zoom) => rysujWarstwy(g, [l], zoom)
  const krokiTla = [...podlogi.map(krok), ...tylne.map(krok), (g) => {
    g.imageSmoothingEnabled = false
    for (const d of dekoracje) { g.save(); g.transform(1, d.skos, 0, 1, d.x, d.y); g.drawImage(d.img, 0, 0); g.restore() }
  }]
  const krokiPrzodu = przednie.map(krok)
  return {
    krokiTla, krokiPrzodu,
    rysujTlo(g, zoom) {
      g.lineJoin = 'round'
      rysujWarstwy(g, podlogi, zoom)
      rysujWarstwy(g, tylne, zoom)
      g.imageSmoothingEnabled = false
      for (const d of dekoracje) {
        g.save()
        g.transform(1, d.skos, 0, 1, d.x, d.y)
        g.drawImage(d.img, 0, 0)
        g.restore()
      }
    },
    rysujPrzod(g, zoom, alfa, co = 'wszystko') {
      if (co !== 'gzyms' && alfa > 0) { g.globalAlpha = alfa; rysujWarstwy(g, przednie, zoom); g.globalAlpha = 1 }
      if (co !== 'sciany') rysujWarstwy(g, gzyms, zoom)
    },
  }
}

// ---------------------------------------------------------------- szklane ścianki (obiekty sortowane po głębi)
export const WYS_SZKLA = 46
const kolorDzialu = (id) => DZIALY.find((d) => d.id === id)?.kolor

/** Kolor akcentu dla ścianki: dział po jednej ze stron. */
function akcent(os, stala, t) {
  const probki = os === 'x' ? [[t, stala - 0.3], [t, stala + 0.3]] : [[stala - 0.3, t], [stala + 0.3, t]]
  for (const [x, z] of probki) {
    const p = POKOJE.find((r) => !r.ukryty && x >= r.x0 && x < r.x1 && z >= r.z0 && z < r.z1)
    if (p?.dzial) return kolorDzialu(p.dzial)
  }
  return '#c9b48a'
}

/** Obiekt jednego segmentu szkła (długość dl, od t). */
export function segmentSzkla(os, stala, t, dl) {
  const P = (u, h) => (os === 'x' ? iso(t + u, stala, h) : iso(stala, t + u, h))
  const tafla = new Path2D()
  { const a = P(0, 2), b = P(dl, 2), c = P(dl, WYS_SZKLA - 2), d = P(0, WYS_SZKLA - 2); tafla.moveTo(a.sx, a.sy); tafla.lineTo(b.sx, b.sy); tafla.lineTo(c.sx, c.sy); tafla.lineTo(d.sx, d.sy); tafla.closePath() }
  const odblask = new Path2D()
  if (dl > 0.5) {
    const a = P(dl * 0.2, 8), b = P(dl * 0.32, 8), c = P(dl * 0.62, WYS_SZKLA - 8), d = P(dl * 0.5, WYS_SZKLA - 8)
    odblask.moveTo(a.sx, a.sy); odblask.lineTo(b.sx, b.sy); odblask.lineTo(c.sx, c.sy); odblask.lineTo(d.sx, d.sy); odblask.closePath()
  }
  const rama = new Path2D()
  linia(rama, P(0, 0), P(dl, 0)); linia(rama, P(0, WYS_SZKLA), P(dl, WYS_SZKLA))
  linia(rama, P(0, 0), P(0, WYS_SZKLA)); linia(rama, P(dl, 0), P(dl, WYS_SZKLA))
  const pasek = new Path2D(); linia(pasek, P(0, WYS_SZKLA - 3), P(dl, WYS_SZKLA - 3))
  const kolor = akcent(os, stala, t + dl / 2)
  const srodek = t + dl / 2
  const rogi = [P(0, 0), P(dl, 0), P(0, WYS_SZKLA), P(dl, WYS_SZKLA)]
  const bx = Math.min(...rogi.map((q) => q.sx)) - 3, by = Math.min(...rogi.map((q) => q.sy)) - 3
  const bbox = { x: bx, y: by, w: Math.max(...rogi.map((q) => q.sx)) + 3 - bx, h: Math.max(...rogi.map((q) => q.sy)) + 3 - by }
  return {
    bbox,
    x: os === 'x' ? srodek : stala, z: os === 'x' ? stala : srodek,
    glebia: (os === 'x' ? srodek + stala : stala + srodek) + 0.12,
    typ: 'szklo',
    rysuj(g, zoom) {
      g.fillStyle = 'rgba(165,215,240,0.13)'; g.fill(tafla)
      g.fillStyle = 'rgba(255,255,255,0.14)'; g.fill(odblask)
      g.lineWidth = Math.max(0.9, 1.6 / Math.max(1, zoom * 0.6)); g.strokeStyle = kolor; g.globalAlpha = 0.85; g.stroke(pasek); g.globalAlpha = 1
      g.lineWidth = Math.max(1.1, 2.2 / Math.max(1, zoom * 0.6)); g.strokeStyle = '#272a35'; g.lineCap = 'square'; g.stroke(rama)
    },
  }
}
