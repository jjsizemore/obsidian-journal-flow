# Agent setup

When asked to install or configure this workflow in an Obsidian vault:

1. Read `setup/manifest.json` and `SETUP.md` before changing files.
2. Require an explicit vault path when discovery finds zero or multiple candidates.
3. Run `node setup/install.mjs --vault <path> --dry-run` first and show the planned file/config changes.
4. Apply only after the user authorizes the dry-run. Use `--apply`; it creates a timestamped backup before replacing files.
5. The manifest is the source of truth for source-to-vault destinations. Do not infer destinations from filenames.
6. Update `.obsidian/daily-notes.json` and `.obsidian/community-plugins.json` only under their manifest backup policies.
7. Never rewrite QuickAdd `data.json` unless the exact installed schema is verified. Report missing macros as a UI step instead.
8. Never delete or migrate existing `Daily/` or `Journal/` notes. Report obsolete templates or unexpected vault changes.
9. Run `node setup/verify.mjs --vault <path>` after installation and report every manual step it returns.
10. Do not claim macOS/iOS UAT; ask the user to perform it.

The installer changes only the manifest allowlist and documented config files. It never edits workspace state, credentials, or unrelated vault content.

After every repository change, run the repo-local `auditing-agent-installation-guidance` skill before closeout. Record its applicability decision and proof bundle; stop on any blocking contradiction or unproven safety claim.
