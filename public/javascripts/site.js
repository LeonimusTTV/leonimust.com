// leonimust.com — interface layer.
// gate → music; client-side navigation that swaps #main so the music never stops;
// page entrances; typewriter; volume; modals; the orbit scene follows the page.
//
// Animation rules (why things don't double up or lag anymore):
//  - one navigation at a time: a token discards stale fetches
//  - before any entrance, every running animation inside #main is cancelled
//  - entrances use fill: 'both', so an element waits in its *start* state
//    during its delay instead of showing, vanishing, then fading back in
//  - one typewriter at a time, cancelled by token when leaving home
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const main = $('#main');
  const GLYPHS = '<>/{}[]=;:*#%&!?+-~^';
  const QUOTES = [
    'hello from leonimust :3',
    'credits to wolfie and its old project methamphetamine.solutions',
    'i could pwned you but would i ?',
    'catjpg still watching',
  ];
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ---------------- view helpers ---------------- */
  const viewOf = root => ($('[data-view]', root) || {}).dataset?.view || 'home';
  const rowCount = () => $$('.rows > .row', main).length || 9;
  function syncView() {
    const v = viewOf(main);
    document.body.dataset.view = v;
    const where = $('#where');
    if (where) where.textContent = v === 'home' ? '' : ' / ' + ({ apps: 'apps', legal: 'legal', error: 'lost' }[v] || v);
    Orbit.setView(v, { count: rowCount() });
    bindRows();
    return v;
  }

  /* ---------------- animations ---------------- */
  function cancelAll() { main.getAnimations({ subtree: true }).forEach(a => a.cancel()); }
  const fadeUp = (el, delay = 0, dist = 10) => el && el.animate(
    [{ opacity: 0, transform: `translateY(${dist}px)` }, { opacity: 1, transform: 'none' }],
    { duration: reduce ? 1 : 520, delay: reduce ? 0 : delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
  function scramble(el, dur = 420) {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    if (reduce) { el.textContent = final; return; }
    const token = (el._scr = (el._scr || 0) + 1), t0 = performance.now();
    (function step(now) {
      if (el._scr !== token) return;
      const p = Math.min(1, (now - t0) / dur), lock = Math.floor(p * final.length);
      el.textContent = final.slice(0, lock) + [...final.slice(lock)].map(c => c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  // the random title entrance, kept from the original site (calm set only)
  const ENTRANCES = {
    type(sp) { sp.forEach((s, i) => s.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: 150 + i * 75, fill: 'both' })); return 200 + sp.length * 75; },
    flicker(sp) { sp.forEach(s => { const kf = Array.from({ length: 9 }, () => ({ opacity: Math.random() > 0.5 ? 1 : 0.1, easing: 'steps(1, end)' })); kf.push({ opacity: 1 }); s.animate(kf, { duration: 700 + Math.random() * 500, fill: 'both' }); }); return 1200; },
    scramble(sp) { sp.forEach((s, i) => { const f = s.dataset.c; let n = 0; const lock = 5 + i * 2; const id = setInterval(() => { s.textContent = n >= lock ? f : GLYPHS[(Math.random() * GLYPHS.length) | 0]; if (n++ >= lock) clearInterval(id); }, 45); }); return 45 * (5 + sp.length * 2) + 80; },
    wave(sp) { sp.forEach((s, i) => s.animate([{ transform: 'translateY(0.4em)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, delay: i * 40, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' })); return 560 + sp.length * 40; },
  };

  /* ---------------- typewriter (one at a time) ---------------- */
  let typeToken = 0;
  async function typeLoop(el) {
    const token = ++typeToken;
    let k = (Math.random() * QUOTES.length) | 0;
    const alive = () => token === typeToken && el.isConnected;
    while (alive()) {
      const s = QUOTES[k++ % QUOTES.length];
      for (let i = 1; i <= s.length && alive(); i++) { el.textContent = s.slice(0, i); await wait(45); }
      for (let i = 0; i < 50 && alive(); i++) await wait(100);
      for (let i = s.length; i >= 0 && alive(); i--) { el.textContent = s.slice(0, i); await wait(18); }
      await wait(300);
    }
  }
  const stopTyping = () => { typeToken++; };

  /* ---------------- page entrances ---------------- */
  function enter(view, ritual) {
    cancelAll();
    stopTyping();
    if (view === 'home') {
      const title = $('.title', main);
      let dur = 0;
      if (title) {
        const text = title.dataset.text || (title.dataset.text = title.textContent.trim());
        title.setAttribute('aria-label', text);
        title.innerHTML = [...text].map(c => `<span aria-hidden="true" data-c="${c}">${c}</span>`).join('');
        if (ritual && !reduce) {
          const names = Object.keys(ENTRANCES), pick = names[(Math.random() * names.length) | 0];
          dur = ENTRANCES[pick]([...title.children], title);
        } else fadeUp(title, 0, 6);
      }
      fadeUp($('.tag', main), dur);
      fadeUp($('.quote', main), dur + 150);
      $$('.menu li', main).forEach((li, i) => fadeUp(li, dur + 260 + i * 60, 6));
      const q = $('.quote', main);
      if (q) setTimeout(() => typeLoop(q), reduce ? 0 : dur + 200);
      return;
    }
    $$('.scr', main).forEach(el => scramble(el));
    fadeUp($('.page-head', main), 0, 6);
    $$('.rows > .row', main).forEach((r, i) => fadeUp(r, 80 + i * 45, 8));
    $$('.legal-section', main).forEach((s, i) => fadeUp(s, 80 + Math.min(i, 6) * 60, 8));
    fadeUp($('.back', main), 200, 0);
  }

  /* ---------------- project rows drive the scene ---------------- */
  function bindRows() {
    const hot = row => {
      $$('.row.hot', main).forEach(r => r.classList.remove('hot'));
      if (row) row.classList.add('hot');
      Orbit.showImage(row ? row.dataset.img : null);
    };
    $$('.rows > .row[data-img]', main).forEach(row => {
      row.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hot(row); });
      row.addEventListener('focusin', () => hot(row));
    });
    $$('.rows', main).forEach(list => {
      list.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hot(null); });
      list.addEventListener('focusout', e => { if (!list.contains(e.relatedTarget)) hot(null); });
    });
    // touch: the row crossing the middle of the screen is the one shown
    if (matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
      if (bindRows.io) bindRows.io.disconnect();
      bindRows.io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) hot(e.target); }), { rootMargin: '-48% 0px -48% 0px' });
      $$('.rows > .row[data-img]', main).forEach(r => bindRows.io.observe(r));
    }
  }

  /* ---------------- navigation ---------------- */
  let navToken = 0, inFlight = null;
  async function navigate(url, { push = true } = {}) {
    const u = new URL(url, location.href);
    if (u.origin !== location.origin) { location.href = url; return; }
    const target = u.pathname + u.search;
    // same page and nothing loading: nothing to do. if something IS loading, this click
    // still wins (e.g. projects → straight back home before projects arrived)
    if (push && target === location.pathname + location.search && !inFlight) return;
    const token = ++navToken;
    inFlight = target;
    stopTyping();
    document.body.classList.add('navigating');
    main.classList.add('leaving');
    let html;
    try {
      const [res] = await Promise.all([fetch(target, { headers: { 'X-Requested-With': 'fetch' } }), wait(reduce ? 0 : 150)]);
      html = await res.text();
    } catch (e) { inFlight = null; location.href = target; return; }
    if (token !== navToken) return; // a newer click won
    inFlight = null;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const next = doc.querySelector('#main');
    if (!next) { location.href = target; return; }
    cancelAll();
    main.innerHTML = next.innerHTML;
    document.title = doc.title || document.title;
    if (push && target !== location.pathname + location.search) history.pushState({ path: target }, '', target);
    scrollTo(0, 0);
    const v = syncView();
    main.classList.remove('leaving');
    document.body.classList.remove('navigating');
    enter(v, false);
  }
  // legal pages and older markup still call loadPage(url, event)
  window.loadPage = (url, e) => { if (e) e.preventDefault(); navigate(url); };

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    const u = new URL(href, location.href);
    if (u.origin !== location.origin) return;
    e.preventDefault();
    navigate(u.pathname + u.search);
  });
  addEventListener('popstate', () => { if (document.body.classList.contains('entered')) navigate(location.pathname + location.search, { push: false }); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('dialog[open]')) return;
    if (e.key === 'Escape' && document.body.dataset.view !== 'home' && document.body.classList.contains('entered')) navigate('/');
  });
  history.replaceState({ path: location.pathname }, '', location.pathname + location.search);

  /* ---------------- modals (dApp store / wip) ---------------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-modal]');
    if (b) { e.preventDefault(); const d = document.getElementById(b.dataset.modal); if (d && d.showModal) d.showModal(); return; }
    const c = e.target.closest('[data-close]');
    if (c) c.closest('dialog').close();
  });
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  /* ---------------- volume ---------------- */
  (() => {
    const bar = $('#volbar'), num = $('#volnum'), mute = $('#mute'), spec = $('#spec');
    const CELLS = 12, RAMP = ' ▁▂▃▄▅▆▇█';
    let before = 0.7;
    const draw = v => {
      const on = Math.round(v * CELLS);
      bar.innerHTML = '▮'.repeat(on) + `<span class="off">${'▮'.repeat(CELLS - on)}</span>`;
      num.textContent = String(Math.round(v * 100)).padStart(3, ' ');
      bar.setAttribute('aria-valuenow', Math.round(v * 100));
      mute.dataset.muted = v === 0 ? '1' : '';
      mute.setAttribute('aria-label', v === 0 ? 'unmute' : 'mute');
    };
    const fromX = x => { const r = bar.getBoundingClientRect(); Sound.setVolume((x - r.left) / r.width); };
    bar.addEventListener('pointerdown', e => { bar.setPointerCapture(e.pointerId); fromX(e.clientX); });
    bar.addEventListener('pointermove', e => { if (bar.hasPointerCapture(e.pointerId)) fromX(e.clientX); });
    $('#vol').addEventListener('wheel', e => { e.preventDefault(); Sound.setVolume(Sound.volume - Math.sign(e.deltaY) * 0.05); }, { passive: false });
    bar.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); Sound.setVolume(Sound.volume + 0.05); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); Sound.setVolume(Sound.volume - 0.05); }
    });
    mute.addEventListener('click', () => { if (Sound.volume > 0) { before = Sound.volume; Sound.setVolume(0); } else Sound.setVolume(before || 0.7); });
    document.addEventListener('sound:volume', e => draw(e.detail));
    draw(Sound.volume);
    let f = 0;
    (function tick() {
      if (++f % 5 === 0 && Sound.playing) {
        const L = Sound.levels(); let s = '';
        for (let i = 0; i < 6; i++) {
          const band = i < 2 ? L.bass : i < 4 ? L.mid : L.high;
          s += RAMP[Math.round(Math.min(1, band * 1.3) * (RAMP.length - 1))];
        }
        spec.textContent = s;
      }
      requestAnimationFrame(tick);
    })();
  })();

  /* ---------------- top bar: today's sky + clock ---------------- */
  const sky = $('#sky'), S = Orbit.sky;
  if (sky) sky.innerHTML = `☾ <span class="sky-l">${S.phaseName} </span>${Math.round(S.illum * 100)}%<span class="sky-l"> · ${S.glyph} ${S.sign}</span>`;
  const clock = $('#clock');
  const tickClock = () => { clock.textContent = new Date().toLocaleTimeString('fr-FR', { hour12: false }); };
  tickClock(); setInterval(tickClock, 1000);

  /* ---------------- gate ---------------- */
  const gate = $('#gate');
  syncView();
  Orbit.setMask('loading');
  const ready = () => { if (gate.classList.contains('ready')) return; gate.classList.add('ready'); Orbit.setMask('click to enter'); };
  if (Sound.audio.readyState >= 3) ready();
  Sound.audio.addEventListener('canplaythrough', ready, { once: true });
  setTimeout(ready, 1800);
  if (document.fonts) document.fonts.ready.then(() => { if (!document.body.classList.contains('entered')) Orbit.setMask(gate.classList.contains('ready') ? 'click to enter' : 'loading'); });
  gate.addEventListener('click', () => {
    if (document.body.classList.contains('entered')) return;
    Sound.start();
    document.body.classList.add('entered');
    gate.classList.add('gone');
    Orbit.dissolveMask();
    setTimeout(() => gate.remove(), 500);
    enter(document.body.dataset.view, true);
  });
  gate.focus({ preventScroll: true });
})();
