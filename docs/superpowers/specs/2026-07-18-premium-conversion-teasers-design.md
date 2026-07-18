# Premium Conversion Teasers — Design Spec

**Date:** 2026-07-18
**Status:** Approved
**Goal:** Convert free readers into premium-workbook unlocks by turning the highest-intent
moment (finishing a relevant free chapter) into a contextual, benefit-framed premium teaser.

## Problem

SolarPower101 Academy has strong free content but sells nothing behind the gate:

- Every free chapter ends with the *identical* generic line — "Continue with the
  product-facing lesson at [X] or request a SolarPower101 review." — repeated verbatim 8x.
- The index's "Premium Decision Workflows" section describes premium in architecture
  language ("entitlement-gated product experience"), not homeowner benefit.
- Premium is fully stripped from the public build: no preview, no "what you'll unlock,"
  and zero CSS/components for premium/CTA states.
- There is a clean but invisible value ladder: each free chapter teaches a *concept*; each
  premium chapter is the *do-it-with-your-own-house* workbook version.

## Approach (chosen: A)

Contextual teasers + value ladder. Author persuasion surfaces in the book's free pages.
The **sample copy in each teaser is hand-authored teaser text** — no premium MDX is
un-stripped — so nothing paid leaks and the sync/build/strip pipeline is untouched.

Rejected: B (preview-then-paywall — touches the strip pipeline, risks leaking premium),
C (index-only — wastes the end-of-chapter intent moment).

## Free → Premium Pairing Map

All 8 premium workbooks are surfaced at least once.

| Free chapter | Primary premium unlock | Secondary |
|---|---|---|
| understand-your-utility-bill | Utility Bill Deep Dive | — |
| roof-and-property-readiness | Home Solar Readiness Assessment | — |
| batteries-and-backup-power | Battery Decision Guide | — |
| choosing-a-solar-installer | Installer Comparison | Quote Review Workbook |
| solar-basics-for-homeowners | Quote Review Workbook | Home Readiness Assessment |
| incentives-without-the-jargon | Financing Reality Check | — |
| solar-maintenance-expectations | Installation & Post-Install Guide | — |
| why-solar-why-now | Contract & Pre-Sign Checklist (intro to premium track) | — |

## Components

### `src/components/PremiumTeaser.astro`

Reusable Astro component. Props:

- `workbookTitle: string` — paired premium workbook name
- `bridgeLine: string` — the free→premium benefit bridge ("You just learned X. Now do it
  with YOUR bill:")
- `bullets: string[]` — 3 concrete "do it with your own {bill/roof/quote}" outcomes
- `sample: { label: string; text: string }` — ONE authored sample (a real red-flag or
  artifact) to show, not tell
- `secondary?: string` — optional secondary workbook mention
- CTA URL is **not** a prop. It comes from a single shared constant so there is exactly one
  place to change it.

### CTA destination — single constant

All Unlock CTAs point to one central pricing/upgrade page. Define once:

```
const PREMIUM_CTA_URL = "https://solarpower101.github.io/learn/premium/";
```

Assumption: the platform serves a `/learn/premium/` pricing/upgrade page that owns
checkout and entitlement. If the real path differs, change this one constant.

## Design System (custom.css)

Add a scoped `.premium-teaser` block that reads as intentionally *elevated* and distinct
from the free `.field-note` / `.journey-map` surfaces:

- Uses existing tokens only (`--surface`, `--ink`, `--teal`, `--sun`, `--radius-*`,
  `--shadow-raised`). No new hardcoded colors.
- A `🔒 Premium Workbook` badge (sun/teal accent).
- A "what you unlock" list styled distinctly from body bullets.
- A real hover/focus/active state on the CTA button, animating compositor-friendly
  properties only (`transform`, `opacity`, `box-shadow`).
- Responsive at 320 / 768 / 1440; no horizontal overflow.

## Content Changes

### 8 free chapters

Remove the duplicated "Continue with the product-facing lesson…" closer. Add one
`<PremiumTeaser>` after the existing `## Next Action` section, authored per the pairing map.
Import: `import PremiumTeaser from "../../../components/PremiumTeaser.astro";`

### index.mdx

Replace the dev-speak "Premium Decision Workflows" paragraph with a homeowner-facing value
ladder: "Free chapters teach the concept → Premium workbooks do it with *your* house, bill,
and quotes," plus a compact grid of the 8 workbooks (title + one-line benefit) and the
single Unlock CTA. No architecture language.

## Out of Scope (YAGNI / Phase-2)

- Manifest enrichment: add teaser metadata to `lesson-index.json` so the platform `/learn/`
  catalog can render matching cards. Clean add-on, not a dependency of this work.
- No changes to the sync/strip/build pipeline.
- No checkout/gating/entitlement work (owned by the platform).

## Testing

- `npm run validate` stays green.
- `npm run build` stays green; premium-strip step unaffected.
- Visual-regression check the teaser at 320 / 768 / 1440.
- Confirm the CTA constant resolves to the intended URL.
