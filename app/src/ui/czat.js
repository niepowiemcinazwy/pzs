// Czat z pracownikami: lista osób (status, czy w aplikacji, kiedy widziany, co robi) i rozmowa.
import { h, dodaj, wyczysc } from './dom.js'
import * as api from '../dane/api.js'
import * as dzwiek from './dzwiek.js'
import { ikona } from './ikony.js'

export class Czat {
  constructor(ui) {
    this.ui = ui
    this.otwarty = false
    this.rozmowca = null
    this.filtr = ''
    this.pisze = {}

    this.szukaj = h('input.czat-szukaj', { placeholder: 'Szukaj osoby…', oninput: (e) => { this.filtr = e.target.value.toLowerCase(); this.odswiezListe() } })
    this.lista = h('div.czat-lista')
    this.widokListy = h('div.czat-widok', {},
      h('div.czat-nag', {}, h('b', {}, 'Wiadomości'), h('button.gp-ikona.male', { title: 'Zamknij', onclick: () => this.zamknij() }, ikona('zamknij'))),
      h('div.czat-filtr', {}, this.szukaj),
      this.lista,
    )
    this.nagRozmowy = h('div.czat-nag-rozmowy')
    this.wiadomosci = h('div.czat-wiadomosci')
    this.pole = h('textarea.czat-pole', {
      rows: 1, placeholder: 'Napisz wiadomość…',
      onkeydown: (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._wyslij() } },
    })
    this.widokRozmowy = h('div.czat-widok.ukryty', {},
      this.nagRozmowy,
      this.wiadomosci,
      h('div.czat-szybkie', {},
        ...['Jesteś dostępny/a?', 'Masz chwilę na call?', 'Jak idzie zadanie?'].map((t) => h('button.chip', { onclick: () => { this.pole.value = t; this._wyslij() } }, t)),
      ),
      h('div.czat-dol', {}, this.pole, h('button.btn.btn-glowny.czat-wyslij', { onclick: () => this._wyslij() }, 'Wyślij')),
    )
    this.el = h('aside.czat', {}, this.widokListy, this.widokRozmowy)
    ui.k.append(this.el)

