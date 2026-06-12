import { useSyncExternalStore } from 'react';
import { KEYS, readKey, writeKey, appendCapped } from './storage.js';
import { KEY_CYCLE } from '../data/notes.js';

// Running-session singleton: lives outside the route tree so the timer keeps
// going while the user browses tools. Components subscribe via useSession().
let active = null;
// active: { dayIdx, week, key, track, blockIdx, timer: {startedAt, pausedAccum, pausedAt, extraMs},
//           blockLog: [], sessionStartedAt, chimed }

const listeners = new Set();

function emit() {
  writeKey(KEYS.sessionDraft, active ? { ...active, savedAt: Date.now() } : null);
  for (const l of listeners) l();
}

function freshTimer() {
  return { startedAt: Date.now(), pausedAccum: 0, pausedAt: null, extraMs: 0 };
}

export function getSession() {
  return active;
}

export function subscribeSession(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useSession() {
  return useSyncExternalStore(subscribeSession, getSession);
}

export function readSessionDraft() {
  const d = readKey(KEYS.sessionDraft, null);
  return d && Date.now() - d.sessionStartedAt < 12 * 3600_000 ? d : null;
}

export const sessionStore = {
  start({ dayIdx, week, key, track }) {
    if (active) return;
    active = {
      dayIdx,
      week,
      key,
      track,
      blockIdx: 0,
      timer: freshTimer(),
      blockLog: [],
      sessionStartedAt: Date.now(),
      chimed: false,
    };
    emit();
  },

  // resume a persisted draft; time while the tab was dead doesn't count as practice
  adoptDraft(draft) {
    if (active) return;
    const savedAt = draft.savedAt || Date.now();
    const timer = draft.timer.pausedAt
      ? draft.timer
      : { ...draft.timer, pausedAccum: draft.timer.pausedAccum + (Date.now() - savedAt) };
    active = {
      ...draft,
      // drafts from the pre-store version have no key field
      key: draft.key ?? KEY_CYCLE[(draft.week - 1) % KEY_CYCLE.length],
      timer,
      chimed: false,
    };
    delete active.savedAt;
    emit();
  },

  discardDraft() {
    writeKey(KEYS.sessionDraft, null);
  },

  togglePause() {
    if (!active) return;
    const t = active.timer;
    const timer = t.pausedAt
      ? { ...t, pausedAccum: t.pausedAccum + (Date.now() - t.pausedAt), pausedAt: null }
      : { ...t, pausedAt: Date.now() };
    active = { ...active, timer };
    emit();
  },

  addFive() {
    if (!active) return;
    active = { ...active, timer: { ...active.timer, extraMs: active.timer.extraMs + 5 * 60_000 }, chimed: false };
    emit();
  },

  markChimed() {
    if (!active || active.chimed) return;
    active = { ...active, chimed: true };
    emit();
  },

  // entry = completed-block log row built by the view (it knows tasks/titles)
  advance(entry) {
    if (!active) return;
    active = {
      ...active,
      blockLog: [...active.blockLog, entry],
      blockIdx: active.blockIdx + 1,
      timer: freshTimer(),
      chimed: false,
    };
    emit();
  },

  // step back one block: drop its log row so redoing it re-logs cleanly
  goPrev() {
    if (!active || active.blockIdx === 0) return;
    active = {
      ...active,
      blockLog: active.blockLog.slice(0, active.blockIdx - 1),
      blockIdx: active.blockIdx - 1,
      timer: freshTimer(),
      chimed: false,
    };
    emit();
  },

  finish(record) {
    appendCapped(KEYS.history, record);
    active = null;
    emit();
  },

  abandon() {
    active = null;
    emit();
  },
};

// ---- shared timer math ----

export function timerNow(a) {
  const t = a.timer;
  const paused = t.pausedAccum + (t.pausedAt ? Date.now() - t.pausedAt : 0);
  const elapsedMs = Date.now() - t.startedAt - paused;
  return { elapsedMs, isPaused: !!t.pausedAt };
}

export function fmtMs(ms) {
  const neg = ms < 0;
  const s = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${neg ? '+' : ''}${m}:${ss}`;
}
