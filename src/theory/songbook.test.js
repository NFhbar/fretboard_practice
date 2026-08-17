import { describe, expect, it } from 'vitest';
import { TAKE_THE_A_TRAIN } from '../data/songbook/takeTheATrain.js';
import { TAKE_THE_A_TRAIN_WEEK } from '../data/songbook/takeTheATrainWeek.js';
import { getSchedule } from '../data/scheduleMerged.js';
import { resolveCurriculum, resolveSessionDay, sessionPath } from '../data/curriculumRegistry.js';
import { expandSongForm, flattenSongChanges, validateSongForm, validateSongMelody } from './songForm.js';
import {
  buildSongExercise,
  chordIntervalsForExercise,
  mergeTiedMelodyEvents,
  songEventDurationSeconds,
} from './songExercises.js';
import { chordPositionsInZone, getSongZones, resolveZone, selectChordShapeForZone, solveMelodyFingering } from './songFingering.js';
import { EXTENDED_QUALITY_INTERVALS, QUALITY_INTERVALS, intervalsFromQuality, tonesFromQuality } from './qualities.js';
import { voiceIntervals } from '../audio/voicing.js';
import { SUBS } from '../components/metronome/metroShared.js';

describe('songbook curriculum', () => {
  it('contains six 120-minute days with globally unique task ids', () => {
    expect(TAKE_THE_A_TRAIN_WEEK).toHaveLength(6);
    const songIds = [];
    for (const day of TAKE_THE_A_TRAIN_WEEK) {
      expect(day.totalMin).toBe(120);
      expect(day.blocks.reduce((total, block) => total + block.min, 0)).toBe(120);
      for (const block of day.blocks) {
        expect(block.tasks.length).toBeGreaterThan(0);
        for (const task of block.tasks) {
          expect(task.activity).toBeTruthy();
          songIds.push(task.id);
        }
      }
    }
    const weeklyIds = ['major', 'harmonic-minor'].flatMap((track) =>
      getSchedule(track).flatMap((day) => day.blocks.flatMap((block) => block.tasks.map((task) => task.id)))
    );
    const all = [...weeklyIds, ...songIds];
    expect(new Set(all).size).toBe(all.length);
  });

  it('keeps weekly chromaticism merging isolated from songbook days', () => {
    const weekly = resolveCurriculum({ curriculum: 'weekly', track: 'major' });
    const songbook = resolveCurriculum({ curriculum: 'songbook', songId: TAKE_THE_A_TRAIN.id });
    expect(weekly.days.every((day) => day.blocks.some((block) => block.title.startsWith('Chromaticism')))).toBe(true);
    expect(songbook.days.every((day) => day.blocks.every((block) => !block.title.startsWith('Chromaticism')))).toBe(true);
  });

  it('defaults legacy session contexts to weekly routes and schedules', () => {
    const legacy = resolveSessionDay({ track: 'major', dayIdx: 0, week: 1, key: 'C' });
    expect(legacy.curriculum).toBe('weekly');
    expect(legacy.day.day).toBe('Monday');
    expect(sessionPath({ dayIdx: 2 })).toBe('session/2');
    expect(sessionPath({ curriculum: 'songbook', songId: TAKE_THE_A_TRAIN.id, dayIdx: 3 })).toBe(
      'songbook/take-the-a-train/session/3'
    );
  });
});

