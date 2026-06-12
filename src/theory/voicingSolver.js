import { OPEN_STRINGS } from '../data/notes.js';
import { QUALITY_INTERVALS } from './qualities.js';

// String numbers: 6 = low E .. 1 = high E. OPEN_STRINGS is indexed 0=string6.
function openPitch(stringNum) {
  // absolute-ish pitch in semitones for ordering: octave-correct open string values from E2=40
  return { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 }[stringNum];
}
function pitchClassAt(stringNum, fret) {
  return (OPEN_STRINGS[6 - stringNum] + fret) % 12;
}

// Order chord tones for an inversion: inversion k puts tone k in the bass, others stack in order.
function inversionOrder(pcs, inversion) {
  const n = pcs.length;
  const out = [];
  for (let i = 0; i < n; i++) out.push(pcs[(inversion + i) % n]);
  return out;
}

// Drop-2: take close voicing (bass..top), drop the 2nd-from-top voice to the bottom.
function drop2(order) {
  const n = order.length;
  const second = order[n - 2];
  return [second, ...order.filter((_, i) => i !== n - 2)];
}

// Solve a voicing across a contiguous string set with strictly ascending pitches and minimal span.
// stringSet: array of string numbers low->high, e.g. [5,4,3] for "strings 5-4-3".
// Returns { dots: [{s, f, i, r}], span } or null.
export function solveVoicing(rootC, quality, inversion, stringSet, { maxFret = 24, intervalLabels } = {}) {
  const ivs = QUALITY_INTERVALS[quality];
  if (!ivs || stringSet.length !== ivs.length) return null;
  const pcs = ivs.map((x) => (rootC + x) % 12);
  // 4-note chords on 4 adjacent strings render as drop-2 (the playable standard).
  // Drop-2 of close-inversion k puts tone (k+2)%4 in the bass, so to land the
  // requested inversion tone in the bass we offset by 2 before dropping.
  let order;
  if (ivs.length === 4) {
    order = drop2(inversionOrder(pcs, (inversion + 2) % 4));
  } else {
    order = inversionOrder(pcs, inversion);
  }

  const labels = intervalLabels || defaultLabels(ivs);
  const labelByPc = {};
  pcs.forEach((pc, i) => {
    labelByPc[pc] = labels[i];
  });

  let best = null;
  // try every fret for the bass note, pick min-span solution
  const bassString = stringSet[0];
  for (let bf = 0; bf <= maxFret; bf++) {
    if (pitchClassAt(bassString, bf) !== order[0]) continue;
    const frets = [bf];
    let prevPitch = openPitch(bassString) + bf;
    let ok = true;
    for (let i = 1; i < stringSet.length; i++) {
      const s = stringSet[i];
      let found = -1;
      for (let f = 0; f <= maxFret; f++) {
        if (pitchClassAt(s, f) !== order[i]) continue;
        const pitch = openPitch(s) + f;
        if (pitch > prevPitch) {
          found = f;
          prevPitch = pitch;
          break;
        }
      }
      if (found < 0) {
        ok = false;
        break;
      }
      frets.push(found);
    }
    if (!ok) continue;
    const fretted = frets.filter((f) => f > 0);
    const span = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
    const maxF = Math.max(...frets);
    if (!best || span < best.span || (span === best.span && maxF < best.maxF)) {
      best = { frets: [...frets], span, maxF };
    }
  }
  if (!best) return null;
  return {
    span: best.span,
    dots: stringSet.map((s, i) => ({
      s,
      f: best.frets[i],
      i: labelByPc[pitchClassAt(s, best.frets[i])],
      r: pitchClassAt(s, best.frets[i]) === pcs[0],
    })),
  };
}

function defaultLabels(ivs) {
  const MAP = {
    0: 'R', 1: '♭2', 2: '2', 3: '♭3', 4: 'Δ3', 5: 'p4', 6: '♭5', 7: 'p5', 8: '♯5', 9: '6', 10: '♭7', 11: 'Δ7',
  };
  // dim7 doubly-flat 7 special case
  return ivs.map((x, i) => (x === 9 && ivs.length === 4 && i === 3 ? '°7' : MAP[x]));
}

// Normalize solved dots into a 6-fret window for the card diagram; returns { dots, baseFret }.
export function toCardWindow(dots) {
  const fretted = dots.filter((d) => d.f > 0).map((d) => d.f);
  if (fretted.length === 0) return { dots, baseFret: 0 };
  const min = Math.min(...fretted);
  const max = Math.max(...fretted);
  if (max <= 6) return { dots, baseFret: 0 };
  const base = min - 1;
  return { dots: dots.map((d) => ({ ...d, f: d.f === 0 ? 0 : d.f - base })), baseFret: base };
}
