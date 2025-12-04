/**
 * TYPE CATEGORIES - Datentyp-Kategorisierung
 * 
 * Definiert welche Datentypen semantisch zusammengehören.
 * Dies ist das Herzstück der datengetriebenen Entscheidungsfindung.
 * 
 * DATENGETRIEBEN: Kategorien basieren auf Datenstruktur, nicht auf Feldnamen!
 */

// =============================================================================
// TYP-KATEGORIEN - Welche Typen passen zusammen?
// =============================================================================

export const TYPE_CATEGORIES = {
  // Numerische Vergleiche - können auf gemeinsamer Skala verglichen werden
  numeric: ['number', 'rating', 'progress', 'bar'],
  
  // Ranges - haben min/max, können überlagert werden
  ranges: ['range', 'stats'],
  
  // Multidimensional - haben mehrere Achsen/Dimensionen
  multidim: ['radar', 'pie'],
  
  // Sequentiell - haben zeitliche oder geordnete Abfolge
  sequential: ['timeline'],
  
  // Kategorisch - diskrete Werte
  categorical: ['tag', 'badge', 'boolean', 'list'],
  
  // Text/Komplex
  textual: ['text', 'string', 'object'],
  
  // Media
  media: ['image', 'link']
};

// Umkehr-Mapping: Typ → Kategorie
export const TYPE_TO_CATEGORY = {};
Object.entries(TYPE_CATEGORIES).forEach(([cat, types]) => {
  types.forEach(t => TYPE_TO_CATEGORY[t] = cat);
});

/**
 * Gibt die Kategorie für einen Typ zurück
 */
export function getCategory(typ) {
  return TYPE_TO_CATEGORY[typ] || 'textual';
}

/**
 * Prüft ob zwei Typen in der gleichen Kategorie sind
 */
export function sameCategory(typ1, typ2) {
  return getCategory(typ1) === getCategory(typ2);
}

export default {
  TYPE_CATEGORIES,
  TYPE_TO_CATEGORY,
  getCategory,
  sameCategory
};
