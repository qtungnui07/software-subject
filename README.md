# Robogo

Robogo là một ứng dụng học tiếng Anh trực tuyến theo hướng trò chơi hóa, lấy cảm hứng từ các ứng dụng luyện ngôn ngữ phổ biến. Người học làm bài theo lộ trình, nhận XP/phần thưởng, duy trì streak và theo dõi tiến độ cá nhân.

Repository này chứa toàn bộ mã nguồn của sản phẩm:

- frontend Next.js/React/TypeScript;
- backend Node.js cung cấp API và nội dung học tập;
- PostgreSQL lưu tài khoản, tiến độ, dữ liệu gamification và catalog khóa học;
- Docker Compose để chạy các thành phần cùng nhau.

## Mục tiêu sản phẩm

Robogo hướng tới một trải nghiệm học tiếng Anh ngắn, rõ ràng và có thể tiếp tục mỗi ngày. Các mục tiêu chính:

1. Giúp người mới bắt đầu học theo lộ trình có cấu trúc thay vì học các bài rời rạc.
2. Cho phép hệ thống đánh giá đầu vào và chọn section phù hợp với trình độ.
3. Biến mỗi bài học thành một phiên tương tác gồm nhiều dạng bài tập.
4. Lưu tiến độ an toàn, hỗ trợ tiếp tục bài đang dở và đồng bộ khi kết nối không ổn định.
5. Tạo động lực học đều thông qua XP, streak, quest, phần thưởng, leaderboard và checkpoint.
6. Tách nội dung khỏi giao diện để có thể cập nhật khóa học bằng dữ liệu và migration.

## Nội dung và tính năng hiện có

- Đăng ký/đăng nhập tài khoản local; hỗ trợ đồng bộ tài khoản Clerk.
- Onboarding và placement test tiếng Anh.
- Course roadmap gồm course, section, chapter, lesson, checkpoint và reward node.
- Các dạng bài tập: chọn đáp án, điền chỗ trống, sắp xếp từ, nối cặp, nghe, hội thoại và viết ngắn.
- Chấm điểm, phản hồi, xem lại lỗi và tiếp tục phiên học đã lưu.
- Theo dõi course progress, lesson completion, XP, hearts, streak và study time.
- Quest hằng ngày, chest/reward, leaderboard và hồ sơ người dùng.
- Trang quản trị cho người dùng và catalog nội dung.
- Email reminder tùy chọn cho việc học hằng ngày.
- API health/readiness, giới hạn tốc độ và các kiểm tra bảo mật/production readiness.

## Kiến trúc tổng quan

```text
Trình duyệt
   │
   ▼
Next.js frontend (port 3000)
   │  Route Handlers / server services
   ▼
Node backend (port 4000) ───────► PostgreSQL (port 5433 trên máy host)
   │
   └── Nội dung khóa học, bài tập, placement test, quest
```

### Frontend

Mã nguồn nằm trong [`frontend/`](./frontend). Đây là ứng dụng Next.js App Router. Các API phía trình duyệt đi qua `frontend/app/api`; phần gọi backend được gom trong [`frontend/services/`](./frontend/services). Giao diện nằm trong `app/` và `components/`, còn luật nghiệp vụ dùng chung nằm trong `lib/`.

### Backend

Mã nguồn nằm trong [`backend/`](./backend). Server HTTP chính là [`backend/src/server.js`](./backend/src/server.js), catalog nội dung được đọc qua `content-store.js`. Migration nằm trong [`backend/migrations/`](./backend/migrations), snapshot nội dung là [`backend/data/content-v1.json`](./backend/data/content-v1.json), và hợp đồng API là [`backend/openapi.yaml`](./backend/openapi.yaml).

## Chạy local bằng Docker

Yêu cầu: Docker Desktop và Docker Compose.

```bash
docker compose up --build
```

Các địa chỉ mặc định:

- Frontend: <http://localhost:3000>
- Backend health: <http://localhost:4000/health>
- Adminer: <http://localhost:8080>
- PostgreSQL: `localhost:5433`

Lần khởi động đầu tiên, backend tự chạy migration và seed catalog nội dung. Có thể dừng hệ thống bằng:

```bash
docker compose down
```

Muốn xóa cả dữ liệu PostgreSQL local, dùng `docker compose down -v` một cách thận trọng.

## Chạy riêng từng phần

Backend:

```bash
npm run backend:install
npm run backend
```

Frontend:

```bash
npm run frontend:install
npm run frontend
```

Frontend đọc biến môi trường từ `frontend/.env.local`; hãy tạo file này dựa trên [`frontend/.env.example`](./frontend/.env.example). Backend có mẫu tại [`backend/.env.example`](./backend/.env.example).

## Kiểm tra và phát triển

Trong thư mục `frontend/` có các lệnh kiểm tra theo từng nhóm tính năng. Một số lệnh thường dùng:

```bash
npm run lint
npx tsc --noEmit
npm run check:adaptive-learning
npm run check:production-readiness
npm run build
```

Khi sửa dữ liệu khóa học trong `frontend/data/`, xuất lại snapshot backend bằng:

```bash
npm run content:export
```

## Tài liệu liên quan

- [Ghi chú cấu trúc và quy ước repository](./docs/REPOSITORY_NOTES.md)
- [Backend README](./backend/README.md)
- [Backend OpenAPI contract](./backend/openapi.yaml)
- [Frontend service layer](./frontend/services/README.md)
- [CI workflow](./.github/workflows/adaptive-learning-ci.yml)

## Trạng thái và lưu ý

Đây là repository phát triển của Robogo, không phải một thư viện độc lập. Một số script kiểm tra lịch sử vẫn tham chiếu tới file cũ; hãy xem [`docs/REPOSITORY_NOTES.md`](./docs/REPOSITORY_NOTES.md) trước khi dùng toàn bộ test suite. Không commit các giá trị secret thật trong `.env`, API key, mật khẩu database hoặc SMTP credential.
