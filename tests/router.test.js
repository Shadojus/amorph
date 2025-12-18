/**
 * Utils Tests
 * Tests für Router, DOM utilities, etc.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseRoute, navigateTo, updateQueryState, goBack } from '../util/router.js';

describe('Router', () => {
  let originalLocation;
  let originalHistory;
  
  beforeEach(() => {
    // Save original
    originalLocation = window.location;
    originalHistory = window.history;
    
    // Mock location
    delete window.location;
    window.location = {
      pathname: '/',
      search: '',
      origin: 'http://localhost'
    };
    
    // Mock history
    window.history.pushState = vi.fn();
    window.history.replaceState = vi.fn();
    window.history.back = vi.fn();
  });
  
  afterEach(() => {
    window.location = originalLocation;
  });
  
  describe('parseRoute', () => {
    it('parses root as liste', () => {
      window.location.pathname = '/';
      window.location.search = '';
      
      const result = parseRoute();
      
      expect(result.route).toBe('liste');
      expect(result.params).toEqual({});
    });
    
    it('parses slug as einzelansicht', () => {
      window.location.pathname = '/psilocybe-cyanescens';
      window.location.search = '';
      
      const result = parseRoute();
      
      expect(result.route).toBe('einzelansicht');
      expect(result.params.slug).toBe('psilocybe-cyanescens');
    });
    
    it('extracts suche query param', () => {
      window.location.pathname = '/';
      window.location.search = '?suche=pilz';
      
      const result = parseRoute();
      
      expect(result.query.suche).toBe('pilz');
    });
    
    it('extracts perspektiven query param as array', () => {
      window.location.pathname = '/';
      window.location.search = '?perspektiven=biochemie,toxikologie';
      
      const result = parseRoute();
      
      expect(result.query.perspektiven).toEqual(['biochemie', 'toxikologie']);
    });
    
    it('handles empty perspektiven', () => {
      window.location.pathname = '/';
      window.location.search = '';
      
      const result = parseRoute();
      
      expect(result.query.perspektiven).toEqual([]);
    });
  });
  
  describe('navigateTo', () => {
    it('navigates to liste', () => {
      navigateTo('liste');
      
      expect(window.history.pushState).toHaveBeenCalledWith(
        expect.objectContaining({ route: 'liste' }),
        '',
        '/'
      );
    });
    
    it('navigates to einzelansicht with slug', () => {
      navigateTo('einzelansicht', { slug: 'steinpilz' });
      
      expect(window.history.pushState).toHaveBeenCalledWith(
        expect.objectContaining({ 
          route: 'einzelansicht',
          params: { slug: 'steinpilz' }
        }),
        '',
        '/steinpilz'
      );
    });
    
    it('adds query params', () => {
      navigateTo('liste', {}, { suche: 'test' });
      
      expect(window.history.pushState).toHaveBeenCalledWith(
        expect.anything(),
        '',
        '/?suche=test'
      );
    });
    
    it('adds perspektiven as comma-separated', () => {
      navigateTo('liste', {}, { perspektiven: ['a', 'b'] });
      
      expect(window.history.pushState).toHaveBeenCalledWith(
        expect.anything(),
        '',
        '/?perspektiven=a%2Cb'
      );
    });
    
    it('dispatches route-change event', () => {
      const listener = vi.fn();
      window.addEventListener('amorph:route-change', listener);
      
      navigateTo('einzelansicht', { slug: 'test' });
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({ 
            route: 'einzelansicht',
            params: { slug: 'test' }
          })
        })
      );
      
      window.removeEventListener('amorph:route-change', listener);
    });
  });
  
  describe('updateQueryState', () => {
    it('updates search params without navigation', () => {
      window.location.pathname = '/';
      window.location.search = '';
      
      updateQueryState({ suche: 'new search' });
      
      expect(window.history.replaceState).toHaveBeenCalled();
      const url = window.history.replaceState.mock.calls[0][2];
      expect(url).toContain('suche=new');
    });
    
    it('removes empty values', () => {
      window.location.pathname = '/';
      window.location.search = '?suche=old';
      
      updateQueryState({ suche: '' });
      
      const url = window.history.replaceState.mock.calls[0][2];
      expect(url).toBe('/');
    });
  });
  
  describe('goBack', () => {
    it('calls history.back', () => {
      goBack();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
