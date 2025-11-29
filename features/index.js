import { createFeatureContext } from './context.js';
import suche from './suche/index.js';
import perspektiven from './perspektiven/index.js';
import grid from './grid/index.js';

const eingebauteFeatures = { suche, perspektiven, grid };

export async function loadFeatures(container, config, dataSource) {
  const geladene = [];
  
  if (!config?.features?.aktiv) return geladene;
  
  for (const name of config.features.aktiv) {
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
