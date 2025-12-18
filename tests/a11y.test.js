/**
 * Accessibility Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setAria,
  setRole,
  labelRegion,
  announce,
  announceResults,
  saveFocus,
  restoreFocus,
  focusElement,
  isFocusable,
  getFocusableElements,
  createFocusTrap,
  setupArrowNavigation,
  makeClickable,
  createSkipLinks
} from '../util/a11y.js';

describe('ARIA Helpers', () => {
  it('setAria sets aria attributes', () => {
    const el = document.createElement('div');
    setAria(el, { label: 'Test Label', expanded: true, hidden: false });
    
    expect(el.getAttribute('aria-label')).toBe('Test Label');
    expect(el.getAttribute('aria-expanded')).toBe('true');
    expect(el.hasAttribute('aria-hidden')).toBe(false);
  });
  
  it('setAria removes null/undefined attributes', () => {
    const el = document.createElement('div');
    el.setAttribute('aria-label', 'old');
    
    setAria(el, { label: null });
    
    expect(el.hasAttribute('aria-label')).toBe(false);
  });
  
  it('setRole sets role attribute', () => {
    const el = document.createElement('div');
    setRole(el, 'button');
    
    expect(el.getAttribute('role')).toBe('button');
  });
  
  it('setRole removes role when null', () => {
    const el = document.createElement('div');
    el.setAttribute('role', 'button');
    
    setRole(el, null);
    
    expect(el.hasAttribute('role')).toBe(false);
  });
  
  it('labelRegion sets role and label', () => {
    const el = document.createElement('div');
    labelRegion(el, 'Search Results', 'region');
    
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('Search Results');
  });
});

describe('Live Regions', () => {
  beforeEach(() => {
    // Clean up any existing live regions
    const existing = document.getElementById('amorph-live-region');
    if (existing) existing.remove();
  });
  
  it('announce creates live region', async () => {
    announce('Test message');
    
    await new Promise(r => setTimeout(r, 100));
    
    const region = document.getElementById('amorph-live-region');
    expect(region).not.toBeNull();
    expect(region.textContent).toBe('Test message');
  });
  
  it('announce sets priority', async () => {
    announce('Urgent!', 'assertive');
    
    await new Promise(r => setTimeout(r, 100));
    
    const region = document.getElementById('amorph-live-region');
    expect(region.getAttribute('aria-live')).toBe('assertive');
  });
  
  it('announceResults formats correctly', async () => {
    announceResults('Suche', 5);
    
    await new Promise(r => setTimeout(r, 100));
    
    const region = document.getElementById('amorph-live-region');
    expect(region.textContent).toContain('5 Ergebnisse');
  });
  
  it('announceResults handles zero', async () => {
    announceResults('Suche', 0);
    
    await new Promise(r => setTimeout(r, 100));
    
    const region = document.getElementById('amorph-live-region');
    expect(region.textContent).toContain('Keine Ergebnisse');
  });
  
  it('announceResults handles one', async () => {
    announceResults('Suche', 1);
    
    await new Promise(r => setTimeout(r, 100));
    
    const region = document.getElementById('amorph-live-region');
    expect(region.textContent).toContain('1 Ergebnis gefunden');
  });
});

describe('Focus Management', () => {
  it('isFocusable returns true for buttons', () => {
    const button = document.createElement('button');
    expect(isFocusable(button)).toBe(true);
  });
  
  it('isFocusable returns false for disabled buttons', () => {
    const button = document.createElement('button');
    button.disabled = true;
    expect(isFocusable(button)).toBe(false);
  });
  
  it('isFocusable returns true for inputs', () => {
    const input = document.createElement('input');
    expect(isFocusable(input)).toBe(true);
  });
  
  it('isFocusable returns true for links with href', () => {
    const link = document.createElement('a');
    link.href = '#test';
    expect(isFocusable(link)).toBe(true);
  });
  
  it('isFocusable returns false for links without href', () => {
    const link = document.createElement('a');
    expect(isFocusable(link)).toBe(false);
  });
  
  it('isFocusable returns true for tabindex >= -1', () => {
    const div = document.createElement('div');
    div.setAttribute('tabindex', '0');
    expect(isFocusable(div)).toBe(true);
    
    div.setAttribute('tabindex', '-1');
    expect(isFocusable(div)).toBe(true);
  });
  
  it('isFocusable returns false for hidden elements', () => {
    const button = document.createElement('button');
    button.hidden = true;
    expect(isFocusable(button)).toBe(false);
  });
  
  it('getFocusableElements finds all focusable', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Button</button>
      <input type="text">
      <a href="#">Link</a>
      <div tabindex="0">Custom</div>
      <span>Not focusable</span>
    `;
    document.body.appendChild(container);
    
    const focusables = getFocusableElements(container);
    expect(focusables.length).toBe(4);
    
    container.remove();
  });
  
  it('focusElement focuses element', () => {
    const button = document.createElement('button');
    button.textContent = 'Test';
    document.body.appendChild(button);
    
    focusElement(button);
    
    expect(document.activeElement).toBe(button);
    
    button.remove();
  });
  
  it('focusElement adds tabindex to non-focusable', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    
    focusElement(div);
    
    expect(div.getAttribute('tabindex')).toBe('-1');
    
    div.remove();
  });
  
  it('saveFocus and restoreFocus work together', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    document.body.appendChild(button1);
    document.body.appendChild(button2);
    
    button1.focus();
    saveFocus();
    button2.focus();
    
    const restored = restoreFocus();
    
    expect(restored).toBe(true);
    expect(document.activeElement).toBe(button1);
    
    button1.remove();
    button2.remove();
  });
});

describe('Focus Trap', () => {
  it('traps focus within container', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button id="first">First</button>
      <button id="second">Second</button>
      <button id="third">Third</button>
    `;
    document.body.appendChild(container);
    
    const trap = createFocusTrap(container);
    trap.activate();
    
    // Focus should be on first element
    expect(document.activeElement.id).toBe('first');
    
    trap.deactivate();
    container.remove();
  });
  
  it('cycles focus on Tab', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button id="first">First</button>
      <button id="last">Last</button>
    `;
    document.body.appendChild(container);
    
    const trap = createFocusTrap(container);
    trap.activate();
    
    const lastButton = container.querySelector('#last');
    lastButton.focus();
    
    // Simulate Tab key
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    container.dispatchEvent(event);
    
    trap.deactivate();
    container.remove();
  });
});

describe('Arrow Navigation', () => {
  it('sets up keyboard navigation', () => {
    const container = document.createElement('ul');
    container.innerHTML = `
      <li tabindex="0" data-item-id="1">Item 1</li>
      <li tabindex="0" data-item-id="2">Item 2</li>
      <li tabindex="0" data-item-id="3">Item 3</li>
    `;
    document.body.appendChild(container);
    
    const cleanup = setupArrowNavigation(container);
    
    const items = container.querySelectorAll('li');
    items[0].focus();
    
    // Simulate ArrowDown
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    container.dispatchEvent(event);
    
    // Focus should move to second item
    expect(document.activeElement).toBe(items[1]);
    
    cleanup();
    container.remove();
  });
  
  it('wraps at end by default', () => {
    const container = document.createElement('ul');
    container.innerHTML = `
      <li tabindex="0" data-item-id="1">Item 1</li>
      <li tabindex="0" data-item-id="2">Item 2</li>
    `;
    document.body.appendChild(container);
    
    const cleanup = setupArrowNavigation(container);
    
    const items = container.querySelectorAll('li');
    items[1].focus();
    
    // Simulate ArrowDown at last item
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    container.dispatchEvent(event);
    
    // Should wrap to first
    expect(document.activeElement).toBe(items[0]);
    
    cleanup();
    container.remove();
  });
});

describe('makeClickable', () => {
  it('makes element keyboard accessible', () => {
    const div = document.createElement('div');
    let clicked = false;
    
    makeClickable(div, () => { clicked = true; });
    
    expect(div.getAttribute('tabindex')).toBe('0');
    expect(div.getAttribute('role')).toBe('button');
    
    // Simulate Enter key
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    div.dispatchEvent(event);
    
    expect(clicked).toBe(true);
  });
  
  it('responds to Space key', () => {
    const div = document.createElement('div');
    let clicked = false;
    
    makeClickable(div, () => { clicked = true; });
    
    const event = new KeyboardEvent('keydown', { key: ' ' });
    div.dispatchEvent(event);
    
    expect(clicked).toBe(true);
  });
  
  it('responds to click', () => {
    const div = document.createElement('div');
    let clicked = false;
    
    makeClickable(div, () => { clicked = true; });
    
    div.click();
    
    expect(clicked).toBe(true);
  });
});

describe('Skip Links', () => {
  it('creates skip links navigation', () => {
    const skipLinks = createSkipLinks([
      { label: 'Skip to content', target: 'main' },
      { label: 'Skip to search', target: 'search' }
    ]);
    
    expect(skipLinks.tagName).toBe('NAV');
    expect(skipLinks.getAttribute('aria-label')).toBe('Sprungmarken');
    expect(skipLinks.children.length).toBe(2);
  });
  
  it('links have correct href', () => {
    const skipLinks = createSkipLinks([
      { label: 'Main', target: 'main' }
    ]);
    
    const link = skipLinks.querySelector('a');
    expect(link.href).toContain('#main');
    expect(link.textContent).toBe('Main');
  });
});
