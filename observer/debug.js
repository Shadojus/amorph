/**
 * Debug Observer - Centralized Logging for AMORPH
 * 
 * All important events are logged here, not scattered throughout the code.
 * Monitors the entire system: Init, Config, Data, Features, Morphs, Render, User-Interactions
 * 
 * ARCHITECTURE: NO console.log in code! Only use debug.* methods!
 */

const STYLES = {
  // System
  amorph: 'color: #f472b6; font-weight: bold; font-size: 14px',
  config: 'color: #34d399; font-weight: bold',
  data: 'color: #60a5fa; font-weight: bold',
  schema: 'color: #67e8f9; font-weight: bold',
  
  // Features
  features: 'color: #a78bfa; font-weight: bold',
  header: 'color: #c084fc; font-weight: bold',
  search: 'color: #38bdf8; font-weight: bold',
  perspectives: 'color: #06b6d4; font-weight: bold',
  grid: 'color: #84cc16; font-weight: bold',
  views: 'color: #22c55e; font-weight: bold',
  compare: 'color: #14b8a6; font-weight: bold',
  detail: 'color: #10b981; font-weight: bold',
  
  // Morphs & Rendering
  morphs: 'color: #fb7185; font-weight: bold',
  detection: 'color: #e879f9; font-weight: bold',
  render: 'color: #fbbf24; font-weight: bold',
  mount: 'color: #facc15; font-weight: bold',
  unmount: 'color: #a3a3a3; font-weight: bold',
  
  // Utils
  semantic: 'color: #5aa0d8; font-weight: bold',
  
  // User-Interaction
  observer: 'color: #f87171; font-weight: bold',
  click: 'color: #fb923c; font-weight: bold',
  hover: 'color: #fdba74; font-weight: bold',
  input: 'color: #fcd34d; font-weight: bold',
  scroll: 'color: #d4d4d4; font-weight: bold',
  
  // Session & Navigation
  session: 'color: #22d3ee; font-weight: bold',
  navigation: 'color: #2dd4bf; font-weight: bold',
  
  // Errors & Warnings
  error: 'color: #ef4444; font-weight: bold',
  warn: 'color: #fbbf24; font-weight: bold',
  
  // Standard
  muted: 'color: #888'
};

class DebugObserver {
  constructor(enabled = true) {
    this.enabled = enabled;
    /** @type {Array<{time: string, elapsed: number, category: string, message: string, data: any, timestamp: number}>} */
    this.history = [];
    this.maxHistory = 500;
    /** @type {string[]|null} */
    this.filter = null;
    this.startTime = Date.now();
    // Mute excessive categories by default - keep log short!
    this.muted = new Set(['mount', 'unmount', 'scroll', 'intersection', 'hover', 'morphs', 'detection', 'render', 'semantic']);
    this.verbose = false; // If true: log all categories (ignore muted)
  }
  
  /**
   * @param {string} category
   * @param {string} message
   * @param {any} [data]
   */
  log(category, message, data = null) {
    if (!this.enabled) return;
    if (this.filter && !this.filter.includes(category)) return;
    if (!this.verbose && this.muted.has(category)) return;
    
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const elapsed = Date.now() - this.startTime;
    const style = STYLES[category] || STYLES.muted;
    const prefix = `[${category.toUpperCase()}]`;
    
    // Store in history
    const entry = { time, elapsed, category, message, data, timestamp: Date.now() };
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    // Output to console
    if (data !== null) {
      console.log(`%c${prefix}%c [${time}] ${message}`, style, STYLES.muted, data);
    } else {
      console.log(`%c${prefix}%c [${time}] ${message}`, style, STYLES.muted);
    }
    
    return entry;
  }
  
  // === SYSTEM ===
  /** @param {string} message @param {any} [data] */
  amorph(message, data = null) { return this.log('amorph', message, data); }
  /** @param {string} message @param {any} [data] */
  config(message, data = null) { return this.log('config', message, data); }
  /** @param {string} message @param {any} [data] */
  data(message, data = null) { return this.log('data', message, data); }
  /** @param {string} message @param {any} [data] */
  schema(message, data = null) { return this.log('schema', message, data); }
  
  // === FEATURES ===
  /** @param {string} message @param {any} [data] */
  features(message, data = null) { return this.log('features', message, data); }
  /** @param {string} message @param {any} [data] */
  header(message, data = null) { return this.log('header', message, data); }
  /** @param {string} message @param {any} [data] */
  search(message, data = null) { return this.log('search', message, data); }
  /** @param {string} message @param {any} [data] */
  perspectives(message, data = null) { return this.log('perspectives', message, data); }
  /** @param {string} message @param {any} [data] */
  grid(message, data = null) { return this.log('grid', message, data); }
  /** @param {string} message @param {any} [data] */
  views(message, data = null) { return this.log('views', message, data); }
  /** @param {string} message @param {any} [data] */
  compare(message, data = null) { return this.log('compare', message, data); }
  /** @param {string} message @param {any} [data] */
  detail(message, data = null) { return this.log('detail', message, data); }
  
