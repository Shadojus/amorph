/**
 * Semantische Suche basierend auf Schema
 * Lädt Suchregeln aus config/schema.yaml statt hardcoded
 */

import { debug } from '../observer/debug.js';

// Schema-Cache
let schemaCache = null;

// Morphs-Config Cache (für Farben, Badge-Keywords etc.)
let morphsConfigCache = null;

/**
 * Schema setzen (wird von außen aufgerufen nach Config-Load)
 */
export function setSchema(schema) {
  schemaCache = schema;
  debug.search('Schema loaded', { 
    fields: Object.keys(schema?.felder || {}),
    semantics: Object.keys(schema?.semantik || {}),
    perspectives: Object.keys(schema?.perspektiven || {}),
    meta: schema?.meta
  });
}

/**
 * Schema abrufen
 */
export function getSchema() {
  return schemaCache;
}

/**
 * Meta-Konfiguration aus Schema holen
 * Definiert welche Felder spezielle Bedeutung haben
 * @returns {Object} { nameField, idField, bildField }
 */
export function getSchemaMeta() {
  return schemaCache?.meta || {
    nameField: 'name',    // Fallback: 'name'
    idField: 'id',        // Fallback: 'id'
    bildField: 'bild'     // Fallback: 'bild'
  };
}

/**
 * Holt den Namen eines Items basierend auf Schema-Meta-Config
 * @param {Object} item - Das Daten-Item
 * @returns {string} Der Name des Items
 */
export function getItemName(item) {
  if (!item) return '';
  const meta = getSchemaMeta();
  const name = item[meta.nameField] || item.name || item.titel || item.id || '';
  // Verhindere dass String "undefined" zurückgegeben wird
  return name === undefined || name === 'undefined' ? '' : String(name);
}

/**
 * Holt die ID eines Items basierend auf Schema-Meta-Config
 * @param {Object} item - Das Daten-Item
 * @returns {string|number} Die ID des Items
 */
export function getItemId(item) {
  if (!item) return '';
  const meta = getSchemaMeta();
  return item[meta.idField] || item.id || '';
}

/**
 * Feld-Reihenfolge aus Schema holen
 * @returns {string[]} Array der Feldnamen in definierter Reihenfolge
 */
export function getFeldReihenfolge() {
  if (!schemaCache?.reihenfolge) {
    // Fallback: Felder-Keys aus Schema
    return Object.keys(schemaCache?.felder || {});
  }
  return schemaCache.reihenfolge;
}

/**
 * Sortiert ein Objekt nach der Schema-Reihenfolge
 * @param {Object} obj - Das zu sortierende Objekt  
 * @returns {Array<[string, any]>} Sortierte Einträge [key, value]
 */
export function sortBySchemaOrder(obj) {
  const reihenfolge = getFeldReihenfolge();
  const entries = Object.entries(obj);
  
  return entries.sort((a, b) => {
    const indexA = reihenfolge.indexOf(a[0]);
    const indexB = reihenfolge.indexOf(b[0]);
    
    // Nicht definierte Felder ans Ende
    const posA = indexA === -1 ? 999 : indexA;
    const posB = indexB === -1 ? 999 : indexB;
    
    return posA - posB;
  });
}

/**
 * Semantische Suche mit Schema-basiertem Scoring
 * @param {Object} item - Das zu bewertende Item
 * @param {string} query - Die Suchanfrage
 * @returns {{ score: number, matches: string[] }}
 */
