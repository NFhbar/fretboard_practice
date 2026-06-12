import { CHROMATIC, fretNote, noteToChromatic, normalizeKey } from '../../data/notes.js';
import { TRIAD_COLORS } from '../../data/colors.js';
import { INTERVALS } from '../../data/intervals.js';

// Marker: { string: 1(high E)..6(low E), fret, label, sub?, color, isRoot, state: 'active'|'normal'|'faded', refIdx? }
// Legacy string index si: 0 = low E .. 5 = high E  ->  string = 6 - si.

function thirdLabelTriad(q) {
  return q === 'Maj' || q === 'aug' ? 'Δ3' : '♭3';
}
function fifthLabelTriad(q) {
  return q === 'dim' ? '♭5' : q === 'aug' ? '♯5' : 'p5';
}

function chordToneMatches(chord, noteChrom, withSeventh) {
  if (noteChrom === chord.rootC) return { interval: 'R', noteName: chord.root };
  if (noteChrom === chord.thirdC) {
    const label = withSeventh
      ? (chord.quality === 'maj7' || chord.quality === 'dom7' || chord.quality === 'augmaj7' || chord.quality === 'maj7#5') ? 'Δ3' : '♭3'
      : thirdLabelTriad(chord.quality);
    return { interval: label, noteName: chord.third };
  }
  if (noteChrom === chord.fifthC) {
    const label = withSeventh
      ? (chord.quality === 'm7b5' || chord.quality === 'dim7') ? '♭5' : (chord.quality === 'augmaj7' || chord.quality === 'maj7#5') ? '♯5' : 'p5'
      : fifthLabelTriad(chord.quality);
    return { interval: label, noteName: chord.fifth };
  }
  if (withSeventh && noteChrom === chord.seventhC) {
    const label = (chord.quality === 'maj7' || chord.quality === 'augmaj7' || chord.quality === 'mmaj7' || chord.quality === 'maj7#5' || chord.quality === 'mMaj7')
      ? 'Δ7'
      : chord.quality === 'dim7' ? '°7' : '♭7';
    return { interval: label, noteName: chord.seventh };
  }
  return null;
}

// One marker per cell, matching legacy precedence:
// - any chord highlighted: cells of highlighted chords are 'active'; other chord-tone cells 'faded'
// - nothing highlighted: every chord-tone cell 'normal'
export function chordMarkers(chords, { highlighted = [], showNotes = false, fretCount = 24, withSeventh = false } = {}) {
  const markers = [];
  const anyHighlight = highlighted.length > 0;
  for (let si = 0; si < 6; si++) {
    for (let f = 0; f <= fretCount; f++) {
      const noteChrom = CHROMATIC.indexOf(fretNote(si, f));
      let active = null;
      let faded = null;
      for (let ci = 0; ci < chords.length; ci++) {
        const m = chordToneMatches(chords[ci], noteChrom, withSeventh);
        if (!m) continue;
        const isOn = !anyHighlight || highlighted.includes(ci);
        if (isOn && !active) active = { ...m, idx: ci };
        else if (!isOn && !faded) faded = { ...m, idx: ci };
        if (active) break;
      }
      const pick = active || faded;
      if (!pick) continue;
      const state = active ? (anyHighlight ? 'active' : 'normal') : 'faded';
      markers.push({
        string: 6 - si,
        fret: f,
        label: showNotes ? pick.noteName : pick.interval,
        color: TRIAD_COLORS[pick.idx],
        isRoot: pick.interval === 'R',
        state,
        refIdx: pick.idx,
      });
    }
  }
  return markers;
}

export function triadMarkers(triads, opts = {}) {
  return chordMarkers(triads, { ...opts, withSeventh: false });
}
export function seventhMarkers(chords, opts = {}) {
  return chordMarkers(chords, { ...opts, withSeventh: true });
}

// Interval map: empty selection = everything faded; otherwise only selected intervals, root filled.
export function intervalMarkers(currentKey, activeIntervals = [], { showNotes = false, fretCount = 24 } = {}) {
  const rootChrom = noteToChromatic(normalizeKey(currentKey));
  const activeSet = new Set(activeIntervals);
  const markers = [];
  for (let si = 0; si < 6; si++) {
    for (let f = 0; f <= fretCount; f++) {
      const note = fretNote(si, f);
      const semis = (CHROMATIC.indexOf(note) - rootChrom + 12) % 12;
      const iv = INTERVALS.find((x) => x.semitones === semis);
      if (!iv) continue;
      const isActive = activeSet.has(iv.semitones);
      if (!isActive && activeSet.size > 0) continue;
      markers.push({
        string: 6 - si,
        fret: f,
        label: !isActive && showNotes ? `${iv.name} ${note}` : iv.name,
        sub: isActive && showNotes ? note : undefined,
        color: iv.color,
        isRoot: iv.semitones === 0,
        state: isActive ? 'active' : 'faded',
        refIdx: iv.semitones,
      });
    }
  }
  return markers;
}

// CAGED template dots ({s, f, i, r}) -> card markers.
export function cagedDotMarkers(dots) {
  return dots.map((d) => ({
    string: d.s,
    fret: d.f,
    label: d.i,
    color: null,
    isRoot: !!d.r,
    state: 'active',
  }));
}
