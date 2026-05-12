# Deployment - Why Gammill Tour

How to get this prototype onto gammill.com for testing.

## Status

- **Mode:** background testing (not linked from main site nav)
- **Indexing:** `<meta name="robots" content="noindex,nofollow">` is on every page so Google won't index during testing
- **Source of truth:** the 11 linear chapter pages + `index.html` + `shop.html`
- **NOT in scope:** `_archive/scroll-variant.html` (retired - linear is canonical)

## What to upload

Everything in this directory **except** `_archive/`, `.git/`, `editor.js`, `copy.md`, `testimonials-inventory.md`, `DEPLOY.md`, and `README.md`. Specifically:

```
index.html
01-promise.html
02-built-different.html
03-table-frame.html
04-stitch-quality.html
05-software.html
06-patterncloud.html
07-delivery.html
08-training.html
09-service-warranty.html
10-community.html
11-ownership.html
shop.html
style.css
reveal.js
assets/
```

13 HTML files + 1 CSS + 1 JS + the assets folder. ~5 MB total.

**Why exclude `editor.js`** - that's the in-page edit toolbar for prototyping. Don't ship it; reviewers shouldn't see it.

**Why exclude `copy.md`, `testimonials-inventory.md`, `README.md`, `DEPLOY.md`** - internal docs, not for the public.

## Where to put it

Recommended: `gammill.com/tour/` (subdirectory at site root).

The pages live as static files, served by Apache/nginx, completely bypassing WordPress. Pros: zero theme conflict, fast, easy to revert. Cons: doesn't inherit any WordPress-side processing - see "Tracking" below.

Alternative paths:
- `gammill.com/why-gammill/` - more descriptive URL
- `gammill.com/tour-test/` - obvious it's a test
- `gammill.com/preview/why-gammill/` - if you have a /preview/ convention

Pick whatever fits your URL hygiene. URL paths inside the tour are all relative, so the deploy path doesn't matter to the code.

## Tracking

> ⚠️ **One thing to verify before pointing testers at it.**

The plan is for tracking (GA4, HubSpot, etc.) to come from gammill.com's WordPress header/footer injection. **But that injection only runs on pages WordPress renders.** Static HTML files in a subdirectory are served directly by the web server, bypassing PHP entirely - so the WordPress-injected tracking snippets won't reach them.

Three ways to verify and/or fix:

1. **Test it after upload:** load `gammill.com/tour/01-promise.html` in an incognito tab, open DevTools Network panel, look for the GA / HubSpot tracking requests. If they fire, we're good - some servers inject tracking at the web-server level (Apache mod_substitute, etc.). If they don't, see option 2 or 3.

2. **Inject tracking via .htaccess** - if you have shell/cPanel access, you can write a .htaccess rule that injects the same tracking snippet that WordPress injects, before the closing `</body>` of every static .html in `/tour/`. Apache mod_substitute or mod_filter handles this.

3. **Add tracking snippets directly to the HTML files** - lift the exact `<script>` snippets your WP theme injects (View Source on any gammill.com page, find the GA4 / HubSpot tags), and paste them before `</body>` on each of the 13 tour pages. Easiest. Slightly less DRY (if your tracking IDs change, you have 13 files to update) but trivial to manage with a single sed pass.

If you go with option 3, the conventional spot is right before `<script src="reveal.js" defer></script>` near the end of each file.

## Funnel analytics targets

Once tracking is firing, the events worth measuring (per Andrew, 2026-05-12 - reason this is paginated, not scroll):

- **Page views per chapter** - bounce rate, time-on-page, completion rate
- **Funnel through Ch 1 -> 11** - what % of people who start the tour reach the end?
- **CTA clicks** - the "Continue · Step N: ___ ->" buttons at the bottom of each chapter, the chapters-dropdown clicks, the Business Plan button on Ch 11, the four final-CTA buttons
- **X close button clicks** - tells you where in the tour people bail (more revealing than bounce alone)
- **Chapters dropdown engagement** - do people use it to jump around, or do they read linearly?

For HubSpot specifically: track the final-CTA clicks (See a Gammill / Build & Price / Business Plan / Talk to advisor) as conversion events.

## When the test is done

When you're ready to go full live:

1. Remove `<meta name="robots" content="noindex,nofollow">` from all 13 pages.
2. Decide on the public URL. If `/tour/` was the test URL, that may be where it stays - or move to a more marketing-friendly path (e.g., `/why-gammill/`).
3. Link from main site nav, homepage hero, email signatures, social bios, etc.
4. Consider whether the static-files approach scales, or whether it's time to move to a WordPress page template (`page-tour.php`) for full theme integration.

## Rollback

The whole tour is just files in a directory. To remove it: delete the directory. No database changes, no plugin dependencies, no theme edits to revert. Clean.
