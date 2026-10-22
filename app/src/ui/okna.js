// Okna dialogowe: zlecenie zadania, zwołanie spotkania, wyszukiwarka (Ctrl+K).
import { h, dodaj, wyczysc } from './dom.js'
import * as api from '../dane/api.js'
import * as dzwiek from './dzwiek.js'
import { ikona } from './ikony.js'
import { POKOJE } from '../engine2d/plan.js'

class Okno {
  constructor(ui, klasa) {
    this.ui = ui
    this.otwarte = false
    this.tresc = h('div.okno-tresc')
    this.el = h('div.okno-tlo', { klasa, onmousedown: (e) => { if (e.target === this.el) this.zamknij() } },
      h('div.okno', {}, h('button.okno-zamknij', { onclick: () => this.zamknij() }, ikona('zamknij')), this.tresc))
    ui.k.append(this.el)
  }
  pokaz() { this.otwarte = true; this.el.classList.add('otwarte'); dzwiek.graj('otworz') }
  zamknij() { if (!this.otwarte) return; this.otwarte = false; this.el.classList.remove('otwarte'); dzwiek.graj('zamknij') }
}

export class OknoZlecenia extends Okno {
  constructor(ui) { super(ui, 'okno-zlecenia') }

  otworz({ osoba = null, dzial = null } = {}) {
    const t = wyczysc(this.tresc)
    this.priorytet = 'średni'
    const odbiorca = h('select.pole', {},
      h('optgroup', { label: 'Pracownicy' }, ...api.pracownicy().map((p) => h('option', { value: 'o:' + p.id, selected: p.id === osoba ? true : null }, `${p.imie} ${p.nazwisko} – ${api.dzial(p.dzial).nazwa}`))),
      h('optgroup', { label: 'Cały dział (zadanie dla każdej osoby)' }, ...api.dzialy().map((d) => h('option', { value: 'd:' + d.id, selected: d.id === dzial ? true : null }, `${d.ikona} ${d.nazwa}`))),
    )
    const tytul = h('input.pole', { placeholder: 'np. Przygotować raport z testów', maxlength: 90 })
    const opis = h('textarea.pole', { rows: 3, placeholder: 'Opis, linki, kryteria akceptacji…' })
    const termin = h('input.pole', { type: 'date', value: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) })
    const prio = h('div.segment', {}, ...['niski', 'średni', 'wysoki'].map((p) => h('button', {
      klasa: p === this.priorytet ? 'aktywny' : '', 'data-p': p,
      onclick: (e) => { this.priorytet = p; prio.querySelectorAll('button').forEach((b) => b.classList.toggle('aktywny', b.dataset.p === p)); e.preventDefault() },
    }, p)))
    const blad = h('div.blad')
    const szablony = ['Code review', 'Raport tygodniowy', 'Testy przed wdrożeniem', 'Spotkanie z klientem', 'Aktualizacja dokumentacji']
    dodaj(t, 
      h('div.okno-tytul', {}, ikona('zadanie'), 'Zleć zadanie'),
      h('div.okno-opis', {}, 'Zadanie trafi do pracownika i pojawi się w jego liście zadań (oraz w Jirze po podłączeniu backendu).'),
      h('label.etykieta', {}, 'Dla kogo'), odbiorca,
      h('label.etykieta', {}, 'Tytuł zadania'), tytul,
      h('div.szablony', {}, ...szablony.map((s) => h('button.chip', { onclick: () => { tytul.value = s; tytul.focus() } }, s))),
      h('label.etykieta', {}, 'Opis (opcjonalnie)'), opis,
      h('div.dwie-kolumny', {},
        h('div', {}, h('label.etykieta', {}, 'Priorytet'), prio),
        h('div', {}, h('label.etykieta', {}, 'Termin'), termin),
      ),
      blad,
      h('div.okno-przyciski', {},
        h('button.btn', { onclick: () => this.zamknij() }, 'Anuluj'),
        h('button.btn.btn-glowny', {
          onclick: async () => {
            if (!tytul.value.trim()) { blad.textContent = 'Wpisz tytuł zadania.'; tytul.focus(); return }
            const [typ, id] = odbiorca.value.split(':')
            const osoby = typ === 'o' ? [id] : api.pracownicyDzialu(id).map((p) => p.id)
            for (const o of osoby) await api.dodajZadanie({ osoba: o, tytul: tytul.value.trim(), opis: opis.value.trim(), priorytet: this.priorytet, termin: termin.value })
            this.zamknij()
            if (typ === 'o') this.ui.wybierzOsobe(id, { lec: false })
          },
        }, ikona('zadanie'), 'Zleć zadanie'),
      ),
    )
    this.pokaz()
    setTimeout(() => tytul.focus(), 60)
  }
}

