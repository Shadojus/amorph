export function number(wert, config = {}) {
  const el = document.createElement('span');
  el.className = 'amorph-number';
  
  let formatted = Number(wert);
  
  if (config.dezimalen !== undefined) {
    formatted = formatted.toFixed(config.dezimalen);
  }
  
  if (config.tausenderTrennzeichen) {
    formatted = formatted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  if (config.einheit) {
    formatted = `${formatted} ${config.einheit}`;
  }
  
  el.textContent = formatted;
  return el;
}
