/**
 * Graphics Wallah — Main Application
 * Orchestrates loading, animations, and all interactive modules.
 */

(async () => {
  'use strict';

  // --- DOM References ---
  const loader = document.getElementById('loader');
  const loaderProgress = document.getElementById('loader-progress');
  const scrollIndicator = document.getElementById('scroll-indicator');
  const heroSection = document.getElementById('hero');
  const aboutSection = document.getElementById('about');
  const impactSection = document.getElementById('impact');
  const heroOverlay = document.getElementById('hero-overlay');
  const impactOverlay = document.getElementById('impact-overlay');
  const aboutBg = document.querySelector('.about__bg');

  // --- State ---
  let anim1Instance = null;
  let anim2Instance = null;

  // --- Prevent scroll during load ---
  document.body.classList.add('loading');

  // --- Initialize GSAP ---
  gsap.registerPlugin(ScrollTrigger);

  // --- Start Loading ---
  try {
    await GWLoader.init({
      onProgress: (progress) => {
        // Update loader progress bar (0 to 1)
        if (loaderProgress) {
          loaderProgress.style.width = `${Math.round(progress * 100)}%`;
        }
      },
      onAnim1Ready: (frames) => {
        // Create and initialize Animation 1
        anim1Instance = GWCanvasAnimation.create({
          canvas: document.getElementById('canvas-anim1'),
          frames: frames,
          section: heroSection,
          scrollDistance: 6,
          overlayEl: heroOverlay,
          overlayShowProgress: 0.65
        });

        // Set the about section background to the last frame
        if (aboutBg && frames.length > 0) {
          const lastFrame = frames[frames.length - 1];
          // Draw last frame to a temporary canvas and export as data URL
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = lastFrame.width;
          tempCanvas.height = lastFrame.height;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(lastFrame, 0, 0);
          aboutBg.style.backgroundImage = `url(${tempCanvas.toDataURL('image/jpeg', 0.8)})`;
        }
      },
      onAnim2Ready: (frames) => {
        // Create and initialize Animation 2
        anim2Instance = GWCanvasAnimation.create({
          canvas: document.getElementById('canvas-anim2'),
          frames: frames,
          section: impactSection,
          scrollDistance: 6,
          overlayEl: impactOverlay,
          overlayShowProgress: 0.7
        });
      }
    });
  } catch (err) {
    console.error('Graphics Wallah — Loading error:', err);
  }

  // --- Hide Loader & Reveal Site ---
  document.body.classList.remove('loading');
  if (loader) {
    loader.classList.add('hidden');
    // Remove from DOM after transition
    setTimeout(() => {
      loader.style.display = 'none';
    }, 1000);
  }

  // --- Initialize Animations ---
  if (anim1Instance) anim1Instance.init();
  if (anim2Instance) anim2Instance.init();

  // --- Initialize Modules ---
  GWNavigation.init();
  GWCursor.init();
  GWBrands.init();

  // --- Show Nav after scrolling past hero ---
  ScrollTrigger.create({
    trigger: heroSection,
    start: 'bottom 80%',
    onEnter: () => GWNavigation.show(),
    onLeaveBack: () => GWNavigation.hide()
  });

  // --- Scroll Indicator: hide after scrolling ---
  if (scrollIndicator) {
    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: '+=200',
      onLeave: () => scrollIndicator.classList.add('hidden'),
      onEnterBack: () => scrollIndicator.classList.remove('hidden')
    });
  }

  // --- About Section Text Reveals ---
  const aboutParas = document.querySelectorAll('.about__para');
  aboutParas.forEach((para, i) => {
    ScrollTrigger.create({
      trigger: para,
      start: 'top 80%',
      onEnter: () => {
        setTimeout(() => para.classList.add('revealed'), i * 200);
      }
    });
  });

  // --- About Heading Reveal ---
  const aboutHeading = document.querySelector('.about__heading');
  if (aboutHeading) {
    aboutHeading.classList.add('reveal-text');
    ScrollTrigger.create({
      trigger: aboutHeading,
      start: 'top 80%',
      onEnter: () => aboutHeading.classList.add('revealed')
    });
  }

  // --- Section Heading Reveals ---
  document.querySelectorAll('.section__heading').forEach(heading => {
    if (heading === aboutHeading) return; // Already handled
    heading.classList.add('reveal-text');
    ScrollTrigger.create({
      trigger: heading,
      start: 'top 85%',
      onEnter: () => heading.classList.add('revealed')
    });
  });

  // --- About Welcome Text ---
  const welcomeText = document.querySelector('.about__welcome');
  if (welcomeText) {
    gsap.fromTo(welcomeText,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: welcomeText,
          start: 'top 80%'
        }
      }
    );
  }

  // --- Subtle parallax on about background ---
  if (aboutBg) {
    gsap.to(aboutBg, {
      yPercent: -5,
      ease: 'none',
      scrollTrigger: {
        trigger: aboutSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // --- Contact link hover micro-interactions (desktop only) ---
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.contact__link').forEach(link => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link, { y: -4, duration: 0.3, ease: 'power2.out' });
      });
      link.addEventListener('mouseleave', () => {
        gsap.to(link, { y: 0, duration: 0.3, ease: 'power2.out' });
      });
    });
  }

  // --- Services section heading ---
  const servicesSection = document.getElementById('services');
  if (servicesSection) {
    gsap.fromTo(servicesSection.querySelector('.services__placeholder'),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: servicesSection,
          start: 'top 70%'
        }
      }
    );
  }

})();
