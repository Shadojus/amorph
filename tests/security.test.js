/**
 * Security Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  unescapeHtml,
  sanitizeHtml,
  createElement,
  setTextContent,
  setInnerHtml,
  createEmptyElement,
  sanitizeString,
  sanitizeNumber,
  sanitizeUrl,
  sanitizeObject,
  html,
  safe
} from '../util/security.js';

describe('escapeHtml', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });
  
  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
  
  it('escapes quotes', () => {
    expect(escapeHtml('"hello" \'world\'')).toBe('&quot;hello&quot; &#39;world&#39;');
  });
  
  it('handles null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
  
  it('converts non-strings', () => {
    expect(escapeHtml(123)).toBe('123');
    expect(escapeHtml(true)).toBe('true');
  });
});

describe('sanitizeHtml', () => {
  it('allows safe tags', () => {
    const result = sanitizeHtml('<span class="test">Hello</span>');
    expect(result).toBe('<span class="test">Hello</span>');
  });
  
  it('removes script tags', () => {
    const result = sanitizeHtml('<div>Safe<script>alert("xss")</script></div>');
    expect(result).toBe('<div>Safe</div>');
    expect(result).not.toContain('script');
  });
  
  it('removes event handlers', () => {
    const result = sanitizeHtml('<div onclick="alert(1)">Click</div>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('Click');
  });
  
  it('removes javascript: URLs', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">Link</a>');
    expect(result).not.toContain('javascript:');
  });
  
  it('allows safe URLs', () => {
    const result = sanitizeHtml('<a href="https://example.com">Link</a>');
    expect(result).toContain('href="https://example.com"');
  });
  
  it('removes onerror handlers', () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
  });
  
  it('keeps nested content from removed tags', () => {
    const result = sanitizeHtml('<custom>Content</custom>');
    expect(result).toContain('Content');
    expect(result).not.toContain('custom');
  });
  
  it('handles empty input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null)).toBe('');
  });
});

describe('createElement', () => {
  it('creates element with attributes', () => {
    const el = createElement('div', { class: 'test', id: 'my-id' });
    expect(el.className).toBe('test');
    expect(el.id).toBe('my-id');
  });
  
  it('adds text children safely', () => {
    const el = createElement('span', {}, '<script>evil</script>');
    expect(el.textContent).toBe('<script>evil</script>');
    expect(el.innerHTML).not.toContain('<script>');
  });
  
  it('adds Node children', () => {
    const child = document.createElement('span');
    child.textContent = 'child';
    const el = createElement('div', {}, child);
    expect(el.querySelector('span').textContent).toBe('child');
  });
  
  it('handles array of children', () => {
    const el = createElement('div', {}, ['a', 'b', 'c']);
    expect(el.textContent).toBe('abc');
  });
  
  it('ignores on* string attributes', () => {
    const el = createElement('div', { onclick: 'alert(1)' });
    expect(el.getAttribute('onclick')).toBeNull();
  });
  
  it('allows on* function handlers', () => {
    let clicked = false;
    const el = createElement('button', { onClick: () => { clicked = true; } });
    el.click();
    expect(clicked).toBe(true);
  });
  
  it('handles class as array', () => {
    const el = createElement('div', { class: ['a', 'b', 'c'] });
    expect(el.className).toBe('a b c');
  });
  
  it('handles style as object', () => {
    const el = createElement('div', { style: { color: 'red', fontSize: '14px' } });
    expect(el.style.color).toBe('red');
    expect(el.style.fontSize).toBe('14px');
  });
  
  it('handles data attributes', () => {
    const el = createElement('div', { 'data-id': '123', dataValue: 'test' });
    expect(el.dataset.id).toBe('123');
    expect(el.dataset.value).toBe('test');
  });
});

describe('setTextContent', () => {
  it('sets text safely', () => {
    const el = document.createElement('div');
    setTextContent(el, '<script>evil</script>');
    expect(el.textContent).toBe('<script>evil</script>');
    expect(el.innerHTML).toBe('&lt;script&gt;evil&lt;/script&gt;');
  });
  
  it('handles null', () => {
    const el = document.createElement('div');
    setTextContent(el, null);
    expect(el.textContent).toBe('');
  });
});

describe('setInnerHtml', () => {
  it('sanitizes before setting', () => {
    const el = document.createElement('div');
    setInnerHtml(el, '<span onclick="alert(1)">Test</span>');
    expect(el.innerHTML).toBe('<span>Test</span>');
  });
});

describe('createEmptyElement', () => {
  it('creates span with class and text', () => {
    const el = createEmptyElement('amorph-empty', 'No data');
    expect(el.tagName).toBe('SPAN');
    expect(el.className).toBe('amorph-empty');
    expect(el.textContent).toBe('No data');
  });
});

describe('sanitizeString', () => {
  it('converts to string', () => {
    expect(sanitizeString(123)).toBe('123');
    expect(sanitizeString(null)).toBe('');
  });
  
  it('trims by default', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });
  
  it('respects trim option', () => {
    expect(sanitizeString('  hello  ', { trim: false })).toBe('  hello  ');
  });
  
  it('truncates long strings', () => {
    const long = 'a'.repeat(2000);
    const result = sanitizeString(long, { maxLength: 100 });
    expect(result.length).toBe(101); // 100 + ellipsis
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('sanitizeNumber', () => {
  it('returns valid numbers', () => {
    expect(sanitizeNumber(42)).toBe(42);
    expect(sanitizeNumber('42')).toBe(42);
    expect(sanitizeNumber(3.14)).toBe(3.14);
  });
  
  it('returns default for invalid', () => {
    expect(sanitizeNumber('not a number')).toBe(0);
    expect(sanitizeNumber(NaN)).toBe(0);
    expect(sanitizeNumber(Infinity)).toBe(0);
  });
  
  it('respects min/max', () => {
    expect(sanitizeNumber(5, { min: 10 })).toBe(10);
    expect(sanitizeNumber(100, { max: 50 })).toBe(50);
    expect(sanitizeNumber(25, { min: 10, max: 50 })).toBe(25);
  });
  
  it('uses custom default', () => {
    expect(sanitizeNumber('invalid', { default: -1 })).toBe(-1);
  });
});

describe('sanitizeUrl', () => {
  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
  });
  
  it('allows http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
  });
  
  it('allows relative URLs', () => {
    expect(sanitizeUrl('/path/to/resource')).toBe('/path/to/resource');
  });
  
  it('blocks javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
  });
  
  it('blocks data: URLs by default', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
  });
  
  it('allows data: images when enabled', () => {
    const dataImg = 'data:image/png;base64,abc123';
    expect(sanitizeUrl(dataImg, { allowData: true })).toBe(dataImg);
  });
  
  it('handles empty input', () => {
    expect(sanitizeUrl('')).toBeNull();
    expect(sanitizeUrl(null)).toBeNull();
  });
});

describe('sanitizeObject', () => {
  it('sanitizes nested objects', () => {
    const result = sanitizeObject({
      name: '  test  ',
      value: 42,
      nested: { key: 'value' }
    });
    expect(result.name).toBe('test');
    expect(result.value).toBe(42);
    expect(result.nested.key).toBe('value');
  });
  
  it('sanitizes arrays', () => {
    const result = sanitizeObject(['  a  ', 'b', { c: 'd' }]);
    expect(result[0]).toBe('a');
    expect(result[2].c).toBe('d');
  });
  
  it('handles null/undefined', () => {
    expect(sanitizeObject(null)).toBeNull();
    expect(sanitizeObject(undefined)).toBeUndefined();
  });
  
  it('filters dangerous keys', () => {
    const obj = Object.create(null);
    obj.normal = 'ok';
    obj['__proto__'] = 'bad';
    obj['constructor'] = 'bad';
    obj['prototype'] = 'bad';
    
    const result = sanitizeObject(obj);
    expect(result.normal).toBe('ok');
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(result, 'constructor')).toBe(false);
  });
  
  it('limits recursion depth', () => {
    const deep = { a: { b: { c: { d: { e: { f: 'deep' } } } } } };
    const result = sanitizeObject(deep, 3);
    expect(result.a.b.c).toBe('[max depth]');
  });
  
  it('removes functions', () => {
    const result = sanitizeObject({ fn: () => {}, value: 1 });
    expect(result.fn).toBeNull();
    expect(result.value).toBe(1);
  });
});

describe('html template tag', () => {
  it('escapes interpolated values', () => {
    const evil = '<script>alert(1)</script>';
    const result = html`<div>${evil}</div>`;
    expect(result).toBe('<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>');
  });
  
  it('allows safe() values', () => {
    const result = html`<div>${safe('<b>bold</b>')}</div>`;
    expect(result).toBe('<div><b>bold</b></div>');
  });
  
  it('handles multiple values', () => {
    const a = '<a>';
    const b = 'safe';
    const result = html`${a} and ${b}`;
    expect(result).toBe('&lt;a&gt; and safe');
  });
});
