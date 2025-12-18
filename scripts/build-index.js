/**
 * AMORPH Universe Index Generator
 * 
 * Scannt alle Spezies-Ordner und erstellt universe-index.json
 * Das Frontend lädt nur diese Datei beim Start = schnell!
 * 
 * Usage:
 *   node scripts/build-index.js
 *   npm run build:index
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT_PATH = path.join(DATA_DIR, 'universe-index.json');

const KINGDOMS = [
  { slug: 'fungi', name: 'Fungi', icon: '🍄' },
  { slug: 'plantae', name: 'Plantae', icon: '🌿' },
  { slug: 'animalia', name: 'Animalia', icon: '🦋' },
  { slug: 'bacteria', name: 'Bacteria', icon: '🦠' },
];

function buildIndex() {
  console.log('🔨 Building Universe Index...\n');
  
  const index = {
    version: '1.0',
    generated: new Date().toISOString(),
    total: 0,
    kingdoms: {},
    species: [],
  };
  
  // Kingdom-Struktur initialisieren
  for (const k of KINGDOMS) {
    index.kingdoms[k.slug] = {
      name: k.name,
      icon: k.icon,
      count: 0,
    };
  }
  
  // Alle Kingdoms durchgehen
  for (const kingdom of KINGDOMS) {
    const kingdomPath = path.join(DATA_DIR, kingdom.slug);
    
    if (!fs.existsSync(kingdomPath)) {
      console.log(`  ⚠️  ${kingdom.slug}/ nicht gefunden, überspringe...`);
      continue;
    }
    
    // Alle Spezies-Ordner im Kingdom
    const speciesDirs = fs.readdirSync(kingdomPath)
      .filter(d => {
        const fullPath = path.join(kingdomPath, d);
        return fs.statSync(fullPath).isDirectory();
      });
    
    for (const speciesSlug of speciesDirs) {
      const speciesPath = path.join(kingdomPath, speciesSlug);
      const indexPath = path.join(speciesPath, 'index.json');
      
      // Prüfe ob index.json existiert
      if (!fs.existsSync(indexPath)) {
        console.log(`  ⚠️  ${kingdom.slug}/${speciesSlug}/index.json fehlt, überspringe...`);
        continue;
      }
      
      try {
        const speciesData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        
        // Perspektiven aus vorhandenen JSON-Dateien ermitteln
        const perspectiveFiles = fs.readdirSync(speciesPath)
          .filter(f => f.endsWith('.json') && f !== 'index.json')
          .map(f => f.replace('.json', ''));
        
        // Spezies zum Index hinzufügen
        index.species.push({
          id: speciesData.id || `${kingdom.slug}-${speciesSlug}`,
          slug: speciesSlug,
          name: speciesData.name || speciesSlug,
          scientific_name: speciesData.scientific_name || speciesData.scientificName || '',
          image: speciesData.image || speciesData.bild || '',
          description: speciesData.description || speciesData.summary || '',
          kingdom: kingdom.slug,
          kingdom_name: kingdom.name,
          kingdom_icon: kingdom.icon,
          perspectives: perspectiveFiles,
        });
        
        index.kingdoms[kingdom.slug].count++;
        index.total++;
        
        console.log(`  ✅ ${kingdom.slug}/${speciesSlug} (${perspectiveFiles.length} Perspektiven)`);
        
      } catch (e) {
        console.log(`  ❌ ${kingdom.slug}/${speciesSlug}: ${e.message}`);
      }
    }
  }
  
  // Index schreiben
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
  
  console.log('\n' + '─'.repeat(50));
  console.log(`📦 Universe Index erstellt: ${OUTPUT_PATH}`);
  console.log(`   ${index.total} Spezies in ${Object.keys(index.kingdoms).length} Kingdoms`);
  
  for (const [slug, data] of Object.entries(index.kingdoms)) {
    if (data.count > 0) {
      console.log(`   ${data.icon} ${data.name}: ${data.count}`);
    }
  }
  
  console.log('─'.repeat(50) + '\n');
  
  return index;
}

// Kingdom index.json Dateien aktualisieren
function updateKingdomIndexes(universeIndex) {
  console.log('📁 Updating Kingdom Indexes...\n');
  
  for (const kingdom of KINGDOMS) {
    const kingdomPath = path.join(DATA_DIR, kingdom.slug);
    
    if (!fs.existsSync(kingdomPath)) continue;
    
    const kingdomSpecies = universeIndex.species
      .filter(s => s.kingdom === kingdom.slug)
      .map(s => ({
        slug: s.slug,
        name: s.name,
        scientific_name: s.scientific_name,
        perspectives: s.perspectives,
      }));
    
    if (kingdomSpecies.length === 0) continue;
    
    const kingdomIndex = {
      kingdom: kingdom.slug,
      name: kingdom.name,
      icon: kingdom.icon,
      count: kingdomSpecies.length,
      species: kingdomSpecies,
    };
    
    const indexPath = path.join(kingdomPath, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(kingdomIndex, null, 2));
    console.log(`  ✅ ${kingdom.slug}/index.json (${kingdomSpecies.length} Spezies)`);
  }
  
  console.log('');
}

// Main
const universeIndex = buildIndex();
updateKingdomIndexes(universeIndex);
