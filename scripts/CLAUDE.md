# Scripts

Build- und Validierungs-Scripts.

## Hinweis

Dieser Ordner ist für Build- und Validierungs-Scripts vorgesehen.

## Mögliche Scripts

| Script | Zweck |
|--------|-------|
| `build.js` | Production Build (Bundling, Minification) |
| `check.js` | Schema-Validierung |
| `validate-data.js` | Daten gegen Schema validieren |
| `generate-types.js` | TypeScript-Typen aus Schema generieren |

## Verwendung

```bash
node scripts/build.js
node scripts/check.js
```

## Hinweise

- Das Projekt nutzt native ES-Module
- Kein Build-Step für Development nötig
- Scripts sind optional für Production
