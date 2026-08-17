import { getSchedule } from './scheduleMerged.js';
import { getSong } from './songbook/index.js';

export function resolveCurriculum(context = {}) {
  if (context.curriculum === 'songbook') {
    const song = getSong(context.songId);
    if (!song) return null;
    return {
      curriculum: 'songbook',
      id: song.id,
      title: song.title,
      key: song.key,
      days: song.curriculum,
      song,
    };
  }

  const track = context.track || 'major';
  return {
    curriculum: 'weekly',
    id: track,
    title: track === 'harmonic-minor' ? 'Harmonic Minor' : 'Major',
    key: context.key || null,
    days: getSchedule(track),
  };
}

export function resolveSessionDay(context) {
  const resolved = resolveCurriculum(context);
  if (!resolved) return null;
  const index = Math.max(0, Math.min(Number(context.dayIdx) || 0, resolved.days.length - 1));
  return { ...resolved, dayIdx: index, day: resolved.days[index] };
}

export function sessionPath(context) {
  if (context?.curriculum === 'songbook' && context.songId) {
    return `songbook/${context.songId}/session/${context.dayIdx || 0}`;
  }
  return `session/${context?.dayIdx || 0}`;
}
