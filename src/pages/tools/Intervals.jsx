import { useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';
import { INTERVALS } from '../../data/intervals.js';
import ToolView from '../../components/ui/ToolView.jsx';
import Fretboard from '../../components/Fretboard/Fretboard.jsx';
import { intervalMarkers } from '../../components/Fretboard/markers.js';
import FretRangeChips from '../../components/Fretboard/FretRangeChips.jsx';
import BoardThemePicker from '../../components/Fretboard/BoardThemePicker.jsx';

export default function Intervals({ onClose }) {
  const { currentKey, settings } = useAppState();
  const [activeIntervals, setActiveIntervals] = useState([0]);
  const [showNotes, setShowNotes] = useState(false);
  const [range, setRange] = useState([0, 24]);

  const markers = intervalMarkers(currentKey, activeIntervals, { showNotes });

  return (
    <ToolView title="Interval Map" badge={currentKey} onClose={onClose}>
      <div className="interval-controls">
        {INTERVALS.map((iv) => {
          const isOn = activeIntervals.includes(iv.semitones);
          return (
            <button
              key={iv.semitones}
              className={`interval-pill ${isOn ? 'on' : ''}`}
              aria-pressed={isOn}
              style={isOn ? { borderColor: iv.color, color: iv.color, background: iv.color + '18' } : {}}
              onClick={() =>
                setActiveIntervals((prev) =>
                  iv.semitones === 0 ? prev : prev.includes(iv.semitones) ? prev.filter((x) => x !== iv.semitones) : [...prev, iv.semitones]
                )
              }
            >
              {iv.name}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="player-btn" onClick={() => setActiveIntervals([0])}>Clear</button>
          <button className="player-btn" onClick={() => setActiveIntervals(INTERVALS.map((iv) => iv.semitones))}>All</button>
          <div className="diatonic-toggle" role="group">
            <button className={!showNotes ? 'active' : ''} onClick={() => setShowNotes(false)}>Intervals</button>
            <button className={showNotes ? 'active' : ''} onClick={() => setShowNotes(true)}>+ Notes</button>
          </div>
        </div>
      </div>
      <div className="fretboard-pane">
        <div className="fb-toolbar">
          <FretRangeChips value={range} onChange={setRange} />
          <BoardThemePicker />
        </div>
        <Fretboard markers={markers} fretRange={range} lefty={settings.lefty} theme={settings.boardTheme} />
      </div>
    </ToolView>
  );
}
