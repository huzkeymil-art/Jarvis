import '@fontsource-variable/archivo/standard.css';
import '@fontsource-variable/jetbrains-mono';
import './css/style.css';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SKELL, formatK } from './js/config.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* --------------------------------------------------------------------------
   Smooth scroll
   -------------------------------------------------------------------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else (typeof target === 'number' ? window.scrollTo(0, target) : target.scrollIntoView());
}

$$('[data-scroll]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    scrollToTarget(target);
  });
});

/* --------------------------------------------------------------------------
   Data from config
   -------------------------------------------------------------------------- */
const { subscribers, milestones } = SKELL;
const goal = milestones.find((m) => m > subscribers) ?? Math.ceil((subscribers + 1) / 5000) * 5000;
const branchMax = Math.max(milestones[milestones.length - 1], goal);
const reachedPct = Math.min(subscribers / branchMax, 1) * 100;

$('.js-goal').textContent = formatK(goal);
$('.js-togo').textContent = (goal - subscribers).toLocaleString('en-US');
$('.js-subs').textContent = formatK(subscribers);
$('.js-here-label').textContent = `Now ${formatK(subscribers)}`;
$('.js-year').textContent = new Date().getFullYear();

const nodeList = $('.js-nodes');
[...new Set([...milestones, goal])]
  .sort((a, b) => a - b)
  .forEach((m) => {
    const li = document.createElement('li');
    li.textContent = formatK(m);
    li.style.left = `${(m / branchMax) * 100}%`;
    if (subscribers >= m) li.classList.add('is-done');
    if (m === goal) li.classList.add('is-next');
    nodeList.append(li);
  });

/* --------------------------------------------------------------------------
   Fit-to-width type (hero title + footer wordmark)
   -------------------------------------------------------------------------- */
function fitText(el, width) {
  el.style.width = 'max-content';
  el.style.fontSize = '100px';
  const natural = el.getBoundingClientRect().width;
  el.style.width = '';
  if (natural) el.style.fontSize = `${(100 * width) / natural}px`;
}

const heroTitle = $('.hero__title');
const footerWord = $('.js-fit');
const chars = $$('.hero__title .char');

function fitAll() {
  // Measure the title with every letter at its resting width.
  chars.forEach((c) => (c.style.fontStretch = '100%'));
  fitText(heroTitle, innerWidthOf(heroTitle.parentElement));
  fitText(footerWord, innerWidthOf(footerWord.parentElement));
  kinetic.measure();
  marqueeMeasure();
}

function innerWidthOf(el) {
  const cs = getComputedStyle(el);
  return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
}

/* --------------------------------------------------------------------------
   Kinetic hero title: letters stretch wide near the pointer
   -------------------------------------------------------------------------- */
const kinetic = (() => {
  const state = chars.map(() => ({ cur: 100, center: 0 }));
  let px = null;
  let lastMove = -Infinity;
  let width = 1;

  function measure() {
    const box = heroTitle.getBoundingClientRect();
    width = box.width || 1;
    chars.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      state[i].center = r.left + r.width / 2 - box.left;
    });
  }

  function tick(time) {
    const box = heroTitle.getBoundingClientRect();
    if (box.bottom < 0) return;
    const idle = performance.now() - lastMove > 2600 || px === null;
    // When nobody is steering, a slow wave rolls through the letters.
    const focus = idle ? width * (0.5 + 0.5 * Math.sin(time * 0.6)) : px - box.left;
    const sigma = width * 0.2;
    chars.forEach((c, i) => {
      const d = (focus - state[i].center) / sigma;
      const target = 66 + 59 * Math.exp(-d * d);
      const s = state[i];
      s.cur += (target - s.cur) * 0.09;
      c.style.fontStretch = `${s.cur.toFixed(1)}%`;
    });
  }

  return {
    measure,
    start() {
      if (reduced) return;
      window.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        px = e.clientX;
        lastMove = performance.now();
      });
      gsap.ticker.add(tick);
    },
  };
})();

/* --------------------------------------------------------------------------
   3D forest
   -------------------------------------------------------------------------- */
// Three.js loads in its own chunk while the preloader is counting.
let forest = null;
import('./js/scene.js')
  .then(({ createForest }) => {
    forest = createForest($('.hero__canvas'), { reduced });
  })
  .catch(() => {
    // No WebGL (or the chunk failed): the hero keeps its CSS gradient backdrop.
    $('.hero__canvas')?.remove();
  });

window.addEventListener('pointermove', (e) => {
  forest?.setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
});
ScrollTrigger.create({
  trigger: '.hero',
  start: 'top top',
  end: 'bottom top',
  onUpdate: (self) => forest?.setProgress(self.progress),
});

