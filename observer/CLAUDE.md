# Observer

Observability-System: Debug-Logging, User-Interaction-Tracking, Rendering-Metrics, Session-Analytics.

## Dateien

| Datei | Zeilen | Zweck |
|-------|--------|-------|
| `index.js` | 98 | Setup + Management aller Observer |
| `debug.js` | 235 | Zentrales Logging-System (Singleton) |
| `interaction.js` | 115 | Klicks, Hover, Inputs, Scroll, Keys |
| `rendering.js` | 95 | Mount/Unmount, Render, DOM-Mutations |
| `session.js` | 137 | Session-Lifecycle, Tab-Visibility, Analytics |
| `target.js` | 102 | Output-Targets (Console, HTTP, WebSocket, Redis) |

---

## index.js (98 Zeilen)

### Exports

```javascript
export { debug } from './debug.js';
export { InteractionObserver, RenderingObserver, SessionObserver };

export function setupObservers(container, config, session = null) → Observer[]
export function stopObservers(observers)
export function getObserverStats() → { debug, timeline, rendering?, session? }
```

### Setup-Ablauf

```javascript
setupObservers(container, config, session)
// 1. Liest config.observer.interaktion → InteractionObserver
// 2. Liest config.observer.rendering → RenderingObserver
// 3. Liest config.observer.session → SessionObserver (nur wenn session)
// 4. Startet alle Observer
// 5. window.amorphObservers = { interaction, rendering, session }
```

---

## debug.js (235 Zeilen) - ZENTRALES LOGGING

**ARCHITEKTUR: Kein `console.log` im Code! Nur `debug.*` Methoden!**

### Debug-Aktivierung

In `config/observer.yaml`:
```yaml
debug: true  # Aktiviert Logging
```

### Singleton

```javascript
export const debug = new DebugObserver(true);

// Global verfügbar:
window.amorphDebug = debug;
window.amorphStats();         // Summary ausgeben
window.amorphFilter('search'); // Nur 'search' loggen
window.amorphClear();         // Filter entfernen
window.amorphVerbose(true);   // Alle Kategorien
window.amorphMute('render');  // Kategorie stumm schalten
window.amorphUnmute('render');
```

### Schnell-Shortcuts (Browser-Console)

```javascript
// Kompakte Befehle
amorphDebug.summary()      // Stats + Timeline ausgeben
amorphDebug.getHistory()   // Alle Log-Einträge
amorphDebug.clear()        // History leeren
amorphObserverStats()      // Observer-Statistiken
```

### Kategorien + Styles

| Kategorie | Farbe | Methode |
|-----------|-------|---------|
| **System** | | |
| amorph | #f472b6 (pink) | `debug.amorph()` |
| config | #34d399 (grün) | `debug.config()` |
| data | #60a5fa (blau) | `debug.data()` |
| schema | #67e8f9 (cyan) | `debug.schema()` |
| **Features** | | |
| features | #a78bfa (lila) | `debug.features()` |
| header | #c084fc | `debug.header()` |
| search | #38bdf8 | `debug.search()` |
| perspectives | #06b6d4 | `debug.perspectives()` |
| grid | #84cc16 | `debug.grid()` |
| views | #22c55e | `debug.views()` |
| compare | #14b8a6 | `debug.compare()` |
| detail | #10b981 | `debug.detail()` |
| **Morphs** | | |
| morphs | #fb7185 (muted) | `debug.morphs()` |
| detection | #e879f9 (muted) | `debug.detection()` |
| render | #fbbf24 (muted) | `debug.render()` |
| mount | #facc15 (muted) | `debug.mount()` |
| unmount | #a3a3a3 (muted) | `debug.unmount()` |
| **Utils** | | |
| semantic | #5aa0d8 (muted) | `debug.semantic()` |
| **User** | | |
| observer | #f87171 | `debug.observer()` |
| click | #fb923c | `debug.click()` |
| hover | #fdba74 (muted) | `debug.hover()` |
| input | #fcd34d | `debug.input()` |
| scroll | #d4d4d4 (muted) | `debug.scroll()` |
| **Session** | | |
| session | #22d3ee | `debug.session()` |
| navigation | #2dd4bf | `debug.navigation()` |
| **Errors** | | |
| error | #ef4444 (rot) | `debug.error()` |
| warn | #fbbf24 (gelb) | `debug.warn()` |

### Muted by Default

```javascript
muted: new Set([
  'mount', 'unmount', 'scroll', 'intersection',
  'hover', 'morphs', 'detection', 'render', 'semantic'
]);
```

### History & Stats

```javascript
debug.getHistory(category?)     → Entry[]
debug.getStats()               → { category: count }
debug.getTimeline(limit=20)    → [{ time, ms, category, message }]
debug.summary()                → Console-Table + Timeline
debug.clear()                  → History leeren
```

### Legacy-Aliase (Deutsch)

```javascript
debug.daten()        // → data()
debug.suche()        // → search()
debug.perspektiven() // → perspectives()
debug.ansichten()    // → views()
debug.vergleich()    // → compare()
debug.klick()        // → click()
debug.fehler()       // → error()
```

---

## interaction.js (115 Zeilen)

### InteractionObserver

```javascript
new InteractionObserver(container, target)
.start()  // Event-Listener registrieren
.stop()   // Event-Listener entfernen
```

