// Plan biura w kaflach izometrycznych. Ściany tylne: z = 0 (prawa-tylna, z oknami) i x = 0 (lewa-tylna).
// Strony patrzenia: NW (-x), NE (-z), SE (+x), SW (+z). NW i NE = plecami do kamery.

export const SZEROKOSC = 52 // x
export const GLEBOKOSC = 34 // z
export const KORYTARZ = { z0: 13, z1: 17 }
export const WYS_SCIANY = 64

export const POKOJE = [
  { id: 'zarzad', nazwa: 'Zarząd', x0: 0, z0: 0, x1: 12, z1: 13, podloga: 'wykladzina_bordo', dzial: 'zarzad' },
  { id: 'kierownictwo', nazwa: 'Kierownictwo', x0: 12, z0: 0, x1: 22, z1: 13, podloga: 'deski_ciemne', dzial: 'kierownictwo' },
  { id: 'hr', nazwa: 'Kadry i HR', x0: 22, z0: 0, x1: 30, z1: 13, podloga: 'wykladzina_zielona', dzial: 'hr' },
  { id: 'sala', nazwa: 'Sala konferencyjna', x0: 30, z0: 0, x1: 42, z1: 13, podloga: 'deski_jasne', dzial: null },
  { id: 'kuchnia', nazwa: 'Kuchnia', x0: 42, z0: 0, x1: 52, z1: 13, podloga: 'plytki', dzial: null },
  { id: 'marketing', nazwa: 'Marketing', x0: 0, z0: 17, x1: 13, z1: 34, podloga: 'wykladzina_fiolet', dzial: 'marketing' },
  { id: 'dev', nazwa: 'Development', x0: 13, z0: 17, x1: 29, z1: 34, podloga: 'szachownica', dzial: 'dev' },
  { id: 'qa', nazwa: 'Quality Assurance', x0: 29, z0: 17, x1: 39, z1: 34, podloga: 'szachownica_chlodna', dzial: 'qa' },
  { id: 'infra', nazwa: 'Infrastruktura i serwerownia', x0: 39, z0: 17, x1: 52, z1: 34, podloga: 'kratka', dzial: 'infra' },
  { id: 'korytarz', nazwa: 'Korytarz', x0: 0, z0: 13, x1: 52, z1: 17, podloga: 'deski_korytarz', dzial: null, ukryty: true },
]

// Ścianki działowe: odcinki [od, do] na linii; przerwy = drzwi
const DRZWI_Z13 = [6, 17, 26, 36, 47]
const DRZWI_Z17 = [6.5, 21, 34, 45.5]
function odcinkiZDrzwiami(dlugosc, drzwi, szer = 2) {
  const wynik = []
  let start = 0
  for (const d of [...drzwi].sort((a, b) => a - b)) {
    if (d - szer / 2 > start) wynik.push([start, d - szer / 2])
    start = d + szer / 2
  }
  if (start < dlugosc) wynik.push([start, dlugosc])
  return wynik
}
export const SCIANKI = [
  // wzdłuż x (stałe z)
  ...odcinkiZDrzwiami(SZEROKOSC, DRZWI_Z13).map(([a, b]) => ({ os: 'x', z: 13, od: a, do: b })),
  ...odcinkiZDrzwiami(SZEROKOSC, DRZWI_Z17).map(([a, b]) => ({ os: 'x', z: 17, od: a, do: b })),
  // wzdłuż z (stałe x)
  ...[12, 22, 30, 42].map((x) => ({ os: 'z', x, od: 0, do: 13 })),
  ...[13, 29, 39].map((x) => ({ os: 'z', x, od: 17, do: 34 })),
]

