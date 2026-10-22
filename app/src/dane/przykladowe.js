// DANE PRZYKŁADOWE (front bez backendu).
// Wszystko tutaj jest zmyślone i zostanie zastąpione danymi z API (patrz src/dane/api.js).

export const FIRMA = {
  nazwa: 'Atlas Software sp. z o.o.',
  miasto: 'Gdańsk',
}

/** Zalogowany użytkownik aplikacji (później z logowania). */
export const ZALOGOWANY_ID = 'dawid'

export const DZIALY = [
  {
    id: 'zarzad', nazwa: 'Zarząd', kolor: '#ff7a45', ikona: '★',
    opis: 'Strategia firmy, budżet, priorytety produktu i kontakt z klientami kluczowymi.',
    kierownik: 'dawid',
    cele: ['Zamknięcie budżetu na Q4', 'Plan rozwoju produktu na 2027', 'Rekrutacja 3 osób do Development'],
  },
  {
    id: 'kierownictwo', nazwa: 'Kierownictwo', kolor: '#ffc145', ikona: '◆',
    opis: 'Planowanie projektów, harmonogramy, koordynacja działów i raporty dla zarządu.',
    kierownik: 'tomasz',
    cele: ['Harmonogram sprintów do końca roku', 'Raport z realizacji projektów za wrzesień'],
  },
  {
    id: 'hr', nazwa: 'Kadry i HR', kolor: '#3ddc84', ikona: '♥',
    opis: 'Rekrutacja, onboarding nowych osób, urlopy, szkolenia i sprawy kadrowe.',
    kierownik: 'karolina',
    cele: ['Onboarding 2 nowych osób', 'Plan szkoleń na listopad'],
  },
  {
    id: 'marketing', nazwa: 'Marketing', kolor: '#b48cff', ikona: '✦',
    opis: 'Kampanie, social media, materiały graficzne i strona internetowa firmy.',
    kierownik: 'joanna',
    cele: ['Kampania jesienna w social media', 'Nowa strona produktu', 'Materiały na targi IT'],
  },
  {
    id: 'dev', nazwa: 'Development', kolor: '#2ec4b6', ikona: '⌘',
    opis: 'Programowanie aplikacji: frontend, backend, API i aplikacja mobilna.',
    kierownik: 'michal',
    cele: ['Sprint 14: moduł zleceń', 'Migracja API do wersji 2', 'Poprawki wydajności widoku 3D'],
  },
  {
    id: 'qa', nazwa: 'Quality Assurance', kolor: '#6fd3ff', ikona: '✓',
    opis: 'Testy manualne i automatyczne, scenariusze testowe, weryfikacja przed wdrożeniem.',
    kierownik: 'kamil',
    cele: ['Scenariusze testów dla modułu zleceń', 'Automatyzacja testów logowania'],
  },
  {
    id: 'infra', nazwa: 'Infrastruktura i serwerownia', kolor: '#5ab8ff', ikona: '▤',
    opis: 'Serwery, sieć, kopie zapasowe, pipeline CI/CD i wdrożenia na środowiska.',
    kierownik: 'mateusz',
    cele: ['Konfiguracja serwera deweloperskiego (VPS)', 'Pipeline CI/CD', 'Monitoring szaf serwerowych'],
  },
]

/** Pomieszczenia wspólne (nie są działami, ale też da się je kliknąć). */
export const POMIESZCZENIA = {
  sala: {
    nazwa: 'Sala konferencyjna', opis: 'Sala na 8 osób z ekranem. Tu odbywają się spotkania zwołane z aplikacji.',
    rezerwacje: [
      { godz: '09:30', tytul: 'Daily zespołu Development' },
      { godz: '11:00', tytul: 'Przegląd sprintu 14' },
      { godz: '14:00', tytul: 'Spotkanie z klientem: Nordbud' },
      { godz: '16:30', tytul: 'Retrospektywa' },
    ],
  },
  kuchnia: {
    nazwa: 'Kuchnia', opis: 'Ekspres do kawy, lodówka i stolik. Najpopularniejsze miejsce w biurze.',
    rezerwacje: [],
  },
}

