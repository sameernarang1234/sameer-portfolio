import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createScene } from './scene.js';
import { renderProjects } from './projects.js';

gsap.registerPlugin(ScrollTrigger);
const root = document.documentElement;
root.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) root.classList.add('reduced');
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

renderProjects();

/* ---------------- WebGL scene ---------------- */
let scene = null;
window.__sceneRef = () => scene;
try {
  const test = document.createElement('canvas');
  if (test.getContext('webgl2') || test.getContext('webgl')) scene = createScene($('#bg'), { reduced });
} catch (e) { console.warn('WebGL unavailable, falling back to CSS background', e); }
window.__scene = scene;
if (!scene) $('#bg').style.background = 'radial-gradient(60% 50% at 70% 30%, rgba(124,92,255,.35), transparent), radial-gradient(50% 40% at 20% 80%, rgba(46,230,197,.2), transparent)';

/* ---------------- Smooth scroll ---------------- */
let lenis = null;
window.__lenisReady = () => lenis;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on('scroll', (e) => { ScrollTrigger.update(); scene?.onScroll(e.velocity); });
  window.__lenis = lenis;
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollTo = (target, opts = {}) => (lenis ? lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts }) : (typeof target === 'number' ? window.scrollTo({ top: target, behavior: 'smooth' }) : $(target)?.scrollIntoView({ behavior: 'smooth' })));
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  if (id.length > 1 && $(id)) { e.preventDefault(); scrollTo(id, { offset: id === '#hero' ? 0 : -10 }); }
}));

/* ---------------- Helpers ---------------- */
function splitChars(el) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  el.classList.add('chars');
  text.split(' ').forEach((w, wi, arr) => {
    const word = document.createElement('span'); word.className = 'word'; word.setAttribute('aria-hidden', 'true');
    [...w].forEach((ch) => { const c = document.createElement('span'); c.className = 'char'; c.textContent = ch; word.appendChild(c); });
    el.appendChild(word);
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return $$('.char', el);
}

/* ---------------- Marquee ---------------- */
const TECH = ['TypeScript', 'React', 'Next.js', 'Rust', 'Kotlin', 'Spring WebFlux', 'Flutter', 'PostgreSQL', 'Docker', 'AWS', 'Python', 'Django', 'Node.js', 'Prisma', 'Three.js'];
const TECH2 = ['Fintech', 'Real‑time', 'Microservices', 'KYC / KYB', 'Dashboards', 'REST APIs', 'Reactive', 'CI/CD', 'JWT & RBAC', 'S3', 'Mobile', 'Full‑stack'];
function fillMarquee(el, items) {
  const html = items.map((t) => `<span class="mq-item">${t}</span>`).join('');
  el.innerHTML = html + html + html;
}
fillMarquee($('#mq1'), TECH); fillMarquee($('#mq2'), TECH2);
const marqueeTweens = $$('.marquee-row').map((row) => {
  const track = $('.marquee-track', row); const dir = +row.dataset.dir;
  const w = () => track.scrollWidth / 3;
  gsap.set(track, { x: dir > 0 ? 0 : -w() });
  const tw = gsap.to(track, { x: dir > 0 ? -w() : 0, duration: 38, ease: 'none', repeat: -1, onRepeat: () => {}, modifiers: { x: gsap.utils.unitize((x) => { const ww = w(); return gsap.utils.wrap(-ww, 0, parseFloat(x)); }, 'px') } });
  return tw;
});
if (!reduced) ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onUpdate: (self) => { const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 400); marqueeTweens.forEach((tw, i) => { gsap.to(tw, { timeScale: (i ? -1 : 1) * 1 + v * (i ? -1 : 1) * 0.6, duration: 0.4, overwrite: true }); }); } });

