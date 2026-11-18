# Definition of Done

Zadanie (historyjka) uznajemy za skończone, kiedy spełnia **wszystkie** poniższe warunki.
Przy każdym warunku jest napisane, kto go sprawdza:

- **pipeline** – job w `.github/workflows/ci.yml` (sprawdza automatycznie przy każdym PR i po scaleniu do `main`),
- **reguła ochrony** – reguła ochrony gałęzi `main` na GitHubie (wymusza ją serwer GitHuba, nie da się jej obejść, także adminom),
- **człowiek** – konkretna osoba z zespołu i moment, w którym to robi.

## Kod
- Kod trafił do `main` przez Pull Request, bez pushowania prosto na `main`.
  → **reguła ochrony**: *Require a pull request before merging* (+ *Do not allow bypassing the above settings*).
- Pull Request ma co najmniej jedno zatwierdzenie od innej osoby z zespołu.
  → **reguła ochrony**: *Require approvals* (1 zatwierdzenie, autor nie może zatwierdzić sam siebie).
- Aplikacja się buduje, a zbudowana strona ma skrót commita.
  → **pipeline**: job `build` (wymagany status check).
- Testy jednostkowe przechodzą (`npm test`).
  → **pipeline**: job `test` (wymagany status check).
- Kod przechodzi ESLint bez błędów (`npm run lint`).
  → **pipeline**: job `lint` (wymagany status check).
- Status checki `build`, `test` i `lint` są zielone, zanim da się scalić PR.
  → **reguła ochrony**: *Require status checks to pass before merging* (`build`, `test`, `lint`).
- W kodzie nie ma haseł, kluczy SSH ani plików `.env`, sekrety są w GitHub Secrets.
  → **człowiek**: recenzent PR (Dawid, Mateusz albo Kamil) w zakładce *Files changed* podczas review.

## Funkcjonalność
- Spełnione są wszystkie kryteria akceptacji z opisu historyjki w Jirze.
  → **człowiek**: Kamil Styn (QA) sprawdza je na serwerze deweloperskim po wdrożeniu, zanim przeniesie historyjkę do *Gotowe*.
- Ekran wygląda zgodnie z prototypem w Figmie (ekran albo przepływ wskazany w historyjce).
  → **człowiek**: recenzent PR porównuje zrzut / działającą stronę z Figmą podczas review.
- Funkcja została sprawdzona ręcznie przez osobę inną niż autor i nie ma znanych błędów blokujących.
  → **człowiek**: Kamil Styn (QA) po wdrożeniu, wpisuje wynik w komentarzu w Jirze (historyjki, których autorem jest Kamil, sprawdza Mateusz Sobczak).

## Wdrożenie
- Po scaleniu nowa wersja wdraża się na serwer deweloperski zespołu: https://niepowiemcinazwy.github.io/pzs/
  (wdrożenie startuje dopiero po zielonych `build`, `test` i `lint`).
  → **pipeline**: job `deploy` (`needs: [build, test, lint]`).
- Pod adresem serwera działa dokładnie wdrożony commit: strona pokazuje `wersja abc1234` równe skrótowi commita z `main`.
  → **pipeline**: job `smoke` (test po wdrożeniu, `curl` + `grep` skrótu; inna wersja = czerwony przebieg).

## Dokumentacja i Jira
- Historyjka w Jirze ma status **Gotowe**, a w komentarzu jest link do Pull Requesta.
  → **człowiek**: autor PR dodaje link po scaleniu; Dawid Wawer (PO) sprawdza na Przeglądzie Sprintu.
- Jeśli zmienia się sposób uruchamiania albo konfiguracja, jest to opisane w `README.md` albo `app/JAK_URUCHOMIC.md`.
  → **człowiek**: recenzent PR podczas review.
