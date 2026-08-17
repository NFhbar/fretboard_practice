import { useMemo, useState } from 'react';
import { getSong } from '../../data/songbook/index.js';
import { useAppState } from '../../state/AppState.jsx';
import SongChart from '../../components/songbook/SongChart.jsx';

function todayDayIdx(dayCount) {
  const day = new Date().getDay();
  return day === 0 ? 0 : Math.min(day - 1, dayCount - 1);
}

export default function SongbookSongView({ songId, onNavigate }) {
  const song = getSong(songId);
  const { songbook, toggleSongTask, resetSongTasks, updateSongbookSong } = useAppState();
  const [selectedDay, setSelectedDay] = useState(() => todayDayIdx(song?.curriculum.length || 1));
  const [openBlocks, setOpenBlocks] = useState({});
  const [urlError, setUrlError] = useState('');

  const progress = songbook[songId] || {};
  const tasks = progress.tasks || {};
  const backingUrl = progress.backingUrl || '';
  const allTasks = useMemo(
    () => song?.curriculum.flatMap((day) => day.blocks.flatMap((block) => block.tasks)) || [],
    [song]
  );

  if (!song) {
    return (
      <div className="page">
        <div className="empty-note">Song not found.</div>
      </div>
    );
  }

  const day = song.curriculum[selectedDay];
  const completed = allTasks.filter((task) => tasks[task.id]).length;
  const dayProgress = (index) => {
    const dayTasks = song.curriculum[index].blocks.flatMap((block) => block.tasks);
    return dayTasks.length ? (dayTasks.filter((task) => tasks[task.id]).length / dayTasks.length) * 100 : 0;
  };
  const openBacking = () => {
    try {
      const url = new URL(backingUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      setUrlError('');
      window.open(url.href, '_blank', 'noopener,noreferrer');
    } catch {
      setUrlError('Enter a complete http or https URL.');
    }
  };

  return (
    <div className="page">
      <div className="header">
        <div className="header-eyebrow">Songbook · {song.key}</div>
        <div className="header-title">{song.title}</div>
        <div className="header-sub">{song.composer} · associated with the {song.associatedArtist}</div>
      </div>

      <div className="song-overview card">
        <div className="song-overview-head">
          <div>
            <div className="section-label">32-bar form</div>
            <div className="song-overview-meta">A–A–B–A · 4/4 · six days · 120 minutes/day</div>
          </div>
          <div className="song-overview-actions">
            <span className="badge-gold">{completed}/{allTasks.length}</span>
            <button className="toolbtn" onClick={() => onNavigate(`songbook/${song.id}/lab/${allTasks[0].id}`)}>Open Song Lab</button>
          </div>
        </div>
        <SongChart song={song} />
        {!song.melody && (
          <div className="song-data-notice">
            Melody exercises are ready for the authorized event transcription; harmony, form, fretboard and comping modes are available now.
          </div>
        )}
      </div>

      <div className="song-backing card">
        <div className="section-label">External backing track</div>
        <div className="song-backing-row">
          <input
            type="url"
            value={backingUrl}
            placeholder="https://…"
            aria-label="External backing track URL"
            onChange={(event) => {
              setUrlError('');
              updateSongbookSong(song.id, { backingUrl: event.target.value });
            }}
          />
          <button className="toolbtn" onClick={openBacking} disabled={!backingUrl}>Open</button>
        </div>
        {urlError && <div className="song-url-error">{urlError}</div>}
      </div>

      <div className="days-header" role="group" aria-label="Songbook practice day">
        {song.curriculum.map((item, index) => (
          <button
            key={item.day}
            className={`day-tab ${selectedDay === index ? 'active' : ''}`}
            aria-pressed={selectedDay === index}
            onClick={() => setSelectedDay(index)}
          >
            <span className="day-tab-name">{item.short}</span>
            <div className="day-tab-focus">{item.focus}</div>
            <div className="day-tab-progress">
              <div className="day-tab-progress-fill" style={{ width: `${dayProgress(index)}%` }} />
            </div>
          </button>
        ))}
      </div>

      <div className="day-panel card">
        <div className="day-panel-header">
          <div>
            <div className="day-panel-day">{day.day}</div>
            <div className="day-panel-focus">{day.focus}</div>
          </div>
          <div className="day-panel-duration">{day.totalMin} min</div>
          <button className="session-btn" onClick={() => onNavigate(`songbook/${song.id}/session/${selectedDay}`)}>▶ Start session</button>
        </div>

        {day.blocks.map((block, blockIndex) => {
          const blockId = `${selectedDay}-${blockIndex}`;
          const isOpen = openBlocks[blockId] !== false;
          const complete = block.tasks.every((task) => tasks[task.id]);
          return (
            <div className="block" key={blockId}>
              <button
                className="block-header"
                aria-expanded={isOpen}
                onClick={() => setOpenBlocks((state) => ({ ...state, [blockId]: !isOpen }))}
              >
                <div className={`block-dot ${complete ? 'complete' : ''}`} />
                <div className="block-title">{block.title}</div>
                <div className="block-duration">{block.min} min</div>
                <div className={`block-chevron ${isOpen ? 'open' : ''}`}>▶</div>
              </button>
              {isOpen && (
                <div className="block-body">
                  {block.tasks.map((task) => (
                    <div className="song-task-row" key={task.id}>
                      <button
                        className={`task ${tasks[task.id] ? 'done' : ''}`}
                        aria-pressed={!!tasks[task.id]}
                        onClick={() => toggleSongTask(song.id, task.id)}
                      >
                        <div className={`task-check ${tasks[task.id] ? 'done' : ''}`}>{tasks[task.id] ? '✓' : ''}</div>
                        <div>
                          <div className="task-label">{task.label}</div>
                          {task.note && <div className="task-note">{task.note}</div>}
                        </div>
                      </button>
                      {task.activity && (
                        <button
                          className="song-task-open"
                          aria-label={`Open ${task.label} in Song Lab`}
                          onClick={() => onNavigate(`songbook/${song.id}/lab/${task.id}`)}
                        >
                          Lab ↗
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="toolbtn-row">
        <button
          className="toolbtn"
          onClick={() => {
            if (window.confirm('Reset all task checks for this song?')) resetSongTasks(song.id);
          }}
        >
          Reset song checks
        </button>
      </div>
    </div>
  );
}
