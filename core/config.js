/**
 * Konfigurationsloader
 * Lädt alle YAML-Dateien aus dem Config-Ordner
 */

import { debug } from '../observer/debug.js';

const CONFIG_FILES = [
  'manifest.yaml',
  'daten.yaml',
  'morphs.yaml',
  'observer.yaml',
  'features.yaml',
  'schema.yaml'
];

export async function loadConfig(basePath = './config/') {
  debug.config('Lade Konfiguration', { basePath });
  const config = {};
  
  // Cache-Busting: Timestamp anhängen um Browser-Cache zu umgehen
  const cacheBuster = `?t=${Date.now()}`;
  
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
  
  validateConfig(config);
  replaceEnvVars(config);
  debug.config('Alle Configs geladen', { dateien: Object.keys(config) });
  return config;
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
  // Inline-Kommentare entfernen (aber nicht in Strings)
  if (!value.startsWith('"') && !value.startsWith("'")) {
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
