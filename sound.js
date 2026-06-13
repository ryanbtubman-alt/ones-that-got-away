// Synthesized sound effects — no audio files needed. Web Audio + speech synthesis.
// All triggers happen on user clicks, so autoplay restrictions are satisfied.
const Sound = (function () {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type = "sine", gain = 0.2, delay = 0) {
    if (muted) return;
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(c.destination);
    const t = c.currentTime + delay;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // Shaped white noise — used for a crowd-cheer swell.
  function noiseBurst(dur, gain = 0.25, delay = 0) {
    if (muted) return;
    const c = ac();
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1100;
    bp.Q.value = 0.6;
    const g = c.createGain();
    src.connect(bp);
    bp.connect(g);
    g.connect(c.destination);
    const t = c.currentTime + delay;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.start(t);
    src.stop(t + dur);
  }

  function announce(text, pitch = 1, rate = 0.95) {
    if (muted || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.pitch = pitch;
    u.rate = rate;
    u.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  return {
    toggle() {
      muted = !muted;
      if (muted && window.speechSynthesis) window.speechSynthesis.cancel();
      return muted;
    },
    isMuted() {
      return muted;
    },
    add() {
      tone(660, 0.08, "triangle", 0.18);
    },
    remove() {
      tone(280, 0.1, "triangle", 0.16);
    },
    whistle() {
      tone(2000, 0.13, "square", 0.07);
      tone(2300, 0.13, "square", 0.07, 0.05);
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, "triangle", 0.22, i * 0.12));
      noiseBurst(1.5, 0.22, 0.1); // crowd erupts
      announce("Boomshakalaka!", 1.1, 0.9);
    },
    lose() {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.5, "sawtooth", 0.16, i * 0.14));
      tone(110, 0.7, "square", 0.14, 0.1); // dead-ball buzzer
      announce("Rejected!", 0.6, 0.85);
    },
  };
})();
