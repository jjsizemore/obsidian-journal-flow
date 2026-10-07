# Journal workflow design

Implemented repository contract for the consolidated Daily layout, gratitude
journal, and Check-In recommendations. No existing vault notes are migrated.

## 1. Consolidated Daily folders

```text
Daily/
└── YYYY-MM-DD/
    ├── YYYY-MM-DD Daily.md
    └── journal/
        ├── YYYY-MM-DD Check-In.md
        ├── YYYY-MM-DD Check-In 2.md
        ├── YYYY-MM-DD Practice Gratitude.md
        └── YYYY-MM-DD Analyze Thought.md
```

- `Daily` contains only date folders.
- Each date folder contains a Daily Note; the lowercase `journal` subfolder is created lazily by the first guided entry.
- All Daily, Check-In, Practice Gratitude, and Analyze Thought note titles
  begin with `YYYY-MM-DD {note_type}`. Repeats use clean numbered suffixes
  (`Check-In 2`, not time suffixes); creation time remains in properties.
- Existing notes are in scope for cleanup, but only through a separate,
  backed-up, user-performed migration inside Obsidian with link verification.
  The installer must not delete or migrate notes.

Recommendation accepted: consolidate everything under `Daily` date folders and
retain lowercase `journal`.

## 2. Practice Gratitude

- Canonical name: **Practice Gratitude**.
- `Mindfulness` is rejected for this journal because naming is ambiguous and
  mindfulness is a different practice.
- The note contains the single prompt: “What are you grateful for?”
- Free-text response, including paragraphs or lists.
- No required item count and no second prompt.

Recommendation accepted: replace “Mindfulness” with “Practice Gratitude.”

## 3. Check-In recommendations

```text
Good / Great → featured: Practice Gratitude; alternative: Analyze Thought
Very bad / Bad / Okay → featured: Analyze Thought; alternative: Practice Gratitude
```

- “Okay” routes with the lower three moods, but “Okay” is not described as
  negative.
- Mood guides, not restricts; stopping after the Check-In is valid.
- The recommendation section lives at the end of the Check-In.
- Presentation is static guidance text, not an immediate automatic update.
  Automatic bottom-of-note updates would require new runtime behavior beyond
  the current Markdown template and creation-focused QuickAdd script.
- Markdown checkboxes cannot enforce exactly one mood. Static neutral guidance
  asks for one mood when none or multiple are selected; the user follows the
  matching recommendation once exactly one mood is selected.

Delivery scope: mood-based, non-restrictive, static end-of-note guidance.
Checking a mood does not automatically change or hide the footer text.

## 4. Implementation and manual boundaries

- Daily detection, lookup/creation, journal file creation, unlinked-entry
  matching, template backlinks, and the Daily Notes date format use the new
  consolidated layout.
- Practice Gratitude has its own entry type, template, Daily section, and
  QuickAdd macro; it contains one free-text prompt.
- Installer/config merges preserve unknown keys and back up replacements.
- Existing notes require a separate backed-up, user-performed migration
  inside Obsidian, including link verification.
- QuickAdd command setup, full app reload, macOS/iOS UAT, and sync acceptance
  remain manual. Live checkbox-driven recommendations are not implemented.
