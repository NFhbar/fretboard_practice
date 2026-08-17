import { SONGBOOK } from '../../data/songbook/index.js';
import { useAppState } from '../../state/AppState.jsx';

function taskCount(song) {
  return song.curriculum.flatMap((day) => day.blocks.flatMap((block) => block.tasks)).length;
}

export default function SongbookIndex({ onOpen }) {
  const { songbook } = useAppState();

  return (
    <div className="page page-wide">
      <div className="header">
        <div className="header-eyebrow">Repertoire Practice</div>
        <div className="header-title">Songbook</div>
        <div className="header-sub">Learn complete songs through form, harmony, melody, comping and improvisation</div>
      </div>

      <div className="tools-grid">
        {SONGBOOK.map((song) => {
          const total = taskCount(song);
          const complete = Object.values(songbook[song.id]?.tasks || {}).filter(Boolean).length;
          return (
            <button key={song.id} className="tool-card" onClick={() => onOpen(song.id)}>
              <div className="tool-card-title">
                {song.title}
                <span className="tool-card-tag">{complete}/{total}</span>
              </div>
              <div className="tool-card-desc">
                {song.composer} · {song.key} · AABA · six-day intensive
              </div>
              <div className="day-tab-progress" aria-label={`${complete} of ${total} tasks complete`}>
                <div className="day-tab-progress-fill" style={{ width: `${total ? (complete / total) * 100 : 0}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
