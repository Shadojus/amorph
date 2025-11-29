# Konfiguration

Eine Datei = Ein Aspekt. Flach und lesbar.

## Dateien

```
config/
├── manifest.yaml      ← Was ist das?
├── daten.yaml         ← Woher kommen Daten?
├── morphs.yaml        ← Wie darstellen?
├── observer.yaml      ← Was beobachten?
└── features.yaml      ← Was ist aktiv?
```

Keine Vererbung. Keine Referenzen zwischen Dateien. Keine Magie.

## manifest.yaml

Metadaten über die Anwendung.

```yaml
name: Funginomi
beschreibung: Pilz-Wissenssammlung
version: 1.0.0
sprache: de
```

**Pflichtfelder**: `name`

## daten.yaml

Woher die Daten kommen.

```yaml
quelle:
  typ: pocketbase
  url: https://api.funginomi.de
  sammlung: pilze

# Oder REST API
quelle:
  typ: rest
  url: https://api.example.com/data
  headers:
    Authorization: Bearer ${API_TOKEN}

# Oder statische JSON
quelle:
  typ: json
  url: ./data/pilze.json

schema:
  id: string
  name: string
  essbarkeit: string
  temperatur:
    typ: range
    einheit: °C
```

**Pflichtfelder**: `quelle`, `quelle.typ`, `quelle.url`

## morphs.yaml

Wie Daten dargestellt werden.

```yaml
# Explizite Feld-Zuweisung
felder:
  name: text
  essbarkeit: tag
  temperatur: range
  beschreibung: text

# Automatische Regeln
regeln:
  - typ: range
    morph: range
  - typ: string
    maxLaenge: 20
    morph: tag
  - typ: array
    morph: list

# Morph-spezifische Konfiguration
config:
  range:
    visualisierung: true
    skala:
      min: -20
      max: 40
  tag:
    farben:
      essbar: "#22c55e"
      giftig: "#ef4444"
      unbekannt: "#9ca3af"
```

## observer.yaml

Was beobachtet wird und wohin gemeldet.

```yaml
interaktion:
  ziel:
    typ: redis
    url: /api/redis-bridge
    stream: events:klicks

rendering:
  ziel:
    typ: console
    level: debug

session:
  ziel:
    typ: http
    url: /api/analytics
    batch: true
```

**Target-Typen**:
- `console` - Browser Console
- `http` - REST Endpoint
- `websocket` - WebSocket Connection
- `redis` - Redis via HTTP Bridge

## features.yaml

Welche Features aktiv sind.

```yaml
aktiv:
  - suche
  - perspektiven
  - grid

suche:
  live: true
  debounce: 300
  limit: 50

perspektiven:
  maxAktiv: 4
  liste:
    - id: kulinarisch
      name: Kulinarisch
      symbol: 🍳
      farbe: "#22c55e"

grid:
  default: grid
  layouts:
    - liste
    - grid

# Externe Features
extern:
  meinFeature: ./features/mein-feature.js
```

## Umgebungsvariablen

Secrets nie direkt in YAML. Nutze `${VAR}`:

```yaml
quelle:
  url: ${DATABASE_URL}
  headers:
    Authorization: Bearer ${API_TOKEN}
```

Werden beim Laden ersetzt.

## Validierung

```javascript
// config/schema.js
export const schemas = {
  manifest: {
    pflicht: ['name'],
    optional: ['beschreibung', 'version', 'sprache']
  },
  daten: {
    pflicht: ['quelle', 'quelle.typ', 'quelle.url'],
    optional: ['schema']
  },
  morphs: {
    pflicht: [],
    optional: ['felder', 'regeln', 'config']
  },
  observer: {
    pflicht: [],
    optional: ['interaktion', 'rendering', 'session']
  },
  features: {
    pflicht: [],
    optional: ['aktiv', 'extern']
  }
};

export function validate(config) {
  const fehler = [];
  
  for (const [name, schema] of Object.entries(schemas)) {
    if (!config[name] && schema.pflicht.length > 0) {
      fehler.push(`${name}.yaml fehlt`);
      continue;
    }
    
    for (const feld of schema.pflicht) {
      if (!getNestedValue(config[name], feld)) {
        fehler.push(`${name}.yaml: ${feld} fehlt`);
      }
    }
  }
  
  return fehler;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}
```

## Beispiel: Vollständige Konfiguration

```yaml
# manifest.yaml
name: Meine App
version: 1.0.0

# daten.yaml  
quelle:
  typ: rest
  url: https://api.example.com/items

# morphs.yaml
felder:
  titel: text
  preis: number
  tags: list
config:
  number:
    dezimalen: 2
    einheit: €

# observer.yaml
rendering:
  ziel:
    typ: console

# features.yaml
aktiv:
  - suche
  - grid
suche:
  live: true
```

Das ist alles. Keine 500-Zeilen Konfigurationsdateien.
