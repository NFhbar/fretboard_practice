import { useRef, useState } from 'react';
import { buildBackup, validateBackup, stageImport } from '../state/storage.js';

function summarize(payload) {
  const d = payload.data || {};
  const parts = [];
  const history = d['fp.history'];
  const drills = d['fp.drillLog'];
  const mastery = d['fp.mastery'];
  const weeks = d['fp.completedWeeks'];
  const songbook = d['fp.songbook'];
  if (d['fp.week']) parts.push(`week ${d['fp.week']}`);
  if (Array.isArray(history)) parts.push(`${history.length} session${history.length === 1 ? '' : 's'}`);
  if (Array.isArray(drills)) parts.push(`${drills.length} drill answers`);
  if (mastery) parts.push(`mastery for ${Object.keys(mastery).length} key${Object.keys(mastery).length === 1 ? '' : 's'}`);
  if (Array.isArray(weeks) && weeks.length) parts.push(`${weeks.length} completed week${weeks.length === 1 ? '' : 's'}`);
  if (songbook && Object.keys(songbook).length) parts.push(`${Object.keys(songbook).length} songbook entr${Object.keys(songbook).length === 1 ? 'y' : 'ies'}`);
  const when = payload.exportedAt ? new Date(payload.exportedAt).toLocaleString() : 'unknown date';
  return { when, summary: parts.length ? parts.join(' · ') : 'settings only' };
}

export default function BackupControls() {
  const fileRef = useRef(null);
  const [error, setError] = useState(null);

  const exportBackup = () => {
    const payload = buildBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fretboard-backup-${payload.exportedAt.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file) => {
    setError(null);
    try {
      const payload = JSON.parse(await file.text());
      const check = validateBackup(payload);
      if (!check.ok) {
        setError(check.reason);
        return;
      }
      const { when, summary } = summarize(payload);
      const ok = window.confirm(
        `Import backup from ${when}?\n\nContains: ${summary}\n\nThis REPLACES all practice data on this device. Export a backup of this device first if you want to keep it.`
      );
      if (!ok) return;
      stageImport(payload.data);
      window.location.reload();
    } catch {
      setError('Could not read that file — it does not look like a valid backup.');
    }
  };

  return (
    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
      <div className="section-label">Backup — move your data between devices</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="toolbtn" onClick={exportBackup}>⬇ Export backup</button>
        <button className="toolbtn" onClick={() => fileRef.current?.click()}>⬆ Import backup</button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="visually-hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = ''; // allow re-importing the same file
            if (f) importFile(f);
          }}
        />
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 10, lineHeight: 1.5 }}>
        Export downloads a JSON file with your tasks, sessions, drills, mastery, songbook progress and settings.
        Import replaces everything on this device with the file's contents.
      </div>
      {error && (
        <div style={{ fontSize: 13, color: 'var(--red)', marginTop: 8 }}>{error}</div>
      )}
    </div>
  );
}
