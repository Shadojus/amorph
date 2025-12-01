import { debug } from '../../observer/debug.js';

export default function init(ctx) {
  debug.grid('Init', ctx.config);
  
  const layouts = ctx.config.layouts || ['liste', 'grid', 'kompakt'];
  let current = ctx.config.default || 'grid';
  
  const icons = { liste: '☰', grid: '⊞', kompakt: '▤' };
  
  const toolbar = document.createElement('div');
  toolbar.className = 'amorph-layout-toolbar';
  toolbar.setAttribute('role', 'radiogroup');
  
  for (const layout of layouts) {
    const btn = document.createElement('button');
    btn.className = 'amorph-layout-btn';
    btn.dataset.layout = layout;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', layout === current ? 'true' : 'false');
    btn.textContent = icons[layout] || layout[0];
    btn.title = layout;
    
    btn.addEventListener('click', () => setLayout(layout));
    toolbar.appendChild(btn);
  }
  
  function setLayout(layout) {
    debug.grid('Layout gewechselt', layout);
    current = layout;
    
    for (const btn of toolbar.querySelectorAll('button')) {
      const isSelected = btn.dataset.layout === layout;
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      btn.classList.toggle('aktiv', isSelected);
    }
    
    const container = document.querySelector('[data-amorph-container]');
    if (container) container.dataset.layout = layout;
    
    ctx.emit('geaendert', { layout });
  }
  
  ctx.dom.appendChild(toolbar);
  ctx.mount('afterbegin');
  setLayout(current);
}
