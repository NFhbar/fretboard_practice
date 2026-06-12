import { useState, useEffect, useRef, useCallback } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0c0c0f; color: #ede8df; font-family: 'DM Mono', monospace; min-height: 100vh; }
  .app { max-width: 820px; margin: 0 auto; padding: 40px 24px 80px; }
  .header { border-bottom: 1px solid #2a2a35; padding-bottom: 28px; margin-bottom: 36px; }
  .header-eyebrow { font-size: 10px; letter-spacing: 0.25em; color: #c9963a; text-transform: uppercase; margin-bottom: 10px; font-weight: 500; }
  .header-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #ede8df; line-height: 1.1; margin-bottom: 8px; }
  .header-sub { font-size: 11px; color: #635e58; letter-spacing: 0.05em; }
  .key-section { background: #111115; border: 1px solid #22222a; border-radius: 4px; padding: 20px 24px; margin-bottom: 32px; }
  .key-section-label { font-size: 9px; letter-spacing: 0.25em; color: #635e58; text-transform: uppercase; margin-bottom: 16px; }
  .key-cycle { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
  .key-pill { width: 44px; height: 44px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 15px; cursor: pointer; transition: all 0.15s; border: 1px solid #22222a; background: #0c0c0f; color: #635e58; }
  .key-pill:hover { border-color: #c9963a; color: #c9963a; }
  .key-pill.active { background: #c9963a; border-color: #c9963a; color: #0c0c0f; font-weight: 700; }
  .key-pill.done { background: #1a2018; border-color: #2a3828; color: #4a6040; }
  .week-meta { display: flex; gap: 32px; align-items: center; }
  .week-meta-item { display: flex; flex-direction: column; gap: 4px; }
  .week-meta-label { font-size: 9px; letter-spacing: 0.2em; color: #635e58; text-transform: uppercase; }
  .week-meta-val { font-family: 'Playfair Display', serif; font-size: 22px; color: #c9963a; }
  .week-nav { display: flex; gap: 8px; margin-left: auto; }
  .week-nav button { background: #111115; border: 1px solid #2a2a35; color: #ede8df; padding: 6px 14px; font-family: 'DM Mono', monospace; font-size: 11px; cursor: pointer; border-radius: 3px; transition: all 0.15s; }
  .week-nav button:hover { border-color: #c9963a; color: #c9963a; }
  .week-nav button:disabled { opacity: 0.3; cursor: not-allowed; }
  .days-header { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-bottom: 20px; }
  .day-tab { padding: 12px 6px 10px; border: 1px solid #22222a; background: #111115; border-radius: 3px; cursor: pointer; transition: all 0.15s; text-align: center; }
  .day-tab:hover { border-color: #3a3a48; }
  .day-tab.active { border-color: #c9963a; background: #1a1710; }
  .day-tab-name { font-size: 9px; letter-spacing: 0.15em; color: #635e58; text-transform: uppercase; margin-bottom: 6px; display: block; }
  .day-tab.active .day-tab-name { color: #c9963a; }
  .day-tab-focus { font-size: 9px; color: #4a4555; line-height: 1.3; }
  .day-tab.active .day-tab-focus { color: #9a8a6a; }
  .day-tab-progress { margin-top: 8px; height: 2px; background: #1e1e26; border-radius: 1px; overflow: hidden; }
  .day-tab-progress-fill { height: 100%; background: #c9963a; border-radius: 1px; transition: width 0.3s; }
  .day-panel { background: #111115; border: 1px solid #22222a; border-radius: 4px; overflow: hidden; }
  .day-panel-header { padding: 20px 24px; border-bottom: 1px solid #1a1a22; display: flex; align-items: center; gap: 16px; }
  .day-panel-day { font-family: 'Playfair Display', serif; font-size: 20px; color: #ede8df; }
  .day-panel-focus { font-size: 10px; letter-spacing: 0.15em; color: #c9963a; text-transform: uppercase; }
  .day-panel-duration { margin-left: auto; font-size: 11px; color: #635e58; }
  .block { border-bottom: 1px solid #1a1a22; }
  .block:last-child { border-bottom: none; }
  .block-header { padding: 16px 24px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.12s; }
  .block-header:hover { background: #13131a; }
  .block-dot { width: 6px; height: 6px; border-radius: 50%; background: #2a2a35; flex-shrink: 0; transition: background 0.2s; }
  .block-dot.complete { background: #4a6040; }
  .block-title { font-size: 12px; color: #ede8df; font-weight: 500; letter-spacing: 0.03em; flex: 1; }
  .block-duration { font-size: 10px; color: #635e58; }
  .block-chevron { font-size: 10px; color: #635e58; transition: transform 0.2s; }
  .block-chevron.open { transform: rotate(90deg); }
  .block-body { padding: 0 24px 16px 42px; }
  .task { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; border-bottom: 1px solid #15151c; cursor: pointer; transition: opacity 0.15s; }
  .task:last-child { border-bottom: none; }
  .task:hover { opacity: 0.85; }
  .task-check { width: 14px; height: 14px; border: 1px solid #2a2a35; border-radius: 2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; transition: all 0.15s; font-size: 9px; }
  .task-check.done { background: #4a6040; border-color: #4a6040; color: #ede8df; }
  .task-label { font-size: 12px; color: #8a8480; line-height: 1.5; }
  .task.done .task-label { color: #4a4540; text-decoration: line-through; text-decoration-color: #3a3535; }
  .task-note { font-size: 10px; color: #4a4540; margin-top: 2px; font-style: italic; }
  .mastery-section { margin-top: 24px; background: #111115; border: 1px solid #22222a; border-radius: 4px; overflow: hidden; }
  .mastery-header { padding: 18px 24px; border-bottom: 1px solid #1a1a22; display: flex; align-items: center; gap: 12px; }
  .mastery-title { font-family: 'Playfair Display', serif; font-size: 16px; color: #ede8df; }
  .mastery-key-badge { background: #c9963a; color: #0c0c0f; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 2px; font-family: 'Playfair Display', serif; }
  .mastery-score { margin-left: auto; font-size: 11px; color: #635e58; }
  .mastery-items { padding: 12px 0; }
  .mastery-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 24px; cursor: pointer; transition: background 0.12s; border-bottom: 1px solid #15151c; }
  .mastery-item:last-child { border-bottom: none; }
  .mastery-item:hover { background: #13131a; }
  .mastery-check { width: 16px; height: 16px; border: 1px solid #2a2a35; border-radius: 2px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; font-size: 10px; transition: all 0.15s; }
  .mastery-check.done { background: #4a6040; border-color: #4a6040; color: #ede8df; }
  .mastery-item-text { font-size: 12px; color: #8a8480; line-height: 1.5; }
  .mastery-item.done .mastery-item-text { color: #4a4540; text-decoration: line-through; text-decoration-color: #3a3535; }
  .mastery-bar { height: 3px; background: #1a1a22; margin: 0 24px 4px; border-radius: 2px; overflow: hidden; }
  .mastery-bar-fill { height: 100%; background: linear-gradient(90deg, #4a6040, #8aaa60); border-radius: 2px; transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }
  .complete-badge { display: inline-flex; align-items: center; gap: 6px; background: #1a2018; border: 1px solid #2a3828; color: #6a9060; font-size: 10px; padding: 4px 10px; border-radius: 2px; letter-spacing: 0.1em; text-transform: uppercase; }
  .theory-section { background: #111115; border: 1px solid #22222a; border-radius: 4px; margin-bottom: 32px; overflow: hidden; }
  .theory-header { padding: 18px 24px 14px; border-bottom: 1px solid #1a1a22; display: flex; align-items: center; gap: 12px; }
  .theory-title { font-family: 'Playfair Display', serif; font-size: 16px; color: #ede8df; }
  .theory-key-badge { background: #c9963a; color: #0c0c0f; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 2px; font-family: 'Playfair Display', serif; }
  .theory-table { width: 100%; border-collapse: collapse; }
  .theory-table th { font-size: 9px; letter-spacing: 0.2em; color: #635e58; text-transform: uppercase; text-align: left; padding: 10px 12px 8px; border-bottom: 1px solid #1a1a22; font-weight: 500; }
  .theory-table th:first-child, .theory-table td:first-child { padding-left: 24px; }
  .theory-table th:last-child, .theory-table td:last-child { padding-right: 24px; }
  .theory-table td { font-size: 12px; color: #8a8480; padding: 9px 12px; border-bottom: 1px solid #15151c; }
  .theory-table tr:last-child td { border-bottom: none; }
  .theory-table .roman-cell { font-family: 'Playfair Display', serif; font-size: 14px; color: #c9963a; font-weight: 600; }
  .theory-table .chord-cell { font-family: 'Playfair Display', serif; font-size: 13px; color: #ede8df; }
  .theory-table .quality-cell { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; }
  .theory-table .quality-maj { color: #c9963a; }
  .theory-table .quality-min { color: #7a8aaa; }
  .theory-table .quality-dim { color: #aa7a7a; }
  .theory-table .quality-aug { color: #9a7abf; }
  .theory-table .notes-cell { font-family: 'DM Mono', monospace; font-size: 11px; color: #9a9590; letter-spacing: 0.05em; }
  .theory-table .intervals-cell { font-family: 'DM Mono', monospace; font-size: 11px; color: #5a5550; }
  .caged-btn { display: inline-flex; align-items: center; gap: 8px; background: #111115; border: 1px solid #2a2a35; color: #c9963a; padding: 8px 16px; font-family: 'DM Mono', monospace; font-size: 11px; cursor: pointer; border-radius: 3px; transition: all 0.15s; letter-spacing: 0.05em; }
  .caged-btn:hover { border-color: #c9963a; background: #1a1710; }
  .caged-overlay { position: fixed; inset: 0; z-index: 1000; background: #ffffff; display: flex; flex-direction: column; overflow-y: auto; }
  .caged-overlay-header { display: flex; align-items: center; gap: 16px; padding: 28px 40px 20px; border-bottom: 2px solid #222; flex-shrink: 0; }
  .caged-overlay-title { font-family: 'Playfair Display', serif; font-size: 28px; color: #1a1a1a; font-weight: 700; }
  .caged-overlay-sub { font-size: 11px; color: #888; letter-spacing: 0.05em; }
  .caged-overlay-close { margin-left: auto; background: #f5f5f5; border: 1px solid #ddd; color: #666; width: 36px; height: 36px; border-radius: 3px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: 'DM Mono', monospace; }
  .caged-overlay-close:hover { border-color: #999; color: #333; background: #eee; }
  .caged-tabs { display: flex; gap: 0; padding: 0 40px; border-bottom: none; flex-shrink: 0; background: #fafafa; overflow-x: auto; scrollbar-width: thin; }
  .caged-tabs::-webkit-scrollbar { height: 6px; }
  .caged-tabs::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  .quality-formula { display: flex; align-items: center; gap: 12px; padding: 6px 40px 8px; background: #fafafa; border-bottom: 1px solid #ddd; font-family: 'DM Mono', monospace; font-size: 11px; }
  .quality-formula-intervals { color: #c9963a; letter-spacing: 0.1em; font-weight: 600; }
  .quality-formula-mode { color: #999; font-style: italic; font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 400; }
  .caged-tab { padding: 12px 18px; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.05em; color: #888; cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
  .caged-tab:hover { color: #555; }
  .caged-tab.active { color: #1a1a1a; border-bottom-color: #e8922d; font-weight: 600; }
  .caged-grid { padding: 24px 40px 40px; flex: 1; }
  .caged-col-headers { display: grid; grid-template-columns: 48px repeat(4, 1fr); gap: 12px; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 1px solid #ddd; }
  .caged-col-label { font-size: 12px; letter-spacing: 0.08em; color: #1a1a1a; font-weight: 700; font-family: 'Playfair Display', serif; font-style: italic; text-align: center; }
  .caged-row { display: grid; grid-template-columns: 48px repeat(4, 1fr); gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
  .caged-row:last-child { border-bottom: none; }
  .caged-row-label { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #1a1a1a; text-align: center; }
  .caged-row-label-suffix { font-size: 16px; font-weight: 600; }
  .caged-cell { display: flex; flex-direction: column; justify-content: flex-start; align-items: center; gap: 4px; }
  .variant-pills { display: flex; gap: 3px; justify-content: center; min-height: 18px; }
  .variant-spacer { min-height: 18px; }
  .variant-pill { width: 22px; height: 18px; border: 1px solid #ccc; border-radius: 3px; background: #fff; color: #888; font-family: 'Playfair Display', serif; font-size: 9px; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
  .variant-pill:hover { border-color: #c9963a; color: #c9963a; }
  .variant-pill.active { background: #c9963a; border-color: #c9963a; color: #fff; }
  .caged-empty { display: flex; align-items: center; justify-content: center; width: 100%; height: 120px; border: 1px dashed #ddd; border-radius: 3px; font-size: 9px; color: #ccc; letter-spacing: 0.1em; }
  .diatonic-overlay { position: fixed; inset: 0; z-index: 1000; background: #f5f3ef; display: flex; flex-direction: column; overflow-y: auto; }
  .diatonic-header { display: flex; align-items: center; gap: 16px; padding: 24px 32px 16px; border-bottom: 1px solid #ddd; flex-shrink: 0; }
  .diatonic-title { font-family: 'Playfair Display', serif; font-size: 24px; color: #222; font-weight: 700; }
  .diatonic-key-badge { background: #c9963a; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 2px; font-family: 'Playfair Display', serif; }
  .diatonic-close { margin-left: auto; background: #fff; border: 1px solid #ccc; color: #888; width: 36px; height: 36px; border-radius: 3px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: 'DM Mono', monospace; }
  .diatonic-close:hover { border-color: #c9963a; color: #c9963a; }
  .diatonic-controls { display: flex; align-items: center; gap: 14px; padding: 18px 32px; border-bottom: 1px solid #ddd; flex-wrap: wrap; }
  .diatonic-pill { padding: 10px 20px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 14px; color: #888; transition: all 0.15s; display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .diatonic-pill:hover { border-color: #999; color: #555; }
  .diatonic-pill.highlighted { border-color: #c9963a; background: #fdf8f0; }
  .diatonic-pill .pill-roman { font-weight: 600; }
  .diatonic-pill .pill-chord { font-size: 12px; }
  .diatonic-pill.highlighted .pill-chord { color: inherit; }
  .diatonic-toggle { margin-left: auto; display: flex; gap: 0; border: 1px solid #ccc; border-radius: 4px; overflow: hidden; }
  .diatonic-toggle button { background: #fff; border: none; color: #888; padding: 10px 18px; font-family: 'DM Mono', monospace; font-size: 13px; cursor: pointer; transition: all 0.15s; }
  .diatonic-toggle button.active { background: #c9963a; color: #fff; font-weight: 600; }
  .diatonic-fretboard { flex: 1; padding: 32px; overflow-x: auto; display: flex; align-items: center; justify-content: center; }
  .player-bar { display: flex; align-items: center; gap: 14px; padding: 12px 32px; border-bottom: 1px solid #ddd; flex-wrap: nowrap; background: #faf9f6; overflow-x: auto; }
  .player-section { display: flex; align-items: center; gap: 6px; }
  .player-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'DM Mono', monospace; }
  .player-bpm { width: 56px; text-align: center; padding: 6px 4px; border: 1px solid #ccc; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 13px; color: #333; background: #fff; outline: none; }
  .player-bpm:focus { border-color: #c9963a; }
  .player-btn { padding: 6px 14px; border: 1px solid #ccc; border-radius: 4px; background: #fff; font-family: 'DM Mono', monospace; font-size: 11px; color: #555; cursor: pointer; transition: all 0.15s; }
  .player-btn:hover { border-color: #999; }
  .player-btn.active { background: #c9963a; border-color: #c9963a; color: #fff; }
  .player-btn.start { background: #3a8a5c; border-color: #3a8a5c; color: #fff; }
  .player-btn.start:hover { background: #2e7a4e; }
  .player-btn.stop { background: #c75454; border-color: #c75454; color: #fff; }
  .player-btn.stop:hover { background: #b04444; }
  .player-next { display: flex; align-items: center; gap: 6px; margin-left: 8px; padding: 4px 12px; border-radius: 4px; background: #f0efe8; border: 1px solid #ddd; white-space: nowrap; flex-shrink: 0; }
  .player-next-label { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'DM Mono', monospace; }
  .player-next-chord { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 600; }
  .player-select { display: flex; align-items: center; gap: 4px; }
  .player-chip { padding: 4px 8px; border: 1px solid #ccc; border-radius: 3px; background: #fff; font-family: 'DM Mono', monospace; font-size: 10px; color: #888; cursor: pointer; transition: all 0.15s; }
  .player-chip:hover { border-color: #999; }
  .player-chip.on { border-color: #c9963a; color: #c9963a; background: #fdf8f0; }
  .interval-overlay { position: fixed; inset: 0; z-index: 1000; background: #f5f3ef; display: flex; flex-direction: column; overflow-y: auto; }
  .interval-header { display: flex; align-items: center; gap: 16px; padding: 24px 32px 16px; border-bottom: 1px solid #ddd; flex-shrink: 0; }
  .interval-title { font-family: 'Playfair Display', serif; font-size: 24px; color: #222; font-weight: 700; }
  .interval-controls { display: flex; align-items: center; gap: 10px; padding: 14px 32px; border-bottom: 1px solid #ddd; flex-wrap: wrap; }
  .interval-pill { padding: 8px 14px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 13px; color: #888; transition: all 0.15s; text-align: center; }
  .interval-pill:hover { border-color: #999; color: #555; }
  .interval-pill.on { font-weight: 600; }
  .interval-fretboard { flex: 1; padding: 32px; overflow-x: auto; display: flex; align-items: center; justify-content: center; }
  .modes-overlay { position: fixed; inset: 0; z-index: 1000; background: #f5f3ef; display: flex; flex-direction: column; overflow-y: auto; }
  .modes-header { display: flex; align-items: center; gap: 16px; padding: 24px 32px 16px; border-bottom: 1px solid #ddd; flex-shrink: 0; }
  .modes-title { font-family: 'Playfair Display', serif; font-size: 24px; color: #222; font-weight: 700; }
  .modes-body { flex: 1; padding: 24px 32px; overflow-y: auto; }
  .modes-table { width: 100%; border-collapse: collapse; font-family: 'DM Mono', monospace; }
  .modes-table th { text-align: left; padding: 12px 14px; font-size: 13px; color: #999; font-weight: 500; border-bottom: 2px solid #ddd; letter-spacing: 0.08em; text-transform: uppercase; }
  .modes-table td { padding: 10px 14px; font-size: 15px; border-bottom: 1px solid #eee; }
  .modes-table tr:hover { background: #f0ede6; }
  .modes-table .mode-name { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; color: #222; white-space: nowrap; }
  .modes-table .mode-current { background: #fdf8f0; }
  .modes-chord { display: inline-block; padding: 4px 10px; border-radius: 4px; margin: 2px; font-size: 14px; font-weight: 500; }
  .modes-chord.q-maj { background: #f0e6d0; color: #6a5530; }
  .modes-chord.q-min { background: #dde8f2; color: #3a5a80; }
  .modes-chord.q-dim { background: #f2dde0; color: #8a3a3a; }
  .modes-chord.q-aug { background: #e8dff2; color: #6a3a8a; }
  .modes-chord.q-maj7 { background: #f0e6d0; color: #6a5530; }
  .modes-chord.q-min7 { background: #dde8f2; color: #3a5a80; }
  .modes-chord.q-dom7 { background: #fce8d0; color: #8a5a2a; }
  .modes-chord.q-m7b5 { background: #f2dde0; color: #8a3a3a; }
  .modes-chord.q-dim7 { background: #f2d0d0; color: #7a2a2a; }
  .modes-chord.q-augmaj7 { background: #e8dff2; color: #6a3a8a; }
  .modes-chord.q-mmaj7 { background: #d8eaf2; color: #2a5a7a; }
  .modes-chord.q-aug7 { background: #eeddf2; color: #7a3a7a; }
  .modes-chord.borrowed { border: 2px dashed #c9963a; }
  .cm-overlay { position: fixed; inset: 0; z-index: 1000; background: #f5f3ef; display: flex; flex-direction: column; overflow-y: auto; }
  .cm-header { display: flex; align-items: center; gap: 16px; padding: 24px 32px 16px; border-bottom: 1px solid #ddd; flex-shrink: 0; }
  .cm-title { font-family: 'Playfair Display', serif; font-size: 24px; color: #222; font-weight: 700; }
  .cm-body { flex: 1; padding: 24px 32px; overflow-y: auto; }
  .cm-section { margin-bottom: 28px; }
  .cm-section-title { font-family: 'Playfair Display', serif; font-size: 18px; color: #222; font-weight: 600; margin-bottom: 12px; }
  .cm-section-sub { font-size: 12px; color: #999; margin-bottom: 12px; }
  .cm-table { width: 100%; border-collapse: collapse; font-family: 'DM Mono', monospace; }
  .cm-table th { text-align: left; padding: 10px 14px; font-size: 12px; color: #999; font-weight: 500; border-bottom: 2px solid #ddd; letter-spacing: 0.08em; text-transform: uppercase; }
  .cm-table td { padding: 10px 14px; font-size: 14px; border-bottom: 1px solid #eee; color: #333; }
  .cm-table tr:hover { background: #f0ede6; }
  .cm-table tr.cm-highlight { background: #fdf8f0; }
  .cm-root { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #c9963a; }
  .cm-mode { font-weight: 500; }
  .cm-mode-maj { color: #6a5530; }
  .cm-mode-min { color: #3a5a80; }
  .cm-mode-dim { color: #8a3a3a; }
  .cm-mode-aug { color: #6a3a8a; }
  .cm-parent { color: #666; font-size: 13px; }
  .cm-badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; }
  .cm-badge-maj { background: #f0e6d0; color: #6a5530; }
  .cm-badge-min { background: #dde8f2; color: #3a5a80; }
  .cm-badge-dim { background: #f2dde0; color: #8a3a3a; }
  .cm-badge-aug { background: #e8dff2; color: #6a3a8a; }
  .cm-matrix { width: 100%; border-collapse: collapse; font-family: 'DM Mono', monospace; }
  .cm-matrix th { padding: 8px 6px; font-size: 11px; color: #999; font-weight: 500; border-bottom: 2px solid #ddd; text-align: center; letter-spacing: 0.05em; }
  .cm-matrix th:first-child { text-align: left; padding-left: 14px; }
  .cm-matrix td { padding: 6px 4px; text-align: center; border-bottom: 1px solid #eee; }
  .cm-matrix td:first-child { text-align: left; padding-left: 14px; font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 600; color: #222; }
  .cm-cell { display: inline-block; padding: 4px 7px; border-radius: 3px; font-size: 12px; font-weight: 500; min-width: 32px; }
  .cm-matrix tr:hover { background: #f0ede6; }
  .prog-builder { border-top: 1px solid #ddd; padding: 20px 32px; }
  .prog-builder-title { font-family: 'Playfair Display', serif; font-size: 18px; color: #222; font-weight: 600; margin-bottom: 12px; }
  .prog-chords { display: flex; gap: 8px; flex-wrap: wrap; min-height: 46px; padding: 10px 14px; background: #fff; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 14px; align-items: center; }
  .prog-chord-chip { padding: 7px 14px; border-radius: 3px; font-family: 'DM Mono', monospace; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.12s; border: 1px solid #ccc; background: #faf9f6; color: #333; }
  .prog-chord-chip:hover { border-color: #c75454; background: #fef0f0; }
  .prog-chord-chip.active { border-color: #c9963a; background: #fdf8f0; }
  .prog-empty { font-size: 12px; color: #bbb; font-style: italic; }
  .prog-chord-info { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 12px; border-radius: 4px; border: 1px solid #ddd; background: #fff; cursor: pointer; transition: all 0.12s; min-width: 80px; }
  .prog-chord-info:hover { border-color: #c75454; background: #fef0f0; }
  .prog-chord-name { font-family: 'DM Mono', monospace; font-size: 15px; font-weight: 600; color: #333; }
  .prog-chord-mode { font-family: 'DM Mono', monospace; font-size: 10px; color: #c9963a; font-weight: 500; }
  .prog-chord-parent { font-family: 'DM Mono', monospace; font-size: 9px; color: #999; }
  .prog-analysis { margin-top: 10px; margin-bottom: 14px; padding: 12px 14px; background: #fff; border: 1px solid #ddd; border-radius: 4px; }
  .prog-analysis-title { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-family: 'DM Mono', monospace; }
  .prog-analysis-row { display: flex; gap: 8px; align-items: baseline; padding: 4px 0; border-bottom: 1px solid #f0f0f0; font-family: 'DM Mono', monospace; }
  .prog-analysis-row:last-child { border-bottom: none; }
  .prog-analysis-chord { font-size: 14px; font-weight: 600; color: #333; min-width: 80px; }
  .prog-analysis-arrow { color: #ccc; }
  .prog-analysis-mode { font-size: 13px; font-weight: 500; color: #c9963a; min-width: 120px; }
  .prog-analysis-reason { font-size: 11px; color: #888; }
  .prog-patterns { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; align-items: center; }
  .prog-pattern-chip { padding: 5px 10px; border: 1px solid #ccc; border-radius: 3px; background: #fff; font-family: 'DM Mono', monospace; font-size: 11px; color: #666; cursor: pointer; transition: all 0.15s; }
  .prog-pattern-chip:hover { border-color: #999; }
  .prog-pattern-chip.active { border-color: #c9963a; color: #c9963a; background: #fdf8f0; }
  .prog-grid { display: flex; gap: 3px; margin-bottom: 14px; }
  .prog-grid-slot { width: 40px; height: 48px; border: 1px solid #ddd; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-family: 'DM Mono', monospace; font-size: 16px; cursor: pointer; transition: all 0.12s; background: #fff; color: #555; user-select: none; }
  .prog-grid-slot:hover { border-color: #999; }
  .prog-grid-slot.beat { border-color: #c9963a; background: #fdf8f0; }
  .prog-grid-slot.lit { background: #c9963a; color: #fff; border-color: #c9963a; }
  .prog-controls { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .prog-current { font-family: 'Playfair Display', serif; font-size: 28px; color: #222; font-weight: 700; margin-left: 12px; }
  .prog-presets { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .modes-legend { display: flex; gap: 16px; padding: 16px 32px 24px; flex-wrap: wrap; border-top: 1px solid #ddd; }
  .modes-legend-item { display: flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 12px; color: #666; }
  .modes-legend-swatch { padding: 2px 8px; border-radius: 3px; font-size: 11px; }
  .cof-overlay { position: fixed; inset: 0; z-index: 1000; background: #f5f3ef; display: flex; flex-direction: column; align-items: center; overflow-y: auto; }
  .cof-header { display: flex; align-items: center; gap: 16px; padding: 24px 32px 16px; border-bottom: 1px solid #ddd; width: 100%; flex-shrink: 0; }
  .cof-title { font-family: 'Playfair Display', serif; font-size: 24px; color: #222; font-weight: 700; }
  .cof-close { margin-left: auto; background: #fff; border: 1px solid #ccc; color: #888; width: 36px; height: 36px; border-radius: 3px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; font-family: 'DM Mono', monospace; }
  .cof-close:hover { border-color: #c9963a; color: #c9963a; }
  .cof-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px; width: 100%; }
  .cof-legend { display: flex; gap: 20px; padding: 0 32px 24px; flex-wrap: wrap; justify-content: center; }
  .cof-legend-item { display: flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 12px; color: #666; }
  .cof-legend-dot { width: 14px; height: 14px; border-radius: 50%; }
`;

const KEY_CYCLE = ['C','F','Bb','Eb','Ab','Db','Gb','B','E','A','D','G'];

const SCHEDULE = [
  {
    day: 'Monday', short: 'Mon', focus: 'Triad Chord Shapes', totalMin: 120,
    blocks: [
      { title: 'Warm-up — CAGED Scale & Interval Drills', min: 20, tasks: [
        { id: 'mon-w1', label: 'Scale run in each CAGED position — play the full scale ascending and descending within each of the 5 CAGED shapes. Quarter notes at 80 BPM, then repeat each position subdividing to 8th notes at the same tempo',
          note: 'Go through all 5 positions: C shape, A shape, G shape, E shape, D shape. Stay relaxed, focus on even tone within each box before connecting them.' },
        { id: 'mon-w2', label: 'Interval jumps in 3rds — ascending: 1-3, 2-4, 3-5, 4-6, 5-7, 6-1, 7-2 then descend back: 2-7, 1-6, 7-5, 6-4, 5-3, 4-2, 3-1',
          note: '3rds outline triads. Hearing them fluently is the basis of all chord tone soloing.' },
        { id: 'mon-w3', label: 'Interval jumps in 4ths — ascending: 1-4, 2-5, 3-6, 4-7, 5-1, 6-2, 7-3 then descend back: 3-7, 2-6, 1-5, 7-4, 6-3, 5-2, 4-1' },
        { id: 'mon-w4', label: 'Diatonic triad + 7th building — arpeggiate each degree as triad then 7th: I (1-3-5 → 1-3-5-7), ii (2-4-6 → 2-4-6-1), iii (3-5-7 → 3-5-7-2), IV (4-6-1 → 4-6-1-3), V (5-7-2 → 5-7-2-4), vi (6-1-3 → 6-1-3-5), vii° (7-2-4 → 7-2-4-6) then descend',
          note: 'Triads: major, minor, minor, major, major, minor, dim. 7ths: maj7, min7, min7, maj7, dom7, min7, min7♭5. Name both aloud.' },
        { id: 'mon-w5', label: 'Diagonal runs — play the scale on 2-string groups, moving up the neck diagonally: start on strings 6-5 in the lowest position, ascend diagonally shifting up frets, then strings 5-4, then 4-3, then 3-2, then 2-1. Repeat descending back down each pair',
          note: 'This connects CAGED positions diagonally rather than staying in a box or going purely horizontal. You are crossing position boundaries on every string change.' },
      ]},
      { title: '3 Notes Per String — Major Scale Positions', min: 20, tasks: [
        { id: 'mon-3nps4', label: '3NPS with metronome — play all 7 positions across the neck, ascending and descending each one. Quarter notes at 80 BPM, then repeat all positions subdividing to 8th notes, then repeat all positions subdividing to triplets',
          note: 'Go through all 7 3NPS positions (one per scale degree) at each subdivision level before moving to the next. The 3-note grouping naturally aligns with triplet subdivisions.' },
        { id: 'mon-3nps6', label: '3NPS intervals in 3rds — within one position, play ascending: 1-3, 2-4, 3-5, 4-6, 5-7, 6-1, 7-2 then descend: 2-7, 1-6, 7-5, 6-4, 5-3, 4-2, 3-1. Follow the 3NPS fingering across the strings',
          note: 'You are skipping one note within the 3NPS pattern. On each string you have 3 notes — the 3rd of each note is either on the same string or the next string up.' },
        { id: 'mon-3nps7', label: '3NPS intervals in 4ths — within one position, ascending: 1-4, 2-5, 3-6, 4-7, 5-1, 6-2, 7-3 then descend: 3-7, 2-6, 1-5, 7-4, 6-3, 5-2, 4-1. Follow the 3NPS fingering',
          note: '4ths skip two scale notes. This often means jumping from one string to the next within the 3NPS layout.' },
        { id: 'mon-3nps8', label: '3NPS diatonic triads — within one position, arpeggiate each diatonic triad across the 3NPS shape: I (1-3-5), ii (2-4-6), iii (3-5-7), IV (4-6-1), V (5-7-2), vi (6-1-3), vii° (7-2-4) ascending through the position, then descend',
          note: 'Each triad spans 2-3 strings in the 3NPS layout. You are picking out chord tones from within the scale shape you already know.' },
        { id: 'mon-3nps9', label: '3NPS diatonic 7ths — within the same position, arpeggiate each 7th: Imaj7 (1-3-5-7), IIm7 (2-4-6-1), IIIm7 (3-5-7-2), IVmaj7 (4-6-1-3), V7 (5-7-2-4), VIm7 (6-1-3-5), VIIm7♭5 (7-2-4-6) ascending through the position, then descend',
          note: 'Each 7th arpeggio spans 3-4 strings in 3NPS. You are extending the triads you just played by adding one more note on top.' },
      ]},
      { title: 'Triads as Chords — All Types, All Inversions', min: 45, tasks: [
        { id: 'mon-t1', label: 'Major triads — root, 1st inv, 2nd inv — string sets 6-5-4, 5-4-3, 4-3-2, 3-2-1', note: 'No open strings. Name each note aloud.' },
        { id: 'mon-t2', label: 'Minor triads — same pattern, same string sets' },
        { id: 'mon-t3', label: 'Diminished triads — same pattern' },
        { id: 'mon-t4', label: 'Augmented triads — same pattern' },
        { id: 'mon-t5', label: 'Sus2 and Sus4 — same pattern, all string sets' },
        { id: 'mon-t6', label: 'Random drill — call a type + inversion + string set, find it within 5 seconds' },
        { id: 'mon-t7', label: 'Spot-check your weakest type — slow it down, fix the shape' },
      ]},
      { title: 'Harmonic Context — Diatonic Triads', min: 20, tasks: [
        { id: 'mon-h1', label: 'Play I–vii° as triads, string set 4-3-2, in order, naming quality aloud' },
        { id: 'mon-h2', label: 'Repeat on string sets 3-2-1 and 5-4-3' },
        { id: 'mon-h3', label: 'Play I–IV–V–I as a short progression — find 3 different positions on the neck' },
      ]},
      { title: 'Improvisation — Chord Tones Only', min: 10, tasks: [
        { id: 'mon-i1', label: 'Play over a drone — use only triad arpeggios as melodic material', note: 'No scale patterns. If you cannot name the note, do not play it.' },
        { id: 'mon-i2', label: 'Target landing on the 3rd of each chord — hear it as resolution' },
      ]},
      { title: 'Next Key Preview', min: 5, tasks: [
        { id: 'mon-p1', label: 'Find all major triads in next week\'s key — all string sets, no pressure, just locate' },
      ]},
    ]
  },
  {
    day: 'Tuesday', short: 'Tue', focus: '7th Chord Shapes', totalMin: 100,
    blocks: [
      { title: 'Warm-up — CAGED Scale & Interval Drills', min: 20, tasks: [
        { id: 'tue-w1', label: 'Full scale run — ascend and descend the entire neck. Quarter notes at 80 BPM, then subdivide to 8th notes at the same tempo' },
        { id: 'tue-w2', label: 'Interval jumps in 5ths — ascending: 1-5, 2-6, 3-7, 4-1, 5-2, 6-3, 7-4 then descend back: 4-7, 3-6, 2-5, 1-4, 7-3, 6-2, 5-1',
          note: '5ths are the power interval — root-fifth outlines are everywhere in rock and jazz.' },
        { id: 'tue-w3', label: 'Interval jumps in 6ths — ascending: 1-6, 2-7, 3-1, 4-2, 5-3, 6-4, 7-5 then descend back: 5-7, 4-6, 3-5, 2-4, 1-3, 7-2, 6-1',
          note: '6ths are triad inversions heard melodically. Great for R&B and soul phrasing.' },
        { id: 'tue-w4', label: 'Diatonic triad + 7th building — arpeggiate each degree as triad then 7th: I (1-3-5 → 1-3-5-7), ii (2-4-6 → 2-4-6-1), iii (3-5-7 → 3-5-7-2), IV (4-6-1 → 4-6-1-3), V (5-7-2 → 5-7-2-4), vi (6-1-3 → 6-1-3-5), vii° (7-2-4 → 7-2-4-6) then descend',
          note: 'Triads: major, minor, minor, major, major, minor, dim. 7ths: maj7, min7, min7, maj7, dom7, min7, min7♭5. Name both aloud.' },
        { id: 'tue-w5', label: 'Horizontal — play 5ths on a single string: pick the A string, play 1-5, 2-6, 3-7, 4-1, 5-2, 6-3, 7-4 sliding up the neck, then descend. Then play diatonic 7th arpeggios horizontally on a string pair (A + D strings): Imaj7, IIm7, IIIm7, IVmaj7, V7, VIm7, VIIm7♭5 sliding up the neck',
          note: 'Two notes per arpeggio on each string — root and 5th on the A string, 3rd and 7th on the D string. Slide up one degree at a time.' },
      ]},
      { title: '7th Chords — All Types, All Inversions', min: 45, tasks: [
        { id: 'tue-t1', label: 'Maj7 — root, 1st, 2nd, 3rd inversion — all string sets', note: 'Where is the 7th relative to the root? Know it, do not guess.' },
        { id: 'tue-t2', label: 'Dom7 — same pattern, all inversions, all string sets' },
        { id: 'tue-t3', label: 'Min7 — same pattern' },
        { id: 'tue-t4', label: 'Min7b5 (half-dim) — same pattern' },
        { id: 'tue-t5', label: 'Dim7 — same pattern (symmetrical — only 3 unique shapes)' },
        { id: 'tue-t6', label: 'Shell voicings (3rd + 7th only) for all 5 types — string pairs 6-4, 5-3, 4-2' },
        { id: 'tue-t7', label: 'Random drill — type + inversion + string set — find within 5 seconds' },
      ]},
      { title: 'Harmonic Context — Diatonic 7ths', min: 20, tasks: [
        { id: 'tue-h1', label: 'I–vii° as 7th chords, current key — one string set, naming quality aloud', note: 'Imaj7, IIm7, IIIm7, IVmaj7, V7, VIm7, VIIm7b5' },
        { id: 'tue-h2', label: 'Repeat on two more string sets' },
        { id: 'tue-h3', label: 'IIm7–V7–Imaj7 as a chord sequence — 3 different positions on the neck' },
        { id: 'tue-h4', label: 'Same ii–V–I using shell voicings only — hear how lean and clear they sit' },
      ]},
      { title: 'Improvisation — Targeting the 7th', min: 10, tasks: [
        { id: 'tue-i1', label: 'Play over a drone — use 7th arpeggio shapes as melodic material', note: 'Target the 7th as a landing note. Hear its color against the root.' },
        { id: 'tue-i2', label: 'Comp a ii–V–I loop and improvise short phrases using only chord tones over each chord' },
      ]},
      { title: 'Next Key Preview', min: 5, tasks: [
        { id: 'tue-p1', label: 'Find Maj7 and Dom7 in next week\'s key — string set 6-5-4 only' },
      ]},
    ]
  },
  {
    day: 'Wednesday', short: 'Wed', focus: 'Triad Arpeggios', totalMin: 110,
    blocks: [
      { title: 'Warm-up — CAGED Scale & Interval Drills', min: 20, tasks: [
        { id: 'wed-w1', label: 'Full scale run — ascend and descend the entire neck. Quarter notes at 80 BPM, then subdivide to 8th notes' },
        { id: 'wed-w2', label: 'Interval jumps in 3rds — ascending: 1-3, 2-4, 3-5, 4-6, 5-7, 6-1, 7-2 then descend back: 2-7, 1-6, 7-5, 6-4, 5-3, 4-2, 3-1',
          note: 'Second pass this week on 3rds. Push 5 BPM faster than Monday if Monday felt clean.' },
        { id: 'wed-w3', label: 'Interval jumps in 7ths — ascending: 1-7, 2-1, 3-2, 4-3, 5-4, 6-5, 7-6 then descend back: 6-7, 5-6, 4-5, 3-4, 2-3, 1-2, 7-1',
          note: '7ths are the widest diatonic skip. Forces you to hear across almost the full octave.' },
        { id: 'wed-w4', label: 'Diatonic triad + 7th building — different CAGED position than Monday: I (1-3-5 → 1-3-5-7), ii (2-4-6 → 2-4-6-1), iii (3-5-7 → 3-5-7-2), IV (4-6-1 → 4-6-1-3), V (5-7-2 → 5-7-2-4), vi (6-1-3 → 6-1-3-5), vii° (7-2-4 → 7-2-4-6) then descend',
          note: 'Same chords, new shapes. If Monday was position 1, try position 3 today. Arpeggiate triad then extend to 7th on each degree.' },
        { id: 'wed-w5', label: 'Horizontal — play diatonic triads on a single string set (e.g. D-G-B strings), sliding up the neck: I, ii, iii, IV, V, vi, vii° — move each triad shape laterally to the next scale degree without jumping positions. Then play 7ths horizontally on the low E string: 1-7, 2-1, 3-2, 4-3, 5-4, 6-5, 7-6 sliding up',
          note: 'The triads should flow smoothly up the neck. You are connecting positions, not staying in a box. Use the closest voicing to minimize hand movement.' },
      ]},
      { title: '3 Notes Per String — Intervals & Triads', min: 10, tasks: [
        { id: 'wed-3nps1', label: '3NPS intervals in 5ths — within one position, ascending: 1-5, 2-6, 3-7, 4-1, 5-2, 6-3, 7-4 then descend: 4-7, 3-6, 2-5, 1-4, 7-3, 6-2, 5-1. Follow the 3NPS fingering across the strings',
          note: '5ths jump two strings in 3NPS. The distance forces you to see the full position at once, not string by string.' },
        { id: 'wed-3nps2', label: '3NPS intervals in 6ths — within one position, ascending: 1-6, 2-7, 3-1, 4-2, 5-3, 6-4, 7-5 then descend: 5-7, 4-6, 3-5, 2-4, 1-3, 7-2, 6-1. Follow the 3NPS fingering',
          note: '6ths are wide — often spanning 3 strings in the 3NPS layout. These are inverted 3rds and sound great melodically.' },
        { id: 'wed-3nps3', label: '3NPS diatonic triads — in a different position than Monday, arpeggiate: I (1-3-5), ii (2-4-6), iii (3-5-7), IV (4-6-1), V (5-7-2), vi (6-1-3), vii° (7-2-4) ascending through the position, then descend',
          note: 'If Monday was position 1, try position 3 or 4 today. Same triads, different fret spacing.' },
        { id: 'wed-3nps4', label: '3NPS diatonic 7ths — same position as triads above, arpeggiate: Imaj7 (1-3-5-7), IIm7 (2-4-6-1), IIIm7 (3-5-7-2), IVmaj7 (4-6-1-3), V7 (5-7-2-4), VIm7 (6-1-3-5), VIIm7♭5 (7-2-4-6) ascending, then descend',
          note: 'Same position as the triads you just played — now extending each one to a 7th. This solidifies seeing 7th chord tones within the scale shape.' },
      ]},
      { title: 'Triad Arpeggios — Across the Full Neck', min: 45, tasks: [
        { id: 'wed-t1', label: 'Major arpeggio — start low E, ascend continuously across all 6 strings, descend back', note: 'Connect CAGED positions. No boxes. No pausing at position changes.' },
        { id: 'wed-t2', label: 'Major arpeggio — repeat starting from 4 different root positions on low E string' },
        { id: 'wed-t3', label: 'Minor arpeggio — full neck, ascending and descending' },
        { id: 'wed-t4', label: 'Diminished arpeggio — full neck' },
        { id: 'wed-t5', label: 'Augmented arpeggio — full neck' },
        { id: 'wed-t6', label: 'Sus2 arpeggio — full neck' },
        { id: 'wed-t7', label: 'Name every note aloud as you play — every arpeggio, no exceptions' },
        { id: 'wed-t8', label: 'Speed drill: major and minor arpeggios at tempo — push 5 BPM past comfortable' },
      ]},
      { title: 'Harmonic Context — Arpeggios in Sequence', min: 15, tasks: [
        { id: 'wed-h1', label: 'I–IV–V as arpeggios — connect across the neck without stopping between chords' },
        { id: 'wed-h2', label: 'vi–ii–V–I as arpeggios — connected, full neck, 2 different starting positions' },
        { id: 'wed-h3', label: 'Diatonic I–vii° as arpeggios — horizontal, not boxed' },
      ]},
      { title: 'Open Triads', min: 10, tasks: [
        { id: 'wed-o1', label: 'Major open triads — play R-3-5 spread across non-adjacent strings (e.g. strings 6-4-2, 5-3-1)', note: 'Same notes as close triads but wider voicing — more open, piano-like sound' },
        { id: 'wed-o2', label: 'Minor open triads — same string sets, find all inversions (root, 1st, 2nd)' },
        { id: 'wed-o3', label: 'Connect open triads diatonically: I–ii–iii–IV–V–vi on one string set, minimal motion', note: 'Voice lead between open voicings — same principle as close triads but wider stretches' },
        { id: 'wed-o4', label: 'I–IV–V–I using open triads — compare the sound to close-position voicings' },
      ]},
      { title: 'Improvisation — Horizontal Playing', min: 10, tasks: [
        { id: 'wed-i1', label: 'Play over a drone — move laterally across the neck, not vertically', note: 'If you are staying in one position, you are not using what you drilled.' },
        { id: 'wed-i2', label: 'Take one musical idea and shift it to a new neck position mid-phrase' },
      ]},
      { title: 'Next Key Preview', min: 5, tasks: [
        { id: 'wed-p1', label: 'Major arpeggio in next week\'s key — full neck, slowly, naming notes' },
      ]},
    ]
  },
  {
    day: 'Thursday', short: 'Thu', focus: '7th Arpeggios', totalMin: 115,
    blocks: [
      { title: 'Warm-up — CAGED Scale & Interval Drills', min: 20, tasks: [
        { id: 'thu-w1', label: 'Full scale run — ascend and descend the entire neck. Quarter notes at 80 BPM, then subdivide to 8th notes' },
        { id: 'thu-w2', label: 'Interval jumps in 4ths — ascending: 1-4, 2-5, 3-6, 4-7, 5-1, 6-2, 7-3 then descend back: 3-7, 2-6, 1-5, 7-4, 6-3, 5-2, 4-1',
          note: 'Second pass this week on 4ths. Push the tempo if Monday felt clean.' },
        { id: 'thu-w3', label: 'Interval jumps in 6ths — ascending: 1-6, 2-7, 3-1, 4-2, 5-3, 6-4, 7-5 then descend back: 5-7, 4-6, 3-5, 2-4, 1-3, 7-2, 6-1' },
        { id: 'thu-w4', label: 'Diatonic triad + 7th building — different CAGED position than Tuesday: I (1-3-5 → 1-3-5-7), ii (2-4-6 → 2-4-6-1), iii (3-5-7 → 3-5-7-2), IV (4-6-1 → 4-6-1-3), V (5-7-2 → 5-7-2-4), vi (6-1-3 → 6-1-3-5), vii° (7-2-4 → 7-2-4-6) then descend',
          note: 'Same chords, new shapes. Arpeggiate triad then extend to 7th on each degree. Hear how the voicing changes but the quality stays.' },
        { id: 'thu-w5', label: 'Horizontal — play diatonic 7th arpeggios on a string pair (A + D strings), sliding up the neck: Imaj7, IIm7, IIIm7, IVmaj7, V7, VIm7, VIIm7♭5 — move each shape laterally to the next degree. Then play 6ths horizontally on the A string: 1-6, 2-7, 3-1, 4-2, 5-3, 6-4, 7-5 sliding up',
          note: 'For the 7th arpeggios: play root and 5th on the A string, 3rd and 7th on the D string, sliding one degree at a time. You are mapping the entire key across the neck.' },
      ]},
      { title: '7th Arpeggios — Across the Full Neck', min: 45, tasks: [
        { id: 'thu-t1', label: 'Maj7 arpeggio — start low E, ascend all 6 strings continuously, descend back', note: 'Connect CAGED positions. Name every note aloud.' },
        { id: 'thu-t2', label: 'Maj7 — repeat from 4 different root positions on low E' },
        { id: 'thu-t3', label: 'Dom7 arpeggio — full neck, ascending and descending' },
        { id: 'thu-t4', label: 'Min7 arpeggio — full neck' },
        { id: 'thu-t5', label: 'Min7b5 arpeggio — full neck' },
        { id: 'thu-t6', label: 'Dim7 arpeggio — full neck (use the symmetry — every minor 3rd is a valid root)' },
        { id: 'thu-t7', label: 'Speed drill: Maj7 and Dom7 at tempo — same metronome approach as Wednesday' },
        { id: 'thu-t8', label: 'Identify and name the 7th aloud every time it appears as you ascend' },
      ]},
      { title: 'Harmonic Context — ii–V–I Deep Work', min: 20, tasks: [
        { id: 'thu-h1', label: 'IIm7–V7–Imaj7 as arpeggios — connect across the neck, no pausing' },
        { id: 'thu-h2', label: 'Repeat from 3 different starting positions' },
        { id: 'thu-h3', label: 'Diatonic 7th arpeggios I–vii° in sequence — horizontal, full neck' },
        { id: 'thu-h4', label: 'IIm7b5–V7–Im7 (minor ii–V–i) — learn this alongside the major version' },
      ]},
      { title: 'Improvisation — Targeting Chord Tones', min: 10, tasks: [
        { id: 'thu-i1', label: 'Play over a ii–V–I loop — land on the 3rd of each chord on beat 1' },
        { id: 'thu-i2', label: 'Same loop — now land on the 7th of each chord on beat 1. Hear the difference.' },
        { id: 'thu-i3', label: 'Free improv — chord tones only, horizontal movement, no position camping' },
      ]},
      { title: 'Modal Soloing over Changes', min: 15, tasks: [
        { id: 'thu-m1', label: 'I → ♭VII (Mixolydian borrow, 1 note drops) then I → II (Lydian borrow, 1 note raises). Use the algorithm on each. Play 2 bars each with metronome',
          note: 'Algorithm: (1) Mode number tells you N — "my root is the Nth note of which major scale?" That\'s your parent key. (2) Count up from the parent key to find the borrowed chord\'s degree. (3) Degree = mode name (1=Ionian, 2=Dorian, 3=Phrygian, 4=Lydian, 5=Mixolydian, 6=Aeolian, 7=Locrian).' },
        { id: 'thu-m2', label: 'I → ♭III (borrowed from Dorian) — 2 notes shift. Target chord tones (root, 3rd, 5th) on beat 1 of each change while navigating the new note pool' },
        { id: 'thu-m3', label: 'I → ♭VI → ♭VII → I (borrowed from Aeolian) — 3 notes shift on the borrows. Loop the 4 chords, 2 bars each, feel the pool change on ♭VI and the return on I' },
        { id: 'thu-m4', label: 'I → ♭II (borrowed from Phrygian) — 4 notes shift. Biggest jump. Stay in one CAGED position and find exactly which frets change when the borrowed chord hits' },
        { id: 'thu-m5', label: 'Pick any borrowed progression above — first stay in one CAGED position for the whole loop, then repeat connecting across positions horizontally' },
        { id: 'thu-m6', label: 'Play all 7 modes in the current key ascending — Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian. Same root, feel how each mode\'s color changes as intervals shift' },
      ]},
      { title: 'Next Key Preview', min: 5, tasks: [
        { id: 'thu-p1', label: 'Maj7 and min7 arpeggios in next week\'s key — slow, with note naming' },
      ]},
    ]
  },
  {
    day: 'Friday', short: 'Fri', focus: 'Context + Extensions', totalMin: 110,
    blocks: [
      { title: 'Warm-up — CAGED Scale & Interval Drills', min: 20, tasks: [
        { id: 'fri-w1', label: 'Full scale run — ascend and descend the entire neck. Quarter notes at 80 BPM, then subdivide to 8th notes' },
        { id: 'fri-w2', label: 'Interval jumps in 5ths — ascending: 1-5, 2-6, 3-7, 4-1, 5-2, 6-3, 7-4 then descend back: 4-7, 3-6, 2-5, 1-4, 7-3, 6-2, 5-1',
          note: 'Second pass this week on 5ths. Focus on landing each interval cleanly in time.' },
        { id: 'fri-w3', label: 'Interval jumps in 7ths — ascending: 1-7, 2-1, 3-2, 4-3, 5-4, 6-5, 7-6 then descend back: 6-7, 5-6, 4-5, 3-4, 2-3, 1-2, 7-1' },
        { id: 'fri-w4', label: 'Diatonic triad then 7th building — on each degree, arpeggiate the triad then the 7th before moving on: I (1-3-5 → 1-3-5-7), ii (2-4-6 → 2-4-6-1), iii (3-5-7 → 3-5-7-2), IV (4-6-1 → 4-6-1-3), V (5-7-2 → 5-7-2-4), vi (6-1-3 → 6-1-3-5), vii° (7-2-4 → 7-2-4-6)',
          note: 'Hear how the 7th extends each triad. The added note changes the chord quality and color.' },
        { id: 'fri-w5', label: 'Horizontal — play diatonic triads then 7ths on a string set (D-G-B), sliding up the neck: I (triad → 7th), ii (triad → 7th), iii, IV, V, vi, vii° — each degree gets its triad then its 7th before sliding to the next. Then play 5ths and 7ths horizontally on the low E string back to back',
          note: 'This is the horizontal version of the triad-to-7th drill. Slide the shape, don\'t jump positions. The neck should feel like one continuous map, not five separate boxes.' },
      ]},
      { title: '3 Notes Per String — Intervals & 7th Building', min: 10, tasks: [
        { id: 'fri-3nps1', label: '3NPS intervals in 7ths — within one position, ascending: 1-7, 2-1, 3-2, 4-3, 5-4, 6-5, 7-6 then descend: 6-7, 5-6, 4-5, 3-4, 2-3, 1-2, 7-1. Follow the 3NPS fingering across the strings',
          note: '7ths are the widest diatonic interval — nearly a full octave. In 3NPS this means jumping 3+ strings. You are training your ear and fingers to span the full position.' },
        { id: 'fri-3nps2', label: '3NPS diatonic triads — within one position, arpeggiate: I (1-3-5), ii (2-4-6), iii (3-5-7), IV (4-6-1), V (5-7-2), vi (6-1-3), vii° (7-2-4) ascending, then descend',
          note: 'Different position than Mon and Wed. By Friday you should have triads in 3 different 3NPS positions across the week.' },
        { id: 'fri-3nps3', label: '3NPS diatonic 7ths — same position, arpeggiate: Imaj7 (1-3-5-7), IIm7 (2-4-6-1), IIIm7 (3-5-7-2), IVmaj7 (4-6-1-3), V7 (5-7-2-4), VIm7 (6-1-3-5), VIIm7♭5 (7-2-4-6) ascending, then descend',
          note: 'Each 7th arpeggio spans 3-4 strings in 3NPS. By Friday, triads and 7ths should feel like natural extensions of the scale shape.' },
        { id: 'fri-3nps4', label: '3NPS combined — pick one position, play the scale ascending, then 7ths interval ascending, then diatonic triads ascending, then diatonic 7th arpeggios ascending, all without stopping. Flow between all four views of the same notes',
          note: 'This integrates everything: scale, intervals, triads, and 7ths are four lenses on the same 3NPS shape. By Friday you should see all four simultaneously.' },
      ]},
      { title: 'Full Diatonic Harmony — Chords + Arpeggios', min: 25, tasks: [
        { id: 'fri-t1', label: 'I–vii° as triads — all four string sets, in order, named' },
        { id: 'fri-t2', label: 'I–vii° as 7th chords — all three string sets, in order, named' },
        { id: 'fri-t3', label: 'I–vii° as triad arpeggios — horizontal, connected, no boxes' },
        { id: 'fri-t4', label: 'I–vii° as 7th arpeggios — horizontal, connected' },
        { id: 'fri-t5', label: 'Mix: play a diatonic chord, then its arpeggio, then move to the next chord' },
      ]},
      { title: 'Voice Leading', min: 15, tasks: [
        { id: 'fri-v1', label: 'Triads: connect I–IV–V–I on one string set — move each voice by the smallest interval', note: 'Keep common tones, move others by step' },
        { id: 'fri-v2', label: 'Triads: connect I–vi–ii–V–I — same approach, smallest movements', note: 'Try on strings 4-3-2, then 3-2-1' },
        { id: 'fri-v3', label: '7th chords: connect Imaj7–IVmaj7–V7–Imaj7 — voice lead on one string set', note: 'The 7th of one chord often resolves by step to the 3rd of the next' },
        { id: 'fri-v4', label: '7th chords: connect ii–V–I as 7ths — find the smoothest path', note: 'Guide tones (3rds and 7ths) swap roles: the 3rd of ii becomes the 7th of V' },
        { id: 'fri-v5', label: 'Full diatonic walk: voice lead I–ii–iii–IV–V–vi–vii°–I as 7ths, minimal motion' },
      ]},
      { title: 'Extensions — 9ths and 11ths', min: 15, tasks: [
        { id: 'fri-e1', label: 'Locate the 9th in your Maj7 arpeggio shape — add as a passing note', note: 'Imaj9 = Imaj7 + the 2nd scale degree' },
        { id: 'fri-e2', label: 'Min7 → min9 — locate and add 9th in each CAGED position' },
        { id: 'fri-e3', label: 'Dom7 → Dom9 — same process' },
        { id: 'fri-e4', label: 'Add11 on minor chords — find the 11th in your min7 shapes' },
        { id: 'fri-e5', label: 'Short melodic phrases using arpeggio tones + 9ths over a static chord drone' },
      ]},
      { title: 'Chord-Melody Sketch', min: 20, tasks: [
        { id: 'fri-m1', label: 'Harmonize a 4-bar melody using triads — melody note on top of each voicing', note: 'Use whichever inversion keeps the melody note on top' },
        { id: 'fri-m2', label: 'Upgrade the harmonization using 7th voicings instead of triads' },
        { id: 'fri-m3', label: 'Repeat the same melody from a different neck position' },
      ]},
      { title: 'Next Key Orientation', min: 15, tasks: [
        { id: 'fri-p1', label: 'I–vii° triads in next week\'s key — identify which chords feel unfamiliar' },
        { id: 'fri-p2', label: 'Find the ii–V–I in next week\'s key as 7th chords — any position' },
        { id: 'fri-p3', label: 'Write down any shapes that feel shaky — those are Monday\'s priority' },
      ]},
    ]
  },
  {
    day: 'Saturday', short: 'Sat', focus: 'Integration + Mastery', totalMin: 130,
    blocks: [
      { title: 'Warm-up — CAGED Scale & Interval Drills', min: 20, tasks: [
        { id: 'sat-w1', label: 'Full scale run — ascend and descend the entire neck. Quarter notes at 80 BPM, then subdivide to 8th notes',
          note: 'End of the week — this should feel noticeably smoother than Monday. If not, slow down and clean it up.' },
        { id: 'sat-w2', label: 'Interval jumps — run all three back to back. 3rds ascending: 1-3, 2-4, 3-5, 4-6, 5-7, 6-1, 7-2 then descend. 5ths ascending: 1-5, 2-6, 3-7, 4-1, 5-2, 6-3, 7-4 then descend. 7ths ascending: 1-7, 2-1, 3-2, 4-3, 5-4, 6-5, 7-6 then descend',
          note: 'Review day. 3rds, 5ths, and 7ths are the intervals that spell out 7th chords. Hearing them sequentially connects everything.' },
        { id: 'sat-w3', label: 'Diatonic triad and 7th building — on each degree arpeggiate triad then 7th: I (1-3-5 → 1-3-5-7), ii (2-4-6 → 2-4-6-1), iii (3-5-7 → 3-5-7-2), IV (4-6-1 → 4-6-1-3), V (5-7-2 → 5-7-2-4), vi (6-1-3 → 6-1-3-5), vii° (7-2-4 → 7-2-4-6). Pick whichever CAGED position felt weakest this week',
          note: 'This is your self-diagnostic. Whichever degree or position stumbles is next week\'s priority.' },
        { id: 'sat-w4', label: 'Horizontal — play the full scale on each individual string one at a time: low E, A, D, G, B, high E — find every note of the key on each string from open to 12th fret. Then pick your weakest interval from the week and run it horizontally on the low E and A strings',
          note: 'End-of-week horizontal review. By now you should be able to find every scale note on every string. If any string feels blank, that\'s the gap to close next week.' },
      ]},
      { title: 'Extended Integration — Backing Track', min: 30, tasks: [
        { id: 'sat-t1', label: 'Play over a chord progression in current key — chord tones and arpeggios only', note: 'No scale patterns. Every note should belong to the chord underneath.' },
        { id: 'sat-t2', label: 'Target the 3rd as your primary landing note for 10 minutes' },
        { id: 'sat-t3', label: 'Switch — target the 7th as your primary landing note for 10 minutes' },
        { id: 'sat-t4', label: 'Free improvisation — combine both, move laterally across the neck' },
      ]},
      { title: 'Rhythm Comping & Groove', min: 20, tasks: [
        { id: 'sat-r1', label: 'Quarter-note chord changes (fingerstyle, no pick) — play a I–vi–IV–V progression, one chord per bar (4 downstrums per chord), at 70 BPM. Strum with your fingers. The chord change between bars must land exactly on beat 1 with no gap or buzz. If the change is late, slow down. Once clean, try 2 beats per chord, then 1 beat per chord',
          note: 'Use your thumb for downstrums or a full finger rake across the strings. No pick for this entire rhythm block — fingers give you more dynamic control and tonal variety for comping.' },
        { id: 'sat-r2', label: '8th-note strumming — same I–vi–IV–V, one chord per bar (8 strums per chord: down-up-down-up-down-up-down-up). Start with all 8 strums ringing, then try a pattern: down, miss, down-up, miss, up-down-up. Keep the arm swinging even on skipped strums',
          note: 'Your arm is a pendulum — it never stops. Downs always fall on the beat, ups always on the "and." Ghost strums (arm swings but misses strings) fill the gaps.' },
        { id: 'sat-r3', label: 'Mute drill — play a chord ringing on beat 1, then release fretting pressure (strings still touched) and strum dead mutes on beats 2, 3, 4. Then alternate: ring, mute, ring, mute on every beat. Then every 8th note: ring-mute-ring-mute-ring-mute-ring-mute',
          note: 'The mute happens in the fretting hand only — release pressure so strings buzz instead of ring, but keep fingers touching. Your strumming arm does not change. Toggle speed is the skill.' },
        { id: 'sat-r4', label: '16th-note muted scratching — mute all strings and strum constant 16ths at 70 BPM (4 strums per beat, down-up-down-up). Accent beat 1 only. Then accent beats 2 and 4 only. Then accent the "e" and "a" (2nd and 4th 16ths) only',
          note: 'This is pure rhythm, no pitch. You are a drummer. The accents should pop out clearly against the ghost scratches. If you can do this evenly, you can play funk.' },
        { id: 'sat-r5', label: 'Rake into chord tones — mute strings 6-5-4, rake (drag pick across all 3), and land cleanly on a chord tone on string 3 or 2. Practice raking into the 3rd of the chord, then the 7th. Repeat over each chord in the I–vi–IV–V progression',
          note: 'The rake is a controlled scrape — not a sloppy strum. The muted strings before the target note create percussive anticipation. Land the target note exactly on the beat.' },
        { id: 'sat-r6', label: 'Comping with 7th shells — play ii–V–I with 3rd+7th shell voicings on beats 2 and 4 only. Metronome clicks on 1 and 3, your chords land between the clicks. Add muted scratches on beats 1 and 3 to fill the space',
          note: 'Jazz comping feel. The shells are just 2 notes (3rd and 7th) — small voicings, big rhythmic impact. Hear how the 7th of one chord resolves to the 3rd of the next.' },
        { id: 'sat-r7', label: 'Funk/groove pattern — combine ringing chords, dead mutes, rakes, and accents into a 2-bar repeating groove over I–vi–IV–V. Build your own pattern using the 16th note grid: decide which 16ths ring, which are muted scratches, which are rakes, which are silent',
          note: 'This is creative rhythm construction. Record yourself and listen — does it groove? Adjust the pattern until it feels locked and repeatable.' },
        { id: 'sat-r8', label: 'Rhythm/lead switching — comp 2 bars of chord groove (mutes, rakes, accents), then play 2 bars of melodic line (arpeggio or scale fragment) over the same progression. Switch back and forth without dropping the tempo',
          note: 'This is the real skill of playing with others. The transition between rhythm and lead should be seamless — no pause, no tempo change.' },
        { id: 'sat-r9', label: 'Syncopated comping — play chords on the "and" of 2 and the "and" of 4 only. Fill the remaining space with muted 16th note scratches. Your arm swings constant 16ths, but only 2 of the 32 strums per bar are ringing chords',
          note: 'The hardest exercise here. The chords fall between metronome clicks and the muted scratches keep the groove alive. This sounds professional when locked in.' },
      ]},
      { title: 'Chord-Melody — Full Piece', min: 20, tasks: [
        { id: 'sat-m1', label: 'Harmonize an 8-bar melody in current key with triads and 7th voicings', note: 'Slow is fine. The musical decisions matter more than the speed.' },
        { id: 'sat-m2', label: 'Record it. Listen back. Identify where the harmony feels weak.' },
        { id: 'sat-m3', label: 'Fix the two weakest bars.' },
      ]},
      { title: 'Cold Spot Check', min: 15, tasks: [
        { id: 'sat-s1', label: 'Random challenge: chord type + inversion + string set — find within 5 seconds' },
        { id: 'sat-s2', label: 'Run diatonic sequence I–vii° starting from a random mid-neck position' },
        { id: 'sat-s3', label: 'Any arpeggio type — say note names before your fingers land, not after' },
        { id: 'sat-s4', label: 'Call any note — find it on all 6 strings from memory, no searching' },
      ]},
      { title: 'Mastery Self-Assessment', min: 10, tasks: [
        { id: 'sat-a1', label: 'Complete the Mastery Checklist below — honest self-grading only', note: 'If in doubt, it is not checked. Move keys only when all 9 are solid.' },
      ]},
      { title: 'Next Key Full Orientation', min: 15, tasks: [
        { id: 'sat-p1', label: 'All major triads in next key — all string sets, no open strings' },
        { id: 'sat-p2', label: 'Maj7 and min7 arpeggios in next key — full neck, with note naming' },
        { id: 'sat-p3', label: 'The discomfort you feel right now is exactly where you will start Monday. That is the point.' },
      ]},
    ]
  },
];

// ── Harmonic Minor Weekly Schedule ──
const SCHEDULE_HARM_MINOR = [
  {
    day: 'Monday', short: 'Mon', focus: 'Harm. Minor Scale Shapes', totalMin: 100,
    blocks: [
      { title: 'Warm-up — 3NPS Scale & Interval Drills', min: 20, tasks: [
        { id: 'hm-mon-w1', label: 'Scale run in all 7 3NPS positions — play the harmonic minor scale ascending and descending in each position. Quarter notes at 80 BPM, then repeat all positions subdividing to 8th notes, then triplets. Focus on staying even through the ♭6–7 stretch',
          note: 'Go through all 7 positions at each subdivision level. The augmented 2nd will try to rush or drag — keep it metronomically even.' },
        { id: 'hm-mon-w2', label: 'Interval jumps in 3rds — ascending: 1-♭3, 2-4, ♭3-5, 4-♭6, 5-7, ♭6-1, 7-2 then descend back: 2-7, 1-♭6, 7-5, ♭6-4, 5-♭3, 4-2, ♭3-1',
          note: 'The ♭3 and ♭6 change the spacing vs major. Feel where the 3rds are major vs minor within the pattern.' },
        { id: 'hm-mon-w3', label: 'Interval jumps in 4ths — ascending: 1-4, 2-5, ♭3-♭6, 4-7, 5-1, ♭6-2, 7-♭3 then descend back: ♭3-7, 2-♭6, 1-5, 7-4, ♭6-♭3, 5-2, 4-1',
          note: 'Note the augmented 4th (tritone) between ♭3 and ♭6 — it will feel wider than the other 4ths.' },
        { id: 'hm-mon-w4', label: 'Diatonic triad + 7th building — arpeggiate each degree as triad then 7th within 3NPS position: i (1-♭3-5 → 1-♭3-5-7), ii° (2-4-♭6 → 2-4-♭6-1), III+ (♭3-5-7 → ♭3-5-7-2), iv (4-♭6-1 → 4-♭6-1-♭3), V (5-7-2 → 5-7-2-4), VI (♭6-1-♭3 → ♭6-1-♭3-5), vii° (7-2-4 → 7-2-4-♭6) then descend',
          note: 'Triads: min, dim, aug, min, maj, maj, dim. 7ths: mMaj7, m7♭5, maj7♯5, m7, dom7, maj7, dim7. Name both aloud.' },
        { id: 'hm-mon-w5', label: 'Diagonal runs — play the harmonic minor scale on 2-string groups, moving up the neck diagonally: start on strings 6-5 in the lowest position, ascend diagonally shifting up frets, then strings 5-4, then 4-3, then 3-2, then 2-1. Repeat descending',
          note: 'This connects 3NPS positions diagonally. The ♭6–7 augmented 2nd will appear in different places on each string pair.' },
      ]},
      { title: 'Harmonic Minor Scale — All 3NPS Positions', min: 45, tasks: [
        { id: 'hm-mon-t1', label: 'Harmonic minor scale in position 1 (root on low E) — ascending and descending all 6 strings, name each note', note: 'Formula: 1 2 ♭3 4 5 ♭6 7. Feel the augmented 2nd gap between ♭6 and 7. 3 notes per string, 7 positions total.' },
        { id: 'hm-mon-t2', label: 'Same scale in all 7 3NPS positions — move up the neck, one position at a time (each starts on the next scale degree)' },
        { id: 'hm-mon-t3', label: 'Connect positions: ascend through all 7 positions without stopping, then descend back' },
        { id: 'hm-mon-t4', label: 'Isolate the ♭6–7 interval in each position — drill it until the augmented 2nd feels natural under your fingers' },
        { id: 'hm-mon-t5', label: 'Compare to natural minor: play Aeolian then harmonic minor back to back — hear the single note difference (♭7 vs ♮7)' },
        { id: 'hm-mon-t6', label: 'Speed drill: harmonic minor scale at tempo — push 5 BPM past comfortable, focus on clean ♭6–7 transition' },
      ]},
      { title: 'Harmonic Context — Diatonic Triads', min: 20, tasks: [
        { id: 'hm-mon-h1', label: 'Play i–vii° as triads (i, ii°, III+, iv, V, VI, vii°) — name quality aloud', note: 'New qualities vs major: augmented III+, major V (not minor v), diminished vii°' },
        { id: 'hm-mon-h2', label: 'Repeat on two more string sets — hear how the augmented III+ stands out' },
        { id: 'hm-mon-h3', label: 'Play V–i as a short progression — this is THE harmonic minor sound. Find 3 positions on the neck' },
      ]},
      { title: 'Improvisation — Scale Tones Only', min: 10, tasks: [
        { id: 'hm-mon-i1', label: 'Play over a minor drone — use harmonic minor scale only, lean into the ♭6–7 resolution', note: 'Let the ♮7 pull toward the root. That leading tone is why this scale exists.' },
        { id: 'hm-mon-i2', label: 'Target landing on the ♮7 resolving to root — hear it as the strongest resolution in the scale' },
      ]},
      { title: 'Next Key Preview', min: 5, tasks: [
        { id: 'hm-mon-p1', label: 'Harmonic minor scale in next week\'s key — one position, slowly, naming notes' },
      ]},
    ]
  },
  {
    day: 'Tuesday', short: 'Tue', focus: 'Harm. Minor 7th Chords', totalMin: 100,
    blocks: [
      { title: 'Warm-up — 3NPS Scale & Interval Drills', min: 20, tasks: [
        { id: 'hm-tue-w1', label: 'Scale run — full neck ascend and descend through all 7 3NPS positions connected. Quarter notes at 80 BPM, then subdivide to 8th notes at same tempo',
          note: 'Connect all 7 positions into one continuous run up and back down the neck. Keep the ♭6–7 transition smooth.' },
        { id: 'hm-tue-w2', label: 'Interval jumps in 5ths — ascending: 1-5, 2-♭6, ♭3-7, 4-1, 5-2, ♭6-♭3, 7-4 then descend back: 4-7, ♭3-♭6, 2-5, 1-4, 7-♭3, ♭6-2, 5-1',
          note: '5ths include one augmented 5th (♭3 to 7) — that is the widest jump and the exotic harmonic minor sound.' },
        { id: 'hm-tue-w3', label: 'Interval jumps in 6ths — ascending: 1-♭6, 2-7, ♭3-1, 4-2, 5-♭3, ♭6-4, 7-5 then descend back: 5-7, 4-♭6, ♭3-5, 2-4, 1-♭3, 7-2, ♭6-1',
          note: '6ths include one augmented 6th (♭6 to 4 when descending). Feel where the spacing changes vs major.' },
        { id: 'hm-tue-w4', label: 'Diatonic triad + 7th building — arpeggiate each degree within 3NPS position: i (1-♭3-5 → 1-♭3-5-7), ii° (2-4-♭6 → 2-4-♭6-1), III+ (♭3-5-7 → ♭3-5-7-2), iv (4-♭6-1 → 4-♭6-1-♭3), V (5-7-2 → 5-7-2-4), VI (♭6-1-♭3 → ♭6-1-♭3-5), vii° (7-2-4 → 7-2-4-♭6) then descend',
          note: 'Triads: min, dim, aug, min, maj, maj, dim. 7ths: mMaj7, m7♭5, maj7♯5, m7, dom7, maj7, dim7. Name both aloud.' },
        { id: 'hm-tue-w5', label: 'Horizontal single-string run — play the full harmonic minor scale on one string (e.g. low E), then repeat on each remaining string. Focus on finding the ♭3, ♭6, and ♮7 quickly',
          note: 'Single-string work builds fretboard knowledge that connects 3NPS positions laterally. Name every note.' },
      ]},
      { title: '7th Chords — Harmonic Minor Qualities', min: 45, tasks: [
        { id: 'hm-tue-t1', label: 'mMaj7 (i chord) — root, 1st, 2nd, 3rd inversion — all string sets', note: 'Minor triad + major 7th. Dark body, bright top. The signature harmonic minor chord.' },
        { id: 'hm-tue-t2', label: 'Dom7 (V chord) — same pattern. This is the chord that CREATES harmonic minor — V7 resolving to minor.' },
        { id: 'hm-tue-t3', label: 'Dim7 (vii° chord) — same pattern. Symmetrical — every minor 3rd is a valid root.' },
        { id: 'hm-tue-t4', label: 'Maj7♯5 (III+ chord) — find this shape. Augmented triad + major 7th. Rare but distinctive.' },
        { id: 'hm-tue-t5', label: 'm7♭5 (ii° chord) — half-diminished. Same as major scale vii° chord — already in your hands from major track.' },
        { id: 'hm-tue-t6', label: 'Shell voicings (3rd + 7th only) for mMaj7, Dom7, Dim7 — string pairs 6-4, 5-3, 4-2' },
        { id: 'hm-tue-t7', label: 'Random drill — type + inversion + string set — find within 5 seconds' },
      ]},
      { title: 'Harmonic Context — Diatonic 7ths', min: 20, tasks: [
        { id: 'hm-tue-h1', label: 'i–vii° as 7th chords in current key — one string set, naming quality aloud', note: 'imMaj7, iim7♭5, IIImaj7♯5, ivm7, V7, VImaj7, vii°7' },
        { id: 'hm-tue-h2', label: 'Repeat on two more string sets' },
        { id: 'hm-tue-h3', label: 'iim7♭5–V7–imMaj7 as a chord sequence — THE minor ii–V–i. Find 3 positions.' },
        { id: 'hm-tue-h4', label: 'Same ii–V–i using shell voicings only — hear the guide tone movement' },
      ]},
      { title: 'Improvisation — Targeting the 7th', min: 10, tasks: [
        { id: 'hm-tue-i1', label: 'Play over a V7–i vamp — target the ♭7 of V7 resolving to the 3rd of i', note: 'This voice leading (♭7 of V → ♭3 of i) is the core of minor key harmony.' },
        { id: 'hm-tue-i2', label: 'Comp a ii–V–i loop and improvise short phrases using only chord tones over each chord' },
      ]},
      { title: 'Next Key Preview', min: 5, tasks: [
        { id: 'hm-tue-p1', label: 'mMaj7 and V7 in next week\'s key — one string set, slowly' },
      ]},
    ]
  },
  {
    day: 'Wednesday', short: 'Wed', focus: 'Harm. Minor Arpeggios', totalMin: 120,
    blocks: [
      { title: 'Warm-up — 3NPS Scale & Interval Drills', min: 20, tasks: [
        { id: 'hm-wed-w1', label: 'Scale run — full neck ascend and descend through all 7 3NPS positions connected. Quarter notes at 80 BPM, then subdivide to 8th notes, then triplets',
          note: 'Push to triplets today. The 3-note-per-string grouping aligns naturally with triplet subdivisions — use that.' },
        { id: 'hm-wed-w2', label: 'Interval jumps in 3rds — ascending: 1-♭3, 2-4, ♭3-5, 4-♭6, 5-7, ♭6-1, 7-2 then descend back: 2-7, 1-♭6, 7-5, ♭6-4, 5-♭3, 4-2, ♭3-1',
          note: 'Review from Monday — should flow easier now. Focus on speed and evenness.' },
        { id: 'hm-wed-w3', label: 'Interval jumps in 7ths — ascending: 1-7, 2-1, ♭3-2, 4-♭3, 5-4, ♭6-5, 7-♭6 then descend back: ♭6-7, 5-♭6, 4-5, ♭3-4, 2-♭3, 1-2, 7-1',
          note: '7ths include one diminished 7th (7 to ♭6). The widest and narrowest intervals alternate — hear the pattern.' },
        { id: 'hm-wed-w4', label: 'Diatonic triad + 7th building — arpeggiate each degree within 3NPS position: i (1-♭3-5 → 1-♭3-5-7), ii° (2-4-♭6 → 2-4-♭6-1), III+ (♭3-5-7 → ♭3-5-7-2), iv (4-♭6-1 → 4-♭6-1-♭3), V (5-7-2 → 5-7-2-4), VI (♭6-1-♭3 → ♭6-1-♭3-5), vii° (7-2-4 → 7-2-4-♭6) then descend',
          note: 'Triads: min, dim, aug, min, maj, maj, dim. 7ths: mMaj7, m7♭5, maj7♯5, m7, dom7, maj7, dim7. Name both aloud.' },
        { id: 'hm-wed-w5', label: 'Diagonal runs — play the harmonic minor scale on 2-string groups, moving up the neck diagonally: strings 6-5, then 5-4, then 4-3, then 3-2, then 2-1. Repeat descending',
          note: 'This connects 3NPS positions diagonally. Different string pairs will reveal the ♭6–7 stretch in different finger combinations.' },
      ]},
      { title: '3 Notes Per String — Intervals & Triads', min: 10, tasks: [
        { id: 'hm-wed-3nps1', label: '3NPS intervals in 5ths — within one position, ascending: 1-5, 2-♭6, ♭3-7, 4-1, 5-2, ♭6-♭3, 7-4 then descend back. Follow the 3NPS fingering across the strings',
          note: '5ths in harmonic minor include one augmented 5th (♭3 to 7) — that\'s the widest jump and the exotic harmonic minor sound.' },
        { id: 'hm-wed-3nps2', label: '3NPS intervals in 6ths — within one position, ascending: 1-♭6, 2-7, ♭3-1, 4-2, 5-♭3, ♭6-4, 7-5 then descend back. Follow the 3NPS fingering',
          note: '6ths in harmonic minor include one augmented 6th (♭6 to 4 descending) — feel where the spacing changes vs major.' },
        { id: 'hm-wed-3nps3', label: '3NPS diatonic triads — in a different position than Monday, arpeggiate: i (1-♭3-5), ii° (2-4-♭6), III+ (♭3-5-7), iv (4-♭6-1), V (5-7-2), VI (♭6-1-♭3), vii° (7-2-4) ascending, then descend',
          note: 'If Monday was position 1, try position 3 or 4 today. Feel the augmented III+ triad — it spans wider than the others.' },
        { id: 'hm-wed-3nps4', label: '3NPS diatonic 7ths — same position, arpeggiate: imMaj7 (1-♭3-5-7), iim7♭5 (2-4-♭6-1), IIImaj7♯5 (♭3-5-7-2), ivm7 (4-♭6-1-♭3), V7 (5-7-2-4), VImaj7 (♭6-1-♭3-5), vii°7 (7-2-4-♭6) ascending, then descend',
          note: 'Extend each triad to its 7th in the same position. The mMaj7 and dim7 voicings will feel unusual — drill them until they are automatic.' },
      ]},
      { title: 'Harmonic Minor Arpeggios — Full Neck', min: 45, tasks: [
        { id: 'hm-wed-t1', label: 'Minor arpeggio (i chord) — full neck, ascending continuously across all 6 strings, descend back', note: 'Connect 3NPS positions. No boxes. Name every note.' },
        { id: 'hm-wed-t2', label: 'Augmented arpeggio (III+ chord) — full neck. Symmetrical — every major 3rd is a valid root.' },
        { id: 'hm-wed-t3', label: 'Major arpeggio (V chord) — full neck' },
        { id: 'hm-wed-t4', label: 'Diminished arpeggio (vii° chord) — full neck' },
        { id: 'hm-wed-t5', label: 'mMaj7 arpeggio — full neck. The 4-note version of the i chord.' },
        { id: 'hm-wed-t6', label: 'Dom7 arpeggio (V7) — full neck. Already know this from major track — same shape, new context.' },
        { id: 'hm-wed-t7', label: 'Dim7 arpeggio (vii°7) — full neck. Use the symmetry.' },
        { id: 'hm-wed-t8', label: 'Speed drill: minor and dom7 arpeggios at tempo — push 5 BPM past comfortable' },
      ]},
      { title: 'Harmonic Context — Arpeggios in Sequence', min: 15, tasks: [
        { id: 'hm-wed-h1', label: 'V–i as arpeggios — connect across the neck without stopping between chords' },
        { id: 'hm-wed-h2', label: 'ii°–V–i as arpeggios — connected, full neck, 2 different starting positions' },
        { id: 'hm-wed-h3', label: 'Diatonic i–vii° as arpeggios — horizontal, not boxed' },
      ]},
      { title: 'Open Triads — Harmonic Minor', min: 10, tasks: [
        { id: 'hm-wed-o1', label: 'Minor open triads (i chord) — play R-♭3-5 spread across non-adjacent strings (e.g. strings 6-4-2, 5-3-1). Find all inversions (root, 1st, 2nd)',
          note: 'Same notes as close triads but wider voicing — darker, more atmospheric sound. The open spacing highlights the minor quality.' },
        { id: 'hm-wed-o2', label: 'Augmented open triads (III+ chord) — R-3-♯5 spread across non-adjacent strings, all inversions',
          note: 'The augmented triad is already wide-sounding close together — open voicing makes it even more ethereal and unresolved.' },
        { id: 'hm-wed-o3', label: 'Major open triads (V chord) — R-3-5 spread across non-adjacent strings, all inversions. Also try the VI chord (♭6-1-♭3)',
          note: 'V and VI are the two major triads in harmonic minor. Compare them open vs closed.' },
        { id: 'hm-wed-o4', label: 'Connect open triads diatonically: i–ii°–III+–iv–V–VI–vii° on one string set, minimal voice motion',
          note: 'Voice lead between open voicings. The III+ open voicing is the widest stretch — find the smoothest path through it.' },
        { id: 'hm-wed-o5', label: 'V–i using open triads — compare the resolution sound to close-position voicings. Then try ii°–V–i open',
          note: 'Open voicings give the V–i resolution a bigger, more orchestral quality. The leading tone (7→1) rings clearly when spread out.' },
      ]},
      { title: 'Improvisation — Horizontal Playing', min: 10, tasks: [
        { id: 'hm-wed-i1', label: 'Play over a V7–i vamp — move laterally across the neck using arpeggios, not scale runs' },
        { id: 'hm-wed-i2', label: 'Take one arpeggio phrase and shift it to a new neck position mid-phrase' },
      ]},
      { title: 'Next Key Preview', min: 10, tasks: [
        { id: 'hm-wed-p1', label: 'Harmonic minor scale + minor arpeggio in next key — full neck, naming notes' },
      ]},
    ]
  },
  {
    day: 'Thursday', short: 'Thu', focus: 'Harm. Minor Modes', totalMin: 115,
    blocks: [
      { title: 'Warm-up — 3NPS Scale & Interval Drills', min: 20, tasks: [
        { id: 'hm-thu-w1', label: 'Scale run — full neck ascend and descend through all 7 3NPS positions connected. Quarter notes at 80 BPM, then subdivide to 8th notes at same tempo',
          note: 'Daily scale run keeps all 7 positions fresh. Feel where the ♭6–7 stretch falls in each position.' },
        { id: 'hm-thu-w2', label: 'Interval jumps in 4ths — ascending: 1-4, 2-5, ♭3-♭6, 4-7, 5-1, ♭6-2, 7-♭3 then descend back: ♭3-7, 2-♭6, 1-5, 7-4, ♭6-♭3, 5-2, 4-1',
          note: 'Review from Monday — the tritone between ♭3 and ♭6 should be getting familiar.' },
        { id: 'hm-thu-w3', label: 'Interval jumps in 6ths — ascending: 1-♭6, 2-7, ♭3-1, 4-2, 5-♭3, ♭6-4, 7-5 then descend back: 5-7, 4-♭6, ♭3-5, 2-4, 1-♭3, 7-2, ♭6-1',
          note: '6ths revisited — pair with 4ths today. Notice that 4ths and 6ths are inversions of each other.' },
        { id: 'hm-thu-w4', label: 'Diatonic triad + 7th building — arpeggiate each degree within 3NPS position: i (1-♭3-5 → 1-♭3-5-7), ii° (2-4-♭6 → 2-4-♭6-1), III+ (♭3-5-7 → ♭3-5-7-2), iv (4-♭6-1 → 4-♭6-1-♭3), V (5-7-2 → 5-7-2-4), VI (♭6-1-♭3 → ♭6-1-♭3-5), vii° (7-2-4 → 7-2-4-♭6) then descend',
          note: 'Triads: min, dim, aug, min, maj, maj, dim. 7ths: mMaj7, m7♭5, maj7♯5, m7, dom7, maj7, dim7. Name both aloud.' },
        { id: 'hm-thu-w5', label: 'Horizontal single-string run — play the full harmonic minor scale on one string, then repeat on each remaining string. Connect to the 3NPS position that starts at each string',
          note: 'Bridges lateral (single-string) knowledge with vertical (3NPS position) knowledge. Name every note.' },
      ]},
      { title: 'Harmonic Minor Modes — Scale Shapes', min: 30, tasks: [
        { id: 'hm-thu-t1', label: 'Phrygian Dominant (5th mode) — play in all 7 3NPS positions. Formula: 1 ♭2 3 4 5 ♭6 ♭7', note: 'THE most used harmonic minor mode. Flamenco, metal, Middle Eastern music. Play over V7 chords.' },
        { id: 'hm-thu-t2', label: 'Dorian ♯4 (4th mode) — all 7 3NPS positions. Formula: 1 2 ♭3 ♯4 5 6 ♭7', note: 'Minor with a ♯4 — Balkan/klezmer feel. Play over minor chords in harmonic minor context.' },
        { id: 'hm-thu-t3', label: 'Lydian ♯2 (6th mode) — all 7 3NPS positions. Formula: 1 ♯2 3 ♯4 5 6 7', note: 'Two augmented 2nds — very exotic. Play over the VI major chord.' },
        { id: 'hm-thu-t4', label: 'Play all 7 harmonic minor modes on the same root ascending — hear each color change',
          note: 'Harmonic Minor, Locrian ♮6, Ionian ♯5, Dorian ♯4, Phrygian Dominant, Lydian ♯2, Ultra Locrian' },
      ]},
      { title: 'Modal Soloing — Phrygian Dominant Focus', min: 25, tasks: [
        { id: 'hm-thu-m1', label: 'V7→i vamp: play Phrygian Dominant over V7, harmonic minor over i — 2 bars each with metronome', note: 'Same notes, different tonal center. The ♭2–3 interval in Phrygian Dominant is the exotic sound.' },
        { id: 'hm-thu-m2', label: 'Same V7→i: target the 3rd of V7 on beat 1 (it\'s the leading tone of the key), resolve to root of i' },
        { id: 'hm-thu-m3', label: 'ii°–V7–i: play Locrian ♮6 over ii°, Phrygian Dominant over V7, harmonic minor over i' },
        { id: 'hm-thu-m4', label: 'Stay in one 3NPS position for the full ii°–V7–i — find where the mode tones shift within the position' },
        { id: 'hm-thu-m5', label: 'Same progression — connect across positions horizontally' },
      ]},
      { title: 'Harmonic Context — 7th Arpeggios', min: 20, tasks: [
        { id: 'hm-thu-h1', label: 'iim7♭5–V7–imMaj7 as 7th arpeggios — connect across the neck, no pausing' },
        { id: 'hm-thu-h2', label: 'Repeat from 3 different starting positions' },
        { id: 'hm-thu-h3', label: 'Diatonic 7th arpeggios i–vii° in sequence — horizontal, full neck' },
      ]},
      { title: 'Improvisation — Over Changes', min: 15, tasks: [
        { id: 'hm-thu-i1', label: 'Play over ii°–V7–i loop — land on the 3rd of each chord on beat 1' },
        { id: 'hm-thu-i2', label: 'Same loop — land on the 7th of each chord on beat 1' },
        { id: 'hm-thu-i3', label: 'Free improv — Phrygian Dominant phrases over V7, resolve into harmonic minor on i' },
      ]},
      { title: 'Next Key Preview', min: 5, tasks: [
        { id: 'hm-thu-p1', label: 'Phrygian Dominant scale in next week\'s key — one position, slowly' },
      ]},
    ]
  },
  {
    day: 'Friday', short: 'Fri', focus: 'Harm. Minor Voice Leading', totalMin: 110,
    blocks: [
      { title: 'Warm-up — 3NPS Scale & Interval Drills', min: 20, tasks: [
        { id: 'hm-fri-w1', label: 'Scale run — full neck ascend and descend through all 7 3NPS positions connected. Quarter notes at 80 BPM, then subdivide to 8th notes, then triplets',
          note: 'End of week — all 7 positions should connect fluidly by now. If one transition is rough, isolate that position boundary.' },
        { id: 'hm-fri-w2', label: 'Interval jumps in 5ths — ascending: 1-5, 2-♭6, ♭3-7, 4-1, 5-2, ♭6-♭3, 7-4 then descend back: 4-7, ♭3-♭6, 2-5, 1-4, 7-♭3, ♭6-2, 5-1',
          note: 'The augmented 5th (♭3 to 7) is the harmonic minor fingerprint in this interval. Lean into it.' },
        { id: 'hm-fri-w3', label: 'Interval jumps in 7ths — ascending: 1-7, 2-1, ♭3-2, 4-♭3, 5-4, ♭6-5, 7-♭6 then descend back: ♭6-7, 5-♭6, 4-5, ♭3-4, 2-♭3, 1-2, 7-1',
          note: 'Combines with 5ths today. The diminished 7th (7 to ♭6) is the narrowest interval — a half step. Hear the contrast.' },
        { id: 'hm-fri-w4', label: 'Diatonic triad + 7th building — arpeggiate each degree within 3NPS position: i (1-♭3-5 → 1-♭3-5-7), ii° (2-4-♭6 → 2-4-♭6-1), III+ (♭3-5-7 → ♭3-5-7-2), iv (4-♭6-1 → 4-♭6-1-♭3), V (5-7-2 → 5-7-2-4), VI (♭6-1-♭3 → ♭6-1-♭3-5), vii° (7-2-4 → 7-2-4-♭6) then descend',
          note: 'Triads: min, dim, aug, min, maj, maj, dim. 7ths: mMaj7, m7♭5, maj7♯5, m7, dom7, maj7, dim7. Name both aloud.' },
        { id: 'hm-fri-w5', label: 'Combined flow drill — pick one 3NPS position, play: scale ascending, then 5ths ascending, then 7ths ascending, then diatonic triads ascending, then diatonic 7ths ascending, all without stopping',
          note: 'Five lenses on the same position. By Friday this should flow as one continuous exercise with no pause between concepts.' },
      ]},
      { title: '3 Notes Per String — Intervals & 7th Building', min: 10, tasks: [
        { id: 'hm-fri-3nps1', label: '3NPS intervals in 7ths — within one position, ascending: 1-7, 2-1, ♭3-2, 4-♭3, 5-4, ♭6-5, 7-♭6 then descend back. Follow the 3NPS fingering across the strings',
          note: '7ths in harmonic minor include one diminished 7th (7 to ♭6) and one augmented span. Feel where these differ from major.' },
        { id: 'hm-fri-3nps2', label: '3NPS diatonic triads — different position than Mon and Wed, arpeggiate: i (1-♭3-5), ii° (2-4-♭6), III+ (♭3-5-7), iv (4-♭6-1), V (5-7-2), VI (♭6-1-♭3), vii° (7-2-4) ascending, then descend',
          note: 'By Friday you should have triads in 3 different 3NPS positions across the week. The III+ should feel less foreign now.' },
        { id: 'hm-fri-3nps3', label: '3NPS diatonic 7ths — same position, arpeggiate: imMaj7 (1-♭3-5-7), iim7♭5 (2-4-♭6-1), IIImaj7♯5 (♭3-5-7-2), ivm7 (4-♭6-1-♭3), V7 (5-7-2-4), VImaj7 (♭6-1-♭3-5), vii°7 (7-2-4-♭6) ascending, then descend',
          note: 'Three new 7th chord types not found in major: mMaj7 (i), maj7♯5 (III), dim7 (vii°). These define the harmonic minor sound.' },
        { id: 'hm-fri-3nps4', label: '3NPS combined — pick one position, play the harmonic minor scale ascending, then 7ths interval ascending, then diatonic triads ascending, then diatonic 7th arpeggios ascending, all without stopping. Flow between all four views',
          note: 'Integrates everything: scale, intervals, triads, and 7ths are four lenses on the same 3NPS shape. The augmented 2nd gap should feel natural by now.' },
      ]},
      { title: 'Full Diatonic Harmony — Chords + Arpeggios', min: 25, tasks: [
        { id: 'hm-fri-t1', label: 'i–vii° as triads — all four string sets, in order, named' },
        { id: 'hm-fri-t2', label: 'i–vii° as 7th chords — all three string sets, in order, named' },
        { id: 'hm-fri-t3', label: 'i–vii° as triad arpeggios — horizontal, connected, no boxes' },
        { id: 'hm-fri-t4', label: 'i–vii° as 7th arpeggios — horizontal, connected' },
        { id: 'hm-fri-t5', label: 'Mix: play a diatonic chord, then its arpeggio, then move to the next chord' },
      ]},
      { title: 'Voice Leading', min: 15, tasks: [
        { id: 'hm-fri-v1', label: 'Triads: connect i–iv–V–i on one string set — move each voice by the smallest interval', note: 'The V–i resolution is the harmonic minor payoff. Hear the leading tone pull.' },
        { id: 'hm-fri-v2', label: 'Triads: connect i–VI–ii°–V–i — same approach, smallest movements' },
        { id: 'hm-fri-v3', label: '7th chords: connect imMaj7–ivm7–V7–imMaj7 — voice lead on one string set', note: 'The 7th of V7 resolves down by half step to the ♭3 of i — feel that pull.' },
        { id: 'hm-fri-v4', label: '7th chords: ii°–V–i as 7ths — find the smoothest path' },
        { id: 'hm-fri-v5', label: 'Full diatonic walk: voice lead i–ii°–III+–iv–V–VI–vii°–i as 7ths, minimal motion' },
      ]},
      { title: 'Comparison — Major vs Harmonic Minor', min: 15, tasks: [
        { id: 'hm-fri-c1', label: 'Play ii–V–I in major, then ii°–V–i in harmonic minor, same key root — hear the difference', note: 'Same V7 chord in both! The V7 is the bridge between major and harmonic minor.' },
        { id: 'hm-fri-c2', label: 'Play I–IV–V–I in major, then i–iv–V–i in harmonic minor — compare the feel' },
        { id: 'hm-fri-c3', label: 'Improvise over V7 — switch between major resolution (to I) and minor resolution (to i) mid-phrase' },
      ]},
      { title: 'Chord-Melody Sketch', min: 20, tasks: [
        { id: 'hm-fri-m1', label: 'Harmonize a 4-bar minor melody using harmonic minor triads — melody note on top', note: 'Use whichever inversion keeps the melody note on top' },
        { id: 'hm-fri-m2', label: 'Upgrade using 7th voicings — the mMaj7 and dim7 colors will transform it' },
        { id: 'hm-fri-m3', label: 'Repeat from a different neck position' },
      ]},
      { title: 'Next Key Orientation', min: 5, tasks: [
        { id: 'hm-fri-p1', label: 'Harmonic minor diatonic triads in next key — identify which chords feel unfamiliar' },
      ]},
    ]
  },
  {
    day: 'Saturday', short: 'Sat', focus: 'Harm. Minor Integration', totalMin: 130,
    blocks: [
      { title: 'Warm-up — 3NPS Scale & Interval Drills (Review)', min: 20, tasks: [
        { id: 'hm-sat-w1', label: 'Scale run — full neck ascend and descend through all 7 3NPS positions connected. Quarter notes at 80 BPM, subdivide to 8th notes, then triplets',
          note: 'Saturday review: every position should be smooth by now. Identify the one transition that still stumbles.' },
        { id: 'hm-sat-w2', label: 'Interval jumps in 3rds — ascending: 1-♭3, 2-4, ♭3-5, 4-♭6, 5-7, ♭6-1, 7-2 then descend back: 2-7, 1-♭6, 7-5, ♭6-4, 5-♭3, 4-2, ♭3-1',
          note: 'Review from earlier this week — should be automatic now.' },
        { id: 'hm-sat-w3', label: 'Interval jumps in 5ths — ascending: 1-5, 2-♭6, ♭3-7, 4-1, 5-2, ♭6-♭3, 7-4 then descend back: 4-7, ♭3-♭6, 2-5, 1-4, 7-♭3, ♭6-2, 5-1',
          note: 'Review — the augmented 5th (♭3 to 7) should feel natural by Saturday.' },
        { id: 'hm-sat-w4', label: 'Interval jumps in 7ths — ascending: 1-7, 2-1, ♭3-2, 4-♭3, 5-4, ♭6-5, 7-♭6 then descend back: ♭6-7, 5-♭6, 4-5, ♭3-4, 2-♭3, 1-2, 7-1',
          note: 'Review — 3rds + 5ths + 7ths covers the triad-building intervals. If any feel shaky, that is your focus next week.' },
        { id: 'hm-sat-w5', label: 'Diatonic triad + 7th building — arpeggiate all 7 degrees: i (1-♭3-5 → 1-♭3-5-7), ii° (2-4-♭6 → 2-4-♭6-1), III+ (♭3-5-7 → ♭3-5-7-2), iv (4-♭6-1 → 4-♭6-1-♭3), V (5-7-2 → 5-7-2-4), VI (♭6-1-♭3 → ♭6-1-♭3-5), vii° (7-2-4 → 7-2-4-♭6) then descend',
          note: 'Final review of the week. You should be able to name every quality without thinking: mMaj7, m7♭5, maj7♯5, m7, dom7, maj7, dim7.' },
      ]},
      { title: 'Extended Integration — Backing Track', min: 30, tasks: [
        { id: 'hm-sat-t1', label: 'Play over a minor chord progression — harmonic minor scale and arpeggios', note: 'Every note should relate to the chord underneath. Use the ♮7 leading tone intentionally.' },
        { id: 'hm-sat-t2', label: 'Target the ♮7 resolving to root for 10 minutes — this is the harmonic minor identity' },
        { id: 'hm-sat-t3', label: 'Phrygian Dominant phrases over V7 sections — lean into the ♭2–3 exotic interval' },
        { id: 'hm-sat-t4', label: 'Free improvisation — combine harmonic minor, Phrygian Dominant, arpeggios, horizontal movement' },
      ]},
      { title: 'Rhythm Comping & Groove — Harmonic Minor', min: 20, tasks: [
        { id: 'hm-sat-r1', label: 'Quarter-note chord changes (fingerstyle, no pick) — play a i–iv–V–i progression, one chord per bar (4 downstrums per chord), at 70 BPM. Strum with your fingers. The chord change between bars must land exactly on beat 1 with no gap. If the change is late, slow down. Once clean, try 2 beats per chord, then 1 beat per chord',
          note: 'No pick for this entire rhythm block — fingers give more dynamic control. The V–i resolution is the harmonic minor payoff. Make sure the V chord lands with authority on beat 1.' },
        { id: 'hm-sat-r2', label: '8th-note strumming — same i–iv–V–i, one chord per bar (8 strums per chord: down-up-down-up-down-up-down-up). Start with all 8 ringing, then try a pattern: down, miss, down-up, miss, up-down-up. Keep the arm swinging even on skipped strums',
          note: 'Same arm mechanics as major, but the darker chord qualities demand a different dynamic approach — slightly heavier, less bouncy.' },
        { id: 'hm-sat-r3', label: 'Mute drill — alternate ringing chord and dead mute on every beat over i–iv–V–i, then every 8th note. Keep fretting hand fingers touching strings during mutes for the percussive "chk"',
          note: 'The mMaj7 voicing (i chord) is especially good for mute contrast — the major 7th interval rings bright, the mute kills it. That contrast is dramatic.' },
        { id: 'hm-sat-r4', label: '16th-note muted scratching — mute all strings and strum constant 16ths at 70 BPM. Accent beats 2 and 4 only. Then accent the "e" and "a" (2nd and 4th 16ths) only. Then freely mix accents',
          note: 'Same as major track but apply over a minor vamp. The dark tonality of the chord changes makes even pure rhythm feel heavier.' },
        { id: 'hm-sat-r5', label: 'Rake into chord tones — mute strings 6-5-4, rake across, land on the ♭3 of i, then the 7 of V7, then the ♭6 of iv. Practice raking into each target over the ii°–V–i progression',
          note: 'The ♮7 of the mMaj7 and the ♭6 of iv are the exotic targets. Raking into them emphasizes the harmonic minor color.' },
        { id: 'hm-sat-r6', label: 'Comping with HM shells — play ii°–V–i with 3rd+7th shell voicings on beats 2 and 4 only. Add muted scratches on 1 and 3. Hear the guide tone movement: ♭5 of ii° → 3rd of V7 → ♭3 of i',
          note: 'The ii°–V–i shell movement is the minor equivalent of the major ii–V–I. The m7♭5 shell is the setup, V7 is the tension, i is the release.' },
        { id: 'hm-sat-r7', label: 'Dark groove pattern — combine ringing chords, mutes, rakes, and accents into a 2-bar groove over i–iv–V–i. Build your own pattern on the 16th grid. Lean into the V–i contrast — make the V hit harder',
          note: 'Minor grooves benefit from dynamic contrast. The V chord should pop out of the muted texture — it is the tension point.' },
        { id: 'hm-sat-r8', label: 'Rhythm/lead switching — comp 2 bars of chord groove with mutes and rakes, then play 2 bars of harmonic minor melodic line targeting the ♮7→1 resolution. Switch back and forth without dropping tempo',
          note: 'When switching to lead, use the ♮7 leading tone as your go-to resolution note. When switching back to rhythm, land on the i chord with authority.' },
        { id: 'hm-sat-r9', label: 'Syncopated comping — chords on the "and" of 2 and "and" of 4 only, muted 16th scratches filling the rest. Try with close voicings, then with open voicings, then with shell voicings',
          note: 'Three different voicing types over the same syncopated rhythm. The open voicings ring longer and interact differently with the mutes — find which you prefer for the minor groove.' },
      ]},
      { title: 'Chord-Melody — Full Piece', min: 20, tasks: [
        { id: 'hm-sat-m1', label: 'Harmonize an 8-bar minor melody with harmonic minor triads and 7th voicings', note: 'Slow is fine. Use the V–i resolution as your strongest cadence.' },
        { id: 'hm-sat-m2', label: 'Record it. Listen back. Does the ♮7 leading tone create enough pull toward resolution?' },
        { id: 'hm-sat-m3', label: 'Fix the two weakest bars.' },
      ]},
      { title: 'Cold Spot Check', min: 15, tasks: [
        { id: 'hm-sat-s1', label: 'Random challenge: harmonic minor chord type + inversion + string set — find within 5 seconds' },
        { id: 'hm-sat-s2', label: 'Run diatonic sequence i–vii° starting from a random mid-neck position' },
        { id: 'hm-sat-s3', label: 'Phrygian Dominant from any starting note — immediately, no searching' },
        { id: 'hm-sat-s4', label: 'Spell any harmonic minor mode — name the 7 notes without playing, then verify on the fretboard' },
      ]},
      { title: 'Mastery Self-Assessment', min: 10, tasks: [
        { id: 'hm-sat-a1', label: 'Complete the Mastery Checklist below — honest self-grading only', note: 'If in doubt, it is not checked. Move keys only when all items are solid.' },
      ]},
      { title: 'Next Key Full Orientation', min: 15, tasks: [
        { id: 'hm-sat-p1', label: 'Harmonic minor scale in next key — all 7 3NPS positions' },
        { id: 'hm-sat-p2', label: 'Phrygian Dominant + minor arpeggios in next key — full neck, with note naming' },
        { id: 'hm-sat-p3', label: 'The discomfort you feel right now is exactly where you will start Monday. That is the point.' },
      ]},
    ]
  },
];

const SCALES = {
  'C':  ['C','D','E','F','G','A','B'],
  'F':  ['F','G','A','B♭','C','D','E'],
  'Bb': ['B♭','C','D','E♭','F','G','A'],
  'Eb': ['E♭','F','G','A♭','B♭','C','D'],
  'Ab': ['A♭','B♭','C','D♭','E♭','F','G'],
  'Db': ['D♭','E♭','F','G♭','A♭','B♭','C'],
  'Gb': ['G♭','A♭','B♭','C♭','D♭','E♭','F'],
  'B':  ['B','C♯','D♯','E','F♯','G♯','A♯'],
  'E':  ['E','F♯','G♯','A','B','C♯','D♯'],
  'A':  ['A','B','C♯','D','E','F♯','G♯'],
  'D':  ['D','E','F♯','G','A','B','C♯'],
  'G':  ['G','A','B','C','D','E','F♯'],
};

// ── Harmonic Minor Scales (same key cycle) ──
const HARM_MINOR_SCALES = {
  'C':  ['C','D','E♭','F','G','A♭','B'],
  'F':  ['F','G','A♭','B♭','C','D♭','E'],
  'Bb': ['B♭','C','D♭','E♭','F','G♭','A'],
  'Eb': ['E♭','F','G♭','A♭','B♭','C♭','D'],
  'Ab': ['A♭','B♭','C♭','D♭','E♭','F♭','G'],
  'Db': ['D♭','E♭','F♭','G♭','A♭','A','C'],
  'Gb': ['G♭','A♭','A','C♭','D♭','D','F'],
  'B':  ['B','C♯','D','E','F♯','G','A♯'],
  'E':  ['E','F♯','G','A','B','C','D♯'],
  'A':  ['A','B','C','D','E','F','G♯'],
  'D':  ['D','E','F','G','A','B♭','C♯'],
  'G':  ['G','A','B♭','C','D','E♭','F♯'],
};

// Harmonic minor mode names (each named as closest major mode + alteration)
const HARM_MINOR_MODE_NAMES = [
  'Harmonic Minor',    // 1 — Aeolian ♮7
  'Locrian ♮6',        // 2
  'Ionian ♯5',         // 3
  'Dorian ♯4',         // 4
  'Phrygian Dominant',  // 5
  'Lydian ♯2',         // 6
  'Ultra Locrian',     // 7
];
const HARM_MINOR_MODE_QUALITY = ['min','dim','aug','min','maj','maj','dim'];
const HARM_MINOR_MODE_OFFSETS = [0, 2, 3, 5, 7, 8, 11];

// Harmonic minor diatonic triads: i, ii°, III+, iv, V, VI, vii°
const HARM_MINOR_DIATONIC = [
  { roman: 'i',     quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'ii°',   quality: 'dim',  suffix: 'dim', intervals: '1 – ♭3 – ♭5' },
  { roman: 'III+',  quality: 'aug',  suffix: 'aug', intervals: '1 – 3 – ♯5' },
  { roman: 'iv',    quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'V',     quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'VI',    quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'vii°',  quality: 'dim',  suffix: 'dim', intervals: '1 – ♭3 – ♭5' },
];

// Harmonic minor diatonic 7ths: imMaj7, iim7♭5, IIImaj7♯5, ivm7, V7, VImaj7, vii°7
const HARM_MINOR_DIATONIC_7TH = [
  { roman: 'imMaj7',     quality: 'mMaj7',   suffix: 'mMaj7',  intervals: '1 – ♭3 – 5 – 7' },
  { roman: 'iim7♭5',     quality: 'm7b5',    suffix: 'm7♭5',   intervals: '1 – ♭3 – ♭5 – ♭7' },
  { roman: 'IIImaj7♯5',  quality: 'maj7#5',  suffix: 'maj7♯5', intervals: '1 – 3 – ♯5 – 7' },
  { roman: 'ivm7',       quality: 'm7',      suffix: 'm7',     intervals: '1 – ♭3 – 5 – ♭7' },
  { roman: 'V7',         quality: 'dom7',    suffix: '7',      intervals: '1 – 3 – 5 – ♭7' },
  { roman: 'VImaj7',     quality: 'maj7',    suffix: 'maj7',   intervals: '1 – 3 – 5 – 7' },
  { roman: 'vii°7',      quality: 'dim7',    suffix: 'dim7',   intervals: '1 – ♭3 – ♭5 – ♭♭7' },
];

function getHarmMinorTriads(key) {
  const scale = HARM_MINOR_SCALES[key];
  if (!scale) return [];
  const scaleChrom = scale.map(n => noteToChromatic(n));
  return HARM_MINOR_DIATONIC.map((d, i) => {
    const root = scale[i];
    const third = scale[(i + 2) % 7];
    const fifth = scale[(i + 4) % 7];
    const rootC = scaleChrom[i];
    const thirdC = scaleChrom[(i + 2) % 7];
    const fifthC = scaleChrom[(i + 4) % 7];
    return { ...d, root, third, fifth, rootC, thirdC, fifthC, degree: i, chordName: root + d.suffix };
  });
}

function getHarmMinor7ths(key) {
  const scale = HARM_MINOR_SCALES[key];
  if (!scale) return [];
  const scaleChrom = scale.map(n => noteToChromatic(n));
  return HARM_MINOR_DIATONIC_7TH.map((d, i) => {
    const root = scale[i];
    const third = scale[(i + 2) % 7];
    const fifth = scale[(i + 4) % 7];
    const seventh = scale[(i + 6) % 7];
    const rootC = scaleChrom[i];
    const thirdC = scaleChrom[(i + 2) % 7];
    const fifthC = scaleChrom[(i + 4) % 7];
    const seventhC = scaleChrom[(i + 6) % 7];
    return { ...d, root, third, fifth, seventh, rootC, thirdC, fifthC, seventhC, degree: i, chordName: root + d.suffix };
  });
}

const DIATONIC = [
  { roman: 'I',    quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'ii',   quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'iii',  quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'IV',   quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'V',    quality: 'Maj',  suffix: '',    intervals: '1 – 3 – 5' },
  { roman: 'vi',   quality: 'min',  suffix: 'm',   intervals: '1 – ♭3 – 5' },
  { roman: 'vii°', quality: 'dim',  suffix: 'dim', intervals: '1 – ♭3 – ♭5' },
];

// Chromatic helpers for diatonic fretboard
const CHROMATIC = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const CHROMATIC_FLAT = ['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const ENHARMONIC_MAP = {'D♭':'C♯','E♭':'D♯','G♭':'F♯','A♭':'G♯','B♭':'A♯','C♭':'B','F♭':'E','C♯':'C♯','D♯':'D♯','F♯':'F♯','G♯':'G♯','A♯':'A♯'};
const OPEN_STRINGS = [4, 9, 2, 7, 11, 4]; // string6=E, string5=A, string4=D, string3=G, string2=B, string1=E (semitones from C)
function noteToChromatic(n) { return ENHARMONIC_MAP[n] !== undefined ? CHROMATIC.indexOf(ENHARMONIC_MAP[n]) : CHROMATIC.indexOf(n); }
function fretNote(stringIdx, fret) { return CHROMATIC[(OPEN_STRINGS[stringIdx] + fret) % 12]; }

function getDiatonicTriads(key) {
  const scale = SCALES[key];
  if (!scale) return [];
  const scaleChrom = scale.map(n => noteToChromatic(n));
  return DIATONIC.map((d, i) => {
    const root = scale[i];
    const third = scale[(i + 2) % 7];
    const fifth = scale[(i + 4) % 7];
    const rootC = scaleChrom[i];
    const thirdC = scaleChrom[(i + 2) % 7];
    const fifthC = scaleChrom[(i + 4) % 7];
    return { ...d, root, third, fifth, rootC, thirdC, fifthC, degree: i, chordName: root + d.suffix };
  });
}

// Diatonic 7th chords: Imaj7, IIm7, IIIm7, IVmaj7, V7, VIm7, VIIm7♭5
const DIATONIC_7TH = [
  { roman: 'Imaj7',    quality: 'maj7',   suffix: 'maj7',  intervals: '1 – 3 – 5 – 7' },
  { roman: 'IIm7',     quality: 'm7',     suffix: 'm7',    intervals: '1 – ♭3 – 5 – ♭7' },
  { roman: 'IIIm7',    quality: 'm7',     suffix: 'm7',    intervals: '1 – ♭3 – 5 – ♭7' },
  { roman: 'IVmaj7',   quality: 'maj7',   suffix: 'maj7',  intervals: '1 – 3 – 5 – 7' },
  { roman: 'V7',       quality: 'dom7',   suffix: '7',     intervals: '1 – 3 – 5 – ♭7' },
  { roman: 'VIm7',     quality: 'm7',     suffix: 'm7',    intervals: '1 – ♭3 – 5 – ♭7' },
  { roman: 'VIIm7♭5',  quality: 'm7b5',   suffix: 'm7♭5',  intervals: '1 – ♭3 – ♭5 – ♭7' },
];

function getDiatonic7ths(key) {
  const scale = SCALES[key];
  if (!scale) return [];
  const scaleChrom = scale.map(n => noteToChromatic(n));
  return DIATONIC_7TH.map((d, i) => {
    const root = scale[i];
    const third = scale[(i + 2) % 7];
    const fifth = scale[(i + 4) % 7];
    const seventh = scale[(i + 6) % 7];
    const rootC = scaleChrom[i];
    const thirdC = scaleChrom[(i + 2) % 7];
    const fifthC = scaleChrom[(i + 4) % 7];
    const seventhC = scaleChrom[(i + 6) % 7];
    return { ...d, root, third, fifth, seventh, rootC, thirdC, fifthC, seventhC, degree: i, chordName: root + d.suffix };
  });
}

function DiatonicPlayer({ items, setHighlight }) {
  const [bpm, setBpm] = useState(80);
  const [random, setRandom] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState(() => items.map((_, i) => i));
  const [currentIdx, setCurrentIdx] = useState(null);
  const [nextIdx, setNextIdx] = useState(null);
  const [beat, setBeat] = useState(0); // 0-3 for 4/4 time
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nextChordRef = useRef(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const playClick = useCallback((isDownbeat) => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = isDownbeat ? 1000 : 700;
      gain.gain.setValueAtTime(isDownbeat ? 0.3 : 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }, [getAudioCtx]);

  const getNext = useCallback((current, enabledList, isRandom) => {
    if (enabledList.length === 0) return null;
    if (enabledList.length === 1) return enabledList[0];
    if (isRandom) {
      let n;
      do { n = enabledList[Math.floor(Math.random() * enabledList.length)]; } while (n === current && enabledList.length > 1);
      return n;
    }
    const pos = enabledList.indexOf(current);
    return enabledList[(pos + 1) % enabledList.length];
  }, []);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCurrentIdx(null);
    setNextIdx(null);
    setBeat(0);
    setHighlight([]);
  }, [setHighlight]);

  const start = useCallback(() => {
    if (enabled.length === 0) return;
    setPlaying(true);
    const first = random ? enabled[Math.floor(Math.random() * enabled.length)] : enabled[0];
    const second = getNext(first, enabled, random);
    setCurrentIdx(first);
    setNextIdx(second);
    nextChordRef.current = second;
    setHighlight([first]);
    setBeat(1);
    playClick(true); // downbeat click for beat 1

    let beatCount = 1; // already on beat 1

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      beatCount++;
      const beatInBar = ((beatCount - 1) % 4) + 1; // 1,2,3,4
      const isDownbeat = beatInBar === 1;
      playClick(isDownbeat);
      setBeat(beatInBar);

      if (isDownbeat) {
        // New bar — use the pre-shown next chord
        const incoming = nextChordRef.current;
        const afterNext = getNext(incoming, enabled, random);
        nextChordRef.current = afterNext;
        setCurrentIdx(incoming);
        setNextIdx(afterNext);
        setHighlight([incoming]);
      }
    }, (60 / bpm) * 1000);
  }, [bpm, random, enabled, setHighlight, getNext, playClick]);

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  useEffect(() => {
    if (playing) { stop(); }
  }, [items.length]);

  const toggleEnabled = (idx) => {
    if (playing) return;
    setEnabled(prev => prev.includes(idx) ? prev.filter(x => x !== idx) : [...prev, idx]);
  };
  const dragFrom = useRef(null);
  const handleDragStart = (pos) => { dragFrom.current = pos; };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (targetPos) => {
    if (dragFrom.current === null || dragFrom.current === targetPos) return;
    setEnabled(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragFrom.current, 1);
      next.splice(targetPos, 0, moved);
      return next;
    });
    dragFrom.current = null;
  };
  const allOn = enabled.length === items.length;

  return (
    <div>
      <div className="player-bar">
        <div className="player-section">
          <span className="player-label">BPM</span>
          <input className="player-bpm" type="number" min={20} max={300} value={bpm}
            onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setBpm(v); }}
            disabled={playing} />
        </div>
        <div className="player-section">
          <button className={`player-btn ${random ? 'active' : ''}`}
            onClick={() => { if (!playing) setRandom(r => !r); }}
            style={playing ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
            Random {random ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="player-section">
          {!playing
            ? <button className="player-btn start" onClick={start} disabled={enabled.length === 0}>▶ Start</button>
            : <button className="player-btn stop" onClick={stop}>■ Stop</button>
          }
        </div>
        {playing && (
          <div className="player-section" style={{ gap: 4 }}>
            {[1,2,3,4].map(b => (
              <span key={b} style={{ width: 10, height: 10, borderRadius: '50%', background: b <= beat ? '#c9963a' : '#ddd', transition: 'background 0.08s' }} />
            ))}
          </div>
        )}
        {playing && nextIdx !== null && (
          <div className="player-next">
            <span className="player-next-label">Next</span>
            <span className="player-next-chord" style={{ color: TRIAD_COLORS[nextIdx] }}>{items[nextIdx].roman} — {items[nextIdx].chordName}</span>
          </div>
        )}
      </div>
      <div className="player-bar" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="player-section" style={{ flexWrap: 'wrap' }}>
          <span className="player-label">Loop</span>
          <button className={`player-chip ${allOn ? 'on' : ''}`}
            onClick={() => { if (!playing) setEnabled(allOn ? [] : items.map((_, i) => i)); }}
            style={playing ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
            All
          </button>
          {enabled.map((idx, pos) => (
            <button key={idx} className="player-chip on"
              draggable={!playing}
              onDragStart={() => handleDragStart(pos)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(pos)}
              onClick={() => toggleEnabled(idx)}
              style={playing ? { opacity: 0.5, cursor: 'not-allowed' } : {
                borderColor: TRIAD_COLORS[idx], color: TRIAD_COLORS[idx],
                cursor: 'grab',
              }}>
              {items[idx].roman}
            </button>
          ))}
          {items.map((t, i) => (
            !enabled.includes(i) && (
              <button key={i} className="player-chip"
                onClick={() => toggleEnabled(i)}
                style={playing ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                {t.roman}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

// Unique color per degree: I=gold, ii=blue, iii=teal, IV=orange, V=red, vi=purple, vii°=rose
const TRIAD_COLORS = [
  '#c9963a', '#5b8abd', '#4a9e8e', '#d4782f', '#c75454', '#8e6bbf', '#c46a8a'
];

function FullNeckFretboard({ currentKey, highlighted, setHighlighted, showNotes, items }) {
  const triads = items || getDiatonicTriads(currentKey);
  const NUM_FRETS = 15;
  const padL = 64, padR = 40, padT = 52, padB = 52;
  const fretW = 116, stringGap = 72;
  const W = padL + NUM_FRETS * fretW + padR;
  const H = padT + 5 * stringGap + padB;
  const dotR = 26;
  const stringY = (s) => padT + (5 - s) * stringGap; // s: 0=low E (bottom) to 5=high E (top) — but guitar convention: s0=string6 low E at bottom
  // Map: stringIdx 0=string6 (low E) displayed at bottom, 5=string1 (high E) at top
  const sY = (si) => padT + si * stringGap; // si 0=top (string1/high E) to 5=bottom (string6/low E)
  const fretX = (f) => padL + (f - 0.5) * fretW;
  const fretLineX = (f) => padL + f * fretW;

  // Build note map: for each string/fret, which triads contain it?
  const noteMap = [];
  for (let si = 0; si < 6; si++) {
    noteMap[si] = [];
    for (let f = 0; f <= NUM_FRETS; f++) {
      const note = fretNote(si, f);
      const noteChrom = CHROMATIC.indexOf(note);
      const matches = [];
      triads.forEach((t, ti) => {
        if (noteChrom === t.rootC) matches.push({ triad: ti, interval: 'R', noteName: t.root });
        else if (noteChrom === t.thirdC) matches.push({ triad: ti, interval: (t.quality === 'Maj' || t.quality === 'aug') ? 'Δ3' : '♭3', noteName: t.third });
        else if (noteChrom === t.fifthC) matches.push({ triad: ti, interval: t.quality === 'dim' ? '♭5' : t.quality === 'aug' ? '♯5' : 'p5', noteName: t.fifth });
      });
      noteMap[si][f] = matches;
    }
  }

  // Display strings: si=0 is string 6 (low E) at bottom, si=5 is string 1 (high E) at top
  const displayStrings = [5,4,3,2,1,0]; // top to bottom: high E to low E

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, minWidth: 600 }}>
      {/* White background */}
      <rect x={0} y={0} width={W} height={H} rx={6} fill="#fff" />
      {/* Nut */}
      <line x1={fretLineX(0)} y1={padT - 4} x2={fretLineX(0)} y2={H - padB + 4} stroke="#222" strokeWidth={4} />
      {/* Fret lines */}
      {Array.from({length: NUM_FRETS}, (_, i) => i + 1).map(f => (
        <line key={`fret${f}`} x1={fretLineX(f)} y1={padT - 4} x2={fretLineX(f)} y2={H - padB + 4} stroke="#ccc" strokeWidth={1} />
      ))}
      {/* Fret numbers */}
      {Array.from({length: NUM_FRETS}, (_, i) => i + 1).map(f => (
        <text key={`fn${f}`} x={fretX(f)} y={H - 4} textAnchor="middle" fontSize={18} fill="#777" fontFamily="'DM Mono', monospace">{f}</text>
      ))}
      {/* Fret markers */}
      {[3,5,7,9,15].filter(f => f <= NUM_FRETS).map(f => (
        <circle key={`marker${f}`} cx={fretX(f)} cy={H - padB + 14} r={2.5} fill="#ccc" />
      ))}
      {NUM_FRETS >= 12 && <>
        <circle cx={fretX(12) - 6} cy={H - padB + 14} r={3} fill="#c9963a" />
        <circle cx={fretX(12) + 6} cy={H - padB + 14} r={3} fill="#c9963a" />
      </>}
      {/* String lines */}
      {displayStrings.map((si, row) => (
        <line key={`s${si}`} x1={padL} y1={sY(row)} x2={W - padR} y2={sY(row)} stroke="#bbb" strokeWidth={0.5 + (5 - si) * 0.3} />
      ))}
      {/* String labels */}
      {displayStrings.map((si, row) => (
        <text key={`sl${si}`} x={padL - 14} y={sY(row) + 4} textAnchor="middle" fontSize={11} fill="#888" fontFamily="'DM Mono', monospace">
          {['E','A','D','G','B','E'][si]}
        </text>
      ))}
      {/* Note dots */}
      {displayStrings.map((si, row) =>
        Array.from({length: NUM_FRETS + 1}, (_, f) => f).map(f => {
          const matches = noteMap[si][f];
          if (matches.length === 0) return null;
          const isAnyHighlighted = highlighted.length > 0;
          const activeMatches = isAnyHighlighted ? matches.filter(m => highlighted.includes(m.triad)) : matches;
          const fadedMatches = isAnyHighlighted ? matches.filter(m => !highlighted.includes(m.triad)) : [];
          const cx = f === 0 ? padL - 0 : fretX(f);
          const cy = sY(row);
          return (
            <g key={`n${si}-${f}`}>
              {fadedMatches.length > 0 && activeMatches.length === 0 && (
                <>
                  <circle cx={cx} cy={cy} r={dotR} fill={TRIAD_COLORS[fadedMatches[0].triad]} opacity={0.10} />
                  <text x={cx} y={cy + 4} textAnchor="middle" fill="#000" opacity={0.15} fontSize={20} fontFamily="'DM Mono', monospace" fontWeight={600}>
                    {showNotes ? fadedMatches[0].noteName : fadedMatches[0].interval}
                  </text>
                </>
              )}
              {activeMatches.length > 0 && (
                <>
                  <circle cx={cx} cy={cy} r={dotR}
                    fill={activeMatches[0].interval === 'R' ? TRIAD_COLORS[activeMatches[0].triad] : '#fff'}
                    stroke={TRIAD_COLORS[activeMatches[0].triad]}
                    strokeWidth={activeMatches[0].interval === 'R' ? 0 : 2}
                    opacity={isAnyHighlighted ? 1 : 0.7} />
                  <text x={cx} y={cy + 3.5} textAnchor="middle"
                    fill={activeMatches[0].interval === 'R' ? '#fff' : TRIAD_COLORS[activeMatches[0].triad]}
                    fontSize={20} fontFamily="'DM Mono', monospace" fontWeight={600}>
                    {showNotes ? activeMatches[0].noteName : activeMatches[0].interval}
                  </text>
                </>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

function FullNeck7thFretboard({ currentKey, highlighted, setHighlighted, showNotes, items }) {
  const chords = items || getDiatonic7ths(currentKey);
  const NUM_FRETS = 15;
  const padL = 64, padR = 40, padT = 52, padB = 52;
  const fretW = 116, stringGap = 72;
  const W = padL + NUM_FRETS * fretW + padR;
  const H = padT + 5 * stringGap + padB;
  const dotR = 26;
  const sY = (si) => padT + si * stringGap;
  const fretX = (f) => padL + (f - 0.5) * fretW;
  const fretLineX = (f) => padL + f * fretW;

  const noteMap = [];
  for (let si = 0; si < 6; si++) {
    noteMap[si] = [];
    for (let f = 0; f <= NUM_FRETS; f++) {
      const note = fretNote(si, f);
      const noteChrom = CHROMATIC.indexOf(note);
      const matches = [];
      chords.forEach((c, ci) => {
        if (noteChrom === c.rootC) matches.push({ triad: ci, interval: 'R', noteName: c.root });
        else if (noteChrom === c.thirdC) matches.push({ triad: ci, interval: (c.quality === 'maj7' || c.quality === 'dom7' || c.quality === 'augmaj7' || c.quality === 'maj7#5') ? 'Δ3' : '♭3', noteName: c.third });
        else if (noteChrom === c.fifthC) matches.push({ triad: ci, interval: (c.quality === 'm7b5' || c.quality === 'dim7') ? '♭5' : (c.quality === 'augmaj7' || c.quality === 'maj7#5') ? '♯5' : 'p5', noteName: c.fifth });
        else if (noteChrom === c.seventhC) matches.push({ triad: ci, interval: (c.quality === 'maj7' || c.quality === 'augmaj7' || c.quality === 'mmaj7' || c.quality === 'maj7#5' || c.quality === 'mMaj7') ? 'Δ7' : c.quality === 'dim7' ? '°7' : '♭7', noteName: c.seventh });
      });
      noteMap[si][f] = matches;
    }
  }

  const displayStrings = [5,4,3,2,1,0];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, minWidth: 600 }}>
      <rect x={0} y={0} width={W} height={H} rx={6} fill="#fff" />
      <line x1={fretLineX(0)} y1={padT - 4} x2={fretLineX(0)} y2={H - padB + 4} stroke="#222" strokeWidth={4} />
      {Array.from({length: NUM_FRETS}, (_, i) => i + 1).map(f => (
        <line key={`fret${f}`} x1={fretLineX(f)} y1={padT - 4} x2={fretLineX(f)} y2={H - padB + 4} stroke="#ccc" strokeWidth={1} />
      ))}
      {Array.from({length: NUM_FRETS}, (_, i) => i + 1).map(f => (
        <text key={`fn${f}`} x={fretX(f)} y={H - 4} textAnchor="middle" fontSize={18} fill="#777" fontFamily="'DM Mono', monospace">{f}</text>
      ))}
      {[3,5,7,9,15].filter(f => f <= NUM_FRETS).map(f => (
        <circle key={`marker${f}`} cx={fretX(f)} cy={H - padB + 14} r={2.5} fill="#ccc" />
      ))}
      {NUM_FRETS >= 12 && <>
        <circle cx={fretX(12) - 6} cy={H - padB + 14} r={3} fill="#c9963a" />
        <circle cx={fretX(12) + 6} cy={H - padB + 14} r={3} fill="#c9963a" />
      </>}
      {displayStrings.map((si, row) => (
        <line key={`s${si}`} x1={padL} y1={sY(row)} x2={W - padR} y2={sY(row)} stroke="#bbb" strokeWidth={0.5 + (5 - si) * 0.3} />
      ))}
      {displayStrings.map((si, row) => (
        <text key={`sl${si}`} x={padL - 14} y={sY(row) + 4} textAnchor="middle" fontSize={11} fill="#888" fontFamily="'DM Mono', monospace">
          {['E','A','D','G','B','E'][si]}
        </text>
      ))}
      {displayStrings.map((si, row) =>
        Array.from({length: NUM_FRETS + 1}, (_, f) => f).map(f => {
          const matches = noteMap[si][f];
          if (matches.length === 0) return null;
          const isAnyHighlighted = highlighted.length > 0;
          const activeMatches = isAnyHighlighted ? matches.filter(m => highlighted.includes(m.triad)) : matches;
          const fadedMatches = isAnyHighlighted ? matches.filter(m => !highlighted.includes(m.triad)) : [];
          const cx = f === 0 ? padL - 0 : fretX(f);
          const cy = sY(row);
          return (
            <g key={`n${si}-${f}`}>
              {fadedMatches.length > 0 && activeMatches.length === 0 && (
                <>
                  <circle cx={cx} cy={cy} r={dotR} fill={TRIAD_COLORS[fadedMatches[0].triad]} opacity={0.10} />
                  <text x={cx} y={cy + 4} textAnchor="middle" fill="#000" opacity={0.15} fontSize={20} fontFamily="'DM Mono', monospace" fontWeight={600}>
                    {showNotes ? fadedMatches[0].noteName : fadedMatches[0].interval}
                  </text>
                </>
              )}
              {activeMatches.length > 0 && (
                <>
                  <circle cx={cx} cy={cy} r={dotR}
                    fill={activeMatches[0].interval === 'R' ? TRIAD_COLORS[activeMatches[0].triad] : '#fff'}
                    stroke={TRIAD_COLORS[activeMatches[0].triad]}
                    strokeWidth={activeMatches[0].interval === 'R' ? 0 : 2}
                    opacity={isAnyHighlighted ? 1 : 0.7} />
                  <text x={cx} y={cy + 3.5} textAnchor="middle"
                    fill={activeMatches[0].interval === 'R' ? '#fff' : TRIAD_COLORS[activeMatches[0].triad]}
                    fontSize={20} fontFamily="'DM Mono', monospace" fontWeight={600}>
                    {showNotes ? activeMatches[0].noteName : activeMatches[0].interval}
                  </text>
                </>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

const CAGED_NAMES = ['C', 'A', 'G', 'E', 'D'];
const CATEGORIES = ['chord', 'arpeggio', 'pentatonic', 'scale'];
const QUALITY_TABS = ['Major', 'Minor', 'Diminished', 'Augmented', 'Sus4', 'Sus2', 'Maj7', 'Maj7 Shell', 'Min7', 'Dom7', 'Min7♭5', 'Dim7'];
const QUALITY_INFO = {
  Major: { formula: '1  2  3  4  5  6  7', mode: 'Ionian' },
  Minor: { formula: '1  2  ♭3  4  5  ♭6  ♭7', mode: 'Aeolian' },
  Diminished: { formula: '1  ♭2  ♭3  4  ♭5  ♭6  ♭7', mode: 'Locrian' },
  Augmented: { formula: '1  2  3  4  #5  6  7', mode: 'Ionian #5' },
  Sus4: { formula: '1  2  4  5  6  ♭7', mode: 'Mixolydian (no 3)' },
  Sus2: { formula: '1  2  4  5  6  ♭7', mode: 'Mixolydian (no 3)' },
  Maj7: { formula: '1  2  3  4  5  6  7', mode: 'Ionian' },
  'Maj7 Shell': { formula: 'R  Δ3  Δ7', mode: 'Shell Voicing (omit p5)' },
  Min7: { formula: '1  2  ♭3  4  5  ♭6  ♭7', mode: 'Aeolian' },
  Dom7: { formula: '1  2  3  4  5  6  ♭7', mode: 'Mixolydian' },
  'Min7♭5': { formula: '1  ♭2  ♭3  4  ♭5  ♭6  ♭7', mode: 'Locrian' },
  Dim7: { formula: '1  2  ♭3  4  ♭5  ♭6  ♭♭7', mode: 'Whole-Half Diminished' },
};
const CATEGORY_LABELS = {
  Major: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Major Scale' },
  Minor: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Minor Scale' },
  Diminished: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Locrian' },
  Augmented: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Scale' },
  Sus4: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Scale' },
  Sus2: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Scale' },
  Maj7: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Major Scale' },
  'Maj7 Shell': { chord: 'Shell Voicing' },
  Min7: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Minor Scale' },
  Dom7: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Mixolydian' },
  'Min7♭5': { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Locrian' },
  Dim7: { chord: 'Chord', arpeggio: 'Arpeggio', pentatonic: 'Pentatonic', scale: 'Whole-Half Dim' },
};

// Each dot: { s: string (1=high E, 6=low E), f: fret (1-6), i: interval label, r: is root }
// Variants: a category can be a single array of dots (one shape) or an array of arrays (multiple shapes)
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
function getVariants(shapeData) {
  if (!shapeData || shapeData.length === 0) return [[]];
  if (Array.isArray(shapeData[0])) return shapeData;
  return [shapeData];
}
const CAGED_SHAPES = { Major: {
  C: {
    chord: [
      [
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 1, f: 2, i: 'Δ3', r: false },
      ],
      [
        { s: 6, f: 5, i: 'p5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 2, i: 'Δ6', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: 'Δ2', r: false },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 4, i: 'Δ6', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 5, i: 'Δ2', r: false },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 3, i: 'p4', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 2, i: 'Δ6', r: false },
      { s: 5, f: 4, i: 'Δ7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: 'Δ2', r: false },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 4, i: 'Δ6', r: false },
      { s: 2, f: 2, i: 'Δ7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 5, i: 'Δ2', r: false },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 3, i: 'p4', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
  },
  A: {
    chord: [
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 4, i: 'Δ6', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ2', r: false },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 1, i: 'Δ6', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ2', r: false },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 4, i: 'Δ6', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 4, i: 'Δ6', r: false },
      { s: 5, f: 1, i: 'Δ7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ2', r: false },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 2, i: 'p4', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 1, i: 'Δ6', r: false },
      { s: 3, f: 3, i: 'Δ7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ2', r: false },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 4, i: 'Δ6', r: false },
    ],
  },
  G: {
    chord: [
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 3, i: 'Δ3', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 2, f: 1, i: 'Δ3', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    arpeggio: [
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 3, i: 'Δ3', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 2, f: 1, i: 'Δ3', r: false },
      { s: 2, f: 4, i: 'p5', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    pentatonic: [
      { s: 6, f: 1, i: 'Δ6', r: false },
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 1, i: 'Δ2', r: false },
      { s: 5, f: 3, i: 'Δ3', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 4, f: 3, i: 'Δ6', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ2', r: false },
      { s: 2, f: 1, i: 'Δ3', r: false },
      { s: 2, f: 4, i: 'p5', r: false },
      { s: 1, f: 1, i: 'Δ6', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ6', r: false },
      { s: 6, f: 4, i: 'Δ7', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 2, i: 'Δ2', r: false },
      { s: 5, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 5, i: 'p4', r: false },
      { s: 4, f: 2, i: 'p5', r: false },
      { s: 4, f: 4, i: 'Δ6', r: false },
      { s: 3, f: 1, i: 'Δ7', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 3, f: 4, i: 'Δ2', r: false },
      { s: 2, f: 2, i: 'Δ3', r: false },
      { s: 2, f: 3, i: 'p4', r: false },
      { s: 2, f: 5, i: 'p5', r: false },
      { s: 1, f: 2, i: 'Δ6', r: false },
      { s: 1, f: 4, i: 'Δ7', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
  },
  E: {
    chord: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 1, f: 2, i: 'R', r: true },
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 1, f: 2, i: 'R', r: true },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 4, i: 'Δ2', r: false },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 1, i: 'Δ6', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ2', r: false },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 4, i: 'Δ6', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ2', r: false },
    ],
    scale: [
      { s: 6, f: 1, i: 'Δ7', r: false },
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 4, i: 'Δ2', r: false },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 5, f: 2, i: 'p4', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 1, i: 'Δ6', r: false },
      { s: 4, f: 3, i: 'Δ7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ2', r: false },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 3, f: 4, i: 'p4', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 4, i: 'Δ6', r: false },
      { s: 1, f: 1, i: 'Δ7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ2', r: false },
    ],
  },
  D: {
    chord: [
      [
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 4, i: 'p5', r: false },
        { s: 2, f: 5, i: 'R', r: true },
        { s: 1, f: 4, i: 'Δ3', r: false },
      ],
      [
        { s: 6, f: 4, i: 'Δ3', r: false },
        { s: 5, f: 2, i: 'p5', r: false },
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 4, i: 'p5', r: false },
        { s: 2, f: 5, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'Δ2', r: false },
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 4, i: 'Δ6', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ2', r: false },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 2, i: 'Δ6', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ2', r: false },
      { s: 1, f: 4, i: 'Δ3', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ2', r: false },
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 6, f: 5, i: 'p4', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 4, i: 'Δ6', r: false },
      { s: 4, f: 1, i: 'Δ7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ2', r: false },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 2, i: 'p4', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 2, i: 'Δ6', r: false },
      { s: 2, f: 4, i: 'Δ7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ2', r: false },
      { s: 1, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
  },
}, Minor: {
  C: {
    chord: [
      [
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
      ],
      [
        { s: 6, f: 5, i: 'p5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 3, i: '♭3', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 6, i: '♭3', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 3, i: 'p4', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 3, i: '♭7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 3, i: '♭3', r: false },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 5, i: '♭7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 6, i: '♭3', r: false },
      { s: 1, f: 3, i: 'p4', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
    scale: [
      { s: 6, f: 3, i: 'p4', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 6, f: 6, i: '♭6', r: false },
      { s: 5, f: 3, i: '♭7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: 'Δ2', r: false },
      { s: 4, f: 3, i: '♭3', r: false },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 3, i: '♭6', r: false },
      { s: 3, f: 5, i: '♭7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 5, i: 'Δ2', r: false },
      { s: 2, f: 6, i: '♭3', r: false },
      { s: 1, f: 3, i: 'p4', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
      { s: 1, f: 6, i: '♭6', r: false },
    ],
  },
  A: {
    chord: [
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 5, i: '♭7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 2, i: 'p4', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 2, i: '♭7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 5, i: '♭7', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 3, i: '♭6', r: false },
      { s: 6, f: 5, i: '♭7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ2', r: false },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 2, i: 'p4', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 4, f: 5, i: '♭6', r: false },
      { s: 3, f: 2, i: '♭7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ2', r: false },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 3, i: '♭6', r: false },
      { s: 1, f: 5, i: '♭7', r: false },
    ],
  },
  G: {
    chord: [
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 2, i: '♭3', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 3, f: 1, i: 'R', r: true },
    ],
    arpeggio: [
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 2, i: '♭3', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 3, f: 4, i: '♭3', r: false },
      { s: 2, f: 4, i: 'p5', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    pentatonic: [
      { s: 6, f: 2, i: '♭7', r: false },
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 2, i: '♭3', r: false },
      { s: 5, f: 4, i: 'p4', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 4, f: 4, i: '♭7', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 3, f: 4, i: '♭3', r: false },
      { s: 2, f: 2, i: 'p4', r: false },
      { s: 2, f: 4, i: 'p5', r: false },
      { s: 1, f: 2, i: '♭7', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    scale: [
      { s: 6, f: 2, i: '♭7', r: false },
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 1, i: 'Δ2', r: false },
      { s: 5, f: 2, i: '♭3', r: false },
      { s: 5, f: 4, i: 'p4', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 4, f: 2, i: '♭6', r: false },
      { s: 4, f: 4, i: '♭7', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ2', r: false },
      { s: 3, f: 4, i: '♭3', r: false },
      { s: 2, f: 2, i: 'p4', r: false },
      { s: 2, f: 4, i: 'p5', r: false },
      { s: 2, f: 5, i: '♭6', r: false },
      { s: 1, f: 2, i: '♭7', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
  },
  E: {
    chord: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 1, f: 2, i: 'R', r: true },
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 2, i: 'p4', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 2, i: '♭7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 3, f: 4, i: 'p4', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 5, i: '♭7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 4, i: 'Δ2', r: false },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 2, i: 'p4', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 5, f: 5, i: '♭6', r: false },
      { s: 4, f: 2, i: '♭7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ2', r: false },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 3, f: 4, i: 'p4', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 3, i: '♭6', r: false },
      { s: 2, f: 5, i: '♭7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ2', r: false },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
  },
  D: {
    chord: [
      [
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 4, i: 'p5', r: false },
        { s: 2, f: 5, i: 'R', r: true },
        { s: 1, f: 3, i: '♭3', r: false },
      ],
      [
        { s: 6, f: 3, i: '♭3', r: false },
        { s: 5, f: 2, i: 'p5', r: false },
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 4, i: 'p5', r: false },
        { s: 2, f: 5, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 3, i: '♭3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 6, f: 5, i: 'p4', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 5, i: '♭7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 2, i: 'p4', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 3, i: '♭7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 3, i: '♭3', r: false },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ2', r: false },
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 6, f: 5, i: 'p4', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 3, i: '♭6', r: false },
      { s: 5, f: 5, i: '♭7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ2', r: false },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 2, i: 'p4', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 3, f: 5, i: '♭6', r: false },
      { s: 2, f: 3, i: '♭7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ2', r: false },
      { s: 1, f: 3, i: '♭3', r: false },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
  },
}, Diminished: {
  C: {
    chord: [
      [
        { s: 6, f: 4, i: '♭5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 3, i: '♭3', r: false },
      ],
      [
        { s: 6, f: 4, i: '♭5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 1, i: '♭5', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 1, i: '♭3', r: false },
      { s: 6, f: 4, i: '♭5', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 3, i: '♭3', r: false },
      { s: 3, f: 1, i: '♭5', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 1, f: 1, i: '♭3', r: false },
      { s: 1, f: 4, i: '♭5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 3, i: 'p4', r: false },
      { s: 6, f: 4, i: '♭5', r: false },
      { s: 5, f: 3, i: '♭7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 3, i: '♭3', r: false },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 1, i: '♭5', r: false },
      { s: 3, f: 5, i: '♭7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 6, i: '♭3', r: false },
      { s: 1, f: 3, i: 'p4', r: false },
      { s: 1, f: 4, i: '♭5', r: false },
    ],
    scale: [],
  },
  A: {
    chord: [
      [
        { s: 5, f: 2, i: 'R', r: true },
        { s: 4, f: 3, i: '♭5', r: false },
        { s: 3, f: 4, i: 'R', r: true },
        { s: 2, f: 3, i: '♭3', r: false },
      ],
      [
        { s: 5, f: 5, i: '♭3', r: false },
        { s: 4, f: 3, i: '♭5', r: false },
        { s: 3, f: 4, i: 'R', r: true },
        { s: 2, f: 3, i: '♭3', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 1, i: '♭5', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 3, i: '♭5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 1, f: 1, i: '♭5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 1, i: '♭5', r: false },
      { s: 6, f: 5, i: '♭7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 2, i: 'p4', r: false },
      { s: 4, f: 3, i: '♭5', r: false },
      { s: 3, f: 2, i: '♭7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 1, i: '♭5', r: false },
      { s: 1, f: 5, i: '♭7', r: false },
    ],
    scale: [],
  },
  G: {
    chord: [
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 3, i: '♭3', r: false },
      { s: 4, f: 1, i: '♭5', r: false },
    ],
    arpeggio: [
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 3, i: '♭3', r: false },
      { s: 4, f: 1, i: '♭5', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 3, f: 5, i: '♭3', r: false },
      { s: 2, f: 4, i: '♭5', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
    pentatonic: [
      { s: 6, f: 3, i: '♭7', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 3, i: '♭3', r: false },
      { s: 5, f: 5, i: 'p4', r: false },
      { s: 4, f: 1, i: '♭5', r: false },
      { s: 4, f: 5, i: '♭7', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 3, f: 5, i: '♭3', r: false },
      { s: 2, f: 3, i: 'p4', r: false },
      { s: 2, f: 4, i: '♭5', r: false },
      { s: 1, f: 3, i: '♭7', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
    scale: [],
  },
  E: {
    chord: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 5, f: 3, i: '♭5', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 3, i: '♭5', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 2, f: 1, i: '♭5', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 2, i: 'p4', r: false },
      { s: 5, f: 3, i: '♭5', r: false },
      { s: 4, f: 2, i: '♭7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 3, f: 4, i: 'p4', r: false },
      { s: 2, f: 1, i: '♭5', r: false },
      { s: 2, f: 5, i: '♭7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
    scale: [],
  },
  D: {
    chord: [
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 5, f: 1, i: '♭5', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 3, f: 3, i: '♭5', r: false },
    ],
    arpeggio: [
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 5, f: 1, i: '♭5', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 3, i: '♭5', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 3, i: '♭3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 6, f: 5, i: 'p4', r: false },
      { s: 5, f: 1, i: '♭5', r: false },
      { s: 5, f: 5, i: '♭7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 2, i: 'p4', r: false },
      { s: 3, f: 3, i: '♭5', r: false },
      { s: 2, f: 3, i: '♭7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 3, i: '♭3', r: false },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
    scale: [],
  },
}, Augmented: {
  C: {
    chord: [
      [
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 3, i: '#5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 1, f: 2, i: 'Δ3', r: false },
      ],
      [
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 3, i: '#5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 1, f: 2, i: 'Δ3', r: false },
      ],
      [
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 3, i: '#5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
      ],
      [
        { s: 6, f: 6, i: '#5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 3, i: '#5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 6, i: '#5', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 3, f: 3, i: '#5', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 6, i: '#5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 6, i: '#5', r: false },
      { s: 5, f: 2, i: 'Δ6', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: 'Δ2', r: false },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 3, f: 3, i: '#5', r: false },
      { s: 3, f: 4, i: 'Δ6', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 5, i: 'Δ2', r: false },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 6, i: '#5', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 3, i: 'p4', r: false },
      { s: 6, f: 6, i: '#5', r: false },
      { s: 5, f: 2, i: 'Δ6', r: false },
      { s: 5, f: 4, i: 'Δ7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: 'Δ2', r: false },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 3, i: '#5', r: false },
      { s: 3, f: 4, i: 'Δ6', r: false },
      { s: 2, f: 2, i: 'Δ7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 5, i: 'Δ2', r: false },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 3, i: 'p4', r: false },
      { s: 1, f: 6, i: '#5', r: false },
    ],
  },
  A: {
    chord: [
      { s: 5, f: 2, i: 'R', r: true },
      { s: 3, f: 4, i: 'R', r: true },
    ],
    arpeggio: [
      { s: 6, f: 3, i: '#5', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 5, i: '#5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 3, i: '#5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 3, i: '#5', r: false },
      { s: 6, f: 4, i: 'Δ6', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ2', r: false },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 5, i: '#5', r: false },
      { s: 3, f: 1, i: 'Δ6', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ2', r: false },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 3, i: '#5', r: false },
      { s: 1, f: 4, i: 'Δ6', r: false },
    ],
    scale: [
      { s: 6, f: 3, i: '#5', r: false },
      { s: 6, f: 4, i: 'Δ6', r: false },
      { s: 5, f: 1, i: 'Δ7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ2', r: false },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 2, i: 'p4', r: false },
      { s: 4, f: 5, i: '#5', r: false },
      { s: 3, f: 1, i: 'Δ6', r: false },
      { s: 3, f: 3, i: 'Δ7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ2', r: false },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 3, i: '#5', r: false },
      { s: 1, f: 4, i: 'Δ6', r: false },
    ],
  },
  G: {
    chord: [
      [
        { s: 4, f: 3, i: '#5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
        { s: 2, f: 2, i: 'Δ3', r: false },
        { s: 1, f: 1, i: '#5', r: false },
      ],
      [
        { s: 5, f: 4, i: 'Δ3', r: false },
        { s: 4, f: 3, i: '#5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
        { s: 2, f: 2, i: 'Δ3', r: false },
        { s: 1, f: 1, i: '#5', r: false },
      ],
      [
        { s: 5, f: 4, i: 'Δ3', r: false },
        { s: 4, f: 3, i: '#5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
        { s: 2, f: 2, i: 'Δ3', r: false },
      ],
      [
        { s: 6, f: 5, i: 'R', r: true },
        { s: 5, f: 4, i: 'Δ3', r: false },
        { s: 4, f: 3, i: '#5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
        { s: 2, f: 2, i: 'Δ3', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 1, i: '#5', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ3', r: false },
      { s: 4, f: 3, i: '#5', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 1, i: '#5', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'Δ6', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 2, i: 'Δ2', r: false },
      { s: 5, f: 4, i: 'Δ3', r: false },
      { s: 4, f: 3, i: '#5', r: false },
      { s: 4, f: 4, i: 'Δ6', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 3, f: 4, i: 'Δ2', r: false },
      { s: 2, f: 2, i: 'Δ3', r: false },
      { s: 2, f: 6, i: '#5', r: false },
      { s: 1, f: 2, i: 'Δ6', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ6', r: false },
      { s: 6, f: 4, i: 'Δ7', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 2, i: 'Δ2', r: false },
      { s: 5, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 5, i: 'p4', r: false },
      { s: 4, f: 3, i: '#5', r: false },
      { s: 4, f: 4, i: 'Δ6', r: false },
      { s: 3, f: 1, i: 'Δ7', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 3, f: 4, i: 'Δ2', r: false },
      { s: 2, f: 2, i: 'Δ3', r: false },
      { s: 2, f: 3, i: 'p4', r: false },
      { s: 2, f: 6, i: '#5', r: false },
      { s: 1, f: 2, i: 'Δ6', r: false },
      { s: 1, f: 4, i: 'Δ7', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
  },
  E: {
    chord: [
      [
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 3, i: 'Δ3', r: false },
        { s: 2, f: 3, i: '#5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
      [
        { s: 5, f: 5, i: '#5', r: false },
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 3, i: 'Δ3', r: false },
        { s: 2, f: 3, i: '#5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
      [
        { s: 5, f: 5, i: '#5', r: false },
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 3, i: 'Δ3', r: false },
        { s: 2, f: 3, i: '#5', r: false },
      ],
      [
        { s: 6, f: 6, i: 'Δ3', r: false },
        { s: 5, f: 5, i: '#5', r: false },
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 3, i: 'Δ3', r: false },
        { s: 2, f: 3, i: '#5', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 6, i: 'Δ3', r: false },
      { s: 5, f: 5, i: '#5', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 2, f: 3, i: '#5', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 6, i: 'Δ3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 4, i: 'Δ2', r: false },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 5, f: 5, i: '#5', r: false },
      { s: 4, f: 1, i: 'Δ6', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ2', r: false },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 2, f: 3, i: '#5', r: false },
      { s: 2, f: 4, i: 'Δ6', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ2', r: false },
    ],
    scale: [
      { s: 6, f: 1, i: 'Δ7', r: false },
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 4, i: 'Δ2', r: false },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 5, f: 2, i: 'p4', r: false },
      { s: 5, f: 5, i: '#5', r: false },
      { s: 4, f: 1, i: 'Δ6', r: false },
      { s: 4, f: 3, i: 'Δ7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ2', r: false },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 3, f: 4, i: 'p4', r: false },
      { s: 2, f: 3, i: '#5', r: false },
      { s: 2, f: 4, i: 'Δ6', r: false },
      { s: 1, f: 1, i: 'Δ7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ2', r: false },
    ],
  },
  D: {
    chord: [
      { s: 4, f: 2, i: 'R', r: true },
      { s: 2, f: 5, i: 'R', r: true },
    ],
    arpeggio: [
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 3, i: '#5', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 6, i: 'Δ3', r: false },
      { s: 3, f: 5, i: '#5', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'Δ2', r: false },
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 3, i: '#5', r: false },
      { s: 5, f: 4, i: 'Δ6', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ2', r: false },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 5, i: '#5', r: false },
      { s: 2, f: 2, i: 'Δ6', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ2', r: false },
      { s: 1, f: 4, i: 'Δ3', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ2', r: false },
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 6, f: 5, i: 'p4', r: false },
      { s: 5, f: 3, i: '#5', r: false },
      { s: 5, f: 4, i: 'Δ6', r: false },
      { s: 4, f: 1, i: 'Δ7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ2', r: false },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 2, i: 'p4', r: false },
      { s: 3, f: 5, i: '#5', r: false },
      { s: 2, f: 2, i: 'Δ6', r: false },
      { s: 2, f: 4, i: 'Δ7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ2', r: false },
      { s: 1, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
  },
}, Sus4: {
  C: {
    chord: [
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 2, i: '5', r: false },
      { s: 2, f: 3, i: 'R', r: true },
    ],
    arpeggio: [
      { s: 6, f: 3, i: 'p4', r: false },
      { s: 6, f: 5, i: '5', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 2, i: '5', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 1, f: 3, i: 'p4', r: false },
      { s: 1, f: 5, i: '5', r: false },
    ],
    pentatonic: [], scale: [],
  },
  A: {
    chord: [
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: '5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 2, i: '5', r: false },
    ],
    arpeggio: [
      { s: 6, f: 2, i: '5', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 2, i: 'p4', r: false },
      { s: 4, f: 4, i: '5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 2, i: '5', r: false },
    ],
    pentatonic: [], scale: [],
  },
  G: {
    chord: [
      [
        { s: 6, f: 4, i: 'R', r: true },
        { s: 5, f: 4, i: 'p4', r: false },
        { s: 4, f: 1, i: '5', r: false },
        { s: 3, f: 1, i: 'R', r: true },
      ],
      [
        { s: 4, f: 1, i: '5', r: false },
        { s: 3, f: 1, i: 'R', r: true },
        { s: 2, f: 2, i: 'p4', r: false },
        { s: 1, f: 4, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 4, i: 'p4', r: false },
      { s: 4, f: 1, i: '5', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 2, f: 2, i: 'p4', r: false },
      { s: 2, f: 4, i: '5', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    pentatonic: [], scale: [],
  },
  E: {
    chord: [
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 4, i: '5', r: false },
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 4, i: 'p4', r: false },
        { s: 2, f: 2, i: '5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 2, i: 'p4', r: false },
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 4, i: 'p4', r: false },
        { s: 2, f: 2, i: '5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
      [
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 4, i: 'p4', r: false },
        { s: 2, f: 2, i: '5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 5, f: 2, i: 'p4', r: false },
      { s: 5, f: 4, i: '5', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 4, i: 'p4', r: false },
      { s: 2, f: 2, i: '5', r: false },
      { s: 1, f: 2, i: 'R', r: true },
    ],
    pentatonic: [], scale: [],
  },
  D: {
    chord: [
      { s: 5, f: 2, i: '5', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 3, f: 4, i: '5', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
    arpeggio: [
      { s: 6, f: 5, i: 'p4', r: false },
      { s: 5, f: 2, i: '5', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 3, f: 2, i: 'p4', r: false },
      { s: 3, f: 4, i: '5', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
    pentatonic: [], scale: [],
  },
}, Sus2: {
  C: {
    chord: [
      { s: 6, f: 5, i: '5', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: '2', r: false },
      { s: 3, f: 2, i: '5', r: false },
    ],
    arpeggio: [
      { s: 6, f: 5, i: '5', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: '2', r: false },
      { s: 3, f: 2, i: '5', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 5, i: '2', r: false },
      { s: 1, f: 5, i: '5', r: false },
    ],
    pentatonic: [], scale: [],
  },
  A: {
    chord: [
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: '5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: '2', r: false },
      { s: 1, f: 2, i: '5', r: false },
    ],
    arpeggio: [
      { s: 6, f: 2, i: '5', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: '2', r: false },
      { s: 4, f: 4, i: '5', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: '2', r: false },
      { s: 1, f: 2, i: '5', r: false },
    ],
    pentatonic: [], scale: [],
  },
  G: {
    chord: [
      [
        { s: 6, f: 4, i: 'R', r: true },
        { s: 5, f: 1, i: '2', r: false },
        { s: 4, f: 1, i: '5', r: false },
        { s: 3, f: 1, i: 'R', r: true },
      ],
      [
        { s: 4, f: 1, i: '5', r: false },
        { s: 3, f: 3, i: '2', r: false },
        { s: 2, f: 4, i: '5', r: false },
        { s: 1, f: 4, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 1, i: '2', r: false },
      { s: 4, f: 1, i: '5', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 3, f: 3, i: '2', r: false },
      { s: 2, f: 4, i: '5', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    pentatonic: [], scale: [],
  },
  E: {
    chord: [
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 4, i: '5', r: false },
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 1, i: '2', r: false },
      ],
      [
        { s: 5, f: 4, i: '5', r: false },
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 1, i: '2', r: false },
        { s: 2, f: 2, i: '5', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 4, i: '2', r: false },
      { s: 5, f: 4, i: '5', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 1, i: '2', r: false },
      { s: 2, f: 2, i: '5', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 4, i: '2', r: false },
    ],
    pentatonic: [], scale: [],
  },
  D: {
    chord: [
      { s: 4, f: 2, i: 'R', r: true },
      { s: 3, f: 4, i: '5', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: '2', r: false },
    ],
    arpeggio: [
      { s: 6, f: 2, i: '2', r: false },
      { s: 5, f: 2, i: '5', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: '2', r: false },
      { s: 3, f: 4, i: '5', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: '2', r: false },
    ],
    pentatonic: [], scale: [],
  },
}, Maj7: {
  C: {
    chord: [
      [
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 2, i: 'Δ7', r: false },
        { s: 1, f: 2, i: 'Δ3', r: false },
      ],
      [
        { s: 6, f: 5, i: 'p5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 2, i: 'Δ7', r: false },
        { s: 1, f: 2, i: 'Δ3', r: false },
      ],
      [
        { s: 6, f: 2, i: 'Δ3', r: false },
        { s: 5, f: 4, i: 'Δ7', r: false },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 1, f: 2, i: 'Δ3', r: false },
      ],
      [
        { s: 6, f: 2, i: 'Δ3', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 2, i: 'Δ7', r: false },
        { s: 1, f: 2, i: 'Δ3', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 4, i: 'Δ7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 2, f: 2, i: 'Δ7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 2, i: 'Δ6', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: 'Δ2', r: false },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 4, i: 'Δ6', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 5, i: 'Δ2', r: false },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 3, i: 'p4', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 2, i: 'Δ6', r: false },
      { s: 5, f: 4, i: 'Δ7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: 'Δ2', r: false },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 4, i: 'Δ6', r: false },
      { s: 2, f: 2, i: 'Δ7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 5, i: 'Δ2', r: false },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 3, i: 'p4', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
  },
  A: {
    chord: [
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 3, i: 'Δ7', r: false },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 5, f: 1, i: 'Δ7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 3, i: 'Δ7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 4, i: 'Δ6', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ2', r: false },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 1, i: 'Δ6', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ2', r: false },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 4, i: 'Δ6', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 4, i: 'Δ6', r: false },
      { s: 5, f: 1, i: 'Δ7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ2', r: false },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 2, i: 'p4', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 1, i: 'Δ6', r: false },
      { s: 3, f: 3, i: 'Δ7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ2', r: false },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 4, i: 'Δ6', r: false },
    ],
  },
  G: {
    chord: [
      [
        { s: 5, f: 4, i: 'Δ3', r: false },
        { s: 4, f: 2, i: 'p5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
        { s: 2, f: 2, i: 'Δ3', r: false },
        { s: 1, f: 4, i: 'Δ7', r: false },
      ],
      [
        { s: 6, f: 4, i: 'Δ7', r: false },
        { s: 5, f: 4, i: 'Δ3', r: false },
        { s: 4, f: 2, i: 'p5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 4, i: 'Δ7', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ3', r: false },
      { s: 4, f: 2, i: 'p5', r: false },
      { s: 3, f: 1, i: 'Δ7', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 4, i: 'Δ7', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
    pentatonic: [
      { s: 6, f: 1, i: 'Δ6', r: false },
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 1, i: 'Δ2', r: false },
      { s: 5, f: 3, i: 'Δ3', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 4, f: 3, i: 'Δ6', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ2', r: false },
      { s: 2, f: 1, i: 'Δ3', r: false },
      { s: 2, f: 4, i: 'p5', r: false },
      { s: 1, f: 1, i: 'Δ6', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ6', r: false },
      { s: 6, f: 4, i: 'Δ7', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 2, i: 'Δ2', r: false },
      { s: 5, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 5, i: 'p4', r: false },
      { s: 4, f: 2, i: 'p5', r: false },
      { s: 4, f: 4, i: 'Δ6', r: false },
      { s: 3, f: 1, i: 'Δ7', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 3, f: 4, i: 'Δ2', r: false },
      { s: 2, f: 2, i: 'Δ3', r: false },
      { s: 2, f: 3, i: 'p4', r: false },
      { s: 2, f: 5, i: 'p5', r: false },
      { s: 1, f: 2, i: 'Δ6', r: false },
      { s: 1, f: 4, i: 'Δ7', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
  },
  E: {
    chord: [
      [
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 3, i: 'Δ3', r: false },
        { s: 2, f: 2, i: 'p5', r: false },
        { s: 1, f: 1, i: 'Δ7', r: false },
      ],
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 4, i: 'p5', r: false },
        { s: 4, f: 3, i: 'Δ7', r: false },
        { s: 3, f: 3, i: 'Δ3', r: false },
        { s: 2, f: 2, i: 'p5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
      [
        { s: 4, f: 3, i: 'Δ7', r: false },
        { s: 3, f: 3, i: 'Δ3', r: false },
        { s: 2, f: 2, i: 'p5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 1, i: 'Δ7', r: false },
      { s: 6, f: 2, i: 'R', r: true },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 3, i: 'Δ7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 1, f: 1, i: 'Δ7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 4, i: 'Δ2', r: false },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 1, i: 'Δ6', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ2', r: false },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 4, i: 'Δ6', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ2', r: false },
    ],
    scale: [
      { s: 6, f: 1, i: 'Δ7', r: false },
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 4, i: 'Δ2', r: false },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 5, f: 2, i: 'p4', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 1, i: 'Δ6', r: false },
      { s: 4, f: 3, i: 'Δ7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ2', r: false },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 3, f: 4, i: 'p4', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 4, i: 'Δ6', r: false },
      { s: 1, f: 1, i: 'Δ7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ2', r: false },
    ],
  },
  D: {
    chord: [
      { s: 4, f: 2, i: 'R', r: true },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 4, i: 'Δ7', r: false },
      { s: 1, f: 4, i: 'Δ3', r: false },
    ],
    arpeggio: [
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 4, f: 1, i: 'Δ7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 4, i: 'Δ7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'Δ2', r: false },
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 4, i: 'Δ6', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ2', r: false },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 2, i: 'Δ6', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ2', r: false },
      { s: 1, f: 4, i: 'Δ3', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ2', r: false },
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 6, f: 5, i: 'p4', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 4, i: 'Δ6', r: false },
      { s: 4, f: 1, i: 'Δ7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ2', r: false },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 2, i: 'p4', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 2, i: 'Δ6', r: false },
      { s: 2, f: 4, i: 'Δ7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ2', r: false },
      { s: 1, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
  },
}, 'Maj7 Shell': {
  C: { chord: [
    { s: 5, f: 5, i: 'R', r: true },
    { s: 4, f: 4, i: 'Δ3', r: false },
    { s: 2, f: 2, i: 'Δ7', r: false },
  ] },
  A: { chord: [
    [
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 3, i: 'Δ7', r: false },
    ],
    [
      { s: 5, f: 2, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ7', r: false },
      { s: 2, f: 4, i: 'Δ3', r: false },
    ],
  ] },
  G: { chord: [
    [
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ3', r: false },
      { s: 3, f: 1, i: 'Δ7', r: false },
    ],
    [
      { s: 3, f: 2, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 4, i: 'Δ7', r: false },
    ],
  ] },
  E: { chord: [
    [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 3, i: 'Δ7', r: false },
    ],
    [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 4, f: 3, i: 'Δ7', r: false },
      { s: 3, f: 3, i: 'Δ3', r: false },
    ],
    [
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 1, f: 1, i: 'Δ7', r: false },
    ],
  ] },
  D: { chord: [
    [
      { s: 4, f: 2, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 2, f: 4, i: 'Δ7', r: false },
    ],
    [
      { s: 4, f: 2, i: 'R', r: true },
      { s: 2, f: 4, i: 'Δ7', r: false },
      { s: 1, f: 4, i: 'Δ3', r: false },
    ],
  ] },
}, Min7: {
  C: {
    chord: [
      [
        { s: 5, f: 3, i: '♭7', r: false },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
      ],
      [
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 5, i: '♭7', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 1, f: 5, i: 'p5', r: false },
      ],
      [
        { s: 6, f: 5, i: 'p5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 5, i: '♭7', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 3, i: '♭7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 3, i: '♭3', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 5, i: '♭7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 6, i: '♭3', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
    pentatonic: [
      { s: 6, f: 3, i: 'p4', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 3, i: '♭7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 3, i: '♭3', r: false },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 5, i: '♭7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 6, i: '♭3', r: false },
      { s: 1, f: 3, i: 'p4', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
    scale: [
      { s: 6, f: 3, i: 'p4', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 6, f: 6, i: '♭6', r: false },
      { s: 5, f: 3, i: '♭7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 2, i: 'Δ2', r: false },
      { s: 4, f: 3, i: '♭3', r: false },
      { s: 4, f: 5, i: 'p4', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 3, i: '♭6', r: false },
      { s: 3, f: 5, i: '♭7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 2, f: 5, i: 'Δ2', r: false },
      { s: 2, f: 6, i: '♭3', r: false },
      { s: 1, f: 3, i: 'p4', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
      { s: 1, f: 6, i: '♭6', r: false },
    ],
  },
  A: {
    chord: [
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 2, i: '♭7', r: false },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 5, i: '♭7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 2, i: '♭7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 5, i: '♭7', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 5, i: '♭7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 2, i: 'p4', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 2, i: '♭7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 5, i: '♭7', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 3, i: '♭6', r: false },
      { s: 6, f: 5, i: '♭7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 4, i: 'Δ2', r: false },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 2, i: 'p4', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 4, f: 5, i: '♭6', r: false },
      { s: 3, f: 2, i: '♭7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 2, i: 'Δ2', r: false },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 2, f: 5, i: 'p4', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 3, i: '♭6', r: false },
      { s: 1, f: 5, i: '♭7', r: false },
    ],
  },
  G: {
    chord: [
      [
        { s: 4, f: 2, i: 'p5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
        { s: 2, f: 1, i: '♭3', r: false },
        { s: 1, f: 3, i: '♭7', r: false },
      ],
      [
        { s: 6, f: 3, i: '♭7', r: false },
        { s: 5, f: 3, i: '♭3', r: false },
        { s: 4, f: 2, i: 'p5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 3, i: '♭7', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 3, i: '♭3', r: false },
      { s: 4, f: 2, i: 'p5', r: false },
      { s: 4, f: 5, i: '♭7', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 3, f: 5, i: '♭3', r: false },
      { s: 2, f: 5, i: 'p5', r: false },
      { s: 1, f: 3, i: '♭7', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
    pentatonic: [
      { s: 6, f: 2, i: '♭7', r: false },
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 2, i: '♭3', r: false },
      { s: 5, f: 4, i: 'p4', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 4, f: 4, i: '♭7', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 3, f: 4, i: '♭3', r: false },
      { s: 2, f: 2, i: 'p4', r: false },
      { s: 2, f: 4, i: 'p5', r: false },
      { s: 1, f: 2, i: '♭7', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    scale: [
      { s: 6, f: 2, i: '♭7', r: false },
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 1, i: 'Δ2', r: false },
      { s: 5, f: 2, i: '♭3', r: false },
      { s: 5, f: 4, i: 'p4', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 4, f: 2, i: '♭6', r: false },
      { s: 4, f: 4, i: '♭7', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ2', r: false },
      { s: 3, f: 4, i: '♭3', r: false },
      { s: 2, f: 2, i: 'p4', r: false },
      { s: 2, f: 4, i: 'p5', r: false },
      { s: 2, f: 5, i: '♭6', r: false },
      { s: 1, f: 2, i: '♭7', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
  },
  E: {
    chord: [
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 4, i: 'p5', r: false },
        { s: 4, f: 2, i: '♭7', r: false },
        { s: 3, f: 2, i: '♭3', r: false },
        { s: 2, f: 2, i: 'p5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
      [
        { s: 4, f: 2, i: '♭7', r: false },
        { s: 3, f: 2, i: '♭3', r: false },
        { s: 2, f: 2, i: 'p5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 2, i: '♭7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 5, i: '♭7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 2, i: 'p4', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 2, i: '♭7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 3, f: 4, i: 'p4', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 5, i: '♭7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 4, i: 'Δ2', r: false },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 2, i: 'p4', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 5, f: 5, i: '♭6', r: false },
      { s: 4, f: 2, i: '♭7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ2', r: false },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 3, f: 4, i: 'p4', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 3, i: '♭6', r: false },
      { s: 2, f: 5, i: '♭7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ2', r: false },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
  },
  D: {
    chord: [
      [
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 4, i: 'p5', r: false },
        { s: 2, f: 3, i: '♭7', r: false },
        { s: 1, f: 3, i: '♭3', r: false },
      ],
      [
        { s: 6, f: 2, i: '♭3', r: false },
        { s: 5, f: 4, i: '♭7', r: false },
        { s: 4, f: 1, i: 'R', r: true },
        { s: 3, f: 3, i: 'p5', r: false },
      ],
      [
        { s: 6, f: 3, i: '♭3', r: false },
        { s: 5, f: 2, i: 'p5', r: false },
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 4, i: 'p5', r: false },
        { s: 2, f: 3, i: '♭7', r: false },
      ],
      [
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 4, i: 'p5', r: false },
        { s: 2, f: 5, i: 'R', r: true },
        { s: 1, f: 3, i: '♭3', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 5, i: '♭7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 3, i: '♭7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 3, i: '♭3', r: false },
    ],
    pentatonic: [
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 6, f: 5, i: 'p4', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 5, i: '♭7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 2, i: 'p4', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 3, i: '♭7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 3, i: '♭3', r: false },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
    scale: [
      { s: 6, f: 2, i: 'Δ2', r: false },
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 6, f: 5, i: 'p4', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 3, i: '♭6', r: false },
      { s: 5, f: 5, i: '♭7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ2', r: false },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 2, i: 'p4', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 3, f: 5, i: '♭6', r: false },
      { s: 2, f: 3, i: '♭7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ2', r: false },
      { s: 1, f: 3, i: '♭3', r: false },
      { s: 1, f: 5, i: 'p4', r: false },
    ],
  },
}, Dom7: {
  C: {
    chord: [
      [
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 1, i: '♭7', r: false },
      ],
      [
        { s: 5, f: 3, i: '♭7', r: false },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
      ],
      [
        { s: 6, f: 5, i: 'p5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 5, i: '♭7', r: false },
      ],
      [
        { s: 6, f: 2, i: 'Δ3', r: false },
        { s: 5, f: 3, i: '♭7', r: false },
        { s: 4, f: 4, i: 'Δ3', r: false },
        { s: 3, f: 2, i: 'p5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 1, f: 2, i: 'Δ3', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'Δ3', r: false },
      { s: 6, f: 5, i: 'p5', r: false },
      { s: 5, f: 3, i: '♭7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 4, i: 'Δ3', r: false },
      { s: 3, f: 2, i: 'p5', r: false },
      { s: 3, f: 5, i: '♭7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 1, f: 2, i: 'Δ3', r: false },
      { s: 1, f: 5, i: 'p5', r: false },
    ],
    pentatonic: [], scale: [],
  },
  A: {
    chord: [
      [
        { s: 5, f: 2, i: 'R', r: true },
        { s: 4, f: 4, i: 'p5', r: false },
        { s: 3, f: 2, i: '♭7', r: false },
        { s: 2, f: 4, i: 'Δ3', r: false },
        { s: 1, f: 2, i: 'p5', r: false },
      ],
      [
        { s: 6, f: 2, i: 'p5', r: false },
        { s: 5, f: 2, i: 'R', r: true },
        { s: 4, f: 4, i: 'p5', r: false },
        { s: 3, f: 2, i: '♭7', r: false },
        { s: 2, f: 4, i: 'Δ3', r: false },
        { s: 1, f: 2, i: 'p5', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'p5', r: false },
      { s: 6, f: 5, i: '♭7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 4, f: 1, i: 'Δ3', r: false },
      { s: 4, f: 4, i: 'p5', r: false },
      { s: 3, f: 2, i: '♭7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 4, i: 'Δ3', r: false },
      { s: 1, f: 2, i: 'p5', r: false },
      { s: 1, f: 5, i: '♭7', r: false },
    ],
    pentatonic: [], scale: [],
  },
  G: {
    chord: [
      [
        { s: 6, f: 2, i: '♭7', r: false },
        { s: 5, f: 3, i: 'Δ3', r: false },
        { s: 4, f: 1, i: 'p5', r: false },
        { s: 3, f: 1, i: 'R', r: true },
        { s: 2, f: 1, i: 'Δ3', r: false },
      ],
      [
        { s: 4, f: 1, i: 'p5', r: false },
        { s: 3, f: 1, i: 'R', r: true },
        { s: 2, f: 1, i: 'Δ3', r: false },
        { s: 1, f: 2, i: '♭7', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: '♭7', r: false },
      { s: 6, f: 4, i: 'R', r: true },
      { s: 5, f: 3, i: 'Δ3', r: false },
      { s: 4, f: 1, i: 'p5', r: false },
      { s: 4, f: 4, i: '♭7', r: false },
      { s: 3, f: 1, i: 'R', r: true },
      { s: 2, f: 1, i: 'Δ3', r: false },
      { s: 2, f: 4, i: 'p5', r: false },
      { s: 1, f: 2, i: '♭7', r: false },
      { s: 1, f: 4, i: 'R', r: true },
    ],
    pentatonic: [], scale: [],
  },
  E: {
    chord: [
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 4, i: 'p5', r: false },
        { s: 4, f: 2, i: '♭7', r: false },
        { s: 3, f: 3, i: 'Δ3', r: false },
      ],
      [
        { s: 4, f: 2, i: '♭7', r: false },
        { s: 3, f: 3, i: 'Δ3', r: false },
        { s: 2, f: 2, i: 'p5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 4, i: 'p5', r: false },
        { s: 4, f: 2, i: '♭7', r: false },
        { s: 3, f: 3, i: 'Δ3', r: false },
        { s: 2, f: 2, i: 'p5', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 5, f: 1, i: 'Δ3', r: false },
      { s: 5, f: 4, i: 'p5', r: false },
      { s: 4, f: 2, i: '♭7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 3, i: 'Δ3', r: false },
      { s: 2, f: 2, i: 'p5', r: false },
      { s: 2, f: 5, i: '♭7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
    ],
    pentatonic: [], scale: [],
  },
  D: {
    chord: [
      [
        { s: 5, f: 2, i: 'p5', r: false },
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 4, i: 'p5', r: false },
        { s: 2, f: 3, i: '♭7', r: false },
        { s: 1, f: 4, i: 'Δ3', r: false },
      ],
      [
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 4, i: 'p5', r: false },
        { s: 2, f: 3, i: '♭7', r: false },
        { s: 1, f: 4, i: 'Δ3', r: false },
      ],
      [
        { s: 5, f: 2, i: 'p5', r: false },
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 1, i: 'Δ3', r: false },
        { s: 2, f: 3, i: '♭7', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 4, i: 'Δ3', r: false },
      { s: 5, f: 2, i: 'p5', r: false },
      { s: 5, f: 5, i: '♭7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 3, f: 1, i: 'Δ3', r: false },
      { s: 3, f: 4, i: 'p5', r: false },
      { s: 2, f: 3, i: '♭7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 4, i: 'Δ3', r: false },
    ],
    pentatonic: [], scale: [],
  },
}, 'Min7♭5': {
  C: {
    chord: [
      [
        { s: 5, f: 3, i: '♭7', r: false },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 5, i: '♭7', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 1, f: 4, i: '♭5', r: false },
      ],
      [
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 5, i: '♭7', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 1, f: 4, i: '♭5', r: false },
      ],
      [
        { s: 6, f: 4, i: '♭5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 5, i: '♭7', r: false },
      ],
    ],
    arpeggio: [
      [
        { s: 6, f: 1, i: '♭3', r: false },
        { s: 6, f: 4, i: '♭5', r: false },
        { s: 5, f: 3, i: '♭7', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 1, i: '♭5', r: false },
        { s: 2, f: 1, i: '♭7', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 1, f: 1, i: '♭3', r: false },
        { s: 1, f: 4, i: '♭5', r: false },
      ],
      [
        { s: 6, f: 4, i: '♭5', r: false },
        { s: 5, f: 3, i: '♭7', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 4, f: 6, i: '♭5', r: false },
        { s: 3, f: 5, i: '♭7', r: false },
        { s: 2, f: 3, i: 'R', r: true },
        { s: 2, f: 6, i: '♭3', r: false },
        { s: 1, f: 4, i: '♭5', r: false },
      ],
    ],
    pentatonic: [], scale: [],
  },
  A: {
    chord: [
      [
        { s: 6, f: 5, i: '♭7', r: false },
        { s: 5, f: 5, i: '♭3', r: false },
        { s: 4, f: 3, i: '♭5', r: false },
        { s: 3, f: 4, i: 'R', r: true },
      ],
      [
        { s: 5, f: 2, i: 'R', r: true },
        { s: 4, f: 3, i: '♭5', r: false },
        { s: 3, f: 2, i: '♭7', r: false },
        { s: 2, f: 3, i: '♭3', r: false },
      ],
      [
        { s: 5, f: 5, i: '♭3', r: false },
        { s: 4, f: 3, i: '♭5', r: false },
        { s: 3, f: 4, i: 'R', r: true },
        { s: 2, f: 3, i: '♭3', r: false },
        { s: 1, f: 5, i: '♭7', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 1, i: '♭5', r: false },
      { s: 6, f: 5, i: '♭7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 3, i: '♭5', r: false },
      { s: 3, f: 2, i: '♭7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 1, f: 1, i: '♭5', r: false },
      { s: 1, f: 5, i: '♭7', r: false },
    ],
    pentatonic: [], scale: [],
  },
  G: {
    chord: [
      [
        { s: 4, f: 4, i: '♭7', r: false },
        { s: 3, f: 4, i: '♭3', r: false },
        { s: 2, f: 3, i: '♭5', r: false },
        { s: 1, f: 4, i: 'R', r: true },
      ],
      [
        { s: 5, f: 3, i: '♭3', r: false },
        { s: 4, f: 1, i: '♭5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
        { s: 2, f: 1, i: '♭3', r: false },
        { s: 1, f: 3, i: '♭7', r: false },
      ],
      [
        { s: 6, f: 3, i: '♭7', r: false },
        { s: 5, f: 3, i: '♭3', r: false },
        { s: 4, f: 1, i: '♭5', r: false },
        { s: 3, f: 2, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 3, i: '♭7', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 3, i: '♭3', r: false },
      { s: 4, f: 1, i: '♭5', r: false },
      { s: 4, f: 5, i: '♭7', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 2, f: 1, i: '♭3', r: false },
      { s: 2, f: 4, i: '♭5', r: false },
      { s: 1, f: 3, i: '♭7', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
    pentatonic: [], scale: [],
  },
  E: {
    chord: [
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 3, i: '♭5', r: false },
        { s: 4, f: 2, i: '♭7', r: false },
        { s: 3, f: 2, i: '♭3', r: false },
        { s: 2, f: 5, i: '♭7', r: false },
        { s: 1, f: 2, i: 'R', r: true },
      ],
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 3, i: '♭5', r: false },
        { s: 4, f: 2, i: '♭7', r: false },
        { s: 3, f: 2, i: '♭3', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 3, i: '♭5', r: false },
      { s: 4, f: 2, i: '♭7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 3, f: 5, i: '♭5', r: false },
      { s: 2, f: 5, i: '♭7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
    pentatonic: [], scale: [],
  },
  D: {
    chord: [
      [
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 3, i: '♭5', r: false },
        { s: 2, f: 3, i: '♭7', r: false },
        { s: 1, f: 3, i: '♭3', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 5, f: 1, i: '♭5', r: false },
      { s: 5, f: 5, i: '♭7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 3, i: '♭5', r: false },
      { s: 2, f: 3, i: '♭7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 3, i: '♭3', r: false },
    ],
    pentatonic: [], scale: [],
  },
}, Dim7: {
  C: {
    chord: [
      [
        { s: 5, f: 2, i: '♭♭7', r: false },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 1, i: '♭5', r: false },
        { s: 2, f: 3, i: 'R', r: true },
      ],
      [
        { s: 6, f: 4, i: '♭5', r: false },
        { s: 5, f: 5, i: 'R', r: true },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 4, i: '♭♭7', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 1, i: '♭3', r: false },
      { s: 6, f: 4, i: '♭5', r: false },
      { s: 5, f: 2, i: '♭♭7', r: false },
      { s: 5, f: 5, i: 'R', r: true },
      { s: 4, f: 3, i: '♭3', r: false },
      { s: 3, f: 1, i: '♭5', r: false },
      { s: 3, f: 4, i: '♭♭7', r: false },
      { s: 2, f: 3, i: 'R', r: true },
      { s: 1, f: 1, i: '♭3', r: false },
      { s: 1, f: 4, i: '♭5', r: false },
    ],
    pentatonic: [], scale: [],
  },
  A: {
    chord: [
      [
        { s: 5, f: 2, i: 'R', r: true },
        { s: 4, f: 3, i: '♭5', r: false },
        { s: 3, f: 1, i: '♭♭7', r: false },
        { s: 2, f: 3, i: '♭3', r: false },
      ],
      [
        { s: 4, f: 3, i: '♭5', r: false },
        { s: 3, f: 4, i: 'R', r: true },
        { s: 2, f: 3, i: '♭3', r: false },
        { s: 1, f: 4, i: '♭♭7', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 1, i: '♭5', r: false },
      { s: 6, f: 4, i: '♭♭7', r: false },
      { s: 5, f: 2, i: 'R', r: true },
      { s: 5, f: 5, i: '♭3', r: false },
      { s: 4, f: 3, i: '♭5', r: false },
      { s: 3, f: 1, i: '♭♭7', r: false },
      { s: 3, f: 4, i: 'R', r: true },
      { s: 2, f: 3, i: '♭3', r: false },
      { s: 1, f: 1, i: '♭5', r: false },
      { s: 1, f: 4, i: '♭♭7', r: false },
    ],
    pentatonic: [], scale: [],
  },
  G: {
    chord: [
      [
        { s: 5, f: 3, i: '♭3', r: false },
        { s: 4, f: 4, i: '♭♭7', r: false },
        { s: 3, f: 2, i: 'R', r: true },
        { s: 2, f: 4, i: '♭5', r: false },
      ],
      [
        { s: 4, f: 4, i: '♭♭7', r: false },
        { s: 3, f: 5, i: '♭3', r: false },
        { s: 2, f: 4, i: '♭5', r: false },
        { s: 1, f: 5, i: 'R', r: true },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: '♭♭7', r: false },
      { s: 6, f: 5, i: 'R', r: true },
      { s: 5, f: 3, i: '♭3', r: false },
      { s: 4, f: 1, i: '♭5', r: false },
      { s: 4, f: 4, i: '♭♭7', r: false },
      { s: 3, f: 2, i: 'R', r: true },
      { s: 3, f: 5, i: '♭3', r: false },
      { s: 2, f: 4, i: '♭5', r: false },
      { s: 1, f: 2, i: '♭♭7', r: false },
      { s: 1, f: 5, i: 'R', r: true },
    ],
    pentatonic: [], scale: [],
  },
  E: {
    chord: [
      [
        { s: 5, f: 3, i: '♭5', r: false },
        { s: 4, f: 4, i: 'R', r: true },
        { s: 3, f: 2, i: '♭3', r: false },
        { s: 2, f: 4, i: '♭♭7', r: false },
      ],
      [
        { s: 6, f: 2, i: 'R', r: true },
        { s: 5, f: 3, i: '♭5', r: false },
        { s: 4, f: 1, i: '♭♭7', r: false },
        { s: 3, f: 2, i: '♭3', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 2, i: 'R', r: true },
      { s: 6, f: 5, i: '♭3', r: false },
      { s: 5, f: 3, i: '♭5', r: false },
      { s: 4, f: 1, i: '♭♭7', r: false },
      { s: 4, f: 4, i: 'R', r: true },
      { s: 3, f: 2, i: '♭3', r: false },
      { s: 3, f: 5, i: '♭5', r: false },
      { s: 2, f: 4, i: '♭♭7', r: false },
      { s: 1, f: 2, i: 'R', r: true },
      { s: 1, f: 5, i: '♭3', r: false },
    ],
    pentatonic: [], scale: [],
  },
  D: {
    chord: [
      [
        { s: 5, f: 4, i: '♭♭7', r: false },
        { s: 4, f: 3, i: '♭3', r: false },
        { s: 3, f: 3, i: '♭5', r: false },
        { s: 2, f: 5, i: 'R', r: true },
      ],
      [
        { s: 6, f: 3, i: '♭3', r: false },
        { s: 5, f: 4, i: '♭♭7', r: false },
        { s: 4, f: 2, i: 'R', r: true },
        { s: 3, f: 3, i: '♭5', r: false },
      ],
    ],
    arpeggio: [
      { s: 6, f: 3, i: '♭3', r: false },
      { s: 5, f: 1, i: '♭5', r: false },
      { s: 5, f: 4, i: '♭♭7', r: false },
      { s: 4, f: 2, i: 'R', r: true },
      { s: 4, f: 5, i: '♭3', r: false },
      { s: 3, f: 3, i: '♭5', r: false },
      { s: 2, f: 2, i: '♭♭7', r: false },
      { s: 2, f: 5, i: 'R', r: true },
      { s: 1, f: 3, i: '♭3', r: false },
    ],
    pentatonic: [], scale: [],
  },
}};

const MASTERY_ITEMS = [
  'All 5 triad types (maj, min, dim, aug, sus) — every inversion — every string set — named correctly',
  'All 5 seventh chord types (Maj7, Dom7, min7, min7b5, dim7) — every inversion — every string set',
  'Shell voicings (3rd + 7th only) — instantly locatable on any string pair',
  'Triad arpeggios connected continuously across full neck — no boxes, no pausing',
  'Seventh arpeggios connected across full neck via CAGED positions',
  'Diatonic I–vii° sequence — triads and 7ths — played cleanly in at least 3 positions',
  'ii–V–I arpeggio sequence — connected, from 3 different starting positions on the neck',
  'Can name every note in real time while playing — no hesitations anywhere on the neck',
  'Can locate any chord shape or arpeggio anywhere on neck within 5 seconds from cold',
];

function FretboardDiagram({ dots }) {
  const W = 160, H = 190;
  const padL = 14, padR = 14, padT = 14, padB = 10;
  const stringGap = (W - padL - padR) / 5;
  const fretGap = (H - padT - padB) / 6;
  // String X: string 6 (low E) on left, string 1 (high E) on right
  const stringX = (s) => padL + (6 - s) * stringGap;
  // Fret line Y: line 1 (nut) at top, line 7 at bottom
  const fretLineY = (line) => padT + (line - 1) * fretGap;
  // Dot Y: centered in the fret space (fret 1 = between line 1 and line 2)
  const dotY = (f) => (fretLineY(f) + fretLineY(f + 1)) / 2;
  const dotR = 11;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }}>
      {/* Fret lines (horizontal) — line 1 is the nut */}
      {[1,2,3,4,5,6,7].map(line => (
        <line key={`f${line}`}
          x1={padL} y1={fretLineY(line)} x2={W - padR} y2={fretLineY(line)}
          stroke={line === 1 ? '#333' : '#bbb'} strokeWidth={line === 1 ? 3 : 1} />
      ))}
      {/* String lines (vertical) — thicker for lower strings */}
      {[1,2,3,4,5,6].map(s => (
        <line key={`s${s}`}
          x1={stringX(s)} y1={padT} x2={stringX(s)} y2={H - padB}
          stroke="#999" strokeWidth={0.5 + (s - 1) * 0.22} />
      ))}
      {/* Fret markers (between strings 3 and 4) */}
      {[3, 5].map(f => (
        <circle key={`m${f}`}
          cx={(stringX(4) + stringX(3)) / 2} cy={dotY(f)}
          r={3.5} fill="#ddd" />
      ))}
      {/* Note dots */}
      {dots.map((d, idx) => {
        const cx = stringX(d.s);
        const cy = dotY(d.f);
        return (
          <g key={idx}>
            <circle cx={cx} cy={cy} r={dotR}
              fill={d.r ? '#e8922d' : '#333'}
              stroke={d.r ? '#d4831f' : '#222'}
              strokeWidth={1} />
            <text x={cx} y={cy + 3.5} textAnchor="middle"
              fill="#fff"
              fontSize={9.5} fontFamily="'DM Mono', monospace" fontWeight={600}>
              {d.i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Circle of Fifths: clockwise from top = C, G, D, A, E, B, Gb, Db, Ab, Eb, Bb, F
// Modes: parallel modes built on the same root
const MODES = [
  { name: 'Ionian',     semitones: [0,2,4,5,7,9,11], numeral: ['I','ii','iii','IV','V','vi','vii°'] },
  { name: 'Dorian',     semitones: [0,2,3,5,7,9,10], numeral: ['i','ii','♭III','IV','v','vi°','♭VII'] },
  { name: 'Phrygian',   semitones: [0,1,3,5,7,8,10], numeral: ['i','♭II','♭III','iv','v°','♭VI','♭vii'] },
  { name: 'Lydian',     semitones: [0,2,4,6,7,9,11], numeral: ['I','II','iii','♯iv°','V','vi','vii'] },
  { name: 'Mixolydian', semitones: [0,2,4,5,7,9,10], numeral: ['I','ii','iii°','IV','v','vi','♭VII'] },
  { name: 'Aeolian',    semitones: [0,2,3,5,7,8,10], numeral: ['i','ii°','♭III','iv','v','♭VI','♭VII'] },
  { name: 'Locrian',    semitones: [0,1,3,5,6,8,10], numeral: ['i°','♭II','♭iii','iv','♭V','♭VI','♭vii'] },
];

function getModalChords(rootKey, use7ths = false, useFlats = false) {
  // Normalize root to chromatic index
  const normKey = rootKey.length > 1 && rootKey[1] === 'b' ? rootKey[0] + '♭' : rootKey;
  const rootC = noteToChromatic(normKey);
  if (rootC < 0) return [];

  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;

  // Get Ionian chords for comparison (to mark borrowed chords)
  const ionianChords = new Set();

  return MODES.map((mode, mi) => {
    const scaleNotes = mode.semitones.map(s => noteSet[(rootC + s) % 12]);
    const chords = [];
    for (let d = 0; d < 7; d++) {
      const root = scaleNotes[d];
      const rootSemi = mode.semitones[d];
      const thirdSemi = mode.semitones[(d + 2) % 7];
      const fifthSemi = mode.semitones[(d + 4) % 7];
      const i3 = ((thirdSemi - rootSemi) + 12) % 12;
      const i5 = ((fifthSemi - rootSemi) + 12) % 12;

      if (!use7ths) {
        // Triads
        let quality, suffix;
        if (i3 === 4 && i5 === 7) { quality = 'maj'; suffix = ''; }
        else if (i3 === 3 && i5 === 7) { quality = 'min'; suffix = 'm'; }
        else if (i3 === 3 && i5 === 6) { quality = 'dim'; suffix = '°'; }
        else if (i3 === 4 && i5 === 8) { quality = 'aug'; suffix = '+'; }
        else { quality = 'maj'; suffix = ''; }
        const chordName = root + suffix;
        if (mi === 0) ionianChords.add(chordName);
        chords.push({ root, chordName, quality, numeral: mode.numeral[d] });
      } else {
        // 7th chords
        const seventhSemi = mode.semitones[(d + 6) % 7];
        const i7 = ((seventhSemi - rootSemi) + 12) % 12;
        let quality, suffix;
        if (i3 === 4 && i5 === 7 && i7 === 11) { quality = 'maj7'; suffix = 'maj7'; }
        else if (i3 === 3 && i5 === 7 && i7 === 10) { quality = 'min7'; suffix = 'm7'; }
        else if (i3 === 4 && i5 === 7 && i7 === 10) { quality = 'dom7'; suffix = '7'; }
        else if (i3 === 3 && i5 === 6 && i7 === 10) { quality = 'm7b5'; suffix = 'm7♭5'; }
        else if (i3 === 3 && i5 === 6 && i7 === 9) { quality = 'dim7'; suffix = '°7'; }
        else if (i3 === 4 && i5 === 8 && i7 === 11) { quality = 'augmaj7'; suffix = '+maj7'; }
        else if (i3 === 3 && i5 === 7 && i7 === 11) { quality = 'mmaj7'; suffix = 'mMaj7'; }
        else if (i3 === 4 && i5 === 8 && i7 === 10) { quality = 'aug7'; suffix = '+7'; }
        else { quality = 'maj7'; suffix = 'maj7'; }
        const chordName = root + suffix;
        if (mi === 0) ionianChords.add(chordName);
        chords.push({ root, chordName, quality, numeral: mode.numeral[d] });
      }
    }
    return { ...mode, scaleNotes, chords };
  }).map(mode => ({
    ...mode,
    chords: mode.chords.map(c => ({ ...c, borrowed: !ionianChords.has(c.chordName) }))
  }));
}

// Strumming patterns: 8 eighth-note slots per bar, D=down U=up x=mute -=rest
const STRUM_SYMBOLS = ['↓','↑','x','–'];
const STRUM_PRESETS = [
  { name: 'Quarter',   pattern: ['↓','–','↓','–','↓','–','↓','–'] },
  { name: 'Folk 8ths', pattern: ['↓','↑','↓','↑','↓','↑','↓','↑'] },
  { name: 'Pop/Rock',  pattern: ['↓','–','↓','↑','–','↑','↓','↑'] },
  { name: 'Island',    pattern: ['–','↓','↑','–','↓','↑','–','↑'] },
  { name: 'Ballad',    pattern: ['↓','–','–','↑','↓','↑','–','↑'] },
];

const PROG_PRESETS = [
  { name: 'I–V–vi–IV',    degrees: [0, 4, 5, 3] },
  { name: 'I–IV–V–I',     degrees: [0, 3, 4, 0] },
  { name: 'I–vi–IV–V',    degrees: [0, 5, 3, 4] },
  { name: 'ii–V–I',       degrees: [1, 4, 0] },
  { name: 'vi–IV–I–V',    degrees: [5, 3, 0, 4] },
  { name: 'I–IV–vi–V',    degrees: [0, 3, 5, 4] },
];

function ProgressionPlayer({ progression, barsPerChord = 1 }) {
  const [bpm, setBpm] = useState(80);
  const [playing, setPlaying] = useState(false);
  const [patternIdx, setPatternIdx] = useState(0);
  const [pattern, setPattern] = useState(STRUM_PRESETS[0].pattern.slice());
  const [currentSlot, setCurrentSlot] = useState(-1);
  const [currentChordIdx, setCurrentChordIdx] = useState(0);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const playClick = useCallback((isDownbeat) => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = isDownbeat ? 1000 : 700;
      gain.gain.setValueAtTime(isDownbeat ? 0.3 : 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }, [getAudioCtx]);

  const start = useCallback(() => {
    if (progression.length === 0) return;
    setPlaying(true);
    setCurrentChordIdx(0);
    setCurrentSlot(0);
    playClick(true);

    let slotCount = 0;
    const totalSlots = barsPerChord * 8; // 8 eighth notes per bar

    if (timerRef.current) clearInterval(timerRef.current);
    // Eighth note interval = (60/bpm)/2 seconds
    timerRef.current = setInterval(() => {
      slotCount++;
      const slotInBar = slotCount % 8;
      const isDownbeat = slotInBar === 0;
      const isQuarter = slotInBar % 2 === 0;
      if (isQuarter) playClick(isDownbeat);
      setCurrentSlot(slotInBar);

      // Change chord after barsPerChord bars
      if (slotCount % totalSlots === 0) {
        setCurrentChordIdx(prev => (prev + 1) % progression.length);
      }
    }, ((60 / bpm) / 2) * 1000);
  }, [bpm, progression, barsPerChord, playClick]);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCurrentSlot(-1);
    setCurrentChordIdx(0);
  }, []);

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);
  useEffect(() => { if (playing) stop(); }, [progression.length]);

  const cycleSlot = (idx) => {
    if (playing) return;
    setPattern(prev => {
      const next = [...prev];
      const curSymIdx = STRUM_SYMBOLS.indexOf(next[idx]);
      next[idx] = STRUM_SYMBOLS[(curSymIdx + 1) % STRUM_SYMBOLS.length];
      return next;
    });
    setPatternIdx(-1); // custom
  };

  const selectPreset = (pi) => {
    if (playing) return;
    setPatternIdx(pi);
    setPattern(STRUM_PRESETS[pi].pattern.slice());
  };

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
        <span className="player-label">Pattern</span>
        {STRUM_PRESETS.map((p, pi) => (
          <button key={pi} className={`prog-pattern-chip ${patternIdx === pi ? 'active' : ''}`}
            onClick={() => selectPreset(pi)}>{p.name}</button>
        ))}
        {patternIdx === -1 && <span style={{ fontSize: 11, color: '#c9963a', marginLeft: 4 }}>Custom</span>}
      </div>
      <div className="prog-grid">
        {pattern.map((s, i) => (
          <div key={i}
            className={`prog-grid-slot ${currentSlot === i ? 'lit' : i % 2 === 0 ? 'beat' : ''}`}
            onClick={() => cycleSlot(i)}>
            {s}
          </div>
        ))}
      </div>
      <div className="prog-controls">
        <div className="player-section">
          <span className="player-label">BPM</span>
          <input className="player-bpm" type="number" min={20} max={300} value={bpm}
            onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setBpm(v); }}
            disabled={playing} />
        </div>
        <div className="player-section">
          {!playing
            ? <button className="player-btn start" onClick={start} disabled={progression.length === 0}>▶ Start</button>
            : <button className="player-btn stop" onClick={stop}>■ Stop</button>
          }
        </div>
        {playing && progression.length > 0 && (() => {
          const cur = progression[currentChordIdx];
          if (!cur) return null;
          const isObj = typeof cur === 'object';
          const label = isObj ? (CHROMATIC[cur.rootIdx] + cur.suffix) : cur;
          const modeLabel = isObj ? (CHROMATIC[cur.rootIdx] + ' ' + MODE_NAMES[cur.modeIdx]) : '';
          return (<>
            <span className="prog-current">{label}</span>
            {isObj && <span style={{ fontSize: 13, color: '#c9963a', marginLeft: 4 }}>{modeLabel}</span>}
          </>);
        })()}
        {playing && progression.length > 1 && (() => {
          const nxt = progression[(currentChordIdx + 1) % progression.length];
          if (!nxt) return null;
          const isObj = typeof nxt === 'object';
          const label = isObj ? (CHROMATIC[nxt.rootIdx] + nxt.suffix) : nxt;
          return (
            <span style={{ fontSize: 13, color: '#999' }}>
              next: {label}
            </span>
          );
        })()}
      </div>
    </div>
  );
}

// CAGED Modes matrix: for any root, find the parent major key for each mode
const MODE_NAMES = ['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian'];
const MODE_QUALITY = ['maj','min','min','maj','maj','min','dim'];
// Semitones from parent key root to mode root
const MODE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];
// CAGED shape that each degree falls on (relative to parent key)
const MODE_CAGED = ['C','A','G','E','D','C','A'];

function getCagedModesForRoot(rootKey, useFlats = false) {
  const normKey = rootKey.length > 1 && rootKey[1] === 'b' ? rootKey[0] + '♭' : rootKey;
  const rootC = noteToChromatic(normKey);
  if (rootC < 0) return [];
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  return MODE_NAMES.map((mode, i) => {
    const parentC = ((rootC - MODE_OFFSETS[i]) + 12) % 12;
    return {
      mode,
      quality: MODE_QUALITY[i],
      root: noteSet[rootC],
      parentKey: noteSet[parentC],
    };
  });
}

function getCagedFamily(parentKey, useFlats = false) {
  const normKey = parentKey.length > 1 && parentKey[1] === 'b' ? parentKey[0] + '♭' : parentKey;
  const parentC = noteToChromatic(normKey);
  if (parentC < 0) return [];
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  return MODE_NAMES.map((mode, i) => {
    const noteC = (parentC + MODE_OFFSETS[i]) % 12;
    return {
      mode,
      quality: MODE_QUALITY[i],
      note: noteSet[noteC],
      degree: ['I','II','III','IV','V','VI','VII'][i],
    };
  });
}

// 12 distinct colors for the 12 parent keys in the mode matrix
const FAMILY_COLORS = {
  0:  { bg: '#fce4cc', fg: '#8a5a2a' },  // C
  1:  { bg: '#f2dde0', fg: '#8a3a3a' },  // C#/Db
  2:  { bg: '#dde8f2', fg: '#3a5a80' },  // D
  3:  { bg: '#e8dff2', fg: '#6a3a8a' },  // D#/Eb
  4:  { bg: '#d8f0d8', fg: '#2a6a2a' },  // E
  5:  { bg: '#f0e6d0', fg: '#6a5530' },  // F
  6:  { bg: '#e0e0e0', fg: '#555' },      // F#/Gb
  7:  { bg: '#d0eaf0', fg: '#2a5a6a' },  // G
  8:  { bg: '#f0d0e8', fg: '#7a2a6a' },  // G#/Ab
  9:  { bg: '#f5f0c0', fg: '#6a6a20' },  // A
  10: { bg: '#d0f0e8', fg: '#2a6a5a' },  // A#/Bb
  11: { bg: '#e0d8f0', fg: '#4a3a7a' },  // B
};

function getModesMatrix(useFlats = false) {
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  return MODE_NAMES.map((mode, mi) => {
    const cells = noteSet.map((note, ni) => {
      // Parent key for this note in this mode
      const parentC = ((ni - MODE_OFFSETS[mi]) + 12) % 12;
      return {
        note,
        mode,
        quality: MODE_QUALITY[mi],
        parentIdx: parentC,
        parentKey: noteSet[parentC],
      };
    });
    return { mode, quality: MODE_QUALITY[mi], cells };
  });
}

// ── Harmonic Minor Modes (for Modal Interchange & CAGED Modes overlays) ──
const HM_MODES = [
  { name: 'Harmonic Minor',    semitones: [0,2,3,5,7,8,11], numeral: ['i','ii°','III+','iv','V','VI','vii°'] },
  { name: 'Locrian ♮6',        semitones: [0,1,3,5,6,9,10], numeral: ['i°','♭II','♭iii','iv','♭V','VI','♭vii'] },
  { name: 'Ionian ♯5',         semitones: [0,2,4,5,8,9,11], numeral: ['I','ii','iii','IV','♯V','vi','vii°'] },
  { name: 'Dorian ♯4',         semitones: [0,2,3,6,7,9,10], numeral: ['i','ii','♭III','♯IV','v','vi°','♭VII'] },
  { name: 'Phrygian Dominant', semitones: [0,1,4,5,7,8,10], numeral: ['I','♭II','iii°','iv','v','♭VI','♭vii'] },
  { name: 'Lydian ♯2',         semitones: [0,3,4,6,7,9,11], numeral: ['I','♯II','iii','♯iv°','V','vi','vii'] },
  { name: 'Ultra Locrian',    semitones: [0,1,3,4,6,8,9],  numeral: ['i°','♭ii','♭iii°','♭iv','♭V','♭VI','♭♭vii'] },
];

function getHmModalChords(rootKey, use7ths = false, useFlats = false) {
  const normKey = rootKey.length > 1 && rootKey[1] === 'b' ? rootKey[0] + '♭' : rootKey;
  const rootC = noteToChromatic(normKey);
  if (rootC < 0) return [];
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  const hmChords = new Set(); // chords from 1st mode (Harmonic Minor) for borrowed marking

  return HM_MODES.map((mode, mi) => {
    const scaleNotes = mode.semitones.map(s => noteSet[(rootC + s) % 12]);
    const chords = [];
    for (let d = 0; d < 7; d++) {
      const root = scaleNotes[d];
      const rootSemi = mode.semitones[d];
      const thirdSemi = mode.semitones[(d + 2) % 7];
      const fifthSemi = mode.semitones[(d + 4) % 7];
      const i3 = ((thirdSemi - rootSemi) + 12) % 12;
      const i5 = ((fifthSemi - rootSemi) + 12) % 12;

      if (!use7ths) {
        let quality, suffix;
        if (i3 === 4 && i5 === 7) { quality = 'maj'; suffix = ''; }
        else if (i3 === 3 && i5 === 7) { quality = 'min'; suffix = 'm'; }
        else if (i3 === 3 && i5 === 6) { quality = 'dim'; suffix = '°'; }
        else if (i3 === 4 && i5 === 8) { quality = 'aug'; suffix = '+'; }
        else { quality = 'maj'; suffix = ''; }
        const chordName = root + suffix;
        if (mi === 0) hmChords.add(chordName);
        chords.push({ root, chordName, quality, numeral: mode.numeral[d] });
      } else {
        const seventhSemi = mode.semitones[(d + 6) % 7];
        const i7 = ((seventhSemi - rootSemi) + 12) % 12;
        let quality, suffix;
        if (i3 === 4 && i5 === 7 && i7 === 11) { quality = 'maj7'; suffix = 'maj7'; }
        else if (i3 === 3 && i5 === 7 && i7 === 10) { quality = 'min7'; suffix = 'm7'; }
        else if (i3 === 4 && i5 === 7 && i7 === 10) { quality = 'dom7'; suffix = '7'; }
        else if (i3 === 3 && i5 === 6 && i7 === 10) { quality = 'm7b5'; suffix = 'm7♭5'; }
        else if (i3 === 3 && i5 === 6 && i7 === 9) { quality = 'dim7'; suffix = '°7'; }
        else if (i3 === 4 && i5 === 8 && i7 === 11) { quality = 'augmaj7'; suffix = '+maj7'; }
        else if (i3 === 3 && i5 === 7 && i7 === 11) { quality = 'mmaj7'; suffix = 'mMaj7'; }
        else if (i3 === 4 && i5 === 8 && i7 === 10) { quality = 'aug7'; suffix = '+7'; }
        else { quality = 'maj7'; suffix = 'maj7'; }
        const chordName = root + suffix;
        if (mi === 0) hmChords.add(chordName);
        chords.push({ root, chordName, quality, numeral: mode.numeral[d] });
      }
    }
    return { ...mode, scaleNotes, chords };
  }).map(mode => ({
    ...mode,
    chords: mode.chords.map(c => ({ ...c, borrowed: !hmChords.has(c.chordName) }))
  }));
}

function getHmCagedModesForRoot(rootKey, useFlats = false) {
  const normKey = rootKey.length > 1 && rootKey[1] === 'b' ? rootKey[0] + '♭' : rootKey;
  const rootC = noteToChromatic(normKey);
  if (rootC < 0) return [];
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  return HARM_MINOR_MODE_NAMES.map((mode, i) => {
    const parentC = ((rootC - HARM_MINOR_MODE_OFFSETS[i]) + 12) % 12;
    return {
      mode,
      quality: HARM_MINOR_MODE_QUALITY[i],
      root: noteSet[rootC],
      parentKey: noteSet[parentC],
    };
  });
}

function getHmCagedFamily(parentKey, useFlats = false) {
  const normKey = parentKey.length > 1 && parentKey[1] === 'b' ? parentKey[0] + '♭' : parentKey;
  const parentC = noteToChromatic(normKey);
  if (parentC < 0) return [];
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  return HARM_MINOR_MODE_NAMES.map((mode, i) => {
    const noteC = (parentC + HARM_MINOR_MODE_OFFSETS[i]) % 12;
    return {
      mode,
      quality: HARM_MINOR_MODE_QUALITY[i],
      note: noteSet[noteC],
      degree: ['I','II','III','IV','V','VI','VII'][i],
    };
  });
}

function getHmModesMatrix(useFlats = false) {
  const noteSet = useFlats ? CHROMATIC_FLAT : CHROMATIC;
  return HARM_MINOR_MODE_NAMES.map((mode, mi) => {
    const cells = noteSet.map((note, ni) => {
      const parentC = ((ni - HARM_MINOR_MODE_OFFSETS[mi]) + 12) % 12;
      return {
        note,
        mode,
        quality: HARM_MINOR_MODE_QUALITY[mi],
        parentIdx: parentC,
        parentKey: noteSet[parentC],
      };
    });
    return { mode, quality: HARM_MINOR_MODE_QUALITY[mi], cells };
  });
}

const COF_KEYS = ['C','G','D','A','E','B','Gb','Db','Ab','Eb','Bb','F'];
const COF_DISPLAY = { 'Gb':'G♭/F♯', 'Db':'D♭', 'Ab':'A♭', 'Eb':'E♭', 'Bb':'B♭' };

// Intervals: 13 intervals from root (unison) through octave
const INTERVALS = [
  { name: 'R',  semitones: 0,  color: '#c9963a' },
  { name: '♭2', semitones: 1,  color: '#7a6a8a' },
  { name: '2',  semitones: 2,  color: '#5b8abd' },
  { name: '♭3', semitones: 3,  color: '#4a9e8e' },
  { name: '3',  semitones: 4,  color: '#d4782f' },
  { name: '4',  semitones: 5,  color: '#6aaa5a' },
  { name: '♭5', semitones: 6,  color: '#888' },
  { name: '5',  semitones: 7,  color: '#c75454' },
  { name: '♭6', semitones: 8,  color: '#8e6bbf' },
  { name: '6',  semitones: 9,  color: '#c46a8a' },
  { name: '♭7', semitones: 10, color: '#5a7a9a' },
  { name: '7',  semitones: 11, color: '#aa8a3a' },
];

function IntervalFretboard({ currentKey, activeIntervals, showNotes }) {
  const NUM_FRETS = 15;
  const padL = 64, padR = 40, padT = 52, padB = 52;
  const fretW = 116, stringGap = 72;
  const W = padL + NUM_FRETS * fretW + padR;
  const H = padT + 5 * stringGap + padB;
  const dotR = 26;
  const sY = (si) => padT + si * stringGap;
  const fretX = (f) => padL + (f - 0.5) * fretW;
  const fretLineX = (f) => padL + f * fretW;

  // Root note in chromatic index (normalize ASCII 'b' flat to unicode '♭')
  const normalizedKey = currentKey.length > 1 && currentKey[1] === 'b' ? currentKey[0] + '♭' : currentKey;
  const rootChrom = noteToChromatic(normalizedKey);

  // Build note map: for each string/fret, what interval is it from root?
  const noteMap = [];
  for (let si = 0; si < 6; si++) {
    noteMap[si] = [];
    for (let f = 0; f <= NUM_FRETS; f++) {
      const note = fretNote(si, f);
      const noteChrom = CHROMATIC.indexOf(note);
      const semis = (noteChrom - rootChrom + 12) % 12;
      const interval = INTERVALS.find(iv => iv.semitones === semis);
      noteMap[si][f] = interval ? { ...interval, noteName: note } : null;
    }
  }

  const displayStrings = [5,4,3,2,1,0];
  const activeSet = new Set(activeIntervals);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W, minWidth: 600 }}>
      <rect x={0} y={0} width={W} height={H} rx={6} fill="#fff" />
      <line x1={fretLineX(0)} y1={padT - 4} x2={fretLineX(0)} y2={H - padB + 4} stroke="#222" strokeWidth={4} />
      {Array.from({length: NUM_FRETS}, (_, i) => i + 1).map(f => (
        <line key={`fret${f}`} x1={fretLineX(f)} y1={padT - 4} x2={fretLineX(f)} y2={H - padB + 4} stroke="#ccc" strokeWidth={1} />
      ))}
      {Array.from({length: NUM_FRETS}, (_, i) => i + 1).map(f => (
        <text key={`fn${f}`} x={fretX(f)} y={H - 4} textAnchor="middle" fontSize={18} fill="#777" fontFamily="'DM Mono', monospace">{f}</text>
      ))}
      {[3,5,7,9,15].filter(f => f <= NUM_FRETS).map(f => (
        <circle key={`marker${f}`} cx={fretX(f)} cy={H - padB + 14} r={2.5} fill="#ccc" />
      ))}
      {NUM_FRETS >= 12 && <>
        <circle cx={fretX(12) - 6} cy={H - padB + 14} r={3} fill="#c9963a" />
        <circle cx={fretX(12) + 6} cy={H - padB + 14} r={3} fill="#c9963a" />
      </>}
      {displayStrings.map((si, row) => (
        <line key={`s${si}`} x1={padL} y1={sY(row)} x2={W - padR} y2={sY(row)} stroke="#bbb" strokeWidth={0.5 + (5 - si) * 0.3} />
      ))}
      {displayStrings.map((si, row) => (
        <text key={`sl${si}`} x={padL - 14} y={sY(row) + 4} textAnchor="middle" fontSize={11} fill="#888" fontFamily="'DM Mono', monospace">
          {['E','A','D','G','B','E'][si]}
        </text>
      ))}
      {displayStrings.map((si, row) =>
        Array.from({length: NUM_FRETS + 1}, (_, f) => f).map(f => {
          const iv = noteMap[si][f];
          if (!iv) return null;
          const isActive = activeSet.has(iv.semitones);
          const isRoot = iv.semitones === 0;
          if (!isActive) {
            // Show faded if any intervals are selected
            if (activeSet.size > 0) return null;
            // Nothing selected — show all faded
            const cx2 = f === 0 ? padL : fretX(f);
            return (
              <g key={`n${si}-${f}`}>
                <circle cx={cx2} cy={sY(row)} r={dotR} fill={iv.color} opacity={0.15} />
                <text x={cx2} y={sY(row) + 4} textAnchor="middle" fill="#000" opacity={0.2} fontSize={showNotes ? 16 : 20} fontFamily="'DM Mono', monospace" fontWeight={600}>
                  {showNotes ? `${iv.name} ${iv.noteName}` : iv.name}
                </text>
              </g>
            );
          }
          const cx2 = f === 0 ? padL : fretX(f);
          const cy2 = sY(row);
          return (
            <g key={`n${si}-${f}`}>
              <circle cx={cx2} cy={cy2} r={dotR}
                fill={isRoot ? iv.color : '#fff'}
                stroke={iv.color}
                strokeWidth={isRoot ? 0 : 2} />
              <text x={cx2} y={showNotes ? cy2 - 4 : cy2 + 3.5} textAnchor="middle"
                fill={isRoot ? '#fff' : iv.color}
                fontSize={showNotes ? 16 : 20} fontFamily="'DM Mono', monospace" fontWeight={600}>
                {iv.name}
              </text>
              {showNotes && (
                <text x={cx2} y={cy2 + 12} textAnchor="middle"
                  fill={isRoot ? '#fff' : iv.color}
                  fontSize={12} fontFamily="'DM Mono', monospace" fontWeight={400} opacity={0.8}>
                  {iv.noteName}
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

function CircleOfFifths({ week }) {
  const currentKey = KEY_CYCLE[week - 1];

  const cx = 600, cy = 600, R = 500, innerR = 340, dimR = 210;
  const W = 1200, H = 1200;

  // Rotation offset: move current key to 12 o'clock
  const cofIdx = COF_KEYS.indexOf(currentKey);
  const rotOffset = cofIdx * -30 - 15; // degrees to rotate so current key is centered at 12 o'clock

  // Relative minor keys (middle ring)
  const RELATIVE_MINORS = ['Am','Em','Bm','F♯m','C♯m','G♯m','E♭m','B♭m','Fm','Cm','Gm','Dm'];
  // Diminished chords (vii° of each major key, inner ring)
  const DIMINISHED = ['B°','F♯°','C♯°','G♯°','D♯°','A♯°','F°','C°','G°','D°','A°','E°'];

  // Diatonic highlighting: 3 adjacent wedges contain all 7 diatonic chords
  // Wedge cofIdx-1: IV (major) + ii (minor)
  // Wedge cofIdx:   I (major) + vi (minor) + vii° (dim)
  // Wedge cofIdx+1: V (major) + iii (minor)
  const diatonicMajor = new Set([(cofIdx - 1 + 12) % 12, cofIdx, (cofIdx + 1) % 12]);
  const diatonicMinor = new Set([(cofIdx - 1 + 12) % 12, cofIdx, (cofIdx + 1) % 12]);
  const diatonicDim = new Set([cofIdx]);

  // Roman numeral for each ring by COF index
  const majorNumeral = { [(cofIdx - 1 + 12) % 12]: 'IV', [cofIdx]: 'I', [(cofIdx + 1) % 12]: 'V' };
  const minorNumeral = { [(cofIdx - 1 + 12) % 12]: 'ii', [cofIdx]: 'vi', [(cofIdx + 1) % 12]: 'iii' };
  const dimNumeral = { [cofIdx]: 'vii°' };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: 'calc(100vh - 160px)' }}>
      {/* Background */}
      <circle cx={cx} cy={cy} r={R + 30} fill="#fff" stroke="#e8e4dd" strokeWidth={1} />

      {/* Outer ring segments and labels (major keys) */}
      {COF_KEYS.map((key, i) => {
        const angle = (i * 30 - 90 + rotOffset) * Math.PI / 180;
        const nextAngle = ((i + 1) * 30 - 90 + rotOffset) * Math.PI / 180;
        const midAngle = ((i * 30 + 15) - 90 + rotOffset) * Math.PI / 180;

        const isCurrent = i === cofIdx;
        const isDiatonic = diatonicMajor.has(i);

        // Segment path
        const x1 = cx + innerR * Math.cos(angle);
        const y1 = cy + innerR * Math.sin(angle);
        const x2 = cx + R * Math.cos(angle);
        const y2 = cy + R * Math.sin(angle);
        const x3 = cx + R * Math.cos(nextAngle);
        const y3 = cy + R * Math.sin(nextAngle);
        const x4 = cx + innerR * Math.cos(nextAngle);
        const y4 = cy + innerR * Math.sin(nextAngle);

        const path = `M ${x1} ${y1} L ${x2} ${y2} A ${R} ${R} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;

        const fill = isCurrent ? '#c9963a' : isDiatonic ? '#f0e6d0' : '#faf9f6';
        const textColor = isCurrent ? '#fff' : isDiatonic ? '#6a5530' : '#bbb';

        const labelR = (R + innerR) / 2;
        const lx = cx + labelR * Math.cos(midAngle);
        const ly = cy + labelR * Math.sin(midAngle);
        const displayName = COF_DISPLAY[key] || key;

        return (
          <g key={key}>
            <path d={path} fill={fill} stroke="#ddd" strokeWidth={1} />
            <text x={lx} y={ly - 14} textAnchor="middle" dominantBaseline="central"
              fill={textColor} fontSize={42} fontWeight={isCurrent || isDiatonic ? 700 : 400}
              fontFamily="'Playfair Display', serif">
              {displayName}
            </text>
            {majorNumeral[i] && (
              <text x={lx} y={ly + 22} textAnchor="middle" dominantBaseline="central"
                fill={isCurrent ? '#fff' : '#a08040'} fontSize={24} fontWeight={500} opacity={0.8}
                fontFamily="'DM Mono', monospace">
                {majorNumeral[i]}
              </text>
            )}
          </g>
        );
      })}

      {/* Middle ring segments (relative minors) */}
      {RELATIVE_MINORS.map((key, i) => {
        const angle = (i * 30 - 90 + rotOffset) * Math.PI / 180;
        const nextAngle = ((i + 1) * 30 - 90 + rotOffset) * Math.PI / 180;
        const midAngle = ((i * 30 + 15) - 90 + rotOffset) * Math.PI / 180;
        const x1 = cx + dimR * Math.cos(angle);
        const y1 = cy + dimR * Math.sin(angle);
        const x2 = cx + innerR * Math.cos(angle);
        const y2 = cy + innerR * Math.sin(angle);
        const x3 = cx + innerR * Math.cos(nextAngle);
        const y3 = cy + innerR * Math.sin(nextAngle);
        const x4 = cx + dimR * Math.cos(nextAngle);
        const y4 = cy + dimR * Math.sin(nextAngle);
        const path = `M ${x1} ${y1} L ${x2} ${y2} A ${innerR} ${innerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${dimR} ${dimR} 0 0 0 ${x1} ${y1} Z`;
        const labelR = (innerR + dimR) / 2;
        const lx = cx + labelR * Math.cos(midAngle);
        const ly = cy + labelR * Math.sin(midAngle);
        const isDiatonic = diatonicMinor.has(i);
        return (
          <g key={key}>
            <path d={path} fill={isDiatonic ? '#dde8f2' : '#f5f3ef'} stroke="#ddd" strokeWidth={1} />
            <text x={lx} y={ly - 10} textAnchor="middle" dominantBaseline="central"
              fill={isDiatonic ? '#3a5a80' : '#ccc'} fontSize={30} fontWeight={isDiatonic ? 600 : 400}
              fontFamily="'DM Mono', monospace">
              {key}
            </text>
            {minorNumeral[i] && (
              <text x={lx} y={ly + 16} textAnchor="middle" dominantBaseline="central"
                fill="#3a5a80" fontSize={20} fontWeight={500} opacity={0.7}
                fontFamily="'DM Mono', monospace">
                {minorNumeral[i]}
              </text>
            )}
          </g>
        );
      })}

      {/* Inner ring segments (diminished) */}
      {DIMINISHED.map((key, i) => {
        const angle = (i * 30 - 90 + rotOffset) * Math.PI / 180;
        const nextAngle = ((i + 1) * 30 - 90 + rotOffset) * Math.PI / 180;
        const midAngle = ((i * 30 + 15) - 90 + rotOffset) * Math.PI / 180;
        const centerR = 100;
        const x1 = cx + centerR * Math.cos(angle);
        const y1 = cy + centerR * Math.sin(angle);
        const x2 = cx + dimR * Math.cos(angle);
        const y2 = cy + dimR * Math.sin(angle);
        const x3 = cx + dimR * Math.cos(nextAngle);
        const y3 = cy + dimR * Math.sin(nextAngle);
        const x4 = cx + centerR * Math.cos(nextAngle);
        const y4 = cy + centerR * Math.sin(nextAngle);
        const path = `M ${x1} ${y1} L ${x2} ${y2} A ${dimR} ${dimR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${centerR} ${centerR} 0 0 0 ${x1} ${y1} Z`;
        const labelR = (dimR + centerR) / 2;
        const lx = cx + labelR * Math.cos(midAngle);
        const ly = cy + labelR * Math.sin(midAngle);
        const isDiatonic = diatonicDim.has(i);
        return (
          <g key={key}>
            <path d={path} fill={isDiatonic ? '#f2dde0' : '#edebe6'} stroke="#ddd" strokeWidth={1} />
            <text x={lx} y={ly - 6} textAnchor="middle" dominantBaseline="central"
              fill={isDiatonic ? '#8a3a3a' : '#ccc'} fontSize={24} fontWeight={isDiatonic ? 600 : 400}
              fontFamily="'DM Mono', monospace">
              {key}
            </text>
            {dimNumeral[i] && (
              <text x={lx} y={ly + 12} textAnchor="middle" dominantBaseline="central"
                fill="#8a3a3a" fontSize={17} fontWeight={500} opacity={0.7}
                fontFamily="'DM Mono', monospace">
                {dimNumeral[i]}
              </text>
            )}
          </g>
        );
      })}

      {/* Center circle */}
      <circle cx={cx} cy={cy} r={100} fill="#fff" stroke="#ddd" strokeWidth={1} />

      {/* Arrow showing direction of fourths (counterclockwise) */}
      {(() => {
        const arrowR = R + 18;
        const startA = (-90 + 340 + rotOffset) * Math.PI / 180;
        const endA = (-90 + 200 + rotOffset) * Math.PI / 180;
        const sx = cx + arrowR * Math.cos(startA);
        const sy = cy + arrowR * Math.sin(startA);
        const ex = cx + arrowR * Math.cos(endA);
        const ey = cy + arrowR * Math.sin(endA);
        return (
          <path d={`M ${sx} ${sy} A ${arrowR} ${arrowR} 0 0 0 ${ex} ${ey}`}
            fill="none" stroke="#ccc" strokeWidth={1.5} strokeDasharray="4 3"
            markerEnd="url(#arrowCof)" />
        );
      })()}
      <defs>
        <marker id="arrowCof" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ccc" />
        </marker>
      </defs>
    </svg>
  );
}

export default function App() {
  const [week, setWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(0);
  const [openBlocks, setOpenBlocks] = useState({});
  const [done, setDone] = useState({});
  const [mastery, setMastery] = useState({});
  const [showCaged, setShowCaged] = useState(false);
  const [cagedQuality, setCagedQuality] = useState('Major');
  const [variantSel, setVariantSel] = useState({});
  const [showDiatonic, setShowDiatonic] = useState(false);
  const [diatonicHighlight, setDiatonicHighlight] = useState([]);
  const [diatonicShowNotes, setDiatonicShowNotes] = useState(false);
  const [showDiatonic7, setShowDiatonic7] = useState(false);
  const [diatonic7Highlight, setDiatonic7Highlight] = useState([]);
  const [diatonic7ShowNotes, setDiatonic7ShowNotes] = useState(false);
  const [showCof, setShowCof] = useState(false);
  const [showIntervals, setShowIntervals] = useState(false);
  const [activeIntervals, setActiveIntervals] = useState([0]); // Root always starts selected
  const [intervalShowNotes, setIntervalShowNotes] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [showCagedModes, setShowCagedModes] = useState(false);
  const [cagedModesFlats, setCagedModesFlats] = useState(false);
  const [modes7ths, setModes7ths] = useState(false);
  const [modesFlats, setModesFlats] = useState(false);
  const [progChords, setProgChords] = useState([]);
  const [progBarsPerChord, setProgBarsPerChord] = useState(1);
  const [practiceTrack, setPracticeTrack] = useState('major'); // 'major' or 'harmonic-minor'

  const currentKey = KEY_CYCLE[week - 1];
  const nextKey = KEY_CYCLE[week % KEY_CYCLE.length];
  const activeSchedule = practiceTrack === 'major' ? SCHEDULE : SCHEDULE_HARM_MINOR;
  const day = activeSchedule[selectedDay];

  const toggleBlock = (id) => setOpenBlocks(p => ({ ...p, [id]: !p[id] }));
  const toggleTask = (id) => setDone(p => ({ ...p, [id]: !p[id] }));
  const toggleMastery = (key, idx) => setMastery(p => ({
    ...p, [key]: { ...(p[key] || {}), [idx]: !(p[key] || {})[idx] }
  }));

  const dayProgress = (dayIdx) => {
    const tasks = activeSchedule[dayIdx].blocks.flatMap(b => b.tasks);
    const completed = tasks.filter(t => done[t.id]).length;
    return tasks.length ? (completed / tasks.length) * 100 : 0;
  };

  const masteryCount = (key) => !mastery[key] ? 0 : Object.values(mastery[key]).filter(Boolean).length;
  const allBlocksDone = (block) => block.tasks.every(t => done[t.id]);

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <div className="header">
          <div className="header-eyebrow">Guitar Fretboard Mastery</div>
          <div className="header-title">Weekly Practice System</div>
          <div className="header-sub">Cycle of Fourths · 12 Keys · 90 min/day · 6 Days/Week</div>
        </div>

        <div className="key-section">
          <div className="key-section-label">Key Rotation — Cycle of Fourths</div>
          <div className="key-cycle">
            {KEY_CYCLE.map((k, i) => (
              <div key={k} className={`key-pill ${i+1===week?'active':i+1<week?'done':''}`} onClick={() => setWeek(i+1)} title={`Week ${i+1}`}>{k}</div>
            ))}
          </div>
          <div className="track-toggle" style={{ display: 'flex', gap: 4, margin: '12px 0', padding: 3, borderRadius: 10, background: 'rgba(201,169,110,0.1)', alignSelf: 'center' }}>
            <button
              onClick={() => setPracticeTrack('major')}
              style={{
                padding: '7px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none', borderRadius: 7,
                background: practiceTrack === 'major' ? 'rgba(201,169,110,0.25)' : 'transparent',
                color: practiceTrack === 'major' ? '#c9a96e' : '#7a7570',
                transition: 'all 0.25s ease',
                letterSpacing: '0.02em',
              }}
            >Major Modes</button>
            <button
              onClick={() => setPracticeTrack('harmonic-minor')}
              style={{
                padding: '7px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none', borderRadius: 7,
                background: practiceTrack === 'harmonic-minor' ? 'rgba(201,169,110,0.25)' : 'transparent',
                color: practiceTrack === 'harmonic-minor' ? '#c9a96e' : '#7a7570',
                transition: 'all 0.25s ease',
                letterSpacing: '0.02em',
              }}
            >Harmonic Minor</button>
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
              <span className="week-meta-val" style={{color:'#8e6bbf',fontSize:18}}>{SCALES[currentKey] ? SCALES[currentKey][5] + 'm' : ''}</span>
            </div>
            <div className="week-meta-item">
              <span className="week-meta-label">Next Key</span>
              <span className="week-meta-val" style={{color:'#635e58',fontSize:18}}>{nextKey}</span>
            </div>
            <div className="week-nav">
              <button onClick={() => setWeek(w => Math.max(1,w-1))} disabled={week===1}>← Prev</button>
              <button onClick={() => setWeek(w => Math.min(12,w+1))} disabled={week===12}>Next →</button>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button className="caged-btn" onClick={() => setShowCaged(true)}>
              CAGED Shapes ▸
            </button>
            <button className="caged-btn" onClick={() => { setShowDiatonic(true); setDiatonicHighlight([]); }}>
              Diatonic Triads ▸
            </button>
            <button className="caged-btn" onClick={() => { setShowDiatonic7(true); setDiatonic7Highlight([]); }}>
              Diatonic 7ths ▸
            </button>
            <button className="caged-btn" onClick={() => setShowCof(true)}>
              Circle of 5ths ▸
            </button>
            <button className="caged-btn" onClick={() => { setShowIntervals(true); setActiveIntervals([0]); }}>
              Intervals ▸
            </button>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
            <button className="caged-btn" onClick={() => setShowModes(true)}>
              Modes ▸
            </button>
            <button className="caged-btn" onClick={() => setShowCagedModes(true)}>
              CAGED Modes ▸
            </button>
          </div>
        </div>

        <div className="theory-section">
          <div className="theory-header">
            <div className="theory-title">{practiceTrack === 'major' ? 'Diatonic Triads' : 'Harmonic Minor Triads'}</div>
            <div className="theory-key-badge">{currentKey} {practiceTrack === 'major' ? 'Major' : 'Harmonic Minor'}</div>
          </div>
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
              {(practiceTrack === 'major' ? DIATONIC : HARM_MINOR_DIATONIC).map((d, i) => {
                const scale = practiceTrack === 'major' ? SCALES[currentKey] : HARM_MINOR_SCALES[currentKey];
                if (!scale) return null;
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

        <div className="days-header">
          {activeSchedule.map((d, i) => (
            <div key={d.day} className={`day-tab ${selectedDay===i?'active':''}`} onClick={() => setSelectedDay(i)}>
              <span className="day-tab-name">{d.short}</span>
              <div className="day-tab-focus">{d.focus}</div>
              <div className="day-tab-progress">
                <div className="day-tab-progress-fill" style={{width:`${dayProgress(i)}%`}} />
              </div>
            </div>
          ))}
        </div>

        <div className="day-panel">
          <div className="day-panel-header">
            <div>
              <div className="day-panel-day">{day.day}</div>
              <div className="day-panel-focus">{day.focus}</div>
            </div>
            <div className="day-panel-duration">{day.totalMin} min</div>
          </div>
          {day.blocks.map((block, bi) => {
            const blockId = `${selectedDay}-${bi}`;
            const isOpen = openBlocks[blockId] !== false;
            const complete = allBlocksDone(block);
            return (
              <div className="block" key={blockId}>
                <div className="block-header" onClick={() => toggleBlock(blockId)}>
                  <div className={`block-dot ${complete?'complete':''}`} />
                  <div className="block-title">{block.title}</div>
                  <div className="block-duration">{block.min} min</div>
                  <div className={`block-chevron ${isOpen?'open':''}`}>▶</div>
                </div>
                {isOpen && (
                  <div className="block-body">
                    {block.tasks.map(task => (
                      <div key={task.id} className={`task ${done[task.id]?'done':''}`} onClick={() => toggleTask(task.id)}>
                        <div className={`task-check ${done[task.id]?'done':''}`}>{done[task.id]?'✓':''}</div>
                        <div>
                          <div className="task-label">{task.label}</div>
                          {task.note && <div className="task-note">{task.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mastery-section">
          <div className="mastery-header">
            <div className="mastery-title">Mastery Checklist</div>
            <div className="mastery-key-badge">{currentKey}</div>
            {masteryCount(currentKey) === MASTERY_ITEMS.length && (
              <span className="complete-badge">✓ Key Complete</span>
            )}
            <div className="mastery-score">{masteryCount(currentKey)} / {MASTERY_ITEMS.length}</div>
          </div>
          <div style={{padding:'12px 24px 8px'}}>
            <div className="mastery-bar">
              <div className="mastery-bar-fill" style={{width:`${(masteryCount(currentKey)/MASTERY_ITEMS.length)*100}%`}} />
            </div>
          </div>
          <div className="mastery-items">
            {MASTERY_ITEMS.map((item, idx) => {
              const checked = !!(mastery[currentKey]||{})[idx];
              return (
                <div key={idx} className={`mastery-item ${checked?'done':''}`} onClick={() => toggleMastery(currentKey, idx)}>
                  <div className={`mastery-check ${checked?'done':''}`}>{checked?'✓':''}</div>
                  <div className="mastery-item-text">{item}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showCaged && (
        <div className="caged-overlay">
          <div className="caged-overlay-header">
            <div>
              <div className="caged-overlay-title">CAGED Shapes</div>
              <div className="caged-overlay-sub">{cagedQuality} · Chord Shapes · Arpeggios · Pentatonic · Scale</div>
            </div>
            <button className="caged-overlay-close" onClick={() => setShowCaged(false)}>✕</button>
          </div>
          <div className="caged-tabs">
            {QUALITY_TABS.map(q => (
              <button key={q} className={`caged-tab${cagedQuality === q ? ' active' : ''}`}
                onClick={() => setCagedQuality(q)}>{q}</button>
            ))}
          </div>
          <div className="quality-formula">
            <span className="quality-formula-intervals">{QUALITY_INFO[cagedQuality].formula}</span>
            <span className="quality-formula-mode">{QUALITY_INFO[cagedQuality].mode}</span>
          </div>
          <div className="caged-grid">
            {(() => { const qCats = Object.keys(CATEGORY_LABELS[cagedQuality] || CATEGORY_LABELS.Major); const MAX_COLS = 4; const gridCols = `48px repeat(${MAX_COLS}, 1fr)`; return (
            <>
            <div className="caged-col-headers" style={{ gridTemplateColumns: gridCols }}>
              <div />
              {qCats.map(cat => (
                <div key={cat} className="caged-col-label">{(CATEGORY_LABELS[cagedQuality] || CATEGORY_LABELS.Major)[cat]}</div>
              ))}
            </div>
            {CAGED_NAMES.map(name => (
              <div className="caged-row" key={name} style={{ gridTemplateColumns: gridCols }}>
                <div className="caged-row-label">{name}{(() => { const sfx = cagedQuality === 'Minor' ? 'm' : cagedQuality === 'Diminished' ? 'dim' : cagedQuality === 'Augmented' ? 'aug' : cagedQuality === 'Sus4' ? 'sus4' : cagedQuality === 'Sus2' ? 'sus2' : cagedQuality === 'Maj7' ? 'maj7' : cagedQuality === 'Maj7 Shell' ? 'maj7' : cagedQuality === 'Min7' ? 'm7' : cagedQuality === 'Dom7' ? '7' : cagedQuality === 'Min7♭5' ? 'm7♭5' : cagedQuality === 'Dim7' ? '°7' : ''; return sfx ? <span className="caged-row-label-suffix">{sfx}</span> : null; })()}</div>
                {qCats.map(cat => {
                  const variants = getVariants(CAGED_SHAPES[cagedQuality][name][cat]);
                  const vKey = `${cagedQuality}-${name}-${cat}`;
                  const sel = variantSel[vKey] || 0;
                  const dots = variants[Math.min(sel, variants.length - 1)];
                  return (
                    <div className="caged-cell" key={cat}>
                      {variants.length > 1 ? (
                        <div className="variant-pills">
                          {variants.map((_, vi) => (
                            <div key={vi}
                              className={`variant-pill${sel === vi ? ' active' : ''}`}
                              onClick={() => setVariantSel(prev => ({ ...prev, [vKey]: vi }))}>
                              {ROMAN[vi]}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="variant-spacer" />
                      )}
                      {dots.length > 0 ? (
                        <FretboardDiagram dots={dots} />
                      ) : (
                        <div className="caged-empty">—</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            </>
            ); })()}
          </div>
        </div>
      )}

      {showDiatonic && (() => {
        const triadItems = practiceTrack === 'major' ? getDiatonicTriads(currentKey) : getHarmMinorTriads(currentKey);
        return (
        <div className="diatonic-overlay">
          <div className="diatonic-header">
            <div>
              <div className="diatonic-title">{practiceTrack === 'major' ? 'Diatonic Triads' : 'Harmonic Minor Triads'}</div>
            </div>
            <div className="diatonic-key-badge">{currentKey} {practiceTrack === 'major' ? 'Major' : 'Harm. Minor'}</div>
            <button className="diatonic-close" onClick={() => setShowDiatonic(false)}>✕</button>
          </div>
          <div className="diatonic-controls">
            {triadItems.map((t, i) => {
              const isH = diatonicHighlight.includes(i);
              const degreeColor = TRIAD_COLORS[i];
              return (
                <div key={i} className={`diatonic-pill ${isH ? 'highlighted' : ''}`}
                  style={isH ? { borderColor: degreeColor, background: degreeColor + '18' } : {}}
                  onClick={() => setDiatonicHighlight(prev =>
                    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                  )}>
                  <span className="pill-roman" style={{ color: isH ? degreeColor : degreeColor + '99' }}>{t.roman}</span>
                  <span className="pill-chord" style={isH ? { color: degreeColor } : {}}>{t.chordName}</span>
                </div>
              );
            })}
            <div className="diatonic-toggle">
              <button className={!diatonicShowNotes ? 'active' : ''} onClick={() => setDiatonicShowNotes(false)}>Intervals</button>
              <button className={diatonicShowNotes ? 'active' : ''} onClick={() => setDiatonicShowNotes(true)}>Notes</button>
            </div>
          </div>
          <DiatonicPlayer items={triadItems} setHighlight={setDiatonicHighlight} />
          <div className="diatonic-fretboard">
            <FullNeckFretboard currentKey={currentKey} highlighted={diatonicHighlight} setHighlighted={setDiatonicHighlight} showNotes={diatonicShowNotes} items={triadItems} />
          </div>
        </div>
        );
      })()}

      {showCof && (
        <div className="cof-overlay">
          <div className="cof-header">
            <div className="cof-title">Circle of Fifths</div>
            <div className="diatonic-key-badge">Week {week} — {currentKey}</div>
            <button className="cof-close" onClick={() => setShowCof(false)}>✕</button>
          </div>
          <div className="cof-body">
            <CircleOfFifths week={week} />
          </div>
          <div className="cof-legend">
            <div className="cof-legend-item"><div className="cof-legend-dot" style={{ background: '#c9963a' }} /> Root (I)</div>
            <div className="cof-legend-item"><div className="cof-legend-dot" style={{ background: '#f0e6d0' }} /> Major (IV, V)</div>
            <div className="cof-legend-item"><div className="cof-legend-dot" style={{ background: '#dde8f2' }} /> Minor (ii, iii, vi)</div>
            <div className="cof-legend-item"><div className="cof-legend-dot" style={{ background: '#f2dde0' }} /> Dim (vii°)</div>
          </div>
        </div>
      )}

      {showIntervals && (
        <div className="interval-overlay">
          <div className="interval-header">
            <div className="interval-title">Interval Map</div>
            <div className="diatonic-key-badge">{currentKey}</div>
            <button className="diatonic-close" onClick={() => setShowIntervals(false)}>✕</button>
          </div>
          <div className="interval-controls">
            {INTERVALS.map(iv => {
              const isOn = activeIntervals.includes(iv.semitones);
              return (
                <div key={iv.semitones} className={`interval-pill ${isOn ? 'on' : ''}`}
                  style={isOn ? { borderColor: iv.color, color: iv.color, background: iv.color + '18' } : {}}
                  onClick={() => setActiveIntervals(prev =>
                    iv.semitones === 0 ? prev // Root always on
                      : prev.includes(iv.semitones) ? prev.filter(x => x !== iv.semitones) : [...prev, iv.semitones]
                  )}>
                  {iv.name}
                </div>
              );
            })}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button className="player-btn" onClick={() => setActiveIntervals([0])}>Clear</button>
              <button className="player-btn" onClick={() => setActiveIntervals(INTERVALS.map(iv => iv.semitones))}>All</button>
              <div className="diatonic-toggle">
                <button className={!intervalShowNotes ? 'active' : ''} onClick={() => setIntervalShowNotes(false)}>Intervals</button>
                <button className={intervalShowNotes ? 'active' : ''} onClick={() => setIntervalShowNotes(true)}>+ Notes</button>
              </div>
            </div>
          </div>
          <div className="interval-fretboard">
            <IntervalFretboard currentKey={currentKey} activeIntervals={activeIntervals} showNotes={intervalShowNotes} />
          </div>
        </div>
      )}

      {showCagedModes && (() => {
        const isMaj = practiceTrack === 'major';
        const cmGetRoot = isMaj ? getCagedModesForRoot : getHmCagedModesForRoot;
        const cmGetFamily = isMaj ? getCagedFamily : getHmCagedFamily;
        const cmGetMatrix = isMaj ? getModesMatrix : getHmModesMatrix;
        const cmScaleLabel = isMaj ? 'Major' : 'Harm. Minor';
        const cmParentLabel = isMaj ? 'major' : 'harm. minor';
        return (
        <div className="cm-overlay">
          <div className="cm-header">
            <div className="cm-title">{isMaj ? 'CAGED Modes' : 'CAGED HM Modes'}</div>
            <div className="diatonic-key-badge">{currentKey}</div>
            <div className="diatonic-toggle" style={{ marginLeft: 4 }}>
              <button className={!cagedModesFlats ? 'active' : ''} onClick={() => setCagedModesFlats(false)}>♯</button>
              <button className={cagedModesFlats ? 'active' : ''} onClick={() => setCagedModesFlats(true)}>♭</button>
            </div>
            <button className="diatonic-close" onClick={() => setShowCagedModes(false)}>✕</button>
          </div>
          <div className="cm-body">
            <div className="cm-section">
              <div className="cm-section-title">{cmScaleLabel} Modes of {currentKey}</div>
              <div className="cm-section-sub">Each mode of {currentKey} {cmParentLabel} maps to a different parent {cmParentLabel} key</div>
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th>Quality</th>
                    <th>Parent Key</th>
                  </tr>
                </thead>
                <tbody>
                  {cmGetRoot(currentKey, cagedModesFlats).map((m, i) => (
                    <tr key={i} className={i === 0 ? 'cm-highlight' : ''}>
                      <td>
                        <span className="cm-root">{m.root}</span>{' '}
                        <span className={`cm-mode cm-mode-${m.quality}`}>{m.mode}</span>
                      </td>
                      <td>
                        <span className={`cm-badge cm-badge-${m.quality}`}>
                          {m.quality === 'maj' ? 'Major' : m.quality === 'min' ? 'Minor' : m.quality === 'aug' ? 'Aug' : 'Dim'}
                        </span>
                      </td>
                      <td className="cm-parent">{m.parentKey} {cmParentLabel} shapes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cm-section">
              <div className="cm-section-title">{currentKey} {cmScaleLabel} Family</div>
              <div className="cm-section-sub">All 7 modes sharing the same {currentKey} {cmParentLabel} shapes</div>
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Degree</th>
                    <th>Root</th>
                    <th>Mode</th>
                    <th>Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {cmGetFamily(currentKey, cagedModesFlats).map((m, i) => (
                    <tr key={i} className={i === 0 ? 'cm-highlight' : ''}>
                      <td style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: '#c9963a', fontWeight: 600 }}>{m.degree}</td>
                      <td><span className="cm-root">{m.note}</span></td>
                      <td className={`cm-mode cm-mode-${m.quality}`}>{m.mode}</td>
                      <td>
                        <span className={`cm-badge cm-badge-${m.quality}`}>
                          {m.quality === 'maj' ? 'Major' : m.quality === 'min' ? 'Minor' : m.quality === 'aug' ? 'Aug' : 'Dim'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cm-section">
              <div className="cm-section-title">Full Mode Matrix</div>
              <div className="cm-section-sub">Same color = same parent key = same {cmParentLabel} shapes on the fretboard</div>
              <div style={{ overflowX: 'auto' }}>
                <table className="cm-matrix">
                  <thead>
                    <tr>
                      <th>Mode</th>
                      {(cagedModesFlats ? CHROMATIC_FLAT : CHROMATIC).map((n, i) => (
                        <th key={i}>{n}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cmGetMatrix(cagedModesFlats).map((row, ri) => (
                      <tr key={ri}>
                        <td>{row.mode}</td>
                        {row.cells.map((c, ci) => {
                          const col = FAMILY_COLORS[c.parentIdx];
                          const normKey = currentKey.length > 1 && currentKey[1] === 'b' ? currentKey[0] + '♭' : currentKey;
                          const isCurrentKey = c.parentIdx === (cagedModesFlats ? CHROMATIC_FLAT : CHROMATIC).indexOf(normKey);
                          return (
                            <td key={ci}>
                              <span className="cm-cell" style={{
                                background: col.bg, color: col.fg,
                                outline: isCurrentKey ? '2px solid #c9963a' : 'none',
                                outlineOffset: 1,
                              }}>
                                {c.note}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#999', marginRight: 4 }}>Parent keys:</span>
                {(cagedModesFlats ? CHROMATIC_FLAT : CHROMATIC).map((n, i) => (
                  <span key={i} className="cm-cell" style={{ background: FAMILY_COLORS[i].bg, color: FAMILY_COLORS[i].fg, fontSize: 11 }}>{n}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {showModes && (() => {
        const isMajor = practiceTrack === 'major';
        const modeOffsets = isMajor ? MODE_OFFSETS : HARM_MINOR_MODE_OFFSETS;
        const modeNames = isMajor ? MODE_NAMES : HARM_MINOR_MODE_NAMES;
        const getChordsFn = isMajor ? getModalChords : getHmModalChords;
        const firstModeName = isMajor ? 'Ionian' : 'Harmonic Minor';
        const scaleLabel = isMajor ? 'major' : 'harm. minor';
        return (
        <div className="modes-overlay">
          <div className="modes-header">
            <div className="modes-title">{isMajor ? 'Modal Interchange' : 'HM Modal Interchange'}</div>
            <div className="diatonic-key-badge">{currentKey}</div>
            <div className="diatonic-toggle" style={{ marginLeft: 8 }}>
              <button className={!modes7ths ? 'active' : ''} onClick={() => setModes7ths(false)}>Triads</button>
              <button className={modes7ths ? 'active' : ''} onClick={() => setModes7ths(true)}>7ths</button>
            </div>
            <div className="diatonic-toggle" style={{ marginLeft: 4 }}>
              <button className={!modesFlats ? 'active' : ''} onClick={() => setModesFlats(false)}>♯</button>
              <button className={modesFlats ? 'active' : ''} onClick={() => setModesFlats(true)}>♭</button>
            </div>
            <button className="diatonic-close" onClick={() => setShowModes(false)}>✕</button>
          </div>
          <div className="modes-body">
            <table className="modes-table">
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>I</th>
                  <th>II</th>
                  <th>III</th>
                  <th>IV</th>
                  <th>V</th>
                  <th>VI</th>
                  <th>VII</th>
                </tr>
              </thead>
              <tbody>
                {getChordsFn(currentKey, modes7ths, modesFlats).map((mode, mi) => {
                  const noteSet = modesFlats ? CHROMATIC_FLAT : CHROMATIC;
                  const normKey = currentKey.length > 1 && currentKey[1] === 'b' ? currentKey[0] + '♭' : currentKey;
                  const rootC = noteToChromatic(normKey);
                  const parentC = ((rootC - modeOffsets[mi]) + 12) % 12;
                  const parentKey = noteSet[parentC];
                  return (
                  <tr key={mode.name} className={mi === 0 ? 'mode-current' : ''}>
                    <td className="mode-name">{mode.name}</td>
                    {mode.chords.map((c, ci) => {
                      const chordRootC = noteToChromatic(c.root.replace('♭','♭').replace('♯','♯')) >= 0 ? noteToChromatic(c.root) : noteToChromatic(c.root);
                      const degreeInParent = modeOffsets.indexOf(((chordRootC - parentC) + 12) % 12);
                      return (
                      <td key={ci}>
                        <span className={`modes-chord q-${c.quality} ${c.borrowed ? 'borrowed' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setProgChords(prev => [...prev, {
                            rootIdx: chordRootC,
                            quality: c.quality,
                            suffix: c.chordName.slice(c.root.length),
                            modeIdx: degreeInParent >= 0 ? degreeInParent : 0,
                            parentIdx: parentC,
                            sourceMode: mode.name,
                            degree: ci + 1,
                            isHarmMinor: !isMajor,
                          }])}>
                          {c.chordName}
                        </span>
                        <div style={{ fontSize: 13, color: '#999', marginTop: 3 }}>{c.numeral}</div>
                      </td>
                    );})}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="prog-builder">
            <div className="prog-builder-title">Progression Builder</div>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>Tap chords above to add them, or use a preset:</div>
            <div className="prog-presets">
              {PROG_PRESETS.map((pp, pi) => (
                <button key={pi} className="prog-pattern-chip"
                  onClick={() => {
                    const normKey = currentKey.length > 1 && currentKey[1] === 'b' ? currentKey[0] + '♭' : currentKey;
                    const rootC = noteToChromatic(normKey);
                    const modeChords = getChordsFn(currentKey, modes7ths, modesFlats)[0].chords;
                    setProgChords(pp.degrees.map(d => ({
                      rootIdx: noteToChromatic(modeChords[d].root),
                      quality: modeChords[d].quality,
                      suffix: modeChords[d].chordName.slice(modeChords[d].root.length),
                      modeIdx: d,
                      parentIdx: rootC,
                      sourceMode: firstModeName,
                      degree: d + 1,
                      isHarmMinor: !isMajor,
                    })));
                  }}>
                  {pp.name}
                </button>
              ))}
              <button className="prog-pattern-chip" style={{ color: '#c75454', borderColor: '#c75454' }}
                onClick={() => setProgChords([])}>Clear</button>
            </div>
            <div className="prog-chords">
              {progChords.length === 0 && <span className="prog-empty">Tap chords from the table to build a progression...</span>}
              {progChords.map((ch, i) => {
                const ns = modesFlats ? CHROMATIC_FLAT : CHROMATIC;
                const rootName = ns[ch.rootIdx];
                const parentName = ns[ch.parentIdx];
                const chModeNames = ch.isHarmMinor ? HARM_MINOR_MODE_NAMES : MODE_NAMES;
                return (
                  <div key={i} className="prog-chord-info"
                    onClick={() => setProgChords(prev => prev.filter((_, j) => j !== i))}>
                    <span className="prog-chord-name">{rootName}{ch.suffix}</span>
                    <span className="prog-chord-mode">{rootName} {chModeNames[ch.modeIdx]}</span>
                    <span className="prog-chord-parent">from {parentName} {ch.isHarmMinor ? 'harm. minor' : 'major'}</span>
                  </div>
                );
              })}
            </div>
            {progChords.length > 0 && (
              <div className="prog-analysis">
                <div className="prog-analysis-title">Mode Analysis</div>
                {progChords.map((ch, i) => {
                  const ns = modesFlats ? CHROMATIC_FLAT : CHROMATIC;
                  const rootName = ns[ch.rootIdx];
                  const parentName = ns[ch.parentIdx];
                  const chModeNames = ch.isHarmMinor ? HARM_MINOR_MODE_NAMES : MODE_NAMES;
                  const chFirstMode = ch.isHarmMinor ? 'Harmonic Minor' : 'Ionian';
                  const isBorrowed = ch.sourceMode !== chFirstMode;
                  const normKey = currentKey.length > 1 && currentKey[1] === 'b' ? currentKey[0] + '♭' : currentKey;
                  return (
                    <div key={i} className="prog-analysis-row">
                      <span className="prog-analysis-chord">{rootName}{ch.suffix}</span>
                      <span className="prog-analysis-arrow">→</span>
                      <span className="prog-analysis-mode">{rootName} {chModeNames[ch.modeIdx]}</span>
                      <span className="prog-analysis-reason">
                        {isBorrowed
                          ? `borrowed from ${normKey} ${ch.sourceMode} · use ${parentName} ${ch.isHarmMinor ? 'harm. minor' : 'major'} shapes`
                          : `diatonic · degree ${ch.degree} of ${normKey} ${ch.isHarmMinor ? 'harm. minor' : 'major'}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <span className="player-label">Bars per chord</span>
              <div className="diatonic-toggle">
                <button className={progBarsPerChord === 1 ? 'active' : ''} onClick={() => setProgBarsPerChord(1)}>1</button>
                <button className={progBarsPerChord === 2 ? 'active' : ''} onClick={() => setProgBarsPerChord(2)}>2</button>
                <button className={progBarsPerChord === 4 ? 'active' : ''} onClick={() => setProgBarsPerChord(4)}>4</button>
              </div>
            </div>
            <ProgressionPlayer progression={progChords} barsPerChord={progBarsPerChord} />
          </div>
          <div className="modes-legend">
            {!modes7ths ? (<>
              <div className="modes-legend-item"><span className="modes-legend-swatch" style={{background:'#f0e6d0',color:'#6a5530',padding:'2px 8px',borderRadius:3,fontSize:11}}>C</span> Major</div>
              <div className="modes-legend-item"><span className="modes-legend-swatch" style={{background:'#dde8f2',color:'#3a5a80',padding:'2px 8px',borderRadius:3,fontSize:11}}>Cm</span> Minor</div>
              <div className="modes-legend-item"><span className="modes-legend-swatch" style={{background:'#f2dde0',color:'#8a3a3a',padding:'2px 8px',borderRadius:3,fontSize:11}}>C°</span> Diminished</div>
              <div className="modes-legend-item"><span className="modes-legend-swatch" style={{background:'#e8dff2',color:'#6a3a8a',padding:'2px 8px',borderRadius:3,fontSize:11}}>C+</span> Augmented</div>
            </>) : (<>
              <div className="modes-legend-item"><span className="modes-legend-swatch" style={{background:'#f0e6d0',color:'#6a5530',padding:'2px 8px',borderRadius:3,fontSize:11}}>maj7</span> Major 7</div>
              <div className="modes-legend-item"><span className="modes-legend-swatch" style={{background:'#dde8f2',color:'#3a5a80',padding:'2px 8px',borderRadius:3,fontSize:11}}>m7</span> Minor 7</div>
              <div className="modes-legend-item"><span className="modes-legend-swatch" style={{background:'#fce8d0',color:'#8a5a2a',padding:'2px 8px',borderRadius:3,fontSize:11}}>7</span> Dominant 7</div>
              <div className="modes-legend-item"><span className="modes-legend-swatch" style={{background:'#f2dde0',color:'#8a3a3a',padding:'2px 8px',borderRadius:3,fontSize:11}}>m7♭5</span> Half-dim</div>
              <div className="modes-legend-item"><span className="modes-legend-swatch" style={{background:'#d8eaf2',color:'#2a5a7a',padding:'2px 8px',borderRadius:3,fontSize:11}}>mM7</span> Min-maj 7</div>
            </>)}
            <div className="modes-legend-item"><span className="modes-legend-swatch" style={{border:'2px dashed #c9963a',padding:'1px 7px',fontSize:11}}>Ab</span> Borrowed</div>
          </div>
        </div>
        );
      })()}

      {showDiatonic7 && (() => {
        const seventhItems = practiceTrack === 'major' ? getDiatonic7ths(currentKey) : getHarmMinor7ths(currentKey);
        return (
        <div className="diatonic-overlay">
          <div className="diatonic-header">
            <div>
              <div className="diatonic-title">{practiceTrack === 'major' ? 'Diatonic 7th Chords' : 'Harmonic Minor 7th Chords'}</div>
            </div>
            <div className="diatonic-key-badge">{currentKey} {practiceTrack === 'major' ? 'Major' : 'Harm. Minor'}</div>
            <button className="diatonic-close" onClick={() => setShowDiatonic7(false)}>✕</button>
          </div>
          <div className="diatonic-controls">
            {seventhItems.map((t, i) => {
              const isH = diatonic7Highlight.includes(i);
              const degreeColor = TRIAD_COLORS[i];
              return (
                <div key={i} className={`diatonic-pill ${isH ? 'highlighted' : ''}`}
                  style={isH ? { borderColor: degreeColor, background: degreeColor + '18' } : {}}
                  onClick={() => setDiatonic7Highlight(prev =>
                    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                  )}>
                  <span className="pill-roman" style={{ color: isH ? degreeColor : degreeColor + '99' }}>{t.roman}</span>
                  <span className="pill-chord" style={isH ? { color: degreeColor } : {}}>{t.chordName}</span>
                </div>
              );
            })}
            <div className="diatonic-toggle">
              <button className={!diatonic7ShowNotes ? 'active' : ''} onClick={() => setDiatonic7ShowNotes(false)}>Intervals</button>
              <button className={diatonic7ShowNotes ? 'active' : ''} onClick={() => setDiatonic7ShowNotes(true)}>Notes</button>
            </div>
          </div>
          <DiatonicPlayer items={seventhItems} setHighlight={setDiatonic7Highlight} />
          <div className="diatonic-fretboard">
            <FullNeck7thFretboard currentKey={currentKey} highlighted={diatonic7Highlight} setHighlighted={setDiatonic7Highlight} showNotes={diatonic7ShowNotes} items={seventhItems} />
          </div>
        </div>
        );
      })()}
    </>
  );
}
