(function () {
  const ACTIVE_NAV = {
    about: 'about',
    blog: 'blog',
    'blog-article': 'blog',
    contact: 'contact'
  };

  function configureNavLinks() {
    const page = document.body.dataset.page || '';
    const worksLink = document.querySelector('[data-nav="works"]');

    if (worksLink) {
      if (page === 'home') worksLink.setAttribute('href', '#process');
      else if (page === 'about') worksLink.setAttribute('href', '#process');
      else worksLink.setAttribute('href', 'index.html#process');
    }

    document.querySelectorAll('[data-nav]').forEach(link => {
      link.classList.remove('is-active');
    });

    const activeKey = ACTIVE_NAV[page];
    if (activeKey) {
      document.querySelector(`[data-nav="${activeKey}"]`)?.classList.add('is-active');
    }
  }

  function initSiteHeader() {
    const header = document.querySelector('.site-header');
    const menuButton = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!header) return;

    configureNavLinks();

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

  window.VyzionSiteHeader = { initSiteHeader, configureNavLinks };
})();
