# 🔍 AMORPH v5 - Vollständiger Harmonie-Bericht

**Datum**: 02.12.2025  
**Analyst**: Claude (KI-Assistent)  
**Methode**: Vollständige CLAUDE.md Analyse + Code-Scan

---

## 📚 Architektur-Verständnis (aus CLAUDE.md)

### Die 5 Säulen von AMORPH

| Säule | Prinzip | Datei |
|-------|---------|-------|
| **Schema** | Single Source of Truth | `config/schema.yaml` |
| **Morphs** | Reine Funktionen: `(wert, config) → HTMLElement` | `morphs/*.js` |
| **Observer** | Beobachten, Melden, Nicht Eingreifen | `observer/*.js` |
| **Features** | Isoliert, eigenständig, optional | `features/*.js` |
| **Pipeline** | `DATEN → detectType() → MORPH → DOM` | `core/pipeline.js` |

### Kernphilosophie

> **"Die Datenstruktur bestimmt die Darstellung - nichts ist vorgegeben"**

- `{min: 10, max: 25}` → automatisch `range` Morph
- `{Protein: 26, Fett: 8}` → automatisch `pie` Morph
- `[{axis: "X", value: 80}]` → automatisch `radar` Morph

---

## 📊 Harmonie-Übersicht

| Bereich | Status | Harmonie |
|---------|--------|----------|
| Schema als SSOT | ✅ BEHOBEN | 90% |
| Datengetriebene Erkennung | ✅ BEHOBEN | 85% |
| Observer-System | ✅ BEHOBEN | 95% |
| Feature-Isolation | ⚠️ VERLETZT | 60% |
| Morph-Reinheit | ⚠️ VERLETZT | 70% |
| Config-Zentralisierung | ⚠️ TEILWEISE | 75% |

**Gesamt-Harmonie: ~79%**

---

## ✅ Bereits Behobene Probleme (Session 02.12.2025)

### 1. Schema-Verletzungen
- ~~`typ:` in 12+ Feldern~~ → Entfernt
- ~~`morphs:` in 6 Perspektiven~~ → Entfernt

### 2. Pipeline-Hardcoding
- ~~Hardcoded `badgeKeywords` Array~~ → Jetzt aus Config
- ~~Hardcoded Number-Ranges~~ → Jetzt aus Config
- ~~Hardcoded Array/Object Detection~~ → Jetzt aus Config

### 3. Compare-Hardcoding
- ~~`feldHandler` Object~~ → Entfernt
- ~~`FARBEN` Konstante~~ → Jetzt `getFarben()`

### 4. Observer-Verletzungen
- ~~22+ `console.log` im Anwendungscode~~ → Alle durch `debug.*` ersetzt

---

## 🔴 KRITISCHE Verletzungen (Noch Offen)

### 1. Feature `header/index.js` - window Zugriff

**Zeilen**: ~155, 162
```javascript
// ❌ FALSCH - Feature greift auf window zu
if (window.scrollY > 10) { ... }
window.addEventListener('scroll', handleScroll, { passive: true });
```

**Architektur-Regel**: Features bekommen KEINEN `window` Zugriff
```javascript
// ✅ RICHTIG - Scroll über Observer
// observer/scroll.js emittiert 'amorph:scroll' Events
// Feature hört auf ctx.on('scroll', handler)
```

**Schweregrad**: 🔴 KRITISCH

---

### 2. Morph `header.js` - Seiteneffekte

**Zeilen**: ~142, 153
```javascript
// ❌ FALSCH - Morph hat Seiteneffekte
document.dispatchEvent(new CustomEvent('amorph:ansicht-wechsel', {...}));
document.addEventListener('amorph:auswahl-geaendert', (e) => {...});
```

**Architektur-Regel**: Morphs sind REINE Funktionen
```javascript
// Morph: (wert, config) → HTMLElement
// KEINE Events, KEIN State, KEINE Listener
```

**Was stattdessen**: Event-Handling gehört ins Feature `header/index.js`

**Schweregrad**: 🔴 KRITISCH

---

### 3. Feature `ansichten/index.js` - Direkte document Events

**Zeilen**: ~54, 99, 115
```javascript
// ❌ FALSCH - Direkter document Zugriff
document.dispatchEvent(new CustomEvent('amorph:auswahl-geaendert', {...}));
```

**Architektur-Regel**: Features nutzen `ctx.emit()`
```javascript
// ✅ RICHTIG
ctx.emit('auswahl-geaendert', { auswahl });
// Context-System propagiert zu document mit Prefix
```

