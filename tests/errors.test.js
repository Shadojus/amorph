/**
 * Error Handling Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AmorphError,
  MorphError,
  DetectionError,
  DataError,
  ConfigError,
  FeatureError,
  errorBoundary,
  asyncErrorBoundary,
  safeMorph,
  wrapMorphs,
  createMorphFallback,
  onError,
  getErrors,
  clearErrors
} from '../core/errors.js';

describe('Custom Error Classes', () => {
  it('AmorphError has correct properties', () => {
    const error = new AmorphError('Test error', { key: 'value' });
    
    expect(error.name).toBe('AmorphError');
    expect(error.message).toBe('Test error');
    expect(error.context).toEqual({ key: 'value' });
    expect(error.timestamp).toBeDefined();
    expect(error instanceof Error).toBe(true);
  });
  
  it('MorphError includes morph name', () => {
    const error = new MorphError('text', 'Failed to render');
    
    expect(error.name).toBe('MorphError');
    expect(error.morphName).toBe('text');
    expect(error.message).toContain('text');
    expect(error.message).toContain('Failed to render');
  });
  
  it('DetectionError is properly typed', () => {
    const error = new DetectionError('Unknown type', { value: 123 });
    
    expect(error.name).toBe('DetectionError');
    expect(error.context.value).toBe(123);
  });
  
  it('DataError is properly typed', () => {
    const error = new DataError('Failed to fetch');
    expect(error.name).toBe('DataError');
  });
  
  it('ConfigError is properly typed', () => {
    const error = new ConfigError('Invalid YAML');
    expect(error.name).toBe('ConfigError');
  });
  
  it('FeatureError includes feature name', () => {
    const error = new FeatureError('suche', 'Index failed');
    
    expect(error.name).toBe('FeatureError');
    expect(error.featureName).toBe('suche');
    expect(error.message).toContain('suche');
  });
});

describe('errorBoundary', () => {
  beforeEach(() => {
    clearErrors();
  });
  
  it('returns function result on success', () => {
    const result = errorBoundary(() => 42, { name: 'test' });
    expect(result).toBe(42);
  });
  
  it('returns fallback on error', () => {
    const result = errorBoundary(
      () => { throw new Error('fail'); },
      { name: 'test', fallback: 'default' }
    );
    expect(result).toBe('default');
  });
  
  it('returns undefined without fallback', () => {
    const result = errorBoundary(
      () => { throw new Error('fail'); },
      { name: 'test' }
    );
    expect(result).toBeUndefined();
  });
  
  it('rethrows when rethrow is true', () => {
    expect(() => {
      errorBoundary(
        () => { throw new Error('fail'); },
        { name: 'test', rethrow: true }
      );
    }).toThrow('fail');
  });
  
  it('registers error in registry', () => {
    errorBoundary(
      () => { throw new Error('tracked error'); },
      { name: 'test' }
    );
    
    const errors = getErrors();
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('tracked error');
  });
});

describe('asyncErrorBoundary', () => {
  beforeEach(() => {
    clearErrors();
  });
  
  it('returns async result on success', async () => {
    const result = await asyncErrorBoundary(
      async () => 42,
      { name: 'test' }
    );
    expect(result).toBe(42);
  });
  
  it('returns fallback on async error', async () => {
    const result = await asyncErrorBoundary(
      async () => { throw new Error('async fail'); },
      { name: 'test', fallback: 'default' }
    );
    expect(result).toBe('default');
  });
  
  it('handles rejected promises', async () => {
    const result = await asyncErrorBoundary(
      () => Promise.reject(new Error('rejected')),
      { name: 'test', fallback: null }
    );
    expect(result).toBeNull();
  });
});

describe('safeMorph', () => {
  beforeEach(() => {
    clearErrors();
  });
  
  it('wraps successful morph', () => {
    const mockMorph = vi.fn(() => {
      const el = document.createElement('span');
      el.textContent = 'test';
      return el;
    });
    
    const wrapped = safeMorph(mockMorph, 'test');
    const result = wrapped('value', {});
    
    expect(mockMorph).toHaveBeenCalledWith('value', {}, undefined);
    expect(result.textContent).toBe('test');
  });
  
  it('returns fallback on morph error', () => {
    const failingMorph = vi.fn(() => {
      throw new Error('morph failed');
    });
    
    const wrapped = safeMorph(failingMorph, 'broken');
    const result = wrapped('test value', {});
    
    expect(result.getAttribute('data-error')).toBe('true');
    expect(result.getAttribute('data-morph')).toBe('broken');
  });
});

describe('wrapMorphs', () => {
  it('wraps all morphs in object', () => {
    const morphs = {
      text: vi.fn(() => document.createElement('span')),
      number: vi.fn(() => document.createElement('span'))
    };
    
    const wrapped = wrapMorphs(morphs);
    
    expect(typeof wrapped.text).toBe('function');
    expect(typeof wrapped.number).toBe('function');
  });
  
  it('preserves non-function values', () => {
    const morphs = {
      text: vi.fn(),
      config: { key: 'value' }
    };
    
    const wrapped = wrapMorphs(morphs);
    expect(wrapped.config).toEqual({ key: 'value' });
  });
});

describe('createMorphFallback', () => {
  it('creates fallback element with value', () => {
    const fallback = createMorphFallback('text', 'test value', new Error('fail'));
    
    expect(fallback.tagName.toLowerCase()).toBe('amorph-container');
    expect(fallback.getAttribute('data-morph')).toBe('text');
    expect(fallback.getAttribute('data-error')).toBe('true');
    expect(fallback.textContent).toContain('test value');
  });
  
  it('handles null value', () => {
    const fallback = createMorphFallback('text', null, new Error('fail'));
    expect(fallback.textContent).toContain('—');
  });
  
  it('handles object value', () => {
    const fallback = createMorphFallback('object', { key: 'value' }, new Error('fail'));
    expect(fallback.textContent).toContain('key');
  });
  
  it('truncates long values', () => {
    const longValue = 'a'.repeat(200);
    const fallback = createMorphFallback('text', longValue, new Error('fail'));
    
    const content = fallback.querySelector('.amorph-fallback-content');
    expect(content.textContent.length).toBeLessThanOrEqual(100);
  });
});

describe('Error Registry', () => {
  beforeEach(() => {
    clearErrors();
  });
  
  it('getErrors returns registered errors', () => {
    errorBoundary(() => { throw new Error('error1'); }, { name: 'test' });
    errorBoundary(() => { throw new Error('error2'); }, { name: 'test' });
    
    const errors = getErrors();
    expect(errors.length).toBe(2);
  });
  
  it('clearErrors removes all errors', () => {
    errorBoundary(() => { throw new Error('error'); }, { name: 'test' });
    expect(getErrors().length).toBe(1);
    
    clearErrors();
    expect(getErrors().length).toBe(0);
  });
  
  it('onError listener is called', () => {
    const listener = vi.fn();
    const unsubscribe = onError(listener);
    
    errorBoundary(() => { throw new Error('test'); }, { name: 'test' });
    
    expect(listener).toHaveBeenCalled();
    expect(listener.mock.calls[0][0].message).toContain('test');
    
    unsubscribe();
  });
  
  it('unsubscribe stops listener', () => {
    const listener = vi.fn();
    const unsubscribe = onError(listener);
    unsubscribe();
    
    errorBoundary(() => { throw new Error('test'); }, { name: 'test' });
    
    expect(listener).not.toHaveBeenCalled();
  });
});
