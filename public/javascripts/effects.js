// =====================================================
// Ring-only cursor — no dot, no trail
// =====================================================
class DynamicCursor {
  constructor() {
    this.cursor = null;
    this._x = 0;
    this._y = 0;
    this._cx = 0;
    this._cy = 0;
    this._scale = 1;
    this.init();
  }

  init() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'dynamic-cursor';
    document.body.appendChild(this.cursor);
    this.bindEvents();
  }

  bindEvents() {
    // Enlarge ring on interactive elements
    const hoverSel = 'a, button, .textiboi, .project, .nav-item, #overlay';

    document.addEventListener('mousemove', (e) => {
      this._x = e.clientX;
      this._y = e.clientY;
      if (!e.target.closest(hoverSel)) {
        this.cursor.classList.remove('hover');
      }
    });

    const animate = () => {
      // Soft follow (easing factor 0.12), composited via transform only —
      // no left/top writes, so this never triggers layout.
      this._cx += (this._x - this._cx) * 0.12;
      this._cy += (this._y - this._cy) * 0.12;

      const targetScale = this.cursor.classList.contains('click') ? 16 / 22
        : this.cursor.classList.contains('hover') ? 38 / 22
        : 1;
      this._scale += (targetScale - this._scale) * 0.25;

      this.cursor.style.transform =
        `translate3d(${this._cx}px, ${this._cy}px, 0) translate(-50%, -50%) scale(${this._scale})`;
      requestAnimationFrame(animate);
    };
    animate();

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSel)) this.cursor.classList.add('hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSel)) this.cursor.classList.remove('hover');
    });

    // Shrink on click
    document.addEventListener('mousedown', () => this.cursor.classList.add('click'));
    document.addEventListener('mouseup', () => this.cursor.classList.remove('click'));

    // Hide when leaving window
    document.addEventListener('mouseleave', () => { this.cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { this.cursor.style.opacity = '1'; });
  }
}

// =====================================================
// Dev background characters
// =====================================================
function createDevBackground() {
  const chars = ['<', '/>', '</', '{}', '[]', '=>', '//', '/*', '*/', '===', '&&', '||', '!', '??', '::', '()', '++', '--', '...', '#'];
  const MAX_COUNT = 20;

  function randomise(el) {
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    el.style.left = (Math.random() * 98) + 'vw';
    el.style.top = (Math.random() * 95) + 'vh';
  }

  for (let i = 0; i < MAX_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'dev-bg-char';

    const size = 12 + Math.floor(Math.random() * 8); // 12–20px
    const duration = 5 + Math.random() * 7;             // 5–12s per cycle
    const delay = -(Math.random() * duration);         // stagger: start mid-cycle

    el.style.fontSize = size + 'px';
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = delay + 's';

    randomise(el);

    // On each completed cycle: move to a new spot and pick a new symbol
    el.addEventListener('animationiteration', () => randomise(el));

    document.body.appendChild(el);
  }
}

// =====================================================
// Init
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.innerWidth > 768 && !prefersReducedMotion) {
    new DynamicCursor();
  }
  createDevBackground();
});
