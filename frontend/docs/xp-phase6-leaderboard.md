# Phase 6 — XP Leaderboard

## Mục tiêu

Gắn hệ thống XP vào Leaderboard để bảng xếp hạng dùng `weekly XP` thay vì điểm mock/localStorage là nguồn chính.

## API mới

```txt
GET /api/xp/leaderboard
```

Response chính:

```ts
{
  success: true;
  users: Array<{
    rank: number;
    userId: string;
    name: string;
    avatarUrl: string;
    level: number;
    weeklyXp: number;
    totalXp: number;
    isCurrentUser: boolean;
  }>;
  currentDay: string;
  currentWeekStart: string;
  isDemoUser: boolean;
}
```

## Quy tắc xếp hạng

- Sắp xếp theo `weeklyXp` giảm dần.
- Nếu bằng weekly XP, dùng `totalXp` để phụ trợ.
- `totalXp` chỉ hiển thị phụ, không phải điểm xếp hạng chính.
- Dòng user hiện tại được highlight và có nhãn `(Bạn)`.

## Fallback demo

Khi chưa có `DATABASE_URL`, API dùng in-memory XP store của Phase 3–5.

- User hiện tại lấy XP thật từ memory.
- Các user khác là demo cố định.
- Sau khi gọi `POST /api/xp/complete-lesson`, gọi lại leaderboard sẽ thấy weekly XP của user hiện tại tăng.

## Nơi gắn

- `frontend/app/api/xp/leaderboard/route.ts`: API đọc leaderboard.
- `frontend/services/xp-service.ts`: thêm `getXpLeaderboard()`.
- `frontend/app/(main)/leaderboard/leaderboard-client.tsx`: gọi API và hiển thị weekly XP, level, total XP.

## Test nhanh

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/api/xp/leaderboard" `
  -Method GET
```

Cộng XP:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/api/xp/complete-lesson" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"lessonId":"leaderboard-test-1","accuracy":100}'
```

Gọi lại leaderboard. User hiện tại phải tăng `20 weekly XP`.
