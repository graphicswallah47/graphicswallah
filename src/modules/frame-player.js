import { CONFIG } from '../config.js';

export class FramePlayer {
  constructor(canvas, seqNumber) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
    this.seqNumber = seqNumber;
    this.isPhone = matchMedia('(max-width: 820px), (pointer: coarse)').matches;
    this.deviceRatio = Math.min(window.devicePixelRatio || 1, this.isPhone ? CONFIG.DPR_CAP_PHONE : CONFIG.DPR_CAP_DESKTOP);
    
    this.frames = []; // Array of Blobs
    this.frameCount = 0;
    this.decodedFrames = new Map();
    this.decodingFrames = new Set();
    this.decodeWindow = this.isPhone ? CONFIG.DECODE_WINDOW_PHONE : CONFIG.DECODE_WINDOW_DESKTOP;
    
    this.currentFrameIndex = -1;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  async loadFrames(onProgress) {
    const basePath = `/seq/${this.seqNumber}/${this.isPhone ? 'sm' : 'lg'}`;
    const manifestUrl = `/seq/${this.seqNumber}/manifest.json`;
    
    try {
      const manifestRes = await fetch(manifestUrl);
      const manifest = await manifestRes.json();
      this.frameCount = manifest.frameCount;
      this.frames = new Array(this.frameCount).fill(null);
      
      let fetchedCount = 0;
      const BATCH_SIZE = 12;
      
      for (let batchStart = 0; batchStart < this.frameCount; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, this.frameCount);
        const batchPromises = [];
        
        for (let i = batchStart; i < batchEnd; i++) {
          const frameNum = (i + 1).toString().padStart(4, '0');
          const url = `${basePath}/${frameNum}.webp`;
          
          const p = fetch(url)
            .then(res => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.blob();
            })
            .then(blob => {
              this.frames[i] = blob;
            })
            .catch(e => {
              console.warn(`Frame ${i + 1} failed:`, e);
              // Keep frames[i] as null â€” renderFrame handles missing frames gracefully
            })
            .finally(() => {
              // âœ… Always increment â€” even on failure â€” so the loader never stalls at 000%
              fetchedCount++;
              if (onProgress) onProgress(fetchedCount / this.frameCount);
            });
          
          batchPromises.push(p);
        }
        
        await Promise.all(batchPromises);
        
        // Yield to browser so the counter paints and tab stays responsive
        await new Promise(resolve => {
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(resolve, { timeout: 50 });
          } else {
            setTimeout(resolve, 0);
          }
        });
      }
      
      await this.preloadInitialFrames();
      
    } catch (e) {
      console.error('Failed to load frames:', e);
    }
  }

  async preloadInitialFrames() {
    const initialCount = Math.min(16, this.frameCount);
    const promises = [];
    for (let i = 0; i < initialCount; i++) {
      promises.push(this.decodeFrame(i));
    }
    await Promise.all(promises);
    if (initialCount > 0) {
      this.currentFrameIndex = 0;
      this.renderFrame(0);
    }
  }

  async decodeFrame(index) {
    if (this.decodedFrames.has(index)) return this.decodedFrames.get(index);
    if (this.decodingFrames.has(index)) return null;
    if (!this.frames[index]) return null;
    
    this.decodingFrames.add(index);
    try {
      const blob = this.frames[index];
      const bitmap = await createImageBitmap(blob);
      
      this.decodedFrames.set(index, bitmap);
      this.evictFrames(index);
      return bitmap;
    } finally {
      this.decodingFrames.delete(index);
    }
  }

  evictFrames(currentIndex) {
    if (this.decodedFrames.size > this.decodeWindow) {
      let furthest = -1;
      let maxDist = -1;
      
      for (const key of this.decodedFrames.keys()) {
        const dist = Math.abs(key - currentIndex);
        if (dist > maxDist) {
          maxDist = dist;
          furthest = key;
        }
      }
      
      if (furthest !== -1) {
        const bitmap = this.decodedFrames.get(furthest);
        bitmap.close();
        this.decodedFrames.delete(furthest);
      }
    }
  }

  setProgress(progress) {
    const targetIndex = Math.round(progress * (this.frameCount - 1));
    if (targetIndex !== this.currentFrameIndex && targetIndex >= 0 && targetIndex < this.frameCount) {
      this.currentFrameIndex = targetIndex;
      this.renderFrame(targetIndex);
    }
  }

  async renderFrame(index) {
    // Attempt to decode a window around the index in the background
    const start = Math.max(0, index - Math.floor(this.decodeWindow / 2));
    const end = Math.min(this.frameCount - 1, index + Math.ceil(this.decodeWindow / 2));
    
    for (let i = start; i <= end; i++) {
      if (!this.decodedFrames.has(i)) {
        this.decodeFrame(i).catch(() => {});
      }
    }

    let bitmap = this.decodedFrames.get(index);
    
    // If not decoded yet, find the nearest decoded frame
    if (!bitmap) {
      let nearestDist = Infinity;
      let nearestIndex = -1;
      for (const key of this.decodedFrames.keys()) {
        const dist = Math.abs(key - index);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIndex = key;
        }
      }
      if (nearestIndex !== -1) {
        bitmap = this.decodedFrames.get(nearestIndex);
      }
    }

    if (bitmap) {
      requestAnimationFrame(() => this.drawCover(bitmap));
    }
  }

  drawCover(bitmap) {
    const { width: cW, height: cH } = this.canvas;
    const { width: iW, height: iH } = bitmap;
    
    const canvasRatio = cW / cH;
    const imageRatio = iW / iH;
    
    let sW, sH, sX, sY;
    
    if (canvasRatio > imageRatio) {
      sW = iW;
      sH = iW / canvasRatio;
      sX = 0;
      sY = (iH - sH) * CONFIG.FOCAL.y;
    } else {
      sW = iH * canvasRatio;
      sH = iH;
      sX = (iW - sW) * CONFIG.FOCAL.x;
      sY = 0;
    }
    
    this.ctx.drawImage(bitmap, sX, sY, sW, sH, 0, 0, cW, cH);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * this.deviceRatio;
    this.canvas.height = rect.height * this.deviceRatio;
    
    if (this.currentFrameIndex >= 0) {
      this.renderFrame(this.currentFrameIndex);
    }
  }
  
  getLastFrameBlob() {
    return this.frames[this.frameCount - 1];
  }

  destroy() {
    for (const bitmap of this.decodedFrames.values()) {
      bitmap.close();
    }
    this.decodedFrames.clear();
  }
}
