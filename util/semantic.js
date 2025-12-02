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
  debug.suche('Schema geladen', { 
    felder: Object.keys(schema?.felder || {}),
    semantik: Object.keys(schema?.semantik || {}),
    perspektiven: Object.keys(schema?.perspektiven || {})
  });
}

/**
 * Schema abrufen
 */
export function getSchema() {
  return schemaCache;
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
    debug.warn('Semantik: Kein Schema geladen!');
    return { score: 0, matches: [] };
  }
  
  let score = 0;
  const matchedTerms = new Set();
  const q = query.toLowerCase();
  
  debug.suche('Semantik-Analyse startet', { 
    item: item.name || item.id, 
    query: q,
    regeln: Object.keys(schemaCache.semantik).length
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
      debug.suche(`Semantik-Match: ${regelName}`, { 
        feld, 
        score: regel.score || 30,
        matches: [...matchedTerms].slice(-3)
      });
    }
  }
  
  // Ergebnis loggen
  if (score > 0) {
    debug.suche('Semantik-Ergebnis', { 
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
    debug.warn('Perspektiven: Kein Schema geladen!');
    return {};
  }
  
  const result = {};
  for (const [id, config] of Object.entries(schemaCache.perspektiven)) {
    result[id] = config.keywords || [];
  }
  debug.perspektiven('Keywords aus Schema geladen', { 
    anzahl: Object.keys(result).length,
    perspektiven: Object.keys(result)
  });
  return result;
}

/**
 * Gibt Perspektiven-Liste für Features zurück
 */
export function getPerspektivenListe() {
  if (!schemaCache?.perspektiven) {
    debug.warn('Perspektiven-Liste: Kein Schema geladen!');
    return [];
  }
  
  const liste = Object.entries(schemaCache.perspektiven).map(([id, config]) => {
    // Unterstütze sowohl `farben` (Array) als auch `farbe` (String) für Kompatibilität
    const farben = config.farben || (config.farbe ? [config.farbe] : null);
    return {
      id,
      name: config.name || id,
      symbol: config.symbol || '',
      farbe: farben ? farben[0] : null, // Hauptfarbe für Kompatibilität
      farben: farben, // Vollständiges Farb-Grid
      felder: config.felder || [],
      morphs: config.morphs || {} // Perspektiven-spezifische Morph-Configs
    };
  });
  
  debug.perspektiven('Liste aus Schema', { anzahl: liste.length });
  return liste;
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
    debug.semantic('Keine Perspektiven oder kein Schema');
    return null;
  }
  
  // Priorisiere erste aktive Perspektive die eine Config für dieses Feld hat
  for (const perspId of aktivePerspektiven) {
    const persp = schemaCache.perspektiven[perspId];
    debug.semantic('Prüfe Perspektive', {
      perspId,
      hatPerspektive: !!persp,
      hatMorphs: !!persp?.morphs,
      morphsFürFeld: persp?.morphs?.[feldName]
    });
    
    if (persp?.morphs?.[feldName]) {
      const result = {
        ...persp.morphs[feldName],
        perspektive: perspId,
        farben: persp.farben
      };
      debug.semantic('Morph-Config gefunden', result);
      debug.perspektiven('Morph-Config gefunden', { feldName, perspektive: perspId, config: persp.morphs[feldName] });
      return result;
    }
  }
  
  debug.semantic('Keine Morph-Config für Feld', { feldName });
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
  
  debug.semantic('Alle Perspektiven-Farben', { 
    feldName, 
    anzahl: result.perspektiven.length, 
    isMulti: result.isMulti, 
    perspektiven: result.perspektiven.map(p => p.id) 
  });
  
  return result;
}

/**
 * Gibt Suchfelder mit Gewichtung zurück
 */
export function getSuchfelder() {
  if (!schemaCache?.felder) {
    debug.warn('Suchfelder: Kein Schema geladen!');
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
  debug.suche('Suchfelder aus Schema', { 
    anzahl: Object.keys(result).length,
    felder: Object.keys(result)
  });
  return result;
}

/**
 * Gibt Feld→Morph Mappings aus Schema zurück
 * Ersetzt morphs.yaml/felder
 */
export function getFeldMorphs() {
  if (!schemaCache?.felder) {
    debug.warn('Feld-Morphs: Kein Schema geladen!');
    return {};
  }
  
  const result = {};
  for (const [name, config] of Object.entries(schemaCache.felder)) {
    if (config.typ) {
      result[name] = config.typ;
    }
  }
  debug.morphs('Feld-Morphs aus Schema', { 
    anzahl: Object.keys(result).length,
    felder: Object.keys(result)
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
 * z.B. Farben für Tags, Einheit für Ranges
 */
export function getFeldConfig(feldname) {
  if (!schemaCache?.felder?.[feldname]) return {};
  return schemaCache.felder[feldname];
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
  debug.morphs('Morphs-Config geladen', { 
    hatFarben: !!config?.farben,
    hatErkennung: !!config?.erkennung
  });
}

/**
 * Gibt Farb-Palette aus morphs.yaml zurück
 * @param {string} palette - Name der Palette ('pilze', 'diagramme', 'standard')
 * @returns {string[]|string|null} Farb-Array oder einzelne Farbe
 */
export function getFarben(palette = 'pilze') {
  if (!morphsConfigCache?.farben) {
    debug.warn('getFarben: Keine Morphs-Config geladen!');
    return null;
  }
  
  const farben = morphsConfigCache.farben[palette];
  debug.morphs('Farben geladen', { palette, anzahl: Array.isArray(farben) ? farben.length : 1 });
  return farben;
}

/**
 * Gibt Badge-Konfiguration aus morphs.yaml zurück
 * Enthält variants (String → Variant-Name) und colors (Variant → Farben)
 * @returns {Object|null} { variants: {...}, colors: {...} }
 */
export function getBadgeConfig() {
  if (!morphsConfigCache) {
    debug.warn('getBadgeConfig: Keine Morphs-Config geladen!');
    return null;
  }
  
  // Badge-Config liegt direkt unter morphsConfigCache.badge
  const badgeCfg = morphsConfigCache.badge;
  if (!badgeCfg) {
    debug.morphs('Badge-Config nicht in morphs.yaml gefunden, nutze Fallbacks');
    return null;
  }
  
  debug.morphs('Badge-Config geladen', { 
    variants: Object.keys(badgeCfg.variants || {}),
    colors: Object.keys(badgeCfg.colors || {})
  });
  
  return {
    variants: badgeCfg.variants || null,
    colors: badgeCfg.colors || null
  };
}