export class OknoSpotkania extends Okno {
  constructor(ui) { super(ui, 'okno-spotkania') }

  otworz({ osoby = [], temat = '' } = {}) {
    const t = wyczysc(this.tresc)
    const wybrani = new Set(osoby.filter((id) => this.ui.biuro.postacie.has(id)))
    if (!wybrani.size) wybrani.add(api.zalogowany().id)
    const pole = h('input.pole', { value: temat || 'Daily zespołu', maxlength: 60 })
    const licznik = h('span.szary')
    const lista = h('div.wybor-osob')
    const odswiez = () => {
      licznik.textContent = `${wybrani.size}/8 miejsc w sali`
      lista.querySelectorAll('.wybor-osoba').forEach((el) => el.classList.toggle('wybrana', wybrani.has(el.dataset.id)))
    }
    for (const d of api.dzialy()) {
      const ludzie = api.pracownicyDzialu(d.id).filter((p) => this.ui.biuro.postacie.has(p.id))
      if (!ludzie.length) continue
      lista.append(h('div.wo-dzial', { style: { color: d.kolor } }, d.ikona, ' ', d.nazwa,
        h('button.link', { onclick: () => { ludzie.forEach((p) => { if (wybrani.size < 8) wybrani.add(p.id) }); odswiez() } }, '+ cały dział')))
      for (const p of ludzie) {
        lista.append(h('button.wybor-osoba', { 'data-id': p.id, onclick: () => { if (wybrani.has(p.id)) wybrani.delete(p.id); else if (wybrani.size < 8) wybrani.add(p.id); odswiez(); dzwiek.graj('klik') } },
          this.ui.avatar(p.id, 30), h('span', {}, `${p.imie} ${p.nazwisko}`), h('span.wo-check', {}, '✓')))
      }
    }
    dodaj(t, 
      h('div.okno-tytul', {}, ikona('spotkanie'), 'Zwołaj spotkanie'),
      h('div.okno-opis', {}, 'Wybrane osoby przyjdą do sali konferencyjnej i usiądą przy stole.'),
      h('label.etykieta', {}, 'Temat'), pole,
      h('div.szablony', {}, ...['Daily zespołu', 'Planowanie sprintu', 'Przegląd sprintu', 'Retrospektywa', 'Burza mózgów'].map((s) => h('button.chip', { onclick: () => { pole.value = s } }, s))),
      h('div.etykieta-wiersz', {}, h('label.etykieta', {}, 'Uczestnicy (tylko osoby w biurze)'), licznik),
      lista,
      h('div.okno-przyciski', {},
        h('button.btn', { onclick: () => this.zamknij() }, 'Anuluj'),
        h('button.btn.btn-glowny', {
          onclick: () => {
            if (!wybrani.size) return
            this.ui.biuro.zwolaj([...wybrani], pole.value.trim() || 'Spotkanie')
            this.zamknij()
            this.ui.wybierzPokoj(POKOJE.find((p) => p.id === 'sala'))
          },
        }, ikona('spotkanie'), 'Zwołaj spotkanie'),
      ),
    )
    odswiez()
    this.pokaz()
  }
}

export class Paleta {
  constructor(ui) {
    this.ui = ui
    this.otwarta = false
    this.pole = h('input.paleta-pole', { placeholder: 'Szukaj osoby, działu albo akcji…', oninput: () => this._szukaj(), onkeydown: (e) => this._klawisz(e) })
    this.wyniki = h('div.paleta-wyniki')
    this.el = h('div.okno-tlo.paleta-tlo', { onmousedown: (e) => { if (e.target === this.el) this.zamknij() } },
      h('div.paleta', {}, h('div.paleta-gora', {}, ikona('szukaj'), this.pole, h('kbd', {}, 'Esc')), this.wyniki))
    ui.k.append(this.el)
  }

  otworz() {
    this.otwarta = true
    this.el.classList.add('otwarte')
    this.pole.value = ''
    this._szukaj()
    dzwiek.graj('otworz')
    setTimeout(() => this.pole.focus(), 30)
  }

  zamknij() { if (!this.otwarta) return; this.otwarta = false; this.el.classList.remove('otwarte') }

