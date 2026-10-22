// Warstwa danych udająca backend.
// Cały interfejs korzysta TYLKO z tych funkcji. Po napisaniu backendu wystarczy podmienić
// ich wnętrze na zapytania HTTP / WebSocket - reszta aplikacji zostaje bez zmian.
import { DZIALY, PRACOWNICY, ZADANIA, CZAT, SERWERY, POMIESZCZENIA, ZALOGOWANY_ID, FIRMA } from './przykladowe.js'

const sluchacze = new Map()
export function na(zdarzenie, fn) {
  if (!sluchacze.has(zdarzenie)) sluchacze.set(zdarzenie, new Set())
  sluchacze.get(zdarzenie).add(fn)
  return () => sluchacze.get(zdarzenie).delete(fn)
}
function emituj(zdarzenie, dane) {
  sluchacze.get(zdarzenie)?.forEach((fn) => { try { fn(dane) } catch (e) { console.error(e) } })
  sluchacze.get('*')?.forEach((fn) => { try { fn({ zdarzenie, dane }) } catch (e) { console.error(e) } })
}

const opoznienie = (ms = 120) => new Promise((r) => setTimeout(r, ms))
const godzina = (d = new Date()) => d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

// ---- stan (w przyszłości: baza danych na serwerze)
const stan = {
  pracownicy: PRACOWNICY.map((p) => ({
    ...p,
    email: `${bezPolskich(p.imie).toLowerCase()}.${bezPolskich(p.nazwisko).toLowerCase()}@atlas-software.pl`,
    telefon: '+48 5' + String(10000000 + Math.floor(hashTekstu(p.id) % 89999999)).slice(0, 8).replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3'),
    tryb: 'biuro',          // biuro | zdalnie | nieobecny
    status: 'dostepny',     // dostepny | zajety | spotkanie | zaraz_wracam | offline
    wAplikacji: true,
    ostatnioWidziany: Date.now(),
    aktywnosc: 'Przy biurku',
    pokoj: null,
    nastroj: 70 + (hashTekstu(p.id) % 25),
  })),
  zadania: ZADANIA.map((z) => ({ ...z, opis: z.opis ?? '', utworzono: Date.now() - (hashTekstu(z.klucz) % 9) * 86400000 })),
  czat: structuredClone(CZAT),
  nieprzeczytane: { mateusz: 1, kamil: 1 },
  powiadomienia: [],
  prosbyPulpit: {},
  licznikZadan: 60,
}

// kilka osób nie jest w biurze (żeby było widać różne statusy)
ustaw('barbara', { tryb: 'nieobecny', status: 'offline', wAplikacji: false, ostatnioWidziany: Date.now() - 16 * 3600000, aktywnosc: 'Urlop do piątku' })
ustaw('natalia', { tryb: 'zdalnie', status: 'dostepny', wAplikacji: true, aktywnosc: 'Pracuje zdalnie: statystyki social media' })
ustaw('wiktor', { tryb: 'zdalnie', status: 'zajety', wAplikacji: true, aktywnosc: 'Pracuje zdalnie: aplikacja mobilna' })

function ustaw(id, zmiany) {
  const p = stan.pracownicy.find((x) => x.id === id)
  if (p) Object.assign(p, zmiany)
}

function bezPolskich(t) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')
}
function hashTekstu(t) {
  let h = 2166136261
  for (const c of t) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  return h >>> 0
}

