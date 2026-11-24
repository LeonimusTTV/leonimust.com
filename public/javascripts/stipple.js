// Image → readable point cloud ("stippling"), shared by D · nuée and G · nuée 3D.
// 1. density = how different a pixel is from its local background
//    (background estimated per row from the left/right edges, so gradient backdrops vanish),
//    or alpha when the image is transparent, plus an edge boost so outlines read.
// 2. auto-crop to the subject, fit it into the target box.
// 3. Floyd–Steinberg on a grid sized so ~maxPts dots come out → structured, not random.
// Returns { pts: Float32Array [x, y, density, luminance, ...], n } in screen px.
// Throws if the canvas is tainted (file://) so callers can fall back.
window.Stipple = function (im, box, maxPts) {
  const [bx0, by0, bx1, by1] = box;
  const A = 220 / Math.max(im.width, im.height);
  const aw = Math.max(8, Math.round(im.width * A)), ah = Math.max(8, Math.round(im.height * A));
  const c = document.createElement('canvas'); c.width = aw; c.height = ah;
  const o = c.getContext('2d', { willReadFrequently: true });
  o.drawImage(im, 0, 0, aw, ah);
  const d = o.getImageData(0, 0, aw, ah).data; // may throw: tainted

  const n = aw * ah;
  const lum = new Float32Array(n), dens = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;

  const E = 3; // edge strip width used to estimate the background of each row
  for (let y = 0; y < ah; y++) {
    let r = 0, g = 0, b = 0, k = 0;
    for (const x0 of [0, aw - E]) for (let x = x0; x < x0 + E; x++) {
      const i = (y * aw + x) * 4;
      if (d[i + 3] > 200) { r += d[i]; g += d[i + 1]; b += d[i + 2]; k++; }
    }
    const hasBg = k >= E; // at least half of the strip is opaque
    if (hasBg) { r /= k; g /= k; b /= k; }
    for (let x = 0; x < aw; x++) {
      const i = y * aw + x, a = d[i * 4 + 3] / 255;
      let v;
      if (hasBg) {
        const dr = d[i * 4] - r, dg = d[i * 4 + 1] - g, db = d[i * 4 + 2] - b;
        v = Math.min(1, Math.sqrt(dr * dr + dg * dg + db * db) / 150);
      } else v = 0.55 + 0.45 * lum[i];   // transparent logo: the shape itself, lighter parts denser
      dens[i] = v * a;
    }
  }
  // edge boost (sobel on luminance × alpha)
  const la = new Float32Array(n);
  for (let i = 0; i < n; i++) la[i] = lum[i] * (d[i * 4 + 3] / 255);
  const out = new Float32Array(n);
  // tone inside the subject: shading like an engraving (darker = more ink), so a flat
  // silhouette still shows its inner detail
  let tlo = 1, thi = 0;
  for (let i = 0; i < n; i++) if (dens[i] > 0.3) { if (lum[i] < tlo) tlo = lum[i]; if (lum[i] > thi) thi = lum[i]; }
  const tspan = Math.max(0.08, thi - tlo);
  for (let y = 1; y < ah - 1; y++) for (let x = 1; x < aw - 1; x++) {
    const i = y * aw + x;
    const gx = la[i - aw + 1] + 2 * la[i + 1] + la[i + aw + 1] - la[i - aw - 1] - 2 * la[i - 1] - la[i + aw - 1];
    const gy = la[i + aw - 1] + 2 * la[i + aw] + la[i + aw + 1] - la[i - aw - 1] - 2 * la[i - aw] - la[i - aw + 1];
    const subj = Math.min(1, dens[i] * 1.6);
    const tone = 1 - (lum[i] - tlo) / tspan;
    out[i] = Math.min(1, subj * (0.14 + 0.62 * Math.pow(Math.max(0, tone), 1.2)) + Math.sqrt(gx * gx + gy * gy) * 1.1 * (subj > 0.15 ? 1 : 0.3));
  }

  // crop to the subject
  let cx0 = aw, cy0 = ah, cx1 = 0, cy1 = 0;
  for (let y = 0; y < ah; y++) for (let x = 0; x < aw; x++) if (dens[y * aw + x] > 0.3) { if (x < cx0) cx0 = x; if (x > cx1) cx1 = x; if (y < cy0) cy0 = y; if (y > cy1) cy1 = y; }
  if (cx1 <= cx0 || cy1 <= cy0) { cx0 = 0; cy0 = 0; cx1 = aw - 1; cy1 = ah - 1; }
  const m = Math.round(Math.max(cx1 - cx0, cy1 - cy0) * 0.04);
  cx0 = Math.max(0, cx0 - m); cy0 = Math.max(0, cy0 - m); cx1 = Math.min(aw - 1, cx1 + m); cy1 = Math.min(ah - 1, cy1 + m);
  const cw = cx1 - cx0 + 1, chh = cy1 - cy0 + 1;

  const s = Math.min((bx1 - bx0) / cw, (by1 - by0) / chh);
  const ox = bx0 + ((bx1 - bx0) - cw * s) / 2, oy = by0 + ((by1 - by0) - chh * s) / 2;

  // pick a cell size so the dithered dot count lands near maxPts
  let T = 0;
  for (let y = cy0; y <= cy1; y++) for (let x = cx0; x <= cx1; x++) T += out[y * aw + x];
  let k = Math.max(0.5, Math.sqrt(T / maxPts));
  const gw = Math.max(2, Math.floor(cw / k)), gh = Math.max(2, Math.floor(chh / k));
  k = cw / gw;
  const grid = new Float32Array(gw * gh), gl = new Float32Array(gw * gh);
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    // box sample (nearest-ish; k can be < 1 so sample at least one pixel)
    const sx0 = cx0 + Math.floor(x * k), sy0 = cy0 + Math.floor(y * (chh / gh));
    const sx1 = Math.max(sx0 + 1, cx0 + Math.floor((x + 1) * k)), sy1 = Math.max(sy0 + 1, cy0 + Math.floor((y + 1) * (chh / gh)));
    let sum = 0, sl = 0, c2 = 0;
    for (let yy = sy0; yy < Math.min(sy1, ah); yy++) for (let xx = sx0; xx < Math.min(sx1, aw); xx++) { sum += out[yy * aw + xx]; sl += lum[yy * aw + xx]; c2++; }
    grid[y * gw + x] = c2 ? sum / c2 : 0; gl[y * gw + x] = c2 ? sl / c2 : 0;
  }
  const work = grid.slice(), pts = [];
  const cellX = (cw * s) / gw, cellY = (chh * s) / gh;
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const i = y * gw + x, v = work[i], q = v > 0.5 ? 1 : 0, e = v - q;
    if (q) pts.push(ox + (x + 0.5 + (Math.random() - 0.5) * 0.3) * cellX, oy + (y + 0.5 + (Math.random() - 0.5) * 0.3) * cellY, grid[i], gl[i]);
    if (x + 1 < gw) work[i + 1] += e * 7 / 16;
    if (y + 1 < gh) { if (x > 0) work[i + gw - 1] += e * 3 / 16; work[i + gw] += e * 5 / 16; if (x + 1 < gw) work[i + gw + 1] += e / 16; }
  }
  // too many? thin out evenly
  let arr = pts;
  if (pts.length / 4 > maxPts) {
    const keep = maxPts / (pts.length / 4); arr = [];
    for (let i = 0; i < pts.length; i += 4) if (Math.random() < keep) arr.push(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]);
  }
  return { pts: Float32Array.from(arr), n: arr.length / 4 };
};
