export function object(wert, config = {}, morphen) {
  const el = document.createElement('dl');
  el.className = 'amorph-object';
  
  if (typeof wert !== 'object' || wert === null) {
    console.warn('object-morph erwartet Objekt, bekam:', typeof wert);
    return el;
  }
  
  const felder = config.felder || Object.keys(wert);
  
  for (const key of felder) {
    if (!(key in wert)) continue;
    
    const dt = document.createElement('dt');
    dt.textContent = config.labels?.[key] || key;
    el.appendChild(dt);
    
    const dd = document.createElement('dd');
    if (morphen) {
      dd.appendChild(morphen(wert[key], key));
    } else {
      dd.textContent = String(wert[key]);
    }
    el.appendChild(dd);
  }
  
  return el;
}
