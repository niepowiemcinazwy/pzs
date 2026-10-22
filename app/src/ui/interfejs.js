// Interfejs aplikacji: górny pasek, lewy panel działów, prawy panel szczegółów, powiadomienia, sterowanie.
import { h, dodaj, wyczysc, inicjaly, dataPL } from './dom.js'
import * as api from '../dane/api.js'
import { portret } from '../engine2d/postacie.js'
import { POKOJE } from '../engine2d/plan.js'
import * as dzwiek from './dzwiek.js'
import { Czat } from './czat.js'
import { OknoZlecenia, OknoSpotkania, Paleta } from './okna.js'
import { Prezentacja } from './prezentacja.js'
import { Wykres } from './wykres.js'
import { ikona } from './ikony.js'

export { ikona }

export class Interfejs {
  constructor({ silnik, biuro, swiat, kontenerUI }) {
    this.silnik = silnik
    this.render = silnik
    this.biuro = biuro
    this.swiat = swiat
    this.k = kontenerUI
    this.wybor = null // { typ: 'osoba'|'pokoj'|'szafa', id }
    this.dokZwiniety = false
    this.etykiety = null

    this._gornyPasek()
    this._lewyDok()
    this._prawyPanel()
    this._dolneKontrolki()
    this._toasty()
    this.czat = new Czat(this)
    this.zlecenie = new OknoZlecenia(this)
    this.spotkanieOkno = new OknoSpotkania(this)
    this.paleta = new Paleta(this)
    this.prezentacja = new Prezentacja(this)

    this._sterowanie()
    this._zdarzenia()
    this.coSekunde()
  }

  // ------------------------------------------------------------------ pomocnicze
  avatar(id, rozmiar = 36) {
    const p = api.pracownik(id)
    const el = h('span.avatar', { style: { width: rozmiar + 'px', height: rozmiar + 'px', '--kolor': api.dzial(p.dzial)?.kolor } })
    try {
      el.append(h('img', { src: portret(p.id, p.wyglad), alt: '' }))
    } catch {
      el.append(inicjaly(p.imie, p.nazwisko))
    }
    const st = h('span.avatar-status', { style: { background: api.STATUSY[p.status]?.kolor } })
    el.append(st)
    el.dataset.osoba = id
    return el
  }

  marginesy() {
    return { gora: 86, dol: 64, lewo: (this.dokZwiniety ? 70 : 262), prawo: 24 + (this.wybor ? 400 : 0) }
  }

  // ------------------------------------------------------------------ górny pasek
  _gornyPasek() {
    const u = api.zalogowany()
    this.zegar = h('div.gp-zegar')
    this.obecnosc = h('div.gp-obecnosc')
    this.spotkanieChip = h('button.gp-spotkanie', { onclick: () => this.wybierzPokoj(POKOJE.find((p) => p.id === 'sala')) })
    this.licznikPowiadomien = h('span.licznik')
    this.licznikCzatu = h('span.licznik')
    this.przyciskDzwieku = h('button.gp-ikona', { title: 'Dźwięki', onclick: () => { const w = dzwiek.przelaczWyciszenie(); this._ikonaDzwieku(w) } })
    this._ikonaDzwieku(dzwiek.czyWyciszone())

    this.pasek = h('header.gp', {},
      h('div.gp-logo', {},
        h('div.gp-znak', {}, 'TE'),
        h('div', {}, h('div.gp-nazwa', {}, 'Team Environment'), h('div.gp-firma', {}, api.firma().nazwa)),
      ),
      h('div.gp-srodek', {}, this.zegar, h('span.gp-sep'), this.obecnosc, h('span.gp-sep'), h('div.gp-sprint', {}, h('b', {}, 'Sprint 14'), ' · zostało 6 dni'), this.spotkanieChip),
      h('div.gp-prawo', {},
        h('button.gp-szukaj', { onclick: () => this.paleta.otworz() }, ikona('szukaj'), 'Szukaj osoby, działu…', h('kbd', {}, 'Ctrl K')),
        h('button.gp-akcja', { onclick: () => this.spotkanieOkno.otworz() }, ikona('spotkanie'), 'Zwołaj spotkanie'),
        h('button.gp-ikona', { title: 'Powiadomienia', onclick: (e) => { e.stopPropagation(); this._przelaczPowiadomienia() } }, ikona('dzwonek'), this.licznikPowiadomien),
        h('button.gp-ikona', { title: 'Czat', onclick: () => this.czat.przelacz() }, ikona('czat'), this.licznikCzatu),
        this.przyciskDzwieku,
        h('button.gp-ikona', { title: 'Tryb prezentacji (F10)', onclick: () => this.prezentacja.przelacz() }, ikona('ekran')),
        h('div.gp-uzytkownik', { onclick: () => this.wybierzOsobe(u.id) }, this.avatar(u.id, 34), h('div', {}, h('div.gp-u-imie', {}, `${u.imie} ${u.nazwisko}`), h('div.gp-u-rola', {}, 'Lider / Product Owner'))),
      ),
    )
    this.listaPowiadomien = h('div.lista-pow')
    this.oknoPowiadomien = h('div.okno-pow', { onclick: (e) => e.stopPropagation() },
      h('div.okno-pow-nag', {}, h('b', {}, 'Powiadomienia'), h('button.link', { onclick: () => { api.oznaczPowiadomieniaPrzeczytane(); this._odswiezPowiadomienia() } }, 'Oznacz jako przeczytane')),
      this.listaPowiadomien,
    )
    this.k.append(this.pasek, this.oknoPowiadomien)
    document.addEventListener('click', () => this.oknoPowiadomien.classList.remove('otwarte'))
  }

