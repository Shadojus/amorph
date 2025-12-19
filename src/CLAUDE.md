# src/

Astro SSR Layer für SEO-optimierte Server-Seiten.

> **Zweck**: Search Engines und AI Crawlers bekommen echte HTML-Seiten statt JavaScript-SPA.
> **Architektur**: Astro SSR mit In-Memory Cache, Islands Architecture für interaktive Teile.

## Ordner-Struktur

| Ordner | Zweck |
|--------|-------|
| `components/` | Astro-Komponenten (Wiederverwendbar) |
| `content/` | Content Collections Config (leer - wir nutzen SSR) |
| `layouts/` | Seiten-Layouts mit SEO-Meta-Tags |
| `lib/` | Cache-Layer und Daten-Loader |
| `pages/` | Astro-Seiten (SSR + API Routes) |

## Dateien

| Datei | Zweck |
|-------|-------|
| `amorph.js` | Re-Export des AMORPH SPA für Client-Side Islands |

---

## SSR-Architektur

```
Request → Astro SSR → Cache-Check → Response
                ↓
         Cache Miss?
                ↓
    Lade Daten aus /data/{kingdom}/{slug}/
                ↓
    Rendere HTML mit SEO-Meta-Tags
                ↓
    Speichere in Cache (TTL: 24h)
                ↓
    Response mit Cache-Control Headers
```

---

## Cache-Strategie

| Route | TTL | Beschreibung |
|-------|-----|--------------|
| `/{slug}` | 24h | Species-Seiten |
| `/api/search` | 5min | Such-Ergebnisse |
| `/sitemap.xml` | 24h | Sitemap |
| `/` | 0 | Homepage (SPA lädt client-side) |

---

## SEO-Features

### HTML Meta-Tags
- `<title>` mit Species-Name
- `<meta name="description">` aus Index
- Open Graph Tags für Social Media
- Canonical URLs

### Structured Data (JSON-LD)
- Schema.org `Thing` / `Species`
- BreadcrumbList für Navigation
- FAQPage wenn FAQ-Daten vorhanden

### HTTP Headers
- `Cache-Control: public, max-age=86400, stale-while-revalidate=172800`
- `ETag` für Conditional Requests (304 Not Modified)

---

## Entwicklung

```bash
npm run dev      # Astro Dev-Server (Port 4321)
npm run build    # Production Build
npm run start    # Production Server starten
npm run preview  # Preview Production Build
```

---

## Deployment

Nach `npm run build`:
- `dist/server/entry.mjs` ist der Node.js Server
- `dist/client/` enthält statische Assets
- Starten mit `node dist/server/entry.mjs`

Umgebungsvariablen:
- `PORT` - Server-Port (Default: 4321)
- `HOST` - Server-Host (Default: localhost)
