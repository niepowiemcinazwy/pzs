// Pracownicy w biurze 2D: ruch po siatce, animacje (chodzenie, siedzenie, gesty), dymki i proste "życie" biura.
import { klatka, SZER, STOPA_X, STOPA_Y } from './postacie.js'
import { strona as stronaRuchu } from './iso.js'
import { KORYTARZ, SZEROKOSC, MIEJSCA_SPOTKAN, MIEJSCA_KUCHNIA, PUNKTY_KAWA, POKOJE } from './plan.js'
import * as api from '../dane/api.js'
import { DYMKI_PRACY } from '../dane/przykladowe.js'

const PREDKOSC = 3.3 // kafle na sekundę
const los = (a, b) => a + Math.random() * (b - a)
const wybierz = (t) => t[Math.floor(Math.random() * t.length)]

export class Postac {
  constructor(dane, stanowisko) {
    this.id = dane.id
    this.dane = dane
    this.stanowisko = stanowisko
    this.wyglad = dane.wyglad ?? {}
    this.pozycja = { x: 0, z: 0 }
    this.strona = 'NW'
    this.stan = 'stoi'
    this.sciezka = []
    this.poDojsciu = null
    this.dymek = null
    this.zajecie = null
    this.nastepnaDecyzja = 0
    this.zarezerwowane = null
    this.zaznaczony = false
    this.podswietlony = false
    this._anim = Math.random() * 10
    this._gestDo = 0
    this.obiekt = this // zgodność: kamera śledzi obiekt z polem "pozycja"
  }

  ustawNa(x, z, kier) { this.pozycja.x = x; this.pozycja.z = z; if (kier) this.strona = kier }

  idzDo(siatka, punkt, poDojsciu) {
    const droga = siatka.sciezka(this.pozycja, punkt)
    this.wstan()
    this.sciezka = droga.length ? droga : [punkt]
    this.cel = punkt
    this.poDojsciu = poDojsciu
    this.stan = 'idzie'
  }

  usiadz(kier) {
    this.strona = kier
    this.stan = 'siedzi'
  }

  wstan() { if (this.stan === 'siedzi') this.stan = 'stoi' }

  stoj(kier) {
    this.wstan()
    if (kier) this.strona = kier
    this.stan = 'stoi'
  }

  patrzNa(x, z) { this.strona = stronaRuchu(x - this.pozycja.x, z - this.pozycja.z) }

  gest() { this._gestDo = performance.now() + 1400 }

  powiedz(tekst, sekundy = 4) { this.dymek = { tekst, do: performance.now() + sekundy * 1000 } }

  // zgodność ze starszym kodem
  graj() {}

  aktualizuj(dt) {
    this._anim += dt
    if (this.stan !== 'idzie') return
    const cel = this.sciezka[0]
    if (!cel) { this._dotarl(); return }
    const p = this.pozycja
    const dx = cel.x - p.x, dz = cel.z - p.z
    const dl = Math.hypot(dx, dz)
    const krok = PREDKOSC * dt
    if (dl > 0.001) this.strona = stronaRuchu(dx, dz)
    if (dl <= krok) {
      p.x = cel.x; p.z = cel.z
      this.sciezka.shift()
      if (!this.sciezka.length) this._dotarl()
    } else {
      p.x += (dx / dl) * krok
      p.z += (dz / dl) * krok
    }
  }

  _dotarl() {
    this.stan = 'stoi'
    const fn = this.poDojsciu
    this.poDojsciu = null
    if (fn) fn()
  }

