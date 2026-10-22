// Dźwięki 8-bit generowane w przeglądarce (bez plików audio).
let ctx = null
let wyciszone = false
try { wyciszone = localStorage.getItem('te-wycisz') === '1' } catch {}

function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function ton(czest, start, dl, typ = 'square', glosnosc = 0.06, czestKoniec = null) {
  const a = audio()
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = typ
  o.frequency.setValueAtTime(czest, a.currentTime + start)
  if (czestKoniec) o.frequency.exponentialRampToValueAtTime(czestKoniec, a.currentTime + start + dl)
  g.gain.setValueAtTime(0.0001, a.currentTime + start)
  g.gain.exponentialRampToValueAtTime(glosnosc, a.currentTime + start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dl)
  o.connect(g).connect(a.destination)
  o.start(a.currentTime + start)
  o.stop(a.currentTime + start + dl + 0.02)
}

const DZWIEKI = {
  klik: () => ton(880, 0, 0.05, 'square', 0.035),
  otworz: () => { ton(523, 0, 0.06); ton(784, 0.05, 0.08) },
  zamknij: () => { ton(659, 0, 0.05, 'square', 0.04); ton(440, 0.04, 0.07, 'square', 0.04) },
  powiadomienie: () => { ton(988, 0, 0.08, 'square', 0.05); ton(1319, 0.08, 0.14, 'square', 0.05) },
  wiadomosc: () => { ton(660, 0, 0.06, 'triangle', 0.09); ton(880, 0.06, 0.1, 'triangle', 0.09) },
  wyslano: () => ton(520, 0, 0.09, 'triangle', 0.08, 900),
  sukces: () => { ton(523, 0, 0.08); ton(659, 0.08, 0.08); ton(784, 0.16, 0.16) },
  alarm: () => { for (let i = 0; i < 3; i++) { ton(880, i * 0.26, 0.12, 'sawtooth', 0.05); ton(660, i * 0.26 + 0.13, 0.12, 'sawtooth', 0.05) } },
  zadanie: () => { ton(392, 0, 0.07); ton(523, 0.07, 0.07); ton(659, 0.14, 0.12) },
}

export function graj(nazwa) {
  if (wyciszone) return
  try { DZWIEKI[nazwa]?.() } catch {}
}

export function czyWyciszone() { return wyciszone }
export function przelaczWyciszenie() {
  wyciszone = !wyciszone
  try { localStorage.setItem('te-wycisz', wyciszone ? '1' : '0') } catch {}
  if (!wyciszone) graj('klik')
  return wyciszone
}
