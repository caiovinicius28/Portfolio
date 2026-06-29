(function () {
  const config = window.VYZION_I18N_CONFIG;
  const baseTranslations = window.VYZION_TRANSLATIONS || { en: {}, pt: {} };
  const CACHE_PREFIX = 'vyzion-locale-dict-';
  const LOCALE_KEY = 'vyzion-detected-locale';
  const COUNTRY_KEY = 'vyzion-detected-country';
  const CACHE_VERSION = '20';

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function normalizeLocale(code) {
    if (!code) return 'en';
    const lower = String(code).toLowerCase().split('-')[0];
    if (config.blockedLocales.includes(lower)) return 'en';
    return lower;
  }

  function localeFromBrowser() {
    const langs = navigator.languages?.length
      ? navigator.languages
      : [navigator.language || 'en'];

    for (const lang of langs) {
      const code = normalizeLocale(lang);
      if (config.blockedLocales.includes(code)) return 'en';
      if (config.browserToLocale[code]) return config.browserToLocale[code];
    }
    return 'en';
  }

  function localeFromCountry(countryCode) {
    if (!countryCode) return null;
    return config.countryToLocale[countryCode.toUpperCase()] || null;
  }

  async function detectCountryCode() {
    const cached = sessionStorage.getItem(COUNTRY_KEY);
    if (cached) return cached;

    const endpoints = [
      async () => {
        const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error('geo failed');
        const data = await res.json();
        return data.success === false ? null : data.country_code;
      },
      async () => {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error('geo failed');
        const data = await res.json();
        return data.country_code || null;
      }
    ];

    for (const fetchCountry of endpoints) {
      try {
        const code = await fetchCountry();
        if (code) {
          sessionStorage.setItem(COUNTRY_KEY, code);
          return code;
        }
      } catch {
        // try next provider
      }
    }
    return null;
  }

  async function resolveUserLocale() {
    const country = await detectCountryCode();
    const fromBrowser = localeFromBrowser();

    if (country === 'BR' || country === 'PT') {
      sessionStorage.setItem(LOCALE_KEY, 'pt');
      localStorage.setItem(LOCALE_KEY, 'pt');
      return 'pt';
    }

    if (country === 'IN' || country === 'PK') {
      sessionStorage.setItem(LOCALE_KEY, 'en');
      localStorage.setItem(LOCALE_KEY, 'en');
      return 'en';
    }

    const fromCountry = localeFromCountry(country);
    const locale = fromCountry || fromBrowser || 'en';
    sessionStorage.setItem(LOCALE_KEY, locale);
    localStorage.setItem(LOCALE_KEY, locale);
    return locale;
  }

  function readCachedDictionary(locale) {
    try {
      const raw = localStorage.getItem(`${CACHE_PREFIX}${locale}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.version !== CACHE_VERSION) return null;
      return parsed.data;
    } catch {
      return null;
    }
  }

  function writeCachedDictionary(locale, data) {
    localStorage.setItem(`${CACHE_PREFIX}${locale}`, JSON.stringify({
      version: CACHE_VERSION,
      data
    }));
  }

  async function translateChunk(text, targetLocale) {
    if (!text || targetLocale === 'en') return text;
    const maxLen = 480;
    if (text.length <= maxLen) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(targetLocale)}`;
      const res = await fetch(url);
      if (!res.ok) return text;
      const payload = await res.json();
      return payload?.responseData?.translatedText || text;
    }

    const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const translated = [];
    for (const part of parts) {
      translated.push(await translateChunk(part.trim(), targetLocale));
      await sleep(120);
    }
    return translated.join(' ');
  }

  async function buildAutoDictionary(targetLocale) {
    const cached = readCachedDictionary(targetLocale);
    if (cached) return cached;

    const source = baseTranslations.en;
    const entries = Object.entries(source);
    const result = {};
    const batchSize = 4;

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const translatedBatch = await Promise.all(
        batch.map(async ([key, value]) => {
          try {
            const text = await translateChunk(value, targetLocale);
            return [key, text];
          } catch {
            return [key, value];
          }
        })
      );
      translatedBatch.forEach(([key, value]) => {
        result[key] = value;
      });
      await sleep(150);
    }

    writeCachedDictionary(targetLocale, result);
    return result;
  }

  async function getDictionary(locale) {
    if (baseTranslations[locale]) return baseTranslations[locale];
    return buildAutoDictionary(locale);
  }

  function getHtmlLang(locale) {
    return config.htmlLang[locale] || locale;
  }

  function applyRegionalTranslation(locale, dictionary) {
    const i18nElements = document.querySelectorAll('[data-i18n]');
    const i18nAltElements = document.querySelectorAll('[data-i18n-alt]');
    const i18nAriaElements = document.querySelectorAll('[data-i18n-aria]');
    const metaDescription = document.querySelector('meta[name="description"]');
    const page = document.body?.dataset?.page;
    const htmlLang = getHtmlLang(locale);

    document.documentElement.lang = htmlLang;
    document.documentElement.dir = config.rtlLocales.includes(locale) ? 'rtl' : 'ltr';

    document.title = page === 'about' && dictionary['about.pageTitle']
      ? dictionary['about.pageTitle']
      : dictionary['meta.title'] || document.title;

    if (metaDescription) {
      metaDescription.setAttribute('content', page === 'about' && dictionary['about.pageDescription']
        ? dictionary['about.pageDescription']
        : dictionary['meta.description'] || metaDescription.getAttribute('content'));
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

    document.documentElement.classList.remove('i18n-loading');
    document.documentElement.classList.add('i18n-ready');
    document.documentElement.dataset.locale = locale;
  }

  function applyCachedLocaleIfAvailable() {
    const locale = localStorage.getItem(LOCALE_KEY);
    if (!locale) return false;

    if (baseTranslations[locale]) {
      applyRegionalTranslation(locale, baseTranslations[locale]);
      return true;
    }

    const cached = readCachedDictionary(locale);
    if (cached) {
      applyRegionalTranslation(locale, cached);
      return true;
    }

    return false;
  }

  async function initRegionalI18n() {
    const locale = await resolveUserLocale();
    const dictionary = await getDictionary(locale);
    applyRegionalTranslation(locale, dictionary);
    return locale;
  }

  window.VyzionI18n = {
    initRegionalI18n,
    applyRegionalTranslation,
    applyCachedLocaleIfAvailable,
    resolveUserLocale,
    getDictionary
  };
})();
