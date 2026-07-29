import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const assetRoot = path.join(root, "assets", "3d");
const MiB = 1024 * 1024;

const limits = {
  models: 8 * MiB,
  textures: 2 * MiB,
  posters: 1 * MiB
};

const allowed = {
  models: new Set([".glb"]),
  textures: new Set([".ktx2", ".webp", ".avif", ".png", ".jpg", ".jpeg"]),
  posters: new Set([".webp", ".avif", ".png", ".jpg", ".jpeg"])
};

const blockedSourceExtensions = new Set([
  ".blend", ".fbx", ".obj", ".mtl", ".psd", ".xcf", ".tif", ".tiff",
  ".zip", ".rar", ".7z"
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }

  return files;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MiB) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / MiB).toFixed(2)} MB`;
}

let files;
try {
  files = await walk(assetRoot);
} catch (error) {
  if (error?.code === "ENOENT") {
    console.log("No assets/3d folder exists yet; nothing to check.");
    process.exit(0);
  }
  throw error;
}

const errors = [];
let totalBytes = 0;

for (const file of files) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const extension = path.extname(file).toLowerCase();
  const info = await stat(file);
  totalBytes += info.size;

  if (blockedSourceExtensions.has(extension)) {
    errors.push(`${relative}: editable/source archive files do not belong in the deployed 3D folder.`);
    continue;
  }

  const category = relative.split("/")[2];
  if (!limits[category]) continue;
  if (path.basename(file).startsWith(".")) continue;

  if (!allowed[category].has(extension)) {
    errors.push(`${relative}: unsupported deployed ${category} format (${extension || "no extension"}).`);
  }

  if (info.size > limits[category]) {
    errors.push(`${relative}: ${formatBytes(info.size)} exceeds the ${formatBytes(limits[category])} ${category} budget.`);
  }
}

const totalLimit = 30 * MiB;
if (totalBytes > totalLimit) {
  errors.push(`assets/3d total: ${formatBytes(totalBytes)} exceeds the ${formatBytes(totalLimit)} project budget.`);
}

console.log(`Checked ${files.length} files in assets/3d (${formatBytes(totalBytes)} total).`);

if (errors.length) {
  console.error("\nNew Beansland 3D asset budget failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error("\nCompress or move source masters outside the public website repository before merging.");
  process.exit(1);
}

console.log("New Beansland 3D asset budget passed.");