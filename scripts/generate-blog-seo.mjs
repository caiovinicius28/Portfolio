import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import vm from 'vm';

const root = fileURLToPath(new URL('..', import.meta.url));
const base = 'https://vyzionsystems.com';

function loadArticles() {
  const articlesCode = readFileSync(`${root}/js/blog-articles.js`, 'utf8');
  const translationsCode = readFileSync(`${root}/js/i18n/translations.js`, 'utf8');
  const richCode = readFileSync(`${root}/js/blog-rich-copy.js`, 'utf8');
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(`${translationsCode}\n${richCode}\n${articlesCode}`, sandbox);
  return {
    articles: sandbox.VYZION_BLOG_ARTICLES,
    dict: { ...sandbox.VYZION_TRANSLATIONS.en }
  };
}

function t(dict, key) {
  return dict[key] || '';
}

function articleUrl(slug) {
  return `${base}/blog/${encodeURIComponent(slug)}.html`;
}

function absImage(path) {
  return `${base}/${String(path || '').replace(/^\//, '')}`;
}

function buildPlainText(article, dict) {
  const keys = [article.titleKey, article.excerptKey];
  (article.sections || []).forEach(section => {
    if (section.type === 'midCta') return;
    if (section.key) keys.push(section.key);
    if (section.keys) keys.push(...section.keys);
  });
  return keys.map(key => t(dict, key)).filter(Boolean).join('\n\n');
}

