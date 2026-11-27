// Strona „Moje zadania” (PZS-5): zadania zalogowanej osoby ze zmianą statusu.
import './strona.css'
import './moje-zadania.css'
import '@fontsource/pixelify-sans/400.css'
import '@fontsource/pixelify-sans/700.css'
import '@fontsource/pixelify-sans/latin-ext-400.css'
import '@fontsource/pixelify-sans/latin-ext-700.css'
import '@fontsource/tiny5/400.css'
import '@fontsource/tiny5/latin-ext-400.css'
import { PRACOWNICY } from './dane/przykladowe.js'
import { mojeZadania, zmienStatus, podsumowanie, zalogowanaOsoba, STATUSY, NAZWY_STATUSOW, KLUCZ_SESJI, STRONA_LOGOWANIA } from './dane/mojeZadania.js'

const KLUCZ_ZMIAN = 'te-zmiany-statusow'
const kto = document.getElementById('kto')
const lista = document.getElementById('zadania')
const suma = document.getElementById('podsumowanie')

function czytajZmiany() {
  try { return JSON.parse(localStorage.getItem(KLUCZ_ZMIAN)) ?? {} } catch { return {} }
}
function zapiszZmiany(z) {
  // w trybie prywatnym zapis może się nie udać: zmiana zostaje wtedy tylko do odświeżenia strony
  try { localStorage.setItem(KLUCZ_ZMIAN, JSON.stringify(z)) } catch { /* brak dostępu do localStorage */ }
}

const osoba = zalogowanaOsoba(sessionStorage)
const pracownik = PRACOWNICY.find((p) => p.id === osoba)
let zmiany = czytajZmiany()

function element(tag, klasa, tekst) {
  const el = document.createElement(tag)
  if (klasa) el.className = klasa
  if (tekst !== undefined) el.textContent = tekst
  return el
}

function wiersz(z) {
  const li = element('li', 'zadanie' + (z.status === 'zrobione' ? ' zrobione' : ''))
  const opis = element('div')
  opis.append(element('b', '', z.klucz), ' ', element('span', '', z.tytul), element('small', '', `termin ${z.termin} · priorytet ${z.priorytet}`))
  const wybor = element('select')
  wybor.setAttribute('aria-label', `Status ${z.klucz}`)
  for (const s of STATUSY) wybor.add(new Option(NAZWY_STATUSOW[s], s, false, s === z.status))
  wybor.addEventListener('change', () => {
    zmiany = zmienStatus(zmiany, z.klucz, wybor.value)
    zapiszZmiany(zmiany)
    pokaz()
  })
  li.append(opis, wybor)
  return li
}

function pokaz() {
  const zadania = mojeZadania(osoba, undefined, zmiany)
  const liczby = podsumowanie(zadania)
  suma.textContent = STATUSY.map((s) => `${NAZWY_STATUSOW[s]}: ${liczby[s]}`).join(' · ')
  lista.replaceChildren(...(zadania.length ? zadania.map(wiersz) : [element('li', 'zadanie', 'Nie masz przypisanych zadań.')]))
}

if (!pracownik) {
  const link = element('a', '', 'Zaloguj się')
  link.href = STRONA_LOGOWANIA
  kto.replaceChildren('Nie jesteś zalogowany. ', link, ', żeby zobaczyć swoje zadania.')
  document.getElementById('wyloguj').hidden = true
} else {
  kto.textContent = `${pracownik.imie} ${pracownik.nazwisko} · ${pracownik.rola}`
  document.getElementById('wyloguj').addEventListener('click', () => sessionStorage.removeItem(KLUCZ_SESJI))
  pokaz()
}
