import { describe, it, expect } from 'vitest';
import { SCHEDULE } from './schedule.js';
import { SCHEDULE_HARM_MINOR } from './scheduleHarmMinor.js';
import { CAGED_SHAPES } from './cagedShapes.js';
import { QUALITY_TABS, CAGED_NAMES, CATEGORY_LABELS, getVariants } from './cagedMeta.js';
import { SCALES, HARM_MINOR_SCALES } from './scales.js';
import { KEY_CYCLE, noteToChromatic } from './notes.js';
import { getDiatonicTriads, getDiatonic7ths, getHarmMinorTriads, getHarmMinor7ths } from '../theory/diatonic.js';
import { solveVoicing } from '../theory/voicingSolver.js';
import { buildCagedBands } from '../theory/noteMap.js';
import { OPEN_STRINGS } from './notes.js';

describe('schedules', () => {
  it('both tracks have 6 days with blocks and tasks', () => {
    for (const sched of [SCHEDULE, SCHEDULE_HARM_MINOR]) {
      expect(sched).toHaveLength(6);
      for (const day of sched) {
        expect(day.day).toBeTruthy();
        expect(day.blocks.length).toBeGreaterThan(0);
        for (const block of day.blocks) {
          expect(block.min).toBeGreaterThan(0);
          expect(block.tasks.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('task ids are unique across both schedules', () => {
    const ids = [...SCHEDULE, ...SCHEDULE_HARM_MINOR].flatMap((d) => d.blocks.flatMap((b) => b.tasks.map((t) => t.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('CAGED shapes', () => {
  it('contains all 12 qualities × 5 shapes', () => {
    for (const q of QUALITY_TABS) {
      expect(CAGED_SHAPES[q], `quality ${q}`).toBeTruthy();
      for (const name of CAGED_NAMES) {
        expect(CAGED_SHAPES[q][name], `${q}/${name}`).toBeTruthy();
      }
    }
  });

  it('all dots are within string 1-6 and fret 0-6', () => {
    let dotCount = 0;
    for (const q of QUALITY_TABS) {
      const cats = Object.keys(CATEGORY_LABELS[q] || CATEGORY_LABELS.Major);
      for (const name of CAGED_NAMES) {
        for (const cat of cats) {
          for (const variant of getVariants(CAGED_SHAPES[q][name][cat])) {
            for (const d of variant) {
              dotCount++;
              expect(d.s, `${q}/${name}/${cat} string`).toBeGreaterThanOrEqual(1);
              expect(d.s).toBeLessThanOrEqual(6);
              expect(d.f, `${q}/${name}/${cat} fret`).toBeGreaterThanOrEqual(0);
              expect(d.f).toBeLessThanOrEqual(6);
              expect(typeof d.i).toBe('string');
            }
          }
        }
      }
    }
    expect(dotCount).toBe(1762); // pinned: catches accidental data loss in future edits
  });
});

describe('theory', () => {
  it('all 12 keys have 7-note scales in both tracks', () => {
    for (const k of KEY_CYCLE) {
      expect(SCALES[k]).toHaveLength(7);
      expect(HARM_MINOR_SCALES[k]).toHaveLength(7);
      for (const n of [...SCALES[k], ...HARM_MINOR_SCALES[k]]) {
        expect(noteToChromatic(n), `${k}: ${n}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('diatonic builders return 7 chords with chromatic indices', () => {
    for (const k of KEY_CYCLE) {
      for (const fn of [getDiatonicTriads, getHarmMinorTriads]) {
        const triads = fn(k);
        expect(triads).toHaveLength(7);
        for (const t of triads) {
          expect(t.rootC).toBeGreaterThanOrEqual(0);
          expect(t.chordName).toBeTruthy();
        }
      }
      for (const fn of [getDiatonic7ths, getHarmMinor7ths]) {
        const cs = fn(k);
        expect(cs).toHaveLength(7);
        for (const c of cs) expect(c.seventhC).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('C major triads are spelled C-E-G etc.', () => {
    const t = getDiatonicTriads('C');
    expect(t[0].root).toBe('C');
    expect(t[0].third).toBe('E');
    expect(t[0].fifth).toBe('G');
    expect(t[4].chordName).toBe('G');
    expect(t[6].chordName).toBe('Bdim');
  });
});

describe('CAGED position bands', () => {
  it('anchors every band so the shape root lands on the key root pitch class', () => {
    for (const key of KEY_CYCLE) {
      const keyPc = noteToChromatic(key.length > 1 && key[1] === 'b' ? key[0] + '♭' : key);
      const bands = buildCagedBands(key, 'all');
      expect(bands.length).toBeGreaterThanOrEqual(5);
      for (const band of bands) {
        const dots = getVariants(CAGED_SHAPES.Major[band.shape].scale)[0];
        const rootDot = dots.find((d) => d.r);
        const templateMin = Math.min(...dots.map((d) => d.f));
        // unclamped bands only (clamped-at-0 partials shift the min)
        if (band.minFret === 0) continue;
        const shift = band.minFret - templateMin;
        const rootFret = rootDot.f + shift;
        expect((OPEN_STRINGS[6 - rootDot.s] + rootFret) % 12, `${key} ${band.shape}`).toBe(keyPc);
      }
    }
  });

  it('tiles the neck in C-A-G-E-D order for the key of C', () => {
    const bands = buildCagedBands('C', 'all');
    const lowestPerShape = {};
    for (const b of bands) {
      if (!(b.shape in lowestPerShape) || b.minFret < lowestPerShape[b.shape]) {
        lowestPerShape[b.shape] = b.minFret;
      }
    }
    expect(lowestPerShape.C).toBe(0); // open-position C shape
    const order = ['C', 'A', 'G', 'E', 'D'];
    for (let i = 1; i < order.length; i++) {
      expect(
        lowestPerShape[order[i]],
        `${order[i]} should sit above ${order[i - 1]}`
      ).toBeGreaterThan(lowestPerShape[order[i - 1]]);
    }
  });
});

describe('voicingSolver', () => {
  it('solves C major root position on strings 5-4-3', () => {
    const v = solveVoicing(0, 'maj', 0, [5, 4, 3]);
    expect(v).toBeTruthy();
    // C(A string fret 3), E(D string fret 2), G(G string fret 0)
    expect(v.dots).toEqual([
      { s: 5, f: 3, i: 'R', r: true },
      { s: 4, f: 2, i: 'Δ3', r: false },
      { s: 3, f: 0, i: 'p5', r: false },
    ]);
  });

  it('pitches ascend across the set for every inversion', () => {
    const OPEN = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 };
    for (const inv of [0, 1, 2]) {
      const v = solveVoicing(7, 'min', inv, [4, 3, 2]);
      expect(v, `inv ${inv}`).toBeTruthy();
      const pitches = v.dots.map((d) => OPEN[d.s] + d.f);
      expect(pitches[0]).toBeLessThan(pitches[1]);
      expect(pitches[1]).toBeLessThan(pitches[2]);
    }
  });

  it('solves drop-2 sevenths on 4 strings with bass = inversion tone', () => {
    // Dm7 (root 2): inversion 0 -> root in bass; inversion 2 -> fifth (9) in bass
    const root = solveVoicing(2, 'min7', 0, [5, 4, 3, 2]);
    expect(root).toBeTruthy();
    expect(root.dots).toHaveLength(4);
    expect(root.dots[0].r).toBe(true);
    const second = solveVoicing(2, 'min7', 2, [5, 4, 3, 2]);
    expect(second).toBeTruthy();
    expect(second.dots[0].i).toBe('p5');
  });
});
