import { InteractionObserver } from './interaction.js';
import { RenderingObserver } from './rendering.js';
import { SessionObserver } from './session.js';
import { createTarget } from './target.js';
import { debug } from './debug.js';

// Debug-Observer auch exportieren
export { debug } from './debug.js';

// Observer-Referenzen für globalen Zugriff
let activeObservers = {
  interaction: null,
  rendering: null,
  session: null
};

export function setupObservers(container, config, session = null) {
  const observers = [];
  
  debug.observer('Setup', {
    hasConfig: !!config?.observer,
    interaction: !!config?.observer?.interaktion,
    rendering: !!config?.observer?.rendering,
    session: !!config?.observer?.session
  });
  
  if (!config?.observer) {
    debug.warn('No observer configuration found');
    return observers;
  }
  
  // === INTERACTION OBSERVER ===
  if (config.observer.interaktion) {
    const target = createTarget(config.observer.interaktion.ziel);
    const obs = new InteractionObserver(container, target);
    obs.start();
    observers.push(obs);
    activeObservers.interaction = obs;
  }
  
  // === RENDERING OBSERVER ===
  if (config.observer.rendering) {
    const target = createTarget(config.observer.rendering.ziel);
    const obs = new RenderingObserver(container, target);
    obs.start();
    observers.push(obs);
    activeObservers.rendering = obs;
  }
  
  // === SESSION OBSERVER ===
  if (config.observer.session && session) {
    const target = createTarget(config.observer.session.ziel);
    const obs = new SessionObserver(target);
    obs.start(session.id);
    observers.push(obs);
    observers.sessionObserver = obs;
    activeObservers.session = obs;
  }
  
  // Global verfügbar für Debugging
  if (typeof window !== 'undefined') {
    window.amorphObservers = activeObservers;
    window.amorphObserverStats = getObserverStats;
  }
  
  debug.observer('All observers active', { 
    count: observers.length,
    types: Object.keys(activeObservers).filter(k => activeObservers[k])
  });
  
  return observers;
}

export function stopObservers(observers) {
  debug.observer('Stopping all observers');
  
  for (const obs of observers) {
    if (obs.stop) obs.stop();
  }
  
  activeObservers = {
    interaction: null,
    rendering: null,
    session: null
  };
}

export function getObserverStats() {
  const stats = {
    debug: debug.getStats(),
    timeline: debug.getTimeline(20)
  };
  
  if (activeObservers.rendering?.getStats) {
    stats.rendering = activeObservers.rendering.getStats();
  }
  
  if (activeObservers.session?.getStats) {
    stats.session = activeObservers.session.getStats();
  }
  
  return stats;
}

// Export für direkten Zugriff
export { InteractionObserver, RenderingObserver, SessionObserver };
