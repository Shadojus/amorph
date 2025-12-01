# Konfiguration

Eine Datei = Ein Aspekt. **Schema ist die Single Source of Truth.**

## 🚧 AKTUELLER STAND

### Implementiert
- ✅ Black Glasmorphism Design
- ✅ 4-Farben-Grid pro Perspektive (Multi-Color Glow)
- ✅ Semantische Suche aus Schema
- ✅ Auto-Perspektiven bei Suchergebnissen

### TODO für Feld-Auswahl
- Eventuell: Schema erweitern um `auswaehlbar: true/false` pro Feld

## Dateien

```
config/
├── manifest.yaml      ← Was ist das?
├── daten.yaml         ← Woher kommen Daten?
├── schema.yaml        ← WAS sind die Daten? (SINGLE SOURCE OF TRUTH)
├── morphs.yaml        ← Wie darstellen? (nutzt Schema)
├── observer.yaml      ← Was beobachten?
└── features.yaml      ← Was ist aktiv? (nutzt Schema)
```

## Schema-First Prinzip

**Alles kommt aus `schema.yaml`:**
- Felder und ihre Typen → `morphs.yaml` muss sie nicht duplizieren
- Perspektiven → `features.yaml` muss sie nicht duplizieren
- Suchfelder und Gewichtung → automatisch aus Schema
- Versteckte Felder → werden nicht gerendert

```yaml
# schema.yaml - EINE Datei für alles Domänen-spezifische
felder:
  name:
    typ: string           # → Morph-Typ
    label: Name           # → UI-Label
    suche:                # → Suchverhalten
      gewicht: 100
  
  essbarkeit:
    typ: tag
    versteckt: false      # → Wird gerendert

perspektiven:
  kulinarisch:            # → Feature nutzt das
    name: Kulinarisch
    symbol: 🍳
    keywords: [kochen, rezept]
```

**Vorteile:**
- Domäne ändern = nur schema.yaml anpassen
- Keine Duplikation zwischen Dateien
- Automatische Konsistenz

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

Woher die Daten kommen. **Schema wird aus schema.yaml geladen!**

```yaml
quelle:
  typ: json
  url: ./data/items.json  # Projekt-spezifisch

# Alternativen:
# quelle:
#   typ: pocketbase
#   url: https://api.example.com
#   sammlung: items

# quelle:
#   typ: rest
#   url: https://api.example.com/items
#   headers:
#     Authorization: Bearer ${API_TOKEN}
```

**Pflichtfelder**: `quelle`, `quelle.typ`, `quelle.url`

## schema.yaml (NEU - Single Source of Truth)

Definiert die Datenstruktur, Suchverhalten und Perspektiven.

```yaml
# Felder und ihre Typen
felder:
  id:
    typ: number
    versteckt: true       # Wird nicht gerendert
  
  name:
    typ: string
    label: Name
    suche:
      gewicht: 100        # Höchste Priorität bei Suche
      exakt: true
  
  kategorie:
    typ: tag
    label: Kategorie
    suche:
      gewicht: 50

# Semantische Suche
semantik:
  aktiv:
    keywords: [aktiv, verfügbar, online]
    feld: status
    werte: [aktiv, online]
    score: 50

# Perspektiven (für UI-Filter mit 4-Farben-Grid)
perspektiven:
  details:
    name: Details
    symbol: 📋
    farben:              # 4 harmonische Farben
      - \"#5aa0d8\"      # Hauptfarbe
      - \"#4888c0\"      # Sekundär
      - \"#70b8f0\"      # Hell
      - \"#3870a8\"      # Dunkel
    felder: [name, beschreibung]
    keywords: [detail, info]
```

## morphs.yaml

Nur noch für Morph-spezifische Konfiguration. **Feld-Typen kommen aus Schema!**

```yaml
# Feld→Morph Mappings kommen aus schema.yaml/felder[].typ
# Diese Datei nur für Fallback-Regeln und Morph-Config

regeln:
  - typ: range
    morph: range
  - typ: string
    maxLaenge: 20
    morph: tag

config:
  tag:
    farben:
      aktiv: "#22c55e"
      fehler: "#ef4444"
  range:
    visualisierung: true
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

Welche Features aktiv sind. **Perspektiven-Liste kommt aus Schema!**

```yaml
aktiv:
  - header    # Kombiniert suche + perspektiven
  - grid

suche:
  live: true
  debounce: 300
  limit: 50
  placeholder: "Suchen..."
  # suchfelder kommen automatisch aus schema.yaml

perspektiven:
  maxAktiv: 4
  # liste kommt automatisch aus schema.yaml/perspektiven!

grid:
  default: grid
  layouts:
    - liste
    - grid
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
