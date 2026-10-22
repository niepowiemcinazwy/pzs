// Napisy w świecie: nad głowami (imię i nazwisko, rola, dział, status, dymek), tabliczki działów, paski postępu nad biurkami.
import { h } from './dom.js'
import * as api from '../dane/api.js'

const NAD_GLOWA = 40 // px nad podłogą (stojąca postać)

export class Etykiety {
  constructor(kontener, silnik, biuro, swiat, akcje) {
    this.k = kontener
    this.silnik = silnik
    this.biuro = biuro
    this.akcje = akcje
    this.osoby = new Map()
    this.pokoje = []
    this.biurka = new Map()
    this.ukryte = false

    for (const ch of biuro.postacie.values()) this._dodajOsobe(ch)
    for (const p of swiat.etykietyPokoi) this._dodajPokoj(p)
    for (const ch of biuro.postacie.values()) this._dodajBiurko(ch)

    api.na('obecnosc', (p) => this._odswiezOsobe(p.id))
    api.na('zadanie', () => this._odswiezBiurka())
  }

  _dodajOsobe(ch) {
    const p = ch.dane
    const dz = api.dzial(p.dzial)
    const kropka = h('span.et-kropka')
    const dymek = h('div.et-dymek')
    const el = h('div.et-osoba', { 'data-id': p.id, onclick: (e) => { e.stopPropagation(); this.akcje.wybierzOsobe(p.id) } },
      dymek,
      h('div.et-karta', { style: { '--kolor': dz?.kolor } },
        h('div.et-imie', {}, kropka, `${p.imie} ${p.nazwisko}`, p.zespolProjektu ? h('span.et-gwiazdka', { title: 'Zespół projektu' }, '★') : null),
        h('div.et-rola', {}, p.rola),
        h('div.et-dzial', {}, dz?.nazwa ?? ''),
      ),
    )
    this.k.append(el)
    this.osoby.set(p.id, { ch, el, kropka, dymek, ostatniDymek: null })
    this._odswiezOsobe(p.id)
  }

  _odswiezOsobe(id) {
    const o = this.osoby.get(id)
    if (!o) return
    const p = api.pracownik(id)
    o.kropka.style.background = api.STATUSY[p.status]?.kolor ?? '#888'
    o.el.title = `${p.imie} ${p.nazwisko} – ${api.STATUSY[p.status]?.nazwa}: ${p.aktywnosc}`
  }

  _dodajPokoj(e) {
    const { pokoj } = e
    const dz = pokoj.dzial ? api.dzial(pokoj.dzial) : null
    const licznik = h('span.et-licznik')
    const el = h('button.et-pokoj', {
      onclick: (ev) => { ev.stopPropagation(); this.akcje.wybierzPokoj(pokoj) },
      style: { '--kolor': dz?.kolor ?? '#c9b48a' },
    }, h('span.et-pokoj-ikona', {}, dz?.ikona ?? (pokoj.id === 'kuchnia' ? '☕' : '▣')), pokoj.nazwa, licznik)
    this.k.append(el)
    this.pokoje.push({ ...e, el, licznik })
  }

  _dodajBiurko(ch) {
    const el = h('div.et-biurko', { onclick: (e) => { e.stopPropagation(); this.akcje.wybierzOsobe(ch.id) } })
    this.k.append(el)
    this.biurka.set(ch.id, { ch, el })
    this._odswiezBiurko(ch.id)
  }

  _odswiezBiurka() { for (const id of this.biurka.keys()) this._odswiezBiurko(id) }

  _odswiezBiurko(id) {
    const b = this.biurka.get(id)
    const z = api.zadaniaOsoby(id).find((x) => x.status === 'w_trakcie' || x.status === 'do_review')
    if (!z) { b.el.style.display = 'none'; b.z = null; return }
    b.z = z
    b.el.style.display = ''
    b.el.innerHTML = `<span class="et-b-klucz">${z.klucz}</span><span class="et-b-pasek"><i style="width:${z.postep}%"></i></span><span class="et-b-proc">${z.postep}%</span>`
  }

  ustawZaznaczenie(id) {
    for (const [oid, o] of this.osoby) o.el.classList.toggle('zaznaczona', oid === id)
  }

  ustawZaznaczonyPokoj(pokojId) {
    for (const p of this.pokoje) p.el.classList.toggle('zaznaczony', p.pokoj.id === pokojId)
  }

  pokaz(widoczne) { this.ukryte = !widoczne; this.k.style.display = widoczne ? '' : 'none' }

  aktualizuj() {
    if (this.ukryte) return
    const s = this.silnik
    const zoom = s.zoom
    this.k.classList.toggle('daleko', zoom < 2.2)
    this.k.classList.toggle('bardzo-daleko', zoom < 1.45)
    this.k.classList.toggle('blisko', zoom > 3.4)
    const teraz = performance.now()
    const W = s.szer, H = s.wys
    const widac = (e) => e.x > -120 && e.x < W + 120 && e.y > -80 && e.y < H + 80

    for (const o of this.osoby.values()) {
      const pos = o.ch.pozycja
      const siedzi = o.ch.stan === 'siedzi'
      const e = s.naEkran(pos.x, pos.z, siedzi ? NAD_GLOWA - 2 : NAD_GLOWA)
      if (!widac(e)) { o.el.style.visibility = 'hidden'; continue }
      o.el.style.visibility = ''
      o.el.style.transform = `translate3d(${Math.round(e.x)}px, ${Math.round(e.y)}px, 0)`
      o.el.style.zIndex = String(Math.round(e.y) + 1000)
      const d = o.ch.dymek
      const tekst = d && d.do > teraz ? d.tekst : null
      if (tekst !== o.ostatniDymek) {
        o.ostatniDymek = tekst
        o.dymek.textContent = tekst ?? ''
        o.dymek.classList.toggle('widoczny', !!tekst)
      }
    }
    for (const b of this.biurka.values()) {
      if (!b.z) continue
      const st = b.ch.stanowisko
      const e = s.naEkran(st.x, st.z, (st.wysBlatu ?? 20) + 30)
      const pokaz = widac(e) && b.ch.stan === 'siedzi'
      b.el.style.visibility = pokaz ? '' : 'hidden'
      b.el.style.transform = `translate3d(${Math.round(e.x)}px, ${Math.round(e.y)}px, 0)`
    }
    for (const p of this.pokoje) {
      const e = s.naEkran(p.x, p.z, p.y)
      p.el.style.visibility = widac(e) ? '' : 'hidden'
      p.el.style.transform = `translate3d(${Math.round(e.x)}px, ${Math.round(e.y)}px, 0)`
    }
  }

  odswiezLiczniki() {
    for (const p of this.pokoje) {
      const n = api.pracownicy().filter((x) => x.pokoj === p.pokoj.id && x.tryb === 'biuro').length
      p.licznik.textContent = n ? String(n) : ''
      p.licznik.style.display = n ? '' : 'none'
    }
  }
}