export function semanticScore(item, query) {
  if (!schemaCache?.semantik) {
    debug.warn('Semantics: No schema loaded!');
    return { score: 0, matches: [] };
  }
  
  let score = 0;
  const matchedTerms = new Set();
  const q = query.toLowerCase();
  
  debug.search('Semantic analysis starting', { 
    item: item.name || item.id, 
    query: q,
    rules: Object.keys(schemaCache.semantik).length
  });
  
  // Durch alle semantischen Regeln iterieren
  for (const [regelName, regel] of Object.entries(schemaCache.semantik)) {
    // Prüfe ob Query eines der Keywords enthält
    const keywords = regel.keywords || [];
    const keywordMatch = keywords.some(kw => q.includes(kw.toLowerCase()));
    
    if (!keywordMatch) continue;
    
    const feld = regel.feld;
    const feldWert = item[feld];
    
    if (feldWert === undefined || feldWert === null) continue;
    
    // Verschiedene Matching-Strategien
    let matched = false;
    
    // Strategie 1: Exakte Werte
    if (regel.werte) {
      const wertLower = String(feldWert).toLowerCase();
      for (const erlaubterWert of regel.werte) {
        if (wertLower === erlaubterWert.toLowerCase()) {
          matched = true;
          matchedTerms.add(String(feldWert));
          break;
        }
      }
    }
    
    // Strategie 2: Enthält (für Listen oder Strings)
    if (regel.enthält) {
      const suchTexte = Array.isArray(feldWert) 
        ? feldWert.map(v => String(v).toLowerCase())
        : [String(feldWert).toLowerCase()];
      
      for (const suchText of suchTexte) {
        for (const muster of regel.enthält) {
          if (suchText.includes(muster.toLowerCase())) {
            matched = true;
            // Originalen Wert finden
            if (Array.isArray(feldWert)) {
              for (const v of feldWert) {
                if (String(v).toLowerCase().includes(muster.toLowerCase())) {
                  matchedTerms.add(String(v));
                }
              }
            } else {
              matchedTerms.add(String(feldWert));
            }
          }
        }
      }
    }
    
    // Strategie 3: Existiert (für Listen wie "verwechslung")
    if (regel.existiert) {
      if (Array.isArray(feldWert) && feldWert.length > 0) {
        matched = true;
        for (const v of feldWert) {
          matchedTerms.add(String(v));
        }
      } else if (feldWert) {
        matched = true;
        matchedTerms.add(String(feldWert));
      }
    }
    
    // Strategie 4: Aktuell (für Saison/Datum)
    if (regel.aktuell) {
      const aktuellerMonat = new Date().toLocaleString('de-DE', { month: 'long' }).toLowerCase();
      const feldLower = String(feldWert).toLowerCase();
      
      if (feldLower.includes(aktuellerMonat) || feldLower.includes('ganzjährig')) {
        matched = true;
        matchedTerms.add(String(feldWert));
      }
    }
    
    // Score addieren wenn gematcht
    if (matched) {
      score += regel.score || 30;
      debug.search(`Semantic match: ${regelName}`, { 
        feld, 
        score: regel.score || 30,
        matches: [...matchedTerms].slice(-3)
      });
    }
  }
  
  // Ergebnis loggen
  if (score > 0) {
    debug.search('Semantic result', { 
      item: item.name || item.id, 
      totalScore: score, 
      matchCount: matchedTerms.size 
    });
  }
  
  return { score, matches: [...matchedTerms] };
}

/**
 * Gibt Perspektiven-Keywords aus Schema zurück
 */
export function getPerspektivenKeywords() {
  if (!schemaCache?.perspektiven) {
    debug.warn('Perspectives: No schema loaded!');
    return {};
  }
  
  const result = {};
  for (const [id, config] of Object.entries(schemaCache.perspektiven)) {
    result[id] = config.keywords || [];
    // Debug: Show keywords per perspective
    if (result[id].length > 0) {
      debug.perspectives(`Keywords for ${id}`, { 
        count: result[id].length,
        first3: result[id].slice(0, 3)
      });
    }
  }
  debug.perspectives('Keywords from schema loaded', { 
    count: Object.keys(result).length,
    perspectives: Object.keys(result),
    withKeywords: Object.entries(result).filter(([k, v]) => v.length > 0).map(([k]) => k)
  });
  return result;
}

/**
 * Gibt Perspektiven-Liste für Features zurück
 */
export function getPerspektivenListe() {
  if (!schemaCache?.perspektiven) {
    debug.warn('Perspective list: No schema loaded!');
    return [];
  }
  
  const liste = Object.entries(schemaCache.perspektiven).map(([id, config]) => {
    // Unterstütze englisch (colors/color) und deutsch (farben/farbe)
    const farben = config.colors || config.farben || (config.color ? [config.color] : null) || (config.farbe ? [config.farbe] : null);
    return {
      id,
      name: config.name || id,
      symbol: config.symbol || '',
      farbe: farben ? farben[0] : null, // Hauptfarbe für Kompatibilität
      farben: farben, // Vollständiges Farb-Grid
      felder: config.fields || config.felder || [],
      morphs: config.morphs || {} // Perspektiven-spezifische Morph-Configs
    };
  });
  
  debug.perspectives('List from schema', { count: liste.length });
  return liste;
}

/**
 * Holt eine einzelne Perspektive nach ID
 * @param {string} perspId - Perspektiven-ID
 * @returns {Object|null} Perspektive oder null
 */
export function getPerspektive(perspId) {
  const liste = getPerspektivenListe();
  return liste.find(p => p.id === perspId) || null;
}

/**
 * Holt Perspektiven-spezifische Morph-Config für ein Feld
 * @param {string} feldName - Name des Feldes
 * @param {string[]} aktivePerspektiven - Array der aktiven Perspektiven-IDs
 * @returns {Object|null} Morph-Config oder null
 */
