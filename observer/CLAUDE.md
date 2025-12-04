# Observer

Beobachten. Melden. Nicht eingreifen.

## Übersicht

Das Observer-System besteht aus:
- **debug.js** - Farbkodiertes Logging-System (AKTIV)
- `interaction.js` - Klicks, Hovers, Scrolls (vorbereitet)
- `rendering.js` - Mounts, Unmounts, Transformationen (vorbereitet)
- `session.js` - User-Sessions (vorbereitet)
- `target.js` - Ziel-Adapter für Observer-Output (vorbereitet)

### debug.js - Das Herzstück

```javascript
// Farbkodierte Kategorien
const STYLES = {
  amorph: 'color: #f472b6; font-weight: bold; font-size: 14px',
  config: 'color: #a78bfa; font-weight: bold',
  morphs: 'color: #60a5fa; font-weight: bold',
  suche: 'color: #34d399; font-weight: bold',
  features: 'color: #fbbf24; font-weight: bold',
  // ... weitere
};

// Nutzung
import { debug } from '../observer/debug.js';
debug.morphs('Badge erkannt', { wert, variant });
debug.suche('Ergebnisse', { anzahl: results.length });
debug.features('Ansicht-Wechsel', { von: 'karten', zu: 'vergleich' });
```

### Debug-Kategorien

| Kategorie | Farbe | Verwendung |
|-----------|-------|------------|
| `amorph` | Pink | System-Start, globale Meldungen |
| `config` | Lila | Config-Laden, YAML-Parsing |
| `morphs` | Blau | Morph-Erkennung, Transformation |
| `suche` | Grün | Suchanfragen, Ergebnisse |
| `features` | Gold | Feature-Init, Events |
| `perspektiven` | Cyan | Perspektiven-Toggle |
| `header` | Orange | Header-Interaktionen |
| `ansichten` | Magenta | View-Wechsel |

## Was ist ein Observer?

Observer beobachten das System und senden Nachrichten nach außen. Sie verändern nichts, sie sehen nur.

```javascript
observer.on('click', (event) => {
  sendToTarget({ type: 'click', element: event.target });
});
```

## Die Observer

### interaction.js

Beobachtet Benutzerinteraktionen: Klicks, Hovers, Scrolls.

```javascript
// observer/interaction.js
export class InteractionObserver {
  constructor(container, target) {
    this.container = container;
    this.target = target;
    this.handlers = new Map();
  }
  
  start() {
    // Klicks
    this.addHandler('click', (e) => {
      const morph = e.target.closest('amorph-container');
      if (!morph) return;
      
      this.send({
        typ: 'klick',
        morph: morph.dataset.morph,
        feld: morph.dataset.field,
        zeitstempel: Date.now()
      });
    });
    
    // Hover (mit Debounce)
    let hoverTimeout;
    this.addHandler('mouseover', (e) => {
      const morph = e.target.closest('amorph-container');
      if (!morph) return;
      
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.send({
          typ: 'hover',
          morph: morph.dataset.morph,
          feld: morph.dataset.field,
          dauer: 500,
          zeitstempel: Date.now()
        });
      }, 500);
    });
    
    this.addHandler('mouseout', () => {
      clearTimeout(hoverTimeout);
    });
  }
  
  addHandler(event, handler) {
    this.container.addEventListener(event, handler);
    this.handlers.set(event, handler);
  }
  
  stop() {
    for (const [event, handler] of this.handlers) {
      this.container.removeEventListener(event, handler);
    }
    this.handlers.clear();
  }
  
  send(nachricht) {
    this.target.send(nachricht);
  }
}
```

### rendering.js

Beobachtet was die Pipeline tut: Mounts, Unmounts, Transformationen.

```javascript
// observer/rendering.js
export class RenderingObserver {
  constructor(container, target) {
    this.container = container;
    this.target = target;
  }
  
  start() {
    // Mounted
    this.container.addEventListener('amorph:mounted', (e) => {
      this.send({
        typ: 'mount',
        morph: e.detail.morph,
        feld: e.detail.field,
        zeitstempel: Date.now()
      });
    });
    
    // Unmounted
    this.container.addEventListener('amorph:unmounted', (e) => {
      this.send({
        typ: 'unmount',
        morph: e.detail.morph,
        feld: e.detail.field,
        zeitstempel: Date.now()
      });
    });
    
    // Render complete
    this.container.addEventListener('amorph:rendered', (e) => {
      this.send({
        typ: 'render',
        anzahl: this.container.querySelectorAll('amorph-container').length,
        zeitstempel: Date.now()
      });
    });
  }
  
  stop() {
    // Events werden mit Container entfernt
  }
  
  send(nachricht) {
    this.target.send(nachricht);
  }
}
```

### session.js

Beobachtet User-Sessions. Nur aktiv wenn Session existiert.

