/**
 * COMPARE MAP - Map/geo comparison
 * Uses the exact same HTML structure as the original map morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareMap(items, config = {}) {
  debug.morphs('compareMap', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-map';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Original map structure
    const mapEl = document.createElement('div');
    mapEl.className = 'amorph-map';
    
    const markers = normalisiereKoordinaten(rawVal);
    
    if (markers.length === 0) {
      mapEl.innerHTML = '<span class="amorph-map-leer">Keine Koordinaten</span>';
    } else {
      const mapContainer = document.createElement('div');
      mapContainer.className = 'amorph-map-container';
      
      // Simplified SVG world map representation
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 120 60');
      svg.setAttribute('class', 'amorph-map-svg');
      
      // Simple world outline
      const outline = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      outline.setAttribute('cx', '60');
      outline.setAttribute('cy', '30');
      outline.setAttribute('rx', '55');
      outline.setAttribute('ry', '25');
      outline.setAttribute('fill', 'rgba(100, 150, 200, 0.1)');
      outline.setAttribute('stroke', 'rgba(100, 150, 200, 0.3)');
      svg.appendChild(outline);
      
      // Draw markers
      markers.slice(0, 3).forEach((marker, i) => {
        const x = 60 + (marker.lon / 180) * 55;
        const y = 30 - (marker.lat / 90) * 25;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '4');
        circle.setAttribute('class', 'amorph-map-marker');
        circle.setAttribute('fill', marker.color || 'rgba(100, 180, 255, 0.8)');
        circle.setAttribute('stroke', 'rgba(255,255,255,0.5)');
        circle.setAttribute('stroke-width', '1');
        svg.appendChild(circle);
      });
      
      mapContainer.appendChild(svg);
      mapEl.appendChild(mapContainer);
      
      // Legend with coordinates
      if (markers.length > 0) {
        const legend = document.createElement('div');
        legend.className = 'amorph-map-legend';
        legend.style.fontSize = '9px';
        legend.style.marginTop = '4px';
        
        markers.slice(0, 2).forEach(marker => {
          const legendItem = document.createElement('div');
          legendItem.className = 'amorph-map-legend-item';
          legendItem.innerHTML = `<span class="amorph-map-legend-dot" style="display:inline-block;width:6px;height:6px;background:${marker.color || 'rgba(100,180,255,0.8)'};border-radius:50%;margin-right:4px;"></span>${marker.label || `${marker.lat.toFixed(1)}°, ${marker.lon.toFixed(1)}°`}`;
          legend.appendChild(legendItem);
        });
        
        mapEl.appendChild(legend);
      }
    }
    
    wrapper.appendChild(mapEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereKoordinaten(wert) {
  const markers = [];
  
  if (Array.isArray(wert)) {
    for (const item of wert) {
      const coords = extractCoords(item);
      if (coords) markers.push(coords);
    }
  } else if (typeof wert === 'object') {
    const coords = extractCoords(wert);
    if (coords) markers.push(coords);
  }
  
  return markers;
}

function extractCoords(item) {
  if (!item || typeof item !== 'object') return null;
  
  let lat, lon, label, color;
  
  // Various coordinate formats
  if ('lat' in item && ('lon' in item || 'lng' in item)) {
    lat = item.lat;
    lon = item.lon ?? item.lng;
  } else if (item.koordinaten) {
    lat = item.koordinaten.lat;
    lon = item.koordinaten.lon ?? item.koordinaten.lng;
  } else if (item.coords) {
    lat = item.coords.lat ?? item.coords[0];
    lon = item.coords.lon ?? item.coords.lng ?? item.coords[1];
  }
  
  if (lat === undefined || lon === undefined) return null;
  
  return {
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    label: item.name || item.label || item.region || '',
    color: item.color || item.farbe
  };
}

export default compareMap;
