# Journal Flow QuickAdd automation

Use this note as a QuickAdd user script. The script stays in a Markdown note so it can be edited and discovered on iOS as well as macOS.

```js
const JOURNAL_HEADING = "## Journal";
const JOURNAL_SUBTITLE = "*Links to standalone guided entries only.*";
const DAILY_NOTE_TEMPLATE = "Templates/Daily Note.md";
const DAILY_NOTE_PATH = /^Daily\/(\d{4}-\d{2}-\d{2})\/\1\.md$/;

const ENTRY_TYPES = {
  "check-in": {
    label: "Check-in",
    frontmatterType: "check-in",
    template: "Templates/Journal/Check-in.md",
    heading: "### Check-ins",
    subtitle: "*Short state check-ins.*",
  },
  "analyze-thought": {
    label: "Analyze Thought",
    frontmatterType: "guided-journal",
    journal: "analyze-thought",
    template: "Templates/Journal/Analyze Thought.md",
    heading: "### Analyze Thoughts",
    subtitle: "*Structured thought-reflection entries.*",
  },
};

module.exports = {
  checkIn: (params) => createEntry(params, "check-in"),
  analyzeThought: (params) => createEntry(params, "analyze-thought"),
};

async function createEntry(params, type) {
  const definition = ENTRY_TYPES[type];
  const dailyNote = await resolveDailyNote(params);
  if (!dailyNote) return;

  const existing = await findUnlinkedEntries(params.app, dailyNote, definition);
  let entryFile = await chooseExistingEntry(params, existing, definition);

  if (!entryFile) {
    entryFile = await createEntryFile(params.app, dailyNote, definition);
  }

  try {
    await appendEntryLink(params.app, dailyNote, entryFile, definition);
  } catch (error) {
    await showError(
      params,
      `${definition.label} created at ${entryFile.path}, but the Daily Note could not be updated. Retry the same command; the existing note will be offered instead of duplicated.`,
      error,
    );
    return;
  }

  await params.app.workspace.getLeaf(false).openFile(entryFile);
}

async function chooseExistingEntry(params, files, definition) {
  if (files.length === 0) return undefined;

  const createLabel = `Create new ${definition.label}`;
  const choices = [
    ...files.map((file) => `Link existing: ${file.basename}`),
    createLabel,
  ];
  const values = [...files, null];
  const selected = await params.quickAddApi.suggester(choices, values);
  return selected || undefined;
}

async function resolveDailyNote(params) {
  const { app, quickAddApi } = params;
  const today = localDate(new Date());
  const active = app.workspace.getActiveFile();
  const activeDaily = await dailyNoteFromFile(app, active);

  if (activeDaily) {
    const activeDate = dailyDate(app, activeDaily);
    if (activeDate === today) return activeDaily;

    const choice = await quickAddApi.suggester(
      [
        `Use active Daily Note (${activeDate})`,
        `Create/open today's Daily Note (${today})`,
        "Choose another Daily Note",
      ],
      ["active", "create", "choose"],
    );

    if (choice === "active") return activeDaily;
    if (choice === "create") return getOrCreateDailyNote(app, today);
    return chooseDailyNote(params, today, true);
  }

  const linkedDaily = await dailyNoteFromFile(app, active);
  if (linkedDaily) return linkedDaily;
  if (dailyNoteLinkFromFile(app, active)) {
    await showError(params, "The active journal entry points to a missing Daily Note. Restore it or open the intended Daily Note, then retry.");
    return undefined;
  }

  return chooseDailyNote(params, today, true);
}

async function chooseDailyNote(params, today, allowCreate) {
  const { app, quickAddApi } = params;
  const dailyNotes = app.vault
    .getMarkdownFiles()
    .filter((file) => isDailyNote(app, file))
    .sort((a, b) => dailyDate(app, b).localeCompare(dailyDate(app, a)));

  const firstLabel = allowCreate
    ? `Create/open today's Daily Note (${today})`
    : `Use today's existing Daily Note (${today})`;
  const firstValue = allowCreate ? "create" : "today";
  const choices = [firstLabel, ...dailyNotes.map((file) => `${dailyDate(app, file)} — ${file.path}`)];
  const values = [firstValue, ...dailyNotes];
  const selected = await quickAddApi.suggester(choices, values);

  if (selected === "create") return getOrCreateDailyNote(app, today);
  if (selected === "today") {
    const todayNote = findDailyNote(app, today);
    if (todayNote) return todayNote;
    await showError(params, `No Daily Note exists for ${today}. Create it with the Daily Notes command, then retry.`);
    return undefined;
  }
  return selected || undefined;
}

