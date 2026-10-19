# Ghi chú repository Robogo

Tài liệu này dành cho người mới tiếp nhận codebase. README ở thư mục gốc mô tả sản phẩm; file này tập trung vào cách các phần liên kết với nhau và những quy ước cần nhớ.

## Bản đồ thư mục

| Thư mục | Vai trò |
| --- | --- |
| `backend/src` | HTTP server, auth/profile/admin API, proxy frontend và email reminder |
| `backend/migrations` | SQL tạo/cập nhật catalog nội dung trong PostgreSQL |
| `backend/data` | Snapshot JSON được seed vào catalog nội dung |
| `backend/scripts` | Migrate, seed và tiện ích kiểm tra backend |
| `frontend/app` | Route pages, layouts và Next.js Route Handlers (`app/api`) |
| `frontend/components` | UI tái sử dụng: lesson, exercise, roadmap, profile, quest, streak |
| `frontend/services` | Lớp service server-side gọi backend; không import từ Client Component |
| `frontend/lib` | Luật nghiệp vụ, validator, scoring, policy, security và helper |
| `frontend/data` | Nội dung authored của course/exercise/placement test |
| `frontend/db` | Drizzle schema, query và kết nối database |
| `frontend/types` | TypeScript types dùng chung |
| `frontend/scripts` | Contract checks, smoke checks, migration checks và release checks |
| `frontend/docs` | Tài liệu thiết kế, checklist và test report theo từng phase |
| `frontend/public` | Logo, mascot Robogo, icon và hình ảnh tĩnh |

## Luồng đăng nhập và dữ liệu

1. Người dùng đăng nhập qua local auth hoặc Clerk.
2. Frontend xác định session hiện tại và chuyển user identity qua các service server-side.
3. Service gọi backend bằng `x-backend-api-key`; các endpoint cần người dùng kèm `x-user-id`.
4. Backend đọc/ghi PostgreSQL và trả JSON theo contract trong `backend/openapi.yaml`.
5. Client Component chỉ gọi Next.js `/api/*`, không được đưa backend API key xuống trình duyệt.

## Luồng nội dung học

```text
course
  └─ section
      └─ chapter / learning node
          ├─ lesson detail
          ├─ exercise catalog
          └─ checkpoint
```

Nội dung authored ban đầu nằm trong `frontend/data`. Script export tạo [`backend/data/content-v1.json`](../backend/data/content-v1.json), sau đó backend migration/seed đưa dữ liệu vào PostgreSQL. API content cố ý không trả answer key trong danh sách bài tập; việc chấm được thực hiện phía backend qua endpoint check.

## Database

Có hai nhóm schema:

- `backend/migrations/`: catalog dùng chung cho course, section, lesson, exercise, placement test và quest.
- `frontend/db/schema.ts` và `frontend/lib/schema.sql`: tài khoản, session, progress, XP, streak, study time, quest claim, learning sync và rate limit.

Khi thay đổi schema, cần cập nhật migration tương ứng và kiểm tra các script contract liên quan. Không sửa dữ liệu production trực tiếp bằng file local.

## Biến môi trường quan trọng

Backend:

- `DATABASE_URL`: kết nối PostgreSQL.
- `BACKEND_API_KEY`: khóa giữa frontend và backend.
- `PORT`: mặc định `4000`.
- `APP_URL`, `FRONTEND_INTERNAL_URL`: URL ứng dụng và URL nội bộ.
- `SMTP_*`, `MAIL_FROM`: dùng cho email reminder.

Frontend:

- `DATABASE_URL`: database cho các service/query frontend.
- `BACKEND_URL`, `BACKEND_API_KEY`: kết nối backend server-side.
- `LOCAL_AUTH_SECRET`: ký session local.
- `REMOTE_API_URL`: tùy chọn, dùng khi frontend clone gọi API của instance khác.
- `NEXT_PUBLIC_APP_URL`: URL public của frontend.

Các file `.env*` thật đã được gitignore. Chỉ commit file mẫu và không dùng credential mẫu ở môi trường production.

## Quy tắc khi sửa code

- Route Handler và Server Component có thể dùng service; Client Component không được import service backend.
- Nội dung mới nên đi qua type/validator và script kiểm tra tương ứng.
- Các thay đổi progress/completion cần giữ idempotency vì request có thể retry.
- Các thay đổi auth/API cần kiểm tra cả API key, user id, rate limit và logging không lộ dữ liệu nhạy cảm.
- Khi thay đổi UI lesson hoặc roadmap, chạy các check script của feature trước khi build.

## Kiểm tra nhanh

Từ `frontend/`:

```bash
npm run lint
npx tsc --noEmit
npm run check:adaptive-learning
npm run check:production-readiness
npm run build
```

Từ root, Docker Compose là cách gần production nhất:

```bash
docker compose up --build
```

## Điểm cần dọn hoặc xác minh

- `frontend/.next.bad-permissions/` là build artifact đang tồn tại trong repository; không nên dùng làm source code.
- Một số check lịch sử còn tham chiếu `frontend/components/lesson-path.tsx` và `frontend/scripts/check-section-one-v2-contract.ts`, trong khi hai file này hiện không có. Nếu chạy các check liên quan và gặp lỗi `file not found`, cần cập nhật script hoặc khôi phục contract tương ứng.
- Các script kiểm tra được chia theo phase; không nên giả định một script cũ phản ánh toàn bộ trạng thái runtime.
- Trước release cần kiểm tra health/readiness, migration, seed content, build và secret configuration.

## Commit và review

Một thay đổi nên ghi rõ nó thuộc nhóm nào: UI, content, progress/gamification, API/backend, database hoặc infrastructure. Với thay đổi liên quan nhiều lớp, mô tả cả contract request/response và cách kiểm thử trong pull request.
