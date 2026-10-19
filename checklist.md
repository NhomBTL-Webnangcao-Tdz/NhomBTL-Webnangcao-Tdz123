# Checklist dự án KTX Care — Hệ thống quản lý ký túc xá sinh viên

Tạo: 19/10/2026 (commit `998ef9c`). Cập nhật: 19/10/2026 theo mã nguồn sau merge `3e2376d` (commit "add login" của backend).

**Quy ước**
- `[x]` xong · `[ ]` chưa làm · `[~]` làm một phần (ghi rõ còn thiếu gì).
- Cột phụ trách: **FE** = frontend, **BE** = backend, **Nhóm** = cần cả nhóm quyết hoặc cùng làm.
- Mỗi mục khi làm có một file log trong `docs/` (Mục tiêu → Đã làm → File thay đổi → Kiểm thử → Lưu ý), `docs/readme.md` là mục lục kèm mã commit.
- Thiết kế đích (luồng nghiệp vụ, dữ liệu, API, giao diện) ở [ke-hoach.md](ke-hoach.md).
- Mục BE chỉ là đề xuất từ phía FE; người phụ trách backend quyết định cách làm.

---

## 0. Đã có

- [x] Phân tích bài toán: 5 thực thể, quan hệ, UML (bản BTTH2 lưu ở `baocao-bt-th-2.md`; UML hiện trạng trong `readme.md`)
- [x] Khởi tạo backend NestJS + TypeORM + MySQL (Aiven, SSL), CORS, ValidationPipe toàn cục
- [x] Cấu hình qua `.env` bằng `@nestjs/config` (DB, SSL, `JWT_SECRET` bắt buộc ≥ 32 ký tự, `PORT` mặc định 5001); `database/init.sql` tạo DB + bảng `users`
- [x] Auth: đăng ký (luôn là STUDENT), đăng nhập (JWT 1 giờ), `GET /auth/profile`, bcrypt, ẩn cột password, chuẩn hóa username
- [x] Unit test backend cho `AuthService`, `UsersService`, `JwtAuthGuard`
- [x] Phân quyền: enum `ADMIN | MANAGER | STUDENT`, `@Roles` + `RolesGuard`, `JwtAuthGuard`
- [x] Room: CRUD có guard + DTO
- [~] Student, Contract, UtilityBill: có CRUD nhưng **chưa guard, chưa DTO**
- [~] Payment: mới có entity, chưa module/controller/service
- [x] Khởi tạo frontend React (CRA), CSS tự viết, layout sidebar/header/footer/banner (Bootstrap đã cài nhưng chưa dùng)
- [x] Hash-routing, `AuthContext`, `RoleBasedRoute`, trang 404; chưa đăng nhập thì chỉ thấy màn hình đăng nhập/đăng ký
- [x] Lớp gọi API (`api/client.js` + các `*.api.js`), `useApiResource`
- [x] Component dùng chung: `AsyncState`, `DataTable`, `Modal`, `PageHeading`, `StatusBadge`, `BillForm`
- [x] Trang đăng nhập (`LoginPage`) / đăng ký (`RegisterPage`); đăng nhập xong tự chuyển trang theo vai trò
- [~] Trang admin đã gọi API thật: Tổng quan, Phòng, Sinh viên, Hợp đồng, Hóa đơn, Chỉ số điện nước (CRUD cơ bản, chưa kiểm thử đầy đủ, chưa có quan hệ phòng ↔ hợp đồng ↔ hóa đơn)
- [~] Trang Cài đặt: chỉ hiển thị thông tin tài khoản + địa chỉ API
- [~] Cổng sinh viên: Hồ sơ hiển thị thông tin tài khoản; Phòng/Hóa đơn của tôi mới là khung chờ backend

---

## 1. Dọn dẹp và an toàn (làm trước tiên)

| # | Việc | Phụ trách |
|---|---|---|
| 1.1 | [~] **Khẩn**: đổi mật khẩu DB Aiven. Code đã bỏ giá trị mặc định (commit `1c56b71`), nhưng mật khẩu cũ **vẫn còn trong lịch sử git** nên vẫn phải đổi | Nhóm / BE |
| 1.2 | [~] Chuyển cấu hình sang `.env`: đã xong (commit `1c56b71`). Còn thiếu `backend/.env.example` (mẫu tạm có trong readme mục 7.2); `JWT_EXPIRES_IN` không còn được đọc, thời hạn token cố định 1 giờ | BE |
| 1.3 | [~] Đã xóa `App 2.js`, `logo.svg`, `reportWebVitals.js` (commit `1c56b71`). Còn: thêm `frontend/.env.example` (`REACT_APP_API_URL`); quyết định bỏ hay dùng Bootstrap/React-Bootstrap đang cài thừa | FE |
| 1.4 | [x] Rà soát `readme.md` cho khớp code hiện tại (cây thư mục, route, cài đặt `.env`, API chưa có guard, ghi chú UML, bảo mật). Readme bản cuối làm ở 2.7 và 10.1 — log: `docs/1.4-ra-soat-readme.md` | FE |
| 1.5 | [x] Tạo thư mục log + mục lục, làm cùng 1.4 (sau đó chuyển từ `logs/` sang `docs/`) | FE |
| 1.6 | [x] Viết `ke-hoach.md`: thiết kế đích (vai trò, luồng nghiệp vụ, quy tắc R1–R10, mô hình dữ liệu, API, giao diện) — bản đề xuất làm cơ sở cho mục 2 — log: `docs/1.6-ke-hoach.md` | FE |

