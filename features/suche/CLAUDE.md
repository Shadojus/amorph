# Feature: Suche

Semantische Suche mit View-Awareness.

## Verhalten

- **Grid-View**: DB-Suche + Render
- **Vergleich-View**: Nur Highlights

## Semantik

```yaml
# schema/semantik.yaml
suche:
  - input: essbar
    field: essbarkeit
    operator: equals
    values: [essbar, bedingt essbar]
```

## Events

| Event | Beschreibung |
|-------|--------------|
| `header:suche:ergebnisse` | Query + Ergebnisse |
| `header:suche:fehler` | Bei Fehlern |
