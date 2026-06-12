import { noteToChromatic } from '../data/notes.js';
import {
  SCALES,
  HARM_MINOR_SCALES,
  DIATONIC,
  DIATONIC_7TH,
  HARM_MINOR_DIATONIC,
  HARM_MINOR_DIATONIC_7TH,
} from '../data/scales.js';

function buildChords(scale, defs, withSeventh) {
  if (!scale) return [];
  const scaleChrom = scale.map((n) => noteToChromatic(n));
  return defs.map((d, i) => {
    const root = scale[i];
    const third = scale[(i + 2) % 7];
    const fifth = scale[(i + 4) % 7];
    const base = {
      ...d,
      root,
      third,
      fifth,
      rootC: scaleChrom[i],
      thirdC: scaleChrom[(i + 2) % 7],
      fifthC: scaleChrom[(i + 4) % 7],
      degree: i,
      chordName: root + d.suffix,
    };
    if (!withSeventh) return base;
    return {
      ...base,
      seventh: scale[(i + 6) % 7],
      seventhC: scaleChrom[(i + 6) % 7],
    };
  });
}

export function getDiatonicTriads(key) {
  return buildChords(SCALES[key], DIATONIC, false);
}

export function getDiatonic7ths(key) {
  return buildChords(SCALES[key], DIATONIC_7TH, true);
}

export function getHarmMinorTriads(key) {
  return buildChords(HARM_MINOR_SCALES[key], HARM_MINOR_DIATONIC, false);
}

export function getHarmMinor7ths(key) {
  return buildChords(HARM_MINOR_SCALES[key], HARM_MINOR_DIATONIC_7TH, true);
}

// Track-aware conveniences used across pages
export function getTriadsFor(track, key) {
  return track === 'major' ? getDiatonicTriads(key) : getHarmMinorTriads(key);
}

export function getSeventhsFor(track, key) {
  return track === 'major' ? getDiatonic7ths(key) : getHarmMinor7ths(key);
}

export function getScaleFor(track, key) {
  return (track === 'major' ? SCALES : HARM_MINOR_SCALES)[key];
}
