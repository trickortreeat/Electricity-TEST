// Простые синтезированные звуки через WebAudio — без ассетов
let ctx: AudioContext | null = null;

function ac(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol = 0.12, when = 0, slideTo?: number) {
  const a = ac();
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur: number, vol = 0.15, when = 0, hp = 2000) {
  const a = ac();
  const t = a.currentTime + when;
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const g = a.createGain();
  const f = a.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

export const sfx = {
  click() {
    tone(750, 0.06, 'square', 0.05);
  },
  select() {
    tone(1200, 0.07, 'sine', 0.07);
  },
  spark() {
    noise(0.12, 0.12, 0, 3200);
    tone(1900, 0.09, 'triangle', 0.08, 0, 2600);
  },
  error() {
    tone(140, 0.35, 'sawtooth', 0.14, 0, 70);
    noise(0.25, 0.1, 0, 900);
  },
  success() {
    tone(523, 0.14, 'sine', 0.1);
    tone(659, 0.14, 'sine', 0.1, 0.11);
    tone(784, 0.2, 'sine', 0.11, 0.22);
    tone(1047, 0.34, 'sine', 0.1, 0.33);
  },
  powerOn() {
    noise(0.4, 0.08, 0, 1400);
    tone(90, 0.5, 'sawtooth', 0.08, 0, 180);
    tone(660, 0.18, 'sine', 0.09, 0.3);
  },
  remove() {
    tone(500, 0.08, 'sine', 0.06, 0, 320);
  },
};
