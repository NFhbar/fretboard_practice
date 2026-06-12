import { KEY_CYCLE } from '../data/notes.js';
import { COF_KEYS, COF_DISPLAY } from '../data/colors.js';

const RELATIVE_MINORS = ['Am','Em','Bm','F♯m','C♯m','G♯m','E♭m','B♭m','Fm','Cm','Gm','Dm'];
const DIMINISHED = ['B°','F♯°','C♯°','G♯°','D♯°','A♯°','F°','C°','G°','D°','A°','E°'];

const C = {
  bg: '#17171f',
  stroke: '#34343f',
  majorCurrent: '#c9963a',
  majorDiatonic: 'rgba(201,150,58,0.22)',
  majorOther: '#1e1e27',
  majorTextCurrent: '#0c0c0f',
  majorTextDiatonic: '#e6c68d',
  majorTextOther: '#6a6575',
  minorDiatonic: 'rgba(91,138,189,0.22)',
  minorOther: '#191921',
  minorText: '#a5c4e6',
  minorTextOther: '#5a5a68',
  dimDiatonic: 'rgba(199,84,84,0.2)',
  dimOther: '#16161d',
  dimText: '#e6a5a5',
  dimTextOther: '#525260',
  numeral: '#d4b078',
  arrow: '#5a5a68',
  center: '#101015',
};

function wedge(cx, cy, r0, r1, a0, a1) {
  const x1 = cx + r0 * Math.cos(a0);
  const y1 = cy + r0 * Math.sin(a0);
  const x2 = cx + r1 * Math.cos(a0);
  const y2 = cy + r1 * Math.sin(a0);
  const x3 = cx + r1 * Math.cos(a1);
  const y3 = cy + r1 * Math.sin(a1);
  const x4 = cx + r0 * Math.cos(a1);
  const y4 = cy + r0 * Math.sin(a1);
  return `M ${x1} ${y1} L ${x2} ${y2} A ${r1} ${r1} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r0} ${r0} 0 0 0 ${x1} ${y1} Z`;
}

