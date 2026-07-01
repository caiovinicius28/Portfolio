(function () {
  const articles = window.VYZION_BLOG_ARTICLES || [];
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const slug = params.get('slug');
  const SEO = window.VyzionBlogSEO;
  const article = SEO?.resolveArticle?.()
    || articles.find(a => a.slug === slug)
    || articles.find(a => a.id === id);

  if (article?.slug) {
    window.location.replace(`blog/${article.slug}.html`);
    return;
  }

  window.location.replace('blog.html');
})();