  _ikonaDzwieku(wyciszone) {
    wyczysc(this.przyciskDzwieku).append(ikona(wyciszone ? 'wyciszony' : 'glosnik'))
    this.przyciskDzwieku.classList.toggle('wyl', wyciszone)
  }

  _przelaczPowiadomienia() {
    const otw = this.oknoPowiadomien.classList.toggle('otwarte')
    if (otw) { this._odswiezPowiadomienia(); dzwiek.graj('otworz') }
  }

  _odswiezPowiadomienia() {
    const lista = api.powiadomienia()
    wyczysc(this.listaPowiadomien)
    if (!lista.length) this.listaPowiadomien.append(h('div.pusto', {}, 'Brak powiadomień'))
    for (const p of lista) {
      this.listaPowiadomien.append(h('div.pow', { klasa: (p.przeczytane ? 'przeczytane ' : '') + 'typ-' + p.typ, onclick: () => { if (p.osoba) this.wybierzOsobe(p.osoba); this.oknoPowiadomien.classList.remove('otwarte') } },
        h('span.pow-ikona', {}, this._ikonaTypu(p.typ)),
        h('div.pow-tresc', {}, h('div', {}, p.tekst), h('div.pow-czas', {}, p.czas)),
      ))
    }
    const n = lista.filter((p) => !p.przeczytane).length
    this.licznikPowiadomien.textContent = n > 9 ? '9+' : String(n)
    this.licznikPowiadomien.style.display = n ? '' : 'none'
  }

  _ikonaTypu(typ) {
    return { zadanie: '📋', sukces: '✅', alarm: '🔥', spotkanie: '👥', pulpit: '🖥️', wiadomosc: '💬' }[typ] ?? '🔔'
  }

  // ------------------------------------------------------------------ lewy dok
  _lewyDok() {
    this.listaDzialow = h('div.dok-lista')
    this.listaZespolu = h('div.dok-lista')
    this.dok = h('aside.dok', {},
      h('div.dok-nag', {}, h('span', {}, 'Struktura firmy'), h('button.dok-zwin', { title: 'Zwiń', onclick: () => this._zwinDok() }, ikona('lewo'))),
      this.listaDzialow,
      h('div.dok-nag.dok-nag-2', {}, h('span', {}, 'Zespół projektu')),
      this.listaZespolu,
      h('div.dok-stopka', {}, h('div.dok-legenda', {}, ...Object.entries(api.STATUSY).map(([, s]) => h('span', {}, h('i', { style: { background: s.kolor } }), s.nazwa)))),
    )
    this.dokPrzycisk = h('button.dok-rozwin', { title: 'Pokaż strukturę firmy', onclick: () => this._zwinDok(false) }, ikona('prawo'))
    this.k.append(this.dok, this.dokPrzycisk)
    this._odswiezDok()
  }

  _zwinDok(zwin = true) {
    this.dokZwiniety = zwin
    this.dok.classList.toggle('zwiniety', zwin)
    this.dokPrzycisk.classList.toggle('widoczny', zwin)
    dzwiek.graj('klik')
  }

  _odswiezDok() {
    wyczysc(this.listaDzialow)
    for (const d of api.dzialy()) {
      const ludzie = api.pracownicyDzialu(d.id)
      const wBiurze = ludzie.filter((p) => p.tryb === 'biuro').length
      const aktywne = api.zadaniaDzialu(d.id).filter((z) => z.status !== 'zrobione').length
      this.listaDzialow.append(h('button.dok-dzial', {
        klasa: this.wybor?.typ === 'pokoj' && POKOJE.find((p) => p.id === this.wybor.id)?.dzial === d.id ? 'aktywny' : '',
        style: { '--kolor': d.kolor },
        onclick: () => this.wybierzPokoj(POKOJE.find((p) => p.dzial === d.id)),
      },
      h('span.dok-ikona', {}, d.ikona),
      h('span.dok-nazwa', {}, d.nazwa, h('small', {}, `${aktywne} zadań w toku`)),
      h('span.dok-liczba', { title: 'w biurze / wszyscy' }, `${wBiurze}/${ludzie.length}`),
      ))
    }
    wyczysc(this.listaZespolu)
    for (const p of api.pracownicy().filter((x) => x.zespolProjektu)) {
      this.listaZespolu.append(h('button.dok-osoba', { klasa: this.wybor?.id === p.id ? 'aktywny' : '', onclick: () => this.wybierzOsobe(p.id) },
        this.avatar(p.id, 30),
        h('span.dok-nazwa', {}, `${p.imie} ${p.nazwisko}`, h('small', {}, p.aktywnosc)),
      ))
    }
  }

