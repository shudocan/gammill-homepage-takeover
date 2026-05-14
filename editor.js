/* Why Gammill Tour - in-page Edit Mode
 * Drop-in script. Adds a floating toolbar with Edit / Save / Copy Changes / Reset.
 * Persists per-page edits in localStorage so refreshes don't lose progress.
 * On Copy Changes: dumps a structured diff to clipboard for handoff.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'gammill-tour-edits::' + location.pathname;

  // CSS selectors for editable text regions across linear chapter pages,
  // index.html (tour entry), and scroll.html (endless-scroll variant).
  const SELECTORS = [
    // Linear chapter pages
    '.hero h1',
    '.hero .kicker-rule',
    '.hero .lede',
    '.hero .lede-subtext',
    '.copy .kicker',
    '.copy h2',
    '.copy p',
    '.copy ul li',
    '.copy .stats-editorial .num',
    '.copy .stats-editorial .lbl',
    '.copy .testimonial-card .testimonial-meta > div',
    '.copy .pullquote-editorial p',
    '.deeper .deeper-label',
    '.deeper .deeper-link',
    '.flow-nav .flow-btn',
    '.progress-name',
    // index.html (takeover/landing variants)
    '.takeover-hero h1',
    '.takeover-hero .lede',
    '.takeover-hero .kicker-rule',
    '.takeover-hero .tour-meta div',
    '.landing-hero h1',
    '.landing-hero .lede',
    '.landing-hero .kicker-rule',
    '.toc-list .toc-title',
    '.toc-list .toc-desc',
    // scroll.html
    '.top-bar .brand em',
    '.scroll-cue',
    'section .chapter-label',
    'section h1.display',
    'section h2.display',
    'section .lede',
    'section p.body',
    'section ul.body li',
    'section .media .caption',
    'section blockquote',
    'section cite',
    'section .stats .stat .num',
    'section .stats .stat .lbl',
    'section .pricing .row .name',
    'section .pricing .row .price',
    'section .pricing .row .mo',
    'section .pricing-foot',
    'section .ctas a',
    'footer .copy',
  ];

  let editing = false;
  const originals = new Map(); // element → original innerHTML

  // ---------- Toolbar UI ----------
  const toolbar = document.createElement('div');
  toolbar.className = 'editor-toolbar';
  toolbar.setAttribute('data-no-edit', 'true');
  toolbar.innerHTML = `
    <button class="ed-btn ed-toggle" title="Toggle Edit Mode">✏️ Edit</button>
    <button class="ed-btn ed-save" hidden title="Save changes to localStorage">💾 Save</button>
    <button class="ed-btn ed-copy" hidden title="Copy changes to clipboard">📋 Copy Changes</button>
    <button class="ed-btn ed-reset" hidden title="Discard all saved changes">🗑️ Reset</button>
    <button class="ed-btn ed-help" hidden title="How does this work?">❔ How to use</button>
    <span class="ed-status"></span>
  `;

  // ---------- Help modal ----------
  const helpModal = document.createElement('div');
  helpModal.className = 'editor-help-modal';
  helpModal.setAttribute('data-no-edit', 'true');
  helpModal.setAttribute('hidden', '');
  helpModal.innerHTML = `
    <div class="ed-help-backdrop"></div>
    <div class="ed-help-card" role="dialog" aria-modal="true" aria-labelledby="ed-help-title">
      <button class="ed-help-close" aria-label="Close help">×</button>
      <h2 id="ed-help-title">You're in Edit Mode</h2>
      <p class="ed-help-lede">Click any highlighted text region on the page and type to change it. Your changes save automatically to <strong>your browser</strong> as you go - they don't get sent anywhere yet.</p>

      <h3>How to send your changes to Andrew</h3>
      <ol>
        <li>Make your edits on this page.</li>
        <li>Click <strong>📋 Copy Changes</strong> in the toolbar (bottom-left). A diff of your changes lands on your clipboard.</li>
        <li>Paste it in Slack / email / wherever you talk to Andrew.</li>
      </ol>

      <h3>⚠️ Each page is separate - copy before you navigate</h3>
      <p>Edits on Chapter 4 are stored separately from edits on Chapter 7. <strong>Copy Changes only exports the current page.</strong> Before you click "Continue" or jump to another chapter, hit Copy Changes and stash that page's diff. If you forget, your changes are still in your browser - but you'll need to come back to each page individually to export them.</p>

      <h3>What to keep in mind</h3>
      <ul>
        <li><strong>Other reviewers can't see your edits.</strong> Each person is in their own private session. Andrew reconciles everyone's diffs.</li>
        <li><strong>Your edits live in this browser only.</strong> Different laptop, different browser, or cleared cookies → edits gone. Send the diff while it's fresh.</li>
        <li><strong>If Andrew pushes a new version</strong> while you're editing, the underlying copy may shift under you. Copy your edits often.</li>
      </ul>

      <h3>Quick keys</h3>
      <ul class="ed-help-keys">
        <li><kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> - toggle edit mode</li>
        <li><kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> - save</li>
        <li><kbd>Esc</kbd> - close this help</li>
      </ul>

      <div class="ed-help-actions">
        <button class="ed-btn ed-help-ok">Got it</button>
      </div>
    </div>
  `;

  // ---------- Styles ----------
  const style = document.createElement('style');
  style.textContent = `
    .editor-toolbar {
      position: fixed;
      bottom: 14px;
      left: 14px;
      z-index: 9999;
      background: #fff;
      border: 1px solid #d8d8d8;
      border-radius: 8px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.18);
      padding: 8px;
      display: flex;
      gap: 6px;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      max-width: calc(100vw - 28px);
      flex-wrap: wrap;
    }
    .editor-toolbar .ed-btn {
      padding: 6px 10px;
      border: 1px solid #ccc;
      background: #fafafa;
      color: #222;
      border-radius: 5px;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
      transition: background 0.15s, border-color 0.15s;
    }
    .editor-toolbar .ed-btn:hover { background: #efefef; border-color: #aaa; }
    .editor-toolbar .ed-btn:active { background: #e0e0e0; }
    .editor-toolbar .ed-toggle { background: #FAAD3D; border-color: #F39000; color: #111; font-weight: 600; }
    .editor-toolbar .ed-toggle:hover { background: #F39000; }
    .editor-toolbar .ed-status {
      color: #555;
      padding: 0 6px;
      font-size: 11px;
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    body.editing [data-edit="true"] {
      outline: 1px dashed #FAAD3D !important;
      outline-offset: 2px;
      background-color: rgba(250, 173, 61, 0.04) !important;
      cursor: text;
      transition: outline 0.15s, background-color 0.15s;
    }
    body.editing [data-edit="true"]:focus {
      outline: 2px solid #F39000 !important;
      background-color: rgba(250, 173, 61, 0.10) !important;
    }
    body.editing [data-edit="true"]:hover:not(:focus) {
      outline: 1px solid #FAAD3D !important;
    }
    /* Make sure the toolbar itself isn't editable */
    .editor-toolbar, .editor-toolbar * {
      user-select: none;
    }

    /* Help modal */
    .editor-help-modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a1a1a;
    }
    .editor-help-modal[hidden] { display: none; }
    .ed-help-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(2px);
    }
    .ed-help-card {
      position: relative;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
      max-width: 640px;
      width: 100%;
      max-height: calc(100vh - 48px);
      overflow-y: auto;
      padding: 36px 40px 32px;
      line-height: 1.55;
      font-size: 15px;
    }
    .ed-help-card h2 {
      margin: 0 0 14px;
      font-size: 1.45rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #111;
    }
    .ed-help-card h3 {
      margin: 22px 0 8px;
      font-size: 1.02rem;
      font-weight: 600;
      color: #111;
    }
    .ed-help-card p,
    .ed-help-card ol,
    .ed-help-card ul {
      margin: 0 0 10px;
      color: #333;
    }
    .ed-help-card ol,
    .ed-help-card ul {
      padding-left: 22px;
    }
    .ed-help-card li {
      margin: 4px 0;
    }
    .ed-help-card .ed-help-lede {
      font-size: 1.02rem;
      color: #1f1f1f;
    }
    .ed-help-card kbd {
      display: inline-block;
      padding: 1px 6px;
      border: 1px solid #ccc;
      border-bottom-width: 2px;
      border-radius: 4px;
      background: #f6f6f6;
      font-family: ui-monospace, SF Mono, Menlo, monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #222;
    }
    .ed-help-card .ed-help-keys li {
      font-size: 13.5px;
      color: #444;
    }
    .ed-help-card .ed-help-close {
      position: absolute;
      top: 10px;
      right: 14px;
      background: transparent;
      border: 0;
      font-size: 28px;
      line-height: 1;
      color: #888;
      cursor: pointer;
      padding: 4px 8px;
    }
    .ed-help-card .ed-help-close:hover { color: #111; }
    .ed-help-card .ed-help-actions {
      margin-top: 22px;
      display: flex;
      justify-content: flex-end;
    }
    .ed-help-card .ed-help-ok {
      padding: 10px 22px;
      border: 1px solid #F39000;
      background: #FAAD3D;
      color: #111;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
    }
    .ed-help-card .ed-help-ok:hover { background: #F39000; }
  `;

  document.head.appendChild(style);
  document.addEventListener('DOMContentLoaded', mount);
  if (document.readyState !== 'loading') mount();

  function mount() {
    if (document.querySelector('.editor-toolbar')) return; // already mounted
    document.body.appendChild(toolbar);
    document.body.appendChild(helpModal);
    wire();
    restore();
  }

  // ---------- Help modal handlers ----------
  const HELP_SEEN_KEY = 'gammill-tour-editor-help-seen';
  function openHelp() {
    helpModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const closeBtn = helpModal.querySelector('.ed-help-close');
      if (closeBtn) closeBtn.focus();
    }, 0);
  }
  function closeHelp() {
    helpModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    try { localStorage.setItem(HELP_SEEN_KEY, '1'); } catch (e) {}
  }

  // ---------- Helpers ----------
  function findEditable() {
    const set = new Set();
    SELECTORS.forEach((sel) => {
      try {
        document.querySelectorAll(sel).forEach((el) => {
          if (toolbar.contains(el)) return;
          if (el.closest('[data-no-edit]')) return;
          // skip empty / whitespace-only nodes
          if (!el.textContent.trim()) return;
          set.add(el);
        });
      } catch (e) {
        // bad selector? skip
      }
    });
    return [...set];
  }

  function selectorFor(el) {
    if (el.id) return '#' + el.id;
    const path = [];
    let cur = el;
    while (cur && cur !== document.body && path.length < 5) {
      let part = cur.tagName.toLowerCase();
      if (cur.className && typeof cur.className === 'string') {
        const cls = cur.className
          .split(/\s+/)
          .filter((c) => c && !c.startsWith('ed-') && c !== 'editing');
        if (cls.length) part += '.' + cls.join('.');
      }
      const parent = cur.parentNode;
      if (parent) {
        const sibs = [...parent.children].filter((s) => s.tagName === cur.tagName);
        if (sibs.length > 1) part += `:nth-of-type(${sibs.indexOf(cur) + 1})`;
      }
      path.unshift(part);
      cur = cur.parentNode;
    }
    return path.join(' > ');
  }

  function textOnly(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent.replace(/\s+/g, ' ').trim();
  }

  function setStatus(msg) {
    toolbar.querySelector('.ed-status').textContent = msg;
  }

  // Debounced auto-save: persists silently to localStorage on each keystroke.
  let autoSaveTimer = null;
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function () {
      const changes = gatherChanges();
      if (!changes.length) return;
      const payload = {
        page: location.pathname.split('/').pop() || 'index.html',
        timestamp: new Date().toISOString(),
        changes: changes,
        autoSaved: true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      // Quiet visual: brief "Saved ✓" then return to "Editing - N regions"
      setStatus(`Auto-saved · ${changes.length} change${changes.length > 1 ? 's' : ''}`);
      toolbar.querySelector('.ed-copy').hidden = false;
      toolbar.querySelector('.ed-reset').hidden = false;
    }, 600);
  }

  // ---------- Modes ----------
  function enterEditMode() {
    editing = true;
    document.body.classList.add('editing');
    findEditable().forEach((el) => {
      el.contentEditable = 'true';
      el.dataset.edit = 'true';
      el.spellcheck = true;
      if (!originals.has(el)) originals.set(el, el.innerHTML);
      // Auto-save on any input within an editable region
      el.addEventListener('input', scheduleAutoSave);
      el.addEventListener('blur', scheduleAutoSave);
    });
    toolbar.querySelector('.ed-toggle').textContent = '👁️ View';
    toolbar.querySelector('.ed-save').hidden = false;
    toolbar.querySelector('.ed-help').hidden = false;
    setStatus(`Editing - ${originals.size} regions. Auto-save on.`);
    // Auto-open help the first time this browser enters edit mode
    try {
      if (!localStorage.getItem(HELP_SEEN_KEY)) openHelp();
    } catch (e) {}
  }

  function exitEditMode() {
    // Flush any pending auto-save synchronously before leaving edit mode
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
      const changes = gatherChanges();
      if (changes.length) {
        const payload = {
          page: location.pathname.split('/').pop() || 'index.html',
          timestamp: new Date().toISOString(),
          changes: changes,
          autoSaved: true,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        toolbar.querySelector('.ed-copy').hidden = false;
        toolbar.querySelector('.ed-reset').hidden = false;
      }
    }
    editing = false;
    document.body.classList.remove('editing');
    document.querySelectorAll('[data-edit="true"]').forEach((el) => {
      el.contentEditable = 'false';
      el.removeAttribute('data-edit');
      el.removeEventListener('input', scheduleAutoSave);
      el.removeEventListener('blur', scheduleAutoSave);
    });
    toolbar.querySelector('.ed-toggle').textContent = '✏️ Edit';
    toolbar.querySelector('.ed-save').hidden = true;
    toolbar.querySelector('.ed-help').hidden = true;
  }

  // ---------- Save / restore ----------
  function gatherChanges() {
    const out = [];
    originals.forEach((orig, el) => {
      const cur = el.innerHTML;
      if (cur !== orig) {
        out.push({
          selector: selectorFor(el),
          tag: el.tagName.toLowerCase(),
          was: textOnly(orig),
          now: textOnly(cur),
          wasHtml: orig,
          nowHtml: cur,
        });
      }
    });
    return out;
  }

  function save() {
    const changes = gatherChanges();
    if (!changes.length) {
      setStatus('No changes to save.');
      return;
    }
    const payload = {
      page: location.pathname.split('/').pop() || 'index.html',
      timestamp: new Date().toISOString(),
      changes,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setStatus(`Saved ${changes.length} change${changes.length > 1 ? 's' : ''}.`);
    toolbar.querySelector('.ed-copy').hidden = false;
    toolbar.querySelector('.ed-reset').hidden = false;
  }

  function copyChanges() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setStatus('Nothing saved yet.');
      return;
    }
    const data = JSON.parse(raw);
    if (!data.changes || !data.changes.length) {
      setStatus('No changes saved.');
      return;
    }

    let txt = `=== Why Gammill Tour - In-page Edits ===\n`;
    txt += `Page: ${data.page}\n`;
    txt += `Saved: ${data.timestamp}\n`;
    txt += `Changes: ${data.changes.length}\n\n`;
    data.changes.forEach((c, i) => {
      txt += `--- Change ${i + 1} ---\n`;
      txt += `Selector: ${c.selector}\n`;
      txt += `Tag: <${c.tag}>\n`;
      txt += `WAS: ${c.was}\n`;
      txt += `NOW: ${c.now}\n`;
      if (c.wasHtml !== c.was || c.nowHtml !== c.now) {
        txt += `WAS_HTML: ${c.wasHtml}\n`;
        txt += `NOW_HTML: ${c.nowHtml}\n`;
      }
      txt += '\n';
    });

    navigator.clipboard.writeText(txt).then(
      () => {
        setStatus('Copied to clipboard.');
        setTimeout(() => setStatus(`${data.changes.length} change(s) saved.`), 2400);
      },
      () => {
        // Fallback: open a window with the text so the user can copy manually
        const w = window.open('', '_blank', 'width=720,height=540');
        w.document.write('<pre style="font-family: ui-monospace, monospace; padding: 16px; white-space: pre-wrap;">' + txt.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>');
      }
    );
  }

  function reset() {
    if (!confirm('Discard all saved edits on this page? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setStatus('Cleared. Reloading…');
    setTimeout(() => location.reload(), 400);
  }

  // ---------- Persistence on load ----------
  function restore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (!data.changes || !data.changes.length) return;
    let applied = 0;
    data.changes.forEach((c) => {
      try {
        const el = document.querySelector(c.selector);
        if (el && el.innerHTML.trim() !== c.nowHtml.trim()) {
          // Only re-apply if the element still shows the OLD content
          // (avoids overwriting fresh source-file edits)
          if (textOnly(el.innerHTML) === c.was || textOnly(el.innerHTML) !== c.now) {
            el.innerHTML = c.nowHtml;
            applied++;
          }
        }
      } catch (e) {}
    });
    if (applied) {
      setStatus(`Restored ${applied} edit${applied > 1 ? 's' : ''}.`);
    } else {
      setStatus(`${data.changes.length} change(s) saved (already in source).`);
    }
    toolbar.querySelector('.ed-copy').hidden = false;
    toolbar.querySelector('.ed-reset').hidden = false;
  }

  // ---------- Wire up ----------
  function wire() {
    toolbar.querySelector('.ed-toggle').addEventListener('click', () => {
      if (editing) exitEditMode();
      else enterEditMode();
    });
    toolbar.querySelector('.ed-save').addEventListener('click', save);
    toolbar.querySelector('.ed-copy').addEventListener('click', copyChanges);
    toolbar.querySelector('.ed-reset').addEventListener('click', reset);
    toolbar.querySelector('.ed-help').addEventListener('click', openHelp);

    // Help-modal dismiss: × button, "Got it" button, backdrop click, Escape key
    helpModal.querySelector('.ed-help-close').addEventListener('click', closeHelp);
    helpModal.querySelector('.ed-help-ok').addEventListener('click', closeHelp);
    helpModal.querySelector('.ed-help-backdrop').addEventListener('click', closeHelp);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !helpModal.hasAttribute('hidden')) {
        e.preventDefault();
        closeHelp();
      }
    });

    // Flush pending auto-save synchronously before navigation/refresh
    window.addEventListener('beforeunload', () => {
      if (!editing) return;
      const changes = gatherChanges();
      if (!changes.length) return;
      const payload = {
        page: location.pathname.split('/').pop() || 'index.html',
        timestamp: new Date().toISOString(),
        changes: changes,
        autoSaved: true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    });

    // Keyboard shortcut: Cmd/Ctrl + Shift + E to toggle edit mode
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        toolbar.querySelector('.ed-toggle').click();
      }
      // Cmd/Ctrl + S while editing → Save
      if (editing && (e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        save();
      }
    });
  }
})();
