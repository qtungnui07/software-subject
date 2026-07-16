# Robogo Course Experience Release Checklist

Dùng checklist này sau khi hoàn thành Phase 0–8 và trước khi commit, demo hoặc push.

## 1. Kiểm tra tự động

- [ ] `npm run check:course-experience-release` pass.
- [ ] `npx tsc --noEmit` pass.
- [ ] ESLint các file thuộc Phase 0–9 không có lỗi mới.
- [ ] `npm run build` pass trên máy local.
- [ ] Khi server đang chạy, `npm run smoke:course-experience` pass.

## 2. Luồng giao diện chính

- [ ] `/learn` không còn bộ chọn ba section cũ.
- [ ] Nhấn tên section/chapter trên thanh xanh mở `/sections`.
- [ ] Nút `HƯỚNG DẪN` mở riêng và không chuyển trang.
- [ ] Chọn section đã mở quay lại `/learn` với đúng roadmap.
- [ ] Nhấn node mở popover; CTA mở lesson detail; nút bắt đầu mở lesson player.
- [ ] Nút bài học dùng xanh Robogo; phản hồi đúng/sai vẫn xanh lá/đỏ.
- [ ] Thời gian học thực tế tăng và không tính khi tab ẩn hoặc AFK.

## 3. Tài khoản A — đã có dữ liệu

- [ ] Tiến độ, XP, quest, thời gian học và bài đã hoàn thành không bị reset.
- [ ] Avatar legacy `/mascot.svg` được chuẩn hóa về `/Robogo.svg`.
- [ ] Section hiện tại hợp lệ và vẫn được giữ sau reload.
- [ ] Có thể chuyển sang section đã mở và quay lại section cũ để ôn tập.

## 4. Tài khoản B — mới hoặc chỉ mở Section 1

- [ ] Avatar mặc định là `/Robogo.svg`.
- [ ] Onboarding và Placement Test hoạt động đúng.
- [ ] Badge đề xuất chỉ xuất hiện khi có kết quả Placement Test thật.
- [ ] Section khóa hiển thị điều kiện và không thể chọn.
- [ ] Gửi request chọn section khóa không làm đổi `currentSectionId`.

## 5. Responsive nhanh

- [ ] Kiểm tra ở 390px, 768px và 1440px.
- [ ] Thanh xanh `/learn`, card `/sections`, badge và popover không tràn màn hình.
- [ ] Các vùng nhấn và focus keyboard vẫn rõ ràng.

## 6. Git trước khi push

- [ ] `git diff --check` không báo lỗi.
- [ ] `git status --short` chỉ có file dự kiến.
- [ ] Không có `.env`, `.env.local`, `node_modules` hoặc `.next` trong thay đổi.
- [ ] `section-switcher.tsx`, `locked-section-panel.tsx` và `public/mascot.svg` đã bị xóa.
- [ ] Đã xem `git diff --stat` trước khi commit.
