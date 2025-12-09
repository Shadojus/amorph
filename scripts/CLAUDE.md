# Scripts

Build- und Entwicklungs-Tools.

## Übersicht

Verfügbare Scripts:
- `check.js` - Konfigurationsprüfung (inkl. 17 Perspektiven)
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
- Optionale Dateien: morphs.yaml, observer.yaml, features.yaml
- **Modulares Schema**: schema/basis.yaml, schema/felder.yaml, schema/perspektiven/
- **17 Perspektiven**: Alle *.yaml in perspektiven/
- Datenquelle erreichbar
- YAML-Syntax gültig

**Ausgabe:**
```
🔍 AMORPH Config Check

Modulares Schema:
  ✅ schema/basis.yaml
  ✅ schema/felder.yaml (~200 Felder)
  ✅ schema/semantik.yaml
  ✅ schema/perspektiven/index.yaml
  ✅ 17 Perspektiven geladen

✅ Konfiguration ist gültig!
```

## build.js

Erstellt einen Produktions-Build im `dist/` Ordner.

```bash
npm run build
```

**Was passiert:**
1. HTML kopieren
2. CSS zusammenführen
3. JavaScript-Module kopieren
4. Config kopieren (inkl. schema/ mit 17 Perspektiven)
5. Daten kopieren
6. Umgebungsvariablen ersetzen

## Development Server

```bash
npm run dev
# = npx serve . -p 3000
```

Öffne dann http://localhost:3000