```javascript
// observer/session.js
export class SessionObserver {
  constructor(target) {
    this.target = target;
    this.sessionId = null;
    this.aktionen = [];
    this.flushInterval = null;
  }
  
  start(sessionId) {
    if (!sessionId) {
      console.log('SessionObserver: Keine Session, nicht aktiv');
      return;
    }
    
    this.sessionId = sessionId;
    
    // Periodisch senden (alle 30 Sekunden)
    this.flushInterval = setInterval(() => this.flush(), 30000);
    
    // Bei Seiten-Verlassen
    window.addEventListener('beforeunload', () => this.flush());
    
    this.send({
      typ: 'session_start',
      session: this.sessionId,
      zeitstempel: Date.now(),
      userAgent: navigator.userAgent,
      sprache: navigator.language
    });
  }
  
  track(aktion) {
    if (!this.sessionId) return;
    
    this.aktionen.push({
      ...aktion,
      session: this.sessionId,
      zeitstempel: Date.now()
    });
    
    // Bei zu vielen Aktionen sofort senden
    if (this.aktionen.length >= 50) {
      this.flush();
    }
  }
  
  flush() {
    if (this.aktionen.length === 0) return;
    
    this.send({
      typ: 'session_aktionen',
      session: this.sessionId,
      aktionen: this.aktionen,
      zeitstempel: Date.now()
    });
    
    this.aktionen = [];
  }
  
  stop() {
    if (!this.sessionId) return;
    
    this.flush();
    
    this.send({
      typ: 'session_ende',
      session: this.sessionId,
      zeitstempel: Date.now()
    });
    
    clearInterval(this.flushInterval);
    this.sessionId = null;
  }
  
  send(nachricht) {
    this.target.send(nachricht);
  }
}
```

## Targets

Wohin die Nachrichten gehen. Konfigurierbar in `observer.yaml`.

### target.js

```javascript
// observer/target.js
export function createTarget(config) {
  const { typ, url, options = {} } = config;
  
  switch (typ) {
    case 'console':
      return new ConsoleTarget(options);
    case 'http':
      return new HttpTarget(url, options);
    case 'websocket':
      return new WebSocketTarget(url, options);
    case 'redis':
      return new RedisTarget(url, options);
    default:
      console.warn(`Unbekannter Target-Typ: ${typ}, nutze Console`);
      return new ConsoleTarget();
  }
}

class ConsoleTarget {
  constructor(options = {}) {
    this.prefix = options.prefix || '[AMORPH]';
    this.level = options.level || 'log';
  }
  
  send(nachricht) {
    console[this.level](this.prefix, nachricht);
  }
}

class HttpTarget {
  constructor(url, options = {}) {
    this.url = url;
    this.headers = options.headers || {};
    this.batch = options.batch || false;
    this.queue = [];
  }
  
  send(nachricht) {
    if (this.batch) {
      this.queue.push(nachricht);
      this.scheduleBatch();
    } else {
      this.post([nachricht]);
    }
  }
  
  scheduleBatch() {
    if (this.batchTimeout) return;
    this.batchTimeout = setTimeout(() => {
      this.post(this.queue);
      this.queue = [];
      this.batchTimeout = null;
    }, 1000);
  }
  
  async post(nachrichten) {
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(nachrichten)
      });
    } catch (e) {
      console.error('Observer HTTP Fehler:', e);
    }
  }
}

class WebSocketTarget {
  constructor(url, options = {}) {
    this.url = url;
    this.reconnect = options.reconnect !== false;
    this.queue = [];
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      // Queue leeren
      for (const msg of this.queue) {
        this.ws.send(JSON.stringify(msg));
      }
      this.queue = [];
    };
    
    this.ws.onclose = () => {
      if (this.reconnect) {
        setTimeout(() => this.connect(), 5000);
      }
    };
  }
  
  send(nachricht) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(nachricht));
    } else {
      this.queue.push(nachricht);
    }
  }
}

// Redis via HTTP Bridge (Redis selbst nicht im Browser)
class RedisTarget {
  constructor(url, options = {}) {
    this.http = new HttpTarget(url, {
      ...options,
      batch: true
    });
    this.stream = options.stream || 'amorph:events';
  }
  
  send(nachricht) {
    this.http.send({
      stream: this.stream,
      ...nachricht
    });
  }
}
```

## index.js - Setup

```javascript
// observer/index.js
import { InteractionObserver } from './interaction.js';
import { RenderingObserver } from './rendering.js';
import { SessionObserver } from './session.js';
import { createTarget } from './target.js';

export function setupObservers(container, config, session = null) {
  const observers = [];
  
  if (!config?.observer) return observers;
  
  // Interaktion
  if (config.observer.interaktion) {
    const target = createTarget(config.observer.interaktion.ziel);
    const obs = new InteractionObserver(container, target);
    obs.start();
    observers.push(obs);
  }
  
  // Rendering
  if (config.observer.rendering) {
    const target = createTarget(config.observer.rendering.ziel);
    const obs = new RenderingObserver(container, target);
    obs.start();
    observers.push(obs);
  }
  
  // Session (nur wenn Session existiert)
  if (config.observer.session && session) {
    const target = createTarget(config.observer.session.ziel);
    const obs = new SessionObserver(target);
    obs.start(session.id);
    observers.push(obs);
    
    // Session-Observer für andere Observer verfügbar machen
    observers.sessionObserver = obs;
  }
  
  return observers;
}

export function stopObservers(observers) {
  for (const obs of observers) {
    if (obs.stop) obs.stop();
  }
}
```

## Konfiguration (observer.yaml)

```yaml
interaktion:
  ziel:
    typ: redis
    url: /api/redis-bridge
    stream: amorph:klicks

rendering:
  ziel:
    typ: console
    prefix: "[RENDER]"
    level: debug

session:
  ziel:
    typ: http
    url: /api/analytics
    batch: true
```

## Entwicklung vs. Produktion

```yaml
# Entwicklung: Alles in Console
interaktion:
  ziel:
    typ: console

rendering:
  ziel:
    typ: console
    level: debug

# Produktion: Redis/HTTP
interaktion:
  ziel:
    typ: redis
    url: ${REDIS_BRIDGE_URL}
```

## Datenschutz

- **SessionObserver nur mit Session**: Ohne explizite Session kein Tracking
- **Keine PII**: Observer sammeln keine persönlichen Daten
- **Opt-out möglich**: Session nicht starten = kein Session-Tracking
- **Batch-Sending**: Reduziert Requests, nicht Live-Tracking