    api.na('wiadomosc', ({ id }) => {
      if (this.otwarty && this.rozmowca === id) { api.oznaczPrzeczytane(id); this._rysujRozmowe() }
      else if (id && api.nieprzeczytane(id)) { dzwiek.graj('wiadomosc'); this.ui.toast(`Nowa wiadomość od: ${api.imieNazwisko(id)}`, 'wiadomosc', null) }
      this.odswiezListe()
    })
    api.na('pisze', ({ id, pisze }) => { this.pisze[id] = pisze; if (this.rozmowca === id) this._rysujRozmowe() })
    api.na('obecnosc', (p) => { if (this.otwarty && this.rozmowca === p.id) this._rysujNaglowek() })
    this.odswiezListe()
  }

  przelacz() { this.otwarty ? this.zamknij() : this.otworz() }

  otworz(id = null) {
    this.otwarty = true
    this.el.classList.add('otwarty')
    dzwiek.graj('otworz')
    if (id) this._pokazRozmowe(id)
    else if (!this.rozmowca) this._pokazListe()
    this.odswiezListe()
  }

  zamknij() {
    this.otwarty = false
    this.el.classList.remove('otwarty')
    dzwiek.graj('zamknij')
  }

  _pokazListe() {
    this.rozmowca = null
    this.widokListy.classList.remove('ukryty')
    this.widokRozmowy.classList.add('ukryty')
    this.odswiezListe()
  }

  _pokazRozmowe(id) {
    this.rozmowca = id
    api.oznaczPrzeczytane(id)
    this.widokListy.classList.add('ukryty')
    this.widokRozmowy.classList.remove('ukryty')
    this._rysujNaglowek()
    this._rysujRozmowe()
    setTimeout(() => this.pole.focus(), 50)
  }

  odswiezListe() {
    if (!this.otwarty || this.rozmowca) return
    const ja = api.zalogowany().id
    const osoby = api.pracownicy().filter((p) => p.id !== ja && (!this.filtr || `${p.imie} ${p.nazwisko} ${p.rola}`.toLowerCase().includes(this.filtr)))
    // najpierw rozmowy z nieprzeczytanymi, potem z historią, potem dostępni
    const waga = (p) => (api.nieprzeczytane(p.id) ? 0 : api.rozmowa(p.id).length ? 1 : p.status === 'offline' ? 3 : 2)
    osoby.sort((a, b) => waga(a) - waga(b) || a.nazwisko.localeCompare(b.nazwisko, 'pl'))
    wyczysc(this.lista)
    for (const p of osoby) {
      const ost = api.rozmowa(p.id).at(-1)
      const n = api.nieprzeczytane(p.id)
      const st = api.STATUSY[p.status]
      this.lista.append(h('button.czat-osoba', { onclick: () => this._pokazRozmowe(p.id) },
        this.ui.avatar(p.id, 38),
        h('div.co-tekst', {},
          h('div.co-gora', {}, h('b', {}, `${p.imie} ${p.nazwisko}`), h('span.co-czas', {}, ost?.czas ?? '')),
          h('div.co-dol', {}, ost ? (ost.od === 'ja' ? 'Ty: ' : '') + ost.tekst : h('span', { style: { color: st.kolor } }, st.nazwa + ' · ' + p.aktywnosc)),
        ),
        n ? h('span.licznik.licznik-czat', {}, String(n)) : null,
      ))
    }
  }

  _rysujNaglowek() {
    const p = api.pracownik(this.rozmowca)
    const st = api.STATUSY[p.status]
    wyczysc(this.nagRozmowy).append(
      h('button.gp-ikona.male', { title: 'Wróć', onclick: () => this._pokazListe() }, ikona('strzalka')),
      this.ui.avatar(p.id, 40),
      h('div.cn-tekst', { onclick: () => this.ui.wybierzOsobe(p.id), title: 'Pokaż w biurze' },
        h('b', {}, `${p.imie} ${p.nazwisko}`),
        h('div.cn-status', {}, h('span.kropka', { style: { background: st.kolor } }), st.nazwa, ' · ', p.wAplikacji ? 'w aplikacji' : 'poza aplikacją', ' · ', p.tryb === 'nieobecny' ? 'widziany ' + api.czasTemu(p.ostatnioWidziany) : 'aktywny teraz'),
        h('div.cn-akt', {}, p.aktywnosc),
      ),
      h('button.gp-ikona.male', { title: 'Zamknij', onclick: () => this.zamknij() }, ikona('zamknij')),
    )
  }

  _rysujRozmowe() {
    const id = this.rozmowca
    if (!id) return
    const lista = api.rozmowa(id)
    wyczysc(this.wiadomosci)
    if (!lista.length) this.wiadomosci.append(h('div.pusto', {}, 'Rozpocznij rozmowę. Wiadomości trafiają prosto do aplikacji pracownika.'))
    for (const w of lista) {
      if (w.od === 'system') { this.wiadomosci.append(h('div.wiad-system', {}, w.tekst)); continue }
      this.wiadomosci.append(h('div.wiad', { klasa: w.od === 'ja' ? 'moja' : '' }, h('div.wiad-tekst', {}, w.tekst), h('div.wiad-czas', {}, w.czas)))
    }
    if (this.pisze[id]) this.wiadomosci.append(h('div.wiad.pisze', {}, h('div.wiad-tekst', {}, h('i'), h('i'), h('i'))))
    this.wiadomosci.scrollTop = this.wiadomosci.scrollHeight
  }

  async _wyslij() {
    const t = this.pole.value.trim()
    if (!t || !this.rozmowca) return
    this.pole.value = ''
    dzwiek.graj('wyslano')
    await api.wyslijWiadomosc(this.rozmowca, t)
    this._rysujRozmowe()
  }
}
