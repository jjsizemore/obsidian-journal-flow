#!/usr/bin/env node
import { copyFile, lstat, mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const setupDir = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(await readFile(path.join(setupDir, "manifest.json"), "utf8"));
const sourceRoot = await realpath(path.resolve(setupDir, manifest.sourceRoot));
const args = parseArgs(process.argv.slice(2));

if (!args.vault || (!args.apply && !args.dryRun)) {
  console.error("Usage: node setup/install.mjs --vault <path> [--dry-run|--apply] [--backup-dir <path>]");
  process.exit(2);
}

const vault = await realpath(args.vault);
await assertVault(vault);
console.log(`VAULT ${vault}`);
const backupDir = path.resolve(args.backupDir || path.join(os.homedir(), ".obsidian-journal-flow-backups", stamp()));
const operations = manifest.files.map(({ source, destination }) => ({
  kind: "copy",
  source: path.resolve(sourceRoot, source),
  destination: path.resolve(vault, destination),
}));

for (const operation of operations) {
  if (!(await assertFilePath(sourceRoot, operation.source))) throw new Error(`Missing source file: ${operation.source}`);
  await assertFilePath(vault, operation.destination);
}

const dailyConfigPath = path.resolve(vault, manifest.config.dailyNotes.destination);
await assertFilePath(vault, dailyConfigPath);
operations.push({
  kind: "config",
  destination: dailyConfigPath,
  content: `${JSON.stringify(await mergedDailyNotesConfig(dailyConfigPath), null, 2)}\n`,
});

const communityPluginsPath = path.resolve(vault, manifest.config.communityPlugins.destination);
await assertFilePath(vault, communityPluginsPath);
operations.push({
  kind: "config",
  destination: communityPluginsPath,
  content: `${JSON.stringify(await mergedCommunityPlugins(communityPluginsPath), null, 2)}\n`,
});

const quickAddManifest = path.resolve(vault, ".obsidian/plugins/quickadd/manifest.json");
const quickAddScript = path.resolve(vault, ".obsidian/plugins/quickadd/main.js");

for (const operation of operations) {
  console.log(`${args.apply ? "APPLY" : "PLAN"} ${operation.kind} ${path.relative(vault, operation.destination)}`);
  if (operation.kind === "config") console.log(operation.content.trimEnd());
}
console.log(`BACKUP ${backupDir}`);
if (!(await exists(quickAddManifest)) || !(await exists(quickAddScript))) console.log("REPORT QuickAdd is not installed or is incomplete; install it before enabling QuickAdd; Journal Flow Click Guard can be enabled independently.");
console.log("REPORT QuickAdd data.json is schema-sensitive; verify/configure its macros in Obsidian UI if verify reports them missing.");

if (!args.apply) process.exit(0);

for (const operation of operations) {
  await backupIfPresent(vault, operation.destination, backupDir);
  await mkdir(path.dirname(operation.destination), { recursive: true });
  if (operation.kind === "copy") await copyFile(operation.source, operation.destination);
  else await writeFile(operation.destination, operation.content, "utf8");
}
console.log("Installation applied. Fully restart/reload Obsidian, confirm Click Guard under Installed plugins, and complete the runtime registry checks in SETUP.md step 4. Then run:");
console.log(`node setup/verify.mjs --vault '${vault.replaceAll("'", "'\\''")}'`);

function parseArgs(argv) {
  const result = { apply: false, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--apply") result.apply = true;
    else if (value === "--dry-run") result.dryRun = true;
    else if (value === "--vault") result.vault = argv[++index];
    else if (value === "--backup-dir") result.backupDir = argv[++index];
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (result.apply && result.dryRun) throw new Error("Choose --apply or --dry-run, not both");
  return result;
}

async function assertVault(directory) {
  let config;
  try {
    config = await stat(path.join(directory, ".obsidian"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (!config?.isDirectory()) throw new Error(`Not an Obsidian vault (missing .obsidian directory): ${directory}`);
}

function assertContained(root, target) {
  const relative = path.relative(root, target);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Path escapes ${root}: ${target}`);
  }
}

async function assertFilePath(root, target) {
  assertContained(root, target);
  if (target === root) throw new Error(`Expected a file, not the root directory: ${target}`);
  let current = root;
  for (const component of path.relative(root, target).split(path.sep)) {
    current = path.join(current, component);
    let entry;
    try {
      entry = await lstat(current);
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
    if (entry.isSymbolicLink()) {
      assertContained(root, await realpath(current));
      entry = await stat(current);
    }
    if (current === target && !entry.isFile()) throw new Error(`Expected a file: ${target}`);
  }
  return true;
}

async function backupIfPresent(vaultRoot, target, backupRoot) {
  if (!(await exists(target))) return;
  const destination = path.join(backupRoot, path.relative(vaultRoot, target));
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(target, destination);
}

async function mergedDailyNotesConfig(file) {
  let current = {};
  if (await exists(file)) {
    current = JSON.parse(await readFile(file, "utf8"));
    if (!current || Array.isArray(current) || typeof current !== "object") throw new Error(`${file} must contain a JSON object`);
  }
  return { ...current, ...manifest.config.dailyNotes.content };
}

async function mergedCommunityPlugins(file) {
  let plugins = [];
  if (await exists(file)) plugins = JSON.parse(await readFile(file, "utf8"));
  if (!Array.isArray(plugins)) throw new Error(`${file} must contain a JSON array`);
  return [...new Set([...plugins, ...manifest.config.communityPlugins.required])];
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
