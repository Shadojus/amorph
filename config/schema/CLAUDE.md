# Schema Folder

DATA-DRIVEN modular schema system for AMORPH.

## Architecture

**Single Source of Truth** - but without redundancy:
- Perspectives define their own fields (no separate felder.yaml needed)
- Field types are auto-detected from data and naming patterns
- Core system in basis.yaml
- Semantic search in semantik.yaml

## Structure

```
schema/
├── index.yaml            # Index and documentation
├── basis.yaml            # Core system (DO NOT MODIFY)
├── semantik.yaml         # Search mappings
└── perspektiven/         # Perspectives (self-contained)
    ├── index.yaml        # Active perspectives list
    ├── culinary.yaml     # Each perspective defines its own fields
    ├── safety.yaml
    ├── cultivation.yaml
    ├── science.yaml
    ├── medicine.yaml
    ├── statistics.yaml
    ├── chemistry.yaml
    ├── sensory.yaml
    ├── ecology.yaml
    ├── temporal.yaml
    ├── geography.yaml
    ├── economics.yaml
    ├── conservation.yaml
    ├── culture.yaml
    ├── research.yaml
    ├── interactions.yaml
    └── visual.yaml
```

## Data-Driven Approach

Field configurations are derived from:
1. **Perspective definitions** - Each perspective lists its fields
2. **Data inspection** - Types detected from actual values
3. **Naming conventions** - Field names imply types:
   - `*_rating`, `*_score` → rating morph
   - `*_percent`, `*_rate` → progress morph  
   - `is_*`, `has_*` → boolean morph
   - `*_min`, `*_max` → range morph
   - `*_list`, plural names → list morph

## Adding a New Perspective

1. Create file: `perspektiven/my_perspective.yaml`
2. Add ID to `perspektiven/index.yaml`
3. (Optional) Add CSS to `styles/perspektiven.css`

**No theme code needed!** smartCompare auto-detects types.

**No need to edit felder.yaml** - the perspective file is complete!

## Perspective File Format

```yaml
id: my_perspective
name: My Perspective
symbol: 🔮

colors:  # or 'farben'
  - "rgba(r, g, b, 0.65)"

fields:  # or 'felder' - defines all fields for this perspective
  - image
  - name
  - my_custom_field
  - another_field

keywords:  # for semantic search (multilingual)
  - english keyword
  - deutsches Stichwort
  - mot-clé français

enumerations:  # optional, for constrained values
  my_enum:
    - value1
    - value2
```

## Deactivating a Perspective

Remove ID from `perspektiven/index.yaml` (file can remain).
