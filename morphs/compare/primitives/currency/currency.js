/**
 * COMPARE CURRENCY - Currency value comparison
 * Uses the exact same HTML structure as the original currency morph
 */

import { debug } from '../../../../observer/debug.js';

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

export function compareCurrency(items, config = {}) {
  debug.morphs('compareCurrency', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-currency';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  // Container for all currency displays
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Wrapper for item
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    // Label with item name - apply inline text color
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    if (item.textFarbe) label.style.color = item.textFarbe;
    wrapper.appendChild(label);
    
    // Use original currency structure
    const currencyEl = document.createElement('div');
    currencyEl.className = 'amorph-currency';
    
    // Extract currency data
    const amount = normalisiereCurrency(rawVal, config);
    
    if (!amount) {
      currencyEl.innerHTML = '<span class="amorph-currency-leer">Keine Preisdaten</span>';
    } else {
      const currencyItem = document.createElement('div');
      currencyItem.className = 'amorph-currency-item';
      
      const value = document.createElement('span');
      value.className = 'amorph-currency-value';
      
      const symbol = CURRENCY_SYMBOLS[amount.currency] || amount.currency;
      const formattedAmount = formatCurrencyAmount(amount.value);
      
      if (['EUR', 'GBP', 'CHF', 'RUB', 'INR', 'BTC'].includes(amount.currency)) {
        value.innerHTML = `<span class="amorph-currency-amount">${formattedAmount}</span><span class="amorph-currency-symbol">${symbol}</span>`;
      } else {
        value.innerHTML = `<span class="amorph-currency-symbol">${symbol}</span><span class="amorph-currency-amount">${formattedAmount}</span>`;
      }
      
      currencyItem.appendChild(value);
      currencyEl.appendChild(currencyItem);
    }
    
    wrapper.appendChild(currencyEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisiereCurrency(wert, config) {
  const defaultCurrency = config.waehrung || config.currency || 'EUR';
  
  if (typeof wert === 'number') {
    return { value: wert, currency: defaultCurrency };
  }
  
  if (typeof wert === 'object' && wert !== null) {
    return {
      value: wert.betrag || wert.amount || wert.value || wert.wert || wert.preis || 0,
      currency: wert.waehrung || wert.currency || defaultCurrency
    };
  }
  
  return null;
}

function formatCurrencyAmount(value) {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} Mrd.`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} Mio.`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)} Tsd.`;
  if (Number.isInteger(value)) return value.toLocaleString('de-DE');
  return value.toFixed(2).replace('.', ',');
}

export default compareCurrency;
