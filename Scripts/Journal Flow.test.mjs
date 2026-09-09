import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const scriptPath = new URL("./Journal Flow.md", import.meta.url);
const markdown = readFileSync(scriptPath, "utf8");
const script = markdown.match(/```js\n([\s\S]*?)\n```/)[1];
const testableScript = `${script}\nmodule.exports.__test = { getOrCreateDailyNote };`;

function loadAutomation() {
  const module = { exports: {} };
  vm.runInNewContext(testableScript, {
    Array,
    Boolean,
    Date,
    Error,
    Intl,
    Number,
    Object,
    Promise,
    RegExp,
    String,
    console,
    module,
  });
  return module.exports;
}

function localDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function journalFolderForDaily(file) {
  return `Journal/${file.path.split("/")[1]}`;
}

class MockVault {
  constructor() {
    this.files = new Map();
    this.contents = new Map();
    this.folders = new Set();
  }

  add(path, content) {
    const file = this.file(path);
    this.files.set(path, file);
    this.contents.set(path, content);
    return file;
  }

  file(path) {
    const parts = path.split("/");
    const name = parts.at(-1);
    return {
      basename: name.replace(/\.md$/, ""),
      extension: "md",
      name,
      parent: { path: parts.slice(0, -1).join("/") },
      path,
    };
  }

  getAbstractFileByPath(path) {
    return this.files.get(path);
  }

  getMarkdownFiles() {
    return [...this.files.values()].filter((file) => file.extension === "md");
  }

  async read(file) {
    return this.contents.get(file.path);
  }

  async create(path, content) {
    if (this.files.has(path)) throw new Error(`already exists: ${path}`);
    return this.add(path, content);
  }

  async modify(file, content) {
    if (!this.files.has(file.path)) throw new Error(`missing: ${file.path}`);
    this.contents.set(file.path, content);
  }

  async createFolder(path) {
    this.folders.add(path);
  }
}

function frontmatter(content) {
  const result = {};
  const block = content.match(/^---\n([\s\S]*?)\n---/m)?.[1] || "";
  for (const line of block.split("\n")) {
    const match = line.match(/^([\w-]+):\s*"?([^"].*?)"?$/);
    if (match) result[match[1]] = match[2];
  }
  return result;
}

function makeApp(vault, activeFile) {
  const workspace = {
    activeFile,
    getActiveFile: () => workspace.activeFile,
    getLeaf: () => ({
      openFile: async (file) => {
        workspace.activeFile = file;
      },
    }),
  };
  return {
    metadataCache: {
      getFileCache: (file) => ({ frontmatter: file ? frontmatter(vault.contents.get(file.path)) : undefined }),
      getFirstLinkpathDest: (link) => vault.getAbstractFileByPath(`${link}.md`),
    },
    vault,
    workspace,
  };
}

function makeQuickAdd() {
  return {
    infoDialog: async () => {},
    suggester: async (choices, values) => {
      if (choices[0]?.startsWith("Link existing")) return values[0];
      if (values.includes("active")) return "active";
      return values[0];
    },
  };
}

function seedVault(date = localDate(new Date())) {
  const vault = new MockVault();
  const dailyPath = `Daily/${date}/${date}.md`;
  const daily = vault.add(
    dailyPath,
    `---\ntype: daily-note\ndate: "${date}"\n---\n\n# Daily\n\n## Journal\n*Links to standalone guided entries only.*\n\n### Check-ins\n*Short state check-ins.*\n\n### Analyze Thoughts\n*Structured thought-reflection entries.*\n`,
  );
  vault.add("Templates/Daily Note.md", readFileSync(new URL("../Templates/Daily Note.md", import.meta.url), "utf8"));
  vault.add("Templates/Journal/Check-in.md", readFileSync(new URL("../Templates/Journal/Check-in.md", import.meta.url), "utf8"));
  vault.add("Templates/Journal/Analyze Thought.md", readFileSync(new URL("../Templates/Journal/Analyze Thought.md", import.meta.url), "utf8"));
  return { daily, vault, app: makeApp(vault, daily) };
}

