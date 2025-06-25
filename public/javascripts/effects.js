// Dynamic Cursor Effects
class DynamicCursor {
  constructor() {
    this.cursor = null;
    this.cursorDot = null;
    this.init();
  }

  init() {
    // Create cursor elements
    this.cursor = document.createElement('div');
    this.cursorDot = document.createElement('div');

    this.cursor.className = 'dynamic-cursor';
    this.cursorDot.className = 'dynamic-cursor-dot';

    document.body.appendChild(this.cursor);
    document.body.appendChild(this.cursorDot);

    this.addStyles();
    this.bindEvents();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
            .dynamic-cursor {
                position: fixed;
                width: 20px;
                height: 20px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: all 0.15s ease;
                transform: translate(-50%, -50%);
                mix-blend-mode: difference;
            }
            
            .dynamic-cursor-dot {
                position: fixed;
                width: 4px;
                height: 4px;
                background: white;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                transform: translate(-50%, -50%);
                transition: all 0.1s ease;
            }
            
            .dynamic-cursor.hover {
                width: 40px;
                height: 40px;
                border-color: rgba(255, 255, 255, 0.6);
                background: rgba(255, 255, 255, 0.1);
            }
            
            .dynamic-cursor.click {
                width: 15px;
                height: 15px;
                background: rgba(255, 255, 255, 0.3);
            }
            
            @media (max-width: 768px) {
                .dynamic-cursor,
                .dynamic-cursor-dot {
                    display: none;
                }
            }
        `;
    document.head.appendChild(style);
  }

  bindEvents() {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    // Mouse movement
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth cursor animation
    const animateCursor = () => {
      // Cursor follows with slight delay
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;

      // Dot follows more closely
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;

      this.cursor.style.left = cursorX + 'px';
      this.cursor.style.top = cursorY + 'px';
      this.cursorDot.style.left = dotX + 'px';
      this.cursorDot.style.top = dotY + 'px';

      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover effects
    const hoverElements = 'a, button, .textiboi, .project, .nav-item';
    document.addEventListener('mouseover', (e) => {
      if (e.target.matches(hoverElements)) {
        this.cursor.classList.add('hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.matches(hoverElements)) {
        this.cursor.classList.remove('hover');
      }
    });

    // Click effects
    document.addEventListener('mousedown', () => {
      this.cursor.classList.add('click');
    });

    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('click');
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
      this.cursorDot.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
      this.cursorDot.style.opacity = '1';
    });
  }
}

// Initialize dynamic cursor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only on desktop devices
  if (window.innerWidth > 768) {
    new DynamicCursor();
  }
});

// Additional ambient effects
class AmbientEffects {
  constructor() {
    this.init();
  }

  init() {
    this.createMouseTrail();
    this.createPerformanceMonitor();
  }

  createMouseTrail() {
    const trail = [];
    const trailLength = 8;

    document.addEventListener('mousemove', (e) => {
      trail.push({ x: e.clientX, y: e.clientY, time: Date.now() });

      if (trail.length > trailLength) {
        trail.shift();
      }

      // Clean up old trail dots
      document.querySelectorAll('.mouse-trail').forEach(dot => {
        if (Date.now() - parseInt(dot.dataset.time) > 500) {
          dot.remove();
        }
      });

      // Create new trail dot occasionally
      if (Math.random() > 0.85) {
        const dot = document.createElement('div');
        dot.className = 'mouse-trail';
        dot.dataset.time = Date.now();
        dot.style.cssText = `
                    position: fixed;
                    width: 2px;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1;
                    left: ${e.clientX}px;
                    top: ${e.clientY}px;
                    animation: trailFade 0.5s ease-out forwards;
                `;
        document.body.appendChild(dot);
      }
    });

    // Add trail fade animation
    const style = document.createElement('style');
    style.textContent = `
            @keyframes trailFade {
                0% {
                    opacity: 0.6;
                    transform: scale(1);
                }
                100% {
                    opacity: 0;
                    transform: scale(0);
                }
            }
        `;
    document.head.appendChild(style);
  }

  createPerformanceMonitor() {
    // Subtle frame rate dependent effects
    let lastTime = 0;
    let frameCount = 0;
    let fps = 60;

    const updateFPS = (currentTime) => {
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // Adjust effect intensity based on performance
        document.body.style.setProperty('--performance-factor', fps / 60);
      }
      requestAnimationFrame(updateFPS);
    };
    requestAnimationFrame(updateFPS);
  }
}

// Initialize ambient effects
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth > 768) {
    new AmbientEffects();
  }
});
