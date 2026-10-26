# KTX Care Development Checklist

Checklist này phản ánh kiến trúc và công nghệ hiện tại của dự án **Xây dựng và vận hành hệ thống quản lý ký túc xá sinh viên**:

* **Mô hình kiến trúc:** Client – Server tách rời (SPA + REST API)
* **Frontend:** React 19 (Create React App), CSS tự viết, hash routing tự viết, `fetch` + React Context
* **Backend:** NestJS 12, TypeORM, `@nestjs/config`, JWT + bcrypt, class-validator
* **Database:** MySQL 8 (máy cá nhân hoặc Cloud Aiven có SSL)
* **Quy mô nhân sự:** Nhóm 03 thành viên (Chu Thanh Tân, Đặng Hải Nam, Lê Hải Sơn)
* **Đề thi (nguồn yêu cầu gốc):** [docs/de-bai.md](docs/de-bai.md)
* **Thiết kế đích:** [docs/ke-hoach.md](docs/ke-hoach.md) (bản đề xuất) · **Hiện trạng code:** [readme.md](readme.md)

**Cách dùng**

* Làm **từ trên xuống**: xong một phần mới sang phần sau. Trong cùng một phần, FE và BE có thể làm song song.
* Mỗi mục ghi người/nhóm phụ trách: **(FE)** frontend, **(BE)** backend, **(Nhóm)** cả nhóm quyết hoặc cùng làm. Mục BE do FE đề xuất, người phụ trách backend quyết cách làm.
* Mỗi mục làm xong có log trong `docs/` (Mục tiêu → Đã làm → File thay đổi → Kiểm thử → Lưu ý), mục lục và mã commit ở [docs/readme.md](docs/readme.md).

Ký hiệu:

* `[x]` Đã hoàn thành
* `[~]` Đang thực hiện / đã có một phần, ghi rõ còn thiếu gì
* `[ ]` Chưa thực hiện

---

## 0. Nền tảng đã có (trước khi lập checklist)

* [x] Phân tích bài toán: 5 thực thể, quan hệ, UML (bản BTTH2 lưu ở `docs/baocao-bt-th-2.md`; UML hiện trạng trong `readme.md`)
* [x] Khởi tạo backend NestJS + TypeORM + MySQL (Aiven, SSL), CORS, ValidationPipe toàn cục
* [x] Cấu hình qua `.env` bằng `@nestjs/config` (DB, SSL, `JWT_SECRET` bắt buộc ≥ 32 ký tự, `PORT` mặc định 5001); `database/init.sql` tạo DB + bảng `users`
* [x] Auth: đăng ký (luôn là STUDENT), đăng nhập (JWT 1 giờ), `GET /auth/profile`, bcrypt, ẩn cột password, chuẩn hóa username
* [x] Phân quyền: enum `ADMIN | MANAGER | STUDENT`, `@Roles` + `RolesGuard`, `JwtAuthGuard`
* [x] Unit test backend cho `AuthService`, `UsersService`, `JwtAuthGuard`
* [x] Room: CRUD có guard + DTO
* [~] Student, Contract, UtilityBill: có CRUD nhưng **chưa guard, chưa DTO** (làm ở 4.1, 4.2)
* [~] Payment: mới có entity, chưa module/controller/service (làm ở 4.3)
* [x] Khởi tạo frontend React (CRA), CSS tự viết, layout sidebar/header/footer/banner
* [x] Hash routing, `AuthContext`, `RoleBasedRoute`, trang 404; chưa đăng nhập thì chỉ thấy màn hình đăng nhập/đăng ký
* [x] Lớp gọi API (`api/client.js` + các `*.api.js`), hook `useApiResource`
* [x] Component dùng chung: `AsyncState`, `DataTable`, `Modal`, `PageHeading`, `StatusBadge`, `BillForm`
* [x] Trang đăng nhập (`LoginPage`) / đăng ký (`RegisterPage`); đăng nhập xong tự chuyển trang theo vai trò
* [~] Trang admin đã gọi API thật: Tổng quan, Phòng, Sinh viên, Hợp đồng, Hóa đơn, Chỉ số điện nước (CRUD cơ bản, chưa kiểm thử đầy đủ, chưa có quan hệ phòng ↔ hợp đồng ↔ hóa đơn)
* [~] Trang Cài đặt: chỉ hiển thị thông tin tài khoản + địa chỉ API
* [~] Cổng sinh viên: Hồ sơ hiển thị thông tin tài khoản; Phòng/Hóa đơn của tôi mới là khung chờ backend

