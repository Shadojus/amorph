# Feature: Perspektiven

15 verschiedene Blickwinkel auf Daten.

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.js` | Feature-Entry, Perspektiven-UI |
| `perspektiven.css` | Button-Styles |

## 15 Perspektiven

| ID | Symbol | Fokus |
|----|--------|-------|
| chemistry | 🧪 | Metabolite, Enzyme |
| conservation | 🛡️ | IUCN-Status, Schutz |
| culinary | 🍳 | Essbarkeit, Küche |
| cultivation | 🌱 | Anbau, Substrate |
| culture | 📜 | Mythologie, Geschichte |
| ecology | 🌿 | Habitat, Symbiosen |
| economy | 💰 | Markt, Preise |
| geography | 🗺️ | Verbreitung, Klima |
| identification | 🔍 | Bestimmungsmerkmale |
| interactions | 🔗 | Wirte, Mikrobiom |
| medicine | 💊 | Wirkstoffe, Therapie |
| research | 📚 | Publikationen |
| safety | ⚠️ | Toxine, Verwechslung |
| statistics | 📊 | Fundstatistiken |
| temporal | ⏰ | Saisonalität |

## Events

**Emittiert:**
- `perspektiven:geaendert` - `{ aktive: ['chemistry', 'ecology'] }`
- `perspektive:activated` - Einzelne Perspektive aktiviert
- `perspektive:deactivated` - Einzelne Perspektive deaktiviert

## Verhalten

- **Keine aktiv**: Alle Felder sichtbar
- **Eine/mehrere aktiv**: Nur zugehörige Felder sichtbar
- **Multi-Select**: Mehrere Perspektiven gleichzeitig

## Neue Perspektive hinzufügen

1. YAML: `config/schema/perspektiven/name.yaml`
2. Index: ID zu `config/schema/perspektiven/index.yaml` hinzufügen
3. CSS: `config/schema/perspektiven/name.css` erstellen

## Perspektiven-Definition

```yaml
# config/schema/perspektiven/chemistry.yaml
id: chemistry
name: Chemie
symbol: 🧪
farben: ['#9f7aea', '#805ad5']
felder:
  - chemistry_primaer_metabolite
  - chemistry_sekundaer_metabolite
  - chemistry_enzyme
keywords:
  - metabolit
  - enzym
  - protein
```
