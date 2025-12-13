# Features

Eigenständig. Isoliert. Optional.

## Struktur

```
features/
├── context.js        ← Feature-Context Factory
├── index.js          ← Feature-Registry
├── header/           ← Branding, Suche, Perspektiven
├── grid/             ← Karten-Ansicht
├── ansichten/        ← View-Controller + Auswahl-State
├── vergleich/        ← smartCompare-Ansicht
├── einzelansicht/    ← Detail-Page /:slug
├── infinitescroll/   ← Auto-Nachladen
├── suche/            ← Suchfunktion
└── perspektiven/     ← 15 Perspektiven-Buttons
```

## Context API

```javascript
createContext(name, config) → {
  dom,        // Eigener DOM-Bereich
  config,     // Read-only Config
  on(),       // Event-Listener
  emit(),     // Event-Emitter
  mount(),    // In Container
  destroy()   // Cleanup
}
```

## Events

```javascript
ctx.emit('pilz:ausgewaehlt', { id });
document.addEventListener('amorph:pilz:ausgewaehlt', handler);
```

## Regeln

```javascript
// ✅ ctx.dom, ctx.emit(), document.addEventListener()
// ❌ window.*, document.body.*
```
