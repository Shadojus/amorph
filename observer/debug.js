/**
 * Debug Observer - Zentrales Logging für AMORPH
 * 
 * Alle wichtigen Events werden hier geloggt, nicht verstreut im Code.
 * Überwacht das gesamte System: Init, Config, Daten, Features, Morphs, Render, User-Interaktionen
 */

const STYLES = {
  // System
  amorph: 'color: #f472b6; font-weight: bold; font-size: 14px',
  config: 'color: #34d399; font-weight: bold',
  daten: 'color: #60a5fa; font-weight: bold',
  
  // Features
  features: 'color: #a78bfa; font-weight: bold',
  header: 'color: #c084fc; font-weight: bold',
  suche: 'color: #38bdf8; font-weight: bold',
  perspektiven: 'color: #06b6d4; font-weight: bold',
  grid: 'color: #84cc16; font-weight: bold',
  ansichten: 'color: #22c55e; font-weight: bold',
  
  // Morphs & Rendering
  morphs: 'color: #fb7185; font-weight: bold',
  render: 'color: #fbbf24; font-weight: bold',
  mount: 'color: #facc15; font-weight: bold',
  unmount: 'color: #a3a3a3; font-weight: bold',
  
  // User-Interaktion
  observer: 'color: #f87171; font-weight: bold',
  klick: 'color: #fb923c; font-weight: bold',
  hover: 'color: #fdba74; font-weight: bold',
  input: 'color: #fcd34d; font-weight: bold',
  scroll: 'color: #d4d4d4; font-weight: bold',
  
  // Session & Navigation
  session: 'color: #22d3ee; font-weight: bold',
  navigation: 'color: #2dd4bf; font-weight: bold',
  
  // Fehler & Warnungen
  fehler: 'color: #ef4444; font-weight: bold',
  warn: 'color: #fbbf24; font-weight: bold',
  
  // Standard
  muted: 'color: #888'
};

class DebugObserver {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.history = [];
    this.maxHistory = 500;
    this.filter = null; // Kann auf bestimmte Kategorien filtern
    this.startTime = Date.now();
  }
  
  log(kategorie, nachricht, daten = null) {
    if (!this.enabled) return;
    if (this.filter && !this.filter.includes(kategorie)) return;
    
    const zeit = new Date().toLocaleTimeString('de-DE');
    const elapsed = Date.now() - this.startTime;
    const style = STYLES[kategorie] || STYLES.muted;
    const prefix = `[${kategorie.toUpperCase()}]`;
    
    // In History speichern
    const entry = { zeit, elapsed, kategorie, nachricht, daten, timestamp: Date.now() };
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    // Console ausgeben
    if (daten !== null) {
      console.log(`%c${prefix}%c [${zeit}] ${nachricht}`, style, STYLES.muted, daten);
    } else {
      console.log(`%c${prefix}%c [${zeit}] ${nachricht}`, style, STYLES.muted);
    }
    
    return entry;
  }
  
  // === SYSTEM ===
  amorph(nachricht, daten = null) { return this.log('amorph', nachricht, daten); }
  config(nachricht, daten = null) { return this.log('config', nachricht, daten); }
  daten(nachricht, daten = null) { return this.log('daten', nachricht, daten); }
  
  // === FEATURES ===
  features(nachricht, daten = null) { return this.log('features', nachricht, daten); }
  header(nachricht, daten = null) { return this.log('header', nachricht, daten); }
  suche(nachricht, daten = null) { return this.log('suche', nachricht, daten); }
  perspektiven(nachricht, daten = null) { return this.log('perspektiven', nachricht, daten); }
  grid(nachricht, daten = null) { return this.log('grid', nachricht, daten); }
  ansichten(nachricht, daten = null) { return this.log('ansichten', nachricht, daten); }
  
  // === MORPHS & RENDERING ===
  morphs(nachricht, daten = null) { return this.log('morphs', nachricht, daten); }
  render(nachricht, daten = null) { return this.log('render', nachricht, daten); }
  mount(nachricht, daten = null) { return this.log('mount', nachricht, daten); }
  unmount(nachricht, daten = null) { return this.log('unmount', nachricht, daten); }
  
  // === USER-INTERAKTION ===
  observer(nachricht, daten = null) { return this.log('observer', nachricht, daten); }
  klick(nachricht, daten = null) { return this.log('klick', nachricht, daten); }
  hover(nachricht, daten = null) { return this.log('hover', nachricht, daten); }
  input(nachricht, daten = null) { return this.log('input', nachricht, daten); }
  scroll(nachricht, daten = null) { return this.log('scroll', nachricht, daten); }
  
  // === SESSION & NAVIGATION ===
  session(nachricht, daten = null) { return this.log('session', nachricht, daten); }
  navigation(nachricht, daten = null) { return this.log('navigation', nachricht, daten); }
  
  // === FEHLER & WARNUNGEN ===
  fehler(nachricht, daten = null) {
    const entry = this.log('fehler', nachricht, daten);
    if (daten instanceof Error) {
      console.error(daten);
    }
    return entry;
  }
  
  warn(nachricht, daten = null) {
    return this.log('warn', nachricht, daten);
  }
  
  // === HISTORY & FILTERING ===
  getHistory(kategorie = null) {
    if (kategorie) {
      return this.history.filter(e => e.kategorie === kategorie);
    }
    return [...this.history];
  }
  
  // Statistiken
  getStats() {
    const stats = {};
    for (const entry of this.history) {
      stats[entry.kategorie] = (stats[entry.kategorie] || 0) + 1;
    }
    return stats;
  }
  
  // Timeline der letzten N Einträge
  getTimeline(limit = 20) {
    return this.history.slice(-limit).map(e => ({
      zeit: e.zeit,
      ms: e.elapsed,
      kategorie: e.kategorie,
      nachricht: e.nachricht
    }));
  }
  
  // Filter setzen (nur bestimmte Kategorien loggen)
  setFilter(kategorien) {
    this.filter = Array.isArray(kategorien) ? kategorien : [kategorien];
    console.log(`%c[DEBUG]%c Filter aktiv:`, STYLES.observer, STYLES.muted, this.filter);
  }
  
  clearFilter() {
    this.filter = null;
    console.log(`%c[DEBUG]%c Filter entfernt`, STYLES.observer, STYLES.muted);
  }
  
  clear() {
    this.history = [];
    this.startTime = Date.now();
  }
  
  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  
  // Zusammenfassung ausgeben
  summary() {
    const stats = this.getStats();
    console.log('%c[DEBUG] Zusammenfassung', STYLES.amorph);
    console.table(stats);
    console.log('Letzte Events:', this.getTimeline(10));
  }
}

// Singleton Export
export const debug = new DebugObserver(true);

// Global verfügbar für Debugging in Console
if (typeof window !== 'undefined') {
  window.amorphDebug = debug;
  
  // Hilfsfunktionen für schnelles Debugging
  window.amorphStats = () => debug.summary();
  window.amorphFilter = (kat) => debug.setFilter(kat);
  window.amorphClear = () => debug.clearFilter();
}
