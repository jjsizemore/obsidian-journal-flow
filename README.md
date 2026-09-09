# Obsidian Daily Note and Journal Flow

A cross-platform Obsidian workflow for a general Daily Note with standalone guided journal entries.

## What this package provides

- A general Daily Note organized by **Tasks → Notes → Journal**; add a **Schedule** heading after Tasks when needed, with activities/thoughts grouped under Notes.
- Standalone **Check-in** and **Analyze Thought** notes stored under dated `Journal` folders.
- Persisted canonical links from each Daily Note to its journal entries.
- A QuickAdd workflow that runs on macOS and iOS.
- The Click Guard plugin prevents accidental Live Preview edits on card backgrounds while preserving controls, labels, and links. Use Ctrl+click (Cmd+click on macOS), Alt+click, or double-click to intentionally edit card text.
- An optional CSS snippet for a restrained teal, card-based appearance.

## Recommended vault structure

```text
Daily/
└── 2026-08-13/
    └── 2026-08-13.md

Journal/
└── 2026-08-13/
    ├── 2026-08-13 0742 Check-in.md
    └── 2026-08-13 0746 Analyze Thought.md

Templates/
├── Daily Note.md
└── Journal/
    ├── Check-in.md
    └── Analyze Thought.md
```

The Daily Note is the general day-level workspace. Journal entries are specialized child notes in a separate domain folder. The Journal folder is created lazily when the first journal workflow runs.

## Workflow

1. Open today's Daily Note.
2. Run the `New Check-in` or `New Analyze Thought` QuickAdd command.
3. The standalone entry is created under `Journal/YYYY-MM-DD/`.
4. The Daily Note receives one canonical link under the matching subtype heading.
5. If the active note's date differs from the clock date, choose whether to use the active note or create/open today's Daily Note.

The same commands and synced Markdown user script work on macOS and iOS. Guided commands are available through the existing command palette, custom hotkeys, or the mobile toolbar; the Daily Note does not require or provide executable button cards.

## Plugins

Keep **Daily notes**, **Templates**, **Search**, and **Word count** enabled. Install and enable **QuickAdd** from Community plugins, then configure the two macros documented in [SETUP.md](SETUP.md). Enable **Journal Flow Click Guard** under **Installed plugins** (it is a local homebrewed plugin that never appears in public Community search; reload plugins after copying) to prevent accidental Live Preview edits when clicking card backgrounds.

## Agent-assisted installation

Read `AGENTS.md` and `setup/manifest.json`. Get the exact active-vault path from the running Obsidian console with `app.vault.adapter.basePath`, canonicalize it, and never infer a parent or child vault. Enumerate and record ancestor/descendant `.obsidian` roots as separate candidates; with runtime identity and direct `<canonical-active-vault>/.obsidian` present, do not stop merely because other roots exist. Stop only when runtime identity is unavailable, the direct config is absent, or the path cannot be proved.

Show the complete dry-run, then obtain authorization repeating that exact canonical path before applying:

```bash
node setup/install.mjs --vault "<canonical-active-vault>" --dry-run
node setup/install.mjs --vault "<canonical-active-vault>" --apply
node setup/verify.mjs --vault "<canonical-active-vault>"
```

After apply, fully restart/reload Obsidian, confirm Click Guard under Installed plugins and with the developer-console registry checks in `AGENTS.md`. QuickAdd `data.json` remains a schema-sensitive UI step unless an approved schema is available.

## Start here

Read [SETUP.md](SETUP.md) for verified-vault installation and the manifest-authoritative destination instructions.
