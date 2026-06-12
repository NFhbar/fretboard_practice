import { CHROMATIC, CHROMATIC_FLAT, OPEN_STRINGS, fretNote, noteToChromatic, normalizeKey } from '../data/notes.js';
import { TRIAD_COLORS } from '../data/colors.js';
import { INTERVALS } from '../data/intervals.js';
import { CAGED_SHAPES } from '../data/cagedShapes.js';
import { CAGED_NAMES, getVariants } from '../data/cagedMeta.js';
import { getScaleFor, getTriadsFor, getSeventhsFor } from './diatonic.js';

// layers: { scale: bool, chord: { mode: 'triads'|'7ths', degrees: [0..6] } | null, intervals: bool }
// Returns Fretboard markers. Precedence per cell: chord degree > interval-from-root > muted scale dot.
export function buildNoteMap(key, track, layers, { labelMode = 'intervals', useFlats = false, fretCount = 24 } = {}) {
  const scale = getScaleFor(track, key) || [];
  const scalePcs = scale.map((n) => noteToChromatic(n));
  const pcName = {};
  scalePcs.forEach((pc, i) => {
    pcName[pc] = scale[i];
  });
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  const rootPc = noteToChromatic(normalizeKey(key));

  const chords =
    layers.chord && layers.chord.degrees.length > 0
      ? (layers.chord.mode === '7ths' ? getSeventhsFor(track, key) : getTriadsFor(track, key))
      : null;
  const withSeventh = layers.chord?.mode === '7ths';

  const markers = [];
  for (let si = 0; si < 6; si++) {
    for (let f = 0; f <= fretCount; f++) {
      const pc = CHROMATIC.indexOf(fretNote(si, f));
      const inScale = scalePcs.includes(pc);
      const noteLabel = pcName[pc] || noteSet[pc];

      // 1) chord layer
      let made = null;
      if (chords) {
        for (const di of layers.chord.degrees) {
          const c = chords[di];
          if (!c) continue;
          let interval = null;
          if (pc === c.rootC) interval = 'R';
          else if (pc === c.thirdC) interval = c.intervals.includes('♭3') ? '♭3' : 'Δ3';
          else if (pc === c.fifthC) interval = c.intervals.includes('♭5') ? '♭5' : c.intervals.includes('♯5') ? '♯5' : 'p5';
          else if (withSeventh && pc === c.seventhC) interval = c.intervals.includes('♭♭7') ? '°7' : c.intervals.includes('♭7') ? '♭7' : 'Δ7';
          if (interval) {
            made = {
              string: 6 - si,
              fret: f,
              label: labelMode === 'notes' ? noteLabel : interval,
              color: TRIAD_COLORS[di],
              isRoot: interval === 'R',
              state: 'active',
            };
            break;
          }
        }
      }
      // 2) intervals-from-root layer
      if (!made && layers.intervals && inScale) {
        const semis = (pc - rootPc + 12) % 12;
        const iv = INTERVALS.find((x) => x.semitones === semis);
        if (iv) {
          made = {
            string: 6 - si,
            fret: f,
            label: labelMode === 'notes' ? noteLabel : iv.name,
            sub: labelMode === 'notes' ? undefined : undefined,
            color: iv.color,
            isRoot: semis === 0,
            state: 'active',
          };
        }
      }
      // 3) plain scale dot
      if (!made && layers.scale && inScale) {
        made = {
          string: 6 - si,
          fret: f,
          label: noteLabel,
          color: pc === rootPc ? '#c9963a' : '#8a8480',
          isRoot: pc === rootPc,
          state: 'faded',
        };
      }
      if (made) markers.push(made);
    }
  }
  return markers;
}

// Shaded fret-range bands showing where each CAGED position sits for the key.
// Templates are movable shapes drawn at arbitrary card positions, so each band is
// anchored by the template's OWN root dot: shifting by the pitch-class difference
// between the key root and the drawn root cancels the drawing position exactly.
export function buildCagedBands(key, shapes, { fretCount = 24 } = {}) {
  const rootPc = noteToChromatic(normalizeKey(key));
  const list = shapes === 'all' ? CAGED_NAMES : [shapes];
  const bands = [];
  for (const shape of list) {
    const data = CAGED_SHAPES.Major?.[shape]?.scale;
    if (!data) continue;
    const dots = getVariants(data)[0];
    if (!dots || dots.length === 0) continue;
    const rootDot = dots.find((d) => d.r);
    if (!rootDot) continue;
    const templatePc = (OPEN_STRINGS[6 - rootDot.s] + rootDot.f) % 12;
    const frets = dots.map((d) => d.f);
    const offset = (rootPc - templatePc + 12) % 12;
    for (const shift of [offset - 12, offset, offset + 12, offset + 24]) {
      const minFret = Math.min(...frets) + shift;
      const maxFret = Math.max(...frets) + shift;
      if (maxFret < 0 || minFret > fretCount) continue;
      bands.push({ shape, minFret: Math.max(0, minFret), maxFret: Math.min(fretCount, maxFret) });
    }
  }
  return bands;
}

// Exact note positions of one CAGED form for the key — the template's scale dots
// shifted by the same root-dot anchoring as the bands, repeated each octave.
// Returns a Set of "string:fret" keys (string 1=high E .. 6=low E).
export function cagedShapePositions(key, shape, { fretCount = 24 } = {}) {
  const rootPc = noteToChromatic(normalizeKey(key));
  const data = CAGED_SHAPES.Major?.[shape]?.scale;
  if (!data) return new Set();
  const dots = getVariants(data)[0];
  if (!dots || dots.length === 0) return new Set();
  const rootDot = dots.find((d) => d.r);
  if (!rootDot) return new Set();
  const templatePc = (OPEN_STRINGS[6 - rootDot.s] + rootDot.f) % 12;
  const offset = (rootPc - templatePc + 12) % 12;
  const positions = new Set();
  for (const shift of [offset - 12, offset, offset + 12, offset + 24]) {
    for (const d of dots) {
      const f = d.f + shift;
      if (f >= 0 && f <= fretCount) positions.add(`${d.s}:${f}`);
    }
  }
  return positions;
}

// Info for the tap sheet: which diatonic chords contain this pitch class.
export function chordsContaining(pc, key, track) {
  const triads = getTriadsFor(track, key);
  const sevenths = getSeventhsFor(track, key);
  const inTriads = triads.filter((c) => [c.rootC, c.thirdC, c.fifthC].includes(pc)).map((c) => c.chordName);
  const inSevenths = sevenths.filter((c) => [c.rootC, c.thirdC, c.fifthC, c.seventhC].includes(pc)).map((c) => c.chordName);
  return { triads: inTriads, sevenths: inSevenths };
}
