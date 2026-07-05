// Chromaticism curriculum — one block per day, merged into both tracks' schedules
// at runtime (see scheduleMerged.js). Devices ladder across the week:
// approaches → neighbors → 3-note enclosures → 4-note enclosures → bebop → integration.
// Rhythm rule for everything here: THE TARGET LANDS ON THE BEAT, ornaments are pickups.
// Fingering rule: target under the MIDDLE finger (index takes the fret below, ring/pinky above).

export const CHROMATIC_BLOCKS = [
  {
    title: 'Chromaticism — Approach Notes', min: 35, tasks: [
      { id: 'chr-mon-1', label: 'Single string, approach from below — ascend the scale on each string (all 6), every target on the beat with the middle finger, chromatic approach on the "and" before it. 8th notes at 70 BPM',
        note: 'Open the Chromaticism Lab (Tools) — it draws each cell and sets the metronome. Half-step scale pairs (like 3–4 and 7–1) re-strike the previous note: that is correct, keep it even.' },
      { id: 'chr-mon-2', label: 'Single string, approach from above — descend the scale on each string, approach on the "and", target on the beat',
        note: 'Above-approaches are usually non-diatonic — hear the tension pull DOWN into the target.' },
      { id: 'chr-mon-3', label: 'Triad arpeggios with approaches — all 5 CAGED positions, targets = root, 3rd, 5th. Ascend approaching from below, descend approaching from above',
        note: 'Every chord tone in the box gets its chromatic pickup. Stay in position — the approach is always one fret away on the same string.' },
      { id: 'chr-mon-4', label: 'Diatonic triad arpeggios I–vii° with below-approaches — one position, each chord tone approached, quality named aloud' },
    ],
  },
  {
    title: 'Chromaticism — Neighbor Tones', min: 35, tasks: [
      { id: 'chr-tue-1', label: 'Single string, upper neighbor — ascend on each string: diatonic neighbor above on the "and", target on the beat. Then descend using the LOWER neighbor',
        note: 'Neighbors are always scale tones. Ascending uses the neighbor above, descending the neighbor below — otherwise the neighbor repeats the note you just left.' },
      { id: 'chr-tue-2', label: '7th arpeggios with neighbors — all 5 CAGED positions, targets = root, 3rd, 5th, 7th. Upper neighbors ascending, lower descending',
        note: 'The neighbor of a chord tone is a scale tone that does NOT belong to the chord — hear it as color, not as a wrong note.' },
      { id: 'chr-tue-3', label: 'Diatonic 7th arpeggios I–vii° with neighbors — one position, all four chord tones of each degree' },
      { id: 'chr-tue-4', label: 'Alternate: one bar approaches, one bar neighbors over a drone — feel the difference between chromatic pull and diatonic color' },
    ],
  },
  {
    title: 'Chromaticism — 3-Note Enclosures', min: 40, tasks: [
      { id: 'chr-wed-1', label: 'Single string enclosures in triplets — ascending: neighbor above, approach below, TARGET on the beat. All 6 strings. Set the metronome to triplet subdivision',
        note: 'Continuous triplets: each beat is target–neighbor–approach, where the last two notes envelope the NEXT target. The Lab plays this stream for you.' },
      { id: 'chr-wed-2', label: 'Single string descending — flip the cell: neighbor BELOW, approach ABOVE, target. All 6 strings',
        note: 'The flip avoids re-striking the target you just left. Same triplet feel, mirrored envelope.' },
      { id: 'chr-wed-3', label: 'Triad arpeggios with enclosures — all 5 CAGED positions, enclose root, 3rd, 5th, ascending and descending' },
      { id: 'chr-wed-4', label: '7th arpeggios with enclosures — all 5 positions, targets root, 3rd, 5th, 7th' },
      { id: 'chr-wed-5', label: 'Diatonic arpeggios I–vii° with enclosures — every chord tone gets its envelope. Push the tempo 5 BPM once clean' },
    ],
  },
  {
    title: 'Chromaticism — 4-Note Enclosures', min: 40, tasks: [
      { id: 'chr-thu-1', label: 'Single string in 16ths — neighbor, TARGET (on the off-beat, passing), approach, TARGET on the beat. Ascend all 6 strings. Metronome on 16th subdivision',
        note: 'The first target lands on the "&" — an unimportant place in time — then you leave it and resolve back ON the beat. This is rhythmic tension, not just pitch tension.' },
      { id: 'chr-thu-2', label: 'Single string descending — mirrored cell: lower neighbor, target, upper approach, target. All 6 strings' },
      { id: 'chr-thu-3', label: 'Triad arpeggios — all 5 CAGED positions, 4-note cells into root, 3rd, 5th, both directions' },
      { id: 'chr-thu-4', label: '7th arpeggios — all 5 positions, cells into root, 3rd, 5th, 7th' },
      { id: 'chr-thu-5', label: 'Diatonic arpeggios I–vii° with 4-note cells — one position, slow, target placement must stay metronomic' },
    ],
  },
  {
    title: 'Chromaticism — Bebop Enclosures', min: 35, tasks: [
      { id: 'chr-fri-1', label: 'Double chromatic from below (triplet: two half-steps up into the target) — single string ascending, then triad arpeggio tones in 2 CAGED positions',
        note: 'Two consecutive chromatic notes are fine when the target lands on the beat — the beat placement is what legitimizes them.' },
      { id: 'chr-fri-2', label: 'Double chromatic from above — single string descending, then arpeggio tones' },
      { id: 'chr-fri-3', label: 'Classic 4-note bebop cell: diatonic above → chromatic above → chromatic below → target. Single string, then 7th arpeggios, targets 3rd and 7th',
        note: 'This is THE bebop sound. 3rds and 7ths are the strongest targets — they define the chord.' },
      { id: 'chr-fri-4', label: 'Surround cell: diatonic above → diatonic below → chromatic below → target. Apply to roots and 5ths across 2 positions' },
      { id: 'chr-fri-5', label: 'Mix all four formulas over one octave of the scale — choose the formula by where your hand sits, not by habit' },
    ],
  },
  {
    title: 'Chromaticism — Integration', min: 30, tasks: [
      { id: 'chr-sat-1', label: 'Loop I–vi–IV–V (progression player): enclose the 3rd of each chord exactly at the change — 3-note cells first, then 4-note',
        note: 'The enclosure starts BEFORE the bar line so the target lands on beat 1 of the new chord. This is the whole point of the week.' },
      { id: 'chr-sat-2', label: 'ii–V–I: approach the 7th of each chord from below at every change, then enclose it' },
      { id: 'chr-sat-3', label: 'Free improvisation over a drone — normal diatonic lines, but every phrase must END with an enclosure into a chord tone on the beat' },
      { id: 'chr-sat-4', label: 'Record 8 bars. Listen: do the chromatic notes sound intentional? If any sound like mistakes, the target missed the beat — drill that cell' },
    ],
  },
];

