/**
 * 🔄 LIFECYCLE MORPH - Zirkulärer Lebenszyklus
 * 
 * Zeigt Phasen als Kreis oder horizontale Phasen-Ansicht
 * DATENGETRIEBEN - Erkennt Arrays mit Phasen-Strukturen
 * 
 * Input: [{phase: "Ei", dauer: "3-5 Tage"}, {phase: "Larve", ...}]
 * Output: Zirkuläre oder lineare Phasen-Darstellung
 */

import { debug } from '../../../observer/debug.js';

export function lifecycle(wert, config = {}) {
  debug.morphs('lifecycle', { typ: typeof wert, anzahl: Array.isArray(wert) ? wert.length : 0 });
  
  const el = document.createElement('div');
  el.className = 'amorph-lifecycle';
  
  if (!Array.isArray(wert) || wert.length === 0) {
    el.innerHTML = '<span class="amorph-lifecycle-leer">Keine Phasen</span>';
    return el;
  }
  
  // Phasen normalisieren
  const phases = normalisierePhasen(wert);
  
  // Modus: circle (Standard für 3-6 Phasen) oder linear
  const mode = config.mode || (phases.length >= 3 && phases.length <= 6 ? 'circle' : 'linear');
  el.setAttribute('data-mode', mode);
  
  if (mode === 'circle') {
    el.appendChild(renderCircle(phases, config));
  } else {
    el.appendChild(renderLinear(phases, config));
  }
  
  return el;
}

function normalisierePhasen(wert) {
  return wert.map((item, i) => {
    if (typeof item === 'string') {
      return { name: item, dauer: '', beschreibung: '', active: false };
    }
    
    if (typeof item === 'object') {
      // Dauer extrahieren
      let dauer = '';
      if (item.dauer || item.duration) {
        dauer = item.dauer || item.duration;
      } else if (item.dauer_tage) {
        if (typeof item.dauer_tage === 'object') {
          dauer = `${item.dauer_tage.min}–${item.dauer_tage.max} Tage`;
        } else {
          dauer = `${item.dauer_tage} Tage`;
        }
      } else if (item.dauer_monate) {
        dauer = `${item.dauer_monate} Monate`;
      }
      
      // Name extrahieren: phase, name, title, label, stadium, schritt
      const phaseName = item.phase || item.name || item.title || item.label || item.stadium || item.schritt;
      // Step-Nummer als Prefix wenn vorhanden
      const stepPrefix = item.step !== undefined ? `${item.step}. ` : '';
      const displayName = phaseName ? `${stepPrefix}${phaseName}` : `Phase ${i + 1}`;
      
      // Status-basierte Aktivität: 'active', 'in-progress', 'aktuell'
      const statusValue = item.status || item.state || '';
      const isActive = item.active || item.aktuell || item.current || 
                       statusValue === 'active' || statusValue === 'in-progress' || 
                       statusValue === 'current' || statusValue === 'aktuell';
      
      return {
        name: displayName,
        dauer: dauer,
        beschreibung: item.beschreibung || item.description || '',
        active: isActive,
        icon: item.icon || getPhaseIcon(phaseName || '', i),
        status: statusValue
      };
    }
    
    return { name: String(item), dauer: '', beschreibung: '', active: false };
  });
}

function getPhaseIcon(name, index) {
  const lower = String(name || '').toLowerCase();
  
  // Bekannte Phasen
  if (lower.includes('ei') || lower.includes('egg')) return '🥚';
  if (lower.includes('larve') || lower.includes('larva') || lower.includes('raupe')) return '🐛';
  if (lower.includes('puppe') || lower.includes('pupa') || lower.includes('kokon')) return '🫛';
  if (lower.includes('adult') || lower.includes('imago')) return '🦋';
  if (lower.includes('spore') || lower.includes('spor')) return '🔵';
  if (lower.includes('myzel') || lower.includes('mycel')) return '🕸️';
  if (lower.includes('frucht') || lower.includes('fruit')) return '🍄';
  if (lower.includes('samen') || lower.includes('seed')) return '🌱';
  if (lower.includes('keimling') || lower.includes('seedling')) return '🌿';
  if (lower.includes('blüte') || lower.includes('flower') || lower.includes('bloom')) return '🌸';
  
  // Fallback
  const icons = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
  return icons[index % icons.length];
}