export function getPerspektivenMorphConfig(feldName, aktivePerspektiven = []) {
  debug.semantic('getPerspektivenMorphConfig', {
    feldName,
    aktivePerspektiven,
    hatSchema: !!schemaCache?.perspektiven
  });
  
  if (!schemaCache?.perspektiven || !aktivePerspektiven.length) {
    debug.semantic('No perspectives or no schema');
    return null;
  }
  
  // Priorisiere erste aktive Perspektive die eine Config für dieses Feld hat
  for (const perspId of aktivePerspektiven) {
    const persp = schemaCache.perspektiven[perspId];
    debug.semantic('Checking perspective', {
      perspId,
      hasPerspective: !!persp,
      hasMorphs: !!persp?.morphs,
      morphsForField: persp?.morphs?.[feldName]
    });
    
    if (persp?.morphs?.[feldName]) {
      const result = {
        ...persp.morphs[feldName],
        perspektive: perspId,
        farben: persp.farben
      };
      debug.semantic('Morph config found', result);
      debug.perspectives('Morph config found', { fieldName: feldName, perspective: perspId, config: persp.morphs[feldName] });
      return result;
    }
  }
  
  debug.semantic('No morph config for field', { fieldName: feldName });
  return null;
}

/**
 * Holt ALLE Perspektiven-Farben für ein Feld (Multi-Perspektiven Support)
 * Sammelt alle aktiven Perspektiven die dieses Feld enthalten
 * @param {string} feldName - Name des Feldes
 * @param {string[]} aktivePerspektiven - Array der aktiven Perspektiven-IDs
 * @returns {Object} { perspektiven: [{id, farben, hauptfarbe}], isMulti: boolean }
 */
export function getAllePerspektivenFarben(feldName, aktivePerspektiven = []) {
  const result = {
    perspektiven: [],
    isMulti: false
  };
  
  if (!schemaCache?.perspektiven || !aktivePerspektiven.length) {
    return result;
  }
  
  // Sammle alle Perspektiven die dieses Feld enthalten
  for (const perspId of aktivePerspektiven) {
    const persp = schemaCache.perspektiven[perspId];
    if (!persp) continue;
    
    // Prüfe ob Feld in dieser Perspektive enthalten ist
    const felder = persp.felder || [];
    if (felder.includes(feldName)) {
      const farben = persp.farben || (persp.farbe ? [persp.farbe] : ['#808080']);
      result.perspektiven.push({
        id: perspId,
        name: persp.name || perspId,
        farben: farben,
        hauptfarbe: farben[0]
      });
    }
  }
  
  result.isMulti = result.perspektiven.length > 1;
  
  debug.semantic('All perspective colors', { 
    fieldName: feldName, 
    count: result.perspektiven.length, 
    isMulti: result.isMulti, 
    perspectives: result.perspektiven.map(p => p.id) 
  });
  
  return result;
}

/**
 * Gibt Suchfelder mit Gewichtung zurück
 */
export function getSuchfelder() {
  if (!schemaCache?.felder) {
    debug.warn('Search fields: No schema loaded!');
    return {};
  }
  
  const result = {};
  for (const [name, config] of Object.entries(schemaCache.felder)) {
    if (config.suche) {
      result[name] = {
        gewicht: config.suche.gewicht || 10,
        exakt: config.suche.exakt || false
      };
    }
  }
  debug.search('Search fields from schema', { 
    count: Object.keys(result).length,
    fields: Object.keys(result)
  });
  return result;
}

/**
 * Gibt Feld→Morph Mappings aus Schema zurück
 * Ersetzt morphs.yaml/felder
 */
export function getFeldMorphs() {
  if (!schemaCache?.felder) {
    debug.warn('Field morphs: No schema loaded!');
    return {};
  }
  
  const result = {};
  for (const [name, config] of Object.entries(schemaCache.felder)) {
    if (config.typ) {
      result[name] = config.typ;
    }
  }
  debug.morphs('Field morphs from schema', { 
    count: Object.keys(result).length,
    fields: Object.keys(result)
  });
  return result;
}

/**
 * Gibt versteckte Felder aus Schema zurück
 */
export function getVersteckteFelder() {
  if (!schemaCache?.felder) return [];
  
  const result = [];
  for (const [name, config] of Object.entries(schemaCache.felder)) {
    if (config.versteckt) {
      result.push(name);
    }
  }
  return result;
}

/**
 * Gibt Feld-spezifische Config aus Schema zurück
 * DATA-DRIVEN: If not in schema, infers METADATA (not type!) from field name
 * Type detection is handled by pipeline.js using morphs.yaml
 * This function provides: label, unit, colors - NOT the morph type
 */
