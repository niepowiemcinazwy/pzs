# Team Environment – jak uruchomić

## Najprościej (bez instalowania niczego)

Odpal plik **`TeamEnvironment-0.4.1.exe`** (leży w folderze `projekt zespołowy`, obok repozytorium).
Pierwsze uruchomienie trwa kilka sekund dłużej, bo program się rozpakowuje.

## Z kodu (dla programistów)

Potrzebny jest Node.js 18+.

```
cd app
npm install
npm start
```

Albo dwuklik na **`Uruchom.bat`** w folderze `app` – sam zainstaluje zależności i uruchomi aplikację.

Zbudowanie nowego pliku .exe: `npm run dist` (plik pojawi się w `app/release/`).

## Sterowanie

| Co | Jak |
|----|-----|
| Przybliżanie / oddalanie | kółko myszy – przybliża w miejsce, gdzie jest kursor |
| Przesuwanie po biurze | przeciągnij myszą |
| Pracownik | kliknij postać albo plakietkę nad głową – kamera się do niej przybliża i za nią podąża |
| Odznaczenie | kliknij obok / `Esc` / krzyżyk – kamera wraca do widoku całego biura |
| Dział | kliknij tabliczkę z nazwą działu, podłogę pokoju albo dział w lewym panelu |
| Serwer | kliknij szafę w serwerowni |
| Wyszukiwarka | `Ctrl + K` |
| Tryb prezentacji | `F10` (wyjście: `Esc`) |
| Cały widok biura | przycisk w prawym dolnym rogu |

## Co jest w aplikacji

- Biuro w izometrycznym pixel-arcie: Zarząd, Kierownictwo, Kadry i HR, Sala konferencyjna, Kuchnia, Marketing,
  Development, Quality Assurance, Infrastruktura i serwerownia.
- 18 pracowników (w tym Dawid, Mateusz i Kamil z rolami jak w prezentacji): 15 w biurze, 2 zdalnie, 1 na urlopie.
  Każdy ma własny wygląd (fryzura, ubranie, dodatki).
- Postacie same chodzą po biurze: praca przy biurku, kawa, konsultacje, obchód działu, serwerownia, zgłaszanie błędów.
- Nad głową: imię i nazwisko, rola, dział, status i dymki z tym, co robią. Nad biurkami: zadanie i pasek postępu.
- Panel pracownika: status, czy jest w aplikacji firmowej, kiedy był widziany, co teraz robi, zadania, kontakt.
  Przyciski: **Zleć zadanie**, **Napisz**, **Poproś o zdalny pulpit**, **Śledź w biurze**.
- Panel działu: liczba osób, kto co robi (na żywo), zadania, obciążenie, cele, zadanie dla całego działu, spotkanie działu.
- Czat (dymek w górnym pasku), powiadomienia (dzwonek), zwoływanie spotkań w sali konferencyjnej,
  serwerownia z wykresami i alarmem przegrzania, dźwięki 8-bit, tryb prezentacji (F10).

## Dane

Wszystkie dane są **przykładowe** (`src/dane/przykladowe.js`).
Interfejs korzysta wyłącznie z funkcji w `src/dane/api.js` – po zrobieniu backendu wystarczy podmienić ich wnętrze
na zapytania do serwera (REST / WebSocket). Zdalny pulpit to na razie tylko prośba – samo połączenie zrobi backend.

## Struktura kodu

```
app/
  electron/main.cjs        okno aplikacji (Electron)
  src/main.js              start i główna pętla
  src/engine2d/            silnik 2D: izometria, kamera, plan biura, podłogi i ściany, bryły, postacie, ruch
  src/ui/                  interfejs: pasek, panele, czat, okna, plakietki, ikony, dźwięki, tryb prezentacji
  src/dane/                dane przykładowe i warstwa API
  public/sprites/          sprite'y mebli (licencje: public/sprites/LICENCJE.txt)
  narzedzia/               skrypt przygotowujący sprite'y
```

## Grafika

- Meble: darmowa paczka „Isometric pixel bedroom” (Sweeetpotatoo, itch.io) + kilka elementów z arkusza projektu
  Playground (lekko przerobione).
- Ściany, podłogi, okna, szafy serwerowe, stół, kuchnia, kanapy, krzesła biurowe, postacie i ikony są rysowane w kodzie.
- Szczegóły: `public/sprites/LICENCJE.txt`.
