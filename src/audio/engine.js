let ctx = null;
let master = null;
const buses = {};

function buildGraph(c) {
  const compressor = c.createDynamicsCompressor();
  compressor.threshold.value = -10;
  compressor.knee.value = 20;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;
  compressor.connect(c.destination);

  master = c.createGain();
  master.gain.value = 0.9;
  master.connect(compressor);

  for (const name of ['click', 'chord', 'drone']) {
    const g = c.createGain();
    g.gain.value = 1;
    g.connect(master);
    buses[name] = g;
  }
}

export function getContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    buildGraph(ctx);
  }
  return ctx;
}

export function getBus(name) {
  getContext();
  return buses[name];
}

export function ensureRunning() {
  const c = getContext();
  if (c.state === 'suspended') c.resume();
  return c;
}

export function unlock() {
  const c = ensureRunning();
  // 1-sample silent buffer kickstarts iOS Safari output
  const buf = c.createBuffer(1, 1, c.sampleRate);
  const src = c.createBufferSource();
  src.buffer = buf;
  src.connect(c.destination);
  src.start(0);
}

let unlockAttached = false;
export function attachUnlockOnGesture() {
  if (unlockAttached) return;
  unlockAttached = true;
  const handler = () => {
    unlock();
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('keydown', handler);
  };
  window.addEventListener('pointerdown', handler);
  window.addEventListener('keydown', handler);
}

export function setVolume(busName, v) {
  const bus = getBus(busName);
  if (bus) bus.gain.value = v;
}

// two-tone block-elapsed chime
export function playChime() {
  try {
    const c = ensureRunning();
    [0, 0.18].forEach((off, i) => {
      const t = c.currentTime + off;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.frequency.value = i === 0 ? 880 : 1320;
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch {
    // audio unavailable
  }
}

let noiseBuf = null;
function getNoiseBuffer(c) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.05), c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

// level: true/'accent' = downbeat, false/'beat' = regular, 'sub' = quiet subdivision tick.
// Every level uses the SAME timbre for a given sound — accents are just louder
// (and a touch brighter), so the metronome reads as one ticker, not multiple sounds.
export function playClick(when, level, sound = 'tick') {
  const c = getContext();
  const t = when || c.currentTime;
  const accent = level === true || level === 'accent';
  const sub = level === 'sub';
  const gainVal = accent ? 0.55 : sub ? 0.13 : 0.28;
  const bus = getBus('click');

  if (sound === 'tick') {
    // woodblock-style "tock": band-passed noise burst
    const src = c.createBufferSource();
    src.buffer = getNoiseBuffer(c);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = accent ? 2100 : 1700;
    bp.Q.value = 9;
    const g = c.createGain();
    g.gain.setValueAtTime(gainVal * 2.4, t); // the bandpass eats most of the energy
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    src.connect(bp);
    bp.connect(g);
    g.connect(bus);
    src.start(t);
    src.stop(t + 0.05);
    src.onended = () => {
      src.disconnect();
      bp.disconnect();
      g.disconnect();
    };
    return;
  }

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(bus);
  if (sound === 'click') {
    // sharp digital click: very short square blip
    osc.type = 'square';
    osc.frequency.value = accent ? 2400 : 2000;
    g.gain.setValueAtTime(gainVal, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
    osc.start(t);
    osc.stop(t + 0.02);
  } else {
    // beep: soft sine tone
    osc.type = 'sine';
    osc.frequency.value = accent ? 1000 : 800;
    g.gain.setValueAtTime(gainVal * 1.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.start(t);
    osc.stop(t + 0.06);
  }
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
}
