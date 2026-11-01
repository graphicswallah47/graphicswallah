import { gsap } from 'gsap';
import { BRANDS } from '../brands.js';
import { CONFIG } from '../config.js';
import { getLenis } from './smooth-scroll.js';

let driftPaused = false;

export function initBrands(posterMap) {
  const track = document.querySelector('.brands-track');
  if (!track) return;

  const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Modal elements ---
  const modal = document.getElementById('brand-modal');
  const modalVideo = document.getElementById('modal-video');
  const modalLogo = document.getElementById('modal-logo');
  const modalHandle = document.getElementById('modal-handle');
  const modalCaption = document.getElementById('modal-caption');
  const modalLink = document.getElementById('modal-link');
  const modalClose = modal ? modal.querySelector('.brand-modal-close') : null;

  function openModal(brand, videoSrc) {
    if (!modal) return;
    driftPaused = true;
    modalVideo.src = videoSrc;
    modalVideo.muted = false;
    modalVideo.play().catch(() => {});
    modalLogo.src = brand.logo;
    modalLogo.alt = brand.name + ' logo';
    modalHandle.textContent = brand.handle;
    modalCaption.textContent = brand.caption;
    modalLink.href = brand.url;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    driftPaused = false;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.muted = true;
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeModal();
  });

  // --- Card creation ---
  const createCard = (brand, index) => {
    const card = document.createElement('div');
    card.className = 'brand-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `${brand.name} on Instagram`);
    card.tabIndex = 0;
    card.dataset.brandIndex = index % BRANDS.length;

    if (index % 2 !== 0) {
      card.style.transform = 'translateY(3svh)';
    } else {
      card.style.transform = 'translateY(-3svh)';
    }

    card.innerHTML = `
      <div class="brand-logo-chip glass"><img src="${brand.logo}" alt="${brand.name} logo" loading="lazy"></div>
      <video muted loop playsinline preload="none" poster="${posterMap.get(brand.video) || ''}" aria-hidden="true">
        <source src="${brand.video}" type="video/mp4">
      </video>
      <div class="brand-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
        <span>${brand.handle}</span>
      </div>
      <p class="brand-caption">${brand.caption}</p>
    `;
    return card;
  };

  BRANDS.forEach((brand, i) => {
    track.appendChild(createCard(brand, i));
  });

  if (!isReduced) {
    BRANDS.forEach((brand, i) => {
      track.appendChild(createCard(brand, i));
    });

    const cards = track.querySelectorAll('.brand-card');
    cards.forEach((card, i) => {
      gsap.to(card, {
        y: '+=10',
        yoyo: true,
        repeat: -1,
        duration: 6 + (i % 4),
        ease: 'sine.inOut'
      });
    });

    let xOffset = 0;
    let speedMult = 1;
    let velocityBoost = 0;

    const tick = (time, deltaTime) => {
      if (driftPaused) return;
      const dt = Math.min(deltaTime, 32);
      const baseSpeed = (CONFIG.MARQUEE_PX_PER_S * dt) / 1000;
      const totalSpeed = (baseSpeed * speedMult) + velocityBoost;
      xOffset -= totalSpeed;
      velocityBoost *= 0.9;
      const trackWidth = track.scrollWidth / 2;
      xOffset = gsap.utils.wrap(-trackWidth, 0, xOffset);
      track.style.transform = `translateX(${xOffset}px)`;
    };

    gsap.ticker.add(tick);

    track.addEventListener('pointerenter', () => { speedMult = 0.05; });
    track.addEventListener('pointerleave', () => { speedMult = 1; });
    track.addEventListener('pointerdown', () => { speedMult = 0.05; });
    track.addEventListener('pointerup', () => { speedMult = 1; });

    const lenis = getLenis();
    if (lenis) {
      lenis.on('scroll', (e) => {
        velocityBoost = gsap.utils.clamp(-40, 40, e.velocity * 0.5);
      });
    }
  } else {
    track.style.overflowX = 'auto';
    track.style.display = 'flex';
  }

  // --- Video observer ---
  const videos = track.querySelectorAll('video');
  let playingCount = 0;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting) {
        if (playingCount < 3) {
          const p = v.play();
          if (p !== undefined) {
            p.then(() => { playingCount++; }).catch(() => {});
          }
        }
      } else {
        if (!v.paused) {
          v.pause();
          playingCount = Math.max(0, playingCount - 1);
        }
      }
    });
  }, { threshold: 0.3 });

  videos.forEach(v => observer.observe(v));

  // --- Click-to-expand modal ---
  track.addEventListener('click', (e) => {
    const card = e.target.closest('.brand-card');
    if (!card) return;
    e.preventDefault();
    const brandIdx = parseInt(card.dataset.brandIndex, 10);
    const brand = BRANDS[brandIdx];
    if (!brand) return;
    const videoEl = card.querySelector('video source');
    const videoSrc = videoEl ? videoEl.src : brand.video;
    // Scale up the clicked card briefly
    gsap.to(card, { scale: 1.08, duration: 0.3, ease: 'power2.out', onComplete: () => {
      gsap.to(card, { scale: 1, duration: 0.3 });
    }});
    openModal(brand, videoSrc);
  });
}
