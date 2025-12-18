# Docs

Entwicklungsdokumentation und Referenzen.

## Dateien

| Datei | Inhalt |
|-------|--------|
| `DATA_AGENTS.md` | Workflow für Claude-Agenten |
| `DATEN_ERSTELLEN.md` | Manuelle Daten-Erstellung mit Blueprints |
| `INTEGRITAET.md` | System-Integritätsbericht |
| `laterale_diagramme_analyse.md` | Kirk-Prinzipien Diagramm-Analyse |
| `schnellreferenz_diagramme.md` | Diagramm-Typ Schnellreferenz |
| `seite_fuer_seite_anleitungen.md` | Kirk-Buch Zusammenfassung |

---

## Schnellstart

### Neue Spezies erstellen

```bash
# 1. Ordner erstellen
mkdir data/fungi/steinpilz

# 2. index.json erstellen (Core-Daten)
# 3. Perspektiven-JSONs erstellen (siehe Blueprints)

# 4. Validieren
npm run validate

# 5. Index aktualisieren
npm run build:index
```

---

## Manuelle Daten-Erstellung

→ [DATEN_ERSTELLEN.md](DATEN_ERSTELLEN.md)

1. Blueprint lesen: `config/schema/perspektiven/blueprints/*.blueprint.yaml`
2. JSON erstellen mit korrekter Morph-Struktur
3. In `data/{kingdom}/{species}/` speichern
4. `npm run validate` ausführen
5. `npm run build:index` ausführen

---

## Für Claude-Agenten

→ [DATA_AGENTS.md](DATA_AGENTS.md)

Agenten sollten:
1. Blueprints lesen für Feld-Struktur
2. JSON-Dateien direkt erstellen
3. Validierung ausführen
4. Index aktualisieren

---

## Kirk-Prinzipien

→ [laterale_diagramme_analyse.md](laterale_diagramme_analyse.md)
→ [schnellreferenz_diagramme.md](schnellreferenz_diagramme.md)

Die Morphs folgen Andy Kirks Visualisierungsprinzipien aus "Visualizing Data".

---

## Siehe auch

- `/CLAUDE.md` - Haupt-Dokumentation
- `/README.md` - Projekt-Übersicht
- `/scripts/CLAUDE.md` - Script-Dokumentation
- `/data/CLAUDE.md` - Datenstruktur
- Jeder Ordner hat eigene `CLAUDE.md`
