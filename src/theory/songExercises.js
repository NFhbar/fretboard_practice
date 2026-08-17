import { intervalsFromQuality } from './qualities.js';
import { expandSongForm, flattenSongChanges } from './songForm.js';
import { chordPositionsInZone, getSongZones, resolveZone } from './songFingering.js';
import { ornamentsFor } from './chromatic.js';

function triadIntervals(quality) {
  return intervalsFromQuality(quality).filter((interval) => [0, 3, 4, 6, 7, 8].includes(interval % 12)).slice(0, 3);
}

function seventhIntervals(quality) {
  return intervalsFromQuality(quality).slice(0, 4);
}

function layerIntervals(quality, layer) {
  if (layer === 'root') return [0];
  if (layer === 'bass') return [0, 7];
  if (layer === 'triad') return triadIntervals(quality);
  if (layer === 'seventh') return seventhIntervals(quality);
  return intervalsFromQuality(quality);
}

function uniqueMidi(positions) {
  const seen = new Set();
  return positions.filter((position) => {
    if (seen.has(position.midi)) return false;
    seen.add(position.midi);
    return true;
  });
}

function rootStart(positions, previousMidi = null) {
  const notes = uniqueMidi(positions);
  const roots = notes
    .map((position, index) => ({ position, index }))
    .filter(({ position }) => position.isRoot);
  if (!roots.length) return { notes, start: 0 };
  const root = previousMidi === null
    ? roots[0]
    : roots.reduce((best, candidate) =>
        Math.abs(candidate.position.midi - previousMidi) < Math.abs(best.position.midi - previousMidi) ? candidate : best
      );
  return { notes, start: root.index };
}

function nearestStart(positions, previousMidi) {
  const notes = uniqueMidi(positions);
  if (!notes.length || previousMidi === null) return { notes, start: 0 };
  let best = 0;
  for (let index = 1; index < notes.length; index++) {
    if (Math.abs(notes[index].midi - previousMidi) < Math.abs(notes[best].midi - previousMidi)) best = index;
  }
  return { notes, start: best };
}

function walkPattern(notes, start, count) {
  if (!notes.length) return [];
  if (notes.length === 1) return Array.from({ length: count }, () => notes[0]);
  const pattern = [];
  let index = start;
  let direction = index === notes.length - 1 ? -1 : 1;
  for (let slot = 0; slot < count; slot++) {
    pattern.push(notes[index]);
    if (index + direction < 0 || index + direction >= notes.length) direction *= -1;
    index += direction;
  }
  return pattern;
}

function zoneForIndex(song, zone, index) {
  if (zone.id !== 'full') return zone;
  const zones = getSongZones(song.key);
  const period = (zones.length - 1) * 2;
  const offset = index % period;
  return zones[offset < zones.length ? offset : period - offset];
}

function positionEvent(position, beat, durationBeats, change, index) {
  return {
    id: `${change.id}-note-${index}`,
    beat,
    durationBeats,
    midi: position.midi,
    string: position.string,
    fret: position.fret,
    role: position.role,
    chordId: change.id,
  };
}

function buildRootEvents(song, scope, zone) {
  return flattenSongChanges(song, scope).map((change, index) => {
    const result = chordPositionsInZone(change.root, [0], zoneForIndex(song, zone, index));
    const root = result.positions[0];
    return root ? positionEvent(root, change.absoluteBeat, change.durationBeats, change, index) : null;
  }).filter(Boolean);
}

function buildBassEvents(song, scope, zone) {
  const bars = expandSongForm(song, scope);
  const events = [];
  let index = 0;

  for (const bar of bars) {
    const barZone = zoneForIndex(song, zone, bar.absoluteBar - 1);
    for (const localBeat of [0, 2]) {
      const change = [...bar.changes].reverse().find((item) => item.beat <= localBeat);
      if (!change) continue;
      const useRoot = localBeat === change.beat;
      const intervals = useRoot ? [0] : [7];
      const result = chordPositionsInZone(change.root, intervals, barZone);
      const note = result.positions[0];
      if (note) events.push(positionEvent(note, bar.startBeat + localBeat, 2, change, index++));
    }
  }
  return events;
}

function buildArpeggioEvents(song, scope, zone, layer, step, voiceLed = false) {
  const events = [];
  let previousMidi = null;
  let index = 0;

  for (const [changeIndex, change] of flattenSongChanges(song, scope).entries()) {
    const intervals = layerIntervals(change.quality, layer);
    const result = chordPositionsInZone(change.root, intervals, zoneForIndex(song, zone, changeIndex));
    const count = Math.max(1, Math.round(change.durationBeats / step));
    const { notes, start } = voiceLed
      ? nearestStart(result.positions, previousMidi)
      : rootStart(result.positions, zone.id === 'full' ? previousMidi : null);
    const pattern = walkPattern(notes, start, count);
    if (!pattern.length) continue;
    for (let slot = 0; slot < count; slot++) {
      const note = pattern[slot];
      events.push(positionEvent(note, change.absoluteBeat + slot * step, step, change, index++));
      previousMidi = note.midi;
    }
  }
  return events;
}

