# src/content/

Astro Content Collections Konfiguration.

## Status

**NICHT VERWENDET** - Wir nutzen SSR mit eigenem Daten-Loader statt Content Collections.

## Dateien

| Datei | Zweck |
|-------|-------|
| `config.ts` | Leere Collections-Config |

---

## Warum kein Content Collections?

### 1. SSR-Architektur

Wir verwenden Server-Side Rendering mit dynamischem Laden:
- Daten werden bei jedem Request aus `/data/{kingdom}/{slug}/` geladen
- Caching erfolgt über `src/lib/cache.ts`
- Keine Build-Time Generierung

### 2. Bestehende Datenstruktur

AMORPH hat bereits eine etablierte Datenstruktur:
```
data/
├── fungi/
│   ├── index.json
│   └── psilocybe-cyanescens/
│       ├── index.json
│       ├── chemistry.json
│       └── ...
└── ...
```

Content Collections würde eine Migration erfordern.

### 3. Flexibilität

SSR erlaubt:
- Dynamisches Laden basierend auf Request
- Cache-Invalidierung ohne Rebuild
- Real-time Daten-Updates

---

## Alternative: Eigener Loader

Statt Content Collections nutzen wir:

```typescript
// src/lib/species.ts
export async function getSpecies(slug: string): Promise<SpeciesData | null> {
  // Lade aus /data/{kingdom}/{slug}/
  // Mit Caching über src/lib/cache.ts
}
```

---

## Hinweise

Die `config.ts` Datei exportiert leere Collections um Astro-Fehler zu vermeiden:

```typescript
export const collections = {};
```
