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

// ---- Backup (export / import) ----

const IMPORT_STAGING = 'fp.importStaging';

export function buildBackup() {
  const data = {};
  for (const key of Object.values(KEYS)) {
    if (key === KEYS.sessionDraft) continue; // ephemeral, device-specific
    const v = readKey(key, undefined);
    if (v !== undefined) data[key] = v;
  }
  return {
    app: 'fretboard-practice',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function validateBackup(payload) {
  if (!payload || payload.app !== 'fretboard-practice' || typeof payload.data !== 'object' || payload.data === null) {
    return { ok: false, reason: 'Not a fretboard-practice backup file.' };
  }
  if ((payload.schemaVersion || 1) > SCHEMA_VERSION) {
    return { ok: false, reason: 'This backup is from a newer app version — update the app first.' };
  }
  return { ok: true };
}

// Imports replace data via a staging slot applied at boot (before React mounts),
// so live components flushing state on unload can't clobber the imported keys.
export function stageImport(data) {
  sessionStorage.setItem(IMPORT_STAGING, JSON.stringify(data));
}

export function applyStagedImport() {
  let raw;
  try {
    raw = sessionStorage.getItem(IMPORT_STAGING);
    if (!raw) return;
    sessionStorage.removeItem(IMPORT_STAGING);
    const data = JSON.parse(raw);
    for (const key of Object.values(KEYS)) {
      if (key in data) writeKey(key, data[key]);
      else if (key !== KEYS.schemaVersion) localStorage.removeItem(key);
    }
  } catch {
    // corrupt staging — drop it rather than wreck existing data
    sessionStorage.removeItem(IMPORT_STAGING);
  }
}
