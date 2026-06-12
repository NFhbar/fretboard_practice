import { CHROMATIC, noteToChromatic, fretNote } from '../../data/notes.js';
import { INTERVALS } from '../../data/intervals.js';
import { getScaleFor } from '../../theory/diatonic.js';
import { QUALITY_INTERVALS } from '../../theory/qualities.js';
import { solveVoicing, toCardWindow } from '../../theory/voicingSolver.js';

export const TRIAD_QUALITIES = [
  { q: 'maj', name: 'Major', suffix: '' },
  { q: 'min', name: 'Minor', suffix: 'm' },
  { q: 'dim', name: 'Dim', suffix: 'dim' },
  { q: 'aug', name: 'Aug', suffix: 'aug' },
  { q: 'sus2', name: 'Sus2', suffix: 'sus2' },
  { q: 'sus4', name: 'Sus4', suffix: 'sus4' },
];
export const SEVENTH_QUALITIES = [
  { q: 'maj7', name: 'Maj7', suffix: 'maj7' },
  { q: 'min7', name: 'Min7', suffix: 'm7' },
  { q: 'dom7', name: 'Dom7', suffix: '7' },
  { q: 'm7b5', name: 'Min7♭5', suffix: 'm7♭5' },
  { q: 'dim7', name: 'Dim7', suffix: '°7' },
];

const TRIAD_SETS = [[6, 5, 4], [5, 4, 3], [4, 3, 2], [3, 2, 1]];
const SEVENTH_SETS = [[6, 5, 4, 3], [5, 4, 3, 2], [4, 3, 2, 1]];
const INV_NAMES = ['root pos', '1st inv', '2nd inv', '3rd inv'];

const TONE_COLORS = ['#c9963a', '#d4782f', '#c75454', '#5b8abd']; // R, 3rd, 5th, 7th
const TONE_LABELS = {
  0: 'R', 1: '♭2', 2: '2', 3: '♭3', 4: '3', 5: '4', 6: '♭5', 7: '5', 8: '♯5', 9: '6', 10: '♭7', 11: '7',
};

function setLabel(set) {
  return set.join('-');
}

function rootName(pc, scale) {
  const inScale = scale.find((n) => noteToChromatic(n) === pc);
  return inScale || CHROMATIC[pc];
}

export function buildPool({ key, track, types, includeSevenths }) {
  const scale = getScaleFor(track, key) || [];
  const rootPcs = scale.map((n) => noteToChromatic(n));
  const pool = [];

  if (types.includes('chord')) {
    const qualities = includeSevenths ? [...TRIAD_QUALITIES, ...SEVENTH_QUALITIES] : TRIAD_QUALITIES;
    for (const { q, suffix } of qualities) {
      const isSeventh = QUALITY_INTERVALS[q].length === 4;
      const sets = isSeventh ? SEVENTH_SETS : TRIAD_SETS;
      const invs = isSeventh ? 4 : 3;
      for (let inv = 0; inv < invs; inv++) {
        for (const set of sets) {
          for (const pc of rootPcs) {
            const name = rootName(pc, scale);
            pool.push({
              type: 'chord',
              promptKey: `chord|${q}|${inv}|${set.join('')}|${pc}`,
              category: `${q} · ${INV_NAMES[inv]} · ${setLabel(set)}`,
              title: `${name}${suffix}`,
              subtitle: `${INV_NAMES[inv]} · strings ${setLabel(set)}`,
              data: { rootC: pc, quality: q, inversion: inv, stringSet: set },
            });
          }
        }
      }
    }
  }

  if (types.includes('note')) {
    for (const n of scale) {
      const pc = noteToChromatic(n);
      pool.push({
        type: 'note',
        promptKey: `note|${pc}`,
        category: 'note finding',
        title: `Find all ${n}`,
        subtitle: 'strings 6–1 · frets 0–12',
        data: { pc, name: n },
      });
    }
  }

  if (types.includes('interval')) {
    for (const iv of INTERVALS) {
      if (iv.semitones === 0) continue;
      for (const n of scale) {
        for (const s of [6, 5, 4, 3]) {
          pool.push({
            type: 'interval',
            promptKey: `int|${iv.semitones}|${s}|${noteToChromatic(n)}`,
            category: `interval ${iv.name} · string ${s}`,
            title: `${iv.name} above ${n}`,
            subtitle: `on string ${s}`,
            data: { rootPc: noteToChromatic(n), rootName: n, iv, string: s },
          });
        }
      }
    }
  }

  return pool;
}

