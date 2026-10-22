// Prosty poziomy wykres słupkowy w HTML (obciążenie zadaniami w dziale).
import { h } from './dom.js'

export class Wykres {
  constructor(dane) {
    const max = Math.max(1, ...dane.map((d) => d.wartosc))
    this.el = h('div.wykres', {},
      ...dane.map((d) => h('div.wy-wiersz', {},
        h('span.wy-etyk', {}, d.etykieta),
        h('span.wy-tor', {}, h('i', { style: { width: `${(d.wartosc / max) * 100}%`, background: d.kolor } })),
        h('span.wy-wart', {}, String(d.wartosc)),
      )),
    )
  }
}
