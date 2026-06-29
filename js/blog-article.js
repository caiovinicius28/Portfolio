(function () {
  const articles = window.VYZION_BLOG_ARTICLES || [];
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const slug = params.get('slug');
  const article = articles.find(a => a.id === id) || articles.find(a => a.slug === slug);
  const main = document.getElementById('blog-article-main');

  if (!article || !main) {
    window.location.replace('blog.html');
    return;
  }

  window.__VYZION_CURRENT_ARTICLE__ = article;
  document.body.dataset.articleId = String(article.id);

  const bodyHtml = article.bodyKeys
    .map(key => `<p data-i18n="${key}"></p>`)
    .join('');

  main.innerHTML = `
    <article class="blog-article reveal" itemscope itemtype="https://schema.org/Article">
      <a class="blog-article-back" href="blog.html" data-i18n="blog.back">← Back to blog</a>
      <header class="blog-article-header">
        <span class="blog-card-tag" data-i18n="${article.tagKey}"></span>
        <time datetime="${article.date}" itemprop="datePublished" data-i18n="${article.dateKey}"></time>
        <h1 itemprop="headline" data-i18n="${article.titleKey}"></h1>
        <p class="blog-article-lead" itemprop="description" data-i18n="${article.excerptKey}"></p>
      </header>
      <div class="blog-article-hero">
        <img src="${article.image}" alt="" data-i18n-alt="${article.imageAltKey}" itemprop="image" loading="eager" />
      </div>
      <div class="blog-article-body" itemprop="articleBody">${bodyHtml}</div>
      <footer class="blog-article-footer">
        <a class="btn btn-outline" href="contact.html" data-i18n="blog.articleCta">Start your project ↗</a>
        <a class="blog-article-back" href="blog.html" data-i18n="blog.back">← Back to blog</a>
      </footer>
    </article>
  `;

  function applyArticleMeta() {
    const locale = document.documentElement.dataset.locale
      || localStorage.getItem('vyzion-detected-locale')
      || 'en';
    const dict = window.VYZION_TRANSLATIONS?.[locale] || window.VYZION_TRANSLATIONS?.en || {};
    const title = dict[article.titleKey] || 'Article';
    const description = dict[article.excerptKey] || '';

    document.title = `${title} — Vyzion Systems`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) metaDesc.setAttribute('content', description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `https://vyzionsystems.com/blog-article.html?id=${article.id}`);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `https://vyzionsystems.com/blog-article.html?id=${article.id}`);
  }

  function waitForI18n() {
    if (document.documentElement.classList.contains('i18n-ready')) {
      applyArticleMeta();
      return;
    }
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains('i18n-ready')) {
        observer.disconnect();
        applyArticleMeta();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  waitForI18n();
})();
