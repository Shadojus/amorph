/**
 * COMPARE SCATTERPLOT - Scatter plot comparison
 * Uses the exact same HTML structure as the original scatterplot morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareScatterplot(items, config = {}) {
  debug.morphs('compareScatterplot', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-scatterplot';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all scatterplots
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    const itemColor = item.farbe || item.color || 'rgba(100, 180, 255, 0.8)';
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original scatterplot structure
    const scatterEl = document.createElement('div');
    scatterEl.className = 'amorph-scatterplot';
    
    // Normalize data to points array
    const punkte = normalisiereWert(rawVal);
    
    if (punkte.length === 0) {
      scatterEl.innerHTML = '<span class="amorph-scatterplot-leer">Keine Scatter-Daten</span>';
    } else {
      const width = config.width || 200;
      const height = config.height || 150;
      const padding = 35;
      
      // Calculate min/max
      const xValues = punkte.map(p => p.x);
      const yValues = punkte.map(p => p.y);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);
      
      const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin || 1)) * (width - padding * 2);
      const scaleY = (y) => height - padding - ((y - yMin) / (yMax - yMin || 1)) * (height - padding * 2);
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('class', 'amorph-scatterplot-svg');
      
      // Axes
      const achsen = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      achsen.setAttribute('class', 'amorph-scatterplot-achsen');
      
      const xAchse = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      xAchse.setAttribute('x1', padding);
      xAchse.setAttribute('y1', height - padding);
      xAchse.setAttribute('x2', width - padding);
      xAchse.setAttribute('y2', height - padding);
      xAchse.setAttribute('stroke', 'rgba(255,255,255,0.3)');
      achsen.appendChild(xAchse);
      
      const yAchse = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      yAchse.setAttribute('x1', padding);
      yAchse.setAttribute('y1', padding);
      yAchse.setAttribute('x2', padding);
      yAchse.setAttribute('y2', height - padding);
      yAchse.setAttribute('stroke', 'rgba(255,255,255,0.3)');
      achsen.appendChild(yAchse);
      
      svg.appendChild(achsen);
      
      // Points
      const punkteGruppe = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      punkteGruppe.setAttribute('class', 'amorph-scatterplot-punkte');
      
      punkte.forEach((punkt, i) => {
        const cx = scaleX(punkt.x);
        const cy = scaleY(punkt.y);
        
        if (!isFinite(cx) || !isFinite(cy)) return;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', config.dotSize || 5);
        circle.setAttribute('fill', itemColor);
        circle.setAttribute('class', 'amorph-scatterplot-punkt');
        
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${punkt.label || ''}: (${punkt.x}, ${punkt.y})`;
        circle.appendChild(title);
        
        punkteGruppe.appendChild(circle);
      });
      
      svg.appendChild(punkteGruppe);
      scatterEl.appendChild(svg);
    }
    
    wrapper.appendChild(scatterEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereWert(wert) {
  if (!wert) return [];
  
  if (Array.isArray(wert)) {
    return wert.map(item => {
      if (typeof item === 'object' && item !== null) {
        return {
          x: item.x ?? item[0] ?? 0,
          y: item.y ?? item[1] ?? 0,
          label: item.label || item.name || ''
        };
      }
      return { x: 0, y: item, label: '' };
    }).filter(p => isFinite(p.x) && isFinite(p.y));
  }
  
  if (typeof wert === 'object') {
    const data = wert.points || wert.data || wert.punkte || [];
    return data.map(item => ({
      x: item.x ?? item[0] ?? 0,
      y: item.y ?? item[1] ?? 0,
      label: item.label || item.name || ''
    })).filter(p => isFinite(p.x) && isFinite(p.y));
  }
  
  return [];
}

export default compareScatterplot;
