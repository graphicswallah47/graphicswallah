import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import './styles/main.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initSmoothScroll, stopScroll, startScroll } from './modules/smooth-scroll.js';
import { initCursor } from './modules/cursor.js';
import { initPreloader } from './modules/preloader.js';
import { initHero } from './modules/hero.js';
import { initSeq2 } from './modules/seq2.js';
import { initNav } from './modules/nav.js';
import { initBrands } from './modules/brands-drift.js';
import { initCompaniesMarquee } from './modules/companies-marquee.js';
import { initImpact } from './modules/impact.js';
import { initServices } from './modules/services.js';
import { initContact } from './modules/contact.js';

gsap.registerPlugin(ScrollTrigger);

async function bootstrap() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  
  initCursor();
  initSmoothScroll();
  stopScroll();

  const { player1, player2, posterMap } = await initPreloader();

  await initHero(player1);
  
  startScroll();
  
  initNav();
  initSeq2(player2);
  initBrands(posterMap);
  initCompaniesMarquee();
  initImpact();
  initServices();
  initContact(player2);
}

document.addEventListener('DOMContentLoaded', bootstrap);
