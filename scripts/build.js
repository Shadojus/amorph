#!/usr/bin/env node
/**
 * AMORPH Build Script
 * Erstellt einen Produktions-Build
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { join } from 'path';

const DIST_DIR = './dist';

console.log('🏗️  AMORPH Build\n');

// Dist-Ordner erstellen
if (!existsSync(DIST_DIR)) {
  mkdirSync(DIST_DIR, { recursive: true });
}

// 1. HTML kopieren und anpassen
console.log('📄 HTML erstellen...');
let html = readFileSync('./index.html', 'utf-8');
// Pfade für Produktion anpassen (optional: inline CSS/JS)
writeFileSync(join(DIST_DIR, 'index.html'), html);

// 2. CSS zusammenführen
console.log('🎨 CSS bündeln...');
const cssFiles = ['base.css', 'morphs.css', 'features.css', 'layouts.css', 'perspektiven.css'];
let css = '';
for (const file of cssFiles) {
  const path = join('./styles', file);
  if (existsSync(path)) {
    css += `/* === ${file} === */\n`;
    css += readFileSync(path, 'utf-8');
    css += '\n\n';
  }
}
writeFileSync(join(DIST_DIR, 'styles.css'), css);

// 3. JavaScript-Module kopieren
console.log('📦 JavaScript kopieren...');
const jsDirs = ['core', 'morphs', 'observer', 'features', 'util'];
for (const dir of jsDirs) {
  if (existsSync(dir)) {
    cpSync(dir, join(DIST_DIR, dir), { recursive: true });
  }
}
cpSync('./index.js', join(DIST_DIR, 'index.js'));

// 4. Config kopieren
console.log('⚙️  Config kopieren...');
cpSync('./config', join(DIST_DIR, 'config'), { recursive: true });

// 5. Daten kopieren
console.log('📊 Daten kopieren...');
if (existsSync('./data')) {
  cpSync('./data', join(DIST_DIR, 'data'), { recursive: true });
}

// 6. Umgebungsvariablen ersetzen
console.log('🔐 Umgebungsvariablen ersetzen...');
replaceEnvVars(join(DIST_DIR, 'config'));

console.log('\n✅ Build fertig!');
console.log(`   Ausgabe: ${DIST_DIR}/`);
console.log('\nZum Testen: npx serve dist');

function replaceEnvVars(dir) {
  // Hier könnten ${VAR} Platzhalter ersetzt werden
  // Für jetzt nur ein Platzhalter
}