  // ------------------------------------------------------------------ prawy panel
  _prawyPanel() {
    this.panelTresc = h('div.panel-tresc')
    this.panel = h('aside.panel', {},
      h('button.panel-zamknij', { title: 'Zamknij (Esc)', onclick: () => this.zamknijPanel() }, ikona('zamknij')),
      this.panelTresc,
    )
    this.k.append(this.panel)
  }

  zamknijPanel() {
    if (!this.wybor) return
    this.wybor = null
    this.panel.classList.remove('otwarty')
    this.etykiety?.ustawZaznaczenie(null)
    this.etykiety?.ustawZaznaczonyPokoj(null)
    for (const ch of this.biuro.postacie.values()) ch.zaznaczony = false
    this.silnik.doDomyslnego(0.8)
    this._wykres = null
    this._odswiezDok()
    dzwiek.graj('zamknij')
  }

  _otworzPanel(wybor) {
    const nowy = !this.wybor
    this.wybor = wybor
    this.panel.classList.add('otwarty')
    this.panel.dataset.typ = wybor.typ
    this.panelTresc.scrollTop = 0
    if (nowy) dzwiek.graj('otworz'); else dzwiek.graj('klik')
    this._odswiezDok()
  }

  wybierzOsobe(id, { lec = true } = {}) {
    const p = api.pracownik(id)
    if (!p) return
    this._otworzPanel({ typ: 'osoba', id })
    this.etykiety?.ustawZaznaczenie(id)
    this.etykiety?.ustawZaznaczonyPokoj(null)
    for (const ch of this.biuro.postacie.values()) ch.zaznaczony = ch.id === id
    const ch = this.biuro.postacie.get(id)
    if (ch && lec) {
      // kamera przybliża się do osoby i za nią podąża (osoba po lewej od panelu)
      this.silnik.lecDo(ch.pozycja.x, ch.pozycja.z, 4.2, 0.7, 200)
      this.silnik.sledz(ch, 200)
    } else if (lec) this.silnik.doDomyslnego(0.8)
    this._rysujOsobe()
  }