  // === MORPHS & RENDERING ===
  /** @param {string} message @param {any} [data] */
  morphs(message, data = null) { return this.log('morphs', message, data); }
  /** @param {string} message @param {any} [data] */
  detection(message, data = null) { return this.log('detection', message, data); }
  /** @param {string} message @param {any} [data] */
  render(message, data = null) { return this.log('render', message, data); }
  /** @param {string} message @param {any} [data] */
  mount(message, data = null) { return this.log('mount', message, data); }
  /** @param {string} message @param {any} [data] */
  unmount(message, data = null) { return this.log('unmount', message, data); }
  
  // === UTILS ===
  /** @param {string} message @param {any} [data] */
  semantic(message, data = null) { return this.log('semantic', message, data); }
  
  // === USER-INTERACTION ===
  /** @param {string} message @param {any} [data] */
  observer(message, data = null) { return this.log('observer', message, data); }
  /** @param {string} message @param {any} [data] */
  click(message, data = null) { return this.log('click', message, data); }
  /** @param {string} message @param {any} [data] */
  hover(message, data = null) { return this.log('hover', message, data); }
  /** @param {string} message @param {any} [data] */
  input(message, data = null) { return this.log('input', message, data); }
  /** @param {string} message @param {any} [data] */
  scroll(message, data = null) { return this.log('scroll', message, data); }
  
  // === SESSION & NAVIGATION ===
  /** @param {string} message @param {any} [data] */
  session(message, data = null) { return this.log('session', message, data); }
  /** @param {string} message @param {any} [data] */
  navigation(message, data = null) { return this.log('navigation', message, data); }
  
  // === ERRORS & WARNINGS ===
  /** @param {string} message @param {any} [data] */
  error(message, data = null) {
    const entry = this.log('error', message, data);
    if (data instanceof Error) {
      console.error(data);
    }
    return entry;
  }
  
  /** @param {string} message @param {any} [data] */
  warn(message, data = null) {
    return this.log('warn', message, data);
  }
  
  // === LEGACY ALIASES (backward compatibility) ===
  daten(m, d) { return this.data(m, d); }
  suche(m, d) { return this.search(m, d); }
  perspektiven(m, d) { return this.perspectives(m, d); }
  ansichten(m, d) { return this.views(m, d); }
  vergleich(m, d) { return this.compare(m, d); }
  klick(m, d) { return this.click(m, d); }
  fehler(m, d) { return this.error(m, d); }
  
  // === HISTORY & FILTERING ===
  getHistory(category = null) {
    if (category) {
      return this.history.filter(e => e.category === category);
    }
    return [...this.history];
  }
  
  getStats() {
    const stats = {};
    for (const entry of this.history) {
      stats[entry.category] = (stats[entry.category] || 0) + 1;
    }
    return stats;
  }
  
  getTimeline(limit = 20) {
    return this.history.slice(-limit).map(e => ({
      time: e.time,
      ms: e.elapsed,
      category: e.category,
      message: e.message
    }));
  }
  
  setFilter(categories) {
    this.filter = Array.isArray(categories) ? categories : [categories];
    console.log(`%c[DEBUG]%c Filter active:`, STYLES.observer, STYLES.muted, this.filter);
  }
  
  clearFilter() {
    this.filter = null;
    console.log(`%c[DEBUG]%c Filter removed`, STYLES.observer, STYLES.muted);
  }
  
  mute(category) {
    this.muted.add(category);
    console.log(`%c[DEBUG]%c ${category} muted`, STYLES.observer, STYLES.muted);
  }
  
  unmute(category) {
    this.muted.delete(category);
    console.log(`%c[DEBUG]%c ${category} enabled`, STYLES.observer, STYLES.muted);
  }
  
  setVerbose(value = true) {
    this.verbose = value;
    console.log(`%c[DEBUG]%c Verbose: ${value ? 'ON' : 'OFF'}`, STYLES.observer, STYLES.muted);
  }
  
  clear() {
    this.history = [];
    this.startTime = Date.now();
  }
  
  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  
  summary() {
    const stats = this.getStats();
    console.log('%c[DEBUG] Summary', STYLES.amorph);
    console.table(stats);
    console.log('Recent events:', this.getTimeline(10));
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
  window.amorphVerbose = (v = true) => debug.setVerbose(v);
  window.amorphMute = (kat) => debug.mute(kat);
  window.amorphUnmute = (kat) => debug.unmute(kat);
}