  _pozycje() {
    const ui = this.ui
    const osoby = api.pracownicy().map((p) => ({
      grupa: 'Pracownicy', tekst: `${p.imie} ${p.nazwisko}`, opis: `${p.rola} · ${api.dzial(p.dzial).nazwa}`, szukaj: `${p.imie} ${p.nazwisko} ${p.rola} ${api.dzial(p.dzial).nazwa}`,
      avatar: p.id, akcja: () => ui.wybierzOsobe(p.id),
    }))
    const dzialy = api.dzialy().map((d) => ({
      grupa: 'Działy', tekst: d.nazwa, opis: `${api.pracownicyDzialu(d.id).length} osób · ${d.opis}`, szukaj: d.nazwa + ' ' + d.opis, ikona: d.ikona, kolor: d.kolor,
      akcja: () => ui.wybierzPokoj(POKOJE.find((p) => p.dzial === d.id)),
    }))
    const akcje = [
      { tekst: 'Zwołaj spotkanie', opis: 'Wybierz osoby i zaproś je do sali', ikona: '👥', akcja: () => ui.spotkanieOkno.otworz() },
      { tekst: 'Zleć zadanie', opis: 'Nowe zadanie dla osoby albo działu', ikona: '📋', akcja: () => ui.zlecenie.otworz() },
      { tekst: 'Otwórz czat', opis: 'Wiadomości do pracowników', ikona: '💬', akcja: () => ui.czat.otworz() },
      { tekst: 'Tryb prezentacji', opis: 'Kamera objeżdża biuro (F10)', ikona: '🎬', akcja: () => ui.prezentacja.przelacz(true) },
      { tekst: 'Pokaż całe biuro', opis: 'Dopasuj widok', ikona: '🗺️', akcja: () => ui.silnik.doDomyslnego(0.8) },
      { tekst: 'Sala konferencyjna', opis: 'Rezerwacje i trwające spotkanie', ikona: '▣', akcja: () => ui.wybierzPokoj(POKOJE.find((p) => p.id === 'sala')) },
      { tekst: 'Kuchnia', opis: 'Kto jest na kawie?', ikona: '☕', akcja: () => ui.wybierzPokoj(POKOJE.find((p) => p.id === 'kuchnia')) },
    ].map((a) => ({ ...a, grupa: 'Akcje', szukaj: a.tekst + ' ' + a.opis }))
    return [...osoby, ...dzialy, ...akcje]
  }

  _szukaj() {
    const q = this.pole.value.trim().toLowerCase()
    const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l')
    const nq = norm(q)
    let lista = this._pozycje()
    if (q) lista = lista.filter((p) => norm(p.szukaj).includes(nq))
    else lista = lista.filter((p) => p.grupa !== 'Pracownicy' || api.pracownik(p.avatar)?.zespolProjektu)
    this.lista = lista.slice(0, 12)
    this.aktywny = 0
    this._rysuj()
  }

  _rysuj() {
    wyczysc(this.wyniki)
    let grupa = null
    this.lista.forEach((p, i) => {
      if (p.grupa !== grupa) { grupa = p.grupa; this.wyniki.append(h('div.paleta-grupa', {}, grupa)) }
      this.wyniki.append(h('button.paleta-poz', { klasa: i === this.aktywny ? 'aktywny' : '', onmouseenter: () => { this.aktywny = i; this._podswietl() }, onclick: () => this._wykonaj(i) },
        p.avatar ? this.ui.avatar(p.avatar, 30) : h('span.paleta-ikona', { style: { color: p.kolor } }, p.ikona),
        h('div', {}, h('b', {}, p.tekst), h('small', {}, p.opis)),
      ))
    })
    if (!this.lista.length) this.wyniki.append(h('div.pusto', {}, 'Nic nie znaleziono'))
  }

  _podswietl() { this.wyniki.querySelectorAll('.paleta-poz').forEach((el, i) => el.classList.toggle('aktywny', i === this.aktywny)) }

  _klawisz(e) {
    if (e.key === 'ArrowDown') { this.aktywny = Math.min(this.lista.length - 1, this.aktywny + 1); this._podswietl(); e.preventDefault() }
    if (e.key === 'ArrowUp') { this.aktywny = Math.max(0, this.aktywny - 1); this._podswietl(); e.preventDefault() }
    if (e.key === 'Enter') { this._wykonaj(this.aktywny); e.preventDefault() }
  }

  _wykonaj(i) {
    const p = this.lista[i]
    if (!p) return
    this.zamknij()
    dzwiek.graj('klik')
    p.akcja()
  }
}
