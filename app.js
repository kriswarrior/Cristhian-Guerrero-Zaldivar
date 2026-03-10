const SUPPORTED_LANGUAGES = ['en', 'es'];
const DEFAULT_LANGUAGE = 'en';

const resolveInitialLanguage = () => {
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(browser) ? browser : DEFAULT_LANGUAGE;
};

const updateHeadTranslations = () => {
  const setMeta = (selector, key) => {
    const value = i18next.t(key);
    const node = document.querySelector(selector);
    if (node && value && value !== key) node.setAttribute('content', value);
  };

  const title = i18next.t('head.title');
  if (title && title !== 'head.title') document.title = title;

  setMeta('meta[name="description"]', 'head.description');
  setMeta('meta[property="og:title"]', 'head.ogTitle');
  setMeta('meta[property="og:description"]', 'head.ogDescription');
  setMeta('meta[name="twitter:title"]', 'head.twitterTitle');
  setMeta('meta[name="twitter:description"]', 'head.twitterDescription');
};

const updateContent = () => {
  document.documentElement.lang = i18next.language;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = i18next.t(key);
    if (value && value !== key) el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    const value = i18next.t(key);
    if (value && value !== key) el.setAttribute('alt', value);
  });

  const toggle = document.getElementById('language-toggle');
  if (toggle) {
    toggle.setAttribute('aria-label', i18next.t('button.ariaLabel'));
    toggle.querySelector('.language-flag').textContent = i18next.language === 'en' ? '🇬🇧' : '🇪🇸';
    toggle.querySelector('.language-code').textContent = i18next.language.toUpperCase();
  }

  updateHeadTranslations();
};

const setupReveal = () => {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach((item) => observer.observe(item));
};

const setupScrollProgress = () => {
  const progress = document.querySelector('.progress');
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav a')];

  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, ratio))}%`;

    let active = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 140;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) active = section.id;
    });

    links.forEach((link) => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === active);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

window.addEventListener('DOMContentLoaded', () => {
  i18next
    .use(i18nextHttpBackend)
    .init({
      lng: resolveInitialLanguage(),
      fallbackLng: DEFAULT_LANGUAGE,
      backend: { loadPath: '{{lng}}.json' }
    })
    .then(() => {
      updateContent();
      setupReveal();
      setupScrollProgress();

      document.getElementById('language-toggle')?.addEventListener('click', () => {
        const next = i18next.language === 'en' ? 'es' : 'en';
        i18next.changeLanguage(next).then(() => {
          localStorage.setItem('preferredLanguage', next);
          updateContent();
        });
      });
    });
});
