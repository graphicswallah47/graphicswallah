/**
 * Graphics Wallah — Navigation
 * Minimal nav that appears after the opening animation.
 * Smooth scrolling, active section tracking, mobile hamburger menu.
 */

const GWNavigation = (() => {
  let nav, toggle, menu, links;
  let isMenuOpen = false;

  function init() {
    nav = document.getElementById('main-nav');
    toggle = nav?.querySelector('.nav__toggle');
    menu = nav?.querySelector('.nav__menu');
    links = nav?.querySelectorAll('.nav__link');

    if (!nav) return;

    setupToggle();
    setupLinks();
    setupActiveTracking();
  }

  function show() {
    if (nav) nav.classList.add('visible');
  }

  function hide() {
    if (nav) nav.classList.remove('visible');
  }

  function setupToggle() {
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      isMenuOpen = !isMenuOpen;
      toggle.classList.toggle('open', isMenuOpen);
      menu.classList.toggle('open', isMenuOpen);
      toggle.setAttribute('aria-expanded', isMenuOpen);
    });
  }

  function setupLinks() {
    if (!links) return;
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').replace('#', '');
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          // Close mobile menu
          if (isMenuOpen) {
            isMenuOpen = false;
            toggle?.classList.remove('open');
            menu?.classList.remove('open');
          }
        }
      });
    });
  }

  function setupActiveTracking() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => setActive(section.id),
        onEnterBack: () => setActive(section.id)
      });
    });
  }

  function setActive(sectionId) {
    if (!links) return;
    links.forEach(link => {
      const linkSection = link.getAttribute('data-section');
      link.classList.toggle('active', linkSection === sectionId);
    });
  }

  return { init, show, hide };
})();
