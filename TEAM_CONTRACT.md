# Kontrakt zespołu

Zasady, na które umówiliśmy się na początku projektu. Jak coś przestanie działać to zmieniamy to wspólnie i poprawiamy ten plik.

## 1. Kanał komunikacji i czas odpowiedzi

- Główny kanał to nasz **serwer na Discordzie**. Kanały: `#ogolny` (bieżące sprawy), `#dev` (kod, problemy techniczne), `#serwer` (sprawy związane z VPS).
- Rzeczy, które mają zostać na dłużej (decyzje, ustalenia) wrzucamy też do Jiry albo do repo, żeby nie zginęły w czacie.
- Odpowiadamy na wiadomości **w ciągu 24 godzin**. W weekend zjazdowy w ciągu kilku godzin.
- Jak coś jest pilne (np. serwer leży, deadline jutro) to oznaczamy osobę przez @ i piszemy "PILNE".

## 2. Dostępność między zjazdami

- Wszyscy pracujemy, więc nad projektem siedzimy głównie **wieczorami (po 18:00) i w weekendy**.
- Raz w tygodniu robimy krótkie spotkanie na Discordzie (ok. 20-30 min), domyślnie **w środę o 20:00**. Każdy mówi co zrobił, co robi dalej i czy coś go blokuje.
- Jak ktoś nie może być na spotkaniu albo wyjeżdża / ma gorszy tydzień, to pisze to wcześniej na `#ogolny`.

## 3. Sposób podejmowania decyzji

- Ważniejsze decyzje (temat, technologie, zakres sprintu) omawiamy na Discordzie albo na spotkaniu i staramy się dojść do zgody.
- Jak nie możemy się dogadać to **głosujemy, decyduje większość** (jest nas trzech, więc remisu nie będzie).
- W sprawach produktu (co robimy w pierwszej kolejności, priorytety w backlogu) ostatnie słowo ma lider / PO.
- W sprawach technicznych z danego obszaru (np. serwer, testy) najpierw decyduje właściciel tej roli, ale musi to wytłumaczyć reszcie.
- Każdą podjętą decyzję zapisujemy krótko w Jirze albo w repo.

## 4. Postępowanie przy niedowiezionym zadaniu

- Jak widzisz, że nie zdążysz z zadaniem, to piszesz o tym **najpóźniej 2 dni przed terminem**, a nie w dniu oddania.
- Wtedy razem ustalamy co dalej: ktoś pomaga, zadanie jest dzielone na mniejsze albo przejmuje je inna osoba, która ma czas.
- Kto skończył swoje rzeczy, pomaga w zadaniu które blokuje sprint, zamiast brać kolejne "na zapas".
- Jeśli ta sama osoba kilka razy z rzędu nie dowiezie zadań bez uprzedzenia, to najpierw rozmawiamy w zespole, a jak to nie pomoże, zgłaszamy sprawę prowadzącemu.

## 5. Spory w zespole

Spieramy się o sprawy, nie o osoby. Najpierw nazywamy, o co jest spór: o **zadanie** (rozwiązanie, nazwa, dane), o **proces** (kto co robi, kto decyduje, terminy) czy o **relacje** (ton, poczucie lekceważenia). Każdy rodzaj rozwiązujemy inaczej.

**Kiedy spór wychodzi z komentarzy w Pull Requeście**
- Jeśli Pull Request stoi **2 dni bez ruchu** albo wątek ma **więcej niż 10 komentarzy** o tej samej sprawie, przestajemy pisać i umawiamy się na rozmowę na Discordzie (głos, max 15 minut) w ciągu 24 godzin.
- Wynik rozmowy autor wpisuje jednym komentarzem w Pull Requeście („Ustaliliśmy: …”), żeby było wiadomo, co zdecydowano i dlaczego.
- Drobiazgi (formatowanie, wcięcia, łamanie linii) rozstrzyga ESLint, a nie dyskusja. Uwaga o stylu, której nie łapie lint, nie wstrzymuje zatwierdzenia (oznaczamy ją `nitpick (non-blocking)`).

