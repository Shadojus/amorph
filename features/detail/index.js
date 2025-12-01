/**
 * Detail Feature - PINBOARD
 * 
 * Ausgewählte Daten werden wie auf einer Pinnwand angezeigt:
 * - Frei positionierbare "Pins" (Karten mit Daten)
 * - Logische Gruppierung nach Perspektive/Thema
 * - Drag & Drop zum Reorganisieren
 * - Verbindungslinien zwischen verwandten Daten
 * - Zoom & Pan für große Sammlungen
 */

import { debug } from '../../observer/debug.js';
import { 
  getAuswahlNachPilz, 
  getAuswahlNachFeld,
  getAuswahlPilzIds,
  getState,
  clearAuswahl 
} from '../ansichten/index.js';
import { getFeldConfig, getPerspektivenListe } from '../../util/semantic.js';

// Pinboard State
const pinboardState = {
  pins: new Map(),      // Map<pinId, {x, y, width, height, data, gruppe}>
  verbindungen: [],     // [{von: pinId, zu: pinId, typ: 'verwandt'|'gleich'|'kontrast'}]
  zoom: 1,
  panX: 0,
  panY: 0,
  dragPin: null,
  gruppierung: 'pilz'   // 'pilz' | 'feld' | 'perspektive' | 'frei'
};