// ---- odczyt
export const firma = () => ({ ...FIRMA })
export const zalogowany = () => stan.pracownicy.find((p) => p.id === ZALOGOWANY_ID)
export const dzialy = () => DZIALY
export const dzial = (id) => DZIALY.find((d) => d.id === id)
export const pomieszczenie = (id) => POMIESZCZENIA[id]
export const pracownicy = () => stan.pracownicy
export const pracownik = (id) => stan.pracownicy.find((p) => p.id === id)
export const pracownicyDzialu = (id) => stan.pracownicy.filter((p) => p.dzial === id)
export const zadaniaOsoby = (id) => stan.zadania.filter((z) => z.osoba === id)
export const zadaniaDzialu = (id) => stan.zadania.filter((z) => pracownik(z.osoba)?.dzial === id)
export const serwer = (id) => SERWERY[id]
export const rozmowa = (id) => stan.czat[id] ?? []
export const nieprzeczytane = (id) => stan.nieprzeczytane[id] ?? 0
export const sumaNieprzeczytanych = () => Object.values(stan.nieprzeczytane).reduce((a, b) => a + b, 0)
export const powiadomienia = () => stan.powiadomienia
export const prosbaPulpit = (id) => stan.prosbyPulpit[id]
export function imieNazwisko(id) { const p = pracownik(id); return p ? `${p.imie} ${p.nazwisko}` : id }

// ---- zapis

/** Aktualizacja obecności (wywołuje symulacja biura; później: serwer przez WebSocket). */
export function aktualizujObecnosc(id, zmiany) {
  const p = pracownik(id)
  if (!p) return
  let zmiana = false
  for (const k in zmiany) if (p[k] !== zmiany[k]) { p[k] = zmiany[k]; zmiana = true }
  if (p.tryb !== 'nieobecny') p.ostatnioWidziany = Date.now()
  if (zmiana) emituj('obecnosc', p)
}

export async function dodajZadanie({ osoba, tytul, opis = '', priorytet = 'średni', termin }) {
  await opoznienie()
  const z = {
    klucz: `SCRUM-${++stan.licznikZadan}`, tytul, opis, osoba, status: 'do_zrobienia', postep: 0, priorytet,
    termin: termin || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), utworzono: Date.now(), nowe: true,
  }
  stan.zadania.unshift(z)
  emituj('zadanie', { typ: 'nowe', zadanie: z })
  powiadom({ typ: 'zadanie', tekst: `Zlecono ${z.klucz} „${tytul}” → ${imieNazwisko(osoba)}`, osoba })
  return z
}

export function aktualizujZadanie(klucz, zmiany) {
  const z = stan.zadania.find((x) => x.klucz === klucz)
  if (!z) return
  const byloZrobione = z.status === 'zrobione'
  Object.assign(z, zmiany)
  emituj('zadanie', { typ: 'zmiana', zadanie: z })
  if (!byloZrobione && z.status === 'zrobione') powiadom({ typ: 'sukces', tekst: `${imieNazwisko(z.osoba)} zamknął(a) ${z.klucz} „${z.tytul}”`, osoba: z.osoba })
}

export async function wyslijWiadomosc(id, tekst) {
  const lista = (stan.czat[id] ??= [])
  const w = { od: 'ja', tekst, czas: godzina() }
  lista.push(w)
  emituj('wiadomosc', { id, wiadomosc: w })
  zaplanujOdpowiedz(id, tekst)
  return w
}

const ODPOWIEDZI = [
  'Jasne, już się tym zajmuję 👍', 'Ok, dam znać jak skończę.', 'Dzięki, zerknę za chwilę.',
  'Mogę po spotkaniu?', 'Zrobione!', 'Właśnie o tym myślałem/am :)', 'Jasne, wpadnę do Ciebie za 5 min.',
]

function zaplanujOdpowiedz(id, tekst) {
  const p = pracownik(id)
  if (!p) return
  if (!p.wAplikacji || p.status === 'offline') {
    setTimeout(() => {
      const lista = stan.czat[id]
      lista.push({ od: 'system', tekst: `${p.imie} jest offline. Wiadomość zostanie dostarczona, gdy wróci do aplikacji.`, czas: godzina() })
      emituj('wiadomosc', { id })
    }, 700)
    return
  }
  const zwloka = p.status === 'spotkanie' ? 9000 : p.status === 'zajety' ? 5000 : 2200
  setTimeout(() => emituj('pisze', { id, pisze: true }), Math.min(1200, zwloka / 2))
  setTimeout(() => {
    emituj('pisze', { id, pisze: false })
    let odp = ODPOWIEDZI[Math.floor(Math.random() * ODPOWIEDZI.length)]
    if (/\?/.test(tekst) && /dost[eę]pn|jeste[sś]/i.test(tekst)) odp = p.status === 'dostepny' ? 'Tak, jestem, o co chodzi?' : 'Teraz trochę zajęty/a, odezwę się za chwilę.'
    if (p.status === 'spotkanie') odp = 'Jestem na spotkaniu, odpiszę po nim.'
    const w = { od: id, tekst: odp, czas: godzina() }
    stan.czat[id].push(w)
    stan.nieprzeczytane[id] = (stan.nieprzeczytane[id] ?? 0) + 1
    emituj('wiadomosc', { id, wiadomosc: w })
  }, zwloka)
}

