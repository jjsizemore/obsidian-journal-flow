# Setup: Obsidian Daily Note and Journal Flow

Designed for the vault at:

```text
iCloud Drive/obsidian
```

Open the top-level `obsidian` folder as the vault on both macOS and iOS. Keep `Daily`, `Journal`, `Templates`, and `Scripts` as subfolders of this vault; do not add them as separate vaults.

## 1. Copy the package files

Copy these folders into the vault:

```text
Templates/
├── Daily Note.md
└── Journal/
    ├── Check-in.md
    └── Analyze Thought.md

Scripts/
└── Journal Flow.md

Snippets/
└── journal-flow.css

Plugins/
└── journal-flow-click-guard/
    ├── manifest.json
    ├── main.js
    └── card-click-guard.js
```

The package also includes a `Vault Overlay` folder that mirrors these destinations.

Existing Journal notes remain in place:

```text
Journal/
└── 2026-08-13/
    ├── 2026-08-13 0742 Check-in.md
    └── 2026-08-13 Mindfulness.md
```

No migration is required. Historical notes and inline check-ins remain untouched.

## Agent-assisted installation

An agent can apply the allowlisted files and documented config changes:

```bash
node setup/install.mjs --vault "/path/to/vault" --dry-run
node setup/install.mjs --vault "/path/to/vault" --apply
node setup/verify.mjs --vault "/path/to/vault"
```

The installer creates a timestamped backup before replacing files or updating `daily-notes.json` / `community-plugins.json`. It preserves unknown config keys. It intentionally does not rewrite QuickAdd `data.json`; that schema-sensitive step is verified or reported for UI configuration. Read `AGENTS.md` and `setup/manifest.json` before automating installation.
## 2. Enable plugins

Enable these core plugins:

- Daily notes
- Templates
- Search
- Word count

Install and enable **QuickAdd** from Obsidian's Community plugins. QuickAdd is not bundled in this repository; the installer only installs the Journal Flow files and Click Guard plugin.

Enable **Journal Flow Click Guard** after installation. It is a local homebrewed plugin, so it never appears in the public Browse Community Plugins search; after running the installer or copying files, click **Reload plugins** (or restart Obsidian) and it appears under **Installed plugins**. It blocks primary clicks on journal card backgrounds in Live Preview so they do not focus the underlying Markdown editor. Checkboxes, radio-card labels, links, and other interactive controls remain usable. Use Ctrl+click (Cmd+click on macOS), Alt+click, or double-click to intentionally edit card text. The plugin has no effect in Reading view.

QuickAdd documentation: <https://quickadd.obsidian.guide/docs/>

## 3. Configure Templates

Under **Settings → Templates**:

```text
Template folder location: Templates
Date format: YYYY-MM-DD
Time format: HH:mm
```

The Daily Note is a general day-level template. Check-in and Analyze Thought are specialized journal-entry templates under `Templates/Journal`.

## 4. Configure Daily notes

Under **Settings → Daily notes**:

```text
Date format: YYYY-MM-DD/YYYY-MM-DD
New file location: Daily
Template file location: Templates/Daily Note
Open daily note on startup: optional
```

This produces:

```text
Daily/2026-08-13/2026-08-13.md
```

Creating a Daily Note does not create a Journal folder or Journal entry. The Journal folder is created only when a journal workflow runs.

The Daily Note contains general sections for Schedule, Activities, Journal, Thoughts, Notes, and Tasks. The Journal section contains managed Check-ins and Analyze Thoughts subsections. Obsidian headings are foldable on macOS and iOS.

## 5. Configure QuickAdd

Open **Settings → QuickAdd** and create two Macro choices. Enable each choice as an Obsidian command so it can receive a hotkey or be added to the mobile toolbar.

### New Check-in

Create a Macro choice named:

```text
New Check-in
```

Add a **User script** step pointing to:

```text
Scripts/Journal Flow.md::checkIn
```

### New Analyze Thought

Create a Macro choice named:

```text
New Analyze Thought
```

Add a **User script** step pointing to:

```text
Scripts/Journal Flow.md::analyzeThought
```

The script reads the selected Daily Note's date, creates the entry in:

```text
Journal/YYYY-MM-DD/
```

and adds one canonical link back to the Daily Note.

On iOS, keep the script in the Markdown note exactly as supplied. QuickAdd discovers the first `js` or `javascript` code block in that note.

Recommended hotkeys:

```text
New Check-in: Cmd/Ctrl+Shift+C
New Analyze Thought: Cmd/Ctrl+Shift+A
```

Choose any conflict-free keys that fit your existing setup.

## 6. Use the workflow

1. Open a Daily Note.
2. Run **New Check-in** or **New Analyze Thought** from the command palette, hotkey, or mobile toolbar.
3. The standalone note is created under `Journal/YYYY-MM-DD/`.
4. The Daily Note receives a canonical link under:

