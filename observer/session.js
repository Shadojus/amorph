import { debug } from './debug.js';

export class SessionObserver {
  constructor(target) {
    this.target = target;
    this.sessionId = null;
    this.aktionen = [];
    this.flushInterval = null;
  }
  
  start(sessionId) {
    if (!sessionId) {
      debug.observer('SessionObserver: Keine Session, nicht aktiv');
      return;
    }
    
    this.sessionId = sessionId;
    debug.observer('SessionObserver gestartet', { session: sessionId });
    
    this.flushInterval = setInterval(() => this.flush(), 30000);
    window.addEventListener('beforeunload', () => this.flush());
    
    this.target?.send({
      typ: 'session_start',
      session: this.sessionId,
      zeitstempel: Date.now(),
      userAgent: navigator.userAgent,
      sprache: navigator.language
    });
  }
  
  track(aktion) {
    if (!this.sessionId) return;
    
    debug.observer('Session Track', aktion);
    this.aktionen.push({
      ...aktion,
      session: this.sessionId,
      zeitstempel: Date.now()
    });
    
    if (this.aktionen.length >= 50) {
      this.flush();
    }
  }
  
  flush() {
    if (this.aktionen.length === 0) return;
    
    debug.observer('Session Flush', { anzahl: this.aktionen.length });
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
    
    debug.observer('SessionObserver gestoppt', { session: this.sessionId });
    this.flush();
    this.target?.send({
      typ: 'session_ende',
      session: this.sessionId,
      zeitstempel: Date.now()
    });
    
    clearInterval(this.flushInterval);
    this.sessionId = null;
  }
}
