// Silnik 2D: kamera (zoom do kursora, przeciąganie), rysowanie warstw i obiektów posortowanych po głębi,
// światła, wskazywanie obiektów myszą.
import { iso, zIso } from './iso.js'

export class Silnik {
  constructor(canvas) {
    this.canvas = canvas
    this.g = canvas.getContext('2d', { alpha: false })
    this.swiat = null
    this.kam = { x: 0, y: 0, zoom: 2 }
    this.minZoom = 0.8
    this.maxZoom = 7
    this.domyslny = null
    this.przelot = null
    this.sledzony = null
    this.dynamiczne = () => []   // funkcja zwracająca obiekty dynamiczne (postacie) na tę klatkę
    this.naKlik = () => {}
    this.naRuch = () => {}
    this.czas = 0
    this.efekty = true
    this.alfaScian = 1
    this._zrzutObiektow = []
    this.dopasuj()
    window.addEventListener('resize', () => { this.dopasuj(); if (this.domyslny) this.domyslny = this._obliczDomyslny(this._marg) })
    this._sterowanie()
  }

  get zoom() { return this.kam.zoom }

  dopasuj() {
    const w = Math.max(1, this.canvas.clientWidth || window.innerWidth)
    const h = Math.max(1, this.canvas.clientHeight || window.innerHeight)
    // ostrość na ekranach ze skalowaniem Windows (125%, 150%...)
    this.dpr = window.devicePixelRatio || 1
    this.canvas.width = Math.round(w * this.dpr); this.canvas.height = Math.round(h * this.dpr)
    this.szer = w; this.wys = h
    this.g.imageSmoothingEnabled = false
  }

  ustawSwiat(swiat) { this.swiat = swiat }

  // ---------------------------------------------------------------- współrzędne
  /** Punkt świata -> piksel ekranu (CSS). */
  naEkran(x, z, y = 0) {
    const p = iso(x, z, y)
    return { x: (p.sx - this.kam.x) * this.kam.zoom + this.szer / 2, y: (p.sy - this.kam.y) * this.kam.zoom + this.wys / 2 }
  }
  /** Piksel ekranu -> piksel płótna świata. */
  _doSwiata(px, py) { return { sx: (px - this.szer / 2) / this.kam.zoom + this.kam.x, sy: (py - this.wys / 2) / this.kam.zoom + this.kam.y } }
  /** Piksel ekranu -> punkt na podłodze. */
  punktPodlogi(px, py) { const { sx, sy } = this._doSwiata(px, py); return zIso(sx, sy) }

  // ---------------------------------------------------------------- kamera
  _obliczDomyslny(m = { gora: 90, dol: 60, lewo: 270, prawo: 30 }) {
    const gr = this.swiat.granice
    const dostW = this.szer - m.lewo - m.prawo, dostH = this.wys - m.gora - m.dol
    const zoom = Math.max(0.6, Math.min(dostW / (gr.maxX - gr.minX), dostH / (gr.maxY - gr.minY)))
    const srodekX = (gr.minX + gr.maxX) / 2, srodekY = (gr.minY + gr.maxY) / 2
    // przesunięcie tak, by środek świata był w środku wolnego obszaru
    const ekranSrX = m.lewo + dostW / 2, ekranSrY = m.gora + dostH / 2
    return { x: srodekX - (ekranSrX - this.szer / 2) / zoom, y: srodekY - (ekranSrY - this.wys / 2) / zoom, zoom }
  }

  ustawDomyslny(marg) {
    this._marg = marg
    this.domyslny = this._obliczDomyslny(marg)
    this.minZoom = Math.min(this.domyslny.zoom * 0.85, 1.2)
    return this.domyslny
  }

  doDomyslnego(czas = 0.8) {
    this.sledzony = null
    const d = this.domyslny
    if (!d) return
    if (czas <= 0) { this.kam = { ...d }; return }
    this.przelot = { od: { ...this.kam }, do: { ...d }, t: 0, czas }
  }

  /** Przelot kamery do punktu świata (x, z) z danym zoomem. przesX: przesunięcie celu na ekranie (np. pod panel). */
  lecDo(x, z, zoom = this.kam.zoom, czas = 0.8, przesX = 0) {
    const p = iso(x, z, 18)
    const cel = { x: p.sx + przesX / zoom, y: p.sy, zoom }
    if (czas <= 0) { this.kam = cel; return }
    this.przelot = { od: { ...this.kam }, do: cel, t: 0, czas }
  }

