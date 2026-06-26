# Robogo XP System - Phase 1 Rule Design

Phase 1 chốt luật XP dùng chung cho Lesson Result Screen, Profile Page và Leaderboard.
File code chính: `frontend/lib/xp.ts`.

## 1. Base XP

- Hoàn thành lesson lần đầu: `15 XP`.
- Lesson chỉ được tính hoàn thành nếu accuracy từ `60%` trở lên.

## 2. Accuracy bonus

| Accuracy | Bonus | Tổng XP |
|---:|---:|---:|
| 100% | +5 XP | 20 XP |
| 80% - 99% | +3 XP | 18 XP |
| 60% - 79% | +0 XP | 15 XP |
| Dưới 60% | +0 XP | 0 XP |

## 3. Chống farm XP

| Trường hợp | XP nhận | Reward type |
|---|---:|---|
| Hoàn thành lesson lần đầu | 15 - 20 XP | `first_completion` |
| Học lại lesson đã hoàn thành | 0 XP | `replay_no_reward` |
| Gửi lại API cùng lesson | 0 XP | `duplicate_request` |
| Accuracy dưới 60% | 0 XP | `failed_lesson` |

## 4. Daily XP, weekly XP, total XP

- `total XP`: XP tổng vĩnh viễn của người dùng, dùng để tính level.
- `daily XP`: XP kiếm được trong ngày, reset lúc 00:00.
- `weekly XP`: XP kiếm được trong tuần, reset vào thứ Hai.
- Leaderboard xếp hạng bằng `weekly XP` giảm dần.
- `total XP` có thể hiển thị phụ trên Leaderboard.

## 5. Level

Công thức Phase 1:

```ts
level = Math.floor(totalXp / 100) + 1;
```

Ví dụ:

| Total XP | Level |
|---:|---:|
| 0 | 1 |
| 100 | 2 |
| 250 | 3 |
| 1000 | 11 |

## 6. Nơi gắn trong các phase sau

- `app/api/xp/complete-lesson/route.ts`: import `calculateLessonXp` để tính XP thật.
- `app/lesson/page.tsx`: gọi API XP sau khi hoàn thành lesson, hiển thị XP vừa nhận, accuracy, total XP và level.
- `app/(main)/profile/page.tsx`: hiển thị total XP, daily XP, weekly XP và level.
- `app/(main)/leaderboard/page.tsx`: lấy weekly XP của user.
- `app/(main)/leaderboard/leaderboard-client.tsx`: sort leaderboard theo weekly XP giảm dần.
- `db/schema.ts`: Phase 2 sẽ thêm bảng `user_xp_summary`, `xp_events`, `lesson_xp_claims`.
- `lib/schema.sql`: Phase 2 sẽ thêm SQL tạo 3 bảng XP.