describe('song form', () => {
  it('expands the confirmed AABA chart to 32 complete bars', () => {
    expect(validateSongForm(TAKE_THE_A_TRAIN)).toEqual([]);
    const bars = expandSongForm(TAKE_THE_A_TRAIN);
    expect(bars).toHaveLength(32);
    expect(bars.map((bar) => bar.section).join('')).toBe('AAAAAAAAAAAAAAAABBBBBBBBAAAAAAAA');
    expect(bars[0].section).toBe('A');
    expect(bars[8].section).toBe('A');
    expect(bars[16].section).toBe('B');
    expect(bars[24].section).toBe('A');
  });

  it('places both split-bar changes on their exact beats', () => {
    const changes = flattenSongChanges(TAKE_THE_A_TRAIN);
    const aTurn = changes.filter((change) => change.absoluteBar === 8);
    const bridgeTurn = changes.filter((change) => change.absoluteBar === 24);
    expect(aTurn.map((change) => [change.symbol, change.beat, change.durationBeats])).toEqual([
      ['Dm7', 0, 2],
      ['G7', 2, 2],
    ]);
    expect(bridgeTurn.map((change) => [change.symbol, change.beat, change.durationBeats])).toEqual([
      ['G7', 0, 2],
      ['G7♭9', 2, 2],
    ]);
  });

  it('pins every authoritative section bar and chord quality', () => {
    const encode = (section) => TAKE_THE_A_TRAIN.sections[section].map((bar) =>
      bar.changes
        .map((change) => `${change.beat}:${change.durationBeats}:${change.symbol}:${change.root}:${change.quality}:${change.function}`)
        .join('|')
    );
    expect(encode('A')).toEqual([
      '0:4:C6:C:maj6:I',
      '0:4:C6:C:maj6:I',
      '0:4:D7:D:dom7:V/V',
      '0:4:D7:D:dom7:V/V',
      '0:4:Dm9:D:min9:ii',
      '0:4:G7:G:dom7:V',
      '0:4:C6:C:maj6:I',
      '0:2:Dm7:D:min7:ii|2:2:G7:G:dom7:V',
    ]);
    expect(encode('B')).toEqual([
      '0:4:Fmaj7:F:maj7:IV',
      '0:4:Fmaj7:F:maj7:IV',
      '0:4:Fmaj7:F:maj7:IV',
      '0:4:Fmaj7:F:maj7:IV',
      '0:4:D7:D:dom7:V/V',
      '0:4:D7:D:dom7:V/V',
      '0:4:Dm9:D:min9:ii',
      '0:2:G7:G:dom7:V|2:2:G7♭9:G:dom7b9:V',
    ]);
  });

  it('validates and schedules a pickup before bar one', () => {
    const song = {
      ...TAKE_THE_A_TRAIN,
      melody: {
        events: [
          { id: 'pickup', bar: 0, beat: 3, durationBeats: 1, midi: 62 },
          { id: 'bar-one', bar: 1, beat: 0, durationBeats: 1, midi: 64 },
        ],
      },
    };
    expect(validateSongMelody(song)).toEqual([]);
    const exercise = buildSongExercise(song, { mode: 'melody', scope: 'A', zone: 'zone-1' });
    expect(exercise.leadInBeats).toBe(4);
    expect(exercise.events.map((event) => event.beat)).toEqual([3, 4]);
    expect(exercise.changes[0].absoluteBeat).toBe(4);
    expect(exercise.durationBeats).toBe(36);
  });

  it('rejects out-of-order chart changes and unsupported melody grids', () => {
    const chart = {
      ...TAKE_THE_A_TRAIN,
      sections: {
        ...TAKE_THE_A_TRAIN.sections,
        A: TAKE_THE_A_TRAIN.sections.A.map((bar, index) =>
          index === 7 ? { changes: [...bar.changes].reverse() } : bar
        ),
      },
    };
    const melody = {
      ...TAKE_THE_A_TRAIN,
      melody: { events: [{ id: 'quarter-grid', bar: 1, beat: 0.25, durationBeats: 0.5, midi: 60 }] },
    };
    expect(validateSongForm(chart)).toContain('A bar 8 changes are out of order');
    expect(validateSongMelody(melody)).toContain('quarter-grid has an invalid eighth-note-grid beat');
  });

  it('merges valid ties and applies swing to note duration only once', () => {
    const merged = mergeTiedMelodyEvents([
      { id: 'a', beat: 0, durationBeats: 1, midi: 60, tie: true },
      { id: 'b', beat: 1, durationBeats: 0.5, midi: 60, tie: false },
    ]);
    expect(merged).toEqual([{ id: 'a', beat: 0, durationBeats: 1.5, midi: 60, tie: false }]);
    expect(songEventDurationSeconds({ beat: 0, durationBeats: 0.5 }, 60, true)).toBeCloseTo(2 / 3);
    expect(songEventDurationSeconds({ beat: 0.5, durationBeats: 0.5 }, 60, true)).toBeCloseTo(1 / 3);
  });
});

