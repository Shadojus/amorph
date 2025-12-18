# 🤖 AMORPH Data Agent System

System für Claude-Subagenten zur automatischen Datenrecherche und -erstellung.

## Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. RESEARCH    │ ──► │  2. CREATE      │ ──► │  3. VALIDATE    │
│  Agent          │     │  Agent          │     │  Script         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     │                       │                       │
     ▼                       ▼                       ▼
  Internet &            JSON-Dateien            Zod-Schemas
  Datenbanken           nach Blueprint          aus Blueprints
```

## Agent-Prompts

### 1. Research Agent
Recherchiert Informationen zu einer Spezies aus dem Internet.

### 2. Create Agent  
Erstellt JSON-Dateien basierend auf Blueprint-Struktur.

### 3. Validation
`npm run validate` prüft alle erstellten Daten.

## Verwendung

Sage mir welche Spezies du erstellen möchtest, z.B.:
- "Erstelle Daten für Steinpilz (Boletus edulis)"
- "Erstelle Daten für Fliegenpilz (Amanita muscaria)"
- "Erstelle Daten für Rotbuche (Fagus sylvatica)"

Ich werde dann:
1. Einen Subagenten starten der im Internet recherchiert
2. Die Daten in die korrekten JSON-Strukturen umwandeln
3. Mit `npm run validate` validieren
4. Fehler korrigieren bis alles passt