/** Pracownicy. wyglad = jak rysowana jest postać (pixel-art), stanowisko = id biurka z planu biura. */
export const PRACOWNICY = [
  { id: 'dawid', imie: 'Dawid', nazwisko: 'Wawer', rola: 'Lider zespołu / Product Owner / DevOps', dzial: 'zarzad', stanowisko: 'z1', wyglad: { skora: '#e8b48c', wlosy: '#6b3f22', fryzura: 'krotkie', gora: 'garnitur', kolorGory: '#2b3550', krawat: '#ff7a45', kolorDolu: '#232838' }, zespolProjektu: true },
  { id: 'barbara', imie: 'Barbara', nazwisko: 'Kowalczyk', rola: 'Dyrektor finansowa', dzial: 'zarzad', stanowisko: 'z2', wyglad: { skora: '#f1c7a0', wlosy: '#d9b25a', fryzura: 'dlugie', gora: 'garnitur', kolorGory: '#4a2b3d', krawat: '#f2efe8', dol: 'spodnica', kolorDolu: '#2a1f2a' } },
  { id: 'tomasz', imie: 'Tomasz', nazwisko: 'Nowicki', rola: 'Kierownik projektów', dzial: 'kierownictwo', stanowisko: 'k1', wyglad: { skora: '#e2a982', wlosy: '#3b2a20', fryzura: 'krotkie', gora: 'koszula', kolorGory: '#5b7fb8', krawat: '#2c3e50', okulary: true, kolorDolu: '#2b2f3a' } },
  { id: 'ewa', imie: 'Ewa', nazwisko: 'Zielińska', rola: 'Kierownik operacyjna', dzial: 'kierownictwo', stanowisko: 'k2', wyglad: { skora: '#f1c7a0', wlosy: '#2a1d18', fryzura: 'kok', gora: 'sweter', kolorGory: '#c0607a', kolorDolu: '#2d2a3a' } },
  { id: 'karolina', imie: 'Karolina', nazwisko: 'Wójcik', rola: 'Specjalistka HR', dzial: 'hr', stanowisko: 'h1', wyglad: { skora: '#e8b48c', wlosy: '#7a4a2a', fryzura: 'dlugie', gora: 'koszula', kolorGory: '#4f9d6e', dol: 'spodnica', kolorDolu: '#3a2f45' } },
  { id: 'joanna', imie: 'Joanna', nazwisko: 'Kamińska', rola: 'Kierownik marketingu', dzial: 'marketing', stanowisko: 'mn0', wyglad: { skora: '#f1c7a0', wlosy: '#1f1a1a', fryzura: 'kucyk', gora: 'garnitur', kolorGory: '#6b4fa0', krawat: '#f2efe8', kolorDolu: '#2a2438' } },
  { id: 'piotr', imie: 'Piotr', nazwisko: 'Mazur', rola: 'Grafik', dzial: 'marketing', stanowisko: 'ms0', wyglad: { skora: '#c98e62', wlosy: '#2a1d18', fryzura: 'loki', gora: 'bluza', kolorGory: '#e07a3a', sluchawki: true, kolorDolu: '#34405a' } },
  { id: 'natalia', imie: 'Natalia', nazwisko: 'Dąbrowska', rola: 'Specjalistka social media', dzial: 'marketing', stanowisko: 'mn1', wyglad: { skora: '#8d5a3b', wlosy: '#1a1414', fryzura: 'dlugie', gora: 'sweter', kolorGory: '#b48cff', kolorDolu: '#2b2f3a' } },
  { id: 'oliwia', imie: 'Oliwia', nazwisko: 'Lis', rola: 'Copywriterka', dzial: 'marketing', stanowisko: 'ms1', wyglad: { skora: '#f1c7a0', wlosy: '#a0522d', fryzura: 'grzywka', gora: 'koszula', kolorGory: '#f0c050', dol: 'spodnica', kolorDolu: '#3b3550' } },
  { id: 'michal', imie: 'Michał', nazwisko: 'Król', rola: 'Senior developer', dzial: 'dev', stanowisko: 'dn0', wyglad: { skora: '#e8b48c', wlosy: '#1e1a18', fryzura: 'krotkie', gora: 'bluza', kolorGory: '#2a8f88', okulary: true, sluchawki: true, kolorDolu: '#2b2f3a' } },
  { id: 'pawel', imie: 'Paweł', nazwisko: 'Jankowski', rola: 'Frontend developer', dzial: 'dev', stanowisko: 'ds0', wyglad: { skora: '#f1c7a0', wlosy: '#d9b25a', fryzura: 'grzywka', gora: 'koszula', kolorGory: '#3c6fd1', kolorDolu: '#3a3f4f' } },
  { id: 'aleksandra', imie: 'Aleksandra', nazwisko: 'Wieczorek', rola: 'Backend developer', dzial: 'dev', stanowisko: 'dn1', wyglad: { skora: '#e2a982', wlosy: '#1a1414', fryzura: 'dlugie', gora: 'sweter', kolorGory: '#3a7d6a', okulary: true, kolorDolu: '#2b2f3a' } },
  { id: 'krzysztof', imie: 'Krzysztof', nazwisko: 'Pawlak', rola: 'Junior developer', dzial: 'dev', stanowisko: 'ds1', wyglad: { skora: '#e8b48c', wlosy: '#4a3020', fryzura: 'krotkie', gora: 'bluza', kolorGory: '#7d4dbd', kolorDolu: '#3b4a6a' } },
  { id: 'wiktor', imie: 'Wiktor', nazwisko: 'Szymański', rola: 'Mobile developer', dzial: 'dev', stanowisko: 'd2n0', wyglad: { skora: '#c98e62', wlosy: '#2a1d18', fryzura: 'krotkie', gora: 'bluza', kolorGory: '#d65a5a', kolorDolu: '#2b2f3a' } },
  { id: 'kamil', imie: 'Kamil', nazwisko: 'Styn', rola: 'Quality Assurance / Infrastruktura', dzial: 'qa', stanowisko: 'qn0', wyglad: { skora: '#e8b48c', wlosy: '#2a2018', fryzura: 'grzywka', gora: 'koszula', kolorGory: '#4aa3d9', okulary: true, kolorDolu: '#2a3040' }, zespolProjektu: true },
  { id: 'zuzanna', imie: 'Zuzanna', nazwisko: 'Grabowska', rola: 'Testerka manualna', dzial: 'qa', stanowisko: 'qs0', wyglad: { skora: '#f1c7a0', wlosy: '#c9a227', fryzura: 'kucyk', gora: 'koszula', kolorGory: '#e86f8a', kolorDolu: '#323a52' } },
  { id: 'mateusz', imie: 'Mateusz', nazwisko: 'Sobczak', rola: 'Quality Assurance / Infrastruktura', dzial: 'infra', stanowisko: 'i1', wyglad: { skora: '#e2a982', wlosy: '#1c1714', fryzura: 'krotkie', gora: 'bluza', kolorGory: '#3b5bdb', sluchawki: true, kolorDolu: '#252a36' }, zespolProjektu: true },
  { id: 'lukasz', imie: 'Łukasz', nazwisko: 'Zając', rola: 'Administrator sieci', dzial: 'infra', stanowisko: 'i2', wyglad: { skora: '#c98e62', wlosy: '#3a2a20', fryzura: 'lyse', gora: 'koszula', kolorGory: '#556b8a', okulary: true, kolorDolu: '#2b2f3a' } },
]