/* --------------------------------------------------------------------------
   Preloader + intro
   -------------------------------------------------------------------------- */
function preload() {
  const pre = $('.preloader');
  const count = $('.js-count');
  const bar = $('.js-bar');
  const fonts = document.fonts
    ? Promise.all([
        document.fonts.load('900 100px "Archivo Variable"'),
        document.fonts.load('500 12px "JetBrains Mono Variable"'),
      ])
        .catch(() => {})
        .then(() => document.fonts.ready)
    : Promise.resolve();

  if (reduced) {
    return fonts.then(() => pre.remove());
  }

  const counter = { v: 0 };
  const loading = gsap.to(counter, {
    v: 100,
    duration: 2,
    ease: 'power3.inOut',
    onUpdate() {
      count.textContent = String(Math.round(counter.v)).padStart(3, '0');
      bar.style.transform = `scaleX(${counter.v / 100})`;
    },
  });

  return Promise.all([fonts, loading.then()]).then(
    () =>
      new Promise((resolve) => {
        gsap.to(pre, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.1,
          ease: 'expo.inOut',
          onStart: () => setTimeout(resolve, 380),
          onComplete: () => pre.remove(),
        });
      }),
  );
}

function intro() {
  document.body.classList.remove('is-loading');
  fitAll();
  lenis?.start();
  if (reduced) return;

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(chars, { yPercent: 115, duration: 1.5, stagger: 0.07 })
    .from('[data-intro]', { y: 26, autoAlpha: 0, duration: 1.2, stagger: 0.08 }, 0.35)
    .from('.hud__c, .hud__cross', { autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 0.5)
    .from('.nav > *', { yPercent: -140, autoAlpha: 0, duration: 1.2, stagger: 0.06 }, 0.4);

  kinetic.start();
}

/* --------------------------------------------------------------------------
   Scroll choreography
   -------------------------------------------------------------------------- */
function scrollScenes() {
  // Nav: frosted after the hero, hides while scrolling down
  const nav = $('.nav');
  let lastY = 0;
  const onScroll = (y) => {
    nav.classList.toggle('is-scrolled', y > 60);
    const delta = y - lastY;
    if (Math.abs(delta) < 6) return;
    nav.classList.toggle('is-hidden', delta > 0 && y > innerHeight * 0.6);
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  if (reduced) {
    gsap.set('.js-fill', { scaleX: reachedPct / 100 });
    gsap.set('.js-here', { left: `${reachedPct}%` });
    return;
  }

  // Hero copy drifts up and fades as you climb out of the forest
  gsap.to('.hero__inner', {
    yPercent: -18,
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true },
  });

  // About: words light up as you read
  const words = $$('.js-words .w');
  gsap.fromTo(
    words,
    { opacity: 0.14 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: '.js-words', start: 'top 82%', end: 'bottom 50%', scrub: true },
    },
  );

  // Generic reveals
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 48,
      autoAlpha: 0,
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Footer wordmark rises letter by letter
  gsap.from('.footer__word span', {
    yPercent: 105,
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.07,
    scrollTrigger: { trigger: '.footer__word', start: 'top 95%', once: true },
  });

  // Subscriber counter + milestone branch
  const subsEl = $('.js-subs');
  const here = $('.js-here');
  const counter = { v: 0 };
  subsEl.textContent = '0';
  gsap.set(here, { left: '0%' });
  gsap.set('.js-nodes li', { autoAlpha: 0, y: 12 });
  ScrollTrigger.create({
    trigger: '.troop',
    start: 'top 65%',
    once: true,
    onEnter() {
      gsap.to(counter, {
        v: subscribers,
        duration: 2.4,
        ease: 'expo.out',
        onUpdate: () => (subsEl.textContent = formatK(counter.v)),
      });
    },
  });
  ScrollTrigger.create({
    trigger: '.js-branch',
    start: 'top 85%',
    once: true,
    onEnter() {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.to('.js-nodes li', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 })
        .to('.js-fill', { scaleX: reachedPct / 100, duration: 2.2 }, 0.15)
        .to(here, { left: `${reachedPct}%`, duration: 2.2 }, 0.15);
    },
  });

  // Horizontal pillars (desktop only)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    const track = $('.js-track');
    const distance = () => track.scrollWidth - window.innerWidth;
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.pillars',
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    $$('.card').forEach((card) => {
      gsap.from(card, {
        rotate: 7,
        yPercent: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          containerAnimation: slide,
          start: 'left 100%',
          end: 'left 55%',
          scrub: true,
        },
      });
    });
  });
}

