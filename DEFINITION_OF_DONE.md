# Definition of Done

Zadanie (historyjka) uznajemy za skończone, kiedy spełnia **wszystkie** poniższe warunki.

## Kod
- Kod jest w repozytorium i trafił do gałęzi `main` przez Pull Request (bez pushowania prosto na `main`).
- Pull Request ma co najmniej jedno zatwierdzenie (approval) od innej osoby z zespołu.
- CI na GitHub Actions przechodzi (aplikacja się buduje bez błędów).
- W kodzie nie ma haseł, kluczy SSH ani plików `.env` – sekrety są w GitHub Secrets.

## Funkcjonalność
- Spełnione są wszystkie kryteria akceptacji z opisu historyjki w Jirze.
- Ekran wygląda zgodnie z prototypem w Figmie (ekran albo przepływ wskazany w historyjce).
- Funkcja została sprawdzona ręcznie przez osobę inną niż autor (QA – Kamil Styn) i nie ma znanych błędów blokujących.
- Działa w aplikacji uruchomionej z `main` (`npm start`) i bez błędów w konsoli.

## Wdrożenie
- Nowa wersja działa pod adresem serwera deweloperskiego zespołu (na razie lokalnie: `npm run serwer` → http://localhost:8080).
- Na stronie głównej pod adresem serwera widać skrót commita (`wersja abc1234`), który zgadza się z ostatnim commitem na `main`.

## Dokumentacja i Jira
- Historyjka w Jirze ma status **Gotowe**, a w komentarzu jest link do Pull Requesta.
- Jeśli zmienia się sposób uruchamiania albo konfiguracja, jest to opisane w `README.md` albo `app/JAK_URUCHOMIC.md`.
