import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { copyFile, mkdtemp, mkdir, readFile, readdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
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
    const quickAddData = '{ "choices": [], "custom": "preserve me" }\n';
    await writeFile(path.join(vault, ".obsidian/plugins/quickadd/data.json"), quickAddData);

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
    assert.deepEqual(JSON.parse(await readFile(path.join(vault, ".obsidian/community-plugins.json"), "utf8")), ["other-plugin", "quickadd", "journal-flow-click-guard"]);
    await readFile(path.join(vault, ".obsidian/plugins/journal-flow-click-guard/manifest.json"));
    await readFile(path.join(vault, ".obsidian/plugins/journal-flow-click-guard/main.js"));
    await readFile(path.join(vault, ".obsidian/plugins/journal-flow-click-guard/card-click-guard.js"));
    assert.deepEqual(JSON.parse(await readFile(path.join(backup, ".obsidian/daily-notes.json"), "utf8")), { folder: "Old", template: "Old.md", format: "old", custom: true });
    assert.deepEqual(JSON.parse(await readFile(path.join(backup, ".obsidian/community-plugins.json"), "utf8")), ["other-plugin"]);
    assert.equal(await readFile(path.join(vault, ".obsidian/plugins/quickadd/data.json"), "utf8"), quickAddData);
    await rm(path.join(vault, ".obsidian/community-plugins.json"));
    const missingPluginConfig = await exec(process.execPath, [path.join(repoRoot, "setup/verify.mjs"), "--vault", vault], { cwd: repoRoot });
    assert.match(missingPluginConfig.stdout, /community-plugins\.json is missing/);
  } finally {
    await rm(vault, { recursive: true, force: true });
    await rm(backup, { recursive: true, force: true });
  }
});

test("installer merges community plugins even when QuickAdd is not yet installed", async () => {
  const vault = await mkdtemp(path.join(os.tmpdir(), "journal-flow-vault-"));
  const backup = await mkdtemp(path.join(os.tmpdir(), "journal-flow-backup-"));
  try {
    await mkdir(path.join(vault, ".obsidian"), { recursive: true });
    await writeFile(path.join(vault, ".obsidian/community-plugins.json"), JSON.stringify(["existing-plugin"]));

    await exec(
      process.execPath,
      [path.join(repoRoot, "setup/install.mjs"), "--vault", vault, "--apply", "--backup-dir", backup],
      { cwd: repoRoot },
    );

    const communityPlugins = JSON.parse(await readFile(path.join(vault, ".obsidian/community-plugins.json"), "utf8"));
    assert.deepEqual(communityPlugins, ["existing-plugin", "quickadd", "journal-flow-click-guard"]);
    await readFile(path.join(vault, ".obsidian/plugins/journal-flow-click-guard/manifest.json"));
    const verification = await exec(process.execPath, [path.join(repoRoot, "setup/verify.mjs"), "--vault", vault], { cwd: repoRoot });
    assert.match(verification.stdout, /WARN QuickAdd.*not installed/);
    assert.match(verification.stdout, /PASS community plugin configured on disk: quickadd/);
    assert.doesNotMatch(verification.stdout, /PASS.*plugin enabled/);
    const manifest = JSON.parse(await readFile(path.join(repoRoot, "setup/manifest.json"), "utf8"));
    for (const step of manifest.manualSteps) assert.ok(verification.stdout.includes(`PENDING ${step}`));
  } finally {
    await rm(vault, { recursive: true, force: true });
    await rm(backup, { recursive: true, force: true });
  }
});

