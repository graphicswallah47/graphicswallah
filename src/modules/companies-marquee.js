import { gsap } from 'gsap';
import { MARQUEE_COMPANIES } from '../brands.js';

export function initCompaniesMarquee() {
  const track = document.getElementById('companies-track');
  if (!track) return;

  const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build the logo items using the marquee-specific order
  track.innerHTML = '';

  // Clone 3 times to guarantee smooth continuous loop across ultra-wide monitors
  const sets = [0, 1, 2];
  sets.forEach(() => {
    MARQUEE_COMPANIES.forEach((company) => {
      const card = document.createElement('div');
      card.className = 'company-logo-card';
      card.innerHTML = `
        <img src="${company.logo}" alt="${company.name}" loading="lazy">
        <span class="company-logo-name">${company.name}</span>
      `;
      track.appendChild(card);
    });
  });

  if (isReduced) {
    track.style.overflowX = 'auto';
    return;
  }

  let xOffset = 0;
  let speedMult = 1;
  // Fast-moving strip (e.g. 100-120 px/s, faster than reel drift 60 px/s)
  const BASE_SPEED = 110;

  const tick = (time, deltaTime) => {
    const dt = Math.min(deltaTime, 32);
    // Animating continuously LEFT TO RIGHT (positive offset)
    const delta = (BASE_SPEED * dt) / 1000 * speedMult;
    xOffset += delta;

    // One full set width
    const singleSetWidth = track.scrollWidth / 3;
    if (xOffset >= 0) {
      xOffset -= singleSetWidth;
    }
    track.style.transform = `translate3d(${xOffset}px, 0, 0)`;
  };

  // Start with negative offset so moving right is seamless
  const singleSetWidth = track.scrollWidth / 3;
  xOffset = -singleSetWidth;

  gsap.ticker.add(tick);

  track.addEventListener('pointerenter', () => { speedMult = 0.1; });
  track.addEventListener('pointerleave', () => { speedMult = 1; });
  track.addEventListener('pointerdown', () => { speedMult = 0.1; });
  track.addEventListener('pointerup', () => { speedMult = 1; });
}
