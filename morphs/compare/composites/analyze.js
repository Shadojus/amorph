/**
 * ANALYZE - Datenanalyse-Funktionen
 * 
 * Analysiert Items und extrahiert Struktur-Informationen.
 * 100% DATENGETRIEBEN - keine Annahmen über Feldnamen!
 */

import { debug } from '../../../observer/debug.js';
import { detectType } from '../base.js';
import { TYPE_TO_CATEGORY } from './types.js';

/**
 * Analysiert Items und gruppiert Felder nach Kategorie
 * 
 * @param {Array} items - [{id, name, data, farbe}] - data enthält alle Felder
 * @returns {Object} { fields, categories }
 * 
 * DATENGETRIEBEN:
 * - Typ wird aus Datenstruktur erkannt (detectType)
 * - Kategorie wird aus Typ abgeleitet
 * - Keine hardcodierten Feldnamen
 */
export function analyzeItems(items) {
  if (!items?.length) return { fields: {}, categories: {} };
  
  // Alle Felder aus erstem Item extrahieren (Struktur-Definition)
  const firstData = items[0]?.data || {};
  const fields = {};
  const categories = {};
  
  Object.entries(firstData).forEach(([feldName, wert]) => {
    const typ = detectType(wert);
    const category = TYPE_TO_CATEGORY[typ] || 'textual';
    
    fields[feldName] = {
      name: feldName,
      typ,
      category,
      // Sammle alle Werte für dieses Feld
      values: items.map(item => ({
        id: item.id,
        name: item.name,
        wert: item.data?.[feldName],
        farbe: item.farbe
      }))
    };
    
    // Nach Kategorie gruppieren
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(feldName);
  });
  
  debug.compare('Items analysiert', {
    felder: Object.keys(fields).length,
    kategorien: Object.keys(categories)
  });
  
  return { fields, categories };
}

/**
 * Erkennt semantisch zusammengehörige Felder
 * 
 * DATENGETRIEBEN:
 * - Gruppiert nach TYPE_CATEGORY, nicht nach Feldnamen
 * - "bewertung" + "beliebtheit" = beide numeric → zusammen
 */
export function findRelatedFields(fields) {
  const groups = [];
  const used = new Set();
  
  // Gruppe 1: Alle numerischen Felder zusammen
  const numericFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'numeric')
    .map(([name]) => name);
  
  if (numericFields.length > 1) {
    groups.push({
      type: 'metrics',
      label: 'Metriken',
      fields: numericFields
    });
    numericFields.forEach(f => used.add(f));
  }
  
  // Gruppe 2: Ranges zusammen (Temperatur, etc.)
  const rangeFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'ranges')
    .map(([name]) => name);
  
  if (rangeFields.length >= 1) {
    groups.push({
      type: 'ranges',
      label: 'Bereiche',
      fields: rangeFields
    });
    rangeFields.forEach(f => used.add(f));
  }
  
  // Gruppe 3: Multidimensionale Daten (Radar, Pie)
  const multidimFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'multidim')
    .map(([name]) => name);
  
  if (multidimFields.length >= 1) {
    groups.push({
      type: 'profile',
      label: 'Profile',
      fields: multidimFields
    });
    multidimFields.forEach(f => used.add(f));
  }
  
  // Gruppe 4: Sequentielle Daten
  const seqFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'sequential')
    .map(([name]) => name);
  
  if (seqFields.length >= 1) {
    groups.push({
      type: 'timeline',
      label: 'Zeitverläufe',
      fields: seqFields
    });
    seqFields.forEach(f => used.add(f));
  }
  
  // Gruppe 5: Kategorische Daten
  const catFields = Object.entries(fields)
    .filter(([_, f]) => f.category === 'categorical')
    .map(([name]) => name);
  
  if (catFields.length >= 1) {
    groups.push({
      type: 'categories',
      label: 'Eigenschaften',
      fields: catFields
    });
    catFields.forEach(f => used.add(f));
  }
  
  // Rest: Einzelne Felder die nicht gruppiert wurden
  Object.keys(fields).forEach(name => {
    if (!used.has(name)) {
      groups.push({
        type: 'single',
        label: fields[name].name,
        fields: [name]
      });
    }
  });
  
  return groups;
}

/**
 * Berechnet Unterschiede zwischen Items
 * 
 * @returns {Object} { same, different, unique }
 */
export function calculateDiff(items) {
  if (items.length < 2) return null;
  
  const { fields } = analyzeItems(items);
  const diff = {
    same: [],      // Felder mit identischen Werten
    different: [], // Felder mit unterschiedlichen Werten
    unique: []     // Felder die nur bei einem Item existieren
  };
  
  Object.entries(fields).forEach(([name, field]) => {
    const values = field.values.map(v => JSON.stringify(v.wert));
    const uniqueValues = new Set(values);
    
    if (uniqueValues.size === 1) {
      diff.same.push(name);
    } else if (values.some(v => v === 'undefined' || v === 'null')) {
      diff.unique.push(name);
    } else {
      diff.different.push(name);
    }
  });
  
  return diff;
}

export default {
  analyzeItems,
  findRelatedFields,
  calculateDiff
};
