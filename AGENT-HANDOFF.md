# Agent Handoff: Install the Obsidian Journal Flow

## Objective

Install the supplied core-plugin-only Check-in and Analyze Thought journaling workflow into the user's Obsidian vault without deleting or overwriting unrelated vault content.

## Vault

```text
$HOME/Documents/Obsidian
```

(`$HOME` evaluates automatically in terminal commands. For graphical file dialogs or Finder, replace `$HOME` with the active user's home path `~/` or `/Users/<username>`).

## Source package

Use the files in the `obsidian-journal-flow` package supplied with this prompt.

## Required work

1. Inspect the target vault and confirm the existing structure before changing anything.
2. Create `Templates/Journal/` if it does not exist.
3. Copy these files into it:
   - `Daily Note.md`
   - `Check-in.md`
   - `Analyze Thought.md`
4. Create `.obsidian/snippets/` if it does not exist.
5. Copy `journal-flow.css` into `.obsidian/snippets/`.
6. Preserve all existing files, including the current `Journal/2026-08-13/` notes.
7. Do not overwrite a same-named target file without first saving a timestamped backup and presenting the diff.
8. Do not edit undocumented Obsidian configuration JSON unless explicitly authorized. Instead, report the exact UI settings the user must apply from `SETUP.md`.
9. Validate that all copied Markdown files are intact, all YAML frontmatter is syntactically valid after template variables are treated as strings, and CSS braces are balanced.
10. Report the final tree, files changed, any conflicts, and the remaining manual settings.

## Target settings to report

### Templates

```text
Template folder location: Templates
Date format: YYYY-MM-DD
Time format: HH:mm
```

### Daily notes

```text
Date format: YYYY-MM-DD/YYYY-MM-DD [Journal]
New file location: Journal
Template file location: Templates/Journal/Daily Note
```

### Unique note creator

```text
New file location: Journal
Unique prefix format: YYYY-MM-DD/YYYY-MM-DD HHmm [Analyze Thought]
Template file location: Templates/Journal/Analyze Thought
```

### Attachments

```text
Default location for new attachments: In subfolder under current folder
Subfolder name: Attachments
```

### Appearance

```text
Reload CSS snippets and enable journal-flow
```

## Acceptance criteria

- Opening a new Daily Note creates `Journal/YYYY-MM-DD/YYYY-MM-DD Journal.md` from the supplied Daily Note template.
- Inserting the Check-in template adds a time-stamped check-in to that Daily Note.
- Selecting **Start Analyze Thought** invokes the configured Unique Note Creator.
- The guided note is created as `Journal/YYYY-MM-DD/YYYY-MM-DD HHmm Analyze Thought.md` and links to the Daily Note.
- Pasted or dragged attachments from either note are stored in `Journal/YYYY-MM-DD/Attachments/` after the documented attachment setting is applied.
- The CSS is optional; the workflow remains usable when it is disabled.
- No community plugin or JavaScript dependency is introduced.
