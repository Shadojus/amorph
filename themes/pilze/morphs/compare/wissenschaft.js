/**
 * WISSENSCHAFT - Compare-Morph für Wissenschafts-Perspektive
 * 
 * Zeigt: Taxonomie, Morphologie, Mikroskopie, Genetik, Ökologie, Wirkstoffe
 * 
 * DATENGETRIEBEN: Erkennt Typen aus der Datenstruktur
 * DEDUPLIZIERUNG: Respektiert config.skipFelder
 */

import { debug } from '../../../../observer/debug.js';
import { createSectionIfNew, createLegende } from '../../../../morphs/compare/base.js';
import { 
  compareText, compareBar, comparePie, compareRadar, compareList, compareObject
} from '../../../../morphs/compare/primitives/index.js';

// ============== HELPER FUNCTIONS ==============

/**
 * Rendert Taxonomie als hierarchische Karten
 */
function renderTaxonomieComparison(items, skipFelder) {
  const validItems = items.filter(i => i.data.taxonomie);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'taxonomie-comparison';
  
  // Taxonomie-Ränge für Darstellung
  const raenge = ['reich', 'abteilung', 'klasse', 'ordnung', 'familie', 'gattung', 'art'];
  const rangLabels = {
    reich: 'Reich', abteilung: 'Abteilung', klasse: 'Klasse', ordnung: 'Ordnung',
    familie: 'Familie', gattung: 'Gattung', art: 'Art'
  };
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'taxonomie-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'taxonomie-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const taxonomie = item.data.taxonomie;
    const tree = document.createElement('div');
    tree.className = 'taxonomie-tree';
    
    raenge.forEach(rang => {
      if (taxonomie[rang]) {
        const level = document.createElement('div');
        level.className = `taxonomie-level rang-${rang}`;
        level.innerHTML = `
          <span class="rang-label">${rangLabels[rang]}</span>
          <span class="rang-value">${taxonomie[rang]}</span>
        `;
        tree.appendChild(level);
      }
    });
    
    card.appendChild(tree);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Morphologie als Vergleichstabelle
 */
function renderMorphologieComparison(items, skipFelder) {
  const validItems = items.filter(i => i.data.morphologie);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'morphologie-comparison';
  
  // Alle Merkmale sammeln
  const alleMerkmale = new Set();
  validItems.forEach(item => {
    Object.keys(item.data.morphologie).forEach(k => alleMerkmale.add(k));
  });
  
  const merkmaleLabels = {
    hut: '🎩 Hut', lamellen: '📊 Lamellen', stiel: '🪵 Stiel',
    fleisch: '🥩 Fleisch', sporen: '🔬 Sporen', ring: '💍 Ring',
    volva: '🏺 Volva', geruch: '👃 Geruch', geschmack: '👅 Geschmack'
  };
  
  alleMerkmale.forEach(merkmal => {
    const row = document.createElement('div');
    row.className = 'morphologie-row';
    
    const label = document.createElement('div');
    label.className = 'morphologie-label';
    label.textContent = merkmaleLabels[merkmal] || merkmal;
    row.appendChild(label);
    
    const values = document.createElement('div');
    values.className = 'morphologie-values';
    
    validItems.forEach(item => {
      const value = document.createElement('div');
      value.className = 'morphologie-value';
      value.style.setProperty('--item-farbe', item.farbe);
      
      const merkmalData = item.data.morphologie[merkmal];
      let text = '—';
      
      if (merkmalData) {
        if (typeof merkmalData === 'object') {
          text = Object.entries(merkmalData)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        } else {
          text = merkmalData;
        }
      }
      
      value.innerHTML = `
        <span class="pilz-dot small" style="background:${item.farbe}"></span>
        <span class="value-text">${text}</span>
      `;
      values.appendChild(value);
    });
    
    row.appendChild(values);
    container.appendChild(row);
  });
  
  return container;
}

/**
 * Rendert Mikroskopie-Daten
 */
function renderMikroskopieComparison(items, skipFelder) {
  const validItems = items.filter(i => i.data.mikroskopie);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'mikroskopie-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'mikroskopie-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'mikroskopie-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const mikro = item.data.mikroskopie;
    const content = document.createElement('div');
    content.className = 'mikroskopie-content';
    
    // Sporen
    if (mikro.sporen) {
      const sporen = mikro.sporen;
      content.innerHTML += `
        <div class="mikro-item">
          <span class="mikro-label">Sporen</span>
          <span class="mikro-value">
            ${sporen.form || ''} 
            ${sporen.groesse || sporen.laenge ? `${sporen.laenge || sporen.groesse} × ${sporen.breite || ''}µm` : ''}
            ${sporen.farbe ? `, ${sporen.farbe}` : ''}
          </span>
        </div>`;
    }
    
    // Basidien
    if (mikro.basidien) {
      content.innerHTML += `<div class="mikro-item">
        <span class="mikro-label">Basidien</span>
        <span class="mikro-value">${typeof mikro.basidien === 'object' ? JSON.stringify(mikro.basidien) : mikro.basidien}</span>
      </div>`;
    }
    
    // Zystiden
    if (mikro.zystiden) {
      content.innerHTML += `<div class="mikro-item">
        <span class="mikro-label">Zystiden</span>
        <span class="mikro-value">${mikro.zystiden}</span>
      </div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Genetik-Daten (ITS, GenBank)
 */
function renderGenetikComparison(items, skipFelder) {
  const validItems = items.filter(i => i.data.genetik);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'genetik-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'genetik-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'genetik-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const gen = item.data.genetik;
    const content = document.createElement('div');
    content.className = 'genetik-content';
    
    if (gen.its_region) {
      content.innerHTML += `<div class="gen-item"><span class="gen-label">ITS Region</span><span class="gen-value">${gen.its_region}</span></div>`;
    }
    if (gen.genbank_accession) {
      content.innerHTML += `<div class="gen-item"><span class="gen-label">GenBank</span><a href="https://www.ncbi.nlm.nih.gov/nuccore/${gen.genbank_accession}" target="_blank" class="gen-link">${gen.genbank_accession}</a></div>`;
    }
    if (gen.sequenz_laenge) {
      content.innerHTML += `<div class="gen-item"><span class="gen-label">Sequenzlänge</span><span class="gen-value">${gen.sequenz_laenge} bp</span></div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * Rendert Ökologie-Daten
 */
function renderOekologieComparison(items, skipFelder) {
  const validItems = items.filter(i => i.data.oekologie);
  if (validItems.length === 0) return null;
  
  const container = document.createElement('div');
  container.className = 'oekologie-comparison';
  
  validItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'oekologie-card';
    card.style.setProperty('--item-farbe', item.farbe || 'var(--color-accent)');
    
    const header = document.createElement('div');
    header.className = 'oekologie-header';
    header.innerHTML = `<span class="pilz-dot" style="background:${item.farbe}"></span> ${item.name}`;
    card.appendChild(header);
    
    const oeko = item.data.oekologie;
    const content = document.createElement('div');
    content.className = 'oekologie-content';
    
    if (oeko.lebensweise) {
      const icon = { saprobiont: '🍂', mykorrhiza: '🌳', parasit: '🦠' }[oeko.lebensweise.toLowerCase()] || '🍄';
      content.innerHTML += `<div class="oeko-item oeko-lebensweise"><span class="oeko-icon">${icon}</span><span class="oeko-value">${oeko.lebensweise}</span></div>`;
    }
    if (oeko.partner) {
      content.innerHTML += `<div class="oeko-item"><span class="oeko-label">Partner</span><span class="oeko-value">${Array.isArray(oeko.partner) ? oeko.partner.join(', ') : oeko.partner}</span></div>`;
    }
    if (oeko.substrat) {
      content.innerHTML += `<div class="oeko-item"><span class="oeko-label">Substrat</span><span class="oeko-value">${Array.isArray(oeko.substrat) ? oeko.substrat.join(', ') : oeko.substrat}</span></div>`;
    }
    if (oeko.habitat) {
      content.innerHTML += `<div class="oeko-item"><span class="oeko-label">Habitat</span><span class="oeko-value">${Array.isArray(oeko.habitat) ? oeko.habitat.join(', ') : oeko.habitat}</span></div>`;
    }
    
    card.appendChild(content);
    container.appendChild(card);
  });
  
  return container;
}

/**
 * @param {Array} items - [{id, name, data, farbe}]
 * @param {Object} perspektive - {id, name, symbol, farben, felder}
 * @param {Object} config - {skipFelder: Set} für Deduplizierung
 */
export function compareWissenschaft(items, perspektive, config = {}) {
  debug.morphs('compareWissenschaft', { items: items.length });
  
  const skipFelder = config.skipFelder || null;
  
  const container = document.createElement('div');
  container.className = 'compare-perspektive compare-wissenschaft';
  container.style.setProperty('--p-farbe', perspektive.farben?.[0] || 'rgba(140, 200, 255, 0.65)');
  
  // Header
  const header = document.createElement('div');
  header.className = 'compare-perspektive-header';
  header.innerHTML = `
    <span class="perspektive-symbol">${perspektive.symbol || '🔬'}</span>
    <span class="perspektive-name">${perspektive.name || 'Wissenschaft'}</span>
    <span class="perspektive-count">${items.length} Items</span>
  `;
  container.appendChild(header);
  
  // Legende
  container.appendChild(createLegende(items));
  
  const sections = document.createElement('div');
  sections.className = 'compare-sections';
  
  // 1. Wissenschaftlicher Name (Text)
  const wissNameItems = items.filter(i => i.data.wissenschaftlich);
  if (wissNameItems.length > 0) {
    const section = createSectionIfNew('wissenschaftlich', 'Wissenschaftlicher Name', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = wissNameItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.wissenschaftlich, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareText(mapped, { italic: true }));
      sections.appendChild(section);
    }
  }
  
  // 2. Taxonomie (erweiterte Hierarchie)
  const taxonomieSection = createSectionIfNew('taxonomie', '🌳 Taxonomie', perspektive.farben?.[1], skipFelder);
  if (taxonomieSection) {
    const content = renderTaxonomieComparison(items, skipFelder);
    if (content) {
      taxonomieSection.addContent(content);
      sections.appendChild(taxonomieSection);
    }
  }
  
  // 3. Synonyme
  const synonymeItems = items.filter(i => i.data.synonyme?.length > 0);
  if (synonymeItems.length > 0) {
    const section = createSectionIfNew('synonyme', 'Synonyme', perspektive.farben?.[2], skipFelder);
    if (section) {
      const mapped = synonymeItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.synonyme, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareList(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 4. Morphologie (Vergleichstabelle)
  const morphologieSection = createSectionIfNew('morphologie', '👁️ Morphologie', perspektive.farben?.[3], skipFelder);
  if (morphologieSection) {
    const content = renderMorphologieComparison(items, skipFelder);
    if (content) {
      morphologieSection.addContent(content);
      sections.appendChild(morphologieSection);
    }
  }
  
  // 5. Mikroskopie
  const mikroskopieSection = createSectionIfNew('mikroskopie', '🔬 Mikroskopie', perspektive.farben?.[0], skipFelder);
  if (mikroskopieSection) {
    const content = renderMikroskopieComparison(items, skipFelder);
    if (content) {
      mikroskopieSection.addContent(content);
      sections.appendChild(mikroskopieSection);
    }
  }
  
  // 6. Genetik
  const genetikSection = createSectionIfNew('genetik', '🧬 Genetik', perspektive.farben?.[1], skipFelder);
  if (genetikSection) {
    const content = renderGenetikComparison(items, skipFelder);
    if (content) {
      genetikSection.addContent(content);
      sections.appendChild(genetikSection);
    }
  }
  
  // 7. Ökologie
  const oekologieSection = createSectionIfNew('oekologie', '🌿 Ökologie', perspektive.farben?.[2], skipFelder);
  if (oekologieSection) {
    const content = renderOekologieComparison(items, skipFelder);
    if (content) {
      oekologieSection.addContent(content);
      sections.appendChild(oekologieSection);
    }
  }
  
  // 8. Wirkstoffe (Bar) - gruppiert nach Wirkstoff
  const wirkstoffItems = items.filter(i => i.data.wirkstoffe?.length > 0);
  if (wirkstoffItems.length > 0) {
    const section = createSectionIfNew('wirkstoffe', '⚗️ Wirkstoffe', perspektive.farben?.[3], skipFelder);
    if (section) {
      section.addContent(createWirkstoffVergleich(wirkstoffItems));
      sections.appendChild(section);
    }
  }
  
  // 9. Nährwerte (Pie)
  const naehrwerteItems = items.filter(i => i.data.naehrwerte);
  if (naehrwerteItems.length > 0) {
    const section = createSectionIfNew('naehrwerte', '🥧 Zusammensetzung', perspektive.farben?.[0], skipFelder);
    if (section) {
      const mapped = naehrwerteItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.naehrwerte, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(comparePie(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 10. Profil (Radar)
  const profilItems = items.filter(i => i.data.profil);
  if (profilItems.length > 0) {
    const section = createSectionIfNew('profil', '📊 Eigenschaften-Profil', perspektive.farben?.[1], skipFelder);
    if (section) {
      const mapped = profilItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.profil, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareRadar(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  // 11. Forschungsreferenzen
  const refItems = items.filter(i => i.data.forschung_referenzen?.length > 0);
  if (refItems.length > 0) {
    const section = createSectionIfNew('forschung_referenzen', '📚 Wissenschaftliche Referenzen', perspektive.farben?.[2], skipFelder);
    if (section) {
      const mapped = refItems.map(i => ({
        id: i.id, name: i.name, wert: i.data.forschung_referenzen, farbe: i.farbe, textFarbe: i.textFarbe, farbKlasse: i.farbKlasse
      }));
      section.addContent(compareList(mapped, {}));
      sections.appendChild(section);
    }
  }
  
  container.appendChild(sections);
  return container;
}

/**
 * Erstellt Wirkstoff-Vergleich: Gruppiert nach Wirkstoff
 */
function createWirkstoffVergleich(items) {
  const el = document.createElement('div');
  el.className = 'compare-wirkstoffe';
  
  // Alle Wirkstoffe sammeln
  const alleWirkstoffe = new Map();
  items.forEach(item => {
    if (!Array.isArray(item.data.wirkstoffe)) return;
    item.data.wirkstoffe.forEach(w => {
      const key = w.label || w.name;
      if (!alleWirkstoffe.has(key)) {
        alleWirkstoffe.set(key, { label: key, unit: w.unit || '', werte: [] });
      }
      alleWirkstoffe.get(key).werte.push({
        name: item.name,
        farbKlasse: item.farbKlasse,
        farbe: item.farbe,
        value: w.value
      });
    });
  });
  
  alleWirkstoffe.forEach(({ label, unit, werte }) => {
    const row = document.createElement('div');
    row.className = 'wirkstoffe-row';
    
    const labelEl = document.createElement('span');
    labelEl.className = 'wirkstoffe-label';
    labelEl.textContent = label;
    row.appendChild(labelEl);
    
    const barContainer = document.createElement('div');
    barContainer.className = 'wirkstoffe-bars';
    
    const maxVal = Math.max(...werte.map(w => Number(w.value) || 0), 1);
    
    werte.forEach(({ name, farbKlasse, farbe, value }) => {
      const pct = Math.min(100, (Number(value) / maxVal) * 100);
      const bar = document.createElement('div');
      bar.className = `wirkstoffe-bar ${farbKlasse || ''}`;
      bar.innerHTML = `
        <div class="bar-fill" style="width:${pct}%" title="${name}"></div>
        <span class="bar-value">${value}${unit}</span>
      `;
      barContainer.appendChild(bar);
    });
    
    row.appendChild(barContainer);
    el.appendChild(row);
  });
  
  return el;
}

export default {
  id: 'wissenschaft',
  render: compareWissenschaft
};
