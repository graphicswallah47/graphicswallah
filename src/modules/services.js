export function initServices() {
  const toggleBtn = document.getElementById('service-toggle-btn');
  const expandableBox = document.getElementById('service-expandable');

  if (toggleBtn && expandableBox) {
    const handleToggle = (e) => {
      e.preventDefault();
      const isExpanded = expandableBox.classList.toggle('is-expanded');
      toggleBtn.classList.toggle('is-active', isExpanded);
      toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

      const video = expandableBox.querySelector('video');
      if (video) {
        if (isExpanded) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    };

    toggleBtn.addEventListener('click', handleToggle);
  }

  // --- Video IntersectionObserver (pause off-screen, play visible) ---
  const servicesSec = document.getElementById('services');
  if (!servicesSec) return;

  const videos = servicesSec.querySelectorAll('video');
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target;
      const parentBox = v.closest('.service-box');
      // If parent is the expandable box and not expanded, keep paused
      if (parentBox && parentBox.classList.contains('service-box-expandable') && !parentBox.classList.contains('is-expanded')) {
        v.pause();
        return;
      }

      if (entry.isIntersecting) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.2 });

  videos.forEach(v => videoObserver.observe(v));
}