  _rysujOsobe() {
    const id = this.wybor.id
    const p = api.pracownik(id)
    const dz = api.dzial(p.dzial)
    const st = api.STATUSY[p.status]
    const zadania = api.zadaniaOsoby(id)
    const ch = this.biuro.postacie.get(id)
    const prosba = api.prosbaPulpit(id)
    const pokoj = POKOJE.find((r) => r.id === p.pokoj)
    const tryb = { biuro: 'W biurze', zdalnie: 'Pracuje zdalnie', nieobecny: 'Nieobecny' }[p.tryb]

    const ileWg = (s) => zadania.filter((z) => z.status === s).length
    const t = this.panelTresc
    wyczysc(t)
    dodaj(t, 
      h('div.po-nag', { style: { '--kolor': dz?.kolor } },
        this.avatar(id, 76),
        h('div.po-nag-tekst', {},
          h('div.po-imie', {}, `${p.imie} ${p.nazwisko}`),
          h('div.po-rola', {}, p.rola),
          h('button.chip', { style: { '--kolor': dz?.kolor }, onclick: () => this.wybierzPokoj(POKOJE.find((r) => r.dzial === p.dzial)) }, dz?.ikona, ' ', dz?.nazwa),
          p.zespolProjektu ? h('span.chip.chip-zespol', {}, '★ Zespół projektu') : null,
        ),
      ),
      h('div.po-status', {},
        h('div.po-st-wiersz', {}, h('span.kropka', { style: { background: st.kolor } }), h('b', {}, st.nazwa), h('span.szary', {}, ` · ${tryb}`)),
        h('div.po-st-siatka', {},
          h('div', {}, h('small', {}, 'W aplikacji firmowej'), h('span', { klasa: p.wAplikacji ? 'tak' : 'nie' }, p.wAplikacji ? 'Tak, zalogowany' : 'Nie')),
          h('div', {}, h('small', {}, 'Ostatnio widziany'), h('span', {}, p.tryb === 'nieobecny' ? api.czasTemu(p.ostatnioWidziany) : 'teraz')),
          h('div', {}, h('small', {}, 'Gdzie jest'), h('span', {}, p.tryb === 'biuro' ? (pokoj?.nazwa ?? '–') : tryb)),
          h('div', {}, h('small', {}, 'Nastrój zespołu'), h('span', {}, '😊 ' + p.nastroj + '%')),
        ),
        h('div.po-teraz', {}, h('small', {}, 'Teraz'), h('div.po-teraz-tekst', { 'data-na-zywo': 'aktywnosc' }, p.aktywnosc)),
      ),
      h('div.po-akcje', {},
        h('button.btn.btn-glowny', { onclick: () => this.zlecenie.otworz({ osoba: id }) }, ikona('zadanie'), 'Zleć zadanie'),
        h('button.btn', { onclick: () => this.czat.otworz(id) }, ikona('czat'), 'Napisz'),
        h('button.btn', {
          klasa: prosba ? 'btn-stan-' + prosba.stan : '',
          disabled: prosba?.stan === 'oczekuje' || p.tryb === 'nieobecny' ? true : null,
          title: p.tryb === 'nieobecny' ? 'Osoba jest nieobecna' : 'Wyślij prośbę o połączenie zdalnym pulpitem',
          onclick: async () => { await api.poprosOZdalnyPulpit(id); dzwiek.graj('wyslano'); this._rysujOsobe() },
        }, ikona('pulpit'), prosba?.stan === 'oczekuje' ? 'Czeka na akceptację…' : prosba?.stan === 'zaakceptowano' ? 'Pulpit zaakceptowany ✓' : 'Poproś o zdalny pulpit'),
        ch ? h('button.btn', { klasa: this.silnik.sledzony === ch ? 'aktywny' : '', onclick: () => { if (this.silnik.sledzony === ch) this.silnik.sledz(null); else { this.silnik.lecDo(ch.pozycja.x, ch.pozycja.z, Math.max(this.silnik.zoom, 3.5), 0.6, 200); this.silnik.sledz(ch, 200) } this._rysujOsobe() } }, ikona('oko'), this.silnik.sledzony === ch ? 'Przestań śledzić' : 'Śledź w biurze') : h('button.btn', { disabled: true }, ikona('oko'), 'Poza biurem'),
      ),
      prosba?.stan === 'zaakceptowano' ? h('div.info-box', {}, '🖥️ ', `${p.imie} zaakceptował(a) prośbę. Samo połączenie zdalnym pulpitem uruchomi moduł backendu (w przygotowaniu).`) : null,
      h('div.sekcja', {},
        h('div.sekcja-nag', {}, h('b', {}, 'Zadania'), h('span.szary', {}, `${zadania.length}`)),
        h('div.kafelki-mini', {},
          h('div', {}, h('b', {}, ileWg('w_trakcie') + ileWg('do_review')), h('small', {}, 'w toku')),
          h('div', {}, h('b', {}, ileWg('do_zrobienia')), h('small', {}, 'do zrobienia')),
          h('div', {}, h('b', {}, ileWg('zrobione')), h('small', {}, 'zrobione')),
        ),
        h('div.lista-zadan', {}, ...zadania.map((z) => this._kartaZadania(z)),
          zadania.length ? null : h('div.pusto', {}, 'Brak zadań. Zleć pierwsze zadanie.')),
      ),
      h('div.sekcja', {},
        h('div.sekcja-nag', {}, h('b', {}, 'Kontakt')),
        h('div.kontakt', {}, ikona('mail'), p.email),
        h('div.kontakt', {}, ikona('telefon'), p.telefon),
      ),
    )
  }

  _kartaZadania(z) {
    const s = api.STATUSY_ZADAN[z.status]
    const prio = { wysoki: '#ff7a45', średni: '#ffc145', niski: '#9fb0cc' }[z.priorytet]
    return h('div.zadanie', { klasa: z.nowe ? 'nowe' : '' },
      h('div.zad-gora', {}, h('span.zad-klucz', {}, z.klucz), h('span.zad-status', { style: { '--kolor': s.kolor } }, s.nazwa)),
      h('div.zad-tytul', {}, z.tytul),
      h('div.zad-dol', {},
        h('span.zad-pasek', {}, h('i', { style: { width: z.postep + '%', background: s.kolor } })),
        h('span.zad-proc', {}, z.postep + '%'),
        h('span.zad-prio', { style: { color: prio }, title: 'Priorytet' }, '● ' + z.priorytet),
        h('span.zad-termin', { title: 'Termin' }, '📅 ' + dataPL(z.termin)),
      ),
    )
  }

  wybierzPokoj(pokoj) {
    if (!pokoj) return
    this._otworzPanel({ typ: 'pokoj', id: pokoj.id })
    this.etykiety?.ustawZaznaczenie(null)
    this.etykiety?.ustawZaznaczonyPokoj(pokoj.id)
    for (const ch of this.biuro.postacie.values()) ch.zaznaczony = !!pokoj.dzial && ch.dane.dzial === pokoj.dzial
    const w = pokoj.x1 - pokoj.x0, d = pokoj.z1 - pokoj.z0
    // zoom tak, żeby pokój zmieścił się obok panelu
    const szerPx = (w + d) * 16 + 60, wysPx = (w + d) * 8 + 120
    const z = Math.max(1.6, Math.min(4, Math.min((this.silnik.szer - 700) / szerPx, (this.silnik.wys - 160) / wysPx)))
    this.silnik.sledz(null)
    this.silnik.lecDo(pokoj.x0 + w / 2, pokoj.z0 + d / 2, z, 0.8, 120)
    this._rysujPokoj()
  }

