// Izometria 2:1. Kafel podłogi = romb 32 x 16 px. Świat: x w prawo-w-dół, z w lewo-w-dół, y (px) w górę.
export const KW = 32
export const KH = 16

/** Punkt świata (x, z w kaflach, y w pikselach nad podłogą) -> piksel "płótna świata" (zoom 1). */
export function iso(x, z, y = 0) {
  return { sx: (x - z) * (KW / 2), sy: (x + z) * (KH / 2) - y }
}

/** Piksel płótna świata -> punkt na podłodze. */
export function zIso(sx, sy) {
  const a = sx / (KW / 2), b = sy / (KH / 2)
  return { x: (a + b) / 2, z: (b - a) / 2 }
}

/** Kierunek ruchu (dx, dz) -> jedna z 4 stron izometrycznych. */
export function strona(dx, dz) {
  // +x: prawo-dół (SE), +z: lewo-dół (SW), -x: lewo-góra (NW), -z: prawo-góra (NE)
  if (Math.abs(dx) >= Math.abs(dz)) return dx >= 0 ? 'SE' : 'NW'
  return dz >= 0 ? 'SW' : 'NE'
}

/** Wektor (dx, dz) dla strony. */
export const WEKTOR = { SE: [1, 0], SW: [0, 1], NW: [-1, 0], NE: [0, -1] }
