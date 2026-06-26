# Phase 3 — XP Complete Lesson API

Phase 3 tạo API cộng XP thật khi người dùng hoàn thành lesson.

## API route

```txt
POST /api/xp/complete-lesson
```

File:

```txt
frontend/app/api/xp/complete-lesson/route.ts
```

## Body

```json
{
  "lessonId": "lesson-1",
  "accuracy": 85
}
```

## Response thành công lần đầu

```json
{
  "success": true,
  "lessonId": "lesson-1",
  "earnedXp": 18,
  "baseXp": 15,
  "accuracyBonus": 3,
  "accuracy": 85,
  "totalXp": 118,
  "dailyXp": 18,
  "weeklyXp": 18,
  "level": 2,
  "alreadyClaimed": false,
  "isPassed": true,
  "rewardType": "first_completion",
  "message": "Hoàn thành bài học lần đầu, nhận 18 XP.",
  "currentDay": "2026-06-26",
  "currentWeekStart": "2026-06-22"
}
```

## Response khi gửi lại cùng lesson

```json
{
  "success": true,
  "lessonId": "lesson-1",
  "earnedXp": 0,
  "alreadyClaimed": true,
  "rewardType": "duplicate_request"
}
```

## Response khi accuracy dưới 60%

```json
{
  "success": true,
  "lessonId": "lesson-2",
  "earnedXp": 0,
  "alreadyClaimed": false,
  "isPassed": false,
  "rewardType": "failed_lesson"
}
```

## Luồng xử lý

```txt
1. Nhận lessonId và accuracy
2. Lấy user hiện tại từ auth
3. Nếu dev chưa login, dùng demo-user để test
4. Kiểm tra lesson_xp_claims
5. Nếu đã nhận XP: trả earnedXp = 0
6. Nếu chưa nhận XP: tính XP bằng calculateLessonXp
7. Nếu accuracy dưới 60%: ghi xp_events, không tạo claim
8. Nếu đạt từ 60%: tạo claim, ghi event, cập nhật summary, cập nhật points cũ
```

## Database được dùng

```txt
lesson_xp_claims
→ chống cộng XP trùng

xp_events
→ ghi lịch sử nhận XP

user_xp_summary
→ lưu total/daily/weekly XP

user_progress.points
→ cập nhật để giữ tương thích code cũ
```

## Lưu ý

Nếu chưa có `DATABASE_URL`, service dùng in-memory XP store để test API trong môi trường dev. Dữ liệu này sẽ mất khi restart server.

Nếu có `DATABASE_URL`, API dùng database thật.
