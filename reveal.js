// Scroll-triggered reveals. Adds .reveal-in to elements with [data-reveal]
// when they enter viewport. CSS handles the actual animation.
(() => {
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('reveal-in'));
    return;
  }
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in');
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(el => io.observe(el));
})();