async function dailyNoteFromFile(app, file) {
  if (!file) return undefined;
  if (isDailyNote(app, file)) return file;

  const link = dailyNoteLinkFromFile(app, file);
  if (!link) return undefined;
  return app.metadataCache.getFirstLinkpathDest(link, file.path) || undefined;
}

function dailyNoteLinkFromFile(app, file) {
  if (!file) return undefined;
  const dailyProperty = app.metadataCache.getFileCache(file)?.frontmatter?.daily_note;
  if (typeof dailyProperty !== "string") return undefined;
  return dailyProperty.match(/\[\[([^\]|#]+)/)?.[1];
}

function isDailyNote(app, file) {
  if (!file) return false;
  const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
  return frontmatter?.type === "daily-note" || DAILY_NOTE_PATH.test(file.path);
}

function dailyDate(app, file) {
  if (!file) return undefined;
  const frontmatterDate = app.metadataCache.getFileCache(file)?.frontmatter?.date;
  if (typeof frontmatterDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(frontmatterDate)) {
    return frontmatterDate;
  }
  return file.path.match(DAILY_NOTE_PATH)?.[1];
}

function findDailyNote(app, date) {
  const exactPath = `Daily/${date}/${date}.md`;
  const exact = app.vault.getAbstractFileByPath(exactPath);
  if (exact && isDailyNote(app, exact)) return exact;
  return undefined;
}

async function getOrCreateDailyNote(app, date) {
  const existing = findDailyNote(app, date);
  if (existing) {
    await app.workspace.getLeaf(false).openFile(existing);
    return existing;
  }

  const folder = `Daily/${date}`;
  const parent = folder.slice(0, folder.lastIndexOf("/"));
  if (parent && !app.vault.getAbstractFileByPath(parent)) await app.vault.createFolder(parent);
  if (!app.vault.getAbstractFileByPath(folder)) await app.vault.createFolder(folder);

  const path = `${folder}/${date}.md`;
  const current = app.vault.getAbstractFileByPath(path);
  if (current) return current;

  const template = app.vault.getAbstractFileByPath(DAILY_NOTE_TEMPLATE);
  if (!template) throw new Error(`Missing Daily Note template: ${DAILY_NOTE_TEMPLATE}`);
  const raw = await app.vault.read(template);
  const content = renderTemplate(raw, date, new Date());
  const created = await app.vault.create(path, content);
  await app.workspace.getLeaf(false).openFile(created);
  return created;
}


async function createEntryFile(app, dailyNote, definition) {
  const template = app.vault.getAbstractFileByPath(definition.template);
  if (!template) throw new Error(`Missing journal template: ${definition.template}`);

  const now = new Date();
  const date = dailyDate(app, dailyNote);
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`;
  const baseName = `${date} ${time} ${definition.label}`;
  const folder = `Journal/${date}`;
  await ensureFolder(app, folder);
  const path = await availablePath(app, folder, baseName);
  const raw = await app.vault.read(template);
  const content = renderTemplate(raw, date, now, dailyNote);
  return app.vault.create(path, content);
}

async function availablePath(app, folder, baseName) {
  let suffix = 0;
  while (true) {
    const name = suffix === 0 ? baseName : `${baseName} ${suffix + 1}`;
    const path = `${folder}/${name}.md`;
    if (!app.vault.getAbstractFileByPath(path)) return path;
    suffix += 1;
  }
}

async function findUnlinkedEntries(app, dailyNote, definition) {
  const date = dailyDate(app, dailyNote);
  const dailyContent = await app.vault.read(dailyNote);
  const dailyFiles = app.vault
    .getMarkdownFiles()
    .filter((file) => file.parent.path === `Journal/${date}`);

  return dailyFiles.filter((file) => {
    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
    const matchesType = frontmatter?.type === definition.frontmatterType;
    const matchesJournal = !definition.journal || frontmatter?.journal === definition.journal;
    return matchesType && matchesJournal && frontmatter?.date === date && !hasLinkTo(dailyContent, file);
  });
}

async function appendEntryLink(app, dailyNote, entryFile, definition) {
  const target = entryFile.path.replace(/\.md$/, "");
  const displayName = entryFile.basename;
  const link = `- [[${target}|${displayName}]]`;
  const firstRead = await app.vault.read(dailyNote);
  if (hasLinkTo(firstRead, entryFile)) return;

  let updated = ensureManagedHeadings(firstRead);
  updated = appendUnderHeading(updated, definition.heading, link);

  const latestRead = await app.vault.read(dailyNote);
  if (latestRead !== firstRead) {
    if (hasLinkTo(latestRead, entryFile)) return;
    updated = appendUnderHeading(ensureManagedHeadings(latestRead), definition.heading, link);
  }

  await app.vault.modify(dailyNote, updated);
}

function hasLinkTo(content, entryFile) {
  if (typeof content !== "string" || !entryFile?.path) return false;
  const target = escapeRegExp(entryFile.path.replace(/\.md$/, ""));
  return new RegExp(`\\[\\[${target}(?:\\|[^\\]]+)?\\]\\]`).test(content);
}

function ensureManagedHeadings(content) {
  const lines = content.split("\n");
  let journalIndex = lines.findIndex((line) => line.trim() === JOURNAL_HEADING);

  if (journalIndex === -1) {
    const insertAt = lines.findIndex((line) => /^##\s+/.test(line));
    const block = [
      JOURNAL_HEADING,
      JOURNAL_SUBTITLE,
      "",
      "### Check-ins",
      ENTRY_TYPES["check-in"].subtitle,
      "",
      "### Analyze Thoughts",
      ENTRY_TYPES["analyze-thought"].subtitle,
      "",
    ];
    lines.splice(insertAt === -1 ? lines.length : insertAt, 0, ...block);
    journalIndex = lines.findIndex((line) => line.trim() === JOURNAL_HEADING);
  } else if (lines[journalIndex + 1]?.trim() !== JOURNAL_SUBTITLE) {
    lines.splice(journalIndex + 1, 0, JOURNAL_SUBTITLE);
  }

  for (const entry of Object.values(ENTRY_TYPES)) {
    const headingIndex = lines.findIndex((line) => line.trim() === entry.heading);
    if (headingIndex !== -1) {
      if (lines[headingIndex + 1]?.trim() !== entry.subtitle) {
        lines.splice(headingIndex + 1, 0, entry.subtitle);
      }
      continue;
    }

    const nextTopLevel = lines.findIndex((line, index) => index > journalIndex && /^##\s+/.test(line));
    const block = [entry.heading, entry.subtitle, ""];
    lines.splice(nextTopLevel === -1 ? lines.length : nextTopLevel, 0, ...block);
  }

  return lines.join("\n");
}

function appendUnderHeading(content, heading, link) {
  const lines = content.split("\n");
  const headingIndex = lines.findIndex((line) => line.trim() === heading);
  if (headingIndex === -1) throw new Error(`Missing managed heading: ${heading}`);

  let end = lines.length;
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    if (/^#{1,3}\s+/.test(lines[index])) {
      end = index;
      break;
    }
  }

  let insertAt = end;
  while (insertAt > headingIndex + 1 && lines[insertAt - 1].trim() === "") insertAt -= 1;
  lines.splice(insertAt, 0, link, "");
  return lines.join("\n");
}

function renderTemplate(raw, targetDate, now, dailyNote) {
  let rendered = raw
    .replace(/\{\{date:([^}]+)\}\}/g, (_, format) => formatDate(targetDate, format))
    .replace(/\{\{time:([^}]+)\}\}/g, (_, format) => formatTime(now, format));

  if (dailyNote) {
    const target = dailyNote.path.replace(/\.md$/, "");
    rendered = rendered
      .replace(/daily_note: "[^"]*"/, `daily_note: "[[${target}]]"`)
      .replace(/\[\[[^\]]+\|Open today's Daily Note\]\]/g, `[[${target}|Open today's Daily Note]]`)
      .replace(/^created: "[^"]*"$/m, `created: "${formatDate(localDate(now), "YYYY-MM-DD")}T${formatTime(now, "HH:mm:ss")}"`);
  }

  return rendered;
}

function formatDate(dateString, format) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  const values = {
    YYYY: String(year),
    MMMM: date.toLocaleString("en-US", { month: "long" }),
    dddd: date.toLocaleString("en-US", { weekday: "long" }),
    MM: pad(month),
    DD: pad(day),
    D: String(day),
  };
  return format.replace(/dddd|MMMM|YYYY|MM|DD|D/g, (token) => values[token]);
}

function formatTime(date, format) {
  const values = {
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };
  return format.replace(/HH|mm|ss/g, (token) => values[token]);
}

function localDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}
async function ensureFolder(app, path) {
  if (!path || app.vault.getAbstractFileByPath(path)) return;
  const parent = path.slice(0, path.lastIndexOf("/"));
  if (parent) await ensureFolder(app, parent);
  await app.vault.createFolder(path);
}


async function showError(params, message, error) {
  const details = error instanceof Error ? `\n\n${error.message}` : "";
  if (params.quickAddApi?.infoDialog) {
    await params.quickAddApi.infoDialog("Journal Flow", `${message}${details}`);
  } else if (params.obsidian?.Notice) {
    new params.obsidian.Notice(`${message}${details}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```
