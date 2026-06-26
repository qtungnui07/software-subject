# Phase 2 — Files Added/Changed

## Changed

- `frontend/db/schema.ts`
  - Adds `userXpSummary`, `xpEvents`, `lessonXpClaims` Drizzle tables.
  - Adds relations and inferred types for XP tables.
  - Keeps existing `userProgress.points` unchanged for backward compatibility.

- `frontend/lib/schema.sql`
  - Adds SQL tables: `user_xp_summary`, `xp_events`, `lesson_xp_claims`.
  - Adds indexes for XP history and anti-farming.

## Added

- `frontend/docs/xp-phase2-data-schema.md`
  - Explains XP database structure and where Phase 3 will connect it.

## Not touched

- Lesson Result Screen
- Profile Page
- Leaderboard Page
- API routes
- Existing streak logic
