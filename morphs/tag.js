export function tag(wert, config = {}) {
  const el = document.createElement('span');
  el.className = 'amorph-tag';
  el.textContent = String(wert);
  
  if (config.farben && config.farben[wert]) {
    el.style.setProperty('--tag-farbe', config.farben[wert]);
  }
  
  return el;
}
