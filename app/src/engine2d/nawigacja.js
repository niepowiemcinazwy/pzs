// Siatka ruchu (pola 0.5 x 0.5) i wyszukiwanie drogi A* z wygładzaniem.

export class Siatka {
  constructor(szerokosc, glebokosc, krok = 0.5) {
    this.krok = krok
    this.w = Math.ceil(szerokosc / krok)
    this.h = Math.ceil(glebokosc / krok)
    this.blok = new Uint8Array(this.w * this.h)
  }

  doPola(x, z) { return [Math.floor(x / this.krok), Math.floor(z / this.krok)] }
  srodek(cx, cz) { return { x: (cx + 0.5) * this.krok, z: (cz + 0.5) * this.krok } }
  wSiatce(cx, cz) { return cx >= 0 && cz >= 0 && cx < this.w && cz < this.h }
  wolne(cx, cz) { return this.wSiatce(cx, cz) && !this.blok[cz * this.w + cx] }

  zablokujProstokat(x0, z0, x1, z1, wartosc = 1) {
    const [a, b] = this.doPola(Math.min(x0, x1) + 0.001, Math.min(z0, z1) + 0.001)
    const [c, d] = this.doPola(Math.max(x0, x1) - 0.001, Math.max(z0, z1) - 0.001)
    for (let z = b; z <= d; z++) for (let x = a; x <= c; x++) if (this.wSiatce(x, z)) this.blok[z * this.w + x] = wartosc
  }

  odblokuj(x, z) {
    const [cx, cz] = this.doPola(x, z)
    if (this.wSiatce(cx, cz)) this.blok[cz * this.w + cx] = 0
  }

  /** Najbliższe wolne pole (szukanie wszerz). */
  najblizszeWolne(cx, cz) {
    if (this.wolne(cx, cz)) return [cx, cz]
    for (let r = 1; r < 12; r++) {
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue
        if (this.wolne(cx + dx, cz + dz)) return [cx + dx, cz + dz]
      }
    }
    return [cx, cz]
  }

  /** Czy odcinek między punktami przechodzi tylko przez wolne pola (z marginesem). */
  widac(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z
    const dl = Math.hypot(dx, dz)
    const n = Math.ceil(dl / (this.krok * 0.25))
    for (let i = 0; i <= n; i++) {
      const t = i / Math.max(1, n)
      const x = a.x + dx * t, z = a.z + dz * t
      // sprawdź też punkty obok (szerokość postaci)
      for (const [ox, oz] of [[0, 0], [0.14, 0], [-0.14, 0], [0, 0.14], [0, -0.14]]) {
        const [cx, cz] = this.doPola(x + ox, z + oz)
        if (!this.wolne(cx, cz)) return false
      }
    }
    return true
  }

  /** Droga z punktu do punktu (lista punktów świata, bez startu). Pusta tablica, gdy brak drogi. */
  sciezka(start, cel) {
    const [sx0, sz0] = this.doPola(start.x, start.z)
    const [tx0, tz0] = this.doPola(cel.x, cel.z)
    const [sx, sz] = this.najblizszeWolne(sx0, sz0)
    const [tx, tz] = this.najblizszeWolne(tx0, tz0)
    const W = this.w, N = this.w * this.h
    const g = new Float32Array(N).fill(Infinity)
    const skad = new Int32Array(N).fill(-1)
    const zamkniete = new Uint8Array(N)
    const s = sz * W + sx, t = tz * W + tx
    g[s] = 0
    // kopiec binarny
    const kopiec = [[this._h(sx, sz, tx, tz), s]]
    const wstaw = (e) => {
      kopiec.push(e)
      let i = kopiec.length - 1
      while (i > 0) { const p = (i - 1) >> 1; if (kopiec[p][0] <= kopiec[i][0]) break; [kopiec[p], kopiec[i]] = [kopiec[i], kopiec[p]]; i = p }
    }
    const zdejmij = () => {
      const top = kopiec[0], ost = kopiec.pop()
      if (kopiec.length) {
        kopiec[0] = ost
        let i = 0
        for (;;) {
          const l = 2 * i + 1, r = l + 1
          let m = i
          if (l < kopiec.length && kopiec[l][0] < kopiec[m][0]) m = l
          if (r < kopiec.length && kopiec[r][0] < kopiec[m][0]) m = r
          if (m === i) break
          ;[kopiec[m], kopiec[i]] = [kopiec[i], kopiec[m]]; i = m
        }
      }
      return top
    }
    const sasiedzi = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]]
    let znaleziono = false
    while (kopiec.length) {
      const [, i] = zdejmij()
      if (zamkniete[i]) continue
      zamkniete[i] = 1
      if (i === t) { znaleziono = true; break }
      const x = i % W, z = (i / W) | 0
      for (const [dx, dz, k] of sasiedzi) {
        const nx = x + dx, nz = z + dz
        if (!this.wolne(nx, nz)) continue
        if (dx && dz && (!this.wolne(x + dx, z) || !this.wolne(x, z + dz))) continue // bez ścinania rogów
        const j = nz * W + nx
        const ng = g[i] + k
        if (ng < g[j]) { g[j] = ng; skad[j] = i; wstaw([ng + this._h(nx, nz, tx, tz), j]) }
      }
    }
    if (!znaleziono) return []
    const pola = []
    for (let i = t; i !== -1 && i !== s; i = skad[i]) pola.push(i)
    pola.reverse()
    let punkty = pola.map((i) => this.srodek(i % W, (i / W) | 0))
    // ostatni punkt dokładnie w celu, jeśli cel jest osiągalny
    if (punkty.length) punkty[punkty.length - 1] = { x: cel.x, z: cel.z }
    else punkty = [{ x: cel.x, z: cel.z }]
    return this._wygladz(start, punkty)
  }

  _h(x, z, tx, tz) {
    const dx = Math.abs(x - tx), dz = Math.abs(z - tz)
    return (dx + dz) + (1.414 - 2) * Math.min(dx, dz)
  }

  _wygladz(start, punkty) {
    if (punkty.length < 3) return punkty
    const wynik = []
    let od = start
    let i = 0
    while (i < punkty.length) {
      let j = punkty.length - 1
      while (j > i && !this.widac(od, punkty[j])) j--
      wynik.push(punkty[j])
      od = punkty[j]
      i = j + 1
    }
    return wynik
  }

  losowyWolny(x0, z0, x1, z1, los = Math.random) {
    for (let p = 0; p < 60; p++) {
      const x = x0 + los() * (x1 - x0), z = z0 + los() * (z1 - z0)
      const [cx, cz] = this.doPola(x, z)
      if (this.wolne(cx, cz) && this.wolne(cx + 1, cz) && this.wolne(cx - 1, cz) && this.wolne(cx, cz + 1) && this.wolne(cx, cz - 1)) return this.srodek(cx, cz)
    }
    return null
  }
}