/** Teksty w dymkach nad głową podczas pracy (zależnie od działu). */
export const DYMKI_PRACY = {
  zarzad: ['Przegląd budżetu', 'Planowanie Q4', 'Mail do klienta', 'Priorytety backlogu', 'Akceptacja faktur'],
  kierownictwo: ['Harmonogram sprintu', 'Raport tygodniowy', 'Aktualizacja Jiry', 'Planowanie zasobów'],
  hr: ['Rozmowa rekrutacyjna', 'Wnioski urlopowe', 'Onboarding', 'Plan szkoleń'],
  marketing: ['Projekt banera', 'Post na LinkedIn', 'Analiza kampanii', 'Tekst na stronę'],
  dev: ['Kompiluje…', 'Code review', 'Poprawia buga', 'Pisze testy', 'Merge do main', 'Refaktoryzacja'],
  qa: ['Testuje logowanie', 'Zgłasza błąd', 'Scenariusz testowy', 'Testy regresji', 'Weryfikacja poprawki'],
  infra: ['Monitoring serwerów', 'Konfiguracja CI/CD', 'Kopia zapasowa', 'Aktualizacja systemu', 'Logi serwera'],
}

/** Zadania (format jak w Jirze). status: do_zrobienia | w_trakcie | do_review | zrobione */
export const ZADANIA = [
  { klucz: 'SCRUM-1', tytul: 'Widok firmy jako biuro 3D z działami', osoba: 'dawid', status: 'w_trakcie', postep: 70, priorytet: 'wysoki', termin: '2026-11-06' },
  { klucz: 'SCRUM-2', tytul: 'Zlecanie zadania pracownikowi z widoku biura', osoba: 'dawid', status: 'do_zrobienia', postep: 0, priorytet: 'wysoki', termin: '2026-11-20' },
  { klucz: 'SCRUM-3', tytul: 'Wiadomości prywatne i zdalny pulpit z widoku biura', osoba: 'dawid', status: 'do_zrobienia', postep: 0, priorytet: 'średni', termin: '2026-12-04' },
  { klucz: 'SCRUM-8', tytul: 'Przegląd backlogu przed sprintem 15', osoba: 'dawid', status: 'w_trakcie', postep: 40, priorytet: 'średni', termin: '2026-10-24' },
  { klucz: 'SCRUM-12', tytul: 'Konfiguracja serwera deweloperskiego (VPS)', osoba: 'mateusz', status: 'w_trakcie', postep: 60, priorytet: 'wysoki', termin: '2026-10-30' },
  { klucz: 'SCRUM-13', tytul: 'Pipeline CI/CD: build i testy przy każdym pushu', osoba: 'mateusz', status: 'do_zrobienia', postep: 0, priorytet: 'wysoki', termin: '2026-11-06' },
  { klucz: 'SCRUM-14', tytul: 'Klucze SSH dla całego zespołu', osoba: 'mateusz', status: 'zrobione', postep: 100, priorytet: 'średni', termin: '2026-10-17' },
  { klucz: 'SCRUM-15', tytul: 'Scenariusze testów modułu zleceń', osoba: 'kamil', status: 'w_trakcie', postep: 45, priorytet: 'wysoki', termin: '2026-10-31' },
  { klucz: 'SCRUM-16', tytul: 'Plan testów przed wdrożeniem sprintu 14', osoba: 'kamil', status: 'do_review', postep: 90, priorytet: 'średni', termin: '2026-10-23' },
  { klucz: 'SCRUM-17', tytul: 'Testy regresji widoku biura', osoba: 'kamil', status: 'do_zrobienia', postep: 0, priorytet: 'niski', termin: '2026-11-13' },
  { klucz: 'SCRUM-21', tytul: 'Budżet działu IT na 2027', osoba: 'barbara', status: 'w_trakcie', postep: 55, priorytet: 'wysoki', termin: '2026-10-30' },
  { klucz: 'SCRUM-22', tytul: 'Faktury za październik', osoba: 'barbara', status: 'do_zrobienia', postep: 0, priorytet: 'średni', termin: '2026-11-03' },
  { klucz: 'SCRUM-25', tytul: 'Harmonogram sprintów do końca roku', osoba: 'tomasz', status: 'w_trakcie', postep: 75, priorytet: 'wysoki', termin: '2026-10-25' },
  { klucz: 'SCRUM-26', tytul: 'Raport realizacji projektów: wrzesień', osoba: 'tomasz', status: 'zrobione', postep: 100, priorytet: 'średni', termin: '2026-10-10' },
  { klucz: 'SCRUM-27', tytul: 'Grafik dyżurów na listopad', osoba: 'ewa', status: 'w_trakcie', postep: 30, priorytet: 'średni', termin: '2026-10-28' },
  { klucz: 'SCRUM-28', tytul: 'Zamówienie sprzętu dla nowych osób', osoba: 'ewa', status: 'do_review', postep: 85, priorytet: 'wysoki', termin: '2026-10-24' },
  { klucz: 'SCRUM-31', tytul: 'Onboarding: Wiktor Szymański', osoba: 'karolina', status: 'w_trakcie', postep: 65, priorytet: 'wysoki', termin: '2026-10-26' },
  { klucz: 'SCRUM-32', tytul: 'Ogłoszenie: junior QA', osoba: 'karolina', status: 'do_zrobienia', postep: 0, priorytet: 'średni', termin: '2026-11-02' },
  { klucz: 'SCRUM-35', tytul: 'Kampania jesienna: harmonogram postów', osoba: 'joanna', status: 'w_trakcie', postep: 50, priorytet: 'wysoki', termin: '2026-10-29' },
  { klucz: 'SCRUM-36', tytul: 'Banery na targi IT', osoba: 'piotr', status: 'w_trakcie', postep: 80, priorytet: 'wysoki', termin: '2026-10-24' },
  { klucz: 'SCRUM-37', tytul: 'Grafiki do kampanii jesiennej', osoba: 'piotr', status: 'do_zrobienia', postep: 0, priorytet: 'średni', termin: '2026-11-05' },
  { klucz: 'SCRUM-38', tytul: 'Statystyki social media: październik', osoba: 'natalia', status: 'w_trakcie', postep: 35, priorytet: 'niski', termin: '2026-10-31' },
  { klucz: 'SCRUM-39', tytul: 'Teksty na nową stronę produktu', osoba: 'oliwia', status: 'do_review', postep: 95, priorytet: 'wysoki', termin: '2026-10-23' },
  { klucz: 'SCRUM-41', tytul: 'Moduł zleceń: API', osoba: 'aleksandra', status: 'w_trakcie', postep: 60, priorytet: 'wysoki', termin: '2026-10-30' },
  { klucz: 'SCRUM-42', tytul: 'Moduł zleceń: formularz w widoku biura', osoba: 'pawel', status: 'w_trakcie', postep: 40, priorytet: 'wysoki', termin: '2026-10-30' },
  { klucz: 'SCRUM-43', tytul: 'Code review: migracja API v2', osoba: 'michal', status: 'do_review', postep: 90, priorytet: 'wysoki', termin: '2026-10-23' },
  { klucz: 'SCRUM-44', tytul: 'Wydajność renderowania biura 3D', osoba: 'michal', status: 'w_trakcie', postep: 20, priorytet: 'średni', termin: '2026-11-06' },
  { klucz: 'SCRUM-45', tytul: 'Poprawka: logowanie na Safari', osoba: 'krzysztof', status: 'w_trakcie', postep: 70, priorytet: 'średni', termin: '2026-10-24' },
  { klucz: 'SCRUM-46', tytul: 'Aplikacja mobilna: ekran powiadomień', osoba: 'wiktor', status: 'do_zrobienia', postep: 10, priorytet: 'średni', termin: '2026-11-13' },
  { klucz: 'SCRUM-48', tytul: 'Testy manualne: czat', osoba: 'zuzanna', status: 'w_trakcie', postep: 55, priorytet: 'średni', termin: '2026-10-29' },
  { klucz: 'SCRUM-51', tytul: 'Aktualizacja przełączników w serwerowni', osoba: 'lukasz', status: 'w_trakcie', postep: 25, priorytet: 'średni', termin: '2026-11-04' },
  { klucz: 'SCRUM-52', tytul: 'Kopie zapasowe: test odtworzenia', osoba: 'lukasz', status: 'do_zrobienia', postep: 0, priorytet: 'wysoki', termin: '2026-10-27' },
]

