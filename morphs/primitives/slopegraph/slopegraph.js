/**
 * 📊 SLOPEGRAPH MORPH - Vorher-Nachher Vergleich
 * 
 * Zeigt Veränderungen zwischen zwei Zeitpunkten
 * Basiert auf Kirk's Prinzipien: Slopegraph für Ranking-Veränderungen
 * 
 * Input: {vorher: {A: 45, B: 30}, nachher: {A: 30, B: 55}}
 *    oder: [{name: "A", vorher: 45, nachher: 30}, ...]
 *    oder: {2020: {...}, 2023: {...}}
 * Output: Verbundene Punkte die Veränderung visualisieren
 */

import { debug } from '../../../observer/debug.js';
import { getSchema } from '../../../util/semantic.js';

export function slopegraph(wert, config = {}) {
  debug.morphs('slopegraph', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-slopegraph';
  
  // Daten normalisieren
  const { daten, labels } = normalisiereDaten(wert);
  
  if (daten.length === 0) {
    el.innerHTML = '<span class="amorph-slopegraph-leer">Keine Vergleichsdaten</span>';
    return el;
  }
  
  // Visuell-Config aus Schema laden
  const schema = getSchema();
  const visuell = schema?.visuell || {};
  
  // Titel falls vorhanden
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-slopegraph-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Header mit Labels für die beiden Zeitpunkte
  const header = document.createElement('div');
  header.className = 'amorph-slopegraph-header';
  header.innerHTML = `
    <span class="amorph-slopegraph-zeit">${labels.vorher}</span>
    <span class="amorph-slopegraph-spacer"></span>
    <span class="amorph-slopegraph-zeit">${labels.nachher}</span>
  `;
  el.appendChild(header);
  
  // SVG für die Linien
  const container = document.createElement('div');
  container.className = 'amorph-slopegraph-container';
  
  // Werte normalisieren für Positionierung
  const allValues = daten.flatMap(d => [d.vorher, d.nachher]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;
  
  // Zeilen erstellen
  for (const item of daten) {
    const row = erstelleZeile(item, minVal, range, visuell, config);
    container.appendChild(row);
  }
  
  el.appendChild(container);
  
  return el;
}

function normalisiereDaten(wert) {
  const daten = [];
  let labels = { vorher: 'Vorher', nachher: 'Nachher' };
  
  // Array von Objekten mit name/vorher/nachher
  if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'object' && item !== null) {
        const vorher = item.vorher ?? item.before ?? item.start ?? item.alt ?? item.v1;
        const nachher = item.nachher ?? item.after ?? item.end ?? item.neu ?? item.v2;
        
        if (vorher !== undefined && nachher !== undefined) {
          daten.push({
            name: item.name || item.label || item.kategorie || 'Item',
            vorher: Number(vorher),
            nachher: Number(nachher)
          });
        }
      }
    }
    return { daten, labels };
  }
  
  // Objekt mit vorher/nachher Unter-Objekten
  if (typeof wert === 'object' && wert !== null) {
    // Explizite vorher/nachher Struktur
    if (wert.vorher && wert.nachher) {
      const keys = new Set([
        ...Object.keys(wert.vorher),
        ...Object.keys(wert.nachher)
      ]);
      
      for (const key of keys) {
        const vorher = wert.vorher[key];
        const nachher = wert.nachher[key];
        if (typeof vorher === 'number' && typeof nachher === 'number') {
          daten.push({ name: key, vorher, nachher });
        }
      }
      return { daten, labels };
    }
    
    // Zwei Jahres-Keys erkennen (z.B. {2020: {...}, 2023: {...}})
    const keys = Object.keys(wert);
    const jahrKeys = keys.filter(k => /^\d{4}$/.test(k)).sort();
    
    if (jahrKeys.length >= 2) {
      const [jahrVorher, jahrNachher] = jahrKeys;
      labels = { vorher: jahrVorher, nachher: jahrNachher };
      
      const vorherObj = wert[jahrVorher];
      const nachherObj = wert[jahrNachher];
      
      const allKeys = new Set([
        ...Object.keys(vorherObj || {}),
        ...Object.keys(nachherObj || {})
      ]);
      
      for (const key of allKeys) {
        const v = vorherObj?.[key];
        const n = nachherObj?.[key];
        if (typeof v === 'number' && typeof n === 'number') {
          daten.push({ name: key, vorher: v, nachher: n });
        }
      }
      return { daten, labels };
    }
    
    // Before/After Keys
    if (wert.before && wert.after) {
      labels = { vorher: 'Before', nachher: 'After' };
      const allKeys = new Set([
        ...Object.keys(wert.before || {}),
        ...Object.keys(wert.after || {})
      ]);
      
      for (const key of allKeys) {
        const v = wert.before?.[key];
        const n = wert.after?.[key];
        if (typeof v === 'number' && typeof n === 'number') {
          daten.push({ name: key, vorher: v, nachher: n });
        }
      }
      return { daten, labels };
    }
  }
  
  return { daten, labels };
}

