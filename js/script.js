const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 24);
}

function updateMenuButton(isOpen) {
  menuButton?.setAttribute('aria-expanded', String(isOpen));
}

if (header) {
  updateHeader();
  window.addEventListener('scroll', updateHeader);
}

if (menuButton && navMenu) {
  menuButton.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    updateMenuButton(isOpen);
  });

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      updateMenuButton(false);
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.bento-media video, .about-bento-video video').forEach(video => {
  video.muted = true;
  video.playsInline = true;
  const playVideo = () => {
    video.play().catch(() => {});
  };
  video.addEventListener('loadeddata', playVideo);
  if (video.readyState >= 2) playVideo();
});

const serviceCarousel = document.querySelector('.service-carousel');
if (serviceCarousel) {
  const slides = [...serviceCarousel.querySelectorAll('.service-slide')];
  const dotsContainer = serviceCarousel.querySelector('.service-carousel-dots');
  let dots = [];

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('span');
      if (index === 0) dot.classList.add('is-active');
      dotsContainer.appendChild(dot);
    });
    dots = [...dotsContainer.querySelectorAll('span')];
  }

  let activeIndex = 0;
  let carouselTimer;

  const showSlide = index => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeIndex));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeIndex));
  };

  const startCarousel = () => {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => showSlide(activeIndex + 1), 2800);
  };

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    startCarousel();
    serviceCarousel.addEventListener('mouseenter', () => clearInterval(carouselTimer));
    serviceCarousel.addEventListener('mouseleave', startCarousel);
  }
}

function initServicesCarousel(servicesSectionCarousel) {
  const track = servicesSectionCarousel.querySelector('.services-carousel-track');
  const cards = [...servicesSectionCarousel.querySelectorAll('.service-card')];
  const prevBtn = servicesSectionCarousel.querySelector('.services-carousel-btn.prev');
  const nextBtn = servicesSectionCarousel.querySelector('.services-carousel-btn.next');
  const dotsContainer = servicesSectionCarousel.querySelector('.services-carousel-dots');
  const gap = 18;
  let index = 0;
  let visibleCount = 4;
  let pageCount = 1;
  let autoTimer;

  const isAboutHeroCarousel = servicesSectionCarousel.classList.contains('about-hero-carousel');

  const getVisibleCount = () => {
    if (isAboutHeroCarousel) {
      if (window.innerWidth <= 780) return 1;
      return 2;
    }
    if (window.innerWidth <= 780) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 4;
  };

  const getCardWidth = () => {
    const viewport = servicesSectionCarousel.querySelector('.services-carousel-viewport');
    visibleCount = getVisibleCount();
    return (viewport.clientWidth - gap * (visibleCount - 1)) / visibleCount;
  };

  const buildDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    pageCount = Math.max(1, cards.length - visibleCount + 1);
    for (let i = 0; i < pageCount; i += 1) {
      const dot = document.createElement('span');
      if (i === index) dot.classList.add('is-active');
      dot.addEventListener('click', () => {
        index = i;
        updateCarousel();
        restartAuto();
      });
      dotsContainer.appendChild(dot);
    }
  };

  const updateCarousel = () => {
    visibleCount = getVisibleCount();
    pageCount = Math.max(1, cards.length - visibleCount + 1);
    index = Math.max(0, Math.min(index, pageCount - 1));

    const cardWidth = getCardWidth();
    servicesSectionCarousel.style.setProperty('--service-card-width', `${cardWidth}px`);
    cards.forEach(card => {
      card.style.width = `${cardWidth}px`;
      card.style.flexBasis = `${cardWidth}px`;
    });

    track.style.transform = `translateX(-${index * (cardWidth + gap)}px)`;

    if (dotsContainer) {
      const dots = [...dotsContainer.querySelectorAll('span')];
      if (dots.length !== pageCount) buildDots();
      [...dotsContainer.querySelectorAll('span')].forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });
    }
  };

  const goNext = () => {
    index = index >= pageCount - 1 ? 0 : index + 1;
    updateCarousel();
  };

  const goPrev = () => {
    index = index <= 0 ? pageCount - 1 : index - 1;
    updateCarousel();
  };

  const restartAuto = () => {
    clearInterval(autoTimer);
    if (isAboutHeroCarousel) return;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      autoTimer = setInterval(goNext, 4500);
    }
  };

  prevBtn?.addEventListener('click', () => {
    goPrev();
    restartAuto();
  });

  nextBtn?.addEventListener('click', () => {
    goNext();
    restartAuto();
  });

  servicesSectionCarousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
  servicesSectionCarousel.addEventListener('mouseleave', restartAuto);

  window.addEventListener('resize', () => {
    buildDots();
    updateCarousel();
  });

  buildDots();
  updateCarousel();
  restartAuto();
}

document.querySelectorAll('.services-carousel').forEach(initServicesCarousel);

