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
      const lower = search.toLowerCase().trim();
      
      // Nur in relevanten Feldern suchen: name, wissenschaftlich, slug, essbarkeit
      items = items.filter(item => {
        const name = (item.name || '').toLowerCase();
        const wiss = (item.wissenschaftlich || '').toLowerCase();
        const slug = (item.slug || '').toLowerCase();
        const essbar = (item.essbarkeit || '').toLowerCase();
        const geschmack = (item.geschmack || '').toLowerCase();
        
        return name.includes(lower) || 
               wiss.includes(lower) || 
               slug.includes(lower) ||
               essbar.includes(lower) ||
               geschmack.includes(lower);
      });
      
      // Sortieren: Exakte Treffer im Namen zuerst
      items.sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        const aExact = aName === lower || aName.startsWith(lower);
        const bExact = bName === lower || bName.startsWith(lower);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });
    }
    
    return items.slice(0, limit);
  }
}
