import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initImpact() {
  const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const impactSec = document.getElementById('impact');
  if (!impactSec) return;

  const title = impactSec.querySelector('.impact-title');
  const caption = impactSec.querySelector('.impact-caption');
  const bg = impactSec.querySelector('.impact-bg');

  if (isReduced) {
    if (title) gsap.set(title, { opacity: 1, y: 0 });
    if (caption) gsap.set(caption, { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#impact',
      start: 'top 75%',
      once: true
    }
  });

  if (bg) {
    gsap.fromTo(bg,
      { scale: 1.08 },
      {
        scale: 1.0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#impact',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  }

  if (title) {
    tl.fromTo(title,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' }
    );
  }

  if (caption) {
    tl.fromTo(caption,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.5'
    );
  }
}
