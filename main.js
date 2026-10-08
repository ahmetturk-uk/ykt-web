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
  const DURATION = 300; // ms
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

// ---------- Analytics events (Umami; no-op until the Umami script is loaded) ----------
function track(name, data) {
  if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data);
}

function initAnalytics() {
  // Section views: counted once per visit, when at least 40% of a section is on screen
  const seen = new Set();
  const io = 'IntersectionObserver' in window && new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const id = en.target.id;
      if (en.isIntersecting && !seen.has(id)) {
        seen.add(id);
        track('section-view', { section: id });
      }
    });
  }, { threshold: 0.4 });
  if (io) document.querySelectorAll('main section[id]').forEach((s) => io.observe(s));

  // Clicks on outbound links, nav items, language switch
  document.addEventListener('click', (e) => {
    const lang = e.target.closest('[data-set-lang]');
    if (lang) return track('language', { lang: lang.dataset.setLang });
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (a.closest('.nav')) return track('nav-click', { section: href.slice(1) });
    if (href.startsWith('mailto:')) return track('email-click');
    if (/^https?:/.test(href) && !href.includes(location.hostname)) {
      return track('outbound-click', { url: href, label: a.title || a.textContent.trim().slice(0, 60) });
    }
    if (href.includes('publications.html')) return track('all-publications-click');
  });

  // Contact form submissions
  const form = document.querySelector('.contact-form');
  if (form) form.addEventListener('submit', () => track('contact-form-submit'));
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
  initAnalytics();
});

