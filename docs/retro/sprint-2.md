# Retrospektywa Sprintu 2

Sprint 2: 04.11.2026 – 18.11.2026
Cel: Szef widzi w panelach pracownika i działu aktualne liczby, a zespół zgłasza zmiany we wspólnych plikach przed pracą, żeby uniknąć konfliktów.

## Co poszło dobrze
- Liczby w panelach (PZS-2, PZS-4) i komunikat ładowania (PZS-3) trafiły na `main` przez PR z review i zielonym CI.
- Mamy prawdziwy serwer deweloperski: po scaleniu strona sama wdraża się na https://niepowiemcinazwy.github.io/pzs/, a test po wdrożeniu (`smoke`) sprawdza, czy działa właściwy commit.
- Pipeline ma teraz trzy bramy przed scaleniem: `build`, `test` i `lint`. PR z celowym błędem lintu i PR z czerwonym testem nie dały się scalić.
- W Sprincie 2 nie było żadnego konfliktu przy scalaniu.

## Co poszło źle
- Historyjki długo stały w statusie *W toku*, bo czekały na ręczne sprawdzenie przez QA po scaleniu.
- Pierwsze uruchomienie ESLint znalazło 13 błędów w starym kodzie (nieużywane zmienne i importy). Nikt ich wcześniej nie zauważył na review.
- Część pracy nie była logowana w Jirze (brak rejestru pracy i podzadań), więc trudno było ocenić postęp na daily.

## Stan działań ze Sprintu 1 (`docs/retro/sprint-1.md`)
| Działanie | Właściciel | Stan |
|---|---|---|
| Zapowiadać na Discordzie (#dev) zmiany we wspólnych plikach przed rozpoczęciem pracy | Kamil Styn | **Zrobione** – PR-y #5 i #6 zmieniały `interfejs.js` w tym samym czasie, ale było to zapowiedziane i nie było konfliktu. |
| Robić przegląd PR-a w ciągu 24 godzin od prośby | Mateusz Sobczak | **Częściowo** – PR-y z kodem przeglądane w ciągu doby, ale PR z pipeline'em czekał dłużej. Zostaje jako zasada w `TEAM_CONTRACT.md`. |

## Nowe działania
| Działanie | Właściciel | Zgłoszenie |
|---|---|---|
| QA sprawdza każdą wdrożoną historyjkę na serwerze deweloperskim w ciągu 1 dnia od scalenia i od razu zmienia status w Jirze | Kamil Styn | PZS-21 |
| Naprawić „wybite okno”: puste `catch {}` w `graj()` połyka błędy dźwięku (`app/src/ui/dzwiek.js`) | Mateusz Sobczak | PZS-22 |
