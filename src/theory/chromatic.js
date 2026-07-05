import { OPEN_STRINGS, noteToChromatic } from '../data/notes.js';
import { getScaleFor, getTriadsFor, getSeventhsFor } from './diatonic.js';
import { cagedShapePositions } from './noteMap.js';

// Chromaticism cells: target notes decorated with chromatic approaches (±1 fret),
// diatonic neighbors (adjacent scale tone on the SAME string — middle-finger friendly),
// and enclosure combinations. Targets always land on the beat; ornaments are pickups.

export function pcAt(stringNum, fret) {
  return (OPEN_STRINGS[6 - stringNum] + fret) % 12;
}

function scalePcSet(key, track) {
  return new Set((getScaleFor(track, key) || []).map((n) => noteToChromatic(n)));
}

// Scale-tone target frets on one string. minFret 1 keeps the below-approach on the neck.
export function scaleTargetsOnString(key, track, stringNum, { minFret = 1, maxFret = 12 } = {}) {
  const pcs = scalePcSet(key, track);
  const out = [];
  for (let f = minFret; f <= maxFret; f++) {
    if (pcs.has(pcAt(stringNum, f))) out.push({ string: stringNum, fret: f });
  }
  return out;
}

// Adjacent scale tone on the same string (1-3 semitones covers the HM augmented 2nd).
export function neighborFret(key, track, stringNum, fret, dir) {
  const pcs = scalePcSet(key, track);
  for (let d = 1; d <= 3; d++) {
    const f = fret + dir * d;
    if (f >= 0 && f <= 24 && pcs.has(pcAt(stringNum, f))) return f;
  }
  return null;
}

export const DEVICES = [
  { id: 'approach', label: 'Approach', name: 'Chromatic approach', subdivision: 'eighth', notesPerBeat: 2 },
  { id: 'neighbor', label: 'Neighbor', name: 'Diatonic neighbor', subdivision: 'eighth', notesPerBeat: 2 },
  { id: 'enc3', label: 'Enclosure 3', name: '3-note enclosure (triplets)', subdivision: 'triplet', notesPerBeat: 3 },
  { id: 'enc4', label: 'Enclosure 4', name: '4-note enclosure (16ths)', subdivision: 'sixteenth', notesPerBeat: 4 },
  { id: 'bebop', label: 'Bebop', name: 'Bebop enclosures', subdivision: 'sixteenth', notesPerBeat: 4 },
];

export const BEBOP_FORMULAS = [
  { id: 'below2', label: 'Double chromatic below', ticks: 3, subdivision: 'triplet' },
  { id: 'above2', label: 'Double chromatic above', ticks: 3, subdivision: 'triplet' },
  { id: 'classic4', label: 'Diatonic above + chromatic pair', ticks: 4, subdivision: 'sixteenth' },
  { id: 'surround', label: 'Surround + chromatic below', ticks: 4, subdivision: 'sixteenth' },
];

// Ornament notes played BEFORE the target (in play order), for one target.
// dir: +1 during an ascending run, -1 descending. The mirror keeps enclosure
// cells from re-striking the previous target when running down.
// variant: for approach/neighbor, 'below' | 'above' overrides the run default.
export function ornamentsFor(device, { key, track, string, fret, dir = 1, variant = null, formula = 'below2' }) {
  const approachBelow = fret - 1 >= 0 ? fret - 1 : null;
  const approachAbove = fret + 1 <= 24 ? fret + 1 : null;
  const nbUp = neighborFret(key, track, string, fret, +1);
  const nbDown = neighborFret(key, track, string, fret, -1);
  const pick = (a, b) => (dir > 0 ? a : b);

  switch (device) {
    case 'approach': {
      const side = variant || (dir > 0 ? 'below' : 'above');
      const f = side === 'below' ? approachBelow : approachAbove;
      return f === null ? [] : [{ string, fret: f, role: 'approach' }];
    }
    case 'neighbor': {
      const side = variant || (dir > 0 ? 'above' : 'below');
      const f = side === 'above' ? nbUp : nbDown;
      return f === null ? [] : [{ string, fret: f, role: 'neighbor' }];
    }
    case 'enc3': {
      const n = pick(nbUp, nbDown);
      const a = pick(approachBelow, approachAbove);
      if (n === null || a === null) return [];
      return [
        { string, fret: n, role: 'neighbor' },
        { string, fret: a, role: 'approach' },
      ];
    }
    case 'enc4': {
      const n = pick(nbUp, nbDown);
      const a = pick(approachBelow, approachAbove);
      if (n === null || a === null) return [];
      return [
        { string, fret: n, role: 'neighbor' },
        { string, fret, role: 'early' }, // the target on the off-beat, passing through
        { string, fret: a, role: 'approach' },
      ];
    }
    case 'bebop': {
      switch (formula) {
        case 'below2':
          return fret - 2 < 0
            ? []
            : [
                { string, fret: fret - 2, role: 'approach' },
                { string, fret: fret - 1, role: 'approach' },
              ];
        case 'above2':
          return [
            { string, fret: fret + 2, role: 'approach' },
            { string, fret: fret + 1, role: 'approach' },
          ];
        case 'classic4': {
          if (nbUp === null || fret - 1 < 0) return [];
          return [
            { string, fret: nbUp, role: 'neighbor' },
            { string, fret: fret + 1, role: 'approach' },
            { string, fret: fret - 1, role: 'approach' },
          ];
        }
        case 'surround': {
          if (nbUp === null || nbDown === null || fret - 1 < 0) return [];
          return [
            { string, fret: nbUp, role: 'neighbor' },
            { string, fret: nbDown, role: 'neighbor' },
            { string, fret: fret - 1, role: 'approach' },
          ];
        }
        default:
          return [];
      }
    }
    default:
      return [];
  }
}

