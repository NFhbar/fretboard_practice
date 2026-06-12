export const SCALES = {
  'C':  ['C','D','E','F','G','A','B'],
  'F':  ['F','G','A','B♭','C','D','E'],
  'Bb': ['B♭','C','D','E♭','F','G','A'],
  'Eb': ['E♭','F','G','A♭','B♭','C','D'],
  'Ab': ['A♭','B♭','C','D♭','E♭','F','G'],
  'Db': ['D♭','E♭','F','G♭','A♭','B♭','C'],
  'Gb': ['G♭','A♭','B♭','C♭','D♭','E♭','F'],
  'B':  ['B','C♯','D♯','E','F♯','G♯','A♯'],
  'E':  ['E','F♯','G♯','A','B','C♯','D♯'],
  'A':  ['A','B','C♯','D','E','F♯','G♯'],
  'D':  ['D','E','F♯','G','A','B','C♯'],
  'G':  ['G','A','B','C','D','E','F♯'],
};

// ── Harmonic Minor Scales (same key cycle) ──
export const HARM_MINOR_SCALES = {
  'C':  ['C','D','E♭','F','G','A♭','B'],
  'F':  ['F','G','A♭','B♭','C','D♭','E'],
  'Bb': ['B♭','C','D♭','E♭','F','G♭','A'],
  'Eb': ['E♭','F','G♭','A♭','B♭','C♭','D'],
  'Ab': ['A♭','B♭','C♭','D♭','E♭','F♭','G'],
  'Db': ['D♭','E♭','F♭','G♭','A♭','A','C'],
  'Gb': ['G♭','A♭','A','C♭','D♭','D','F'],
  'B':  ['B','C♯','D','E','F♯','G','A♯'],
  'E':  ['E','F♯','G','A','B','C','D♯'],
  'A':  ['A','B','C','D','E','F','G♯'],
  'D':  ['D','E','F','G','A','B♭','C♯'],
  'G':  ['G','A','B♭','C','D','E♭','F♯'],
};

export const DIATONIC = [
  { roman: 'I',    quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'ii',   quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'iii',  quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'IV',   quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'V',    quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'vi',   quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'vii°', quality: 'dim',  suffix: 'dim', intervals: '1 – ♭3 – ♭5' },
];

// Diatonic 7th chords: Imaj7, IIm7, IIIm7, IVmaj7, V7, VIm7, VIIm7♭5
export const DIATONIC_7TH = [
  { roman: 'Imaj7',    quality: 'maj7',   suffix: 'maj7',  intervals: '1 – 3 – 5 – 7' },
  { roman: 'IIm7',     quality: 'm7',     suffix: 'm7',    intervals: '1 – ♭3 – 5 – ♭7' },
  { roman: 'IIIm7',    quality: 'm7',     suffix: 'm7',    intervals: '1 – ♭3 – 5 – ♭7' },
  { roman: 'IVmaj7',   quality: 'maj7',   suffix: 'maj7',  intervals: '1 – 3 – 5 – 7' },
  { roman: 'V7',       quality: 'dom7',   suffix: '7',     intervals: '1 – 3 – 5 – ♭7' },
  { roman: 'VIm7',     quality: 'm7',     suffix: 'm7',    intervals: '1 – ♭3 – 5 – ♭7' },
  { roman: 'VIIm7♭5',  quality: 'm7b5',   suffix: 'm7♭5',  intervals: '1 – ♭3 – ♭5 – ♭7' },
];

// Harmonic minor diatonic triads: i, ii°, III+, iv, V, VI, vii°
export const HARM_MINOR_DIATONIC = [
  { roman: 'i',     quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'ii°',   quality: 'dim',  suffix: 'dim', intervals: '1 – ♭3 – ♭5' },
  { roman: 'III+',  quality: 'aug',  suffix: 'aug', intervals: '1 – 3 – ♯5' },
  { roman: 'iv',    quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'V',     quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'VI',    quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'vii°',  quality: 'dim',  suffix: 'dim', intervals: '1 – ♭3 – ♭5' },
];

// Harmonic minor diatonic 7ths: imMaj7, iim7♭5, IIImaj7♯5, ivm7, V7, VImaj7, vii°7
export const HARM_MINOR_DIATONIC_7TH = [
  { roman: 'imMaj7',     quality: 'mMaj7',   suffix: 'mMaj7',  intervals: '1 – ♭3 – 5 – 7' },
  { roman: 'iim7♭5',     quality: 'm7b5',    suffix: 'm7♭5',   intervals: '1 – ♭3 – ♭5 – ♭7' },
  { roman: 'IIImaj7♯5',  quality: 'maj7#5',  suffix: 'maj7♯5', intervals: '1 – 3 – ♯5 – 7' },
  { roman: 'ivm7',       quality: 'm7',      suffix: 'm7',     intervals: '1 – ♭3 – 5 – ♭7' },
  { roman: 'V7',         quality: 'dom7',    suffix: '7',      intervals: '1 – 3 – 5 – ♭7' },
  { roman: 'VImaj7',     quality: 'maj7',    suffix: 'maj7',   intervals: '1 – 3 – 5 – 7' },
  { roman: 'vii°7',      quality: 'dim7',    suffix: 'dim7',   intervals: '1 – ♭3 – ♭5 – ♭♭7' },
];