export default function init(ctx) {
  debug.features('Detail/Pinboard Feature Init');
  
  // Container für Pinboard
  const pinboard = document.createElement('div');
  pinboard.className = 'amorph-pinboard';
  pinboard.innerHTML = `
    <div class="amorph-pinboard-toolbar">
      <div class="amorph-pinboard-gruppierung">
        <button data-gruppierung="pilz" class="aktiv" title="Nach Pilz gruppieren">🍄</button>
        <button data-gruppierung="feld" title="Nach Feldtyp gruppieren">📋</button>
        <button data-gruppierung="perspektive" title="Nach Perspektive gruppieren">👁️</button>
        <button data-gruppierung="frei" title="Freie Anordnung">✨</button>
      </div>
      <div class="amorph-pinboard-zoom">
        <button data-zoom="out" title="Verkleinern">−</button>
        <span class="zoom-level">100%</span>
        <button data-zoom="in" title="Vergrößern">+</button>
        <button data-zoom="fit" title="Alles zeigen">⊡</button>
      </div>
      <button class="amorph-pinboard-clear" title="Auswahl leeren">🗑️ Leeren</button>
    </div>
    <div class="amorph-pinboard-canvas">
      <div class="amorph-pinboard-content"></div>
    </div>
    <div class="amorph-pinboard-leer">
      <div class="icon">📌</div>
      <div class="text">Pinboard ist leer</div>
      <div class="hint">Wähle Felder in der Grid-Ansicht aus</div>
    </div>
  `;
  
  const canvas = pinboard.querySelector('.amorph-pinboard-canvas');
  const content = pinboard.querySelector('.amorph-pinboard-content');
  const leerAnzeige = pinboard.querySelector('.amorph-pinboard-leer');
  const zoomLevel = pinboard.querySelector('.zoom-level');
  
  // Gruppierung wechseln
  pinboard.querySelectorAll('[data-gruppierung]').forEach(btn => {
    btn.addEventListener('click', () => {
      pinboard.querySelectorAll('[data-gruppierung]').forEach(b => b.classList.remove('aktiv'));
      btn.classList.add('aktiv');
      pinboardState.gruppierung = btn.dataset.gruppierung;
      renderPinboard();
    });
  });
  
  // Zoom Controls
  pinboard.querySelectorAll('[data-zoom]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.zoom;
      if (action === 'in') pinboardState.zoom = Math.min(2, pinboardState.zoom + 0.1);
      if (action === 'out') pinboardState.zoom = Math.max(0.3, pinboardState.zoom - 0.1);
      if (action === 'fit') { pinboardState.zoom = 1; pinboardState.panX = 0; pinboardState.panY = 0; }
      
      content.style.transform = `translate(${pinboardState.panX}px, ${pinboardState.panY}px) scale(${pinboardState.zoom})`;
      zoomLevel.textContent = Math.round(pinboardState.zoom * 100) + '%';
    });
  });
  
  // Clear Button
  pinboard.querySelector('.amorph-pinboard-clear').addEventListener('click', () => {
    clearAuswahl();
    renderPinboard();
  });
  
  // Pan mit Mausrad + Shift
  canvas.addEventListener('wheel', (e) => {
    if (e.shiftKey) {
      e.preventDefault();
      pinboardState.panX -= e.deltaX || e.deltaY;
      pinboardState.panY -= e.deltaY;
      content.style.transform = `translate(${pinboardState.panX}px, ${pinboardState.panY}px) scale(${pinboardState.zoom})`;
    } else if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      pinboardState.zoom = Math.max(0.3, Math.min(2, pinboardState.zoom + delta));
      content.style.transform = `translate(${pinboardState.panX}px, ${pinboardState.panY}px) scale(${pinboardState.zoom})`;
      zoomLevel.textContent = Math.round(pinboardState.zoom * 100) + '%';
    }
  }, { passive: false });
  
  /**
   * Rendert das Pinboard basierend auf aktueller Gruppierung
   */
  function renderPinboard() {
    const state = getState();
    const auswahl = state.auswahl;
    
    if (auswahl.size === 0) {
      content.innerHTML = '';
      leerAnzeige.style.display = 'flex';
      return;
    }
    
    leerAnzeige.style.display = 'none';
    content.innerHTML = '';
    
    // SVG für Verbindungslinien
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.className = 'amorph-pinboard-connections';
    content.appendChild(svg);
    
    const gruppen = gruppiereAuswahl(pinboardState.gruppierung);
    const perspektiven = getPerspektivenListe();
    
    let gruppenIndex = 0;
    const gruppenPositionen = [];
    
    for (const [gruppenName, items] of gruppen) {
      const gruppe = document.createElement('div');
      gruppe.className = 'amorph-pin-gruppe';
      gruppe.dataset.gruppe = gruppenName;
      
      // Gruppe positionieren (Kreis-Layout)
      const winkel = (gruppenIndex / gruppen.size) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(400, 150 + gruppen.size * 30);
      const x = 500 + Math.cos(winkel) * radius;
      const y = 400 + Math.sin(winkel) * radius;
      
      gruppe.style.left = x + 'px';
      gruppe.style.top = y + 'px';
      
      gruppenPositionen.push({ name: gruppenName, x, y, el: gruppe });
      
      // Gruppen-Header
      const header = document.createElement('div');
      header.className = 'amorph-pin-gruppe-header';
      
      // Farbe aus Perspektive wenn vorhanden
      const perspektive = perspektiven.find(p => p.felder?.includes(gruppenName) || p.id === gruppenName);
      if (perspektive?.farben?.[0]) {
        header.style.borderColor = perspektive.farben[0];
        header.style.color = perspektive.farben[0];
      }
      
      header.innerHTML = `<span class="gruppe-icon">${getGruppenIcon(gruppenName)}</span> ${formatGruppenName(gruppenName)}`;
      gruppe.appendChild(header);
      
      // Pins in dieser Gruppe
      const pinsContainer = document.createElement('div');
      pinsContainer.className = 'amorph-pins';
      
      for (const item of items) {
        const pin = erstellePin(item, perspektive);
        pinsContainer.appendChild(pin);
      }
      
      gruppe.appendChild(pinsContainer);
      content.appendChild(gruppe);
      
      // Drag & Drop für Gruppe
      makeDraggable(gruppe);
      
      gruppenIndex++;
    }
    
    // Verbindungen zwischen verwandten Gruppen zeichnen
    setTimeout(() => zeichneVerbindungen(svg, gruppenPositionen), 50);
    
    debug.features('Pinboard gerendert', { 
      gruppen: gruppen.size,
      pins: auswahl.size,
      gruppierung: pinboardState.gruppierung 
    });
  }
  
  /**
   * Gruppiert die Auswahl nach gewähltem Modus
   */
  function gruppiereAuswahl(modus) {
    const gruppen = new Map();
    const state = getState();
    
    if (modus === 'pilz') {
      const nachPilz = getAuswahlNachPilz();
      for (const [pilzId, data] of nachPilz) {
        const name = data.pilzDaten?.name || pilzId;
        gruppen.set(name, data.felder.map(f => ({
          ...f,
          pilzId,
          pilzDaten: data.pilzDaten
        })));
      }
    } else if (modus === 'feld') {
      const nachFeld = getAuswahlNachFeld();
      for (const [feldName, items] of nachFeld) {
        gruppen.set(feldName, items.map(item => ({
          feldName,
          wert: item.wert,
          pilzId: item.pilzId,
          pilzDaten: item.pilzDaten
        })));
      }
    } else if (modus === 'perspektive') {
      const perspektiven = getPerspektivenListe();
      const nachPilz = getAuswahlNachPilz();
      
      // Felder nach Perspektive gruppieren
      for (const perspektive of perspektiven) {
        const items = [];
        for (const [pilzId, data] of nachPilz) {
          for (const feld of data.felder) {
            if (perspektive.felder?.includes(feld.feldName)) {
              items.push({
                ...feld,
                pilzId,
                pilzDaten: data.pilzDaten,
                perspektive
              });
            }
          }
        }
        if (items.length > 0) {
          gruppen.set(perspektive.label || perspektive.id, items);
        }
      }
      
      // Nicht zugeordnete Felder
      const zugeordnet = new Set(perspektiven.flatMap(p => p.felder || []));
      const sonstige = [];
      for (const [pilzId, data] of nachPilz) {
        for (const feld of data.felder) {
          if (!zugeordnet.has(feld.feldName)) {
            sonstige.push({ ...feld, pilzId, pilzDaten: data.pilzDaten });
          }
        }
      }
      if (sonstige.length > 0) {
        gruppen.set('Sonstige', sonstige);
      }
    } else {
      // Frei: Alle Pins einzeln
      const nachPilz = getAuswahlNachPilz();
      let counter = 0;
      for (const [pilzId, data] of nachPilz) {
        for (const feld of data.felder) {
          gruppen.set(`pin-${counter++}`, [{
            ...feld,
            pilzId,
            pilzDaten: data.pilzDaten
          }]);
        }
      }
    }
    
    return gruppen;
  }
  
  /**
   * Erstellt einen einzelnen Pin
   */
  function erstellePin(item, perspektive) {
    const pin = document.createElement('div');
    pin.className = 'amorph-pin';
    
    const feldConfig = getFeldConfig(item.feldName);
    const label = feldConfig?.label || item.feldName;
    
    // Pin-Farbe aus Perspektive
    if (perspektive?.farben?.[0]) {
      pin.style.setProperty('--pin-farbe', perspektive.farben[0]);
    }
    
    // Spezielle Darstellung für Bilder
    if (item.feldName === 'bild' && item.wert) {
      pin.innerHTML = `
        <img src="${item.wert}" alt="${item.pilzDaten?.name || ''}" class="amorph-pin-bild">
        <div class="amorph-pin-caption">${item.pilzDaten?.name || ''}</div>
      `;
    } else {
      pin.innerHTML = `
        <div class="amorph-pin-label">${label}</div>
        <div class="amorph-pin-wert">${formatWert(item.wert)}</div>
        ${pinboardState.gruppierung !== 'pilz' ? `<div class="amorph-pin-pilz">${item.pilzDaten?.name || ''}</div>` : ''}
      `;
    }
    
    return pin;
  }
  
  /**
   * Macht ein Element draggable
   */
  function makeDraggable(el) {
    let isDragging = false;
    let startX, startY, origX, origY;
    
    el.querySelector('.amorph-pin-gruppe-header')?.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origX = parseInt(el.style.left) || 0;
      origY = parseInt(el.style.top) || 0;
      el.classList.add('dragging');
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = (e.clientX - startX) / pinboardState.zoom;
      const dy = (e.clientY - startY) / pinboardState.zoom;
      el.style.left = (origX + dx) + 'px';
      el.style.top = (origY + dy) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        el.classList.remove('dragging');
      }
    });
  }
  
  /**
   * Zeichnet Verbindungslinien zwischen Gruppen
   */
  function zeichneVerbindungen(svg, positionen) {
    svg.innerHTML = '';
    
    // Verbindungen basierend auf gemeinsamen Feldern/Pilzen
    for (let i = 0; i < positionen.length; i++) {
      for (let j = i + 1; j < positionen.length; j++) {
        const a = positionen[i];
        const b = positionen[j];
        
        // Dünne Linie zwischen benachbarten Gruppen
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x + 80);
        line.setAttribute('y1', a.y + 30);
        line.setAttribute('x2', b.x + 80);
        line.setAttribute('y2', b.y + 30);
        line.setAttribute('stroke', 'rgba(255,255,255,0.1)');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '4,4');
        svg.appendChild(line);
      }
    }
  }
  
  // Hilfsfunktionen
  function formatWert(wert) {
    if (wert === null || wert === undefined) return '';
    if (Array.isArray(wert)) return wert.join(', ');
    if (typeof wert === 'object') {
      if ('min' in wert && 'max' in wert) {
        return `${wert.min}–${wert.max}${wert.einheit ? ' ' + wert.einheit : ''}`;
      }
      return JSON.stringify(wert);
    }
    return String(wert);
  }
  
  function getGruppenIcon(name) {
    const icons = {
      'kulinarisch': '🍳', 'sicherheit': '⚠️', 'anbau': '🌱',
      'wissenschaft': '🔬', 'medizin': '💊', 'statistik': '📊',
      'bild': '🖼️', 'name': '📛', 'temperatur': '🌡️',
      'essbarkeit': '🍽️', 'saison': '📅', 'lebensraum': '🌲'
    };
    return icons[name.toLowerCase()] || '📌';
  }
  
  function formatGruppenName(name) {
    if (name.startsWith('pin-')) return ''; // Freie Pins haben keinen Header
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  // Auf Auswahl-Änderungen reagieren
  document.addEventListener('amorph:auswahl-geaendert', () => {
    if (ctx.dom.offsetParent !== null) { // Nur wenn sichtbar
      renderPinboard();
    }
  });
  
  // Auf Ansicht-Wechsel reagieren
  document.addEventListener('amorph:ansicht-wechsel', (e) => {
    if (e.detail.ansicht === 'detail') {
      ctx.dom.style.display = 'block';
      renderPinboard();
    } else {
      ctx.dom.style.display = 'none';
    }
  });
  
  ctx.dom.appendChild(pinboard);
  ctx.dom.style.display = 'none'; // Initial versteckt
  ctx.mount();
  
  debug.features('Detail/Pinboard Feature bereit');
}
