/**
 * Konfigurationsloader
 * Lädt alle YAML-Dateien aus dem Config-Ordner
 */

const CONFIG_FILES = [
  'manifest.yaml',
  'daten.yaml',
  'morphs.yaml',
  'observer.yaml',
  'features.yaml'
];

export async function loadConfig(basePath = './config/') {
  const config = {};
  
  for (const file of CONFIG_FILES) {
    const name = file.replace('.yaml', '');
    try {
      const response = await fetch(basePath + file);
      if (!response.ok) {
        if (name === 'manifest' || name === 'daten') {
          throw new Error(`Pflichtdatei fehlt: ${file}`);
        }
        continue;
      }
      const text = await response.text();
      config[name] = parseYAML(text);
    } catch (e) {
      if (name === 'manifest' || name === 'daten') {
        console.error(`Fehler beim Laden von ${file}:`, e);
        throw e;
      }
    }
  }
  
  validateConfig(config);
  replaceEnvVars(config);
  return config;
}

function parseYAML(text) {
  const result = {};
  const stack = [{ obj: result, indent: -1 }];
  
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    
    const indent = line.search(/\S/);
    const content = line.trim();
    
    // Stack aufräumen
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    
    const current = stack[stack.length - 1].obj;
    
    if (content.startsWith('- ')) {
      // Array-Element
      const value = content.slice(2).trim();
      const key = Object.keys(current).pop();
      if (!Array.isArray(current[key])) {
        current[key] = [];
      }
      
      if (value.includes(': ')) {
        const obj = {};
        const [k, v] = value.split(': ').map(s => s.trim());
        obj[k] = parseValue(v);
        current[key].push(obj);
        stack.push({ obj: obj, indent: indent });
      } else if (value) {
        current[key].push(parseValue(value));
      } else {
        const obj = {};
        current[key].push(obj);
        stack.push({ obj: obj, indent: indent });
      }
    } else if (content.endsWith(':') && !content.includes(': ')) {
      // Neues Objekt
      const key = content.slice(0, -1);
      current[key] = {};
      stack.push({ obj: current[key], indent: indent });
    } else if (content.includes(': ')) {
      // Key-Value
      const colonIndex = content.indexOf(': ');
      const key = content.slice(0, colonIndex).trim();
      const value = content.slice(colonIndex + 2).trim();
      current[key] = parseValue(value);
    }
  }
  
  return result;
}

function parseValue(value) {
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
  if (!config.manifest?.name) {
    throw new Error('manifest.yaml: name fehlt');
  }
  if (!config.daten?.quelle) {
    throw new Error('daten.yaml: quelle fehlt');
  }
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
