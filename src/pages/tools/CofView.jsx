import { useAppState } from '../../state/AppState.jsx';
import ToolView from '../../components/ui/ToolView.jsx';
import CircleOfFifths from '../../components/CircleOfFifths.jsx';

export default function CofView({ onClose }) {
  const { week, currentKey } = useAppState();
  return (
    <ToolView title="Circle of Fifths" badge={`Week ${week} — ${currentKey}`} onClose={onClose}>
      <div className="cof-body">
        <div className="cof-svg-wrap">
          <CircleOfFifths week={week} />
        </div>
      </div>
      <div className="cof-legend">
        <div className="cof-legend-item"><div className="cof-legend-dot" style={{ background: '#c9963a' }} /> Root (I)</div>
        <div className="cof-legend-item"><div className="cof-legend-dot" style={{ background: 'rgba(201,150,58,0.35)' }} /> Major (IV, V)</div>
        <div className="cof-legend-item"><div className="cof-legend-dot" style={{ background: 'rgba(91,138,189,0.4)' }} /> Minor (ii, iii, vi)</div>
        <div className="cof-legend-item"><div className="cof-legend-dot" style={{ background: 'rgba(199,84,84,0.4)' }} /> Dim (vii°)</div>
      </div>
    </ToolView>
  );
}
