/**
 * 🗺️ MAP MORPH - Interaktive Kartenansicht
 * 
 * Zeigt geografische Daten als Karte mit Markern
 * DATENGETRIEBEN - Erkennt Koordinaten-Strukturen
 * 
 * Input: {lat: 19.6, lon: -100.3} 
 *    oder {koordinaten: {lat, lon}, region: "..."}
 *    oder [{name: "Ort1", lat: x, lon: y}, ...]
 * Output: Karte mit Marker(n)
 */

import { debug } from '../../../observer/debug.js';

export function map(wert, config = {}) {
  debug.morphs('map', { typ: typeof wert, istArray: Array.isArray(wert) });
  
  const el = document.createElement('div');
  el.className = 'amorph-map';
  
  // Marker extrahieren
  const markers = normalisiereKoordinaten(wert);
  
  if (markers.length === 0) {
    el.innerHTML = '<span class="amorph-map-leer">Keine Koordinaten</span>';
    return el;
  }
  
  // Karten-Container
  const mapContainer = document.createElement('div');
  mapContainer.className = 'amorph-map-container';
  
  // SVG Weltkarte (vereinfacht)
  const mapSvg = createWorldMapSVG(markers, config);
  mapContainer.appendChild(mapSvg);
  
  el.appendChild(mapContainer);
  
  // Marker-Legende
  if (markers.length > 0 && config.showLegend !== false) {
    const legend = document.createElement('div');
    legend.className = 'amorph-map-legend';
    
    for (const marker of markers.slice(0, 5)) {
      const item = document.createElement('div');
      item.className = 'amorph-map-legend-item';
      
      const dot = document.createElement('span');
      dot.className = 'amorph-map-legend-dot';
      if (marker.color) dot.style.background = marker.color;
      item.appendChild(dot);
      
      const label = document.createElement('span');
      label.className = 'amorph-map-legend-label';
      label.textContent = marker.label || `${marker.lat.toFixed(1)}°, ${marker.lon.toFixed(1)}°`;
      item.appendChild(label);
      
      legend.appendChild(item);
    }
    
    el.appendChild(legend);
  }
  
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
    // Direkte Koordinaten
    const coords = extractCoords(wert);
    if (coords) {
      markers.push(coords);
    }
    // Verschachtelte Koordinaten
    if (wert.koordinaten || wert.coordinates || wert.location) {
      const nested = extractCoords(wert.koordinaten || wert.coordinates || wert.location);
      if (nested) {
        nested.label = wert.region || wert.name || wert.ort || nested.label;
        markers.push(nested);
      }
    }
    // Array in Objekt
    if (wert.orte || wert.locations || wert.markers) {
      const arr = wert.orte || wert.locations || wert.markers;
      for (const item of arr) {
        const coords = extractCoords(item);
        if (coords) markers.push(coords);
      }
    }
  }
  
  return markers;
}

function extractCoords(item) {
  if (!item || typeof item !== 'object') return null;
  
  const lat = item.lat || item.latitude || item.breitengrad || null;
  const lon = item.lon || item.lng || item.longitude || item.laengengrad || null;
  
  if (lat !== null && lon !== null) {
    return {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      label: item.name || item.label || item.region || item.ort || '',
      color: item.color || item.farbe || null
    };
  }
  return null;
}