  _rysujPokoj() {
    const pokoj = POKOJE.find((r) => r.id === this.wybor.id)
    const t = this.panelTresc
    wyczysc(t)
    if (!pokoj.dzial) { this._rysujPomieszczenie(pokoj); return }
    const d = api.dzial(pokoj.dzial)
    const ludzie = api.pracownicyDzialu(d.id)
    const zad = api.zadaniaDzialu(d.id)
    const wToku = zad.filter((z) => z.status === 'w_trakcie' || z.status === 'do_review').length
    const zrobione = zad.filter((z) => z.status === 'zrobione').length
    const kier = api.pracownik(d.kierownik)
    this._wykres = new Wykres(ludzie.map((p) => ({ etykieta: p.imie, wartosc: api.zadaniaOsoby(p.id).filter((z) => z.status !== 'zrobione').length, kolor: d.kolor })))
    dodaj(t, 
      h('div.pd-nag', { style: { '--kolor': d.kolor } },
        h('div.pd-ikona', {}, d.ikona),
        h('div', {}, h('div.pd-nazwa', {}, d.nazwa), h('div.pd-opis', {}, d.opis)),
      ),
      h('div.kafelki', {},
        h('div.kafel', {}, h('b', {}, ludzie.length), h('small', {}, 'pracowników')),
        h('div.kafel', {}, h('b', {}, ludzie.filter((p) => p.tryb === 'biuro').length), h('small', {}, 'w biurze')),
        h('div.kafel', {}, h('b', {}, wToku), h('small', {}, 'zadań w toku')),
        h('div.kafel', {}, h('b', {}, zrobione), h('small', {}, 'zrobionych')),
      ),
      h('div.po-akcje', {},
        h('button.btn.btn-glowny', { onclick: () => this.zlecenie.otworz({ dzial: d.id }) }, ikona('zadanie'), 'Zleć zadanie działowi'),
        h('button.btn', { onclick: () => this.spotkanieOkno.otworz({ osoby: ludzie.filter((p) => p.tryb === 'biuro').map((p) => p.id), temat: `Spotkanie działu: ${d.nazwa}` }) }, ikona('spotkanie'), 'Spotkanie działu'),
      ),
      h('div.sekcja', {},
        h('div.sekcja-nag', {}, h('b', {}, 'Kierownik działu')),
        h('button.wiersz-osoby', { onclick: () => this.wybierzOsobe(kier.id) }, this.avatar(kier.id, 34), h('div', {}, h('b', {}, `${kier.imie} ${kier.nazwisko}`), h('small', {}, kier.rola))),
      ),
      h('div.sekcja', {},
        h('div.sekcja-nag', {}, h('b', {}, 'Co teraz robią'), h('span.szary', {}, 'na żywo')),
        h('div.lista-ludzi', { 'data-na-zywo': 'ludzie-dzialu' }, ...ludzie.map((p) => this._wierszOsoby(p))),
      ),
      h('div.sekcja', {},
        h('div.sekcja-nag', {}, h('b', {}, 'Otwarte zadania na osobę')),
        this._wykres.el,
      ),
      h('div.sekcja', {},
        h('div.sekcja-nag', {}, h('b', {}, 'Cele działu')),
        h('ul.cele', {}, ...d.cele.map((c) => h('li', {}, c))),
      ),
    )
  }

  _wierszOsoby(p) {
    const st = api.STATUSY[p.status]
    return h('button.wiersz-osoby', { onclick: () => this.wybierzOsobe(p.id), 'data-osoba': p.id },
      this.avatar(p.id, 34),
      h('div.wo-tekst', {},
        h('div', {}, h('b', {}, `${p.imie} ${p.nazwisko}`), h('span.wo-st', { style: { color: st.kolor } }, ' · ' + st.nazwa)),
        h('small', {}, p.aktywnosc),
      ),
    )
  }

