# Robogo Streak Feature Checklist

## Scope

This checklist summarizes the implementation status for **Streak #23**. The current implementation follows a Duolingo-inspired streak loop with Coddy-style clear learning statistics.

## Completed / Code Done

| Issue | Task | Status | Notes |
|---|---|---|---|
| #137 | Thiết kế dữ liệu Streak | Done | Added `user_streaks` and `daily_streak_logs` data model. |
| #140 | Xử lý tăng streak | Done | Added core streak increment logic. |
| #141 | Xử lý mất streak khi bỏ lỡ ngày học | Done | Added reset and streak freeze handling. |
| #138 | API lấy thông tin streak hiện tại | Code Done | Added `GET /api/streak/current`; pending real database verification. |
| #139 | API cập nhật streak khi hoàn thành bài học | Code Done | Added `POST /api/streak/update`; pending real database verification. |
| #142 | Hiển thị streak trên giao diện người dùng | Code Done | Added `StreakWidget` and `StreakCard`; runtime `/learn` view is blocked by existing `user_progress` DB issue. |
| #143 | Hiển thị số ngày streak liên tiếp | Code Done | Added streak day label helpers and connected them to UI components. |
| #144 | Tạo thông báo duy trì streak | Code Done | Added reusable `StreakNotification` component and notification content helper. |
| #145 | Kiểm tra và tối ưu logic streak | Code Done | Added `check-streak-feature.ts` and this checklist. |

## Verified Logic Cases

Run:

```bash
npx tsx scripts/check-streak-feature.ts
```

Expected result:

```txt
Streak Feature Check: PASS
```

The script verifies:

- First study day starts streak at 1.
- Studying multiple lessons on the same day does not increase streak multiple times.
- Studying on consecutive days increases streak by 1.
- `longestStreak` is updated when current streak breaks the record.
- Missing 1 day without freeze resets streak to 1 after studying again.
- Missing 1 day with enough freeze protects streak.
- Missing 2 days with enough freeze consumes 2 freezes and protects streak.
- Missing 2 days without enough freeze resets streak and does not consume freeze.
- Lesson streak reward values are normalized safely.

## Pending Real Runtime Verification

These items require a real database connection:

- Add a real `DATABASE_URL` in `frontend/.env.local`.
- Run `npm run db:push` to create/update tables in Neon.
- Verify `user_streaks` and `daily_streak_logs` exist in the database.
- Test `GET /api/streak/current` with a logged-in user.
- Test `POST /api/streak/update` with a logged-in user.
- Reopen `/learn` after fixing the existing `user_progress` database issue.

## Known Blocker

The current `/learn` runtime crash is caused by the existing `user_progress` database query, not by the Streak UI components.

Until database verification is completed, the safe sprint status is:

```txt
Streak #23: Code Done
Database verification: Pending
```
