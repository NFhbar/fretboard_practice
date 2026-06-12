import { getContext, getBus, ensureRunning } from './engine.js';
import { midiToFreq } from './voicing.js';

// Detuned-oscillator pluck: 2 triangles ±4 cents + quiet saw, fast attack, exp decay.
function pluckInto(dest, freq, when, { dur = 2.2, velocity = 1 } = {}) {
  const c = getContext();
  const t = when;
  const peak = 0.32 * velocity;

  const noteGain = c.createGain();
  noteGain.gain.setValueAtTime(0.0001, t);
  noteGain.gain.linearRampToValueAtTime(peak, t + 0.003);
  noteGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  noteGain.connect(dest);

  const oscs = [];
  for (const [type, detune, gain] of [
    ['triangle', -4, 0.5],
    ['triangle', 4, 0.5],
    ['sawtooth', 0, 0.18],
  ]) {
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const g = c.createGain();
    g.gain.value = gain;
    osc.connect(g);
    g.connect(noteGain);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    oscs.push([osc, g]);
  }
  const [lastOsc] = oscs[oscs.length - 1];
  lastOsc.onended = () => {
    for (const [osc, g] of oscs) {
      osc.disconnect();
      g.disconnect();
    }
    noteGain.disconnect();
  };
}

// Shared per-chord lowpass sweeping down fakes pluck damping.
function chordFilter(when, lowestFreq, dur) {
  const c = getContext();
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  const start = Math.min(lowestFreq * 4, 6000);
  filter.frequency.setValueAtTime(start, when);
  filter.frequency.exponentialRampToValueAtTime(1200, when + 0.4);
  filter.connect(getBus('chord'));
  setTimeout(() => filter.disconnect(), (when - c.currentTime + dur + 0.5) * 1000);
  return filter;
}

export function playChord(midis, { when = 0, strumMs = 14, dir = 'down', dur = 2.2, velocity = 1 } = {}) {
  if (!midis || midis.length === 0) return;
  const c = ensureRunning();
  const t0 = when && when > c.currentTime ? when : c.currentTime + 0.02;
  const ordered = dir === 'down' ? midis : [...midis].reverse();
  const lowest = midiToFreq(Math.min(...midis));
  const filter = chordFilter(t0, lowest, dur);
  ordered.forEach((midi, k) => {
    const vel = velocity * (1 - 0.15 * (k / Math.max(1, ordered.length - 1)));
    pluckInto(filter, midiToFreq(midi), t0 + (k * strumMs) / 1000, { dur, velocity: vel });
  });
}

export function playNote(midi, { when = 0, dur = 1.2, velocity = 1 } = {}) {
  const c = ensureRunning();
  const t0 = when && when > c.currentTime ? when : c.currentTime + 0.02;
  const filter = chordFilter(t0, midiToFreq(midi), dur);
  pluckInto(filter, midiToFreq(midi), t0, { dur, velocity });
}

// ---- Drone ----
let droneHandle = null;

export const drone = {
  start(rootC) {
    drone.stop();
    const c = ensureRunning();
    let rootMidi = 40 + ((rootC - 4 + 12) % 12) - 12;
    if (rootMidi < 28) rootMidi += 12; // floor E1
    const f = midiToFreq(rootMidi);

    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, c.currentTime);
    out.gain.linearRampToValueAtTime(0.08, c.currentTime + 2);

    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.connect(out);
    out.connect(getBus('drone'));

    const nodes = [];
    for (const [type, freq, detune, gain] of [
      ['sine', f, 0, 0.6],
      ['triangle', f, 3, 0.35],
      ['sine', f * Math.pow(2, 7 / 12), 0, 0.2], // fifth, ~-10dB
      ['sine', f * 2, 0, 0.12], // octave, ~-14dB
    ]) {
      const osc = c.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = c.createGain();
      g.gain.value = gain;
      osc.connect(g);
      g.connect(filter);
      osc.start();
      nodes.push([osc, g]);
    }

    // slow breathing: LFO modulates output gain ±10%
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.008;
    lfo.connect(lfoGain);
    lfoGain.connect(out.gain);
    lfo.start();
    nodes.push([lfo, lfoGain]);

    droneHandle = { out, filter, nodes };
  },

  stop() {
    if (!droneHandle) return;
    const c = getContext();
    const { out, filter, nodes } = droneHandle;
    droneHandle = null;
    out.gain.cancelScheduledValues(c.currentTime);
    out.gain.setValueAtTime(out.gain.value, c.currentTime);
    out.gain.linearRampToValueAtTime(0.0001, c.currentTime + 2);
    setTimeout(() => {
      for (const [osc, g] of nodes) {
        try {
          osc.stop();
        } catch {
          // already stopped
        }
        osc.disconnect();
        g.disconnect();
      }
      filter.disconnect();
      out.disconnect();
    }, 2200);
  },

  isOn() {
    return droneHandle !== null;
  },
};
