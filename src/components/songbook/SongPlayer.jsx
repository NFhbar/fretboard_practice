import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { metronome } from '../../audio/metronome.js';
import { getContext } from '../../audio/engine.js';
import { playChord, playNote } from '../../audio/voices.js';
import { voiceIntervals } from '../../audio/voicing.js';
import { intervalsFromQuality } from '../../theory/qualities.js';
import { songEventDurationSeconds } from '../../theory/songExercises.js';
import { useAppState } from '../../state/AppState.jsx';
import { applyClickVolume, clampBpm, useMetronomeConfig } from '../metronome/metroShared.js';
import Segmented from '../ui/Segmented.jsx';

const STRAIGHT = [0, 0.5];
const SWING = [0, 2 / 3];
const VARIED_PATTERN = new Set([0, 3, 4, 6]);

function tickOf(beat) {
  return Math.round(beat * 2);
}

export default function SongPlayer({ exercise, onBeat }) {
  const { settings, updateSettings } = useAppState();
  const [cfg, setCfg] = useMetronomeConfig();
  const [playing, setPlaying] = useState(false);
  const pendingUi = useRef([]);
  const rafRef = useRef(null);
  const ownerRef = useRef(Symbol('song-player'));

  const clickOn = settings.songClick !== false;
  const chordsOn = settings.songChords !== false;
  const notesOn = settings.songNotes !== false;
  const straight = cfg.subdivision === 'eighth' || cfg.subdivision === 2;
  const feel = straight ? 'eighth' : 'swing-eighth';
  const layersRef = useRef({ clickOn, chordsOn, notesOn });
  layersRef.current = { clickOn, chordsOn, notesOn };
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const feelRef = useRef(feel);
  feelRef.current = feel;

  const stop = useCallback(() => {
    if (metronome.getState().owner === ownerRef.current) metronome.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    pendingUi.current = [];
    setPlaying(false);
    onBeat(null);
  }, [onBeat]);

  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (!playing) return;
    if (cfg.sigId !== '4/4' || (!straight && cfg.subdivision !== 'swing-eighth')) {
      stop();
      return;
    }
    metronome.update({
      beatsPerBar: 4,
      subdivision: straight ? STRAIGHT : SWING,
      clickOnSub: false,
      accents: clickOn ? (cfg.accents?.length === 4 ? cfg.accents : [2, 1, 1, 1]) : [0, 0, 0, 0],
    });
  }, [cfg.accents, cfg.sigId, cfg.subdivision, clickOn, playing, stop, straight]);
  useEffect(() => {
    stop();
  }, [exercise, stop]);

  const start = useCallback(() => {
    if (!exercise.durationBeats) return;
    applyClickVolume(cfg);
    setCfg((current) => ({ ...current, sigId: '4/4', subdivision: feel }));
    setPlaying(true);

    const noteTicks = new Map();
    for (const event of exercise.events) {
      const key = tickOf(event.beat);
      const list = noteTicks.get(key) || [];
      list.push(event);
      noteTicks.set(key, list);
    }
    const changeTicks = new Map(exercise.changes.map((change) => [tickOf(change.absoluteBeat), change]));
    const totalTicks = exercise.durationBeats * 2;
    const subdivision = feel === 'swing-eighth' ? SWING : STRAIGHT;
    const accents = layersRef.current.clickOn ? (cfg.accents?.length === 4 ? cfg.accents : [2, 1, 1, 1]) : [0, 0, 0, 0];

    metronome.start({
      bpm: cfg.bpm,
      beatsPerBar: 4,
      subdivision,
      clickOnSub: false,
      accents,
      sound: cfg.sound || 'tick',
      owner: ownerRef.current,
      onSchedule: (scheduled) => {
        const absoluteTick = (scheduled.bar * 4 + scheduled.beat - 1) * 2 + scheduled.sub;
        const loopTick = absoluteTick % totalTicks;
        const beat = loopTick / 2;
        const change = changeTicks.get(loopTick);
        const slot = loopTick % 8;
        const comping = exercise.activity.mode === 'comp';
        const rhythm = exercise.activity.rhythm;
        const shouldStrum =
          comping &&
          (rhythm === 'eighth' || (rhythm === 'quarter' && scheduled.sub === 0) || (rhythm === 'varied' && VARIED_PATTERN.has(slot)));

        if (layersRef.current.chordsOn && (change || shouldStrum)) {
          const activeChange = change || [...exercise.changes].reverse().find((item) => item.absoluteBeat <= beat) || exercise.changes[0];
          if (activeChange) {
            const liveBpm = cfgRef.current.bpm;
            playChord(voiceIntervals(activeChange.rootC, intervalsFromQuality(activeChange.quality)), {
              when: scheduled.time,
              dir: scheduled.sub === 0 ? 'down' : 'up',
              strumMs: scheduled.sub === 0 ? 12 : 9,
              dur: comping ? Math.min(0.8, 48 / liveBpm) : Math.min(2.5, activeChange.durationBeats * 60 / liveBpm),
              velocity: scheduled.sub === 0 ? 0.9 : 0.72,
            });
          }
        }

        if (layersRef.current.notesOn) {
          for (const event of noteTicks.get(loopTick) || []) {
            const duration = songEventDurationSeconds(event, cfgRef.current.bpm, feelRef.current === 'swing-eighth');
            playNote(event.midi, {
              when: scheduled.time,
              velocity: event.role === 'target' || event.role === 'R' ? 1 : 0.78,
              dur: Math.max(0.08, Math.min(1.8, duration * 0.88)),
            });
          }
        }

        pendingUi.current.push({ time: scheduled.time, beat });
      },
    });

    const tick = () => {
      if (metronome.getState().owner !== ownerRef.current) {
        rafRef.current = null;
        pendingUi.current = [];
        setPlaying(false);
        onBeat(null);
        return;
      }
      const now = getContext().currentTime;
      let latest = null;
      while (pendingUi.current.length && pendingUi.current[0].time <= now) latest = pendingUi.current.shift();
      if (latest) onBeat(latest.beat);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [cfg, exercise, feel, onBeat, setCfg]);

  const layerOptions = useMemo(
    () => [
      { key: 'songClick', label: 'Click', on: clickOn },
      { key: 'songChords', label: 'Chords', on: chordsOn },
      { key: 'songNotes', label: 'Notes', on: notesOn },
    ],
    [chordsOn, clickOn, notesOn]
  );

  return (
    <div className="song-player">
      <div className="song-player-row">
        <span className="player-label">BPM</span>
        <input
          className="player-bpm"
          type="number"
          min={20}
          max={300}
          value={cfg.bpm}
          inputMode="numeric"
          aria-label="Song Lab BPM"
          onChange={(event) => {
            const value = Number.parseInt(event.target.value, 10);
            if (!Number.isFinite(value)) return;
            const bpm = clampBpm(value);
            setCfg((current) => ({ ...current, bpm }));
            if (playing) metronome.setBpm(bpm);
          }}
        />
        <Segmented
          options={[
            { value: 'eighth', label: 'Straight' },
            { value: 'swing-eighth', label: 'Swing' },
          ]}
          value={feel}
          onChange={(value) => {
            setCfg((current) => ({ ...current, subdivision: value }));
            if (playing) metronome.update({ subdivision: value === 'swing-eighth' ? SWING : STRAIGHT, clickOnSub: false });
          }}
        />
        <button
          className="player-btn"
          aria-pressed={cfg.accents?.join(',') === '0,2,0,2'}
          onClick={() => {
            const accents = [0, 2, 0, 2];
            setCfg((current) => ({ ...current, accents }));
            if (playing) metronome.update({ accents: layersRef.current.clickOn ? accents : [0, 0, 0, 0] });
          }}
        >
          2 & 4
        </button>
      </div>

      <div className="song-player-row">
        {layerOptions.map((layer) => (
          <button
            key={layer.key}
            className={`player-btn ${layer.on ? 'active' : ''}`}
            aria-pressed={layer.on}
            onClick={() => {
              const next = !layer.on;
              updateSettings({ [layer.key]: next });
              if (playing && layer.key === 'songClick') {
                metronome.update({ accents: next ? (cfg.accents?.length === 4 ? cfg.accents : [2, 1, 1, 1]) : [0, 0, 0, 0] });
              }
            }}
          >
            {layer.label} {layer.on ? 'ON' : 'OFF'}
          </button>
        ))}
        {!playing ? (
          <button className="player-btn start" onClick={start}>▶ Start</button>
        ) : (
          <button className="player-btn stop" onClick={stop}>■ Stop</button>
        )}
      </div>
    </div>
  );
}
