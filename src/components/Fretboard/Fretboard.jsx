import { FULL, CARD, MAX_FRET, getBoardTheme, STRING_NAMES } from './layout.js';

const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAYS = [12, 24];

function HorizontalBoard({
  markers,
  fretRange,
  lefty,
  cagedBands,
  onMarkerClick,
  onCellClick,
  fit,
  heightClass,
  theme,
}) {
  const T = getBoardTheme(theme);
  const [startFret, endFret] = fretRange;
  const L = FULL;
  const fretCount = endFret - startFret;
  const W = L.padL + fretCount * L.fretW + L.padR;
  const H = L.padT + 5 * L.stringGap + L.padB;
  const mx = (x) => (lefty ? W - x : x);
  const sY = (row) => L.padT + row * L.stringGap; // row 0 = string 1 (high E)
  const fretLineX = (f) => L.padL + (f - startFret) * L.fretW;
  const fretX = (f) => (f === 0 ? L.padL : L.padL + (f - startFret - 0.5) * L.fretW);
  const inRange = (f) => (f === 0 ? startFret === 0 : f > startFret && f <= endFret);
  const gradId = `fbBoard-${theme || 'dark'}`;

  const fretsShown = [];
  for (let f = startFret + 1; f <= endFret; f++) fretsShown.push(f);

  const svgProps =
    fit === 'width'
      ? { width: '100%', style: { maxWidth: W, display: 'block', margin: '0 auto' } }
      : { className: `fb-svg ${heightClass || ''}`, style: { display: 'block' } };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" {...svgProps}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.boardTop} />
          <stop offset="100%" stopColor={T.boardBottom} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} rx={8} fill={`url(#${gradId})`} stroke={T.boardEdge} strokeWidth={1.5} />

      {/* CAGED position bands */}
      {cagedBands.map((b, i) => {
        const f0 = Math.max(b.minFret, startFret);
        const f1 = Math.min(b.maxFret, endFret);
        if (f1 < f0) return null;
        const x0 = fretLineX(Math.max(f0 - 1, startFret));
        const x1 = fretLineX(f1);
        const x = lefty ? mx(x1) : x0;
        return (
          <g key={`band${i}`}>
            <rect x={x} y={L.padT - 30} width={Math.abs(x1 - x0)} height={5 * L.stringGap + 44} rx={6}
              fill={T.bandFill} stroke={T.bandStroke} strokeWidth={1} strokeDasharray="6 5" />
            <text x={lefty ? mx((x0 + x1) / 2) : (x0 + x1) / 2} y={L.padT - 36} textAnchor="middle"
              fontSize={15} fill={T.bandText} fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight={600}>
              {b.shape}
            </text>
          </g>
        );
      })}

      {/* Nut or low-fret edge */}
      <line
        x1={mx(fretLineX(startFret))} y1={L.padT - 4}
        x2={mx(fretLineX(startFret))} y2={H - L.padB + 4}
        stroke={startFret === 0 ? T.nut : T.fret}
        strokeWidth={startFret === 0 ? 5 : 2}
      />
      {/* Frets */}
      {fretsShown.map((f) => (
        <g key={`fret${f}`}>
          <line x1={mx(fretLineX(f))} y1={L.padT - 4} x2={mx(fretLineX(f))} y2={H - L.padB + 4} stroke={T.fret} strokeWidth={2} />
          <line x1={mx(fretLineX(f)) + (lefty ? -1.6 : 1.6)} y1={L.padT - 4} x2={mx(fretLineX(f)) + (lefty ? -1.6 : 1.6)} y2={H - L.padB + 4} stroke={T.fretHi} strokeWidth={0.6} />
        </g>
      ))}
      {/* Inlays on the board (between strings 3 and 4) */}
      {SINGLE_INLAYS.filter(inRange).map((f) => (
        <circle key={`inlay${f}`} cx={mx(fretX(f))} cy={(sY(2) + sY(3)) / 2} r={7} fill={T.inlay} />
      ))}
      {DOUBLE_INLAYS.filter(inRange).map((f) => (
        <g key={`inlay2-${f}`}>
          <circle cx={mx(fretX(f))} cy={(sY(1) + sY(2)) / 2} r={7} fill={T.inlay} />
          <circle cx={mx(fretX(f))} cy={(sY(3) + sY(4)) / 2} r={7} fill={T.inlay} />
        </g>
      ))}
      {/* Fret numbers */}
      {fretsShown.map((f) => (
        <text key={`fn${f}`} x={mx(fretX(f))} y={H - 6} textAnchor="middle"
          fontSize={L.fretNumSize} fill={T.label} fontFamily="'DM Mono', monospace"
          fontWeight={DOUBLE_INLAYS.includes(f) ? 600 : 400}>
          {f}
        </text>
      ))}
      {/* Strings: row 0 top = string 1 (high E) ... row 5 = string 6 */}
      {[0, 1, 2, 3, 4, 5].map((row) => {
        const stringNum = row + 1;
        const wound = stringNum >= 4;
        return (
          <line
            key={`s${row}`}
            x1={L.padL} y1={sY(row)} x2={W - L.padR} y2={sY(row)}
            stroke={wound ? T.stringWound : T.string}
            strokeWidth={0.8 + row * 0.32}
          />
        );
      })}
      {/* String labels */}
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <text key={`sl${row}`} x={mx(L.padL - 16)} y={sY(row) + 4} textAnchor="middle" fontSize={L.stringLabelSize} fill={T.label} fontFamily="'DM Mono', monospace">
          {STRING_NAMES[row + 1]}
        </text>
      ))}

      {/* Tap targets (full cells) */}
      {onCellClick &&
        [0, 1, 2, 3, 4, 5].map((row) =>
          Array.from({ length: fretCount + (startFret === 0 ? 1 : 0) }, (_, i) => (startFret === 0 ? i : startFret + 1 + i)).map((f) => (
            <rect
              key={`hit${row}-${f}`}
              x={mx(fretX(f)) - L.fretW / 2}
              y={sY(row) - L.stringGap / 2}
              width={L.fretW}
              height={L.stringGap}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => onCellClick({ string: row + 1, fret: f })}
            />
          ))
        )}

      {/* Markers */}
      {markers
        .filter((m) => inRange(m.fret))
        .map((m, i) => {
          const cx = mx(fretX(m.fret));
          const cy = sY(m.string - 1);
          const clickable = onMarkerClick || onCellClick;
          const handle = () =>
            onMarkerClick ? onMarkerClick(m) : onCellClick && onCellClick({ string: m.string, fret: m.fret });
          if (m.state === 'faded') {
            return (
              <g key={`m${i}`} onClick={clickable ? handle : undefined} style={clickable ? { cursor: 'pointer' } : undefined}>
                <circle cx={cx} cy={cy} r={L.dotR} fill={m.color || '#888'} opacity={T.fadedDotOpacity} />
                <text x={cx} y={cy + 4} textAnchor="middle" fill={T.fadedText} opacity={T.fadedTextOpacity}
                  fontSize={m.label.length > 3 ? 15 : L.labelSize} fontFamily="'DM Mono', monospace" fontWeight={600}>
                  {m.label}
                </text>
              </g>
            );
          }
          const opacity = m.state === 'normal' ? 0.88 : 1;
          return (
            <g key={`m${i}`} opacity={opacity} onClick={clickable ? handle : undefined} style={clickable ? { cursor: 'pointer' } : undefined}>
              {m.halo && (
                <>
                  <circle cx={cx} cy={cy} r={L.dotR + 10} fill={m.color} opacity={0.18} />
                  <circle cx={cx} cy={cy} r={L.dotR + 7} fill="none" stroke={m.color} strokeWidth={3} />
                </>
              )}
              <circle
                cx={cx} cy={cy} r={L.dotR}
                fill={m.isRoot ? m.color : T.dotBg}
                stroke={m.color}
                strokeWidth={m.isRoot ? 0 : 2.5}
              />
              <text
                x={cx} y={m.sub ? cy - 3 : cy + 4}
                textAnchor="middle"
                fill={m.isRoot ? T.dotText : m.color}
                fontSize={m.sub ? 16 : L.labelSize}
                fontFamily="'DM Mono', monospace" fontWeight={600}
              >
                {m.label}
              </text>
              {m.sub && (
                <text x={cx} y={cy + 14} textAnchor="middle" fill={m.isRoot ? T.dotText : m.color} fontSize={L.subSize} fontFamily="'DM Mono', monospace" opacity={0.85}>
                  {m.sub}
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
}

function CardBoard({ markers, theme }) {
  const T = getBoardTheme(theme);
  const L = CARD;
  const stringGap = (L.W - L.padL - L.padR) / 5;
  const fretGap = (L.H - L.padT - L.padB) / L.frets;
  const stringX = (s) => L.padL + (6 - s) * stringGap; // string 6 left .. string 1 right
  const fretLineY = (line) => L.padT + (line - 1) * fretGap;
  const dotY = (f) => (fretLineY(f) + fretLineY(f + 1)) / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${L.W} ${L.H}`} style={{ maxWidth: L.W }} role="img">
      {T.cardBg && <rect x={0} y={0} width={L.W} height={L.H} rx={6} fill={T.cardBg} />}
      {Array.from({ length: L.frets + 1 }, (_, i) => i + 1).map((line) => (
        <line
          key={`f${line}`}
          x1={L.padL} y1={fretLineY(line)} x2={L.W - L.padR} y2={fretLineY(line)}
          stroke={line === 1 ? T.cardNut : T.cardLine}
          strokeWidth={line === 1 ? 3 : 1}
        />
      ))}
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <line
          key={`s${s}`}
          x1={stringX(s)} y1={L.padT} x2={stringX(s)} y2={L.H - L.padB}
          stroke={T.cardString}
          strokeWidth={0.5 + (s - 1) * 0.22}
        />
      ))}
      {[3, 5].map((f) => (
        <circle key={`m${f}`} cx={(stringX(4) + stringX(3)) / 2} cy={dotY(f)} r={3.5} fill={T.cardInlay} />
      ))}
      {markers.map((d, idx) => {
        const cx = stringX(d.string);
        const cy = dotY(d.fret);
        return (
          <g key={idx}>
            <circle
              cx={cx} cy={cy} r={L.dotR}
              fill={d.isRoot ? T.cardRoot : T.cardDot}
              stroke={d.isRoot ? T.cardRootStroke : T.cardDotStroke}
              strokeWidth={1}
            />
            <text x={cx} y={cy + 3.5} textAnchor="middle" fill={T.cardDotText} fontSize={L.labelSize} fontFamily="'DM Mono', monospace" fontWeight={600}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Fretboard({
  size = 'full', // 'full' (horizontal neck) | 'card' (vertical diagram)
  markers = [],
  fretRange = [0, MAX_FRET],
  lefty = false,
  cagedBands = [],
  onMarkerClick,
  onCellClick,
  fit = 'scroll', // 'scroll' | 'width'
  heightClass,
  scrollRef,
  onScroll,
  theme = 'dark', // 'dark' | 'wood' | 'white'
}) {
  if (size === 'card') return <CardBoard markers={markers} theme={theme} />;
  const board = (
    <HorizontalBoard
      markers={markers}
      fretRange={fretRange}
      lefty={lefty}
      cagedBands={cagedBands}
      onMarkerClick={onMarkerClick}
      onCellClick={onCellClick}
      fit={fit}
      heightClass={heightClass}
      theme={theme}
    />
  );
  if (fit === 'width') return board;
  return (
    <div className="fb-scroll" ref={scrollRef} onScroll={onScroll}>
      {board}
    </div>
  );
}
