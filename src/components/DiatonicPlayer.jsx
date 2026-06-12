import { useCallback, useEffect, useRef, useState } from 'react';
import { metronome } from '../audio/metronome.js';
import { getContext } from '../audio/engine.js';
import { playChord } from '../audio/voices.js';
import { voiceChord } from '../audio/voicing.js';
import { TRIAD_COLORS } from '../data/colors.js';
import { useAppState } from '../state/AppState.jsx';
import {
  findSig,
  findSub,
  startOptions,
  clampBpm,
  applyClickVolume,
  useMetronomeConfig,
  openMetronomeSheet,
} from './metronome/metroShared.js';

export default function DiatonicPlayer({ items, setHighlight }) {
  const { settings, updateSettings } = useAppState();
  const [cfg, setCfg] = useMetronomeConfig();
  const [random, setRandom] = useState(false);
  const chordsOn = settings.loopChords !== false;
  const setChordsOn = (fn) => updateSettings({ loopChords: typeof fn === 'function' ? fn(chordsOn) : fn });
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState(() => items.map((_, i) => i));
  const [nextIdx, setNextIdx] = useState(null);
  const [beat, setBeat] = useState(0);
  const rafRef = useRef(null);
  const pendingUi = useRef([]); // [{time, idx, nextIdx}]
  const seqRef = useRef({ next: null });
  const chordsOnRef = useRef(chordsOn);
  chordsOnRef.current = chordsOn;

  const sig = findSig(cfg.sigId);
  const subDef = findSub(cfg.subdivision);

  const getNext = useCallback((current, list, isRandom) => {
    if (list.length === 0) return null;
    if (list.length === 1) return list[0];
    if (isRandom) {
      let n;
      do {
        n = list[Math.floor(Math.random() * list.length)];
      } while (n === current && list.length > 1);
      return n;
    }
    const pos = list.indexOf(current);
    return list[(pos + 1) % list.length];
  }, []);

  const stop = useCallback(() => {
    metronome.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    pendingUi.current = [];
    setPlaying(false);
    setNextIdx(null);
    setBeat(0);
    setHighlight([]);
  }, [setHighlight]);

  const start = useCallback(() => {
    if (enabled.length === 0) return;
    const first = random ? enabled[Math.floor(Math.random() * enabled.length)] : enabled[0];
    seqRef.current = { current: first, next: getNext(first, enabled, random) };
    setPlaying(true);
    applyClickVolume(cfg);

    const barSec = (60 / cfg.bpm) * sig.beats;
    metronome.start({
      ...startOptions(cfg),
      onSchedule: (ev) => {
        if (!ev.isDownbeat) return;
        let idx;
        if (ev.bar === 0) {
          idx = seqRef.current.current;
        } else {
          idx = seqRef.current.next;
          seqRef.current = { current: idx, next: getNext(idx, enabled, random) };
        }
        const chord = items[idx];
        if (chord && chordsOnRef.current) {
          playChord(voiceChord(chord), { when: ev.time, strumMs: 12, dur: Math.min(barSec * 0.92, 4) });
        }
        pendingUi.current.push({ time: ev.time, idx, nextIdx: seqRef.current.next });
      },
    });

    const tick = () => {
      const due = metronome.drainBeats();
      if (due.length) setBeat(due[due.length - 1].beat);
      const q = pendingUi.current;
      const now = getContext().currentTime;
      let applied = null;
      while (q.length && q[0].time <= now) applied = q.shift();
      if (applied) {
        setNextIdx(applied.nextIdx);
        setHighlight([applied.idx]);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [cfg, sig.beats, random, enabled, items, getNext, setHighlight]);

  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (playing) stop();
    setEnabled(items.map((_, i) => i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const setBpm = (v) => {
    const bpm = clampBpm(v);
    setCfg((c) => ({ ...c, bpm }));
    if (playing) metronome.setBpm(bpm);
  };

  const toggleEnabled = (idx) => {
    if (playing) return;
    setEnabled((prev) => (prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]));
  };
  const dragFrom = useRef(null);
  const handleDrop = (targetPos) => {
    if (dragFrom.current === null || dragFrom.current === targetPos) return;
    setEnabled((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragFrom.current, 1);
      next.splice(targetPos, 0, moved);
      return next;
    });
    dragFrom.current = null;
  };
  const allOn = enabled.length === items.length;

  return (
    <div>
      <div className="player-bar">
        <div className="player-section">
          <span className="player-label">BPM</span>
          <input
            className="player-bpm" type="number" min={20} max={300} value={cfg.bpm} inputMode="numeric"
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) setBpm(v);
            }}
          />
        </div>
        <div className="player-section">
          <button
            className="player-btn"
            title="One bar per chord — tap to edit time signature, accents and subdivision"
            onClick={openMetronomeSheet}
          >
            ◔ {sig.id} · {subDef.label}
          </button>
          <button className={`player-btn ${random ? 'active' : ''}`} aria-pressed={random}
            onClick={() => { if (!playing) setRandom((r) => !r); }}
            style={playing ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
            Random {random ? 'ON' : 'OFF'}
          </button>
          <button
            className={`player-btn ${chordsOn ? 'active' : ''}`}
            aria-pressed={chordsOn}
            title="Toggle chord playback — off leaves just the metronome click"
            onClick={() => setChordsOn((c) => !c)}
          >
            ♪ Chords {chordsOn ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="player-section">
          {!playing ? (
            <button className="player-btn start" onClick={start} disabled={enabled.length === 0}>▶ Start</button>
          ) : (
            <button className="player-btn stop" onClick={stop}>■ Stop</button>
          )}
        </div>
        {playing && (
          <div className="player-section" style={{ gap: 4 }} aria-hidden="true">
            {Array.from({ length: sig.beats }, (_, i) => i + 1).map((b) => (
              <span key={b} className={`beat-dot ${b <= beat ? 'lit' : ''}`} />
            ))}
          </div>
        )}
        {playing && nextIdx !== null && (
          <div className="player-next">
            <span className="player-next-label">Next</span>
            <span className="player-next-chord" style={{ color: TRIAD_COLORS[nextIdx] }}>
              {items[nextIdx].roman} — {items[nextIdx].chordName}
            </span>
          </div>
        )}
      </div>
      <div className="player-bar" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="player-section" style={{ flexWrap: 'wrap' }}>
          <span className="player-label">Loop</span>
          <button className={`player-chip ${allOn ? 'on' : ''}`}
            onClick={() => { if (!playing) setEnabled(allOn ? [] : items.map((_, i) => i)); }}
            style={playing ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
            All
          </button>
          {enabled.map((idx, pos) => (
            <button key={idx} className="player-chip on"
              draggable={!playing}
              onDragStart={() => { dragFrom.current = pos; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(pos)}
              onClick={() => toggleEnabled(idx)}
              style={playing ? { opacity: 0.5, cursor: 'not-allowed' } : { borderColor: TRIAD_COLORS[idx], color: TRIAD_COLORS[idx], cursor: 'grab' }}>
              {items[idx].roman}
            </button>
          ))}
          {items.map((t, i) =>
            !enabled.includes(i) ? (
              <button key={i} className="player-chip" onClick={() => toggleEnabled(i)} style={playing ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                {t.roman}
              </button>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