/** Okna i dekoracje ścienne. sciana: 'z0' (prawa-tylna) albo 'x0' (lewa-tylna). poz = środek wzdłuż ściany. */
export const NA_SCIANACH = [
  ...[3, 9.5, 17, 26, 33, 39, 46.5].map((poz) => ({ typ: 'okno', sciana: 'z0', poz })),
  ...[4, 9.5, 21, 27.5].map((poz) => ({ typ: 'okno', sciana: 'x0', poz })),
  { typ: 'szyld', sciana: 'z0', poz: 6.2, y: 50 },
  { typ: 'obraz', sciana: 'z0', poz: 13.5, y: 38 },
  { typ: 'tablica_korkowa', sciana: 'z0', poz: 20.2, y: 36 },
  { typ: 'zegar', sciana: 'z0', poz: 36, y: 50 },
  { typ: 'obraz', sciana: 'x0', poz: 15, y: 38 },
  { typ: 'tablica_korkowa', sciana: 'x0', poz: 32.5, y: 36 },
]

// ---------------------------------------------------------------- stanowiska pracy
// Orientacja A: biurko długie wzdłuż z, osoba po stronie +x, patrzy na NW (-x).
// Orientacja B: biurko długie wzdłuż x, osoba po stronie +z, patrzy na NE (-z).
// model: 'sweet' (biurka z paczki, natywnie wzdłuż z) albo 'pg' (natywnie wzdłuż x).
const BIURKA = {
  biurko: 'z', biurko_laptop: 'z', biurko_krzeslo: 'z',
  biurko_biale: 'x', biurko_biale_2: 'x', biurko_bezowe: 'x', biurko_ciemne: 'x', biurko_ciemne_2: 'x',
}
function stanowisko(id, pokoj, cx, cz, orient, { model = 'biurko', monitory = 1, lampka = false, krzeslo = 'krzeslo_tyl', laptop = false, rzeczy = [] } = {}) {
  const natywnie = BIURKA[model]
  const odbite = orient === 'A' ? natywnie === 'x' : natywnie === 'z'
  const glebPol = model.startsWith('biurko_') && natywnie === 'x' ? 0.44 : 0.56
  const siedz = orient === 'A' ? { x: cx + glebPol + 0.62, z: cz, kier: 'NW' } : { x: cx, z: cz + glebPol + 0.62, kier: 'NE' }
  return {
    id, pokoj, orient, model, odbite, x: cx, z: cz, monitory, lampka, krzeslo, laptop, rzeczy,
    siedzisko: siedz,
    obok: orient === 'A' ? { x: siedz.x + 0.2, z: cz + 1.2 } : { x: cx + 1.2, z: siedz.z + 0.2 },
  }
}

export const STANOWISKA = [
  // Zarząd
  stanowisko('z1', 'zarzad', 6, 5.6, 'B', { model: 'biurko_biale_2', monitory: 2, lampka: true }),
  stanowisko('z2', 'zarzad', 2.6, 10, 'A', { model: 'biurko_laptop', monitory: 0, krzeslo: 'krzeslo_tyl_czerwone' }),
  // Kierownictwo
  stanowisko('k1', 'kierownictwo', 15, 5, 'A', { model: 'biurko', lampka: true }),
  stanowisko('k2', 'kierownictwo', 15, 9.2, 'A', { model: 'biurko', monitory: 1, krzeslo: 'krzeslo_tyl_turkus' }),
  // HR
  stanowisko('h1', 'hr', 26, 5.4, 'B', { model: 'biurko_bezowe', lampka: true, krzeslo: 'krzeslo_tyl_turkus' }),
  // Marketing
  stanowisko('mn0', 'marketing', 4, 21.5, 'A', { model: 'biurko', lampka: true, krzeslo: 'krzeslo_tyl_czerwone' }),
  stanowisko('mn1', 'marketing', 9, 21.5, 'A', { model: 'biurko', krzeslo: 'krzeslo_tyl_czerwone' }),
  stanowisko('ms0', 'marketing', 4, 26.5, 'A', { model: 'biurko_laptop', monitory: 0, krzeslo: 'krzeslo_tyl_czerwone' }),
  stanowisko('ms1', 'marketing', 9, 26.5, 'A', { model: 'biurko', lampka: true, krzeslo: 'krzeslo_tyl_czerwone' }),
  // Development
  stanowisko('dn0', 'dev', 17, 20.6, 'A', { model: 'biurko_biale', monitory: 2, lampka: true }),
  stanowisko('dn1', 'dev', 23, 20.6, 'A', { model: 'biurko_biale', monitory: 2 }),
  stanowisko('d2n0', 'dev', 17, 24.4, 'A', { model: 'biurko_biale', monitory: 1 }),
  stanowisko('ds0', 'dev', 23, 24.4, 'A', { model: 'biurko_biale', monitory: 2, lampka: true }),
  stanowisko('ds1', 'dev', 17, 28.2, 'A', { model: 'biurko_biale', monitory: 1 }),
  stanowisko('d2s0', 'dev', 23, 28.2, 'A', { model: 'biurko_biale', monitory: 1, lampka: true }),
  // QA
  stanowisko('qn0', 'qa', 32, 21, 'B', { model: 'biurko_ciemne', monitory: 2, lampka: true, krzeslo: 'krzeslo_tyl_turkus' }),
  stanowisko('qs0', 'qa', 36, 21, 'B', { model: 'biurko_ciemne', monitory: 1, krzeslo: 'krzeslo_tyl_turkus' }),
  // Infrastruktura
  stanowisko('i1', 'infra', 43.5, 28.8, 'B', { model: 'biurko_ciemne_2', monitory: 2, lampka: true }),
  stanowisko('i2', 'infra', 48.5, 28.8, 'B', { model: 'biurko_ciemne_2', monitory: 2 }),
]

