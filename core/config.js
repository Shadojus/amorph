/**
 * Konfigurationsloader
 * Lädt alle YAML-Dateien aus dem Config-Ordner
 * Unterstützt modulares Schema-System aus schema/ Ordner
 * 
 * DATA-DRIVEN ARCHITECTURE:
 * - Field definitions are derived from actual data + perspectives
 * - No separate felder.yaml needed - schemas define everything
 * - Field order comes from perspectives
 */

import { debug } from '../observer/debug.js';

const CONFIG_FILES = [
  'manifest.yaml',
  'daten.yaml',
  'morphs.yaml',
  'observer.yaml',
  'features.yaml'
  // schema is loaded separately (modular from perspectives)
];

// Schema modules in schema/ folder (felder.yaml removed - data-driven)
const SCHEMA_MODULES = [
  'basis.yaml',
  'semantik.yaml'
];

export async function loadConfig(basePath = './config/') {
  debug.config('Lade Konfiguration', { basePath });
  const config = {};
  
  // Cache-Busting: Timestamp anhängen um Browser-Cache zu umgehen
  const cacheBuster = `?t=${Date.now()}`;
  
  // Standard Config-Dateien laden
  for (const file of CONFIG_FILES) {
    const name = file.replace('.yaml', '');
    try {
      debug.config(`Lade ${file}...`);
      const response = await fetch(basePath + file + cacheBuster);
      if (!response.ok) {
        if (name === 'manifest' || name === 'daten') {
          throw new Error(`Pflichtdatei fehlt: ${file}`);
        }
        debug.warn(`Optional: ${file} nicht gefunden`);
        continue;
      }
      const text = await response.text();
      config[name] = parseYAML(text);
      debug.config(`${file} geladen`, { keys: Object.keys(config[name]) });
    } catch (e) {
      if (name === 'manifest' || name === 'daten') {
        debug.fehler(`Fehler beim Laden von ${file}`, e);
        throw e;
      }
    }
  }
  
  // Schema modular laden
  config.schema = await loadSchemaModular(basePath, cacheBuster);
  
  validateConfig(config);
  replaceEnvVars(config);
  debug.config('Alle Configs geladen', { dateien: Object.keys(config) });
  return config;
}

/**
 * Lädt Schema modular aus schema/ Ordner
 * DATA-DRIVEN: Field definitions derived from perspectives + data
 * No felder.yaml needed - perspectives define their fields
 */
async function loadSchemaModular(basePath, cacheBuster) {
  const schemaPath = basePath + 'schema/';
  const schema = {
    meta: {},
    kern: {},
    felder: {},
    reihenfolge: [],
    semantik: {},
    perspektiven: {}
  };
  
  // Track if modular loading succeeded
  let modularLoaded = false;
  
  // 1. Load basis.yaml (core definitions)
  try {
    const basisResp = await fetch(schemaPath + 'basis.yaml' + cacheBuster);
    if (basisResp.ok) {
      const basis = parseYAML(await basisResp.text());
      schema.meta = basis.meta || {};
      schema.kern = basis.kern || {};
      schema.erkennung = basis.erkennung || {};
      if (basis.standard_reihenfolge) {
        schema.reihenfolge = basis.standard_reihenfolge;
      }
      modularLoaded = true;
      debug.config('Schema: basis.yaml loaded');
    }
  } catch (e) {
    debug.warn('Schema: basis.yaml not found');
  }
  
  // 2. Load semantik.yaml (search mappings)
  try {
    const semantikResp = await fetch(schemaPath + 'semantik.yaml' + cacheBuster);
    if (semantikResp.ok) {
      const semantik = parseYAML(await semantikResp.text());
      schema.semantik = semantik.semantik || {};
      debug.config('Schema: semantik.yaml loaded');
    }
  } catch (e) {
    debug.warn('Schema: semantik.yaml not found');
  }
  
  // 3. Load perspectives (from perspektiven/index.yaml)
  // Perspectives define their own fields - this is the data-driven approach
  const allPerspectiveFields = new Set();
  
  try {
    const indexResp = await fetch(schemaPath + 'perspektiven/index.yaml' + cacheBuster);
    if (indexResp.ok) {
      const indexData = parseYAML(await indexResp.text());
      const aktivePerspektiven = indexData.aktiv || [];
      
      for (const pId of aktivePerspektiven) {
        try {
          const pResp = await fetch(schemaPath + 'perspektiven/' + pId + '.yaml' + cacheBuster);
          if (pResp.ok) {
            const perspektive = parseYAML(await pResp.text());
            
            // Use 'fields' or 'felder' (supporting both English and German)
            const fields = perspektive.fields || perspektive.felder || [];
            
            // Use 'colors' or 'farben' (supporting both)
            const colors = perspektive.colors || perspektive.farben || [];
            
            schema.perspektiven[pId] = {
              id: perspektive.id || pId,
              name: perspektive.name,
              symbol: perspektive.symbol,
              farben: colors,
              felder: fields,
              keywords: perspektive.keywords || [],
              // Store enumerations if defined in perspective
              enumerations: perspektive.enumerations || perspektive.enumerationen || {}
            };
            
            // Collect all fields from this perspective
            fields.forEach(f => allPerspectiveFields.add(f));
            
            debug.config(`Schema: Perspective ${pId} loaded`, { fields: fields.length });
          }
        } catch (e) {
          debug.warn(`Schema: Perspective ${pId} not found`);
        }
      }
    }
  } catch (e) {
    debug.warn('Schema: perspektiven/index.yaml not found');
  }
  
  // 4. Build field order from perspectives (data-driven)
  // Perspective fields come first, in order they appear
  if (allPerspectiveFields.size > 0) {
    schema.reihenfolge = Array.from(allPerspectiveFields);
    debug.config('Schema: Field order derived from perspectives', { 
      count: schema.reihenfolge.length 
    });
  }
  
  // 5. Kern fields become base felder (from basis.yaml)
  schema.felder = { ...schema.kern };
  
  // Fallback: If modular loading failed, try schema.yaml
  if (!modularLoaded) {
    debug.config('Schema: Fallback to schema.yaml');
    try {
      const schemaResp = await fetch(basePath + 'schema.yaml' + cacheBuster);
      if (schemaResp.ok) {
        const legacySchema = parseYAML(await schemaResp.text());
        return legacySchema;
      }
    } catch (e) {
      debug.warn('Schema: schema.yaml also not found');
    }
  }
  
  debug.config('Schema loaded (data-driven)', { 
    felder: Object.keys(schema.felder).length,
    perspektiven: Object.keys(schema.perspektiven).length,
    totalFields: allPerspectiveFields.size
  });
  
  return schema;
}

