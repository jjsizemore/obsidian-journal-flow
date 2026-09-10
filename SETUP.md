# Setup: Obsidian Daily Note and Journal Flow

Install from your laptop, then finish in Obsidian on iPhone. **This package does not sync notes.** It adds templates, a QuickAdd workflow, and a local plugin to an existing vault. Complete the six checkpoints below before treating setup as finished.

You need Obsidian on both devices, a working sync route, and [Node.js LTS](https://nodejs.org/) on the laptop only. Download and extract this repository, or use an existing checkout. In Terminal, enter its folder (the one containing `setup/install.mjs`), then check Node is available:

```bash
cd "/path/to/obsidian-journal-flow"
node --version
```

Replace example paths with your own and keep the quotes. Do not run Node or the installer on iPhone.

## 1. Choose one sync route

If your vault already syncs correctly to iPhone, keep that route. Do not create another vault just to install Journal Flow. If you are starting fresh, choose one:

### iCloud: Mac and iPhone

1. Enable iCloud Drive on both devices using the same Apple account.
2. In **Obsidian on iPhone**, create a vault with **Store in iCloud** enabled. This uses the app's **iCloud Drive → Obsidian → your vault** location.
3. On the Mac, open that existing vault folder in Obsidian. Use the **Obsidian** iCloud folder with the app icon, not a similarly named ordinary folder.
4. On macOS 15 or later, use Finder's **Keep Downloaded** for the Obsidian iCloud folder. On older macOS, review Apple's storage-optimization settings so vault files remain available locally.

For an existing iCloud vault, open it rather than creating a duplicate. Confirm it is in the location supported by Obsidian on iPhone; an arbitrary folder elsewhere in iCloud Drive is not sufficient. Follow the [official iCloud instructions](https://help.obsidian.md/sync-notes#iCloud) if it does not appear. Do not move or merge existing notes as part of this installer.

### Obsidian Sync: laptop and iPhone

1. Use an Obsidian account with an active **Obsidian Sync subscription**.
2. Keep the laptop's local vault outside iCloud, Dropbox, OneDrive, or another folder being synced by a different service.
3. Follow [Set up Obsidian Sync](https://help.obsidian.md/sync/setup) to connect the laptop vault to a remote vault.
4. On iPhone, choose **Setup Obsidian Sync** and connect to that same remote vault. Do not create a second remote vault with the same name.
5. On **each device**, review **Settings → Sync → Vault configuration sync**. Enable **Active community plugin list**, **Installed community plugin list**, and **Community plugin settings** so plugin files, enabled state, and QuickAdd macros can arrive. Include **Active core plugin list** and **Core plugin settings** for Daily notes. Enable **Themes and snippets** and **Appearance** if you want the optional styling.
6. Restart Obsidian after changing these settings, then allow sync to finish. Check for **Fully Synced** in the Sync log.

[Sync settings are device-specific](https://help.obsidian.md/sync/settings): turning a category on on the laptop does not turn it on on iPhone. Notes and the Markdown script syncing successfully do not prove plugin configuration has synced.

**Never use iCloud and Obsidian Sync on the same vault at the same time.** Sync is not a backup. Keep an independent backup of your notes; the installer only backs up files it replaces.

## 2. Prove the vault syncs in both directions

Before installing:

1. In the intended laptop vault, create a uniquely named temporary note, such as `Journal Flow sync check 2026-09-10`, containing `Written on laptop`.
2. Wait for sync, then open that note inside **Obsidian on iPhone**. Append `Edited on iPhone`.
3. Wait for sync again and confirm the iPhone edit appears in the laptop's note.

Stop here if either direction fails. Fix the chosen sync route before installing anything. Matching vault names are not proof; seeing the same note and edits on both devices is.

Keep `Daily`, `Journal`, `Templates`, and `Scripts` as subfolders of this one vault, not separate vaults. The installer targets the default `.obsidian` configuration folder. If **Settings → Files & Links → Override config folder** uses another folder on either device, stop and resolve that configuration before proceeding; do not assume files installed under `.obsidian` will be active.

## 3. Install once into the laptop's active vault

Follow the complete [active-vault identity gate in AGENTS.md](AGENTS.md#vault-identity-gate). The running Obsidian process, not Finder layout or an iCloud container name, is the source of truth.

1. Open the intended vault in Obsidian on the laptop.
2. Open its developer console: **Cmd+Option+I** on macOS, or **Ctrl+Shift+I** on Windows/Linux, then select **Console**. Run only this expression:

   ```js
   app.vault.adapter.basePath
   ```

3. Record the exact returned path, then canonicalize it from Terminal:

   ```bash
   node -e 'console.log(require("node:fs").realpathSync(process.argv[1]))' "<returned-active-vault-path>"
   ```

4. Record both raw and canonical paths and the ancestor/descendant `.obsidian` candidates required by `AGENTS.md`. An agent can perform that filesystem enumeration. Other roots are separate vaults, not automatic ambiguity when the exact runtime path has its own direct `.obsidian`. Never infer a parent vault from a child path, or a child vault from a parent path.
5. Run the dry-run from the repository folder:

   ```bash
   node setup/install.mjs --vault "<canonical-active-vault>" --dry-run
   ```

6. Review the complete plan **together with that exact canonical path**. It replaces the allowlisted workflow files and updates Daily Notes settings and the required community-plugin list. Only after showing this plan, obtain authorization repeating the exact canonical path. If the path or plan changes, repeat the gate and dry-run.
7. Apply only after that authorization:

   ```bash
   node setup/install.mjs --vault "<canonical-active-vault>" --apply
   ```

Record the apply result and backup location. The installer backs up existing files before replacing them, including `daily-notes.json` and `community-plugins.json`, and preserves unknown config keys. It does not delete or migrate existing `Daily/` or `Journal/` notes, historical inline check-ins, or unrelated vault content. It intentionally does not rewrite QuickAdd `data.json`; that remains UI configuration.

The [manifest](setup/manifest.json) is the source of truth for destinations. The installer, not manual folder copying, places files here:

| Package source | Destination inside the active vault |
| --- | --- |
| `Templates/Daily Note.md` | `Templates/Daily Note.md` |
| `Templates/Journal/Check-in.md` | `Templates/Journal/Check-in.md` |
| `Templates/Journal/Analyze Thought.md` | `Templates/Journal/Analyze Thought.md` |
| `Scripts/Journal Flow.md` | `Scripts/Journal Flow.md` |
| `Snippets/journal-flow.css` | `.obsidian/snippets/journal-flow.css` |
| `Plugins/journal-flow-click-guard/manifest.json` | `.obsidian/plugins/journal-flow-click-guard/manifest.json` |
| `Plugins/journal-flow-click-guard/main.js` | `.obsidian/plugins/journal-flow-click-guard/main.js` |
| `Plugins/journal-flow-click-guard/card-click-guard.js` | `.obsidian/plugins/journal-flow-click-guard/card-click-guard.js` |

The installer also merges `.obsidian/daily-notes.json` and `.obsidian/community-plugins.json`. Do not copy root-level `Snippets` or `Plugins` folders into your vault. The repository's `Vault Overlay` is a mirror, not a second installation route.

## 4. Finish plugins and QuickAdd on the laptop

Fully quit and reopen Obsidian after applying. Keep these core plugins enabled under **Settings → Core plugins**:

- Daily notes
- Templates
- Search
- Word count

Under **Settings → Community plugins**, enable community plugins if prompted, then use **Browse** to install and enable **QuickAdd**. QuickAdd is not bundled in this repository.

Enable **Journal Flow Click Guard** under **Installed plugins**. It is a local homebrewed plugin and never appears in public Community plugin search. If it is absent, check the installer result and restart Obsidian; do not search Browse for it.

In the laptop developer console, record both checks:

```js
app.plugins.enabledPlugins.has("journal-flow-click-guard")
Boolean(app.plugins.plugins["journal-flow-click-guard"])
```

Both must return `true`. This confirms the enabled list and loaded instance, rather than just plugin files on disk.

### Check Daily notes settings

The installer already configures **Settings → Daily notes**:

```text
Date format: YYYY-MM-DD/YYYY-MM-DD
New file location: Daily
Template file location: Templates/Daily Note
Open daily note on startup: optional
```

This produces `Daily/2026-08-13/2026-08-13.md`. Creating a Daily Note does not create a Journal folder or entry; the Journal folder is created only when a journal workflow runs.

The Daily Note contains Schedule, Activities, Journal, Thoughts, Notes, and Tasks. Its Journal section has managed Check-ins and Analyze Thoughts subsections. Obsidian headings are foldable on macOS and iOS.

### Configure two QuickAdd Macro choices

Open **Settings → QuickAdd**. For each row below, add a choice of type **Macro**, open its configuration, and add a **User script** step with the exact target shown. Enable each choice as an Obsidian command using its command/lightning-bolt control.

| Choice name | User script target |
| --- | --- |
| `New Check-in` | `Scripts/Journal Flow.md::checkIn` |
| `New Analyze Thought` | `Scripts/Journal Flow.md::analyzeThought` |

In the Macro Builder, **Browse** is QuickAdd's script picker, not a native file picker. You can enter the Markdown note's vault path with `::checkIn` or `::analyzeThought` to select the export. Keep the supplied note intact: QuickAdd runs its first `js` or `javascript` code block, including on iOS.

Open the command palette and confirm both choices are available. If not, enable them as commands in QuickAdd. Do not edit or replace `.obsidian/plugins/quickadd/data.json` to force setup; use the UI. See [QuickAdd user scripts](https://quickadd.obsidian.guide/docs/UserScripts/).

The script reads the selected Daily Note's date, creates the entry in `Journal/YYYY-MM-DD/`, and adds one canonical link in the Daily Note plus the entry's backlink.

Now run the local verifier and record its full output:

```bash
node setup/verify.mjs --vault "<canonical-active-vault>"
```

Resolve every reported failure and required manual step. A successful on-disk check is not proof of a loaded plugin, working macros, or iPhone readiness.

## 5. Finish setup on iPhone

1. Open the vault proved in step 2 and wait for the laptop changes to sync. Confirm the templates and `Scripts/Journal Flow.md` are present.
2. For Obsidian Sync, recheck the per-device plugin and configuration categories in step 1. For iCloud, confirm you opened the same app-managed vault, not a local duplicate.
3. Fully quit and reopen Obsidian on iPhone after plugin files/settings arrive.
4. Confirm the required core plugins, **QuickAdd**, and **Journal Flow Click Guard** are enabled. QuickAdd can be installed from Browse if needed; Click Guard must arrive from the laptop installation and appears only under Installed plugins.
5. Open the command palette and confirm **New Check-in** and **New Analyze Thought** are available. If the macros did not arrive, configure them through the QuickAdd UI exactly as in step 4; do not create another vault or rerun the installer on iPhone.

If a required plugin or script is missing, stop and repair sync before running the workflow. A synced note alone does not prove that the hidden `.obsidian` plugin files or settings arrived. Hotkeys, mobile-toolbar placement, and styling are optional and documented below.

## 6. Complete the laptop and iPhone acceptance check

Perform these checks yourself in the actual apps; an agent can guide you but **CLI verification cannot claim macOS or iOS UAT**.

1. On the laptop, use the **Daily notes** command to create/open today's note. Confirm it is under `Daily/YYYY-MM-DD/`.
2. Run **New Check-in** and **New Analyze Thought** from the command palette. Confirm each creates a standalone note under `Journal/YYYY-MM-DD/`, with one link in the matching Daily Note subsection and a backlink to the Daily Note.
3. Wait for sync. On iPhone, open that same Daily Note and follow both links. Confirm the entry contents match.
4. On iPhone, run both commands and confirm the same folder/link behavior for the new entries. Return to the laptop after sync and confirm both iPhone-created notes and their Daily Note links arrived.
5. In Live Preview on both devices, check that card backgrounds do not accidentally focus the editor while checkboxes, radio-card labels, and links still work. Confirm intentional editing remains possible. Click Guard does not affect Reading view.
6. Record the desktop and iPhone results separately. Once the round trip is proved, remove only the temporary sync-check note you created in step 2.

Setup is complete only after the identity/authorization/backup/restart evidence from `AGENTS.md`, verifier output, required UI configuration, and both device checks are recorded. Do not mark a missing check as passed. Wait for sync before switching devices; this workflow does not provide cross-device locking or replace backups.

## Optional: shortcuts and Templates preferences

Recommended desktop hotkeys, if conflict-free:

```text
New Check-in: Cmd/Ctrl+Shift+C
New Analyze Thought: Cmd/Ctrl+Shift+A
```

Assign them under **Settings → Hotkeys** after enabling the QuickAdd choices as commands. On iPhone, open **Settings → Mobile → Manage toolbar options**, scroll to **Add global command**, and add each command by name. The command palette remains available without either shortcut. See [Obsidian's mobile toolbar instructions](https://help.obsidian.md/mobile#Add%20command%20to%20mobile%20toolbar).

For manual template insertion, set **Settings → Templates** to:

```text
Template folder location: Templates
Date format: YYYY-MM-DD
Time format: HH:mm
```

The Daily Note is a general day-level template; Check-in and Analyze Thought are specialized journal-entry templates under `Templates/Journal`. For this workflow, create Daily Notes through Daily notes and entries through QuickAdd rather than inserting raw templates.

Click Guard blocks primary clicks on card backgrounds in Live Preview. Use Ctrl+click (Cmd+click on macOS), Alt+click, or double-click to intentionally edit card text. Checkboxes, radio-card labels, links, and other interactive controls remain usable. It has no effect in Reading view.

## Reference: use the workflow

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

## Reference: date and Daily Note selection

The script uses the active Daily Note as the target when its date matches the device clock.

If the active Daily Note date differs from the local clock date, QuickAdd asks whether to:

- Use the active Daily Note.
- Create/open today's Daily Note.
- Choose another Daily Note.

If today's Daily Note does not exist, the script creates it under `Daily/YYYY-MM-DD/`; it does not create `Journal/YYYY-MM-DD/` until the journal entry is actually created.

Opening an older Daily Note intentionally supports backdated entries.

If no Daily Note is active, the script offers to create/open today's Daily Note or select another existing Daily Note. If the active file is a journal entry whose `daily_note` target is missing, the script refuses to guess and reports the orphan target instead.

When macOS and iOS have different timezones, the device-local clock is used only to detect the mismatch. The selected Daily Note remains authoritative unless you choose today's note.

## Reference: link and recovery behavior

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

## Optional: configure attachments

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

## Optional: enable the CSS snippet

On macOS:

1. Open **Settings → Appearance → CSS snippets**.
2. Select **Reload snippets**.
3. Enable `journal-flow`.

On iOS:

1. Confirm `.obsidian/snippets/journal-flow.css` has synced.
2. Open **Settings → Appearance**.
3. Reload snippets and enable `journal-flow`.

The workflow remains usable without the snippet.

## Reference: complete Analyze Thought

The guided note contains:

1. The unhelpful thought.
2. Possible cognitive distortions.
3. A challenge to the thought.
4. A more balanced alternative thought.
5. A final Worse / Same / Better check.

When finished, change `status` from `in-progress` to `complete`.

## Reference: find entries

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

## Troubleshooting

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
