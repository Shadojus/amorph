# Feature: Perspektiven

Verschiedene Blickwinkel auf dieselben Daten.

## 🚧 AKTUELLER STAND

✅ Perspektiven funktionieren mit Multi-Color Glow.
✅ 4-Farben-Grid pro Perspektive.
✅ Auto-Aktivierung bei Suchergebnissen.

## Konzept

Eine Perspektive ist ein Filter + Styling. Sie zeigt bestimmte Felder und färbt sie ein.

```
Kulinarisch 🍳  →  Zeigt: essbarkeit, geschmack, zubereitung
                   Farbe: Grün
                   
Sicherheit ⚠️   →  Zeigt: giftigkeit, verwechslungsgefahr
                   Farbe: Rot
```

## Implementierung

```javascript
// features/perspektiven/index.js
export default function init(ctx) {
  const perspektiven = ctx.config.liste || [];
  const maxAktiv = ctx.config.maxAktiv || 4;
  let aktiv = new Set();
  
  // Navigation
  const nav = document.createElement('nav');
  nav.className = 'amorph-perspektiven';
  nav.setAttribute('role', 'toolbar');
  
  for (const p of perspektiven) {
    const btn = document.createElement('button');
    btn.className = 'amorph-perspektive-btn';
    btn.dataset.perspektive = p.id;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `
      <span class="symbol">${p.symbol || ''}</span>
      <span class="name">${p.name}</span>
    `;
    
    if (p.farbe) {
      btn.style.setProperty('--p-farbe', p.farbe);
    }
    
    btn.addEventListener('click', () => toggle(p.id, btn));
    nav.appendChild(btn);
  }
  
  function toggle(id, btn) {
    if (aktiv.has(id)) {
      deaktivieren(id, btn);
    } else {
      aktivieren(id, btn);
    }
    anwenden();
  }
  
  function aktivieren(id, btn) {
    // Max erreicht?
    if (aktiv.size >= maxAktiv) {
      const erste = aktiv.values().next().value;
      const ersteBtn = nav.querySelector(`[data-perspektive="${erste}"]`);
      deaktivieren(erste, ersteBtn);
    }
    
    aktiv.add(id);
    btn.setAttribute('aria-pressed', 'true');
    btn.classList.add('aktiv');
  }
  
  function deaktivieren(id, btn) {
    aktiv.delete(id);
    btn.setAttribute('aria-pressed', 'false');
    btn.classList.remove('aktiv');
  }
  
  function anwenden() {
    // CSS-Klassen setzen
    const container = document.querySelector('[data-amorph-container]');
    if (!container) return;
    
    // Alle entfernen
    for (const p of perspektiven) {
      container.classList.remove(`perspektive-${p.id}`);
    }
    
    // Aktive hinzufügen
    for (const id of aktiv) {
      container.classList.add(`perspektive-${id}`);
    }
    
    // CSS-Variablen für Farben
    const farben = perspektiven
      .filter(p => aktiv.has(p.id))
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
