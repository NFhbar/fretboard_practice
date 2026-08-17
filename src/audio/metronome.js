import { getContext, ensureRunning, playClick } from './engine.js';

const LOOKAHEAD_MS = 25;
const HORIZON_S = 0.1;
const QUEUE_CAP = 64; // visuals may not be draining (panel closed) — don't grow unbounded

// Per-beat accent levels: 2 = accent, 1 = normal click, 0 = muted
const state = {
  running: false,
  bpm: 80,
  beatsPerBar: 4,
  subdivision: 1, // number (equal division) or array of fractional offsets within the beat
  pattern: [0],
  sound: 'tick', // 'tick' | 'beep' | 'click'
  clickOnSub: false,
  accents: null, // null -> default: accent beat 1, normal elsewhere
  pending: null, // config change waiting for the next beat boundary
  onSchedule: null,
  owner: null,
  nextTime: 0,
  tick: 0,
  timer: null,
  queue: [],
  lastBeat: null,
};

// subdivision: N -> N equal ticks; array -> custom offsets, e.g. dotted 8th-16th = [0, 0.75]
function normalizePattern(subdivision) {
  if (Array.isArray(subdivision) && subdivision.length > 0) return subdivision;
  const n = Math.max(1, subdivision | 0);
  return Array.from({ length: n }, (_, i) => i / n);
}

function levelForBeat(beatIdx) {
  if (state.accents && state.accents.length === state.beatsPerBar) {
    return state.accents[beatIdx];
  }
  return beatIdx === 0 ? 2 : 1;
}

// Timing-affecting changes only land on a beat boundary so the pulse never shifts.
// Pure subdivision swaps keep the bar/beat position; meter changes restart the bar there.
function applyPendingAtBoundary() {
  const p = state.pending;
  state.pending = null;

  const oldTicksPerBeat = state.pattern.length;
  const oldTicksPerBar = state.beatsPerBar * oldTicksPerBeat;
  const beatIdx = Math.floor((state.tick % oldTicksPerBar) / oldTicksPerBeat);
  const bar = Math.floor(state.tick / oldTicksPerBar);

  const newBeats = p.beatsPerBar !== undefined ? p.beatsPerBar : state.beatsPerBar;
  const meterChange = newBeats !== state.beatsPerBar;

  if (p.subdivision !== undefined) {
    state.subdivision = p.subdivision;
    state.pattern = normalizePattern(p.subdivision);
  }
  if (p.clickOnSub !== undefined) state.clickOnSub = p.clickOnSub;
  if (p.accents !== undefined) state.accents = p.accents;
  state.beatsPerBar = newBeats;

  const newTicksPerBeat = state.pattern.length;
  state.tick = meterChange
    ? 0 // this boundary becomes beat 1 of the new meter
    : (bar * state.beatsPerBar + beatIdx) * newTicksPerBeat; // same bar/beat, new tick grid
}

function schedulerTick() {
  const c = getContext();
  while (state.nextTime < c.currentTime + HORIZON_S) {
    // the tick about to be scheduled is on the beat iff tick % ticksPerBeat === 0
    if (state.pending && state.tick % state.pattern.length === 0) {
      applyPendingAtBoundary();
    }

    const ticksPerBeat = state.pattern.length;
    const ticksPerBar = state.beatsPerBar * ticksPerBeat;
    const tickInBar = state.tick % ticksPerBar;
    const beatIdx = Math.floor(tickInBar / ticksPerBeat);
    const beat = beatIdx + 1; // 1-based
    const sub = tickInBar % ticksPerBeat; // 0 = on the beat
    const bar = Math.floor(state.tick / ticksPerBar);
    const isDownbeat = tickInBar === 0;

    if (sub === 0) {
      const level = levelForBeat(beatIdx);
      if (level > 0) playClick(state.nextTime, level === 2, state.sound);
    } else if (state.clickOnSub) {
      playClick(state.nextTime, 'sub', state.sound);
    }

    const event = { time: state.nextTime, bar, beat, sub, isDownbeat };
    state.queue.push(event);
    if (state.queue.length > QUEUE_CAP) state.queue.splice(0, state.queue.length - QUEUE_CAP);
    if (state.onSchedule) state.onSchedule(event);

    // non-uniform advance: gap to the next offset in the pattern (wrapping into the next beat)
    const beatDur = 60 / state.bpm;
    const gap =
      sub + 1 < ticksPerBeat
        ? state.pattern[sub + 1] - state.pattern[sub]
        : 1 - state.pattern[sub];
    state.nextTime += gap * beatDur;
    state.tick++;
  }
}

