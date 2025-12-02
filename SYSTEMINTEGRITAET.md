# 🔍 AMORPH v5 - Systemintegritäts-Analyse

**Datum**: 02.12.2025  
**Analyst**: Claude (KI-Assistent)  
**Anlass**: Kritische Überprüfung der Architektur-Konformität

---

## ✅ KORREKTUR-STATUS

**Update 02.12.2025**: Alle kritischen Verstöße wurden behoben!

| Bereich | Status | Korrektur |
|---------|--------|-----------|
| Schema → Morph Zuweisungen | ✅ BEHOBEN | Alle `typ:` aus Feldern entfernt |
| Perspektiven-Morphs | ✅ BEHOBEN | Alle `morphs:` Blocks aus 6 Perspektiven entfernt |
| Hardcoded Type Detection | ✅ BEHOBEN | Detection jetzt aus `morphs.yaml → erkennung` |
| Hardcoded Feld-Handler | ✅ BEHOBEN | `feldHandler` aus `compare.js` entfernt |
| Hardcoded Farben | ✅ BEHOBEN | Farben jetzt aus `morphs.yaml → farben` |
| **Hardcoded console.log** | ✅ BEHOBEN | 22+ Logs auf zentrales `debug.*` System umgestellt |

---

## 🔄 Observer-System

Das Observer-System ist jetzt **konsequent implementiert**:

- **debug.js**: Zentraler Debug-Observer mit allen Kategorien
- **Neue Kategorien**: `vergleich`, `detail`, `compare`, `semantic`
- **Bereinigt**: Alle `console.log` aus Anwendungscode entfernt
- **Verbleibend (OK)**: Build-Scripts, CLI-Tools, Startup-Logs

```javascript
// ❌ FALSCH - Hardcoded console.log
console.log('%c[VERGLEICH] ...', 'background:...');

// ✅ RICHTIG - Zentrales Debug-System
debug.vergleich('Nachricht', { daten });
```

---

## Zusammenfassung (Original-Analyse)

Das AMORPH-System hat sich von seinem ursprünglichen **datengetriebenen** Ansatz entfernt. Die Kernidee war:

> **"Die Datenstruktur bestimmt die Darstellung - nichts ist vorgegeben"**

Stattdessen gibt es nun an vielen Stellen **hardcoded Logik** und **explizite Morph-Zuweisungen im Schema**.

| Bereich | Verletzungsgrad | Kritikalität |
|---------|-----------------|--------------|
| Schema → Morph Zuweisungen | ✅ BEHOBEN | HOCH |
| Hardcoded Type Detection | ✅ BEHOBEN | HOCH |
| Hardcoded Feld-Handler | ✅ BEHOBEN | MITTEL |
| Hardcoded Farben | ✅ BEHOBEN | NIEDRIG |
| Perspektiven-Morphs | ✅ BEHOBEN | HOCH |
| Hardcoded console.log | ✅ BEHOBEN | MITTEL |

---

## 📋 Detaillierte Analyse

### 1. ✅ BEHOBEN: Explizite Morph-Typen im Schema

**Problem**: Im `schema.yaml` werden Morphs explizit zugewiesen, anstatt sie aus der Datenstruktur abzuleiten.

**Korrektur**: Alle `typ:` Deklarationen aus Feldern entfernt. Die Datenstruktur bestimmt jetzt den Morph!

```yaml
# ✅ RICHTIG - Kein expliziter Typ, nur semantische Info
naehrwerte:
  label: Zusammensetzung
  # Typ wird automatisch erkannt: {Protein: 26, ...} → pie
```

---

### 2. ✅ BEHOBEN: Perspektiven-Morph-Override im Schema

**Problem**: Das Schema definiert auch Morph-Typen pro Perspektive.

**Korrektur**: Alle `morphs:` Blocks aus den 6 Perspektiven entfernt:
- kulinarisch
- sicherheit
- anbau
- wissenschaft
- medizin
- statistik

Die Perspektive ist jetzt wieder nur ein **Filter**, nicht eine Transformationsregel.

