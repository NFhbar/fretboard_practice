import { useAppState } from '../../state/AppState.jsx';

const SWATCHES = {
  dark: { bg: '#16161d', line: '#a59e94', border: '#42424f' },
  wood: { bg: '#61391d', line: '#e3ddcf', border: '#3d2512' },
  white: { bg: '#ffffff', line: '#8f8a80', border: '#c4c1ba' },
};

export default function BoardThemePicker() {
  const { settings, updateSettings } = useAppState();
  const current = settings.boardTheme || 'dark';
  return (
    <div className="board-picker" role="group" aria-label="Fretboard options">
      {Object.keys(SWATCHES).map((name) => {
        const s = SWATCHES[name];
        const on = current === name;
        return (
          <button
            key={name}
            className={`board-swatch ${on ? 'on' : ''}`}
            aria-pressed={on}
            title={`${name[0].toUpperCase()}${name.slice(1)} fretboard`}
            onClick={() => updateSettings({ boardTheme: name })}
          >
            <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true">
              <rect x="1" y="1" width="26" height="18" rx="3" fill={s.bg} stroke={s.border} />
              {[5.5, 10, 14.5].map((y) => (
                <line key={y} x1="4" y1={y + 1} x2="24" y2={y + 1} stroke={s.line} strokeWidth="1" />
              ))}
            </svg>
            <span>{name}</span>
          </button>
        );
      })}
      <button
        className={`board-swatch ${settings.lefty ? 'on' : ''}`}
        aria-pressed={!!settings.lefty}
        title="Mirror the neck for left-handed players (nut on the right)"
        onClick={() => updateSettings({ lefty: !settings.lefty })}
      >
        <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true">
          <path d="M19 4 L9 10 L19 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>lefty</span>
      </button>
    </div>
  );
}
