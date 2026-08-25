# ADR-0001: Separate Daily Notes from Journal Entries

- Status: Accepted
- Date: 2026-08-25

## Decision

Store general Daily Notes under `Daily/YYYY-MM-DD/YYYY-MM-DD.md`. Store specialized journal entries under `Journal/YYYY-MM-DD/`.

Daily Note creation creates only the Daily Note folder and file. Journal folders are created lazily when a Check-in, Analyze Thought, or another explicitly registered journal workflow runs.

Journal entries persist canonical wikilinks back to their Daily Note. Daily Notes group those links beneath managed `Journal` subtype headings.

## Alternatives considered

1. Store the Daily Note and journal entries together under `Journal/YYYY-MM-DD/`.
2. Keep journal entries inline inside the Daily Note.
3. Use live search blocks instead of persisted links.

## Tradeoffs

Separate folders make the Daily Note a general day-level workspace and keep guided journal content focused. They require explicit cross-folder links and separate attachment locations. Persisted links are more durable and inspectable than live queries, but the automation must handle path resolution, retries, collisions, and missing targets.

## Rationale

Daily Notes contain schedules, activities, thoughts, notes, and tasks in addition to journaling. Treating them as Journal notes conflates two domains and makes the general day record harder to navigate. Separate storage preserves the general-purpose Daily Note while retaining a compact, durable index of specialized journal workflows.
