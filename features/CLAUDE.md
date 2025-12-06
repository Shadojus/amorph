# Features

Eigenständig. Isoliert. Optional.

## Struktur

```
features/
├── context.js     ← Feature-Context Factory
├── index.js       ← Feature-Registry + Initialisierung
├── header/        ← App-Header (Branding, Suche, Controls)
├── grid/          ← Karten-Ansicht
├── vergleich/     ← Vergleichs-Ansicht mit Compare-Morphs
├── detail/        ← Detail-Overlay
├── suche/         ← Suchfunktion
├── perspektiven/  ← Perspektiven-Buttons + Multi-Color Glow
└── ansichten/     ← Ansicht-Switch (Grid ↔ Vergleich)
```

## Ansichten

| Ansicht | Feature | Beschreibung |
|---------|---------|--------------|
| **Grid** | `grid/` | Karten-Layout, einzelne Felder anklickbar |
| **Vergleich** | `vergleich/` | Compare-Morphs, Pilze nebeneinander |

Beide nutzen **Black Glasmorphism** auf Woodfloor-Hintergrund.

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

## Regeln

```javascript
// ✅ ERLAUBT:
ctx.dom, ctx.emit(), document.addEventListener()

// ❌ VERBOTEN:
window.*, document.body.*
```
