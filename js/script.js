const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const languageButtons = document.querySelectorAll('[data-lang]');
const i18nElements = document.querySelectorAll('[data-i18n]');
const i18nAltElements = document.querySelectorAll('[data-i18n-alt]');
const i18nAriaElements = document.querySelectorAll('[data-i18n-aria]');
const metaDescription = document.querySelector('meta[name="description"]');

const translations = {
  pt: {
    'meta.title': 'Vyzion Systems',
    'meta.description': 'Sites, landing pages e soluções digitais de alta performance para empresas que querem crescer no digital.',
    'header.cta': 'Falar com especialista',
    'menu.toggle': 'Abrir menu',
    'nav.main': 'Navegação principal',
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.services': 'Serviços',
    'nav.portfolio': 'Portfólio',
    'nav.process': 'Processo',
    'nav.contact': 'Contato',
    'hero.eyebrow': 'Tecnologia. Design. Resultados.',
    'hero.title': 'Transformamos ideias em',
    'hero.titleEmphasis': 'experiências digitais.',
    'hero.subtitle': 'Sites e landing pages de alta performance que elevam sua marca e geram resultados reais.',
    'hero.cta1': 'Conheça nossas soluções',
    'hero.cta2': 'Ver projetos',
    'hero.imageAlt': 'Mão robótica futurista',
    'hero.chromeAlt': 'Elemento cromado abstrato',
    'hero.trusted': 'Soluções digitais criadas para gerar presença, performance e crescimento.',
    'hero.trust1': 'Estratégia',
    'hero.trust2': 'Design',
    'hero.trust3': 'Tecnologia',
    'hero.trust4': 'Resultados',
    'about.eyebrow': 'Sobre nós',
    'about.title': 'Tecnologia e criatividade a serviço do seu',
    'about.titleEmphasis': 'sucesso.',
    'about.p1': 'A Vyzion Systems nasceu para unir design estratégico, tecnologia e performance em soluções digitais que impulsionam negócios no mundo online.',
    'about.p2': 'Cada projeto é feito sob medida para transmitir credibilidade, engajar visitantes e gerar resultados.',
    'about.cta': 'Conheça nossas soluções',
    'about.symbolAlt': 'Símbolo Vyzion',
    'about.chromeAlt': 'Elemento cromado abstrato',
    'services.eyebrow': 'O que fazemos',
    'services.title': 'Soluções digitais que colocam sua empresa em outro nível.',
    'service.1.title': 'Sites Institucionais',
    'service.1.text': 'Sites profissionais que comunicam autoridade, fortalecem sua marca e criam confiança.',
    'service.2.title': 'Landing Pages',
    'service.2.text': 'Páginas estratégicas para campanhas, captação de leads e conversão de visitantes.',
    'service.3.title': 'Alta Performance',
    'service.3.text': 'Projetos rápidos, responsivos, otimizados e preparados para uma experiência fluida.',
    'service.4.title': 'Desenvolvimento Personalizado',
    'service.4.text': 'Soluções sob medida para atender necessidades específicas do seu negócio.',
    'portfolio.eyebrow': 'Portfólio',
    'portfolio.title': 'Projetos que geram',
    'portfolio.titleEmphasis': 'resultados reais.',
    'portfolio.text': 'Layouts modernos, páginas persuasivas e experiências digitais desenhadas para converter.',
    'portfolio.cta': 'Solicitar um projeto',
    'portfolio.item1Alt': 'Projeto de landing page Vyzion',
    'portfolio.item2Alt': 'Projeto web Vyzion',
    'portfolio.item3Alt': 'Identidade Vyzion Systems',
    'portfolio.project1.title': 'Presença Digital',
    'portfolio.project1.type': 'Landing Page',
    'portfolio.project2.title': 'Vyzion Experience',
    'portfolio.project2.type': 'Site Institucional',
    'portfolio.project3.title': 'Marca Digital',
    'portfolio.project3.type': 'Identidade Web',
    'process.eyebrow': 'Nosso processo',
    'process.step1.title': 'Descobrir',
    'process.step1.text': 'Entendemos seu negócio, objetivos e público-alvo.',
    'process.step2.title': 'Planejar',
    'process.step2.text': 'Criamos estratégia, estrutura e roteiro do projeto.',
    'process.step3.title': 'Design & UX',
    'process.step3.text': 'Desenvolvemos o design focado em experiência e conversão.',
    'process.step4.title': 'Desenvolver',
    'process.step4.text': 'Transformamos o projeto em um site rápido e responsivo.',
    'process.step5.title': 'Entregar',
    'process.step5.text': 'Testamos, otimizamos e entregamos com excelência.',
    'contact.title': 'Vamos conversar sobre o seu',
    'contact.titleEmphasis': 'próximo projeto?',
    'contact.text': 'Fale com nossos especialistas e descubra como podemos elevar sua presença digital.',
    'contact.phone': '+55 (62) 99480-0483',
    'contact.cta': 'Falar com especialista',
    'contact.imageAlt': 'Mão robótica',
    'footer.rights': '© 2026 Vyzion Systems. Todos os direitos reservados.'
  },
  en: {
    'meta.title': 'Vyzion Systems',
    'meta.description': 'High-performance websites, landing pages and digital solutions for businesses that want to grow online.',
    'header.cta': 'Talk to an expert',
    'menu.toggle': 'Open menu',
    'nav.main': 'Main navigation',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.process': 'Process',
    'nav.contact': 'Contact',
    'hero.eyebrow': 'Technology. Design. Results.',
    'hero.title': 'We turn ideas into',
    'hero.titleEmphasis': 'digital experiences.',
    'hero.subtitle': 'High-performance websites and landing pages that elevate your brand and drive real results.',
    'hero.cta1': 'Discover our solutions',
    'hero.cta2': 'See projects',
    'hero.imageAlt': 'Futuristic robotic hand',
    'hero.chromeAlt': 'Abstract chrome element',
    'hero.trusted': 'Digital solutions built to create presence, performance and growth.',
    'hero.trust1': 'Strategy',
    'hero.trust2': 'Design',
    'hero.trust3': 'Technology',
    'hero.trust4': 'Results',
    'about.eyebrow': 'About us',
    'about.title': 'Technology and creativity at the service of your',
    'about.titleEmphasis': 'success.',
    'about.p1': 'Vyzion Systems was created to combine strategic design, technology and performance in digital solutions that boost businesses online.',
    'about.p2': 'Every project is made to convey credibility, engage visitors and generate results.',
    'about.cta': 'Discover our solutions',
    'about.symbolAlt': 'Vyzion symbol',
    'about.chromeAlt': 'Abstract chrome element',
    'services.eyebrow': 'What we do',
    'services.title': 'Digital solutions that take your business to the next level.',
    'service.1.title': 'Institutional Websites',
    'service.1.text': 'Professional websites that communicate authority, strengthen your brand and create trust.',
    'service.2.title': 'Landing Pages',
    'service.2.text': 'Strategic pages for campaigns, lead generation and visitor conversion.',
    'service.3.title': 'High Performance',
    'service.3.text': 'Fast, responsive, optimized projects prepared for a seamless experience.',
    'service.4.title': 'Custom Development',
    'service.4.text': 'Tailored solutions to meet the specific needs of your business.',
    'portfolio.eyebrow': 'Portfolio',
    'portfolio.title': 'Projects that deliver',
    'portfolio.titleEmphasis': 'real results.',
    'portfolio.text': 'Modern layouts, persuasive pages and digital experiences designed to convert.',
    'portfolio.cta': 'Request a project',
    'portfolio.item1Alt': 'Vyzion landing page project',
    'portfolio.item2Alt': 'Vyzion web project',
    'portfolio.item3Alt': 'Vyzion Systems identity project',
    'portfolio.project1.title': 'Digital Presence',
    'portfolio.project1.type': 'Landing Page',
    'portfolio.project2.title': 'Vyzion Experience',
    'portfolio.project2.type': 'Institutional Website',
    'portfolio.project3.title': 'Digital Brand',
    'portfolio.project3.type': 'Web Identity',
    'process.eyebrow': 'Our process',
    'process.step1.title': 'Discover',
    'process.step1.text': 'We understand your business, goals and audience.',
    'process.step2.title': 'Plan',
    'process.step2.text': 'We create the strategy, structure and project roadmap.',
    'process.step3.title': 'Design & UX',
    'process.step3.text': 'We develop design focused on experience and conversion.',
    'process.step4.title': 'Build',
    'process.step4.text': 'We turn the project into a fast and responsive website.',
    'process.step5.title': 'Deliver',
    'process.step5.text': 'We test, optimize and deliver with excellence.',
    'contact.title': 'Let\'s talk about your',
    'contact.titleEmphasis': 'next project?',
    'contact.text': 'Talk with our specialists and discover how we can elevate your digital presence.',
    'contact.phone': '+55 (62) 99480-0483',
    'contact.cta': 'Talk to an expert',
    'contact.imageAlt': 'Robotic hand',
    'footer.rights': '© 2026 Vyzion Systems. All rights reserved.'
  }
};

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 24);
}

