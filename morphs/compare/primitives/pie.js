/**
 * COMPARE PIE - Nebeneinander Pie-Charts
 */

import { debug } from '../../../observer/debug.js';

export function comparePie(items, config = {}) {
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-pie';
  
  const container = document.createElement('div');
  container.className = 'compare-pie-container';
  
  items.forEach(item => {
    const pieWrap = document.createElement('div');
    pieWrap.className = 'compare-pie-wrap';
    
    pieWrap.innerHTML = `<div class="pie-name" style="color:${item.textFarbe || item.farbe}">${item.name}</div>`;
    
    const pieData = typeof item.wert === 'object' && !Array.isArray(item.wert) 
      ? Object.entries(item.wert).map(([k, v]) => ({ label: k, value: v }))
      : item.wert;
    
    if (!pieData || (Array.isArray(pieData) && pieData.length === 0)) {
      pieWrap.innerHTML += '<div class="pie-leer">–</div>';
    } else {
      pieWrap.appendChild(erstelleMiniPie(pieData));
    }
    
    container.appendChild(pieWrap);
  });
  
  el.appendChild(container);
  
  // Gemeinsame Legende für alle Pie-Charts (falls Daten vorhanden)
  const erstePieData = items[0]?.wert;
  if (erstePieData) {
    const pieData = typeof erstePieData === 'object' && !Array.isArray(erstePieData)
      ? Object.entries(erstePieData).map(([k, v]) => ({ label: k, value: v }))
      : erstePieData;
    
    if (Array.isArray(pieData) && pieData.length > 0) {
      const legende = document.createElement('div');
      legende.className = 'compare-pie-legende';
      
      // Echte Glasfarben - durchscheinend, leuchtend
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
        item.className = 'pie-legende-item';
        item.innerHTML = `
          <span class="pie-legende-dot" style="background:${pieColors[i % pieColors.length]}"></span>
          <span class="pie-legende-label">${d.label || d.name || 'Unbekannt'}</span>
        `;
        legende.appendChild(item);
      });
      
      el.appendChild(legende);
    }
  }
  
  return el;
}

function erstelleMiniPie(data) {
  const size = 60;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('class', 'mini-pie-svg');
  
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  
  const total = data.reduce((sum, d) => sum + (d.value || d.count || 0), 0);
  // Echte Glasfarben - durchscheinend, leuchtend
  const pieColors = [
    'rgba(100, 220, 160, 0.45)',   // Glas-Smaragd
    'rgba(90, 160, 240, 0.45)',    // Glas-Saphir
    'rgba(240, 190, 80, 0.45)',    // Glas-Bernstein
    'rgba(240, 110, 110, 0.45)',   // Glas-Rubin
    'rgba(170, 130, 220, 0.45)',   // Glas-Amethyst
    'rgba(80, 210, 210, 0.45)'     // Glas-Aquamarin
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
