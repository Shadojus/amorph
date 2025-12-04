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
    
    pieWrap.innerHTML = `<div class="pie-name" style="color:${item.farbe}">${item.name}</div>`;
    
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
  const pieColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
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