/** Wiadomość od pracownika (później: przychodzi z serwera przez WebSocket). */
export function wiadomoscPrzychodzaca(id, tekst) {
  const lista = (stan.czat[id] ??= [])
  const w = { od: id, tekst, czas: godzina() }
  lista.push(w)
  stan.nieprzeczytane[id] = (stan.nieprzeczytane[id] ?? 0) + 1
  emituj('wiadomosc', { id, wiadomosc: w })
}

export function oznaczPrzeczytane(id) {
  if (stan.nieprzeczytane[id]) { stan.nieprzeczytane[id] = 0; emituj('wiadomosc', { id }) }
}

/** Prośba o zdalny pulpit - na razie tylko wysłanie prośby (połączenie zrobi backend). */
export async function poprosOZdalnyPulpit(id) {
  await opoznienie(200)
  const p = pracownik(id)
  stan.prosbyPulpit[id] = { stan: 'oczekuje', od: Date.now() }
  emituj('pulpit', { id })
  powiadom({ typ: 'pulpit', tekst: `Wysłano prośbę o zdalny pulpit do: ${p.imie} ${p.nazwisko}`, osoba: id })
  if (p.wAplikacji && p.status !== 'offline') {
    setTimeout(() => {
      stan.prosbyPulpit[id] = { stan: 'zaakceptowano', od: Date.now() }
      emituj('pulpit', { id })
      powiadom({ typ: 'pulpit', tekst: `${p.imie} ${p.nazwisko} zaakceptował(a) prośbę o zdalny pulpit`, osoba: id })
    }, 5000 + Math.random() * 3000)
  }
  return stan.prosbyPulpit[id]
}

export function powiadom({ typ = 'info', tekst, osoba = null }) {
  const p = { id: Date.now() + Math.random(), typ, tekst, osoba, czas: godzina(), przeczytane: false }
  stan.powiadomienia.unshift(p)
  if (stan.powiadomienia.length > 60) stan.powiadomienia.pop()
  emituj('powiadomienie', p)
  return p
}

export function oznaczPowiadomieniaPrzeczytane() {
  stan.powiadomienia.forEach((p) => { p.przeczytane = true })
  emituj('powiadomienia-przeczytane', null)
}

export const STATUSY = {
  dostepny: { nazwa: 'Dostępny', kolor: '#3ddc84' },
  zajety: { nazwa: 'Zajęty', kolor: '#ff7a45' },
  spotkanie: { nazwa: 'Na spotkaniu', kolor: '#b48cff' },
  zaraz_wracam: { nazwa: 'Zaraz wracam', kolor: '#ffc145' },
  offline: { nazwa: 'Offline', kolor: '#6c7d9b' },
}

export const STATUSY_ZADAN = {
  do_zrobienia: { nazwa: 'Do zrobienia', kolor: '#9fb0cc' },
  w_trakcie: { nazwa: 'W trakcie', kolor: '#2ec4b6' },
  do_review: { nazwa: 'Do review', kolor: '#ffc145' },
  zrobione: { nazwa: 'Zrobione', kolor: '#3ddc84' },
}

export function czasTemu(ts) {
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 45) return 'teraz'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min temu`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} godz. temu`
  return `${Math.round(h / 24)} dni temu`
}
