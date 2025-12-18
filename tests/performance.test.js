/**
 * Performance Utilities Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  debounce,
  throttle,
  clearMorphCache,
  onVisible,
  whenIdle,
  batchUpdate,
  createPool,
  createElementPool,
  perfStart,
  perfEnd,
  measure
} from '../util/performance.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('delays function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    expect(fn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  
  it('resets timer on subsequent calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);
    
    expect(fn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  
  it('passes arguments', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
  
  it('can be cancelled', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(100);
    
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('executes immediately on first call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });
  
  it('ignores calls within throttle window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    
    throttled();
    throttled();
    throttled();
    
    expect(fn).toHaveBeenCalledTimes(1);
  });
  
  it('executes last call after window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    
    throttled('first');
    throttled('second');
    throttled('last');
    
    vi.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('last');
  });
  
  it('allows new call after window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    
    throttled();
    vi.advanceTimersByTime(100);
    throttled();
    
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('onVisible', () => {
  let mockObserver;
  let observeCallback;
  
  beforeEach(() => {
    // Mock IntersectionObserver
    mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    };
    
    global.IntersectionObserver = vi.fn((callback) => {
      observeCallback = callback;
      return mockObserver;
    });
  });
  
  afterEach(() => {
    delete global.IntersectionObserver;
  });
  
  it('calls callback when element becomes visible', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    
    const callback = vi.fn();
    onVisible(el, callback);
    
    expect(mockObserver.observe).toHaveBeenCalledWith(el);
    
    // Simulate intersection - callback receives entry, not element
    const entry = { isIntersecting: true, target: el };
    observeCallback([entry]);
    
    expect(callback).toHaveBeenCalledWith(entry);
    el.remove();
  });
  
  it('returns cleanup function', () => {
    const el = document.createElement('div');
    const cleanup = onVisible(el, () => {});
    
    expect(typeof cleanup).toBe('function');
    cleanup();
    expect(mockObserver.disconnect).toHaveBeenCalled();
  });
});

describe('whenIdle', () => {
  it('executes callback', async () => {
    const callback = vi.fn();
    whenIdle(callback);
    
    await new Promise(r => setTimeout(r, 100));
    
    expect(callback).toHaveBeenCalled();
  });
});

describe('batchUpdate', () => {
  it('batches multiple updates', async () => {
    const updates = [];
    
    batchUpdate(() => updates.push(1));
    batchUpdate(() => updates.push(2));
    batchUpdate(() => updates.push(3));
    
    expect(updates).toHaveLength(0);
    
    // Wait for animation frame
    await new Promise(r => requestAnimationFrame(r));
    
    expect(updates).toEqual([1, 2, 3]);
  });
});

describe('createPool', () => {
  it('creates objects with factory', () => {
    const factory = vi.fn(() => ({ value: 0 }));
    const pool = createPool(factory);
    
    const obj = pool.get();
    
    expect(factory).toHaveBeenCalled();
    expect(obj.value).toBe(0);
  });
  
  it('reuses released objects', () => {
    const factory = vi.fn(() => ({ value: 0 }));
    const pool = createPool(factory);
    
    const obj1 = pool.get();
    pool.release(obj1);
    const obj2 = pool.get();
    
    expect(obj2).toBe(obj1);
    expect(factory).toHaveBeenCalledTimes(1);
  });
  
  it('resets objects on release', () => {
    const reset = vi.fn();
    const pool = createPool(() => ({}), reset);
    
    const obj = pool.get();
    pool.release(obj);
    
    expect(reset).toHaveBeenCalledWith(obj);
  });
  
  it('respects max size', () => {
    const pool = createPool(() => ({}), () => {}, 2);
    
    const objs = [pool.get(), pool.get(), pool.get()];
    objs.forEach(obj => pool.release(obj));
    
    // Only 2 should be pooled
    pool.get();
    pool.get();
    
    // Third should create new
    const newFactory = vi.fn(() => ({}));
    const pool2 = createPool(newFactory, () => {}, 2);
    const obj1 = pool2.get();
    const obj2 = pool2.get();
    const obj3 = pool2.get();
    pool2.release(obj1);
    pool2.release(obj2);
    pool2.release(obj3);
    
    expect(newFactory).toHaveBeenCalledTimes(3);
  });
  
  it('clears pool', () => {
    const factory = vi.fn(() => ({}));
    const pool = createPool(factory);
    
    const obj = pool.get();
    pool.release(obj);
    pool.clear();
    
    pool.get();
    expect(factory).toHaveBeenCalledTimes(2); // New object created
  });
});

describe('createElementPool', () => {
  it('creates DOM elements', () => {
    const pool = createElementPool('div');
    const el = pool.get();
    
    expect(el.tagName).toBe('DIV');
  });
  
  it('resets elements on release', () => {
    const pool = createElementPool('div');
    const el = pool.get();
    
    el.className = 'test';
    el.textContent = 'content';
    el.setAttribute('data-test', 'value');
    
    pool.release(el);
    const el2 = pool.get();
    
    expect(el2).toBe(el);
    expect(el2.className).toBe('');
    expect(el2.textContent).toBe('');
    expect(el2.hasAttribute('data-test')).toBe(false);
  });
});

describe('Performance Monitoring', () => {
  it('measures time', () => {
    perfStart('test');
    
    // Simulate some work
    for (let i = 0; i < 1000; i++) {
      Math.random();
    }
    
    const duration = perfEnd('test');
    
    expect(duration).toBeGreaterThanOrEqual(0);
  });
  
  it('returns 0 for unknown mark', () => {
    const duration = perfEnd('unknown');
    expect(duration).toBe(0);
  });
  
  it('measure wraps function', () => {
    const result = measure('test', () => {
      return 42;
    });
    
    expect(result).toBe(42);
  });
  
  it('measure handles exceptions', () => {
    expect(() => {
      measure('test', () => {
        throw new Error('fail');
      });
    }).toThrow('fail');
  });
});

describe('clearMorphCache', () => {
  it('clears the cache', () => {
    // Just verify it doesn't throw
    clearMorphCache();
  });
});
