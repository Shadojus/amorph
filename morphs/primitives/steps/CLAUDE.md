# Steps Morph

Nummerierte Prozessschritte mit Status.

## Datenstruktur

```typescript
// Array von Schritten
type StepsInput = Array<{
  step: number;
  label: string;
  status?: 'done' | 'current' | 'pending';
  icon?: string;
}>;

// Alternative Keys
type StepsInput = Array<{
  title: string;
  name: string;
  phase?: string;
}>;

// Beispiele
[
  { step: 1, label: "Vorbereitung", status: "done" },
  { step: 2, label: "Ausführung", status: "current" },
  { step: 3, label: "Kontrolle", status: "pending" },
  { step: 4, label: "Abschluss", status: "pending" }
]
```

## Erkennungsregeln

- **Typ:** `array`
- **Required:** 
  - Step-Key: `step`, `order`, `nummer`, `reihenfolge`
  - UND Action-Key: `action`, `beschreibung`, `text`, `label`
- **Optional:** `status`, `icon`
- **Priorität:** Nach lifecycle (steps ist linear)

```javascript
// Erkannte Kombinationen
[{ step: 1, label: "Vorbereitung" }]
[{ order: 1, action: "Sammeln" }]
[{ nummer: 1, text: "Putzen" }]
```

## Wann STEPS verwenden

✅ **Geeignet für:**
- **Lineare Prozesse** (Schritt für Schritt)
- Anleitungen
- Workflows
- Checklisten

❌ **Nicht verwenden für:**
- Zyklische Prozesse → `lifecycle`
- Zeitbasierte Events → `timeline`
- Phasen mit Dauer → `lifecycle`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `showNumbers` | boolean | true | Schrittnummern |
| `showConnectors` | boolean | true | Verbindungslinien |
| `highlightCurrent` | boolean | true | Aktuellen Schritt hervorheben |
| `orientation` | string | "horizontal" | horizontal / vertical |

## Signatur

```javascript
steps(wert: StepItem[], config?: StepsConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 54)

> **Prozessdiagramme:**
> - Schritte klar nummeriert
> - Status visuell unterscheidbar
> - Verbindungen zeigen Reihenfolge
> - Aktueller Schritt hervorgehoben

### Status-Visualisierung

| Status | Darstellung |
|--------|-------------|
| `done` | ✓ Grün, ausgefüllt |
| `current` | ● Hervorgehoben |
| `pending` | ○ Ausgegraut |

### Steps vs Timeline

| Aspekt | Steps | Timeline |
|--------|-------|----------|
| **Fokus** | Aktionen | Ereignisse |
| **Zeit** | Keine Daten | Exakte Daten |
| **Status** | done/current/pending | Keine |
