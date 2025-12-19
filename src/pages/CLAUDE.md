# src/pages/

Astro SSR Seiten und API Routes.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.astro` | Homepage mit AMORPH SPA |
| `[slug].astro` | Dynamische Species-Seiten (SSR) |
| `sitemap.xml.ts` | Dynamische Sitemap |
| `api/search.ts` | Such-API Route |

---

## index.astro

Homepage - lädt das AMORPH SPA client-side.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="AMORPH - Artenvielfalt erkunden">
  <div id="amorph-root"></div>
  <script type="module" src="/index.js"></script>
</BaseLayout>
```

**Kein Cache**: SPA lädt dynamisch, kein Server-Rendering der Daten.

---

## [slug].astro

Server-Side Rendered Species-Seiten.

### SSR-Modus

```astro
---
export const prerender = false;  // SSR, nicht SSG
---
```

### Ablauf

1. Slug aus URL extrahieren
2. Species aus Cache oder Dateisystem laden
3. Perspektiven-Daten laden
4. Cache-Headers setzen
5. HTML rendern mit SpeciesLayout

### Cache-Headers

```typescript
Astro.response.headers.set('Cache-Control', 
  'public, max-age=86400, stale-while-revalidate=172800');
Astro.response.headers.set('ETag', '"..."');
```

### Conditional Request

```astro
---
const clientEtag = Astro.request.headers.get('If-None-Match');
if (clientEtag && isValidEtag(key, clientEtag)) {
  return new Response(null, { status: 304 });
}
---
```

---

## sitemap.xml.ts

Dynamische Sitemap-Generierung.

### Route

`GET /sitemap.xml`

### Funktionen

- Lädt alle Species aus `getAllSpeciesSlugs()`
- Generiert XML mit allen URLs
- 24h Cache

### Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://amorph.funginomi.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://amorph.funginomi.com/psilocybe-cyanescens</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## api/search.ts

Such-API Route.

### Route

`GET /api/search?q=<query>`

### Response

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

### Caching

- 5 Minuten Cache für Suchergebnisse
- Leere Queries: Kein Cache

### Fehler

```json
{
  "error": "Search failed",
  "results": [],
  "query": "...",
  "count": 0
}
```

---

## URL-Struktur

| URL | Datei | Beschreibung |
|-----|-------|--------------|
| `/` | index.astro | Homepage (SPA) |
| `/{slug}` | [slug].astro | Species-Seite (SSR) |
| `/sitemap.xml` | sitemap.xml.ts | Sitemap (API) |
| `/api/search` | api/search.ts | Such-API |

---

## Hinweise

- **prerender = false**: Alle Seiten sind SSR, nicht statisch generiert
- **Error Handling**: 404 für unbekannte Slugs
- **Cache-Invalidierung**: Manuell durch Server-Neustart oder Cache.clear()