  /** Obiekt do narysowania w tej klatce. */
  doRysowania() {
    const siedzi = this.stan === 'siedzi'
    const przodem = this.strona === 'SE' || this.strona === 'SW'
    let poza = 'stoi', n = 0
    if (this.stan === 'idzie') { poza = 'idzie'; n = Math.floor(this._anim * 8) % 4 }
    else if (siedzi) { poza = przodem ? 'siedzi_przod' : 'siedzi'; n = !przodem && this.dane.status !== 'spotkanie' ? Math.floor(this._anim * 3) % 2 : 0 }
    else if (performance.now() < this._gestDo) poza = 'gest'
    const img = klatka(this.id, this.wyglad, this.strona, poza, n)
    let { x, z } = this.pozycja
    // przy biurku osoba siedzi trochę bliżej blatu
    if (siedzi && !przodem) { if (this.strona === 'NW') x -= 0.15; else z -= 0.15 }
    const ja = this
    return {
      typ: 'postac', id: this.id, klikalny: true, x, z, y: siedzi ? 8 : 0, img, ox: -STOPA_X, oy: -STOPA_Y,
      glebia: x + z + (siedzi ? 0.12 : 0.05),
      przed(g, px, py) {
        const sx = px + STOPA_X, sy = py + STOPA_Y - (siedzi ? -8 : 0)
        g.fillStyle = 'rgba(10,6,12,0.28)'
        g.fillRect(sx - 6, sy - 1, 12, 2); g.fillRect(sx - 4, sy - 2, 8, 4)
        if (ja.zaznaczony || ja.podswietlony) {
          g.fillStyle = ja.zaznaczony ? '#ffc145' : 'rgba(255,193,69,0.55)'
          for (let i = -9; i <= 9; i++) { const h = Math.round((9 - Math.abs(i)) / 2); g.fillRect(sx + i, sy - h - 1, 1, 1); g.fillRect(sx + i, sy + h, 1, 1) }
        }
      },
    }
  }
}

/** Symulacja zachowań w biurze. */
export class Biuro {
  constructor(swiat) {
    this.swiat = swiat
    this.siatka = swiat.siatka
    this.postacie = new Map()
    this.zajetePunkty = new Set()
    this.spotkanie = null
    this.alarm = null
    this.tempo = 1

    for (const p of api.pracownicy()) {
      if (p.tryb !== 'biuro') continue
      const st = swiat.stanowiska.find((s) => s.id === p.stanowisko)
      if (!st) continue
      const ch = new Postac(p, st)
      ch.ustawNa(st.siedzisko.x, st.siedzisko.z, st.siedzisko.kier)
      ch.usiadz(st.siedzisko.kier)
      ch.nastepnaDecyzja = performance.now() + los(4000, 30000)
      this.postacie.set(p.id, ch)
      this._ustawAktywnosc(ch, 'praca')
    }
  }

  /** Obiekty postaci do narysowania w tej klatce. */
  doRysowania() { return [...this.postacie.values()].map((c) => c.doRysowania()) }

  aktualizuj(dt) {
    const teraz = performance.now()
    for (const ch of this.postacie.values()) {
      ch.aktualizuj(dt)
      if (!ch.zajecie && ch.stan !== 'idzie' && teraz >= ch.nastepnaDecyzja) this._decyzja(ch)
      if (ch.stan === 'siedzi' && !ch.zajecie && Math.random() < dt * 0.02) {
        ch.powiedz(wybierz(DYMKI_PRACY[ch.dane.dzial] ?? ['Pracuje']), 3.5)
      }
    }
    this._postepZadan(dt)
    this._wydarzenia(dt)
  }

