import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from '../state/AppState.jsx';
import { SCHEDULE } from '../data/schedule.js';
import { SCHEDULE_HARM_MINOR } from '../data/scheduleHarmMinor.js';
import { KEYS, readKey, writeKey } from '../state/storage.js';
import { useWakeLock } from '../hooks/useWakeLock.js';
import { metronome } from '../audio/metronome.js';
import { ensureRunning } from '../audio/engine.js';
import { drone } from '../audio/voices.js';
import { noteToChromatic, normalizeKey } from '../data/notes.js';
import { openMetronomeSheet } from '../components/metronome/metroShared.js';

function fmt(ms) {
  const neg = ms < 0;
  const s = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${neg ? '+' : ''}${m}:${ss}`;
}

function chime() {
  try {
    const c = ensureRunning();
    [0, 0.18].forEach((off, i) => {
      const t = c.currentTime + off;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.frequency.value = i === 0 ? 880 : 1320;
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch {
    // audio unavailable
  }
}

export default function SessionView({ dayIdx, onClose }) {
  const { track, week, currentKey, weekTasks, toggleTask, logHistory } = useAppState();
  const schedule = track === 'major' ? SCHEDULE : SCHEDULE_HARM_MINOR;
  const day = schedule[Math.min(dayIdx, schedule.length - 1)];

  const draftInit = useRef(null);
  if (draftInit.current === null) {
    const d = readKey(KEYS.sessionDraft, null);
    draftInit.current =
      d && d.dayIdx === dayIdx && d.week === week && d.track === track && Date.now() - d.sessionStartedAt < 12 * 3600_000
        ? d
        : false;
  }

  const [phase, setPhase] = useState(draftInit.current ? 'resume' : 'running');
  const [blockIdx, setBlockIdx] = useState(draftInit.current ? draftInit.current.blockIdx : 0);
  const [timer, setTimer] = useState(() =>
    draftInit.current
      ? draftInit.current.timer
      : { startedAt: Date.now(), pausedAccum: 0, pausedAt: null, extraMs: 0 }
  );
  const [blockLog, setBlockLog] = useState(draftInit.current ? draftInit.current.blockLog : []);
  const [sessionStartedAt] = useState(draftInit.current ? draftInit.current.sessionStartedAt : Date.now());
  const [, forceRender] = useState(0);
  const chimedRef = useRef(false);
  const [summary, setSummary] = useState(null);

  const block = day.blocks[blockIdx];
  const running = phase === 'running';
  useWakeLock(running);

  // re-render tick (timestamp math keeps it correct in background)
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => forceRender((x) => x + 1), 500);
    const onVis = () => forceRender((x) => x + 1);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [running]);

  // persist draft on every state transition
  useEffect(() => {
    if (phase === 'running') {
      writeKey(KEYS.sessionDraft, { dayIdx, week, track, blockIdx, timer, blockLog, sessionStartedAt, savedAt: Date.now() });
    }
  }, [phase, dayIdx, week, track, blockIdx, timer, blockLog, sessionStartedAt]);

  const now = Date.now();
  const pausedMs = timer.pausedAccum + (timer.pausedAt ? now - timer.pausedAt : 0);
  const elapsedMs = now - timer.startedAt - pausedMs;
  const plannedMs = block ? block.min * 60_000 + timer.extraMs : 0;
  const remainingMs = plannedMs - elapsedMs;
  const overrun = remainingMs < 0;
  const paused = !!timer.pausedAt;

  useEffect(() => {
    if (running && overrun && !chimedRef.current) {
      chimedRef.current = true;
      chime();
    }
  }, [running, overrun]);

  const blockTasksDone = block ? block.tasks.filter((t) => weekTasks[t.id]).length : 0;

  const logBlock = useCallback(
    (skipped) => ({
      title: block.title,
      plannedMin: block.min,
      actualSec: Math.max(0, Math.round(elapsedMs / 1000)),
      tasksDone: blockTasksDone,
      tasksTotal: block.tasks.length,
      skipped,
    }),
    [block, elapsedMs, blockTasksDone]
  );

  const finish = useCallback(
    (log, completed) => {
      drone.stop();
      metronome.stop();
      const record = {
        id: `s${Date.now()}`,
        ts: new Date().toISOString(),
        week,
        key: currentKey,
        track,
        dayIdx,
        day: day.day,
        focus: day.focus,
        plannedMin: day.totalMin,
        actualSec: log.reduce((a, b) => a + b.actualSec, 0),
        blocks: log,
        completed,
      };
      logHistory(record);
      writeKey(KEYS.sessionDraft, null);
      setSummary(record);
      setPhase('summary');
    },
    [week, currentKey, track, dayIdx, day, logHistory]
  );

  const advance = useCallback(
    (skipped = false) => {
      const entry = logBlock(skipped);
      const nextLog = [...blockLog, entry];
      chimedRef.current = false;
      if (blockIdx + 1 < day.blocks.length) {
        setBlockLog(nextLog);
        setBlockIdx(blockIdx + 1);
        setTimer({ startedAt: Date.now(), pausedAccum: 0, pausedAt: null, extraMs: 0 });
      } else {
        finish(nextLog, true);
      }
    },
    [blockIdx, blockLog, day.blocks.length, logBlock, finish]
  );

  const endEarly = useCallback(() => {
    if (!window.confirm('End session? Progress so far will be saved.')) return;
    finish([...blockLog, logBlock(false)], false);
  }, [blockLog, logBlock, finish]);

  const togglePause = () =>
    setTimer((t) =>
      t.pausedAt
        ? { ...t, pausedAccum: t.pausedAccum + (Date.now() - t.pausedAt), pausedAt: null }
        : { ...t, pausedAt: Date.now() }
    );

  const isImprov = block && /improv|drone/i.test(block.title);
  const droneOn = drone.isOn();

  if (phase === 'resume') {
    return (
      <div className="session-screen">
        <div className="session-summary">
          <div className="session-summary-title">Resume session?</div>
          <div className="session-summary-sub">
            You have an unfinished {day.day} session (block {blockIdx + 1} of {day.blocks.length}).
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="session-ctl primary"
              onClick={() => {
                // time while the tab was dead doesn't count as practice
                const savedAt = draftInit.current?.savedAt || Date.now();
                setTimer((t) => (t.pausedAt ? t : { ...t, pausedAccum: t.pausedAccum + (Date.now() - savedAt) }));
                setPhase('running');
              }}
            >
              Resume
            </button>
            <button
              className="session-ctl"
              onClick={() => {
                writeKey(KEYS.sessionDraft, null);
                setBlockIdx(0);
                setBlockLog([]);
                setTimer({ startedAt: Date.now(), pausedAccum: 0, pausedAt: null, extraMs: 0 });
                setPhase('running');
              }}
            >
              Restart day
            </button>
            <button className="session-ctl danger" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'summary' && summary) {
    const mins = Math.round(summary.actualSec / 60);
    const tasksDone = summary.blocks.reduce((a, b) => a + b.tasksDone, 0);
    const tasksTotal = summary.blocks.reduce((a, b) => a + b.tasksTotal, 0);
    return (
      <div className="session-screen">
        <div className="session-summary">
          <div className="session-summary-title">Session complete</div>
          <div className="session-summary-sub">{day.day} — {day.focus} · {currentKey} {track === 'major' ? 'Major' : 'Harm. Minor'}</div>
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
            <button className="session-ctl primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-screen">
      <div className="session-top">
        <span className="session-block-count">Block {blockIdx + 1}/{day.blocks.length}</span>
        <span className="session-block-title">{block.title}</span>
        <span className="session-elapsed">session {fmt(now - sessionStartedAt - 0)}</span>
      </div>

      <div className="session-timer-wrap">
        <div className={`session-timer ${overrun ? 'overrun' : ''}`} aria-live="off">
          {fmt(overrun ? -remainingMs : remainingMs)}
        </div>
        <div className="session-timer-sub">
          {paused ? 'Paused' : overrun ? 'Block time elapsed' : `${block.min} min block${timer.extraMs ? ` +${timer.extraMs / 60000}` : ''}`}
        </div>
      </div>

      {overrun && (
        <div className="session-overrun-banner">
          <span>Block time elapsed — wrap up or keep going.</span>
          <button className="session-ctl" onClick={() => { setTimer((t) => ({ ...t, extraMs: t.extraMs + 5 * 60_000 })); chimedRef.current = false; }}>+5 min</button>
          <button className="session-ctl primary" onClick={() => advance(false)}>Next block →</button>
        </div>
      )}

      <div className="session-tasks">
        {block.tasks.map((task) => (
          <button key={task.id} className={`task ${weekTasks[task.id] ? 'done' : ''}`} onClick={() => toggleTask(task.id)}>
            <div className={`task-check ${weekTasks[task.id] ? 'done' : ''}`}>{weekTasks[task.id] ? '✓' : ''}</div>
            <div>
              <div className="task-label">{task.label}</div>
              {task.note && <div className="task-note">{task.note}</div>}
            </div>
          </button>
        ))}
      </div>

      {blockIdx + 1 < day.blocks.length && (
        <div className="session-next">
          Next up — <b>{day.blocks[blockIdx + 1].title}</b> · {day.blocks[blockIdx + 1].min} min
        </div>
      )}

      <div className="session-controls">
        <button className="session-ctl primary" onClick={togglePause}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
        <button className="session-ctl" onClick={() => advance(true)}>↷ Skip</button>
        {!overrun && (
          <button className="session-ctl" onClick={() => setTimer((t) => ({ ...t, extraMs: t.extraMs + 5 * 60_000 }))}>+5 min</button>
        )}
        {blockIdx + 1 < day.blocks.length && !overrun && (
          <button className="session-ctl" onClick={() => advance(false)}>Next →</button>
        )}
        <button className="session-ctl" onClick={openMetronomeSheet}>◔ Metronome</button>
        {isImprov && (
          <button
            className={`session-ctl ${droneOn ? 'primary' : ''}`}
            onClick={() => {
              if (drone.isOn()) drone.stop();
              else drone.start(noteToChromatic(normalizeKey(currentKey)));
              forceRender((x) => x + 1);
            }}
          >
            ∿ Drone {currentKey}
          </button>
        )}
        <button className="session-ctl danger" onClick={endEarly}>End session</button>
      </div>
    </div>
  );
}