/** Historia czatu: id rozmówcy -> wiadomości (od: 'ja' lub id). */
export const CZAT = {
  mateusz: [
    { od: 'mateusz', tekst: 'Serwer deweloperski stoi, dorzucam jeszcze klucze SSH Kamila.', czas: '08:42' },
    { od: 'ja', tekst: 'Super, daj znać jak będzie CI/CD.', czas: '08:45' },
    { od: 'mateusz', tekst: 'Jasne, pipeline będzie do końca tygodnia.', czas: '08:47' },
  ],
  kamil: [
    { od: 'ja', tekst: 'Wrzucisz scenariusze testów do Jiry?', czas: '08:58' },
    { od: 'kamil', tekst: 'Scenariusze do modułu zleceń są już w Jirze (SCRUM-15).', czas: '09:10' },
  ],
  tomasz: [
    { od: 'tomasz', tekst: 'Przegląd sprintu przesunięty na 11:00.', czas: '08:15' },
  ],
  joanna: [
    { od: 'joanna', tekst: 'Potrzebujemy zrzutów ekranu z biura 3D do kampanii :)', czas: 'wczoraj' },
  ],
}

/** Serwery w szafach (dane do panelu serwerowni). */
export const SERWERY = {
  'srv-01': { nazwa: 'srv-01', rola: 'Aplikacja (produkcja)', ip: '10.0.1.11', system: 'Ubuntu 24.04 LTS' },
  'srv-02': { nazwa: 'srv-02', rola: 'Aplikacja (produkcja)', ip: '10.0.1.12', system: 'Ubuntu 24.04 LTS' },
  'srv-03': { nazwa: 'srv-03', rola: 'Baza danych PostgreSQL', ip: '10.0.1.21', system: 'Ubuntu 24.04 LTS' },
  'srv-04': { nazwa: 'srv-04', rola: 'Baza danych (replika)', ip: '10.0.1.22', system: 'Ubuntu 24.04 LTS' },
  'srv-05': { nazwa: 'srv-05', rola: 'CI/CD (runner)', ip: '10.0.2.10', system: 'Ubuntu 22.04 LTS' },
  'srv-06': { nazwa: 'srv-06', rola: 'Serwer deweloperski', ip: '10.0.2.20', system: 'Ubuntu 24.04 LTS' },
  'srv-07': { nazwa: 'srv-07', rola: 'Kopie zapasowe', ip: '10.0.3.5', system: 'Debian 12' },
  'srv-08': { nazwa: 'srv-08', rola: 'Pliki i dokumenty', ip: '10.0.3.6', system: 'Debian 12' },
  'srv-09': { nazwa: 'srv-09', rola: 'Poczta', ip: '10.0.4.2', system: 'Ubuntu 22.04 LTS' },
  'srv-10': { nazwa: 'srv-10', rola: 'Monitoring', ip: '10.0.4.8', system: 'Ubuntu 24.04 LTS' },
  'srv-11': { nazwa: 'srv-11', rola: 'Zdalne pulpity (gateway)', ip: '10.0.5.1', system: 'Windows Server 2022' },
  'srv-12': { nazwa: 'srv-12', rola: 'Zapasowy', ip: '10.0.5.9', system: 'Ubuntu 24.04 LTS' },
}
