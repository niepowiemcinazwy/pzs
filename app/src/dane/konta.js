// Konta do logowania (PZS-6). Na razie bez backendu: konta powstają z listy pracowników,
// a hasło demo jest sprawdzane po skrócie SHA-256. Po napisaniu backendu wystarczy podmienić
// wnętrze zaloguj() na zapytanie do serwera.
import { PRACOWNICY } from './przykladowe.js'

/** Strona, na którą trafia pracownik po udanym logowaniu. */
export const PO_ZALOGOWANIU = 'moje-zadania.html'
/** Klucz, pod którym sesja leży w sessionStorage przeglądarki. */
export const KLUCZ_SESJI = 'te-sesja'
/** Hasło demo do prezentacji (to samo dla wszystkich kont, dopóki nie ma backendu). */
export const HASLO_DEMO = 'demo123'
// SHA-256 z 'te-demo:' + hasło; w kodzie nie trzymamy hasła wprost
const SKROT_HASLA_DEMO = 'eb19c44acaa2eea6c58e4a2c60504ccf59e4deb8b60e4bf7863b1fd7e83f20d3'

function bezPolskich(t) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')
}

/** Adres e-mail pracownika w firmie, np. kamil.styn@atlas-software.pl */
export function emailPracownika(p) {
  return `${bezPolskich(p.imie)}.${bezPolskich(p.nazwisko)}@atlas-software.pl`.toLowerCase()
}

export const KONTA = PRACOWNICY.map((p) => ({ email: emailPracownika(p), osoba: p.id, imie: p.imie, nazwisko: p.nazwisko }))

async function skrot(haslo) {
  const bajty = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode('te-demo:' + haslo))
  return [...new Uint8Array(bajty)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Sprawdza e-mail i hasło.
 * Zwraca { ok: true, konto } albo { ok: false, blad } z komunikatem dla użytkownika.
 */
export async function zaloguj(email, haslo) {
  const e = String(email ?? '').trim().toLowerCase()
  if (!e || !haslo) return { ok: false, blad: 'Podaj e-mail i hasło.' }
  const konto = KONTA.find((k) => k.email === e)
  // ten sam komunikat dla złego e-maila i złego hasła: nie zdradzamy, które konta istnieją
  if (!konto || (await skrot(haslo)) !== SKROT_HASLA_DEMO) return { ok: false, blad: 'Nieprawidłowy e-mail lub hasło.' }
  return { ok: true, konto }
}

/** Zapisuje zalogowaną osobę w magazynie sesji (sessionStorage albo jego zamiennik w testach). */
export function zapiszSesje(magazyn, konto) {
  magazyn.setItem(KLUCZ_SESJI, konto.osoba)
}

/** Id zalogowanej osoby albo null. */
export function odczytajSesje(magazyn) {
  return magazyn.getItem(KLUCZ_SESJI)
}

export function wyloguj(magazyn) {
  magazyn.removeItem(KLUCZ_SESJI)
}
