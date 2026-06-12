import { useMemo } from 'react';
import { useAppState } from '../state/AppState.jsx';
import { KEYS, readKey } from '../state/storage.js';
import { KEY_CYCLE } from '../data/notes.js';
import { MASTERY_ITEMS } from '../data/mastery.js';
import { categoryStats } from './drill/drillGen.js';

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

export default function ProgressView() {
  const { mastery, completedWeeks } = useAppState();
  const history = useMemo(() => readKey(KEYS.history, []), []);
  const drillLog = useMemo(() => readKey(KEYS.drillLog, []), []);

  const { streak, weekMinutes, totalSessions, bars } = useMemo(() => {
    const byDay = new Set(history.map((h) => h.ts.slice(0, 10)));
    let s = 0;
    const cursor = new Date();
    if (!byDay.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // streak survives until today is missed
    while (byDay.has(dayKey(cursor))) {
      s++;
      cursor.setDate(cursor.getDate() - 1);
    }
    const now = Date.now();
    const wkMin = Math.round(
      history.filter((h) => now - new Date(h.ts).getTime() < 7 * 86400_000).reduce((a, b) => a + b.actualSec, 0) / 60
    );
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = now - (i + 1) * 7 * 86400_000;
      const end = now - i * 7 * 86400_000;
      const mins = Math.round(
        history.filter((h) => {
          const t = new Date(h.ts).getTime();
          return t >= start && t < end;
        }).reduce((a, b) => a + b.actualSec, 0) / 60
      );
      weeks.push(mins);
    }
    return { streak: s, weekMinutes: wkMin, totalSessions: history.length, bars: weeks };
  }, [history]);

  const weakSpots = useMemo(() => {
    const stats = categoryStats(drillLog);
    return Object.entries(stats)
      .filter(([, s]) => s.attempts >= 3)
      .map(([cat, s]) => ({ cat, acc: s.correct / s.attempts, attempts: s.attempts }))
      .sort((a, b) => a.acc - b.acc)
      .slice(0, 5);
  }, [drillLog]);

  const maxBar = Math.max(1, ...bars);
  const recent = [...history].reverse().slice(0, 10);

  return (
    <div className="page">
      <div className="header">
        <div className="header-eyebrow">Practice Log</div>
        <div className="header-title">Progress</div>
        <div className="header-sub">Sessions, streaks, mastery and weak spots</div>
      </div>

      <div className="stat-cards">
        <div className="stat-card card">
          <span className="stat-card-label">Streak</span>
          <span className="stat-card-val">{streak}</span>
          <span className="stat-card-sub">day{streak === 1 ? '' : 's'} in a row</span>
        </div>
        <div className="stat-card card">
          <span className="stat-card-label">Last 7 days</span>
          <span className="stat-card-val">{weekMinutes}</span>
          <span className="stat-card-sub">minutes practiced</span>
        </div>
        <div className="stat-card card">
          <span className="stat-card-label">Sessions</span>
          <span className="stat-card-val">{totalSessions}</span>
          <span className="stat-card-sub">logged total</span>
        </div>
        <div className="stat-card card">
          <span className="stat-card-label">Weeks done</span>
          <span className="stat-card-val">{completedWeeks.length}</span>
          <span className="stat-card-sub">key-weeks completed</span>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div className="section-label">Minutes per week — last 8 weeks</div>
        {bars.every((b) => b === 0) ? (
          <div className="empty-note">No sessions yet — start one from the Practice tab.</div>
        ) : (
          <div className="bars-row">
            {bars.map((m, i) => (
              <div key={i} className="bars-col">
                <div className="bars-bar" style={{ height: `${(m / maxBar) * 100}%`, background: i === bars.length - 1 ? 'var(--gold)' : 'var(--gold-dim)' }} title={`${m} min`} />
                <span className="bars-label">{i === bars.length - 1 ? 'now' : `-${bars.length - 1 - i}w`}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div className="section-label">Mastery — all 12 keys</div>
        <div className="heatmap">
          {KEY_CYCLE.map((k) => {
            const count = mastery[k] ? Object.values(mastery[k]).filter(Boolean).length : 0;
            const pct = count / MASTERY_ITEMS.length;
            return (
              <div
                key={k}
                className="heatmap-cell"
                style={{
                  background: pct > 0 ? `rgba(201,150,58,${0.08 + pct * 0.5})` : 'var(--surface)',
                  borderColor: pct === 1 ? 'var(--gold)' : 'var(--line)',
                  color: pct > 0.5 ? '#0c0c0f' : 'var(--text-dim)',
                }}
                title={`${k}: ${count}/${MASTERY_ITEMS.length}`}
              >
                {k}
                <span className="heatmap-cell-pct" style={{ color: pct > 0.5 ? 'rgba(12,12,15,0.7)' : 'var(--text-faint)' }}>
                  {count}/{MASTERY_ITEMS.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {weakSpots.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div className="section-label">Drill weak spots</div>
          <div className="drill-summary-grid">
            {weakSpots.map((w) => (
              <div key={w.cat} className="drill-cat-row">
                <span>{w.cat}</span>
                <span style={{ color: 'var(--text-faint)', fontSize: 10 }}>({w.attempts} tries)</span>
                <span className="drill-cat-acc" style={{ color: w.acc < 0.5 ? 'var(--red)' : 'var(--gold)' }}>
                  {Math.round(w.acc * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-label" style={{ padding: '16px 16px 0' }}>Recent sessions</div>
        {recent.length === 0 ? (
          <div className="empty-note">Session history will appear here.</div>
        ) : (
          recent.map((h) => (
            <div key={h.id} className="history-row">
              <span style={{ color: h.completed ? 'var(--green-bright)' : 'var(--text-faint)' }}>{h.completed ? '✓' : '◐'}</span>
              <span style={{ color: 'var(--text-dim)' }}>{new Date(h.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <span style={{ flex: 1 }}>{h.day} — {h.focus}</span>
              <span className="badge-gold">{h.key}</span>
              <span style={{ color: 'var(--text-faint)' }}>{Math.round(h.actualSec / 60)}m</span>
            </div>
          ))
        )}
      </div>

      {completedWeeks.length > 0 && (
        <div className="card">
          <div className="section-label" style={{ padding: '16px 16px 0' }}>Completed weeks</div>
          {[...completedWeeks].reverse().map((w, i) => (
            <div key={i} className="history-row">
              <span className="badge-gold">{w.key}</span>
              <span style={{ flex: 1 }}>Week {w.week} · {w.track === 'major' ? 'Major' : 'Harm. Minor'}</span>
              <span style={{ color: 'var(--text-faint)' }}>{new Date(w.completedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
