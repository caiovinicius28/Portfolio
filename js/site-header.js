(function () {
  const ACTIVE_NAV = {
    about: 'about',
    blog: 'blog',
    'blog-article': 'blog',
    contact: 'contact'
  };

  function getWorksHref() {
    const page = document.body.dataset.page || '';
    return page === 'home' ? '#process' : 'index.html#process';
  }

  function scrollToHashTarget(hash, behavior = 'smooth') {
    if (!hash || hash === '#') return false;
    const id = hash.replace(/^#/, '');
    const target = document.getElementById(id);
    if (!target) return false;

    const header = document.querySelector('.site-header');
    const offset = (header?.offsetHeight || 0) + 20;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior });
    return true;
  }

  function initHashNavigation() {
    const worksLink = document.querySelector('[data-nav="works"]');
    if (!worksLink || worksLink.dataset.hashBound === 'true') return;
    worksLink.dataset.hashBound = 'true';

    worksLink.addEventListener('click', event => {
      const href = worksLink.getAttribute('href') || '';
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      const pathPart = href.slice(0, hashIndex);
      const hash = href.slice(hashIndex);
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      const targetPage = pathPart || currentPage;
      const onSamePage = targetPage === currentPage
        || (targetPage === 'index.html' && (currentPage === '' || currentPage === 'index.html'));

      if (!onSamePage) return;

      if (scrollToHashTarget(hash)) {
        event.preventDefault();
        history.pushState(null, '', hash);
      }
    });
  }

  function scrollToInitialHash() {
    if (!window.location.hash) return;
    const scroll = () => scrollToHashTarget(window.location.hash, 'auto');
    scroll();
    window.setTimeout(scroll, 400);
    window.setTimeout(scroll, 900);
  }

  function configureNavLinks() {
    const page = document.body.dataset.page || '';
    const worksLink = document.querySelector('[data-nav="works"]');

    if (worksLink) {
      worksLink.setAttribute('href', getWorksHref());
    }

    document.querySelectorAll('[data-nav]').forEach(link => {
      link.classList.remove('is-active');
    });

    const activeKey = ACTIVE_NAV[page];
    if (activeKey) {
      document.querySelector(`[data-nav="${activeKey}"]`)?.classList.add('is-active');
    }
  }

  function ensureMenuIcon() {
    const menuButton = document.querySelector('.menu-toggle');
    if (!menuButton) return;
    if (!menuButton.querySelector('.menu-toggle-bars')) {
      const bars = document.createElement('span');
      bars.className = 'menu-toggle-bars';
      bars.setAttribute('aria-hidden', 'true');
      menuButton.appendChild(bars);
    }
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !navMenu.id) navMenu.id = 'site-nav-menu';
    if (navMenu && !menuButton.getAttribute('aria-controls')) {
      menuButton.setAttribute('aria-controls', navMenu.id);
    }
  }

  function initLanguageSwitcher() {
    const englishButton = document.querySelector('.lang-btn[data-locale="en"]');
    if (!englishButton || englishButton.dataset.bound === 'true') return;
    englishButton.dataset.bound = 'true';

    englishButton.addEventListener('click', () => {
      window.VyzionI18n?.setLocale?.('en');
    });

    window.VyzionI18n?.updateLanguageSwitcherUI?.();
  }

  function initSiteHeader() {
    const header = document.querySelector('.site-header');
    const menuButton = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!header) return;

    ensureMenuIcon();

    configureNavLinks();
    initLanguageSwitcher();
    initHashNavigation();
    scrollToInitialHash();

    if (header.dataset.bound === 'true') return;
    header.dataset.bound = 'true';

    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };

    const updateMenuButton = isOpen => {
      menuButton?.setAttribute('aria-expanded', String(isOpen));
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader);

    if (menuButton && navMenu) {
      menuButton.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        updateMenuButton(isOpen);
      });

      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
          updateMenuButton(false);
        });
      });
    }
  }

  window.VyzionSiteHeader = {
    initSiteHeader,
    configureNavLinks,
    scrollToHashTarget,
    scrollToInitialHash
  };
})();
