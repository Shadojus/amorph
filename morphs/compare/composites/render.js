/**
 * RENDER HELPERS - Rendering-Funktionen für Composite-Morphs
 * 
 * Gemeinsame Rendering-Logik für alle Composite-Morphs.
 * DATENGETRIEBEN: Wählt Morph basierend auf erkanntem Typ.
 */

import {
  compareBar,
  compareRadar,
  comparePie,
  compareRating,
  compareProgress,
  compareStats,
  compareRange,
  compareTimeline,
  compareList,
  compareTag,
  compareText,
  compareImage,
  compareBoolean,
  compareObject
} from '../morphs.js';

/**
 * Rendert ein einzelnes Feld mit passendem Morph
 * 
 * DATENGETRIEBEN:
 * - Typ kommt aus field.typ (wurde von detectType erkannt)
 * - Switch ist vollständig für alle erkannten Typen
 */
export function renderFieldMorph(field, config = {}) {
  const fieldConfig = {
    label: config.labels?.[field.name] || field.name,
    einheit: config.units?.[field.name],
    ...config[field.name]
  };
  
  switch (field.typ) {
    case 'bar':
    case 'number':
      return compareBar(field.values, fieldConfig);
    case 'rating':
      return compareRating(field.values, fieldConfig);
    case 'progress':
      return compareProgress(field.values, fieldConfig);
    case 'radar':
      return compareRadar(field.values, fieldConfig);
    case 'pie':
      return comparePie(field.values, fieldConfig);
    case 'range':
      return compareRange(field.values, fieldConfig);
    case 'stats':
      return compareStats(field.values, fieldConfig);
    case 'timeline':
      return compareTimeline(field.values, fieldConfig);
    case 'list':
      return compareList(field.values, fieldConfig);
    case 'tag':
    case 'badge':
      return compareTag(field.values, fieldConfig);
    case 'boolean':
      return compareBoolean(field.values, fieldConfig);
    case 'image':
      return compareImage(field.values, fieldConfig);
    case 'object':
      return compareObject(field.values, fieldConfig);
    default:
      return compareText(field.values, fieldConfig);
  }
}

/**
 * METRICS COMPOSITE - Kombiniert numerische Werte
 * Zeigt Rating + Progress + Number als vergleichende Balken
 */
export function renderMetricsComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-metrics';
  
  // Alle numerischen Felder als Multi-Bar-Chart
  const metricsData = fieldNames.map(name => ({
    name,
    label: config.labels?.[name] || name,
    items: fields[name].values
  }));
  
  // Als gestapelte Bars darstellen
  metricsData.forEach(metric => {
    const fieldSection = document.createElement('div');
    fieldSection.className = 'metric-field';
    
    const label = document.createElement('div');
    label.className = 'metric-label';
    label.textContent = metric.label;
    fieldSection.appendChild(label);
    
    // Typ erkennen und passenden Morph wählen
    const field = fields[metric.name];
    let morph;
    
    switch (field.typ) {
      case 'rating':
        morph = compareRating(metric.items, { max: 5 });
        break;
      case 'progress':
        morph = compareProgress(metric.items, { einheit: '%' });
        break;
      default:
        morph = compareBar(metric.items, {});
    }
    
    fieldSection.appendChild(morph);
    el.appendChild(fieldSection);
  });
  
  return el;
}

/**
 * RANGES COMPOSITE - Überlappende Range-Darstellung
 * Zeigt alle Ranges auf einer gemeinsamen Skala
 */
export function renderRangesComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-ranges';
  
  fieldNames.forEach(name => {
    const field = fields[name];
    const fieldEl = document.createElement('div');
    fieldEl.className = 'range-field';
    
    const label = document.createElement('div');
    label.className = 'range-label';
    label.textContent = config.labels?.[name] || name;
    fieldEl.appendChild(label);
    
    // Range oder Stats - DATENGETRIEBEN
    const morph = field.typ === 'stats' 
      ? compareStats(field.values, { einheit: config.units?.[name] })
      : compareRange(field.values, { einheit: config.units?.[name] });
    
    fieldEl.appendChild(morph);
    el.appendChild(fieldEl);
  });
  
  return el;
}

/**
 * PROFILE COMPOSITE - Radar + Pie überlagert/nebeneinander
 */
export function renderProfileComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-profile';
  
  // Radar-Felder: Alle überlagert in einem Chart
  const radarFields = fieldNames.filter(n => fields[n].typ === 'radar');
  if (radarFields.length > 0) {
    const radarContainer = document.createElement('div');
    radarContainer.className = 'profile-radar';
    
    radarFields.forEach(name => {
      const morph = compareRadar(fields[name].values, { 
        label: config.labels?.[name] || name 
      });
      radarContainer.appendChild(morph);
    });
    
    el.appendChild(radarContainer);
  }
  
  // Pie-Felder: Nebeneinander
  const pieFields = fieldNames.filter(n => fields[n].typ === 'pie');
  if (pieFields.length > 0) {
    const pieContainer = document.createElement('div');
    pieContainer.className = 'profile-pies';
    
    pieFields.forEach(name => {
      const fieldEl = document.createElement('div');
      fieldEl.className = 'profile-pie-field';
      
      const label = document.createElement('div');
      label.className = 'pie-label';
      label.textContent = config.labels?.[name] || name;
      fieldEl.appendChild(label);
      
      const morph = comparePie(fields[name].values, {});
      fieldEl.appendChild(morph);
      pieContainer.appendChild(fieldEl);
    });
    
    el.appendChild(pieContainer);
  }
  
  return el;
}

/**
 * TIMELINE COMPOSITE - Zeitlinien überlagert
 */
export function renderTimelineComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-timeline';
  
  fieldNames.forEach(name => {
    const morph = compareTimeline(fields[name].values, {
      label: config.labels?.[name] || name
    });
    el.appendChild(morph);
  });
  
  return el;
}

/**
 * CATEGORIES COMPOSITE - Tags, Lists, Booleans gruppiert
 */
export function renderCategoriesComposite(fieldNames, fields, items, config) {
  const el = document.createElement('div');
  el.className = 'composite-categories';
  
  fieldNames.forEach(name => {
    const field = fields[name];
    const fieldEl = document.createElement('div');
    fieldEl.className = 'category-field';
    
    let morph;
    switch (field.typ) {
      case 'boolean':
        morph = compareBoolean(field.values, { label: config.labels?.[name] || name });
        break;
      case 'list':
        morph = compareList(field.values, { label: config.labels?.[name] || name });
        break;
      case 'tag':
      case 'badge':
        morph = compareTag(field.values, { label: config.labels?.[name] || name });
        break;
      default:
        morph = compareText(field.values, { label: config.labels?.[name] || name });
    }
    
    fieldEl.appendChild(morph);
    el.appendChild(fieldEl);
  });
  
  return el;
}

export default {
  renderFieldMorph,
  renderMetricsComposite,
  renderRangesComposite,
  renderProfileComposite,
  renderTimelineComposite,
  renderCategoriesComposite
};
