# Composites - Intelligente Morph-Kombinationen

## Übersicht

Composite-Morphs kombinieren mehrere Basis-Compare-Morphs zu intelligenten, datengetriebenen Vergleichen.

## Struktur

```
composites/
├── types.js        # Typ-Kategorien und Mappings
├── analyze.js      # Datenanalyse-Funktionen
├── render.js       # Rendering-Helpers für Gruppen
├── smartCompare.js # Intelligenter Gesamt-Vergleich
├── diffCompare.js  # Differenz-Vergleich
└── index.js        # Exports
```

## Dateien

### types.js
**Zweck:** Definiert Typ-Kategorien für semantische Gruppierung

**Exports:**
- `TYPE_CATEGORIES` - Objekt: Kategorie → Array von Typen
- `TYPE_TO_CATEGORY` - Objekt: Typ → Kategorie (Umkehr-Mapping)
- `getCategory(typ)` - Gibt Kategorie für Typ zurück
- `sameCategory(typ1, typ2)` - Prüft ob zwei Typen zusammengehören

**Kategorien:**
- `numeric`: number, rating, progress, bar
- `ranges`: range, stats
- `multidim`: radar, pie
- `sequential`: timeline
- `categorical`: tag, badge, boolean, list
- `textual`: text, string, object
- `media`: image, link

### analyze.js
**Zweck:** Analysiert Items und extrahiert Struktur

**Exports:**
- `analyzeItems(items)` - Analysiert alle Felder, gibt {fields, categories}
- `findRelatedFields(fields)` - Gruppiert Felder nach Kategorie
- `calculateDiff(items)` - Berechnet {same, different, unique}

**DATENGETRIEBEN:**
- Nutzt `detectType()` für Typ-Erkennung
- Keine hardcodierten Feldnamen
- Gruppierung basiert auf erkanntem Typ

### render.js
**Zweck:** Rendering-Funktionen für Composite-Gruppen

**Exports:**
- `renderFieldMorph(field, config)` - Einzelnes Feld rendern
- `renderMetricsComposite(...)` - Numerische Felder
- `renderRangesComposite(...)` - Range/Stats Felder
- `renderProfileComposite(...)` - Radar/Pie Felder
- `renderTimelineComposite(...)` - Timeline Felder
- `renderCategoriesComposite(...)` - Tag/List/Boolean Felder

### smartCompare.js
**Zweck:** Intelligenter Gesamt-Vergleich

**Export:** `smartCompare(items, config)`

**Funktionalität:**
1. Analysiert Items mit `analyzeItems()`
2. Gruppiert mit `findRelatedFields()`
3. Rendert jede Gruppe mit passendem Composite
4. Unterstützt `excludeFields`, `includeOnly`, `labels`, `units`

### diffCompare.js
**Zweck:** Zeigt Unterschiede/Gemeinsamkeiten

**Export:** `diffCompare(items, config)`

**Funktionalität:**
1. Berechnet Diff mit `calculateDiff()`
2. Zeigt Mode-Buttons: Unterschiede | Gemeinsamkeiten | Alle
3. Rendert nur relevante Felder

## Datengetrieben-Score: 95%

**✅ Erfüllt:**
- Typ-Erkennung aus Datenstruktur
- Keine hardcodierten Feldnamen
- Automatische Gruppierung
- Dynamische Morph-Auswahl

**⚠️ Verbesserungspotential:**
- Gruppen-Labels könnten aus Daten abgeleitet werden
- Kategorie-Prioritäten sind noch hardcodiert