function updateMenuButton(isOpen) {
  menuButton.setAttribute('aria-expanded', String(isOpen));
}

function applyTranslation(locale) {
  const dictionary = translations[locale] || translations.pt;

  document.documentElement.lang = locale === 'en' ? 'en-US' : 'pt-BR';
  document.title = dictionary['meta.title'];
  if (metaDescription) {
    metaDescription.setAttribute('content', dictionary['meta.description']);
  }

  i18nElements.forEach(el => {
    const key = el.dataset.i18n;
    const text = dictionary[key];
    if (text === undefined) return;
    el.textContent = text;
  });

  i18nAltElements.forEach(el => {
    const key = el.dataset.i18nAlt;
    const altText = dictionary[key];
    if (altText === undefined) return;
    el.alt = altText;
  });

  i18nAriaElements.forEach(el => {
    const key = el.dataset.i18nAria;
    const ariaText = dictionary[key];
    if (ariaText === undefined) return;
    el.setAttribute('aria-label', ariaText);
  });

  languageButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.lang === locale);
  });

  localStorage.setItem('preferredLanguage', locale);
}

function getInitialLanguage() {
  const saved = localStorage.getItem('preferredLanguage');
  if (saved && ['pt', 'en'].includes(saved)) {
    return saved;
  }
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) {
    return 'en';
  }
  return 'pt';
}

updateHeader();
window.addEventListener('scroll', updateHeader);

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

languageButtons.forEach(button => {
  button.addEventListener('click', () => {
    applyTranslation(button.dataset.lang);
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const canUsePointerEffects = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canUsePointerEffects) {
  const pointerSurfaces = document.querySelectorAll('.hero-trust, .service-card, .step, .contact-panel');

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

applyTranslation(getInitialLanguage());
