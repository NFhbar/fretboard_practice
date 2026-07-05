import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';
import { fretNote } from '../../data/notes.js';
import { CAGED_NAMES } from '../../data/cagedMeta.js';
import { getTriadsFor, getSeventhsFor } from '../../theory/diatonic.js';
import { buildCagedBands } from '../../theory/noteMap.js';
import {
  DEVICES,
  BEBOP_FORMULAS,
  scaleTargetsOnString,
  cagedArpTargets,
  fullNeckArpTargets,
  ornamentsFor,
  buildTimeline,
  midiOf,
} from '../../theory/chromatic.js';
import { metronome } from '../../audio/metronome.js';
import { getContext } from '../../audio/engine.js';
import { playNote } from '../../audio/voices.js';
import { findSub, clampBpm, applyClickVolume, useMetronomeConfig, openMetronomeSheet } from '../../components/metronome/metroShared.js';
import ToolView from '../../components/ui/ToolView.jsx';
import Fretboard from '../../components/Fretboard/Fretboard.jsx';
import BoardThemePicker from '../../components/Fretboard/BoardThemePicker.jsx';
import Segmented from '../../components/ui/Segmented.jsx';

const ROLE_COLORS = { target: '#c9963a', approach: '#c75454', neighbor: '#5b8abd', early: '#e8b25c' };
const ROLE_NAMES = { approach: 'chromatic approach', neighbor: 'diatonic neighbor', early: 'early target (off-beat)' };