**Schweregrad**: 🔴 KRITISCH

---

## 🟡 MITTLERE Verletzungen (Noch Offen)

### 4. Features - Direkte document.addEventListener

**Dateien**:
- `features/vergleich/index.js` (Zeile ~321)
- `features/detail/index.js` (Zeile ~300)
- `features/header/index.js` (Zeile ~330)

```javascript
// ❌ FALSCH
document.addEventListener('perspektiven:geaendert', handler);

// ✅ RICHTIG
ctx.on('perspektiven:geaendert', handler);
```

**Schweregrad**: 🟡 MITTEL

---

### 5. Features - document.querySelector für Container

**Datei**: `features/grid/index.js` (Zeile ~38, 46)
```javascript
// ❌ FALSCH
const container = document.querySelector('[data-amorph-container]');

// ✅ RICHTIG - Container ist bereits im Context
// ctx.container oder über ctx.dom.closest() finden
```

**Schweregrad**: 🟡 MITTEL

---

### 6. Morph `badge.js` - Hardcoded AUTO_VARIANTS

**Zeilen**: 14-24
```javascript
// ❌ FALSCH - Hardcoded im Code
const AUTO_VARIANTS = {
  success: ['aktiv', 'active', 'ja', 'yes', 'true', 'online', 'verfügbar', 'essbar'],
  danger: ['inaktiv', 'inactive', 'nein', 'no', 'false', 'offline', 'vergriffen', 'giftig'],
  warning: ['warnung', 'warning', 'achtung', 'tödlich', 'vorsicht'],
  info: ['info', 'information', 'hinweis', 'selten']
};
```

**Architektur-Regel**: Keywords aus Config
```yaml
# ✅ RICHTIG - In morphs.yaml
erkennung:
  badge:
    variants:
      success: [aktiv, ja, essbar, verfügbar]
      danger: [inaktiv, nein, giftig]
      warning: [warnung, tödlich]
```

**Schweregrad**: 🟡 MITTEL

---

### 7. Morph `badge.js` - Hardcoded VARIANT_COLORS

**Zeilen**: 26-31
```javascript
// ❌ FALSCH - Farben hardcoded
const VARIANT_COLORS = {
  success: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#22c55e' },
  danger: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#ef4444' },
  ...
};
```

**Schweregrad**: 🟡 MITTEL

---

### 8. Pipeline - Fallback-Arrays

**Datei**: `core/pipeline.js` (Zeilen ~167-218)
```javascript
// ❌ FALSCH - Hardcoded Fallbacks
const keywords = cfg.keywords || ['aktiv', 'inaktiv', 'ja', 'nein', ...];
const labelKeys = ['label', 'name', 'category'];
const valueKeys = ['value', 'count', 'amount', 'score'];
```

**Architektur-Regel**: Keine Fallbacks, Config muss vollständig sein
```javascript
// ✅ RICHTIG - Config ist required
const keywords = cfg.keywords;
if (!keywords) throw new Error('erkennung.badge.keywords fehlt in morphs.yaml');
```

**Schweregrad**: 🟡 MITTEL

---

### 9. Morph `pie.js` - Hardcoded FARBEN

**Zeilen**: 14-22
```javascript
// ❌ FALSCH
const FARBEN = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
];
```

**Architektur-Regel**: Farben aus `morphs.yaml → farben.diagramme`

**Schweregrad**: 🟡 MITTEL

---

### 10. Morph `compare.js` - Lokale pieColors

**Zeile**: ~554
```javascript
// ❌ FALSCH
const pieColors = ['#60c090', '#5aa0d8', '#e8b04a', '#d06080', ...];
```

**Architektur-Regel**: `getFarben('diagramme')` nutzen (existiert bereits!)

**Schweregrad**: 🟡 MITTEL

---

### 11. Util `session.js` - Direkter document.cookie Zugriff

**Zeilen**: 4-7, 24, 29
```javascript
// ❌ FALSCH - Util greift auf globale API zu
const cookie = document.cookie.split('; ')...
document.cookie = `amorph_session=${id}; ...`;
```

**Architektur-Regel**: Utils haben keine Seiteneffekte

**Was stattdessen**: Als SessionObserver implementieren mit Storage-Abstraction

**Schweregrad**: 🟡 MITTEL

---

## 🟢 NIEDRIGE Verletzungen (Noch Offen)

### 12. Morphs - window.location.origin

