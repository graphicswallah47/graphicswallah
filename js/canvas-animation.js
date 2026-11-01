/**
 * Graphics Wallah — Canvas Scroll Animation Engine
 * Renders pre-decoded ImageBitmap frames to canvas synchronized with scroll progress.
 * Uses GSAP ScrollTrigger for pinning and progress mapping.
 */

const GWCanvasAnimation = (() => {
  // Manages a single canvas animation instance
  class ScrollAnimation {
    constructor(config) {
      this.canvas = config.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.frames = config.frames || [];
      this.section = config.section;
      this.scrollDistance = config.scrollDistance || 6; // in viewport heights
      this.overlayEl = config.overlayEl;
      this.overlayShowProgress = config.overlayShowProgress || 0.7;
      this.currentFrame = 0;
      this.scrollTrigger = null;
      this.resizeObserver = null;
      this._rafId = null;
      this._needsRender = true;
    }

    init() {
      this.resize();
      this.setupResizeObserver();
      this.setupScrollTrigger();
      this.renderFrame(0);
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._needsRender = true;
      this.renderFrame(this.currentFrame);
    }

    setupResizeObserver() {
      let resizeTimeout;
      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.resize(), 150);
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    renderFrame(index) {
      if (!this.frames.length) return;
      const frameIndex = Math.min(Math.max(Math.round(index), 0), this.frames.length - 1);
      if (frameIndex === this.currentFrame && !this._needsRender) return;
      
      this.currentFrame = frameIndex;
      this._needsRender = false;
      
      const frame = this.frames[frameIndex];
      if (!frame) return;
      
      const canvas = this.canvas;
      const ctx = this.ctx;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      
      // Cover-fit the frame
      const imgRatio = frame.width / frame.height;
      const canvasRatio = cw / ch;
      let drawW, drawH, drawX, drawY;
      
      if (imgRatio > canvasRatio) {
        drawH = ch;
        drawW = ch * imgRatio;
        drawX = (cw - drawW) / 2;
        drawY = 0;
      } else {
        drawW = cw;
        drawH = cw / imgRatio;
        drawX = 0;
        drawY = (ch - drawH) / 2;
      }
      
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(frame, drawX, drawY, drawW, drawH);
    }

    setupScrollTrigger() {
      const self = this;
      const totalFrames = this.frames.length;

      this.scrollTrigger = ScrollTrigger.create({
        trigger: this.section,
        start: 'top top',
        end: () => '+=' + (window.innerHeight * this.scrollDistance),
        pin: this.canvas.parentElement,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (st) => {
          const progress = st.progress;
          const frameIndex = Math.floor(progress * (totalFrames - 1));
          self.renderFrame(frameIndex);
          
          // Show overlay at specified progress
          if (self.overlayEl) {
            const overlayProgress = Math.max(0, (progress - self.overlayShowProgress) / (1 - self.overlayShowProgress));
            const clampedProgress = Math.min(1, overlayProgress);
            self.overlayEl.style.opacity = clampedProgress;
            // Cinematic rise: translate from below
            const translateY = (1 - clampedProgress) * 60;
            self.overlayEl.style.transform = `translateY(${translateY}px)`;
          }
        }
      });
    }

    setFrames(frames) {
      this.frames = frames;
      if (this.frames.length) {
        this.renderFrame(0);
      }
    }

    destroy() {
      if (this.scrollTrigger) this.scrollTrigger.kill();
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this._rafId) cancelAnimationFrame(this._rafId);
    }
  }

  // Public API: create animation instances
  function create(config) {
    return new ScrollAnimation(config);
  }

  return { create };
})();
