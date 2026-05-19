/* Testimonial slider — auto-advancing crossfade carousel.
 * Initializes any element with class .testimonial-slider on the page.
 * - data-interval (ms) on the container controls auto-advance speed (default 9000).
 * - Auto-advance pauses on hover and focus-within.
 * - Respects prefers-reduced-motion (no auto-advance for those users).
 * - Dot indicators are clickable and keyboard-focusable.
 * - Left/Right arrow keys navigate when the slider has focus.
 */
(function () {
  'use strict';

  function initSlider(root) {
    var cards = root.querySelectorAll('.ts-card');
    var dots = root.querySelectorAll('.ts-dot');
    if (!cards.length || !dots.length) return;

    var interval = parseInt(root.getAttribute('data-interval'), 10) || 9000;
    var current = 0;
    var timer = null;
    var paused = false;

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(idx) {
      idx = ((idx % cards.length) + cards.length) % cards.length;
      cards.forEach(function (c, i) {
        var active = i === idx;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (d, i) {
        var active = i === idx;
        d.classList.toggle('is-active', active);
        d.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      current = idx;
    }

    function next() { show(current + 1); }

    function start() {
      if (reducedMotion || paused || timer) return;
      timer = setInterval(next, interval);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    // Dot navigation
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    // Keyboard navigation when slider has focus
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); restart(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); restart(); }
    });

    // Pause on hover / focus
    root.addEventListener('mouseenter', function () { paused = true; stop(); });
    root.addEventListener('mouseleave', function () { paused = false; start(); });
    root.addEventListener('focusin', function () { paused = true; stop(); });
    root.addEventListener('focusout', function () {
      if (!root.contains(document.activeElement)) { paused = false; start(); }
    });

    // Pause when tab not visible (saves CPU)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (!paused) start();
    });

    start();
  }

  function init() {
    document.querySelectorAll('.testimonial-slider').forEach(initSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
