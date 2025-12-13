# Feature: Suche

Semantische Suche mit View-Awareness.

## Verhalten

- **Grid-View**: DB-Suche + Render
- **Vergleich-View**: Nur Highlights, keine DB-Suche

## Semantik

```yaml
# schema/semantik.yaml
suche:
  - input: essbar
    field: essbarkeit
    operator: equals
    values: [essbar, bedingt essbar]
```

## Prinzip

```
Eingabe → DB-Query → Neue Daten → Neu Rendern
```

Kein lokaler Cache. DB ist Wahrheit.

## Events

| Event | Beschreibung |
|-------|--------------|
| `header:suche:ergebnisse` | Query + Ergebnisse + matchedTerms |
| `header:suche:fehler` | Bei Fehlern |

## CSS

- `.amorph-suche` - Suchfeld-Container
- `.amorph-suche input` - Input-Feld
- `.amorph-aktive-filter` - Aktive Perspektiven-Badges
