// Mały pomocnik do budowania elementów DOM.
export function h(tag, atrybuty = {}, ...dzieci) {
  const [nazwa, ...klasy] = tag.split('.')
  const el = document.createElement(nazwa || 'div')
  if (klasy.length) el.className = klasy.join(' ')
  for (const [k, v] of Object.entries(atrybuty ?? {})) {
    if (v === undefined || v === null || v === false) continue
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v)
    else if (k === 'style' && typeof v === 'object') {
      for (const [sk, sv] of Object.entries(v)) {
        if (sv === undefined || sv === null) continue
        if (sk.includes('-')) el.style.setProperty(sk, sv)
        else el.style[sk] = sv
      }
    }
    else if (k === 'html') el.innerHTML = v
    else if (k === 'klasa') el.className += ' ' + v
    else el.setAttribute(k, v === true ? '' : v)
  }
  for (const d of dzieci.flat(Infinity)) {
    if (d === null || d === undefined || d === false) continue
    el.append(d instanceof Node ? d : document.createTextNode(String(d)))
  }
  return el
}

export function wyczysc(el) { while (el.firstChild) el.removeChild(el.firstChild); return el }

export function inicjaly(imie, nazwisko) { return (imie[0] + (nazwisko?.[0] ?? '')).toUpperCase() }

export function escape(t) {
  return String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

export function dataPL(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
}

/** append bez null/false/undefined */
export function dodaj(el, ...dzieci) {
  for (const d of dzieci.flat(Infinity)) if (d !== null && d !== undefined && d !== false) el.append(d)
  return el
}
