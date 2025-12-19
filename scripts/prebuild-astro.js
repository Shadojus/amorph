/**
 * Prebuild Script für Astro
 * 
 * Kopiert statische Assets nach public/ vor dem Astro Build
 * 
 * Usage: node scripts/prebuild-astro.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

// Ordner die nach public kopiert werden müssen
const DIRS_TO_COPY = [
  'styles',
  'config', 
  'data',
  'morphs',
  'features',
  'core',
  'util',
  'observer'
];

// Einzelne Dateien
const FILES_TO_COPY = [
  'index.js'
];

/**
 * Rekursiv kopieren
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  
  fs.mkdirSync(dest, { recursive: true });
  
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // Skip node_modules, dist, .git etc
    if (['node_modules', 'dist', '.git', 'public', 'src'].includes(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function prebuild() {
  console.log('📦 Preparing assets for Astro build...\n');
  
  // Public directory erstellen
  fs.mkdirSync(PUBLIC, { recursive: true });
  
  // Ordner kopieren
  for (const dir of DIRS_TO_COPY) {
    const src = path.join(ROOT, dir);
    const dest = path.join(PUBLIC, dir);
    
    if (fs.existsSync(src)) {
      // Zuerst alten Ordner löschen falls vorhanden
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true });
      }
      copyDir(src, dest);
      console.log(`  ✅ ${dir}/`);
    }
  }
  
  // Einzelne Dateien kopieren
  for (const file of FILES_TO_COPY) {
    const src = path.join(ROOT, file);
    const dest = path.join(PUBLIC, file);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✅ ${file}`);
    }
  }
  
  console.log('\n✨ Prebuild complete!');
}

prebuild().catch(console.error);
