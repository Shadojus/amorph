# src/layouts/

Astro Layout-Komponenten mit SEO-Optimierung.

## Dateien

| Datei | Zweck |
|-------|-------|
| `BaseLayout.astro` | Basis-HTML-Struktur, Head-Tags |
| `SpeciesLayout.astro` | Species-Seiten Layout mit JSON-LD |

---

## BaseLayout.astro

Basis-Layout für alle Seiten.

### Props

```typescript
interface Props {
  title: string;           // Seitentitel
  description?: string;    // Meta Description
  canonical?: string;      // Canonical URL
  ogImage?: string;        // Open Graph Bild
}
```

### Features

- HTML5 Doctype
- Meta Charset UTF-8
- Viewport für Mobile
- Title Tag
- Meta Description
- Canonical URL
- Open Graph Tags
- CSS Import (styles/index.css)

### Beispiel

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout 
  title="Meine Seite" 
  description="Beschreibung für SEO"
>
  <main>
    <h1>Inhalt</h1>
  </main>
</BaseLayout>
```

---

## SpeciesLayout.astro

Layout für Species-Detail-Seiten mit SEO-Optimierung.

### Props

```typescript
interface Props {
  species: {
    name: string;
    wissenschaftlicher_name?: string;
    slug: string;
    kingdom: string;
    kingdomIcon: string;
    kingdomName: string;
    description?: string;
    image?: string;
  };
  perspectives: string[];  // Aktive Perspektiven-IDs
}
```

### SEO-Features

#### Meta-Tags

```html
<title>Blauender Kahlkopf (Psilocybe cyanescens) | AMORPH</title>
<meta name="description" content="Alles über Blauender Kahlkopf...">
<link rel="canonical" href="https://amorph.funginomi.com/psilocybe-cyanescens">
```

#### Open Graph

```html
<meta property="og:title" content="Blauender Kahlkopf">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:type" content="article">
```

#### JSON-LD Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Thing",
  "name": "Blauender Kahlkopf",
  "alternateName": "Psilocybe cyanescens",
  "description": "...",
  "url": "https://amorph.funginomi.com/psilocybe-cyanescens",
  "image": "..."
}
```

#### BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "position": 1, "name": "Home", "item": "..." },
    { "position": 2, "name": "Fungi", "item": "..." },
    { "position": 3, "name": "Blauender Kahlkopf" }
  ]
}
```

### Struktur

```html
<BaseLayout ...>
  <article class="species-page">
    <header>
      <nav class="breadcrumb">...</nav>
      <h1>Name <small>(Wissenschaftlicher Name)</small></h1>
    </header>
    
    <nav class="perspectives-nav">
      <!-- Perspektiven-Links -->
    </nav>
    
    <main>
      <slot />  <!-- Perspektiven-Content -->
    </main>
    
    <footer>
      <a href="/">← Zurück zur Übersicht</a>
    </footer>
  </article>
  
  <script type="application/ld+json">...</script>
</BaseLayout>
```

---

## CSS-Styling

Beide Layouts nutzen `styles/seo-page.css` für:
- Responsive Layout
- Breadcrumb-Navigation
- Perspektiven-Navigation
- Print-optimierte Darstellung

---

## Hinweise

- **Canonical URLs**: Wichtig für SEO, vermeidet Duplicate Content
- **JSON-LD**: Hilft Google bei der Indexierung
- **Open Graph**: Für Social Media Sharing
- **Accessibility**: Semantisches HTML, Skip-Links
