import { CHROMATIC, CHROMATIC_FLAT, noteToChromatic, normalizeKey } from '../data/notes.js';
import { getTrack } from '../data/tracks.js';

const DEGREES = ['I','II','III','IV','V','VI','VII'];

function table(track) {
  const t = getTrack(track);
  return { names: t.modeNames, quality: t.modeQuality, offsets: t.modeOffsets };
}

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

// Each mode of `rootKey` and the parent key whose shapes it borrows.
export function getModesForRoot(track, rootKey, useFlats = false) {
  return buildModesForRoot(table(track), rootKey, useFlats);
}
// The 7 modes that share `parentKey`'s shapes.
export function getModeFamily(track, parentKey, useFlats = false) {
  return buildFamily(table(track), parentKey, useFlats);
}
// Mode × root grid, each cell tagged with its parent key.
export function getModeMatrix(track, useFlats = false) {
  return buildMatrix(table(track), useFlats);
}
