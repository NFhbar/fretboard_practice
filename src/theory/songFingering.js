import { buildCagedBands } from './noteMap.js';
import { CAGED_SHAPES } from '../data/cagedShapes.js';
import { getVariants } from '../data/cagedMeta.js';
import { OPEN_STRINGS, noteToChromatic, normalizeKey } from '../data/notes.js';

const OPEN_MIDI = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 };

function fullBands(key) {
  const bands = buildCagedBands(key, 'all');
  const maxSpan = {};
  for (const band of bands) {
    const span = band.maxFret - band.minFret;
    maxSpan[band.shape] = Math.max(maxSpan[band.shape] ?? 0, span);
  }
  return bands.filter((band) => band.maxFret - band.minFret === maxSpan[band.shape]);
}

export function getSongZones(key) {
  const firstByShape = {};
  for (const band of fullBands(key)) {
    if (!firstByShape[band.shape] || band.minFret < firstByShape[band.shape].minFret) {
      firstByShape[band.shape] = band;
    }
  }
  return Object.values(firstByShape)
    .sort((a, b) => a.minFret - b.minFret)
    .map((band, index) => ({
      id: `zone-${index + 1}`,
      label: `Zone ${index + 1}`,
      tonalShape: band.shape,
      minFret: band.minFret,
      maxFret: band.maxFret,
    }));
}

export function resolveZone(key, zoneId) {
  if (zoneId === 'full') {
    return { id: 'full', label: 'Full neck', tonalShape: null, minFret: 0, maxFret: 24 };
  }
  const zones = getSongZones(key);
  return zones.find((zone) => zone.id === zoneId) || zones[0];
}

function overlap(a, b) {
  return Math.max(0, Math.min(a.maxFret, b.maxFret) - Math.max(a.minFret, b.minFret) + 1);
}

export function selectChordShapeForZone(root, zone) {
  if (zone.id === 'full') return null;
  const candidates = buildCagedBands(root, 'all').map((band) => {
    const spill = Math.max(0, zone.minFret - band.minFret) + Math.max(0, band.maxFret - zone.maxFret);
    const centerDistance = Math.abs((band.minFret + band.maxFret) / 2 - (zone.minFret + zone.maxFret) / 2);
    return { ...band, overlap: overlap(band, zone), spill, centerDistance };
  });
  return candidates.sort((a, b) => b.overlap - a.overlap || a.spill - b.spill || a.centerDistance - b.centerDistance)[0] || null;
}

function roleForInterval(interval) {
  const normalized = interval % 12;
  if (normalized === 0) return 'R';
  if (normalized === 3) return '♭3';
  if (normalized === 4) return '3';
  if (normalized === 6) return '♭5';
  if (normalized === 7) return '5';
  if (normalized === 8) return '♯5';
  if (normalized === 9) return '6';
  if (normalized === 10) return '♭7';
  if (normalized === 11) return '7';
  if (interval === 13) return '♭9';
  if (interval === 14) return '9';
  return String(interval);
}

function cagedQuality(intervals) {
  const normalized = new Set(intervals.map((interval) => interval % 12));
  if (normalized.has(11)) return 'Maj7';
  if (normalized.has(10) && normalized.has(3)) return 'Min7';
  if (normalized.has(10)) return 'Dom7';
  if (normalized.has(3)) return 'Minor';
  return 'Major';
}

function cagedArpeggioPositions(root, shape, intervals) {
  const data = CAGED_SHAPES[cagedQuality(intervals)]?.[shape]?.arpeggio;
  const dots = getVariants(data)[0] || [];
  const rootDot = dots.find((dot) => dot.r);
  if (!rootDot) return new Set();
  const rootC = noteToChromatic(normalizeKey(root));
  const templateRoot = (OPEN_STRINGS[6 - rootDot.s] + rootDot.f) % 12;
  const offset = (rootC - templateRoot + 12) % 12;
  const positions = new Set();
  for (const shift of [offset - 12, offset, offset + 12, offset + 24]) {
    for (const dot of dots) {
      const fret = dot.f + shift;
      if (fret >= 0 && fret <= 24) positions.add(`${dot.s}:${fret}`);
    }
  }
  return positions;
}

