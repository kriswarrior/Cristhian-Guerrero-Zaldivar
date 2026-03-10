const SUPPORTED_LANGUAGES = ['en', 'es'];
const DEFAULT_LANGUAGE = 'en';

const resolveInitialLanguage = () => {
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;

  const browser = navigator.language?.slice(0, 2).toLowerCase();
  return browser === 'es' ? 'es' : DEFAULT_LANGUAGE;
};

const setMeta = (selector, key) => {
  const value = i18next.t(key);
  const node = document.querySelector(selector);
  if (node && value && value !== key) node.setAttribute('content', value);
};

const updateHeadTranslations = () => {
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

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const value = i18next.t(key);
    if (value && value !== key) element.textContent = value;
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const key = element.getAttribute('data-i18n-alt');
    const value = i18next.t(key);
    if (value && value !== key) element.setAttribute('alt', value);
  });

  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === i18next.language);
  });

  updateHeadTranslations();
};

const setupReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
};

const setupScrollEffects = () => {
  const progress = document.querySelector('.progress');
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.nav a')];

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${Math.max(0, Math.min(100, ratio))}%`;

    let activeSection = sections[0]?.id;
    sections.forEach((section) => {
      const top = section.offsetTop - 160;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) activeSection = section.id;
    });

    links.forEach((link) => {
      const target = link.getAttribute('href')?.slice(1);
      link.classList.toggle('active', target === activeSection);
    });
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
};

const setupMenu = () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
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
      setupScrollEffects();
      setupMenu();

      document.querySelectorAll('.lang-btn').forEach((button) => {
        button.addEventListener('click', () => {
          const next = button.dataset.lang;
          if (!SUPPORTED_LANGUAGES.includes(next)) return;
          i18next.changeLanguage(next).then(() => {
            localStorage.setItem('preferredLanguage', next);
            updateContent();
          });
        });
      });
    });
});
