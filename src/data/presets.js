// Strumming patterns: 8 eighth-note slots per bar, D=down U=up x=mute -=rest
export const STRUM_SYMBOLS = ['↓','↑','x','–'];
export const STRUM_PRESETS = [
  { name: 'Quarter',   pattern: ['↓','–','↓','–','↓','–','↓','–'] },
  { name: 'Folk 8ths', pattern: ['↓','↑','↓','↑','↓','↑','↓','↑'] },
  { name: 'Pop/Rock',  pattern: ['↓','–','↓','↑','–','↑','↓','↑'] },
  { name: 'Island',    pattern: ['–','↓','↑','–','↓','↑','–','↑'] },
  { name: 'Ballad',    pattern: ['↓','–','–','↑','↓','↑','–','↑'] },
];

export const PROG_PRESETS = [
  { name: 'I–V–vi–IV',    degrees: [0, 4, 5, 3] },
  { name: 'I–IV–V–I',     degrees: [0, 3, 4, 0] },
  { name: 'I–vi–IV–V',    degrees: [0, 5, 3, 4] },
  { name: 'ii–V–I',       degrees: [1, 4, 0] },
  { name: 'vi–IV–I–V',    degrees: [5, 3, 0, 4] },
  { name: 'I–IV–vi–V',    degrees: [0, 3, 5, 4] },
];
