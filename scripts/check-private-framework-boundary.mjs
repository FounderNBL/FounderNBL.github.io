import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const blocked = [
  ".nbl-private",
  "packages/nbl-system",
  "packages/founders-code",
  "packages/virgo",
  "packages/nbl-locke-system",
  "packages/nbl-foundation",
  "engine/ai/BEANS_RULES.md",
  "engine/ai/NBL_REASONING_ENGINE.md",
  "engine/knowledge/BRAIN_V1.md",
  "engine/knowledge/generated/beans-source-index.json",
  "deploy/supabase/nbl-foundation-runtime",
  "newbeansland-foundation-0.1.0.tgz"
];

const normalize = value => value.replaceAll("\\", "/").replace(/^\.\//, "");
const exists = rel => fs.existsSync(path.join(root, rel));

const found = blocked.filter(exists);

const walk = dir => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    const rel = normalize(path.relative(root, full));
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(rel);
  }
  return out;
};

for (const rel of walk(root)) {
  const lower = rel.toLowerCase();
  if (
    lower.endsWith(".tgz") &&
    (lower.includes("nbl-foundation") || lower.includes("newbeansland-foundation"))
  ) found.push(rel);
}

const unique = [...new Set(found)].sort();
if (unique.length) {
  console.error("Private NBL framework material must not exist in the public Production repository:");
  for (const item of unique) console.error(`- ${item}`);
  process.exit(1);
}

console.log("PASS: public Production contains no protected NBL framework source paths.");
