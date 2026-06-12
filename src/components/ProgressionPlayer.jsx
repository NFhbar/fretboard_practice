import { useCallback, useEffect, useRef, useState } from 'react';
import { metronome } from '../audio/metronome.js';
import { getContext } from '../audio/engine.js';
import { playChord } from '../audio/voices.js';
import { voiceChord } from '../audio/voicing.js';
import { CHROMATIC } from '../data/notes.js';
import { MODE_NAMES } from '../data/modes.js';
import { STRUM_SYMBOLS, STRUM_PRESETS } from '../data/presets.js';
import { tonesFromQuality } from '../theory/qualities.js';
import { useAppState } from '../state/AppState.jsx';
import { clampBpm, applyClickVolume, useMetronomeConfig } from './metronome/metroShared.js';

export default function ProgressionPlayer({ progression, barsPerChord = 1 }) {
  const { settings, updateSettings } = useAppState();
  const [cfg, setCfg] = useMetronomeConfig();
  const bpm = cfg.bpm;
  const [playing, setPlaying] = useState(false);
  const chordsOn = settings.loopChords !== false;
  const setChordsOn = (fn) => updateSettings({ loopChords: typeof fn === 'function' ? fn(chordsOn) : fn });
  const [patternIdx, setPatternIdx] = useState(0);
  const [pattern, setPattern] = useState(STRUM_PRESETS[0].pattern.slice());
  const [currentSlot, setCurrentSlot] = useState(-1);
  const [currentChordIdx, setCurrentChordIdx] = useState(0);
  const rafRef = useRef(null);
  const pendingUi = useRef([]);
  const patternRef = useRef(pattern);
  patternRef.current = pattern;
  const chordsOnRef = useRef(chordsOn);
  chordsOnRef.current = chordsOn;

  const stop = useCallback(() => {
    metronome.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    pendingUi.current = [];
    setPlaying(false);
    setCurrentSlot(-1);
    setCurrentChordIdx(0);
  }, []);

  const start = useCallback(() => {
    if (progression.length === 0) return;
    setPlaying(true);
    setCurrentChordIdx(0);
    applyClickVolume(cfg);

    metronome.start({
      bpm,
      sound: cfg.sound || 'tick',
      beatsPerBar: 4,
      subdivision: 2, // 8 eighth-note slots per bar
      onSchedule: (ev) => {
        const slot = (ev.beat - 1) * 2 + ev.sub;
        const chordIdx = Math.floor(ev.bar / barsPerChord) % progression.length;
        const sym = patternRef.current[slot];
        if ((sym === '↓' || sym === '↑') && chordsOnRef.current) {
          const ch = progression[chordIdx];
          if (ch) {
            const tones = typeof ch === 'object' ? tonesFromQuality(ch.rootIdx, ch.quality) : null;
            if (tones) {
              playChord(voiceChord(tones), {
                when: ev.time,
                dir: sym === '↓' ? 'down' : 'up',
                strumMs: sym === '↓' ? 12 : 9,
                dur: 1.1,
                velocity: ev.sub === 0 ? 1 : 0.8,
              });
            }
          }
        }
        pendingUi.current.push({ time: ev.time, slot, chordIdx });
      },
    });

    const tick = () => {
      metronome.drainBeats();
      const q = pendingUi.current;
      const now = getContext().currentTime;
      let applied = null;
      while (q.length && q[0].time <= now) applied = q.shift();
      if (applied) {
        setCurrentSlot(applied.slot);
        setCurrentChordIdx(applied.chordIdx);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [bpm, cfg.volume, cfg.sound, progression, barsPerChord]);

  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (playing) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progression.length, barsPerChord]);

  const cycleSlot = (idx) => {
    setPattern((prev) => {
      const next = [...prev];
      const cur = STRUM_SYMBOLS.indexOf(next[idx]);
      next[idx] = STRUM_SYMBOLS[(cur + 1) % STRUM_SYMBOLS.length];
      return next;
    });
    setPatternIdx(-1);
  };

  const selectPreset = (pi) => {
    setPatternIdx(pi);
    setPattern(STRUM_PRESETS[pi].pattern.slice());
  };

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <span className="player-label">Pattern</span>
        {STRUM_PRESETS.map((p, pi) => (
          <button key={pi} className={`prog-pattern-chip ${patternIdx === pi ? 'active' : ''}`} onClick={() => selectPreset(pi)}>
            {p.name}
          </button>
        ))}
        {patternIdx === -1 && <span style={{ fontSize: 12.5, color: 'var(--gold-bright)', marginLeft: 4 }}>Custom</span>}
      </div>
      <div className="prog-grid">
        {pattern.map((s, i) => (
          <button key={i} className={`prog-grid-slot ${currentSlot === i ? 'lit' : i % 2 === 0 ? 'beat' : ''}`} onClick={() => cycleSlot(i)} aria-label={`Slot ${i + 1}: ${s}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="prog-controls">
        <div className="player-section">
          <span className="player-label">BPM</span>
          <input
            className="player-bpm" type="number" min={20} max={300} value={bpm} inputMode="numeric"
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) {
                const next = clampBpm(v);
                setCfg((c) => ({ ...c, bpm: next }));
                if (playing) metronome.setBpm(next);
              }
            }}
          />
        </div>
        <div className="player-section">
          <button
            className={`player-btn ${chordsOn ? 'active' : ''}`}
            aria-pressed={chordsOn}
            title="Toggle chord playback — off leaves just the metronome click"
            onClick={() => setChordsOn((c) => !c)}
          >
            ♪ Chords {chordsOn ? 'ON' : 'OFF'}
          </button>
          {!playing ? (
            <button className="player-btn start" onClick={start} disabled={progression.length === 0}>▶ Start</button>
          ) : (
            <button className="player-btn stop" onClick={stop}>■ Stop</button>
          )}
        </div>
        {playing && progression.length > 0 && (() => {
          const cur = progression[currentChordIdx];
          if (!cur) return null;
          const isObj = typeof cur === 'object';
          const label = isObj ? CHROMATIC[cur.rootIdx] + cur.suffix : cur;
          const modeLabel = isObj ? CHROMATIC[cur.rootIdx] + ' ' + MODE_NAMES[cur.modeIdx] : '';
          return (
            <>
              <span className="prog-current">{label}</span>
              {isObj && <span style={{ fontSize: 13, color: 'var(--gold)', marginLeft: 4 }}>{modeLabel}</span>}
            </>
          );
        })()}
        {playing && progression.length > 1 && (() => {
          const nxt = progression[(currentChordIdx + 1) % progression.length];
          if (!nxt) return null;
          const isObj = typeof nxt === 'object';
          return <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>next: {isObj ? CHROMATIC[nxt.rootIdx] + nxt.suffix : nxt}</span>;
        })()}
      </div>
    </div>
  );
}
