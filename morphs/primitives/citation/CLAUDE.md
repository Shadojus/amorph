# Citation Morph

Wissenschaftliche Quellenangaben mit DOI-Links.

## Datenstruktur

```typescript
type CitationInput = {
  authors: string | string[];
  year: number | string;
  title: string;
  journal?: string;
  volume?: string | number;
  pages?: string;
  doi?: string;
  url?: string;
};

// Beispiele
{
  authors: "Kirk, A.",
  year: 2016,
  title: "Data Visualisation: A Handbook for Data Driven Design",
  journal: "SAGE Publications"
}

{
  authors: ["Smith, J.", "Johnson, M."],
  year: 2023,
  title: "Fungal Networks in Forest Ecosystems",
  journal: "Nature",
  volume: 612,
  pages: "234-241",
  doi: "10.1038/s41586-023-1234"
}
```

## Erkennungsregeln

- **Typ:** `object`
- **Required:** `authors`, `year`, `title`
- **Optional:** `journal`, `doi`, `url`, `volume`, `pages`
- **Priorität:** Höchste (spezifisches Muster)

## Wann CITATION verwenden

✅ **Geeignet für:**
- **Wissenschaftliche Referenzen**
- Paper-Zitate
- Buchquellen
- Artikel-Verweise

❌ **Nicht verwenden für:**
- Einfache URLs → `link`
- Nicht-akademische Quellen → `link`
- Allgemeine Objekte → `object`

## Konfiguration

| Option | Typ | Default | Beschreibung |
|--------|-----|---------|--------------|
| `format` | string | "apa" | apa / mla / chicago |
| `showDoi` | boolean | true | DOI anzeigen |
| `showUrl` | boolean | true | URL anzeigen |
| `linkDoi` | boolean | true | DOI verlinken |
| `italicTitle` | boolean | true | Titel kursiv |

## Signatur

```javascript
citation(wert: CitationObject, config?: CitationConfig) → HTMLElement
```

## Zitierformate

### APA (Default)

```
Kirk, A. (2016). Data Visualisation: A Handbook for Data Driven Design. SAGE Publications.
```

### MLA

```
Kirk, Andy. Data Visualisation: A Handbook for Data Driven Design. SAGE Publications, 2016.
```

### Chicago

```
Kirk, Andy. 2016. Data Visualisation: A Handbook for Data Driven Design. SAGE Publications.
```

## DOI-Verlinkung

DOIs werden automatisch zu Links:
- `10.1038/s41586-023-1234` → `https://doi.org/10.1038/s41586-023-1234`

## Kirk-Prinzip

> **Quellenangaben sind Datenpunkte:**
> - Strukturierte Darstellung
> - Klickbare DOI-Links
> - Konsistente Formatierung
> - Akademische Standards
