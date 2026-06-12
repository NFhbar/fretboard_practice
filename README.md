# Fretboard Practice

A guitar fretboard mastery app built around a 12-week practice system: one key per week through the
cycle of fourths, with parallel **major** and **harmonic minor** tracks.

## Features

- **Practice** — six structured practice days per week (triads, 7th chords, arpeggios, modes, voice
  leading, rhythm/integration) with checkable tasks and a per-key mastery checklist
- **Sessions** — guided practice mode with per-block countdown timers, wake lock, overrun handling,
  drone generator for improv blocks, and a logged history
- **Drills** — app-generated prompts (chord shapes by inversion/string set, note finding, intervals)
  with countdown, answer diagrams, self-grading and weak-spot weighting
- **Tools** — 24-fret Fretboard Explorer (scale/chord/interval layers, CAGED forms, tap-to-hear),
  CAGED shape library, diatonic triads/7ths with chord-cycling backing player, interval map,
  modal interchange + progression builder, circle of fifths
- **Global metronome** — drift-free lookahead scheduler with time signatures, per-beat accents,
  7 subdivisions (incl. dotted 8th+16th, quintuplets), tap tempo, 3 click sounds; shared by all players
- **Progress** — streaks, weekly minutes, 12-key mastery heatmap, session history
- **Backup** — export/import all data as JSON to move between devices (everything lives in localStorage)
- Three fretboard finishes (dark / wood / white), left-handed mode, mobile-first dark UI

## Getting started

```bash
npm install
npm run dev      # dev server
npm test         # data-integrity tests
npm run build    # production build → dist/
```

## Deployment

Static SPA (hash routing, no backend). `render.yaml` configures a Render static site:
build `npm ci && npm run build`, publish `dist/`, auto-deploy on push.

## Data & privacy

All practice data stays in your browser's localStorage — nothing is sent anywhere.
Use **Progress → Backup** to export/import your data across devices.