### Tracked Events

| Event | Throttle | Daten |
|-------|----------|-------|
| `click` | - | morph, feld, feature, button, link, target, x, y |
| `mouseover` | 500ms | morph, feld |
| `mouseout` | - | (clear hover) |
| `input` | - | morph, feld, typ, name, laenge |
| `focusin` | - | morph, element |
| `scroll` | 500ms | scrollTop, scrollPercent |
| `keydown` | - | key, morph (nur Enter, Escape, Tab, Arrows) |

### Target-Format

```javascript
{ typ: 'klick', morph, feld, zeitstempel: Date.now(), ... }
{ typ: 'hover', morph, feld, zeitstempel }
{ typ: 'input', morph, feld, typ, name, laenge, zeitstempel }
{ typ: 'scroll', scrollTop, scrollPercent, zeitstempel }
```

---

## rendering.js (95 Zeilen)

### RenderingObserver

```javascript
new RenderingObserver(container, target)
.start()         // Event-Listener + MutationObserver
.stop()          // Cleanup
.getStats()      → { renders, mounts }
```

### Tracked Events

| Event | Daten |
|-------|-------|
| `amorph:mounted` | morph, field, number |
| `amorph:unmounted` | morph, field |
| `amorph:rendered` | count, renderNumber, totalMounts |
| `amorph:request-render` | source |
| DOM Mutations | added, removed (nodes) |

### Target-Format

```javascript
{ typ: 'mount', morph, field, number, timestamp }
{ typ: 'unmount', morph, field, timestamp }
{ typ: 'render', count, renderNumber, totalMounts, timestamp }
```

---

## session.js (137 Zeilen)

### SessionObserver

```javascript
new SessionObserver(target)
.start(sessionId)  // Session starten
.track(aktion)     // Aktion tracken
.flush()           // Aktionen an Backend senden
.stop()            // Session beenden
.getStats()        → { sessionId, dauer, interactions, pageViews, pendingActions }
```

### Lifecycle-Events

| Event | Trigger | Daten |
|-------|---------|-------|
| `session_start` | start() | session, userAgent, sprache, bildschirm, url, referrer |
| `tab_hidden` | visibilitychange | - |
| `tab_visible` | visibilitychange | - |
| `page_leave` | beforeunload | dauer, interactions, scrollTiefe |
| `session_ende` | stop() | session, dauer, interactions |
| `session_aktionen` | flush() | session, aktionen[] |

### Auto-Flush

- Alle 30 Sekunden
- Bei 50+ Aktionen in Queue
- Bei Page Leave

---

## target.js (102 Zeilen)

### createTarget(config)

```javascript
createTarget({ typ: 'console' })    → NoOpTarget (debug.js übernimmt)
createTarget({ typ: 'http', url })  → HttpTarget
createTarget({ typ: 'websocket', url }) → WebSocketTarget
createTarget({ typ: 'redis', url, stream }) → RedisTarget
```

### Target-Klassen

#### NoOpTarget

```javascript
send(nachricht) { /* nichts - debug.js loggt */ }
```

#### HttpTarget

```javascript
new HttpTarget(url, { headers?, batch: false })
.send(nachricht)      // Sofort oder gebatched
.scheduleBatch()      // Batch nach 1s senden
.post(nachrichten[])  // POST Request
```

- `batch: true` → sammelt Nachrichten, sendet nach 1s

#### WebSocketTarget

```javascript
new WebSocketTarget(url, { reconnect: true })
.connect()      // WebSocket öffnen
.send(nachricht)  // Senden oder in Queue

// Auto-Reconnect nach 5s bei Verbindungsabbruch
```

#### RedisTarget

```javascript
new RedisTarget(url, { stream: 'amorph:events' })
// Nutzt HttpTarget mit batch: true
// Fügt stream-Property zu jeder Nachricht hinzu
```

---

## Konfiguration (observer.yaml)

### Entwicklung (Console)

```yaml
interaktion:
  ziel:
    typ: console
    prefix: "[KLICK]"
    level: log

rendering:
  ziel:
    typ: console
    prefix: "[RENDER]"
    level: debug

session:
  ziel:
    typ: console
    prefix: "[SESSION]"
```

### Produktion

```yaml
interaktion:
  ziel:
    typ: redis
    url: /api/redis-bridge
    stream: amorph:klicks

rendering:
  ziel:
    typ: http
    url: /api/analytics
    batch: true

session:
  ziel:
    typ: websocket
    url: wss://api.example.com/session
```

---

## Abhängigkeiten

```
index.js       → interaction.js, rendering.js, session.js, target.js, debug.js
interaction.js → debug.js
rendering.js   → debug.js
session.js     → debug.js
target.js      → debug.js
```

---

## Verwendung

### Im Code

```javascript
import { debug } from '../observer/debug.js';

debug.features('Init complete', { count: 5 });
debug.search('Query', { term: 'pilz', results: 42 });
debug.error('Failed to load', error);
```

### In der Browser-Console

```javascript
amorphDebug.summary();           // Stats + Timeline
amorphDebug.setVerbose(true);    // Alle Kategorien anzeigen
amorphDebug.mute('render');      // Render stumm schalten
amorphDebug.getHistory('error'); // Nur Fehler
amorphObserverStats();           // Rendering + Session Stats
```