// Laplace-smoothed accuracy per category from the drill log.
export function categoryStats(log) {
  const by = {};
  for (const e of log) {
    const k = e.category;
    if (!by[k]) by[k] = { attempts: 0, correct: 0 };
    by[k].attempts++;
    if (e.correct) by[k].correct++;
  }
  return by;
}

export function pickPrompts(pool, { count, weighted, stats }) {
  const picks = [];
  const lastKeys = [];
  for (let i = 0; i < count; i++) {
    const exclude = new Set(lastKeys.slice(-8));
    const candidates = pool.filter((p) => !exclude.has(p.promptKey));
    const list = candidates.length ? candidates : pool;
    let chosen;
    if (weighted && stats) {
      const weights = list.map((p) => {
        const s = stats[p.category];
        const acc = s ? (s.correct + 1) / (s.attempts + 2) : 0.5;
        return 1 + 3 * (1 - acc);
      });
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let idx = 0;
      while (r > weights[idx] && idx < list.length - 1) {
        r -= weights[idx];
        idx++;
      }
      chosen = list[idx];
    } else {
      chosen = list[Math.floor(Math.random() * list.length)];
    }
    picks.push(chosen);
    lastKeys.push(chosen.promptKey);
  }
  return picks;
}

// ---- Answer builders ----

export function fullNeckChordMarkers(rootC, quality, fretCount = 24) {
  const ivs = QUALITY_INTERVALS[quality] || QUALITY_INTERVALS.maj;
  const pcToTone = {};
  ivs.forEach((semi, i) => {
    pcToTone[(rootC + semi) % 12] = { color: TONE_COLORS[i], label: TONE_LABELS[semi], isRoot: i === 0 };
  });
  const markers = [];
  for (let si = 0; si < 6; si++) {
    for (let f = 0; f <= fretCount; f++) {
      const pc = CHROMATIC.indexOf(fretNote(si, f));
      const tone = pcToTone[pc];
      if (!tone) continue;
      markers.push({ string: 6 - si, fret: f, label: tone.label, color: tone.color, isRoot: tone.isRoot, state: 'active' });
    }
  }
  return markers;
}

export function buildAnswer(prompt) {
  if (prompt.type === 'chord') {
    const { rootC, quality, inversion, stringSet } = prompt.data;
    const solved = solveVoicing(rootC, quality, inversion, stringSet);
    if (solved && solved.span <= 5) {
      const { dots, baseFret } = toCardWindow(solved.dots);
      return { kind: 'card', dots, baseFret, alt: { kind: 'fullneck', markers: fullNeckChordMarkers(rootC, quality), fretRange: [0, 24] } };
    }
    return { kind: 'fullneck', markers: fullNeckChordMarkers(rootC, quality), fretRange: [0, 24] };
  }
  if (prompt.type === 'note') {
    const { pc, name } = prompt.data;
    const markers = [];
    for (let si = 0; si < 6; si++) {
      for (let f = 0; f <= 12; f++) {
        if (CHROMATIC.indexOf(fretNote(si, f)) === pc) {
          markers.push({ string: 6 - si, fret: f, label: name, color: '#c9963a', isRoot: true, state: 'active' });
        }
      }
    }
    return { kind: 'fullneck', markers, fretRange: [0, 12] };
  }
  // interval
  const { rootPc, rootName: rn, iv, string } = prompt.data;
  const si = 6 - string;
  const markers = [];
  let rootFret = -1;
  for (let f = 0; f <= 24; f++) {
    if (CHROMATIC.indexOf(fretNote(si, f)) === rootPc) {
      rootFret = f;
      break;
    }
  }
  if (rootFret >= 0) {
    markers.push({ string, fret: rootFret, label: rn, color: '#c9963a', isRoot: true, state: 'active' });
    for (const tf of [rootFret + iv.semitones, rootFret + iv.semitones + 12]) {
      if (tf >= 0 && tf <= 24 && tf !== rootFret) {
        markers.push({ string, fret: tf, label: iv.name, color: iv.color, isRoot: false, state: 'active' });
      }
    }
  }
  return { kind: 'fullneck', markers, fretRange: [0, 24] };
}