export const metronome = {
  start({ bpm = 80, beatsPerBar = 4, subdivision = 1, clickOnSub = false, accents = null, sound = 'tick', onSchedule = null, owner = null } = {}) {
    metronome.stop();
    const c = ensureRunning();
    state.bpm = bpm;
    state.beatsPerBar = beatsPerBar;
    state.subdivision = subdivision;
    state.pattern = normalizePattern(subdivision);
    state.clickOnSub = clickOnSub;
    state.accents = accents;
    state.sound = sound;
    state.pending = null;
    state.onSchedule = onSchedule;
    state.owner = owner;
    state.tick = 0;
    state.queue = [];
    state.lastBeat = null;
    state.nextTime = c.currentTime + 0.05;
    state.running = true;
    schedulerTick();
    state.timer = setInterval(schedulerTick, LOOKAHEAD_MS);
  },

  stop() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    state.running = false;
    state.pending = null;
    state.queue = [];
    state.lastBeat = null;
    state.onSchedule = null;
    state.owner = null;
  },

  setBpm(bpm) {
    state.bpm = bpm;
  },

  // Accent/sound edits apply instantly; subdivision/meter changes wait for the next
  // beat boundary so the established pulse never shifts.
  update({ beatsPerBar, subdivision, clickOnSub, accents, sound } = {}) {
    if (sound !== undefined) state.sound = sound;
    const timingChange =
      (beatsPerBar !== undefined && beatsPerBar !== state.beatsPerBar) ||
      (subdivision !== undefined && subdivision !== state.subdivision);

    if (state.running && (timingChange || state.pending)) {
      const p = state.pending || {};
      if (beatsPerBar !== undefined) p.beatsPerBar = beatsPerBar;
      if (subdivision !== undefined) p.subdivision = subdivision;
      if (clickOnSub !== undefined) p.clickOnSub = clickOnSub;
      if (accents !== undefined) p.accents = accents;
      state.pending = p;
      return;
    }

    if (beatsPerBar !== undefined) state.beatsPerBar = beatsPerBar;
    if (subdivision !== undefined) {
      state.subdivision = subdivision;
      state.pattern = normalizePattern(subdivision);
    }
    if (clickOnSub !== undefined) state.clickOnSub = clickOnSub;
    if (accents !== undefined) state.accents = accents;
  },

  isRunning() {
    return state.running;
  },

  getState() {
    return {
      running: state.running,
      bpm: state.bpm,
      beatsPerBar: state.beatsPerBar,
      subdivision: state.subdivision,
      clickOnSub: state.clickOnSub,
      accents: state.accents,
      sound: state.sound,
      owner: state.owner,
    };
  },

  // Pop all events whose scheduled time has arrived; UI calls this from rAF.
  drainBeats() {
    if (!state.running) return [];
    const now = getContext().currentTime;
    const due = [];
    while (state.queue.length && state.queue[0].time <= now) due.push(state.queue.shift());
    if (due.length) state.lastBeat = due[due.length - 1];
    return due;
  },

  // Last event that became due — readable by a second UI without competing for the queue.
  getLastBeat() {
    return state.running ? state.lastBeat || null : null;
  },
};
