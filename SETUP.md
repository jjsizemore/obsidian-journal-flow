# Setup: Obsidian Check-in and Analyze Thought Flow

Designed for the vault at:

```text
iCloud Drive/obsidian
```

Select the top-level `obsidian` folder from iCloud Drive when opening the vault in Obsidian. On iOS, use the iCloud Drive picker rather than a macOS filesystem path. `Journal` and `Templates` must remain subfolders of this vault; do not add either one as a separate vault.

The registered vault name shown by Obsidian is `Obsidian`. The folder name is `obsidian`, but URI links must use the registered vault name. If the vault name changes, replace `vault=Obsidian` in `Templates/Journal/Check-in.md` and the mirrored copy under `Vault Overlay/Templates/Journal/`.

## 1. Copy the package files

Copy:

```text
Templates/Journal/Daily Note.md
Templates/Journal/Check-in.md
Templates/Journal/Analyze Thought.md
```

into the vault:

```text
iCloud Drive/obsidian/Templates/Journal/
```

Copy:

```text
Snippets/journal-flow.css
```

into the vault:

```text
iCloud Drive/obsidian/.obsidian/snippets/journal-flow.css
```

The package also includes a `Vault Overlay` folder that mirrors these destinations.

Your existing folder is already compatible:

```text
Journal/
└── 2026-08-13/
    ├── 2026-08-13 Journal.md
    └── 2026-08-13 Mindfulness.md
```

No migration is required. Existing notes can remain where they are.

## 2. Enable the core plugins

Under **Settings → Core plugins**, enable:

- Templates
- Daily notes
- Unique note creator
- Search
- Word count

No community plugin or JavaScript is required.

## 3. Configure Templates

Under **Settings → Templates**:

```text
Template folder location: Templates
Date format: YYYY-MM-DD
Time format: HH:mm
```

The template properties quote date and time variables so that Live Preview does not overwrite unresolved variables while the template files are being edited.

## 4. Configure Daily notes

Under **Settings → Daily notes**:

```text
Date format: YYYY-MM-DD/YYYY-MM-DD [Journal]
New file location: Journal
Template file location: Templates/Journal/Daily Note
Open daily note on startup: optional
```

This produces:

```text
Journal/2026-08-13/2026-08-13 Journal.md
```

## 5. Configure Unique note creator

Under **Settings → Unique note creator**:

```text
New file location: Journal
Unique prefix format: YYYY-MM-DD/YYYY-MM-DD HHmm [Analyze Thought]
Template file location: Templates/Journal/Analyze Thought
```

This produces:

```text
Journal/2026-08-13/2026-08-13 0746 Analyze Thought.md
```

Open today's Daily Note before launching Analyze Thought. That creates the date folder first and ensures the Daily Note backlink resolves immediately.

The Check-in template launches the configured Unique Note Creator with:

```text
obsidian://unique?vault=Obsidian
```

If the link does not create the guided note, verify the three Unique Note Creator settings above and run **Create new unique note** from the command palette once.

## 6. Configure date-scoped attachments

Under **Settings → Files & Links**:

```text
Default location for new attachments: In subfolder under current folder
Subfolder name: Attachments
```

Because the Daily Note and Analyze Thought note are stored in the same date folder, pasted or dragged attachments from either note are stored here:

```text
Journal/2026-08-13/Attachments/
```

This keeps each day's notes and media together without mixing attachments into the note list.

Recommended related settings:

```text
New link format: Shortest path when possible
Automatically update internal links: On
Use Wikilinks: On
```

## 7. Enable the CSS snippet

On macOS:

1. Open **Settings → Appearance → CSS snippets**.
2. Select **Reload snippets**.
3. Enable `journal-flow`.

On iPhone:

1. Confirm `.obsidian/snippets/journal-flow.css` has synced to the vault.
2. Open **Settings → Appearance**.
3. Reload snippets and enable `journal-flow`.

The templates work without the snippet; the snippet only improves presentation and mobile spacing.

## 8. Create and use a Check-in

1. Run **Open today's daily note**.
2. Put the cursor on a blank line under `## Check-ins`.
3. Run **Templates: Insert template**.
4. Choose `Journal/Check-in`.
5. Check the choices that apply and write only as much as is useful.
6. Select **Start Analyze Thought** when relevant.

On iPhone, use the command palette or add **Insert template** to the mobile toolbar for quicker access.

## 9. Complete Analyze Thought

The guided note contains:

1. The unhelpful thought.
2. Possible cognitive distortions.
3. A challenge to the thought.
4. A more balanced alternative thought.
5. A final Worse / Same / Better check.

When finished, change the `status` property from `in-progress` to `complete`. This is intentionally manual because core Templates cannot update a property in response to a body checkbox.

The Word Count core plugin shows the active note's count in the macOS status bar and the iPhone right sidebar. The template does not duplicate that value in the note.

## 10. Find entries with Obsidian or Alfred

Useful filename searches:

```text
Analyze Thought
2026-08-13 Analyze Thought
2026-08-13 Journal
```

Useful Obsidian searches:

```text
path:"Journal" [type:guided-journal]
path:"Journal/2026-08-13" [type:guided-journal]
task-done:"Catastrophizing"
task-done:"Stressed"
```

The Daily Note template embeds a live search for guided journals in that date's folder.

## 11. Troubleshooting

### The launch link opens the wrong vault

Replace this in `Templates/Journal/Check-in.md`:

```text
vault=Obsidian
```

with the exact vault name or vault ID shown by Obsidian.

### Analyze Thought is created outside the date folder

Recheck:

```text
New file location: Journal
Unique prefix format: YYYY-MM-DD/YYYY-MM-DD HHmm [Analyze Thought]
```

Then open today's Daily Note before creating the unique note.

### The template variables remain literal

Create notes through Daily Notes, Unique Note Creator, or **Templates: Insert template**. Copying the raw template text into a note does not invoke the template processor.

### The CSS is not visible

Confirm the file is exactly:

```text
iCloud Drive/obsidian/.obsidian/snippets/journal-flow.css
```

Then reload snippets and enable it under Appearance.

### Checked emotions appear in task searches

That is expected for core-only Markdown checkboxes. Scope ordinary task searches away from `Journal`, or exclude `Journal` within any task-management plugin added later.
