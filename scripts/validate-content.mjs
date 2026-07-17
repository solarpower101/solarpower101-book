import { readdir } from "node:fs/promises";
import path from "node:path";

import {
  expectedLessonSlugs,
  expectedPremiumWorkflowSlugs,
  freeLessonsDir,
  makeLessonIndexEntry,
  premiumWorkflowsDir,
  readLesson,
  readPremiumWorkflow,
} from "./content-utils.mjs";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const premiumSlugPattern = /^premium\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const requiredFields = ["title", "slug", "access", "summary", "category", "last_verified_at"];
const requiredPremiumSections = [
  "## Homeowner Scenario",
  "## Required Inputs",
  "## Decision Process",
  "## Example",
  "## Red Flags",
  "## Questions To Ask Installer",
  "## Decision Output",
  "## Premium Artifact",
];
const errors = [];

const files = await readdir(freeLessonsDir);
const mdxFiles = files.filter((file) => file.endsWith(".mdx")).sort();
const actualSlugs = mdxFiles.map((file) => path.basename(file, ".mdx"));

for (const expectedSlug of expectedLessonSlugs) {
  if (!actualSlugs.includes(expectedSlug)) {
    errors.push(`Missing public lesson file for ${expectedSlug}`);
  }
}

for (const actualSlug of actualSlugs) {
  if (!expectedLessonSlugs.includes(actualSlug)) {
    errors.push(`Unexpected public lesson file: ${actualSlug}.mdx`);
  }
}

const entries = [];

for (const slug of expectedLessonSlugs) {
  const lesson = await readLesson(slug);
  const { frontmatter, body, filePath } = lesson;

  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      errors.push(`${filePath} is missing required frontmatter field: ${field}`);
    }
  }

  if (frontmatter.slug !== slug) {
    errors.push(`${filePath} slug frontmatter must match filename`);
  }

  if (!slugPattern.test(frontmatter.slug ?? "")) {
    errors.push(`${filePath} has invalid slug: ${frontmatter.slug}`);
  }

  if (frontmatter.access !== "free") {
    errors.push(`${filePath} must use access: free for public export`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.last_verified_at ?? "")) {
    errors.push(`${filePath} must use YYYY-MM-DD last_verified_at`);
  }

  if (!body.includes("https://solarpower101.github.io/learn/")) {
    errors.push(`${filePath} must link back to the platform learn route`);
  }

  if (/\b(premium|entitlement|paid content)\b/i.test(body)) {
    errors.push(`${filePath} contains premium-gated wording in a public lesson`);
  }

  entries.push(makeLessonIndexEntry(frontmatter));
}

const seenSlugs = new Set();

for (const entry of entries) {
  if (seenSlugs.has(entry.slug)) {
    errors.push(`Duplicate lesson slug in public index: ${entry.slug}`);
  }

  seenSlugs.add(entry.slug);
}

const premiumFiles = await readdir(premiumWorkflowsDir);
const premiumMdxFiles = premiumFiles.filter((file) => file.endsWith(".mdx")).sort();
const actualPremiumSlugs = premiumMdxFiles.map((file) => path.basename(file, ".mdx"));

for (const expectedSlug of expectedPremiumWorkflowSlugs) {
  if (!actualPremiumSlugs.includes(expectedSlug)) {
    errors.push(`Missing premium workflow file for ${expectedSlug}`);
  }
}

for (const actualSlug of actualPremiumSlugs) {
  if (!expectedPremiumWorkflowSlugs.includes(actualSlug)) {
    errors.push(`Unexpected premium workflow file: ${actualSlug}.mdx`);
  }
}

for (const slug of expectedPremiumWorkflowSlugs) {
  const workflow = await readPremiumWorkflow(slug);
  const { frontmatter, body, filePath } = workflow;

  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      errors.push(`${filePath} is missing required frontmatter field: ${field}`);
    }
  }

  if (frontmatter.slug !== `premium/${slug}`) {
    errors.push(`${filePath} slug frontmatter must be premium/${slug}`);
  }

  if (!premiumSlugPattern.test(frontmatter.slug ?? "")) {
    errors.push(`${filePath} has invalid premium slug: ${frontmatter.slug}`);
  }

  if (frontmatter.access !== "premium") {
    errors.push(`${filePath} must use access: premium`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.last_verified_at ?? "")) {
    errors.push(`${filePath} must use YYYY-MM-DD last_verified_at`);
  }

  for (const section of requiredPremiumSections) {
    if (!body.includes(section)) {
      errors.push(`${filePath} is missing required premium section: ${section}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Content validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${entries.length} public lessons and ${expectedPremiumWorkflowSlugs.length} premium workflows.`);