// Harmonic minor variants — same devices, HM-specific color notes and ids.
export const CHROMATIC_BLOCKS_HM = [
  {
    title: 'Chromaticism — Approach Notes (HM)', min: 35, tasks: [
      { id: 'hm-chr-mon-1', label: 'Single string, approach from below — ascend the harmonic minor scale on each string, target on the beat with the middle finger, chromatic pickup on the "and". 8ths at 70 BPM',
        note: 'Use the Chromaticism Lab on the HM track. The ♮7 already pulls to the root — approaching the 7 from below stacks chromatic tension on the leading tone.' },
      { id: 'hm-chr-mon-2', label: 'Single string, approach from above — descend each string, approach above, target on the beat' },
      { id: 'hm-chr-mon-3', label: 'Minor triad arpeggios (i) with approaches — all 5 positions, targets root, ♭3, 5' },
      { id: 'hm-chr-mon-4', label: 'Diatonic HM triads i–vii° with below-approaches — one position. The III+ tones feel ambiguous — let the beat placement resolve them' },
    ],
  },
  {
    title: 'Chromaticism — Neighbor Tones (HM)', min: 35, tasks: [
      { id: 'hm-chr-tue-1', label: 'Single string, upper neighbor ascending / lower neighbor descending — all 6 strings',
        note: 'Between ♭6 and 7 the diatonic neighbor is an augmented 2nd — a three-fret "neighbor". That exotic leap is the harmonic minor signature; keep it in time.' },
      { id: 'hm-chr-tue-2', label: 'mMaj7 (i) and V7 arpeggios with neighbors — all 5 positions, targets root, 3rd, 5th, 7th' },
      { id: 'hm-chr-tue-3', label: 'Diatonic HM 7th arpeggios i–vii° with neighbors — one position, name each quality aloud' },
      { id: 'hm-chr-tue-4', label: 'One bar approaches / one bar neighbors over a minor drone — chromatic pull vs. HM color' },
    ],
  },
  {
    title: 'Chromaticism — 3-Note Enclosures (HM)', min: 40, tasks: [
      { id: 'hm-chr-wed-1', label: 'Single string triplet enclosures ascending (neighbor above, approach below, target) — all 6 strings, metronome on triplets' },
      { id: 'hm-chr-wed-2', label: 'Descending with the mirrored cell (neighbor below, approach above) — all 6 strings' },
      { id: 'hm-chr-wed-3', label: 'Minor triad (i) and major triad (V) arpeggios with enclosures — all 5 positions' },
      { id: 'hm-chr-wed-4', label: 'mMaj7 and V7 arpeggios with enclosures — targets root, 3rd, 5th, 7th',
        note: 'Enclosing the ♮7 of mMaj7 is the darkest, prettiest sound of this week. Slow it down and listen.' },
      { id: 'hm-chr-wed-5', label: 'Diatonic HM arpeggios i–vii° with enclosures — push 5 BPM once clean' },
    ],
  },
  {
    title: 'Chromaticism — 4-Note Enclosures (HM)', min: 40, tasks: [
      { id: 'hm-chr-thu-1', label: 'Single string 16th cells (neighbor, target-off-beat, approach, TARGET) ascending — all 6 strings, 16th subdivision' },
      { id: 'hm-chr-thu-2', label: 'Descending with the mirrored cell — all 6 strings' },
      { id: 'hm-chr-thu-3', label: 'i and V triad arpeggios — 4-note cells into root, 3rd, 5th, all positions' },
      { id: 'hm-chr-thu-4', label: 'mMaj7, V7, vii°7 arpeggios — cells into all four tones. The dim7 symmetry makes every tone feel like a possible target' },
      { id: 'hm-chr-thu-5', label: 'Diatonic HM arpeggios i–vii° with 4-note cells — one position, strict time' },
    ],
  },
  {
    title: 'Chromaticism — Bebop Enclosures (HM)', min: 35, tasks: [
      { id: 'hm-chr-fri-1', label: 'Double chromatic from below into V7 chord tones — Phrygian dominant already halfway there; the ♭2–3 gap loves chromatic filling' },
      { id: 'hm-chr-fri-2', label: 'Double chromatic from above — descending lines into i chord tones' },
      { id: 'hm-chr-fri-3', label: 'Classic 4-note bebop cell into the 3rd of V7 and the ♭3 of i — the two defining colors of the minor key' },
      { id: 'hm-chr-fri-4', label: 'Surround cell into roots and 5ths — 2 positions. Note where HM neighbors make the surround exotic' },
      { id: 'hm-chr-fri-5', label: 'Mix formulas over one octave of harmonic minor — choose by hand position' },
    ],
  },
  {
    title: 'Chromaticism — Integration (HM)', min: 30, tasks: [
      { id: 'hm-chr-sat-1', label: 'Loop i–iv–V–i: enclose the 3rd of each chord exactly at the change — 3-note cells, then 4-note' },
      { id: 'hm-chr-sat-2', label: 'ii°–V7–i: approach then enclose the 7th of each chord at every change' },
      { id: 'hm-chr-sat-3', label: 'Free improv over a minor drone — every phrase ends with an enclosure into a chord tone on the beat' },
      { id: 'hm-chr-sat-4', label: 'Record 8 bars. The chromatic notes should sound like bebop, not accidents — if not, the targets are drifting off the beat' },
    ],
  },
];
