// Semitone stacks for chord qualities (pitch classes relative to root).
export const QUALITY_INTERVALS = {
  // triads
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  // sevenths
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  m7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  augmaj7: [0, 4, 8, 11],
  'maj7#5': [0, 4, 8, 11],
  mmaj7: [0, 3, 7, 11],
  mMaj7: [0, 3, 7, 11],
  aug7: [0, 4, 8, 10],
  // legacy display names
  Maj: [0, 4, 7],
};

export const EXTENDED_QUALITY_INTERVALS = {
  maj6: [0, 4, 7, 9],
  min9: [0, 3, 7, 10, 14],
  dom7b9: [0, 4, 7, 10, 13],
};

export function intervalsFromQuality(quality) {
  return EXTENDED_QUALITY_INTERVALS[quality] || QUALITY_INTERVALS[quality] || QUALITY_INTERVALS.maj;
}

export function pitchClassesFromQuality(rootC, quality) {
  return intervalsFromQuality(quality).map((interval) => (rootC + interval) % 12);
}

export function tonesFromQuality(rootC, quality) {
  const ivs = QUALITY_INTERVALS[quality] || QUALITY_INTERVALS.maj;
  const [r, t, f, s] = ivs.map((x) => (rootC + x) % 12);
  return { rootC: r, thirdC: t, fifthC: f, seventhC: ivs.length > 3 ? s : undefined };
}
