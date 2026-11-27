// „Moje zadania” (PZS-5): lista zadań zalogowanej osoby i zmiana ich statusu.
// Zalogowaną osobę odczytujemy z sesji, którą zapisuje logowanie (PZS-6).
import { ZADANIA } from './przykladowe.js'

/** Klucz sesji w sessionStorage – ten sam musi zapisywać ekran logowania. */
export const KLUCZ_SESJI = 'te-sesja'
/** Strona logowania, gdy nikt nie jest zalogowany. */
export const STRONA_LOGOWANIA = 'logowanie.html'

/** Statusy w kolejności, w jakiej zadanie przez nie przechodzi. */
export const STATUSY = ['do_zrobienia', 'w_trakcie', 'do_review', 'zrobione']
export const NAZWY_STATUSOW = { do_zrobienia: 'Do zrobienia', w_trakcie: 'W trakcie', do_review: 'Do review', zrobione: 'Zrobione' }

/** Id zalogowanej osoby z magazynu sesji albo null. */
export function zalogowanaOsoba(magazyn) {
  return magazyn.getItem(KLUCZ_SESJI)
}

/**
 * Zadania jednej osoby: najpierw niezrobione, w nich najbliższy termin na górze.
 * zmiany = { klucz: status } nadpisuje statusy z danych (zmiany zrobione przez użytkownika).
 */
export function mojeZadania(osoba, zadania = ZADANIA, zmiany = {}) {
  return zadania
    .filter((z) => z.osoba === osoba)
    .map((z) => ({ ...z, status: zmiany[z.klucz] ?? z.status }))
    .sort((a, b) => (a.status === 'zrobione') - (b.status === 'zrobione') || a.termin.localeCompare(b.termin))
}

/** Zmienia status zadania; nieznany status to błąd, żeby literówka nie zginęła po cichu. */
export function zmienStatus(zmiany, klucz, status) {
  if (!STATUSY.includes(status)) throw new Error(`Nieznany status: ${status}`)
  return { ...zmiany, [klucz]: status }
}

/** Liczba zadań w każdym statusie, np. { do_zrobienia: 1, w_trakcie: 2, do_review: 0, zrobione: 1 } */
export function podsumowanie(lista) {
  return Object.fromEntries(STATUSY.map((s) => [s, lista.filter((z) => z.status === s).length]))
}