export function getFeldConfig(feldname) {
  // 1. Check schema cache first (from basis.yaml kern fields)
  if (schemaCache?.felder?.[feldname]) {
    return schemaCache.felder[feldname];
  }
  
  // 2. DATA-DRIVEN: Infer metadata from field name patterns
  // NOTE: We do NOT infer 'typ' here - that's pipeline.js's job via morphs.yaml
  const inferred = inferFeldMetadata(feldname);
  if (inferred) {
    return inferred;
  }
  
  // 3. Return empty config as fallback
  return {};
}

/**
 * DATA-DRIVEN: Infer field METADATA from field name patterns
 * This provides labels, units, hints - but NOT the morph type!
 * Morph type detection is centralized in pipeline.js using morphs.yaml
 */
function inferFeldMetadata(feldname) {
  const name = feldname.toLowerCase();
  const metadata = {};
  
  // Generate human-readable label from field name
  metadata.label = feldname
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
  
  // Infer units from field name patterns
  if (name.includes('temp') || name.includes('temperatur')) {
    metadata.einheit = '°C';
  } else if (name.includes('_days') || name.includes('_tage') || name.includes('duration_d')) {
    metadata.einheit = 'days';
  } else if (name.includes('_hours') || name.includes('_stunden') || name.includes('_h')) {
    metadata.einheit = 'h';
  } else if (name.includes('_kg')) {
    metadata.einheit = 'kg';
  } else if (name.includes('_g') && !name.includes('_gr')) {
    metadata.einheit = 'g';
  } else if (name.includes('_mm')) {
    metadata.einheit = 'mm';
  } else if (name.includes('_cm')) {
    metadata.einheit = 'cm';
  } else if (name.includes('_m2') || name.includes('_sqm')) {
    metadata.einheit = 'm²';
  } else if (name.includes('_km')) {
    metadata.einheit = 'km';
  } else if (name.includes('percent') || name.includes('prozent') || name.includes('_pct')) {
    metadata.einheit = '%';
  } else if (name.includes('_ppm')) {
    metadata.einheit = 'ppm';
  } else if (name.includes('_lux')) {
    metadata.einheit = 'lux';
  } else if (name.includes('_ph')) {
    metadata.einheit = 'pH';
  }
  
  // Infer max values for rating/progress fields (hints for morphs)
  if (name.includes('rating') || name.includes('score') || name.includes('bewertung')) {
    metadata.max = 10;
  } else if (name.includes('percent') || name.includes('prozent') || name.includes('efficiency')) {
    metadata.max = 100;
  }
  
  return metadata;
}

/**
 * Gibt alle Feld-Configs aus Schema zurück
 */
export function getAlleFeldConfigs() {
  if (!schemaCache?.felder) return {};
  return schemaCache.felder;
}

// ========== MORPHS-CONFIG FUNKTIONEN ==========

/**
 * Morphs-Config setzen (wird von außen aufgerufen nach Config-Load)
 * Enthält Erkennungsregeln, Farben, Badge-Config etc.
 */
export function setMorphsConfig(config) {
  morphsConfigCache = config;
  debug.morphs('Morphs config loaded', { 
    hasColors: !!config?.farben,
    hasDetection: !!config?.erkennung
  });
}

/**
 * Gibt Farb-Palette aus morphs.yaml zurück
 * @param {string} palette - Name der Palette ('fungi', 'diagramme', 'standard')
 * @returns {string[]|string|null} Farb-Array oder einzelne Farbe
 */
export function getFarben(palette = 'fungi') {
  if (!morphsConfigCache?.farben) {
    debug.warn('getFarben: No morphs config loaded!');
    return null;
  }
  
  const farben = morphsConfigCache.farben[palette];
  debug.morphs('Colors loaded', { palette, count: Array.isArray(farben) ? farben.length : 1 });
  return farben;
}

/**
 * Gibt Badge-Konfiguration aus morphs.yaml zurück
 * Enthält variants (String → Variant-Name) und colors (Variant → Farben)
 * @returns {Object|null} { variants: {...}, colors: {...} }
 */
export function getBadgeConfig() {
  if (!morphsConfigCache) {
    debug.warn('getBadgeConfig: No morphs config loaded!');
    return null;
  }
  
  // Badge-Config liegt direkt unter morphsConfigCache.badge
  const badgeCfg = morphsConfigCache.badge;
  if (!badgeCfg) {
    debug.morphs('Badge config not found in morphs.yaml, using fallbacks');
    return null;
  }
  
  debug.morphs('Badge config loaded', { 
    variants: Object.keys(badgeCfg.variants || {}),
    colors: Object.keys(badgeCfg.colors || {})
  });
  
  return {
    variants: badgeCfg.variants || null,
    colors: badgeCfg.colors || null
  };
}