function buildFAQ(article, dict) {
  const sections = article.sections || [];
  const faqs = [];
  for (let i = 0; i < sections.length; i += 1) {
    if (sections[i].type !== 'h2') continue;
    const question = t(dict, sections[i].key);
    let answer = '';
    for (let j = i + 1; j < sections.length; j += 1) {
      const section = sections[j];
      if (section.type === 'h2') break;
      if (section.type === 'p' || section.type === 'callout') {
        answer = t(dict, section.key);
        break;
      }
      if (section.type === 'ul' && section.keys?.length) {
        answer = section.keys.map(k => t(dict, k)).filter(Boolean).join(' ');
        break;
      }
    }
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(value) {
  return escapeHtml(value);
}

function rssDate(isoDate) {
  return new Date(`${isoDate}T08:00:00Z`).toUTCString();
}

function renderBodyHtml(article, dict) {
  const parts = [];
  let h2Index = 0;
  (article.sections || []).forEach(section => {
    if (section.type === 'midCta') {
      parts.push(`
          <aside class="blog-article-mid-cta">
            <div>
              <strong>Want results like this on your site?</strong>
              <p>We build fast, conversion-focused websites and SaaS for brands worldwide.</p>
            </div>
            <a class="btn btn-primary" href="https://calendly.com/contact-vyzionsystems/30min">Free consultation</a>
          </aside>`);
      return;
    }
    if (section.type === 'h2') {
      h2Index += 1;
      parts.push(`<h2 class="blog-article-h2" id="section-${h2Index}">${escapeHtml(t(dict, section.key))}</h2>`);
    }
    if (section.type === 'p') {
      parts.push(`<p>${escapeHtml(t(dict, section.key))}</p>`);
    }
    if (section.type === 'callout') {
      parts.push(`<blockquote class="blog-article-callout">${escapeHtml(t(dict, section.key))}</blockquote>`);
    }
    if (section.type === 'ul') {
      parts.push(`<ul class="blog-article-list">${section.keys.map(k => `<li>${escapeHtml(t(dict, k))}</li>`).join('')}</ul>`);
    }
    if (section.type === 'figure') {
      const src = article[section.imageKey] || article.image;
      parts.push(`
          <figure class="blog-article-figure">
            <img src="../${src}" alt="${escapeHtml(t(dict, section.altKey))}" loading="lazy" />
          </figure>`);
    }
  });
  return parts.join('\n');
}

function buildSchemaGraph(article, dict) {
  const headline = t(dict, article.titleKey);
  const description = t(dict, article.excerptKey);
  const url = articleUrl(article.slug);
  const image = absImage(article.image);
  const plain = buildPlainText(article, dict);
  const faqs = buildFAQ(article, dict);
  const tag = t(dict, article.tagKey);
  const keywords = [tag, ...(article.keywords || [])].filter(Boolean).join(', ');
  const logo = `${base}/public%20/images/logos/logo1.png`;

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
      image: { '@type': 'ImageObject', url: image, caption: t(dict, article.imageAltKey) },
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
      wordCount: plain.split(/\s+/).filter(Boolean).length,
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

function generateStaticArticlePage(article, dict, articles) {
  const headline = t(dict, article.titleKey);
  const description = t(dict, article.excerptKey);
  const url = articleUrl(article.slug);
  const image = absImage(article.image);
  const tag = t(dict, article.tagKey);
  const keywords = [tag, ...(article.keywords || [])].filter(Boolean).join(', ');
  const bodyHtml = renderBodyHtml(article, dict);
  const schema = JSON.stringify(buildSchemaGraph(article, dict));
  const tocItems = (article.sections || [])
    .filter(s => s.type === 'h2')
    .map((s, i) => `<li><a href="#section-${i + 1}">${escapeHtml(t(dict, s.key))}</a></li>`)
    .join('');
  const related = articles
    .filter(a => a.id !== article.id)
    .slice(0, 3)
    .map(a => `
      <a class="blog-related-card" href="${a.slug}.html">
        <img src="../${a.image}" alt="${escapeHtml(t(dict, a.imageAltKey))}" loading="lazy" />
        <span class="blog-card-tag">${escapeHtml(t(dict, a.tagKey))}</span>
        <strong>${escapeHtml(t(dict, a.titleKey))}</strong>
      </a>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(headline)} — Vyzion Systems</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(keywords)}" />
  <meta name="author" content="Vyzion Systems" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en" href="${url}" />
  <link rel="alternate" hreflang="pt-BR" href="${url}" />
  <link rel="alternate" hreflang="x-default" href="${url}" />
  <link rel="alternate" type="application/rss+xml" title="Vyzion Systems Blog" href="/feed.xml" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Vyzion Systems" />
  <meta property="og:title" content="${escapeHtml(headline)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:alt" content="${escapeHtml(t(dict, article.imageAltKey))}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:locale:alternate" content="pt_BR" />
  <meta property="article:published_time" content="${article.date}T08:00:00+00:00" />
  <meta property="article:modified_time" content="${article.dateModified || article.date}T08:00:00+00:00" />
  <meta property="article:author" content="Vyzion Systems" />
  <meta property="article:section" content="${escapeHtml(tag)}" />
  <meta property="article:tag" content="${escapeHtml(tag)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@vyzionsystems" />
  <meta name="twitter:title" content="${escapeHtml(headline)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="theme-color" content="#03070c" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/loader.css" />
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="stylesheet" href="../css/header.css" />
  <link rel="stylesheet" href="../css/site-ext.css" />
  <link rel="stylesheet" href="../css/blog-page.css" />
  <link rel="stylesheet" href="../css/blog-article.css" />
  <link rel="stylesheet" href="../css/newsletter-digest.css" />
  <link rel="stylesheet" href="../css/responsive.css" />
  <script type="application/ld+json">${schema}</script>
</head>
<body data-page="blog-article" data-article-id="${article.id}" data-article-slug="${article.slug}" data-static-seo="true">
  <div id="vyzion-loader" class="vyzion-loader" aria-live="polite">
    <div class="vyzion-loader-inner">
      <img class="vyzion-loader-logo" src="../public%20/images/brand/silerlogo1.png" alt="" width="118" height="118" decoding="sync" />
      <div class="vyzion-loader-bar" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="vyzion-loader-bar-track" aria-hidden="true"></span>
        <span class="vyzion-loader-bar-fill" aria-hidden="true"></span>
        <span class="vyzion-loader-bar-flare" aria-hidden="true"></span>
        <span class="vyzion-loader-bar-tip" aria-hidden="true"></span>
      </div>
    </div>
  </div>
  <div class="page-orb page-orb-a"></div>
  <div class="page-orb page-orb-b"></div>
  <div class="noise"></div>
  <div id="site-header-mount"></div>
  <main id="blog-article-main">
    <div class="blog-article-shell">
      <div class="blog-article-layout">
        <article class="blog-article show" itemscope itemtype="https://schema.org/BlogPosting">
          <a class="blog-article-back" href="../blog.html">← Back to blog</a>
          <header class="blog-article-header">
            <div class="blog-article-meta-row">
              <span class="blog-card-tag">${escapeHtml(tag)}</span>
              <span class="blog-article-read">${article.readMinutes || 5} min read</span>
            </div>
            <time datetime="${article.date}" itemprop="datePublished">${escapeHtml(t(dict, article.dateKey))}</time>
            <h1 itemprop="headline">${escapeHtml(headline)}</h1>
            <p class="blog-article-byline">Vyzion Systems · Digital growth team</p>
            <p class="blog-article-lead" itemprop="description">${escapeHtml(description)}</p>
          </header>
          <div class="blog-article-hero">
            <img src="../${article.image}" alt="${escapeHtml(t(dict, article.imageAltKey))}" itemprop="image" loading="eager" />
          </div>
          <div class="blog-article-body" itemprop="articleBody">
${bodyHtml}
          </div>
          <aside class="blog-article-end-cta">
            <h3>Let's build your next growth asset</h3>
            <p>Tell us about your project or book a free consultation.</p>
            <div class="blog-article-end-cta-actions">
              <a class="btn btn-primary" href="https://calendly.com/contact-vyzionsystems/30min">Free consultation</a>
              <a class="btn btn-outline" href="../contact.html">Start your project ↗</a>
            </div>
          </aside>
        </article>
        <aside class="blog-article-aside" aria-label="Article sidebar">
          <div class="blog-aside-card blog-aside-sticky">
            <p class="blog-aside-label">In this article</p>
            <ol class="blog-aside-toc">${tocItems}</ol>
            <div class="blog-aside-divider"></div>
            <strong>Ready to grow?</strong>
            <p>Book a free strategy call — no obligation.</p>
            <a class="btn btn-primary" href="https://calendly.com/contact-vyzionsystems/30min">Free consultation</a>
          </div>
        </aside>
      </div>
      <section class="blog-related">
        <h2>Continue reading</h2>
        <div class="blog-related-grid">${related}</div>
      </section>
    </div>
  </main>
  <div id="site-footer-mount"></div>
  <div id="site-widgets-mount"></div>
  <script src="../js/loader.js"></script>
  <script src="../js/site-config.js"></script>
  <script src="../js/indexing-meta.js"></script>
  <script src="../js/i18n/config.js"></script>
  <script src="../js/i18n/translations.js"></script>
  <script src="../js/seo.js"></script>
  <script src="../js/i18n/engine.js"></script>
  <script src="../js/script.js"></script>
  <script src="../js/site-header.js"></script>
  <script src="../js/social-links.js"></script>
  <script src="../js/site-ui.js"></script>
</body>
</html>
`;
}

function generateFeed(articles, dict) {
  const items = articles.map(article => {
    const title = t(dict, article.titleKey);
    const description = t(dict, article.excerptKey);
    const link = articleUrl(article.slug);
    const body = buildPlainText(article, dict);
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rssDate(article.date)}</pubDate>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${body}]]></content:encoded>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Vyzion Systems Blog</title>
    <link>${base}/blog.html</link>
    <description>Digital growth guides on websites, SEO, performance, SaaS and AEO from Vyzion Systems.</description>
    <language>en</language>
    <lastBuildDate>${rssDate(articles[0]?.date || '2026-03-01')}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

function generateSitemapUrls(articles, dict) {
  const staticUrls = readFileSync(`${root}/sitemap.xml`, 'utf8')
    .split('\n')
    .filter(line => !line.includes('blog-article.html') && !line.includes('/blog/'))
    .join('\n')
    .replace('</urlset>', '');

  const articleUrls = articles.map(article => {
    const loc = articleUrl(article.slug);
    const image = absImage(article.image);
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${article.dateModified || article.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image><image:loc>${image}</image:loc><image:title>${escapeXml(t(dict, article.titleKey))}</image:title></image:image>
  </url>`;
  }).join('\n');

  return `${staticUrls}${articleUrls}\n</urlset>\n`;
}

function generateLlmsSection(articles, dict) {
  return articles.map(article => {
    const title = t(dict, article.titleKey);
    const excerpt = t(dict, article.excerptKey);
    const tag = t(dict, article.tagKey);
    const keywords = (article.keywords || []).join(', ');
    return `- ${title} (${tag}) — ${excerpt} Keywords: ${keywords}. URL: ${articleUrl(article.slug)}`;
  }).join('\n');
}

const { articles, dict } = loadArticles();
const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));

mkdirSync(`${root}/blog`, { recursive: true });
sorted.forEach(article => {
  writeFileSync(
    `${root}/blog/${article.slug}.html`,
    generateStaticArticlePage(article, dict, sorted)
  );
});

writeFileSync(`${root}/feed.xml`, generateFeed(sorted, dict));
writeFileSync(`${root}/sitemap.xml`, generateSitemapUrls(sorted, dict));

const llmsPath = `${root}/llms.txt`;
const llms = readFileSync(llmsPath, 'utf8');
const section = generateLlmsSection(sorted, dict);
const updatedLlms = llms.replace(
  /## Blog articles \(guides\)[\s\S]*?(?=\n## FAQ summary)/,
  `## Blog articles (guides)\n${section}\n\n`
);
writeFileSync(llmsPath, updatedLlms);

console.log(`Generated ${sorted.length} static blog pages, feed.xml, sitemap.xml, and llms.txt.`);
