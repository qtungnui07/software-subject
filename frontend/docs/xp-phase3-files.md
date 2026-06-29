# Phase 3 — Files Added and Edited

## Files added

```txt
frontend/app/api/xp/complete-lesson/route.ts
frontend/services/xp-service.ts
frontend/docs/xp-phase3-api.md
frontend/docs/xp-phase3-files.md
```

## Files edited

```txt
Không chỉnh file cũ trong Phase 3.
```

## Where Phase 3 connects later

```txt
app/lesson/page.tsx
→ Phase 4 sẽ gọi POST /api/xp/complete-lesson khi lesson hoàn thành.

app/(main)/profile/page.tsx
→ Phase 5 sẽ đọc user_xp_summary để hiển thị total/daily/weekly XP và level.

app/(main)/leaderboard/page.tsx
→ Phase 6 sẽ lấy weekly_xp để xếp hạng.
```

## Safe overwrite note

Phase 3 chỉ thêm file mới, không ghi đè UI, schema, hay logic streak cũ.
