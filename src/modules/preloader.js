import { gsap } from 'gsap';
import { FramePlayer } from './frame-player.js';
import { BRANDS } from '../brands.js';
import { CONFIG } from '../config.js';

export async function initPreloader() {
  return new Promise((resolve) => {
    const pctEl = document.getElementById('preloader-pct');
    const barEl = document.getElementById('preloader-bar-fill');
    
    let totalProgress = 0;
    const weights = { fetch: 0.8, decode: 0.08, fontsImages: 0.06, posters: 0.06 };
    let fetchProg1 = 0, fetchProg2 = 0;
    let isFinishing = false;
    
    const updateUI = () => {
      const displayPct = Math.min(100, Math.round(totalProgress * 100));
      if (pctEl) {
        pctEl.textContent = String(displayPct).padStart(3, '0') + '%';
      }
      if (barEl) {
        barEl.style.width = `${displayPct}%`;
      }
    };

    const canvas1 = document.getElementById('seq1-canvas');
    const canvas2 = document.getElementById('seq2-canvas');
    
    const player1 = new FramePlayer(canvas1, 1);
    const player2 = new FramePlayer(canvas2, 2);

    const checkDone = () => {
      if (totalProgress >= 0.99 && !isFinishing) {
        isFinishing = true;
        totalProgress = 1;
        updateUI();
        finishPreloader();
      }
    };

    // âœ… Safety net: if frames take too long or all fail, force-complete after 12s
    const safetyTimer = setTimeout(() => {
      if (!isFinishing) {
        console.warn('[Preloader] Safety timeout fired â€” forcing completion.');
        fetchProg1 = 1;
        fetchProg2 = 1;
        decodeDone = true;
        fontsImagesDone = true;
        postersDone = true;
        totalProgress = 1;
        updateUI();
        finishPreloader();
      }
    }, 12000);

    const fetchPromise1 = player1.loadFrames((p) => { fetchProg1 = p; recalcFetch(); });
    const fetchPromise2 = player2.loadFrames((p) => { fetchProg2 = p; recalcFetch(); });

    const recalcFetch = () => {
      const avgFetch = (fetchProg1 + fetchProg2) / 2;
      totalProgress = (avgFetch * weights.fetch) + (decodeDone ? weights.decode : 0) + (fontsImagesDone ? weights.fontsImages : 0) + (postersDone ? weights.posters : 0);
      updateUI();
      checkDone();
    };

    let decodeDone = false;
    let fontsImagesDone = false;
    let postersDone = false;
    
    const posterMap = new Map();

    Promise.all([fetchPromise1, fetchPromise2]).then(() => {
      decodeDone = true;
      recalcFetch();
    });

    const fontPromise = document.fonts ? document.fonts.ready : Promise.resolve();
    const images = ['#preloader-wordmark', '#hero-name']
      .map(sel => document.querySelector(sel))
      .filter(el => el && el.tagName === 'IMG');
    
    const imagePromises = images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => { img.onload = res; img.onerror = res; });
    });

    Promise.all([fontPromise, ...imagePromises]).then(() => {
      fontsImagesDone = true;
      recalcFetch();
    });

    const generatePosters = async () => {
      const vPromises = BRANDS.map(brand => {
        return new Promise(res => {
          if (!brand.video) return res();
          const v = document.createElement('video');
          v.preload = 'metadata';
          v.src = brand.video;
          v.muted = true;
          v.playsInline = true;
          
          v.addEventListener('loadeddata', () => {
            v.currentTime = 1;
          });
          
          v.addEventListener('seeked', () => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.floor(v.videoWidth / 4));
            canvas.height = Math.max(1, Math.floor(v.videoHeight / 4));
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
              if (blob) {
                posterMap.set(brand.video, URL.createObjectURL(blob));
              }
              res();
            }, 'image/jpeg', 0.5);
          });
          
          v.addEventListener('error', res);
        });
      });
      await Promise.all(vPromises);
    };

    generatePosters().then(() => {
      postersDone = true;
      recalcFetch();
    });

    const finishPreloader = () => {
      clearTimeout(safetyTimer); // âœ… Cancel safety fallback if we finish naturally
      const preloader = document.getElementById('preloader');
      const track = document.getElementById('preloader-track');
      const wipeCircle = document.getElementById('preloader-wipe-circle');
      const wordmark = document.getElementById('preloader-wordmark');
      const counter = document.getElementById('preloader-counter');

      if (!preloader || !track) {
        resolve({ player1, player2, posterMap });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          preloader.remove();
          resolve({ player1, player2, posterMap });
        }
      });

      // 1. Fade wordmark & counter as bar ends crop inward into a circle
      tl.to([wordmark, counter], {
        opacity: 0,
        scale: 0.96,
        duration: 0.16,
        ease: 'power2.in'
      }, 0);

      // 2. Bar ends crop inward until it reads as a circle
      tl.to(track, {
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        padding: 0,
        duration: 0.22,
        ease: 'power3.inOut'
      }, 0.04);

      // 3. That circle expands rapidly to cover full screen (fast clip-path: circle() wipe)
      tl.to(wipeCircle, {
        clipPath: 'circle(150% at 50% 50%)',
        duration: 0.30,
        ease: 'power3.in'
      }, '>');

      // 4. The moment it fully covers screen, cross-fades instantly into main page
      tl.to(preloader, {
        opacity: 0,
        duration: 0.12,
        ease: 'power1.out'
      }, '-=0.06');
    };
  });
}