function erstelleZeile(item, minVal, range, visuell, config) {
  const row = document.createElement('div');
  row.className = 'amorph-slopegraph-row';
  
  const { name, vorher, nachher } = item;
  const change = nachher - vorher;
  const changePercent = vorher !== 0 ? ((change / vorher) * 100).toFixed(1) : 0;
  
  // Semantische Klasse basierend auf Veränderung
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  row.setAttribute('data-trend', trend);
  
  // Y-Positionen berechnen (0-100%)
  const yVorher = 100 - ((vorher - minVal) / range) * 100;
  const yNachher = 100 - ((nachher - minVal) / range) * 100;
  
  // Linker Wert
  const leftSide = document.createElement('div');
  leftSide.className = 'amorph-slopegraph-side amorph-slopegraph-left';
  leftSide.innerHTML = `
    <span class="amorph-slopegraph-name">${name}</span>
    <span class="amorph-slopegraph-value">${formatNumber(vorher)}</span>
  `;
  row.appendChild(leftSide);
  
  // Mitte mit SVG-Linie
  const middle = document.createElement('div');
  middle.className = 'amorph-slopegraph-middle';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 40');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'amorph-slopegraph-svg');
  
  // Verbindungslinie
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', '5');
  line.setAttribute('y1', `${5 + (yVorher * 0.3)}`);
  line.setAttribute('x2', '95');
  line.setAttribute('y2', `${5 + (yNachher * 0.3)}`);
  line.setAttribute('class', `amorph-slopegraph-line amorph-slopegraph-line-${trend}`);
  svg.appendChild(line);
  
  // Punkte
  const circleVorher = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circleVorher.setAttribute('cx', '5');
  circleVorher.setAttribute('cy', `${5 + (yVorher * 0.3)}`);
  circleVorher.setAttribute('r', '4');
  circleVorher.setAttribute('class', 'amorph-slopegraph-point');
  svg.appendChild(circleVorher);
  
  const circleNachher = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circleNachher.setAttribute('cx', '95');
  circleNachher.setAttribute('cy', `${5 + (yNachher * 0.3)}`);
  circleNachher.setAttribute('r', '4');
  circleNachher.setAttribute('class', `amorph-slopegraph-point amorph-slopegraph-point-${trend}`);
  svg.appendChild(circleNachher);
  
  middle.appendChild(svg);
  row.appendChild(middle);
  
  // Rechter Wert mit Veränderung
  const rightSide = document.createElement('div');
  rightSide.className = 'amorph-slopegraph-side amorph-slopegraph-right';
  
  const changeIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const changeClass = `amorph-slopegraph-change-${trend}`;
  
  rightSide.innerHTML = `
    <span class="amorph-slopegraph-value">${formatNumber(nachher)}</span>
    <span class="amorph-slopegraph-change ${changeClass}">
      <span class="change-icon">${changeIcon}</span>${Math.abs(changePercent)}%
    </span>
  `;
  row.appendChild(rightSide);
  
  // Tooltip
  row.title = `${name}: ${formatNumber(vorher)} → ${formatNumber(nachher)} (${change >= 0 ? '+' : ''}${formatNumber(change)})`;
  
  return row;
}

function formatNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1 && value !== 0) return value.toFixed(2);
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(1);
}