  sledz(obj, przesX = 0) { this.sledzony = obj; this._przesSledz = przesX }

  przybliz(f, px = this.szer / 2, py = this.wys / 2) {
    this.przelot = null
    const przed = this._doSwiata(px, py)
    this.kam.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.kam.zoom * f))
    const po = this._doSwiata(px, py)
    this.kam.x += przed.sx - po.sx
    this.kam.y += przed.sy - po.sy
    this._ogranicz()
  }

  _ogranicz() {
    const gr = this.swiat?.granice
    if (!gr) return
    this.kam.x = Math.max(gr.minX - 100, Math.min(gr.maxX + 100, this.kam.x))
    this.kam.y = Math.max(gr.minY - 100, Math.min(gr.maxY + 100, this.kam.y))
  }

  // ---------------------------------------------------------------- sterowanie (jak w Playground: kółko = zoom do kursora, przeciąganie = przesuw)
  _sterowanie() {
    const c = this.canvas
    c.addEventListener('wheel', (e) => {
      e.preventDefault()
      this.sledzony = null
      const f = e.deltaY < 0 ? 1.15 : 1 / 1.15
      this.przybliz(f, e.offsetX, e.offsetY)
    }, { passive: false })
    c.addEventListener('pointerdown', (e) => {
      if (e.button === 1) e.preventDefault()
      this._ciag = { x: e.clientX, y: e.clientY, ruszyl: false, przycisk: e.button }
      c.setPointerCapture(e.pointerId)
    })
    c.addEventListener('pointermove', (e) => {
      const p = this._ciag
      if (p) {
        const dx = e.clientX - p.x, dy = e.clientY - p.y
        if (!p.ruszyl && Math.hypot(dx, dy) > 4) { p.ruszyl = true; this.przelot = null; this.sledzony = null; c.classList.add('przeciaganie') }
        if (p.ruszyl) {
          this.kam.x -= dx / this.kam.zoom
          this.kam.y -= dy / this.kam.zoom
          p.x = e.clientX; p.y = e.clientY
          this._ogranicz()
        }
      }
      this.naRuch(e.offsetX, e.offsetY, !!(p && p.ruszyl))
    })
    const koniec = (e) => {
      const p = this._ciag
      this._ciag = null
      c.classList.remove('przeciaganie')
      if (p && !p.ruszyl && p.przycisk === 0) this.naKlik(e.offsetX, e.offsetY, e)
    }
    c.addEventListener('pointerup', koniec)
    c.addEventListener('pointercancel', () => { this._ciag = null; c.classList.remove('przeciaganie') })
    c.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  // ---------------------------------------------------------------- wskazywanie
  /** Obiekt pod kursorem (postać albo klikalny mebel) - test pikselowy po alfie. */
  trafienie(px, py) {
    const { sx, sy } = this._doSwiata(px, py)
    for (let i = this._zrzutObiektow.length - 1; i >= 0; i--) {
      const o = this._zrzutObiektow[i]
      if (!o.klikalny) continue
      const r = o._r
      if (!r || sx < r.x || sy < r.y || sx >= r.x + r.w || sy >= r.y + r.h) continue
      if (o.typ === 'postac') return o
      if (this._alfa(o, sx - r.x, sy - r.y)) return o
    }
    return null
  }

  _alfa(o, x, y) {
    try {
      const img = o.img ?? o.sp.img
      if (!this._testC) { this._testC = document.createElement('canvas'); this._testC.width = 1; this._testC.height = 1; this._testG = this._testC.getContext('2d', { willReadFrequently: true }) }
      this._testG.clearRect(0, 0, 1, 1)
      this._testG.drawImage(img, Math.floor(x), Math.floor(y), 1, 1, 0, 0, 1, 1)
      return this._testG.getImageData(0, 0, 1, 1).data[3] > 20
    } catch { return true }
  }

  // ---------------------------------------------------------------- klatka
  klatka(dt) {
    this.czas += dt
    if (this.przelot) {
      const p = this.przelot
      p.t = Math.min(1, p.t + dt / p.czas)
      const k = p.t < 0.5 ? 4 * p.t ** 3 : 1 - (-2 * p.t + 2) ** 3 / 2
      this.kam.x = p.od.x + (p.do.x - p.od.x) * k
      this.kam.y = p.od.y + (p.do.y - p.od.y) * k
      this.kam.zoom = p.od.zoom + (p.do.zoom - p.od.zoom) * k
      if (p.t >= 1) this.przelot = null
    } else if (this.sledzony) {
      const s = this.sledzony.pozycja
      const cel = iso(s.x, s.z, 18)
      const cx = cel.sx + (this._przesSledz ?? 0) / this.kam.zoom
      this.kam.x += (cx - this.kam.x) * Math.min(1, dt * 5)
      this.kam.y += (cel.sy - this.kam.y) * Math.min(1, dt * 5)
    }
    this._rysuj()
  }

  _rysuj() {
    const g = this.g, s = this.swiat
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.fillStyle = '#0d0b14'
    g.fillRect(0, 0, this.canvas.width, this.canvas.height)
    if (!s) return
    const z = this.kam.zoom, r = this.dpr
    const tx = Math.round((this.szer / 2 - this.kam.x * z) * r), ty = Math.round((this.wys / 2 - this.kam.y * z) * r)
    const skala = z * r
    this._aktualizujWarstwy(skala)
    g.setTransform(1, 0, 0, 1, 0, 0)
    const pw = this.szer / z, ph = this.wys / z, vx = this.kam.x - pw / 2, vy = this.kam.y - ph / 2
    const ww = this._warstwy
    const pelny = ww && vx >= ww.wx0 && vy >= ww.wy0 && vx + pw <= ww.wx0 + ww.ww && vy + ph <= ww.wy0 + ww.wh
    if (!pelny) this._blit(g, this._podglad.tlo, 1)
    this._blit(g, ww?.tlo, 1)
    g.setTransform(skala, 0, 0, skala, tx, ty)
    g.imageSmoothingEnabled = false

    // obiekty: statyczne + dynamiczne, sortowane po głębi
    const lista = s.obiekty.concat(this.dynamiczne())
    lista.sort((a, b) => a.glebia - b.glebia)
    this._zrzutObiektow = lista
    for (const o of lista) {
      if (o.ukryty) continue
      if (o.rysuj) { this._rysujZBufora(g, o, this._warstwy.skala); continue }
      const p = iso(o.x, o.z, o.y ?? 0)
      const img = o.img ?? o.sp.img
      const ox = o.img ? o.ox : o.sp.ox, oy = o.img ? o.oy : o.sp.oy
      const x = Math.round(p.sx + ox), y = Math.round(p.sy + oy)
      if (o.przed) o.przed(g, x, y)
      g.drawImage(img, x, y)
      o._r = { x, y, w: img.width, h: img.height }
      if (o.po) o.po(g, x, y)
    }

    // zewnętrzne ściany od strony kamery: na wierzchu, z przezroczystością (0 = ukryte, 1 = pełne)
    if (this.efekty) this._swiatla(g)
    const alfa = Math.min(this.alfaScian, Math.max(0.3, 1 - (this.kam.zoom - 1.6) * 0.45))
    g.setTransform(1, 0, 0, 1, 0, 0)
    if (!pelny) this._blit(g, this._podglad.przod, alfa)
    this._blit(g, ww?.przod, alfa)
    g.setTransform(skala, 0, 0, skala, tx, ty)
    s.rysujPrzod(g, skala, 1, 'gzyms')
    g.setTransform(1, 0, 0, 1, 0, 0)
  }

  // ---------------------------------------------------------------- bufory warstw statycznych
  // Podłoga, ściany i elewacja nie zmieniają się - renderujemy je raz do bufora (obszar ekranu + margines)
  // w aktualnej skali. Przy przesuwaniu kamery tylko kopiujemy bufor; przy zmianie zoomu bufor jest chwilowo
  // skalowany, a ostry render robimy, gdy przybliżanie się zatrzyma.
  _aktualizujWarstwy(skala) {
    if (!this._podglad) this._budujPodglad()
    const w = this._warstwy
    const teraz = performance.now()
    if (!this._ostSkala || Math.abs(this._ostSkala - skala) > 1e-6) { this._ostSkala = skala; this._zmianaSkali = teraz }
    const stabilna = teraz - (this._zmianaSkali ?? 0) > 120
    const pw = this.szer / this.kam.zoom, ph = this.wys / this.kam.zoom
    const x0 = this.kam.x - pw / 2, y0 = this.kam.y - ph / 2
    const pokrywa = (b) => b && x0 >= b.wx0 && y0 >= b.wy0 && x0 + pw <= b.wx0 + b.ww && y0 + ph <= b.wy0 + b.wh
    // z wyprzedzeniem: gdy ekran zbliża się do krawędzi bufora, zaczynamy budować nowy
    const zapas = (b) => b && x0 - pw * 0.18 >= b.wx0 && y0 - ph * 0.18 >= b.wy0 && x0 + pw * 1.18 <= b.wx0 + b.ww && y0 + ph * 1.18 <= b.wy0 + b.wh
    const potrzebny = !w || (stabilna && w.skala !== skala) || !zapas(w)
    const z = this._zadanie
    // zadanie nieaktualne (inna skala albo nie pokryje ekranu) - zaczynamy od nowa
    if (z && ((stabilna && z.skala !== skala) || !pokrywa(z))) this._zadanie = null
    if (potrzebny && !this._zadanie) this._zacznijBufor(stabilna ? skala : Math.min(skala, w?.skala ?? skala), pw, ph, x0, y0)
    // kroki rozłożone na klatki (karta graficzna rysuje je dopiero na końcu klatki)
    if (this._zadanie) this._kontynuujBufor(w ? 9 : 100000)
  }

  _zacznijBufor(skala, pw, ph, x0, y0) {
    const mx = pw * 0.5, my = ph * 0.5
    const wx0 = x0 - mx, wy0 = y0 - my, ww = pw + 2 * mx, wh = ph + 2 * my
    const W = Math.ceil(ww * skala), H = Math.ceil(wh * skala)
    // dwa komplety płócien na zmianę (jedno wyświetlane, drugie budowane)
    this._pula = this._pula ?? [[], []]
    const wolny = this._pula.find((p) => p !== this._warstwy?._pula) ?? this._pula[0]
    const plotno = (i) => {
      let c = wolny[i]
      if (!c) { c = wolny[i] = document.createElement('canvas') }
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H }
      const g = c.getContext('2d')
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H)
      g.setTransform(skala, 0, 0, skala, -wx0 * skala, -wy0 * skala)
      g.imageSmoothingEnabled = false
      return { canvas: c, g }
    }
    const tlo = plotno(0), przod = plotno(1)
    const s = this.swiat
    const kroki = [...s.krokiTla.map((f) => () => f(tlo.g, skala)), ...s.krokiPrzodu.map((f) => () => f(przod.g, skala))]
    this._zadanie = { skala, wx0, wy0, ww, wh, kroki, i: 0, tlo, przod, pula: wolny }
  }

  _kontynuujBufor(ileKrokow) {
    const z = this._zadanie
    const koniec = Math.min(z.kroki.length, z.i + ileKrokow)
    while (z.i < koniec) z.kroki[z.i++]()
    if (z.i < z.kroki.length) return
    const nowe = { skala: z.skala, wx0: z.wx0, wy0: z.wy0, ww: z.ww, wh: z.wh, _pula: z.pula }
    nowe.tlo = { canvas: z.tlo.canvas, w: nowe }
    nowe.przod = { canvas: z.przod.canvas, w: nowe }
    this._warstwy = nowe
    this._zadanie = null
  }

  /** Tani podgląd całego biura (niska rozdzielczość) - widoczny tylko przez chwilę, zanim dobuduje się ostry bufor. */
  _budujPodglad() {
    const gr = this.swiat.granice, sk = 1.5
    const wx0 = gr.minX - 20, wy0 = gr.minY - 20, ww = gr.maxX - gr.minX + 40, wh = gr.maxY - gr.minY + 40
    const zrob = (kroki) => {
      const c = document.createElement('canvas'); c.width = Math.ceil(ww * sk); c.height = Math.ceil(wh * sk)
      const g = c.getContext('2d'); g.setTransform(sk, 0, 0, sk, -wx0 * sk, -wy0 * sk)
      for (const f of kroki) f(g, sk)
      return c
    }
    const p = { skala: sk, wx0, wy0, ww, wh }
    p.tlo = { canvas: zrob(this.swiat.krokiTla), w: p }
    p.przod = { canvas: zrob(this.swiat.krokiPrzodu), w: p }
    this._podglad = p
  }

  _blit(g, warstwa, alfa) {
    if (!warstwa || alfa <= 0) return
    const w = warstwa.w, r = this.dpr, z = this.kam.zoom
    const k = (z * r) / w.skala
    const dx = ((w.wx0 - this.kam.x) * z + this.szer / 2) * r
    const dy = ((w.wy0 - this.kam.y) * z + this.wys / 2) * r
    g.imageSmoothingEnabled = Math.abs(k - 1) > 0.01
    g.globalAlpha = alfa
    g.drawImage(warstwa.canvas, Math.round(dx), Math.round(dy), warstwa.canvas.width * k, warstwa.canvas.height * k)
    g.globalAlpha = 1
    g.imageSmoothingEnabled = false
  }

  /** Obiekt wektorowy (np. segment szkła) rysowany z małego bufora w skali warstw. */
  _rysujZBufora(g, o, skala) {
    let b = o._bufor
    if (!b || b.skala !== skala) {
      const bb = o.bbox
      const c = b?.canvas ?? document.createElement('canvas')
      c.width = Math.max(1, Math.ceil(bb.w * skala)); c.height = Math.max(1, Math.ceil(bb.h * skala))
      const gb = c.getContext('2d')
      gb.setTransform(skala, 0, 0, skala, -bb.x * skala, -bb.y * skala)
      o.rysuj(gb, skala)
      b = o._bufor = { canvas: c, skala }
    }
    const bb = o.bbox
    g.imageSmoothingEnabled = true
    g.drawImage(b.canvas, bb.x, bb.y, bb.w, bb.h)
    g.imageSmoothingEnabled = false
  }

  _swiatla(g) {
    const s = this.swiat
    g.save()
    g.globalCompositeOperation = 'lighter'
    // promienie z okien (smugi na podłogę)
    for (const o of s.okna) {
      const migot = 0.85 + Math.sin(this.czas * 0.6 + o.poz) * 0.05
      g.globalAlpha = 0.11 * migot
      g.fillStyle = 'rgb(255,200,120)'
      g.beginPath()
      if (o.sciana === 'z0') {
        const a = iso(o.poz - o.szer / 2 + 0.2, 0, o.y1), b = iso(o.poz + o.szer / 2 - 0.2, 0, o.y1)
        const c = iso(o.poz + o.szer / 2 + 2.4, 4.6, 0), d = iso(o.poz - o.szer / 2 + 2.4, 4.6, 0)
        g.moveTo(a.sx, a.sy); g.lineTo(b.sx, b.sy); g.lineTo(c.sx, c.sy); g.lineTo(d.sx, d.sy)
      } else {
        const a = iso(0, o.poz + o.szer / 2 - 0.2, o.y1), b = iso(0, o.poz - o.szer / 2 + 0.2, o.y1)
        const c = iso(4.6, o.poz - o.szer / 2 + 2.4, 0), d = iso(4.6, o.poz + o.szer / 2 + 2.4, 0)
        g.moveTo(a.sx, a.sy); g.lineTo(b.sx, b.sy); g.lineTo(c.sx, c.sy); g.lineTo(d.sx, d.sy)
      }
      g.closePath(); g.fill()
    }
    // lampki
    for (const l of s.swiatla) {
      const p = iso(l.x, l.z, l.y)
      g.globalAlpha = 1
      g.drawImage(poswiata(l.kolor, l.sila), p.sx - l.r, p.sy - l.r, l.r * 2, l.r * 2)
    }
    // poświata monitorów
    for (const m of s.monitory) {
      const p = iso(m.x, m.z, m.y)
      g.drawImage(poswiata('90,220,200', 0.18), p.sx - 16, p.sy - 16, 32, 32)
    }
    g.restore()
  }
}

const poswiaty = new Map()
/** Gotowy gradient poświaty (64x64) - zamiast tworzyć gradient w każdej klatce. */
function poswiata(kolor, sila) {
  const k = kolor + '|' + sila
  let c = poswiaty.get(k)
  if (!c) {
    c = document.createElement('canvas'); c.width = c.height = 64
    const g = c.getContext('2d')
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    gr.addColorStop(0, `rgba(${kolor},${sila})`); gr.addColorStop(1, `rgba(${kolor},0)`)
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64)
    poswiaty.set(k, c)
  }
  return c
}
