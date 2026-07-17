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

## Current GitHub Sync Architecture

The implemented integration is a build-time manifest sync, not a runtime dependency.

```txt
solarpower101-book
  -> validate public lesson frontmatter
  -> export src/data/lesson-index.json
  -> GitHub Actions opens a PR against solarpower101-platform
  -> solarpower101-platform consumes the generated manifest in @solarpower101/domain
  -> platform /learn renders catalog and teaser routes
  -> platform deploy publishes solarpower101.github.io
```

Current book-side workflow:

```txt
.github/workflows/sync-platform-lessons.yml
```

Current platform-side generated manifest path:

```txt
packages/domain/src/generated/solar-power-101.lesson-index.json
```

Current platform adapter:

```txt
packages/domain/src/index.ts
```

The adapter combines:

- book-owned fields: title, summary, category, access, last verified date, book path, platform path, platform URL
- platform-owned fields: order, estimated minutes, practical steps, next action, inquiry CTA

This keeps the book as the canonical content product while letting the platform own conversion-oriented `/learn` surfaces.

Required GitHub Actions configuration in `solarpower101-book`:

- `PLATFORM_REPOSITORY` variable: `solarpower101/solarpower101-platform`
- `PLATFORM_LESSON_INDEX_PATH` variable: `packages/domain/src/generated/solar-power-101.lesson-index.json`
- `PLATFORM_REPO_TOKEN` secret: fine-grained token scoped to `solarpower101-platform` with `Contents: Read and write` and `Pull requests: Read and write`

The sync workflow should open pull requests instead of pushing directly to `main` so platform tests and review remain the quality gate.

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

## Practical Content Product Plan

### Product Goal

Make the free content useful enough to build trust, and make premium content feel like a practical decision-support product rather than a larger article library.

The premium promise should be:

```txt
I can make a better solar decision, avoid expensive mistakes, and compare quotes with confidence.
```

Avoid positioning premium as:

```txt
I get longer explanations about solar.
```

### Free vs Premium Positioning

Free content should answer:

```txt
What should I understand before I talk to anyone?
```

Premium content should answer:

```txt
What should I do with my actual house, bill, quotes, roof, utility, installer, and financing options?
```

Homeowners are unlikely to pay for generic solar education. They may pay for help reducing uncertainty around a large, complicated purchase.

### Content Ladder

#### 1. Free Lessons: Orientation

Free lessons should be short, practical, and trust-building.

Current and near-term free lessons:

- Solar basics for homeowners
- Roof and property readiness
- Understanding your utility bill
- Incentives without the jargon
- Batteries and backup power
- Choosing an installer
- Maintenance expectations

Each free lesson should end with a practical artifact:

- checklist
- question list
- red flag list
- decision prompt
- what to collect before quote review

#### 2. Free Tools: Lightweight Utility

Free tools should provide immediate value without requiring an account.

Examples:

- Can my roof be ready for solar?
- What to find on your utility bill
- Installer quote red flags
- Battery need estimator
- Solar terms translator

Each free tool should naturally point to a premium workflow:

```txt
Want to apply this to your actual quote? Use the premium quote review workbook.
```

#### 3. Premium Chapters: Applied Decision Workflows

Premium content should be organized around homeowner decisions, not generic topics.

Strong premium modules:

- Is solar actually worth it for my home?
- How much system size makes sense?
- How to evaluate a quote line by line
- How to compare two or three installer proposals
- Whether a battery is worth it for my outage/use case
- How incentives affect cash flow without relying on sales claims
- How to avoid financing traps
- What to ask before signing
- What to check before installation day
- What to monitor after installation

#### 4. Premium Assets: What People Actually Pay For

Premium should include practical deliverables, not just prose.

Priority assets:

- Quote comparison worksheet
- Installer scorecard
- Roof readiness worksheet
- Utility bill extraction guide
- Financing comparison calculator
- Battery backup load planner
- Incentive verification checklist
- Contract red flag checklist
- Pre-installation checklist
- Post-install monitoring checklist

### Premium Chapter Template

Every premium chapter should include:

1. Homeowner scenario
2. Required inputs
3. Step-by-step decision process
4. Example calculation or comparison
5. Red flags
6. Questions to ask installer
7. Decision output
8. Downloadable or interactive artifact

Avoid chapters that only explain.

Weak premium topic:

```txt
How solar inverters work
```

Better premium topic:

```txt
How to tell whether the inverter choice in your quote is acceptable
```

Weak premium topic:

```txt
Understanding solar financing
```

Better premium topic:

```txt
Compare cash, loan, lease, and PPA offers using your actual numbers.
```

### Specific Premium Modules

#### Module 1: Home Solar Readiness Assessment

Purpose: Help a homeowner decide whether they are ready to request quotes.

Inputs:

- roof age
- roof material
- shade
- ownership status
- electric bill
- panel condition
- HOA or permit constraints
- project timeline

Outputs:

- readiness score
- blockers
- what to collect before quotes
- whether to delay solar until roof or electrical work is resolved

Premium value: prevents wasted quote conversations and bad project timing.

#### Module 2: Utility Bill Deep Dive

Purpose: Turn a confusing bill into useful solar inputs.

Inputs:

- monthly kWh
- rate plan
- seasonal usage
- fixed charges
- time-of-use clues
- net metering or export details

Outputs:

- annual usage estimate
- seasonal usage pattern
- questions for installer
- quote assumptions that need verification

Premium value: helps homeowners judge whether a savings estimate is grounded in their actual usage.

#### Module 3: Quote Review Workbook

Purpose: Help users evaluate one quote.

