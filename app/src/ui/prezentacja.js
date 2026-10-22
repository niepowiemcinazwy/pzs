// Tryb prezentacji (F10): chowa interfejs, kamera powoli objeżdża działy, na dole podpis z informacjami.
import { h } from './dom.js'
import * as api from '../dane/api.js'
import { POKOJE } from '../engine2d/plan.js'

const CZAS_PRZYSTANKU = 7

export class Prezentacja {
  constructor(ui) {
    this.ui = ui
    this.aktywna = false
    this.podpisTytul = h('div.pr-tytul')
    this.podpisOpis = h('div.pr-opis')
    this.el = h('div.prezentacja', {},
      h('div.pr-logo', {}, h('span.gp-znak', {}, 'TE'), 'Team Environment'),
      h('div.pr-podpis', {}, this.podpisTytul, this.podpisOpis),
      h('div.pr-wyjscie', {}, 'Esc / F10 – wyjście z trybu prezentacji'),
    )
    ui.k.parentElement.append(this.el)
  }

  przelacz(wl = !this.aktywna) {
    if (wl === this.aktywna) return
    this.aktywna = wl
    document.body.classList.toggle('tryb-prezentacji', wl)
    const s = this.ui.silnik
    if (wl) {
      this.ui.zamknijPanel()
      this.ui.czat.zamknij()
      this.przystanki = this._przystanki()
      this.indeks = -1
      this.t = CZAS_PRZYSTANKU
    } else {
      s.doDomyslnego(1.2)
    }
  }

  _przystanki() {
    const lista = [{ typ: 'calosc' }]
    for (const p of POKOJE) if (!p.ukryty) lista.push({ typ: 'pokoj', pokoj: p })
    return lista
  }

  klatka(dt) {
    if (!this.aktywna) return
    this.t += dt
    const s = this.ui.silnik
    if (this.t >= CZAS_PRZYSTANKU) {
      this.t = 0
      this.indeks = (this.indeks + 1) % this.przystanki.length
      const p = this.przystanki[this.indeks]
      if (p.typ === 'calosc') {
        const d = s._obliczDomyslny({ gora: 70, dol: 150, lewo: 40, prawo: 40 })
        s.przelot = { od: { ...s.kam }, do: d, t: 0, czas: 2.2 }
        this._podpis('Team Environment', `${api.firma().nazwa} · ${api.pracownicy().filter((x) => x.tryb === 'biuro').length} osób w biurze · ${api.dzialy().length} działów`)
      } else {
        const k = p.pokoj
        const w = k.x1 - k.x0, d = k.z1 - k.z0
        const z = Math.max(1.8, Math.min(4, Math.min((s.szer - 160) / ((w + d) * 16 + 60), (s.wys - 260) / ((w + d) * 8 + 110))))
        s.lecDo(k.x0 + w / 2, k.z0 + d / 2, z, 2.2)
        this._podpisPokoju(k)
      }
      this._dryf = { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 3 }
    } else if (!s.przelot && this._dryf) {
      // powolny dryf kamery w trakcie przystanku
      s.kam.x += this._dryf.x * dt
      s.kam.y += this._dryf.y * dt
      s.kam.zoom *= 1 + 0.006 * dt
    }
  }

  _podpisPokoju(k) {
    if (k.dzial) {
      const d = api.dzial(k.dzial)
      const ludzie = api.pracownicyDzialu(d.id)
      const wToku = api.zadaniaDzialu(d.id).filter((z) => z.status === 'w_trakcie' || z.status === 'do_review').length
      this._podpis(`${d.ikona} ${d.nazwa}`, `${ludzie.length} osób · ${wToku} zadań w toku · kierownik: ${api.imieNazwisko(d.kierownik)}`)
    } else {
      const obecni = api.pracownicy().filter((p) => p.pokoj === k.id && p.tryb === 'biuro').length
      const sp = this.ui.biuro.spotkanie
      this._podpis(k.nazwa, k.id === 'sala' && sp ? `Trwa spotkanie: ${sp.temat}` : `Teraz: ${obecni} os.`)
    }
  }

  _podpis(tytul, opis) {
    this.podpisTytul.textContent = tytul
    this.podpisOpis.textContent = opis
    this.el.classList.remove('animuj'); void this.el.offsetWidth; this.el.classList.add('animuj')
  }
}
