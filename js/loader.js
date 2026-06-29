(function () {
  const loader = document.getElementById('vyzion-loader');
  if (!loader) return;

  const fill = loader.querySelector('.vyzion-loader-bar-fill');
  const tip = loader.querySelector('.vyzion-loader-bar-tip');
  const flare = loader.querySelector('.vyzion-loader-bar-flare');
  const bar = loader.querySelector('.vyzion-loader-bar');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('loader-active');

  let progress = 0;
  let rafId = 0;
  let finished = false;
  const minTime = reduced ? 350 : 1500;
  const start = performance.now();

  function setProgress(value) {
    progress = Math.min(100, Math.max(0, value));
    const pct = `${progress}%`;

    if (fill) fill.style.width = pct;
    if (tip) tip.style.left = pct;
    if (flare) flare.style.left = pct;
    if (bar) bar.setAttribute('aria-valuenow', String(Math.round(progress)));
  }

  function animateProgress() {
    if (progress >= 90 || finished) return;
    setProgress(progress + (90 - progress) * 0.045 + 0.25);
    rafId = requestAnimationFrame(animateProgress);
  }

  if (reduced) {
    setProgress(88);
  } else {
    loader.querySelectorAll('.vyzion-loader-bar-fill, .vyzion-loader-bar-tip, .vyzion-loader-bar-flare').forEach(el => {
      el.style.animation = 'none';
    });
    setProgress(4);
    rafId = requestAnimationFrame(animateProgress);
  }

  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(rafId);
    setProgress(100);

    requestAnimationFrame(() => {
      loader.classList.add('is-done');
      document.body.classList.remove('loader-active');
    });

    window.setTimeout(() => loader.remove(), 750);
  }

  function tryFinish() {
    const elapsed = performance.now() - start;
    window.setTimeout(finish, Math.max(0, minTime - elapsed));
  }

  if (document.readyState === 'complete') {
    tryFinish();
  } else {
    window.addEventListener('load', tryFinish, { once: true });
    window.setTimeout(tryFinish, 9000);
  }
})();