## 2. Chốt thiết kế dữ liệu (cả nhóm thống nhất trước khi code tiếp)

Các đề xuất cho từng mục dưới đây có trong [ke-hoach.md](ke-hoach.md) (đánh dấu **[Chốt 2.x]**).

| # | Việc | Phụ trách |
|---|---|---|
| 2.1 | [ ] Thống nhất quy ước đặt tên (đề xuất: thuộc tính camelCase trong TS, tên cột snake_case qua `name:`), khóa chính (số tự tăng hay mã chuỗi) cho từng bảng | Nhóm |
| 2.2 | [ ] Liên kết `User 1–1 Student` (cột `user_id` trong Student); bỏ cột `role` thừa trong Student | Nhóm / BE |
| 2.3 | [ ] Trạng thái hợp đồng: `PENDING | ACTIVE | EXPIRED | TERMINATED` thay cho `is_active` | Nhóm |
| 2.4 | [ ] Trạng thái hóa đơn: `UNPAID | PAID` (hoặc giữ `is_paid`), có/không chia hóa đơn điện nước theo đầu người | Nhóm |
| 2.5 | [ ] Đơn giá điện/nước lưu ở đâu (bảng `Setting` hay hằng số) | Nhóm |
| 2.6 | [ ] Có làm phần mở rộng không: đơn đăng ký ở, yêu cầu sửa chữa, thông báo (quyết định phạm vi mục 7) | Nhóm |
| 2.7 | [ ] Cập nhật `ke-hoach.md` và UML trong readme theo thiết kế đã chốt | Nhóm |

## 3. Backend: hoàn thiện nền tảng

| # | Việc | Phụ trách |
|---|---|---|
| 3.1 | [ ] Bỏ comment, nối quan hệ: Contract↔Room, Contract↔Payment, UtilityBill↔Room | BE |
| 3.2 | [ ] Áp `JwtAuthGuard + RolesGuard` cho Student, Contract, UtilityBill | BE |
| 3.3 | [ ] DTO + class-validator cho Student, Contract, UtilityBill, Payment (hiện các endpoint này nhận `Partial<Entity>` nên body **không được kiểm tra**, còn nguy cơ mass assignment) | BE |
| 3.4 | [ ] `PaymentModule`: CRUD, lọc theo hợp đồng | BE |
| 3.5 | [ ] Trả lỗi nhất quán (404 khi không tìm thấy, 409 khi trùng, 400 khi sai dữ liệu) cho mọi module | BE |
| 3.6 | [ ] Đăng ký luôn là STUDENT (đã có). Còn: API để ADMIN tạo tài khoản cán bộ / đổi vai trò (`POST /users`, `PATCH /users/:id/role`) và cách tạo tài khoản ADMIN đầu tiên | BE |

## 4. Backend: nghiệp vụ

| # | Việc | Phụ trách |
|---|---|---|
| 4.1 | [ ] Tạo/duyệt hợp đồng: kiểm tra phòng còn chỗ, tăng `current_occupancy` trong transaction; 1 SV chỉ có 1 HĐ ACTIVE | BE |
| 4.2 | [ ] Kết thúc / gia hạn hợp đồng: giảm occupancy, đổi trạng thái | BE |
| 4.3 | [ ] Hóa đơn điện nước: chỉ số cũ tự lấy từ tháng trước, kiểm tra mới ≥ cũ, server tự tính `total_amount`; không trùng (phòng, tháng, năm) | BE |
| 4.4 | [ ] Nhập chỉ số hàng loạt: `POST /utility-bills/batch` | BE |
| 4.5 | [ ] API cho sinh viên: `GET /me/student`, `/me/contract`, `/me/bills`, `/me/payments`; `PATCH /me/student` (SĐT, email) | BE |
| 4.6 | [ ] Báo cáo: `GET /reports/summary?month=&year=` (lấp đầy theo tòa, doanh thu, công nợ, HĐ sắp hết hạn) | BE |
| 4.7 | [ ] Phân trang + tìm kiếm + lọc (`?page=&limit=&q=&building=&status=`) cho danh sách | BE |

## 5. Frontend: khu quản lý (ADMIN / MANAGER)

