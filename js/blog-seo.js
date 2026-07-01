(function () {
  const site = window.VYZION_SITE || {};
  const base = (site.url || 'https://vyzionsystems.com').replace(/\/$/, '');
  const SCHEMA_ID = 'vyzion-blog-schema-graph';

  function resolveArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    const slug = params.get('slug');
    const articles = window.VYZION_BLOG_ARTICLES || [];
    if (slug) return articles.find(a => a.slug === slug) || null;
    if (id) return articles.find(a => a.id === id) || null;
    return null;
  }

  function getDict(locale) {
    const code = locale || 'en';
    return window.VYZION_TRANSLATIONS?.[code] || window.VYZION_TRANSLATIONS?.en || {};
  }

  function t(key, dict) {
    return dict?.[key] || '';
  }

  function articleUrl(article) {
    if (article.slug) {
      return `${base}/blog/${encodeURIComponent(article.slug)}.html`;
    }
    return `${base}/blog-article.html?id=${article.id}`;
  }

  function absImage(path) {
    return `${base}/${String(path || '').replace(/^\//, '')}`;
  }

  function collectTextKeys(article) {
    const keys = [article.titleKey, article.excerptKey];
    (article.sections || []).forEach(section => {
      if (section.type === 'midCta') return;
      if (section.key) keys.push(section.key);
      if (section.keys) keys.push(...section.keys);
    });
    return keys;
  }

  function buildPlainText(article, dict) {
    return collectTextKeys(article)
      .map(key => t(key, dict))
      .filter(Boolean)
      .join('\n\n');
  }

  function wordCount(text) {
    return text.split(/\s+/).filter(Boolean).length;
  }

  function buildFAQ(article, dict) {
    const sections = article.sections || [];
    const faqs = [];

    for (let i = 0; i < sections.length; i += 1) {
      if (sections[i].type !== 'h2') continue;
      const question = t(sections[i].key, dict);
      let answer = '';

      for (let j = i + 1; j < sections.length; j += 1) {
        const section = sections[j];
        if (section.type === 'h2') break;
        if (section.type === 'p' || section.type === 'callout') {
          answer = t(section.key, dict);
          break;
        }
        if (section.type === 'ul' && section.keys?.length) {
          answer = section.keys.map(k => t(k, dict)).filter(Boolean).join(' ');
          break;
        }
      }

      if (question && answer) faqs.push({ question, answer });
    }

    return faqs;
  }

  function upsertMeta(attr, name, content) {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function upsertLink(rel, href, extras) {
    if (!href) return;
    const hreflang = extras?.hreflang;
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]${extras?.type ? `[type="${extras.type}"]` : ''}`;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
    if (extras?.hreflang) el.hreflang = extras.hreflang;
    if (extras?.type) el.type = extras.type;
    if (extras?.title) el.title = extras.title;
  }

  function injectJsonLd(data) {
    document.getElementById(SCHEMA_ID)?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = SCHEMA_ID;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function buildSchemaGraph(article, dict) {
    const headline = t(article.titleKey, dict);
    const description = t(article.excerptKey, dict);
    const url = articleUrl(article);
    const image = absImage(article.image);
    const plain = buildPlainText(article, dict);
    const faqs = buildFAQ(article, dict);
    const logo = `${base}/public%20/images/logos/logo1.png`;
    const tag = t(article.tagKey, dict);
    const keywords = [tag, ...(article.keywords || [])].filter(Boolean).join(', ');

    const graph = [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline,
        name: headline,
        description,
        abstract: description,
        articleBody: plain,
        datePublished: article.date,
        dateModified: article.dateModified || article.date,
        image: { '@type': 'ImageObject', url: image, caption: t(article.imageAltKey, dict) },
        author: { '@type': 'Organization', '@id': `${base}/#organization`, name: 'Vyzion Systems' },
        publisher: {
          '@type': 'Organization',
          name: 'Vyzion Systems',
          logo: { '@type': 'ImageObject', url: logo }
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        url,
        inLanguage: ['en', 'pt-BR'],
        isAccessibleForFree: true,
        wordCount: wordCount(plain),
        timeRequired: `PT${article.readMinutes || 5}M`,
        articleSection: tag,
        keywords,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.blog-article-lead', '.blog-article-callout', '.blog-article-h2', '.blog-article-body p']
        }
      },
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: headline,
        description,
        inLanguage: 'en',
        isPartOf: {
          '@type': 'Blog',
          '@id': `${base}/blog.html#blog`,
          name: 'Vyzion Systems Blog',
          url: `${base}/blog.html`
        },
        primaryImageOfPage: { '@type': 'ImageObject', url: image },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.blog-article-lead', '.blog-article-callout']
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/blog.html` },
          { '@type': 'ListItem', position: 3, name: headline, item: url }
        ]
      }
    ];

    if (faqs.length) {
      graph.push({
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faqs.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer }
        }))
      });
    }

    return { '@context': 'https://schema.org', '@graph': graph };
  }

  function applyHeadMeta(article, dict) {
    const headline = t(article.titleKey, dict);
    const description = t(article.excerptKey, dict);
    const url = articleUrl(article);
    const image = absImage(article.image);
    const tag = t(article.tagKey, dict);
    const keywords = [tag, ...(article.keywords || [])].filter(Boolean).join(', ');

    document.title = `${headline} — Vyzion Systems`;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'author', 'Vyzion Systems');
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:site', '@vyzionsystems');
    upsertMeta('name', 'twitter:title', headline);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
    upsertMeta('property', 'og:type', 'article');
    upsertMeta('property', 'og:site_name', 'Vyzion Systems');
    upsertMeta('property', 'og:title', headline);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:image:alt', t(article.imageAltKey, dict));
    upsertMeta('property', 'og:locale', 'en_US');
    upsertMeta('property', 'og:locale:alternate', 'pt_BR');
    upsertMeta('property', 'article:published_time', `${article.date}T08:00:00+00:00`);
    upsertMeta('property', 'article:modified_time', `${article.dateModified || article.date}T08:00:00+00:00`);
    upsertMeta('property', 'article:author', 'Vyzion Systems');
    upsertMeta('property', 'article:section', tag);
    upsertMeta('property', 'article:tag', tag);

    upsertLink('canonical', url);
    upsertLink('alternate', url, { hreflang: 'en' });
    upsertLink('alternate', url, { hreflang: 'pt-BR' });
    upsertLink('alternate', url, { hreflang: 'x-default' });
    upsertLink('alternate', `${base}/feed.xml`, { type: 'application/rss+xml', title: 'Vyzion Systems Blog' });
  }

  function buildCrawlerArticleHtml(article, dict) {
    const parts = [`<h1>${t(article.titleKey, dict)}</h1>`];
    parts.push(`<p>${t(article.excerptKey, dict)}</p>`);

    (article.sections || []).forEach(section => {
      if (section.type === 'midCta') return;
      if (section.type === 'h2') parts.push(`<h2>${t(section.key, dict)}</h2>`);
      if (section.type === 'p' || section.type === 'callout') parts.push(`<p>${t(section.key, dict)}</p>`);
      if (section.type === 'ul') {
        parts.push(`<ul>${section.keys.map(k => `<li>${t(k, dict)}</li>`).join('')}</ul>`);
      }
    });

    return parts.join('\n');
  }

  function injectCrawlerFallback(article, dict) {
    const html = buildCrawlerArticleHtml(article, dict);
    let mount = document.getElementById('blog-crawler-fallback');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'blog-crawler-fallback';
      mount.hidden = true;
      document.body.prepend(mount);
    }
    mount.innerHTML = html;

    let noscript = document.getElementById('blog-noscript-article');
    if (!noscript) {
      noscript = document.createElement('noscript');
      noscript.id = 'blog-noscript-article';
      document.body.prepend(noscript);
    }
    noscript.innerHTML = `<article>${html}</article>`;
  }

  function initArticlePage() {
    const article = resolveArticle();
    if (!article) return null;

    const dict = getDict('en');
    applyHeadMeta(article, dict);
    injectJsonLd(buildSchemaGraph(article, dict));

    if (document.body) {
      document.body.dataset.articleId = String(article.id);
      document.body.dataset.articleSlug = article.slug || '';
      injectCrawlerFallback(article, dict);
    }

    return article;
  }

  window.VyzionBlogSEO = {
    base,
    resolveArticle,
    articleUrl,
    getDict,
    t,
    buildPlainText,
    buildFAQ,
    buildSchemaGraph,
    applyHeadMeta,
    injectJsonLd,
    buildCrawlerArticleHtml,
    initArticlePage
  };

  if (/\/blog-article\.html/i.test(window.location.pathname)) {
    const article = resolveArticle();
    if (article) {
      const dict = getDict('en');
      applyHeadMeta(article, dict);
      injectJsonLd(buildSchemaGraph(article, dict));
    }
  }
})();
