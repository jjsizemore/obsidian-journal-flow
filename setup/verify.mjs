#!/usr/bin/env node
import { readFile, realpath, stat } from "node:fs/promises";
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

const vault = await realpath(args.vault);
if (!(await stat(path.join(vault, ".obsidian"))).isDirectory()) throw new Error(`Not an Obsidian vault (missing .obsidian directory): ${vault}`);
console.log(`VAULT ${vault}`);
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

try {
  const dailyConfig = await readJson(path.resolve(vault, manifest.config.dailyNotes.destination));
  const expectedDailyConfig = manifest.config.dailyNotes.content;
  if (!dailyConfig || Array.isArray(dailyConfig) || typeof dailyConfig !== "object" ||
      !Object.entries(expectedDailyConfig).every(([key, value]) => dailyConfig[key] === value)) {
    throw new Error("expected a JSON object with the manifest's Daily notes settings");
  }
  report("PASS", "Daily Notes config");
} catch (error) {
  report("FAIL", `Daily Notes config (${manifest.config.dailyNotes.destination}): ${error.message}; review Settings → Daily notes against SETUP.md`);
  failures += 1;
}

const communityPluginsPath = path.resolve(vault, manifest.config.communityPlugins.destination);
if (!(await exists(communityPluginsPath))) {
  report("WARN", "community-plugins.json is missing; enable QuickAdd in Obsidian after installing it");
  warnings += 1;
} else {
  try {
    const plugins = await readJson(communityPluginsPath);
    if (!Array.isArray(plugins)) throw new Error("expected a JSON array");
    for (const plugin of manifest.config.communityPlugins.required) {
      if (!plugins.includes(plugin)) {
        report("FAIL", `community plugin missing from on-disk configuration: ${plugin}; enable it in Obsidian after installing it`);
        failures += 1;
      } else report("PASS", `community plugin configured on disk: ${plugin}`);
    }
  } catch (error) {
    report("FAIL", `community-plugins.json cannot be verified: ${error.message}; review Settings → Community plugins`);
    failures += 1;
  }
}

const quickAddDirectory = path.resolve(vault, path.dirname(manifest.config.quickAddData.destination));
if (!(await exists(path.join(quickAddDirectory, "manifest.json"))) || !(await exists(path.join(quickAddDirectory, "main.js")))) {
  report("WARN", "QuickAdd is not installed or is incomplete; install it from Settings → Community plugins");
  warnings += 1;
} else report("PASS", "QuickAdd installation files present (runtime activation still requires Obsidian UI verification)");

const quickAddDataPath = path.resolve(vault, manifest.config.quickAddData.destination);
if (!(await exists(quickAddDataPath))) {
  report("WARN", "QuickAdd data.json is missing; create or enable the two macros in Obsidian");
  warnings += 1;
} else {
  try {
    const quickAddData = await readJson(quickAddDataPath);
    if (!quickAddData || Array.isArray(quickAddData) || typeof quickAddData !== "object") throw new Error("expected a JSON object");
    for (const [macroName, target] of Object.entries(manifest.config.quickAddData.requiredMacros)) {
      const found = findMacroTarget(quickAddData, macroName, target);
      if (!found) {
        report("WARN", `QuickAdd macro needs UI verification: ${macroName} -> ${target}`);
        warnings += 1;
      } else report("PASS", `QuickAdd macro: ${macroName}`);
    }
  } catch (error) {
    report("WARN", `QuickAdd data.json cannot be verified: ${error.message}; review both macros in the QuickAdd UI without rewriting data.json`);
    warnings += 1;
  }
}

if (await exists(path.resolve(vault, "Templates/Journal/Daily Note.md"))) {
  report("WARN", "obsolete Templates/Journal/Daily Note.md remains; review before removing");
  warnings += 1;
}

console.log("Pending manual work (not verified by this on-disk check):");
for (const step of manifest.manualSteps) report("PENDING", step);
console.log("Runtime identity and authorization remain required by AGENTS.md; restart/reload and plugin registry checks are documented in SETUP.md step 4.");
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
