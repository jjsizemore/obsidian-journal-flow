import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { test } from "node:test";

const exec = promisify(execFile);
const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);

test("installer preserves unknown config keys and backs up replacements", async () => {
  const vault = await mkdtemp(path.join(os.tmpdir(), "journal-flow-vault-"));
  const backup = await mkdtemp(path.join(os.tmpdir(), "journal-flow-backup-"));
  try {
    await mkdir(path.join(vault, ".obsidian/plugins/quickadd"), { recursive: true });
    await writeFile(path.join(vault, ".obsidian/daily-notes.json"), JSON.stringify({ folder: "Old", template: "Old.md", format: "old", custom: true }));
    await writeFile(path.join(vault, ".obsidian/community-plugins.json"), JSON.stringify(["other-plugin"]));
    await writeFile(path.join(vault, ".obsidian/plugins/quickadd/manifest.json"), "{}\n");

    await exec(process.execPath, [path.join(repoRoot, "setup/install.mjs"), "--vault", vault, "--apply", "--backup-dir", backup], { cwd: repoRoot });
    const verification = await exec(process.execPath, [path.join(repoRoot, "setup/verify.mjs"), "--vault", vault], { cwd: repoRoot });
    assert.match(verification.stdout, /PASS Daily Notes config/);

    const dailyConfig = JSON.parse(await readFile(path.join(vault, ".obsidian/daily-notes.json"), "utf8"));
    assert.deepEqual(dailyConfig, {
      folder: "Daily",
      template: "Templates/Daily Note.md",
      format: "YYYY-MM-DD/YYYY-MM-DD",
      custom: true,
    });
    assert.deepEqual(JSON.parse(await readFile(path.join(vault, ".obsidian/community-plugins.json"), "utf8")), ["other-plugin", "quickadd"]);
    await readFile(path.join(backup, ".obsidian/daily-notes.json"));
    await readFile(path.join(backup, ".obsidian/community-plugins.json"));
    await rm(path.join(vault, ".obsidian/community-plugins.json"));
    const missingPluginConfig = await exec(process.execPath, [path.join(repoRoot, "setup/verify.mjs"), "--vault", vault], { cwd: repoRoot });
    assert.match(missingPluginConfig.stdout, /community-plugins\.json is missing/);
  } finally {
    await rm(vault, { recursive: true, force: true });
    await rm(backup, { recursive: true, force: true });
  }
});
