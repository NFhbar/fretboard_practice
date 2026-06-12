const RANGES = [
  { label: 'All', value: [0, 24] },
  { label: '0–5', value: [0, 5] },
  { label: '4–9', value: [4, 9] },
  { label: '8–12', value: [8, 12] },
  { label: '12–17', value: [12, 17] },
  { label: '17–24', value: [17, 24] },
];

export default function FretRangeChips({ value, onChange }) {
  return (
    <div className="fb-range-chips" role="group" aria-label="Fret range">
      {RANGES.map((r) => {
        const on = value[0] === r.value[0] && value[1] === r.value[1];
        return (
          <button key={r.label} className={`chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => onChange(r.value)}>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
