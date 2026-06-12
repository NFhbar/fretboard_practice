import { useCallback, useEffect, useRef, useState } from 'react';

// Slim overview strip synced to a horizontal scroll container.
export default function Minimap({ scrollRef, markers, fretRange = [0, 24] }) {
  const [view, setView] = useState({ frac: 1, offset: 0 });
  const svgRef = useRef(null);
  const draggingRef = useRef(false);
  const W = 300;
  const H = 30;
  const [startFret, endFret] = fretRange;
  const span = endFret - startFret || 1;

  const readScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth === 0) return;
    setView({
      frac: Math.min(1, el.clientWidth / el.scrollWidth),
      offset: el.scrollWidth > el.clientWidth ? el.scrollLeft / (el.scrollWidth - el.clientWidth) : 0,
    });
  }, [scrollRef]);

  useEffect(() => {
    readScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', readScroll, { passive: true });
    const ro = new ResizeObserver(readScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', readScroll);
      ro.disconnect();
    };
  }, [scrollRef, readScroll, fretRange]);

  const seek = useCallback(
    (clientX) => {
      const el = scrollRef.current;
      const svg = svgRef.current;
      if (!el || !svg) return;
      const rect = svg.getBoundingClientRect();
      const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const winFrac = el.clientWidth / el.scrollWidth;
      const target = Math.max(0, Math.min(1, frac - winFrac / 2));
      el.scrollLeft = target * (el.scrollWidth - el.clientWidth || 1) / (1 - winFrac || 1);
    },
    [scrollRef]
  );

  if (view.frac >= 0.999) return null;

  const winW = W * view.frac;
  const winX = (W - winW) * view.offset;

  return (
    <div className="fb-minimap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 30, display: 'block', touchAction: 'none', cursor: 'pointer' }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          seek(e.clientX);
        }}
        onPointerMove={(e) => draggingRef.current && seek(e.clientX)}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={W} height={H} rx={4} fill="#191920" stroke="#34343f" />
        {Array.from({ length: span + 1 }, (_, i) => startFret + i).map((f) => (
          <line key={f} x1={(W * (f - startFret)) / span} y1={4} x2={(W * (f - startFret)) / span} y2={H - 4} stroke="#2e2e3a" strokeWidth={f % 12 === 0 ? 1.5 : 0.5} />
        ))}
        {markers
          .filter((m) => m.state !== 'faded' && m.fret >= startFret && m.fret <= endFret)
          .map((m, i) => (
            <circle
              key={i}
              cx={(W * (m.fret - startFret - 0.5 < 0 ? 0.2 : m.fret - startFret - 0.5)) / span}
              cy={4 + ((m.string - 1) / 5) * (H - 8)}
              r={1.6}
              fill={m.color || '#8a8480'}
              opacity={0.8}
            />
          ))}
        <rect x={winX} y={1} width={winW} height={H - 2} rx={3} fill="rgba(201,150,58,0.12)" stroke="#c9963a" strokeWidth={1} />
      </svg>
    </div>
  );
}