function initBlogEditorialCarousel() {
  const outer = document.querySelector('.blog-carousel-outer');
  const track = document.getElementById('blog-carousel-track');
  const prevBtn = outer?.querySelector('.blog-carousel-btn.prev');
  const nextBtn = outer?.querySelector('.blog-carousel-btn.next');
  if (!outer || !track || !prevBtn || !nextBtn) return;

  const cards = () => [...track.querySelectorAll('.blog-chapter-card')];

  function scrollAmount() {
    const card = cards()[0];
    if (!card) return 280;
    return card.offsetWidth + 14;
  }

  function updateButtons() {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();
}

initBlogEditorialCarousel();

document.querySelectorAll('[data-site-email]').forEach(link => {
  const email = window.VYZION_SITE?.email;
  if (email) {
    link.href = `mailto:${email}`;
    link.textContent = email;
  }
});

const canUsePointerEffects = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canUsePointerEffects) {
  const pointerSurfaces = document.querySelectorAll('.bento-card, .step, .contact-panel');

  pointerSurfaces.forEach(surface => {
    surface.addEventListener('pointermove', event => {
      const bounds = surface.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const xRatio = x / bounds.width;
      const yRatio = y / bounds.height;

      surface.style.setProperty('--pointer-x', `${x}px`);
      surface.style.setProperty('--pointer-y', `${y}px`);
      surface.style.setProperty('--tilt-x', `${(0.5 - yRatio) * 4}deg`);
      surface.style.setProperty('--tilt-y', `${(xRatio - 0.5) * 4}deg`);
    });

    surface.addEventListener('pointerleave', () => {
      surface.style.setProperty('--pointer-x', '50%');
      surface.style.setProperty('--pointer-y', '50%');
      surface.style.setProperty('--tilt-x', '0deg');
      surface.style.setProperty('--tilt-y', '0deg');
    });
  });

  const footer = document.querySelector('.footer');
  footer?.addEventListener('pointermove', event => {
    const bounds = footer.getBoundingClientRect();
    footer.style.setProperty('--footer-x', `${event.clientX - bounds.left}px`);
  });
}

document.querySelectorAll('[data-founder-flip]').forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();
    const card = button.closest('.founder-card');
    card?.classList.toggle('is-flipped');
  });
});

document.querySelectorAll('.founder-back').forEach(back => {
  back.addEventListener('click', () => {
    back.closest('.founder-card')?.classList.remove('is-flipped');
  });
});

function initAboutWhyScrollReveal() {
  const statement = document.querySelector('.about-why-statement[data-scroll-reveal]');
  if (!statement) return;

  const wrap = statement.closest('.about-why-statement-wrap');
  const text = statement.textContent.trim();
  if (!text) return;

  if (statement._scrollRevealUpdate) {
    window.removeEventListener('scroll', statement._scrollRevealUpdate);
    window.removeEventListener('resize', statement._scrollRevealUpdate);
  }

  const words = text.split(/\s+/).filter(Boolean);
  statement.innerHTML = words.map(word => `<span class="about-why-word">${word}</span>`).join(' ');

  const wordEls = [...statement.querySelectorAll('.about-why-word')];
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    wordEls.forEach(el => el.classList.add('is-lit'));
    return;
  }

  const update = () => {
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.9;
    const end = vh * 0.32;
    const range = Math.max(start - end + rect.height * 0.5, 1);
    const progress = Math.min(1, Math.max(0, (start - rect.top) / range));
    const active = progress * wordEls.length;

    wordEls.forEach((el, i) => {
      el.classList.toggle('is-lit', i < active);
    });
  };

  statement._scrollRevealUpdate = update;
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

function bootAboutWhyScrollReveal() {
  requestAnimationFrame(() => {
    requestAnimationFrame(initAboutWhyScrollReveal);
  });
}

const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  const emailInput = newsletterForm.querySelector('#newsletter-email');
  const fieldWrap = newsletterForm.querySelector('.home-newsletter-field');

  newsletterForm.addEventListener('submit', event => {
    event.preventDefault();
    fieldWrap?.classList.remove('is-error');

    const email = emailInput?.value.trim();
    if (!email || !emailInput.checkValidity()) {
      fieldWrap?.classList.add('is-error');
      emailInput?.focus();
      return;
    }

    try {
      const subs = JSON.parse(localStorage.getItem('vyzion-newsletter') || '[]');
      if (!subs.includes(email)) subs.push(email);
      localStorage.setItem('vyzion-newsletter', JSON.stringify(subs));
    } catch (_) {}

    newsletterForm.classList.add('is-success');
  });
}

if (window.VyzionI18n) {
  const appliedFromCache = window.VyzionI18n.applyCachedLocaleIfAvailable();
  if (!appliedFromCache && window.VYZION_TRANSLATIONS?.en) {
    window.VyzionI18n.applyRegionalTranslation('en', window.VYZION_TRANSLATIONS.en);
  }
  bootAboutWhyScrollReveal();
  window.VyzionI18n.initRegionalI18n()
    .then(() => bootAboutWhyScrollReveal())
    .catch(() => {
    document.documentElement.classList.remove('i18n-loading');
    document.documentElement.classList.add('i18n-ready');
    bootAboutWhyScrollReveal();
  });
} else {
  bootAboutWhyScrollReveal();
}
