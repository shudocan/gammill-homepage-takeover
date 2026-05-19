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

    // ---------- Intercept HubSpot redirect, show inline thank-you ----------
    // HubSpot V2 embed posts a 'hsFormCallback' message after submission.
    // We listen, swap the modal body with our own thank-you, and block the
    // redirect via multiple methods (override location.assign/replace +
    // beforeunload guard). The redirect URL is preserved as a clickable
    // 'continue to longarmquiltingbusiness.com' link the user can choose.
    window.addEventListener('message', function (e) {
      if (!e.data || e.data.type !== 'hsFormCallback') return;
      if (e.data.eventName !== 'onFormSubmitted') return;

      // Find which modal body owns the form that submitted, if multiple.
      // For BPB we know it's #bpBody.
      var redirectUrl = (e.data.data && e.data.data.redirectUrl) || null;

      // 1. Replace the modal body with our thank-you state.
      var continueLink = '';
      if (redirectUrl) {
        continueLink =
          '<p style="margin:1.4em 0 0;">' +
          '<a href="' + encodeURI(redirectUrl) + '" target="_blank" rel="noopener" ' +
          'style="display:inline-block; padding:0.7em 1.2em; background:#FAAD3D; color:#111; ' +
          'text-decoration:none; border-radius:999px; font-family:Raleway, sans-serif; ' +
          'font-weight:600; font-size:0.95em;">Continue to the long-form Quilting Business playbook →</a>' +
          '</p>';
      }
      bodyEl.innerHTML =
        '<div style="padding:1.6em 0.4em; text-align:center; font-family:\'Open Sans\', system-ui, sans-serif;">' +
        '<div style="font-size:2.8em; line-height:1; margin-bottom:0.3em;">📬</div>' +
        '<h3 style="font-family:Raleway, sans-serif; font-size:1.45rem; font-weight:700; margin:0 0 0.6em; color:#111;">Your business plan is on its way.</h3>' +
        '<p style="margin:0 auto; max-width:480px; color:#333; line-height:1.6;">' +
        'Check your inbox in the next 30 minutes. The plan is tailored to your local market, ' +
        'the machine you picked, and how many hours per week you\'re willing to work - ' +
        'including projected payback dates.</p>' +
        continueLink +
        '</div>';

      // 2. Block the HubSpot redirect for ~6 seconds so the user can read.
      //    HubSpot V2 typically calls window.location.assign(redirectUrl) after this event.
      var blockUntil = Date.now() + 6000;
      var origAssign = window.location.assign.bind(window.location);
      var origReplace = window.location.replace.bind(window.location);
      try {
        window.location.assign = function (url) {
          if (Date.now() < blockUntil) {
            console.log('[bpb-modal] blocked redirect.assign →', url);
            return;
          }
          return origAssign(url);
        };
        window.location.replace = function (url) {
          if (Date.now() < blockUntil) {
            console.log('[bpb-modal] blocked redirect.replace →', url);
            return;
          }
          return origReplace(url);
        };
      } catch (err) {
        // location methods are not always assignable in all browsers
        console.log('[bpb-modal] could not override location methods:', err);
      }

      // 3. beforeunload fallback - blocks programmatic top-level navigation,
      //    may show a browser dialog in some cases; auto-removes after the block window.
      var beforeUnload = function (ev) {
        ev.preventDefault();
        ev.returnValue = '';
        return '';
      };
      window.addEventListener('beforeunload', beforeUnload);

      // 4. Restore native behavior after the block window expires.
      setTimeout(function () {
        try {
          window.location.assign = origAssign;
          window.location.replace = origReplace;
        } catch (err) {}
        window.removeEventListener('beforeunload', beforeUnload);
      }, 6500);
    }, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
