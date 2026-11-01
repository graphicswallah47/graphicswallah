/**
 * Every tunable for the Graphics Wallah portfolio.
 * Change a value here and the whole site adjusts — nothing is hard-coded elsewhere.
 */
export const CONFIG = {
  /* ── Scroll animation lengths (viewport heights) ────────────── */
  SEQ1_SCROLL_VH:        450,
  SEQ2_SCROLL_VH:        400,

  /* ── Frame sequences ────────────────────────────────────────── */
  MAX_FRAMES:            150,    // subsample evenly if a folder has more
  FOCAL:                 { x: 0.5, y: 0.5 },  // cover-fit focal point

  /* ── Decode sliding window ──────────────────────────────────── */
  DECODE_WINDOW_DESKTOP: 48,
  DECODE_WINDOW_PHONE:   32,

  /* ── DPR caps ───────────────────────────────────────────────── */
  DPR_CAP_DESKTOP:       2,
  DPR_CAP_PHONE:         1.75,

  /* ── Brand reel drift ───────────────────────────────────────── */
  MARQUEE_PX_PER_S:      60,

  /* ── Glass blur radii ───────────────────────────────────────── */
  GLASS_BLUR_DESKTOP:    24,
  GLASS_BLUR_PHONE:      16,

  /* ── Glass morph timeline positions (0–1 progress) ──────────── */
  GLASS_MORPH_START:     0.72,
  GLASS_MORPH_END:       0.92,

  /* ── Hero intro ─────────────────────────────────────────────── */
  HERO_FADE_END:         0.12,   // hero name/mascot gone by this progress
  INTRO_SLIDE_DURATION:  1.3,    // seconds, expo.out
  INTRO_STAGGER:         0.15,   // mascot delay after name

  /* ── Preloader ──────────────────────────────────────────────── */
  PRELOADER_WIPE_DURATION: 0.9,  // clip-path wipe, expo.inOut

  /* ── Contact section ────────────────────────────────────────── */
  CONTACT_BLUR_RADIUS:   40,     // px, pre-rendered blur on final frame
  CONTACT_PARALLAX_SCALE: 1.04,  // slow scale drift upper bound
};
