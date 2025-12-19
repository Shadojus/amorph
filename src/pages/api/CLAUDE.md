# src/pages/api/

Astro API Routes für serverseitige Endpunkte.

## Dateien

| Datei | Zweck |
|-------|-------|
| `search.ts` | Such-API für Species |

---

## search.ts

REST-API für Spezies-Suche.

### Endpoint

```
GET /api/search?q=<query>
```

### Query-Parameter

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `q` | string | Suchbegriff (required) |

### Response (200 OK)

```json
{
  "results": [
    {
      "slug": "psilocybe-cyanescens",
      "name": "Blauender Kahlkopf",
      "wissenschaftlicher_name": "Psilocybe cyanescens",
      "kingdom": "fungi",
      "url": "/psilocybe-cyanescens"
    }
  ],
  "query": "psilocybe",
  "count": 1
}
```

### Response (leere Query)

```json
{
  "results": [],
  "query": "",
  "count": 0
}
```

### Response (500 Error)

```json
{
  "error": "Search failed",
  "results": [],
  "query": "...",
  "count": 0
}
```

### Caching

- **TTL**: 5 Minuten für Suchergebnisse
- **Leere Queries**: Kein Cache
- **Header**: `Cache-Control: public, max-age=300, stale-while-revalidate=600`

---

## Implementierung

```typescript
import type { APIRoute } from 'astro';
import { searchSpecies } from '../../lib/species';
import { CACHE_TTL, getCacheHeaders } from '../../lib/cache';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q') || '';
  
  if (!query.trim()) {
    return new Response(JSON.stringify({ 
      results: [], query: '', count: 0 
    }), { status: 200, headers: { 'Content-Type': 'application/json' }});
  }
  
  const results = await searchSpecies(query);
  
  return new Response(JSON.stringify({
    results: results.map(s => ({
      slug: s.slug,
      name: s.name,
      wissenschaftlicher_name: s.wissenschaftlicher_name,
      kingdom: s.kingdom,
      url: `/${s.slug}`
    })),
    query,
    count: results.length
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...getCacheHeaders(CACHE_TTL.search)
    }
  });
};
```

---

## Verwendung im Frontend

```javascript
// Fetch API
const response = await fetch('/api/search?q=pilz');
const { results, count } = await response.json();

// Mit URL-Encoding
const query = encodeURIComponent('Blauer Kahlkopf');
const response = await fetch(`/api/search?q=${query}`);
```

---

## Erweiterungen (geplant)

- `GET /api/species/{slug}` - Einzelne Species
- `GET /api/kingdoms` - Alle Kingdoms mit Counts
- `GET /api/perspectives` - Verfügbare Perspektiven
