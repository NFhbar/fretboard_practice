export const KEY_CYCLE = ['C','F','Bb','Eb','Ab','Db','Gb','B','E','A','D','G'];

export const CHROMATIC = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
export const CHROMATIC_FLAT = ['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
export const ENHARMONIC_MAP = {'D♭':'C♯','E♭':'D♯','G♭':'F♯','A♭':'G♯','B♭':'A♯','C♭':'B','F♭':'E','C♯':'C♯','D♯':'D♯','F♯':'F♯','G♯':'G♯','A♯':'A♯'};
export const OPEN_STRINGS = [4, 9, 2, 7, 11, 4]; // string6=E, string5=A, string4=D, string3=G, string2=B, string1=E (semitones from C)

export function noteToChromatic(n) { return ENHARMONIC_MAP[n] !== undefined ? CHROMATIC.indexOf(ENHARMONIC_MAP[n]) : CHROMATIC.indexOf(n); }
export function fretNote(stringIdx, fret) { return CHROMATIC[(OPEN_STRINGS[stringIdx] + fret) % 12]; }

// Normalize app key names ('Bb', 'Gb'...) to display glyph form ('B♭', 'G♭')
export function normalizeKey(key) {
  return key.length > 1 && key[1] === 'b' ? key[0] + '♭' : key;
}
