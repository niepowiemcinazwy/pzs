# Team Environment (PZS)

Projekt zespołowy, Uniwersytet Gdański (studia niestacjonarne).

Team Environment to aplikacja webowa do zarządzania firmą, w której zamiast tabelek i list widać firmę jako biuro w 3D. Szef otwiera aplikację i widzi swoje biuro: gabinet zarządu, poszczególne działy i pracowników przy biurkach. Pracownicy chodzą po biurze, idą na kawę, siadają do komputera itd. Ta część jest tylko wizualna (front-end), ale wszystko co się zleca z poziomu biura dzieje się naprawdę, czyli zadanie faktycznie trafia do konkretnej osoby.

## Problem

W małych i średnich firmach szef ma informacje rozrzucone po kilku narzędziach: zadania w jednym, czat w drugim, zdalny pulpit w trzecim. Ciężko szybko ogarnąć kto jest w jakim dziale, kto nad czym siedzi i z kim trzeba pogadać. Do tego klasyczne systemy do zarządzania są nudne i mało czytelne dla kogoś kto nie siedzi w nich cały dzień.

Chcemy to zebrać w jednym miejscu i pokazać w formie, którą od razu się rozumie, czyli jako biuro.

## Użytkownik

- **Właściciel / szef firmy** (główny użytkownik) - chce widzieć całą firmę w jednym miejscu, zlecać zadania i kontaktować się z ludźmi.
- **Kierownik działu** - zarządza swoim działem i jego pracownikami.
- **Pracownik** - dostaje zadania i wiadomości, może udostępnić pulpit gdy szef albo kierownik chce się połączyć.

Celujemy w firmy do ok. 50 osób.

## Najważniejsze funkcje

1. **Biuro 3D** - widok firmy w przeglądarce jako biuro 3D z podziałem na zarząd i działy. Każdy pracownik ma swoją postać i biurko, postacie poruszają się po biurze (kawa, przerwy, praca przy komputerze). Po kliknięciu w postać widać kto to jest, w jakim dziale pracuje i co aktualnie robi.
2. **Zlecanie zadań** - z poziomu biura można kliknąć pracownika albo cały dział i zlecić zadanie (tytuł, opis, termin). Zadanie naprawdę trafia do pracownika, a jego status (do zrobienia / w trakcie / zrobione) widać potem w biurze.
3. **Kontakt z pracownikiem** - wysyłanie prywatnych wiadomości do pracownika oraz połączenie zdalnym pulpitem z jego komputerem, bezpośrednio z widoku biura.

Na razie skupiamy się na przygotowaniu środowiska i planowaniu, implementacja w kolejnych sprintach.

## Aplikacja (prototyp frontu)

W folderze [`app/`](app/) jest pierwsza wersja frontu: biuro w izometrycznym pixel-arcie (Electron), na razie na danych przykładowych.
Jak uruchomić: [app/JAK_URUCHOMIC.md](app/JAK_URUCHOMIC.md).

## Zespół i role

| Osoba | GitHub | Rola |
|-------|--------|------|
| Dawid Wawer | [niepowiemcinazwy](https://github.com/niepowiemcinazwy) | Lider / PO, developer |
| Kamil Styn | [Styneek](https://github.com/Styneek) | QA, developer |
| Mateusz Sobczak | [MataKomandos](https://github.com/MataKomandos) | Infrastruktura, developer |

Właściciele ról:

- **Lider / PO** - Dawid Wawer
- **Developer** - Dawid Wawer (wszyscy piszemy kod, Dawid pilnuje backlogu i code review)
- **QA** - Kamil Styn
- **Infrastruktura** - Mateusz Sobczak

## Linki

- Jira (Scrum, projekt PZS): https://kamilstyn.atlassian.net/jira/software/projects/PZS/boards/34/backlog
- Prototyp (Figma): https://www.figma.com/proto/VXvWzQiQY4Bn5eZO0fx9hA/PZS?node-id=1005-139&starting-point-node-id=1005-139
- Definition of Done: [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md)

## Stos technologiczny

- Front: JavaScript, Canvas 2D (silnik izometryczny), Vite, Electron (wersja na komputer)
- Backend (w kolejnych sprintach): Node.js + PostgreSQL
- CI: GitHub Actions – build przy każdym Pull Requeście

## Jak uruchomić

```
cd app
npm install
npm start          # aplikacja okienkowa (Electron)
npm run serwer     # wersja przeglądarkowa na http://localhost:8080
```

Na dole strony widać `wersja <skrót commita>`, z którego zbudowano wersję.

## Zasady pracy z repozytorium

- Na `main` nie pushujemy bezpośrednio – każda zmiana idzie przez Pull Request.
- PR musi mieć zatwierdzenie (approval) od innej osoby i zielone CI.

Zasady współpracy są w pliku [TEAM_CONTRACT.md](TEAM_CONTRACT.md).
