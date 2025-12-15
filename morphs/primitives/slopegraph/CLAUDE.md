# Slopegraph Morph

Vorher-Nachher-Vergleich mit Steigungslinien nach Kirk-Prinzipien.

## Design-Prinzipien (Kirk)

1. **Zwei Zeitpunkte**: Links=Vorher, Rechts=Nachher
2. **Steigung zeigt Magnitude**: Steil=große Änderung
3. **Farbkodierung**: Grün=Anstieg, Rot=Rückgang
4. **Werte an Endpunkten**: Direkte Annotation
5. **Prozent-Änderung**: Delta prominent angezeigt

## Datenstruktur

```typescript
// Objekt mit Vorher/Nachher
type SlopegraphInput = {
  vorher: Record<string, number>;
  nachher: Record<string, number>;
};

// Array von Objekten
type SlopegraphInput = Array<{
  name: string;
  vorher: number;
  nachher: number;
}>;

// Alternative Keys
vorher/nachher, before/after, start/end, v1/v2

// Beispiele
{
  vorher: {Manning: 45, Brady: 30},
  nachher: {Manning: 55, Brady: 48}
}

[
  {name: "Manning", vorher: 45, nachher: 55},
  {name: "Brady", vorher: 30, nachher: 48}
]
```

## Erkennungsregeln

- **Typ:** `object` oder `array`
- **Required:** vorher/nachher Struktur mit matching Keys
- **Priorität:** Vor comparison (Slopegraph ist visueller)

## Wann SLOPEGRAPH verwenden (Kirk)

✅ **Geeignet für:**
- **Vorher-Nachher-Vergleiche** (2 Zeitpunkte)
- Ranking-Veränderungen (Peyton Manning Record Chart)
- Performance-Vergleiche
- A/B-Test-Ergebnisse

❌ **Nicht verwenden für:**
- >3 Zeitpunkte → `sparkline` oder Liniendiagramm
- Kategorienvergleiche → `bar`
- Proportionen → `pie`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `titel` | string | - | Titel über Chart |

### Implementierte Kirk-Features

| Feature | Beschreibung |
|---------|--------------|
| **Header-Labels** | Vorher/Nachher beschriftet |
| **Verbindungslinie** | SVG-Linie zwischen Punkten |
| **Steigungsfarbe** | Grün=↑, Rot=↓, Grau=→ |
| **Wert-Annotation** | Zahlen an beiden Enden |
| **Trend-Badge** | Prozent-Änderung rechts |
| **Y-Normalisierung** | Alle Linien im gleichen Scale |

## Signatur

```javascript
slopegraph(wert: SlopegraphObject, config?: SlopegraphConfig) → HTMLElement
```

## Kirk-Prinzip (Seite 81)

> **Slopegraph - Die Kraft der Steigung:**
> - Erfunden von Edward Tufte
> - **Genau 2 Zeitpunkte** (links/rechts)
> - Steigung zeigt Richtung UND Magnitude
> - Steile Linie = große Veränderung
> - Crossing Points zeigen Überholungen

### Visuelle Interpretation

| Steigung | Bedeutung |
|----------|-----------|
| ↗ Steil aufwärts | Großer Anstieg |
| → Flach | Wenig Veränderung |
| ↘ Steil abwärts | Großer Rückgang |