```text
## Journal
### Check-ins
### Analyze Thoughts
```

5. Complete the entry in its own note.

The link is persisted Markdown, not merely a live search result. Journal folders are created lazily on first journal entry creation.

## 7. Date and Daily Note selection

The script uses the active Daily Note as the target when its date matches the device clock.

If the active Daily Note date differs from the local clock date, QuickAdd asks whether to:

- Use the active Daily Note.
- Create/open today's Daily Note.
- Choose another Daily Note.

If today's Daily Note does not exist, the script creates it under `Daily/YYYY-MM-DD/`; it does not create `Journal/YYYY-MM-DD/` until the journal entry is actually created.

Opening an older Daily Note intentionally supports backdated entries.

If no Daily Note is active, the script offers to create/open today's Daily Note or select another existing Daily Note. If the active file is a journal entry whose `daily_note` target is missing, the script refuses to guess and reports the orphan target instead.

When macOS and iOS have different timezones, the device-local clock is used only to detect the mismatch. The selected Daily Note remains authoritative unless you choose today's note.

## 8. Link and recovery behavior

For every new entry, the script:

- Repairs missing `## Journal`, `### Check-ins`, or `### Analyze Thoughts` headings.
- Preserves subtitles and existing Daily Note content.
- Appends one canonical wikilink under the matching subtype.
- Avoids duplicate links by canonical note path.
- Adds a numeric filename suffix only when the timestamp/type filename already exists.
- Re-reads the Daily Note immediately before writing to reduce iCloud sync conflicts.
- Keeps the standalone note if Daily Note updating fails and reports an actionable retry.
- Does not guess a replacement when a journal entry's Daily Note backlink is missing.

Managed headings are intentionally stable. Rename them only if you also update the script's entry registry.

## 9. Configure attachments

Because Daily Notes and Journal entries are now in separate dated folders, **In subfolder under current folder** keeps their attachments separate:

```text
Daily/2026-08-13/Attachments/
Journal/2026-08-13/Attachments/
```

Under **Settings → Files & Links**:

```text
Default location for new attachments: In subfolder under current folder
Subfolder name: Attachments
Use Wikilinks: On
Automatically update internal links: On
```

This keeps general Daily Note media separate from journal-specific media.

## 10. Enable the CSS snippet

On macOS:

1. Open **Settings → Appearance → CSS snippets**.
2. Select **Reload snippets**.
3. Enable `journal-flow`.

On iOS:

1. Confirm `.obsidian/snippets/journal-flow.css` has synced.
2. Open **Settings → Appearance**.
3. Reload snippets and enable `journal-flow`.

The workflow remains usable without the snippet.

## 11. Complete Analyze Thought

The guided note contains:

1. The unhelpful thought.
2. Possible cognitive distortions.
3. A challenge to the thought.
4. A more balanced alternative thought.
5. A final Worse / Same / Better check.

When finished, change `status` from `in-progress` to `complete`.

## 12. Find entries

Useful filename searches:

```text
Check-in
Analyze Thought
2026-08-13 Journal
```

Useful Obsidian searches:

```text
path:"Journal" [type:check-in]
path:"Journal" [type:guided-journal]
path:"Journal/2026-08-13" [journal:analyze-thought]
task-done:"Catastrophizing"
task-done:"Stressed"
```

The Daily Note's persisted Journal links are the primary index. Search remains the recovery path for entries whose link update was interrupted.

## 13. Troubleshooting

### Daily Notes still use the old Journal path

Change the Daily Notes settings to:

```text
Date format: YYYY-MM-DD/YYYY-MM-DD
New file location: Daily
Template file location: Templates/Daily Note
```

Do not point Daily Notes at `Templates/Journal/Daily Note`; that file is obsolete.

### QuickAdd cannot find the script

Confirm the script path is exactly:

```text
Scripts/Journal Flow.md
```

For member-specific steps, use:

```text
Scripts/Journal Flow.md::checkIn
Scripts/Journal Flow.md::analyzeThought
```

The note must contain a `js` or `javascript` code block. Do not place it inside `.obsidian`.

### A Journal entry is created in the wrong folder

Open the intended Daily Note before running QuickAdd. The entry should be under:

```text
Journal/YYYY-MM-DD/
```

### The Daily Note link is missing

Run the same QuickAdd command again. The script preserves the existing entry, offers it as an unlinked note, and adds only the missing canonical link. If the Daily Note was moved or deleted, restore it or choose another Daily Note.

### Two devices show different dates

Use the mismatch prompt and choose the Daily Note that should own the entry. The selected Daily Note is authoritative.

### Template variables remain literal

Create Daily Notes through the Daily Notes core plugin and journal entries through QuickAdd. Do not copy raw template text into a note.
