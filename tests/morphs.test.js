/**
 * Morph Tests
 * Tests for individual morph functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;

// Import morphs after DOM setup
import { text } from '../morphs/primitives/text/text.js';

describe('text morph', () => {
  it('should create a span element', () => {
    const el = text('Hello World');
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el.className).toBe('amorph-text');
  });

  it('should display string values', () => {
    const el = text('Test String');
    expect(el.textContent).toBe('Test String');
  });

  it('should display number values as strings', () => {
    const el = text(42);
    expect(el.textContent).toBe('42');
  });

  it('should handle null/undefined', () => {
    const el1 = text(null);
    expect(el1.textContent).toBe('');
    
    const el2 = text(undefined);
    expect(el2.textContent).toBe('');
  });

  it('should display arrays as comma-separated', () => {
    const el = text(['a', 'b', 'c']);
    expect(el.textContent).toBe('a, b, c');
  });

  it('should extract name from objects', () => {
    const el = text({ name: 'Steinpilz', id: 1 });
    expect(el.textContent).toBe('Steinpilz');
  });

  it('should extract label from objects', () => {
    const el = text({ label: 'Important', value: 100 });
    expect(el.textContent).toBe('Important');
  });

  it('should extract title from objects', () => {
    const el = text({ title: 'My Title' });
    expect(el.textContent).toBe('My Title');
  });

  it('should extract value from objects as fallback', () => {
    const el = text({ value: 'Fallback Value' });
    expect(el.textContent).toBe('Fallback Value');
  });

  it('should show key-value pairs for unknown objects', () => {
    const el = text({ foo: 'bar', baz: 123 });
    expect(el.textContent).toContain('foo:');
    expect(el.textContent).toContain('bar');
    expect(el.classList.contains('amorph-text-object')).toBe(true);
  });

  it('should truncate long text with maxLaenge config', () => {
    const longText = 'This is a very long text that should be truncated';
    const el = text(longText, { maxLaenge: 20 });
    expect(el.textContent.length).toBeLessThanOrEqual(21); // 20 + ellipsis
    expect(el.textContent.endsWith('…')).toBe(true);
    expect(el.title).toBe(longText);
  });
});