describe('song harmony and playback primitives', () => {
  it('keeps extended definitions separate from legacy four-voice qualities', () => {
    expect(EXTENDED_QUALITY_INTERVALS.maj6).toEqual([0, 4, 7, 9]);
    expect(EXTENDED_QUALITY_INTERVALS.min9).toEqual([0, 3, 7, 10, 14]);
    expect(EXTENDED_QUALITY_INTERVALS.dom7b9).toEqual([0, 4, 7, 10, 13]);
    expect(QUALITY_INTERVALS.min9).toBeUndefined();
    expect(intervalsFromQuality('min9')).toEqual([0, 3, 7, 10, 14]);
    expect(tonesFromQuality(0, 'maj')).toEqual({ rootC: 0, thirdC: 4, fifthC: 7, seventhC: undefined });
  });

  it('voices four-note extensions without changing the legacy voicer', () => {
    expect(voiceIntervals(2, intervalsFromQuality('min9'), { maxVoices: 4 })).toEqual([50, 53, 60, 64]);
  });

  it('registers one straight and one swing eighth offset', () => {
    expect(SUBS.find((sub) => sub.id === 'eighth').sub).toBe(2);
    expect(SUBS.find((sub) => sub.id === 'swing-eighth').sub).toEqual([0, 2 / 3]);
  });
});

