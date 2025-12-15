/**
 * ⚠️ SEVERITY MORPH - Schweregrad/Warnung
 * 
 * Zeigt Schweregrade mit Farbcodierung (grün→gelb→rot)
 * DATENGETRIEBEN - Erkennt Schweregrad-Strukturen
 * 
 * Input: {typ: "Habitatverlust", schwere: 90}
 *    oder [{name: "...", level: 75}, ...]
 *    oder 85 (als Zahl)
 * Output: Farbcodierte Balken basierend auf Schwere
 */

import { debug } from '../../../observer/debug.js';

export function severity(wert, config = {}) {
  debug.morphs('severity', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-severity';
  
  // Daten normalisieren
  const items = normalisiereSeverity(wert);
  
  if (items.length === 0) {
    el.innerHTML = '<span class="amorph-severity-leer">Keine Daten</span>';
    return el;
  }
  
  // Titel falls vorhanden
  if (config.titel || config.title) {
    const titel = document.createElement('div');
    titel.className = 'amorph-severity-titel';
    titel.textContent = config.titel || config.title;
    el.appendChild(titel);
  }
  
  // Items rendern
  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'amorph-severity-row';
    row.setAttribute('data-level', getSeverityLevel(item.value));
    
    // Icon
    const icon = document.createElement('span');
    icon.className = 'amorph-severity-icon';
    icon.textContent = getSeverityIcon(item.value);
    row.appendChild(icon);
    
    // Label
    const label = document.createElement('span');
    label.className = 'amorph-severity-label';
    label.textContent = item.label;
    row.appendChild(label);
    
    // Balken
    const track = document.createElement('div');
    track.className = 'amorph-severity-track';
    
    const fill = document.createElement('div');
    fill.className = 'amorph-severity-fill';
    fill.style.width = `${item.value}%`;
    fill.style.background = getSeverityColor(item.value);
    track.appendChild(fill);
    row.appendChild(track);
    
    // Wert
    const value = document.createElement('span');
    value.className = 'amorph-severity-value';
    value.textContent = `${item.value}%`;
    value.style.color = getSeverityColor(item.value);
    row.appendChild(value);
    
    // Beschreibung
    if (item.description) {
      const desc = document.createElement('div');
      desc.className = 'amorph-severity-description';
      desc.textContent = item.description;
      row.appendChild(desc);
    }
    
    el.appendChild(row);
  }
  
  return el;
}

function normalisiereSeverity(wert) {
  const items = [];
  
  // String-Level zu numerischen Werten mappen
  const LEVEL_MAP = {
    trivial: 10, gering: 10, minimal: 10,
    minor: 30, niedrig: 30, low: 30,
    moderate: 50, mittel: 50, medium: 50,
    severe: 75, major: 75, hoch: 75, high: 75,
    critical: 95, kritisch: 95, extrem: 95
  };
  
  // Helper: Wert zu Nummer konvertieren
  const toNumericValue = (val) => {
    if (typeof val === 'number') return Math.min(100, Math.max(0, val));
    if (typeof val === 'string') {
      const mapped = LEVEL_MAP[val.toLowerCase()];
      if (mapped !== undefined) return mapped;
      // Versuche als Zahl zu parsen
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return Math.min(100, Math.max(0, parsed));
    }
    return 0;
  };
  
  if (typeof wert === 'number') {
    items.push({ label: 'Schweregrad', value: toNumericValue(wert), description: '' });
  } else if (typeof wert === 'string') {
    // Einzelner String-Level
    items.push({ label: wert, value: toNumericValue(wert), description: '' });
  } else if (Array.isArray(wert)) {
    for (const item of wert) {
      if (typeof item === 'number') {
        items.push({ label: `Level`, value: toNumericValue(item), description: '' });
      } else if (typeof item === 'string') {
        items.push({ label: item, value: toNumericValue(item), description: '' });
      } else if (typeof item === 'object') {
        const rawValue = item.schwere || item.severity || item.level || item.value || item.wert || item.grade || 0;
        items.push({
          label: item.typ || item.type || item.name || item.label || item.kategorie || 'Unbekannt',
          value: toNumericValue(rawValue),
          description: item.beschreibung || item.description || ''
        });
      }
    }
  } else if (typeof wert === 'object') {
    // Einzelnes Objekt
    if ('schwere' in wert || 'severity' in wert || 'level' in wert || 'grade' in wert) {
      const rawValue = wert.schwere || wert.severity || wert.level || wert.grade || 0;
      items.push({
        label: wert.typ || wert.type || wert.name || wert.label || 'Schweregrad',
        value: toNumericValue(rawValue),
        description: wert.beschreibung || wert.description || ''
      });
    }
    // Bedrohungen-Array
    if (wert.bedrohungen || wert.threats) {
      const arr = wert.bedrohungen || wert.threats;
      for (const item of arr) {
        const rawValue = item.schwere || item.severity || item.level || item.grade || 0;
        items.push({
          label: item.typ || item.type || item.name || item.label || 'Unbekannt',
          value: toNumericValue(rawValue),
          description: item.beschreibung || item.description || ''
        });
      }
    }
  }
  
  // Nach Schwere sortieren (höchste zuerst)
  return items.sort((a, b) => b.value - a.value);
}

function getSeverityLevel(value) {
  if (value >= 80) return 'critical';
  if (value >= 60) return 'high';
  if (value >= 40) return 'medium';
  if (value >= 20) return 'low';
  return 'minimal';
}

function getSeverityColor(value) {
  // Gradient von Grün (0) über Gelb (50) zu Rot (100)
  if (value >= 80) return 'rgba(240, 80, 80, 0.9)';      // Rot
  if (value >= 60) return 'rgba(240, 150, 80, 0.9)';     // Orange
  if (value >= 40) return 'rgba(240, 200, 80, 0.9)';     // Gelb
  if (value >= 20) return 'rgba(180, 220, 100, 0.9)';    // Hellgrün
  return 'rgba(100, 220, 140, 0.9)';                      // Grün
}

function getSeverityIcon(value) {
  if (value >= 80) return '🔴';
  if (value >= 60) return '🟠';
  if (value >= 40) return '🟡';
  if (value >= 20) return '🟢';
  return '✅';
}
