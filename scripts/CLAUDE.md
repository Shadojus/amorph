# Scripts

Build- und Entwicklungs-Tools.

## 🚧 AKTUELLER STAND (02.12.2025 - FINAL)

### ✅ Fertig
- `check.js` - Konfigurationsprüfung
- `build.js` - Produktions-Build
- Development Server via `npx serve`

## check.js

Prüft ob alle Konfigurationsdateien vorhanden und gültig sind.

```bash
npm run check
# oder
node scripts/check.js
```

**Prüft:**
- Pflichtdateien: manifest.yaml, daten.yaml
- Optionale Dateien: morphs.yaml, observer.yaml, features.yaml, schema.yaml
- Datenquelle erreichbar
- YAML-Syntax gültig

**Ausgabe:**
```
🔍 AMORPH Config Check

Pflichtdateien:
  ✅ manifest.yaml
  ✅ daten.yaml

Optionale Dateien:
  ✅ morphs.yaml
  ✅ observer.yaml
  ✅ features.yaml
  ✅ schema.yaml

Datenquelle:
  ✅ JSON-Datei gefunden: ./data/pilze.json

========================================
✅ Konfiguration ist gültig!
```

## build.js

Erstellt einen Produktions-Build im `dist/` Ordner.

```bash
npm run build
# oder
node scripts/build.js
```

**Was passiert:**
1. HTML kopieren
2. CSS zusammenführen
3. JavaScript-Module kopieren
4. Config kopieren
5. Daten kopieren
6. Umgebungsvariablen ersetzen

**Ausgabe:**
```
🏗️  AMORPH Build

📄 HTML erstellen...
🎨 CSS bündeln...
📦 JavaScript kopieren...
⚙️  Config kopieren...
📊 Daten kopieren...
🔐 Umgebungsvariablen ersetzen...

✅ Build fertig!
   Ausgabe: dist/

Zum Testen: npx serve dist
```

## Development Server

Kein eigenes Script - nutzt `serve`:

```bash
npm run dev
# = npx serve . -p 3000
```

Öffne dann http://localhost:3000