export default function ChromaticLab({ onClose }) {
  const { currentKey, track, settings } = useAppState();
  const [cfg, setCfg] = useMetronomeConfig();
  const [device, setDevice] = useState('approach');
  const [formula, setFormula] = useState('below2');
  const [side, setSide] = useState('auto'); // approach/neighbor: auto mirrors the run direction
  const [context, setContext] = useState('string'); // 'string' | 'caged' | 'diatonic'
  const [string, setString] = useState(6);
  const [shape, setShape] = useState('C');
  const [use7th, setUse7th] = useState(false);
  const [degree, setDegree] = useState(0);
  const [roles, setRoles] = useState(['R', '3', '5', '7']);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [curTick, setCurTick] = useState(null);
  const [selected, setSelected] = useState(null); // tapped target index while stopped
  const rafRef = useRef(null);
  const pendingUi = useRef([]);
  const timelineRef = useRef(null);

  const chordItems = use7th ? getSeventhsFor(track, currentKey) : getTriadsFor(track, currentKey);
  const tones = chordItems[context === 'diatonic' ? degree : 0];

  // one CAGED position window (the lowest full box for this key/shape)
  const cagedWindow = useMemo(() => {
    if (context !== 'caged') return null;
    const bands = buildCagedBands(currentKey, shape);
    const span = Math.max(...bands.map((b) => b.maxFret - b.minFret));
    const full = bands.filter((b) => b.maxFret - b.minFret === span && b.minFret >= 1);
    const band = (full.length ? full : bands).sort((a, b) => a.minFret - b.minFret)[0];
    return band ? [band.minFret - 1, band.maxFret + 1] : null;
  }, [context, currentKey, shape]);

  const targets = useMemo(() => {
    const roleFilter = roles.length ? roles : null;
    if (context === 'string') return scaleTargetsOnString(currentKey, track, string);
    if (context === 'caged') {
      return cagedArpTargets(currentKey, shape, tones, { targetRoles: roleFilter, window: cagedWindow ? [cagedWindow[0] + 1, cagedWindow[1] - 1] : null });
    }
    return fullNeckArpTargets(currentKey, track, tones, { targetRoles: roleFilter });
  }, [context, currentKey, track, string, shape, tones, roles, cagedWindow]);

  const cellOpts = useMemo(
    () => ({ key: currentKey, track, dir, formula, variant: side === 'auto' ? null : side }),
    [currentKey, track, dir, formula, side]
  );

  const stop = useCallback(() => {
    metronome.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    pendingUi.current = [];
    setPlaying(false);
    setCurTick(null);
  }, []);

  useEffect(() => stop, [stop]);
  // config changes invalidate a running exercise
  useEffect(() => {
    if (playing) stop();
    setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, formula, side, context, string, shape, use7th, degree, roles, dir, currentKey, track]);

  const subdivisionIdFor = () => {
    if (device === 'bebop') return BEBOP_FORMULAS.find((f) => f.id === formula)?.subdivision ?? 'triplet';
    return DEVICES.find((d) => d.id === device)?.subdivision ?? 'eighth';
  };

  // selecting a device flips the shared metronome to the exercise's subdivision
  const pickDevice = (id) => {
    setDevice(id);
    const subId = id === 'bebop' ? (BEBOP_FORMULAS.find((f) => f.id === formula)?.subdivision ?? 'triplet') : DEVICES.find((d) => d.id === id).subdivision;
    setCfg((c) => ({ ...c, subdivision: subId }));
  };

  const start = useCallback(() => {
    if (targets.length === 0) return;
    const timeline = buildTimeline(targets, device, cellOpts);
    timelineRef.current = timeline;
    applyClickVolume(cfg);
    const subId = subdivisionIdFor();
    setCfg((c) => ({ ...c, subdivision: subId }));
    setPlaying(true);

    metronome.start({
      bpm: cfg.bpm,
      beatsPerBar: 4,
      subdivision: findSub(subId).sub,
      clickOnSub: false,
      sound: cfg.sound || 'tick',
      onSchedule: (ev) => {
        const tl = timelineRef.current;
        if (!tl) return;
        const globalTick = (ev.bar * 4 + (ev.beat - 1)) * tl.perBeat + ev.sub;
        const idx = globalTick % tl.ticks.length;
        const note = tl.ticks[idx];
        if (note) {
          playNote(midiOf(note), {
            when: ev.time,
            velocity: note.role === 'target' ? 1 : 0.7,
            dur: note.role === 'target' ? 0.9 : 0.45,
          });
        }
        pendingUi.current.push({ time: ev.time, idx });
      },
    });

    const tick = () => {
      metronome.drainBeats();
      const q = pendingUi.current;
      const now = getContext().currentTime;
      let applied = null;
      while (q.length && q[0].time <= now) applied = q.shift();
      if (applied !== null && applied !== undefined) setCurTick(applied.idx);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, device, cellOpts, cfg, setCfg]);

  // quick one-shot preview of a tapped target's cell
  const previewCell = useCallback(
    (targetIdx) => {
      const t = targets[targetIdx];
      if (!t) return;
      const orn = ornamentsFor(device, { ...cellOpts, string: t.string, fret: t.fret });
      const seq = [...orn, { ...t, role: 'target' }];
      const perBeat = seq.length;
      const c = getContext();
      const step = 60 / cfg.bpm / perBeat;
      seq.forEach((n, i) => {
        playNote(midiOf(n), {
          when: c.currentTime + 0.05 + i * step,
          velocity: n.role === 'target' ? 1 : 0.7,
          dur: n.role === 'target' ? 0.9 : 0.4,
        });
      });
    },
    [targets, device, cellOpts, cfg.bpm]
  );

  // ---- markers ----
  const markers = useMemo(() => {
    const tl = playing ? timelineRef.current : null;
    const cur = tl && curTick !== null ? tl.ticks[curTick] : null;
    const focusIdx = playing ? cur?.targetIdx ?? null : selected;

    const out = targets.map((t, i) => ({
      string: t.string,
      fret: t.fret,
      label: context === 'string' ? fretNote(6 - t.string, t.fret) : t.role,
      color: ROLE_COLORS.target,
      isRoot: true,
      state: focusIdx === null ? 'normal' : i === focusIdx ? 'active' : 'faded',
      refIdx: i,
    }));

    if (focusIdx !== null && targets[focusIdx]) {
      const t = targets[focusIdx];
      const orn = ornamentsFor(device, { ...cellOpts, string: t.string, fret: t.fret });
      orn.forEach((o, k) => {
        out.push({
          string: o.string,
          fret: o.fret,
          label: String(k + 1),
          color: ROLE_COLORS[o.role],
          isRoot: o.role === 'early',
          state: 'active',
        });
      });
    }
    return out;
  }, [targets, playing, curTick, selected, device, cellOpts, context]);

  const fretRange = useMemo(() => {
    if (context === 'caged' && cagedWindow) return [Math.max(0, cagedWindow[0] - 1), Math.min(24, cagedWindow[1] + 2)];
    if (context === 'string') return [0, 13];
    return [0, 13];
  }, [context, cagedWindow]);

  const devMeta = DEVICES.find((d) => d.id === device);

  return (
    <ToolView
      title="Chromaticism Lab"
      badge={`${currentKey} ${track === 'major' ? 'Major' : 'Harm. Minor'}`}
      onClose={onClose}
      controls={<BoardThemePicker />}
    >
      <div className="explorer-controls">
        <div className="explorer-row">
          <span className="explorer-row-label">Device</span>
          {DEVICES.map((d) => (
            <button key={d.id} className={`chip ${device === d.id ? 'on' : ''}`} aria-pressed={device === d.id} title={d.name} onClick={() => pickDevice(d.id)}>
              {d.label}
            </button>
          ))}
        </div>
        {device === 'bebop' && (
          <div className="explorer-row">
            <span className="explorer-row-label">Formula</span>
            {BEBOP_FORMULAS.map((f) => (
              <button key={f.id} className={`chip ${formula === f.id ? 'on' : ''}`} aria-pressed={formula === f.id} onClick={() => { setFormula(f.id); setCfg((c) => ({ ...c, subdivision: f.subdivision })); }}>
                {f.label}
              </button>
            ))}
          </div>
        )}
        {(device === 'approach' || device === 'neighbor') && (
          <div className="explorer-row">
            <span className="explorer-row-label">From</span>
            <Segmented
              options={[{ value: 'auto', label: 'Auto (mirrors run)' }, { value: 'below', label: 'Below' }, { value: 'above', label: 'Above' }]}
              value={side}
              onChange={setSide}
            />
          </div>
        )}
        <div className="explorer-row">
          <span className="explorer-row-label">Context</span>
          <Segmented
            options={[{ value: 'string', label: 'Single string' }, { value: 'caged', label: 'CAGED arp' }, { value: 'diatonic', label: 'Diatonic arp' }]}
            value={context}
            onChange={setContext}
          />
          <Segmented options={[{ value: 1, label: 'Ascend' }, { value: -1, label: 'Descend' }]} value={dir} onChange={setDir} />
        </div>
        {context === 'string' && (
          <div className="explorer-row">
            <span className="explorer-row-label">String</span>
            {[6, 5, 4, 3, 2, 1].map((s) => (
              <button key={s} className={`chip ${string === s ? 'on' : ''}`} aria-pressed={string === s} onClick={() => setString(s)}>
                {s}{s === 6 ? ' (low E)' : s === 1 ? ' (high E)' : ''}
              </button>
            ))}
          </div>
        )}
        {context !== 'string' && (
          <div className="explorer-row">
            <span className="explorer-row-label">{context === 'caged' ? 'Shape' : 'Degree'}</span>
            {context === 'caged'
              ? CAGED_NAMES.map((s) => (
                  <button key={s} className={`chip ${shape === s ? 'on' : ''}`} aria-pressed={shape === s} onClick={() => setShape(s)}>
                    {s}
                  </button>
                ))
              : chordItems.map((c, i) => (
                  <button key={i} className={`chip ${degree === i ? 'on' : ''}`} aria-pressed={degree === i} onClick={() => setDegree(i)}>
                    {c.roman}
                  </button>
                ))}
            <Segmented options={[{ value: false, label: 'Triads' }, { value: true, label: '7ths' }]} value={use7th} onChange={setUse7th} />
            {['R', '3', '5', ...(use7th ? ['7'] : [])].map((r) => (
              <button
                key={r}
                className={`chip ${roles.includes(r) ? 'on' : ''}`}
                aria-pressed={roles.includes(r)}
                onClick={() => setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))}
              >
                {r}
              </button>
            ))}
          </div>
        )}
        <div className="explorer-row">
          <span className="explorer-row-label">Run</span>
          <span className="player-label">BPM</span>
          <input
            className="player-bpm" type="number" min={20} max={300} value={cfg.bpm} inputMode="numeric"
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) {
                setCfg((c) => ({ ...c, bpm: clampBpm(v) }));
                if (playing) metronome.setBpm(clampBpm(v));
              }
            }}
          />
          {!playing ? (
            <button className="player-btn start" onClick={start} disabled={targets.length === 0}>▶ Start</button>
          ) : (
            <button className="player-btn stop" onClick={stop}>■ Stop</button>
          )}
          <button className="player-btn" onClick={openMetronomeSheet}>◔ {findSub(subdivisionIdFor()).label} · accents</button>
          <span className="chr-hint">{devMeta.name} — target on the beat, middle finger</span>
        </div>
      </div>

      <div className="fretboard-pane">
        <Fretboard
          markers={markers}
          fretRange={fretRange}
          lefty={settings.lefty}
          theme={settings.boardTheme}
          onMarkerClick={(m) => {
            if (playing || m.refIdx === undefined) return;
            setSelected(m.refIdx === selected ? null : m.refIdx);
            if (m.refIdx !== selected) previewCell(m.refIdx);
          }}
        />
        <div className="chr-legend">
          <span className="chr-legend-item"><i style={{ background: ROLE_COLORS.target }} /> target (on the beat)</span>
          <span className="chr-legend-item"><i style={{ background: ROLE_COLORS.approach }} /> {ROLE_NAMES.approach}</span>
          <span className="chr-legend-item"><i style={{ background: ROLE_COLORS.neighbor }} /> {ROLE_NAMES.neighbor}</span>
          {device === 'enc4' && <span className="chr-legend-item"><i style={{ background: ROLE_COLORS.early }} /> {ROLE_NAMES.early}</span>}
          <span className="chr-legend-item chr-legend-tip">tap a target to hear its cell · numbers show pickup order</span>
        </div>
      </div>
    </ToolView>
  );
}
