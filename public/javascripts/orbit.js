/* =====================================================
   ORBIT — the scene behind leonimust.com.
   sky: fixed ASCII starfield, one twinkle at a time, a rare shooting star,
        the constellation of the current zodiac sign.
   one object, ASCII-rendered with a z-buffer and lighting:
     home = ringed planet · projects = orrery (one planet per project)
     games = the moon, lit by today's real phase · apps = a satellite
     a hovered project = its logo in relief
   calm by design: objects swap with a short in-place crossfade (no flying
   points), slow rotation, no pointer effects. grab the object to spin it.
   API: Orbit.setMask(text|null), Orbit.dissolveMask(), Orbit.showImage(src|null),
        Orbit.setView(view, { count }), Orbit.sky
   ===================================================== */
window.Orbit = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.getElementById('field'), g = cv.getContext('2d');
  const RAMP = ' .,-~:;=!*#$@';
  const FOCAL = 900, LX = -0.42, LY = -0.58, LZ = -0.7;
  const INK = '236,235,230';
  const OUT_MS = 160, IN_MS = 300;
  let W, H, N, CW, CH, cols, rows;
  let px, py, pz, tgt;
  let zb, sh, bIdx, bChr, bLen;
  let shape = null, pending = undefined, fade = { phase: 'idle', t0: 0 };
  let view = 'home', count = 9, imgSrc = null, maskText = null;
  let stars = [], constel = null;
  const cam = { yaw: 0.5, pitch: -0.28, vyaw: 0, vpitch: 0, cx: 0, cy: 0, lastDrag: -1e9 };
  const cache = new Map();
  const wide = () => W >= 760;
  const OBJECT_VIEWS = { home: 'planet', projects: 'orrery', games: 'moon', apps: 'satellite' };

  /* ---------------- today's sky ---------------- */
  const SKY = (() => {
    const syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
    const age = (((Date.now() / 86400000 - ref) % syn) + syn) % syn, ph = age / syn;
    const names = [[0.0339, 'new moon'], [0.216, 'waxing crescent'], [0.284, 'first quarter'], [0.466, 'waxing gibbous'], [0.534, 'full moon'], [0.716, 'waning gibbous'], [0.784, 'last quarter'], [0.966, 'waning crescent'], [1.01, 'new moon']];
    const d = new Date(), md = (d.getMonth() + 1) * 100 + d.getDate();
    const Z = [[120, 'capricorn', '♑'], [219, 'aquarius', '♒'], [321, 'pisces', '♓'], [420, 'aries', '♈'], [521, 'taurus', '♉'], [621, 'gemini', '♊'], [723, 'cancer', '♋'], [823, 'leo', '♌'], [923, 'virgo', '♍'], [1023, 'libra', '♎'], [1122, 'scorpio', '♏'], [1222, 'sagittarius', '♐'], [1232, 'capricorn', '♑']];
    const sign = Z.find(z => md < z[0]);
    return { phase: ph, phaseName: names.find(n => ph < n[0])[1], illum: (1 - Math.cos(ph * Math.PI * 2)) / 2, sign: sign[1], glyph: sign[2] + '︎' };
  })();
  // simplified stick figures of each sign, normalised 0..1 (y down)
  const FIG = {
    aries: [[[0, .6], [.45, .35], [.75, .4], [1, .55]], [[0, 1], [1, 2], [2, 3]]],
    taurus: [[[.5, .6], [.42, .5], [.35, .42], [.58, .5], [.65, .42], [0, .1], [1, .15], [.75, .85]], [[0, 1], [1, 2], [2, 5], [0, 3], [3, 4], [4, 6], [0, 7]]],
    gemini: [[[.2, 0], [.25, .5], [.15, 1], [.6, .05], [.65, .5], [.7, 1], [.42, .55]], [[0, 1], [1, 2], [3, 4], [4, 5], [1, 6], [6, 4]]],
    cancer: [[[.5, .55], [.45, .1], [.1, .95], [.9, .9], [.5, .3]], [[0, 4], [4, 1], [0, 2], [0, 3]]],
    leo: [[[.2, .2], [.1, .35], [.2, .5], [.35, .45], [.35, .15], [.25, .02], [.7, .55], [.95, .62], [.75, .35]], [[5, 4], [4, 0], [0, 1], [1, 2], [2, 3], [3, 6], [6, 7], [7, 8], [8, 3]]],
    virgo: [[[0, .3], [.25, .35], [.45, .5], [.6, .3], [.85, .2], [.5, .8], [.75, .75], [1, .9]], [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 7]]],
    libra: [[[.5, 0], [.15, .4], [.85, .35], [.3, 1], [.75, .9]], [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4]]],
    scorpio: [[[0, .1], [.08, .25], [.12, .4], [.3, .45], [.4, .6], [.45, .8], [.6, .95], [.8, .9], [.9, .75], [.95, .6]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]]],
    sagittarius: [[[.15, .55], [.35, .38], [.52, .3], [.62, .48], [.5, .65], [.3, .68], [.8, .35], [.95, .55], [.45, .08]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4], [3, 6], [6, 7], [2, 8]]],
    capricorn: [[[0, .2], [.3, .3], [.7, .35], [1, .15], [.75, .7], [.4, .85]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]],
    aquarius: [[[0, .3], [.25, .2], [.45, .3], [.55, .15], [.65, .5], [.5, .75], [.8, .9], [1, .7]], [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [4, 6], [6, 7]]],
    pisces: [[[.1, 0], [.2, .3], [.3, .6], [.5, 1], [.7, .85], [.85, .7], [1, .6], [.9, .5]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 4]]],
  };

  function anchor() {
    if (maskText) return [W / 2, H * 0.45];
    if (!wide()) return [W / 2, H * 0.22];
    return [W * 0.75, H * (view === 'projects' ? 0.52 : 0.54)];
  }
  const R = () => (view === 'home' ? 0.84 : 1) * (wide() ? Math.min(W * 0.4, H) * 0.3 : Math.min(W, H * 0.4) * 0.3);

  function buildSky() {
    stars = [];
    for (let i = 0; i < cols * rows; i++) {
      if (Math.random() < 0.011) {
        const mag = Math.random();
        stars.push({ i, ch: mag > 0.97 ? '*' : mag > 0.85 ? '+' : mag > 0.5 ? '·' : '.', a: 0.12 + mag * 0.4 });
      }
    }
    constel = null;
    const fig = FIG[SKY.sign];
    if (!fig || !wide()) return;
    const [x0, y0, x1, y1] = [W * 0.56, H * 0.07, W * 0.8, H * 0.23];
    const pts = fig[0].map(([u, v]) => [Math.round((x0 + u * (x1 - x0)) / CW), Math.round((y0 + v * (y1 - y0)) / CH)]);
    const cells = new Map();
    for (const [a, b] of fig[1]) {
      let [cx, cy] = pts[a]; const [ex, ey] = pts[b];
      const dx = Math.abs(ex - cx), dy = -Math.abs(ey - cy), sx = cx < ex ? 1 : -1, sy = cy < ey ? 1 : -1;
      const slope = (ey - pts[a][1]) / ((ex - pts[a][0]) || 1e-6);
      const ch = Math.abs(slope) > 2.5 ? '|' : Math.abs(slope) < 0.35 ? '-' : (slope > 0 ? '\\' : '/');
      let err = dx + dy;
      for (;;) { cells.set(cy * cols + cx, ch); if (cx === ex && cy === ey) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; cx += sx; } if (e2 <= dx) { err += dx; cy += sy; } }
    }
    for (const [x, y] of pts) cells.set(y * cols + x, '+');
    constel = { cells, label: `${SKY.glyph} ${SKY.sign}`, lx: x1 + CW * 3, ly: y0 + (y1 - y0) / 2 };
  }

  function resize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const first = !W;
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    CW = wide() ? 10 : 8; CH = Math.round(CW * 1.62);
    cols = Math.ceil(W / CW); rows = Math.ceil(H / CH);
    const n = cols * rows;
    zb = new Float32Array(n); sh = new Float32Array(n);
    bIdx = Array.from({ length: 8 }, () => new Int32Array(n));
    bChr = Array.from({ length: 8 }, () => new Int32Array(n));
    bLen = new Int32Array(8);
    if (first) {
      N = wide() ? 6500 : 3200;
      px = new Float32Array(N); py = new Float32Array(N); pz = new Float32Array(N); tgt = new Int32Array(N);
      const [ax, ay] = anchor(); cam.cx = ax; cam.cy = ay;
    }
    cache.clear();
    buildSky();
    // rebuild the current object for the new size, without a transition
    const next = currentTarget();
    if (next && next.then) next.then(s => { shape = s; place(); }); else { shape = next; place(); }
  }

  /* ---------------- shapes ---------------- */
  function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
  function vnoise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    let r = 0;
    for (let dz = 0; dz < 2; dz++) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++)
      r += hash3(xi + dx, yi + dy, zi + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
    return r;
  }
  const sphere = () => { const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u); return [s * Math.cos(th), u, s * Math.sin(th)]; };

  // per point: pos, nrm, val (< 0 = fixed shade, unlit), grp (orrery body, -1 = static)
  function make(kind) {
    const key = kind + W + 'x' + H + view + count;
    if (cache.has(key)) return cache.get(key);
    const r = R(), M = N;
    const pos = new Float32Array(M * 3), nrm = new Float32Array(M * 3), val = new Float32Array(M), grp = new Int16Array(M).fill(-1);
    let n = 0;
    const put = (x, y, z, nx, ny, nz, v = 1, gp = -1) => { pos[n * 3] = x; pos[n * 3 + 1] = y; pos[n * 3 + 2] = z; nrm[n * 3] = nx; nrm[n * 3 + 1] = ny; nrm[n * 3 + 2] = nz; val[n] = v; grp[n] = gp; n++; };
    const extra = {};
    if (kind === 'planet') {
      const ringN = Math.floor(M * 0.18), tilt = 0.42;
      while (n < M - ringN) { const [x, y, z] = sphere(); const land = vnoise(x * 2.3 + 5, y * 2.3, z * 2.3) * 0.65 + vnoise(x * 5 + 9, y * 5, z * 5) * 0.35 > 0.52; put(x * r, y * r, z * r, x, y, z, land ? 1 : 0.5); }
      while (n < M) { const a = Math.random() * Math.PI * 2, rr = r * (1.4 + Math.pow(Math.random(), 0.7) * 0.32); const x = Math.cos(a) * rr, z = Math.sin(a) * rr; put(x, -z * Math.sin(tilt), z * Math.cos(tilt), 0, 0, 0, -0.7); }
    } else if (kind === 'moon') {
      const craters = Array.from({ length: 16 }, () => ({ c: sphere(), rad: 0.12 + Math.random() * 0.22 }));
      while (n < M) {
        const [x, y, z] = sphere();
        let h = 0, nx = x, ny = y, nz = z;
        for (const k of craters) {
          const d = Math.acos(Math.max(-1, Math.min(1, x * k.c[0] + y * k.c[1] + z * k.c[2])));
          if (d < k.rad) {
            h -= 0.06 * (1 - (d / k.rad) ** 2);
            const f = 0.9 * (d / k.rad); nx += (k.c[0] - x) * f; ny += (k.c[1] - y) * f; nz += (k.c[2] - z) * f;
          } else if (d < k.rad * 1.25) h += 0.02;
        }
        const maria = vnoise(x * 1.8 + 3, y * 1.8, z * 1.8) > 0.55 ? 0.72 : 1;
        const ln = Math.hypot(nx, ny, nz) || 1, rr = r * (1 + h);
        put(x * rr, y * rr, z * rr, nx / ln, ny / ln, nz / ln, maria);
      }
      extra.moonLight = true;
    } else if (kind === 'orrery') {
      const sunN = Math.floor(M * 0.2), ringN = Math.floor(M * 0.12), sunR = r * 0.26;
      const bodies = Array.from({ length: count }, (_, k) => {
        const o = 0.5 + k * (1.05 / Math.max(1, count - 1));
        return { orbit: r * o, size: r * (0.07 + ((k * 37) % 5) * 0.014), phase: k * 2.17, speed: 0.22 / Math.pow(o, 1.5) };
      });
      extra.bodies = bodies;
      while (n < sunN) { const [x, y, z] = sphere(); put(x * sunR, y * sunR, z * sunR, x, y, z, -1); }
      while (n < sunN + ringN) { const b = bodies[(Math.random() * bodies.length) | 0], a = Math.random() * Math.PI * 2; put(Math.cos(a) * b.orbit, 0, Math.sin(a) * b.orbit, 0, 0, 0, -0.1); }
      const weights = bodies.map(b => b.size * b.size), tw = weights.reduce((a, b) => a + b, 0), left = M - n;
      bodies.forEach((b, k) => {
        const cnt = k === bodies.length - 1 ? M - n : Math.floor(left * weights[k] / tw);
        for (let q = 0; q < cnt && n < M; q++) { const [x, y, z] = sphere(); put(x * b.size, y * b.size, z * b.size, x, y, z, 1, k); }
      });
    } else if (kind === 'satellite') {
      const bw = r * 0.22, bh = r * 0.22, bd = r * 0.32, pw0 = r * 0.3, pw1 = r * 1.25, ph = r * 0.32;
      while (n < M) {
        const q = Math.random();
        if (q < 0.3) {
          const axis = (Math.random() * 3) | 0, sg = Math.random() < 0.5 ? -1 : 1, a = Math.random() * 2 - 1, b = Math.random() * 2 - 1;
          if (axis === 0) put(sg * bw, a * bh, b * bd, sg, 0, 0, 0.9); else if (axis === 1) put(a * bw, sg * bh, b * bd, 0, sg, 0, 0.9); else put(a * bw, b * bh, sg * bd, 0, 0, sg, 0.9);
        } else if (q < 0.86) {
          const side = Math.random() < 0.5 ? -1 : 1, x = side * (pw0 + Math.random() * (pw1 - pw0)), y = (Math.random() * 2 - 1) * ph, face = Math.random() < 0.5 ? -1 : 1;
          const u = (Math.abs(x) - pw0) / (pw1 - pw0), line = (u * 6) % 1 < 0.12 || Math.abs(y) > ph * 0.92 || Math.abs(y) < ph * 0.06;
          put(x, y, face * 2, 0, 0, face, line ? 1 : 0.55);
        } else if (q < 0.93) {
          const side = Math.random() < 0.5 ? -1 : 1; put(side * (bw + Math.random() * (pw0 - bw)), 0, 0, 0, -1, 0, -0.6);
        } else if (Math.random() < 0.4) put(0, -bh - Math.random() * r * 0.35, 0, 0, 0, -1, -0.7);
        else { const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * r * 0.16; put(Math.cos(a) * rr, -bh - r * 0.38 - rr * rr / (r * 0.4), Math.sin(a) * rr, 0, -1, 0, 1); }
      }
    }
    const s = { pos, nrm, val, grp, n: M, kind, ...extra };
    cache.set(key, s);
    return s;
  }
  function flat(list, kind, depthOf, valOf) {
    const m = list.length, pos = new Float32Array(m * 3), nrm = new Float32Array(m * 3), val = new Float32Array(m), grp = new Int16Array(m).fill(-1);
    for (let k = 0; k < m; k++) { pos[k * 3] = list[k][0]; pos[k * 3 + 1] = list[k][1]; pos[k * 3 + 2] = depthOf(list[k]); nrm[k * 3 + 2] = -1; val[k] = -valOf(list[k]); }
    return { pos, nrm, val, grp, n: m, kind };
  }
  function maskShape(text) {
    const step = 4, cw = Math.ceil(W / step), ch = Math.ceil(H / step);
    const oc = document.createElement('canvas'); oc.width = cw; oc.height = ch;
    const o = oc.getContext('2d', { willReadFrequently: true }); o.scale(1 / step, 1 / step);
    const font = s => `700 ${s}px "IBM Plex Mono", monospace`;
    let fs = Math.min(W * 0.15, 200);
    o.font = font(fs);
    let lines = [text];
    if (!wide() && text.includes(' ')) { lines = text.split(' '); fs = W * 0.3; o.font = font(fs); }
    while (Math.max(...lines.map(l => o.measureText(l).width)) > W * 0.86) { fs *= 0.93; o.font = font(fs); }
    o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillStyle = '#fff';
    lines.forEach((l, k) => o.fillText(l, W / 2, H / 2 + (k - (lines.length - 1) / 2) * fs));
    const d = o.getImageData(0, 0, cw, ch).data, list = [];
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) if (d[(j * cw + i) * 4 + 3] > 120) list.push([i * step + Math.random() * step - W / 2, j * step + Math.random() * step - H / 2]);
    return flat(list, 'mask', () => 0, () => 1);
  }
  function imageShape(src) {
    const key = 'img' + src + W + 'x' + H;
    if (cache.has(key)) return cache.get(key);
    return new Promise(resolve => {
      const im = new Image();
      im.onload = () => {
        const half = R() * 1.25;
        let s;
        try {
          const want = Math.min(N, Math.round((half * 2 / CW) * (half * 2 / CH) * 3));
          const r = Stipple(im, [-half, -half, half, half], want);
          const list = []; for (let k = 0; k < r.n; k++) list.push([r.pts[k * 4], r.pts[k * 4 + 1], r.pts[k * 4 + 2], r.pts[k * 4 + 3]]);
          s = flat(list, 'image', p => -(p[3] - 0.5) * half * 0.45, p => 0.25 + 0.75 * Math.max(p[3], p[2] * 0.7));
        } catch (e) { s = null; }
        cache.set(key, s);
        resolve(s);
      };
      im.onerror = () => resolve(null);
      im.src = src;
    });
  }
  // what should be on screen right now (shape, null, or a promise of one)
  function currentTarget() {
    if (maskText) return maskShape(maskText);
    if (imgSrc) return imageShape(imgSrc);
    const kind = OBJECT_VIEWS[view];
    return kind ? make(kind) : null;
  }
  function place() { // spread particles over the shape and put them there directly
    if (!shape) return;
    const n = shape.n;
    for (let i = 0; i < N; i++) {
      const j = n >= N ? Math.floor(i * n / N) : i < n ? i : (Math.random() * n) | 0;
      tgt[i] = j; px[i] = shape.pos[j * 3]; py[i] = shape.pos[j * 3 + 1]; pz[i] = shape.pos[j * 3 + 2];
    }
  }

  // calm swap: fade the current object out, place the next one, fade it in
  let swapToken = 0;
  function swap(instant) {
    const token = ++swapToken;
    const next = currentTarget();
    const apply = s => {
      if (token !== swapToken) return;
      if (instant || !shape) { shape = s; place(); fade = { phase: s ? 'in' : 'idle', t0: performance.now() }; return; }
      pending = s;
      if (fade.phase !== 'out') fade = { phase: 'out', t0: performance.now(), from: fadeAlpha(performance.now()) };
    };
    if (next && next.then) next.then(apply); else apply(next);
  }
  function fadeAlpha(now) {
    if (reduce) return fade.phase === 'out' ? 0 : 1;
    const p = (now - fade.t0) / (fade.phase === 'out' ? OUT_MS : IN_MS);
    if (fade.phase === 'out') return Math.max(0, (fade.from ?? 1) * (1 - p));
    if (fade.phase === 'in') return Math.min(1, p);
    return 1;
  }

  /* ---------------- grab to spin ---------------- */
  let drag = null;
  const interactive = t => t.closest('a, button, input, [role="slider"], .row, .menu, #vol, .legal-content, dialog');
  addEventListener('pointerdown', e => {
    if (!document.body.classList.contains('entered') || !shape || interactive(e.target) || e.button > 0) return;
    drag = { x: e.clientX, y: e.clientY }; document.body.classList.add('spinning');
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    cam.vyaw = dx * 0.006; cam.vpitch = dy * 0.004;
    cam.yaw += cam.vyaw; cam.pitch = Math.max(-1.2, Math.min(1.2, cam.pitch + cam.vpitch));
    cam.lastDrag = performance.now();
  }, { passive: true });
  const end = () => { drag = null; document.body.classList.remove('spinning'); };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);

  /* ---------------- frame ---------------- */
  let twinkle = { s: null, t0: 0 }, shoot = { t0: -1, next: performance.now() + 15000 + Math.random() * 20000 };
  function frame(now) {
    const t = now / 1000, L = Sound.levels();
    const [ax, ay] = anchor();
    cam.cx += (ax - cam.cx) * 0.08; cam.cy += (ay - cam.cy) * 0.08;

    if (fade.phase === 'out' && fadeAlpha(now) <= 0) { shape = pending; pending = undefined; place(); fade = { phase: shape ? 'in' : 'idle', t0: now }; }
    if (fade.phase === 'in' && fadeAlpha(now) >= 1) fade = { phase: 'idle', t0: now };
    const objA = shape ? fadeAlpha(now) : 0;
    const S = shape, kind = S ? S.kind : '';

    if (!drag) {
      cam.yaw += cam.vyaw; cam.vyaw *= 0.94; cam.pitch += cam.vpitch; cam.vpitch *= 0.9;
      if (now - cam.lastDrag > 3000 && kind && kind !== 'mask') {
        if (kind === 'image' || kind === 'satellite') {
          // face the viewer with a small, slow sway
          const amp = kind === 'image' ? 0.12 : 0.6, speed = kind === 'image' ? 0.25 : 0.3;
          const front = Math.round(cam.yaw / (Math.PI * 2)) * Math.PI * 2 + (reduce ? 0 : Math.sin(t * speed) * amp);
          cam.yaw += (front - cam.yaw) * 0.025;
        } else cam.yaw += reduce ? 0 : (kind === 'orrery' ? 0.0006 : 0.0016);
        const pitch = kind === 'orrery' ? -0.78 : kind === 'satellite' ? -0.35 : kind === 'image' ? -0.05 : -0.28;
        cam.pitch += (pitch - cam.pitch) * 0.025;
      }
    }
    if (kind === 'mask') { cam.yaw = 0; cam.pitch = 0; }

    zb.fill(1e9); sh.fill(0);
    let minC = cols, maxC = 0, minR = rows, maxR = 0;
    if (S && objA > 0) {
      const cyw = Math.cos(cam.yaw), syw = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      const breath = kind === 'planet' || kind === 'moon' ? 1 + L.bass * 0.02 : 1;
      const centers = kind === 'orrery' ? S.bodies.map(b => { const a = b.phase + t * b.speed * (reduce ? 0 : 1); return [Math.cos(a) * b.orbit, 0, Math.sin(a) * b.orbit]; }) : null;
      const mph = SKY.phase * Math.PI * 2, mLx = Math.sin(mph), mLz = Math.cos(mph);
      const n = S.n;
      for (let i = 0; i < N; i++) {
        if (i >= n && (kind === 'image' || kind === 'mask')) break;
        const j = tgt[i];
        let x = px[i] * breath, y = py[i] * breath, z = pz[i] * breath;
        const gp = S.grp[j];
        if (gp >= 0 && centers) { x += centers[gp][0]; y += centers[gp][1]; z += centers[gp][2]; }
        const x1 = x * cyw - z * syw, z1 = x * syw + z * cyw;
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        const persp = FOCAL / (FOCAL + z2); if (persp <= 0) continue;
        const c = ((cam.cx + x1 * persp) / CW) | 0, r = ((cam.cy + y2 * persp) / CH) | 0;
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        const cell = r * cols + c;
        if (z2 >= zb[cell]) continue;
        let v = S.val[j];
        if (v >= 0) {
          const nx = S.nrm[j * 3], ny = S.nrm[j * 3 + 1], nz = S.nrm[j * 3 + 2];
          let lam;
          if (gp >= 0 && centers) { const [cx, cy, cz] = centers[gp], ln = Math.hypot(cx, cy, cz) || 1; lam = Math.max(0, -(nx * cx + ny * cy + nz * cz) / ln); }
          else {
            const n1 = nx * cyw - nz * syw, nz1 = nx * syw + nz * cyw, n2 = ny * cp - nz1 * sp, nz2 = ny * sp + nz1 * cp;
            lam = S.moonLight ? Math.max(0, n1 * mLx + nz2 * mLz) : Math.max(0, n1 * LX + n2 * LY + nz2 * LZ);
          }
          v = (0.1 + 0.9 * lam) * v;
        } else v = -v;
        zb[cell] = z2; sh[cell] = Math.max(0.07, v);
        if (c < minC) minC = c; if (c > maxC) maxC = c; if (r < minR) minR = r; if (r > maxR) maxR = r;
      }
    }

    g.clearRect(0, 0, W, H);
    g.font = `500 ${Math.round(CH * 0.74)}px "IBM Plex Mono", monospace`; g.textBaseline = 'top';
    const ox = c => (c % cols) * CW, oy = c => ((c / cols) | 0) * CH;

    // sky
    if (!reduce && (!twinkle.s || now - twinkle.t0 > 1400) && stars.length) twinkle = { s: stars[(Math.random() * stars.length) | 0], t0: now };
    const skyA = maskText ? 0.6 : 1;
    for (const st of stars) {
      if (sh[st.i]) continue;
      let a = st.a;
      if (st === twinkle.s) a = Math.min(1, a + Math.sin(Math.min(1, (now - twinkle.t0) / 1400) * Math.PI) * 0.55);
      g.fillStyle = `rgba(${INK},${(a * skyA).toFixed(3)})`;
      g.fillText(st.ch, ox(st.i), oy(st.i));
    }
    if (constel && !maskText) {
      for (const [cell, ch] of constel.cells) {
        if (sh[cell]) continue;
        g.fillStyle = `rgba(${INK},${ch === '+' ? 0.7 : 0.16})`;
        g.fillText(ch, ox(cell), oy(cell));
      }
      g.fillStyle = `rgba(${INK},0.4)`; g.fillText(constel.label, constel.lx, constel.ly);
    }
    if (!reduce && !maskText && now > shoot.next && shoot.t0 < 0) shoot = { t0: now, x: W * (0.2 + Math.random() * 0.6), y: H * (0.05 + Math.random() * 0.25), next: 0 };
    if (shoot.t0 > 0) {
      const p = (now - shoot.t0) / 900;
      if (p > 1) shoot = { t0: -1, next: now + 25000 + Math.random() * 25000 };
      else for (let q = 0; q < 9; q++) {
        const x = shoot.x + (p * 260 - q * 9), y = shoot.y + (p * 260 - q * 9) * 0.35;
        g.fillStyle = `rgba(${INK},${((1 - q / 9) * Math.sin(p * Math.PI) * 0.8).toFixed(3)})`;
        g.fillText(q ? '-' : '*', Math.round(x / CW) * CW, Math.round(y / CH) * CH);
      }
    }

    // object
    if (objA > 0) {
      bLen.fill(0);
      for (let r = minR; r <= maxR; r++) for (let c = minC; c <= maxC; c++) {
        const i = r * cols + c, s = sh[i]; if (!s) continue;
        const a = (0.3 + s * 0.7) * objA;
        const bk = Math.min(7, (a * 8) | 0), n2 = bLen[bk]++;
        bIdx[bk][n2] = i; bChr[bk][n2] = Math.max(1, Math.min(RAMP.length - 1, Math.round(s * (RAMP.length - 1))));
      }
      for (let b = 0; b < 8; b++) {
        const n = bLen[b]; if (!n) continue;
        g.fillStyle = `rgba(${INK},${((b + 1) / 8).toFixed(3)})`;
        for (let q = 0; q < n; q++) { const i = bIdx[b][q]; g.fillText(RAMP[bChr[b][q]], ox(i), oy(i)); }
      }
    }
    requestAnimationFrame(frame);
  }

  addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });
  resize();
  requestAnimationFrame(frame);

  return {
    sky: SKY,
    setMask(text) { maskText = text; swap(true); },
    dissolveMask() { maskText = null; cam.yaw = 0.5; cam.pitch = -0.28; swap(false); },
    showImage(src) { if (src === imgSrc) return; imgSrc = src; if (!maskText) swap(false); },
    setView(v, opts = {}) {
      if (opts.count) count = opts.count;
      if (v === view && !imgSrc) return;
      view = v; imgSrc = null;
      if (!maskText) swap(false);
    },
  };
})();
