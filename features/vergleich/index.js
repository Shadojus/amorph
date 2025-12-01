/**
 * Vergleich Feature - VEKTORRAUM
 * 
 * Laterale Lösung: Informationen durch Raumeinteilung und Vektoren verknüpfen
 * 
 * Konzept:
 * - 2D/3D Raum in dem Pilze als Punkte positioniert werden
 * - Position basiert auf Eigenschaften (Vektoren)
 * - Ähnliche Pilze sind nah beieinander
 * - Unterschiede werden durch Distanz sichtbar
 * - Achsen = Dimensionen (Temperatur, Essbarkeit, Größe, etc.)
 */

import { debug } from '../../observer/debug.js';
import { 
  getAuswahlNachPilz,
  getAuswahlNachFeld,
  getAuswahlPilzIds,
  getState 
} from '../ansichten/index.js';
import { getFeldConfig, getPerspektivenListe } from '../../util/semantic.js';

// Vektorraum State
const raumState = {
  dimensionen: [],      // Aktive Achsen/Dimensionen
  punkte: new Map(),    // Map<pilzId, {x, y, z?, daten}>
  hoveredPunkt: null,
  ausgewaehlterPunkt: null,
  rotation: { x: 0, y: 0 },
  zoom: 1,
  modus: '2d'           // '2d' | '3d' | 'radar'
};

// Normalisierungsfunktionen für verschiedene Datentypen
const normalisierer = {
  // Range: Mittelwert normalisieren
  range: (wert, config) => {
    if (typeof wert === 'object' && 'min' in wert && 'max' in wert) {
      const mittel = (wert.min + wert.max) / 2;
      const bereich = config?.bereich || { min: 0, max: 100 };
      return (mittel - bereich.min) / (bereich.max - bereich.min);
    }
    return 0.5;
  },
  
  // Zahl: Direkt normalisieren
  number: (wert, config) => {
    const bereich = config?.bereich || { min: 0, max: 100 };
    return (Number(wert) - bereich.min) / (bereich.max - bereich.min);
  },
  
  // Tag/Kategorie: Ordinale Skala
  tag: (wert, config) => {
    const kategorien = config?.werte || ['niedrig', 'mittel', 'hoch'];
    const index = kategorien.indexOf(String(wert).toLowerCase());
    return index >= 0 ? index / (kategorien.length - 1) : 0.5;
  },
  
  // Boolean: 0 oder 1
  boolean: (wert) => wert ? 1 : 0,
  
  // Essbarkeit speziell
  essbarkeit: (wert) => {
    const map = { 
      'essbar': 1, 'bedingt essbar': 0.7, 'ungenießbar': 0.3, 
      'giftig': 0.1, 'tödlich': 0 
    };
    return map[String(wert).toLowerCase()] ?? 0.5;
  }
};

