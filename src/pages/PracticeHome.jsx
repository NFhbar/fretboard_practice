import { useState } from 'react';
import { useAppState } from '../state/AppState.jsx';
import { KEY_CYCLE } from '../data/notes.js';
import { SCALES, HARM_MINOR_SCALES, DIATONIC, HARM_MINOR_DIATONIC } from '../data/scales.js';
import { MASTERY_ITEMS } from '../data/mastery.js';
import { getSchedule } from '../data/scheduleMerged.js';

function todayDayIdx() {
  const d = new Date().getDay(); // 0 Sun .. 6 Sat
  return d === 0 ? 0 : Math.min(d - 1, 5); // Mon..Sat -> 0..5, Sunday shows Monday
}

export default function PracticeHome({ onNavigate }) {
  const {
    week, setWeek, track, updateSettings, currentKey, nextKey,
    weekTasks, toggleTask, resetWeekTasks, mastery, toggleMastery, completeWeek,
  } = useAppState();
  const [selectedDay, setSelectedDay] = useState(todayDayIdx);
  const [openBlocks, setOpenBlocks] = useState({});

  const activeSchedule = getSchedule(track);
  const day = activeSchedule[selectedDay];

  const toggleBlock = (id) => setOpenBlocks((p) => ({ ...p, [id]: !p[id] }));
  const dayProgress = (dayIdx) => {
    const tasks = activeSchedule[dayIdx].blocks.flatMap((b) => b.tasks);
    const completed = tasks.filter((t) => weekTasks[t.id]).length;
    return tasks.length ? (completed / tasks.length) * 100 : 0;
  };
  const allBlocksDone = (block) => block.tasks.every((t) => weekTasks[t.id]);
  const masteryCount = (key) => (!mastery[key] ? 0 : Object.values(mastery[key]).filter(Boolean).length);

  const scale = track === 'major' ? SCALES[currentKey] : HARM_MINOR_SCALES[currentKey];
  const diatonicDefs = track === 'major' ? DIATONIC : HARM_MINOR_DIATONIC;

  return (
    <div className="page">
      <div className="header">
        <div className="header-eyebrow">Guitar Fretboard Mastery</div>
        <div className="header-title">Weekly Practice System</div>
        <div className="header-sub">Cycle of Fourths · 12 Keys · 6 Days/Week</div>
      </div>

      <div className="key-section card">
        <div className="section-label">Key Rotation — Cycle of Fourths</div>
        <div className="key-cycle">
          {KEY_CYCLE.map((k, i) => (
            <button
              key={k}
              className={`key-pill ${i + 1 === week ? 'active' : i + 1 < week ? 'done' : ''}`}
              onClick={() => setWeek(i + 1)}
              title={`Week ${i + 1}`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="track-toggle" role="group" aria-label="Practice track">
          <button className={track === 'major' ? 'active' : ''} aria-pressed={track === 'major'} onClick={() => updateSettings({ track: 'major' })}>
            Major Modes
          </button>
          <button
            className={track === 'harmonic-minor' ? 'active' : ''}
            aria-pressed={track === 'harmonic-minor'}
            onClick={() => updateSettings({ track: 'harmonic-minor' })}
          >
            Harmonic Minor
          </button>
        </div>
        <div className="week-meta">
          <div className="week-meta-item">
            <span className="week-meta-label">Current Week</span>
            <span className="week-meta-val">{week} / 12</span>
          </div>
          <div className="week-meta-item">
            <span className="week-meta-label">Current Key</span>
            <span className="week-meta-val">{currentKey}</span>
          </div>
          <div className="week-meta-item">
            <span className="week-meta-label">Relative Minor</span>
            <span className="week-meta-val" style={{ color: '#8e6bbf', fontSize: 18 }}>
              {SCALES[currentKey] ? SCALES[currentKey][5] + 'm' : ''}
            </span>
          </div>
          <div className="week-meta-item">
            <span className="week-meta-label">Next Key</span>
            <span className="week-meta-val" style={{ color: 'var(--text-faint)', fontSize: 18 }}>{nextKey}</span>
          </div>
          <div className="week-nav">
            <button onClick={() => setWeek(Math.max(1, week - 1))} disabled={week === 1}>← Prev</button>
            <button onClick={() => setWeek(Math.min(12, week + 1))} disabled={week === 12}>Next →</button>
          </div>
        </div>
        <div className="toolbtn-row">
          <button className="toolbtn" onClick={completeWeek}>✓ Complete week → next key</button>
          <button className="toolbtn" onClick={() => { if (window.confirm('Reset all task checks for this week?')) resetWeekTasks(); }}>
            Reset week checks
          </button>
        </div>
      </div>

      <div className="theory-section card">
        <div className="theory-header">
          <div className="theory-title">{track === 'major' ? 'Diatonic Triads' : 'Harmonic Minor Triads'}</div>
          <div className="badge-gold">{currentKey} {track === 'major' ? 'Major' : 'Harmonic Minor'}</div>
        </div>
        <div className="table-scroll">
          <table className="theory-table">
            <thead>
              <tr>
                <th>Degree</th>
                <th>Chord</th>
                <th>Quality</th>
                <th>Notes</th>
                <th>Intervals</th>
              </tr>
            </thead>
            <tbody>
              {scale &&
                diatonicDefs.map((d, i) => {
                  const root = scale[i];
                  const third = scale[(i + 2) % 7];
                  const fifth = scale[(i + 4) % 7];
                  const qClass = d.quality === 'Maj' ? 'quality-maj' : d.quality === 'min' ? 'quality-min' : d.quality === 'aug' ? 'quality-aug' : 'quality-dim';
                  return (
                    <tr key={i}>
                      <td className="roman-cell">{d.roman}</td>
                      <td className="chord-cell">{root}{d.suffix}</td>
                      <td className={`quality-cell ${qClass}`}>{d.quality}</td>
                      <td className="notes-cell">{root} – {third} – {fifth}</td>
                      <td className="intervals-cell">{d.intervals}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="days-header">
        {activeSchedule.map((d, i) => (
          <button key={d.day} className={`day-tab ${selectedDay === i ? 'active' : ''}`} onClick={() => setSelectedDay(i)}>
            <span className="day-tab-name">{d.short}</span>
            <div className="day-tab-focus">{d.focus}</div>
            <div className="day-tab-progress">
              <div className="day-tab-progress-fill" style={{ width: `${dayProgress(i)}%` }} />
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
          <button className="session-btn" onClick={() => onNavigate(`session/${selectedDay}`)}>▶ Start session</button>
        </div>
        {day.blocks.map((block, bi) => {
          const blockId = `${selectedDay}-${bi}`;
          const isOpen = openBlocks[blockId] !== false;
          const complete = allBlocksDone(block);
          return (
            <div className="block" key={blockId}>
              <button className="block-header" onClick={() => toggleBlock(blockId)} aria-expanded={isOpen}>
                <div className={`block-dot ${complete ? 'complete' : ''}`} />
                <div className="block-title">{block.title}</div>
                <div className="block-duration">{block.min} min</div>
                <div className={`block-chevron ${isOpen ? 'open' : ''}`}>▶</div>
              </button>
              {isOpen && (
                <div className="block-body">
                  {block.tasks.map((task) => (
                    <button key={task.id} className={`task ${weekTasks[task.id] ? 'done' : ''}`} onClick={() => toggleTask(task.id)}>
                      <div className={`task-check ${weekTasks[task.id] ? 'done' : ''}`}>{weekTasks[task.id] ? '✓' : ''}</div>
                      <div>
                        <div className="task-label">{task.label}</div>
                        {task.note && <div className="task-note">{task.note}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mastery-section card">
        <div className="mastery-header">
          <div className="mastery-title">Mastery Checklist</div>
          <div className="badge-gold">{currentKey}</div>
          {masteryCount(currentKey) === MASTERY_ITEMS.length && <span className="complete-badge">✓ Key Complete</span>}
          <div className="mastery-score">{masteryCount(currentKey)} / {MASTERY_ITEMS.length}</div>
        </div>
        <div className="mastery-bar-wrap">
          <div className="mastery-bar">
            <div className="mastery-bar-fill" style={{ width: `${(masteryCount(currentKey) / MASTERY_ITEMS.length) * 100}%` }} />
          </div>
        </div>
        <div className="mastery-items">
          {MASTERY_ITEMS.map((item, idx) => {
            const checked = !!(mastery[currentKey] || {})[idx];
            return (
              <button key={idx} className={`mastery-item ${checked ? 'done' : ''}`} onClick={() => toggleMastery(currentKey, idx)}>
                <div className={`task-check ${checked ? 'done' : ''}`}>{checked ? '✓' : ''}</div>
                <div className="mastery-item-text">{item}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