export function chordPositionsInZone(root, intervals, zone) {
  const rootC = noteToChromatic(normalizeKey(root));
  const roles = new Map(intervals.map((interval) => [(rootC + interval) % 12, roleForInterval(interval)]));
  const shapeBand = selectChordShapeForZone(root, zone);
  const allowed = shapeBand ? cagedArpeggioPositions(root, shapeBand.shape, intervals) : null;
  const basePcs = new Set();
  if (allowed) {
    for (const position of allowed) {
      const [string, fret] = position.split(':').map(Number);
      basePcs.add((OPEN_MIDI[string] + fret) % 12);
    }
  }
  const extensionPcs = new Set([...roles.keys()].filter((pc) => !basePcs.has(pc)));
  const minFret = shapeBand ? Math.max(0, Math.min(shapeBand.minFret, zone.minFret - 1)) : zone.minFret;
  const maxFret = shapeBand ? Math.min(24, Math.max(shapeBand.maxFret, zone.maxFret + 1)) : zone.maxFret;
  const positions = [];

  for (let string = 1; string <= 6; string++) {
    for (let fret = minFret; fret <= maxFret; fret++) {
      const midi = OPEN_MIDI[string] + fret;
      const pc = midi % 12;
      if (allowed && !allowed.has(`${string}:${fret}`) && !extensionPcs.has(pc)) continue;
      const role = roles.get(pc);
      if (!role) continue;
      positions.push({ string, fret, midi, role, isRoot: role === 'R' });
    }
  }

  return {
    shape: shapeBand?.shape || null,
    band: shapeBand,
    positions: positions.sort((a, b) => a.midi - b.midi),
  };
}

export function melodyCandidates(midi, zone) {
  const out = [];
  for (let string = 1; string <= 6; string++) {
    const fret = midi - OPEN_MIDI[string];
    if (fret < zone.minFret || fret > zone.maxFret || fret < 0 || fret > 24) continue;
    out.push({ string, fret, midi });
  }
  return out;
}

export function solveMelodyFingering(events, zone, { octaveShift = 0, overrides = {} } = {}) {
  if (!events?.length) return [];
  const layers = events.map((event) => {
    const midi = event.midi + octaveShift * 12;
    const override = overrides[event.id];
    if (
      override &&
      OPEN_MIDI[override.string] + override.fret === midi &&
      override.fret >= zone.minFret &&
      override.fret <= zone.maxFret
    ) {
      return [{ ...override, midi }];
    }
    return melodyCandidates(midi, zone);
  });
  if (layers.some((layer) => layer.length === 0)) return null;

  const states = layers.map(() => []);
  const center = (zone.minFret + zone.maxFret) / 2;
  states[0] = layers[0].map((candidate) => ({
    candidate,
    cost: Math.abs(candidate.fret - center) * 0.25,
    previous: -1,
  }));

  for (let index = 1; index < layers.length; index++) {
    states[index] = layers[index].map((candidate) => {
      let best = null;
      states[index - 1].forEach((prior, priorIndex) => {
        const movement = Math.abs(candidate.fret - prior.candidate.fret) + Math.abs(candidate.string - prior.candidate.string) * 1.5;
        const cost = prior.cost + movement;
        if (!best || cost < best.cost) best = { candidate, cost, previous: priorIndex };
      });
      return best;
    });
  }

  let cursor = states.at(-1).reduce((best, state, index, list) => (state.cost < list[best].cost ? index : best), 0);
  const path = Array(events.length);
  for (let index = events.length - 1; index >= 0; index--) {
    const state = states[index][cursor];
    path[index] = { ...events[index], ...state.candidate };
    cursor = state.previous;
  }
  return path;
}
