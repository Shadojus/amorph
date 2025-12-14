# Feature: Suche

Semantische Suche mit View-Awareness.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.js` | Feature-Entry, Such-Logik |
| `suche.css` | Suche-Styles |

## Verhalten

- **Grid-View**: DB-Suche + Render (DataSource.search)
- **Vergleich-View**: Nur Highlights in bestehenden Items

## Semantik (aus schema/semantik.yaml)

```yaml
suche:
  - input: essbar
    field: essbarkeit
    operator: equals
    values: [essbar, bedingt essbar]
  
  - input: giftig
    field: toxizitaet
    operator: gt
    value: 50
```

## Features

- **Fuzzy-Matching**: Toleriert Tippfehler
- **Semantische Suche**: "essbar" findet Essbarkeit-Felder
- **matchedTerms**: Welche Begriffe gematcht haben
- **Highlighting**: Treffer in Grid/Vergleich hervorheben

## Events

| Event | Richtung | Beschreibung |
|-------|----------|--------------|
| `header:suche:ergebnisse` | OUT | Query + items + matchedTerms |
| `header:suche:fehler` | OUT | Bei Fehlern |

## API

```javascript
dataSource.search(query) → Promise<items>

// Mit Scoring
semanticScore(item, query) → number  // 0-100
```

## matchedTerms

```javascript
{
  query: "essbar pilz",
  matchedTerms: new Set(['essbar', 'pilz']),
  items: [...]
}
```

Wird für Highlighting in Grid und Vergleich genutzt.
