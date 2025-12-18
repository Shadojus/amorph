/**
 * Detection Module Tests
 * Tests for the type detection system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  detectType, 
  setDetectionConfig,
  detectNumberType,
  detectStringType,
  detectArrayType,
  detectObjectType 
} from '../core/detection/index.js';

describe('detectType', () => {
  beforeEach(() => {
    // Reset detection config before each test
    setDetectionConfig(null);
  });

  describe('Primitives', () => {
    it('should detect null', () => {
      expect(detectType(null)).toBe('null');
      expect(detectType(undefined)).toBe('null');
    });

    it('should detect boolean', () => {
      expect(detectType(true)).toBe('boolean');
      expect(detectType(false)).toBe('boolean');
    });
  });

  describe('Numbers', () => {
    it('should detect rating (0-10)', () => {
      expect(detectType(0)).toBe('rating');
      expect(detectType(5)).toBe('rating');
      expect(detectType(7.5)).toBe('rating');
      expect(detectType(10)).toBe('rating');
    });

    it('should detect progress (11-100 integers)', () => {
      expect(detectType(11)).toBe('progress');
      expect(detectType(50)).toBe('progress');
      expect(detectType(75)).toBe('progress');
      expect(detectType(100)).toBe('progress');
    });

    it('should detect number for values outside rating/progress range', () => {
      expect(detectType(101)).toBe('number');
      expect(detectType(1000)).toBe('number');
      expect(detectType(-5)).toBe('number');
    });

    it('should detect decimal in rating range as rating', () => {
      expect(detectType(10.5)).toBe('number'); // 10.5 is > max 10
      expect(detectType(5.5)).toBe('rating');  // 5.5 is within 0-10
    });

    it('should not detect decimals as progress', () => {
      expect(detectType(50.5)).toBe('number'); // Progress requires integers
    });
  });

  describe('Strings', () => {
    it('should detect links', () => {
      expect(detectType('https://example.com')).toBe('link');
      expect(detectType('http://test.org')).toBe('link');
      expect(detectType('www.google.com')).toBe('link');
    });

    it('should detect images', () => {
      expect(detectType('photo.jpg')).toBe('image');
      expect(detectType('icon.png')).toBe('image');
      expect(detectType('logo.svg')).toBe('image');
      expect(detectType('animation.gif')).toBe('image');
      expect(detectType('picture.webp')).toBe('image');
    });

    it('should detect badges (status keywords)', () => {
      expect(detectType('active')).toBe('badge');
      expect(detectType('inactive')).toBe('badge');
      expect(detectType('edible')).toBe('badge');
      expect(detectType('toxic')).toBe('badge');
      expect(detectType('essbar')).toBe('badge');
      expect(detectType('giftig')).toBe('badge');
      expect(detectType('warning')).toBe('badge');
      expect(detectType('available')).toBe('badge');
    });

    it('should detect tags (short strings)', () => {
      expect(detectType('Pilz')).toBe('tag');
      expect(detectType('Category')).toBe('tag');
      expect(detectType('TypeA')).toBe('tag');
    });

    it('should detect text (long strings)', () => {
      expect(detectType('This is a longer description that exceeds the tag limit')).toBe('string');
    });
  });

  describe('Arrays', () => {
    it('should detect sparkline (numeric arrays)', () => {
      expect(detectType([1, 2, 3, 4, 5])).toBe('sparkline');
      expect(detectType([10, 20, 15, 30, 25])).toBe('sparkline');
    });

    it('should detect bar for short numeric arrays', () => {
      expect(detectType([1, 2])).toBe('bar');
    });

    it('should detect heatmap (2D numeric arrays)', () => {
      expect(detectType([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBe('heatmap');
    });

    it('should detect radar (axis/value objects, 3+ items)', () => {
      const radarData = [
        { axis: 'Strength', value: 80 },
        { axis: 'Speed', value: 60 },
        { axis: 'Intelligence', value: 90 }
      ];
      expect(detectType(radarData)).toBe('radar');
    });

    it('should detect timeline (date-based events)', () => {
      const timeline = [
        { date: '2024-01', event: 'Start' },
        { date: '2024-06', event: 'Middle' }
      ];
      expect(detectType(timeline)).toBe('timeline');
    });

    it('should detect lifecycle (phase-based)', () => {
      const lifecycle = [
        { phase: 'Spore', duration: '2 weeks' },
        { phase: 'Growth', duration: '4 weeks' }
      ];
      expect(detectType(lifecycle)).toBe('lifecycle');
    });

    it('should detect pie (≤6 items with label/value)', () => {
      const pieData = [
        { label: 'A', value: 30 },
        { label: 'B', value: 70 }
      ];
      expect(detectType(pieData)).toBe('pie');
    });

    it('should detect bar (>6 items with label/value)', () => {
      const barData = Array.from({ length: 8 }, (_, i) => ({
        label: `Item ${i}`,
        value: Math.random() * 100
      }));
      expect(detectType(barData)).toBe('bar');
    });

    it('should detect flow (from/to structure)', () => {
      const flowData = [
        { from: 'A', to: 'B', value: 10 },
        { from: 'B', to: 'C', value: 20 }
      ];
      expect(detectType(flowData)).toBe('flow');
    });

    it('should detect scatterplot (x/y coordinates)', () => {
      const scatterData = [
        { x: 10, y: 20 },
        { x: 30, y: 40 }
      ];
      expect(detectType(scatterData)).toBe('scatterplot');
    });

    it('should detect groupedbar (category with multiple series)', () => {
      const groupedData = [
        { year: 2020, sales: 100, profit: 20 },
        { year: 2021, sales: 150, profit: 30 }
      ];
      expect(detectType(groupedData)).toBe('groupedbar');
    });

    it('should detect boxplot (statistical data)', () => {
      const boxplotData = [
        { name: 'Group A', min: 10, q1: 20, median: 30, q3: 40, max: 50 }
      ];
      expect(detectType(boxplotData)).toBe('boxplot');
    });

    it('should detect pictogram (icon + count)', () => {
      const pictogramData = [
        { icon: '🍄', count: 5 },
        { icon: '🌲', count: 3 }
      ];
      expect(detectType(pictogramData)).toBe('pictogram');
    });

    it('should detect bubble (size + label)', () => {
      const bubbleData = [
        { name: 'Item A', size: 100 },
        { name: 'Item B', size: 200 }
      ];
      expect(detectType(bubbleData)).toBe('bubble');
    });

    it('should detect hierarchy (level/parent structure)', () => {
      const hierarchyData = [
        { name: 'Root', level: 0 },
        { name: 'Child', level: 1 }
      ];
      expect(detectType(hierarchyData)).toBe('hierarchy');
    });

    it('should detect network (connections)', () => {
      const networkData = [
        { name: 'Node A', type: 'central', connections: ['B', 'C'] }
      ];
      expect(detectType(networkData)).toBe('network');
    });

    it('should detect calendar (month + active)', () => {
      const calendarData = [
        { month: 'Jan', active: true },
        { month: 'Feb', active: false }
      ];
      expect(detectType(calendarData)).toBe('calendar');
    });

    it('should detect steps (step + action)', () => {
      const stepsData = [
        { step: 1, action: 'Prepare' },
        { step: 2, action: 'Execute' }
      ];
      expect(detectType(stepsData)).toBe('steps');
    });

    it('should detect slopegraph (before/after)', () => {
      const slopeData = [
        { name: 'Item', vorher: 10, nachher: 20 }
      ];
      expect(detectType(slopeData)).toBe('slopegraph');
    });

    it('should detect lollipop (rank structure)', () => {
      const lollipopData = [
        { name: 'First', rank: 1, value: 100 }
      ];
      expect(detectType(lollipopData)).toBe('lollipop');
    });
  });

  describe('Objects', () => {
    it('should detect map (lat/lng)', () => {
      expect(detectType({ lat: 48.1, lng: 11.5 })).toBe('map');
      expect(detectType({ latitude: 48.1, longitude: 11.5 })).toBe('map');
    });

    it('should detect citation (author/year/title)', () => {
      expect(detectType({ author: 'Kirk', year: 2016 })).toBe('citation');
      expect(detectType({ autor: 'Kirk', titel: 'Data Vis' })).toBe('citation');
    });

    it('should detect dosage (dose + unit)', () => {
      expect(detectType({ dose: 500, unit: 'mg' })).toBe('dosage');
      expect(detectType({ dosis: 500, einheit: 'mg' })).toBe('dosage');
    });

    it('should detect currency (amount + currency)', () => {
      expect(detectType({ amount: 19.99, currency: 'EUR' })).toBe('currency');
      expect(detectType({ preis: 19.99, waehrung: 'USD' })).toBe('currency');
    });

    it('should detect gauge (value + zones/minmax)', () => {
      expect(detectType({ value: 75, min: 0, max: 100 })).toBe('gauge');
      expect(detectType({ score: 80, zones: ['low', 'mid', 'high'] })).toBe('gauge');
    });

    it('should detect comparison (before/after numbers)', () => {
      expect(detectType({ vorher: 100, nachher: 150 })).toBe('comparison');
      expect(detectType({ before: 50, after: 75 })).toBe('comparison');
      expect(detectType({ '2020': 500, '2024': 300 })).toBe('comparison');
    });

    it('should detect stats (min/max/avg)', () => {
      expect(detectType({ min: 5, max: 100, avg: 42 })).toBe('stats');
      expect(detectType({ min: 10, max: 50, median: 30 })).toBe('stats');
    });

    it('should detect range (only min/max)', () => {
      expect(detectType({ min: 10, max: 25 })).toBe('range');
    });

    it('should detect rating object', () => {
      expect(detectType({ rating: 4.5 })).toBe('rating');
      expect(detectType({ score: 8 })).toBe('rating');
    });

    it('should detect progress object', () => {
      expect(detectType({ current: 75, total: 100 })).toBe('progress');
      expect(detectType({ value: 50, max: 100 })).toBe('progress');
    });

    it('should detect badge object', () => {
      expect(detectType({ status: 'active' })).toBe('badge');
      expect(detectType({ variant: 'warning' })).toBe('badge');
    });

    it('should detect pie (only numeric values, 2-6 keys)', () => {
      expect(detectType({ Protein: 26, Fat: 8, Carbs: 52 })).toBe('pie');
    });

    it('should detect object as fallback', () => {
      expect(detectType({ complex: { nested: 'data' } })).toBe('object');
      expect(detectType({ foo: 'bar', baz: [1, 2, 3] })).toBe('object');
    });
  });

  describe('Custom Config', () => {
    it('should respect custom rating range', () => {
      setDetectionConfig({
        erkennung: {
          rating: { min: 0, max: 5 }
        }
      });
      
      expect(detectType(4)).toBe('rating');
      expect(detectType(5)).toBe('rating');
      expect(detectType(6)).toBe('number'); // Outside custom range
    });

    it('should respect custom badge keywords', () => {
      setDetectionConfig({
        erkennung: {
          badge: { keywords: ['custom', 'special'], maxLength: 30 }
        }
      });
      
      expect(detectType('custom status')).toBe('badge');
      expect(detectType('special')).toBe('badge');
    });
  });
});

describe('detectNumberType', () => {
  it('should handle edge cases', () => {
    expect(detectNumberType(0, null)).toBe('rating');
    expect(detectNumberType(10, null)).toBe('rating');
    expect(detectNumberType(10.5, null)).toBe('number'); // Outside 0-10
    expect(detectNumberType(11, null)).toBe('progress');
    expect(detectNumberType(100, null)).toBe('progress');
  });
});

describe('detectStringType', () => {
  it('should handle non-string input gracefully', () => {
    expect(detectStringType(123, null)).toBe('text');
    expect(detectStringType({}, null)).toBe('text');
  });

  it('should handle empty strings', () => {
    expect(detectStringType('', null)).toBe('tag'); // Empty is short
  });
});

describe('detectArrayType', () => {
  it('should handle empty arrays', () => {
    expect(detectArrayType([], null)).toBe('array');
  });

  it('should handle arrays of primitives', () => {
    expect(detectArrayType(['a', 'b', 'c'], null)).toBe('array');
  });
});

describe('detectObjectType', () => {
  it('should handle empty objects', () => {
    expect(detectObjectType({}, null)).toBe('object');
  });
});
