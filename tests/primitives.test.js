/**
 * Primitive Morphs Tests
 * Tests für die wichtigsten primitiven Morphs
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Import morphs directly
import { text } from '../morphs/primitives/text/text.js';
import { number } from '../morphs/primitives/number/number.js';
import { boolean } from '../morphs/primitives/boolean/boolean.js';
import { list } from '../morphs/primitives/list/list.js';
import { badge } from '../morphs/primitives/badge/badge.js';
import { rating } from '../morphs/primitives/rating/rating.js';

describe('text morph', () => {
  it('renders simple strings', () => {
    const el = text('Hello World');
    expect(el.textContent).toBe('Hello World');
    expect(el.className).toBe('amorph-text');
  });
  
  it('handles null and undefined', () => {
    expect(text(null).textContent).toBe('');
    expect(text(undefined).textContent).toBe('');
  });
  
  it('converts numbers to strings', () => {
    expect(text(42).textContent).toBe('42');
    expect(text(3.14).textContent).toBe('3.14');
  });
  
  it('converts booleans to strings', () => {
    expect(text(true).textContent).toBe('true');
    expect(text(false).textContent).toBe('false');
  });
  
  it('renders arrays as comma-separated', () => {
    const el = text(['a', 'b', 'c']);
    expect(el.textContent).toBe('a, b, c');
  });
  
  it('renders object.name if available', () => {
    const el = text({ name: 'Test Name', other: 'value' });
    expect(el.textContent).toBe('Test Name');
  });
  
  it('renders object.label if name not available', () => {
    const el = text({ label: 'Test Label' });
    expect(el.textContent).toBe('Test Label');
  });
  
  it('renders object.title/titel', () => {
    expect(text({ title: 'Title' }).textContent).toBe('Title');
    expect(text({ titel: 'Titel' }).textContent).toBe('Titel');
  });
  
  it('renders object.value', () => {
    const el = text({ value: 123 });
    expect(el.textContent).toBe('123');
  });
  
  it('renders key-value pairs for unknown objects', () => {
    const el = text({ foo: 'bar', baz: 42 });
    expect(el.textContent).toContain('foo: bar');
    expect(el.textContent).toContain('baz: 42');
  });
  
  it('truncates with maxLaenge', () => {
    const el = text('This is a very long text', { maxLaenge: 10 });
    expect(el.textContent).toBe('This is a …');
    expect(el.title).toBe('This is a very long text');
  });
});

describe('number morph', () => {
  it('renders integers', () => {
    expect(number(42).textContent).toBe('42');
    expect(number(0).textContent).toBe('0');
    expect(number(-5).textContent).toBe('-5');
  });
  
  it('formats large integers with thousands separator', () => {
    const el = number(1234567);
    expect(el.textContent).toMatch(/1[\.,]234[\.,]567/);
  });
  
  it('renders decimals with max 2 places', () => {
    expect(number(3.14159).textContent).toBe('3.14');
    expect(number(2.5).textContent).toBe('2.5');
  });
  
  it('uses scientific notation for very small numbers', () => {
    const el = number(0.00001);
    expect(el.textContent).toMatch(/1.*e/i);
  });
  
  it('respects dezimalen config', () => {
    expect(number(3.14159, { dezimalen: 4 }).textContent).toBe('3.1416');
    expect(number(42, { dezimalen: 2 }).textContent).toBe('42.00');
  });
  
  it('adds unit when specified', () => {
    expect(number(100, { einheit: 'kg' }).textContent).toBe('100 kg');
    expect(number(3.5, { einheit: 'm' }).textContent).toBe('3.5 m');
  });
  
  it('has correct className', () => {
    expect(number(42).className).toBe('amorph-number');
  });
});

describe('boolean morph', () => {
  it('renders true as "Ja"', () => {
    const el = boolean(true);
    expect(el.textContent).toBe('Ja');
    expect(el.getAttribute('data-value')).toBe('true');
  });
  
  it('renders false as "Nein"', () => {
    const el = boolean(false);
    expect(el.textContent).toBe('Nein');
    expect(el.getAttribute('data-value')).toBe('false');
  });
  
  it('renders as icons when alsIcon=true', () => {
    expect(boolean(true, { alsIcon: true }).textContent).toBe('✓');
    expect(boolean(false, { alsIcon: true }).textContent).toBe('✗');
  });
  
  it('uses custom labels', () => {
    const el = boolean(true, { labels: { wahr: 'Yes', falsch: 'No' } });
    expect(el.textContent).toBe('Yes');
  });
  
  it('has aria-label when using icons', () => {
    const el = boolean(true, { alsIcon: true });
    expect(el.getAttribute('aria-label')).toBe('Ja');
  });
  
  it('converts truthy values to true', () => {
    expect(boolean(1).getAttribute('data-value')).toBe('true');
    expect(boolean('yes').getAttribute('data-value')).toBe('true');
  });
  
  it('converts falsy values to false', () => {
    expect(boolean(0).getAttribute('data-value')).toBe('false');
    expect(boolean('').getAttribute('data-value')).toBe('false');
    expect(boolean(null).getAttribute('data-value')).toBe('false');
  });
});

describe('list morph', () => {
  it('renders array as ul', () => {
    const el = list(['a', 'b', 'c']);
    expect(el.tagName).toBe('UL');
    expect(el.className).toBe('amorph-list');
    expect(el.children.length).toBe(3);
  });
  
  it('renders items as li', () => {
    const el = list(['item1', 'item2']);
    expect(el.children[0].tagName).toBe('LI');
    expect(el.children[0].textContent).toBe('item1');
  });
  
  it('handles empty array', () => {
    const el = list([]);
    expect(el.children.length).toBe(0);
  });
  
  it('handles non-array gracefully', () => {
    const el = list('not an array');
    expect(el.tagName).toBe('UL');
    expect(el.children.length).toBe(0);
  });
  
  it('respects maxItems', () => {
    const el = list(['a', 'b', 'c', 'd', 'e'], { maxItems: 3 });
    expect(el.children.length).toBe(3);
    expect(el.getAttribute('data-truncated')).toBe('true');
    expect(el.getAttribute('data-total')).toBe('5');
  });
  
  it('renders object items with name', () => {
    const el = list([{ name: 'Item 1' }, { name: 'Item 2' }]);
    expect(el.children[0].textContent).toBe('Item 1');
  });
  
  it('uses morphen callback when provided', () => {
    const mockMorph = (val) => {
      const span = document.createElement('span');
      span.textContent = `morphed: ${val}`;
      return span;
    };
    
    const el = list(['a', 'b'], {}, mockMorph);
    expect(el.children[0].textContent).toBe('morphed: a');
  });
});

describe('badge morph', () => {
  it('renders string as badge', () => {
    const el = badge('active');
    expect(el.className).toBe('amorph-badge');
    expect(el.querySelector('.amorph-badge-text').textContent).toBe('active');
  });
  
  it('auto-detects success variant', () => {
    const el = badge('aktiv');
    expect(el.getAttribute('data-variant')).toBe('success');
  });
  
  it('auto-detects danger variant', () => {
    const el = badge('giftig');
    expect(el.getAttribute('data-variant')).toBe('danger');
  });
  
  it('auto-detects warning variant', () => {
    const el = badge('warnung');
    expect(el.getAttribute('data-variant')).toBe('warning');
  });
  
  it('renders object with label', () => {
    const el = badge({ label: 'Custom Label', variant: 'info' });
    expect(el.querySelector('.amorph-badge-text').textContent).toBe('Custom Label');
    expect(el.getAttribute('data-variant')).toBe('info');
  });
  
  it('renders boolean badges', () => {
    expect(badge(true).querySelector('.amorph-badge-text').textContent).toBe('Ja');
    expect(badge(true).getAttribute('data-variant')).toBe('success');
    expect(badge(false).querySelector('.amorph-badge-text').textContent).toBe('Nein');
    expect(badge(false).getAttribute('data-variant')).toBe('danger');
  });
  
  it('includes icon by default', () => {
    const el = badge('test');
    expect(el.querySelector('.amorph-badge-icon')).not.toBeNull();
  });
  
  it('can hide icon', () => {
    const el = badge('test', { showIcon: false });
    expect(el.querySelector('.amorph-badge-icon')).toBeNull();
  });
  
  it('sets CSS custom properties', () => {
    const el = badge('test');
    expect(el.style.getPropertyValue('--badge-bg')).toBeTruthy();
    expect(el.style.getPropertyValue('--badge-border')).toBeTruthy();
    expect(el.style.getPropertyValue('--badge-text')).toBeTruthy();
  });
});

describe('rating morph', () => {
  it('renders number as stars', () => {
    const el = rating(4);
    expect(el.className).toBe('amorph-rating');
    expect(el.querySelector('.amorph-rating-stars')).not.toBeNull();
  });
  
  it('shows correct number of full stars', () => {
    const el = rating(3);
    const fullStars = el.querySelectorAll('.amorph-rating-full');
    expect(fullStars.length).toBe(3);
  });
  
  it('handles half stars', () => {
    const el = rating(3.5);
    const halfStars = el.querySelectorAll('.amorph-rating-half');
    expect(halfStars.length).toBe(1);
  });
  
  it('shows value by default', () => {
    const el = rating(4.5);
    const valueEl = el.querySelector('.amorph-rating-value');
    expect(valueEl).not.toBeNull();
    expect(valueEl.textContent).toContain('4.5');
  });
  
  it('can hide value', () => {
    const el = rating(4, { showValue: false });
    expect(el.querySelector('.amorph-rating-value')).toBeNull();
  });
  
  it('detects max scale automatically', () => {
    // 0-5 scale
    const el5 = rating(4);
    expect(el5.querySelector('.amorph-rating-value').textContent).toContain('/5');
    
    // 0-10 scale
    const el10 = rating(8);
    expect(el10.querySelector('.amorph-rating-value').textContent).toContain('/10');
  });
  
  it('handles object input', () => {
    const el = rating({ rating: 4, max: 5 });
    expect(el.querySelector('.amorph-rating-value').textContent).toContain('4.0/5');
  });
  
  it('renders exactly maxStars stars', () => {
    const el = rating(3, { maxStars: 5 });
    const allStars = el.querySelectorAll('.amorph-rating-star');
    expect(allStars.length).toBe(5);
  });
  
  it('uses custom icons', () => {
    const el = rating(3, { icon: '●', emptyIcon: '○' });
    expect(el.querySelector('.amorph-rating-full').textContent).toBe('●');
    expect(el.querySelector('.amorph-rating-empty').textContent).toBe('○');
  });
});
