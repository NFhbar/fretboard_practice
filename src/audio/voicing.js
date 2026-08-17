// String numbers follow chart convention: 6 = low E ... 1 = high E.
const OPEN_MIDI = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 }; // E2 A2 D3 G3 B3 E4

export function midiFor(stringNum, fret) {
  return OPEN_MIDI[stringNum] + fret;
}

export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function nearestAbove(pitchClass, minMidi) {
  let m = minMidi + 1;
  while (((m % 12) + 12) % 12 !== pitchClass) m++;
  return m;
}

// Chromatic pitch classes (0=C) -> guitar-register voicing, barre-chord-ish spread:
// root (E2..D#3), fifth above, root octave, third above that, then seventh.
export function voiceChord({ rootC, thirdC, fifthC, seventhC }) {
  const rootMidi = 40 + ((rootC - 4 + 12) % 12);
  const fifth = nearestAbove(fifthC, rootMidi);
  const rootOct = rootMidi + 12;
  const third = nearestAbove(thirdC, rootOct);
  const notes = [rootMidi, fifth, rootOct, third];
  if (seventhC !== undefined && seventhC !== null) {
    notes.push(nearestAbove(seventhC, third));
  }
  return notes;
}

export function voiceIntervals(rootC, intervals, { maxVoices = 5 } = {}) {
  let selected = [...intervals];
  if (selected.length > maxVoices && selected.includes(7)) {
    selected = selected.filter((interval) => interval !== 7);
  }
  selected = selected.slice(0, maxVoices);
  const rootMidi = 40 + ((rootC - 4 + 12) % 12);
  return selected.map((interval) => rootMidi + interval);
}
