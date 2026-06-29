# XP Phase 4 — Lesson Result Screen Integration

## Mục tiêu

Phase 4 gắn API XP thật vào màn hình kết quả bài học.

Khi người dùng hoàn thành lesson, `app/lesson/page.tsx` sẽ gọi:

```txt
POST /api/xp/complete-lesson
```

Body gửi lên:

```json
{
  "lessonId": "lesson-2",
  "accuracy": 85
}
```

Response dùng để hiển thị:

```txt
earnedXp
accuracy
totalXp
level
alreadyClaimed
isPassed
message
```

## Luồng hoạt động

```txt
User hoàn thành câu cuối
→ Result Screen được hiển thị
→ gọi API /api/xp/complete-lesson đúng 1 lần
→ nhận XP result
→ hiển thị XP vừa nhận, accuracy, total XP, level
→ gọi streak update sau khi có XP result
```

## Quy tắc hiển thị

### Lesson lần đầu đạt yêu cầu

```txt
+18 XP hoặc +20 XP
Accuracy
Total XP
Level hiện tại
```

### Lesson đã nhận XP trước đó

```txt
+0 XP
Thông báo bài học đã nhận XP trước đó
```

### Accuracy dưới 60%

```txt
+0 XP
Thông báo bài học chưa được tính hoàn thành
```

### API lỗi

```txt
Không crash màn hình kết quả
Hiển thị thông báo không thể cập nhật XP lúc này
```

## Lưu ý

Phase 4 chưa chỉnh Profile Page và Leaderboard. Hai phần đó dành cho phase sau.