| # | Việc | Phụ trách |
|---|---|---|
| 5.1 | [ ] Kiểm thử lại toàn bộ trang admin hiện có trên app thật (tải / rỗng / lỗi, 375px, console, XSS), ghi lại lỗi | FE |
| 5.2 | [ ] Tòa nhà & Phòng: lưới phòng theo tòa/tầng, màu theo trạng thái (trống / còn chỗ / đầy), lọc, chi tiết phòng (SV đang ở, lịch sử HĐ) | FE |
| 5.3 | [ ] Sinh viên: tìm kiếm, lọc, trang chi tiết (hồ sơ, phòng, HĐ, công nợ), liên kết tài khoản | FE |
| 5.4 | [ ] Hợp đồng: tab theo trạng thái, form chọn SV + phòng còn chỗ, nút Duyệt / Gia hạn / Kết thúc, cảnh báo sắp hết hạn | FE |
| 5.5 | [ ] Chỉ số điện nước: bảng nhập nhanh cả tòa theo tháng, tự hiện chỉ số cũ, kiểm tra hợp lệ, xem trước số tiền | FE |
| 5.6 | [ ] Hóa đơn & Thanh toán: lọc tháng/tòa/trạng thái, ghi nhận thanh toán, xem/in hóa đơn | FE |
| 5.7 | [ ] Tổng quan: thẻ số liệu, biểu đồ lấp đầy theo tòa, doanh thu 6 tháng, danh sách việc cần làm | FE |
| 5.8 | [ ] Cài đặt: đơn giá điện/nước, quản lý tài khoản cán bộ (chỉ ADMIN) | FE |
| 5.9 | [ ] Sidebar theo vai trò: ẩn menu quản lý với STUDENT, ẩn mục chỉ-ADMIN với MANAGER | FE |

## 6. Frontend: cổng sinh viên (STUDENT)

| # | Việc | Phụ trách |
|---|---|---|
| 6.1 | [ ] Hồ sơ cá nhân: hiển thị hồ sơ Student, sửa SĐT/email | FE |
| 6.2 | [ ] Phòng của tôi: phòng, tòa, bạn cùng phòng, hợp đồng, ngày hết hạn | FE |
| 6.3 | [ ] Hóa đơn của tôi: tiền phòng + điện nước, đã/chưa đóng, lịch sử thanh toán | FE |
| 6.4 | [~] Đăng nhập xong STUDENT đã được chuyển tới `#my-profile` (commit `1c56b71`). Còn: trang chủ sinh viên đúng nghĩa (tóm tắt phòng, hóa đơn chưa đóng) | FE |

## 7. Mở rộng (tùy phạm vi chốt ở 2.6)

| # | Việc | Phụ trách |
|---|---|---|
| 7.1 | [ ] Đơn đăng ký ở trực tuyến: SV chọn tòa/phòng còn chỗ → gửi đơn → Manager duyệt | BE + FE |
| 7.2 | [ ] Yêu cầu sửa chữa: SV gửi, Manager cập nhật trạng thái | BE + FE |
| 7.3 | [ ] Thông báo trong hệ thống (HĐ sắp hết hạn, có hóa đơn mới) | BE + FE |
| 7.4 | [ ] Xuất Excel/PDF danh sách, hóa đơn | FE |

## 8. Trải nghiệm và chất lượng chung (FE)

| # | Việc | Phụ trách |
|---|---|---|
| 8.1 | [ ] Thông báo toast thành công/lỗi, hộp xác nhận trước khi xóa | FE |
| 8.2 | [ ] Validate form phía client khớp DTO backend | FE |
| 8.3 | [ ] Xử lý token hết hạn (401 → đăng xuất, quay lại đăng nhập) | FE |
| 8.4 | [ ] Rà soát responsive 375px toàn bộ trang, không lỗi console, không dùng `dangerouslySetInnerHTML` | FE |

## 9. Dữ liệu mẫu, kiểm thử, triển khai

| # | Việc | Phụ trách |
|---|---|---|
| 9.1 | [ ] Script seed: vài tòa, phòng, SV, HĐ, hóa đơn + tài khoản demo admin/manager/student (dữ liệu dễ nhận ra) | BE |
| 9.2 | [ ] Unit test service: xếp phòng, tính tiền điện nước | BE |
| 9.3 | [ ] E2E luồng chính: đăng ký → duyệt HĐ → nhập điện nước → SV xem hóa đơn → ghi thanh toán | Nhóm |
| 9.4 | [ ] Test component chính ở frontend (form, guard) | FE |
| 9.5 | [ ] Triển khai backend (Render/Railway), frontend (Vercel/Netlify), DB Aiven; cấu hình CORS + biến môi trường | Nhóm |
| 9.6 | [ ] Kiểm thử trên bản đã triển khai | Nhóm |

## 10. Tài liệu và nộp bài

| # | Việc | Phụ trách |
|---|---|---|
| 10.1 | [ ] Viết lại `readme.md`: giới thiệu, công nghệ, cài đặt & chạy, tài khoản demo, link triển khai | Nhóm |
| 10.2 | [ ] Tài liệu API (danh sách endpoint, quyền, ví dụ request/response) | BE |
| 10.3 | [ ] Báo cáo cuối kỳ: phân tích, thiết kế, ảnh chụp màn hình, phân công, kết quả kiểm thử | Nhóm |
| 10.4 | [ ] Slide + kịch bản demo | Nhóm |
| 10.5 | [ ] Dọn dữ liệu thử còn sót (theo log), kiểm tra lần cuối, nộp | Nhóm |
