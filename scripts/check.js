#!/usr/bin/env node
/**
 * AMORPH Config Checker
 * Prüft ob alle Konfigurationsdateien vorhanden und gültig sind
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIG_DIR = './config';
const REQUIRED_FILES = ['manifest.yaml', 'daten.yaml'];
const OPTIONAL_FILES = ['morphs.yaml', 'observer.yaml', 'features.yaml'];

let errors = [];
let warnings = [];

console.log('🔍 AMORPH Config Check\n');

// Pflichtdateien prüfen
console.log('Pflichtdateien:');
for (const file of REQUIRED_FILES) {
  const path = join(CONFIG_DIR, file);
  if (existsSync(path)) {
    console.log(`  ✅ ${file}`);
    validateYAML(path, file);
  } else {
    console.log(`  ❌ ${file} - FEHLT!`);
    errors.push(`Pflichtdatei fehlt: ${file}`);
  }
}

// Optionale Dateien prüfen
console.log('\nOptionale Dateien:');
for (const file of OPTIONAL_FILES) {
  const path = join(CONFIG_DIR, file);
  if (existsSync(path)) {
    console.log(`  ✅ ${file}`);
    validateYAML(path, file);
  } else {
    console.log(`  ⚪ ${file} - nicht vorhanden`);
  }
}

// Datenquelle prüfen
console.log('\nDatenquelle:');
const datenPath = join(CONFIG_DIR, 'daten.yaml');
if (existsSync(datenPath)) {
  const content = readFileSync(datenPath, 'utf-8');
  if (content.includes('typ: json')) {
    const match = content.match(/url:\s*(.+)/);
    if (match) {
      const dataUrl = match[1].trim();
      if (existsSync(dataUrl.replace('./', ''))) {
        console.log(`  ✅ JSON-Datei gefunden: ${dataUrl}`);
      } else {
        console.log(`  ⚠️  JSON-Datei nicht gefunden: ${dataUrl}`);
        warnings.push(`Datendatei nicht gefunden: ${dataUrl}`);
      }
    }
  } else {
    console.log(`  ℹ️  Externe Datenquelle konfiguriert`);
  }
}

// Zusammenfassung
console.log('\n' + '='.repeat(40));
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Konfiguration ist gültig!');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} Fehler:`);
    errors.forEach(e => console.log(`   - ${e}`));
  }
  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} Warnungen:`);
    warnings.forEach(w => console.log(`   - ${w}`));
  }
  process.exit(errors.length > 0 ? 1 : 0);
}

function validateYAML(path, filename) {
  try {
    const content = readFileSync(path, 'utf-8');
    
    // Basis-Validierung
    if (content.trim().length === 0) {
      errors.push(`${filename} ist leer`);
    }
    
    // Spezifische Validierung
    if (filename === 'manifest.yaml') {
      if (!content.includes('name:')) {
        errors.push(`${filename}: 'name' fehlt`);
      }
    }
    
    if (filename === 'daten.yaml') {
      if (!content.includes('quelle:')) {
        errors.push(`${filename}: 'quelle' fehlt`);
      }
    }
    
  } catch (e) {
    errors.push(`${filename}: Lesefehler - ${e.message}`);
  }
}
