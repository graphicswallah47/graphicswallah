/**
 * Graphics Wallah — Custom Cursor
 * Minimal circular cursor with gold accent.
 * Expands on interactive elements, shows contextual text.
 * Desktop only — hidden on touch devices.
 */

const GWCursor = (() => {
  let cursorEl, dotEl, circleEl, textEl;
  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  let rafId = null;
  let isTouch = false;

  function init() {
    // Detect touch device
    isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    cursorEl = document.getElementById('custom-cursor');
    dotEl = cursorEl.querySelector('.cursor__dot');
    circleEl = cursorEl.querySelector('.cursor__circle');
    textEl = cursorEl.querySelector('.cursor__text');

    if (!cursorEl) return;

    document.body.classList.add('has-custom-cursor');

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    setupInteractiveElements();
    animate();
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function animate() {
    // Smooth lerp for cursor following
    const ease = 0.15;
    currentX += (mouseX - currentX) * ease;
    currentY += (mouseY - currentY) * ease;

    if (cursorEl) {
      cursorEl.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }

    rafId = requestAnimationFrame(animate);
  }

  function setupInteractiveElements() {
    // Elements with data-cursor-text attribute
    const interactives = document.querySelectorAll('[data-cursor-text], a, button');

    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorEl.classList.add('active');
        const text = el.getAttribute('data-cursor-text');
        if (text && textEl) {
          textEl.textContent = text;
        }
      });

      el.addEventListener('mouseleave', () => {
        cursorEl.classList.remove('active');
        if (textEl) textEl.textContent = '';
      });
    });
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    document.removeEventListener('mousemove', onMouseMove);
    document.body.classList.remove('has-custom-cursor');
  }

  return { init, destroy };
})();
