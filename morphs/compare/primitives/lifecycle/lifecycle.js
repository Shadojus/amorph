/**
 * COMPARE LIFECYCLE - Lifecycle stage comparison
 * Uses the exact same HTML structure as the original lifecycle morph
 */

import { debug } from '../../../../observer/debug.js';

export function compareLifecycle(items, config = {}) {
  debug.morphs('compareLifecycle', { itemCount: items?.length });
  
  const el = document.createElement('div');
  el.className = 'amorph-compare amorph-compare-lifecycle';
  
  if (!items?.length) {
    el.innerHTML = '<div class="compare-empty">No data</div>';
    return el;
  }
  
  const container = document.createElement('div');
  container.className = 'compare-items-container';
  
  items.forEach((item, itemIndex) => {
    const rawVal = item.value ?? item.wert;
    
    // Neon pilz colors
    const color = item.lineFarbe || item.farbe || `hsl(${itemIndex * 90}, 70%, 55%)`;
    const glowColor = item.glowFarbe || color;
    const textColor = item.textFarbe || color;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'compare-item-wrapper';
    
    const label = document.createElement('div');
    label.className = 'compare-item-label';
    label.textContent = item.name || item.id || `Item ${itemIndex + 1}`;
    label.style.color = textColor;
    label.style.textShadow = `0 0 6px ${glowColor}`;
    wrapper.appendChild(label);
    
    // Original lifecycle structure
    const lifecycleEl = document.createElement('div');
    lifecycleEl.className = 'amorph-lifecycle';
    lifecycleEl.setAttribute('data-mode', 'linear');
    
    const phases = normalisierePhasen(rawVal);
    
    if (phases.length === 0) {
      lifecycleEl.innerHTML = '<span class="amorph-lifecycle-leer">Keine Phasen</span>';
    } else {
      const linear = document.createElement('div');
      linear.className = 'amorph-lifecycle-linear';
      linear.style.display = 'flex';
      linear.style.gap = '4px';
      linear.style.alignItems = 'center';
      
      phases.slice(0, 5).forEach((phase, i) => {
        const phaseEl = document.createElement('div');
        phaseEl.className = 'amorph-lifecycle-phase';
        if (phase.active) phaseEl.classList.add('is-active');
        
        phaseEl.style.display = 'flex';
        phaseEl.style.alignItems = 'center';
        phaseEl.style.gap = '2px';
        phaseEl.style.padding = '2px 6px';
        phaseEl.style.borderRadius = '8px';
        phaseEl.style.fontSize = '9px';
        
        // Neon styling
        if (phase.active) {
          phaseEl.style.background = `${color}66`; // 40% opacity
          phaseEl.style.boxShadow = `0 0 8px ${glowColor}`;
          phaseEl.style.border = `1px solid ${color}`;
        } else {
          phaseEl.style.background = `${color}22`; // 13% opacity
          phaseEl.style.border = `1px solid ${color}44`;
        }
        
        const icon = document.createElement('span');
        icon.className = 'amorph-lifecycle-icon';
        icon.textContent = phase.icon || getPhaseIcon(phase.name, i);
        phaseEl.appendChild(icon);
        
        const name = document.createElement('span');
        name.className = 'amorph-lifecycle-name';
        name.textContent = phase.name;
        name.style.color = phase.active ? textColor : `${textColor}aa`;
        phaseEl.appendChild(name);
        
        linear.appendChild(phaseEl);
        
        // Arrow between phases with neon color
        if (i < phases.length - 1 && i < 4) {
          const arrow = document.createElement('span');
          arrow.className = 'amorph-lifecycle-arrow';
          arrow.textContent = '→';
          arrow.style.opacity = '0.6';
          arrow.style.color = color;
          linear.appendChild(arrow);
        }
      });
      
      lifecycleEl.appendChild(linear);
    }
    
    wrapper.appendChild(lifecycleEl);
    container.appendChild(wrapper);
  });
  
  el.appendChild(container);
  return el;
}

function normalisierePhasen(wert) {
  if (!Array.isArray(wert)) return [];
  
  return wert.map((item, i) => {
    if (typeof item === 'string') {
      return { name: item, active: false, icon: '' };
    }
    
    if (typeof item === 'object') {
      const phaseName = item.phase || item.name || item.title || item.label || item.stadium || `Phase ${i + 1}`;
      const isActive = item.active || item.aktuell || item.current ||
                       item.status === 'active' || item.status === 'in-progress';
      
      return {
        name: phaseName,
        active: isActive,
        icon: item.icon || ''
      };
    }
    
    return { name: `Phase ${i + 1}`, active: false, icon: '' };
  });
}

function getPhaseIcon(name, index) {
  const icons = ['🥚', '🐛', '🦋', '✨', '🔄', '🌱'];
  const nameLower = (name || '').toLowerCase();
  
  if (nameLower.includes('ei') || nameLower.includes('egg')) return '🥚';
  if (nameLower.includes('larve') || nameLower.includes('larva')) return '🐛';
  if (nameLower.includes('puppe') || nameLower.includes('pupa')) return '🎁';
  if (nameLower.includes('adult') || nameLower.includes('imago')) return '🦋';
  
  return icons[index % icons.length];
}

export default compareLifecycle;
