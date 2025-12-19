# AMORPH

Formlos. Zustandslos. Transformierend.

## Konzept

Datengetriebenes Transformations-Framework. Struktur der Daten bestimmt Darstellung.

DATEN (JSON) -> detectType() -> MORPH -> DOM

**Kirk-Prinzipien**: Visualisierung wird von Datenstruktur abgeleitet, nicht manuell definiert.

---

## Architektur

| Ordner | Zweck |
|--------|-------|
| src/ | Astro SSR Layer - SEO-Seiten, API Routes |
| core/ | Config, Pipeline, Detection, Container |
| config/ | YAML-Konfiguration, Schema-System |
| features/ | 6 Feature-Module (Header, Grid, Vergleich, etc.) |
| morphs/ | 43 Primitive + Compare-Morphs |
| observer/ | Debug und Analytics |
| util/ | DOM, Fetch, Router, Semantic, A11y |
| styles/ | Minimal Dark Theme |
| data/ | JSON-Testdaten (4 Kingdoms) |

---

## Performance-Architektur

Optimierte Suche ohne Full-Load:

1. App-Start -> Nur universe-index.json (~10KB)
2. Suche -> Nur Index durchsuchen
3. Grid-Ansicht -> Index-Daten anzeigen
4. Perspektive aktiv -> NUR aktive Perspektiven laden
5. Detail-Klick -> Alle Perspektiven fuer EINE Spezies

---

## Astro SSR

/ -> Homepage (SPA)
/{slug} -> SSR Species-Seite
/api/search -> Such-API
/sitemap.xml -> Dynamische Sitemap

Entwicklung:
npm run dev - Astro Dev-Server (Port 4321)
npm run build - Production Build
npm run start - Production Server

---

## 43 Primitive Morphs

Text: text, number, boolean, badge, tag, rating, progress
Charts: bar, pie, radar, sparkline, heatmap, gauge, slopegraph, severity
Container: list, object, hierarchy, range, stats
Temporal: timeline, lifecycle, steps, calendar
Specialized: image, link, map, network, citation, dosage, currency

---

## 15 Perspektiven

chemistry, conservation, culinary, cultivation, culture, ecology, economy,
geography, identification, interactions, medicine, research, safety, statistics, temporal

---

## 6 Features

header/ - Suche + Perspektiven
grid/ - Layout-Switcher
vergleich/ - Compare-View
einzelansicht/ - Detail-Modal
perspektiven/ - Perspektiven-Buttons
infinitescroll/ - Pagination

---

## Design-System: Minimal Dark Theme

- Subtile rgba(255,255,255,0.04-0.08) Backgrounds
- Kompakte Elemente (32px Header, 28px Buttons)
- 12px Grid-Gap, 8px Padding
- Responsive: 390px Mobile-First

---

## Debug-Konsole

window.amorphDebug.summary() - Stats
debug.config(msg, data) - Konfiguration
debug.render(msg, data) - Rendering

Aktivierung: config/observer.yaml -> debug: true

---

## Ordner-Dokumentation

Jeder Ordner enthaelt CLAUDE.md mit Details.
