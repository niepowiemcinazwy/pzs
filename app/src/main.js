import '@fontsource/pixelify-sans/latin-ext-400.css'
import '@fontsource/pixelify-sans/latin-ext-600.css'
import '@fontsource/pixelify-sans/latin-ext-700.css'
import '@fontsource/pixelify-sans/400.css'
import '@fontsource/pixelify-sans/700.css'
import '@fontsource/tiny5/latin-ext-400.css'
import '@fontsource/tiny5/400.css'
import './style.css'
import './ui.css'
import { Silnik } from './engine2d/silnik.js'
import { wczytajSprite, sprite } from './engine2d/sprite.js'
import { zbudujBryly } from './engine2d/bryly.js'
import { zbudujSwiat } from './engine2d/swiat.js'
import { Biuro } from './engine2d/ludzie.js'
import * as api from './dane/api.js'

window.__bledy = []
window.addEventListener('error', (e) => window.__bledy.push(String(e.message)))
window.addEventListener('unhandledrejection', (e) => window.__bledy.push(String(e.reason)))

const BEZ_UI = new URLSearchParams(location.search).has('bezui')

async function start() {
  const pasek = document.getElementById('ladowanie-postep')
  await Promise.all([document.fonts.load('8px "Tiny5"'), document.fonts.load('14px "Pixelify Sans"')]).catch(() => {})
  await wczytajSprite((p) => { pasek.style.width = Math.round(p * 80) + '%' })
  zbudujBryly()
  pasek.style.width = '90%'
  const swiat = zbudujSwiat()
  const silnik = new Silnik(document.getElementById('scena'))
  silnik.ustawSwiat(swiat)
  const biuro = new Biuro(swiat)
  silnik.dynamiczne = () => biuro.doRysowania()

  let ui = null, etykiety = null
  if (!BEZ_UI) {
    const { Interfejs } = await import('./ui/interfejs.js')
    const { Etykiety } = await import('./ui/etykiety.js')
    ui = new Interfejs({ silnik, biuro, swiat, kontenerUI: document.getElementById('ui') })
    etykiety = new Etykiety(document.getElementById('etykiety'), silnik, biuro, swiat, ui)
    ui.etykiety = etykiety
  }
  silnik.ustawDomyslny(ui ? ui.marginesy() : { gora: 20, dol: 20, lewo: 20, prawo: 20 })
  silnik.doDomyslnego(0)

  let ostatni = performance.now(), licznikT = 0
  const petla = (teraz) => {
    const dt = Math.max(0, Math.min(0.05, (teraz - ostatni) / 1000))
    ostatni = teraz
    licznikT += dt
    biuro.aktualizuj(dt)
    // mruganie diod w szafach serwerowych
    const f = Math.floor(silnik.czas * 3)
    for (const s of swiat.szafy) {
      const kl = (((f + s.faza) % 3) + 3) % 3
      s.obiekt.sp = sprite(s.alarmAktywny ? `serwer_alarm_${kl}` : `serwer_${kl}`)
    }
    if (licznikT > 1) { licznikT = 0; etykiety?.odswiezLiczniki(); ui?.coSekunde() }
    ui?.klatka(dt)
    silnik.klatka(dt)
    etykiety?.aktualizuj()
    requestAnimationFrame(petla)
  }
  requestAnimationFrame(petla)

  document.getElementById('ladowanie').classList.add('ukryte')
  window.__te = { gotowe: true, silnik, swiat, biuro, ui, api }
}

start().catch((e) => {
  console.error(e)
  window.__bledy.push(String(e?.stack || e))
  document.getElementById('ladowanie-opis').textContent = 'Błąd: ' + e.message
})
