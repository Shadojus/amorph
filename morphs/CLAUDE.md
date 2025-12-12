# Morphs Configuration Directory

## Purpose
Modular YAML configuration files for the morph system. Each morph type has its own configuration file defining detection rules, settings, and styling.

## Structure
```
config/morphs/
├── index.yaml           # Global settings, fallbacks, color palettes
├── CLAUDE.md            # This file
│
└── primitives/          # Basic morph configurations
    ├── index.yaml       # Primitives index
    ├── CLAUDE.md        # Primitives documentation
    │
    ├── # BASIC TYPES
    ├── text.yaml        # Plain text strings
    ├── badge.yaml       # Status badges with semantic colors
    ├── tag.yaml         # Short label tags
    ├── number.yaml      # Numeric values
    ├── boolean.yaml     # True/false values
    ├── link.yaml        # Clickable URLs
    ├── image.yaml       # Image display
    ├── list.yaml        # Simple arrays
    ├── object.yaml      # Key-value objects
    ├── range.yaml       # Min-max ranges
    ├── rating.yaml      # Star ratings
    ├── progress.yaml    # Progress bars
    ├── stats.yaml       # Statistical summaries
    │
    ├── # CHARTS
    ├── bar.yaml         # Bar charts
    ├── pie.yaml         # Pie/donut charts
    ├── radar.yaml       # Radar/spider charts
    ├── timeline.yaml    # Event timelines
    │
    EXTENDED
    ├── map.yaml         # Geographic maps
    ├── hierarchy.yaml   # Tree structures
    ├── comparison.yaml  # Before/after
    ├── steps.yaml       # Process steps
    ├── lifecycle.yaml   # Phase circles
    ├── network.yaml     # Relationships
    ├── severity.yaml    # Warning levels
    ├── calendar.yaml    # Year calendars
    ├── gauge.yaml       # Tachometer gauges
    ├── citation.yaml    # Academic citations
    ├── currency.yaml    # Money amounts
    └── dosage.yaml      # Medical dosages
```

## File Format
Each morph YAML file follows this structure:
```yaml
id: morphName
name: Human Readable Name
description: What this morph displays
category: basic | charts | extended

detection:
  type: string | number | boolean | array | object
  requiredKeys: [...]
  alternativeKeys: [...]
  # Additional detection rules

config:
  # Morph-specific settings
```

## Detection Priority
1. Object with specific required keys → specific morph
2. Array with specific item structure → specific morph
3. String with keywords → badge
4. String with URL pattern → link
5. String with image pattern → image
6. Number in rating range (0-10, decimal) → rating
7. Number in progress range (0-100, integer) → progress
8. Fallback by type

## JS Implementation
The JavaScript implementations are in `morphs/primitives/`:
- Each morph has a corresponding `.js` file
- Exports from `morphs/primitives/index.js`
- CSS styles in `styles/morphs.css` and `styles/morphs-extended.css`

## Adding New Morphs
1. Create `morphName.yaml` in `config/morphs/primitives/`
2. Define detection rules and config
3. Create JS implementation in `morphs/primitives/morphName.js`
4. Add CSS styles in `styles/morphs-extended.css`
5. Export from `morphs/primitives/index.js`
