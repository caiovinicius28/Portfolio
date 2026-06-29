(function () {
  const CHAT_REPLIES = {
    services: {
      en: 'We build landing pages, high-performance websites, UI/UX, custom SaaS and marketing creative. View services on our home page or tell us your project on the contact form.',
      pt: 'Construímos landing pages, sites de alta performance, UI/UX, SaaS sob medida e criativos de marketing. Veja os serviços na home ou conte seu projeto no formulário de contato.'
    },
    book: {
      en: 'Book a free 1-on-1 consultation — we\'ll recommend the best approach for your goals.',
      pt: 'Agende uma consulta gratuita — vamos recomendar a melhor abordagem para seus objetivos.'
    },
    quote: {
      en: 'Share your project details on our contact page (budget, timeline, goals). We respond within 1 business day.',
      pt: 'Envie os detalhes do projeto na página de contato (orçamento, prazo, objetivos). Respondemos em até 1 dia útil.'
    },
    whatsapp: {
      en: 'Opening WhatsApp — our team is ready to help.',
      pt: 'Abrindo WhatsApp — nossa equipe está pronta para ajudar.'
    }
  };

  function getLocale() {
    return document.documentElement.dataset.locale || localStorage.getItem('vyzion-detected-locale') || 'en';
  }

  function t(key, dict) {
    return dict?.[key] || key;
  }

  function bindNewsletterForm(form) {
    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input?.value.trim();
      if (!email || !input.checkValidity()) {
        input?.focus();
        return;
      }
      try {
        const subs = JSON.parse(localStorage.getItem('vyzion-newsletter') || '[]');
        if (!subs.includes(email)) subs.push(email);
        localStorage.setItem('vyzion-newsletter', JSON.stringify(subs));
      } catch (_) {}

      const success = form.querySelector('.footer-newsletter-success, .home-newsletter-success, .form-success');
      form.querySelector('.home-newsletter-field, .contact-form-row--actions')?.classList.add('is-hidden');
      if (success) {
        success.hidden = false;
        success.style.display = 'block';
      }
      form.classList.add('is-success');
    });
  }

  function initNewsletterForms() {
    document.querySelectorAll('.footer-newsletter-form, .home-newsletter-form, #newsletter-form').forEach(bindNewsletterForm);
  }

  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (!data.name || !data.email || !data.projectType || !data.message) {
        form.classList.add('is-error');
        return;
      }
      form.classList.remove('is-error');

      try {
        const leads = JSON.parse(localStorage.getItem('vyzion-leads') || '[]');
        leads.push({ ...data, submittedAt: new Date().toISOString() });
        localStorage.setItem('vyzion-leads', JSON.stringify(leads));
      } catch (_) {}

      form.hidden = true;
      const ok = document.getElementById('contact-form-success');
      if (ok) ok.hidden = false;
    });
  }

  function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner || localStorage.getItem('vyzion-cookie-consent')) return;
    banner.hidden = false;

    banner.querySelector('.cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem('vyzion-cookie-consent', 'accepted');
      banner.hidden = true;
    });
    banner.querySelector('.cookie-decline')?.addEventListener('click', () => {
      localStorage.setItem('vyzion-cookie-consent', 'declined');
      banner.hidden = true;
    });
  }

  function addChatMessage(text, type) {
    const box = document.getElementById('chatbot-messages');
    if (!box) return;
    const el = document.createElement('div');
    el.className = `chatbot-msg ${type}`;
    el.textContent = text;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  }

  function initChatbot() {
    const toggle = document.getElementById('chatbot-toggle');
    const panel = document.getElementById('chatbot-panel');
    const close = document.getElementById('chatbot-close');
    const quick = document.getElementById('chatbot-quick');
    if (!toggle || !panel) return;

    const site = window.VYZION_SITE || {};
    const locale = getLocale();
    const lang = locale === 'pt' ? 'pt' : 'en';

    toggle.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    close?.addEventListener('click', () => {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    });

    quick?.addEventListener('click', event => {
      const btn = event.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const replies = CHAT_REPLIES[action];
      if (!replies) return;

      addChatMessage(btn.textContent.trim(), 'user');
      addChatMessage(replies[lang], 'bot');

      setTimeout(() => {
        if (action === 'book') window.location.href = 'contact.html#book';
        if (action === 'quote') window.location.href = 'contact.html#project-form';
        if (action === 'services') window.location.href = 'index.html#services';
        if (action === 'whatsapp') window.open(`https://wa.me/${site.whatsapp || '5562994800483'}`, '_blank', 'noopener');
      }, 700);
    });
  }

  async function injectSnippet(url, mountId, replace) {
    const mount = document.getElementById(mountId);
    if (!mount) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const html = await res.text();
      if (replace) {
        mount.outerHTML = html;
      } else {
        mount.insertAdjacentHTML('beforeend', html);
      }
      return true;
    } catch {
      return null;
    }
  }

  function initFaq() {
    document.querySelectorAll('.faq-item button').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.faq-item')?.classList.toggle('is-open');
      });
    });
  }

  function applyCalendlyUrl() {
    const site = window.VYZION_SITE || {};
    document.querySelectorAll('.calendly-inline-widget').forEach(el => {
      if (site.calendly) el.setAttribute('data-url', site.calendly);
    });
    document.querySelectorAll('.calendly-fallback a').forEach(a => {
      if (site.calendly) a.href = site.calendly;
    });
  }

  async function bootSiteUI() {
    await injectSnippet('snippets/footer.html', 'site-footer-mount', true);
    await injectSnippet('snippets/site-widgets.html', 'site-widgets-mount', false);

    initNewsletterForms();
    initContactForm();
    initCookieBanner();
    initChatbot();
    initFaq();
    applyCalendlyUrl();

    if (window.VyzionI18n?.applyCachedLocaleIfAvailable) {
      window.VyzionI18n.applyCachedLocaleIfAvailable();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSiteUI);
  } else {
    bootSiteUI();
  }
})();
