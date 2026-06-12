export const CAGED_NAMES = ['C', 'A', 'G', 'E', 'D'];
export const CATEGORIES = ['chord', 'arpeggio', 'pentatonic', 'scale'];
export const QUALITY_TABS = ['Major', 'Minor', 'Diminished', 'Augmented', 'Sus4', 'Sus2', 'Maj7', 'Maj7 Shell', 'Min7', 'Dom7', 'Min7♭5', 'Dim7'];
export const QUALITY_INFO = {
  Major: { formula: '1  2  3  4  5  6  7', mode: 'Ionian' },
  Minor: { formula: '1  2  ♭3  4  5  ♭6  ♭7', mode: 'Aeolian' },
  Diminished: { formula: '1  ♭2  ♭3  4  ♭5  ♭6  ♭7', mode: 'Locrian' },
  Augmented: { formula: '1  2  3  4  #5  6  7', mode: 'Ionian #5' },
  Sus4: { formula: '1  2  4  5  6  ♭7', mode: 'Mixolydian (no 3)' },
  Sus2: { formula: '1  2  4  5  6  ♭7', mode: 'Mixolydian (no 3)' },
  Maj7: { formula: '1  2  3  4  5  6  7', mode: 'Ionian' },
  'Maj7 Shell': { formula: 'R  Δ3  Δ7', mode: 'Shell Voicing (omit p5)' },
  Min7: { formula: '1  2  ♭3  4  5  ♭6  ♭7', mode: 'Aeolian' },
  Dom7: { formula: '1  2  3  4  5  6  ♭7', mode: 'Mixolydian' },
  'Min7♭5': { formula: '1  ♭2  ♭3  4  ♭5  ♭6  ♭7', mode: 'Locrian' },
  Dim7: { formula: '1  2  ♭3  4  ♭5  ♭6  ♭♭7', mode: 'Whole-Half Diminished' },
};
export const CATEGORY_LABELS = {
  Major: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Major Scale' },
  Minor: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Minor Scale' },
  Diminished: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Locrian' },
  Augmented: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Scale' },
  Sus4: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Scale' },
  Sus2: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Scale' },
  Maj7: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Major Scale' },
  'Maj7 Shell': { chord: 'Shell Voicing' },
  Min7: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Minor Scale' },
  Dom7: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Mixolydian' },
  'Min7♭5': { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Locrian' },
  Dim7: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Whole-Half Dim' },
};

// Each dot: { s: string (1=high E, 6=low E), f: fret (1-6), i: interval label, r: is root }
// Variants: a category can be a single array of dots (one shape) or an array of arrays (multiple shapes)
export const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
export function getVariants(shapeData) {
  if (!shapeData || shapeData.length === 0) return [[]];
  if (Array.isArray(shapeData[0])) return shapeData;
  return [shapeData];
}

export const QUALITY_SUFFIX = {
  Major: '', Minor: 'm', Diminished: 'dim', Augmented: 'aug', Sus4: 'sus4', Sus2: 'sus2',
  Maj7: 'maj7', 'Maj7 Shell': 'maj7', Min7: 'm7', Dom7: '7', 'Min7♭5': 'm7♭5', Dim7: '°7',
};