function splitWords(el) {
  const frag = document.createDocumentFragment();
  const add = (text, hot) => {
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.append(' ');
        return;
      }
      const span = document.createElement('span');
      span.className = hot ? 'w is-hot' : 'w';
      span.textContent = part;
      frag.append(span);
    });
  };
  el.childNodes.forEach((node) => add(node.textContent, node.nodeType === Node.ELEMENT_NODE));
  el.replaceChildren(frag);
}

/* --------------------------------------------------------------------------
   Marquee: drifts on its own, speeds up and flips with your scroll
   -------------------------------------------------------------------------- */
const marqueeTrack = $('.js-marquee');
let marqueeHalf = 1;
function marqueeMeasure() {
  marqueeHalf = marqueeTrack.scrollWidth / 2 || 1;
}

function marquee() {
  if (reduced) return;
  const track = marqueeTrack;
  let x = 0;
  let dir = 1;
  marqueeMeasure();
  gsap.ticker.add((_, dt) => {
    const v = lenis ? lenis.velocity : 0;
    if (Math.abs(v) > 0.5) dir = Math.sign(v);
    const speed = (0.06 + Math.min(Math.abs(v) * 0.02, 0.6)) * dt;
    x -= speed * dir;
    if (x <= -marqueeHalf) x += marqueeHalf;
    if (x > 0) x -= marqueeHalf;
    track.style.transform = `translate3d(${x}px,0,0)`;
  });
}

/* --------------------------------------------------------------------------
   Cursor, magnetic buttons, tilt
   -------------------------------------------------------------------------- */
function cursor() {
  if (!finePointer || reduced) return;
  document.documentElement.classList.add('has-cursor');
  const el = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  const label = $('.cursor__label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
  el.classList.add('is-out');

  window.addEventListener('pointermove', (e) => {
    el.classList.remove('is-out');
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
  });
  document.documentElement.addEventListener('pointerleave', () => el.classList.add('is-out'));
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    if (!t) return;
    label.textContent = t.dataset.cursor;
    el.classList.add('is-hover');
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target.closest('[data-cursor]');
    if (t && !t.contains(e.relatedTarget)) el.classList.remove('is-hover');
  });
}

function magnetic() {
  if (!finePointer || reduced) return;
  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

function tilt() {
  if (!finePointer || reduced) return;
  const term = $('.terminal');
  gsap.set(term, { transformPerspective: 1000 });
  const rx = gsap.quickTo(term, 'rotationX', { duration: 0.8, ease: 'power3' });
  const ry = gsap.quickTo(term, 'rotationY', { duration: 0.8, ease: 'power3' });
  term.addEventListener('pointermove', (e) => {
    const r = term.getBoundingClientRect();
    ry(((e.clientX - r.left) / r.width - 0.5) * 12);
    rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
  });
  term.addEventListener('pointerleave', () => {
    rx(0);
    ry(0);
  });
}

/* --------------------------------------------------------------------------
   Copy to clipboard + toast + confetti
   -------------------------------------------------------------------------- */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

const toastEl = $('.toast');
let toastTimer = 0;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
}

function burst(x, y) {
  if (reduced) return;
  const colors = ['#c6f432', '#ff5b1f', '#ede6d3', '#8cff6a'];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('i');
    const size = 6 + Math.random() * 10;
    p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size * 0.6}px;background:${colors[i % colors.length]};z-index:97;pointer-events:none;border-radius:2px`;
    document.body.append(p);
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 220;
    gsap
      .timeline({ onComplete: () => p.remove() })
      .to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 80,
        rotation: (Math.random() - 0.5) * 720,
        duration: 0.9,
        ease: 'expo.out',
      })
      .to(p, { y: '+=160', autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, 0.5);
  }
}

document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-copy]');
  if (!el) return;
  const value = el.dataset.copy;
  const ok = await copyText(value);
  toast(ok ? `Copied “${value}”` : `Couldn't copy, it's ${value}`);
  if (el.classList.contains('terminal') && ok) {
    const hint = $('.js-term-hint');
    el.classList.add('is-copied');
    hint.textContent = '[ COPIED ✓ ]';
    burst(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    setTimeout(() => {
      el.classList.remove('is-copied');
      hint.textContent = '[ PRESS TO COPY ]';
    }, 2200);
  }
});

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */
splitWords($('.js-words'));
cursor();
magnetic();
tilt();
marquee();

let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    fitAll();
    ScrollTrigger.refresh();
  }, 150);
});

preload().then(() => {
  intro();
  scrollScenes();
  ScrollTrigger.refresh();
});
