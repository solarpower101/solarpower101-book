# SolarPower101 Book Plan

## Goal

Create a mobile-friendly SolarPower101 Academy publishing project that supports:

- free public education chapters
- richer animations and explainers than the main product app
- premium chapter authoring without leaking paid content into public static output
- future integration with the private `solarpower101-platform` repository

The book should complement the platform. The public platform remains the primary homeowner product experience, while the book provides deeper education and long-form explanations.

## Recommended Stack

Use Astro Starlight with MDX.

Reasons:

- mobile-friendly documentation layout out of the box
- fast static output suitable for GitHub Pages
- Markdown/MDX authoring is easier to reuse than Jupyter Notebook HTML
- custom components can power animations, calculators, diagrams, and visual explainers
- public and premium content can share the same source conventions while using different deployment paths
- Astro is a better fit than Jupyter Book for polished consumer-facing mobile reading

## Proposed Repository Structure

```txt
solarpower101-book/
  README.md
  PLAN.md
  package.json
  astro.config.mjs
  src/
    content/
      docs/
        index.mdx
        free/
          solar-basics.mdx
          reading-your-electric-bill.mdx
          roof-readiness.mdx
          choosing-an-installer.mdx
        premium/
          payback-modeling.mdx
          battery-backup-planning.mdx
          quote-comparison.mdx
          financing-tradeoffs.mdx
        glossary/
          net-metering.mdx
          kilowatt-hour.mdx
          inverter.mdx
          interconnection.mdx
        incentives/
          federal-tax-credit.mdx
          state-and-local-incentives.mdx
    components/
      BillBreakdown.astro
      ProductionCurve.tsx
      PaybackTimeline.tsx
      ShadingDiagram.astro
    data/
      glossary.json
      incentives.json
      lesson-index.json
    styles/
      custom.css
  scripts/
    validate-content.mjs
    export-public-index.mjs
    export-premium-manifest.mjs
```

## Public Content Model

Public chapters should be complete enough to be valuable and SEO-friendly, but should avoid giving away premium workflows.

Public chapter types:

- solar basics
- how to read an electricity bill
- roof readiness
- utility and net metering concepts
- basic incentive explainers
- glossary pages
- installer selection questions
- short preview pages for premium topics

Public content may be deployed to:

```txt
https://solarpower101.github.io/book/
```

or a future custom domain:

```txt
https://learn.solarpower101.com/
```

## Premium Content Model

Premium chapters must not be deployed to GitHub Pages or any public static artifact.

Premium content can still be authored in the same repo format, but the build pipeline must separate it from public output.

Premium chapter types:

- detailed ROI and payback modeling
- battery backup planning
- quote comparison workflows
- financing and ownership tradeoffs
- deeper utility tariff walkthroughs
- homeowner decision templates

Premium delivery should eventually happen through authenticated platform routes or a Supabase Edge Function.

## Free vs Premium Frontmatter

Each chapter should include explicit frontmatter.

```md
---
title: Reading Your Electric Bill
slug: reading-your-electric-bill
access: free
summary: Learn which bill fields matter before requesting solar quotes.
category: utility-bills
last_verified_at: 2026-07-17
sources:
  - label: U.S. Department of Energy
    url: https://www.energy.gov/
---
```

Premium chapter example:

```md
---
title: Modeling Solar Payback Without Overpromising Savings
slug: payback-modeling
access: premium
summary: Build a conservative payback estimate using bill data, incentives, and system cost.
category: roi
last_verified_at: 2026-07-17
preview: true
---
```

Allowed `access` values:

- `free`
- `preview`
- `premium`

Public builds may include `free` and `preview` content only.

## Animation Strategy

Prefer app-native, mobile-friendly animations over notebook widgets.

Good animation formats:

- Astro components for simple diagrams
- React components for interactive calculators
- CSS animations for lightweight visual explanations
- SVG diagrams when semantic and inspectable
- Canvas only when the animation needs dense custom drawing
- MP4/WebM for fixed explanatory sequences

Avoid:

- notebook-only widgets that require a live kernel
- large JavaScript bundles for simple diagrams
- animations that fail without desktop hover
- premium animations embedded in public static output

