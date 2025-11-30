/**
 * Semantische Suche basierend auf Schema
 * Lädt Suchregeln aus config/schema.yaml statt hardcoded
 */

import { debug } from '../observer/debug.js';

// Schema-Cache
let schemaCache = null;

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
      felder: config.felder || []
    };
  });
  
  debug.perspektiven('Liste aus Schema', { anzahl: liste.length });
  return liste;
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
