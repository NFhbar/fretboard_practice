import {
  SCALES,
  HARM_MINOR_SCALES,
  MELODIC_MINOR_SCALES,
  DIATONIC,
  DIATONIC_7TH,
  HARM_MINOR_DIATONIC,
  HARM_MINOR_DIATONIC_7TH,
  MELODIC_MINOR_DIATONIC,
  MELODIC_MINOR_DIATONIC_7TH,
} from './scales.js';
import {
  MODES,
  HM_MODES,
  MM_MODES,
  MODE_NAMES,
  MODE_QUALITY,
  MODE_OFFSETS,
  HARM_MINOR_MODE_NAMES,
  HARM_MINOR_MODE_QUALITY,
  HARM_MINOR_MODE_OFFSETS,
  MELODIC_MINOR_MODE_NAMES,
  MELODIC_MINOR_MODE_QUALITY,
  MELODIC_MINOR_MODE_OFFSETS,
} from './modes.js';

// Practice tracks (settings.track). Track-aware views read labels and theory tables
// from here instead of branching on the track id; only genuinely major-only features
// (CAGED bands, which are major-scale templates) check for 'major' directly.
// Weekly schedules are keyed by the same ids in scheduleMerged.js.
export const TRACKS = {
  major: {
    id: 'major',
    name: 'Major', // "C Major"
    short: 'Major', // compact badges
    lower: 'major', // inline prose: "use F major shapes"
    abbr: '', // tool-title prefix: "HM Modal Interchange"
    toggleLabel: 'Major Modes',
    harmonyTitle: 'Diatonic', // "Diatonic Triads"
    scales: SCALES,
    triads: DIATONIC,
    sevenths: DIATONIC_7TH,
    modes: MODES, // parallel modes with numerals (Modal Interchange)
    modeNames: MODE_NAMES,
    modeQuality: MODE_QUALITY,
    modeOffsets: MODE_OFFSETS,
  },
  'harmonic-minor': {
    id: 'harmonic-minor',
    name: 'Harmonic Minor',
    short: 'Harm. Minor',
    lower: 'harm. minor',
    abbr: 'HM',
    toggleLabel: 'Harmonic Minor',
    harmonyTitle: 'Harmonic Minor',
    scales: HARM_MINOR_SCALES,
    triads: HARM_MINOR_DIATONIC,
    sevenths: HARM_MINOR_DIATONIC_7TH,
    modes: HM_MODES,
    modeNames: HARM_MINOR_MODE_NAMES,
    modeQuality: HARM_MINOR_MODE_QUALITY,
    modeOffsets: HARM_MINOR_MODE_OFFSETS,
  },
  'melodic-minor': {
    id: 'melodic-minor',
    name: 'Melodic Minor',
    short: 'Mel. Minor',
    lower: 'mel. minor',
    abbr: 'MM',
    toggleLabel: 'Melodic Minor',
    harmonyTitle: 'Melodic Minor',
    scales: MELODIC_MINOR_SCALES,
    triads: MELODIC_MINOR_DIATONIC,
    sevenths: MELODIC_MINOR_DIATONIC_7TH,
    modes: MM_MODES,
    modeNames: MELODIC_MINOR_MODE_NAMES,
    modeQuality: MELODIC_MINOR_MODE_QUALITY,
    modeOffsets: MELODIC_MINOR_MODE_OFFSETS,
  },
};

export const TRACK_IDS = Object.keys(TRACKS);

export function getTrack(id) {
  return TRACKS[id] || TRACKS.major;
}
