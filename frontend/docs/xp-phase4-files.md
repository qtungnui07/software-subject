# XP Phase 4 — Files Changed

## File chỉnh sửa

```txt
frontend/app/lesson/page.tsx
```

Thay đổi chính:

```txt
- Thêm type LessonXpApiResult
- Thêm state xpResult, isClaimingXp, xpError
- Gọi POST /api/xp/complete-lesson khi Result Screen xuất hiện
- Hiển thị XP vừa nhận từ API
- Hiển thị accuracy
- Hiển thị total XP
- Hiển thị level hiện tại
- Xử lý alreadyClaimed
- Xử lý failed_lesson
- Không để màn hình crash nếu XP API lỗi
```

## File thêm mới

```txt
frontend/docs/xp-phase4-result-screen.md
frontend/docs/xp-phase4-files.md
```

## File không chỉnh

```txt
frontend/app/(main)/profile/page.tsx
frontend/app/(main)/leaderboard/page.tsx
frontend/app/api/xp/complete-lesson/route.ts
frontend/services/xp-service.ts
frontend/db/schema.ts
frontend/lib/schema.sql
```

## Nơi gắn

Phase 4 gắn ở màn hình kết quả bài học trong:

```txt
frontend/app/lesson/page.tsx
```

Cụ thể: khi `isFinished === true`, Result Screen gọi API XP và render dữ liệu trả về.