function buildChromaticEvents(song, scope, zone) {
  const targets = buildArpeggioEvents(song, scope, zone, 'seventh', 1, true);
  const events = [];
  let index = 0;

  targets.forEach((target, targetIndex) => {
    const device = targetIndex % 2 === 0 ? 'approach' : 'neighbor';
    const minFret = Math.max(0, zone.minFret - 1);
    const maxFret = Math.min(24, zone.maxFret + 1);
    const variants = [null, device === 'approach' ? 'above' : 'below'];
    const pickup = variants
      .map((variant) => ornamentsFor(device, {
        key: song.key,
        track: 'major',
        string: target.string,
        fret: target.fret,
        dir: 1,
        variant,
      }).at(-1))
      .find((note) => note && note.fret >= minFret && note.fret <= maxFret);
    if (pickup) {
      events.push({
        id: `${target.id}-${device}-${index++}`,
        beat: target.beat - 0.5,
        durationBeats: 0.5,
        midi: { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 }[pickup.string] + pickup.fret,
        string: pickup.string,
        fret: pickup.fret,
        role: pickup.role,
        chordId: target.chordId,
      });
    }
    events.push({ ...target, id: `${target.id}-target`, durationBeats: 0.5, role: 'target' });
  });
  return events;
}

export function mergeTiedMelodyEvents(events) {
  const ordered = [...events].sort((a, b) => a.beat - b.beat);
  const merged = [];
  for (let index = 0; index < ordered.length; index++) {
    let event = { ...ordered[index] };
    while (
      event.tie &&
      ordered[index + 1] &&
      ordered[index + 1].midi === event.midi &&
      Math.abs(event.beat + event.durationBeats - ordered[index + 1].beat) < 1e-9
    ) {
      index++;
      event = {
        ...event,
        durationBeats: event.durationBeats + ordered[index].durationBeats,
        tie: ordered[index].tie,
      };
    }
    merged.push(event);
  }
  return merged;
}

function swingBeat(beat, swing) {
  if (!swing) return beat;
  const whole = Math.floor(beat);
  const fraction = beat - whole;
  return whole + (Math.abs(fraction - 0.5) < 1e-9 ? 2 / 3 : fraction);
}

export function songEventDurationSeconds(event, bpm, swing) {
  return (swingBeat(event.beat + event.durationBeats, swing) - swingBeat(event.beat, swing)) * 60 / bpm;
}

function melodyEvents(song, scope) {
  if (!song.melody?.events?.length) return [];
  const ranges = scope === 'A' ? [[0, 8]] : scope === 'B' ? [[17, 24]] : [[0, 32]];
  const firstBar = scope === 'B' ? 17 : 1;
  const events = song.melody.events
    .filter((event) => ranges.some(([start, finish]) => event.bar >= start && event.bar <= finish))
    .map((event) => ({
      ...event,
      beat: (event.bar - firstBar) * song.meter.beatsPerBar + event.beat,
    }));
  return mergeTiedMelodyEvents(events);
}

export function buildSongExercise(song, activity = {}) {
  const scope = activity.scope || 'form';
  const zone = resolveZone(song.key, activity.zone || 'zone-1');
  const bars = expandSongForm(song, scope);
  let changes = bars.flatMap((bar) => bar.changes);
  let events = [];

  if (activity.mode === 'roots') events = buildRootEvents(song, scope, zone);
  if (activity.mode === 'bass') events = buildBassEvents(song, scope, zone);
  if (activity.mode === 'triad-root') events = buildArpeggioEvents(song, scope, zone, 'triad', 1);
  if (activity.mode === 'triad-voice-led') events = buildArpeggioEvents(song, scope, zone, 'triad', 1, true);
  if (activity.mode === 'harmony-eighths') events = buildArpeggioEvents(song, scope, zone, activity.toneLayer || 'triad', 0.5);
  if (activity.mode === 'seventh-arpeggio') events = buildArpeggioEvents(song, scope, zone, 'seventh', 0.5);
  if (activity.mode === 'chromatic-seventh') events = buildChromaticEvents(song, scope, zone);
  if (activity.mode === 'melody' || activity.mode === 'melody-bass') events = melodyEvents(song, scope);
  if (activity.mode === 'melody-bass') events = [...events, ...buildRootEvents(song, scope, zone)].sort((a, b) => a.beat - b.beat);
  if ((activity.mode === 'melody' || activity.mode === 'melody-bass') && activity.octave) {
    events = events.map((event) => event.bar === undefined ? event : { ...event, midi: event.midi + activity.octave * 12 });
  }

  const leadInBeats = events.some((event) => event.beat < 0) ? song.meter.beatsPerBar : 0;
  if (leadInBeats) {
    events = events.map((event) => ({ ...event, beat: event.beat + leadInBeats }));
    changes = changes.map((change) => ({ ...change, absoluteBeat: change.absoluteBeat + leadInBeats }));
  }

  return {
    activity,
    scope,
    zone,
    bars,
    changes,
    events,
    leadInBeats,
    durationBeats: bars.length * song.meter.beatsPerBar + leadInBeats,
    melodyAvailable: !!song.melody?.events?.length,
  };
}

export function chordIntervalsForExercise(quality, mode) {
  if (mode === 'roots') return [0];
  if (mode === 'bass') return [0, 7];
  if (mode === 'triad-root' || mode === 'triad-voice-led' || mode === 'harmony-eighths') return triadIntervals(quality);
  if (mode === 'seventh-arpeggio' || mode === 'chromatic-seventh') return seventhIntervals(quality);
  return intervalsFromQuality(quality);
}