test("creates both entry types in Journal beside the Daily Note and persists subtype links", async () => {
  const { app, daily, vault } = seedVault();
  const automation = loadAutomation();
  const params = { app, quickAddApi: makeQuickAdd(), obsidian: {} };

  await automation.checkIn(params);
  await automation.analyzeThought(params);

  const entries = vault.getMarkdownFiles().filter((file) => file.parent.path === journalFolderForDaily(daily));
  assert.equal(entries.length, 2);
  assert.ok(entries.some((file) => file.basename.includes("Check-in")));
  assert.ok(entries.some((file) => file.basename.includes("Analyze Thought")));

  const dailyContent = await vault.read(daily);
  const checkIn = entries.find((file) => file.basename.includes("Check-in"));
  const analyzeThought = entries.find((file) => file.basename.includes("Analyze Thought"));
  const checkInLink = `- [[${checkIn.path.replace(/\.md$/, "")}|${checkIn.basename}]]`;
  const analyzeThoughtLink = `- [[${analyzeThought.path.replace(/\.md$/, "")}|${analyzeThought.basename}]]`;
  assert.ok(dailyContent.indexOf(checkInLink) > dailyContent.indexOf("### Check-ins"));
  assert.ok(dailyContent.indexOf(checkInLink) < dailyContent.indexOf("### Analyze Thoughts"));
  assert.ok(dailyContent.indexOf(analyzeThoughtLink) > dailyContent.indexOf("### Analyze Thoughts"));
  assert.match(await vault.read(analyzeThought), /daily_note: "\[\[Daily\//);
});

test("analyzeThought creates a linked standalone Journal note", async () => {
  const { app, daily, vault } = seedVault();
  const automation = loadAutomation();
  const params = { app, quickAddApi: makeQuickAdd(), obsidian: {} };
  const dailyBefore = await vault.read(daily);
  const date = localDate(new Date());

  await automation.analyzeThought(params);

  const entries = vault.getMarkdownFiles().filter((file) => file.parent.path === `Journal/${date}`);
  assert.equal(entries.length, 1);
  assert.match(entries[0].basename, new RegExp(`^${date} \\d{4} Analyze Thought$`));
  assert.match(await vault.read(entries[0]), /type: guided-journal/);

  const dailyAfter = await vault.read(daily);
  const link = `- [[${entries[0].path.replace(/\.md$/, "")}|${entries[0].basename}]]`;
  const analyzeHeading = dailyAfter.indexOf("### Analyze Thoughts");
  assert.ok(dailyAfter.indexOf(link, analyzeHeading) > analyzeHeading);
  assert.equal(dailyAfter.includes("**Unhelpful thought:**"), false);
  assert.equal(dailyAfter.replace(link, "").trimEnd(), dailyBefore.trimEnd());
});


test("ignores daily-note candidates without a sortable date", async () => {
  const { app, vault } = seedVault();
  const undated = vault.add("Daily/undated.md", "---\ntype: daily-note\n---\n\n# Undated\n");
  const alsoUndated = vault.add("Daily/also-undated.md", "---\ntype: daily-note\n---\n\n# Also undated\n");
  vault.files = new Map([
    [undated.path, undated],
    [alsoUndated.path, alsoUndated],
    ...[...vault.files].filter(([path]) => path !== undated.path && path !== alsoUndated.path),
  ]);
  app.workspace.activeFile = vault.add("Notes/Inbox.md", "# Inbox\n");
  const params = { app, quickAddApi: makeQuickAdd(), obsidian: {} };
  const automation = loadAutomation();

  await automation.analyzeThought(params);

  assert.equal(vault.getMarkdownFiles().filter((file) => file.parent.path.startsWith("Journal/")).length, 1);
});

test("uses a suffix for collisions and re-links an unlinked retry without duplicating", async () => {
  const { app, daily, vault } = seedVault();
  const automation = loadAutomation();
  const params = { app, quickAddApi: makeQuickAdd(), obsidian: {} };

  await automation.checkIn(params);
  await automation.checkIn(params);
  let entries = vault.getMarkdownFiles().filter((file) => file.parent.path === journalFolderForDaily(daily));
  assert.equal(entries.length, 2);
  assert.ok(entries.some((file) => file.basename.endsWith("Check-in 2")));

  const latest = entries.at(-1);
  const latestLink = `- [[${latest.path.replace(/\.md$/, "")}|${latest.basename}]]`;
  const foreignLink = `- [[Journal/other/${latest.basename}]]`;
  const contentWithoutLatestLink = (await vault.read(daily)).replace(`${latestLink}\n`, "") + `${foreignLink}\n`;
  await vault.modify(daily, contentWithoutLatestLink);
  await automation.checkIn(params);

  entries = vault.getMarkdownFiles().filter((file) => file.parent.path === journalFolderForDaily(daily));
  assert.equal(entries.length, 2);
  assert.ok((await vault.read(daily)).includes(latestLink));
});

test("keeps an explicitly selected older Daily Note as the target", async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { app, daily, vault } = seedVault(localDate(yesterday));
  const automation = loadAutomation();
  const params = { app, quickAddApi: makeQuickAdd(), obsidian: {} };

  await automation.checkIn(params);

  const entries = vault.getMarkdownFiles().filter((file) => file.parent.path === journalFolderForDaily(daily));
  assert.equal(entries.length, 1);
  assert.match(entries[0].path, new RegExp(`^Journal/${localDate(yesterday)}/`));
});

