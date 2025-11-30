import { text } from './text.js';
import { number } from './number.js';
import { boolean } from './boolean.js';
import { tag } from './tag.js';
import { range } from './range.js';
import { list } from './list.js';
import { object } from './object.js';
import { image } from './image.js';
import { link } from './link.js';
import { suche } from './suche.js';
import { perspektiven } from './perspektiven.js';
import { header } from './header.js';
import { debug } from '../observer/debug.js';

export const morphs = {
  text,
  number,
  boolean,
  tag,
  range,
  list,
  object,
  image,
  link,
  suche,
  perspektiven,
  header
};

// Log registrierte Morphs
debug.morphs('registry', { verfügbar: Object.keys(morphs) });

export { text, number, boolean, tag, range, list, object, image, link, suche, perspektiven, header };