/** Miejsca przy stole konferencyjnym (stół: środek 36, 6.5). */
export const MIEJSCA_SPOTKAN = [
  { x: 34.3, z: 4.6, kier: 'SE' }, { x: 34.3, z: 6.5, kier: 'SE' }, { x: 34.3, z: 8.4, kier: 'SE' },
  { x: 37.7, z: 4.6, kier: 'NW' }, { x: 37.7, z: 6.5, kier: 'NW' }, { x: 37.7, z: 8.4, kier: 'NW' },
  { x: 36, z: 3.3, kier: 'SW' }, { x: 36, z: 9.8, kier: 'NE' },
]

export const PUNKTY_KAWA = [
  { x: 44.6, z: 2.3, kier: 'NE' }, { x: 46.2, z: 2.3, kier: 'NE' }, { x: 47.8, z: 2.3, kier: 'NE' },
]
export const MIEJSCA_KUCHNIA = [
  { x: 45.8, z: 7.6, kier: 'SE' }, { x: 48.2, z: 7.6, kier: 'NW' }, { x: 47, z: 6.4, kier: 'SW' }, { x: 47, z: 8.8, kier: 'NE' },
]

/** Szafy serwerowe (front od strony +z), technik staje przed szafą. */
export const SZAFY = [
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ id: `srv-${String(i + 1).padStart(2, '0')}`, x: 41.4 + i * 1.05, z: 19.4 })),
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ id: `srv-${String(i + 7).padStart(2, '0')}`, x: 41.4 + i * 1.05, z: 23.2 })),
]

