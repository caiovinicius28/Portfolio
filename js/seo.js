(function () {
  const site = window.VYZION_SITE || {};
  const base = (site.url || 'https://vyzionsystems.com').replace(/\/$/, '');
  const ogImage = `${base}/public%20/images/brand/site.png`;
  const logo = `${base}/public%20/images/logos/logo1.png`;
  const page = document.body?.dataset?.page || '';
  const articleId = Number(document.body?.dataset?.articleId || 0);

  function injectJsonLd(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function getEn(key) {
    return window.VYZION_TRANSLATIONS?.en?.[key] || '';
  }

  function breadcrumbs(items) {
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url
      }))
    });
  }

  const org = {
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: site.name || 'Vyzion Systems',
    url: base,
    logo: { '@type': 'ImageObject', url: logo },
    email: site.email || 'hello@vyzionsystems.com',
    telephone: site.phone || '+55-62-99480-0483',
    sameAs: site.sameAs || [],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-62-99480-0483',
      contactType: 'sales',
      availableLanguage: ['English', 'Portuguese'],
      areaServed: 'Worldwide'
    }
  };

  injectJsonLd({
    '@context': 'https://schema.org',
    '@graph': [org]
  });

  if (page === 'home' || page === '') {
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      name: 'Vyzion Systems',
      url: base,
      description: getEn('meta.description') || 'Premium websites, landing pages and custom software.',
      publisher: { '@id': `${base}/#organization` },
      inLanguage: ['en', 'pt-BR'],
      potentialAction: {
        '@type': 'SearchAction',
        target: `${base}/blog.html?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    });

    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${base}/#service`,
      name: 'Vyzion Systems',
      url: base,
      image: ogImage,
      description: 'Web design, landing pages, custom SaaS, UI/UX and technical SEO for businesses worldwide.',
      priceRange: '$$',
      areaServed: { '@type': 'Place', name: 'Worldwide' },
      serviceType: [
        'Web Design',
        'Landing Page Development',
        'Custom SaaS Development',
        'UI/UX Design',
        'Technical SEO',
        'Website Performance Optimization'
      ],
      provider: { '@id': `${base}/#organization` }
    });
  }

  if (page === 'about') {
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: getEn('about.pageTitle') || 'About — Vyzion Systems',
      url: `${base}/about.html`,
      description: getEn('about.pageDescription'),
      mainEntity: { '@id': `${base}/#organization` }
    });
    breadcrumbs([
      { name: 'Home', url: `${base}/` },
      { name: 'About', url: `${base}/about.html` }
    ]);
  }

  if (page === 'contact') {
    breadcrumbs([
      { name: 'Home', url: `${base}/` },
      { name: 'Contact', url: `${base}/contact.html` }
    ]);
  }

  if (page === 'blog') {
    const articles = window.VYZION_BLOG_ARTICLES || [];
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: getEn('blog.title') || 'Vyzion Systems Blog',
      url: `${base}/blog.html`,
      description: getEn('blog.lead'),
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: articles.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${base}/blog-article.html?id=${a.id}`,
          name: getEn(a.titleKey)
        }))
      }
    });
    breadcrumbs([
      { name: 'Home', url: `${base}/` },
      { name: 'Blog', url: `${base}/blog.html` }
    ]);
  }

  if (page === 'blog-article' && articleId) {
    const article = (window.VYZION_BLOG_ARTICLES || []).find(a => a.id === articleId);
    if (article) {
      const headline = getEn(article.titleKey);
      const description = getEn(article.excerptKey);
      const articleUrl = `${base}/blog-article.html?id=${article.id}`;

      injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${articleUrl}#article`,
        headline,
        description,
        datePublished: article.date,
        dateModified: article.date,
        image: `${base}/${article.image.replace(/^\//, '')}`,
        author: { '@type': 'Organization', name: 'Vyzion Systems', url: base },
        publisher: {
          '@type': 'Organization',
          name: 'Vyzion Systems',
          logo: { '@type': 'ImageObject', url: logo }
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
        url: articleUrl,
        inLanguage: 'en',
        articleSection: getEn(article.tagKey),
        keywords: getEn(article.tagKey)
      });

      breadcrumbs([
        { name: 'Home', url: `${base}/` },
        { name: 'Blog', url: `${base}/blog.html` },
        { name: headline, url: articleUrl }
      ]);
    }
  }

  if (page === 'faq') {
    breadcrumbs([
      { name: 'Home', url: `${base}/` },
      { name: 'FAQ', url: `${base}/faq.html` }
    ]);
  }
})();
