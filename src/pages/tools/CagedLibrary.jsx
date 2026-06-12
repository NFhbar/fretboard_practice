import { useState } from 'react';
import { CAGED_SHAPES } from '../../data/cagedShapes.js';
import { CAGED_NAMES, QUALITY_TABS, QUALITY_INFO, CATEGORY_LABELS, ROMAN, QUALITY_SUFFIX, getVariants } from '../../data/cagedMeta.js';
import { useAppState } from '../../state/AppState.jsx';
import ToolView from '../../components/ui/ToolView.jsx';
import Fretboard from '../../components/Fretboard/Fretboard.jsx';
import { cagedDotMarkers } from '../../components/Fretboard/markers.js';
import BoardThemePicker from '../../components/Fretboard/BoardThemePicker.jsx';

function Cell({ variants, vKey, variantSel, setVariantSel, boardTheme }) {
  const sel = variantSel[vKey] || 0;
  const dots = variants[Math.min(sel, variants.length - 1)];
  return (
    <div className="caged-cell">
      {variants.length > 1 ? (
        <div className="variant-pills">
          {variants.map((_, vi) => (
            <button
              key={vi}
              className={`variant-pill ${sel === vi ? 'active' : ''}`}
              aria-pressed={sel === vi}
              onClick={() => setVariantSel((prev) => ({ ...prev, [vKey]: vi }))}
            >
              {ROMAN[vi]}
            </button>
          ))}
        </div>
      ) : (
        <div className="variant-spacer" />
      )}
      {dots.length > 0 ? <Fretboard size="card" markers={cagedDotMarkers(dots)} theme={boardTheme} /> : <div className="caged-empty">—</div>}
    </div>
  );
}

export default function CagedLibrary({ onClose }) {
  const { settings } = useAppState();
  const [quality, setQuality] = useState('Major');
  const [variantSel, setVariantSel] = useState({});
  const boardTheme = settings.boardTheme;

  const cats = Object.keys(CATEGORY_LABELS[quality] || CATEGORY_LABELS.Major);
  const labels = CATEGORY_LABELS[quality] || CATEGORY_LABELS.Major;
  const gridCols = `48px repeat(${4}, 1fr)`;
  const suffix = QUALITY_SUFFIX[quality];

  return (
    <ToolView
      title="CAGED Shapes"
      sub={`${quality} · Chord Shapes · Arpeggios · Pentatonic · Scale`}
      onClose={onClose}
    >
      <div className="caged-tabs" role="tablist">
        {QUALITY_TABS.map((q) => (
          <button key={q} role="tab" aria-selected={quality === q} className={`caged-tab ${quality === q ? 'active' : ''}`} onClick={() => setQuality(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="quality-formula">
        <span className="quality-formula-intervals">{QUALITY_INFO[quality].formula}</span>
        <span className="quality-formula-mode">{QUALITY_INFO[quality].mode}</span>
        <span className="flex-spacer" />
        <BoardThemePicker />
      </div>

      {/* Desktop grid */}
      <div className="caged-grid caged-grid-desktop">
        <div className="caged-col-headers" style={{ gridTemplateColumns: gridCols }}>
          <div />
          {cats.map((cat) => (
            <div key={cat} className="caged-col-label">{labels[cat]}</div>
          ))}
        </div>
        {CAGED_NAMES.map((name) => (
          <div className="caged-row" key={name} style={{ gridTemplateColumns: gridCols }}>
            <div className="caged-row-label">
              {name}
              {suffix ? <span className="caged-row-label-suffix">{suffix}</span> : null}
            </div>
            {cats.map((cat) => (
              <Cell
                key={cat}
                variants={getVariants(CAGED_SHAPES[quality][name][cat])}
                vKey={`${quality}-${name}-${cat}`}
                variantSel={variantSel}
                setVariantSel={setVariantSel}
                boardTheme={boardTheme}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Mobile: stacked per-shape groups */}
      <div className="caged-grid caged-grid-mobile">
        {CAGED_NAMES.map((name) => (
          <div className="caged-shape-group" key={name}>
            <div className="caged-shape-title">
              {name}
              {suffix ? <span className="caged-row-label-suffix"> {suffix}</span> : null}
              <span style={{ fontSize: 12.5, color: 'var(--text-faint)', fontStyle: 'italic' }}> shape</span>
            </div>
            <div className="caged-cards-row">
              {cats.map((cat) => (
                <div key={cat}>
                  <div className="caged-card-label">{labels[cat]}</div>
                  <Cell
                    variants={getVariants(CAGED_SHAPES[quality][name][cat])}
                    vKey={`m-${quality}-${name}-${cat}`}
                    variantSel={variantSel}
                    setVariantSel={setVariantSel}
                    boardTheme={boardTheme}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ToolView>
  );
}
