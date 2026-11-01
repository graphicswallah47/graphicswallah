import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js';
import { BRANDS } from '../brands.js';

export function initSeq2(player2) {
  const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const glass = document.getElementById('glass-morph-2');
  const grid = document.querySelector('.clients-stagger-grid');

  // Render the 7 brand cards into the grid
  if (grid) {
    grid.innerHTML = '';
    BRANDS.forEach((brand) => {
      const tile = document.createElement('div');
      tile.className = 'client-grid-tile';
      tile.innerHTML = `
        <div class="client-tile-logo-chip">
          <img src="${brand.logo}" alt="${brand.name} logo" loading="lazy">
        </div>
        <div class="client-tile-info">
          <span class="client-tile-handle">${brand.handle}</span>
          <p class="client-tile-caption">${brand.caption}</p>
        </div>
      `;
      grid.appendChild(tile);
    });
  }

  if (!isReduced) {
    // Master timeline pinned for SEQ2_SCROLL_VH
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#seq2-section',
        start: 'top top',
        end: `+=${CONFIG.SEQ2_SCROLL_VH}svh`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          // Play sequence frames up to 0.75 progress, hold last frames while grid settles
          const frameProgress = Math.min(1, self.progress / 0.75);
          player2.setProgress(frameProgress);
        }
      }
    });

    if (glass) {
      // 1. Glassmorph opens smoothly
      masterTl.fromTo(glass, 
        { opacity: 0, clipPath: 'circle(0% at 50% 50%)' },
        { opacity: 1, clipPath: 'circle(120% at 50% 50%)', ease: 'none', duration: 0.25 },
        0.55
      );

      const panel = glass.querySelector('.clients-glass-panel');
      if (panel) {
        masterTl.fromTo(panel, 
          { scale: 0.94 },
          { scale: 1, ease: 'none', duration: 0.2 },
          0.60
        );
      }

      // 2. 7 brand tiles appear one by one, staggered, settling into the 3-column grid
      const tiles = glass.querySelectorAll('.client-grid-tile');
      if (tiles.length > 0) {
        masterTl.fromTo(tiles,
          { opacity: 0, y: 30, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.03, ease: 'power2.out', duration: 0.2 },
          0.68
        );
      }

      // 3. Hold finished grid on screen briefly (from 0.88 to 1.0) before releasing pin
      masterTl.to({}, { duration: 0.12 }, 0.88);
    }
  } else {
    // Reduced motion fallback
    if (glass) {
      glass.style.opacity = '1';
      glass.style.clipPath = 'circle(100% at 50% 50%)';
      const panel = glass.querySelector('.clients-glass-panel');
      if (panel) panel.style.transform = 'scale(1)';
      const tiles = glass.querySelectorAll('.client-grid-tile');
      tiles.forEach(t => {
        t.style.opacity = '1';
        t.style.transform = 'none';
      });
    }
  }
}
