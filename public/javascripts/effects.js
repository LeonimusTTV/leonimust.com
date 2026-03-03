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
// Kanji background characters
// =====================================================
function createKanjiBackground() {
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const count = 14;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'kanji-bg-char';
    el.textContent = chars[Math.floor(Math.random() * chars.length)];

    const duration = 45 + Math.random() * 40; // 45–85s
    const delay = -(Math.random() * duration);  // start mid-cycle so they're already drifting
    const size = 14 + Math.floor(Math.random() * 10); // 14–24px
    const left = Math.random() * 100; // 0–100vw

    el.style.left = left + 'vw';
    el.style.bottom = '-40px';
    el.style.fontSize = size + 'px';
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = delay + 's';

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
  createKanjiBackground();
});
