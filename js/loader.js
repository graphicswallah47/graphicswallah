/**
 * Graphics Wallah — Loader
 * Handles preloading animation frames with createImageBitmap for GPU-ready rendering.
 * Shows a minimal premium loading screen with gold progress bar.
 */

const GWLoader = (() => {
  const ANIM1_PATH = 'assets/1st-animation/ezgif-frame-';
  const ANIM2_PATH = 'assets/2nd-animation/ezgif-frame-';
  const TOTAL_FRAMES = 240;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  // On mobile, load every 2nd frame to save memory
  const FRAME_STEP = isMobile ? 2 : 1;
  const EFFECTIVE_FRAMES = Math.ceil(TOTAL_FRAMES / FRAME_STEP);

  let anim1Frames = [];
  let anim2Frames = [];
  let onProgressCallback = null;
  let onAnim1ReadyCallback = null;
  let onAnim2ReadyCallback = null;

  function padNumber(num, length = 3) {
    return String(num).padStart(length, '0');
  }

  function getFrameIndices() {
    const indices = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += FRAME_STEP) {
      indices.push(i);
    }
    return indices;
  }

  async function loadFrame(path, index) {
    const url = `${path}${padNumber(index)}.jpg`;
    const response = await fetch(url);
    const blob = await response.blob();
    return createImageBitmap(blob);
  }

  async function loadAnimationFrames(basePath, frameIndices, progressOffset, progressScale) {
    const frames = [];
    const batchSize = 8; // Load 8 frames concurrently
    
    for (let i = 0; i < frameIndices.length; i += batchSize) {
      const batch = frameIndices.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(idx => loadFrame(basePath, idx))
      );
      frames.push(...batchResults);
      
      const progress = progressOffset + ((i + batch.length) / frameIndices.length) * progressScale;
      if (onProgressCallback) onProgressCallback(progress);
    }
    
    return frames;
  }

  async function init(callbacks = {}) {
    onProgressCallback = callbacks.onProgress || null;
    onAnim1ReadyCallback = callbacks.onAnim1Ready || null;
    onAnim2ReadyCallback = callbacks.onAnim2Ready || null;

    const frameIndices = getFrameIndices();
    
    // Load Animation 1 first (critical path)
    anim1Frames = await loadAnimationFrames(ANIM1_PATH, frameIndices, 0, 0.7);
    if (onAnim1ReadyCallback) onAnim1ReadyCallback(anim1Frames);

    // Load Animation 2 (secondary, but still before interaction)
    anim2Frames = await loadAnimationFrames(ANIM2_PATH, frameIndices, 0.7, 0.3);
    if (onAnim2ReadyCallback) onAnim2ReadyCallback(anim2Frames);
  }

  function getAnim1Frames() { return anim1Frames; }
  function getAnim2Frames() { return anim2Frames; }
  function getEffectiveFrameCount() { return EFFECTIVE_FRAMES; }
  function getIsMobile() { return isMobile; }

  return { init, getAnim1Frames, getAnim2Frames, getEffectiveFrameCount, getIsMobile };
})();