## 1. Dọn dẹp, an toàn & tài liệu khởi đầu

* [x] **1.1** (Nhóm/BE) Đổi mật khẩu DB Aiven và bỏ thông tin DB khỏi code (code sạch từ commit `1c56b71`; Nam đánh dấu xong ở `7864eac`, xem mục 11)
* [x] **1.2** (BE) Chuyển cấu hình sang `.env` (commit `1c56b71`)
* [x] **1.3** (FE) Xóa file thừa `App 2.js`, `logo.svg`, `reportWebVitals.js` (commit `1c56b71`)
* [x] **1.4** (FE) Rà soát `readme.md` cho khớp code hiện tại — log `docs/1.4-ra-soat-readme.md`
* [x] **1.5** (FE) Tạo thư mục log + mục lục (nay là `docs/`)
* [x] **1.6** (FE) Viết `docs/ke-hoach.md`: thiết kế đích (vai trò, luồng L1–L6, quy tắc R1–R10, dữ liệu, API, giao diện) — log `docs/1.6-ke-hoach.md`
* [x] **1.7** (FE) Sắp xếp lại checklist theo giai đoạn, làm từ trên xuống — log `docs/1.7-sap-xep-checklist.md`
* [ ] **1.8** (BE) Thêm `backend/.env.example` (mẫu tạm có trong readme mục 7.2); quyết định có đọc lại `JWT_EXPIRES_IN` hay giữ cố định 1 giờ
* [ ] **1.9** (FE) Thêm `frontend/.env.example` (`REACT_APP_API_URL`)

## 2. Chốt thiết kế & tổ chức nhóm

Đề xuất cho các mục 2.4–2.9 có trong [docs/ke-hoach.md](docs/ke-hoach.md) (đánh dấu **[Chốt 2.x]**). Phần này phải xong trước khi code phần 3.

* [~] **2.1** (Nhóm) Thu thập đề bài và tiêu chí chấm của giảng viên; đối chiếu và bổ sung checklist nếu thiếu — đã ghi đề vào `docs/de-bai.md`, gom tài liệu vào `docs/` (log `docs/2.1-de-bai-va-sap-xep-docs.md`); còn: bổ sung checklist theo đề, hỏi giáo viên các điểm chưa rõ (mục 4 của `docs/de-bai.md`)
* [ ] **2.2** (Nhóm) Phân công theo người (ghi tên vào từng phần) và đặt mốc thời gian, hạn nộp
* [ ] **2.3** (Nhóm) Thống nhất quy trình git (mỗi người một nhánh `feature/*` hay cùng đẩy `main`, ai merge, cách đặt tên commit)
* [ ] **2.4** (Nhóm) Quy ước đặt tên (đề xuất: thuộc tính camelCase trong TS, tên cột snake_case qua `name:`) và kiểu khóa chính cho từng bảng
* [ ] **2.5** (Nhóm) Liên kết `User 1–1 Student` (cột `user_id` trong Student), cách SV đã có hồ sơ được liên kết với tài khoản; bỏ cột `role` thừa trong Student
* [ ] **2.6** (Nhóm) Trạng thái hợp đồng: `PENDING | ACTIVE | EXPIRED | TERMINATED` thay cho `is_active`; giá thuê chốt khi ký (`monthly_price`)
* [ ] **2.7** (Nhóm) Hóa đơn điện nước: `UNPAID | PAID` (hay giữ `is_paid`), thu theo phòng hay chia đầu người, thanh toán điện nước có ghi vào `Payment` không
* [ ] **2.8** (Nhóm) Đơn giá điện/nước lưu ở đâu (bảng `SETTINGS` hay hằng số)
* [ ] **2.9** (Nhóm) Phạm vi mở rộng: đơn đăng ký ở, yêu cầu sửa chữa, thông báo, xuất file (quyết định phần 8)
* [ ] **2.10** (Nhóm) Bootstrap/React-Bootstrap đang cài nhưng chưa dùng: bỏ hay dùng
* [ ] **2.11** (Nhóm) Cập nhật `docs/ke-hoach.md` và UML trong readme theo các quyết định trên, đổi trạng thái `docs/ke-hoach.md` thành "đã duyệt"

