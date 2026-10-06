import '@fontsource-variable/bricolage-grotesque/standard.css';
import './site.css';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SKELL, formatK } from './js/config.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Smooth scroll ----------------------------------------------------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

$$('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -68 });
    else if (target === 0) window.scrollTo(0, 0);
    else target.scrollIntoView();
  });
});

/* Numbers from config ----------------------------------------------------- */
const { subscribers, milestones } = SKELL;
const goal = milestones.find((m) => m > subscribers) ?? Math.ceil((subscribers + 1) / 5000) * 5000;

$$('.js-subs, .js-subs-text').forEach((el) => (el.textContent = formatK(subscribers)));
$('.js-goal').textContent = formatK(goal);
$('.js-togo').textContent = (goal - subscribers).toLocaleString('en-US');
$('.js-year').textContent = new Date().getFullYear();

const list = $('.js-milestones');
[...new Set([...milestones, goal])]
  .sort((a, b) => a - b)
  .forEach((m) => {
    const li = document.createElement('li');
    if (subscribers >= m) {
      li.className = 'is-done';
      li.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check" /></svg>';
      li.append(formatK(m));
      li.setAttribute('aria-label', `${formatK(m)}, reached`);
    } else if (m === goal) {
      li.className = 'is-next';
      li.textContent = `${formatK(m)} next`;
    } else {
      li.textContent = formatK(m);
    }
    list.append(li);
  });

/* Nav goes solid once you leave the top of the hero ----------------------- */
const nav = $('[data-nav]');
ScrollTrigger.create({
  start: 64,
  end: 'max',
  onToggle: (self) => nav.classList.toggle('is-solid', self.isActive),
});

/* Copy buttons ------------------------------------------------------------ */
const announcer = $('#announcer');

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

$$('.js-copy').forEach((btn) => {
  const label = btn.querySelector('.js-copy-label');
  const use = btn.querySelector('.icon use');
  let timer = 0;
  btn.addEventListener('click', async () => {
    const value = btn.dataset.copy;
    const ok = await copyText(value);
    announcer.textContent = ok ? `Copied ${value}` : `Couldn't copy. It's ${value}`;
    if (!ok) return;
    label.textContent = 'Copied';
    use?.setAttribute('href', '#i-check');
    btn.classList.add('is-copied');
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = btn.dataset.label;
      use?.setAttribute('href', '#i-copy');
      btn.classList.remove('is-copied');
    }, 1800);
  });
});

/* Motion ------------------------------------------------------------------ */
if (!reduced) {
  // Hero: the image settles in, then the copy rises
  gsap.from('.hero__media img', { scale: 1.08, duration: 2.2, ease: 'power3.out' });
  gsap.from('.hero__title, .hero__lede, .hero__ctas', {
    y: 32,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.2,
  });

  // Hero image drifts a little slower than the page
  gsap.to('.hero__media', {
    yPercent: 14,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Content fades up once, as it arrives. Opacity only (not visibility), so
  // keyboard users can still tab to anything that hasn't revealed yet.
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Subscriber count ticks up when the section arrives
  const subsEl = $('.js-subs');
  const counter = { v: 0 };
  subsEl.textContent = '0';
  ScrollTrigger.create({
    trigger: '.troop',
    start: 'top 70%',
    once: true,
    onEnter: () =>
      gsap.to(counter, {
        v: subscribers,
        duration: 1.8,
        ease: 'power3.out',
        onUpdate: () => (subsEl.textContent = formatK(counter.v)),
      }),
  });
}

window.addEventListener('load', () => ScrollTrigger.refresh());