// ---- Arpeggio targets ----

const ROLE_BY_TONE = ['R', '3', '5', '7'];

function toneRoles(tones) {
  const map = {};
  [tones.rootC, tones.thirdC, tones.fifthC, tones.seventhC].forEach((pc, i) => {
    if (pc !== undefined && pc !== null) map[pc] = ROLE_BY_TONE[i];
  });
  return map;
}

// Chord-tone targets inside one CAGED form for the key: intersect the form's
// note positions with the chord's pitch classes. Works for any quality
// (incl. mMaj7 / HM chords) since it's pc-based, not template-based.
export function cagedArpTargets(key, shape, tones, { targetRoles = null, window = null } = {}) {
  const roles = toneRoles(tones);
  const targets = [];
  for (const pos of cagedShapePositions(key, shape)) {
    const [s, f] = pos.split(':').map(Number);
    if (f < 1) continue; // keep the below-approach on the neck
    if (window && (f < window[0] || f > window[1])) continue;
    const role = roles[pcAt(s, f)];
    if (!role) continue;
    if (targetRoles && !targetRoles.includes(role)) continue;
    targets.push({ string: s, fret: f, role });
  }
  return targets.sort((a, b) => midiOf(a) - midiOf(b));
}

// Full-neck chord-tone targets (for diatonic-degree arpeggio practice, position-free).
export function fullNeckArpTargets(key, track, tones, { minFret = 1, maxFret = 12, targetRoles = null } = {}) {
  const roles = toneRoles(tones);
  const targets = [];
  for (let s = 1; s <= 6; s++) {
    for (let f = minFret; f <= maxFret; f++) {
      const role = roles[pcAt(s, f)];
      if (!role) continue;
      if (targetRoles && !targetRoles.includes(role)) continue;
      targets.push({ string: s, fret: f, role });
    }
  }
  return targets.sort((a, b) => midiOf(a) - midiOf(b));
}

export function degreeTones(key, track, degree, use7th) {
  const items = use7th ? getSeventhsFor(track, key) : getTriadsFor(track, key);
  return items[degree] || null;
}

export function midiOf(t) {
  return { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 }[t.string] + t.fret;
}

// ---- Playback timeline ----
// One target per beat, ornaments as pickups on the preceding beat's sub-slots.
// Returns tick slots (subdivision per beat), each null or { string, fret, role, targetIdx }.
export function buildTimeline(targets, device, opts = {}) {
  const dev = DEVICES.find((d) => d.id === device) || DEVICES[0];
  const formula = opts.formula || 'below2';
  const perBeat =
    device === 'bebop'
      ? (BEBOP_FORMULAS.find((f) => f.id === formula)?.ticks ?? 3)
      : dev.notesPerBeat;
  const subdivisionId =
    device === 'bebop'
      ? (BEBOP_FORMULAS.find((f) => f.id === formula)?.subdivision ?? 'triplet')
      : dev.subdivision;

  const dir = opts.dir ?? 1;
  const ordered = dir > 0 ? targets : [...targets].reverse();
  const ticks = [];

  const ornFor = (t) =>
    t ? ornamentsFor(device, { ...opts, string: t.string, fret: t.fret, dir, formula }) : [];
  const pushPickups = (nextTarget, nextIdx) => {
    const orn = ornFor(nextTarget);
    for (let s = 1; s < perBeat; s++) {
      const oIdx = s - (perBeat - orn.length); // right-align pickups against the next beat
      ticks.push(oIdx >= 0 && orn[oIdx] ? { ...orn[oIdx], targetIdx: nextIdx } : null);
    }
  };

  // count-in beat: rest on the click, then the FIRST target's pickups lead in
  ticks.push(null);
  pushPickups(ordered[0], 0);

  ordered.forEach((t, idx) => {
    ticks.push({ ...t, role: 'target', targetIdx: idx }); // target on the beat
    pushPickups(ordered[idx + 1], idx + 1); // next target's ornaments fill this beat's tail
  });

  return { ticks, perBeat, subdivisionId };
}
