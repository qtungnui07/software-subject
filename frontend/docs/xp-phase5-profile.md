# Phase 5 — XP Profile Integration

## Mục tiêu

Phase 5 gắn hệ thống XP vào Profile Page để người dùng thấy XP dài hạn sau khi hoàn thành lesson.

## API mới

```txt
GET /api/xp/summary
```

API trả về:

```ts
{
  success: true,
  totalXp: number,
  dailyXp: number,
  weeklyXp: number,
  level: number,
  currentLevelStartXp: number,
  nextLevelXp: number,
  xpIntoCurrentLevel: number,
  xpNeededForNextLevel: number,
  progressPercent: number,
  currentDay: string,
  currentWeekStart: string,
  isDemoUser: boolean
}
```

## UI Profile

Profile Page hiển thị:

- Total XP
- Daily XP
- Weekly XP
- Level hiện tại
- Tiến độ lên level tiếp theo

## Fallback

Nếu API lỗi hoặc user chưa có dữ liệu XP, UI không crash và dùng mặc định:

```txt
totalXp = 0
dailyXp = 0
weeklyXp = 0
level = 1
```

## Không chỉnh trong Phase 5

- Không chỉnh Leaderboard
- Không chỉnh Lesson Result Screen
- Không chỉnh schema database
