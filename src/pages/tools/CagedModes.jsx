import { useState } from 'react';
import { useAppState } from '../../state/AppState.jsx';
import { CHROMATIC, CHROMATIC_FLAT, normalizeKey } from '../../data/notes.js';
import { FAMILY_COLORS } from '../../data/colors.js';
import {
  getCagedModesForRoot, getCagedFamily, getModesMatrix,
  getHmCagedModesForRoot, getHmCagedFamily, getHmModesMatrix,
} from '../../theory/cagedModes.js';
import ToolView from '../../components/ui/ToolView.jsx';

const QUALITY_LABEL = { maj: 'Major', min: 'Minor', aug: 'Aug', dim: 'Dim' };

export default function CagedModes({ onClose }) {
  const { currentKey, track } = useAppState();
  const [useFlats, setUseFlats] = useState(false);

  const isMaj = track === 'major';
  const getRoot = isMaj ? getCagedModesForRoot : getHmCagedModesForRoot;
  const getFamily = isMaj ? getCagedFamily : getHmCagedFamily;
  const getMatrix = isMaj ? getModesMatrix : getHmModesMatrix;
  const scaleLabel = isMaj ? 'Major' : 'Harm. Minor';
  const parentLabel = isMaj ? 'major' : 'harm. minor';
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;

  return (
    <ToolView
      title={isMaj ? 'CAGED Modes' : 'CAGED HM Modes'}
      badge={currentKey}
      onClose={onClose}
      controls={
        <div className="diatonic-toggle" role="group">
          <button className={!useFlats ? 'active' : ''} onClick={() => setUseFlats(false)}>♯</button>
          <button className={useFlats ? 'active' : ''} onClick={() => setUseFlats(true)}>♭</button>
        </div>
      }
    >
      <div className="cm-body">
        <div className="cm-section">
          <div className="cm-section-title">{scaleLabel} Modes of {currentKey}</div>
          <div className="cm-section-sub">Each mode of {currentKey} {parentLabel} maps to a different parent {parentLabel} key</div>
          <div className="table-scroll">
            <table className="cm-table">
              <thead>
                <tr><th>Mode</th><th>Quality</th><th>Parent Key</th></tr>
              </thead>
              <tbody>
                {getRoot(currentKey, useFlats).map((m, i) => (
                  <tr key={i} className={i === 0 ? 'cm-highlight' : ''}>
                    <td>
                      <span className="cm-root">{m.root}</span>{' '}
                      <span className={`cm-mode cm-mode-${m.quality}`}>{m.mode}</span>
                    </td>
                    <td><span className={`cm-badge cm-badge-${m.quality}`}>{QUALITY_LABEL[m.quality]}</span></td>
                    <td className="cm-parent">{m.parentKey} {parentLabel} shapes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="cm-section">
          <div className="cm-section-title">{currentKey} {scaleLabel} Family</div>
          <div className="cm-section-sub">All 7 modes sharing the same {currentKey} {parentLabel} shapes</div>
          <div className="table-scroll">
            <table className="cm-table">
              <thead>
                <tr><th>Degree</th><th>Root</th><th>Mode</th><th>Quality</th></tr>
              </thead>
              <tbody>
                {getFamily(currentKey, useFlats).map((m, i) => (
                  <tr key={i} className={i === 0 ? 'cm-highlight' : ''}>
                    <td className="cm-degree">{m.degree}</td>
                    <td><span className="cm-root">{m.note}</span></td>
                    <td className={`cm-mode cm-mode-${m.quality}`}>{m.mode}</td>
                    <td><span className={`cm-badge cm-badge-${m.quality}`}>{QUALITY_LABEL[m.quality]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="cm-section">
          <div className="cm-section-title">Full Mode Matrix</div>
          <div className="cm-section-sub">Same color = same parent key = same {parentLabel} shapes on the fretboard</div>
          <div className="table-scroll">
            <table className="cm-matrix">
              <thead>
                <tr>
                  <th>Mode</th>
                  {noteSet.map((n, i) => <th key={i}>{n}</th>)}
                </tr>
              </thead>
              <tbody>
                {getMatrix(useFlats).map((row, ri) => (
                  <tr key={ri}>
                    <td>{row.mode}</td>
                    {row.cells.map((c, ci) => {
                      const col = FAMILY_COLORS[c.parentIdx];
                      const isCurrentKey = c.parentIdx === noteSet.indexOf(normalizeKey(currentKey));
                      return (
                        <td key={ci}>
                          <span
                            className="cm-cell"
                            style={{
                              background: col.bg,
                              color: col.fg,
                              outline: isCurrentKey ? '2px solid var(--gold)' : 'none',
                              outlineOffset: 1,
                            }}
                          >
                            {c.note}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-faint)', marginRight: 4 }}>Parent keys:</span>
            {noteSet.map((n, i) => (
              <span key={i} className="cm-cell" style={{ background: FAMILY_COLORS[i].bg, color: FAMILY_COLORS[i].fg, fontSize: 11 }}>{n}</span>
            ))}
          </div>
        </div>
      </div>
    </ToolView>
  );
}
