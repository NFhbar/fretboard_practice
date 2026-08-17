import { noteToChromatic, normalizeKey } from '../data/notes.js';

function sectionOrder(song, scope) {
  if (!scope || scope === 'form') return song.form;
  return song.sections[scope] ? [scope] : song.form;
}

export function expandSongForm(song, scope = 'form') {
  const beatsPerBar = song.meter.beatsPerBar;
  const bars = [];
  let absoluteBar = 1;

  sectionOrder(song, scope).forEach((section, formIndex) => {
    song.sections[section].forEach((bar, sectionBar) => {
      bars.push({
        absoluteBar,
        startBeat: (absoluteBar - 1) * beatsPerBar,
        section,
        formIndex,
        sectionBar: sectionBar + 1,
        changes: [...bar.changes].sort((a, b) => a.beat - b.beat).map((change, changeIndex) => ({
          ...change,
          id: `${section}-${formIndex + 1}-${sectionBar + 1}-${changeIndex + 1}`,
          rootC: noteToChromatic(normalizeKey(change.root)),
          absoluteBar,
          absoluteBeat: (absoluteBar - 1) * beatsPerBar + change.beat,
        })),
      });
      absoluteBar++;
    });
  });

  return bars;
}

export function flattenSongChanges(song, scope = 'form') {
  return expandSongForm(song, scope).flatMap((bar) => bar.changes);
}

export function changeAtBeat(song, beat, scope = 'form') {
  const changes = flattenSongChanges(song, scope);
  return [...changes].reverse().find((change) => change.absoluteBeat <= beat) || changes[0] || null;
}

export function validateSongForm(song) {
  const errors = [];
  const beatsPerBar = song.meter.beatsPerBar;

  for (const [sectionName, bars] of Object.entries(song.sections)) {
    if (bars.length !== 8) errors.push(`${sectionName} must contain 8 bars`);
    bars.forEach((bar, index) => {
      if (bar.changes.some((change, changeIndex) => changeIndex > 0 && change.beat < bar.changes[changeIndex - 1].beat)) {
        errors.push(`${sectionName} bar ${index + 1} changes are out of order`);
      }
      const ordered = [...bar.changes].sort((a, b) => a.beat - b.beat);
      let cursor = 0;
      for (const change of ordered) {
        if (change.beat !== cursor) errors.push(`${sectionName} bar ${index + 1} has a gap or overlap`);
        if (change.durationBeats <= 0) errors.push(`${sectionName} bar ${index + 1} has a non-positive duration`);
        cursor = change.beat + change.durationBeats;
      }
      if (cursor !== beatsPerBar) errors.push(`${sectionName} bar ${index + 1} does not fill the meter`);
    });
  }

  if (expandSongForm(song).length !== 32) errors.push('Form must expand to 32 bars');
  return errors;
}

export function validateSongMelody(song) {
  if (!song.melody) return [];
  const errors = [];
  const ids = new Set();

  for (const event of song.melody.events || []) {
    if (!event.id || ids.has(event.id)) errors.push('Melody event IDs must be present and unique');
    ids.add(event.id);
    if (!Number.isInteger(event.bar) || event.bar < 0 || event.bar > 32) errors.push(`${event.id} has an invalid bar`);
    if (!Number.isFinite(event.beat) || event.beat < 0 || event.beat >= song.meter.beatsPerBar || !Number.isInteger(event.beat * 2)) {
      errors.push(`${event.id} has an invalid eighth-note-grid beat`);
    }
    if (!Number.isFinite(event.durationBeats) || event.durationBeats <= 0 || !Number.isInteger(event.durationBeats * 2)) {
      errors.push(`${event.id} has an invalid eighth-note-grid duration`);
    }
    if (!Number.isInteger(event.midi) || event.midi < 0 || event.midi > 127) errors.push(`${event.id} has an invalid MIDI pitch`);
    if (event.tie !== undefined && typeof event.tie !== 'boolean') errors.push(`${event.id} has an invalid tie flag`);
  }

  const ordered = [...(song.melody.events || [])].sort(
    (a, b) => a.bar * song.meter.beatsPerBar + a.beat - (b.bar * song.meter.beatsPerBar + b.beat)
  );
  ordered.forEach((event, index) => {
    if (!event.tie) return;
    const next = ordered[index + 1];
    const end = event.bar * song.meter.beatsPerBar + event.beat + event.durationBeats;
    const nextStart = next ? next.bar * song.meter.beatsPerBar + next.beat : null;
    if (!next || next.midi !== event.midi || Math.abs(end - nextStart) > 1e-9) {
      errors.push(`${event.id} has an unresolved tie`);
    }
  });

  return errors;
}