**Problem**: `pipeline.js` enthält hardcoded Listen für Type Detection.

**Datei**: `core/pipeline.js`

```javascript
// ❌ HARDCODED Keywords für Badge-Erkennung
const badgeKeywords = ['aktiv', 'inaktiv', 'ja', 'nein', 'essbar', 'giftig', 'tödlich', 
                       'active', 'inactive', 'yes', 'no', 'online', 'offline', 
                       'offen', 'geschlossen', 'verfügbar', 'vergriffen'];

if (wert.length <= 20 && badgeKeywords.some(kw => lower.includes(kw))) {
  return 'badge';
}
```

**Was wäre richtig?**
Badge-Keywords sollten aus dem Schema kommen:

```yaml
morphs:
  badge:
    erkennung:
      keywords: [aktiv, inaktiv, ja, nein, ...]
      maxLaenge: 20
```

**Weitere hardcoded Logik**:

```javascript
// Rating-Erkennung (Zeile 113-117)
if (wert >= 0 && wert <= 10 && !Number.isInteger(wert)) {
  return 'rating';
}

// Progress-Erkennung (Zeile 118-121)
if (wert >= 0 && wert <= 100 && Number.isInteger(wert)) {
  return 'progress';
}
```

Diese Zahlenbereich-Logik gehört nicht in den Code!

---

### 4. 🟡 MITTEL: Hardcoded Feld-Handler in Compare.js

**Problem**: `compare.js` hat hardcoded Feld→Morph Mappings.

**Datei**: `morphs/compare.js`

```javascript
// ❌ HARDCODED Feld-Handler (Zeilen 783-792)
const feldHandler = {
  bild: () => compareImage(items, config),
  profil: () => compareRadar(items, config),
  naehrwerte: () => comparePie(items, config),
  bewertung: () => compareRating(items, config),
  zubereitung: () => compareTag(items, config),
  wirkstoffe: () => compareWirkstoffe(items, config),
  lebenszyklus: () => compareTimeline(items, config),
};
```

**Problem**: Diese Handler sollten nicht existieren! Die Type-Detection sollte ausreichen.

---

### 5. 🟡 MITTEL: Hardcoded Farben

**Problem**: Farbkonstanten sind im Code statt in Config.

**Dateien mit hardcoded Farben**:

1. `morphs/compare.js` (Zeile 13-15):
```javascript
const FARBEN = [
  '#e8b04a', '#60c090', '#d06080', '#5aa0d8', 
  '#a080d0', '#d0a050', '#50b0b0', '#d08050'
];
```

2. `morphs/pie.js` (Zeile 14-22):
```javascript
const FARBEN = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
];
```

3. `features/header/index.js` (Zeile 209):
```javascript
const farben = perspektive.farben || [perspektive.farbe || '#3b82f6'];
```

**Was wäre richtig?**
Farben gehören in `config/morphs.yaml`:

```yaml
farben:
  pilze:
    - "#e8b04a"
    - "#60c090"
    # ...
  diagramme:
    - "#22c55e"
    # ...
```

---

### 6. 🟢 OK: Datenstruktur-basierte Detection (teilweise funktioniert)

**Positiv**: Die `detectObjectType` und `detectArrayType` Funktionen erkennen tatsächlich die Struktur.

```javascript
// ✅ GUT: Erkennt Objekte mit nur numerischen Werten als PIE
const allNumeric = keys.every(k => typeof wert[k] === 'number');
if (allNumeric && keys.length >= 2 && keys.length <= 8) {
  return 'pie';
}

// ✅ GUT: Erkennt Range-Objekte
if ('min' in wert && 'max' in wert) {
  return 'range';
}
```

**ABER**: Diese werden durch explizite `typ:`-Angaben im Schema überschrieben!

---

## 🏗️ Architektur-Verletzungen - Übersicht

### Originalkonzept (SOLL)

