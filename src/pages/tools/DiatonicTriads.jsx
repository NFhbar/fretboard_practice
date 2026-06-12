import { useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';
import { getTriadsFor } from '../../theory/diatonic.js';
import { TRIAD_COLORS } from '../../data/colors.js';
import ToolView from '../../components/ui/ToolView.jsx';
import DiatonicPlayer from '../../components/DiatonicPlayer.jsx';
import Fretboard from '../../components/Fretboard/Fretboard.jsx';
import { triadMarkers } from '../../components/Fretboard/markers.js';
import FretRangeChips from '../../components/Fretboard/FretRangeChips.jsx';
import BoardThemePicker from '../../components/Fretboard/BoardThemePicker.jsx';

export default function DiatonicTriads({ onClose }) {
  const { currentKey, track, settings } = useAppState();
  const [highlighted, setHighlighted] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [range, setRange] = useState([0, 24]);

  const items = getTriadsFor(track, currentKey);
  const markers = triadMarkers(items, { highlighted, showNotes });

  return (
    <ToolView
      title={track === 'major' ? 'Diatonic Triads' : 'Harmonic Minor Triads'}
      badge={`${currentKey} ${track === 'major' ? 'Major' : 'Harm. Minor'}`}
      onClose={onClose}
    >
      <div className="diatonic-controls">
        {items.map((t, i) => {
          const isH = highlighted.includes(i);
          const color = TRIAD_COLORS[i];
          return (
            <button
              key={i}
              className={`diatonic-pill ${isH ? 'highlighted' : ''}`}
              aria-pressed={isH}
              style={isH ? { borderColor: color, background: color + '18' } : {}}
              onClick={() => setHighlighted((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))}
            >
              <span className="pill-roman" style={{ color: isH ? color : color + '99' }}>{t.roman}</span>
              <span className="pill-chord" style={isH ? { color } : {}}>{t.chordName}</span>
            </button>
          );
        })}
        <div className="diatonic-toggle" role="group">
          <button className={!showNotes ? 'active' : ''} onClick={() => setShowNotes(false)}>Intervals</button>
          <button className={showNotes ? 'active' : ''} onClick={() => setShowNotes(true)}>Notes</button>
        </div>
      </div>
      <DiatonicPlayer items={items} setHighlight={setHighlighted} />
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
