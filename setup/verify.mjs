#!/usr/bin/env node
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const setupDir = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(await readFile(path.join(setupDir, "manifest.json"), "utf8"));
const sourceRoot = path.resolve(setupDir, manifest.sourceRoot);
const args = parseArgs(process.argv.slice(2));

if (!args.vault) {
  console.error("Usage: node setup/verify.mjs --vault <path>");
  process.exit(2);
}

const vault = path.resolve(args.vault);
let failures = 0;
let warnings = 0;

for (const file of manifest.files) {
  const source = path.resolve(sourceRoot, file.source);
  const destination = path.resolve(vault, file.destination);
  if (!(await exists(destination))) {
    report("FAIL", `missing ${file.destination}`);
    failures += 1;
    continue;
  }
  const [expected, actual] = await Promise.all([readFile(source), readFile(destination)]);
  if (!expected.equals(actual)) {
    report("FAIL", `content mismatch ${file.destination}`);
    failures += 1;
  } else report("PASS", file.destination);
}

const dailyConfig = await readJson(path.resolve(vault, manifest.config.dailyNotes.destination));
const expectedDailyConfig = manifest.config.dailyNotes.content;
const dailyConfigMatches = Object.entries(expectedDailyConfig).every(([key, value]) => dailyConfig[key] === value);
if (!dailyConfigMatches) {
  report("FAIL", "Daily Notes config is missing or has incorrect manifest keys");
  failures += 1;
} else report("PASS", "Daily Notes config");

const communityPluginsPath = path.resolve(vault, manifest.config.communityPlugins.destination);
if (!(await exists(communityPluginsPath))) {
  report("WARN", "community-plugins.json is missing; enable QuickAdd in Obsidian after installing it");
  warnings += 1;
} else {
  const plugins = await readJson(communityPluginsPath);
  for (const plugin of manifest.config.communityPlugins.required) {
    if (!Array.isArray(plugins) || !plugins.includes(plugin)) {
      report("FAIL", `community plugin is not enabled: ${plugin}`);
      failures += 1;
    } else report("PASS", `community plugin enabled: ${plugin}`);
  }
}

const quickAddDataPath = path.resolve(vault, manifest.config.quickAddData.destination);
if (!(await exists(quickAddDataPath))) {
  report("WARN", "QuickAdd data.json is missing; create or enable the two macros in Obsidian");
  warnings += 1;
} else {
  const quickAddData = await readJson(quickAddDataPath);
  for (const [macroName, target] of Object.entries(manifest.config.quickAddData.requiredMacros)) {
    const found = findMacroTarget(quickAddData, macroName, target);
    if (!found) {
      report("WARN", `QuickAdd macro needs UI verification: ${macroName} -> ${target}`);
      warnings += 1;
    } else report("PASS", `QuickAdd macro: ${macroName}`);
  }
}

if (await exists(path.resolve(vault, "Templates/Journal/Daily Note.md"))) {
  report("WARN", "obsolete Templates/Journal/Daily Note.md remains; review before removing");
  warnings += 1;
}

console.log(`Verification complete: ${failures} failure(s), ${warnings} warning(s)`);
process.exit(failures ? 1 : 0);

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--vault") result.vault = argv[++index];
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return result;
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function findMacroTarget(data, name, target) {
  return (data.choices || []).some((choice) => choice.name === name && choice.command === true && (choice.macro?.commands || []).some((command) => command.path === "Scripts/Journal Flow.md" && command.name === target));
}

function report(level, message) {
  console.log(`${level} ${message}`);
}
