/**
 * COMPARE PIE - Side-by-side pie charts
 */

import { debug } from '../../../../observer/debug.js';

export function comparePie(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-pie';
  
  const container = document.createElement('div');
  container.className = 'compare-pie-container';
  
  items.forEach(item => {
    const pieWrap = document.createElement('div');
    pieWrap.className = `compare-pie-wrap ${item.colorClass || item.farbKlasse || ''}`;
    
    // Inline styles for reliable rendering
    const textColor = item.textColor || item.textFarbe || 'rgba(255,255,255,0.85)';
    const itemName = item.name || item.id || '–';
    pieWrap.innerHTML = `<div class="pie-name" style="color:${textColor}">${itemName}</div>`;
    
    const val = item.value ?? item.wert;
    const pieData = typeof val === 'object' && !Array.isArray(val) 
      ? Object.entries(val).map(([k, v]) => ({ label: k, value: v }))
      : val;
    
    if (!pieData || (Array.isArray(pieData) && pieData.length === 0)) {
      pieWrap.innerHTML += '<div class="pie-empty">–</div>';
    } else {
      pieWrap.appendChild(createMiniPie(pieData));
    }
    
    container.appendChild(pieWrap);
  });
  
  el.appendChild(container);
  
  // Shared legend for all pie charts (if data available)
  const firstVal = items[0]?.value ?? items[0]?.wert;
  if (firstVal) {
    const pieData = typeof firstVal === 'object' && !Array.isArray(firstVal)
      ? Object.entries(firstVal).map(([k, v]) => ({ label: k, value: v }))
      : firstVal;
    
    if (Array.isArray(pieData) && pieData.length > 0) {
      const legend = document.createElement('div');
      legend.className = 'compare-pie-legend';
      
      // Glass colors - translucent, glowing
      const pieColors = [
        'rgba(100, 220, 160, 0.45)',
        'rgba(90, 160, 240, 0.45)',
        'rgba(240, 190, 80, 0.45)',
        'rgba(240, 110, 110, 0.45)',
        'rgba(170, 130, 220, 0.45)',
        'rgba(80, 210, 210, 0.45)'
      ];
      pieData.forEach((d, i) => {
        const item = document.createElement('span');
        item.className = 'pie-legend-item';
        item.innerHTML = `
          <span class="pie-legend-dot" style="background:${pieColors[i % pieColors.length]}"></span>
          <span class="pie-legend-label">${d.label || d.name || 'Unknown'}</span>
        `;
        legend.appendChild(item);
      });
      
      el.appendChild(legend);
    }
  }
  
  return el;
}

function createMiniPie(data) {
  const size = 60;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'mini-pie-svg');
  
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  
  const total = data.reduce((sum, d) => sum + (d.value || d.count || 0), 0);
  // Glass colors - translucent, glowing
  const pieColors = [
    'rgba(100, 220, 160, 0.45)',   // Glass Emerald
    'rgba(90, 160, 240, 0.45)',    // Glass Sapphire
    'rgba(240, 190, 80, 0.45)',    // Glass Amber
    'rgba(240, 110, 110, 0.45)',   // Glass Ruby
    'rgba(170, 130, 220, 0.45)',   // Glass Amethyst
    'rgba(80, 210, 210, 0.45)'     // Glass Aquamarine
  ];
  
  let currentAngle = -Math.PI / 2;
  
  data.forEach((d, i) => {
    const value = d.value || d.count || 0;
    const angle = (value / total) * Math.PI * 2;
    
    const x1 = cx + Math.cos(currentAngle) * r;
    const y1 = cy + Math.sin(currentAngle) * r;
    const x2 = cx + Math.cos(currentAngle + angle) * r;
    const y2 = cy + Math.sin(currentAngle + angle) * r;
    
    const largeArc = angle > Math.PI ? 1 : 0;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`);
    path.setAttribute('fill', pieColors[i % pieColors.length]);
    
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${d.label || d.name}: ${value}`;
    path.appendChild(title);
    
    svg.appendChild(path);
    currentAngle += angle;
  });
  
  return svg;
}

export default comparePie;