**Kto rozstrzyga, gdy rozmowa nie da wyniku**
- **Zakres i kolejność prac** (co robimy, co ma pierwszeństwo, czy historyjka jest skończona): rozstrzyga **Właściciel Produktu** (Dawid Wawer).
- **Sprawy techniczne** (nazwy, struktura kodu, wybór rozwiązania): rozstrzyga **zespół według rankingu cech** poniżej. Wygrywa propozycja, która lepiej spełnia cechę stojącą wyżej. Jeśli obie są równe, decyduje osoba odpowiedzialna za dany obszar (serwer i CI: Mateusz, testy: Kamil, front: Dawid).
- **Ranking cech rozwiązania technicznego:**
  1. poprawność – przechodzą testy i spełnia kryteria akceptacji,
  2. bezpieczeństwo – brak sekretów w kodzie, brak wycieku danych,
  3. czytelność – nazwa albo kod mówi, co robi, bez dodatkowych wyjaśnień,
  4. spójność z resztą projektu – takie same nazwy i wzorce jak w istniejącym kodzie,
  5. prostota – mniej kodu i mniej zależności.
- Sprawy, od których zależy działanie aplikacji na serwerze (np. wyłączenie testu albo wdrożenie bez testu po wdrożeniu), wymagają zgody całego zespołu. Każdy ma obowiązek zgłosić obawę **przed** decyzją.

**Kiedy i jak zgłaszamy spór prowadzącemu**
- Gdy spór blokuje Cel Sprintu **dłużej niż 3 dni** mimo rozmowy i rankingu cech, albo gdy dotyczy relacji i rozmowa w zespole nie pomogła.
- Zgłasza lider (albo dowolna osoba, jeśli spór dotyczy lidera) mailem do prowadzącego, z kopią do całego zespołu. W mailu: czego dotyczy spór, obie propozycje, co już zrobiliśmy (rozmowa, ranking cech) i link do Pull Requesta albo zgłoszenia w Jirze. Prowadzący nie wybiera rozwiązania za nas, tylko pomaga wrócić do reguły.

## 6. Nierówny wkład

- Gdy ktoś widzi, że wkład w sprincie jest nierówny (np. karta stoi kilka dni bez komentarza albo ktoś „robi za kogoś”), **najpierw rozmawiamy z tą osobą o przyczynie**, a nie zgłaszamy zarzutu. Pytamy: „Co cię blokuje przy …?”, a nie „Dlaczego nic nie robisz?”.
- Sprawdzamy cztery możliwe przyczyny i dobieramy działanie:
  - **blokada** – osoba czeka na cudzą pracę → flaga i powiązanie „is blocked by” w Jirze, osoba blokująca dostaje pierwszeństwo przy przeglądzie;
  - **kompetencja** (brak umiejętności albo pewności siebie) → praca w parze, osoba przy zadaniu sama prosi o pomoc;
  - **dostępność** (mniej czasu w danym tygodniu) → mniejszy plan dla tej osoby, zapisany przed sprintem na planowaniu;
  - **więź** (brak związku z celem projektu) → rozmowa o celu i wybór zadania, które osobę interesuje.
- Każde zadanie i każde działanie z retrospektywy ma **jedną osobę**, która je przyjęła (przypisaną w Jirze). Zadań „dla zespołu” nie ma.
- Jeśli po rozmowie sytuacja powtarza się przy kolejnych zadaniach, reagujemy stopniowo: (1) przypomnienie zasady na spotkaniu, (2) rozmowa całego zespołu na retrospektywie z liczbami z `docs/contribution.md`, (3) zgłoszenie prowadzącemu tak jak przy sporze (sekcja 5).

## 7. Członkowie zespołu i data przyjęcia kontraktu

| Osoba | GitHub | Rola | Akceptuję kontrakt |
|-------|--------|------|--------------------|
| Dawid Wawer | niepowiemcinazwy | Lider / PO, developer | tak |
| Mateusz Sobczak | MataKomandos | Infrastruktura, developer | |
| Kamil Styn | Styneek | QA, developer | |

**Data przyjęcia kontraktu:** 09.10.2026
