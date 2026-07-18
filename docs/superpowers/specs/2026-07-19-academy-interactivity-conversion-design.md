# Academy Interactivity + Conversion Upgrade

**Date:** 2026-07-19
**Status:** Approved for implementation
**Repos touched:** `solarpower101-book` (this), `solarpower101-visualization` (`../`)

## Goal

Improve two dimensions of SolarPower101 Academy at once:

1. **Interactivity & tools** — turn isolated, mostly-qualitative tools into a connected
   workspace that remembers the reader's inputs.
2. **Conversion & premium** — make free content lead to the *specific* paired workbook,
   and make conversion measurable.

The insight driving the design: these two goals share one lever. A free tool that gives a
*partial* result and remembers the reader's own numbers is both better UX and the natural
on-ramp to the matching premium workbook.

## Current state (baseline)

- Tools live in `@solarpower101/visualization` (`../solarpower101-visualization/src/`):
  - `energy-outlook.js` (858 lines) — real EIA price charts + home-bill calculator. Strong.
  - `solar-readiness.js` (103 lines) — 4 radio inputs → one canned "next focus" paragraph.
    Qualitative only; no score, no numbers, no persistence.
  - `glossary-search.js` (63 lines) — client-side show/hide filter.
- Checklists (index + chapters) are plain checkboxes with no saved state.
- **Every** premium CTA — 8 index cards, every in-chapter teaser, the exported manifest —
  resolves to one generic `PREMIUM_CTA_URL` (`/learn/premium/`). Per-workbook specificity is
  lost at the click even though `premiumPairings` already carries `workbookSlug`.
- No analytics of any kind.

## Unifying primitive: the `myHome` store

A single namespaced `localStorage` key `sp101:my-home` holding:

```json
{
  "monthlyBill": 200,
  "annualKwh": null,
  "roof": 3,
  "backup": 2,
  "pressure": 2,
  "goal": null,
  "checklist": { "<id>": true }
}
```

Lives in the viz package (`src/my-home.js`) with a minimal API:

- `readHome()` → object (with defaults; safe if storage unavailable / JSON corrupt)
- `updateHome(patch)` → merges, persists, notifies
- `subscribeHome(fn)` → pub/sub so tools re-render on cross-tool change
- returns an unsubscribe function

All tools read/write this instead of holding private state. Storage access is wrapped in
try/catch — private-mode / disabled storage must degrade to in-memory, never throw.

## Phase A (#1, #2, #3) — one commit

### #1 Deep-linked CTAs (backward compatible)

- `premium-pairings.mjs`: add `premiumCtaUrl(workbookSlug)` →
  `` `${PREMIUM_CTA_URL}?workbook=${encodeURIComponent(workbookSlug)}` ``.
- `PremiumTeaser.astro`: accept `workbookSlug` prop; CTA href = `premiumCtaUrl(workbookSlug)`.
- `makePremiumTeaser`: `ctaUrl` becomes the per-workbook URL.
- `index.mdx` value-ladder cards: link each to its own `premiumCtaUrl(slug)`.
- Query param chosen over path (`/premium/slug/`) because the platform serves one central
  page per the README; the param is ignorable and route-agnostic. Single source of truth
  (`PREMIUM_CTA_URL`) preserved — one constant still governs the destination.

### #2 Conversion analytics (no new dependency)

- Viz package `src/analytics.js`: `track(event, detail)` dispatches
  `CustomEvent('sp101:analytics', { detail: { event, ...detail } })` on `window` **and**
  pushes `{ event, ...detail }` to `window.dataLayer` (created if absent). The platform wires
  this to GA / Plausible / anything.
- Fire `teaser_view` (IntersectionObserver, once per teaser) and `teaser_click` with
  `{ chapter, workbook }`. Wire from a small script the teaser mounts.

### #3 Interactive sample taste

- `PremiumTeaser.astro` sample block gains one `monthly bill` input.
- On input, compute a partial line (e.g. rough annual spend) and reveal a gated
  "see the full workbook" prompt (deep-linked CTA).
- Prefills from `myHome.monthlyBill`; writes back on change.

## Phase B (#4, #5, #6) — one commit

### #4 Persist state

- Introduce `my-home.js` store (above).
- Rewire index + chapter checklists to persist ticks under `checklist`.
- Rewire Energy Outlook calculator's bill input to read/write `myHome.monthlyBill`.

### #5 Readiness Lab overhaul

- Replace canned-paragraph logic with a **0–100 readiness score** derived from
  bill/roof/backup/pressure, shown as a free *partial* snapshot (score band + top focus).
- Gate the full scored breakdown to the *Home Solar Readiness Assessment* workbook via the
  #1 deep-linked CTA. Reads/writes `myHome`.
- Preserve existing reveal-animation behavior (`initReadinessAnimations`).

### #6 Cross-wire tools

- Bill/kWh entered in any tool flows through `myHome` to prefill the others.

## Testing & verification

- `npm run validate` and `npm run build` stay green after each phase.
- Manual: manifest `ctaUrl` carries `?workbook=`; premium MDX still stripped from public
  build; readiness/checklist state survives reload; storage-disabled path degrades gracefully.
- Viz package has no test harness; keep changes framework-free and verify through the book
  build that consumes it.

## Non-goals

- No third-party analytics SDK, no backend, no auth/entitlement (platform owns those).
- No change to the GitHub sync/strip pipeline.
- No new per-workbook platform routes assumed.
