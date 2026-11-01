import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js';
import { createGlassMorphTimeline } from './glass-morph.js';
import { showNav } from './nav.js';

export async function initHero(player1) {
  const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!isReduced) {
    await new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: resolve });
      
      tl.fromTo('#hero-name-wrap', 
        { opacity: 0, y: 36, scale: 0.96 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: CONFIG.INTRO_SLIDE_DURATION, 
          ease: 'expo.out',
          onComplete: () => {
            gsap.set('#hero-name-wrap', { clearProps: 'transform' });
          }
        }
      );
      
      tl.fromTo('#hero-caption', { opacity: 0 }, { opacity: 0.85, duration: 1 }, '-=0.5');
      tl.fromTo('#scroll-cue', { opacity: 0 }, { opacity: 1, duration: 1 }, '<');
    });
  } else {
    gsap.set('#hero-name-wrap', { opacity: 1, y: 0, scale: 1 });
    gsap.set(['#hero-caption', '#scroll-cue'], { opacity: 1 });
  }

  const nav = document.getElementById('main-nav');
  if (nav) {
    nav.classList.add('is-visible');
    if (!isReduced) {
      gsap.fromTo(nav, { y: -60 }, { y: 0, duration: 1, ease: 'power3.out' });
    }
  }

  if (!isReduced) {
    ScrollTrigger.create({
      trigger: '#hero-section',
      start: 'top top',
      end: `+=${CONFIG.SEQ1_SCROLL_VH}svh`,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        player1.setProgress(self.progress);
      }
    });

    const heroFadeTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: `+=${CONFIG.SEQ1_SCROLL_VH * CONFIG.HERO_FADE_END}svh`,
        scrub: true
      }
    });
    
    heroFadeTl.fromTo('#hero-intro', { opacity: 1, y: 0 }, { opacity: 0, y: -60, ease: 'none' });

    gsap.to('#scroll-cue', {
      opacity: 0,
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: `+=${CONFIG.SEQ1_SCROLL_VH * 0.02}svh`,
        scrub: true
      }
    });

    createGlassMorphTimeline('#glass-morph-1', {
      trigger: '#hero-section',
      start: `+=${CONFIG.SEQ1_SCROLL_VH * CONFIG.GLASS_MORPH_START}svh`,
      end: `+=${CONFIG.SEQ1_SCROLL_VH * CONFIG.GLASS_MORPH_END}svh`
    });
  } else {
    document.querySelector('#glass-morph-1').style.opacity = 1;
    document.querySelector('#glass-morph-1').style.clipPath = 'circle(100% at 50% 50%)';
    gsap.set('#glass-morph-1 .glass-content', { scale: 1 });
    gsap.set('#glass-morph-1 .reveal-line', { y: 0 });
  }
}
