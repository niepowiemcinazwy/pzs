// Strona logowania (PZS-6): formularz -> zaloguj() -> sesja -> przejście do „Moje zadania”.
import './strona.css'
import '@fontsource/pixelify-sans/400.css'
import '@fontsource/pixelify-sans/700.css'
import '@fontsource/pixelify-sans/latin-ext-400.css'
import '@fontsource/pixelify-sans/latin-ext-700.css'
import '@fontsource/tiny5/400.css'
import '@fontsource/tiny5/latin-ext-400.css'
import { zaloguj, zapiszSesje, PO_ZALOGOWANIU } from './dane/konta.js'

const formularz = document.getElementById('logowanie')
const blad = document.getElementById('blad')

formularz.addEventListener('submit', async (e) => {
  e.preventDefault()
  blad.textContent = ''
  const wynik = await zaloguj(formularz.email.value, formularz.haslo.value)
  if (!wynik.ok) {
    blad.textContent = wynik.blad
    formularz.haslo.value = ''
    formularz.haslo.focus()
    return
  }
  zapiszSesje(sessionStorage, wynik.konto)
  location.href = PO_ZALOGOWANIU
})
