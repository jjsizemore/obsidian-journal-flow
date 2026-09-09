---
name: auditing-agent-installation-guidance
description: Audit installation guidance in a SyncVia repository checkout after repository changes that can affect agent instructions, setup manifests, installation docs, mirrors, validators, or skill metadata.
---

# Auditing agent installation guidance

## Purpose

Keep repository instructions, installation manifests, implementation, mirrors, validators, and manual steps truthful as one installation contract. Run this audit after **every repository change** before closeout. A change with no installation impact still receives an explicit `not applicable` decision in the proof bundle.

This skill audits guidance. It does not install into a vault, edit a vault, or repair stale guidance itself.

## Activation boundary

Activate when any repository change (tracked, untracked, staged, or working-tree) may affect, or claims to affect:

- `AGENTS.md`, `CLAUDE.md`, `.github/instructions/`, provider instructions, prompts, routing, or other agent context;
- `SETUP.md`, `README.md`, handoffs, runbooks, onboarding, or installation/troubleshooting docs;
- a setup/install manifest, package manifest, allowlist, destination map, plugin manifest, config policy, or schema declaration;
- an installer, verifier, validator, test, CI check, skill, skill index, lockfile, metadata, or configured mirror;
- a source file copied by installation, a same-scope overlay/mirror, or a documented manual step.

For all other repository changes, activate the lightweight path: discover the changed-file set, state why installation guidance is unaffected, and retain that decision in the proof bundle. Do not silently omit the audit.

### Near misses: do not activate this skill alone

