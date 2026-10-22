# Przygotowanie sprite'ów mebli dla Team Environment.
# Źródła:
#   - "Isometric pixel bedroom" (Sweeetpotatoo, itch.io, "free to use anywhere")
#   - arkusz office.png z projektu Playground (Dawid Wawer) - elementy lekko przerobione (kolory)
# Wynik: public/sprites/*.png + src/engine2d/sprite_meta.json (podstawa i punkt zaczepienia)
#
# Uruchomienie: python narzedzia/przygotuj_sprite.py <katalog_sweeetpotatoo> <plik_office_playground>
import sys, os, json, colorsys
from collections import deque
from PIL import Image

KAT = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(KAT)
WYJ = os.path.join(APP, 'public', 'sprites')
META = os.path.join(APP, 'src', 'engine2d', 'sprite_meta.json')
os.makedirs(WYJ, exist_ok=True)

def obiekty(sciezka, laczenie=2):
    im = Image.open(sciezka).convert('RGBA'); W, H = im.size; px = im.load()
    wid = set(); boksy = []
    for y in range(H):
        for x in range(W):
            if px[x, y][3] > 10 and (x, y) not in wid:
                q = deque([(x, y)]); wid.add((x, y)); x0 = x1 = x; y0 = y1 = y
                while q:
                    cx, cy = q.popleft()
                    x0 = min(x0, cx); x1 = max(x1, cx); y0 = min(y0, cy); y1 = max(y1, cy)
                    for dx in range(-laczenie, laczenie + 1):
                        for dy in range(-laczenie, laczenie + 1):
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in wid and px[nx, ny][3] > 10:
                                wid.add((nx, ny)); q.append((nx, ny))
                boksy.append((x0, y0, x1 + 1, y1 + 1))
    boksy = [b for b in boksy if (b[2] - b[0]) * (b[3] - b[1]) >= 12]
    boksy.sort(key=lambda b: (b[1] // 20, b[0]))
    return im, boksy

def podstawa(im):
    """Z sylwetki: najniższy punkt = przedni róg podstawy; skrajne punkty = lewy/prawy róg.
    Zwraca w (wzdłuż x świata), d (wzdłuż z świata) w kaflach (kafel = 32x16 px) i środek podstawy w px obrazka."""
    W, H = im.size; px = im.load()
    kol = [x for x in range(W) if any(px[x, y][3] > 10 for y in range(H))]
    lewo, prawo = min(kol), max(kol) + 1
    dol = max(y for y in range(H) for x in range(W) if px[x, y][3] > 10)
    xs = [x for x in range(W) if px[x, dol][3] > 10]
    przod = (min(xs) + max(xs) + 1) / 2
    w = max(0.3, (przod - lewo) / 16)
    d = max(0.3, (prawo - przod) / 16)
    sx = (lewo + prawo) / 2
    sy = dol + 1 - (w + d) * 4
    return round(w, 2), round(d, 2), round(sx, 1), round(sy, 1)

def przebarw(im, fn):
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            h, s, v = fn(h, s, v)
            r, g, b = colorsys.hsv_to_rgb(h % 1, max(0, min(1, s)), max(0, min(1, v)))
            px[x, y] = (int(r * 255), int(g * 255), int(b * 255), a)
    return im

# --- przeróbki elementów z Playgroundu (żeby nie były 1:1)
def cieple_drewno(h, s, v):
    # pomarańczowe blaty -> ciepłe ciemniejsze drewno, białe fronty -> kremowe
    if s < 0.12: return (0.09, 0.16, v * 0.97)
    if 0.0 <= h <= 0.12: return (0.04, min(1, s * 1.15), v * 0.82)
    return (h, s, v)

def zielony_turkus(h, s, v):
    # szaro-zielone krzesła/szafki -> turkus Team Environment
    if s > 0.08 and 0.3 <= h <= 0.6: return (0.47, min(1, s * 1.5), v * 1.05)
    return (h, s, v)

def chlodny_metal(h, s, v):
    if s < 0.12: return (0.6, 0.1, v * 0.92)
    return (h, s, v)

def bez(h, s, v): return (h, s, v)

def main():
    sweet_kat, pg_plik = sys.argv[1], sys.argv[2]
    im3, b3 = obiekty(os.path.join(sweet_kat, 'isometric room assets 3.png'))
    im4, b4 = obiekty(os.path.join(sweet_kat, 'isometric room assets 4.png'))
    imp, bp = obiekty(pg_plik)

    wybor = {
        # Sweeetpotatoo
        'biurko_laptop': (im4, b4, 0, bez), 'biurko': (im4, b4, 1, bez), 'biurko_krzeslo': (im4, b4, 2, bez),
        'regal_pusty': (im4, b4, 7, bez), 'regal_ksiazki': (im4, b4, 8, bez), 'szafa_waska': (im4, b4, 9, bez),
        'szafa': (im4, b4, 13, bez), 'szafa_podwojna': (im4, b4, 14, bez),
        'szafka_kwiat': (im4, b4, 21, bez), 'szafka_lampka': (im4, b4, 22, bez), 'szafka': (im4, b4, 23, bez),
        'szafka_2': (im4, b4, 28, bez), 'szafka_3': (im4, b4, 29, bez), 'komoda': (im4, b4, 30, bez),
        'krzeslo_a': (im4, b4, 24, bez), 'krzeslo_b': (im4, b4, 25, bez), 'krzeslo_c': (im4, b4, 27, bez), 'krzeslo_d': (im4, b4, 31, bez),
        'ksiazki_1': (im4, b4, 3, bez), 'ksiazki_2': (im4, b4, 4, bez), 'ksiazki_3': (im4, b4, 5, bez), 'ksiazki_4': (im4, b4, 6, bez),
        'ksiazki_5': (im4, b4, 10, bez), 'ksiazki_6': (im4, b4, 16, bez), 'kwiatek_czerwony': (im4, b4, 12, bez),
        'pudelko': (im4, b4, 15, bez), 'obrazek': (im4, b4, 18, bez), 'teczka': (im4, b4, 19, bez), 'wazon': (im4, b4, 20, bez),
        'dywan': (im3, b3, 5, bez), 'lampki_choinkowe': (im3, b3, 2, bez),
        # Playground (przerobione)
        'biurko_biale': (imp, bp, 36, cieple_drewno), 'biurko_biale_2': (imp, bp, 40, cieple_drewno),
        'biurko_bezowe': (imp, bp, 46, cieple_drewno), 'biurko_ciemne': (imp, bp, 38, zielony_turkus),
        'biurko_ciemne_2': (imp, bp, 45, bez), 'biurko_narozne': (imp, bp, 33, cieple_drewno),
        'stanowisko_narozne': (imp, bp, 49, cieple_drewno), 'regal_wysoki': (imp, bp, 34, cieple_drewno),
        'krzeslo_biurowe_front': (imp, bp, 35, zielony_turkus), 'krzeslo_biurowe_front_2': (imp, bp, 43, bez),
        'kartoteka': (imp, bp, 41, chlodny_metal), 'kartoteka_niska': (imp, bp, 42, chlodny_metal),
        'regal_niski': (imp, bp, 47, cieple_drewno), 'regal_roslina': (imp, bp, 50, cieple_drewno),
        'gablota': (imp, bp, 51, bez), 'regalik_roslina': (imp, bp, 52, cieple_drewno),
        'szafka_lampka_ciemna': (imp, bp, 53, bez), 'komputer': (imp, bp, 54, chlodny_metal),
        'lampa_stojaca': (imp, bp, 55, bez), 'tablica_rama': (imp, bp, 57, bez), 'regalik': (imp, bp, 59, cieple_drewno),
        'lampka': (imp, bp, 60, bez), 'palma': (imp, bp, 61, bez), 'monitor': (imp, bp, 62, bez),
        'lampka_2': (imp, bp, 63, bez), 'roslinka': (imp, bp, 64, bez), 'szafka_biala_lampka': (imp, bp, 65, cieple_drewno),
        'papiery': (imp, bp, 67, bez), 'roslinka_mala': (imp, bp, 69, bez),
    }
    meta = {}
    for nazwa, (im, boksy, i, fn) in wybor.items():
        wyc = im.crop(boksy[i])
        wyc = przebarw(wyc, fn)
        wyc.save(os.path.join(WYJ, nazwa + '.png'))
        w, d, sx, sy = podstawa(wyc)
        meta[nazwa] = {'w': w, 'd': d, 'ax': sx, 'ay': sy, 'szer': wyc.width, 'wys': wyc.height}
    json.dump(meta, open(META, 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    print(len(meta), 'sprite\'ów ->', WYJ)

main()