  // ------------------------------------------------------------------ losowe wydarzenia (żeby biuro "żyło")
  _wydarzenia(dt) {
    this._doWydarzenia = (this._doWydarzenia ?? 25) - dt
    if (this._doWydarzenia > 0) return
    this._doWydarzenia = los(40, 80)
    const r = Math.random()
    if (r < 0.4) {
      const kto = wybierz(['joanna', 'tomasz', 'michal', 'karolina', 'natalia', 'lukasz', 'zuzanna'])
      const tekst = {
        joanna: 'Zerkniesz na banery na targi? Są w folderze Marketing.',
        tomasz: 'Przypominam o przeglądzie sprintu o 11:00.',
        michal: 'Code review migracji API skończone, można mergować.',
        karolina: 'Wiktor ma jutro drugi dzień onboardingu, wpadniesz się przywitać?',
        natalia: 'Statystyki z social mediów wrzuciłam do raportu.',
        lukasz: 'W nocy zrobiła się kopia zapasowa, wszystko OK.',
        zuzanna: 'Znalazłam błąd w czacie, zgłoszenie w Jirze.',
      }[kto]
      api.wiadomoscPrzychodzaca(kto, tekst)
      const ch = this.postacie.get(kto)
      ch?.powiedz('Piszę do Dawida 💬', 3)
    } else if (r < 0.6) {
      const p = api.pracownik('wiktor')
      const online = p.status !== 'offline'
      api.aktualizujObecnosc('wiktor', online
        ? { status: 'zaraz_wracam', aktywnosc: 'Pracuje zdalnie: przerwa' }
        : { status: 'zajety', aktywnosc: 'Pracuje zdalnie: aplikacja mobilna' })
    } else if (r < 0.72 && !this.alarm && !this.spotkanie) {
      this.wywolajAlarm()
    } else {
      const devy = [...this.postacie.values()].filter((c) => c.dane.dzial === 'dev' && c.stan === 'siedzi')
      const d = devy.length ? wybierz(devy) : null
      if (d) { d.powiedz('Wdrożone na serwer deweloperski 🚀', 4); api.powiadom({ typ: 'sukces', tekst: `${d.dane.imie} ${d.dane.nazwisko} wdrożył(a) nową wersję na serwer deweloperski`, osoba: d.id }) }
    }
  }

  // ------------------------------------------------------------------ decyzje
  _decyzja(ch) {
    const dzial = ch.dane.dzial
    const naMiejscu = ch.stan === 'siedzi'
    if (!naMiejscu) { this._wrocDoBiurka(ch); return }
    const r = Math.random()
    if (r < 0.32) this._kawa(ch)
    else if (r < 0.52) this._odwiedzKolege(ch)
    else if (r < 0.62 && dzial === 'infra') this._doSzafy(ch)
    else if (r < 0.7 && dzial === 'qa') this._zglosBlad(ch)
    else if (r < 0.7 && (dzial === 'kierownictwo' || api.dzial(dzial)?.kierownik === ch.id)) this._obchod(ch)
    else if (r < 0.78) this._spacer(ch)
    else { ch.nastepnaDecyzja = performance.now() + los(15000, 40000) }
  }

  _wrocDoBiurka(ch, potem) {
    const s = ch.stanowisko.siedzisko
    this._zwolnij(ch)
    ch.idzDo(this.siatka, { x: s.x, z: s.z }, () => {
      ch.usiadz(s.kier)
      this._ustawAktywnosc(ch, 'praca')
      ch.nastepnaDecyzja = performance.now() + los(20000, 55000) / this.tempo
      potem?.()
    })
    this._ustawAktywnosc(ch, 'wraca')
  }

  _rezerwuj(ch, punkty) {
    const wolne = punkty.filter((p) => !this.zajetePunkty.has(`${p.x},${p.z}`))
    if (!wolne.length) return null
    const p = wybierz(wolne)
    this.zajetePunkty.add(`${p.x},${p.z}`)
    ch.zarezerwowane = `${p.x},${p.z}`
    return p
  }

  _zwolnij(ch) {
    if (ch.zarezerwowane) this.zajetePunkty.delete(ch.zarezerwowane)
    ch.zarezerwowane = null
  }

