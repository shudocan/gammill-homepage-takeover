# Why Quilters Choose Gammill — Prototype

A clickable HTML prototype of the proposed linear "Why Gammill" tour.

## Open it
1. Unzip anywhere.
2. Double-click `index.html` (opens in your default browser).
3. Click "Start the Tour →" or navigate to any step from the table of contents.

No build step. No dependencies. Pure HTML/CSS using Google Fonts (Open Sans + Raleway, matching gammill.com).

## File structure
```
why-gammill-prototype/
├── index.html              Tour entry / overview (table of contents)
├── homepage-takeover.html  Variant: replaces gammill.com homepage hero
├── 01-promise.html         The Promise
├── 02-built-different.html Built Different
├── 03-table-frame.html     The Table
├── 04-stitch-quality.html  Stitch Quality
├── 05-software.html        Software
├── 06-training.html        Training
├── 07-service-warranty.html Service & Warranty
├── 08-community.html       The Community
├── 09-ownership.html       Ownership Economics
├── style.css               Shared styles (Gammill brand)
├── assets/                 Logo + future imagery
└── README.md
```

## Homepage takeover variant
`homepage-takeover.html` shows what gammill.com's homepage could look like if the tour becomes the dominant entry path:

- **Full-viewport hero** replaces "Helping You Quilt Confidently" — single primary CTA into Step 1
- **`I'm an existing owner →`** small link in the corner routes returning customers out
- **Below the fold:** a tight 4-card row of the four machines for direct navigators who already know what they want — Vision 2.0 / Elevate / Statler / Statler Ascend with starting prices
- **Single quick-link row:** Compare · Build & Price · Financing · Custom Business Plan

Goal: cut homepage CTAs from ~10 to 2 (tour + owner). Direct-navigator paths still exist below the fold but no longer compete with the primary tour entry.

## What's verified vs. placeholder

**Verified by Andrew (April 2026) — safe to ship:**
- Pricing on Step 9 (canonical, with corrected Ascend at $48,999)
- Cast aluminum head, continuous-duty motor (Step 2)
- W-2 service-tech network — uniquely Gammill (Step 7 hero)
- Three service modalities: phone, live chat, same-day Zoom (Step 7)
- Every part replaceable + retrofit-to-current-spec policy (Steps 1, 7)
- Limited lifetime warranty (Step 7)
- No dealer network, no commissioned sales force — owners pay it forward (Step 8 hero)
- Business Plan Builder tool wired into Step 9 — links to `/quilting-business-success/` (HubSpot-form-in-modal widget)
- Linda V Taylor real testimonial (Step 5)
- Four stitch modes, Pivotal Access Table, Breeze Track, CreativeStudio (Steps 3, 4, 5)

**Still placeholder — replace before launch:**
- All testimonial names except Linda V Taylor (Larson family, Diane Rasmussen, Marsha Trent, Karen Mendez, Paula Gentry, Janet Mahoney)
- Video panels — clickable placeholders with two states:
  - "CUSTOM CLIP TO PRODUCE" (amber tag) — needs original Gammill-shot footage
  - "EXISTING ASSET" (white tag) — reuse if available
  - Custom-clip placeholders on Steps 1, 3, 4, 6, 8
  - Pull-quote testimonials on Steps 2, 5, 7, 9
- "Go deeper" link URLs — point at gammill.com URLs that exist for some, redirect for others
- Quilts/month and $/quilt math on Step 9 — uses Compare-page numbers + a $200/quilt estimate
- "40+ years" framing on Step 1 — soft, needs founding-year confirmation

## Tour-wide UX conventions

**Persistent exit (the X):** Every page in the tour — the linear nine-step pages (`index.html`, `01-…` through `09-…`, `shop.html`) and the endless-scroll variant (`scroll.html`) — carries a fixed-position circular **×** button in the upper-right corner. It is always visible, sits above the header and progress bar, and routes to `https://gammill.com`. Implemented as `.tour-close` in `style.css` and inlined into `scroll.html`'s embedded styles. Rationale: the tour is a side path off the main site, and the visitor must never feel trapped — at any moment they can exit straight to the homepage with a single, recognizable affordance.

## Brand details used (sourced from the live `gammillpenn` theme stylesheet)
- **Fonts:** Open Sans (body), Raleway 800/900 (display) — Google Fonts, same as gammill.com.
- **Header/landing hero:** `#000000` black with `#FAAD3D` amber underline — matches the live `.hero { background-color: #000 }` rule.
- **Primary CTA:** `#FAAD3D` (hover `#F39000`) — Gammill's actual button color.
- **Links:** `#44618b` slate — the live link color.
- **Body text:** `#111` ink on white (`#ffffff`).
- **Footer:** light `#F6F6F6` with dark text — matches Gammill's `#footer { background-color: #F6F6F6 }`.
- **Logo:** real `Gammill-Logo_White-257x100.png` from the gammill.com theme, dropped in `assets/`.
- Pill-shaped buttons match the WordPress block style on gammill.com.
- Layout breakpoint at 880px; mobile pattern preserves the progress bar.

## Open questions for review
1. Is the topic order right, or should service/warranty come before training?
2. Should there be a Step 0 (the FREE Guide / 7 Pitfalls) at the front, replacing the existing PDF download as the entry point?
3. Where does this tour live on gammill.com — top-nav item, homepage hero CTA, or both?
4. Should the tour gate any content with an email capture, or stay fully open?
5. Anything to add or cut from the topic list?
