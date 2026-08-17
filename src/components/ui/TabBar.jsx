const ICONS = {
  practice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3-8 3 8" />
      <path d="M5 21h14" />
      <path d="M7 21c0-4 2-6 5-6s5 2 5 6" />
    </svg>
  ),
  songbook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v17h4.5A3.5 3.5 0 0 1 20 22V5.5Z" />
    </svg>
  ),
  drills: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  tools: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 9v11" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  ),
};

const TABS = [
  { id: 'practice', label: 'Practice' },
  { id: 'songbook', label: 'Songbook' },
  { id: 'drills', label: 'Drills' },
  { id: 'tools', label: 'Tools' },
  { id: 'progress', label: 'Progress' },
];

export default function TabBar({ active, onNavigate }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tabbar-item ${active === t.id ? 'active' : ''}`}
          aria-current={active === t.id ? 'page' : undefined}
          onClick={() => onNavigate(t.id)}
        >
          {ICONS[t.id]}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