  _kawa(ch) {
    const p = this._rezerwuj(ch, PUNKTY_KAWA)
    if (!p) { ch.nastepnaDecyzja = performance.now() + 8000; return }
    this._ustawAktywnosc(ch, 'kawa')
    ch.idzDo(this.siatka, p, () => {
      ch.stoj(p.kier)
      ch.gest()
      ch.powiedz(wybierz(['Kawa ☕', 'Espresso ☕', 'Latte ☕', 'Herbata 🍵']), 4)
      setTimeout(() => {
        if (ch.zajecie) return
        this._zwolnij(ch)
        // czasem posiedzi przy stoliku
        const m = Math.random() < 0.55 ? this._rezerwuj(ch, MIEJSCA_KUCHNIA) : null
        if (m) {
          ch.idzDo(this.siatka, m, () => {
            ch.stoj(m.kier)
            ch.powiedz(wybierz(['Rozmowa przy kawie', 'Mała przerwa', 'Co tam słychać?']), 4)
            setTimeout(() => { if (!ch.zajecie) this._wrocDoBiurka(ch) }, los(7000, 14000) / this.tempo)
          })
        } else this._wrocDoBiurka(ch)
      }, los(4500, 8000) / this.tempo)
    })
  }

  _odwiedzKolege(ch) {
    const kandydaci = [...this.postacie.values()].filter((c) => c !== ch && c.stan === 'siedzi' && !c.zajecie && (c.dane.dzial === ch.dane.dzial || Math.random() < 0.35))
    if (!kandydaci.length) { ch.nastepnaDecyzja = performance.now() + 10000; return }
    const kolega = wybierz(kandydaci)
    const cel = kolega.stanowisko.obok
    api.aktualizujObecnosc(ch.id, { status: 'zajety', aktywnosc: `Konsultacja z: ${kolega.dane.imie} ${kolega.dane.nazwisko}`, pokoj: this._pokoj(cel) })
    ch.idzDo(this.siatka, cel, () => {
      ch.patrzNa(kolega.pozycja.x, kolega.pozycja.z)
      ch.gest()
      ch.powiedz(wybierz(['Masz chwilę?', 'Zerkniesz na to?', 'Pytanie do zadania', 'Szybka sprawa']), 3.5)
      setTimeout(() => kolega.powiedz(wybierz(['Jasne!', 'Pokaż', 'Już patrzę', 'Daj 5 minut']), 3), 1600)
      setTimeout(() => { if (!ch.zajecie) this._wrocDoBiurka(ch) }, los(6000, 10000) / this.tempo)
    })
  }

  _doSzafy(ch, szafa = wybierz(this.swiat.szafy), naprawa = false) {
    api.aktualizujObecnosc(ch.id, { status: 'zajety', aktywnosc: `Serwerownia: ${szafa.id}`, pokoj: 'infra' })
    ch.idzDo(this.siatka, szafa.punkt, () => {
      ch.stoj('NE')
      ch.gest()
      ch.powiedz(naprawa ? `Naprawiam ${szafa.id} 🔧` : `Sprawdzam ${szafa.id}`, 4)
      setTimeout(() => {
        if (naprawa) this._usunAlarm(ch)
        if (!ch.zajecie || naprawa) { ch.zajecie = null; this._wrocDoBiurka(ch) }
      }, (naprawa ? 6000 : los(5000, 9000)) / this.tempo)
    })
  }

  _zglosBlad(ch) {
    const devy = [...this.postacie.values()].filter((c) => c.dane.dzial === 'dev' && c.stan === 'siedzi' && !c.zajecie)
    if (!devy.length) { this._spacer(ch); return }
    const dev = wybierz(devy)
    api.aktualizujObecnosc(ch.id, { status: 'zajety', aktywnosc: `Zgłasza błąd: ${dev.dane.imie} ${dev.dane.nazwisko}`, pokoj: 'dev' })
    ch.idzDo(this.siatka, dev.stanowisko.obok, () => {
      ch.patrzNa(dev.pozycja.x, dev.pozycja.z)
      ch.powiedz('Znalazłem błąd 🐞', 3.5)
      ch.gest()
      setTimeout(() => dev.powiedz(wybierz(['Ojej, już poprawiam', 'Na którym ekranie?', 'Wrzuć do Jiry']), 3), 1700)
      setTimeout(() => { if (!ch.zajecie) this._wrocDoBiurka(ch) }, los(6000, 9000) / this.tempo)
    })
  }

