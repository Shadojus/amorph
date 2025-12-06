# Konfiguration

Eine Datei = Ein Aspekt. YAML als Single Source of Truth.

## Dateien

```
config/
├── manifest.yaml   ← App-Name, Version, Titel
├── daten.yaml      ← Datenquelle (JSON-Pfad)
├── schema.yaml     ← Feld-Definitionen, Perspektiven
├── morphs.yaml     ← Morph-Config, Typ-Erkennung
├── features.yaml   ← Aktive Features
└── observer.yaml   ← Debug, Analytics
```

## manifest.yaml

```yaml
name: funginomi
version: 1.0.0
titel: FUNGINOMI - Pilz-Explorer
```

## schema.yaml

Definiert Perspektiven und Felder:

```yaml
perspektiven:
  - id: kulinarisch
    name: Kulinarisch
    symbol: 🍳
    farben: ["#22c55e", "#10b981", "#059669", "#047857"]
    felder: [geschmack, zubereitung, essbar]
```

## morphs.yaml

Automatische Typ-Erkennung:

```yaml
erkennung:
  rating:
    min: 0
    max: 10
    dezimalstellen: true
  badge:
    keywords: [essbar, giftig, aktiv, inaktiv]
```

## Datengetriebene Erkennung

Pipeline erkennt Morphs automatisch aus Datenstruktur:

| Datenstruktur | Erkannter Morph |
|---------------|-----------------|
| `{ min: 0, max: 10 }` | `range` |
| `{ min, max, avg }` | `stats` |
| `[{ axis, value }]` (3+) | `radar` |
| `"essbar"` (keyword) | `badge` |
| `4.5` (0-10, dezimal) | `rating` |
