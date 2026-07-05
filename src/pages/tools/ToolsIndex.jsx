import { useAppState } from '../../state/AppState.jsx';

const TOOLS = [
  { id: 'explorer', title: 'Fretboard Explorer', desc: 'Layered full-neck map — scale, chord tones, intervals, CAGED positions. Tap any note to hear it.' },
  { id: 'chromatic', title: 'Chromaticism Lab', tag: 'New', desc: 'Approach notes, neighbors and bebop enclosures — see each cell on the neck and hear it land on the beat.' },
  { id: 'caged', title: 'CAGED Library', desc: '12 chord qualities × 5 shapes — chords, arpeggios, pentatonics, scales.' },
  { id: 'triads', title: 'Diatonic Triads', desc: 'All 7 triads of the key on the full neck, with chord-cycling backing player.' },
  { id: 'sevenths', title: 'Diatonic 7ths', desc: 'The 7th-chord layer — maj7, m7, dom7, m7♭5 across the neck.' },
  { id: 'intervals', title: 'Interval Map', desc: 'See any interval from the key root everywhere on the fretboard.' },
  { id: 'modes', title: 'Modal Interchange', desc: 'Parallel-mode chord table + progression builder with strum player.' },
  { id: 'caged-modes', title: 'CAGED Modes', desc: 'Which parent-key shapes serve each mode — tables and full matrix.' },
  { id: 'cof', title: 'Circle of Fifths', desc: 'The key wheel with diatonic neighborhoods highlighted.' },
];

export default function ToolsIndex({ onOpen }) {
  const { currentKey, track } = useAppState();
  return (
    <div className="page page-wide">
      <div className="header">
        <div className="header-eyebrow">Theory Tools</div>
        <div className="header-title">Tools</div>
        <div className="header-sub">
          Key of {currentKey} · {track === 'major' ? 'Major' : 'Harmonic Minor'} track
        </div>
      </div>
      <div className="tools-grid">
        {TOOLS.map((t) => (
          <button key={t.id} className="tool-card" onClick={() => onOpen(t.id)}>
            <div className="tool-card-title">
              {t.title}
              {t.tag && <span className="tool-card-tag">{t.tag}</span>}
            </div>
            <div className="tool-card-desc">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
