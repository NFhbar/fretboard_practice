export const TAKE_THE_A_TRAIN_WEEK = [
  {
    day: 'Monday',
    short: 'Mon',
    focus: 'Form, Roots & Bass',
    totalMin: 120,
    blocks: [
      {
        title: 'Form Map',
        min: 15,
        tasks: [
          {
            id: 'sb-att-mon-form',
            label: 'Name every section, bar, chord, and split change through A–A–B–A.',
            note: 'Keep the 32-bar form visible and speak each change before it arrives.',
            activity: { mode: 'chart', scope: 'form', zone: 'zone-1' },
          },
        ],
      },
      {
        title: 'Root Motion',
        min: 20,
        tasks: [
          {
            id: 'sb-att-mon-roots',
            label: 'Play roots through the complete form using whole notes and half notes at split changes.',
            activity: { mode: 'roots', scope: 'form', zone: 'zone-1', rhythm: 'harmonic' },
          },
        ],
      },
      {
        title: 'Half-Time Bass',
        min: 20,
        tasks: [
          {
            id: 'sb-att-mon-bass',
            label: 'Play root on beat 1 and fifth on beat 3 without losing the form.',
            note: 'At a beat-3 chord change, play the new chord root instead of the previous fifth.',
            activity: { mode: 'bass', scope: 'form', zone: 'zone-1', rhythm: 'half' },
          },
        ],
      },
      {
        title: 'Root-Position Triads',
        min: 25,
        tasks: [
          {
            id: 'sb-att-mon-triads',
            label: 'Arpeggiate each triad from its root and land on every harmonic change.',
            activity: { mode: 'triad-root', scope: 'form', zone: 'zone-1', rhythm: 'quarter' },
          },
        ],
      },
      {
        title: 'A-Section Melody',
        min: 25,
        tasks: [
          {
            id: 'sb-att-mon-melody-a',
            label: 'Learn the A-section melody as a single-note phrase in the first neck zone.',
            activity: { mode: 'melody', scope: 'A', zone: 'zone-1', requiresMelody: true },
          },
        ],
      },
      {
        title: 'Full-Form Bass Pass',
        min: 15,
        tasks: [
          {
            id: 'sb-att-mon-form-pass',
            label: 'Complete one uninterrupted chorus, alternating root-only and root–fifth bars.',
            activity: { mode: 'bass', scope: 'form', zone: 'zone-1', rhythm: 'half' },
          },
        ],
      },
    ],
  },
  {
    day: 'Tuesday',
    short: 'Tue',
    focus: 'Triads & A-Section Fluency',
    totalMin: 120,
    blocks: [
      {
        title: 'Zone Transfer',
        min: 15,
        tasks: [
          {
            id: 'sb-att-tue-transfer',
            label: 'Transfer the root and root–fifth form map into the second neck zone.',
            activity: { mode: 'bass', scope: 'form', zone: 'zone-2', rhythm: 'half' },
          },
        ],
      },
      {
        title: 'Root-Position Triad Form',
        min: 20,
        tasks: [
          {
            id: 'sb-att-tue-root-triads',
            label: 'Play root-position triad arpeggios through all 32 bars.',
            activity: { mode: 'triad-root', scope: 'form', zone: 'zone-2', rhythm: 'quarter' },
          },
        ],
      },
      {
        title: 'Voice-Led Triad Line',
        min: 30,
        tasks: [
          {
            id: 'sb-att-tue-voice-led',
            label: 'Play a quarter-note triad line that enters each chord through the nearest inversion.',
            activity: { mode: 'triad-voice-led', scope: 'form', zone: 'zone-2', rhythm: 'quarter' },
          },
        ],
      },
      {
        title: 'Eighth-Note Triad Outline',
        min: 20,
        tasks: [
          {
            id: 'sb-att-tue-eighths',
            label: 'Outline every triad in continuous eighth notes while preserving harmonic rhythm.',
            activity: { mode: 'harmony-eighths', scope: 'form', zone: 'zone-2', toneLayer: 'triad', rhythm: 'eighth' },
          },
        ],
      },
      {
        title: 'Complete A Melody',
        min: 25,
        tasks: [
          {
            id: 'sb-att-tue-melody-a',
            label: 'Play the complete A melody and account for both A-section locations in the form.',
            activity: { mode: 'melody', scope: 'A', zone: 'zone-2', requiresMelody: true },
          },
        ],
      },
      {
        title: 'Triad Chorus',
        min: 10,
        tasks: [
          {
            id: 'sb-att-tue-triad-chorus',
            label: 'Complete one uninterrupted root-position triad chorus.',
            activity: { mode: 'triad-root', scope: 'form', zone: 'zone-2', rhythm: 'quarter' },
          },
        ],
      },
    ],
  },
  {
    day: 'Wednesday',
    short: 'Wed',
    focus: 'Sevenths, Targets & Bridge',
    totalMin: 120,
    blocks: [
      {
        title: 'Form Recall',
        min: 10,
        tasks: [
          {
            id: 'sb-att-wed-form',
            label: 'Recite the form and play every root from memory in the third neck zone.',
            activity: { mode: 'roots', scope: 'form', zone: 'zone-3', rhythm: 'harmonic' },
          },
        ],
      },
      {
        title: 'Seventh Arpeggios',
        min: 30,
        tasks: [
          {
            id: 'sb-att-wed-sevenths',
            label: 'Arpeggiate the written four-note harmony and change exactly with the chart.',
            activity: { mode: 'seventh-arpeggio', scope: 'form', zone: 'zone-3', rhythm: 'eighth' },
          },
        ],
      },
      {
        title: 'Approach & Neighbor Targets',
        min: 25,
        tasks: [
          {
            id: 'sb-att-wed-chromatic',
            label: 'Lead into seventh-chord targets with chromatic approaches and diatonic neighbors.',
            activity: { mode: 'chromatic-seventh', scope: 'form', zone: 'zone-3', rhythm: 'eighth' },
          },
        ],
      },
      {
        title: 'B-Section Melody',
        min: 25,
        tasks: [
          {
            id: 'sb-att-wed-melody-b',
            label: 'Learn the bridge melody as a single-note phrase in the third neck zone.',
            activity: { mode: 'melody', scope: 'B', zone: 'zone-3', requiresMelody: true },
          },
        ],
      },
      {
        title: 'Connect the AABA Melody',
        min: 20,
        tasks: [
          {
            id: 'sb-att-wed-melody-form',
            label: 'Connect the A, A, B, and final A without pausing at section boundaries.',
            activity: { mode: 'melody', scope: 'form', zone: 'zone-3', requiresMelody: true },
          },
        ],
      },
      {
        title: 'Seventh-Arpeggio Chorus',
        min: 10,
        tasks: [
          {
            id: 'sb-att-wed-seventh-chorus',
            label: 'Complete one uninterrupted seventh-arpeggio chorus.',
            activity: { mode: 'seventh-arpeggio', scope: 'form', zone: 'zone-3', rhythm: 'eighth' },
          },
        ],
      },
    ],
  },
  {
    day: 'Thursday',
    short: 'Thu',
    focus: 'Melody Integration',
    totalMin: 120,
    blocks: [
      {
        title: 'Full-Form Melody',
        min: 25,
        tasks: [
          {
            id: 'sb-att-thu-melody',
            label: 'Play the complete melody through A–A–B–A in the fourth neck zone.',
            activity: { mode: 'melody', scope: 'form', zone: 'zone-4', requiresMelody: true },
          },
        ],
      },
      {
        title: 'Alternate Octave',
        min: 20,
        tasks: [
          {
            id: 'sb-att-thu-octave',
            label: 'Play the melody in a second available octave without changing its rhythm.',
            activity: { mode: 'melody', scope: 'form', zone: 'zone-4', octave: 1, requiresMelody: true },
          },
        ],
      },
      {
        title: 'Melody with Bass',
        min: 25,
        tasks: [
          {
            id: 'sb-att-thu-melody-bass',
            label: 'Combine melody phrases with bass roots at structurally clear chord changes.',
            activity: { mode: 'melody-bass', scope: 'form', zone: 'zone-4', requiresMelody: true },
          },
        ],
      },
      {
        title: 'Eighth-Note Harmony',
        min: 20,
        tasks: [
          {
            id: 'sb-att-thu-strum',
            label: 'Strum the written harmony in steady eighth notes by section.',
            activity: { mode: 'comp', scope: 'form', zone: 'zone-4', rhythm: 'eighth' },
          },
        ],
      },
      {
        title: 'Harmony with Hummed Melody',
        min: 20,
        tasks: [
          {
            id: 'sb-att-thu-hum',
            label: 'Comp through the form with the metronome while humming the complete melody.',
            activity: { mode: 'comp', scope: 'form', zone: 'zone-4', rhythm: 'quarter', requiresMelody: true },
          },
        ],
      },
      {
        title: 'Integration Pass',
        min: 10,
        tasks: [
          {
            id: 'sb-att-thu-integration',
            label: 'Complete one chorus of melody followed immediately by one chorus of harmony.',
            activity: { mode: 'melody', scope: 'form', zone: 'zone-4', requiresMelody: true },
          },
        ],
      },
    ],
  },
  {
    day: 'Friday',
    short: 'Fri',
    focus: 'Comping & Line Construction',
    totalMin: 120,
    blocks: [
      {
        title: 'Quarter-Note Comping',
        min: 25,
        tasks: [
          {
            id: 'sb-att-fri-quarters',
            label: 'Comp in quarter notes and make the guitar carry the rhythmic role.',
            activity: { mode: 'comp', scope: 'form', zone: 'zone-5', rhythm: 'quarter' },
          },
        ],
      },
      {
        title: 'Eighth-Note Strumming',
        min: 20,
        tasks: [
          {
            id: 'sb-att-fri-eighths',
            label: 'Comp in simple eighth notes with clean changes and consistent swing placement.',
            activity: { mode: 'comp', scope: 'form', zone: 'zone-5', rhythm: 'eighth' },
          },
        ],
      },
      {
        title: 'Varied Comping Patterns',
        min: 25,
        tasks: [
          {
            id: 'sb-att-fri-patterns',
            label: 'Rotate contrasting rhythmic patterns without obscuring the form.',
            activity: { mode: 'comp', scope: 'form', zone: 'zone-5', rhythm: 'varied' },
          },
        ],
      },
      {
        title: 'Chromatic Eighth-Note Lines',
        min: 25,
        tasks: [
          {
            id: 'sb-att-fri-lines',
            label: 'Build eighth-note harmonic lines with approaches and neighbors at chord changes.',
            activity: { mode: 'chromatic-seventh', scope: 'form', zone: 'zone-5', rhythm: 'eighth' },
          },
        ],
      },
      {
        title: 'Unaccompanied Improvisation',
        min: 25,
        tasks: [
          {
            id: 'sb-att-fri-improv',
            label: 'Improvise unaccompanied while maintaining pulse, harmonic rhythm, and AABA form.',
            activity: { mode: 'improv', scope: 'form', zone: 'zone-5' },
          },
        ],
      },
    ],
  },
  {
    day: 'Saturday',
    short: 'Sat',
    focus: 'Full-Neck Performance',
    totalMin: 120,
    blocks: [
      {
        title: 'Full-Neck Harmony Review',
        min: 20,
        tasks: [
          {
            id: 'sb-att-sat-roots',
            label: 'Traverse all five zones with roots and root–fifth bass.',
            activity: { mode: 'bass', scope: 'form', zone: 'full', rhythm: 'half' },
          },
          {
            id: 'sb-att-sat-arpeggios',
            label: 'Traverse all five zones with triad and seventh arpeggios.',
            activity: { mode: 'seventh-arpeggio', scope: 'form', zone: 'full', rhythm: 'eighth' },
          },
        ],
      },
      {
        title: 'Two-Octave Melody',
        min: 20,
        tasks: [
          {
            id: 'sb-att-sat-melody',
            label: 'Play the melody in two octaves with deliberate zone transitions.',
            activity: { mode: 'melody', scope: 'form', zone: 'full', requiresMelody: true },
          },
        ],
      },
      {
        title: 'Full-Form Melody & Bass',
        min: 20,
        tasks: [
          {
            id: 'sb-att-sat-melody-bass',
            label: 'Play melody and bass through the complete form without breaking time.',
            activity: { mode: 'melody-bass', scope: 'form', zone: 'full', requiresMelody: true },
          },
        ],
      },
      {
        title: 'Comping Choruses',
        min: 20,
        tasks: [
          {
            id: 'sb-att-sat-comp',
            label: 'Play one quarter-note chorus and one varied-rhythm chorus.',
            activity: { mode: 'comp', scope: 'form', zone: 'full', rhythm: 'varied' },
          },
        ],
      },
      {
        title: 'Unaccompanied Improvisation',
        min: 20,
        tasks: [
          {
            id: 'sb-att-sat-improv',
            label: 'Improvise a complete chorus with only the metronome.',
            activity: { mode: 'improv', scope: 'form', zone: 'full' },
          },
        ],
      },
      {
        title: 'Backing-Track Improvisation',
        min: 20,
        tasks: [
          {
            id: 'sb-att-sat-backing',
            label: 'Improvise complete choruses with the configured external backing track.',
            activity: { mode: 'improv', scope: 'form', zone: 'full', externalBacking: true },
          },
        ],
      },
    ],
  },
];