function parseYAML(text) {
  const lines = text.split('\n')
    .map((line, i) => ({ raw: line, num: i }))
    .filter(l => l.raw.trim() !== '' && !l.raw.trim().startsWith('#'));
  
  let idx = 0;
  
  function parseLevel(minIndent) {
    const result = {};
    
    while (idx < lines.length) {
      const line = lines[idx].raw;
      const indent = line.search(/\S/);
      
      // Wenn Einrückung kleiner als erwartet, zurück zur höheren Ebene
      if (indent < minIndent) {
        return result;
      }
      
      const content = line.trim();
      
      if (content.startsWith('- ')) {
        // Array-Element - sollte von parseArray behandelt werden
        return result;
      }
      
      if (content.includes(':')) {
        const colonIdx = content.indexOf(':');
        const key = content.slice(0, colonIdx).trim();
        const valueStr = content.slice(colonIdx + 1).trim();
        
        if (valueStr === '') {
          // Schaue was als nächstes kommt
          idx++;
          if (idx < lines.length) {
            const nextLine = lines[idx].raw;
            const nextIndent = nextLine.search(/\S/);
            const nextContent = nextLine.trim();
            
            if (nextIndent > indent && nextContent.startsWith('- ')) {
              // Es ist ein Array
              result[key] = parseArray(nextIndent);
            } else if (nextIndent > indent) {
              // Es ist ein verschachteltes Objekt
              result[key] = parseLevel(nextIndent);
            } else {
              // Leeres Objekt, nächste Zeile gehört nicht dazu
              result[key] = {};
            }
          } else {
            result[key] = {};
          }
        } else {
          // Direkter Wert
          result[key] = parseValue(valueStr);
          idx++;
        }
      } else {
        idx++;
      }
    }
    
    return result;
  }
  
  function parseArray(minIndent) {
    const arr = [];
    
    while (idx < lines.length) {
      const line = lines[idx].raw;
      const indent = line.search(/\S/);
      
      if (indent < minIndent) {
        return arr;
      }
      
      const content = line.trim();
      
      if (content.startsWith('- ')) {
        const value = content.slice(2).trim();
        
        if (value === '') {
          // Array-Element ist ein Objekt
          idx++;
          if (idx < lines.length) {
            const nextIndent = lines[idx].raw.search(/\S/);
            if (nextIndent > indent) {
              arr.push(parseLevel(nextIndent));
            } else {
              arr.push({});
            }
          } else {
            arr.push({});
          }
        } else if (value.includes(': ')) {
          // Inline-Objekt im Array
          const colonIdx = value.indexOf(': ');
          const k = value.slice(0, colonIdx).trim();
          const v = value.slice(colonIdx + 2).trim();
          const obj = { [k]: parseValue(v) };
          
          // Prüfe ob weitere Properties folgen
          idx++;
          if (idx < lines.length) {
            const nextIndent = lines[idx].raw.search(/\S/);
            if (nextIndent > indent && !lines[idx].raw.trim().startsWith('- ')) {
              Object.assign(obj, parseLevel(nextIndent));
            }
          }
          arr.push(obj);
        } else {
          // Einfacher Wert
          arr.push(parseValue(value));
          idx++;
        }
      } else {
        // Keine Array-Zeile mehr
        return arr;
      }
    }
    
    return arr;
  }
  
  return parseLevel(0);
}

function parseValue(value) {
  // Inline-Kommentare entfernen
  // Bei quoted Strings: Kommentar NACH dem String entfernen
  if (value.startsWith('"') || value.startsWith("'")) {
    const quote = value[0];
    const endQuoteIdx = value.indexOf(quote, 1);
    if (endQuoteIdx > 0) {
      // Alles nach dem schließenden Quote entfernen
      value = value.slice(0, endQuoteIdx + 1);
    }
  } else {
    // Unquoted: Kommentar entfernen
    const commentIdx = value.indexOf(' #');
    if (commentIdx > 0) {
      value = value.slice(0, commentIdx).trim();
    }
  }
  
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (!isNaN(value) && value !== '') return Number(value);
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  return value;
}

function validateConfig(config) {
  debug.config('Validiere Config...');
  if (!config.manifest?.name) {
    debug.fehler('Validierung fehlgeschlagen: manifest.name fehlt');
    throw new Error('manifest.yaml: name fehlt');
  }
  if (!config.daten?.quelle) {
    debug.fehler('Validierung fehlgeschlagen: daten.quelle fehlt');
    throw new Error('daten.yaml: quelle fehlt');
  }
  debug.config('Validierung OK');
}

function replaceEnvVars(obj) {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/\$\{(\w+)\}/g, (_, name) => {
        return globalThis[name] || '';
      });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      replaceEnvVars(obj[key]);
    }
  }
}
