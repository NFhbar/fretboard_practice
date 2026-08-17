import { useCallback, useEffect, useMemo, useState } from 'react';
import { CHROMATIC } from '../../data/notes.js';
import { TRIAD_COLORS } from '../../data/colors.js';
import { getSong, getSongActivity } from '../../data/songbook/index.js';
import { useAppState } from '../../state/AppState.jsx';
import { buildSongExercise, chordIntervalsForExercise } from '../../theory/songExercises.js';
import { chordPositionsInZone, getSongZones, resolveZone, solveMelodyFingering } from '../../theory/songFingering.js';
import Fretboard from '../../components/Fretboard/Fretboard.jsx';
import BoardThemePicker from '../../components/Fretboard/BoardThemePicker.jsx';
import ToolView from '../../components/ui/ToolView.jsx';
import Segmented from '../../components/ui/Segmented.jsx';
import SongChart from '../../components/songbook/SongChart.jsx';
import SongPlayer from '../../components/songbook/SongPlayer.jsx';

const MODES = [
  ['chart', 'Chart'],
  ['roots', 'Roots'],
  ['bass', 'Root + 5th'],
  ['triad-root', 'Root Triads'],
  ['triad-voice-led', 'Voice-Led Triads'],
  ['harmony-eighths', 'Eighth Lines'],
  ['seventh-arpeggio', '7th Arpeggios'],
  ['chromatic-seventh', 'Approach + Neighbor'],
  ['melody', 'Melody'],
  ['melody-bass', 'Melody + Bass'],
  ['comp', 'Comp'],
  ['improv', 'Improvise'],
];

function firstActivity(song) {
  return song.curriculum[0].blocks[0].tasks[0];
}

function externalUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function chordKey(change) {
  return `${change.root}:${change.quality}:${change.symbol}`;
}

