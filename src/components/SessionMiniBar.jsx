import { useEffect, useState } from 'react';
import { useSession, getSession, sessionStore, timerNow, fmtMs } from '../state/sessionStore.js';
import { getSchedule } from '../data/scheduleMerged.js';
import { playChime } from '../audio/engine.js';

function remainingFor(a, block) {
  return block.min * 60_000 + a.timer.extraMs - timerNow(a).elapsedMs;
}

// Shown everywhere except the session screen while a session is running:
// live countdown + current block, tap to return. The chime still fires
// on block overrun even when the session view is unmounted.
export default function SessionMiniBar({ onOpen }) {
  const active = useSession();
  const [, force] = useState(0);

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      const a = getSession();
      if (a) {
        const d = getSchedule(a.track)[a.dayIdx];
        if (!a.chimed && remainingFor(a, d.blocks[a.blockIdx]) < 0) {
          playChime();
          sessionStore.markChimed();
        }
      }
      force((x) => x + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, [active]);

  if (!active) return null;

  const day = getSchedule(active.track)[active.dayIdx];
  const block = day.blocks[active.blockIdx];
  const { isPaused } = timerNow(active);
  const remainingMs = remainingFor(active, block);
  const overrun = remainingMs < 0;

  return (
    <button className={`session-minibar ${overrun ? 'overrun' : ''}`} onClick={onOpen} aria-label="Return to running session">
      <span className="session-minibar-time">{isPaused ? '⏸' : '▶'} {fmtMs(overrun ? -remainingMs : remainingMs)}</span>
      <span className="session-minibar-block">
        {block.title} · {active.blockIdx + 1}/{day.blocks.length}
      </span>
      <span className="session-minibar-cta">return ↗</span>
    </button>
  );
}
