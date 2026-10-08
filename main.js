// Shared header, footer, language switch and small interactions.
// The menu lives here once so every page stays in sync.

const NAV = [
  { href: 'index.html', en: 'Home', tr: 'Ana Sayfa' },
  { href: 'about.html', en: 'About', tr: 'Hakkında' },
  { href: 'experience.html', en: 'Experience', tr: 'Deneyim' },
  { href: 'publications.html', en: 'Publications', tr: 'Yayınlar' },
  { href: 'projects.html', en: 'Projects', tr: 'Projeler' },
  { href: 'contact.html', en: 'Contact', tr: 'İletişim' },
];

const SITE_NAME = 'Yonca Keşkek Türk';

function currentPage() {
  const file = location.pathname.split('/').pop();
  return file === '' ? 'index.html' : file;
}

function renderHeader() {
  const page = currentPage();
  const links = NAV.map(
    (n) =>
      `<a href="${n.href}"${n.href === page ? ' class="active"' : ''}>` +
      `<span lang="en">${n.en}</span><span lang="tr">${n.tr}</span></a>`
  ).join('');

  const header = document.createElement('header');
  header.className = 'navbar';
  header.innerHTML = `
    <div class="navbar-inner">
      <a class="logo" href="index.html">${SITE_NAME}</a>
      <nav class="nav-links" id="nav-links">
        ${links}
        <div class="lang-switch" role="group" aria-label="Language">
          <button type="button" data-set-lang="en">EN</button>
          <button type="button" data-set-lang="tr">TR</button>
        </div>
      </nav>
      <button class="menu-toggle" id="menu-toggle" aria-label="Menu">☰</button>
    </div>`;
  document.body.prepend(header);

  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });
}

function renderFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = `© ${new Date().getFullYear()} ${SITE_NAME}`;
  document.body.append(footer);
}

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
  // Placeholders inside form fields
  document.querySelectorAll('[data-ph-en]').forEach((el) => {
    el.placeholder = el.dataset['ph' + (lang === 'en' ? 'En' : 'Tr')];
  });
  try { localStorage.setItem('lang', lang); } catch (e) {}
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
    // Hide year headings with no visible items
    document.querySelectorAll('.year-group').forEach((g) => {
      g.hidden = !g.querySelector('[data-type]:not([hidden])');
    });
  });
}

// ---------- Spotlight ----------
function initSpotlight() {
  const s = document.createElement('div');
  s.className = 'spotlight';
  document.body.prepend(s);
  window.addEventListener('mousemove', (e) => {
    s.style.background = `radial-gradient(600px at ${e.clientX}px ${e.clientY}px, rgba(232, 178, 152, 0.12), transparent 80%)`;
  });
}

document.documentElement.setAttribute('data-lang', getLang());

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  initSpotlight();
  initFilters();
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set-lang]');
    if (b) setLang(b.dataset.setLang);
  });
  setLang(getLang());
});