/** Wyposażenie: { s: sprite, x, z, y?, odb?: odbicie, blok?: false, plaski?: rysuj pod spodem, swiatlo? } */
export const WYPOSAZENIE = [
  // --- Zarząd
  { s: 'dywan', x: 6, z: 6.6, plaski: true, blok: false },
  { s: 'regal_ksiazki', x: 1.4, z: 0.75, odb: true }, { s: 'regal_ksiazki', x: 2.8, z: 0.75, odb: true },
  { s: 'szafa_podwojna', x: 0.8, z: 4.2 },
  { s: 'kanapa_r', x: 9.6, z: 10.4 }, { s: 'stolik', x: 7.4, z: 10.4 },
  { s: 'palma', x: 11.2, z: 0.8 }, { s: 'palma', x: 0.8, z: 12.2 }, { s: 'szafka_lampka', x: 10.8, z: 4, swiatlo: 'cieple' },
  // --- Kierownictwo
  { s: 'regal_wysoki', x: 13.4, z: 0.6, odb: true }, { s: 'kartoteka', x: 14.8, z: 0.6, odb: true },
  { s: 'tablica', x: 20.6, z: 6.5, odb: false }, { s: 'roslinka', x: 21.2, z: 0.9 }, { s: 'palma', x: 12.8, z: 12.2 },
  // --- HR
  { s: 'szafa_waska', x: 23.0, z: 0.8, odb: true }, { s: 'kartoteka', x: 24.3, z: 0.6, odb: true }, { s: 'kartoteka_niska', x: 25.4, z: 0.6, odb: true },
  { s: 'szafka_kwiat', x: 29.1, z: 3.2 }, { s: 'kanapa_turkus_r', x: 28.6, z: 10.5 }, { s: 'roslinka', x: 22.8, z: 12.2 },
  // --- Sala konferencyjna
  { s: 'stol_konferencyjny', x: 36, z: 6.5 }, { s: 'telewizor', x: 30.9, z: 6.5 },
  { s: 'palma', x: 41.2, z: 0.8 }, { s: 'palma', x: 41.2, z: 12.2 }, { s: 'szafka_lampka_ciemna', x: 30.8, z: 12.2, swiatlo: 'cieple' },
  // --- Kuchnia
  { s: 'blat_kuchenny', x: 46.5, z: 0.75 }, { s: 'ekspres', x: 45.2, z: 0.7, y: 22, blok: false }, { s: 'lodowka', x: 50.7, z: 0.9 },
  { s: 'stolik', x: 47, z: 7.6 }, { s: 'dystrybutor', x: 42.8, z: 11.8 }, { s: 'kosz', x: 51.4, z: 3.2 },
  { s: 'roslinka', x: 51.3, z: 12.2 }, { s: 'wazon', x: 47, z: 7.6, y: 17, blok: false },
  // --- Korytarz
  { s: 'palma', x: 0.8, z: 15 }, { s: 'palma', x: 51.2, z: 15 },   { s: 'dystrybutor', x: 11.6, z: 14.2 }, { s: 'szafka_lampka_ciemna', x: 51.3, z: 16.3, swiatlo: 'cieple' },
  // --- Marketing
  { s: 'regal_ksiazki', x: 0.75, z: 18.6 }, { s: 'regal_roslina', x: 0.75, z: 20.2, odb: true }, { s: 'tablica', x: 0.8, z: 30.5 },
  { s: 'kanapa_szara_r', x: 11.6, z: 31.5 }, { s: 'palma', x: 12.2, z: 18 }, { s: 'kwiatek_czerwony', x: 0.8, z: 33.2 },
  { s: 'regalik_roslina', x: 6.5, z: 33.2, odb: true },
  // --- Development
  { s: 'kanapa_turkus_r', x: 27.6, z: 30.5 }, { s: 'stolik', x: 25.4, z: 30.5 }, { s: 'regal_roslina', x: 27.9, z: 17.75 },
  { s: 'regal_ksiazki', x: 26.5, z: 17.75, odb: true }, { s: 'tablica', x: 13.8, z: 31.5 }, { s: 'palma', x: 13.8, z: 18 },
  { s: 'roslinka', x: 28.3, z: 33.2 }, { s: 'szafka_lampka_ciemna', x: 20.6, z: 33.2, swiatlo: 'cieple' },
  // --- QA
  { s: 'regalik', x: 38.3, z: 18 }, { s: 'pudelko', x: 30, z: 33.1 }, { s: 'pudelko', x: 30.8, z: 33.3 },
  { s: 'kartoteka_niska', x: 38.3, z: 31 }, { s: 'roslinka', x: 38.3, z: 33.2 }, { s: 'kanapa_r', x: 35, z: 30.8, odb: true },
  // --- Infrastruktura
  { s: 'kartoteka', x: 51.2, z: 18 }, { s: 'kosz', x: 51.4, z: 33.2 }, { s: 'pudelko', x: 39.8, z: 33.2 },
  { s: 'roslinka', x: 39.8, z: 18 },
]
