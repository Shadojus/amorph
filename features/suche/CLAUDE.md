# Feature: Suche

Durchsucht die Datenbank, lädt neue Morphs. Immer frisch.

## Übersicht

Das Suche-Feature bietet:
- Semantische Suche mit Keywords aus schema/semantik.yaml
- **View-aware Suche**: 
  - In **Grid-View**: Normale DB-Suche + Render
  - In **Vergleich-View**: Nur Highlights, KEINE DB-Suche!
- `matchedTerms` werden via Event an andere Features übergeben
- Live-Suche mit konfigurierbarem Debounce

**Hinweis**: Die Suche-Logik ist primär in `features/header/index.js` implementiert.

## Semantik aus schema/semantik.yaml

```yaml
# Keywords werden in Feldwerte übersetzt
suche:
  - input: essbar
    field: essbarkeit
    operator: equals
    values: [essbar, bedingt essbar]
    
  - input: chemie
    field: perspektive
    values: [chemie]
```

## Kernprinzip

```
Eingabe → Datenbank-Query → Neue Daten → Neu Rendern
```

Kein lokaler Cache. Kein Filtern im Browser. Die Datenbank ist die Wahrheit.

## Events

| Event | Beschreibung |
|-------|--------------|
| `header:suche:ergebnisse` | Query + Ergebnisse + matchedTerms + nurHighlights |
| `header:suche:fehler` | Bei Suchfehlern |
