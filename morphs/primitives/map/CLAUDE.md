# Map Morph

Geografische Karten-Darstellung mit Koordinaten.

## Datenstruktur

```typescript
type MapInput = {
  lat: number;
  lng: number;
  label?: string;
  region?: string;
  distribution?: string;
};

// Alternative Keys
type MapInput = {
  latitude: number;
  longitude: number;
};

// Beispiele
{ lat: 52.52, lng: 13.405 }
{ lat: 48.8566, lng: 2.3522, label: "Paris" }
{ latitude: 35.6762, longitude: 139.6503, region: "Asien" }
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `lat` + `lng` (oder `latitude` + `longitude`)
- **Optional:** `coordinates`, `region`, `distribution`
- **Priorität:** Höchste (spezifisches Muster)

## Wann MAP verwenden (Kirk)

✅ **Geeignet für:**
- **Geografische Koordinaten**
- Standorte
- Verbreitungsgebiete
- Fundorte

❌ **Nicht verwenden für:**
- Regionale Verteilungen ohne Koordinaten → `badge` mit Region
- Kategorische Geografien → `tag`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `defaultZoom` | number | 5 | Zoom-Level |
| `tileProvider` | string | "openstreetmap" | Karten-Provider |
| `staticFallback` | boolean | true | Statisches Bild als Fallback |
| `showMarker` | boolean | true | Marker anzeigen |
| `showCoordinates` | boolean | true | Koordinaten anzeigen |

## Signatur

```javascript
map(wert: MapObject, config?: MapConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 83, 86)

> **Geografische Visualisierungen:**
> - **Choropleth Maps:** Regionen einfärben (Seite 83)
> - **Symbol Maps:** Punkte auf Karten
> - **Flow Maps:** Bewegungen visualisieren (Seite 86)
> - Projektion beachten (Mercator verzerrt!)

### Karten-Typen (Kirk)

| Typ | Verwendung |
|-----|------------|
| **Symbol Map** | Einzelne Punkte (dieser Morph) |
| **Choropleth** | Regionen färben |
| **Flow Map** | Bewegungen, Routen |
| **Dot Density** | Viele kleine Punkte |

### Wichtige Hinweise

- Leaflet als interaktive Karte
- Fallback: Statisches Bild
- Koordinaten-Validierung wichtig
- Zoom angemessen wählen
