// Buduje front (Vite) i uruchamia aplikację Electron.
// Usuwa ELECTRON_RUN_AS_NODE, które ustawia np. terminal VS Code (inaczej Electron startuje jak zwykły Node).
const { spawnSync, spawn } = require('child_process')
const path = require('path')

const katalog = path.join(__dirname, '..')
const budowanie = spawnSync(process.execPath, [path.join(katalog, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], { cwd: katalog, stdio: 'inherit' })
if (budowanie.status !== 0) process.exit(budowanie.status ?? 1)

const electron = require('electron')
const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE
spawn(electron, ['.'], { cwd: katalog, stdio: 'inherit', env }).on('exit', (kod) => process.exit(kod ?? 0))
