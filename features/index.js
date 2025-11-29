import { createFeatureContext } from './context.js';
import suche from './suche/index.js';
import perspektiven from './perspektiven/index.js';
import grid from './grid/index.js';

const eingebauteFeatures = { suche, perspektiven, grid };

export async function loadFeatures(container, config, dataSource) {
  const geladene = [];
  
  console.log('%c[FEATURES]%c Config:', 'color: #a78bfa; font-weight: bold', 'color: inherit', config?.features);
  
  if (!config?.features?.aktiv) {
    console.warn('%c[FEATURES]%c Keine aktiven Features gefunden', 'color: #fbbf24; font-weight: bold', 'color: inherit');
    return geladene;
  }
  
  // Sicherstellen dass aktiv ein Array ist
  const aktivListe = Array.isArray(config.features.aktiv) 
    ? config.features.aktiv 
    : Object.keys(config.features.aktiv || {});
  
  console.log('%c[FEATURES]%c Aktiv:', 'color: #a78bfa; font-weight: bold', 'color: inherit', aktivListe);
  
  for (const name of aktivListe) {
    try {
      let feature = eingebauteFeatures[name];
      
      if (!feature && config.features.extern?.[name]) {
        const module = await import(config.features.extern[name]);
        feature = module.default;
      }
      
      if (!feature) {
        console.warn(`Feature nicht gefunden: ${name}`);
        continue;
      }
      
      const ctx = createFeatureContext(name, container, config, dataSource);
      await feature(ctx);
      geladene.push({ name, ctx });
      
    } catch (e) {
      console.error(`Fehler beim Laden von Feature ${name}:`, e);
    }
  }
  
  return geladene;
}

export function unloadFeatures(features) {
  for (const { ctx } of features) {
    ctx.destroy();
  }
}
