const SCHEMA_VERSION = 1;

export const KEYS = {
  schemaVersion: 'fp.schemaVersion',
  settings: 'fp.settings',
  week: 'fp.week',
  tasks: 'fp.tasks',
  mastery: 'fp.mastery',
  completedWeeks: 'fp.completedWeeks',
  history: 'fp.history',
  drillLog: 'fp.drillLog',
  sessionDraft: 'fp.sessionDraft',
  metronome: 'fp.metronome',
};

export const DEFAULTS = {
  [KEYS.settings]: {
    track: 'major',
    accidentals: 'auto',
    lefty: false,
    labelMode: 'intervals',
    boardTheme: 'dark',
    loopChords: true,
  },
  [KEYS.week]: 1,
  [KEYS.metronome]: {
    bpm: 100,
    sigId: '4/4',
    accents: [2, 1, 1, 1],
    subdivision: 'quarter',
    sound: 'tick',
    volume: 0.9,
  },
  [KEYS.tasks]: {},
  [KEYS.mastery]: {},
  [KEYS.completedWeeks]: [],
  [KEYS.history]: [],
  [KEYS.drillLog]: [],
  [KEYS.sessionDraft]: null,
};

export const CAPS = {
  [KEYS.history]: 200,
  [KEYS.drillLog]: 500,
};

export function readKey(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeKey(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — practice on regardless
  }
}

export function appendCapped(key, entry) {
  const list = readKey(key, []);
  list.push(entry);
  const cap = CAPS[key];
  const trimmed = cap && list.length > cap ? list.slice(list.length - cap) : list;
  writeKey(key, trimmed);
  return trimmed;
}

export function migrate() {
  const stored = readKey(KEYS.schemaVersion, null);
  if (stored === null) {
    writeKey(KEYS.schemaVersion, SCHEMA_VERSION);
    return;
  }
  if (stored === SCHEMA_VERSION) return;
  // future migrations: if (stored < 2) { ...transform keys... }
  writeKey(KEYS.schemaVersion, SCHEMA_VERSION);
}
