# Image Morph

Bilddarstellung mit Lazy Loading.

## Datenstruktur

```typescript
// Bildpfad als String
type ImageInput = string;

// Beispiele
"./images/pilz.jpg"
"https://example.com/image.png"
"data:image/png;base64,..."
"/assets/photo.webp"
```

## Erkennungsregeln

- **Typ:** `string`
- **Pattern:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- **Pattern:** `data:image/` (Base64)
- **Priorität:** Hoch (vor link, text)

## Wann IMAGE verwenden

✅ **Geeignet für:**
- Fotos
- Grafiken
- Icons (als Bild)
- Base64-codierte Bilder

❌ **Nicht verwenden für:**
- SVG-Code (inline) → spezieller Handler
- URLs ohne Bild-Endung → `link`
- Text mit Bildpfad → eigene Logik

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `lazyLoad` | boolean | true | Lazy Loading aktivieren |
| `fallbackImage` | string | null | Fallback bei Fehler |
| `maxWidth` | string | "100%" | Maximale Breite |
| `aspectRatio` | string | auto | Seitenverhältnis |
| `allowedDomains` | string[] | [localhost] | Erlaubte Domains |

## Signatur

```javascript
image(wert: string, config?: ImageConfig) → HTMLElement
```

## Kirk-Prinzip

> **Bilder ergänzen Daten:** Bilder liefern Kontext, den Zahlen nicht vermitteln können. Lazy Loading sorgt für Performance bei vielen Bildern.
