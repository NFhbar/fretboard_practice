import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppState } from '../state/AppState.jsx';
import { resolveSessionDay } from '../data/curriculumRegistry.js';
import { useSession, getSession, sessionStore, readSessionDraft, timerNow, fmtMs } from '../state/sessionStore.js';
import { useWakeLock } from '../hooks/useWakeLock.js';
import { playChime } from '../audio/engine.js';
import { drone } from '../audio/voices.js';
import { noteToChromatic, normalizeKey } from '../data/notes.js';
import { openMetronomeSheet } from '../components/metronome/metroShared.js';

export default function SessionView({ dayIdx, curriculum = 'weekly', songId = null, onClose, onOpenActivity }) {
  const {
    track,
    week,
    currentKey,
    tasks,
    toggleTaskForWeek,
    songbook,
    toggleSongTask,
  } = useAppState();
  const active = useSession();
  const [summary, setSummary] = useState(null);
  const [draft, setDraft] = useState(() => (getSession() ? null : readSessionDraft()));
  const [, forceRender] = useState(0);
  const requested = useMemo(
    () => resolveSessionDay({ curriculum, songId, dayIdx, track, week, key: currentKey }),
    [curriculum, songId, dayIdx, track, week, currentKey]
  );

  // no active session and no draft to ask about -> start immediately
  useEffect(() => {
    if (!active && !draft && !summary && requested) {
      sessionStore.start({
        dayIdx: requested.dayIdx,
        week,
        key: requested.key || currentKey,
        track,
        curriculum,
        songId,
      });
    }
  }, [active, draft, summary, requested, week, currentKey, track, curriculum, songId]);

  useWakeLock(!!active);

  // render tick (timestamp math keeps it correct in background)
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => forceRender((x) => x + 1), 500);
    const onVis = () => forceRender((x) => x + 1);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [active]);

  const resolved = useMemo(() => (active ? resolveSessionDay(active) : requested), [active, requested]);
  const day = resolved?.day;
  const block = active ? day.blocks[active.blockIdx] : null;
  const sessionTasks = useMemo(
    () => active
      ? active.curriculum === 'songbook'
        ? songbook[active.songId]?.tasks || {}
        : tasks[active.week] || {}
      : {},
    [active, songbook, tasks]
  );
  const toggleSessionTask = (taskId) => {
    if (!active) return;
    if (active.curriculum === 'songbook') toggleSongTask(active.songId, taskId);
    else toggleTaskForWeek(active.week, taskId);
  };

  const { elapsedMs, isPaused } = active ? timerNow(active) : { elapsedMs: 0, isPaused: false };
  const plannedMs = block ? block.min * 60_000 + active.timer.extraMs : 0;
  const remainingMs = plannedMs - elapsedMs;
  const overrun = remainingMs < 0;

  useEffect(() => {
    if (active && overrun && !active.chimed) {
      playChime();
      sessionStore.markChimed();
    }
  }, [active, overrun]);

  const buildEntry = useCallback(
    (skipped) => ({
      title: block.title,
      plannedMin: block.min,
      actualSec: Math.max(0, Math.round(timerNow(active).elapsedMs / 1000)),
      tasksDone: block.tasks.filter((t) => sessionTasks[t.id]).length,
      tasksTotal: block.tasks.length,
      skipped,
    }),
    [block, active, sessionTasks]
  );

  const buildRecord = useCallback(
    (log, completed) => ({
      id: `s${Date.now()}`,
      ts: new Date().toISOString(),
      week: active.week,
      key: active.key,
      track: active.track,
      curriculum: active.curriculum || 'weekly',
      songId: active.songId || null,
      songTitle: active.curriculum === 'songbook' ? resolved.title : null,
      dayIdx: active.dayIdx,
      day: day.day,
      focus: day.focus,
      plannedMin: day.totalMin,
      actualSec: log.reduce((a, b) => a + b.actualSec, 0),
      blocks: log,
      completed,
    }),
    [active, day, resolved]
  );

  const advance = useCallback(
    (skipped = false) => {
      const entry = buildEntry(skipped);
      if (active.blockIdx + 1 < day.blocks.length) {
        sessionStore.advance(entry);
      } else {
        drone.stop();
        const record = buildRecord([...active.blockLog, entry], true);
        sessionStore.finish(record);
        setSummary(record);
      }
    },
    [active, day, buildEntry, buildRecord]
  );

  const endEarly = useCallback(() => {
    if (!window.confirm('End session? Progress so far will be saved.')) return;
    drone.stop();
    const record = buildRecord([...active.blockLog, buildEntry(false)], false);
    sessionStore.finish(record);
    setSummary(record);
  }, [active, buildEntry, buildRecord]);

  // ---------- resume prompt ----------
  if (!active && draft && !summary) {
    const draftResolved = resolveSessionDay(draft);
    if (!draftResolved) {
      return (
        <div className="session-screen">
          <div className="session-summary">
            <div className="session-summary-title">Session unavailable</div>
            <button
              className="session-ctl primary"
              onClick={() => {
                sessionStore.discardDraft();
                setDraft(null);
              }}
            >
              Discard session
            </button>
          </div>
        </div>
      );
    }
    const dDay = draftResolved.day;
    const draftLabel = draft.curriculum === 'songbook'
      ? `${draftResolved.title} · ${draft.key}`
      : `${draft.key} ${draft.track === 'major' ? 'Major' : 'Harm. Minor'}`;
    return (
      <div className="session-screen">
        <div className="session-summary">
          <div className="session-summary-title">Resume session?</div>
          <div className="session-summary-sub">
            Unfinished {dDay.day} session ({draftLabel}) — block {draft.blockIdx + 1} of {dDay.blocks.length}.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="session-ctl primary"
              onClick={() => {
                sessionStore.adoptDraft(draft);
                setDraft(null);
              }}
            >
              Resume
            </button>
            <button
              className="session-ctl"
              onClick={() => {
                sessionStore.discardDraft();
                setDraft(null);
              }}
            >
              Restart day
            </button>
            <button className="session-ctl danger" onClick={() => onClose({ curriculum, songId })}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- summary ----------
  if (summary) {
    const mins = Math.round(summary.actualSec / 60);
    const tasksDone = summary.blocks.reduce((a, b) => a + b.tasksDone, 0);
    const tasksTotal = summary.blocks.reduce((a, b) => a + b.tasksTotal, 0);
    return (
      <div className="session-screen">
        <div className="session-summary">
          <div className="session-summary-title">Session complete</div>
          <div className="session-summary-sub">
            {summary.day} — {summary.focus} · {summary.curriculum === 'songbook'
              ? summary.songTitle
              : `${summary.key} ${summary.track === 'major' ? 'Major' : 'Harm. Minor'}`}
          </div>
          <div className="session-stat-row">
            <div className="session-stat">
              <span className="session-stat-label">Time</span>
              <span className="session-stat-val">{mins} min</span>
            </div>
            <div className="session-stat">
              <span className="session-stat-label">Planned</span>
              <span className="session-stat-val">{summary.plannedMin} min</span>
            </div>
            <div className="session-stat">
              <span className="session-stat-label">Tasks</span>
              <span className="session-stat-val">{tasksDone}/{tasksTotal}</span>
            </div>
          </div>
          {summary.blocks.map((b, i) => (
            <div key={i} className="session-block-row">
              <span style={{ color: b.skipped ? 'var(--text-faint)' : 'var(--green-bright)' }}>{b.skipped ? '↷' : '✓'}</span>
              <span style={{ flex: 1 }}>{b.title}</span>
              <span style={{ color: 'var(--text-faint)' }}>{Math.round(b.actualSec / 60)}/{b.plannedMin}m</span>
              <span style={{ color: 'var(--text-faint)' }}>{b.tasksDone}/{b.tasksTotal}</span>
            </div>
          ))}
          <div style={{ marginTop: 20 }}>
            <button className="session-ctl primary" onClick={() => onClose(summary)}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  if (!active || !block) return null; // starting up

  const isImprov = /improv|drone/i.test(block.title);
  const droneOn = drone.isOn();

  return (
    <div className="session-screen">
      <div className="session-top">
        <button className="session-minimize" onClick={() => onClose(active)} title="Minimize — session keeps running while you use the tools">
          ⌄
        </button>
        <span className="session-block-count">Block {active.blockIdx + 1}/{day.blocks.length}</span>
        <span className="session-block-title">{block.title}</span>
        <span className="session-elapsed">session {fmtMs(Date.now() - active.sessionStartedAt)}</span>
      </div>

      <div className="session-blocks-strip" aria-label="Blocks in this session">
        {day.blocks.map((b, i) => {
          const state = i < active.blockIdx ? 'done' : i === active.blockIdx ? 'now' : 'todo';
          return (
            <div key={i} className={`sblock-chip ${state}`} title={`${b.title} · ${b.min} min`}>
              <span className="sblock-num">{state === 'done' ? '✓' : i + 1}</span>
              <span className="sblock-title">{b.title}</span>
              <span className="sblock-min">{b.min}m</span>
            </div>
          );
        })}
      </div>

      <div className="session-timer-wrap">
        <div className={`session-timer ${overrun ? 'overrun' : ''}`} aria-live="off">
          {fmtMs(overrun ? -remainingMs : remainingMs)}
        </div>
        <div className="session-timer-sub">
          {isPaused ? 'Paused' : overrun ? 'Block time elapsed' : `${block.min} min block${active.timer.extraMs ? ` +${active.timer.extraMs / 60000}` : ''}`}
        </div>
      </div>

      {overrun && (
        <div className="session-overrun-banner">
          <span>Block time elapsed — wrap up or keep going.</span>
          <button className="session-ctl" onClick={() => sessionStore.addFive()}>+5 min</button>
          <button className="session-ctl primary" onClick={() => advance(false)}>Next block →</button>
        </div>
      )}

      <div className="session-tasks">
        {block.tasks.map((task) => (
          <div className="song-task-row" key={task.id}>
            <button
              className={`task ${sessionTasks[task.id] ? 'done' : ''}`}
              aria-pressed={!!sessionTasks[task.id]}
              onClick={() => toggleSessionTask(task.id)}
            >
              <div className={`task-check ${sessionTasks[task.id] ? 'done' : ''}`}>{sessionTasks[task.id] ? '✓' : ''}</div>
              <div>
                <div className="task-label">{task.label}</div>
                {task.note && <div className="task-note">{task.note}</div>}
              </div>
            </button>
            {active.curriculum === 'songbook' && task.activity && onOpenActivity && (
              <button className="song-task-open" onClick={() => onOpenActivity(active.songId, task.id)} aria-label={`Open ${task.label} in Song Lab`}>
                Lab ↗
              </button>
            )}
          </div>
        ))}
      </div>

      {active.blockIdx + 1 < day.blocks.length && (
        <div className="session-next">
          Next up — <b>{day.blocks[active.blockIdx + 1].title}</b> · {day.blocks[active.blockIdx + 1].min} min
        </div>
      )}

      <div className="session-controls">
        {active.blockIdx > 0 && (
          <button className="session-ctl" onClick={() => sessionStore.goPrev()} title="Back to the previous block (its time re-logs when you advance again)">
            ← Prev
          </button>
        )}
        <button className="session-ctl primary" onClick={() => sessionStore.togglePause()}>
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button className="session-ctl" onClick={() => advance(true)}>↷ Skip</button>
        {!overrun && (
          <button className="session-ctl" onClick={() => sessionStore.addFive()}>+5 min</button>
        )}
        {active.blockIdx + 1 < day.blocks.length && !overrun && (
          <button className="session-ctl" onClick={() => advance(false)}>Next →</button>
        )}
        <button className="session-ctl" onClick={openMetronomeSheet}>◔ Metronome</button>
        {isImprov && (
          <button
            className={`session-ctl ${droneOn ? 'primary' : ''}`}
            onClick={() => {
              if (drone.isOn()) drone.stop();
              else drone.start(noteToChromatic(normalizeKey(active.key)));
              forceRender((x) => x + 1);
            }}
          >
            ∿ Drone {active.key}
          </button>
        )}
        <button className="session-ctl danger" onClick={endEarly}>End session</button>
      </div>
    </div>
  );
}
