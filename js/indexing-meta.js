(function () {
  const site = window.VYZION_SITE || {};
  const google = site.googleSiteVerification;
  const bing = site.bingSiteVerification;

  function addMeta(name, content, isProperty) {
    if (!content) return;
    const attr = isProperty ? 'property' : 'name';
    if (document.querySelector(`meta[${attr}="${name}"]`)) return;
    const meta = document.createElement('meta');
    meta.setAttribute(attr, name);
    meta.content = content;
    document.head.appendChild(meta);
  }

  addMeta('google-site-verification', google, false);
  addMeta('msvalidate.01', bing, false);
})();