/* ---------------- Rotator ---------------- */
const WORDS = ['real‑time fintech dashboards', 'Rust streaming microservices', 'KYC / KYB onboarding flows', 'Flutter & React products', 'secure, reactive backends'];
(function rotator() {
  const el = $('#rotator .rot-word');
  if (reduced || !el) return;
  let i = 0;
  // single element + chained timelines: cannot pile up words, even if the tab was backgrounded
  (function cycle() {
    gsap.timeline({ delay: 2.6, onComplete: cycle })
      .to(el, { yPercent: -110, opacity: 0, duration: 0.55, ease: 'power3.in' })
      .add(() => { i = (i + 1) % WORDS.length; el.textContent = WORDS[i]; })
      .fromTo(el, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power4.out', immediateRender: false });
  })();
})();

/* ---------------- Preloader & intro ---------------- */
const pre = { v: 0 };
const preCount = $('#preCount'), preBar = $('#preBar');
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
let introDone = false;
function runIntro() {
  if (introDone) return; introDone = true;
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('.pre-inner', { yPercent: -30, opacity: 0, duration: 0.6, ease: 'power3.in' })
    .to('#preloader', { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '-=0.1')
    .add(() => { document.body.classList.remove('is-loading'); scene?.intro(); }, '-=0.7')
    .from('.hero-title .line', { yPercent: 115, rotate: 3, duration: 1.3, stagger: 0.12 }, '-=0.5')
    .to('.hero-fade', { opacity: 1, y: 0, duration: 1, stagger: 0.09 }, '-=0.9')
    .from('.nav > *', { y: -40, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=1')
    .add(() => { $('#preloader').style.display = 'none'; ScrollTrigger.refresh(); });
}
gsap.to(pre, { v: 100, duration: reduced ? 0.2 : 1.7, ease: 'power2.inOut', onUpdate: () => { const n = Math.round(pre.v); preCount.textContent = n; preBar.style.transform = `scaleX(${n / 100})`; }, onComplete: () => { fontsReady.then(runIntro); } });
setTimeout(runIntro, 6000); // safety net

/* ---------------- Reveal animations ---------------- */
if (reduced) {
  $$('.hero-fade').forEach((e) => { e.style.opacity = 1; e.style.transform = 'none'; });
} else {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12, overwrite: true, onComplete: () => els.forEach((e) => e.classList.add('in')) }),
  });
  $$('.split').forEach((el) => {
    const chars = splitChars(el);
    gsap.set(chars, { yPercent: 115, rotate: 8, opacity: 0 });
    ScrollTrigger.create({ trigger: el, start: 'top 86%', once: true, onEnter: () => gsap.to(chars, { yPercent: 0, rotate: 0, opacity: 1, duration: 1, ease: 'power4.out', stagger: { each: 0.018, from: 'start' } }) });
  });
}

/* ---------------- Counters ---------------- */
$$('[data-count]').forEach((el) => {
  const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  const set = (v) => { el.textContent = `${pre}${v.toFixed(dec)}${suf}`; };
  if (reduced) { set(end); return; }
  const o = { v: 0 };
  ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', delay: el.closest('.hero') ? 1.8 : 0, onUpdate: () => set(o.v) }) });
});

/* ---------------- Timeline fill ---------------- */
if (!reduced) gsap.to('#tlFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 70%', scrub: 0.5 } });
else $('#tlFill').style.transform = 'scaleY(1)';

/* ---------------- Section state + nav ---------------- */
const AMB = { hero: ['#6d4aff', '#1fd3c0'], about: ['#d63a8f', '#e0a23c'], experience: ['#1fd3c0', '#6d4aff'], projects: ['#3a86e0', '#6d4aff'], skills: ['#e0a23c', '#e0603f'], education: ['#e0a23c', '#1fd3c0'], contact: ['#6d4aff', '#d63a8f'] };
function setAmbient(name) { const a = AMB[name]; if (!a) return; root.style.setProperty('--amb1', a[0]); root.style.setProperty('--amb2', a[1]); }
const nav = $('#nav'), navInd = $('#navInd');
const navLinks = $$('[data-nav]');
function setActiveNav(id) {
  let found = null;
  navLinks.forEach((a) => { const on = a.dataset.nav === id; a.classList.toggle('active', on); if (on) found = a; });
  if (found) { navInd.style.opacity = 1; navInd.style.left = found.offsetLeft + 'px'; navInd.style.width = found.offsetWidth + 'px'; }
  else navInd.style.opacity = 0;
}
$$('[data-section]').forEach((sec) => {
  const name = sec.dataset.section;
  ScrollTrigger.create({
    trigger: sec, start: 'top 55%', end: 'bottom 55%',
    onEnter: () => { setAmbient(name); scene?.setSection(name); setActiveNav(name === 'education' ? 'skills' : name); },
    onEnterBack: () => { setAmbient(name); scene?.setSection(name); setActiveNav(name === 'education' ? 'skills' : name); },
  });
});
setActiveNav(null);
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { gsap.set('#progress i', { scaleX: self.progress }); const dir = self.direction; if (self.scroll() > 400) nav.classList.toggle('hide', dir === 1); else nav.classList.remove('hide'); } });

