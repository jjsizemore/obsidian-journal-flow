# Obsidian Daily Note and Journal Flow

A cross-platform Obsidian workflow for a general Daily Note with standalone guided journal entries.

## Start here: laptop and iPhone

Follow [SETUP.md](SETUP.md) from the beginning. **This package does not sync notes.** First connect one vault across your devices using **iCloud** (Mac and iPhone) or **Obsidian Sync** (a paid subscription, including other laptop platforms). Never run both sync services on the same vault.

The setup guide walks you through six checkpoints:

1. Choose a sync route and open the same vault on both devices.
2. Prove a temporary note syncs in both directions.
3. Install once from the laptop into its proven active vault, after reviewing the dry-run and authorizing that exact path.
4. Install QuickAdd and configure the two commands in Obsidian.
5. Finish plugin and command setup on iPhone.
6. Create entries on both devices and verify their synced links.

Node.js is needed only on the laptop. You do not run the installer on iPhone or manually copy the repository folders into a vault. Agents must also follow the identity and authorization gate in [AGENTS.md](AGENTS.md); the destination allowlist is [setup/manifest.json](setup/manifest.json).

## What this package provides

- A general Daily Note with sections for schedule, activities, journal links, thoughts, notes, and tasks.
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

The Markdown user script is designed for macOS and iOS. Both devices need the plugin files, enabled plugins, and QuickAdd configuration as well as synced notes; the setup checklist verifies these separately.

## Plugins

Keep **Daily notes**, **Templates**, **Search**, and **Word count** enabled. Install and enable **QuickAdd** from Community plugins, then configure the two macros documented in [SETUP.md](SETUP.md). Enable **Journal Flow Click Guard** under **Installed plugins** (it is a local homebrewed plugin that never appears in public Community search; restart Obsidian after installation) to prevent accidental Live Preview edits when clicking card backgrounds.