export default function SongLab({ songId, activityId, onClose }) {
  const song = getSong(songId);
  const preset = song ? getSongActivity(songId, activityId) : null;
  const invalidActivity = !!activityId && !preset;
  const initial = preset?.task || (song ? firstActivity(song) : null);
  const { settings, songbook } = useAppState();
  const [mode, setMode] = useState(initial?.activity?.mode || 'chart');
  const [scope, setScope] = useState(initial?.activity?.scope || 'form');
  const [zoneId, setZoneId] = useState(initial?.activity?.zone || 'zone-1');
  const [rhythm, setRhythm] = useState(initial?.activity?.rhythm || 'eighth');
  const [octave, setOctave] = useState(initial?.activity?.octave || 0);
  const [currentBeat, setCurrentBeat] = useState(null);
  const [selectedChangeId, setSelectedChangeId] = useState(null);

  useEffect(() => {
    if (!initial?.activity) return;
    setMode(initial.activity.mode || 'chart');
    setScope(initial.activity.scope || 'form');
    setZoneId(initial.activity.zone || 'zone-1');
    setRhythm(initial.activity.rhythm || 'eighth');
    setOctave(initial.activity.octave || 0);
    setCurrentBeat(null);
    setSelectedChangeId(null);
  }, [initial]);

  const activity = useMemo(
    () => ({
      ...(initial?.activity || {}),
      mode,
      scope,
      zone: zoneId,
      rhythm,
      octave,
      requiresMelody:
        mode === 'melody' ||
        mode === 'melody-bass' ||
        (!!initial?.activity?.requiresMelody && mode === initial.activity.mode),
      externalBacking: !!initial?.activity?.externalBacking && mode === initial.activity.mode,
    }),
    [initial, mode, scope, zoneId, rhythm, octave]
  );
  const exercise = useMemo(() => (song ? buildSongExercise(song, activity) : null), [song, activity]);
  const zone = song ? resolveZone(song.key, zoneId) : null;
  const zones = song ? [...getSongZones(song.key), resolveZone(song.key, 'full')] : [];
  const setBeat = useCallback((beat) => setCurrentBeat(beat), []);

  if (song && invalidActivity) {
    return (
      <ToolView title={`${song.title} · Song Lab`} onClose={onClose}>
        <div className="empty-note">That Song Lab activity does not exist.</div>
      </ToolView>
    );
  }

  if (!song || !exercise || !zone) {
    return (
      <ToolView title="Song Lab" onClose={onClose}>
        <div className="empty-note">Song not found.</div>
      </ToolView>
    );
  }

  const beat = currentBeat ?? 0;
  const chartBeat = currentBeat === null || currentBeat < exercise.leadInBeats
    ? null
    : currentBeat - exercise.leadInBeats;
  const playbackChange = [...exercise.changes].reverse().find((change) => change.absoluteBeat <= beat) || exercise.changes[0] || null;
  const selectedChange = exercise.changes.find((change) => change.id === selectedChangeId) || null;
  const activeChange = selectedChange || playbackChange;
  const activeEvent = exercise.events.find((event) => Math.abs(event.beat - beat) < 0.001) || null;
  const markerEvent = selectedChange ? null : activeEvent;
  const intervals = activeChange ? chordIntervalsForExercise(activeChange.quality, selectedChange ? 'chart' : mode) : [];
  const chordMap = activeChange ? chordPositionsInZone(activeChange.root, intervals, zone) : { shape: null, band: null, positions: [] };
  const melodySource = exercise.events.filter((event) => event.bar !== undefined && Number.isFinite(event.midi));
  const fingeringOverrides = song.melody?.fingeringOverrides?.[`${zoneId}:${octave}`] || song.melody?.fingeringOverrides?.[zoneId] || {};
  const melodyPath = melodySource.length ? solveMelodyFingering(melodySource, zone, { overrides: fingeringOverrides }) : [];
  const shownPath = melodyPath || [];
  const chordChoices = [];
  const chordKeys = new Set();
  for (const change of exercise.changes) {
    const key = chordKey(change);
    if (chordKeys.has(key)) continue;
    chordKeys.add(key);
    chordChoices.push(change);
  }

  const markers =
    !selectedChange && (mode === 'melody' || mode === 'melody-bass')
      ? shownPath.map((event) => ({
          string: event.string,
          fret: event.fret,
          label: CHROMATIC[event.midi % 12],
          color: 'var(--gold)',
          isRoot: false,
          state: markerEvent?.id === event.id ? 'active' : 'normal',
          halo: markerEvent?.id === event.id,
        }))
      : chordMap.positions.map((position) => ({
          string: position.string,
          fret: position.fret,
          label: position.role,
          color: position.isRoot ? '#c9963a' : '#8e6bbf',
          isRoot: position.isRoot,
          state: markerEvent ? (markerEvent.string === position.string && markerEvent.fret === position.fret ? 'active' : 'faded') : 'normal',
          halo: markerEvent?.string === position.string && markerEvent?.fret === position.fret,
        }));

  if (!selectedChange && mode === 'melody-bass') {
    for (const event of exercise.events) {
      if (event.bar !== undefined || !event.string) continue;
      markers.push({
        string: event.string,
        fret: event.fret,
        label: event.role,
        color: '#c9963a',
        isRoot: event.role === 'R',
        state: markerEvent?.id === event.id ? 'active' : 'faded',
        halo: markerEvent?.id === event.id,
      });
    }
  }

  const cagedBands = chordMap.band ? [chordMap.band] : [];
  const backingUrl = songbook[song.id]?.backingUrl || '';
  const validBackingUrl = externalUrl(backingUrl);
  const melodyUnavailable = (mode === 'melody' || mode === 'melody-bass' || activity.requiresMelody) && !song.melody;

  return (
    <ToolView
      title={`${song.title} · Song Lab`}
      badge={`${activeChange?.symbol || song.key} · ${zone.label}${chordMap.shape ? ` · ${chordMap.shape} shape` : ''}`}
      sub={initial?.label}
      onClose={onClose}
    >
      <div className="song-lab-controls">
        <div className="explorer-row">
          <span className="explorer-row-label">Mode</span>
          {MODES.map(([value, label]) => (
            <button key={value} className={`chip ${mode === value ? 'on' : ''}`} aria-pressed={mode === value} onClick={() => setMode(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="explorer-row">
          <span className="explorer-row-label">Form</span>
          <Segmented
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'form', label: 'AABA' },
            ]}
            value={scope}
            onChange={(value) => {
              setScope(value);
              setSelectedChangeId(null);
            }}
          />
          <span className="explorer-row-label">Position</span>
          {zones.map((zoneOption) => (
            <button
              key={zoneOption.id}
              className={`chip ${zoneId === zoneOption.id ? 'on' : ''}`}
              aria-pressed={zoneId === zoneOption.id}
              onClick={() => setZoneId(zoneOption.id)}
            >
              {zoneOption.id === 'full' ? 'Full neck' : `${zoneOption.label} · ${zoneOption.minFret}–${zoneOption.maxFret}`}
            </button>
          ))}
        </div>
        {mode === 'comp' && (
          <div className="explorer-row">
            <span className="explorer-row-label">Rhythm</span>
            <Segmented
              options={[
                { value: 'quarter', label: 'Quarters' },
                { value: 'eighth', label: 'Eighths' },
                { value: 'varied', label: 'Varied' },
              ]}
              value={rhythm}
              onChange={setRhythm}
            />
          </div>
        )}
        {(mode === 'melody' || mode === 'melody-bass') && (
          <div className="explorer-row">
            <span className="explorer-row-label">Octave</span>
            <Segmented
              options={[
                { value: -1, label: '−1' },
                { value: 0, label: 'Written' },
                { value: 1, label: '+1' },
              ]}
              value={octave}
              onChange={setOctave}
            />
          </div>
        )}
      </div>

      <div className="diatonic-controls song-chord-nav" role="group" aria-label="Song chord navigation">
        {chordChoices.map((change, index) => {
          const selected = activeChange && chordKey(activeChange) === chordKey(change);
          const color = TRIAD_COLORS[index % TRIAD_COLORS.length];
          return (
            <button
              key={chordKey(change)}
              className={`diatonic-pill ${selected ? 'highlighted' : ''}`}
              aria-pressed={!!selected}
              style={selected ? { borderColor: color, background: color + '18' } : {}}
              onClick={() => {
                setSelectedChangeId(selectedChange && chordKey(selectedChange) === chordKey(change) ? null : change.id);
              }}
            >
              <span className="pill-roman" style={{ color: selected ? color : color + '99' }}>{change.function}</span>
              <span className="pill-chord" style={selected ? { color } : {}}>{change.symbol}</span>
            </button>
          );
        })}
      </div>

      {melodyUnavailable && (
        <div className="song-data-notice">
          This mode requires the authorized melody transcription. The form and chord player remain available.
        </div>
      )}
      {melodyPath === null && (
        <div className="song-data-notice">
          The selected octave does not fit completely inside this neck zone.
        </div>
      )}

      <SongPlayer exercise={exercise} onBeat={setBeat} />
      <SongChart
        song={song}
        scope={scope}
        currentBeat={chartBeat}
        selectedChangeId={activeChange?.id || null}
        onSelectChange={(change) => {
          setSelectedChangeId((current) => current === change.id ? null : change.id);
        }}
      />

      <div className="fretboard-pane song-fretboard-pane">
        <div className="fb-toolbar">
          <span className="badge-gold">
            {activeChange?.symbol || 'Form'} {activeChange?.function ? `· ${activeChange.function}` : ''}
          </span>
          <BoardThemePicker />
        </div>
        <Fretboard
          markers={markers}
          fretRange={[0, 24]}
          lefty={settings.lefty}
          theme={settings.boardTheme}
          cagedBands={cagedBands}
          fit="width"
        />
      </div>

      {activity.externalBacking && (
        <div className="song-external-action">
          <button
            className="toolbtn"
            disabled={!validBackingUrl}
            onClick={() => window.open(validBackingUrl, '_blank', 'noopener,noreferrer')}
          >
            Open external backing track
          </button>
          {!backingUrl && <span>Configure a backing URL on the song page first.</span>}
          {backingUrl && !validBackingUrl && <span>The configured backing URL is invalid.</span>}
        </div>
      )}
    </ToolView>
  );
}
