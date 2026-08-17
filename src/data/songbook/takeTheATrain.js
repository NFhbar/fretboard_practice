export const TAKE_THE_A_TRAIN = {
  id: 'take-the-a-train',
  title: 'Take the “A” Train',
  composer: 'Billy Strayhorn',
  associatedArtist: 'Duke Ellington Orchestra',
  key: 'C',
  meter: { beatsPerBar: 4, beatUnit: 4 },
  form: ['A', 'A', 'B', 'A'],
  sections: {
    A: [
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'C6', root: 'C', quality: 'maj6', function: 'I' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'C6', root: 'C', quality: 'maj6', function: 'I' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'D7', root: 'D', quality: 'dom7', function: 'V/V' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'D7', root: 'D', quality: 'dom7', function: 'V/V' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'Dm9', root: 'D', quality: 'min9', function: 'ii' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'G7', root: 'G', quality: 'dom7', function: 'V' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'C6', root: 'C', quality: 'maj6', function: 'I' }] },
      {
        changes: [
          { beat: 0, durationBeats: 2, symbol: 'Dm7', root: 'D', quality: 'min7', function: 'ii' },
          { beat: 2, durationBeats: 2, symbol: 'G7', root: 'G', quality: 'dom7', function: 'V' },
        ],
      },
    ],
    B: [
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'Fmaj7', root: 'F', quality: 'maj7', function: 'IV' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'Fmaj7', root: 'F', quality: 'maj7', function: 'IV' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'Fmaj7', root: 'F', quality: 'maj7', function: 'IV' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'Fmaj7', root: 'F', quality: 'maj7', function: 'IV' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'D7', root: 'D', quality: 'dom7', function: 'V/V' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'D7', root: 'D', quality: 'dom7', function: 'V/V' }] },
      { changes: [{ beat: 0, durationBeats: 4, symbol: 'Dm9', root: 'D', quality: 'min9', function: 'ii' }] },
      {
        changes: [
          { beat: 0, durationBeats: 2, symbol: 'G7', root: 'G', quality: 'dom7', function: 'V' },
          { beat: 2, durationBeats: 2, symbol: 'G7♭9', root: 'G', quality: 'dom7b9', function: 'V' },
        ],
      },
    ],
  },
  melody: null,
};
