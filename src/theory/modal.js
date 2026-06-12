import { CHROMATIC, CHROMATIC_FLAT, noteToChromatic, normalizeKey } from '../data/notes.js';
import { MODES, HM_MODES } from '../data/modes.js';

function triadQuality(i3, i5) {
  if (i3 === 4 && i5 === 7) return { quality: 'maj', suffix: '' };
  if (i3 === 3 && i5 === 7) return { quality: 'min', suffix: 'm' };
  if (i3 === 3 && i5 === 6) return { quality: 'dim', suffix: '°' };
  if (i3 === 4 && i5 === 8) return { quality: 'aug', suffix: '+' };
  return { quality: 'maj', suffix: '' };
}

function seventhQuality(i3, i5, i7) {
  if (i3 === 4 && i5 === 7 && i7 === 11) return { quality: 'maj7', suffix: 'maj7' };
  if (i3 === 3 && i5 === 7 && i7 === 10) return { quality: 'min7', suffix: 'm7' };
  if (i3 === 4 && i5 === 7 && i7 === 10) return { quality: 'dom7', suffix: '7' };
  if (i3 === 3 && i5 === 6 && i7 === 10) return { quality: 'm7b5', suffix: 'm7♭5' };
  if (i3 === 3 && i5 === 6 && i7 === 9) return { quality: 'dim7', suffix: '°7' };
  if (i3 === 4 && i5 === 8 && i7 === 11) return { quality: 'augmaj7', suffix: '+maj7' };
  if (i3 === 3 && i5 === 7 && i7 === 11) return { quality: 'mmaj7', suffix: 'mMaj7' };
  if (i3 === 4 && i5 === 8 && i7 === 10) return { quality: 'aug7', suffix: '+7' };
  return { quality: 'maj7', suffix: 'maj7' };
}

// Modal interchange table for any mode set (major MODES or HM_MODES).
// First mode's chords are "home"; everything else not in that set is borrowed.
function buildModalChords(modeTable, rootKey, use7ths = false, useFlats = false) {
  const rootC = noteToChromatic(normalizeKey(rootKey));
  if (rootC < 0) return [];
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  const homeChords = new Set();

  return modeTable
    .map((mode, mi) => {
      const scaleNotes = mode.semitones.map((s) => noteSet[(rootC + s) % 12]);
      const chords = [];
      for (let d = 0; d < 7; d++) {
        const root = scaleNotes[d];
        const rootSemi = mode.semitones[d];
        const i3 = (mode.semitones[(d + 2) % 7] - rootSemi + 12) % 12;
        const i5 = (mode.semitones[(d + 4) % 7] - rootSemi + 12) % 12;
        let q;
        if (!use7ths) {
          q = triadQuality(i3, i5);
        } else {
          const i7 = (mode.semitones[(d + 6) % 7] - rootSemi + 12) % 12;
          q = seventhQuality(i3, i5, i7);
        }
        const chordName = root + q.suffix;
        if (mi === 0) homeChords.add(chordName);
        chords.push({ root, chordName, quality: q.quality, numeral: mode.numeral[d] });
      }
      return { ...mode, scaleNotes, chords };
    })
    .map((mode) => ({
      ...mode,
      chords: mode.chords.map((c) => ({ ...c, borrowed: !homeChords.has(c.chordName) })),
    }));
}

export function getModalChords(rootKey, use7ths = false, useFlats = false) {
  return buildModalChords(MODES, rootKey, use7ths, useFlats);
}

export function getHmModalChords(rootKey, use7ths = false, useFlats = false) {
  return buildModalChords(HM_MODES, rootKey, use7ths, useFlats);
}