export default function init(ctx) {
  debug.features('Vergleich/Vektorraum Feature Init');
  
  const container = document.createElement('div');
  container.className = 'amorph-vektorraum';
  container.innerHTML = `
    <div class="amorph-vektorraum-toolbar">
      <div class="amorph-vektorraum-modus">
        <button data-modus="2d" class="aktiv" title="2D Streudiagramm">2D</button>
        <button data-modus="radar" title="Radar/Spinnen-Diagramm">◇</button>
        <button data-modus="3d" title="3D Raum">3D</button>
      </div>
      <div class="amorph-vektorraum-dimensionen">
        <!-- Wird dynamisch gefüllt -->
      </div>
      <div class="amorph-vektorraum-info">
        <span class="punkte-anzahl">0 Pilze</span>
      </div>
    </div>
    <div class="amorph-vektorraum-canvas">
      <svg class="amorph-vektorraum-svg"></svg>
      <div class="amorph-vektorraum-labels"></div>
    </div>
    <div class="amorph-vektorraum-legende"></div>
    <div class="amorph-vektorraum-tooltip"></div>
    <div class="amorph-vektorraum-leer">
      <div class="icon">🧭</div>
      <div class="text">Wähle mindestens 2 Pilze zum Vergleichen</div>
      <div class="hint">Die Position zeigt Ähnlichkeiten und Unterschiede</div>
    </div>
  `;
  
  const svg = container.querySelector('.amorph-vektorraum-svg');
  const labelsContainer = container.querySelector('.amorph-vektorraum-labels');
  const legende = container.querySelector('.amorph-vektorraum-legende');
  const tooltip = container.querySelector('.amorph-vektorraum-tooltip');
  const leerAnzeige = container.querySelector('.amorph-vektorraum-leer');
  const dimensionenContainer = container.querySelector('.amorph-vektorraum-dimensionen');
  const punkteAnzahl = container.querySelector('.punkte-anzahl');
  
  // Modus wechseln
  container.querySelectorAll('[data-modus]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-modus]').forEach(b => b.classList.remove('aktiv'));
      btn.classList.add('aktiv');
      raumState.modus = btn.dataset.modus;
      renderVektorraum();
    });
  });
  
  /**
   * Hauptrender-Funktion
   */
  function renderVektorraum() {
    const state = getState();
    const nachPilz = getAuswahlNachPilz();
    const pilzIds = [...nachPilz.keys()];
    
    if (pilzIds.length < 2) {
      svg.innerHTML = '';
      labelsContainer.innerHTML = '';
      legende.innerHTML = '';
      leerAnzeige.style.display = 'flex';
      punkteAnzahl.textContent = pilzIds.length + ' Pilz' + (pilzIds.length !== 1 ? 'e' : '');
      return;
    }
    
    leerAnzeige.style.display = 'none';
    punkteAnzahl.textContent = pilzIds.length + ' Pilze';
    
    // Verfügbare Dimensionen ermitteln
    const dimensionen = ermittleDimensionen(nachPilz);
    renderDimensionenAuswahl(dimensionen);
    
    // Aktive Dimensionen (max 6 für Radar, 2-3 für 2D/3D)
    const aktiveDims = raumState.dimensionen.length > 0 
      ? raumState.dimensionen 
      : dimensionen.slice(0, raumState.modus === 'radar' ? 6 : 2);
    
    if (aktiveDims.length < 2) {
      svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="white" opacity="0.5">Mindestens 2 vergleichbare Felder nötig</text>';
      return;
    }
    
    // Punkte berechnen
    const punkte = berechnePunkte(nachPilz, aktiveDims);
    raumState.punkte = punkte;
    
    // Rendern je nach Modus
    if (raumState.modus === 'radar') {
      renderRadar(svg, punkte, aktiveDims);
    } else if (raumState.modus === '3d') {
      render3D(svg, punkte, aktiveDims);
    } else {
      render2D(svg, punkte, aktiveDims);
    }
    
    renderLegende(legende, punkte);
    
    debug.features('Vektorraum gerendert', { 
      modus: raumState.modus,
      pilze: pilzIds.length,
      dimensionen: aktiveDims.length
    });
  }
  
  /**
   * Ermittelt vergleichbare Dimensionen aus der Auswahl
   */
  function ermittleDimensionen(nachPilz) {
    const feldCounts = new Map();
    
    for (const [pilzId, data] of nachPilz) {
      for (const feld of data.felder) {
        const count = feldCounts.get(feld.feldName) || 0;
        feldCounts.set(feld.feldName, count + 1);
      }
    }
    
    // Nur Felder die bei mindestens 2 Pilzen vorkommen
    const dimensionen = [];
    for (const [feldName, count] of feldCounts) {
      if (count >= 2 && istNumerisch(feldName)) {
        dimensionen.push(feldName);
      }
    }
    
    return dimensionen;
  }
  
  /**
   * Prüft ob ein Feld numerisch vergleichbar ist
   */
  function istNumerisch(feldName) {
    const config = getFeldConfig(feldName);
    const typ = config?.typ || 'text';
    return ['number', 'range', 'rating', 'progress'].includes(typ) ||
           feldName === 'essbarkeit' || // Spezialfall
           feldName.includes('temperatur') ||
           feldName.includes('größe') ||
           feldName.includes('zeit');
  }
  
  /**
   * Berechnet normalisierte Positionen für alle Pilze
   */
  function berechnePunkte(nachPilz, dimensionen) {
    const punkte = new Map();
    const perspektiven = getPerspektivenListe();
    
    for (const [pilzId, data] of nachPilz) {
      const vektor = [];
      
      for (const dim of dimensionen) {
        const feld = data.felder.find(f => f.feldName === dim);
        if (feld) {
          const config = getFeldConfig(dim);
          const norm = normalisiereWert(feld.wert, dim, config);
          vektor.push(norm);
        } else {
          vektor.push(0.5); // Default wenn Feld fehlt
        }
      }
      
      // Farbe aus erster passender Perspektive
      let farbe = '#3b82f6';
      for (const p of perspektiven) {
        const hatFeld = data.felder.some(f => p.felder?.includes(f.feldName));
        if (hatFeld && p.farben?.[0]) {
          farbe = p.farben[0];
          break;
        }
      }
      
      punkte.set(pilzId, {
        id: pilzId,
        name: data.pilzDaten?.name || pilzId,
        vektor,
        farbe,
        daten: data
      });
    }
    
    return punkte;
  }
  
  /**
   * Normalisiert einen Wert auf 0-1
   */
  function normalisiereWert(wert, feldName, config) {
    // Spezialfall Essbarkeit
    if (feldName === 'essbarkeit') {
      return normalisierer.essbarkeit(wert);
    }
    
    const typ = config?.typ || 'text';
    const norm = normalisierer[typ];
    if (norm) return norm(wert, config);
    
    // Fallback: Versuche als Zahl
    const num = parseFloat(wert);
    if (!isNaN(num)) {
      return Math.max(0, Math.min(1, num / 100));
    }
    
    return 0.5;
  }
  
  /**
   * Rendert 2D Streudiagramm
   */
  function render2D(svg, punkte, dimensionen) {
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    const padding = 60;
    
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Achsen
    const xAchse = dimensionen[0];
    const yAchse = dimensionen[1];
    
    // X-Achse
    const xLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xLine.setAttribute('x1', padding);
    xLine.setAttribute('y1', height - padding);
    xLine.setAttribute('x2', width - padding);
    xLine.setAttribute('y2', height - padding);
    xLine.setAttribute('stroke', 'rgba(255,255,255,0.3)');
    svg.appendChild(xLine);
    
    // Y-Achse
    const yLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yLine.setAttribute('x1', padding);
    yLine.setAttribute('y1', padding);
    yLine.setAttribute('x2', padding);
    yLine.setAttribute('y2', height - padding);
    yLine.setAttribute('stroke', 'rgba(255,255,255,0.3)');
    svg.appendChild(yLine);
    
    // Achsen-Labels
    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', width / 2);
    xLabel.setAttribute('y', height - 15);
    xLabel.setAttribute('text-anchor', 'middle');
    xLabel.setAttribute('fill', 'rgba(255,255,255,0.6)');
    xLabel.setAttribute('font-size', '12');
    xLabel.textContent = getFeldConfig(xAchse)?.label || xAchse;
    svg.appendChild(xLabel);
    
    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('x', 15);
    yLabel.setAttribute('y', height / 2);
    yLabel.setAttribute('text-anchor', 'middle');
    yLabel.setAttribute('fill', 'rgba(255,255,255,0.6)');
    yLabel.setAttribute('font-size', '12');
    yLabel.setAttribute('transform', `rotate(-90, 15, ${height/2})`);
    yLabel.textContent = getFeldConfig(yAchse)?.label || yAchse;
    svg.appendChild(yLabel);
    
    // Punkte zeichnen
    for (const [pilzId, punkt] of punkte) {
      const x = padding + punkt.vektor[0] * (width - 2 * padding);
      const y = height - padding - punkt.vektor[1] * (height - 2 * padding);
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '12');
      circle.setAttribute('fill', punkt.farbe);
      circle.setAttribute('opacity', '0.8');
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      circle.style.transition = 'r 0.2s, opacity 0.2s';
      
      // Hover-Effekt
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('r', '16');
        circle.setAttribute('opacity', '1');
        showTooltip(punkt, x, y);
      });
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', '12');
        circle.setAttribute('opacity', '0.8');
        hideTooltip();
      });
      
      svg.appendChild(circle);
      
      // Name-Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', y - 18);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'white');
      label.setAttribute('font-size', '11');
      label.setAttribute('opacity', '0.9');
      label.textContent = punkt.name;
      svg.appendChild(label);
    }
    
    // Distanz-Linien zwischen allen Punkten (optional)
    const punkteArray = [...punkte.values()];
    for (let i = 0; i < punkteArray.length; i++) {
      for (let j = i + 1; j < punkteArray.length; j++) {
        const a = punkteArray[i];
        const b = punkteArray[j];
        const ax = padding + a.vektor[0] * (width - 2 * padding);
        const ay = height - padding - a.vektor[1] * (height - 2 * padding);
        const bx = padding + b.vektor[0] * (width - 2 * padding);
        const by = height - padding - b.vektor[1] * (height - 2 * padding);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', ax);
        line.setAttribute('y1', ay);
        line.setAttribute('x2', bx);
        line.setAttribute('y2', by);
        line.setAttribute('stroke', 'rgba(255,255,255,0.1)');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '3,3');
        svg.insertBefore(line, svg.firstChild); // Hinter Punkten
      }
    }
  }
  
  /**
   * Rendert Radar/Spinnendiagramm
   */
  function renderRadar(svg, punkte, dimensionen) {
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 80;
    
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    const numDims = dimensionen.length;
    const angleStep = (Math.PI * 2) / numDims;
    
    // Hintergrund-Ringe
    for (let ring = 1; ring <= 4; ring++) {
      const r = (radius / 4) * ring;
      const ringPath = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ringPath.setAttribute('cx', centerX);
      ringPath.setAttribute('cy', centerY);
      ringPath.setAttribute('r', r);
      ringPath.setAttribute('fill', 'none');
      ringPath.setAttribute('stroke', 'rgba(255,255,255,0.1)');
      svg.appendChild(ringPath);
    }
    
    // Achsen und Labels
    for (let i = 0; i < numDims; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Achsen-Linie
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(255,255,255,0.2)');
      svg.appendChild(line);
      
      // Label
      const labelX = centerX + Math.cos(angle) * (radius + 25);
      const labelY = centerY + Math.sin(angle) * (radius + 25);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', labelX);
      label.setAttribute('y', labelY);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', 'rgba(255,255,255,0.7)');
      label.setAttribute('font-size', '11');
      label.textContent = getFeldConfig(dimensionen[i])?.label || dimensionen[i];
      svg.appendChild(label);
    }
    
    // Polygone für jeden Pilz
    for (const [pilzId, punkt] of punkte) {
      const pathPoints = [];
      
      for (let i = 0; i < numDims; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = punkt.vektor[i] || 0;
        const r = value * radius;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        pathPoints.push(`${x},${y}`);
      }
      
      // Polygon
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', pathPoints.join(' '));
      polygon.setAttribute('fill', punkt.farbe);
      polygon.setAttribute('fill-opacity', '0.2');
      polygon.setAttribute('stroke', punkt.farbe);
      polygon.setAttribute('stroke-width', '2');
      polygon.style.cursor = 'pointer';
      
      polygon.addEventListener('mouseenter', () => {
        polygon.setAttribute('fill-opacity', '0.4');
        polygon.setAttribute('stroke-width', '3');
      });
      polygon.addEventListener('mouseleave', () => {
        polygon.setAttribute('fill-opacity', '0.2');
        polygon.setAttribute('stroke-width', '2');
      });
      
      svg.appendChild(polygon);
      
      // Punkte auf den Ecken
      for (let i = 0; i < numDims; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = punkt.vektor[i] || 0;
        const r = value * radius;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', '4');
        dot.setAttribute('fill', punkt.farbe);
        svg.appendChild(dot);
      }
    }
  }
  
  /**
   * Rendert 3D-Ansicht (vereinfacht mit Perspektive)
   */
  function render3D(svg, punkte, dimensionen) {
    // Für echte 3D würde man Three.js nutzen
    // Hier: Isometrische Projektion als Fallback
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Info-Text
    const info = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    info.setAttribute('x', width / 2);
    info.setAttribute('y', 30);
    info.setAttribute('text-anchor', 'middle');
    info.setAttribute('fill', 'rgba(255,255,255,0.5)');
    info.setAttribute('font-size', '12');
    info.textContent = '3D-Ansicht (isometrische Projektion)';
    svg.appendChild(info);
    
    // Isometrische Achsen
    const centerX = width / 2;
    const centerY = height / 2;
    const axisLength = 200;
    
    // X-Achse (nach rechts-unten)
    const xEnd = { x: centerX + axisLength * 0.866, y: centerY + axisLength * 0.5 };
    // Y-Achse (nach links-unten)  
    const yEnd = { x: centerX - axisLength * 0.866, y: centerY + axisLength * 0.5 };
    // Z-Achse (nach oben)
    const zEnd = { x: centerX, y: centerY - axisLength };
    
    // Achsen zeichnen
    const axes = [
      { end: xEnd, label: dimensionen[0] || 'X', color: '#ef4444' },
      { end: yEnd, label: dimensionen[1] || 'Y', color: '#22c55e' },
      { end: zEnd, label: dimensionen[2] || 'Z', color: '#3b82f6' }
    ];
    
    for (const axis of axes) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', axis.end.x);
      line.setAttribute('y2', axis.end.y);
      line.setAttribute('stroke', axis.color);
      line.setAttribute('stroke-width', '2');
      line.setAttribute('opacity', '0.6');
      svg.appendChild(line);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', axis.end.x + (axis.end.x - centerX) * 0.15);
      label.setAttribute('y', axis.end.y + (axis.end.y - centerY) * 0.15);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', axis.color);
      label.setAttribute('font-size', '11');
      label.textContent = getFeldConfig(axis.label)?.label || axis.label;
      svg.appendChild(label);
    }
    
    // Punkte in isometrischer Projektion
    for (const [pilzId, punkt] of punkte) {
      const vx = punkt.vektor[0] || 0.5;
      const vy = punkt.vektor[1] || 0.5;
      const vz = punkt.vektor[2] || 0.5;
      
      // Isometrische Transformation
      const x = centerX + (vx - vy) * axisLength * 0.866;
      const y = centerY + (vx + vy) * axisLength * 0.5 * 0.5 - vz * axisLength;
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '10');
      circle.setAttribute('fill', punkt.farbe);
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      
      circle.addEventListener('mouseenter', () => showTooltip(punkt, x, y));
      circle.addEventListener('mouseleave', hideTooltip);
      
      svg.appendChild(circle);
      
      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', y - 15);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'white');
      label.setAttribute('font-size', '10');
      label.textContent = punkt.name;
      svg.appendChild(label);
    }
  }
  
  /**
   * Rendert Dimensionen-Auswahl
   */
  function renderDimensionenAuswahl(dimensionen) {
    dimensionenContainer.innerHTML = dimensionen.map(dim => {
      const config = getFeldConfig(dim);
      const label = config?.label || dim;
      const isActive = raumState.dimensionen.includes(dim) || 
                       (raumState.dimensionen.length === 0 && dimensionen.indexOf(dim) < 3);
      return `<button class="dim-btn ${isActive ? 'aktiv' : ''}" data-dim="${dim}">${label}</button>`;
    }).join('');
    
    dimensionenContainer.querySelectorAll('.dim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dim = btn.dataset.dim;
        if (raumState.dimensionen.includes(dim)) {
          raumState.dimensionen = raumState.dimensionen.filter(d => d !== dim);
        } else {
          raumState.dimensionen.push(dim);
        }
        btn.classList.toggle('aktiv');
        renderVektorraum();
      });
    });
  }
  
  /**
   * Rendert Legende
   */
  function renderLegende(container, punkte) {
    container.innerHTML = '<div class="legende-titel">Pilze</div>';
    
    for (const [pilzId, punkt] of punkte) {
      const item = document.createElement('div');
      item.className = 'legende-item';
      item.innerHTML = `
        <span class="legende-farbe" style="background: ${punkt.farbe}"></span>
        <span class="legende-name">${punkt.name}</span>
      `;
      container.appendChild(item);
    }
  }
  
  /**
   * Tooltip anzeigen
   */
  function showTooltip(punkt, x, y) {
    const felder = punkt.daten.felder.map(f => {
      const config = getFeldConfig(f.feldName);
      const label = config?.label || f.feldName;
      return `<div class="tooltip-feld"><span>${label}:</span> <strong>${formatWert(f.wert)}</strong></div>`;
    }).join('');
    
    tooltip.innerHTML = `
      <div class="tooltip-name">${punkt.name}</div>
      ${felder}
    `;
    tooltip.style.display = 'block';
    tooltip.style.left = (x + 20) + 'px';
    tooltip.style.top = (y - 20) + 'px';
  }
  
  function hideTooltip() {
    tooltip.style.display = 'none';
  }
  
  function formatWert(wert) {
    if (wert === null || wert === undefined) return '';
    if (Array.isArray(wert)) return wert.join(', ');
    if (typeof wert === 'object') {
      if ('min' in wert && 'max' in wert) {
        return `${wert.min}–${wert.max}${wert.einheit ? ' ' + wert.einheit : ''}`;
      }
    }
    return String(wert);
  }
  
  // Auf Auswahl-Änderungen reagieren
  document.addEventListener('amorph:auswahl-geaendert', () => {
    if (ctx.dom.offsetParent !== null) {
      renderVektorraum();
    }
  });
  
  // Auf Ansicht-Wechsel reagieren
  document.addEventListener('amorph:ansicht-wechsel', (e) => {
    if (e.detail.ansicht === 'vergleich') {
      ctx.dom.style.display = 'block';
      setTimeout(renderVektorraum, 50); // Warten bis sichtbar für korrekte Größe
    } else {
      ctx.dom.style.display = 'none';
    }
  });
  
  // Resize-Handler
  window.addEventListener('resize', () => {
    if (ctx.dom.offsetParent !== null) {
      renderVektorraum();
    }
  });
  
  ctx.dom.appendChild(container);
  ctx.dom.style.display = 'none';
  ctx.mount();
  
  debug.features('Vergleich/Vektorraum Feature bereit');
}