test("repairs Journal headings but does not recreate a missing Daily Note target", async () => {
  const { app, daily, vault } = seedVault();
  const automation = loadAutomation();
  const messages = [];
  const quickAddApi = makeQuickAdd();
  quickAddApi.infoDialog = async (_title, message) => messages.push(message);
  const params = { app, quickAddApi, obsidian: {} };

  await vault.modify(daily, `---\ntype: daily-note\ndate: "${localDate(new Date())}"\n---\n\n# Daily\n`);
  await automation.checkIn(params);

  const dailyContent = await vault.read(daily);
  assert.match(dailyContent, /## Journal/);
  assert.match(dailyContent, /### Check-ins/);
  assert.match(dailyContent, /### Analyze Thoughts/);

  const orphanEntry = vault.getMarkdownFiles().find((file) => file.parent.path === journalFolderForDaily(daily));
  const otherDaily = vault.add("Daily/2099-01-01/2099-01-01.md", "---\ntype: daily-note\ndate: \"2099-01-01\"\n---\n\n# Other Daily Note\n");
  vault.files.delete(daily.path);
  vault.contents.delete(daily.path);
  await automation.checkIn(params);

  const dateFolder = journalFolderForDaily(daily);
  const filesAfterFailure = vault.getMarkdownFiles().filter((file) => file.parent.path === dateFolder);
  assert.equal(filesAfterFailure.length, 1);
  assert.equal(filesAfterFailure[0].path, orphanEntry.path);
  assert.equal(vault.getAbstractFileByPath(daily.path), undefined);
  assert.doesNotMatch(await vault.read(otherDaily), /Check-in/);
  assert.match(messages.join("\n"), /missing Daily Note/);
});

test("creates only Daily on daily-note creation, then creates Journal on first entry", async () => {
  const { app, daily, vault } = seedVault();
  const automation = loadAutomation();
  const params = { app, quickAddApi: makeQuickAdd(), obsidian: {} };
  const today = localDate(new Date());
  vault.add(
    `Journal/${today}/${today} Journal.md`,
    `---\ntype: daily-note\ndate: "${today}"\n---\n\n# Legacy Daily Note\n`,
  );
  const selected = await automation.__test.getOrCreateDailyNote(app, today);
  assert.equal(selected.path, `Daily/${today}/${today}.md`);

  vault.files.delete(daily.path);
  vault.contents.delete(daily.path);
  app.workspace.activeFile = undefined;
  const createdDaily = await automation.__test.getOrCreateDailyNote(app, today);
  assert.equal(createdDaily.path, `Daily/${today}/${today}.md`);
  assert.ok(vault.folders.has(`Daily/${today}`));
  assert.ok(!vault.folders.has(`Journal/${today}`));
  const createdContent = await vault.read(createdDaily);
  const h2Headings = [...createdContent.matchAll(/^##\s+(.*)$/gm)].map((match) => match[1]);
  assert.deepEqual(h2Headings, ["Tasks", "Notes", "Journal"]);

  const withUserNotes = (await vault.read(createdDaily))
    .replace("- [ ]", "- [ ] Review team project deliverables")
    .replace(/(## Notes[^\n]*\n(?:[^\n]*\n)?)/, "$1\nCaptured architecture considerations for the week.\n");
  await vault.modify(createdDaily, withUserNotes);

  await automation.checkIn(params);
  assert.ok(vault.folders.has(`Journal/${today}`));
  const checkInEntries = vault
    .getMarkdownFiles()
    .filter((file) => file.parent.path === `Journal/${today}` && frontmatter(vault.contents.get(file.path)).type === "check-in");
  assert.equal(checkInEntries.length, 1);
  const checkInLink = `- [[${checkInEntries[0].path.replace(/\.md$/, "")}|${checkInEntries[0].basename}]]`;
  const dailyAfterCheckIn = await vault.read(createdDaily);
  assert.ok(dailyAfterCheckIn.includes(checkInLink));
  assert.ok(dailyAfterCheckIn.indexOf(checkInLink) > dailyAfterCheckIn.indexOf("### Check-ins"));
  assert.ok(dailyAfterCheckIn.includes("- [ ] Review team project deliverables"));
  assert.ok(dailyAfterCheckIn.includes("Captured architecture considerations for the week."));
});