describe('song CAGED zones and exercises', () => {
  it('derives five ordered tonal-center zones', () => {
    expect(getSongZones('C')).toEqual([
      { id: 'zone-1', label: 'Zone 1', tonalShape: 'C', minFret: 0, maxFret: 3 },
      { id: 'zone-2', label: 'Zone 2', tonalShape: 'A', minFret: 2, maxFret: 6 },
      { id: 'zone-3', label: 'Zone 3', tonalShape: 'G', minFret: 4, maxFret: 8 },
      { id: 'zone-4', label: 'Zone 4', tonalShape: 'E', minFret: 7, maxFret: 10 },
      { id: 'zone-5', label: 'Zone 5', tonalShape: 'D', minFret: 9, maxFret: 13 },
    ]);
  });

  it('selects the maximal-overlap chord shape with at most one fret of spill', () => {
    for (const zone of getSongZones('C')) {
      for (const root of ['C', 'D', 'F', 'G']) {
        const band = selectChordShapeForZone(root, zone);
        expect(band.overlap).toBeGreaterThan(0);
        expect(band.spill).toBeLessThanOrEqual(1);
      }
    }
  });

  it('builds roots, bass, and voice-led notes against the complete form', () => {
    const roots = buildSongExercise(TAKE_THE_A_TRAIN, { mode: 'roots', scope: 'form', zone: 'zone-1' });
    const bass = buildSongExercise(TAKE_THE_A_TRAIN, { mode: 'bass', scope: 'form', zone: 'zone-2' });
    const voiceLed = buildSongExercise(TAKE_THE_A_TRAIN, { mode: 'triad-voice-led', scope: 'form', zone: 'zone-3' });
    expect(roots.events).toHaveLength(36);
    expect(bass.events).toHaveLength(64);
    expect(voiceLed.events).toHaveLength(128);
    expect(voiceLed.events.every((event) => event.string >= 1 && event.string <= 6 && event.fret >= 0 && event.fret <= 24)).toBe(true);
    for (const event of voiceLed.events) {
      const change = [...voiceLed.changes].reverse().find((item) => item.absoluteBeat <= event.beat);
      const chordPcs = new Set(chordIntervalsForExercise(change.quality, 'triad-voice-led').map((interval) => (change.rootC + interval) % 12));
      expect(chordPcs.has(event.midi % 12)).toBe(true);
    }
    expect(chordIntervalsForExercise('min9', 'triad-voice-led')).toEqual([0, 3, 7]);
    expect(chordIntervalsForExercise('min9', 'seventh-arpeggio')).toEqual([0, 3, 7, 10]);
  });

  it('right-aligns chromatic pickups before chart-defined targets', () => {
    const exercise = buildSongExercise(TAKE_THE_A_TRAIN, {
      mode: 'chromatic-seventh',
      scope: 'A',
      zone: 'zone-3',
    });
    expect(exercise.leadInBeats).toBe(4);
    expect(exercise.events[0].beat).toBe(3.5);
    expect(exercise.events[1].beat).toBe(4);
    expect(exercise.events[1].role).toBe('target');
    expect(exercise.changes[0].absoluteBeat).toBe(4);
    const zone = resolveZone('C', 'zone-3');
    expect(exercise.events.every((event) => event.fret >= zone.minFret - 1 && event.fret <= zone.maxFret + 1)).toBe(true);
  });

  it('avoids register wraps and traverses all five zones in full-neck mode', () => {
    const arpeggios = buildSongExercise(TAKE_THE_A_TRAIN, {
      mode: 'seventh-arpeggio',
      scope: 'B',
      zone: 'zone-3',
    });
    for (let index = 1; index < arpeggios.events.length; index++) {
      if (arpeggios.events[index].chordId === arpeggios.events[index - 1].chordId) {
        expect(Math.abs(arpeggios.events[index].midi - arpeggios.events[index - 1].midi)).toBeLessThanOrEqual(12);
      }
    }

    const full = buildSongExercise(TAKE_THE_A_TRAIN, { mode: 'roots', scope: 'form', zone: 'full' });
    expect(Math.min(...full.events.map((event) => event.fret))).toBeLessThanOrEqual(3);
    expect(Math.max(...full.events.map((event) => event.fret))).toBeGreaterThanOrEqual(9);
    const fullArpeggios = buildSongExercise(TAKE_THE_A_TRAIN, {
      mode: 'seventh-arpeggio',
      scope: 'form',
      zone: 'full',
    });
    for (let index = 1; index < fullArpeggios.events.length; index++) {
      expect(Math.abs(fullArpeggios.events[index].midi - fullArpeggios.events[index - 1].midi)).toBeLessThanOrEqual(12);
    }
  });

  it('retains altered and extension tones around the selected CAGED shape', () => {
    const zone = resolveZone('C', 'zone-3');
    const minor = chordPositionsInZone('D', intervalsFromQuality('min9'), zone);
    const altered = chordPositionsInZone('G', intervalsFromQuality('dom7b9'), zone);
    expect(new Set(minor.positions.map((position) => position.role))).toEqual(new Set(['R', '♭3', '5', '♭7', '9']));
    expect(new Set(altered.positions.map((position) => position.role))).toEqual(new Set(['R', '3', '5', '♭7', '♭9']));
  });
});

describe('melody fingering solver', () => {
  it('keeps every resolved note inside the requested zone', () => {
    const zone = resolveZone('C', 'zone-1');
    const events = [
      { id: 'm1', midi: 60 },
      { id: 'm2', midi: 64 },
      { id: 'm3', midi: 65 },
    ];
    const path = solveMelodyFingering(events, zone);
    expect(path).toHaveLength(3);
    expect(path.every((event) => event.fret >= zone.minFret && event.fret <= zone.maxFret)).toBe(true);
  });

  it('honors a valid event-level override', () => {
    const zone = resolveZone('C', 'full');
    const path = solveMelodyFingering([{ id: 'm1', midi: 64 }], zone, {
      overrides: { m1: { string: 2, fret: 5 } },
    });
    expect(path[0]).toMatchObject({ string: 2, fret: 5, midi: 64 });
  });

  it('returns null when an octave cannot fit the requested zone', () => {
    const zone = resolveZone('C', 'zone-1');
    expect(solveMelodyFingering([{ id: 'm1', midi: 84 }], zone, { octaveShift: 1 })).toBeNull();
  });
});
