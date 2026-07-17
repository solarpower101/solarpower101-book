import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { expectedLessonSlugs, makeLessonIndexEntry, readLesson, repoRoot } from "./content-utils.mjs";

const entries = [];

for (const slug of expectedLessonSlugs) {
  const { frontmatter } = await readLesson(slug);
  entries.push(makeLessonIndexEntry(frontmatter));
}

const outputDir = path.join(repoRoot, "src", "data");
const outputPath = path.join(outputDir, "lesson-index.json");

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(entries, null, 2)}\n`);

console.log(`Wrote ${path.relative(repoRoot, outputPath)} with ${entries.length} public lessons.`);