export default function CircleOfFifths({ week }) {
  const currentKey = KEY_CYCLE[week - 1];
  const cx = 600, cy = 600, R = 500, innerR = 340, dimR = 210, centerR = 100;
  const W = 1200, H = 1200;

  const cofIdx = COF_KEYS.indexOf(currentKey);
  const rotOffset = cofIdx * -30 - 15;

  const diatonic = new Set([(cofIdx - 1 + 12) % 12, cofIdx, (cofIdx + 1) % 12]);
  const majorNumeral = { [(cofIdx - 1 + 12) % 12]: 'IV', [cofIdx]: 'I', [(cofIdx + 1) % 12]: 'V' };
  const minorNumeral = { [(cofIdx - 1 + 12) % 12]: 'ii', [cofIdx]: 'vi', [(cofIdx + 1) % 12]: 'iii' };
  const dimNumeral = { [cofIdx]: 'vii°' };

  const angles = (i) => ({
    a0: ((i * 30 - 90 + rotOffset) * Math.PI) / 180,
    a1: (((i + 1) * 30 - 90 + rotOffset) * Math.PI) / 180,
    mid: ((i * 30 + 15 - 90 + rotOffset) * Math.PI) / 180,
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: 'calc(100vh - 200px)' }} role="img" aria-label={`Circle of fifths, ${currentKey} highlighted`}>
      <circle cx={cx} cy={cy} r={R + 30} fill={C.bg} stroke={C.stroke} strokeWidth={1} />

      {COF_KEYS.map((key, i) => {
        const { a0, a1, mid } = angles(i);
        const isCurrent = i === cofIdx;
        const isDia = diatonic.has(i);
        const fill = isCurrent ? C.majorCurrent : isDia ? C.majorDiatonic : C.majorOther;
        const textColor = isCurrent ? C.majorTextCurrent : isDia ? C.majorTextDiatonic : C.majorTextOther;
        const labelR = (R + innerR) / 2;
        const lx = cx + labelR * Math.cos(mid);
        const ly = cy + labelR * Math.sin(mid);
        return (
          <g key={key}>
            <path d={wedge(cx, cy, innerR, R, a0, a1)} fill={fill} stroke={C.stroke} strokeWidth={1} />
            <text x={lx} y={ly - 14} textAnchor="middle" dominantBaseline="central" fill={textColor}
              fontSize={42} fontWeight={isCurrent || isDia ? 700 : 400} fontFamily="'Playfair Display', serif">
              {COF_DISPLAY[key] || key}
            </text>
            {majorNumeral[i] && (
              <text x={lx} y={ly + 22} textAnchor="middle" dominantBaseline="central"
                fill={isCurrent ? C.majorTextCurrent : C.numeral} fontSize={24} fontWeight={500} opacity={0.85}
                fontFamily="'DM Mono', monospace">
                {majorNumeral[i]}
              </text>
            )}
          </g>
        );
      })}

      {RELATIVE_MINORS.map((key, i) => {
        const { a0, a1, mid } = angles(i);
        const isDia = diatonic.has(i);
        const labelR = (innerR + dimR) / 2;
        const lx = cx + labelR * Math.cos(mid);
        const ly = cy + labelR * Math.sin(mid);
        return (
          <g key={key}>
            <path d={wedge(cx, cy, dimR, innerR, a0, a1)} fill={isDia ? C.minorDiatonic : C.minorOther} stroke={C.stroke} strokeWidth={1} />
            <text x={lx} y={ly - 10} textAnchor="middle" dominantBaseline="central"
              fill={isDia ? C.minorText : C.minorTextOther} fontSize={30} fontWeight={isDia ? 600 : 400} fontFamily="'DM Mono', monospace">
              {key}
            </text>
            {minorNumeral[i] && (
              <text x={lx} y={ly + 16} textAnchor="middle" dominantBaseline="central" fill={C.minorText} fontSize={20} fontWeight={500} opacity={0.75} fontFamily="'DM Mono', monospace">
                {minorNumeral[i]}
              </text>
            )}
          </g>
        );
      })}

      {DIMINISHED.map((key, i) => {
        const { a0, a1, mid } = angles(i);
        const isDia = dimNumeral[i] !== undefined;
        const labelR = (dimR + centerR) / 2;
        const lx = cx + labelR * Math.cos(mid);
        const ly = cy + labelR * Math.sin(mid);
        return (
          <g key={key}>
            <path d={wedge(cx, cy, centerR, dimR, a0, a1)} fill={isDia ? C.dimDiatonic : C.dimOther} stroke={C.stroke} strokeWidth={1} />
            <text x={lx} y={ly - 6} textAnchor="middle" dominantBaseline="central"
              fill={isDia ? C.dimText : C.dimTextOther} fontSize={24} fontWeight={isDia ? 600 : 400} fontFamily="'DM Mono', monospace">
              {key}
            </text>
            {dimNumeral[i] && (
              <text x={lx} y={ly + 12} textAnchor="middle" dominantBaseline="central" fill={C.dimText} fontSize={17} fontWeight={500} opacity={0.75} fontFamily="'DM Mono', monospace">
                {dimNumeral[i]}
              </text>
            )}
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r={centerR} fill={C.center} stroke={C.stroke} strokeWidth={1} />

      {(() => {
        const arrowR = R + 18;
        const startA = ((-90 + 340 + rotOffset) * Math.PI) / 180;
        const endA = ((-90 + 200 + rotOffset) * Math.PI) / 180;
        const sx = cx + arrowR * Math.cos(startA);
        const sy = cy + arrowR * Math.sin(startA);
        const ex = cx + arrowR * Math.cos(endA);
        const ey = cy + arrowR * Math.sin(endA);
        return (
          <path d={`M ${sx} ${sy} A ${arrowR} ${arrowR} 0 0 0 ${ex} ${ey}`} fill="none" stroke={C.arrow} strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrowCof)" />
        );
      })()}
      <defs>
        <marker id="arrowCof" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={C.arrow} />
        </marker>
      </defs>
    </svg>
  );
}
