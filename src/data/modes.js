// Modes: parallel modes built on the same root
export const MODES = [
  { name: 'Ionian',     semitones: [0,2,4,5,7,9,11], numeral: ['I','ii','iii','IV','V','vi','vii°'] },
  { name: 'Dorian',     semitones: [0,2,3,5,7,9,10], numeral: ['i','ii','♭III','IV','v','vi°','♭VII'] },
  { name: 'Phrygian',   semitones: [0,1,3,5,7,8,10], numeral: ['i','♭II','♭III','iv','v°','♭VI','♭vii'] },
  { name: 'Lydian',     semitones: [0,2,4,6,7,9,11], numeral: ['I','II','iii','♯iv°','V','vi','vii'] },
  { name: 'Mixolydian', semitones: [0,2,4,5,7,9,10], numeral: ['I','ii','iii°','IV','v','vi','♭VII'] },
  { name: 'Aeolian',    semitones: [0,2,3,5,7,8,10], numeral: ['i','ii°','♭III','iv','v','♭VI','♭VII'] },
  { name: 'Locrian',    semitones: [0,1,3,5,6,8,10], numeral: ['i°','♭II','♭iii','iv','♭V','♭VI','♭vii'] },
];

// ── Harmonic Minor Modes ──
export const HM_MODES = [
  { name: 'Harmonic Minor',    semitones: [0,2,3,5,7,8,11], numeral: ['i','ii°','III+','iv','V','VI','vii°'] },
  { name: 'Locrian ♮6',        semitones: [0,1,3,5,6,9,10], numeral: ['i°','♭II','♭iii','iv','♭V','VI','♭vii'] },
  { name: 'Ionian ♯5',         semitones: [0,2,4,5,8,9,11], numeral: ['I','ii','iii','IV','♯V','vi','vii°'] },
  { name: 'Dorian ♯4',         semitones: [0,2,3,6,7,9,10], numeral: ['i','ii','♭III','♯IV','v','vi°','♭VII'] },
  { name: 'Phrygian Dominant', semitones: [0,1,4,5,7,8,10], numeral: ['I','♭II','iii°','iv','v','♭VI','♭vii'] },
  { name: 'Lydian ♯2',         semitones: [0,3,4,6,7,9,11], numeral: ['I','♯II','iii','♯iv°','V','vi','vii'] },
  { name: 'Ultra Locrian',    semitones: [0,1,3,4,6,8,9],  numeral: ['i°','♭ii','♭iii°','♭iv','♭V','♭VI','♭♭vii'] },
];

export const MODE_NAMES = ['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian'];
export const MODE_QUALITY = ['maj','min','min','maj','maj','min','dim'];
// Semitones from parent key root to mode root
export const MODE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];
// CAGED shape that each degree falls on (relative to parent key)
export const MODE_CAGED = ['C','A','G','E','D','C','A'];

// Harmonic minor mode names (each named as closest major mode + alteration)
export const HARM_MINOR_MODE_NAMES = [
  'Harmonic Minor',    // 1 — Aeolian ♮7
  'Locrian ♮6',        // 2
  'Ionian ♯5',         // 3
  'Dorian ♯4',         // 4
  'Phrygian Dominant',  // 5
  'Lydian ♯2',         // 6
  'Ultra Locrian',     // 7
];
export const HARM_MINOR_MODE_QUALITY = ['min','dim','aug','min','maj','maj','dim'];
export const HARM_MINOR_MODE_OFFSETS = [0, 2, 3, 5, 7, 8, 11];
