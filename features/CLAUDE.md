# Features

Eigenständig. Isoliert. Optional.

## Struktur

```
features/
├── context.js      ← Feature-Context Factory
├── index.js        ← Feature-Registry + Initialisierung
├── header/         ← App-Header (Branding, Suche, 17 Perspektiven)
├── grid/           ← Karten-Ansicht
├── vergleich/      ← Vergleichs-Ansicht mit Theme-Compare-Morphs
├── einzelansicht/  ← Detail-Page (/:slug)
├── infinitescroll/ ← Automatisches Nachladen
├── suche/          ← Suchfunktion
├── perspektiven/   ← 17 Perspektiven-Buttons + Multi-Color Glow
└── ansichten/      ← Ansicht-Switch (Karten ↔ Vergleich)
```

## Ansichten

| Ansicht | Feature | Beschreibung |
|---------|---------|--------------|
| **Grid** | `grid/` | Karten-Layout, Felder anklickbar |
| **Vergleich** | `vergleich/` | Theme-Compare-Morphs, Pilze nebeneinander |
| **Einzelansicht** | `einzelansicht/` | Full-Page Pilz-Detail |

## Feature-Context API

```javascript
export function createContext(name, config) {
  return {
    dom,          // Eigener DOM-Bereich
    config,       // Read-only Config  
    on(),         // Event-Listener
    emit(),       // Event-Emitter
    mount(),      // In Container
    destroy()     // Cleanup
  };
}
```

## Event-Bus

```javascript
ctx.emit('pilz:ausgewaehlt', { id: 'steinpilz' });
document.addEventListener('amorph:pilz:ausgewaehlt', handler);
```

## 17 Perspektiven im Header

Header zeigt alle 17 Perspektiven als Toggle-Buttons mit:
- Symbol + Name
- 4-Farben-Gradient bei Aktivierung
- Multi-Color Glow bei mehreren aktiven Perspektiven

## Regeln

```javascript
// ✅ ERLAUBT:
ctx.dom, ctx.emit(), document.addEventListener()

// ❌ VERBOTEN:
window.*, document.body.*
```
