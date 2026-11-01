import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js';

export async function initContact(player2) {
  const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const contactBg = document.getElementById('contact-bg');
  const bgBlob = player2.getLastFrameBlob();

  if (contactBg && bgBlob) {
    const img = new Image();
    img.src = URL.createObjectURL(bgBlob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400 * (img.height / img.width);
      const ctx = canvas.getContext('2d');
      
      if (typeof ctx.filter !== 'undefined') {
        ctx.filter = `blur(${CONFIG.CONTACT_BLUR_RADIUS}px)`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      
      const targetCtx = contactBg.getContext('2d');
      
      const resize = () => {
        const rect = contactBg.parentElement.getBoundingClientRect();
        contactBg.width = rect.width;
        contactBg.height = rect.height;
        
        targetCtx.drawImage(canvas, 0, 0, contactBg.width, contactBg.height);
      };
      
      resize();
      window.addEventListener('resize', resize);
      
      if (!isReduced) {
        gsap.to(contactBg, {
          scale: CONFIG.CONTACT_PARALLAX_SCALE,
          ease: 'none',
          scrollTrigger: {
            trigger: '#contact',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    };
  }
}
