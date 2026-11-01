import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenis;

export function initSmoothScroll() {
  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  
  gsap.ticker.lagSmoothing(0);
}

export function getLenis() {
  return lenis;
}

export function stopScroll() {
  if (lenis) lenis.stop();
}

export function startScroll() {
  if (lenis) lenis.start();
}
