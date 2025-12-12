/**
 * 💰 CURRENCY MORPH - Währungsanzeige
 * 
 * Zeigt Geldbeträge formatiert mit Währungssymbol
 * DATENGETRIEBEN - Erkennt Währungs-Strukturen
 * 
 * Input: 50000000000 oder {betrag: 1.2, waehrung: "EUR", einheit: "Mrd"}
 *    oder {preis_eur: 140, preis_usd: 150}
 * Output: Formatierte Währungsanzeige
 */

import { debug } from '../../../observer/debug.js';

const CURRENCY_SYMBOLS = {
  'EUR': '€',
  'USD': '$',
  'GBP': '£',
  'CHF': 'Fr.',
  'JPY': '¥',
  'CNY': '¥',
  'RUB': '₽',
  'INR': '₹',
  'BTC': '₿'
};

export function currency(wert, config = {}) {
  debug.morphs('currency', { typ: typeof wert });
  
  const el = document.createElement('div');
  el.className = 'amorph-currency';
  
  // Währungsdaten normalisieren
  const amounts = normalisiereWaehrung(wert, config);
  
  if (amounts.length === 0) {
    el.innerHTML = '<span class="amorph-currency-leer">Keine Preisdaten</span>';
    return el;
  }
  
  // Mehrere Beträge anzeigen
  for (const amount of amounts) {
    const item = document.createElement('div');
    item.className = 'amorph-currency-item';
    
    // Label falls vorhanden
    if (amount.label) {
      const label = document.createElement('span');
      label.className = 'amorph-currency-label';
      label.textContent = amount.label;
      item.appendChild(label);
    }
    
    // Betrag
    const value = document.createElement('span');
    value.className = 'amorph-currency-value';
    
    const symbol = CURRENCY_SYMBOLS[amount.currency] || amount.currency;
    const formattedAmount = formatCurrencyAmount(amount.value, amount.unit);
    
    // Währungssymbol vor oder nach dem Betrag
    if (['EUR', 'GBP', 'CHF', 'RUB', 'INR', 'BTC'].includes(amount.currency)) {
      value.innerHTML = `<span class="amorph-currency-amount">${formattedAmount}</span><span class="amorph-currency-symbol">${symbol}</span>`;
    } else {
      value.innerHTML = `<span class="amorph-currency-symbol">${symbol}</span><span class="amorph-currency-amount">${formattedAmount}</span>`;
    }
    
    item.appendChild(value);
    
    // Einheit (z.B. "/kg", "pro Jahr")
    if (amount.per) {
      const per = document.createElement('span');
      per.className = 'amorph-currency-per';
      per.textContent = amount.per;
      item.appendChild(per);
    }
    
    // Range anzeigen
    if (amount.min !== undefined && amount.max !== undefined) {
      const range = document.createElement('span');
      range.className = 'amorph-currency-range';
      range.textContent = `${formatCurrencyAmount(amount.min)}–${formatCurrencyAmount(amount.max)} ${symbol}`;
      item.appendChild(range);
    }
    
    el.appendChild(item);
  }
  
  return el;
}

function normalisiereWaehrung(wert, config) {
  const amounts = [];
  const defaultCurrency = config.waehrung || config.currency || 'EUR';
  
  if (typeof wert === 'number') {
    amounts.push({
      value: wert,
      currency: defaultCurrency,
      unit: detectUnit(wert),
      label: config.label || ''
    });
  } else if (typeof wert === 'object' && !Array.isArray(wert)) {
    // Explizite Währungsdaten
    if ('betrag' in wert || 'value' in wert || 'amount' in wert) {
      amounts.push({
        value: wert.betrag || wert.value || wert.amount || 0,
        currency: wert.waehrung || wert.currency || defaultCurrency,
        unit: wert.einheit || wert.unit || '',
        label: wert.label || wert.name || '',
        per: wert.pro || wert.per || ''
      });
    }
    // Range
    else if ('min' in wert && 'max' in wert) {
      amounts.push({
        value: (wert.min + wert.max) / 2,
        min: wert.min,
        max: wert.max,
        currency: wert.waehrung || wert.currency || defaultCurrency,
        label: wert.label || ''
      });
    }
    // Key-Value-Paare durchsuchen
    else {
      for (const [key, value] of Object.entries(wert)) {
        if (typeof value === 'number') {
          const currencyMatch = key.match(/(eur|usd|gbp|chf|jpy)/i);
          const currency = currencyMatch ? currencyMatch[1].toUpperCase() : defaultCurrency;
          
          // Label aus Key extrahieren
          let label = key
            .replace(/_?(eur|usd|gbp|chf|jpy)$/i, '')
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .trim();
          
          // Per-Einheit erkennen
          let per = '';
          const perMatch = key.match(/_(kg|g|l|stueck|jahr|monat|tag)$/i);
          if (perMatch) {
            per = `/${perMatch[1]}`;
            label = label.replace(new RegExp(`\\s*${perMatch[1]}$`, 'i'), '');
          }
          
          amounts.push({
            value: value,
            currency: currency,
            unit: detectUnit(value),
            label: label || '',
            per: per
          });
        } else if (typeof value === 'object' && 'min' in value && 'max' in value) {
          // Range in Objekt
          const currencyMatch = key.match(/(eur|usd|gbp|chf|jpy)/i);
          const currency = currencyMatch ? currencyMatch[1].toUpperCase() : 
                          (value.waehrung || value.currency || defaultCurrency);
          
          amounts.push({
            value: (value.min + value.max) / 2,
            min: value.min,
            max: value.max,
            currency: currency,
            label: key.replace(/_?(eur|usd|gbp|chf|jpy)$/i, '').replace(/_/g, ' ')
          });
        }
      }
    }
  } else if (Array.isArray(wert)) {
    for (const item of wert) {
      const normalized = normalisiereWaehrung(item, config);
      amounts.push(...normalized);
    }
  }
  
  return amounts;
}

function detectUnit(value) {
  if (value >= 1000000000) return 'Mrd';
  if (value >= 1000000) return 'Mio';
  if (value >= 1000) return 'K';
  return '';
}

function formatCurrencyAmount(value, unit) {
  if (unit === 'Mrd' || value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} Mrd`;
  }
  if (unit === 'Mio' || value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} Mio`;
  }
  if (unit === 'K' || value >= 10000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  // Mit Tausendertrennern
  return value.toLocaleString('de-DE', { 
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2 
  });
}
