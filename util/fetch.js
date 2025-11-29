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
  }
  
  async query({ search, limit = 50 } = {}) {
    if (!this.data) {
      const response = await fetch(this.url);
      this.data = await response.json();
    }
    
    let items = Array.isArray(this.data) ? this.data : this.data.items || [];
    
    if (search && search.trim()) {
      const query = search.toLowerCase().trim();
      
      // Intelligente Suche: Jedes Item bewerten
      const scored = items.map(item => ({
        item,
        score: scoreItem(item, query)
      }));
      
      // Nur Treffer mit Score > 0
      items = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.item);
    }
    
    return items.slice(0, limit);
  }
}

/**
 * Bewertet wie gut ein Item zur Suchanfrage passt
 * Höherer Score = besserer Treffer
 */
function scoreItem(item, query) {
  let score = 0;
  
  // Alle Texte aus dem Item extrahieren (auch verschachtelt)
  const allTexts = extractAllTexts(item);
  const allTextLower = allTexts.join(' ').toLowerCase();
  
  // === DIREKTE TREFFER ===
  // Exakter Name-Match (höchste Priorität)
  if ((item.name || '').toLowerCase() === query) {
    score += 100;
  }
  // Name beginnt mit Query
  else if ((item.name || '').toLowerCase().startsWith(query)) {
    score += 80;
  }
  // Name enthält Query
  else if ((item.name || '').toLowerCase().includes(query)) {
    score += 60;
  }
  
  // Wissenschaftlicher Name
  if ((item.wissenschaftlich || '').toLowerCase().includes(query)) {
    score += 40;
  }
  
  // Andere Felder enthalten Query direkt
  if (allTextLower.includes(query)) {
    score += 20;
  }
  
  // === FUZZY / SYNONYME ===
  // Wörter der Query einzeln prüfen
  const queryWords = query.split(/\s+/).filter(w => w.length > 2);
  for (const word of queryWords) {
    if (allTextLower.includes(word)) {
      score += 10;
    }
  }
  
  // === SEMANTISCHE MAPPINGS ===
  score += semanticScore(item, query);
  
  return score;
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
 * Semantische Suche - Nutzerintentionen auf Datenfelder mappen
 */
function semanticScore(item, query) {
  let score = 0;
  const q = query.toLowerCase();
  
  // === ESSBARKEIT ===
  const essbar = (item.essbarkeit || '').toLowerCase();
  
  // Fragen nach essbaren Pilzen
  if (matches(q, ['essbar', 'essen', 'kann man essen', 'speisepilz', 'genießbar', 'lecker', 
                  'kochen', 'zubereiten', 'rezept', 'küche', 'mahlzeit', 'gericht'])) {
    if (essbar === 'essbar') score += 50;
    if (essbar === 'bedingt essbar') score += 30;
  }
  
  // Fragen nach giftigen Pilzen
  if (matches(q, ['giftig', 'gift', 'gefährlich', 'tödlich', 'tod', 'sterben', 
                  'vergiftung', 'symptome', 'krank', 'nicht essen', 'vorsicht', 'warnung'])) {
    if (essbar === 'giftig' || essbar === 'tödlich') score += 50;
    if (item.symptome) score += 30;
  }
  
  // === STANDORT / ÖKOLOGIE ===
  const standorte = (item.standort || []).join(' ').toLowerCase();
  
  if (matches(q, ['wald', 'wälder', 'forst', 'waldpilz'])) {
    if (standorte.includes('wald')) score += 40;
  }
  
  if (matches(q, ['wiese', 'wiesen', 'gras', 'rasen', 'weide'])) {
    if (standorte.includes('wiese') || standorte.includes('weide') || standorte.includes('rasen')) score += 40;
  }
  
  if (matches(q, ['baum', 'bäume', 'holz', 'stamm', 'stumpf'])) {
    if (standorte.includes('holz') || standorte.includes('stamm') || standorte.includes('baum')) score += 40;
  }
  
  if (matches(q, ['eiche', 'eichen'])) {
    if (standorte.includes('eiche')) score += 50;
  }
  
  if (matches(q, ['buche', 'buchen', 'buchenwald'])) {
    if (standorte.includes('buche')) score += 50;
  }
  
  if (matches(q, ['fichte', 'fichten', 'fichtenwald', 'nadelwald', 'nadel'])) {
    if (standorte.includes('fichte') || standorte.includes('nadel')) score += 50;
  }
  
  if (matches(q, ['kiefer', 'kiefern'])) {
    if (standorte.includes('kiefer')) score += 50;
  }
  
  if (matches(q, ['birke', 'birken', 'birkenwald'])) {
    if (standorte.includes('birke')) score += 50;
  }
  
  // === SAISON / ZEIT ===
  const saison = (item.saison || '').toLowerCase();
  
  if (matches(q, ['frühling', 'frühjahr', 'märz', 'april', 'mai'])) {
    if (saison.includes('märz') || saison.includes('april') || saison.includes('mai')) score += 40;
  }
  
  if (matches(q, ['sommer', 'juni', 'juli', 'august'])) {
    if (saison.includes('juni') || saison.includes('juli') || saison.includes('august')) score += 40;
  }
  
  if (matches(q, ['herbst', 'september', 'oktober', 'november'])) {
    if (saison.includes('september') || saison.includes('oktober') || saison.includes('november')) score += 40;
  }
  
  if (matches(q, ['winter', 'dezember', 'januar', 'februar', 'kalt', 'frost'])) {
    if (saison.includes('dezember') || saison.includes('januar') || saison.includes('februar') || 
        saison.includes('märz') || saison.includes('ganzjährig')) score += 40;
  }
  
  if (matches(q, ['jetzt', 'aktuell', 'gerade', 'heute', 'momentan'])) {
    // Aktueller Monat (November)
    const month = new Date().toLocaleString('de-DE', { month: 'long' }).toLowerCase();
    if (saison.toLowerCase().includes(month) || saison.includes('ganzjährig')) score += 40;
  }
  
  // === GESCHMACK ===
  const geschmack = (item.geschmack || '').toLowerCase();
  
  if (matches(q, ['nussig', 'nuss'])) {
    if (geschmack.includes('nussig') || geschmack.includes('nuss')) score += 40;
  }
  
  if (matches(q, ['mild', 'sanft', 'leicht'])) {
    if (geschmack.includes('mild')) score += 40;
  }
  
  if (matches(q, ['würzig', 'würze', 'intensiv', 'kräftig', 'aromatisch'])) {
    if (geschmack.includes('würzig') || geschmack.includes('aromatisch') || geschmack.includes('intensiv')) score += 40;
  }
  
  if (matches(q, ['umami', 'fleischig', 'herzhaft'])) {
    if (geschmack.includes('umami') || geschmack.includes('fleischig')) score += 40;
  }
  
  // === ZUBEREITUNG ===
  const zubereitung = (item.zubereitung || '').toLowerCase();
  
  if (matches(q, ['braten', 'pfanne', 'anbraten'])) {
    if (zubereitung.includes('braten')) score += 40;
  }
  
  if (matches(q, ['trocknen', 'dörren', 'getrocknet'])) {
    if (zubereitung.includes('trocknen')) score += 40;
  }
  
  if (matches(q, ['roh', 'ungekocht', 'salat'])) {
    if (zubereitung.includes('roh')) score += 40;
  }
  
  if (matches(q, ['suppe', 'eintopf', 'kochen'])) {
    if (zubereitung.includes('suppe') || zubereitung.includes('schmoren')) score += 40;
  }
  
  // === VERWECHSLUNG ===
  if (matches(q, ['verwechslung', 'verwechseln', 'ähnlich', 'aussehen', 'doppelgänger', 'unterscheiden'])) {
    if (item.verwechslung && item.verwechslung.length > 0) score += 30;
  }
  
  // === ZUCHT ===
  if (matches(q, ['zucht', 'züchten', 'anbauen', 'kultivieren', 'selbst anbauen', 'zuhause'])) {
    if (standorte.includes('zucht') || saison.includes('zucht') || saison.includes('ganzjährig')) score += 50;
  }
  
  // === FARBE (aus Beschreibung) ===
  const beschreibung = (item.beschreibung || '').toLowerCase();
  
  if (matches(q, ['rot', 'roter'])) {
    if (beschreibung.includes('rot')) score += 30;
  }
  
  if (matches(q, ['gelb', 'gelber', 'gold', 'golden'])) {
    if (beschreibung.includes('gelb') || beschreibung.includes('gold') || beschreibung.includes('dotter')) score += 30;
  }
  
  if (matches(q, ['braun', 'brauner'])) {
    if (beschreibung.includes('braun') || beschreibung.includes('kastanie')) score += 30;
  }
  
  if (matches(q, ['weiß', 'weißer', 'weiss'])) {
    if (beschreibung.includes('weiß') || beschreibung.includes('weiss')) score += 30;
  }
  
  // === BELIEBTE FRAGEN ===
  if (matches(q, ['beliebt', 'bekannt', 'berühmt', 'populär', 'häufig'])) {
    if (beschreibung.includes('beliebt') || beschreibung.includes('bekannt') || beschreibung.includes('häufig')) score += 30;
  }
  
  if (matches(q, ['anfänger', 'einfach', 'leicht zu erkennen', 'für anfänger'])) {
    if (beschreibung.includes('leicht erkennbar') || beschreibung.includes('häufig')) score += 30;
  }
  
  if (matches(q, ['asien', 'asiatisch', 'japan', 'japanisch', 'china', 'chinesisch'])) {
    if (beschreibung.includes('asien') || item.name?.toLowerCase().includes('shiitake')) score += 50;
  }
  
  return score;
}

/**
 * Prüft ob Query eines der Keywords enthält
 */
function matches(query, keywords) {
  return keywords.some(kw => query.includes(kw));
}