  _obchod(ch) {
    const pokoj = POKOJE.find((p) => p.dzial === ch.dane.dzial) ?? POKOJE.find((p) => p.id === 'dev')
    const cel = this.siatka.losowyWolny(pokoj.x0 + 1, pokoj.z0 + 1, pokoj.x1 - 1, pokoj.z1 - 1)
    if (!cel) { ch.nastepnaDecyzja = performance.now() + 8000; return }
    api.aktualizujObecnosc(ch.id, { status: 'dostepny', aktywnosc: 'Obchód działu', pokoj: pokoj.id })
    ch.idzDo(this.siatka, cel, () => {
      ch.stoj()
      ch.powiedz(wybierz(['Jak idzie sprint?', 'Wszystko gra?', 'Status zadań?']), 3.5)
      setTimeout(() => { if (!ch.zajecie) this._wrocDoBiurka(ch) }, los(4000, 7000) / this.tempo)
    })
  }

  _spacer(ch) {
    const cel = this.siatka.losowyWolny(1, KORYTARZ.z0 + 0.6, SZEROKOSC - 1, KORYTARZ.z1 - 0.6)
    if (!cel) { ch.nastepnaDecyzja = performance.now() + 8000; return }
    api.aktualizujObecnosc(ch.id, { status: 'zaraz_wracam', aktywnosc: 'Rozprostowuje nogi', pokoj: 'korytarz' })
    ch.idzDo(this.siatka, cel, () => {
      ch.stoj()
      if (Math.random() < 0.5) ch.powiedz(wybierz(['Telefon do klienta 📞', 'Chwila przerwy', 'Gdzie są klucze?']), 3)
      setTimeout(() => { if (!ch.zajecie) this._wrocDoBiurka(ch) }, los(3000, 6000) / this.tempo)
    })
  }

  _ustawAktywnosc(ch, rodzaj) {
    const pokojBiurka = ch.stanowisko.pokoj
    if (rodzaj === 'praca') {
      const z = api.zadaniaOsoby(ch.id).find((x) => x.status === 'w_trakcie')
      api.aktualizujObecnosc(ch.id, {
        status: Math.random() < 0.6 ? 'dostepny' : 'zajety',
        aktywnosc: z ? `Pracuje nad ${z.klucz}: ${z.tytul}` : 'Przy biurku',
        pokoj: pokojBiurka,
      })
    } else if (rodzaj === 'kawa') api.aktualizujObecnosc(ch.id, { status: 'zaraz_wracam', aktywnosc: 'Przerwa na kawę', pokoj: 'kuchnia' })
    else if (rodzaj === 'wraca') api.aktualizujObecnosc(ch.id, { aktywnosc: 'Wraca do biurka' })
  }

  _pokoj(punkt) {
    const p = POKOJE.find((r) => punkt.x >= r.x0 && punkt.x < r.x1 && punkt.z >= r.z0 && punkt.z < r.z1)
    return p?.id ?? null
  }

  // ------------------------------------------------------------------ postęp zadań
  _postepZadan(dt) {
    this._licznikPostepu = (this._licznikPostepu ?? 0) + dt
    if (this._licznikPostepu < 4) return
    this._licznikPostepu = 0
    for (const ch of this.postacie.values()) {
      if (ch.stan !== 'siedzi' || ch.zajecie) continue
      const z = api.zadaniaOsoby(ch.id).find((x) => x.status === 'w_trakcie') ?? api.zadaniaOsoby(ch.id).find((x) => x.status === 'do_zrobienia')
      if (!z || Math.random() > 0.35) continue
      const postep = Math.min(100, z.postep + Math.ceil(los(1, 4)))
      const zmiany = { postep }
      if (z.status === 'do_zrobienia') zmiany.status = 'w_trakcie'
      if (postep >= 100) { zmiany.status = 'zrobione'; ch.powiedz(`Skończone: ${z.klucz} ✅`, 4); ch.gest() }
      api.aktualizujZadanie(z.klucz, zmiany)
    }
  }

