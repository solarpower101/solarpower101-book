import { readFile } from "node:fs/promises";
import path from "node:path";

export const repoRoot = process.cwd();
export const freeLessonsDir = path.join(repoRoot, "src", "content", "docs", "free");

export const expectedLessonSlugs = [
  "solar-basics-for-homeowners",
  "roof-and-property-readiness",
  "understand-your-utility-bill",
  "incentives-without-the-jargon",
  "batteries-and-backup-power",
  "solar-maintenance-expectations",
  "choosing-a-solar-installer",
];

export function parseFrontmatter(source, filePath) {
  if (!source.startsWith("---\n")) {
    throw new Error(`${filePath} is missing frontmatter`);
  }

  const end = source.indexOf("\n---", 4);
  if (end === -1) {
    throw new Error(`${filePath} has unterminated frontmatter`);
  }

  const frontmatter = {};
  const rawFrontmatter = source.slice(4, end).trim();

  for (const line of rawFrontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      throw new Error(`${filePath} has invalid frontmatter line: ${line}`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    frontmatter[key] = value;
  }

  return {
    frontmatter,
    body: source.slice(end + 5).trim(),
  };
}

export async function readLesson(slug) {
  const filePath = path.join(freeLessonsDir, `${slug}.mdx`);
  const source = await readFile(filePath, "utf8");
  const parsed = parseFrontmatter(source, filePath);

  return {
    filePath,
    source,
    ...parsed,
  };
}

export function makeLessonIndexEntry(frontmatter) {
  return {
    slug: frontmatter.slug,
    title: frontmatter.title,
    summary: frontmatter.summary,
    category: frontmatter.category,
    access: frontmatter.access,
    lastVerifiedAt: frontmatter.last_verified_at,
    bookPath: `/book/${frontmatter.slug}/`,
    platformPath: `/learn/${frontmatter.slug}/`,
    platformUrl: `https://solarpower101.github.io/learn/${frontmatter.slug}/`,
  };
}
