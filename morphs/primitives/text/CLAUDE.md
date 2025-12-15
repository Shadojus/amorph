# Text Morph

Einfache Textdarstellung für String-Werte.

## Datenstruktur

```typescript
// Einfacher String
type TextInput = string;

// Beispiele
"Dies ist ein Text"
"Beschreibung des Objekts..."
```

## Erkennungsregeln

- **Typ:** `string`
- **Fallback:** Ja (Standard für nicht zugeordnete Strings)
- **Priorität:** Niedrigste (nach allen anderen String-Morphs)

## Wann TEXT verwenden

✅ **Geeignet für:**
- Beschreibungen
- Lange Textinhalte
- Unstrukturierte Strings
- Fallback für unbekannte Strings

❌ **Nicht verwenden für:**
- URLs → `link`
- Bildpfade → `image`
- Status-Keywords → `badge`
- Kurze Kategorien → `tag`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `maxLength` | number | 500 | Maximale Textlänge |
| `truncate` | boolean | true | Text kürzen wenn zu lang |
| `showMore` | boolean | true | "Mehr anzeigen" Button |

## Signatur

```javascript
text(wert: string, config?: TextConfig) → HTMLElement
```

## Kirk-Prinzip

> **Klarheit vor Dekoration:** Text wird ohne unnötige Verzierungen dargestellt. Der Inhalt steht im Vordergrund.
