import { createFeatureContext } from './context.js';
import suche from './suche/index.js';
import perspektiven from './perspektiven/index.js';
import grid from './grid/index.js';
import header from './header/index.js';
import ansichten from './ansichten/index.js';
import vergleich from './vergleich/index.js';
import einzelansicht from './einzelansicht/index.js';
import infinitescroll from './infinitescroll/index.js';
import { debug } from '../observer/debug.js';

const eingebauteFeatures = { suche, perspektiven, grid, header, ansichten, vergleich, einzelansicht, infinitescroll };

export async function loadFeatures(container, config, dataSource, callbacks = {}) {
  const geladene = [];
  
  debug.features('Config', config?.features);
  
  if (!config?.features?.aktiv) {
    debug.warn('No active features found');
    return geladene;
  }
  
  // Sicherstellen dass aktiv ein Array ist
  const aktivListe = Array.isArray(config.features.aktiv) 
    ? config.features.aktiv 
    : Object.keys(config.features.aktiv || {});
  
  debug.features('Active', aktivListe);
  
  for (const name of aktivListe) {
    try {
      let feature = eingebauteFeatures[name];
      
      if (!feature && config.features.extern?.[name]) {
        const module = await import(config.features.extern[name]);
        feature = module.default;
      }
      
      if (!feature) {
        debug.warn(`Feature not found: ${name}`);
        continue;
      }
      
      const ctx = createFeatureContext(name, container, config, dataSource, callbacks);
      await feature(ctx);
      geladene.push({ name, ctx });
      
    } catch (e) {
      debug.error(`Error loading feature ${name}`, e);
    }
  }
  
  return geladene;
}

export function unloadFeatures(features) {
  for (const { ctx } of features) {
    ctx.destroy();
  }
}