/* ---------------- Magnetic / tilt ---------------- */
if (fine && !reduced) {
  $$('.magnetic').forEach((el) => {
    const strength = 0.28;
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.5, ease: 'power3.out' }); });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' }));
  });
  $$('.tilt').forEach((el) => {
    const max = el.classList.contains('photo-card') ? 10 : 5;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
      el.style.transition = 'transform .12s linear, border-color .4s';
      el.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transition = ''; el.style.transform = ''; });
  });
}

/* ---------------- Project steppers ---------------- */
$$('.stepper').forEach((host) => {
  const caps = $$('.cap', host), imgs = $$('.stepper-sticky .shot', host), capBox = $('.stepper-captions', host);
  const n = caps.length; let idx = 0;
  const device = $('.stepper-stage .device', host);
  function show(i) {
    if (i === idx) return; idx = i;
    caps.forEach((c, k) => c.classList.toggle('active', k === i));
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
    const c = caps[i]; capBox.scrollTo({ top: c.offsetTop - capBox.clientHeight / 2 + c.offsetHeight / 2, behavior: 'smooth' });
  }
  const st = ScrollTrigger.create({
    trigger: host, start: 'top 9%', end: 'bottom 91%',
    onUpdate: (self) => show(Math.min(n - 1, Math.floor(self.progress * n * 0.999))),
  });
  caps.forEach((c, i) => c.addEventListener('click', () => { const y = st.start + ((i + 0.5) / n) * (st.end - st.start); scrollTo(y, { immediate: false, duration: 1.2 }); }));
  if (device && fine && !reduced) {
    host.addEventListener('pointermove', (e) => { const r = device.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; device.style.setProperty('--ry', (-5 + px * 7) + 'deg'); device.style.setProperty('--rx', (1.5 - py * 5) + 'deg'); });
  }
});

/* ---------------- Lightbox ---------------- */
const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
let lbList = [], lbI = 0;
function openLb(list, i) { lbList = list; lbI = i; paintLb(); lb.hidden = false; lenis?.stop(); }
function paintLb() { const im = lbList[lbI]; lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lbCap.textContent = im.dataset.cap || im.alt; }
function closeLb() { lb.hidden = true; lenis?.start(); }
document.addEventListener('click', (e) => {
  const screen = e.target.closest('.device-screen, .phone');
  if (!screen) return;
  const scope = screen.closest('.project') || document;
  const isPhone = !!screen.closest('.phone');
  let list, i;
  if (isPhone) { list = $$('.phones .shot', scope); i = list.indexOf($('.shot', screen)); }
  else { const st = screen.closest('.stepper-sticky'); if (st) { list = $$('.stepper-sticky .shot', scope.querySelector('.stepper') || scope); i = list.findIndex((x) => x.classList.contains('on')); } else { list = $$('.step-list .shot', scope); i = list.indexOf($('.shot', screen)); } }
  if (list && i > -1) openLb(list, i);
});
$('#lbClose').addEventListener('click', closeLb);
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
$('#lbPrev').addEventListener('click', () => { lbI = (lbI - 1 + lbList.length) % lbList.length; paintLb(); });
$('#lbNext').addEventListener('click', () => { lbI = (lbI + 1) % lbList.length; paintLb(); });
window.addEventListener('keydown', (e) => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') $('#lbPrev').click();
  if (e.key === 'ArrowRight') $('#lbNext').click();
});

/* ---------------- Contact ---------------- */
const toast = $('#toast');
$('#copyMail').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('samre1234@gmail.com'); toast.textContent = 'Email copied to clipboard ✓'; }
  catch { toast.textContent = 'samre1234@gmail.com'; }
  toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200);
});

let refreshT;
const debouncedRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 250); };
document.addEventListener('load', (e) => { if (e.target.tagName === 'IMG') debouncedRefresh(); }, true);
if (document.fonts) document.fonts.ready.then(debouncedRefresh);
window.addEventListener('load', () => { setTimeout(() => ScrollTrigger.refresh(), 400); });
window.addEventListener('resize', () => ScrollTrigger.refresh());
