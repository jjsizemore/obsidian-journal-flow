# ADR-0002: Consolidated Daily and Journal Storage

- Status: Accepted
- Date: 2026-09-30
- Supersedes: ADR-0001

## Decision

Store each Daily Note and its guided journal entries together under
`Daily/YYYY-MM-DD/`, with guided entries in a lowercase `journal` subfolder.
Name files `YYYY-MM-DD Daily.md`, `YYYY-MM-DD Check-In.md`,
`YYYY-MM-DD Practice Gratitude.md`, and `YYYY-MM-DD Analyze Thought.md`.
Repeat entries use numbered suffixes (`Check-In 2`).

Daily Note creation creates only the Daily Note folder and file. The `journal`
subfolder is created lazily when a Check-In, Practice Gratitude, Analyze
Thought, or another explicitly registered journal workflow runs.

Journal entries persist canonical wikilinks back to their Daily Note. Daily
Notes group those links beneath managed `Journal` subtype headings, now
including `Practice Gratitude`.

## Alternatives considered

1. Keep Daily Notes and journal entries in separate top-level trees.
2. Keep journal entries inline inside the Daily Note.
3. Use live search blocks instead of persisted links.

## Tradeoffs

One date folder keeps everything for a day open together and avoids parallel
top-level trees. It puts more files under `Daily` and changes every Daily and
journal path, filename, Daily Notes format string, template backlink, and
managed heading. Persisted links remain durable and inspectable, but the
automation must handle the new paths, retries, collisions, and missing
targets. Historical notes require a separate backed-up user migration inside
Obsidian; the installer must not move them.

## Rationale

Daily journaling happens alongside the Daily Note, and users asked for all of
a day's Check-In, gratitude, and thought-analysis work in that day's folder.
Practice Gratitude is a guided journal alongside Analyze Thought, with mood
guidance in the Check-In footer rather than script branching.
