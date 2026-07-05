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
import { getSchedule } from './scheduleMerged.js';
import {
  scaleTargetsOnString,
  neighborFret,
  ornamentsFor,
  buildTimeline,
  cagedArpTargets,
  pcAt,
} from '../theory/chromatic.js';

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
    // octave-wrapped shapes can poke past the nut as clamped partials (e.g. a 2-fret
    // D-shape fragment at 0-1 for key C) — order is defined by the lowest FULL box
    const lowestFull = {};
    for (const b of bands) {
      const dots = getVariants(CAGED_SHAPES.Major[b.shape].scale)[0];
      const fs = dots.map((d) => d.f);
      const templateSpan = Math.max(...fs) - Math.min(...fs);
      if (b.maxFret - b.minFret !== templateSpan) continue; // clamped partial
      if (!(b.shape in lowestFull) || b.minFret < lowestFull[b.shape]) {
        lowestFull[b.shape] = b.minFret;
      }
    }
    expect(lowestFull.C).toBe(0); // open-position C shape
    const order = ['C', 'A', 'G', 'E', 'D'];
    for (let i = 1; i < order.length; i++) {
      expect(
        lowestFull[order[i]],
        `${order[i]} should sit above ${order[i - 1]}`
      ).toBeGreaterThan(lowestFull[order[i - 1]]);
    }
  });
});

describe('merged schedule (chromaticism blocks)', () => {
  it('adds one chromaticism block per day on both tracks with unique ids', () => {
    const ids = [];
    for (const track of ['major', 'harmonic-minor']) {
      const sched = getSchedule(track);
      expect(sched).toHaveLength(6);
      for (const day of sched) {
        const chromatic = day.blocks.filter((b) => b.title.startsWith('Chromaticism'));
        expect(chromatic).toHaveLength(1);
        ids.push(...day.blocks.flatMap((b) => b.tasks.map((t) => t.id)));
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('adjusts day totalMin by the chromatic block minutes', () => {
    const base = getSchedule('major')[0];
    const chr = base.blocks[base.blocks.length - 1];
    expect(base.totalMin).toBe(120 + chr.min); // Monday was 120 in the base schedule
  });
});

describe('chromaticism theory', () => {
  it('finds scale targets on the A string in C major', () => {
    const frets = scaleTargetsOnString('C', 'major', 5).map((t) => t.fret);
    // A string (open A): B2 C3 D5 E7 F8 G10 A12
    expect(frets).toEqual([2, 3, 5, 7, 8, 10, 12]);
  });

  it('diatonic neighbors are adjacent scale tones on the same string', () => {
    expect(neighborFret('C', 'major', 5, 3, +1)).toBe(5); // C -> D
    expect(neighborFret('C', 'major', 5, 3, -1)).toBe(2); // C -> B
  });

  it('handles the harmonic minor augmented-2nd neighbor', () => {
    // A harmonic minor on the A string: F at fret 8, G# at fret 11 (3-fret neighbor)
    expect(neighborFret('A', 'harmonic-minor', 5, 8, +1)).toBe(11);
  });

  it('mirrors enclosure cells by run direction', () => {
    const asc = ornamentsFor('enc3', { key: 'C', track: 'major', string: 5, fret: 7, dir: 1 }); // target E
    expect(asc.map((o) => o.role)).toEqual(['neighbor', 'approach']);
    expect(asc[0].fret).toBe(8); // F above (diatonic)
    expect(asc[1].fret).toBe(6); // D# below (chromatic)
    const desc = ornamentsFor('enc3', { key: 'C', track: 'major', string: 5, fret: 7, dir: -1 });
    expect(desc[0].fret).toBe(5); // D below (diatonic)
    expect(desc[1].fret).toBe(8); // F above (chromatic-side approach)
  });

  it('4-note cell passes through the target on the off-beat', () => {
    const orn = ornamentsFor('enc4', { key: 'C', track: 'major', string: 5, fret: 7, dir: 1 });
    expect(orn.map((o) => o.role)).toEqual(['neighbor', 'early', 'approach']);
    expect(orn[1].fret).toBe(7); // the early target itself
  });

  it('builds timelines with targets on the beat and right-aligned pickups', () => {
    const targets = scaleTargetsOnString('C', 'major', 5).slice(0, 2);
    const { ticks, perBeat } = buildTimeline(targets, 'enc3', { key: 'C', track: 'major', dir: 1 });
    expect(perBeat).toBe(3);
    expect(ticks[0]).toBeNull(); // count-in click
    expect(ticks[1].role).toBe('neighbor'); // pickups into the first target
    expect(ticks[2].role).toBe('approach');
    expect(ticks[3].role).toBe('target'); // beat 1 target
    expect(ticks[6].role).toBe('target'); // beat 2 target
  });

  it('CAGED arpeggio targets are chord tones of the key chord', () => {
    const tones = getDiatonicTriads('C')[0];
    const targets = cagedArpTargets('C', 'E', tones);
    expect(targets.length).toBeGreaterThan(0);
    const chordPcs = new Set([tones.rootC, tones.thirdC, tones.fifthC]);
    for (const t of targets) {
      expect(chordPcs.has(pcAt(t.string, t.fret)), `pc at ${t.string}:${t.fret}`).toBe(true);
      expect(['R', '3', '5']).toContain(t.role);
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
