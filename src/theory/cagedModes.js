import { CHROMATIC, CHROMATIC_FLAT, noteToChromatic, normalizeKey } from '../data/notes.js';
import {
  MODE_NAMES,
  MODE_QUALITY,
  MODE_OFFSETS,
  HARM_MINOR_MODE_NAMES,
  HARM_MINOR_MODE_QUALITY,
  HARM_MINOR_MODE_OFFSETS,
} from '../data/modes.js';

const DEGREES = ['I','II','III','IV','V','VI','VII'];

const TABLES = {
  major: { names: MODE_NAMES, quality: MODE_QUALITY, offsets: MODE_OFFSETS },
  'harmonic-minor': {
    names: HARM_MINOR_MODE_NAMES,
    quality: HARM_MINOR_MODE_QUALITY,
    offsets: HARM_MINOR_MODE_OFFSETS,
  },
};

function buildModesForRoot({ names, quality, offsets }, rootKey, useFlats) {
  const rootC = noteToChromatic(normalizeKey(rootKey));
  if (rootC < 0) return [];
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  return names.map((mode, i) => ({
    mode,
    quality: quality[i],
    root: noteSet[rootC],
    parentKey: noteSet[((rootC - offsets[i]) + 12) % 12],
  }));
}

function buildFamily({ names, quality, offsets }, parentKey, useFlats) {
  const parentC = noteToChromatic(normalizeKey(parentKey));
  if (parentC < 0) return [];
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  return names.map((mode, i) => ({
    mode,
    quality: quality[i],
    note: noteSet[(parentC + offsets[i]) % 12],
    degree: DEGREES[i],
  }));
}

function buildMatrix({ names, quality, offsets }, useFlats) {
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  return names.map((mode, mi) => ({
    mode,
    quality: quality[mi],
    cells: noteSet.map((note, ni) => {
      const parentC = ((ni - offsets[mi]) + 12) % 12;
      return { note, mode, quality: quality[mi], parentIdx: parentC, parentKey: noteSet[parentC] };
    }),
  }));
}

export function getCagedModesForRoot(rootKey, useFlats = false) {
  return buildModesForRoot(TABLES.major, rootKey, useFlats);
}
export function getCagedFamily(parentKey, useFlats = false) {
  return buildFamily(TABLES.major, parentKey, useFlats);
}
export function getModesMatrix(useFlats = false) {
  return buildMatrix(TABLES.major, useFlats);
}
export function getHmCagedModesForRoot(rootKey, useFlats = false) {
  return buildModesForRoot(TABLES['harmonic-minor'], rootKey, useFlats);
}
export function getHmCagedFamily(parentKey, useFlats = false) {
  return buildFamily(TABLES['harmonic-minor'], parentKey, useFlats);
}
export function getHmModesMatrix(useFlats = false) {
  return buildMatrix(TABLES['harmonic-minor'], useFlats);
}
