# Agent setup

When asked to install or configure this workflow in an Obsidian vault:

1. Read `setup/manifest.json` and `SETUP.md` before changing files.

## Vault identity gate

The running Obsidian process is the source of truth for the vault path. Before any vault apply:

1. Have the user run `app.vault.adapter.basePath` in the running Obsidian developer console and provide the exact returned path. Do not infer a parent vault from a child path, or a child vault from a parent path.
2. Resolve and normalize that returned path canonically (for example, `python3 -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "<returned-path>"`). Record both the raw value and canonical result.
3. Enumerate `.obsidian` directories at the canonical path, every descendant, and every ancestor, and record the candidates. If `<canonical-path>/.obsidian` exists and the canonical path came from the running process, ancestor/descendant roots are separate vaults, not automatic ambiguity. Stop only when runtime identity is unavailable, the exact path lacks direct `.obsidian`, or the path cannot be proved; never infer a parent or child vault.
4. Run `node setup/install.mjs --vault "<canonical-path>" --dry-run` and show its complete plan, including the exact canonical path.
5. Obtain authorization only after showing that dry-run. The authorization must repeat the exact canonical path. If the path or plan changes, return to step 2 and run a new dry-run.

Only after that gate:

6. Apply with `node setup/install.mjs --vault "<canonical-path>" --apply`; it creates a timestamped backup before replacing files.
7. Fully quit and reopen Obsidian (or use the complete plugin reload flow) before validation. Confirm **Settings → Community plugins → Installed plugins** shows `journal-flow-click-guard` enabled.
8. In the running Obsidian developer console, show:

```js
app.plugins.enabledPlugins.has("journal-flow-click-guard")
Boolean(app.plugins.plugins["journal-flow-click-guard"])
```

Both results must be `true`. Then run `node setup/verify.mjs --vault "<canonical-path>"` and report every manual step it returns.

The installation is complete only when the raw and canonical running-vault paths, candidate enumeration, shown dry-run, path-repeating authorization, apply/backup result, full restart/reload, Installed plugins confirmation, both registry results, and verifier output are recorded. A missing item is incomplete, not an invitation to infer.

## Installation invariants

9. Require an explicit vault path and stop when runtime identity is unavailable, the exact path lacks direct `.obsidian`, or the path cannot be proved.
10. The manifest is the source of truth for source-to-vault destinations. Do not infer destinations from filenames.
11. Update `.obsidian/daily-notes.json` and `.obsidian/community-plugins.json` only under their manifest backup policies.
12. Never rewrite QuickAdd `data.json` unless the exact installed schema is verified. Report missing macros as a UI step instead.
13. Never delete or migrate existing `Daily/` or `Journal/` notes. Report obsolete templates or unexpected vault changes.
14. Do not claim macOS/iOS UAT; ask the user to perform it.

The installer changes only the manifest allowlist and documented config files. It never edits workspace state, credentials, or unrelated vault content.

After every repository change, run the repo-local `auditing-agent-installation-guidance` skill before closeout. Record its applicability decision and proof bundle; stop on any blocking contradiction or unproven safety claim.
