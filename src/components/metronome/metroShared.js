import { useAppState } from '../../state/AppState.jsx';
import { setVolume } from '../../audio/engine.js';

export const SIGS = [
  { id: '2/4', beats: 2, def: [2, 1] },
  { id: '3/4', beats: 3, def: [2, 1, 1] },
  { id: '4/4', beats: 4, def: [2, 1, 1, 1] },
  { id: '5/4', beats: 5, def: [2, 1, 1, 1, 1] },
  { id: '6/8', beats: 6, def: [2, 1, 1, 2, 1, 1] },
  { id: '7/8', beats: 7, def: [2, 1, 1, 2, 1, 2, 1] },
  { id: '9/8', beats: 9, def: [2, 1, 1, 2, 1, 1, 2, 1, 1] },
  { id: '12/8', beats: 12, def: [2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1] },
];

export const SUBS = [
  { id: 'quarter', label: '♩', name: 'Quarter notes', sub: 1 },
  { id: 'eighth', label: '♪♪', name: 'Eighth notes', sub: 2 },
  { id: 'swing-eighth', label: '♪³', name: 'Swing eighths', sub: [0, 2 / 3] },
  { id: 'dotted8-16', label: '♪·♬', name: 'Dotted 8th + 16th', sub: [0, 0.75] },
  { id: 'triplet', label: '³', name: 'Triplets', sub: 3 },
  { id: 'sixteenth', label: '♬♬', name: 'Sixteenth notes', sub: 4 },
  { id: 'quintuplet', label: '⁵', name: 'Quintuplets', sub: 5 },
  { id: 'sextuplet', label: '⁶', name: 'Sextuplets', sub: 6 },
];

export const SOUNDS = [
  { id: 'tick', label: 'Tick', desc: 'Woodblock' },
  { id: 'beep', label: 'Beep', desc: 'Soft tone' },
  { id: 'click', label: 'Click', desc: 'Sharp digital' },
];

// legacy persisted numeric values from the first version
const LEGACY_SUBS = { 1: 'quarter', 2: 'eighth', 3: 'triplet', 4: 'sixteenth' };

export function findSub(idOrNum) {
  const id = typeof idOrNum === 'number' ? LEGACY_SUBS[idOrNum] : idOrNum;
  return SUBS.find((s) => s.id === id) || SUBS[0];
}

export function findSig(id) {
  return SIGS.find((s) => s.id === id) || SIGS[2];
}

export function effectiveAccents(cfg, sig) {
  return cfg.accents && cfg.accents.length === sig.beats ? cfg.accents : sig.def;
}

// metronome.start(...) options derived from the shared config
export function startOptions(cfg) {
  const sig = findSig(cfg.sigId);
  const subDef = findSub(cfg.subdivision);
  const ticks = Array.isArray(subDef.sub) ? subDef.sub.length : subDef.sub;
  return {
    bpm: cfg.bpm,
    beatsPerBar: sig.beats,
    subdivision: subDef.sub,
    clickOnSub: ticks > 1,
    accents: effectiveAccents(cfg, sig),
    sound: cfg.sound || 'tick',
  };
}

export function tempoName(bpm) {
  if (bpm < 40) return 'Grave';
  if (bpm < 60) return 'Largo';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 156) return 'Allegro';
  if (bpm < 176) return 'Vivace';
  if (bpm < 200) return 'Presto';
  return 'Prestissimo';
}

export const clampBpm = (v) => Math.max(20, Math.min(300, Math.round(v)));

// Volume slider (0..1) drives the click bus up to 1.6x — the compressor catches peaks,
// so full slider is genuinely loud instead of topping out below the chord playback.
export function applyClickVolume(cfg) {
  setVolume('click', (cfg.volume ?? 0.9) * 1.6);
}

// One persisted config shared live by the global panel, loop players, and sessions.
export function useMetronomeConfig() {
  const { metroCfg, setMetroCfg } = useAppState();
  return [metroCfg, setMetroCfg];
}

// Any component can pop the global metronome sheet open.
const OPEN_EVENT = 'fp:open-metronome';
export function openMetronomeSheet() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}
export function onOpenMetronomeSheet(handler) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
