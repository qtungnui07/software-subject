# Phase 2 — XP Data Schema

Phase 2 tạo nền dữ liệu cho hệ thống XP của Robogo. Phase này chỉ thêm schema/database, chưa gắn API và chưa sửa UI.

## Phase 2.1 — Bảng `user_xp_summary`

Dùng để lưu trạng thái XP hiện tại của từng người dùng.

| Cột | Ý nghĩa |
| --- | --- |
| `user_id` | ID người dùng, trùng với `user_progress.user_id` |
| `total_xp` | Tổng XP vĩnh viễn, dùng để tính level |
| `daily_xp` | XP kiếm được trong ngày hiện tại |
| `weekly_xp` | XP kiếm được trong tuần hiện tại, dùng để xếp Leaderboard |
| `current_day` | Ngày đang được tính daily XP |
| `current_week_start` | Thứ Hai đầu tuần đang được tính weekly XP |
| `created_at` | Thời điểm tạo record |
| `updated_at` | Thời điểm cập nhật gần nhất |

Ghi chú: `user_progress.points` vẫn giữ lại để không làm hỏng code cũ. Khi Phase 3 làm API, `total_xp` và `user_progress.points` nên được cập nhật cùng nhau trong cùng transaction.

## Phase 2.2 — Bảng `xp_events`

Dùng để lưu lịch sử mỗi lần hệ thống xử lý XP.

| Cột | Ý nghĩa |
| --- | --- |
| `user_id` | Người dùng nhận XP |
| `lesson_id` | Lesson liên quan |
| `earned_xp` | XP thực nhận |
| `base_xp` | XP gốc của lesson |
| `accuracy_bonus` | XP thưởng theo accuracy |
| `accuracy` | Độ chính xác đã normalize từ 0 đến 100 |
| `reward_type` | `first_completion`, `replay_no_reward`, `duplicate_request`, `failed_lesson` |
| `event_date` | Ngày xử lý XP |
| `week_start` | Thứ Hai của tuần xử lý XP |
| `created_at` | Thời điểm tạo log |

Bảng này giúp kiểm thử và debug: hoàn thành lần đầu, học lại lesson, gửi API trùng đều có thể ghi nhận rõ ràng.

## Phase 2.3 — Bảng `lesson_xp_claims`

Dùng để chống farm XP.

| Cột | Ý nghĩa |
| --- | --- |
| `user_id` | Người dùng |
| `lesson_id` | Lesson |
| `earned_xp` | XP đã nhận ở lần hoàn thành đầu tiên |
| `accuracy` | Accuracy ở lần nhận XP đầu tiên |
| `first_completed_at` | Thời điểm nhận XP đầu tiên |
| `updated_at` | Thời điểm cập nhật gần nhất |

Có unique index:

```sql
lesson_xp_claims_user_lesson_idx ON (user_id, lesson_id)
```

Ý nghĩa: một user chỉ có thể claim XP chính của một lesson đúng một lần.

## File đã thêm/chỉnh trong Phase 2

### Chỉnh sửa

```txt
frontend/db/schema.ts
frontend/lib/schema.sql
```

### Thêm mới

```txt
frontend/docs/xp-phase2-data-schema.md
```

## Nơi gắn ở Phase 3

Phase 3 nên tạo API:

```txt
frontend/app/api/xp/complete-lesson/route.ts
```

API sẽ dùng:

```ts
import { lessonXpClaims, userProgress, userXpSummary, xpEvents } from "@/db/schema";
import { calculateLessonXp, calculateLevelFromXp } from "@/lib/xp";
```

Luồng xử lý Phase 3:

1. Nhận `lessonId` và `accuracy`.
2. Kiểm tra `lesson_xp_claims` bằng `userId + lessonId`.
3. Nếu đã có claim, trả `earnedXp = 0`.
4. Nếu chưa có claim và accuracy đạt yêu cầu, insert claim.
5. Insert `xp_events`.
6. Update `user_xp_summary`.
7. Update `user_progress.points` để giữ tương thích code cũ.
8. Trả dữ liệu cho Lesson Result Screen.