function renderCircle(phases, config) {
  const container = document.createElement('div');
  container.className = 'amorph-lifecycle-circle';
  
  const size = config.size || 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 40;
  
  // SVG erstellen
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'amorph-lifecycle-svg');
  
  // Kreis-Linie
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', centerX);
  circle.setAttribute('cy', centerY);
  circle.setAttribute('r', radius);
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'rgba(255,255,255,0.1)');
  circle.setAttribute('stroke-width', '2');
  circle.setAttribute('stroke-dasharray', '4 4');
  svg.appendChild(circle);
  
  // Pfeile zwischen Phasen
  const arrowsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  arrowsGroup.setAttribute('class', 'amorph-lifecycle-arrows');
  
  for (let i = 0; i < phases.length; i++) {
    const angle1 = (i / phases.length) * 2 * Math.PI - Math.PI / 2;
    const angle2 = ((i + 1) / phases.length) * 2 * Math.PI - Math.PI / 2;
    const midAngle = (angle1 + angle2) / 2;
    
    const x = centerX + Math.cos(midAngle) * (radius + 5);
    const y = centerY + Math.sin(midAngle) * (radius + 5);
    
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    arrow.setAttribute('x', x);
    arrow.setAttribute('y', y);
    arrow.setAttribute('text-anchor', 'middle');
    arrow.setAttribute('dominant-baseline', 'middle');
    arrow.setAttribute('fill', 'rgba(255,255,255,0.3)');
    arrow.setAttribute('font-size', '10');
    arrow.setAttribute('transform', `rotate(${(midAngle * 180 / Math.PI) + 90}, ${x}, ${y})`);
    arrow.textContent = '▸';
    arrowsGroup.appendChild(arrow);
  }
  svg.appendChild(arrowsGroup);
  
  container.appendChild(svg);
  
  // Phasen-Nodes
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const angle = (i / phases.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const node = document.createElement('div');
    node.className = 'amorph-lifecycle-node';
    if (phase.active) node.classList.add('amorph-lifecycle-active');
    node.style.left = `${(x / size) * 100}%`;
    node.style.top = `${(y / size) * 100}%`;
    
    // Icon
    const icon = document.createElement('span');
    icon.className = 'amorph-lifecycle-icon';
    icon.textContent = phase.icon || '●';
    node.appendChild(icon);
    
    // Label
    const label = document.createElement('span');
    label.className = 'amorph-lifecycle-label';
    label.textContent = phase.name;
    node.appendChild(label);
    
    // Dauer
    if (phase.dauer) {
      const dauer = document.createElement('span');
      dauer.className = 'amorph-lifecycle-dauer';
      dauer.textContent = phase.dauer;
      node.appendChild(dauer);
    }
    
    container.appendChild(node);
  }
  
  return container;
}

function renderLinear(phases, config) {
  const container = document.createElement('div');
  container.className = 'amorph-lifecycle-linear';
  
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const isLast = i === phases.length - 1;
    
    const item = document.createElement('div');
    item.className = 'amorph-lifecycle-item';
    if (phase.active) item.classList.add('amorph-lifecycle-active');
    
    // Icon
    const icon = document.createElement('div');
    icon.className = 'amorph-lifecycle-item-icon';
    icon.textContent = phase.icon || '●';
    item.appendChild(icon);
    
    // Content
    const content = document.createElement('div');
    content.className = 'amorph-lifecycle-item-content';
    
    const name = document.createElement('div');
    name.className = 'amorph-lifecycle-item-name';
    name.textContent = phase.name;
    content.appendChild(name);
    
    if (phase.dauer) {
      const dauer = document.createElement('div');
      dauer.className = 'amorph-lifecycle-item-dauer';
      dauer.textContent = phase.dauer;
      content.appendChild(dauer);
    }
    
    item.appendChild(content);
    
    // Pfeil
    if (!isLast) {
      const arrow = document.createElement('div');
      arrow.className = 'amorph-lifecycle-arrow';
      arrow.textContent = '→';
      item.appendChild(arrow);
    }
    
    container.appendChild(item);
  }
  
  return container;
}
