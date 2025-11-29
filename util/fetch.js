export function createDataSource(config) {
  const { typ, url, headers = {}, sammlung } = config.quelle;
  
  switch (typ) {
    case 'pocketbase':
      return new PocketBaseSource(url, sammlung);
    case 'rest':
      return new RestSource(url, headers);
    case 'json':
      return new JsonSource(url);
    default:
      throw new Error(`Unbekannter Datenquellen-Typ: ${typ}`);
  }
}

class PocketBaseSource {
  constructor(url, sammlung) {
    this.url = url;
    this.sammlung = sammlung;
  }
  
  async query({ search, limit = 50, filter } = {}) {
    const params = new URLSearchParams();
    params.set('perPage', limit);
    
    if (search) {
      params.set('filter', `name~"${search.replace(/["\\]/g, '\\$&')}"`);
    }
    if (filter) {
      params.set('filter', filter);
    }
    
    const response = await fetch(
      `${this.url}/api/collections/${this.sammlung}/records?${params}`
    );
    
    if (!response.ok) throw new Error(`PocketBase: ${response.status}`);
    const data = await response.json();
    return data.items;
  }
}

class RestSource {
  constructor(url, headers) {
    this.url = url;
    this.headers = headers;
  }
  
  async query({ search, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (limit) params.set('limit', limit);
    
    const response = await fetch(`${this.url}?${params}`, {
      headers: this.headers
    });
    
    if (!response.ok) throw new Error(`REST: ${response.status}`);
    return response.json();
  }
}

class JsonSource {
  constructor(url) {
    this.url = url;
    this.data = null;
    this.lastMatchedTerms = new Set(); // Speichert welche Terme gematcht haben
  }
  
  async query({ search, limit = 50 } = {}) {
    if (!this.data) {
      const response = await fetch(this.url);
      this.data = await response.json();
    }
    
    let items = Array.isArray(this.data) ? this.data : this.data.items || [];
    this.lastMatchedTerms = new Set();
    
    if (search && search.trim()) {
      const query = search.toLowerCase().trim();
      
      // Intelligente Suche: Jedes Item bewerten und Match-Terme sammeln
      const scored = items.map(item => {
        const result = scoreItemWithMatches(item, query);
        return {
          item,
          score: result.score,
          matches: result.matches
        };
      });
      
      // Nur Treffer mit Score > 0
      const filtered = scored.filter(s => s.score > 0);
      
      // Alle gefundenen Match-Terme sammeln
      for (const s of filtered) {
        for (const match of s.matches) {
          this.lastMatchedTerms.add(match);
        }
      }
      
      items = filtered
        .sort((a, b) => b.score - a.score)
        .map(s => s.item);
    }
    
    return items.slice(0, limit);
  }
  
