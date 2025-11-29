import { debug } from '../../observer/debug.js';
import { suche as sucheMorph } from '../../morphs/suche.js';

export default function init(ctx) {
  debug.suche('Feature Init', ctx.config);
  
  // Suche-Morph in amorph-container wrappen
  const container = document.createElement('amorph-container');
  container.setAttribute('data-morph', 'suche');
  container.setAttribute('data-field', 'suche');
  
  const form = sucheMorph(ctx.config);
  container.appendChild(form);
  
  const input = form.querySelector('input');
  const button = form.querySelector('button');
  
  async function suchen() {
    const query = input.value.trim();
    if (!query && !ctx.config.erlaubeLeer) return;
    
    form.classList.add('ladend');
    
    try {
      debug.suche('Suche', { query, limit: ctx.config.limit || 50 });
      
      await ctx.fetch({
        search: query,
        limit: ctx.config.limit || 50
      });
      
      debug.suche('Ergebnisse geladen');
      ctx.emit('ergebnisse', { query });
      ctx.requestRender();
    } catch (e) {
      debug.fehler('Suchfehler', e);
    } finally {
      form.classList.remove('ladend');
    }
  }
  
  button.addEventListener('click', suchen);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') suchen();
    if (e.key === 'Escape') {
      input.value = '';
      ctx.requestRender();
    }
  });
  
  if (ctx.config.live) {
    let timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(suchen, ctx.config.debounce || 300);
    });
  }
  
  ctx.dom.appendChild(container);
  ctx.mount('afterbegin');
}
