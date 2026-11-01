/**
 * Graphics Wallah — Brands Showcase
 * Handles brand card scroll-triggered entry animations, video playback with
 * IntersectionObserver, and 1.5x playback speed.
 */

const GWBrands = (() => {
  let cards = [];
  let videoObserver = null;

  function init() {
    cards = document.querySelectorAll('.brand-card');
    if (!cards.length) return;

    setupEntryAnimations();
    setupVideoPlayback();
  }

  function setupEntryAnimations() {
    cards.forEach((card, i) => {
      gsap.fromTo(card, 
        { x: -80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 50%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  function setupVideoPlayback() {
    // Use IntersectionObserver to play/pause videos when visible
    videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('.brand-card__video');
        if (!video) return;
        
        if (entry.isIntersecting) {
          video.playbackRate = 1.5;
          video.play().catch(() => {}); // Catch autoplay restrictions
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '100px'
    });

    cards.forEach(card => videoObserver.observe(card));
  }

  function destroy() {
    if (videoObserver) videoObserver.disconnect();
  }

  return { init, destroy };
})();
