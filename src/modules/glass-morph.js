import { gsap } from 'gsap';

export function createGlassMorphTimeline(selector, scrollTriggerConfig) {
  const el = document.querySelector(selector);
  if (!el) return;

  const content = el.querySelector('.glass-content');
  const lines = el.querySelectorAll('.reveal-line');

  const tl = gsap.timeline({
    scrollTrigger: {
      ...scrollTriggerConfig,
      scrub: true
    }
  });

  tl.fromTo(el, 
    { opacity: 0, clipPath: 'circle(0% at 50% 50%)' },
    { opacity: 1, clipPath: 'circle(100% at 50% 50%)', ease: 'none' }
  );

  if (content) {
    tl.fromTo(content, 
      { scale: 0.94 },
      { scale: 1, ease: 'none' },
      '<'
    );
  }

  if (lines.length > 0) {
    tl.fromTo(lines,
      { y: '100%' },
      { y: '0%', stagger: 0.1, ease: 'none' },
      '<'
    );
  }

  return tl;
}
