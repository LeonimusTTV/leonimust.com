// Music engine. Wraps the single <audio id="music"> that lives in the layout,
// so client-side navigation never interrupts it.
// Sound.levels() feeds the (very light) audio reactivity of the orbit scene;
// if the analyser stays silent it falls back to a soft synthetic pulse.
window.Sound = (function () {
  const audio = document.getElementById('music');
  let ctx = null, analyser = null, freq = null, wave = null, master = null;
  let silentFrames = 0, fallback = false;
  let volume = 0.7;

  try {
    const saved = localStorage.getItem('userVolume');
    if (saved !== null && !isNaN(parseFloat(saved))) volume = Math.min(1, Math.max(0, parseFloat(saved)));
  } catch (e) { /* storage blocked: keep default */ }
  audio.volume = volume;

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { fallback = true; return; }
    try {
      ctx = new AC();
      const src = ctx.createMediaElementSource(audio);
      master = ctx.createGain();
      master.gain.value = volume;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      freq = new Uint8Array(analyser.frequencyBinCount);
      wave = new Uint8Array(analyser.fftSize);
      audio.volume = 1; // the gain node owns the volume from here on
      src.connect(master).connect(analyser).connect(ctx.destination);
    } catch (e) { fallback = true; ctx = null; audio.volume = volume; }
  }

  function start() {
    if (!ctx && !fallback) build();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return audio.play().catch(() => {});
  }

  function setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    if (master) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.03);
    else audio.volume = volume;
    try { localStorage.setItem('userVolume', String(volume)); } catch (e) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('sound:volume', { detail: volume }));
  }

  const out = { bass: 0, mid: 0, high: 0, rms: 0, wave: null };
  function levels() {
    if (audio.paused) { out.bass = out.mid = out.high = out.rms = 0; out.wave = null; return out; }
    if (analyser && !fallback) {
      analyser.getByteFrequencyData(freq);
      analyser.getByteTimeDomainData(wave);
      let b = 0, m = 0, h = 0;
      for (let i = 1; i < 12; i++) b += freq[i];
      for (let i = 12; i < 90; i++) m += freq[i];
      for (let i = 90; i < 300; i++) h += freq[i];
      out.bass = b / (11 * 255); out.mid = m / (78 * 255); out.high = h / (210 * 255);
      let s = 0;
      for (let i = 0; i < wave.length; i++) { const v = (wave[i] - 128) / 128; s += v * v; }
      out.rms = Math.sqrt(s / wave.length);
      out.wave = wave;
      if (out.bass + out.mid === 0 && audio.currentTime > 1) { if (++silentFrames > 90) fallback = true; }
      else silentFrames = 0;
    }
    if (fallback) {
      const t = audio.currentTime, beat = Math.pow(0.5 + 0.5 * Math.cos(t * Math.PI * 4), 6);
      out.bass = 0.35 + beat * 0.5; out.mid = 0.3; out.high = 0.2; out.rms = 0.15 + beat * 0.1; out.wave = null;
    }
    return out;
  }

  return {
    audio, start, setVolume, levels,
    get volume() { return volume; },
    get playing() { return !audio.paused; },
  };
})();
