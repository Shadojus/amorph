export default function init(ctx) {
  const form = document.createElement('div');
  form.className = 'amorph-suche';
  
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = ctx.config.placeholder || 'Suchen...';
  input.setAttribute('aria-label', 'Suche');
  
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '🔍';
  button.setAttribute('aria-label', 'Suchen');
  
  form.appendChild(input);
  form.appendChild(button);
  
  async function suchen() {
    const query = input.value.trim();
    if (!query && !ctx.config.erlaubeLeer) return;
    
    form.classList.add('ladend');
    
    try {
      await ctx.fetch({
        search: query,
        limit: ctx.config.limit || 50
      });
      
      ctx.emit('ergebnisse', { query });
      ctx.requestRender();
    } catch (e) {
      console.error('Suchfehler:', e);
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
  
  ctx.dom.appendChild(form);
  ctx.mount('afterbegin');
}
