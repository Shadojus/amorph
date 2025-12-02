# Feature: Perspektiven

Verschiedene Blickwinkel auf dieselben Daten.

## 🚧 AKTUELLER STAND (02.12.2025 - FINAL)

### ✅ Fertig
- Perspektiven funktionieren vollständig
- Multi-Color Glow bei mehreren aktiven Perspektiven
- 4-Farben-Grid pro Perspektive (aus schema.yaml)
- Auto-Aktivierung bei relevanten Suchergebnissen
- Keywords aus Schema für Auto-Detection
- Badges in Suchleiste für aktive Perspektiven

### ⚠️ Hinweis: Header übernimmt

Die Perspektiven-Logik ist jetzt primär in `features/header/index.js` implementiert.
Dieses Feature dient als Referenz/Dokumentation.

## Konzept

Eine Perspektive ist ein Filter + Styling. Sie zeigt bestimmte Felder und färbt sie ein.

```
Kulinarisch 🍳  →  Zeigt: essbarkeit, geschmack, zubereitung
                   Farben: [#4ade80, #22c55e, #16a34a, #15803d]
                   
Sicherheit ⚠️   →  Zeigt: giftigkeit, verwechslungsgefahr
                   Farben: [#ef4444, #dc2626, #b91c1c, #991b1b]
```

## Config aus schema.yaml

```yaml
perspektiven:
  - id: kulinarisch
    label: Kulinarisch
    symbol: 🍳
    farben: ['#4ade80', '#22c55e', '#16a34a', '#15803d']
    felder: [essbarkeit, geschmack, zubereitung]
    keywords: [essbar, essen, kochen, rezept]
    
  - id: sicherheit
    label: Sicherheit
    symbol: ⚠️
    farben: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b']
    felder: [giftigkeit, verwechslungsgefahr]
    keywords: [giftig, gefährlich, verwechseln]
```

## Multi-Perspektiven Farben

Wenn ein Feld zu mehreren aktiven Perspektiven gehört:

```javascript
// In header/index.js
if (perspektivFarben.length === 1) {
  // Einzelne Perspektive - alle 4 Farben setzen
  feld.style.setProperty('--feld-perspektive-farbe', farben[0]);
} else {
  // Mehrere Perspektiven - Multicolor-Gradient
  feld.setAttribute('data-perspektive-multi', 'true');
  // Gradient aus allen Hauptfarben
  const gradientStops = perspektivFarben.map(({ hauptfarbe }, i) => {
    return `${hauptfarbe} ${start}%, ${hauptfarbe} ${end}%`;
  }).join(', ');
  feld.style.setProperty('--feld-gradient', `linear-gradient(180deg, ${gradientStops})`);
}
```

## CSS-Klassen

- `.amorph-perspektiven` - Navigation Container
- `.amorph-perspektive-btn` - Einzelner Button
- `.amorph-perspektive-btn.aktiv` - Aktive Perspektive
- `.amorph-perspektive-btn.hat-treffer` - Hat relevante Suchergebnisse
- `[data-perspektive-sichtbar]` - Feld gehört zu aktiver Perspektive
- `[data-perspektive-multi]` - Feld gehört zu mehreren Perspektiven
      .map(p => p.farbe)
      .filter(Boolean);
    
    container.style.setProperty('--aktive-perspektiven', farben.join(', '));
    
    ctx.emit('geaendert', { aktiv: Array.from(aktiv) });
  }
  
  ctx.dom.appendChild(nav);
  ctx.mount('afterbegin');
}
```

## Konfiguration

```yaml
perspektiven:
  maxAktiv: 4
  liste:
    - id: kulinarisch
      name: Kulinarisch
      symbol: 🍳
      farbe: "#22c55e"
      felder:
        - essbarkeit
        - geschmack
        - zubereitung
        
    - id: sicherheit
      name: Sicherheit
      symbol: ⚠️
      farbe: "#ef4444"
      felder:
        - giftigkeit
        - verwechslung
        - symptome
        
    - id: anbau
      name: Anbau
      symbol: 🌱
      farbe: "#eab308"
      felder:
        - standort
        - substrat
        - temperatur
```

## CSS

Die Magie passiert in CSS. Perspektiven blenden Felder ein/aus und färben ein.

```css
/* Basis: Alles sichtbar */
amorph-container[data-field] {
  display: block;
}

/* Perspektive aktiv: Nur relevante Felder */
.perspektive-kulinarisch amorph-container[data-field="essbarkeit"],
.perspektive-kulinarisch amorph-container[data-field="geschmack"],
.perspektive-kulinarisch amorph-container[data-field="zubereitung"] {
  border-left: 3px solid #22c55e;
  background: #22c55e10;
}

.perspektive-sicherheit amorph-container[data-field="giftigkeit"],
.perspektive-sicherheit amorph-container[data-field="verwechslung"] {
  border-left: 3px solid #ef4444;
  background: #ef444410;
}

/* Mehrere Perspektiven: Kombinieren */
.perspektive-kulinarisch.perspektive-sicherheit 
  amorph-container[data-field="essbarkeit"] {
  /* Grün + Rot = Wichtig! */
  border-left-width: 6px;
  border-image: linear-gradient(to bottom, #22c55e, #ef4444) 1;
}
```

## Warum CSS statt JavaScript?

1. **Performance**: Browser optimiert CSS
2. **Einfachheit**: Deklarativ statt imperativ
3. **Animationen**: CSS Transitions gratis
4. **Kein Re-Render**: DOM bleibt unverändert
