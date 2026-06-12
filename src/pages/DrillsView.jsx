import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from '../state/AppState.jsx';
import { KEYS, readKey } from '../state/storage.js';
import { buildPool, categoryStats, pickPrompts, buildAnswer } from './drill/drillGen.js';
import { playClick, ensureRunning } from '../audio/engine.js';
import Fretboard from '../components/Fretboard/Fretboard.jsx';
import { cagedDotMarkers } from '../components/Fretboard/markers.js';
import Segmented from '../components/ui/Segmented.jsx';

const TYPE_OPTIONS = [
  { id: 'chord', label: 'Chord shapes', desc: 'Quality · inversion · string set' },
  { id: 'note', label: 'Note finding', desc: 'Locate every occurrence of a note' },
  { id: 'interval', label: 'Intervals', desc: 'Find an interval above a root on one string' },
];

function CountdownRing({ deadline, totalMs, onExpire }) {
  const [, force] = useState(0);
  const rafRef = useRef(null);
  const lastTickRef = useRef(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    lastTickRef.current = null;
    const loop = () => {
      const left = deadline - Date.now();
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
        return;
      }
      if (left <= 3200) {
        const sec = Math.ceil(left / 1000);
        if (lastTickRef.current !== sec) {
          lastTickRef.current = sec;
          try {
            ensureRunning();
            playClick(undefined, sec <= 1);
          } catch {
            // no audio yet
          }
        }
      }
      force((x) => x + 1);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [deadline, onExpire]);

  const left = Math.max(0, deadline - Date.now());
  const frac = totalMs > 0 ? left / totalMs : 0;
  const R = 42;
  const circ = 2 * Math.PI * R;
  return (
    <div className="drill-countdown" aria-hidden="true">
      <svg viewBox="0 0 96 96" width="96" height="96">
        <circle cx="48" cy="48" r={R} fill="none" stroke="var(--line-2)" strokeWidth="5" />
        <circle
          cx="48" cy="48" r={R} fill="none"
          stroke={left < 3200 ? 'var(--amber)' : 'var(--gold)'} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - frac)}
          strokeLinecap="round" transform="rotate(-90 48 48)"
        />
      </svg>
      <div className="drill-countdown-num">{Math.ceil(left / 1000)}</div>
    </div>
  );
}