## 3. Database & dữ liệu (BE)

* [ ] **3.1** (BE) Nối quan hệ: Contract↔Room, Contract↔Payment, UtilityBill↔Room (đang comment trong entity)
* [ ] **3.2** (BE) Liên kết `User`–`Student` theo 2.5
* [ ] **3.3** (BE) Áp dụng quy ước tên/khóa (2.4) và trạng thái enum cho hợp đồng, hóa đơn (2.6, 2.7)
* [ ] **3.4** (BE) Bảng `SETTINGS` (nếu chốt ở 2.8) và các bảng mở rộng (nếu chốt ở 2.9)
* [ ] **3.5** (BE) Tạo bảng cho môi trường production: migration TypeORM hoặc `init.sql` đầy đủ (hiện `synchronize` tắt khi `NODE_ENV=production`, `init.sql` mới có bảng `users`)
* [ ] **3.6** (BE) Script seed: vài tòa, phòng, SV, HĐ, hóa đơn + tài khoản ADMIN đầu tiên và 3 tài khoản demo (admin/manager/student), dữ liệu dễ nhận ra
* [ ] **3.7** (Nhóm) Kiểm tra mọi thành viên chạy được backend với DB (máy cá nhân hoặc Aiven) theo readme

## 4. Backend API nền tảng

* [ ] **4.1** (BE) Áp `JwtAuthGuard + RolesGuard` cho Student, Contract, UtilityBill
* [ ] **4.2** (BE) DTO + class-validator cho Student, Contract, UtilityBill, Payment (hiện nhận `Partial<Entity>` nên body **không được kiểm tra**, còn nguy cơ mass assignment)
* [ ] **4.3** (BE) `PaymentModule`: CRUD, lọc theo hợp đồng
* [ ] **4.4** (BE) Mã lỗi nhất quán: 400 sai dữ liệu, 401, 403, 404 không tìm thấy, 409 vi phạm ràng buộc
* [ ] **4.5** (BE) API tài khoản cho ADMIN: `GET /users`, `POST /users` (tạo MANAGER), `PATCH /users/:id/role`
* [ ] **4.6** (BE) API đơn giá: `GET /settings` (ADMIN, MANAGER), `PUT /settings` (ADMIN)
* [ ] **4.7** (BE) API phòng còn chỗ và danh sách SV đang ở trong phòng
* [ ] **4.8** (BE) Phân trang + tìm kiếm + lọc (`?page=&limit=&q=&building=&status=`) cho danh sách
* [ ] **4.9** (BE) Bảo mật: giới hạn số lần đăng nhập sai, header bảo mật (`helmet`)
* [ ] **4.10** (BE) Tài liệu API cho frontend (endpoint, quyền, ví dụ request/response) trong `docs/`

## 5. Backend nghiệp vụ

Quy tắc R1–R10 xem [docs/ke-hoach.md](docs/ke-hoach.md) mục 4.

* [ ] **5.1** (BE) Tạo hợp đồng: kiểm tra phòng còn chỗ, 1 SV chỉ 1 HĐ `ACTIVE`, cập nhật sĩ số trong transaction (R1–R4)
* [ ] **5.2** (BE) Kết thúc / gia hạn hợp đồng, tự chuyển `EXPIRED` khi quá hạn
* [ ] **5.3** (BE) Chặn xóa cứng phòng/SV còn HĐ hoặc còn nợ, dùng xóa mềm (R5)
* [ ] **5.4** (BE) Hóa đơn điện nước: chỉ số cũ lấy từ tháng trước, mới ≥ cũ, server tự tính tiền, không trùng (phòng, tháng, năm), hóa đơn đã thu thì không sửa (R6–R9)
* [ ] **5.5** (BE) Nhập chỉ số hàng loạt cả tòa: `GET /utility-bill/draft`, `POST /utility-bill/batch`
* [ ] **5.6** (BE) API cho sinh viên: `GET/PATCH /me/student`, `GET /me/contract`, `/me/bills`, `/me/payments` (R10)
* [ ] **5.7** (BE) Đổi mật khẩu cho người dùng đang đăng nhập
* [ ] **5.8** (BE) Báo cáo `GET /reports/summary?month=&year=` (lấp đầy theo tòa, đã thu, công nợ, HĐ sắp hết hạn)
* [ ] **5.9** (BE) Unit test cho các quy tắc R1–R10

