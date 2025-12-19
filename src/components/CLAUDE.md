# src/components/

Wiederverwendbare Astro-Komponenten.

## Dateien

| Datei | Zweck |
|-------|-------|
| `PerspectiveSection.astro` | Perspektiv-Daten Sektion |

---

## PerspectiveSection.astro

Rendert eine Perspektive als HTML-Sektion.

### Props

```typescript
interface Props {
  id: string;           // Perspektiven-ID (z.B. 'chemistry')
  label: string;        // Anzeige-Label (z.B. '🧪 Chemie')
  data: Record<string, any>;  // Perspektiv-Daten
}
```

### Ausgabe

```html
<section id="chemistry" class="perspective-section">
  <h2>🧪 Chemie</h2>
  
  <div class="perspective-content">
    <!-- Rekursiv gerenderte Daten -->
    <div class="field">
      <span class="label">Feldname:</span>
      <span class="value">Wert</span>
    </div>
    ...
  </div>
</section>
```

### Daten-Rendering

- **Primitive Werte**: Direkt anzeigen
- **Arrays**: Als Liste rendern
- **Objekte**: Rekursiv rendern
- **Null/Undefined**: Überspringen

### Styling

```css
.perspective-section {
  margin: 2rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
}

.perspective-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
```

---

## Verwendung

```astro
---
import PerspectiveSection from '../components/PerspectiveSection.astro';

const perspectives = {
  chemistry: { ... },
  ecology: { ... }
};
---

{Object.entries(perspectives).map(([id, data]) => (
  <PerspectiveSection 
    id={id}
    label={perspectiveLabels[id]}
    data={data}
  />
))}
```

---

## Erweiterungen

Geplante Komponenten:
- `SpeciesCard.astro` - Species-Vorschau-Karte
- `SearchForm.astro` - Such-Formular
- `PerspectiveNav.astro` - Perspektiven-Navigation
- `Breadcrumb.astro` - Breadcrumb-Navigation

---

## Hinweise

- **Server-Side Only**: Keine client:* Direktiven, alles SSR
- **SEO-Freundlich**: Semantisches HTML, keine JS-Abhängigkeit
- **Accessible**: ARIA-Labels, semantische Struktur
