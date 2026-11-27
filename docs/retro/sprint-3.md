# Retrospektywa Sprintu 3

Sprint 3: 18.11.2026 – 27.11.2026 (koniec dzień przed zjazdem 28.11)
Cel: Pracownik loguje się do aplikacji i widzi swoje zadania, a każda wdrożona historyjka jest sprawdzona przez QA w ciągu jednego dnia.

## Co poszło dobrze
- Obie historyjki są na serwerze i działają razem: logowanie (PZS-6, Mateusz) i „Moje zadania” (PZS-5, Kamil). Test integracyjny `PZS-6 + PZS-5` w jobie `test` i dwa nowe kroki `smoke` sprawdzają je po każdym wdrożeniu.
- Blokadę PZS-5 przez PZS-6 zgłosiliśmy w Jirze flagą i powiązaniem „is blocked by”. Zdjęliśmy ją z komentarzem, gdy PR #12 wszedł na `main`.
- QA zdążyło w ciągu jednego dnia: PZS-5 sprawdzony 7 minut po scaleniu, PZS-6 po ok. 2 godzinach 20 minutach.
- Kontrakt zespołu ma nowe zasady na spory i nierówny wkład (PR #11, zatwierdzony przez obu pozostałych członków).

## Co poszło źle
- Wszystko weszło na `main` ostatniego dnia sprintu (27.11, w 6 minut). Przez ponad tydzień nie było żadnego PR-a, więc na daily nie było widać postępu.
- Backend (REST API i baza) nie zmieścił się w sprincie. Wydzieliliśmy go do osobnej historyjki PZS-87 i przenosimy do Sprintu 4.
- Nikt nie wpisywał czasu w Jirze przy zadaniach Sprintu 3.

## Stan działań ze Sprintu 2 (`docs/retro/sprint-2.md`)
| Działanie | Właściciel | Stan |
|---|---|---|
| QA sprawdza wdrożoną historyjkę na serwerze w ciągu 1 dnia od scalenia (PZS-21) | Kamil Styn | **Częściowo** – obie historyjki Sprintu 3 sprawdzone tego samego dnia (podzadanie PZS-83 zrobione), ale zasada nie jest jeszcze dopisana do `TEAM_CONTRACT.md` (PZS-82). Przechodzi do Sprintu 4. |
| Naprawić pusty `catch {}` w `graj()` (PZS-22) | Mateusz Sobczak | **Niezrobione** – Mateusz robił logowanie, a w kodzie nadal jest `TODO(PZS-22)`. Przechodzi do Sprintu 4. |

## Nowe działanie
| Działanie | Właściciel | Zgłoszenie |
|---|---|---|
| Każda historyjka ma otwarty Pull Request (choćby szkic) najpóźniej w środę drugiego tygodnia sprintu; Dawid sprawdza to na daily | Dawid Wawer | PZS-89 |

## Ankieta bezpieczeństwa psychologicznego (Edmondson, 7 pytań)
Anonimowa ankieta w Google Forms, skala 1–7, 3 odpowiedzi na 3 osoby. Pytania 1, 3 i 5 są sformułowane negatywnie, więc odwracamy je wzorem `8 − x`. Po odwróceniu wyższa liczba zawsze znaczy więcej bezpieczeństwa.

| Pytanie | Odpowiedzi | Średnia (po odwróceniu) |
|---|---|---|
| 1. Jeśli popełnisz błąd w tym zespole, często jest ci on wypominany. *(odwr.)* | 1, 1, 1 | 7,00 |
| 2. Członkowie tego zespołu potrafią poruszać problemy i trudne sprawy. | 6, 6, 6 | 6,00 |
| 3. Ludzie w tym zespole czasem odrzucają innych za to, że się różnią. *(odwr.)* | 1, 1, 1 | 7,00 |
| 4. W tym zespole można bezpiecznie podjąć ryzyko. | 7, 7, 7 | 7,00 |
| 5. Trudno poprosić innych członków tego zespołu o pomoc. *(odwr.)* | 1, 1, 1 | 7,00 |
| 6. Nikt w tym zespole nie działałby celowo tak, żeby podważyć moje starania. | 7, 7, 7 | 7,00 |
| 7. Czuję, że moje wyjątkowe umiejętności i talenty są doceniane i wykorzystywane. | 7, 7, 7 | 7,00 |
| **Średnia ogólna** | | **6,86** |

Najniżej wypadło pytanie 2 (poruszanie problemów). Pasuje to do tego, co widać w Sprincie 3: przez tydzień nikt nie powiedział na głos, że praca stoi. Działanie PZS-89 ma to wyciągać wcześniej. Wszyscy odpowiedzieliśmy identycznie, więc przy 3 osobach wynik mówi niewiele. Powtórzymy ankietę po Sprincie 4 i porównamy.

## Prędkość
| Sprint | Ukończone punkty | Historyjki |
|---|---|---|
| Sprint 1 | 8 | PZS-1 |
| Sprint 2 | 13 | PZS-2, PZS-3, PZS-4 |
| Sprint 3 | 10 | PZS-5, PZS-6 |
| Średnia | 10,3 | |

Sprint 4 planujemy na 10 punktów (PZS-87 i PZS-13), czyli tyle, ile wynosi średnia, a nie najlepszy sprint.
