import { debug } from '../../../observer/debug.js';

/**
 * OBJECT MORPH - Stellt verschachtelte Objekte als Key-Value-Paare dar
 * 
 * Kirk-Prinzip: "Komplexe Daten brauchen Struktur, nicht Rohdaten"
 * - Verschachtelte Objekte werden rekursiv gerendert
 * - Primitive Werte werden formatiert angezeigt
 * - Labels werden human-readable formatiert (snake_case → Title Case)
 */
export function object(wert, config = {}, morphen) {
  const el = document.createElement('dl');
  el.className = 'amorph-object';
  
  if (typeof wert !== 'object' || wert === null) {
    debug.warn('object-morph erwartet Objekt', { bekam: typeof wert });
    return el;
  }
  
  debug.morphs('object', { keys: Object.keys(wert) });
  
  const felder = config.felder || Object.keys(wert);
  
  for (const key of felder) {
    if (!(key in wert)) continue;
    
    const val = wert[key];
    
    // Überspringe null/undefined Werte
    if (val === null || val === undefined) continue;
    
    const dt = document.createElement('dt');
    // Human-readable Label: PROTEIN_G → Protein (g), snake_case → Title Case
    dt.textContent = formatLabel(config.labels?.[key] || key);
    el.appendChild(dt);
    
    const dd = document.createElement('dd');
    
    // Versuche zuerst mit morphen() zu rendern
    if (morphen) {
      const morphed = morphen(val, key);
      if (morphed && morphed instanceof Node) {
        dd.appendChild(morphed);
        el.appendChild(dd);
        continue;
      }
    }
    
    // Fallback: Intelligente Darstellung je nach Typ
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        // Array: Inline-Liste oder Tags
        dd.appendChild(renderArray(val));
      } else {
        // Verschachteltes Objekt: Rekursiv rendern
        dd.appendChild(object(val, config, morphen));
      }
    } else if (typeof val === 'number') {
      // Zahlen formatieren
      dd.textContent = formatNumber(val, key);
      dd.classList.add('amorph-object-number');
    } else if (typeof val === 'boolean') {
      dd.textContent = val ? '✓ Ja' : '✗ Nein';
      dd.classList.add(val ? 'amorph-object-true' : 'amorph-object-false');
    } else {
      dd.textContent = String(val);
    }
    
    el.appendChild(dd);
  }
  
  return el;
}

/**
 * Formatiert Labels human-readable
 * PROTEIN_G → Protein (g)
 * spore_size_um → Spore Size (µm)
 * snake_case → Title Case
 */
function formatLabel(key) {
  // Bekannte Einheiten-Suffixe erkennen
  const unitMap = {
    '_g': ' (g)',
    '_mg': ' (mg)',
    '_ug': ' (µg)',
    '_um': ' (µm)',
    '_mm': ' (mm)',
    '_cm': ' (cm)',
    '_m': ' (m)',
    '_kg': ' (kg)',
    '_l': ' (L)',
    '_ml': ' (ml)',
    '_pct': ' (%)',
    '_percent': ' (%)'
  };
  
  let label = String(key || '');
  let unit = '';
  
  // Prüfe auf Einheit am Ende
  for (const [suffix, unitStr] of Object.entries(unitMap)) {
    if (label.toLowerCase().endsWith(suffix)) {
      unit = unitStr;
      label = label.slice(0, -suffix.length);
      break;
    }
  }
  
  // snake_case und UPPER_CASE zu Title Case
  label = label
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
  
  return label + unit;
}

/**
 * Formatiert Zahlen je nach Kontext
 */
function formatNumber(val, key) {
  const keyLower = String(key || '').toLowerCase();
  
  // Prozent-Erkennung
  if (keyLower.includes('percent') || keyLower.includes('pct') || keyLower.includes('anteil')) {
    return `${val.toFixed(1)}%`;
  }
  
  // Sehr kleine Zahlen (wahrscheinlich Mikrogramm etc.)
  if (Math.abs(val) < 0.001 && val !== 0) {
    return val.toExponential(2);
  }
  
  // Dezimalzahlen
  if (!Number.isInteger(val)) {
    return val.toFixed(2);
  }
  
  // Große Zahlen mit Tausender-Trennung
  if (val >= 1000) {
    return val.toLocaleString('de-DE');
  }
  
  return String(val);
}

/**
 * Rendert Arrays als kompakte inline-Liste
 */
function renderArray(arr) {
  const container = document.createElement('span');
  container.className = 'amorph-object-array';
  
  // Nur primitive Werte inline
  const allPrimitive = arr.every(v => typeof v !== 'object' || v === null);
  
  if (allPrimitive && arr.length <= 10) {
    container.textContent = arr.join(', ');
  } else if (arr.length === 0) {
    container.textContent = '(leer)';
    container.classList.add('amorph-object-empty');
  } else {
    // Bei komplexen Arrays: Anzahl + Typ angeben
    const firstType = typeof arr[0];
    if (typeof arr[0] === 'object' && arr[0] !== null) {
      container.textContent = `${arr.length} Einträge`;
    } else {
      container.textContent = arr.slice(0, 5).join(', ') + (arr.length > 5 ? ` ... (+${arr.length - 5})` : '');
    }
  }
  
  return container;
}