function createWorldMapSVG(markers, config) {
  const width = config.width || 300;
  const height = config.height || 150;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'amorph-map-svg');
  
  // Hintergrund mit Gitternetz
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('fill', 'rgba(0,0,0,0.3)');
  bg.setAttribute('rx', '4');
  svg.appendChild(bg);
  
  // Längen- und Breitengrade
  const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gridGroup.setAttribute('class', 'amorph-map-grid');
  gridGroup.setAttribute('stroke', 'rgba(255,255,255,0.1)');
  gridGroup.setAttribute('stroke-width', '0.5');
  
  // Längengrade (vertikal)
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = lonToX(lon, width);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', x);
    line.setAttribute('y2', height);
    gridGroup.appendChild(line);
  }
  
  // Breitengrade (horizontal)
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = latToY(lat, height);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', y);
    line.setAttribute('x2', width);
    line.setAttribute('y2', y);
    gridGroup.appendChild(line);
  }
  
  svg.appendChild(gridGroup);
  
  // Äquator und Nullmeridian hervorheben
  const equator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  equator.setAttribute('x1', 0);
  equator.setAttribute('y1', height / 2);
  equator.setAttribute('x2', width);
  equator.setAttribute('y2', height / 2);
  equator.setAttribute('stroke', 'rgba(255,255,255,0.2)');
  equator.setAttribute('stroke-width', '1');
  svg.appendChild(equator);
  
  const meridian = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  meridian.setAttribute('x1', width / 2);
  meridian.setAttribute('y1', 0);
  meridian.setAttribute('x2', width / 2);
  meridian.setAttribute('y2', height);
  meridian.setAttribute('stroke', 'rgba(255,255,255,0.2)');
  meridian.setAttribute('stroke-width', '1');
  svg.appendChild(meridian);
  
  // Vereinfachte Kontinente (Pfade)
  const continents = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  continents.setAttribute('d', getSimplifiedContinentsPath(width, height));
  continents.setAttribute('fill', 'rgba(255,255,255,0.08)');
  continents.setAttribute('stroke', 'rgba(255,255,255,0.15)');
  continents.setAttribute('stroke-width', '0.5');
  svg.appendChild(continents);
  
  // Marker
  for (const marker of markers) {
    const x = lonToX(marker.lon, width);
    const y = latToY(marker.lat, height);
    
    // Glow-Effekt
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('cx', x);
    glow.setAttribute('cy', y);
    glow.setAttribute('r', '8');
    glow.setAttribute('fill', marker.color || 'var(--color-accent)');
    glow.setAttribute('opacity', '0.3');
    glow.setAttribute('class', 'amorph-map-marker-glow');
    svg.appendChild(glow);
    
    // Marker-Punkt
    const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    point.setAttribute('cx', x);
    point.setAttribute('cy', y);
    point.setAttribute('r', '4');
    point.setAttribute('fill', marker.color || 'var(--color-accent)');
    point.setAttribute('class', 'amorph-map-marker');
    svg.appendChild(point);
    
    // Innerer Punkt
    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    inner.setAttribute('cx', x);
    inner.setAttribute('cy', y);
    inner.setAttribute('r', '2');
    inner.setAttribute('fill', 'white');
    svg.appendChild(inner);
  }
  
  return svg;
}

function lonToX(lon, width) {
  return ((lon + 180) / 360) * width;
}

function latToY(lat, height) {
  return ((90 - lat) / 180) * height;
}

function getSimplifiedContinentsPath(w, h) {
  // Stark vereinfachte Kontinente-Umrisse (skaliert)
  const scale = (x, y) => `${(x / 360) * w},${(y / 180) * h}`;
  
  // Nordamerika, Europa, Asien, Afrika, Südamerika, Australien (sehr vereinfacht)
  return `
    M ${scale(40, 30)} L ${scale(80, 25)} L ${scale(100, 40)} L ${scale(80, 60)} L ${scale(50, 55)} Z
    M ${scale(155, 25)} L ${scale(200, 20)} L ${scale(220, 35)} L ${scale(200, 50)} L ${scale(160, 45)} Z
    M ${scale(220, 20)} L ${scale(320, 15)} L ${scale(340, 50)} L ${scale(280, 70)} L ${scale(220, 50)} Z
    M ${scale(160, 55)} L ${scale(200, 50)} L ${scale(210, 100)} L ${scale(175, 110)} L ${scale(155, 80)} Z
    M ${scale(70, 70)} L ${scale(100, 65)} L ${scale(110, 110)} L ${scale(80, 130)} L ${scale(60, 100)} Z
    M ${scale(280, 90)} L ${scale(310, 85)} L ${scale(320, 110)} L ${scale(290, 115)} Z
  `;
}