Inputs:

- system size
- panel count and model
- inverter or battery details
- gross cost
- incentives
- financing terms
- production estimate
- warranty terms
- installer assumptions

Outputs:

- cost per watt
- assumption checklist
- missing details
- red flags
- follow-up questions
- quote confidence rating

Premium value: directly supports a major purchase decision.

#### Module 4: Installer Comparison

Purpose: Compare multiple installers fairly.

Inputs:

- two to four quotes
- installer credentials
- workmanship warranty
- subcontracting details
- equipment
- financing
- cancellation terms
- communication quality

Outputs:

- installer scorecard
- side-by-side table
- hidden differences
- recommended follow-up questions

Premium value: helps homeowners avoid choosing purely on monthly payment.

#### Module 5: Financing Reality Check

Purpose: Translate financing offers into real homeowner tradeoffs.

Inputs:

- cash price
- loan principal
- dealer fees
- APR
- term
- monthly payment
- escalators
- lease or PPA terms
- buyout terms

Outputs:

- financing comparison
- effective cost warning
- questions before signing
- when the structure may be reasonable

Premium value: financing is where many bad solar decisions happen.

#### Module 6: Battery Decision Guide

Purpose: Help users decide whether a battery is practical or just expensive.

Inputs:

- outage frequency
- critical loads
- desired backup duration
- battery size
- utility rate plan
- backup panel requirements
- budget

Outputs:

- backup priority list
- battery fit assessment
- installer questions
- battery worth it / maybe / probably not guidance

Premium value: batteries are expensive and often misunderstood.

#### Module 7: Contract and Pre-Sign Checklist

Purpose: Help homeowners pause before signing.

Inputs:

- contract terms
- cancellation window
- warranties
- production guarantee
- roof penetrations
- lien language
- payment schedule
- permitting responsibility

Outputs:

- red flag report
- missing clauses or questions
- pre-sign checklist

Premium value: supports a high-anxiety, high-stakes decision moment.

#### Module 8: Installation and Post-Install Guide

Purpose: Help users know what to expect after signing.

Inputs:

- project timeline
- permit status
- inspection
- permission to operate
- monitoring app
- warranty documents

Outputs:

- installation tracker
- document checklist
- production monitoring expectations
- when to contact installer

Premium value: reduces confusion after purchase and supports long-term trust.

### Free vs Premium Split Rules

Free content may include:

- definitions
- orientation
- what questions to ask
- common mistakes
- simple checklists

Premium content should include:

- application to the homeowner's numbers
- option comparison
- quote evaluation
- missing assumption detection
- decision outputs
- templates, calculators, and visual workflows

Example split:

```txt
Free: What is cost per watt?
Premium: Calculate cost per watt from your quote, compare it to financing-adjusted cost, and identify what is excluded.
```

### Visuals and Interactivity

Use animations and visualizations where they reduce homeowner confusion.

High-value visualizations:

- solar production vs household usage over a day
- seasonal usage vs production
- bill before and after solar with fixed charges
- cash vs loan vs lease total cost over time
- battery backup duration by load
- quote comparison table with red flag highlighting
- roof readiness diagram
- project timeline from quote to permission to operate

Avoid decorative animations. Every visual should answer a homeowner question.

### Personalization Strategy

Every premium chapter should ask for homeowner context.

Useful inputs:

- state
- utility
- monthly bill
- monthly kWh
- roof age
- home ownership status
- shade level
- quote price
- system size
- battery included
- financing type

Personalized outputs should read like:

```txt
Based on your inputs, your next best question is...
This quote is missing...
This assumption needs verification...
This financing structure deserves extra review...
```

### Future Manifest Fields

The book manifest should evolve beyond basic metadata so the platform can sell the value of premium workflows without exposing premium content.

Example:

```json
{
  "slug": "quote-review-workbook",
  "title": "Solar Quote Review Workbook",
  "summary": "Review your solar quote before you sign.",
  "access": "premium",
  "category": "quote-review",
  "estimatedMinutes": 35,
  "hasVideo": true,
  "hasInteractive": true,
  "hasDownload": true,
  "outcome": "Review a solar quote before signing",
  "requiredInputs": ["quote price", "system size", "financing terms"],
  "premiumValue": "Find missing assumptions and red flags in your quote"
}
```

### Practical Build Sequence

1. Turn current free lessons into trust-building entry points.
2. Add a decision outcome to each free lesson.
3. Create the first flagship premium module: Quote Review Workbook.
4. Add a basic interactive quote review form.
5. Generate a homeowner-specific output summary.
6. Link free lessons into the premium module naturally.
7. Add Installer Comparison Scorecard.
8. Add Financing Reality Check.
9. Use platform `/learn` as the catalog and book as the full chapter/product experience.
10. Track which free lessons lead to premium interest.

### First Premium Product

Start with:

```txt
Solar Quote Review Workbook
```

This is closest to the buying decision. A homeowner with a quote already has urgency, anxiety, and willingness to pay for clarity.

Concrete promise:

```txt
Review your solar quote before you sign. Find missing assumptions, compare the numbers, and generate questions to send back to the installer.
```

Avoid generic positioning:

```txt
Learn more about solar quotes.
```

## Open Decisions

- Publish public book under `/book/` on `solarpower101.github.io` or a custom domain.
- Keep this as a separate repository or move it into a workspace later.
- Decide whether premium content is delivered from Supabase Storage, database rows, or a separate server platform.
- Decide whether paid access is subscription-based, one-time purchase, or bundled with another product.
- Decide whether mobile premium reading is required at the same time as web premium reading.
