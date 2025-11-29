import { InteractionObserver } from './interaction.js';
import { RenderingObserver } from './rendering.js';
import { SessionObserver } from './session.js';
import { createTarget } from './target.js';

export function setupObservers(container, config, session = null) {
  const observers = [];
  
  if (!config?.observer) return observers;
  
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
