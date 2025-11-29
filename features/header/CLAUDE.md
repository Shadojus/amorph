# Feature: Morph-Header

Zentraler Header für alle AMORPH-Seiten.

## Funktion

1. **Suchleiste** - Lädt Daten erst bei Eingabe (nicht bei Pageload)
2. **Perspektiven-Buttons** - Schalten automatisch zu Perspektiven mit Ergebnissen

## Verhalten

### Suche
- Bei Pageload: Keine Daten geladen, nur Hinweis "Gib einen Suchbegriff ein"
- Bei Eingabe: Live-Suche mit Debounce (300ms default)
- Enter: Sofortige Suche
- Escape: Suche leeren

### Perspektiven
- Buttons zeigen alle verfügbaren Perspektiven
- Nach Suche: Perspektiven mit relevanten Daten werden hervorgehoben
- Erste relevante Perspektive wird automatisch aktiviert
- Manuelle Umschaltung möglich

## Konfiguration

```yaml
aktiv:
  - header

header:
  suche:
    placeholder: "Pilze suchen..."
    live: true
    debounce: 300
    limit: 50
  perspektiven:
    - id: kulinarisch
      name: Kulinarisch
      symbol: 🍳
      farbe: "#22c55e"
      felder:
        - essbarkeit
        - geschmack
        - zubereitung
```

## CSS-Klassen

- `.morph-header` - Container
- `.morph-header-suche` - Suchbereich
- `.morph-header-perspektiven` - Perspektiven-Navigation
- `.morph-header-perspektive-btn` - Einzelner Button
- `.morph-header-perspektive-btn.aktiv` - Aktive Perspektive
- `.morph-header-perspektive-btn.hat-ergebnisse` - Hat relevante Ergebnisse
