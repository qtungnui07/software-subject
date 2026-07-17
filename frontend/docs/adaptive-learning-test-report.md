# Adaptive Learning – Phase 9 Test Report

## Scope

Phase 9 freezes new features and validates the full Adaptive Learning flow built in Phases 1–8:

`Sign up → Onboarding → Basic/Placement → Section unlock → Lesson → XP/Streak/Quest → Checkpoint → Leaderboard/Profile → Reload`

## Automated checks

| Area | Command | Expected result |
|---|---|---|
| Phases 1–8 regression | `npm run check:adaptive-phase8` | All existing checks pass |
| User flows | `npm run check:adaptive-user-flows` | Basic, Placement Section 2/3 and lower-retake preservation pass |
| Failure policy | `npm run check:completion-failure-policy` | Progress survives partial XP/streak/quest failures |
| API security | `npm run check:api-security-contract` | No answer leak, no privileged client fields, safe redirects, safe errors |
| Legacy migration | `npm run check:legacy-user-migration` | Chapter 1 data merges and projects back without loss |
| Database contract | `npm run check:database-contract` | Static schema passes; live PostgreSQL is read-only checked when configured |
| Full Phase 9 | `npm run check:adaptive-phase9` | All Phase 1–9 checks pass |
| Adaptive lint | `npm run lint:adaptive-learning` | No lint errors in Adaptive Learning scope |
| TypeScript | `npx tsc --noEmit` | No type errors |
| Build | `npm run build` | Production build succeeds |

## Manual test matrix

Use three dedicated development accounts. Do not reset or mutate real user accounts.

| ID | Scenario | Expected result | Status |
|---|---|---|---|
| A1 | New user chooses Basic | Only Section 1 opens; onboarding does not return after reload | Pending manual |
| A2 | New user Placement → Section 2 | Sections 1–2 open; Section 3 remains locked; Placement gives no XP | Pending manual |
| A3 | New user Placement → Section 3 | Sections 1–3 open; lower retake never relocks | Pending manual |
| A4 | Legacy Chapter 1 user signs in | Existing progress remains; onboarding is skipped | Pending manual |
| B1 | Lesson pass at 60% | Progress, XP, streak and quest update | Pending manual |
| B2 | Lesson fail at 59% | No progress, XP, streak or quest update | Pending manual |
| B3 | Same lesson completed twice | XP and lesson quest increase once only | Pending manual |
| B4 | Reload result screen | No duplicate completion or XP | Pending manual |
| C1 | Checkpoint 69% | Next section stays locked | Pending manual |
| C2 | Checkpoint 70% | Next section opens | Pending manual |
| C3 | Checkpoint 90%, then 60% | Best score remains 90%; section stays open | Pending manual |
| D1 | Direct URL to locked lesson | Redirects to `/learn?locked=<section>` | Pending manual |
| D2 | Invalid node ID | Clear not-found response; no fallback to Lesson 1 | Pending manual |
| E1 | Mobile 375px | No horizontal overflow on onboarding, placement, learn and lesson | Pending manual |
| E2 | Keyboard | Main buttons, dialogs and answer controls are keyboard-usable | Pending manual |
| E3 | TTS unavailable | Listening shows fallback and does not crash | Pending manual |

## Database validation

Run only against a safe development PostgreSQL database:

```powershell
npm run db:push
npm run check:database-contract
```

The database checker is read-only. It verifies required tables, columns and unique indexes. It does not delete or modify rows.

Required safety properties:

- `lesson_xp_claims_user_lesson_idx` prevents duplicate XP claims.
- `course_progress_user_course_idx` keeps one progress row per user/course.
- `placement_test_results_user_course_idx` keeps one latest Placement result per user/course.
- Legacy `chapter_one_progress` remains available for dual-sync migration.

## Release blockers

### P0 – must block release

- Data loss or destructive migration
- Unlimited/duplicate XP
- Locked section bypass
- Placement answer leak
- Authentication bypass
- TypeScript or production build failure

### P1 – fix before Phase 10

- Redirect loop
- Progress lost after reload
- Legacy users forced into onboarding
- Quest/streak inconsistent after a valid completion
- Core flow unusable at 375px width

### P2 – backlog allowed

- Small animation/copy/spacing polish
- Existing full-project lint debt outside Adaptive Learning scope

## Known technical debt

The full-project `npm run lint` command now passes. Dynamic database/mock adapters and
client hydration effects use narrowly scoped ESLint overrides in `eslint.config.mjs`;
these areas should be migrated to stronger static types and newer hydration patterns
when their implementations are revisited.