## 6. Frontend khu quản lý (ADMIN / MANAGER)

* [ ] **6.1** (FE) Kiểm thử các trang admin hiện có trên app thật với API mới (tải / rỗng / lỗi, 375px, console, XSS), ghi lại lỗi
* [ ] **6.2** (FE) Phần dùng chung: toast thành công/lỗi, hộp xác nhận trước khi xóa, validate form khớp DTO backend
* [ ] **6.3** (FE) Xử lý phiên: 401 → đăng xuất, về đăng nhập kèm thông báo; 403 → trang "Không có quyền"
* [ ] **6.4** (FE) Sidebar theo vai trò: ẩn menu quản lý với STUDENT, ẩn mục chỉ-ADMIN với MANAGER
* [ ] **6.5** (FE) Tòa nhà & Phòng: lưới phòng theo tòa/tầng, màu theo trạng thái, lọc, chi tiết phòng (SV đang ở, lịch sử HĐ)
* [ ] **6.6** (FE) Sinh viên: tìm kiếm, lọc, trang chi tiết (hồ sơ, tài khoản liên kết, phòng, HĐ, công nợ)
* [ ] **6.7** (FE) Hợp đồng: tab theo trạng thái, form theo bước (SV → phòng còn chỗ → thời hạn, cọc), Gia hạn / Kết thúc, ghi nhận thanh toán
* [ ] **6.8** (FE) Chỉ số điện nước: bảng nhập nhanh cả tòa theo tháng, chỉ số cũ tự điền, báo lỗi ngay, xem trước số tiền
* [ ] **6.9** (FE) Hóa đơn: lọc tháng/tòa/trạng thái, đánh dấu đã thu, xem/in hóa đơn
* [ ] **6.10** (FE) Tổng quan: thẻ số liệu, biểu đồ lấp đầy theo tòa, thu tiền 6 tháng, danh sách việc cần làm
* [ ] **6.11** (FE) Cài đặt: đơn giá điện/nước, quản lý tài khoản cán bộ (chỉ ADMIN)

## 7. Frontend cổng sinh viên (STUDENT)

* [~] **7.1** (FE) Trang chủ sinh viên: đăng nhập xong đã chuyển tới `#my-profile` (commit `1c56b71`); còn trang tóm tắt phòng, hạn HĐ, hóa đơn chưa đóng
* [ ] **7.2** (FE) Hồ sơ cá nhân: hiển thị hồ sơ Student, sửa SĐT/email, đổi mật khẩu
* [ ] **7.3** (FE) Phòng của tôi: phòng, tòa, bạn cùng phòng, hợp đồng, ngày hết hạn
* [ ] **7.4** (FE) Hóa đơn của tôi: tiền phòng + điện nước, đã/chưa đóng, lịch sử thanh toán

## 8. Mở rộng (theo phạm vi chốt ở 2.9)

* [ ] **8.1** (BE + FE) Đơn đăng ký ở trực tuyến: SV chọn phòng còn chỗ → gửi đơn → cán bộ duyệt
* [ ] **8.2** (BE + FE) Yêu cầu sửa chữa: SV gửi, cán bộ cập nhật trạng thái
* [ ] **8.3** (BE + FE) Thông báo trong hệ thống (HĐ sắp hết hạn, có hóa đơn mới)
* [ ] **8.4** (FE) Xuất Excel/PDF danh sách, hóa đơn

## 9. Kiểm thử & triển khai

