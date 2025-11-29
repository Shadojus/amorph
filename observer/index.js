import { InteractionObserver } from './interaction.js';
import { RenderingObserver } from './rendering.js';
import { SessionObserver } from './session.js';
import { createTarget } from './target.js';

export function setupObservers(container, config, session = null) {
  const observers = [];
  
  console.log('%c[AMORPH]%c Observer Setup', 'color: #60a5fa; font-weight: bold', 'color: inherit', {
    hatConfig: !!config?.observer,
    interaktion: !!config?.observer?.interaktion,
    rendering: !!config?.observer?.rendering,
    session: !!config?.observer?.session
  });
  
  if (!config?.observer) {
    console.warn('%c[AMORPH]%c Keine Observer-Konfiguration gefunden', 'color: #fbbf24; font-weight: bold', 'color: inherit');
    return observers;
  }
  
  if (config.observer.interaktion) {
    const target = createTarget(config.observer.interaktion.ziel);
    const obs = new InteractionObserver(container, target);
    obs.start();
    observers.push(obs);
  }
  
  if (config.observer.rendering) {
    const target = createTarget(config.observer.rendering.ziel);
    const obs = new RenderingObserver(container, target);
    obs.start();
    observers.push(obs);
  }
  
  if (config.observer.session && session) {
    const target = createTarget(config.observer.session.ziel);
    const obs = new SessionObserver(target);
    obs.start(session.id);
    observers.push(obs);
    observers.sessionObserver = obs;
  }
  
  return observers;
}

export function stopObservers(observers) {
  for (const obs of observers) {
    if (obs.stop) obs.stop();
  }
}
