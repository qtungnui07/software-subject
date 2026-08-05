import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const runtimeRoots = ["app", "components", "services", "actions"];
const forbiddenSources = [
  "@/data/courses",
  "@/data/exercises",
  "@/data/placement-tests",
  "@/constants/chapter-one",
  "english-course",
  "english-placement-test",
];

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx)$/.test(path) ? [path] : [];
  });

const violations = runtimeRoots.flatMap((directory) =>
  sourceFiles(join(root, directory)).flatMap((path) => {
    const source = readFileSync(path, "utf8");
    return forbiddenSources
      .filter((forbidden) => source.includes(forbidden))
      .map((forbidden) => `${relative(root, path)} -> ${forbidden}`);
  }),
);

assert.deepEqual(
  violations,
  [],
  `Production runtime must load learning content from the database:\n${violations.join("\n")}`,
);

const proxySource = readFileSync(
  join(root, "app/api/content/[...path]/route.ts"),
  "utf8",
);
assert.match(proxySource, /params\.delete\("includeAnswers"\)/);

console.log("Runtime learning content source contract passed.");
