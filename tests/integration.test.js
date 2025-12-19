/**
 * Integration Tests
 * Tests for the full pipeline and module interactions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>');
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.customElements = dom.window.customElements;
global.CustomEvent = dom.window.CustomEvent;

describe('Detection Module Integration', () => {
  it('should export all detection functions', async () => {
    const detection = await import('../core/detection/index.js');
    
    expect(typeof detection.detectType).toBe('function');
    expect(typeof detection.detectNumberType).toBe('function');
    expect(typeof detection.detectStringType).toBe('function');
    expect(typeof detection.detectArrayType).toBe('function');
    expect(typeof detection.detectObjectType).toBe('function');
    expect(typeof detection.setDetectionConfig).toBe('function');
    expect(typeof detection.findMorph).toBe('function');
  });

  it('should have TYPE_TO_MORPH mapping', async () => {
    const { TYPE_TO_MORPH } = await import('../core/detection/index.js');
    
    expect(TYPE_TO_MORPH).toBeDefined();
    expect(TYPE_TO_MORPH['string']).toBe('text');
    expect(TYPE_TO_MORPH['number']).toBe('number');
    expect(TYPE_TO_MORPH['boolean']).toBe('boolean');
    expect(TYPE_TO_MORPH['pie']).toBe('pie');
    expect(TYPE_TO_MORPH['bar']).toBe('bar');
    expect(TYPE_TO_MORPH['flow']).toBe('flow');
    expect(TYPE_TO_MORPH['scatterplot']).toBe('scatterplot');
  });

  it('should find correct morph for detected types', async () => {
    const { findMorph } = await import('../core/detection/index.js');
    
    expect(findMorph('string', 'test', null, null, {})).toBe('text');
    expect(findMorph('number', 42, null, null, {})).toBe('number');
    expect(findMorph('pie', {}, null, null, {})).toBe('pie');
    expect(findMorph('unknown', null, null, null, {})).toBe('text');
  });

  it('should respect schema field morphs', async () => {
    const { findMorph } = await import('../core/detection/index.js');
    
    const schemaFieldMorphs = {
      'progress_field': 'progress',
      'temperature': 'gauge'
    };
    
    expect(findMorph('number', 50, 'progress_field', null, schemaFieldMorphs)).toBe('progress');
    expect(findMorph('number', 20, 'temperature', null, schemaFieldMorphs)).toBe('gauge');
  });

  it('should respect morphs.yaml field config', async () => {
    const { findMorph } = await import('../core/detection/index.js');
    
    const morphConfig = {
      felder: {
        'custom_field': 'badge'
      }
    };
    
    expect(findMorph('string', 'test', 'custom_field', morphConfig, {})).toBe('badge');
  });
});

describe('Module Structure', () => {
  it('should have separate detection modules', async () => {
    // Each module should be importable separately
    const numberModule = await import('../core/detection/number.js');
    const stringModule = await import('../core/detection/string.js');
    const arrayModule = await import('../core/detection/array.js');
    const objectModule = await import('../core/detection/object.js');
    
    expect(typeof numberModule.detectNumberType).toBe('function');
    expect(typeof stringModule.detectStringType).toBe('function');
    expect(typeof arrayModule.detectArrayType).toBe('function');
    expect(typeof objectModule.detectObjectType).toBe('function');
  });
});