export default function DrillsView() {
  const { currentKey, track, logDrill, settings } = useAppState();
  const [types, setTypes] = useState(['chord']);
  const [includeSevenths, setIncludeSevenths] = useState(true);
  const [count, setCount] = useState(10);
  const [countdown, setCountdown] = useState(10);
  const [weighted, setWeighted] = useState(true);

  const [run, setRun] = useState(null); // { prompts, idx, results, stage: 'prompt'|'reveal', deadline }
  const [showAlt, setShowAlt] = useState(false);

  const startRun = () => {
    if (types.length === 0) return;
    const pool = buildPool({ key: currentKey, track, types, includeSevenths });
    if (pool.length === 0) return;
    const stats = categoryStats(readKey(KEYS.drillLog, []));
    const prompts = pickPrompts(pool, { count, weighted, stats });
    setRun({ prompts, idx: 0, results: [], stage: 'prompt', deadline: Date.now() + countdown * 1000 });
    setShowAlt(false);
  };

  const reveal = useCallback(() => {
    setRun((r) => (r && r.stage === 'prompt' ? { ...r, stage: 'reveal' } : r));
  }, []);

  const grade = (correct) => {
    const prompt = run.prompts[run.idx];
    logDrill({
      ts: new Date().toISOString(),
      type: prompt.type,
      key: currentKey,
      promptKey: prompt.promptKey,
      category: prompt.category,
      correct,
    });
    const results = [...run.results, { prompt, correct }];
    if (run.idx + 1 >= run.prompts.length) {
      setRun({ ...run, results, stage: 'summary' });
    } else {
      setShowAlt(false);
      setRun({ ...run, results, idx: run.idx + 1, stage: 'prompt', deadline: Date.now() + countdown * 1000 });
    }
  };

  const repeatMissed = () => {
    const missed = run.results.filter((x) => !x.correct).map((x) => x.prompt);
    if (!missed.length) return;
    setRun({ prompts: missed, idx: 0, results: [], stage: 'prompt', deadline: Date.now() + countdown * 1000 });
    setShowAlt(false);
  };

  // ---------- setup ----------
  if (!run) {
    return (
      <div className="page">
        <div className="header">
          <div className="header-eyebrow">Random Drills</div>
          <div className="header-title">Drills</div>
          <div className="header-sub">App-generated prompts · self-graded · weak spots tracked</div>
        </div>
        <div className="card drill-setup" style={{ padding: 20 }}>
          <div className="drill-field">
            <div className="drill-field-label">Key</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 23, color: 'var(--gold-bright)' }}>
              {currentKey} {track === 'major' ? 'Major' : 'Harmonic Minor'}
              <span style={{ fontSize: 12.5, color: 'var(--text-faint)', marginLeft: 10, fontFamily: 'var(--font-mono)' }}>
                follows current week
              </span>
            </div>
          </div>
          <div className="drill-field">
            <div className="drill-field-label">Drill types</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TYPE_OPTIONS.map((t) => {
                const on = types.includes(t.id);
                return (
                  <button key={t.id} className={`chip ${on ? 'on' : ''}`} aria-pressed={on} style={{ textAlign: 'left', padding: '12px 14px' }}
                    onClick={() => setTypes((prev) => (on ? prev.filter((x) => x !== t.id) : [...prev, t.id]))}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{on ? '☑' : '☐'} {t.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 3 }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
          {types.includes('chord') && (
            <div className="drill-field">
              <div className="drill-field-label">Chord pool</div>
              <Segmented
                options={[{ value: false, label: 'Triads' }, { value: true, label: 'Triads + 7ths' }]}
                value={includeSevenths}
                onChange={setIncludeSevenths}
              />
            </div>
          )}
          <div className="drill-field">
            <div className="drill-field-label">Prompts</div>
            <Segmented options={[5, 10, 20]} value={count} onChange={setCount} />
          </div>
          <div className="drill-field">
            <div className="drill-field-label">Countdown — find it in</div>
            <Segmented options={[{ value: 5, label: '5s' }, { value: 10, label: '10s' }, { value: 15, label: '15s' }]} value={countdown} onChange={setCountdown} />
          </div>
          <div className="drill-field">
            <button className={`chip ${weighted ? 'on' : ''}`} aria-pressed={weighted} onClick={() => setWeighted((w) => !w)}>
              {weighted ? '☑' : '☐'} Weight toward weak spots
            </button>
          </div>
          <button className="session-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} onClick={startRun} disabled={types.length === 0}>
            ▶ Start drill
          </button>
        </div>
      </div>
    );
  }

  // ---------- summary ----------
  if (run.stage === 'summary') {
    const total = run.results.length;
    const hit = run.results.filter((x) => x.correct).length;
    const byCat = {};
    run.results.forEach(({ prompt, correct }) => {
      if (!byCat[prompt.category]) byCat[prompt.category] = { attempts: 0, correct: 0 };
      byCat[prompt.category].attempts++;
      if (correct) byCat[prompt.category].correct++;
    });
    const cats = Object.entries(byCat).sort((a, b) => a[1].correct / a[1].attempts - b[1].correct / b[1].attempts);
    return (
      <div className="page">
        <div className="session-summary" style={{ paddingTop: 8 }}>
          <div className="session-summary-title">Drill complete</div>
          <div className="session-summary-sub">{currentKey} · {total} prompts</div>
          <div className="session-stat-row">
            <div className="session-stat">
              <span className="session-stat-label">Accuracy</span>
              <span className="session-stat-val">{Math.round((hit / total) * 100)}%</span>
            </div>
            <div className="session-stat">
              <span className="session-stat-label">Got it</span>
              <span className="session-stat-val">{hit}/{total}</span>
            </div>
          </div>
          <div className="drill-summary-grid">
            {cats.map(([cat, s]) => (
              <div key={cat} className="drill-cat-row">
                <span>{cat}</span>
                <span className="drill-cat-acc">{Math.round((s.correct / s.attempts) * 100)}%</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {hit < total && <button className="session-ctl primary" onClick={repeatMissed}>↻ Repeat missed ({total - hit})</button>}
            <button className="session-ctl" onClick={() => setRun(null)}>New drill</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- run ----------
  const prompt = run.prompts[run.idx];
  const answer = run.stage === 'reveal' ? buildAnswer(prompt) : null;
  const shown = answer && showAlt && answer.alt ? answer.alt : answer;

  return (
    <div className="drill-run">
      <div className="drill-progress" aria-label={`Prompt ${run.idx + 1} of ${run.prompts.length}`}>
        {run.prompts.map((_, i) => {
          const res = run.results[i];
          const cls = i === run.idx ? 'now' : res ? (res.correct ? 'hit' : 'miss') : '';
          return <span key={i} className={`drill-dot ${cls}`} />;
        })}
      </div>
      <div className="drill-stage">
        <div>
          <div className="drill-prompt">{prompt.title}</div>
          <div className="drill-prompt-sub">{prompt.subtitle}</div>
        </div>
        {run.stage === 'prompt' && (
          <CountdownRing deadline={run.deadline} totalMs={countdown * 1000} onExpire={reveal} />
        )}
        {run.stage === 'reveal' && shown && (
          <div style={{ width: '100%', maxWidth: shown.kind === 'card' ? 240 : 980, margin: '0 auto' }}>
            {shown.kind === 'card' ? (
              <>
                <Fretboard size="card" markers={cagedDotMarkers(shown.dots)} theme={settings.boardTheme} />
                {shown.baseFret > 0 && (
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-faint)' }}>fret {shown.baseFret + 1} →</div>
                )}
              </>
            ) : (
              <Fretboard markers={shown.markers} fretRange={shown.fretRange || [0, 24]} theme={settings.boardTheme} />
            )}
            {answer.alt && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button className="chip" onClick={() => setShowAlt((s) => !s)}>
                  {showAlt ? 'Show shape' : 'Show full neck'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="drill-actions">
        {run.stage === 'prompt' ? (
          <button className="drill-action reveal" onClick={reveal}>Reveal</button>
        ) : (
          <>
            <button className="drill-action miss" onClick={() => grade(false)}>✗ Missed</button>
            <button className="drill-action hit" onClick={() => grade(true)}>✓ Got it</button>
          </>
        )}
      </div>
    </div>
  );
}
