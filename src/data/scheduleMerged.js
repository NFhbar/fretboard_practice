import { SCHEDULE } from './schedule.js';
import { SCHEDULE_HARM_MINOR } from './scheduleHarmMinor.js';
import { CHROMATIC_BLOCKS, CHROMATIC_BLOCKS_HM } from './chromaticism.js';

// The base schedule files are verbatim legacy extractions and stay untouched;
// curriculum extensions (chromaticism) merge in here at runtime.
function merge(base, extras) {
  return base.map((day, i) => {
    const extra = extras[i];
    if (!extra) return day;
    return {
      ...day,
      totalMin: day.totalMin + extra.min,
      blocks: [...day.blocks, extra],
    };
  });
}

const MERGED = {
  major: merge(SCHEDULE, CHROMATIC_BLOCKS),
  'harmonic-minor': merge(SCHEDULE_HARM_MINOR, CHROMATIC_BLOCKS_HM),
};

export function getSchedule(track) {
  return MERGED[track] || MERGED.major;
}
