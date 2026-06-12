// One-shot verbatim extraction of large data blocks from the legacy file.
// Usage: node scripts/extract-data.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync(new URL('../fretboard-practice.jsx', import.meta.url), 'utf8');
const lines = src.split('\n');

// 1-indexed, inclusive
function slice(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

function assertStarts(text, expected, name) {
  if (!text.trimStart().startsWith(expected)) {
    throw new Error(`${name}: expected slice to start with "${expected}", got "${text.trimStart().slice(0, 60)}..."`);
  }
}
function assertEnds(text, expected, name) {
  if (!text.trimEnd().endsWith(expected)) {
    throw new Error(`${name}: expected slice to end with "${expected}", got "...${text.trimEnd().slice(-60)}"`);
  }
}

const schedule = slice(274, 580);
assertStarts(schedule, 'const SCHEDULE = [', 'SCHEDULE');
assertEnds(schedule, '];', 'SCHEDULE');

const hmEndIdx = lines.findIndex((l, i) => i >= 583 && l.trimEnd() === '];');
if (hmEndIdx < 0 || hmEndIdx > 890) throw new Error('SCHEDULE_HARM_MINOR end not found near expected range');
const scheduleHm = slice(583, hmEndIdx + 1);
assertStarts(scheduleHm, 'const SCHEDULE_HARM_MINOR = [', 'SCHEDULE_HARM_MINOR');
assertEnds(scheduleHm, '];', 'SCHEDULE_HARM_MINOR');

const caged = slice(1479, 3933);
assertStarts(caged, 'const CAGED_SHAPES = {', 'CAGED_SHAPES');
assertEnds(caged, '}};', 'CAGED_SHAPES');

writeFileSync(
  new URL('../src/data/schedule.js', import.meta.url),
  '// Verbatim from legacy fretboard-practice.jsx (lines 274-580)\nexport ' + schedule + '\n'
);
writeFileSync(
  new URL('../src/data/scheduleHarmMinor.js', import.meta.url),
  '// ── Harmonic Minor Weekly Schedule ── (verbatim from legacy lines 583-' + (hmEndIdx + 1) + ')\nexport ' + scheduleHm + '\n'
);
writeFileSync(
  new URL('../src/data/cagedShapes.js', import.meta.url),
  '// Each dot: { s: string (1=high E, 6=low E), f: fret, i: interval label, r: is root }\n// Verbatim from legacy fretboard-practice.jsx (lines 1479-3933)\nexport ' + caged + '\n'
);

console.log('Extracted: schedule.js (%d lines), scheduleHarmMinor.js (%d lines), cagedShapes.js (%d lines)',
  schedule.split('\n').length, scheduleHm.split('\n').length, caged.split('\n').length);