Initial animation ideas:

- electricity bill breakdown
- daily solar production curve
- net metering credit flow
- shade impact across roof planes
- simple payback timeline
- battery backup load prioritization

## Platform Integration

The private `solarpower101-platform` repo should not depend directly on the book at runtime.

Safe integration points:

- platform `/learn/` links to selected public book chapters
- public book chapters link back to platform inquiry and installer pages
- shared slugs and categories can be exported as reviewed JSON
- glossary terms can be exported for future app use
- incentive source metadata can be reviewed before platform ingestion

Platform links:

```txt
/learn/
/inquiry/
/installers/
/onboarding/
```

Book links:

```txt
/book/free/solar-basics/
/book/free/reading-your-electric-bill/
/book/glossary/net-metering/
/book/incentives/federal-tax-credit/
```

## Premium Delivery Architecture

Because the current platform web app is a static GitHub Pages export, it cannot securely serve paid content by itself.

Recommended future architecture:

```txt
Private MDX source
  -> premium build/export
  -> private Supabase Storage bucket or premium lesson table
  -> Supabase Edge Function
  -> entitlement check
  -> authenticated web/mobile reader
```

Required tables later:

```txt
premium_lessons
homeowner_entitlements
premium_lesson_assets
```

Required checks:

- user is authenticated
- user has active entitlement
- lesson is published
- requested asset belongs to that lesson

Do not:

- deploy premium chapter HTML to GitHub Pages
- include premium MDX in public static builds
- hide premium content with client-side checks only
- expose service-role keys to web or mobile
- put premium assets in public storage buckets

## Build Modes

Define separate build modes.

```sh
pnpm build:public
pnpm build:preview
pnpm validate
```

Expected behavior:

- `build:public` includes only `access: free` and public previews
- `build:preview` can render all content locally for editorial review
- `validate` checks slugs, frontmatter, source URLs, and verification dates

Premium export should be a separate future command:

```sh
pnpm export:premium
```

That command should write artifacts outside the public static output directory.

## Content Validation Rules

Every chapter should have:

- title
- slug
- access level
- summary
- category
- last verified date
- stable source references when factual claims are included

Slug rules:

- lowercase
- hyphen-separated
- no spaces
- no dates unless date is part of the topic

Source rules:

- incentives and utility policy pages must include source URLs
- time-sensitive pages must include `last_verified_at`
- premium modeling pages must include disclaimers that estimates are not guarantees

## Editorial Boundaries

The book may include educational and research content.

The book should not include:

- real homeowner inquiry records
- private customer data
- scraped social media or review content copied into chapters
- unreviewed contractor claims
- guaranteed savings language
- legal, tax, or financial advice presented as personalized guidance

## Suggested First Milestone

Milestone: Public Book Foundation

Scope:

- scaffold Astro Starlight
- add mobile-friendly theme configuration
- add first three free chapters
- add glossary section
- add one animation component
- add content validation script
- configure GitHub Pages build for public content only

Checks:

```sh
pnpm install
pnpm validate
pnpm build:public
```

Definition of done:

- public build contains no premium chapters
- mobile layout works at narrow viewport widths
- content frontmatter validates
- first animation renders without requiring a live notebook kernel
- public chapter links back to the SolarPower101 platform

## Suggested Second Milestone

Milestone: Premium Authoring Boundary

Scope:

- add premium chapter source folder
- add `access: premium` validation
- ensure public build excludes premium content
- add local editorial preview mode
- add premium manifest export without chapter body content

Checks:

```sh
pnpm validate
pnpm build:public
pnpm build:preview
```

Definition of done:

- premium content is available locally for editorial preview
- public static output does not contain premium body text
- preview pages can advertise premium topics without leaking paid material

## Open Decisions

- Publish public book under `/book/` on `solarpower101.github.io` or a custom domain.
- Keep this as a separate repository or move it into a workspace later.
- Decide whether premium content is delivered from Supabase Storage, database rows, or a separate server platform.
- Decide whether paid access is subscription-based, one-time purchase, or bundled with another product.
- Decide whether mobile premium reading is required at the same time as web premium reading.
