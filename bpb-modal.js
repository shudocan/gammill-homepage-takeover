/* Business Plan Builder modal — open/close + HubSpot embed reveal.
 * Initializes only when #bpModal exists on the page (Ch 12 + Ch 13).
 * Trigger: any element with class .bpb-trigger on the page.
 */
(function () {
  'use strict';

  function init() {
    var modal = document.getElementById('bpModal');
    if (!modal) return; // page doesn't have the modal markup

    var overlay = document.getElementById('bpOverlay');
    var closeBtn = document.getElementById('bpCloseBtn');
    var bodyEl = document.getElementById('bpBody');
    var triggers = document.querySelectorAll('.bpb-trigger');

    function openModal() {
      document.body.classList.add('bp-lock');
      modal.classList.add('is-open');
      overlay.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      // Focus the first focusable element in the modal after the form mounts
      requestAnimationFrame(function () {
        setTimeout(function () {
          var first = modal.querySelector('input,select,textarea,button,[tabindex]:not([tabindex="-1"])');
          if (first) {
            try { first.focus({ preventScroll: true }); }
            catch (e) { first.focus(); }
          }
        }, 140);
      });
    }

    function closeModal() {
      document.body.classList.remove('bp-lock');
      modal.classList.remove('is-open');
      overlay.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      // Return focus to the trigger that opened the modal (best-effort)
      if (window._bpbLastTrigger) {
        try { window._bpbLastTrigger.focus(); } catch (e) {}
      }
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window._bpbLastTrigger = btn;
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Reveal the body once the HubSpot form (or any form/iframe inside) is mounted.
    // Prevents the empty-modal jitter while HubSpot's embed script bootstraps.
    var mo = new MutationObserver(function () {
      var formNode = bodyEl.querySelector('.hs-form, form, iframe');
      if (formNode) {
        setTimeout(function () { bodyEl.classList.add('is-ready'); }, 60);
        mo.disconnect();
        hardenNumericFields();
      }
    });
    mo.observe(bodyEl, { childList: true, subtree: true });

    // Guardrail: if HubSpot is slow, reveal anyway after 2.5s so user isn't stuck on a blank modal
    setTimeout(function () { bodyEl.classList.add('is-ready'); }, 2500);

    function hardenNumericFields() {
      var bad = new Set(['-', '+', 'e', 'E']);
      bodyEl.querySelectorAll('input[type="number"], input[data-field-type="number"]').forEach(function (inp) {
        inp.addEventListener('keydown', function (ev) {
          if (bad.has(ev.key)) ev.preventDefault();
        });
        inp.addEventListener('input', function () {
          var v = String(inp.value);
          var cleaned = v.replace(/[^\d.]/g, '').replace(/(\..*)\./, '$1');
          if (cleaned !== v) inp.value = cleaned;
        });
        inp.addEventListener('wheel', function (e) { e.preventDefault(); }, { passive: false });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
