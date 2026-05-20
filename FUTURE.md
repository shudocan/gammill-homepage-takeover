# Future enhancements

Things deliberately deferred. Not bugs - intentional "later" items.

---

## Interactive reliability widget (Ch 9 Service & Warranty)

**The idea:** an interactive chart/widget that lets a shopper *operate* the reliability claim rather than read it. Strongest shape:

- Reader picks a use profile (hobbyist 5 hr/week, prosumer 15 hr/week, business 30+ hr/week) and a machine.
- A 20-year horizontal timeline animates with dots: green = quilting, amber = routine maintenance (every 5 yr / 500 quilts), red dots only for unscheduled service events.
- For a typical Gammill, the reader sees mostly green with a couple of amber dots over two decades. The point lands viscerally: **almost nothing happens.**
- Reinforces Ch 1's "still quilting since 1995" claim by making 20 years of ownership concrete.

**Fallback shape if (A) is too much:** a 100-hex reliability grid where each hex is an owner, color-coded by service-call count over a defined window. Less interactive but extremely glanceable.

**Why it's deferred:**
- Requires real underlying data from the CRM / service-tracking system (calls per year, resolution-by-channel, on-site rates, repair durations). Without real numbers, can't ship.
- Mobile responsiveness for an interactive timeline is non-trivial.
- Scope is a real engineering build (a few hundred lines of JS plus data plumbing), not a copy fix. Should happen after the core tour is finalized and the rest of gammill.com integration is locked.

**Risks to keep in mind when building it:**
- Once interactive and visual, the numbers become **evidence** rather than copy. Any backslide in actual reliability becomes more damaging publicly.
- Competitors can scrape the numbers. Don't put the widget on a private endpoint - the data goes on the public marketing page, treat it as forever-visible.
- The widget should be honest about its source (e.g., "Based on Gammill service-call data, 2023-2025") and update on a stated cadence.

---

## Other deferred items

These have come up but aren't being worked on yet. Pulled here so they don't drift.

- **One "video" testimonial card still needs a real YouTube ID.** Ch 11 (Althea Smith). Currently styled as a video card with a visible play button but no `data-video` attribute - click does nothing. Andrew sources the video, I wire it with the same `data-video="ID"` pattern as Ch 3 (`bs0XZV5U_D4`). (Ch 1's Janet-Lee card retired for the oil-line Ken Burns crossfade, 2026-05-20. Ch 4's Mary-Kay card retired for a 3-card editorial pullquote stack — Thomas Swanson, Mary-Kay Colman, Marie Kelley — same day.)

- **Source PatternCloud-specific testimonials for Ch 6.** Corpus search 2026-05-20 surfaced zero permission=yes quotes that praise PatternCloud, the pattern library, or pattern browsing/search/purchase. Ch 6 currently ships stats-only (the 20,358 / 1,200+ / Weekly column). When real owner voice exists for this beat — likely via direct outreach to active PatternCloud users or a designer-network ask — convert the stats aside to a slider matching Ch 4/Ch 5 (or add a small pullquote below the stats).

- **Avatar-named path choice ("See why Sue chose Gammill" / "See why Stan chose Gammill").** Replacement framing for the planned mind-vs-heart choice screen. Details in `../why-gammill-storybrand/README.md` under "Planned design revision: avatar-named paths." Both avatars need photographs and 1-line bios before the choice screen ships.

- **Photo refresh.** Several chapters share hero photos (Ch 5 / Ch 6 / Ch 12 all use `step5-a.jpg`; Ch 1 / Ch 10 share `step3-c.jpg`). QWC event photos are sitting in `assets/` root waiting to be web-sized for Ch 11 Community. Ch 6 PatternCloud needs a screenshot of the cloud library on the machine touchscreen.

- **HubSpot form wiring.** Ch 7 Sizing Guide widget and Ch 12 Business Plan Builder widget both have placeholder action URLs. Need real HubSpot Form IDs (or equivalent endpoints) and on-page submit (HubSpot forms.js / AJAX) so the reader doesn't leave the tour.

- **Elevate-owner testimonial.** The Elevate machine appears in the lineup but has zero voice in the tour (no quoted owner). Either source one or footnote the omission.

- **Editor.js gating for production.** The in-page editor is exposed on the public Pages site. Reviewers can toggle it; the help modal explains the workflow. Once the tour migrates to gammill.com proper, decide whether to strip `editor.js` from the deployed bundle.

- **gammill.com integration plan.** Move from `gammill.com/tour/` (subdirectory) to root takeover or keep as a subdirectory. Headers/footers/tracking/analytics decisions documented in `DEPLOY.md`.