  _rysujPomieszczenie(pokoj) {
    const info = api.pomieszczenie(pokoj.id) ?? { nazwa: pokoj.nazwa, opis: '', rezerwacje: [] }
    const obecni = api.pracownicy().filter((p) => p.pokoj === pokoj.id && p.tryb === 'biuro')
    const sp = this.biuro.spotkanie
    const t = this.panelTresc
    dodaj(t, 
      h('div.pd-nag', { style: { '--kolor': '#9fb0cc' } },
        h('div.pd-ikona', {}, pokoj.id === 'kuchnia' ? '☕' : '▣'),
        h('div', {}, h('div.pd-nazwa', {}, info.nazwa), h('div.pd-opis', {}, info.opis)),
      ),
      pokoj.id === 'sala' ? h('div.sekcja', {},
        h('div.sekcja-nag', {}, h('b', {}, 'Spotkanie')),
        sp ? h('div.info-box.info-fiolet', {}, h('b', {}, sp.temat), h('div', {}, `${sp.uczestnicy.length} uczestników · od ${new Date(sp.od).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`),
          h('button.btn.btn-maly', { onclick: () => { this.biuro.zakonczSpotkanie(); this._rysujPokoj() } }, 'Zakończ spotkanie'))
          : h('div', {}, h('div.szary', { style: { marginBottom: '10px' } }, 'Sala jest teraz wolna.'), h('button.btn.btn-glowny', { onclick: () => this.spotkanieOkno.otworz() }, ikona('spotkanie'), 'Zwołaj spotkanie')),
      ) : null,
      h('div.sekcja', {},
        h('div.sekcja-nag', {}, h('b', {}, 'Teraz w pomieszczeniu'), h('span.szary', {}, String(obecni.length))),
        h('div.lista-ludzi', { 'data-na-zywo': 'ludzie-pomieszczenia' }, ...(obecni.length ? obecni.map((p) => this._wierszOsoby(p)) : [h('div.pusto', {}, 'Nikogo tu teraz nie ma')])),
      ),
      info.rezerwacje?.length ? h('div.sekcja', {},
        h('div.sekcja-nag', {}, h('b', {}, 'Dzisiejsze rezerwacje')),
        ...info.rezerwacje.map((r) => h('div.rezerwacja', {}, h('b', {}, r.godz), r.tytul)),
      ) : null,
    )
  }

  wybierzSzafe(id) {
    this._otworzPanel({ typ: 'szafa', id })
    this.etykiety?.ustawZaznaczenie(null)
    this.etykiety?.ustawZaznaczonyPokoj(null)
    for (const ch of this.biuro.postacie.values()) ch.zaznaczony = false
    const s = this.swiat.szafy.find((x) => x.id === id)
    this.silnik.sledz(null)
    this.silnik.lecDo(s.x, s.z, 4.2, 0.8, 200)
    this._metryki = { cpu: [], ram: [], temp: [] }
    this._rysujSzafe()
  }

  _rysujSzafe() {
    const id = this.wybor.id
    const s = api.serwer(id)
    const szafa = this.swiat.szafy.find((x) => x.id === id)
    const alarm = !!szafa.alarmAktywny
    const t = this.panelTresc
    wyczysc(t)
    this.metrykiEl = {
      cpu: h('canvas.spark', { width: 320, height: 46 }), ram: h('canvas.spark', { width: 320, height: 46 }), temp: h('canvas.spark', { width: 320, height: 46 }),
      cpuW: h('b'), ramW: h('b'), tempW: h('b'),
    }
    dodaj(t, 
      h('div.pd-nag', { style: { '--kolor': alarm ? '#ff5d5d' : '#5ab8ff' } },
        h('div.pd-ikona', {}, ikona('serwer')),
        h('div', {}, h('div.pd-nazwa', {}, s.nazwa), h('div.pd-opis', {}, s.rola)),
      ),
      alarm ? h('div.info-box.info-czerwony', {}, ikona('alarm'), 'Wysoka temperatura! Administrator został powiadomiony.') : h('div.info-box.info-zielony', {}, '● Działa poprawnie'),
      h('div.kafelki-mini', {}, h('div', {}, h('small', {}, 'Adres IP'), h('b', {}, s.ip)), h('div', {}, h('small', {}, 'System'), h('b', {}, s.system)), h('div', {}, h('small', {}, 'Uptime'), h('b', {}, alarm ? '0 dni 0 godz.' : `${12 + (id.charCodeAt(5) % 40)} dni`))),
      h('div.sekcja', {}, h('div.sekcja-nag', {}, h('b', {}, 'Procesor'), this.metrykiEl.cpuW), this.metrykiEl.cpu),
      h('div.sekcja', {}, h('div.sekcja-nag', {}, h('b', {}, 'Pamięć RAM'), this.metrykiEl.ramW), this.metrykiEl.ram),
      h('div.sekcja', {}, h('div.sekcja-nag', {}, h('b', {}, 'Temperatura'), this.metrykiEl.tempW), this.metrykiEl.temp),
      h('div.po-akcje', {},
        h('button.btn', { onclick: () => { const ch = this.biuro.postacie.get('mateusz'); if (ch) { ch.zajecie = null; this.biuro._doSzafy(ch, szafa) ; api.powiadom({ typ: 'info', tekst: `Poproszono Mateusza Sobczaka o sprawdzenie ${id}`, osoba: 'mateusz' }) } } }, ikona('spotkanie'), 'Poproś admina o sprawdzenie'),
        h('button.btn.btn-ostrzezenie', { disabled: alarm || !!this.biuro.alarm ? true : null, onclick: () => { this.biuro.wywolajAlarm(id); this._rysujSzafe() } }, ikona('alarm'), 'Symuluj awarię (test)'),
      ),
    )
  }

