import { useCallback, useEffect, useRef, useState } from 'react';
import { metronome } from '../../audio/metronome.js';
import { playClick, ensureRunning } from '../../audio/engine.js';
import {
  SIGS,
  SUBS,
  SOUNDS,
  findSub,
  findSig,
  effectiveAccents,
  startOptions,
  tempoName,
  clampBpm,
  applyClickVolume,
  useMetronomeConfig,
  onOpenMetronomeSheet,
} from './metroShared.js';

export default function GlobalMetronome() {
  const [cfg, setCfg] = useMetronomeConfig();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(metronome.isRunning());
  const [beat, setBeat] = useState(0);
  const rafRef = useRef(null);
  const tapsRef = useRef([]);
  const lastBeatRef = useRef(null);

  const sig = findSig(cfg.sigId);
  const accents = effectiveAccents(cfg, sig);
  const subDef = findSub(cfg.subdivision);

  const start = useCallback(() => {
    applyClickVolume(cfg);
    metronome.start(startOptions(cfg));
    setRunning(true);
  }, [cfg]);

  const stop = useCallback(() => {
    metronome.stop();
    setRunning(false);
    setBeat(0);
  }, []);

  const toggle = useCallback(() => {
    if (metronome.isRunning()) stop();
    else start();
  }, [start, stop]);

  // FAB stays accurate even when a loop player owns the engine
  useEffect(() => {
    const iv = setInterval(() => setRunning(metronome.isRunning()), 600);
    return () => clearInterval(iv);
  }, []);

  // players can pop this sheet open for full settings
  useEffect(() => onOpenMetronomeSheet(() => setOpen(true)), []);

  // beat visuals + reflect external owners (loop players use the same engine)
  useEffect(() => {
    if (!open) return;
    const tick = () => {
      const isRunning = metronome.isRunning();
      setRunning(isRunning);
      if (isRunning) {
        const due = metronome.drainBeats();
        const evt = due.length ? due[due.length - 1] : metronome.getLastBeat();
        if (evt && evt !== lastBeatRef.current) {
          lastBeatRef.current = evt;
          setBeat(evt.beat);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open]);

  // space toggles while the panel is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.code !== 'Space') return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toggle]);

  const setBpm = (v) => {
    const bpm = clampBpm(v);
    setCfg((c) => ({ ...c, bpm }));
    if (metronome.isRunning()) metronome.setBpm(bpm);
  };

  const setSig = (id) => {
    const s = SIGS.find((x) => x.id === id);
    setCfg((c) => ({ ...c, sigId: id, accents: s.def }));
    if (metronome.isRunning()) metronome.update({ beatsPerBar: s.beats, accents: s.def });
  };

  const cycleAccent = (idx) => {
    const next = accents.map((a, i) => (i === idx ? (a + 2) % 3 : a)); // 2 -> 1 -> 0 -> 2
    setCfg((c) => ({ ...c, accents: next }));
    if (metronome.isRunning()) metronome.update({ accents: next });
  };

  const setSubdivision = (id) => {
    const s = findSub(id);
    const ticks = Array.isArray(s.sub) ? s.sub.length : s.sub;
    setCfg((c) => ({ ...c, subdivision: s.id }));
    if (metronome.isRunning()) metronome.update({ subdivision: s.sub, clickOnSub: ticks > 1 });
  };

  const setVol = (v) => {
    setCfg((c) => ({ ...c, volume: v }));
    applyClickVolume({ volume: v });
  };

  const setSound = (id) => {
    setCfg((c) => ({ ...c, sound: id }));
    metronome.update({ sound: id });
    if (!metronome.isRunning()) {
      // quick preview so picking a sound is audible immediately
      applyClickVolume(cfg);
      ensureRunning();
      playClick(undefined, false, id);
    }
  };

  const tap = () => {
    const now = performance.now();
    const taps = tapsRef.current.filter((t) => now - t < 3000);
    taps.push(now);
    tapsRef.current = taps;
    if (taps.length >= 2) {
      const diffs = taps.slice(1).map((t, i) => t - taps[i]);
      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      setBpm(60000 / avg);
    }
  };

  return (
    <>
      <button
        className={`metro-fab ${running ? 'running' : ''}`}
        aria-label={running ? `Metronome running at ${cfg.bpm} BPM — open controls` : 'Open metronome'}
        style={running ? { animationDuration: `${60 / cfg.bpm}s` } : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 3h6l4 18H5L9 3z" />
          <path d="M12 14L17 6" />
          <circle cx="17" cy="6" r="1.4" fill="currentColor" />
        </svg>
        {running && <span className="metro-fab-bpm">{cfg.bpm}</span>}
      </button>

      {open && (
        <>
          <div className="sheet-backdrop" onClick={() => setOpen(false)} />
          <div className="metro-sheet" role="dialog" aria-label="Metronome">
            <div className="note-sheet-handle" />

            <div className="metro-bpm-row">
              <div>
                <div className="metro-bpm">{cfg.bpm}</div>
                <div className="metro-tempo-name">{tempoName(cfg.bpm)} · BPM</div>
              </div>
              <button className={`metro-start ${running ? 'stop' : ''}`} onClick={toggle}>
                {running ? '■ Stop' : '▶ Start'}
              </button>
            </div>

            <input
              className="metro-slider"
              type="range" min={20} max={300} step={1}
              value={cfg.bpm}
              onChange={(e) => setBpm(parseInt(e.target.value, 10))}
              aria-label="Tempo"
            />

            <div className="metro-row">
              {[-5, -1, +1, +5].map((d) => (
                <button key={d} className="chip" onClick={() => setBpm(cfg.bpm + d)}>
                  {d > 0 ? `+${d}` : d}
                </button>
              ))}
              <button className="chip metro-tap" onClick={tap}>TAP</button>
            </div>

            <div className="metro-row metro-row-labeled">
              <span className="metro-label">Time sig</span>
              <div className="metro-sigs">
                {SIGS.map((s) => (
                  <button key={s.id} className={`chip ${cfg.sigId === s.id ? 'on' : ''}`} aria-pressed={cfg.sigId === s.id} onClick={() => setSig(s.id)}>
                    {s.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="metro-row metro-row-labeled">
              <span className="metro-label">Accents</span>
              <div className="metro-accents" role="group" aria-label="Per-beat accents — tap to cycle accent, click, mute">
                {accents.map((level, i) => (
                  <button
                    key={i}
                    className={`metro-accent lvl${level} ${running && beat === i + 1 ? 'now' : ''}`}
                    title={level === 2 ? 'Accent' : level === 1 ? 'Click' : 'Muted'}
                    onClick={() => cycleAccent(i)}
                  >
                    <span className="metro-accent-bar" />
                    <span className="metro-accent-num">{i + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="metro-row metro-row-labeled">
              <span className="metro-label">Subdivide</span>
              <div className="metro-sigs">
                {SUBS.map((s) => {
                  const on = subDef.id === s.id;
                  return (
                    <button key={s.id} className={`chip metro-sub ${on ? 'on' : ''}`} aria-pressed={on} title={s.name} onClick={() => setSubdivision(s.id)}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="metro-sub-name">{subDef.name}</div>

            <div className="metro-row metro-row-labeled">
              <span className="metro-label">Sound</span>
              <div className="metro-sigs">
                {SOUNDS.map((s) => {
                  const on = (cfg.sound || 'tick') === s.id;
                  return (
                    <button key={s.id} className={`chip ${on ? 'on' : ''}`} aria-pressed={on} title={s.desc} onClick={() => setSound(s.id)}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="metro-row metro-row-labeled">
              <span className="metro-label">Volume</span>
              <input
                className="metro-slider metro-vol"
                type="range" min={0} max={1} step={0.05}
                value={cfg.volume ?? 0.9}
                onChange={(e) => setVol(parseFloat(e.target.value))}
                aria-label="Click volume"
              />
            </div>

            <div className="metro-hint">Space starts/stops · keeps running while you browse the app</div>
          </div>
        </>
      )}
    </>
  );
}
