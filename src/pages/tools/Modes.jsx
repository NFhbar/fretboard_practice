import { useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';
import { CHROMATIC, CHROMATIC_FLAT, noteToChromatic, normalizeKey } from '../../data/notes.js';
import { MODE_NAMES, HARM_MINOR_MODE_NAMES, MODE_OFFSETS, HARM_MINOR_MODE_OFFSETS } from '../../data/modes.js';
import { PROG_PRESETS } from '../../data/presets.js';
import { getModalChords, getHmModalChords } from '../../theory/modal.js';
import ToolView from '../../components/ui/ToolView.jsx';
import ProgressionPlayer from '../../components/ProgressionPlayer.jsx';

export default function Modes({ onClose }) {
  const { currentKey, track } = useAppState();
  const [use7ths, setUse7ths] = useState(false);
  const [useFlats, setUseFlats] = useState(false);
  const [progChords, setProgChords] = useState([]);
  const [barsPerChord, setBarsPerChord] = useState(1);

  const isMajor = track === 'major';
  const modeOffsets = isMajor ? MODE_OFFSETS : HARM_MINOR_MODE_OFFSETS;
  const getChordsFn = isMajor ? getModalChords : getHmModalChords;
  const firstModeName = isMajor ? 'Ionian' : 'Harmonic Minor';
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  const normKey = normalizeKey(currentKey);

  return (
    <ToolView
      title={isMajor ? 'Modal Interchange' : 'HM Modal Interchange'}
      badge={currentKey}
      onClose={onClose}
      controls={
        <>
          <div className="diatonic-toggle" role="group">
            <button className={!use7ths ? 'active' : ''} onClick={() => setUse7ths(false)}>Triads</button>
            <button className={use7ths ? 'active' : ''} onClick={() => setUse7ths(true)}>7ths</button>
          </div>
          <div className="diatonic-toggle" role="group">
            <button className={!useFlats ? 'active' : ''} onClick={() => setUseFlats(false)}>♯</button>
            <button className={useFlats ? 'active' : ''} onClick={() => setUseFlats(true)}>♭</button>
          </div>
        </>
      }
    >
      <div className="modes-body table-scroll">
        <table className="modes-table">
          <thead>
            <tr>
              <th>Mode</th>
              {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].map((d) => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {getChordsFn(currentKey, use7ths, useFlats).map((mode, mi) => {
              const rootC = noteToChromatic(normKey);
              const parentC = (rootC - modeOffsets[mi] + 12) % 12;
              return (
                <tr key={mode.name} className={mi === 0 ? 'mode-current' : ''}>
                  <td className="mode-name">
                    {mode.name}
                    <div className="mode-parent">
                      = {noteSet[parentC]} {isMajor ? 'major' : 'harm. minor'} · {modeOffsets[mi] ? `−${modeOffsets[mi]}` : '0'}
                    </div>
                  </td>
                  {mode.chords.map((c, ci) => {
                    const chordRootC = noteToChromatic(c.root);
                    const degreeInParent = modeOffsets.indexOf((chordRootC - parentC + 12) % 12);
                    return (
                      <td key={ci}>
                        <button
                          className={`modes-chord q-${c.quality} ${c.borrowed ? 'borrowed' : ''}`}
                          onClick={() =>
                            setProgChords((prev) => [
                              ...prev,
                              {
                                rootIdx: chordRootC,
                                quality: c.quality,
                                suffix: c.chordName.slice(c.root.length),
                                modeIdx: degreeInParent >= 0 ? degreeInParent : 0,
                                parentIdx: parentC,
                                sourceMode: mode.name,
                                degree: ci + 1,
                                isHarmMinor: !isMajor,
                              },
                            ])
                          }
                        >
                          {c.chordName}
                        </button>
                        <div className="modes-numeral">{c.numeral}</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="prog-builder">
        <div className="prog-builder-title">Progression Builder</div>
        <div className="prog-hint">Tap chords above to add them, or use a preset:</div>
        <div className="prog-presets">
          {PROG_PRESETS.map((pp, pi) => (
            <button
              key={pi}
              className="prog-pattern-chip"
              onClick={() => {
                const rootC = noteToChromatic(normKey);
                const modeChords = getChordsFn(currentKey, use7ths, useFlats)[0].chords;
                setProgChords(
                  pp.degrees.map((d) => ({
                    rootIdx: noteToChromatic(modeChords[d].root),
                    quality: modeChords[d].quality,
                    suffix: modeChords[d].chordName.slice(modeChords[d].root.length),
                    modeIdx: d,
                    parentIdx: rootC,
                    sourceMode: firstModeName,
                    degree: d + 1,
                    isHarmMinor: !isMajor,
                  }))
                );
              }}
            >
              {pp.name}
            </button>
          ))}
          <button className="prog-pattern-chip" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => setProgChords([])}>
            Clear
          </button>
        </div>
        <div className="prog-chords">
          {progChords.length === 0 && <span className="prog-empty">Tap chords from the table to build a progression...</span>}
          {progChords.map((ch, i) => {
            const rootName = noteSet[ch.rootIdx];
            const parentName = noteSet[ch.parentIdx];
            const chModeNames = ch.isHarmMinor ? HARM_MINOR_MODE_NAMES : MODE_NAMES;
            return (
              <button key={i} className="prog-chord-info" onClick={() => setProgChords((prev) => prev.filter((_, j) => j !== i))} title="Remove">
                <span className="prog-chord-name">{rootName}{ch.suffix}</span>
                <span className="prog-chord-mode">{rootName} {chModeNames[ch.modeIdx]}</span>
                <span className="prog-chord-parent">from {parentName} {ch.isHarmMinor ? 'harm. minor' : 'major'}</span>
              </button>
            );
          })}
        </div>
        {progChords.length > 0 && (
          <div className="prog-analysis">
            <div className="prog-analysis-title">Mode Analysis</div>
            {progChords.map((ch, i) => {
              const rootName = noteSet[ch.rootIdx];
              const parentName = noteSet[ch.parentIdx];
              const chModeNames = ch.isHarmMinor ? HARM_MINOR_MODE_NAMES : MODE_NAMES;
              const chFirstMode = ch.isHarmMinor ? 'Harmonic Minor' : 'Ionian';
              const isBorrowed = ch.sourceMode !== chFirstMode;
              return (
                <div key={i} className="prog-analysis-row">
                  <span className="prog-analysis-chord">{rootName}{ch.suffix}</span>
                  <span className="prog-analysis-arrow">→</span>
                  <span className="prog-analysis-mode">{rootName} {chModeNames[ch.modeIdx]}</span>
                  <span className="prog-analysis-reason">
                    {isBorrowed
                      ? `borrowed from ${normKey} ${ch.sourceMode} · use ${parentName} ${ch.isHarmMinor ? 'harm. minor' : 'major'} shapes`
                      : `diatonic · degree ${ch.degree} of ${normKey} ${ch.isHarmMinor ? 'harm. minor' : 'major'}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <span className="player-label">Bars per chord</span>
          <div className="diatonic-toggle" style={{ marginLeft: 0 }} role="group">
            {[1, 2, 4].map((n) => (
              <button key={n} className={barsPerChord === n ? 'active' : ''} onClick={() => setBarsPerChord(n)}>{n}</button>
            ))}
          </div>
        </div>
        <ProgressionPlayer progression={progChords} barsPerChord={barsPerChord} />
      </div>

      <div className="modes-legend">
        {!use7ths ? (
          <>
            <div className="modes-legend-item"><span className="modes-legend-swatch q-maj modes-chord">C</span> Major</div>
            <div className="modes-legend-item"><span className="modes-legend-swatch q-min modes-chord">Cm</span> Minor</div>
            <div className="modes-legend-item"><span className="modes-legend-swatch q-dim modes-chord">C°</span> Diminished</div>
            <div className="modes-legend-item"><span className="modes-legend-swatch q-aug modes-chord">C+</span> Augmented</div>
          </>
        ) : (
          <>
            <div className="modes-legend-item"><span className="modes-legend-swatch q-maj7 modes-chord">maj7</span> Major 7</div>
            <div className="modes-legend-item"><span className="modes-legend-swatch q-min7 modes-chord">m7</span> Minor 7</div>
            <div className="modes-legend-item"><span className="modes-legend-swatch q-dom7 modes-chord">7</span> Dominant 7</div>
            <div className="modes-legend-item"><span className="modes-legend-swatch q-m7b5 modes-chord">m7♭5</span> Half-dim</div>
            <div className="modes-legend-item"><span className="modes-legend-swatch q-mmaj7 modes-chord">mM7</span> Min-maj 7</div>
          </>
        )}
        <div className="modes-legend-item"><span className="modes-legend-swatch" style={{ border: '2px dashed var(--gold)', padding: '1px 7px', fontSize: 12 }}>A♭</span> Borrowed</div>
      </div>
    </ToolView>
  );
}