**Dateien**: `morphs/image.js`, `morphs/link.js`
```javascript
// ⚠️ Leichte Verletzung
const baseUrl = window.location.origin;
```

**Was stattdessen**: `config.baseUrl` als Parameter

---

### 13. Features - Inkonsistente DOM-Erstellung

**Dateien**: `features/*/index.js`
```javascript
// ⚠️ Inkonsistent
const el = document.createElement('div');

// ✅ Besser
import { el } from '../../util/dom.js';
const div = el('div', { className: 'amorph-...' });
```

---

### 14. Feature `header/index.js` - DOM außerhalb Container

**Zeile**: ~520
```javascript
// ⚠️ Header wird in body eingefügt statt Container
document.body.insertAdjacentElement('afterbegin', ctx.dom);
```

**Was stattdessen**: CSS `position: fixed` für Header-Positionierung

---

### 15. Context.js - document.createElement

**Zeile**: 8
```javascript
// ⚠️ Core nutzt nicht eigene Utils
const bereich = document.createElement('div');

// ✅ Besser
import { el } from '../util/dom.js';
```

---

## 📋 Priorisierte Korrektur-Empfehlung

### Phase 1: KRITISCH (Sofort)

| # | Datei | Aktion |
|---|-------|--------|
| 1 | `morphs/header.js` | Event-Handler ins Feature verschieben |
| 2 | `features/header/index.js` | `window.addEventListener` durch Observer ersetzen |
| 3 | `features/ansichten/index.js` | `document.dispatchEvent` → `ctx.emit` |

### Phase 2: MITTEL (Kurzfristig)

| # | Datei | Aktion |
|---|-------|--------|
| 4 | `features/*.js` | `document.addEventListener` → `ctx.on` |
| 5 | `features/grid/index.js` | `document.querySelector` → `ctx.dom` |
| 6 | `morphs/badge.js` | Variants + Colors aus Config laden |
| 7 | `morphs/pie.js` | FARBEN aus Config laden |
| 8 | `morphs/compare.js` | `getFarben()` überall nutzen |

### Phase 3: NIEDRIG (Langfristig)

| # | Datei | Aktion |
|---|-------|--------|
| 9 | `core/pipeline.js` | Fallback-Arrays entfernen |
| 10 | `util/session.js` | Als Observer refactoren |
| 11 | Alle Morphs | `util/dom.js` nutzen |

---

## 🎯 Gesamt-Bewertung

### Stärken ✅
- Klare Architektur-Vision in CLAUDE.md dokumentiert
- Observer-System gut implementiert (debug.js)
- Schema als SSOT funktioniert
- Pipeline-Erkennung ist datengetrieben
- Perspektiven-System elegant umgesetzt

### Schwächen ⚠️
- Feature-Isolation wird nicht konsequent durchgesetzt
- Morph `header.js` hat Seiteneffekte (Anti-Pattern)
- Viele hardcoded Farben/Keywords in Morphs
- `window`/`document` Zugriffe in Features
- Fallback-Werte im Code statt Config

### Empfehlung

1. **Governance**: CLAUDE.md als verbindliche Architektur-Regeln behandeln
2. **Linting**: ESLint-Regel für `document.addEventListener` in Features
3. **Code-Review**: Morphs auf Seiteneffekte prüfen
4. **Migration**: Schrittweise alle hardcoded Werte nach Config verschieben

---

## 📁 Betroffene Dateien (Übersicht)

```
🔴 KRITISCH
├── morphs/header.js          → Seiteneffekte entfernen
├── features/header/index.js  → window-Zugriff entfernen
└── features/ansichten/index.js → ctx.emit nutzen

🟡 MITTEL
├── features/vergleich/index.js → ctx.on nutzen
├── features/detail/index.js    → ctx.on nutzen
├── features/grid/index.js      → ctx.dom nutzen
├── morphs/badge.js            → Config laden
├── morphs/pie.js              → Config laden
├── morphs/compare.js          → getFarben() nutzen
├── core/pipeline.js           → Fallbacks entfernen
└── util/session.js            → Observer-Pattern

🟢 NIEDRIG
├── morphs/image.js            → baseUrl als Config
├── morphs/link.js             → baseUrl als Config
├── features/context.js        → util/dom.js nutzen
└── features/*/index.js        → util/dom.js nutzen
```

---

*Dieser Bericht dokumentiert den Ist-Zustand am 02.12.2025 nach den ersten Korrekturen.*
