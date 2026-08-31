# Source Notes

Documentation checked on 2026-08-24.

## Installed QuickAdd provenance

- Release: [QuickAdd 2.23.0](https://github.com/chhoumann/quickadd/releases/tag/2.23.0)
- Install reason: required by the Journal Flow QuickAdd macros.
- `main.js` SHA-256: `accdb8c8baa8ca66831f4bfcdb008ad342bfefcda0da0ba27a1a00e31eeed3ae`
- `manifest.json` SHA-256: `648394b37751f374398a22adaf41f273531b9363484875b4c5de735969e2dd24`
- `styles.css` SHA-256: `7e986b1fd842ae9aa2cda92e0ce3e1796adb482adc3404b5adbd819eaac6967`
- Vault verification: 0 failures, 1 warning; the warning is the absent schema-sensitive `data.json`.
- Macro configuration and macOS/iOS UAT are not agent-applicable; both remain required in Obsidian.


- Obsidian Templates: https://obsidian.md/help/plugins/templates
  - Template folder configuration
  - `{{title}}`, `{{date}}`, and `{{time}}`
  - Moment.js format strings
  - Quoting variables in Properties
  - Inserting templates at the cursor

- Obsidian Daily notes: https://obsidian.md/help/plugins/daily-notes
  - Daily Note creation
  - Templates
  - Date-format subfolders

- QuickAdd for Obsidian: https://quickadd.obsidian.guide/docs/
  - Template, Capture, Macro, and User Script choices
  - Dynamic paths, same-folder creation, and created-file linking
  - Markdown-note user scripts for mobile workflows
  - User script API: https://quickadd.obsidian.guide/docs/UserScripts/

- Obsidian Unique note creator: https://obsidian.md/help/plugins/unique-note
  - Core command behavior retained as optional, but not required by this workflow

- Obsidian URI: https://obsidian.md/help/uri
  - Official `obsidian://new` and `obsidian://daily` actions
  - No official `obsidian://unique` action

- Obsidian Attachments: https://obsidian.md/help/attachments
  - Paste and drag-and-drop
  - Same-folder and current-folder-subfolder attachment settings

- Obsidian Search: https://obsidian.md/help/plugins/search
  - Property search
  - Task search
  - Embedded `query` blocks

- Obsidian Properties: https://obsidian.md/help/properties
  - YAML properties
  - Quoted internal links in text properties
  - `cssclasses`

- Obsidian Callouts: https://obsidian.md/help/callouts
  - Foldable callouts
  - Custom callout types and CSS variables

- Obsidian CSS snippets: https://obsidian.md/help/snippets
  - Snippet paths and activation on desktop/mobile

- Obsidian Word count: https://obsidian.md/help/plugins/word-count
  - Desktop status-bar and mobile-sidebar display

- Obsidian 1.13 public changelog: https://obsidian.md/changelog/2026-07-30-desktop-v1.13.4/
  - Current callout color syntax uses a normal CSS color value
  - Recent Unique Note URI fixes