* [ ] **9.1** (FE) Rà soát toàn bộ giao diện: 375px, không lỗi console, không render HTML từ dữ liệu người dùng
* [ ] **9.2** (FE) Test component chính ở frontend (form, guard, xử lý phiên)
* [ ] **9.3** (Nhóm) E2E luồng chính: lập HĐ → nhập điện nước → SV xem hóa đơn → ghi thanh toán → kết thúc HĐ
* [ ] **9.4** (Nhóm) Triển khai backend, frontend, DB lên cloud; cấu hình CORS + biến môi trường
* [ ] **9.5** (Nhóm) Kiểm thử trên bản đã triển khai với 3 tài khoản demo
* [ ] **9.6** (Nhóm) *(Tùy chọn)* Tự chạy lint + test khi push (GitHub Actions)

## 10. Tài liệu & bảo vệ

* [ ] **10.1** (Nhóm) Viết lại `readme.md` bản cuối: giới thiệu, công nghệ, cài đặt & chạy, tài khoản demo, link triển khai (gộp phần thiết kế từ `docs/ke-hoach.md`)
* [ ] **10.2** (Nhóm) Hướng dẫn sử dụng cho cán bộ và sinh viên (có ảnh chụp màn hình)
* [ ] **10.3** (Nhóm) Báo cáo cuối kỳ: phân tích, thiết kế, phân công, kết quả kiểm thử
* [ ] **10.4** (Nhóm) Slide + kịch bản demo bảo vệ
* [ ] **10.5** (Nhóm) Dọn dữ liệu thử còn sót (theo log), kiểm tra lần cuối, nộp

## 11. Việc tồn đọng / cần xác nhận

* [ ] Nam xác nhận đã đổi mật khẩu Aiven (1.1); mật khẩu cũ vẫn nằm trong lịch sử git nên chỉ an toàn khi đã đổi
* [ ] Xác minh phiên bản Node.js tối thiểu cho NestJS 12 và ghi vào readme mục 7.1
* [ ] Token đang lưu ở `localStorage`: chấp nhận và ghi rủi ro XSS vào báo cáo, hay đổi sang cookie `httpOnly` (cần BE)

---

## Project Architecture

```text
NhomBTL-Webnangcao-Tdz123/
├── quan-ly-ktx/
│   ├── backend/              # NestJS + TypeORM
│   │   ├── certs/            # CA certificate cho MySQL SSL
│   │   ├── database/         # init.sql
│   │   └── src/
│   │       ├── auth/         # Đăng ký, đăng nhập, JWT guard
│   │       ├── common/       # Role, @Roles, RolesGuard, BaseEntity
│   │       ├── database/     # DataSource (đọc .env)
│   │       └── modules/      # room, student, contract, utility-bill, payment
│   └── frontend/             # React 19 (CRA)
│       └── src/
│           ├── api/          # Gọi REST API
│           ├── components/   # common, guards, layout
│           ├── context/      # AuthContext
│           ├── hooks/        # useApiResource
│           ├── pages/        # auth, admin, student
│           └── utils/        # hashRoute
├── .claude/CLAUDE.md         # Hướng dẫn cho AI (Claude Code tự đọc)
├── docs/                     # Tài liệu + log từng mục checklist (mục lục: docs/readme.md)
│   ├── de-bai.md             # Đề thi cuối kỳ: yêu cầu từng câu, điều kiện 0 điểm
│   ├── ke-hoach.md           # Thiết kế đích (bản đề xuất)
│   ├── baocao-bt-th-2.md     # Báo cáo bài thực hành số 2
│   └── luu-tru/              # Bản cũ không dùng nữa (checklist-v1.md)
├── checklist.md              # Bảng theo dõi tiến độ (file này)
└── readme.md                 # Hiện trạng, cài đặt và chạy dự án
```

---

## Current Milestone

**Cập nhật 19/10/2026:** Xong phần 1 trừ 1.8, 1.9. Nền tảng đã có auth JWT + phân quyền, CRUD cơ bản 4 bảng và khung giao diện admin/cổng sinh viên; các bảng chưa nối quan hệ nên chưa có nghiệp vụ KTX thật. **Việc tiếp theo:** cả nhóm làm phần 2 (đề bài, phân công, duyệt `docs/ke-hoach.md`) trước khi backend bắt đầu phần 3.