  _probkaMetryk() {
    if (this.wybor?.typ !== 'szafa' || !this.metrykiEl) return
    const szafa = this.swiat.szafy.find((x) => x.id === this.wybor.id)
    const alarm = !!szafa.alarmAktywny
    const m = this._metryki
    const ost = (t, d) => t.length ? t[t.length - 1] : d
    const baza = (this.wybor.id.charCodeAt(5) % 5) * 6
    m.cpu.push(Math.max(3, Math.min(100, ost(m.cpu, 25 + baza) + (Math.random() - 0.5) * 14 + (alarm ? 6 : 0))))
    m.ram.push(Math.max(10, Math.min(98, ost(m.ram, 48 + baza) + (Math.random() - 0.5) * 4)))
    m.temp.push(alarm ? Math.min(82, ost(m.temp, 60) + 3) : Math.max(38, Math.min(62, ost(m.temp, 45) + (Math.random() - 0.5) * 2 - (ost(m.temp, 45) > 58 ? 3 : 0))))
    for (const k of ['cpu', 'ram', 'temp']) if (m[k].length > 40) m[k].shift()
    this._spark(this.metrykiEl.cpu, m.cpu, 100, '#2ec4b6')
    this._spark(this.metrykiEl.ram, m.ram, 100, '#b48cff')
    this._spark(this.metrykiEl.temp, m.temp, 90, alarm ? '#ff5d5d' : '#ffc145')
    this.metrykiEl.cpuW.textContent = Math.round(ost(m.cpu)) + '%'
    this.metrykiEl.ramW.textContent = Math.round(ost(m.ram)) + '% z 64 GB'
    this.metrykiEl.tempW.textContent = Math.round(ost(m.temp)) + '°C'
    this.metrykiEl.tempW.style.color = alarm ? '#ff5d5d' : ''
    if (this._ostatniAlarm !== alarm) { this._ostatniAlarm = alarm; this._rysujSzafe() }
  }