test("canonical preview is read-only and apply prints a shell-safe verifier command", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "journal-flow-preview-"));
  const vault = path.join(root, "vault with spaces ' $HOME");
  const alias = path.join(root, "vault-alias");
  const backup = path.join(root, "backups");
  try {
    await mkdir(path.join(vault, ".obsidian"), { recursive: true });
    await mkdir(path.join(vault, "Daily"));
    await mkdir(path.join(vault, "Journal"));
    await writeFile(path.join(vault, "Daily/existing.md"), "daily note\n");
    await writeFile(path.join(vault, "Journal/existing.md"), "journal note\n");
    const originalConfig = '{ "folder": "Old", "custom": true }\n';
    await writeFile(path.join(vault, ".obsidian/daily-notes.json"), originalConfig);
    await symlink(vault, alias, "dir");
    const canonical = await realpath(vault);
    const before = await readdir(root, { recursive: true });
    const preview = await exec(process.execPath, [path.join(repoRoot, "setup/install.mjs"), "--vault", alias, "--dry-run", "--backup-dir", backup], { cwd: repoRoot });
    assert.ok(preview.stdout.includes(`VAULT ${canonical}\n`));
    assert.match(preview.stdout, /"folder": "Daily"/);
    assert.match(preview.stdout, /"template": "Templates\/Daily Note.md"/);
    assert.match(preview.stdout, /"format": "YYYY-MM-DD\/YYYY-MM-DD"/);
    assert.match(preview.stdout, /"quickadd"/);
    assert.match(preview.stdout, /"journal-flow-click-guard"/);
    assert.deepEqual(await readdir(root, { recursive: true }), before);
    assert.equal(await readFile(path.join(vault, ".obsidian/daily-notes.json"), "utf8"), originalConfig);
    const applied = await exec(process.execPath, [path.join(repoRoot, "setup/install.mjs"), "--vault", alias, "--apply", "--backup-dir", backup], { cwd: repoRoot });
    assert.ok(applied.stdout.includes(`VAULT ${canonical}\n`));
    const command = applied.stdout.split("\n").find((line) => line.startsWith("node setup/verify.mjs --vault "));
    assert.ok(command, "apply must provide a runnable verifier command");
    const verification = await exec("/bin/sh", ["-c", command], { cwd: repoRoot });
    assert.ok(verification.stdout.includes(`VAULT ${canonical}\n`));
    assert.equal(await readFile(path.join(backup, ".obsidian/daily-notes.json"), "utf8"), originalConfig);
    assert.equal(await readFile(path.join(vault, "Daily/existing.md"), "utf8"), "daily note\n");
    assert.equal(await readFile(path.join(vault, "Journal/existing.md"), "utf8"), "journal note\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("installer requires direct .obsidian rather than selecting a parent or child vault", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "journal-flow-direct-"));
  try {
    await mkdir(path.join(root, ".obsidian"));
    const selected = path.join(root, "selected");
    await mkdir(path.join(selected, "child/.obsidian"), { recursive: true });
    await assert.rejects(
      exec(process.execPath, [path.join(repoRoot, "setup/install.mjs"), "--vault", selected, "--dry-run"], { cwd: repoRoot }),
      (error) => error.code === 1 && /missing .obsidian/.test(error.stderr),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("verifier reports missing and malformed daily config while finishing independent checks", async () => {
  const vault = await mkdtemp(path.join(os.tmpdir(), "journal-flow-config-"));
  try {
    await mkdir(path.join(vault, ".obsidian"));
    await exec(process.execPath, [path.join(repoRoot, "setup/install.mjs"), "--vault", vault, "--apply"], { cwd: repoRoot });
    const config = path.join(vault, ".obsidian/daily-notes.json");
    for (const content of [undefined, "{ invalid", "null"]) {
      if (content === undefined) await rm(config);
      else await writeFile(config, content);
      await assert.rejects(
        exec(process.execPath, [path.join(repoRoot, "setup/verify.mjs"), "--vault", vault], { cwd: repoRoot }),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stdout, /FAIL Daily Notes config.*\.obsidian\/daily-notes\.json/);
          assert.match(error.stdout, /Settings.*Daily notes/);
          assert.match(error.stdout, /WARN QuickAdd.*not installed/);
          assert.match(error.stdout, /PENDING /);
          assert.match(error.stdout, /Verification complete: 1 failure\(s\)/);
          assert.equal(error.stderr, "");
          return true;
        },
      );
    }
  } finally {
    await rm(vault, { recursive: true, force: true });
  }
});

test("escaping destination symlinks stop preview and apply before any mutation", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "journal-flow-escape-"));
  try {
    for (const destination of [".obsidian/snippets", ".obsidian/daily-notes.json"]) {
      const vault = path.join(root, destination.endsWith(".json") ? "file-vault" : "directory-vault");
      const outside = `${vault}-outside`;
      const backup = `${vault}-backup`;
      await mkdir(path.join(vault, ".obsidian"), { recursive: true });
      await mkdir(outside);
      const externalFile = path.join(outside, destination.endsWith(".json") ? "daily.json" : "journal-flow.css");
      const original = destination.endsWith(".json") ? '{ "folder": "Outside" }\n' : "outside stylesheet\n";
      await writeFile(externalFile, original);
      await symlink(destination.endsWith(".json") ? externalFile : outside, path.join(vault, destination));
      const before = await readdir(root, { recursive: true });
      for (const mode of ["--dry-run", "--apply"]) {
        await assert.rejects(
          exec(process.execPath, [path.join(repoRoot, "setup/install.mjs"), "--vault", vault, mode, "--backup-dir", backup], { cwd: repoRoot }),
          (error) => error.code === 1 && /escapes/.test(error.stderr),
        );
        assert.equal(await readFile(externalFile, "utf8"), original);
        assert.deepEqual(await readdir(root, { recursive: true }), before);
      }
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("manifest path escapes are rejected before copying any files", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "journal-flow-manifest-"));
  try {
    const fixture = path.join(root, "setup");
    const vault = path.join(root, "vault");
    const externalFile = path.join(root, "outside.md");
    await mkdir(fixture);
    await mkdir(path.join(vault, ".obsidian"), { recursive: true });
    await writeFile(externalFile, "outside note\n");
    await copyFile(path.join(repoRoot, "setup/install.mjs"), path.join(fixture, "install.mjs"));
    for (const field of ["destination", "source"]) {
      const manifest = JSON.parse(await readFile(path.join(repoRoot, "setup/manifest.json"), "utf8"));
      manifest.sourceRoot = repoRoot;
      manifest.files.at(-1)[field] = field === "destination" ? "../outside.md" : externalFile;
      await writeFile(path.join(fixture, "manifest.json"), JSON.stringify(manifest));
      const before = await readdir(root, { recursive: true });
      for (const mode of ["--dry-run", "--apply"]) {
        await assert.rejects(
          exec(process.execPath, [path.join(fixture, "install.mjs"), "--vault", vault, mode, "--backup-dir", path.join(root, "backup")], { cwd: repoRoot }),
          (error) => error.code === 1 && /escapes/.test(error.stderr),
        );
        assert.deepEqual(await readdir(root, { recursive: true }), before);
        assert.equal(await readFile(externalFile, "utf8"), "outside note\n");
      }
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("invalid community and QuickAdd JSON keeps the complete pending checklist and correct exit status", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "journal-flow-json-"));
  const vault = path.join(root, "vault");
  try {
    await mkdir(path.join(vault, ".obsidian"), { recursive: true });
    await exec(process.execPath, [path.join(repoRoot, "setup/install.mjs"), "--vault", vault, "--apply", "--backup-dir", path.join(root, "backup")], { cwd: repoRoot });
    const manifest = JSON.parse(await readFile(path.join(repoRoot, "setup/manifest.json"), "utf8"));
    const community = path.join(vault, manifest.config.communityPlugins.destination);
    const quickAdd = path.join(vault, manifest.config.quickAddData.destination);
    await mkdir(path.dirname(quickAdd), { recursive: true });
    for (const content of ["{ invalid", "null"]) {
      await writeFile(community, content);
      await writeFile(quickAdd, content);
      await assert.rejects(
        exec(process.execPath, [path.join(repoRoot, "setup/verify.mjs"), "--vault", vault], { cwd: repoRoot }),
        (error) => {
          assert.equal(error.code, 1);
          assert.equal(error.stderr, "");
          assert.match(error.stdout, /FAIL .*community-plugins\.json.*Community plugins/);
          assert.match(error.stdout, /WARN .*QuickAdd.*data\.json.*UI/);
          assert.match(error.stdout, /Verification complete: 1 failure\(s\)/);
          for (const step of manifest.manualSteps) assert.ok(error.stdout.includes(`PENDING ${step}`));
          return true;
        },
      );
      await writeFile(community, JSON.stringify(manifest.config.communityPlugins.required));
      const verification = await exec(process.execPath, [path.join(repoRoot, "setup/verify.mjs"), "--vault", vault], { cwd: repoRoot });
      assert.equal(verification.stderr, "");
      assert.match(verification.stdout, /WARN .*QuickAdd.*data\.json.*UI/);
      assert.match(verification.stdout, /Verification complete: 0 failure\(s\)/);
      for (const step of manifest.manualSteps) assert.ok(verification.stdout.includes(`PENDING ${step}`));
      assert.equal(await readFile(quickAdd, "utf8"), content);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
