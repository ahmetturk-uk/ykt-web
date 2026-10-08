// Language switch, scroll-spy navigation, spotlight and publication filters.

// ---------- Language ----------
function getLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'tr') return saved;
  } catch (e) {}
  return 'en'; // default language
}

function setLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('[data-set-lang]').forEach((b) => {
    b.classList.toggle('active', b.dataset.setLang === lang);
  });
  try { localStorage.setItem('lang', lang); } catch (e) {}
}

// ---------- Scroll-spy: highlight the nav item of the section in view ----------
function initScrollSpy() {
  const links = document.querySelectorAll('.nav a');
  if (!links.length) return;
  const sections = [...links].map((a) => document.querySelector(a.getAttribute('href')));

  const update = () => {
    const line = window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach((s) => {
      if (s && s.getBoundingClientRect().top <= line) current = s;
    });
    // At the very bottom, the last section is active
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      current = sections[sections.length - 1];
    }
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ---------- Fast smooth scroll for in-page links ----------
// Safari's native smooth scrolling is slow; use a short, fixed-length animation instead.
function initFastScroll() {
  const DURATION = 450; // ms
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();

    const offset = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const startY = window.scrollY;
    const endY = Math.max(0, target.getBoundingClientRect().top + startY - offset);
    history.replaceState(null, '', id);

    if (reduce) { window.scrollTo({ top: endY, behavior: 'instant' }); return; }
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / DURATION);
      window.scrollTo({ top: startY + (endY - startY) * ease(t), behavior: 'instant' });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// ---------- Spotlight following the mouse ----------
function initSpotlight() {
  const s = document.querySelector('.spotlight');
  if (!s) return;
  window.addEventListener('mousemove', (e) => {
    s.style.background = `radial-gradient(600px at ${e.clientX}px ${e.clientY}px, rgba(var(--rgb), 0.12), transparent 80%)`;
  });
}

// ---------- Publication filters ----------
function initFilters() {
  const bar = document.querySelector('.filters');
  if (!bar) return;
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    bar.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    const type = btn.dataset.filter;
    document.querySelectorAll('[data-type]').forEach((item) => {
      item.hidden = type !== 'all' && item.dataset.type !== type;
    });
    document.querySelectorAll('.year-group').forEach((g) => {
      g.hidden = !g.querySelector('[data-type]:not([hidden])');
    });
  });
}

document.documentElement.setAttribute('data-lang', getLang());

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set-lang]');
    if (b) setLang(b.dataset.setLang);
  });
  setLang(getLang());
  initScrollSpy();
  initSpotlight();
  initFilters();
  initFastScroll();
});

