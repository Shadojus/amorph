export class SessionObserver {
  constructor(target) {
    this.target = target;
    this.sessionId = null;
    this.aktionen = [];
    this.flushInterval = null;
  }
  
  start(sessionId) {
    if (!sessionId) {
      console.log('SessionObserver: Keine Session, nicht aktiv');
      return;
    }
    
    this.sessionId = sessionId;
    this.flushInterval = setInterval(() => this.flush(), 30000);
    window.addEventListener('beforeunload', () => this.flush());
    
    this.send({
      typ: 'session_start',
      session: this.sessionId,
      zeitstempel: Date.now(),
      userAgent: navigator.userAgent,
      sprache: navigator.language
    });
  }
  
  track(aktion) {
    if (!this.sessionId) return;
    
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
    
    this.send({
      typ: 'session_aktionen',
      session: this.sessionId,
      aktionen: this.aktionen,
      zeitstempel: Date.now()
    });
    
    this.aktionen = [];
  }
  
  stop() {
    if (!this.sessionId) return;
    
    this.flush();
    this.send({
      typ: 'session_ende',
      session: this.sessionId,
      zeitstempel: Date.now()
    });
    
    clearInterval(this.flushInterval);
    this.sessionId = null;
  }
  
  send(nachricht) {
    this.target.send(nachricht);
  }
}
