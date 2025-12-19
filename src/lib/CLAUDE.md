# src/lib/

Cache-Layer und Daten-Loader für Astro SSR.

## Dateien

| Datei | Zeilen | Zweck |
|-------|--------|-------|
| `cache.ts` | ~110 | In-Memory Cache mit TTL, ETag-Support |
| `species.ts` | ~130 | Species-Daten Loader mit Caching |

---

## cache.ts

In-Memory Cache für SSR-Performance.

### Cache-Konfiguration (CACHE_TTL)

```typescript
CACHE_TTL = {
  species: 86400,   // 24h - Species-Seiten
  sitemap: 86400,   // 24h - Sitemap
  search: 300,      // 5min - Such-Ergebnisse
  index: 3600,      // 1h - Kingdom Index
  home: 0           // Kein Cache - SPA
}
```

### Funktionen

```typescript
// Wert aus Cache holen
get<T>(key: string): { data: T; etag: string } | null

// Wert in Cache speichern
set<T>(key: string, data: T, ttlSeconds: number): { etag: string }

// Cache-Eintrag löschen
del(key: string): boolean

// Cache komplett leeren
clear(): void

// Cache-Statistiken
stats(): { size: number; keys: string[] }

// ETag-Validierung (für 304 Not Modified)
isValidEtag(key: string, clientEtag: string): boolean
```

### Cache-Key Generatoren

```typescript
cacheKey = {
  species: (slug) => `species:${slug}`,
  search: (query) => `search:${query.toLowerCase().trim()}`,
  index: (kingdom) => `index:${kingdom}`,
  sitemap: () => 'sitemap'
}
```

### HTTP Cache-Headers

```typescript
getCacheHeaders(ttlSeconds: number, etag?: string): Record<string, string>
// Returns:
// - 'Cache-Control': 'public, max-age=..., stale-while-revalidate=...'
// - 'ETag': '"..."' (wenn vorhanden)
```

---

## species.ts

Lädt Species-Daten aus dem Dateisystem mit Caching.

### Typen

```typescript
interface SpeciesData {
  slug: string;
  kingdom: Kingdom;  // 'fungi' | 'plantae' | 'animalia' | 'bacteria'
  name: string;
  wissenschaftlicher_name?: string;
  data: Record<string, any>;
}

interface SpeciesIndex {
  kingdom: Kingdom;
  species: Array<{
    slug: string;
    name: string;
    wissenschaftlicher_name?: string;
  }>;
}
```

### Funktionen

```typescript
// Alle Species-Slugs laden (für Sitemap)
getAllSpeciesSlugs(): Promise<Array<{ slug: string; kingdom: Kingdom }>>

// Species-Daten laden (mit Cache)
getSpecies(slug: string): Promise<SpeciesData | null>

// Kingdom-Index laden
getKingdomIndex(kingdom: Kingdom): Promise<SpeciesIndex | null>

// Suche in allen Species
searchSpecies(query: string): Promise<SpeciesData[]>

// Kingdom-Statistiken
getKingdomStats(): Promise<Array<{ kingdom: Kingdom; count: number }>>
```

### Daten-Pfade

```
data/{kingdom}/{slug}/index.json    # Haupt-Daten
data/{kingdom}/{slug}/data.json     # Alternative
data/{kingdom}/index.json           # Kingdom-Index
```

---

## Verwendung in Astro Pages

```astro
---
import { getSpecies } from '../lib/species';
import { CACHE_TTL, getCacheHeaders, cacheKey, get } from '../lib/cache';

const species = await getSpecies(slug);

// Cache-Headers setzen
const key = cacheKey.species(slug);
const cached = get(key);
const headers = getCacheHeaders(CACHE_TTL.species, cached?.etag);

for (const [header, value] of Object.entries(headers)) {
  Astro.response.headers.set(header, value);
}
---
```

---

## Hinweise

- **Production**: Für Skalierung Redis oder ähnliches verwenden statt In-Memory
- **TTL**: Anpassbar in `CACHE_TTL` Konstanten
- **ETag**: Basiert auf JSON-Hash der Daten

---

## ssr-morphs.ts

**Server-Side Morph Renderer** für SEO-optimiertes HTML.

### Strategie

1. Server rendert SEO-freundliches HTML mit SSR-Morphs
2. CSS-Styles in `src/styles/ssr.css`
3. Crawler/AI sehen vollständig strukturierte Daten
4. Client kann optional mit AMORPH-Morphs hydrieren

### Funktionen

```typescript
// Typ eines Wertes erkennen (wie Client-Pipeline)
detectType(value: any, key?: string): MorphType

// Einzelnen Wert rendern
renderValue(value: any, type?: MorphType): string

// Feld mit Label rendern
renderField(key: string, value: any): string

// Alle Felder eines Objekts
renderFields(data: Record<string, any>): string

// Perspektive rendern
renderPerspective(id: string, data: Record<string, any>, label?: string): string

// Komplette Species-Seite
renderSpeciesContent(species: SpeciesData, perspectives: Record<string, any>, labels?: Record<string, string>): string
```

### Unterstützte Morph-Typen

| Typ | Darstellung | Beispiel |
|-----|-------------|----------|
| `badge` | Farbcodierter Status | `<span class="ssr-badge badge-success">edible</span>` |
| `rating` | Sterne (0-10) | `★★★★☆ 4/10` |
| `progress` | Fortschrittsbalken (11-100) | `<div class="ssr-progress">75%</div>` |
| `tags` | Tag-Cloud | `<div class="ssr-tags">...</div>` |
| `list` | Ungeordnete Liste | `<ul class="ssr-list">...</ul>` |
| `boolean` | Check/Cross | `✓` / `✗` |
| `range` | Min-Max | `10–20 mm` |
| `stats` | Wert + Einheit | `**60** %` |
| `timeline` | Zeitliche Events | Vertikale Timeline |
| `steps` | Nummerierte Schritte | `<ol>` mit Countern |
| `object` | Verschachtelt | `<dl class="ssr-object">` |
| `link` | Klickbar | `<a href="...">` |
| `image` | Lazy-Load Bild | `<img loading="lazy">` |
| `text` | Escaped Text | `<span class="ssr-text">` |
| `number` | Formatierte Zahl | `1.234,56` |

### Badge-Farben

```typescript
badge-success: edible, safe, good, active, yes, available
badge-danger:  toxic, deadly, danger, critical
badge-warning: caution, warning, medium
badge-muted:   inactive, no, unavailable, poor
badge-default: alle anderen
```

### Verwendung

```astro
---
import { renderSpeciesContent } from '../lib/ssr-morphs';

const ssrHtml = renderSpeciesContent(species, perspectives, {
  chemistry: '🧪 Chemie',
  ecology: '🌿 Ökologie'
});
---

<div class="ssr-content" set:html={ssrHtml} />
```
