# Obsidian Check-in and Analyze Thought Flow

A core-plugin-only Obsidian journaling workflow modeled on the supplied iPhone screenshots.

## What this package provides

- A short **Check-in** inserted into the current Daily Note.
- A separate **Analyze Thought** guided-journal note launched from the Check-in.
- Date-scoped folders that keep the Daily Note, guided journals, and attachments together.
- An optional CSS snippet that gives the notes a restrained teal, card-based appearance on iPhone and macOS.
- No community plugins and no JavaScript.

## Recommended vault structure

```text
Journal/
└── 2026-08-13/
    ├── 2026-08-13 Journal.md
    ├── 2026-08-13 0746 Analyze Thought.md
    └── Attachments/
        └── pasted-image.png

Templates/
└── Journal/
    ├── Daily Note.md
    ├── Check-in.md
    └── Analyze Thought.md
```

This preserves the structure already present in the vault while making it systematic. Date-first filenames sort cleanly and remain easy to find with Alfred. The guided-journal type appears in the filename; moods, emotions, and optional titles remain inside notes rather than leaking into Finder or Alfred result names.

## Workflow

1. Open today's Daily Note.
2. Under **Check-ins**, insert `Templates/Journal/Check-in.md`.
3. Select a mood, emotions, and contributing areas; optionally add a reflection or image.
4. Select **Start Analyze Thought** when a difficult thought is contributing to the mood.
5. Complete the separate four-step guided journal and rate whether the feeling is worse, the same, or better.

## Core-only limitations

The core Templates plugin inserts static Markdown. It does not provide conditional branching, required-field validation, hidden wizard pages, automatic property updates, or clickable sentence-starter buttons. This package approximates the app flow with ordered sections, checkboxes, foldable callouts, a launch URI, and optional CSS.

Checkbox choices are ordinary Markdown tasks. The CSS snippet prevents completed choices from appearing struck through, but task-oriented searches or plugins may still treat them as tasks.

## Start here

Read [SETUP.md](SETUP.md), then copy the files from `Templates/Journal` and `Snippets` into the vault.
