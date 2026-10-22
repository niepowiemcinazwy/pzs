// Proces główny Electrona: jedno okno z biurem.
// Tryb testowy: TE_PLAN=sciezka/do/planu.json uruchamia kroki (JS w oknie + zrzuty ekranu) i zamyka aplikację.
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

// renderuj dalej, nawet gdy okno jest zasłonięte albo ekran zablokowany
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
// dźwięki powiadomień bez wcześniejszego kliknięcia
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

const PLAN = process.env.TE_PLAN
const DEV_URL = process.env.TE_DEV_URL

function utworzOkno() {
  const okno = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1100,
    minHeight: 680,
    backgroundColor: '#0f1626',
    title: 'Team Environment',
    icon: path.join(__dirname, '..', 'zasoby', 'ikona.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  })
  Menu.setApplicationMenu(null)

  if (DEV_URL) okno.loadURL(DEV_URL)
  else okno.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), process.env.TE_QUERY ? { search: process.env.TE_QUERY } : undefined)

  if (process.env.TE_ROZMIAR) { const [w, h] = process.env.TE_ROZMIAR.split('x').map(Number); okno.setContentSize(w, h) }
  okno.once('ready-to-show', () => {
    if (!PLAN) okno.maximize()
    okno.show()
  })

  if (PLAN) uruchomPlan(okno).catch((e) => { console.error('[plan]', e); app.exit(1) })
  return okno
}

const czekaj = (ms) => new Promise((r) => setTimeout(r, ms))

async function uruchomPlan(okno) {
  const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'))
  const katalog = plan.katalog || path.dirname(PLAN)
  okno.webContents.on('console-message', (_e, poziom, wiad) => {
    if (poziom >= 2) console.log('[okno]', wiad)
  })
  await new Promise((r) => okno.webContents.once('did-finish-load', r))
  // czekaj aż scena powie, że jest gotowa
  for (let i = 0; i < 120; i++) {
    const gotowe = await okno.webContents.executeJavaScript('!!(window.__te && window.__te.gotowe)').catch(() => false)
    if (gotowe) break
    await czekaj(500)
  }
  for (const krok of plan.kroki) {
    if (krok.js) {
      const wynik = await okno.webContents.executeJavaScript(krok.js).catch((e) => 'BŁĄD: ' + e.message)
      if (wynik !== undefined && wynik !== null) console.log('[js]', typeof wynik === 'string' ? wynik : JSON.stringify(wynik))
    }
    if (krok.mysz) {
      // prawdziwe zdarzenia wejścia (przechodzą przez cały Chromium, tak jak ruch myszy użytkownika)
      for (const ev of krok.mysz) {
        if (ev.pauza) { await czekaj(ev.pauza); continue }
        okno.webContents.sendInputEvent(ev)
        await czekaj(ev.type === 'mouseMove' ? 16 : 40)
      }
    }
    if (krok.czekaj) await czekaj(krok.czekaj)
    if (krok.zrzut) {
      const obraz = await okno.webContents.capturePage()
      fs.writeFileSync(path.join(katalog, krok.zrzut), obraz.toPNG())
      console.log('[zrzut]', krok.zrzut)
    }
  }
  app.exit(0)
}

app.whenReady().then(utworzOkno)
app.on('window-all-closed', () => app.quit())
