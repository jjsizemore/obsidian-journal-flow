# Agent Handoff: Install the Obsidian Daily Note and Journal Flow

## Objective

Install the cross-platform Daily Note and standalone journal-entry workflow into the user's Obsidian vault without deleting or overwriting unrelated vault content.

## Vault

The vault root is the exact folder opened in Obsidian. Obtain `app.vault.adapter.basePath` from the running Obsidian process, canonicalize it, and use that exact path. On iCloud this may be nested (for example `Documents/Default`); never infer a parent or child vault.

Before applying, enumerate and record `.obsidian` directories at the canonical path, every descendant, and every ancestor as separate vault candidates. A direct `<canonical-path>/.obsidian` is sufficient when runtime identity proves the path; stop only if runtime identity is unavailable, the direct `.obsidian` is absent, or the path cannot be proved. Follow the identity and authorization gates in `AGENTS.md`, then the restart/reload and verifier checks in `SETUP.md`.

## Required package layout

```text
Templates/
├── Daily Note.md
└── Journal/
    ├── Check-in.md
    ├── Practice Gratitude.md
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
6. Install QuickAdd from Obsidian's Community plugins; it is not bundled. The installer only copies the Journal Flow package; do not edit undocumented Obsidian configuration JSON.
7. Preserve existing `Daily/`, `Journal/`, and `Daily/*/journal/` notes and historical inline check-ins.
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
Date format: YYYY-MM-DD/YYYY-MM-DD [Daily]
New file location: Daily
Template file location: Templates/Daily Note
```

This produces:

```text
Daily/YYYY-MM-DD/YYYY-MM-DD Daily.md
```

### QuickAdd

```text
Macro: New Check-In
User script: Scripts/Journal Flow.md::checkIn

Macro: New Practice Gratitude
User script: Scripts/Journal Flow.md::practiceGratitude

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

Each day's Daily Note and journal attachments stay inside that day's folder:

```text
Daily/YYYY-MM-DD/Attachments/
Daily/YYYY-MM-DD/journal/Attachments/
```

### Appearance

```text
Reload CSS snippets and enable journal-flow
```

## Acceptance criteria

- Opening a new Daily Note creates `Daily/YYYY-MM-DD/YYYY-MM-DD Daily.md` from `Templates/Daily Note.md` (format `YYYY-MM-DD/YYYY-MM-DD [Daily]`).
- Daily Note creation does not create an empty `Daily/YYYY-MM-DD/journal/` folder.
- Running `New Check-In` creates a standalone `type: check-in` note under `Daily/YYYY-MM-DD/journal/`.
- Running `New Practice Gratitude` creates a standalone `type: guided-journal` / `journal: practice-gratitude` note under `Daily/YYYY-MM-DD/journal/`.
- Running `New Analyze Thought` creates a standalone `type: guided-journal` / `journal: analyze-thought` note under `Daily/YYYY-MM-DD/journal/`.
- Journal entries backlink to `Daily/YYYY-MM-DD/YYYY-MM-DD Daily` (format `YYYY-MM-DD/YYYY-MM-DD [Daily]`).
- Each entry receives exactly one canonical wikilink under the correct managed Daily Note Journal subtype heading.
- Missing managed headings are repaired without deleting existing Daily Note content.
- Retries offer unlinked existing entries and do not duplicate links.
- Date mismatches prompt between active, today's, and another Daily Note.
- A journal entry with a missing Daily Note backlink is preserved and reported, not relinked elsewhere.
- Existing Daily, Journal, and Daily journal date folders and notes remain untouched.
- The workflow works on macOS and iOS using the synced Markdown QuickAdd user script.
- The CSS is optional; the workflow remains usable when disabled.
