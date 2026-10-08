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
});

