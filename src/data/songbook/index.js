import { TAKE_THE_A_TRAIN } from './takeTheATrain.js';
import { TAKE_THE_A_TRAIN_WEEK } from './takeTheATrainWeek.js';

export const SONGBOOK = [
  {
    ...TAKE_THE_A_TRAIN,
    curriculum: TAKE_THE_A_TRAIN_WEEK,
  },
];

export function getSong(songId) {
  return SONGBOOK.find((song) => song.id === songId) || null;
}

export function getSongActivity(songId, activityId) {
  const song = getSong(songId);
  if (!song) return null;
  for (const day of song.curriculum) {
    for (const block of day.blocks) {
      const task = block.tasks.find((item) => item.id === activityId);
      if (task) return { day, block, task, activity: task.activity || null };
    }
  }
  return null;
}
