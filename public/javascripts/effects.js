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
    this.init();
  }

  init() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'dynamic-cursor';
    document.body.appendChild(this.cursor);
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this._x = e.clientX;
      this._y = e.clientY;
    });

    const animate = () => {
      // Soft follow (easing factor 0.12)
      this._cx += (this._x - this._cx) * 0.12;
      this._cy += (this._y - this._cy) * 0.12;
      this.cursor.style.left = this._cx + 'px';
      this.cursor.style.top = this._cy + 'px';
      requestAnimationFrame(animate);
    };
    animate();

    // Enlarge ring on interactive elements
    const hoverSel = 'a, button, .textiboi, .project, .nav-item, #overlay';
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
    el.style.top  = (Math.random() * 95) + 'vh';
  }

  for (let i = 0; i < MAX_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'dev-bg-char';

    const size     = 12 + Math.floor(Math.random() * 8); // 12–20px
    const duration = 5  + Math.random() * 7;             // 5–12s per cycle
    const delay    = -(Math.random() * duration);         // stagger: start mid-cycle

    el.style.fontSize         = size + 'px';
    el.style.animationDuration = duration + 's';
    el.style.animationDelay   = delay + 's';

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
  if (window.innerWidth > 768) {
    new DynamicCursor();
  }
  createDevBackground();
});
