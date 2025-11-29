/**
 * Debug Observer - Zentrales Logging für AMORPH
 * 
 * Alle wichtigen Events werden hier geloggt, nicht verstreut im Code.
 */

const STYLES = {
  amorph: 'color: #f472b6; font-weight: bold; font-size: 14px',
  config: 'color: #34d399; font-weight: bold',
  daten: 'color: #60a5fa; font-weight: bold',
  features: 'color: #a78bfa; font-weight: bold',
  render: 'color: #fbbf24; font-weight: bold',
  observer: 'color: #f87171; font-weight: bold',
  klick: 'color: #fb923c; font-weight: bold',
  suche: 'color: #38bdf8; font-weight: bold',
  perspektiven: 'color: #06b6d4; font-weight: bold',
  grid: 'color: #84cc16; font-weight: bold',
  fehler: 'color: #ef4444; font-weight: bold',
  warn: 'color: #fbbf24; font-weight: bold',
  muted: 'color: #888'
};

class DebugObserver {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.history = [];
    this.maxHistory = 100;
  }
  
  log(kategorie, nachricht, daten = null) {
    if (!this.enabled) return;
    
    const zeit = new Date().toLocaleTimeString('de-DE');
    const style = STYLES[kategorie] || STYLES.muted;
    const prefix = `[${kategorie.toUpperCase()}]`;
    
    // In History speichern
    this.history.push({ zeit, kategorie, nachricht, daten, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    // Console ausgeben
    if (daten !== null) {
      console.log(`%c${prefix}%c [${zeit}] ${nachricht}`, style, STYLES.muted, daten);
    } else {
      console.log(`%c${prefix}%c [${zeit}] ${nachricht}`, style, STYLES.muted);
    }
  }
  
  // Spezifische Log-Methoden
  amorph(nachricht, daten = null) { this.log('amorph', nachricht, daten); }
  config(nachricht, daten = null) { this.log('config', nachricht, daten); }
  daten(nachricht, daten = null) { this.log('daten', nachricht, daten); }
  features(nachricht, daten = null) { this.log('features', nachricht, daten); }
  render(nachricht, daten = null) { this.log('render', nachricht, daten); }
  observer(nachricht, daten = null) { this.log('observer', nachricht, daten); }
  klick(nachricht, daten = null) { this.log('klick', nachricht, daten); }
  suche(nachricht, daten = null) { this.log('suche', nachricht, daten); }
  perspektiven(nachricht, daten = null) { this.log('perspektiven', nachricht, daten); }
  grid(nachricht, daten = null) { this.log('grid', nachricht, daten); }
  
  fehler(nachricht, daten = null) {
    this.log('fehler', nachricht, daten);
    if (daten instanceof Error) {
      console.error(daten);
    }
  }
  
  warn(nachricht, daten = null) {
    this.log('warn', nachricht, daten);
  }
  
  // History abrufen
  getHistory(kategorie = null) {
    if (kategorie) {
      return this.history.filter(e => e.kategorie === kategorie);
    }
    return [...this.history];
  }
  
  // Alle Events einer Kategorie
  clear() {
    this.history = [];
  }
  
  // Ein/Ausschalten
  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
}

// Singleton Export
export const debug = new DebugObserver(true);

// Auch global verfügbar machen für Debugging
if (typeof window !== 'undefined') {
  window.amorphDebug = debug;
}
