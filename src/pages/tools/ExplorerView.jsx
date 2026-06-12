import { useMemo, useRef, useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';
import { CHROMATIC, CHROMATIC_FLAT, fretNote, noteToChromatic, normalizeKey } from '../../data/notes.js';
import { KEY_CYCLE } from '../../data/notes.js';
import { CAGED_NAMES } from '../../data/cagedMeta.js';
import { TRIAD_COLORS } from '../../data/colors.js';
import { INTERVALS } from '../../data/intervals.js';
import { buildNoteMap, buildCagedBands, cagedShapePositions, chordsContaining } from '../../theory/noteMap.js';
import { getTriadsFor, getSeventhsFor } from '../../theory/diatonic.js';
import { playNote } from '../../audio/voices.js';
import { midiFor } from '../../audio/voicing.js';
import ToolView from '../../components/ui/ToolView.jsx';
import Fretboard from '../../components/Fretboard/Fretboard.jsx';
import Minimap from '../../components/Fretboard/Minimap.jsx';
import FretRangeChips from '../../components/Fretboard/FretRangeChips.jsx';
import BoardThemePicker from '../../components/Fretboard/BoardThemePicker.jsx';
import Segmented from '../../components/ui/Segmented.jsx';

export default function ExplorerView({ onClose }) {
  const { currentKey, track, settings } = useAppState();
  const [key, setKey] = useState(currentKey);
  const [scaleOn, setScaleOn] = useState(true);
  const [chordMode, setChordMode] = useState('triads'); // 'off' | 'triads' | '7ths'
  const [degrees, setDegrees] = useState([0]);
  const [intervalsOn, setIntervalsOn] = useState(false);
  const [caged, setCaged] = useState(null); // null | 'all' | shape
  const [labelMode, setLabelMode] = useState('intervals');
  const [useFlats, setUseFlats] = useState(false);
  const [range, setRange] = useState([0, 24]);
  const [sheet, setSheet] = useState(null); // { string, fret }
  const scrollRef = useRef(null);

  const layers = useMemo(
    () => ({
      scale: scaleOn,
      chord: chordMode === 'off' ? null : { mode: chordMode, degrees },
      intervals: intervalsOn,
    }),
    [scaleOn, chordMode, degrees, intervalsOn]
  );

  // a selected form always reveals its notes, even with the scale layer off
  const singleShape = !!caged && caged !== 'all';
  const baseMarkers = useMemo(
    () => buildNoteMap(key, track, singleShape ? { ...layers, scale: true } : layers, { labelMode, useFlats }),
    [key, track, layers, labelMode, useFlats, singleShape]
  );

  // Single shape selected: emphasize the form's notes, dim everything else.
  // 'All' keeps the labeled region bands as an overview.
  const shapeFilter = useMemo(
    () => (singleShape ? cagedShapePositions(key, caged) : null),
    [key, caged, singleShape]
  );
  const markers = useMemo(() => {
    if (!shapeFilter) return baseMarkers;
    return baseMarkers.map((m) => {
      const inShape = shapeFilter.has(`${m.string}:${m.fret}`);
      if (inShape) return m.state === 'faded' ? { ...m, state: 'normal' } : m;
      return m.state === 'faded' ? m : { ...m, state: 'faded' };
    });
  }, [baseMarkers, shapeFilter]);

  const bands = useMemo(() => (caged === 'all' ? buildCagedBands(key, 'all') : []), [key, caged]);
  const chordItems = chordMode === '7ths' ? getSeventhsFor(track, key) : getTriadsFor(track, key);

  const onCellClick = ({ string, fret }) => {
    playNote(midiFor(string, fret));
    setSheet({ string, fret });
  };

  const sheetInfo = useMemo(() => {
    if (!sheet) return null;
    const si = 6 - sheet.string;
    const pc = CHROMATIC.indexOf(fretNote(si, sheet.fret));
    const rootPc = noteToChromatic(normalizeKey(key));
    const semis = (pc - rootPc + 12) % 12;
    const iv = INTERVALS.find((x) => x.semitones === semis);
    const midi = midiFor(sheet.string, sheet.fret);
    const octave = Math.floor(midi / 12) - 1;
    const containing = chordsContaining(pc, key, track);
    const name = (useFlats ? CHROMATIC_FLAT : CHROMATIC)[pc];
    return { name, octave, iv, containing, pc };
  }, [sheet, key, track, useFlats]);

  return (
    <ToolView
      title="Fretboard Explorer"
      badge={`${key} ${track === 'major' ? 'Major' : 'Harm. Minor'}`}
      onClose={onClose}
      controls={
        <div className="diatonic-toggle" role="group">
          <button className={!useFlats ? 'active' : ''} onClick={() => setUseFlats(false)}>♯</button>
          <button className={useFlats ? 'active' : ''} onClick={() => setUseFlats(true)}>♭</button>
        </div>
      }
    >
      <div className="explorer-controls">
        <div className="explorer-row">
          <span className="explorer-row-label">Key</span>
          {KEY_CYCLE.map((k) => (
            <button key={k} className={`chip ${key === k ? 'on' : ''}`} aria-pressed={key === k} onClick={() => setKey(k)}>{k}</button>
          ))}
        </div>
        <div className="explorer-row">
          <span className="explorer-row-label">Layers</span>
          <button className={`chip ${scaleOn ? 'on' : ''}`} aria-pressed={scaleOn} onClick={() => setScaleOn((s) => !s)}>Scale</button>
          <Segmented
            options={[{ value: 'off', label: 'Chords off' }, { value: 'triads', label: 'Triads' }, { value: '7ths', label: '7ths' }]}
            value={chordMode}
            onChange={setChordMode}
          />
          <button className={`chip ${intervalsOn ? 'on' : ''}`} aria-pressed={intervalsOn} onClick={() => setIntervalsOn((s) => !s)}>Intervals</button>
          <Segmented
            options={[{ value: 'intervals', label: 'Int. labels' }, { value: 'notes', label: 'Note labels' }]}
            value={labelMode}
            onChange={setLabelMode}
          />
        </div>
        {chordMode !== 'off' && (
          <div className="explorer-row">
            <span className="explorer-row-label">Degrees</span>
            {chordItems.map((c, i) => {
              const on = degrees.includes(i);
              const color = TRIAD_COLORS[i];
              return (
                <button
                  key={i}
                  className={`chip degree-chip ${on ? 'on' : ''}`}
                  aria-pressed={on}
                  style={on ? { borderColor: color, background: color + '18' } : {}}
                  onClick={() => setDegrees((prev) => (on ? prev.filter((x) => x !== i) : [...prev, i]))}
                >
                  <span className="degree-chip-roman" style={{ color: on ? color : color + 'aa' }}>{c.roman}</span>
                  <span className="degree-chip-name" style={on ? { color } : {}}>{c.chordName}</span>
                </button>
              );
            })}
          </div>
        )}
        {chordMode !== 'off' && degrees.length > 0 && (
          <div className="explorer-row degree-legend">
            <span className="explorer-row-label">Spelled</span>
            {degrees
              .slice()
              .sort((a, b) => a - b)
              .map((di) => {
                const c = chordItems[di];
                if (!c) return null;
                const tones = [c.root, c.third, c.fifth, c.seventh].filter(Boolean).join('–');
                return (
                  <span key={di} className="degree-spell" style={{ borderColor: TRIAD_COLORS[di] + '66' }}>
                    <b style={{ color: TRIAD_COLORS[di] }}>{c.chordName}</b>
                    <span>{tones}</span>
                    <i>{c.intervals}</i>
                  </span>
                );
              })}
          </div>
        )}
        {track === 'major' && (
          <div className="explorer-row">
            <span className="explorer-row-label">CAGED</span>
            <button className={`chip ${caged === null ? 'on' : ''}`} onClick={() => setCaged(null)}>Off</button>
            {CAGED_NAMES.map((s) => (
              <button key={s} className={`chip ${caged === s ? 'on' : ''}`} aria-pressed={caged === s} onClick={() => setCaged(s)}>{s}</button>
            ))}
            <button className={`chip ${caged === 'all' ? 'on' : ''}`} onClick={() => setCaged('all')}>All</button>
          </div>
        )}
      </div>

      <div className="fretboard-pane">
        <div className="fb-toolbar">
          <FretRangeChips value={range} onChange={setRange} />
          <BoardThemePicker />
        </div>
        <Minimap scrollRef={scrollRef} markers={markers} fretRange={range} />
        <Fretboard
          markers={markers}
          fretRange={range}
          lefty={settings.lefty}
          cagedBands={bands}
          onCellClick={onCellClick}
          scrollRef={scrollRef}
          theme={settings.boardTheme}
        />
        <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-faint)' }}>
          Tap any fret to hear the note and see its theory.
        </div>
      </div>

      {sheet && sheetInfo && (
        <>
          <div className="sheet-backdrop" onClick={() => setSheet(null)} />
          <div className="note-sheet" role="dialog" aria-label={`Note ${sheetInfo.name}`}>
            <div className="note-sheet-handle" />
            <div className="note-sheet-title">
              {sheetInfo.name}
              <span style={{ fontSize: 15, color: 'var(--text-faint)' }}>{sheetInfo.octave}</span>
              {sheetInfo.iv && (
                <span style={{ fontSize: 14, color: sheetInfo.iv.color, marginLeft: 12 }}>
                  {sheetInfo.iv.name === 'R' ? 'Root' : sheetInfo.iv.name} of {key}
                </span>
              )}
            </div>
            <div className="note-sheet-sub">
              String {sheet.string} · fret {sheet.fret}
            </div>
            {sheetInfo.containing.triads.length > 0 && (
              <div style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>
                In triads: {sheetInfo.containing.triads.join(' · ')}
              </div>
            )}
            {sheetInfo.containing.sevenths.length > 0 && (
              <div style={{ fontSize: 13.5, color: 'var(--text-dim)', marginTop: 4 }}>
                In 7ths: {sheetInfo.containing.sevenths.join(' · ')}
              </div>
            )}
            <div className="note-sheet-row">
              <button className="chip" onClick={() => playNote(midiFor(sheet.string, sheet.fret))}>♪ Play again</button>
              <button className="chip" onClick={() => setSheet(null)}>Close</button>
            </div>
          </div>
        </>
      )}
    </ToolView>
  );
}
