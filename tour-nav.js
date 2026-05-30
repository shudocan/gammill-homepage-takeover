// tour-nav.js — turns the sticky progress bar into a subtle chapter hub.
// Each segment becomes a jump link to its chapter. The linear next/back flow
// stays the default action; this just never traps a motivated reader.
(() => {
  const CHAPTERS = [
    { file: '01-promise.html',          name: 'The Promise' },
    { file: '02-built-different.html',  name: 'Built Different' },
    { file: '03-table-frame.html',      name: 'The Table' },
    { file: '04-stitch-quality.html',   name: 'Stitch Quality' },
    { file: '05-software.html',         name: 'CreativeStudio' },
    { file: '06-patterncloud.html',     name: 'PatternCloud' },
    { file: '07-delivery.html',         name: 'Delivery' },
    { file: '08-training.html',         name: 'Training' },
    { file: '09-service-warranty.html', name: 'Service & Warranty' },
    { file: '10-retrofit.html',         name: 'Retrofit' },
    { file: '11-community.html',        name: 'The Community' },
    { file: '12-earn-back.html',        name: 'Earn Back Your Investment' },
    { file: '13-ownership.html',        name: 'Long-Term Value' },
  ];

  const bar = document.querySelector('.progress .progress-bar');
  if (!bar) return;
  const segs = bar.querySelectorAll('.seg');
  if (segs.length !== CHAPTERS.length) return; // markup drifted — bail rather than mislink

  segs.forEach((seg, i) => {
    const ch = CHAPTERS[i];
    const a = document.createElement('a');
    a.className = seg.className;            // preserve .done / .current state
    a.href = ch.file;
    a.title = `Chapter ${i + 1}: ${ch.name}`;
    a.setAttribute('aria-label', `Jump to chapter ${i + 1}, ${ch.name}`);
    seg.replaceWith(a);
  });

  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Jump to any chapter');
})();
