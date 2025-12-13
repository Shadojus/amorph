# Primitives

28+ Basis-Morphs für Datenvisualisierung.

## Struktur

```
primitives/
├── index.js      ← Export aller Morphs
├── index.yaml    ← Shared Settings
├── index.css     ← Shared Styles
│
├── badge/        ← Status-Badges
├── bar/          ← Balkendiagramme
├── boolean/      ← Ja/Nein
├── image/        ← Bilder
├── list/         ← Listen
├── number/       ← Zahlen
├── object/       ← Key-Value
├── pie/          ← Tortendiagramme
├── progress/     ← Fortschritt
├── radar/        ← Spider-Charts
├── range/        ← Min-Max
├── rating/       ← Sterne
├── stats/        ← Statistiken
├── tag/          ← Tags
├── text/         ← Text
├── timeline/     ← Zeitachse
└── ...           ← Weitere (gauge, calendar, etc.)
```

## Prinzipien

1. **Keine Domain-Logik** - "Pilz" verboten
2. **Reine Funktionen** - Kein State
3. **Datengetrieben** - Struktur bestimmt Darstellung

## Signatur

```javascript
function morph(wert, config) → HTMLElement
```
