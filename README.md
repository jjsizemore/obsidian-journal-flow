# Obsidian Daily Note and Journal Flow

A cross-platform Obsidian workflow for a general Daily Note with standalone guided journal entries.

## What this package provides

- A general Daily Note with sections for schedule, activities, journal links, thoughts, notes, and tasks.
- Standalone **Check-in** and **Analyze Thought** notes stored under dated `Journal` folders.
- Persisted canonical links from each Daily Note to its journal entries.
- A QuickAdd workflow that runs on macOS and iOS.
- Date-scoped folders that keep general and journal-specific attachments separate.
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

The same commands and synced Markdown user script work on macOS and iOS.

## Plugins

Keep **Daily notes**, **Templates**, **Search**, and **Word count** enabled. Install and enable **QuickAdd**, then configure the two macros documented in [SETUP.md](SETUP.md).

## Agent-assisted installation

Read `AGENTS.md` and `setup/manifest.json`, then run:

```bash
node setup/install.mjs --vault "/path/to/vault" --dry-run
node setup/install.mjs --vault "/path/to/vault" --apply
node setup/verify.mjs --vault "/path/to/vault"
```

The installer backs up and merges documented config files. QuickAdd `data.json` remains a schema-sensitive UI step unless an approved schema is available.

## Start here

Read [SETUP.md](SETUP.md), then copy `Templates`, `Scripts`, and `Snippets` into the vault.
