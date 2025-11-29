import { debug } from './debug.js';

export class SessionObserver {
  constructor(target) {
    this.target = target;
    this.sessionId = null;
    this.aktionen = [];
    this.flushInterval = null;
    this.startTime = null;
    this.pageViews = 0;
    this.interactions = 0;
  }
  
  start(sessionId) {
    if (!sessionId) {
      debug.session('Keine Session ID, Observer nicht aktiv');
      return;
    }
    
    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.pageViews = 1;
    
    debug.session('Session gestartet', { 
      id: sessionId,
      url: window.location.href,
      referrer: document.referrer
    });
    
    // Periodisch flushen
    this.flushInterval = setInterval(() => this.flush(), 30000);
    
    // Vor Verlassen der Seite
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave();
      this.flush();
    });
    
    // Visibility Change (Tab-Wechsel)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        debug.session('Tab verlassen');
        this.track({ typ: 'tab_hidden' });
      } else {
        debug.session('Tab zurück');
        this.track({ typ: 'tab_visible' });
      }
    });
    
    // Session Start an Backend
    this.target?.send({
      typ: 'session_start',
      session: this.sessionId,
      zeitstempel: Date.now(),
      userAgent: navigator.userAgent,
      sprache: navigator.language,
      bildschirm: {
        breite: window.innerWidth,
        hoehe: window.innerHeight,
        pixelRatio: window.devicePixelRatio
      },
      url: window.location.href,
      referrer: document.referrer
    });
  }
  
  track(aktion) {
    if (!this.sessionId) return;
    
    this.interactions++;
    const enrichedAction = {
      ...aktion,
      session: this.sessionId,
      zeitstempel: Date.now(),
      interaktionNr: this.interactions
    };
    
    debug.session('Track', enrichedAction);
    this.aktionen.push(enrichedAction);
    
    if (this.aktionen.length >= 50) {
      this.flush();
    }
  }
  
  trackPageLeave() {
    const dauer = Date.now() - this.startTime;
    debug.session('Seite verlassen', { 
      dauer: `${Math.round(dauer / 1000)}s`,
      interaktionen: this.interactions
    });
    
    this.track({
      typ: 'page_leave',
      dauer,
      interaktionen: this.interactions,
      scrollTiefe: this.getScrollDepth()
    });
  }
  
  getScrollDepth() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
  }
  
  flush() {
    if (this.aktionen.length === 0) return;
    
    debug.session('Flush', { anzahl: this.aktionen.length });
    this.target?.send({
      typ: 'session_aktionen',
      session: this.sessionId,
      aktionen: this.aktionen,
      zeitstempel: Date.now()
    });
    
    this.aktionen = [];
  }
  
  stop() {
    if (!this.sessionId) return;
    
    const dauer = Date.now() - this.startTime;
    debug.session('Session beendet', { 
      id: this.sessionId,
      dauer: `${Math.round(dauer / 1000)}s`,
      interaktionen: this.interactions
    });
    
    this.flush();
    this.target?.send({
      typ: 'session_ende',
      session: this.sessionId,
      zeitstempel: Date.now(),
      dauer,
      interaktionen: this.interactions
    });
    
    clearInterval(this.flushInterval);
    this.sessionId = null;
  }
  
  getStats() {
    return {
      sessionId: this.sessionId,
      dauer: this.startTime ? Date.now() - this.startTime : 0,
      interaktionen: this.interactions,
      pageViews: this.pageViews,
      pendingActions: this.aktionen.length
    };
  }
}
