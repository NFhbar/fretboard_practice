import { expandSongForm } from '../../theory/songForm.js';

export default function SongChart({
  song,
  scope = 'form',
  currentBeat = null,
  selectedChangeId = null,
  onSelectChange,
}) {
  const bars = expandSongForm(song, scope);
  const currentBar = currentBeat === null || currentBeat < 0 ? null : Math.floor(currentBeat / song.meter.beatsPerBar) + 1;
  const groups = [];

  for (const bar of bars) {
    const last = groups.at(-1);
    if (!last || last.formIndex !== bar.formIndex) groups.push({ formIndex: bar.formIndex, section: bar.section, bars: [bar] });
    else last.bars.push(bar);
  }

  return (
    <div className="song-chart" aria-label={`${song.title} chord form`}>
      {groups.map((group) => (
        <section className="song-chart-section" key={`${group.section}-${group.formIndex}`}>
          <div className="song-chart-section-label">{group.section}</div>
          <div className="song-chart-bars">
            {group.bars.map((bar) => {
              const active = bar.absoluteBar === currentBar;
              return (
                <div className={`song-chart-bar ${active ? 'active' : ''}`} key={bar.absoluteBar} aria-current={active ? 'true' : undefined}>
                  <span className="song-chart-bar-number">{bar.absoluteBar}</span>
                  <div className="song-chart-changes">
                    {bar.changes.map((change) => {
                      const selected = selectedChangeId === change.id;
                      const content = (
                        <>
                          {change.symbol}
                          {bar.changes.length > 1 && <small>{change.beat + 1}</small>}
                        </>
                      );
                      return onSelectChange ? (
                        <button
                          key={change.id}
                          className={`song-chart-change ${selected ? 'selected' : ''}`}
                          aria-pressed={selected}
                          onClick={() => onSelectChange(change)}
                        >
                          {content}
                        </button>
                      ) : (
                        <span className="song-chart-change" key={change.id}>{content}</span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
