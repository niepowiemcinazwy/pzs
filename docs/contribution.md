# Raport wkładu – Sprint 3

**Okno Sprintu 3:** od 18.11.2026 18:00 do 27.11.2026 23:20 (czas polski, +01:00).
Sprint 3 kończy się dzień przed zjazdem 28.11.2026. Zamknęliśmy go 27.11 o 23:20, tuż przed scaleniem tego raportu (PR #14), więc sam raport liczy się już do Sprintu 4.

Liczymy tylko to, co weszło na `main` w tym oknie, oraz review i zgłoszenia w Jirze z tego samego okresu.
Nazwy autorów ujednolica plik `.mailmap` (Dawid commituje z dwóch kont, Mateusz miał na jednym komputerze nazwę `mat sob`).

## Podsumowanie

| Osoba | Commity na `main` | Scalone PR-y (autor) | Review (zatwierdzenia) | Zadania w Jirze (Gotowe) | Testy QA w Jirze |
|---|---|---|---|---|---|
| Dawid Wawer | 1 | #11 | #12, #13 | PZS-86 | – |
| Mateusz Sobczak | 1 | #12 | #11 | PZS-6 (PZS-44, PZS-47) | PZS-5 |
| Kamil Styn | 1 | #13 | #11 | PZS-5 (PZS-40, PZS-41, PZS-43) | PZS-6 |

Każdy z nas ma w Sprincie 3 jedną historyjkę albo zadanie, jeden scalony Pull Request i przynajmniej jedno review. Nikt nie scalił niczego bez zatwierdzenia innej osoby.

## Commity (squash, jeden na Pull Request)

```
$ git shortlog -sn --no-merges --since="2026-11-18T18:00+01:00" --until="2026-11-27T23:20+01:00" origin/main
     1	Dawid Wawer
     1	Kamil Styn
     1	Mateusz Sobczak
```

```
$ git log --no-merges --since="2026-11-18T18:00+01:00" --until="2026-11-27T23:20+01:00" --format='%h %aN %s' --shortstat origin/main
6f3a285 Dawid Wawer docs(contract): add rules for disputes and unequal contribution (#11)
 1 file changed, 36 insertions(+), 1 deletion(-)
a5777b1 Kamil Styn feat: add my tasks page (#13)
 7 files changed, 212 insertions(+)
3d8c4e0 Mateusz Sobczak feat: add login page (#12)
 6 files changed, 174 insertions(+)
```

## Pull Requesty scalone w Sprincie 3

```
$ gh pr list --state merged --search "merged:2026-11-18T18:00:00+01:00..2026-11-27T23:20:00+01:00" --json number,author,title --jq '.[] | "#\(.number) \(.author.login) \(.title)"'
#13 Styneek feat: add my tasks page
#12 MataKomandos feat: add login page
#11 niepowiemcinazwy docs(contract): add rules for disputes and unequal contribution
```

PR #13 to PZS-5, #12 to PZS-6, #11 to PZS-86. PR-y #7 i #8 z 18.11 zostały scalone przed 18:00, czyli jeszcze w Sprincie 2.

## Review

```
$ gh api repos/niepowiemcinazwy/pzs/pulls/N/reviews --jq '.[] | "\(.user.login) \(.state)"'
#11: Styneek APPROVED, MataKomandos APPROVED
#12: niepowiemcinazwy APPROVED
#13: niepowiemcinazwy APPROVED
```

## Uwagi

- Cała praca Sprintu 3 trafiła na `main` ostatniego dnia (27.11), między 18:17 a 18:23. Wcześniej historyjki wisiały w gałęziach, a PZS-5 był zablokowany przez PZS-6. To jest główny wniosek z retro (`docs/retro/sprint-3.md`, działanie PZS-89).
- Nikt z nas nie wpisał czasu w Jirze („Rejestr pracy”) przy zadaniach Sprintu 3, więc w raporcie nie ma godzin. Wracamy do tego w Sprincie 4.
- Kontrakt zespołu, sekcja 6 „Nierówny wkład”: w tym sprincie nie było potrzeby z niej korzystać, bo wkład jest równy.
