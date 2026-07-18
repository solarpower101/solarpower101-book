// Single source of truth for premium-conversion wiring.
//
// - PREMIUM_CTA_URL is the one central pricing/upgrade page every "Unlock" CTA points to.
//   It is imported by both PremiumTeaser.astro (the in-chapter CTA) and the public manifest
//   export, so there is exactly one place to change the destination.
// - premiumPairings maps each free lesson slug to the premium workbook it should convert to.
//   The full in-chapter teaser copy (bridge line, bullets, sample) stays authored in each
//   free chapter's MDX; this map holds only the catalog-level metadata the platform needs
//   to render a matching teaser card in /learn/.

export const PREMIUM_CTA_URL = "https://solarpower101.github.io/learn/premium/";

// Build the CTA destination for one specific workbook. Every "Unlock" surface routes through
// this so the destination stays single-sourced (PREMIUM_CTA_URL) while still telling the
// platform which workbook the reader chose. The `?workbook=` param is safe to ignore: a
// platform serving one central pricing page still works, and one that has per-workbook
// content can deep-link. Returns the bare page when no slug is given.
export function premiumCtaUrl(workbookSlug) {
  if (!workbookSlug) {
    return PREMIUM_CTA_URL;
  }

  return `${PREMIUM_CTA_URL}?workbook=${encodeURIComponent(workbookSlug)}`;
}

export const premiumPairings = {
  "understand-your-utility-bill": {
    workbookSlug: "utility-bill-deep-dive",
    workbookTitle: "Utility Bill Deep Dive",
    benefit: "Turn your bill into the annual usage number every quote must match.",
  },
  "roof-and-property-readiness": {
    workbookSlug: "home-solar-readiness-assessment",
    workbookTitle: "Home Solar Readiness Assessment",
    benefit: "Score your roof, shade, and electrical before you request quotes.",
  },
  "batteries-and-backup-power": {
    workbookSlug: "battery-decision-guide",
    workbookTitle: "Battery Decision Guide",
    benefit: "Decide whether storage fits your outages, loads, and rate plan.",
  },
  "choosing-a-solar-installer": {
    workbookSlug: "installer-comparison",
    workbookTitle: "Installer Comparison",
    benefit: "Put two to four proposals side by side on equal terms.",
  },
  "solar-basics-for-homeowners": {
    workbookSlug: "quote-review-workbook",
    workbookTitle: "Quote Review Workbook",
    benefit: "Read one quote line by line and surface what it leaves out.",
  },
  "incentives-without-the-jargon": {
    workbookSlug: "financing-reality-check",
    workbookTitle: "Financing Reality Check",
    benefit: "Compare cash, loan, lease, and PPA on the same real numbers.",
  },
  "solar-maintenance-expectations": {
    workbookSlug: "installation-and-post-install-guide",
    workbookTitle: "Installation and Post-Install Guide",
    benefit: "Track the project from permit to permission-to-operate.",
  },
  "why-solar-why-now": {
    workbookSlug: "contract-and-pre-sign-checklist",
    workbookTitle: "Contract and Pre-Sign Checklist",
    benefit: "Check cancellation rights, warranties, and scope before you sign.",
  },
};

// Resolve a workbook slug from its display title. Lets the in-chapter <PremiumTeaser>, which
// already authors the workbook title inline, deep-link its CTA without every chapter also
// repeating the slug. Returns null for an unknown title.
const workbookSlugByTitle = Object.fromEntries(
  Object.values(premiumPairings).map((p) => [p.workbookTitle, p.workbookSlug]),
);

export function workbookSlugForTitle(workbookTitle) {
  return workbookSlugByTitle[workbookTitle] ?? null;
}

// Build the catalog-level teaser object for a free lesson's manifest entry.
// Returns null for a lesson with no configured pairing.
export function makePremiumTeaser(freeSlug) {
  const pairing = premiumPairings[freeSlug];
  if (!pairing) {
    return null;
  }

  return {
    workbookTitle: pairing.workbookTitle,
    workbookSlug: `premium/${pairing.workbookSlug}`,
    benefit: pairing.benefit,
    ctaUrl: premiumCtaUrl(pairing.workbookSlug),
  };
}
