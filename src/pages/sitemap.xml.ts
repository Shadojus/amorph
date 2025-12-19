/**
 * Dynamic Sitemap
 * 
 * GET /sitemap.xml
 * 
 * Generiert dynamisch aus allen Species-Daten
 */

import type { APIRoute } from 'astro';
import { getAllSpeciesSlugs } from '../lib/species';
import { CACHE_TTL, getCacheHeaders } from '../lib/cache';

const SITE_URL = 'https://amorph.funginomi.com';

export const GET: APIRoute = async () => {
  const species = await getAllSpeciesSlugs();
  
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

  for (const { slug, kingdom } of species) {
    xml += `  <url>
    <loc>${SITE_URL}/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      ...getCacheHeaders(CACHE_TTL.sitemap)
    }
  });
};