- answering a question without changing repository state;
- operating on the user vault or performing a normal installation (follow the repository's installation rules instead);
- repairing a proven stale instruction, prompt, or skill (invoke `updating-stale-agent-guidance`; return here for the post-repair audit);
- generic code review, formatting, dependency upgrades, or release work with no setup/guidance/manifest/mirror/validator/metadata impact (still use the lightweight applicability path);
- inventing a metadata generator, mirror, alias, compatibility shim, or undocumented destination.

If both a near miss and an activation condition apply, activation wins.

## Required discovery (do not ask the user to supply repository facts)

Work from the repository root and discover these inputs yourself. Record paths, existence, and content or byte hashes where useful:

1. **Change scope:** repository root, current worktree, branch/revision, staged and unstaged diff, untracked files, and relevant ignore rules. Preserve unrelated dirty changes. Do not inspect or modify a user vault.
2. **Instructions:** nearest and root `AGENTS.md`/`CLAUDE.md`, `.github/instructions/`, provider entrypoints, and any referenced instruction files. User-global guidance is read-only context; never modify it.
3. **Installation guidance:** setup/readme/handoff/runbook documents and every link or path they name. Include claims about what is bundled, copied, enabled, backed up, or left to a human.
4. **Manifests and metadata:** setup/installation manifests, package manifests, plugin manifests, schema/version declarations, skill frontmatter, local skill index, lockfile, and metadata registry. Use only registries and generators that already exist; if absent, record `not configured` rather than creating one.
5. **Source and destinations:** manifest `sourceRoot`, each source file, normalized destination, destination policy, allowlists, config merges, backup policy, and path containment. Treat the manifest as authoritative for copy destinations; never infer from filenames.
6. **Mirrors:** same-scope overlays, generated/canonical copies, directory links, symlinks, and other configured mirror targets. Record realpath, link status, existence, and byte hash. A symlink in the mirror root or any source-path component is a conflict unless the governing leaf explicitly permits it.
7. **Implementation and validators:** installer dry-run/apply behavior, verifier, tests, CI commands, schema checks, and their exact invocation. Confirm every claimed safeguard is actually exercised.
8. **Manual steps:** required plugin installation/enabling, UI configuration, hotkeys, reloads, platform UAT, schema-sensitive actions, credentials, and any step the agent cannot safely perform.
9. **Active-vault proof:** before any apply, require `app.vault.adapter.basePath` from the running Obsidian process, canonicalize it, enumerate ancestor/descendant `.obsidian` roots, and record them as separate vault candidates. Stop only when runtime identity is unavailable, the exact path lacks direct `.obsidian`, or the path cannot be proved. Never infer a parent or child vault.

## Ordered audit

### 1. Establish the boundary

Snapshot the changed-file set before reading or editing. Decide `activated` or `not applicable` using the boundary above. If this change itself edits guidance, its audit is mandatory. This skill never authorizes a vault write.

### 2. Build a source map

For each discovered statement or artifact, record its role: canonical instruction, manifest, implementation, validator, mirror, metadata, or manual step. Prefer the repository's declared canonical source. Do not treat a mirror or copied prose as authoritative merely because it is present.

### 3. Reconcile source to destination, in order

Reconcile, without skipping ahead, in this order:
Active-vault proof is a prerequisite to destination reconciliation and any apply: record the raw `app.vault.adapter.basePath`, canonical path, candidate `.obsidian` roots, exact dry-run path/plan, and path-repeating authorization. A direct `.obsidian` at the canonical runtime path is sufficient even when ancestor/descendant candidates exist. After apply, require full restart/reload, Installed plugins confirmation, both plugin registry checks, then verifier output.

1. **Source:** every manifest entry resolves beneath the declared `sourceRoot`, exists as a regular file, and is not an accidental symlink. Record source hash.
2. **Destination:** normalize each destination relative to the intended install root; prove it remains contained and matches the manifest exactly. Record overwrite/config policy and destination hash when available.
3. **Mirror:** compare each configured same-scope mirror to canonical source by realpath and copied-byte hash. This repository's declared copy-based `Vault Overlay/` is permitted only when its contained paths are non-symlink regular files/directories and hashes match their canonical sources. Missing, divergent, unknown-ownership, unsafe-symlink, or other unrecognized mirror targets are conflicts; preserve them for explicit ownership review and stop—never overwrite a conflict or fall back around a link.
4. **Guidance:** every documented path, bundled/not-bundled claim, command, plugin, and config file agrees with the source/destination map. Report exact source locations for mismatches.
5. **Manifest/implementation:** installer and verifier consume the manifest and enforce its policies rather than maintaining a second inferred list.
6. **Validator/metadata:** available validators and skill metadata/index entries name the same canonical paths and schema. Run existing generators only; never invent one.
7. **Manual steps:** derive the remaining human actions from manifest policy and verifier output. Keep schema-sensitive or UI-only work manual unless the installed schema is verified.

### 4. Detect contradictions

Compare claims pairwise across source, manifest, implementation, mirror, validator, metadata, and manual steps. At minimum check:

- prose says a dependency/plugin is bundled, but no manifest source supplies it (for example, the stale claim that QuickAdd plugin files are included while `setup/manifest.json` only requires `quickadd` and marks QuickAdd data schema-sensitive);
- documented destination differs from manifest destination or `sourceRoot` resolution;
- a source or mirror is missing, divergent, symlinked, or outside containment;
- dry-run, backup, overwrite, permission, or unknown-key preservation is promised but not implemented/verified;
- a schema-sensitive JSON file is rewritten without an exact schema proof;
- a validator checks a different allowlist or cannot observe a claimed safeguard;
- a required manual action is absent, falsely automated, or contradicted by a platform/UAT disclaimer;
- skill frontmatter, index, lock, mirror, or metadata points at a non-canonical or duplicate source.

Classify each as `blocking`, `warning`, or `not applicable`. An unproven safety claim is blocking, not a warning.

### 5. Apply safety gates

This is an audit and must be dry-run/read-only. If an installation is also requested, run its documented `--dry-run` first and show the planned changes; do not run `--apply` without the repository's explicit authorization. Before any authorized apply, require a timestamped backup for every replacement/config merge and verify destination write permission. A missing destination, permission denial, backup failure, path escape, unsafe link, unknown schema, or mirror conflict stops the operation.

Never rewrite schema-sensitive QuickAdd/user configuration merely to make validation pass. Report the exact manual UI step and missing evidence. Never delete or migrate existing notes, workspace state, credentials, or unrelated vault content. Report macOS/iOS UAT as user-owned unless the repository provides a real, exercised harness.

Use `updating-stale-agent-guidance` for stale repairs. Do not duplicate its diagnosis, replacement, or migration procedure here. After that leaf changes guidance, rerun this audit from step 1.

## Stop conditions and recovery

Stop with a blocking result when any required input cannot be discovered, a claim cannot be reconciled, source/destination containment or hash parity is unproven, a mirror conflicts, a permission/backup/dry-run guarantee is unproven, a schema is unknown, or a required validator cannot run. Do not guess, silently downgrade, copy over a conflict, or proceed to a vault write.

The stop record must name the exact path/claim, evidence observed, owner or human action needed, safe recovery command or next discovery step, and rollback/backup path. After resolution, rerun the complete ordered audit; do not resume midway. Timeouts, interrupted validators, concurrent worktree changes, and changing source hashes are also stops: capture partial output, refresh the change snapshot, and rerun. If another agent owns a conflicting file, preserve the conflict and coordinate rather than overwriting it.

## Proof bundle (required output)

Return a compact, reproducible bundle containing:

- UTC timestamp, repository/worktree identity, and exact changed-file scope;
- activation decision and near-miss rationale (or `not applicable` evidence);
- discovered input paths with existence, realpath/link status, and relevant hashes;
- ordered source → destination → mirror reconciliation table, including policies and parity results;
- contradiction table with exact source locations and severity;
- dry-run, backup, permission, schema, and validator commands plus exit status/output summaries;
- manual steps and platform/UAT ownership, including explicit non-applicability decisions;
- final `PASS`, `PASS WITH WARNINGS`, or `STOP` decision. A pass requires no blocking contradiction and proof for every claimed safeguard.

Do not claim a repair, apply, mirror sync, generator run, or UAT that was not actually executed. Include the pressure scenario and RED/GREEN evidence from `references/pressure-scenarios.md` when changing this skill.

## Validation

Run only repository-provided checks that exist, using their documented commands. For this skill's CRUD, use the governing leaf's existing metadata, mirror, and validation commands when available. If a command or registry is absent, record `not configured` rather than fabricating it. Run a graph update after changing repository code or guidance only when this checkout already has a configured graph index and a supported repository graph-update command; otherwise record `not configured` and do not install or generate an index solely for this audit. Inspect every changed file and report exact outcomes.