  // ------------------------------------------------------------------ spotkania
  zwolaj(osoby, temat) {
    if (this.spotkanie) this.zakonczSpotkanie()
    const miejsca = [...MIEJSCA_SPOTKAN]
    const uczestnicy = []
    osoby.forEach((id) => {
      const ch = this.postacie.get(id)
      if (!ch || !miejsca.length) return
      const m = miejsca.shift()
      this._zwolnij(ch)
      ch.zajecie = { typ: 'spotkanie' }
      api.aktualizujObecnosc(id, { status: 'spotkanie', aktywnosc: `Spotkanie: ${temat}`, pokoj: 'sala' })
      ch.powiedz('Idę na spotkanie', 2.5)
      ch.idzDo(this.siatka, m, () => {
        ch.usiadz(m.kier)
        ch.powiedz(temat, 5)
      })
      uczestnicy.push(id)
    })
    this.spotkanie = { temat, uczestnicy, od: Date.now() }
    api.powiadom({ typ: 'spotkanie', tekst: `Spotkanie „${temat}” – ${uczestnicy.length} os. w sali konferencyjnej` })
    return this.spotkanie
  }

  zakonczSpotkanie() {
    if (!this.spotkanie) return
    const { temat, uczestnicy } = this.spotkanie
    this.spotkanie = null
    uczestnicy.forEach((id, i) => {
      const ch = this.postacie.get(id)
      if (!ch) return
      setTimeout(() => {
        ch.zajecie = null
        ch.powiedz(wybierz(['Dobre spotkanie', 'To do roboty!', 'Ustalone 👍']), 2.5)
        this._wrocDoBiurka(ch)
      }, i * 350)
    })
    api.powiadom({ typ: 'spotkanie', tekst: `Zakończono spotkanie „${temat}”` })
  }

  // ------------------------------------------------------------------ alarm w serwerowni
  wywolajAlarm(idSzafy) {
    const szafa = this.swiat.szafy.find((s) => s.id === idSzafy) ?? wybierz(this.swiat.szafy)
    if (this.alarm) return
    szafa.alarmAktywny = true
    this.alarm = { szafa, od: Date.now() }
    api.powiadom({ typ: 'alarm', tekst: `Alarm: ${szafa.id} – wysoka temperatura (78°C)` })
    // najbliższy admin idzie naprawić
    const admin = ['mateusz', 'lukasz'].map((id) => this.postacie.get(id)).find((c) => c && !c.zajecie) ?? this.postacie.get('mateusz')
    if (admin) {
      setTimeout(() => {
        admin.zajecie = { typ: 'naprawa' }
        admin.powiedz('Lecę do serwerowni!', 2.5)
        this._zwolnij(admin)
        this._doSzafy(admin, szafa, true)
      }, 1500)
    }
    return szafa
  }

  _usunAlarm(ch) {
    if (!this.alarm) return
    const { szafa } = this.alarm
    szafa.alarmAktywny = false
    this.alarm = null
    api.powiadom({ typ: 'sukces', tekst: `${ch.dane.imie} ${ch.dane.nazwisko} naprawił(a) ${szafa.id} – temperatura w normie`, osoba: ch.id })
  }

  // ------------------------------------------------------------------ zlecenie zadania (reakcja postaci)
  reakcjaNaZadanie(id) {
    const ch = this.postacie.get(id)
    if (!ch) return
    ch.powiedz('Nowe zadanie! 📋', 4)
    if (ch.stan !== 'siedzi') ch.gest()
  }
}
