export function createTarget(config) {
  const { typ, url, ...options } = config;
  
  switch (typ) {
    case 'console':
      return new ConsoleTarget(options);
    case 'http':
      return new HttpTarget(url, options);
    case 'websocket':
      return new WebSocketTarget(url, options);
    case 'redis':
      return new RedisTarget(url, options);
    default:
      console.warn(`Unbekannter Target-Typ: ${typ}, nutze Console`);
      return new ConsoleTarget();
  }
}

class ConsoleTarget {
  constructor(options = {}) {
    this.prefix = options.prefix || '[AMORPH]';
    this.level = options.level || 'log';
  }
  
  send(nachricht) {
    console[this.level](this.prefix, nachricht);
  }
}

class HttpTarget {
  constructor(url, options = {}) {
    this.url = url;
    this.headers = options.headers || {};
    this.batch = options.batch || false;
    this.queue = [];
    this.batchTimeout = null;
  }
  
  send(nachricht) {
    if (this.batch) {
      this.queue.push(nachricht);
      this.scheduleBatch();
    } else {
      this.post([nachricht]);
    }
  }
  
  scheduleBatch() {
    if (this.batchTimeout) return;
    this.batchTimeout = setTimeout(() => {
      this.post(this.queue);
      this.queue = [];
      this.batchTimeout = null;
    }, 1000);
  }
  
  async post(nachrichten) {
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.headers },
        body: JSON.stringify(nachrichten)
      });
    } catch (e) {
      console.error('Observer HTTP Fehler:', e);
    }
  }
}

class WebSocketTarget {
  constructor(url, options = {}) {
    this.url = url;
    this.reconnect = options.reconnect !== false;
    this.queue = [];
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      for (const msg of this.queue) {
        this.ws.send(JSON.stringify(msg));
      }
      this.queue = [];
    };
    
    this.ws.onclose = () => {
      if (this.reconnect) {
        setTimeout(() => this.connect(), 5000);
      }
    };
  }
  
  send(nachricht) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(nachricht));
    } else {
      this.queue.push(nachricht);
    }
  }
}

class RedisTarget {
  constructor(url, options = {}) {
    this.http = new HttpTarget(url, { ...options, batch: true });
    this.stream = options.stream || 'amorph:events';
  }
  
  send(nachricht) {
    this.http.send({ stream: this.stream, ...nachricht });
  }
}
