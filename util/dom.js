import { debug } from '../observer/debug.js';

// DEBUG: el() Aufrufe nur für wichtige Elemente loggen (nicht für jeden Tag)
const WICHTIGE_TAGS = new Set(['form', 'nav', 'header', 'main', 'section', 'article']);

export function el(tag, attrs = {}, children = []) {
  // Nur wichtige Tags loggen um Console nicht zu überfluten
  if (WICHTIGE_TAGS.has(tag)) {
    debug.render(`el() ${tag}`, { attrs: Object.keys(attrs), children: children.length });
  }
  const element = document.createElement(tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('data')) {
      element.dataset[key.slice(4).toLowerCase()] = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  }
  
  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }
  
  return element;
}

export function setText(element, text) {
  debug.render('setText', { tag: element?.tagName, textLength: String(text ?? '').length });
  element.textContent = String(text ?? '');
}

export function clear(element) {
  const childCount = element?.childNodes?.length || 0;
  if (childCount > 0) {
    debug.render('clear', { tag: element?.tagName, removedChildren: childCount });
  }
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
