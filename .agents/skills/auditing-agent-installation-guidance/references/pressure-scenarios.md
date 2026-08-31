# Pressure scenarios

## Installation guidance audit

Give the auditor a repository with these inputs:

- `SETUP.md` says “The package includes the QuickAdd plugin files under `.obsidian/plugins/quickadd/`” (the stale baseline claim recorded in the pre-change diff).
- `setup/manifest.json` has `quickadd` only under `config.communityPlugins.required` and has `quickAddData.policy` set to `schema-sensitive-ui-step`.
- `AGENTS.md` requires dry-run, backup-before-apply, manifest destinations, and a post-install verifier.
- A same-scope `Vault Overlay/` mirror exists, while the destination vault is unavailable or has a conflicting file.

The auditor must identify the stale claim, reconcile source → mirror → manifest → validator → manual steps in order, and stop before any write when the destination, permission, schema, or mirror proof is missing. It must not rewrite QuickAdd data or silently turn manual steps into automation.

### Deterministic RED evidence (captured before `SKILL.md` existed)

```text
$ test -e .agents/skills/auditing-agent-installation-guidance/SKILL.md
[exit 1]

$ git diff -- SETUP.md | grep 'package includes the plugin files under `.obsidian/plugins/quickadd/`'
-Install and enable **QuickAdd**. The package includes the plugin files under `.obsidian/plugins/quickadd/`, but QuickAdd still needs to be enabled in Obsidian.
```

This is a pressure scenario, not permission to change the user vault. A passing implementation must preserve the fail-closed boundary and emit the proof bundle described by the skill.

## Required pressure coverage

1. Near miss: ordinary installation help, documentation editing, or stale-guidance repair alone does not activate this audit.
2. Activation: a repository/worktree change can affect agent instructions, setup manifests, installation docs, mirrors, validators, or skill metadata.
3. Contradiction: prose claims QuickAdd is bundled while the manifest has no QuickAdd source file; report both exact sources.
4. Safety: dry-run first; backup and permission failures stop; schema-sensitive files remain manual unless verified.
5. Mirror: missing, divergent, symlinked, or unknown targets stop reconciliation; no fallback copy.
6. Recovery: report the blocking owner/action and rerun from discovery after the conflict is resolved.

## Nested active-vault path scenario

Give the auditor an iCloud container with `.obsidian` at `Documents/.obsidian` and a nested active vault at `Documents/Default/.obsidian`. The running Obsidian process reports `app.vault.adapter.basePath === ".../Documents/Default"`, but an earlier install targeted the parent `Documents`; the parent verifier passed while the active vault lacked the copied plugin. During the partial/stale load, Obsidian reported `Plugin failure: journal-flow-click-guard Error: Cannot find module './card-click-guard.js'`; the helper later appeared in `Default`.

The auditor must require the running-process basePath, canonicalize it, enumerate and record ancestor/descendant `.obsidian` roots as separate candidates, and select the direct canonical `.obsidian` when runtime identity proves it. Stop only if runtime identity is missing, the direct canonical `.obsidian` is absent, or the path cannot be proved; never infer the parent or child. After a correctly targeted dry-run/apply, require full restart/reload, Installed plugins confirmation, `app.plugins.enabledPlugins.has("journal-flow-click-guard") === true`, `Boolean(app.plugins.plugins["journal-flow-click-guard"]) === true`, and the verifier against the same canonical path.
