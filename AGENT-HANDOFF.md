# Agent Handoff: Install the Obsidian Daily Note and Journal Flow

## Objective

Install the cross-platform Daily Note and standalone journal-entry workflow into the user's Obsidian vault without deleting or overwriting unrelated vault content.

## Vault

```text
iCloud Drive/obsidian
```

Select the top-level `obsidian` folder when opening the vault. `Daily`, `Journal`, `Templates`, and `Scripts` are subfolders, not separate vaults. A macOS shell may expose the same folder through a private iCloud filesystem path, but that is not the path to enter in Obsidian or iOS.

## Required package layout

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
```

## Required work

1. Inspect the target vault and confirm the existing structure before changing anything.
2. Install `Templates/Daily Note.md` at `Templates/Daily Note.md`.
3. Install specialized templates under `Templates/Journal/`.
4. Install `Scripts/Journal Flow.md` under `Scripts/`.
5. Create `.obsidian/snippets/` if needed and install `journal-flow.css`.
6. Install QuickAdd under `.obsidian/plugins/quickadd/` if permitted; do not edit undocumented Obsidian configuration JSON.
7. Preserve existing `Journal/YYYY-MM-DD/` notes and historical inline check-ins.
8. Back up conflicting target files before replacement.
9. Validate Markdown frontmatter, script syntax, mirror parity, and CSS braces.
10. Report remaining UI settings and macOS/iOS UAT steps.

## Target settings to report

### Templates

```text
Template folder location: Templates
Date format: YYYY-MM-DD
Time format: HH:mm
```

### Daily notes

```text
Date format: YYYY-MM-DD/YYYY-MM-DD
New file location: Daily
Template file location: Templates/Daily Note
```

This produces:

```text
Daily/YYYY-MM-DD/YYYY-MM-DD.md
```

### QuickAdd

```text
Macro: New Check-in
User script: Scripts/Journal Flow.md::checkIn

Macro: New Analyze Thought
User script: Scripts/Journal Flow.md::analyzeThought
```

### Attachments

```text
Default location for new attachments: In subfolder under current folder
Subfolder name: Attachments
Use Wikilinks: On
Automatically update internal links: On
```

Daily and Journal attachments are intentionally separate:

```text
Daily/YYYY-MM-DD/Attachments/
Journal/YYYY-MM-DD/Attachments/
```

### Appearance

```text
Reload CSS snippets and enable journal-flow
```

## Acceptance criteria

- Opening a new Daily Note creates `Daily/YYYY-MM-DD/YYYY-MM-DD.md` from `Templates/Daily Note.md`.
- Daily Note creation does not create an empty `Journal/YYYY-MM-DD/` folder.
- Running `New Check-in` creates a standalone `type: check-in` note under `Journal/YYYY-MM-DD/`.
- Running `New Analyze Thought` creates a standalone `type: guided-journal` / `journal: analyze-thought` note under `Journal/YYYY-MM-DD/`.
- Journal entries backlink to `Daily/YYYY-MM-DD/YYYY-MM-DD`.
- Each entry receives exactly one canonical wikilink under the correct managed Daily Note Journal subtype heading.
- Missing managed headings are repaired without deleting existing Daily Note content.
- Retries offer unlinked existing entries and do not duplicate links.
- Date mismatches prompt between active, today's, and another Daily Note.
- A journal entry with a missing Daily Note backlink is preserved and reported, not relinked elsewhere.
- Existing Journal date folders and notes remain untouched.
- The workflow works on macOS and iOS using the synced Markdown QuickAdd user script.
- The CSS is optional; the workflow remains usable when disabled.