```
┌─────────────────────────────────────────────────────────┐
│  DATENBANK                                              │
│  {naehrwerte: {Protein: 26, Fett: 8}} ──────────────▶   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  PIPELINE.JS - detectType()                            │
│  "Objekt mit nur Zahlen" → pie                          │
│  "Objekt mit min/max"    → range                        │
│  "Array mit axis/value"  → radar                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  MORPHS                                                 │
│  pie(wert, config) → DOM                                │
└─────────────────────────────────────────────────────────┘
```

### Aktueller Zustand (IST)

```
┌─────────────────────────────────────────────────────────┐
│  SCHEMA.YAML                                            │
│  naehrwerte:                                            │
│    typ: pie  ◀── ❌ HARDCODED!                          │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Überschreibt
                           ▼
┌─────────────────────────────────────────────────────────┐
│  PIPELINE.JS                                            │
│  detectType() wird ignoriert wenn Schema.typ existiert! │
│  findMorph(): "Schema sagt pie → nutze pie"             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
             ┌──────────┐  ┌──────────────────┐
             │ Grid-View│  │ Vergleich-View   │
             └──────────┘  └──────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │ PERSPEKTIVEN.MORPHS         │
                    │ naehrwerte: typ: bar        │
                    │ ◀── ❌ ZWEITES OVERRIDE!    │
                    └─────────────────────────────┘
```

---

## 🛠️ Empfehlungen zur Bereinigung

### Phase 1: Schema bereinigen (HOCH PRIORITÄT)

1. **Entferne alle `typ:` Angaben** die aus der Datenstruktur ableitbar sind:
   - `naehrwerte`, `profil`, `wirkstoffe`, `ernte_stats`, `lebenszyklus`

2. **Behalte `typ:` nur wo nötig**:
   - `essbarkeit: typ: tag` → OK, weil ein String sonst als `text` erkannt wird
   - `temperatur: typ: range` → NICHT OK, Daten haben `{min, max}`

3. **Entferne `morphs:` Blöcke aus Perspektiven** komplett

### Phase 2: Pipeline-Detection verbessern

1. **Extrahiere hardcoded Listen** in `config/morphs.yaml`:
   ```yaml
   erkennung:
     badge:
       keywords: [aktiv, inaktiv, ...]
       maxLaenge: 20
     rating:
       bereich: [0, 10]
       dezimalstellen: true
     progress:
       bereich: [0, 100]
       ganzzahl: true
   ```

2. **Lade diese zur Laufzeit** und nutze sie in `detectType()`

### Phase 3: Farben zentralisieren

1. Erstelle `config/farben.yaml`:
   ```yaml
   paletten:
     pilze: ["#e8b04a", "#60c090", ...]
     diagramme: ["#22c55e", "#3b82f6", ...]
   ```

2. Importiere in Morphs statt hardcoded

### Phase 4: Compare.js bereinigen

1. Entferne `feldHandler` Objekt
2. Verlasse dich nur auf Type-Detection

---

## 📊 Metriken

| Metrik | Wert |
|--------|------|
| Hardcoded Typ-Zuweisungen im Schema | 12 |
| Hardcoded Perspektiven-Morphs | 18 |
| Hardcoded Farb-Arrays | 3 |
| Hardcoded Feld-Handler | 7 |
| Hardcoded Detection-Keywords | 15 |
| **Gesamte Architektur-Verletzungen** | **55** |

---

## Fazit

Das System funktioniert, aber es hat sich von seinem eleganten **datengetriebenen** Ansatz entfernt. Die ursprüngliche Vision war:

> "Gib mir Daten, ich zeige sie optimal an"

Jetzt ist es:

> "Schau im Schema nach, was du anzeigen sollst"

Dies reduziert die Flexibilität und erhöht die Wartungslast. Jede neue Datenquelle erfordert Schema-Anpassungen statt automatischer Erkennung.

**Empfehlung**: Schrittweise Bereinigung in den 4 Phasen, beginnend mit dem Schema.

---

*Dieser Bericht wurde automatisch generiert. Alle Zeilenangaben beziehen sich auf den Stand vom 02.12.2025.*
