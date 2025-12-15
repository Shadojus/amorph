# Link Morph

Klickbare URLs mit automatischer Erkennung.

## Datenstruktur

```typescript
// URL als String
type LinkInput = string;

// Beispiele
"https://example.com"
"http://localhost:3000"
"www.wikipedia.org"
"example.com"
```

## Erkennungsregeln

- **Typ:** `string`
- **Pattern:** `^https?://`, `^www.`, `.com$`, `.org$`, `.net$`
- **Priorität:** Nach image, vor text

## Wann LINK verwenden

✅ **Geeignet für:**
- URLs
- Webseiten-Links
- API-Endpunkte
- Externe Ressourcen

❌ **Nicht verwenden für:**
- Bildpfade mit Extension → `image`
- DOI-Links in Zitaten → `citation`
- Interne Navigation → eigene Logik

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `openInNewTab` | boolean | true | In neuem Tab öffnen |
| `showIcon` | boolean | true | Link-Icon anzeigen |
| `truncateUrl` | boolean | true | Lange URLs kürzen |
| `maxLength` | number | 50 | Max. angezeigte Länge |

## Signatur

```javascript
link(wert: string, config?: LinkConfig) → HTMLElement
```

## Kirk-Prinzip

> **Verknüpfung:** Links verbinden Daten mit externen Quellen. Sie erweitern den Kontext, ohne das Interface zu überladen.
