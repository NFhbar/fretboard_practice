// Unique color per degree: I=gold, ii=blue, iii=teal, IV=orange, V=red, vi=purple, vii°=rose
export const TRIAD_COLORS = [
  '#c9963a', '#5b8abd', '#4a9e8e', '#d4782f', '#c75454', '#8e6bbf', '#c46a8a',
];

// 12 distinct colors for the 12 parent keys in the mode matrix (dark-theme tuned)
export const FAMILY_COLORS = {
  0:  { bg: '#fce4cc', fg: '#8a5a2a' },  // C
  1:  { bg: '#f2dde0', fg: '#8a3a3a' },  // C#/Db
  2:  { bg: '#dde8f2', fg: '#3a5a80' },  // D
  3:  { bg: '#e8dff2', fg: '#6a3a8a' },  // D#/Eb
  4:  { bg: '#d8f0d8', fg: '#2a6a2a' },  // E
  5:  { bg: '#f0e6d0', fg: '#6a5530' },  // F
  6:  { bg: '#e0e0e0', fg: '#555' },      // F#/Gb
  7:  { bg: '#d0eaf0', fg: '#2a5a6a' },  // G
  8:  { bg: '#f0d0e8', fg: '#7a2a6a' },  // G#/Ab
  9:  { bg: '#f5f0c0', fg: '#6a6a20' },  // A
  10: { bg: '#d0f0e8', fg: '#2a6a5a' },  // A#/Bb
  11: { bg: '#e0d8f0', fg: '#4a3a7a' },  // B
};

export const COF_KEYS = ['C','G','D','A','E','B','Gb','Db','Ab','Eb','Bb','F'];
export const COF_DISPLAY = { 'Gb':'G♭/F♯', 'Db':'D♭', 'Ab':'A♭', 'Eb':'E♭', 'Bb':'B♭' };
