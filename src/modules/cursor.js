import { gsap } from 'gsap';

export function initCursor() {
  const isFine = window.matchMedia('(pointer: fine)').matches;
  if (!isFine) return;

  const cursorEl = document.getElementById('custom-cursor');
  if (!cursorEl) return;

  const innerEl = cursorEl.querySelector('.cursor-inner');
  document.documentElement.classList.add('custom-cursor-enabled');

  let currentX = -100;
  let currentY = -100;
  let targetX = -100;
  let targetY = -100;
  let isVisible = false;
  let idleTimer = null;
  let bobTween = null;
  let isBobbing = false;

  const startBob = () => {
    if (isBobbing || !innerEl) return;
    isBobbing = true;
    bobTween = gsap.to(innerEl, {
      y: 6,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  };

  const cancelBob = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (isBobbing) {
      isBobbing = false;
      if (bobTween) {
        bobTween.kill();
        bobTween = null;
      }
      if (innerEl) {
        gsap.to(innerEl, { y: 0, duration: 0.15, ease: 'power2.out', overwrite: true });
      }
    }
    idleTimer = setTimeout(startBob, 600);
  };

  let rafId = null;
  const updatePosition = () => {
    // Tip of quill is at top-left of the cropped image
    cursorEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    rafId = null;
  };

  const onPointerMove = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursorEl.classList.add('is-visible');
    }

    if (!rafId) {
      rafId = requestAnimationFrame(updatePosition);
    }

    cancelBob();
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursorEl.classList.add('is-visible');
  });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursorEl.classList.remove('is-visible');
    if (idleTimer) clearTimeout(idleTimer);
    if (bobTween) bobTween.kill();
    isBobbing = false;
    if (innerEl) gsap.set(innerEl, { y: 0 });
  });
}