  _spark(c, dane, max, kolor) {
    const g = c.getContext('2d')
    const W = c.width, H = c.height
    g.clearRect(0, 0, W, H)
    g.strokeStyle = 'rgba(255,255,255,.07)'
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, (H * i) / 4); g.lineTo(W, (H * i) / 4); g.stroke() }
    if (dane.length < 2) return
    const dx = W / 39
    g.beginPath()
    dane.forEach((v, i) => { const x = W - (dane.length - 1 - i) * dx, y = H - (v / max) * (H - 4) - 2; i ? g.lineTo(x, y) : g.moveTo(x, y) })
    g.strokeStyle = kolor; g.lineWidth = 2; g.stroke()
    g.lineTo(W, H); g.lineTo(W - (dane.length - 1) * dx, H); g.closePath()
    g.fillStyle = kolor + '22'; g.fill()
  }

  // ------------------------------------------------------------------ dół ekranu
  _dolneKontrolki() {
    this.k.append(
      h('div.pomoc', {},
        h('span', {}, h('kbd', {}, 'Kółko'), ' przybliż'),
        h('span', {}, h('kbd', {}, 'Przeciągnij'), ' przesuń'),
        h('span', {}, h('kbd', {}, 'Klik'), ' szczegóły'),
        h('span', {}, h('kbd', {}, 'Ctrl K'), ' szukaj'),
        h('span', {}, h('kbd', {}, 'F10'), ' prezentacja'),
      ),
      h('div.zoom', {},
        h('button', { title: 'Przybliż', onclick: () => this.silnik.przybliz(1.3) }, ikona('plus')),
        h('button', { title: 'Oddal', onclick: () => this.silnik.przybliz(1 / 1.3) }, ikona('minus')),
        h('button', { title: 'Pokaż całe biuro', onclick: () => this.silnik.doDomyslnego(0.8) }, ikona('dopasuj')),
      ),
    )
  }

  _toasty() {
    this.toastyEl = h('div.toasty')
    this.k.append(this.toastyEl)
  }

  toast(tekst, typ = 'info', osoba = null) {
    const el = h('div.toast', { klasa: 'typ-' + typ, onclick: () => { if (osoba) this.wybierzOsobe(osoba); el.remove() } },
      h('span.toast-ikona', {}, this._ikonaTypu(typ)), h('span', {}, tekst))
    this.toastyEl.prepend(el)
    while (this.toastyEl.children.length > 4) this.toastyEl.lastChild.remove()
    setTimeout(() => { el.classList.add('znika'); setTimeout(() => el.remove(), 400) }, 5200)
  }

  // ------------------------------------------------------------------ sterowanie
  _sterowanie() {
    const r = this.silnik
    r.naKlik = (x, y) => {
      if (this.prezentacja.aktywna) return
      const o = r.trafienie(x, y)
      if (o?.typ === 'postac') { this.wybierzOsobe(o.id); return }
      if (o?.typ === 'szafa') { this.wybierzSzafe(o.id); return }
      // coś jest zaznaczone -> kliknięcie obok odznacza i kamera wraca do widoku domyślnego
      if (this.wybor) { this.zamknijPanel(); return }
      const p = r.punktPodlogi(x, y)
      const pokoj = p && POKOJE.find((q) => !q.ukryty && p.x >= q.x0 && p.x < q.x1 && p.z >= q.z0 && p.z < q.z1)
      if (pokoj) this.wybierzPokoj(pokoj)
    }
    let licznik = 0
    r.naRuch = (x, y, ciagnie) => {
      if (ciagnie || ++licznik % 3) return
      const o = r.trafienie(x, y)
      r.canvas.classList.toggle('nad-obiektem', !!o)
      for (const ch of this.biuro.postacie.values()) ch.podswietlony = o?.typ === 'postac' && o.id === ch.id
    }
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); this.paleta.otworz(); return }
      if (e.key === 'F10') { e.preventDefault(); this.prezentacja.przelacz(); return }
      if (e.key === 'Escape') {
        if (this.prezentacja.aktywna) this.prezentacja.przelacz(false)
        else if (this.zlecenie.otwarte) this.zlecenie.zamknij()
        else if (this.spotkanieOkno.otwarte) this.spotkanieOkno.zamknij()
        else if (this.paleta.otwarta) this.paleta.zamknij()
        else if (this.czat.otwarty) this.czat.zamknij()
        else if (this.oknoPowiadomien.classList.contains('otwarte')) this.oknoPowiadomien.classList.remove('otwarte')
        else this.zamknijPanel()
      }
      const wPolu = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      if (!wPolu && (e.key === '+' || e.key === '=')) this.silnik.przybliz(1.2)
      if (!wPolu && e.key === '-') this.silnik.przybliz(1 / 1.2)
    })
  }

  _zdarzenia() {
    api.na('powiadomienie', (p) => {
      this._odswiezPowiadomienia()
      this.toast(p.tekst, p.typ, p.osoba)
      dzwiek.graj(p.typ === 'alarm' ? 'alarm' : p.typ === 'sukces' ? 'sukces' : p.typ === 'zadanie' ? 'zadanie' : 'powiadomienie')
    })
    api.na('zadanie', ({ typ, zadanie }) => {
      if (typ === 'nowe') this.biuro.reakcjaNaZadanie(zadanie.osoba)
      if (this.wybor?.typ === 'osoba' && this.wybor.id === zadanie.osoba) this._rysujOsobe()
    })
    api.na('pulpit', ({ id }) => { if (this.wybor?.typ === 'osoba' && this.wybor.id === id) this._rysujOsobe() })
    api.na('wiadomosc', () => this._odswiezLicznikCzatu())
    this._odswiezPowiadomienia()
    this._odswiezLicznikCzatu()
  }

  _odswiezLicznikCzatu() {
    const n = api.sumaNieprzeczytanych()
    this.licznikCzatu.textContent = String(n)
    this.licznikCzatu.style.display = n ? '' : 'none'
  }

  coSekunde() {
    const d = new Date()
    this.zegar.innerHTML = `<b>${d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</b>${d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}`
    const ps = api.pracownicy()
    const wb = ps.filter((p) => p.tryb === 'biuro').length, zd = ps.filter((p) => p.tryb === 'zdalnie').length, nb = ps.filter((p) => p.tryb === 'nieobecny').length
    this.obecnosc.innerHTML = `<span class="ob ob-b">● ${wb} w biurze</span><span class="ob ob-z">● ${zd} zdalnie</span><span class="ob ob-n">● ${nb} nieobecna</span>`
    const sp = this.biuro.spotkanie
    this.spotkanieChip.style.display = sp ? '' : 'none'
    this.pasek.querySelector('.gp-sprint').style.display = sp ? 'none' : ''
    if (sp) this.spotkanieChip.textContent = `👥 Spotkanie: ${sp.temat}`

    // odświeżanie "na żywo" w otwartym panelu
    if (this.wybor?.typ === 'osoba') {
      const el = this.panelTresc.querySelector('[data-na-zywo="aktywnosc"]')
      const p = api.pracownik(this.wybor.id)
      if (el && el.textContent !== p.aktywnosc) { el.textContent = p.aktywnosc; el.classList.remove('miga'); void el.offsetWidth; el.classList.add('miga') }
    } else if (this.wybor?.typ === 'pokoj') {
      const lista = this.panelTresc.querySelector('[data-na-zywo^="ludzie"]')
      if (lista) {
        const pokoj = POKOJE.find((r) => r.id === this.wybor.id)
        const ludzie = pokoj.dzial ? api.pracownicyDzialu(pokoj.dzial) : api.pracownicy().filter((p) => p.pokoj === pokoj.id && p.tryb === 'biuro')
        wyczysc(lista).append(...(ludzie.length ? ludzie.map((p) => this._wierszOsoby(p)) : [h('div.pusto', {}, 'Nikogo tu teraz nie ma')]))
      }
    }
    this._probkaMetryk()
    if (this._licznikDoku = ((this._licznikDoku ?? 0) + 1) % 3) return
    this._odswiezDok()
    this.czat.odswiezListe()
  }

  klatka(dt) {
    this.prezentacja.klatka(dt)
  }
}
