/**
 * Content Collections Configuration
 * 
 * HINWEIS: Wir verwenden SSR mit eigenem Daten-Loader (src/lib/species.ts)
 * statt Astro Content Collections. Diese Datei bleibt leer um
 * Fehler zu vermeiden.
 * 
 * Die Species-Daten werden direkt aus /data/{kingdom}/{slug}/ geladen
 * und mit dem Cache-Layer (src/lib/cache.ts) gecacht.
 */

// Keine Collections definiert - wir nutzen SSR
export const collections = {};