  getMatchedTerms() {
    return this.lastMatchedTerms; // Gibt das Set direkt zurück
  }
}

/**
 * Bewertet wie gut ein Item zur Suchanfrage passt UND gibt gefundene Matches zurück
 * @returns {{ score: number, matches: string[] }}
 */
function scoreItemWithMatches(item, query) {
  let score = 0;
  const matches = new Set();
  
  // Alle Texte aus dem Item extrahieren (auch verschachtelt)
  const allTexts = extractAllTexts(item);
  const allTextLower = allTexts.join(' ').toLowerCase();
  
  // === DIREKTE TREFFER ===
  const name = (item.name || '').toLowerCase();
  const wiss = (item.wissenschaftlich || '').toLowerCase();
  
  // Exakter Name-Match
  if (name === query) {
    score += 100;
    matches.add(item.name);
  }
  // Name beginnt mit Query
  else if (name.startsWith(query)) {
    score += 80;
    matches.add(item.name);
  }
  // Name enthält Query
  else if (name.includes(query)) {
    score += 60;
    matches.add(item.name);
  }
  
  // Wissenschaftlicher Name
  if (wiss.includes(query)) {
    score += 40;
    matches.add(item.wissenschaftlich);
  }
  
  // Andere Felder enthalten Query direkt - finde welche
  if (allTextLower.includes(query)) {
    score += 20;
    // Finde die tatsächlichen Matches in den Texten
    for (const text of allTexts) {
      if (text.toLowerCase().includes(query)) {
        // Extrahiere das passende Wort/Fragment
        const idx = text.toLowerCase().indexOf(query);
        const matchedWord = text.slice(idx, idx + query.length);
        matches.add(matchedWord);
        // Auch den Kontext hinzufügen (das ganze Wort)
        const words = text.split(/\s+/);
        for (const word of words) {
          if (word.toLowerCase().includes(query)) {
            matches.add(word.replace(/[.,;:!?()]/g, ''));
          }
        }
      }
    }
  }
  
  // === QUERY-WÖRTER EINZELN ===
  const stopwords = new Set(['was', 'ist', 'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'für', 'mit', 'von', 'zu', 'bei', 'kann', 'man', 'wie', 'wo', 'wer', 'welche', 'welcher']);
  const queryWords = query.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
  
  for (const word of queryWords) {
    if (allTextLower.includes(word)) {
      score += 10;
      // Finde das passende Wort im Original
      for (const text of allTexts) {
        if (text.toLowerCase().includes(word)) {
          const words = text.split(/\s+/);
          for (const w of words) {
            if (w.toLowerCase().includes(word)) {
              matches.add(w.replace(/[.,;:!?()]/g, ''));
            }
          }
        }
      }
    }
  }
  
  // === SEMANTISCHE MAPPINGS ===
  const semanticResult = semanticScoreWithMatches(item, query);
  score += semanticResult.score;
  for (const m of semanticResult.matches) {
    matches.add(m);
  }
  
  return { score, matches: [...matches] };
}

/**
 * Legacy-Funktion für Kompatibilität
 */
function scoreItem(item, query) {
  return scoreItemWithMatches(item, query).score;
}

/**
 * Extrahiert alle Text-Werte aus einem Objekt (rekursiv)
 */
function extractAllTexts(obj, texts = []) {
  if (obj === null || obj === undefined) return texts;
  
  if (typeof obj === 'string') {
    texts.push(obj);
  } else if (typeof obj === 'number') {
    texts.push(String(obj));
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      extractAllTexts(item, texts);
    }
  } else if (typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      extractAllTexts(value, texts);
    }
  }
  
  return texts;
}

/**
 * Semantische Suche mit Match-Tracking
 * @returns {{ score: number, matches: string[] }}
 */
function semanticScoreWithMatches(item, query) {
  let score = 0;
  const matchedTerms = new Set();
  const q = query.toLowerCase();
  
  // === ESSBARKEIT ===
  const essbar = item.essbarkeit || '';
  const essbarLower = essbar.toLowerCase();
  
  if (matches(q, ['essbar', 'essen', 'kann man essen', 'speisepilz', 'genießbar', 'lecker', 
                  'kochen', 'zubereiten', 'rezept', 'küche', 'mahlzeit', 'gericht'])) {
    if (essbarLower === 'essbar') { score += 50; matchedTerms.add(essbar); }
    if (essbarLower === 'bedingt essbar') { score += 30; matchedTerms.add(essbar); }
  }
  
  // Fragen nach giftigen Pilzen
  if (matches(q, ['giftig', 'gift', 'gefährlich', 'tödlich', 'tod', 'sterben', 
                  'vergiftung', 'symptome', 'krank', 'nicht essen', 'vorsicht', 'warnung'])) {
    if (essbarLower === 'giftig' || essbarLower === 'tödlich') { 
      score += 50; 
      matchedTerms.add(essbar); 
    }
    if (item.symptome) { 
      score += 30; 
      matchedTerms.add(item.symptome);
      // Einzelne Symptom-Wörter hinzufügen
      for (const word of item.symptome.split(/[,\s]+/)) {
        if (word.length > 3) matchedTerms.add(word);
      }
    }
  }
  
  // === STANDORT / ÖKOLOGIE ===
  const standorte = item.standort || [];
  const standorteLower = standorte.join(' ').toLowerCase();
  
  const standortMappings = [
    { keywords: ['wald', 'wälder', 'forst', 'waldpilz'], search: 'wald' },
    { keywords: ['wiese', 'wiesen', 'gras', 'rasen', 'weide'], search: ['wiese', 'weide', 'rasen'] },
    { keywords: ['baum', 'bäume', 'holz', 'stamm', 'stumpf'], search: ['holz', 'stamm', 'baum'] },
    { keywords: ['eiche', 'eichen'], search: 'eiche' },
    { keywords: ['buche', 'buchen', 'buchenwald'], search: 'buche' },
    { keywords: ['fichte', 'fichten', 'fichtenwald', 'nadelwald', 'nadel'], search: ['fichte', 'nadel'] },
    { keywords: ['kiefer', 'kiefern'], search: 'kiefer' },
    { keywords: ['birke', 'birken', 'birkenwald'], search: 'birke' }
  ];
  
  for (const mapping of standortMappings) {
    if (matches(q, mapping.keywords)) {
      const searches = Array.isArray(mapping.search) ? mapping.search : [mapping.search];
      for (const search of searches) {
        if (standorteLower.includes(search)) {
          score += 40;
          // Finde den Original-Standort der passt
          for (const s of standorte) {
            if (s.toLowerCase().includes(search)) {
              matchedTerms.add(s);
            }
          }
        }
      }
    }
  }
  
  // === SAISON / ZEIT ===
  const saison = item.saison || '';
  const saisonLower = saison.toLowerCase();
  
  const saisonMappings = [
    { keywords: ['frühling', 'frühjahr', 'märz', 'april', 'mai'], months: ['märz', 'april', 'mai'] },
    { keywords: ['sommer', 'juni', 'juli', 'august'], months: ['juni', 'juli', 'august'] },
    { keywords: ['herbst', 'september', 'oktober', 'november'], months: ['september', 'oktober', 'november'] },
    { keywords: ['winter', 'dezember', 'januar', 'februar'], months: ['dezember', 'januar', 'februar', 'märz'] }
  ];
  
  for (const mapping of saisonMappings) {
    if (matches(q, mapping.keywords)) {
      for (const month of mapping.months) {
        if (saisonLower.includes(month)) {
          score += 40;
          matchedTerms.add(saison);
          break;
        }
      }
    }
  }
  
  if (matches(q, ['jetzt', 'aktuell', 'gerade', 'heute', 'momentan'])) {
    const month = new Date().toLocaleString('de-DE', { month: 'long' }).toLowerCase();
    if (saisonLower.includes(month) || saisonLower.includes('ganzjährig')) {
      score += 40;
      matchedTerms.add(saison);
    }
  }
  
  // === GESCHMACK ===
  const geschmack = item.geschmack || '';
  const geschmackLower = geschmack.toLowerCase();
  
  const geschmackMappings = [
    { keywords: ['nussig', 'nuss'], search: ['nussig', 'nuss'] },
    { keywords: ['mild', 'sanft', 'leicht'], search: 'mild' },
    { keywords: ['würzig', 'würze', 'intensiv', 'kräftig', 'aromatisch'], search: ['würzig', 'aromatisch', 'intensiv'] },
    { keywords: ['umami', 'fleischig', 'herzhaft'], search: ['umami', 'fleischig'] }
  ];
  
  for (const mapping of geschmackMappings) {
    if (matches(q, mapping.keywords)) {
      const searches = Array.isArray(mapping.search) ? mapping.search : [mapping.search];
      for (const search of searches) {
        if (geschmackLower.includes(search)) {
          score += 40;
          matchedTerms.add(geschmack);
          break;
        }
      }
    }
  }
  
  // === ZUBEREITUNG ===
  const zubereitung = item.zubereitung || '';
  const zubereitungLower = zubereitung.toLowerCase();
  
  const zubereitungMappings = [
    { keywords: ['braten', 'pfanne', 'anbraten'], search: 'braten' },
    { keywords: ['trocknen', 'dörren', 'getrocknet'], search: 'trocknen' },
    { keywords: ['roh', 'ungekocht', 'salat'], search: 'roh' },
    { keywords: ['suppe', 'eintopf', 'kochen'], search: ['suppe', 'schmoren'] }
  ];
  
  for (const mapping of zubereitungMappings) {
    if (matches(q, mapping.keywords)) {
      const searches = Array.isArray(mapping.search) ? mapping.search : [mapping.search];
      for (const search of searches) {
        if (zubereitungLower.includes(search)) {
          score += 40;
          matchedTerms.add(zubereitung);
          break;
        }
      }
    }
  }
  
  // === VERWECHSLUNG ===
  if (matches(q, ['verwechslung', 'verwechseln', 'ähnlich', 'aussehen', 'doppelgänger', 'unterscheiden'])) {
    if (item.verwechslung && item.verwechslung.length > 0) {
      score += 30;
      for (const v of item.verwechslung) {
        matchedTerms.add(v);
      }
    }
  }
  
  // === ZUCHT ===
  if (matches(q, ['zucht', 'züchten', 'anbauen', 'kultivieren', 'selbst anbauen', 'zuhause'])) {
    if (standorteLower.includes('zucht') || saisonLower.includes('zucht') || saisonLower.includes('ganzjährig')) {
      score += 50;
      if (saisonLower.includes('ganzjährig')) matchedTerms.add(saison);
      for (const s of standorte) {
        if (s.toLowerCase().includes('zucht')) matchedTerms.add(s);
      }
    }
  }
  
  // === FARBE (aus Beschreibung) ===
  const beschreibung = item.beschreibung || '';
  const beschreibungLower = beschreibung.toLowerCase();
  
  const farbMappings = [
    { keywords: ['rot', 'roter'], search: 'rot' },
    { keywords: ['gelb', 'gelber', 'gold', 'golden'], search: ['gelb', 'gold', 'dotter'] },
    { keywords: ['braun', 'brauner'], search: ['braun', 'kastanie'] },
    { keywords: ['weiß', 'weißer', 'weiss'], search: ['weiß', 'weiss'] }
  ];
  
  for (const mapping of farbMappings) {
    if (matches(q, mapping.keywords)) {
      const searches = Array.isArray(mapping.search) ? mapping.search : [mapping.search];
      for (const search of searches) {
        if (beschreibungLower.includes(search)) {
          score += 30;
          // Finde das Wort im Kontext
          const words = beschreibung.split(/\s+/);
          for (const word of words) {
            if (word.toLowerCase().includes(search)) {
              matchedTerms.add(word.replace(/[.,;:!?()]/g, ''));
            }
          }
          break;
        }
      }
    }
  }
  
  return { score, matches: [...matchedTerms] };
}

/**
 * Legacy semanticScore für Kompatibilität
 */
function semanticScore(item, query) {
  return semanticScoreWithMatches(item, query).score;
}

/**
 * Prüft ob Query eines der Keywords enthält
 */
function matches(query, keywords) {
  return keywords.some(kw => query.includes(kw));
}
