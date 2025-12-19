/**
 * Search API Route
 * 
 * GET /api/search?q=query
 * 
 * Cached für 5 Minuten
 */

import type { APIRoute } from 'astro';
import { searchSpecies } from '../../lib/species';
import { CACHE_TTL, getCacheHeaders } from '../../lib/cache';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q') || '';
  
  // Leere Query
  if (!query.trim()) {
    return new Response(JSON.stringify({ 
      results: [],
      query: '',
      count: 0 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCacheHeaders(0) // Kein Cache für leere Queries
      }
    });
  }
  
  try {
    const results = await searchSpecies(query);
    
    // Ergebnisse formatieren
    const formattedResults = results.map(species => ({
      slug: species.slug,
      name: species.name,
      wissenschaftlicher_name: species.wissenschaftlicher_name,
      kingdom: species.kingdom,
      url: `/${species.slug}`
    }));
    
    return new Response(JSON.stringify({
      results: formattedResults,
      query,
      count: formattedResults.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCacheHeaders(CACHE_TTL.search)
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    
    return new Response(JSON.stringify({
      error: 'Search failed',
      results: [],
      query,
      count: 0
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCacheHeaders(0)
      }
    });
  }
};
