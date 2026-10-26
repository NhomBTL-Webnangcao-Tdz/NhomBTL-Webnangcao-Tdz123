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
* Nhãn **[Đề x]** cho biết mục phục vụ câu nào của đề thi; bảng đối chiếu ở ngay dưới. Hạn nộp **09/11/2026**.
* Mỗi mục làm xong có log trong `docs/` (Mục tiêu → Đã làm → File thay đổi → Kiểm thử → Lưu ý), mục lục và mã commit ở [docs/readme.md](docs/readme.md).

Ký hiệu:

* `[x]` Đã hoàn thành
* `[~]` Đang thực hiện / đã có một phần, ghi rõ còn thiếu gì
* `[ ]` Chưa thực hiện

---

## Đối chiếu đề thi → checklist

Chi tiết từng câu xem [docs/de-bai.md](docs/de-bai.md). Cột "Mục" là các mục checklist phải xong để đạt câu đó.

| Câu | Nội dung | Mục |
|---|---|---|
| 1 | User stories ≥ 12, đúng định dạng | 2.12 |
| 2 | Phân tích; UML lớp + sơ đồ thuật toán | 2.11, 2.13 |
| 3a, 3b | Wireframe; luồng xử lý thông tin | 2.14 |
| 3c | NestJS phân lớp, React, **LICENSE** | 0 (đã có), 1.10 |
| 3d | Security backend; FE không lộ dữ liệu | 1.11, 4.1, 4.2, 4.9, 4.11, 9.1 |
| 4a | API nghiệp vụ | 4.3–4.8, 5.1–5.8 |
| 4b | Tài liệu hóa API | 4.10 |
| 4c | Token, hash, phiên, cookie, CORS, XSS/CSRF, xác thực | 4.9, 4.11, 6.3 |
| 5a | Bố cục FE khớp wireframe | 2.14, 6.x, 7.x |
| 5b | UI theo mẫu React Native, **react-bootstrap** | 2.10, 2.16, 6.12 |
| 5c | Usability (≤ 4 thao tác) | 6.13 |
| 6a | Kết nối CSDL, ORM | 0 (đã có), 3.1–3.6 |
| 6b | Phân tích ORM + truy vấn | 3.8 |
| 7a | Bắt lỗi mọi trường hợp | 4.4, 4.12, 6.2 |
| 7b | Unit test trong `test/` cho mọi chức năng câu 1 | 5.9, 5.10 |
| 7c | Kiểm thử toàn bộ ứng dụng | 9.3, 9.5 |
| 7d | Phân tích ca lỗi / thành công | 9.7 |
| 7e | Kiểm thử giao diện FE | 9.1, 9.2 |
| 8 | Báo cáo in, link demo < 8 phút, link GitHub, đóng góp | 10.3, 10.4, 10.7 |
| 9 | Luật, đạo đức nghề nghiệp, đạo đức xã hội, tự kiểm tra an ninh | 10.6 |
| 10 | Commit từng người, đóng góp, chuyên cần | 10.7 |
| 0 điểm | PDF, bản cứng, ký danh sách, link GitHub + demo, mỗi người có đóng góp | 10.7, 10.8 |

---

## 0. Nền tảng đã có (trước khi lập checklist)

* [x] Phân tích bài toán: 5 thực thể, quan hệ, UML (bản BTTH2 lưu ở `docs/baocao-bt-th-2.md`; UML hiện trạng trong `readme.md`)
* [x] Khởi tạo backend NestJS + TypeORM + MySQL (Aiven, SSL), CORS, ValidationPipe toàn cục
* [x] Cấu hình qua `.env` bằng `@nestjs/config` (DB, SSL, `JWT_SECRET` bắt buộc ≥ 32 ký tự, `PORT` mặc định 5001); `database/init.sql` tạo DB + bảng `users`
* [x] Auth: đăng ký (luôn là STUDENT), đăng nhập (JWT 1 giờ), `GET /auth/profile`, bcrypt, ẩn cột password, chuẩn hóa username
* [x] Phân quyền: enum `ADMIN | MANAGER | STUDENT`, `@Roles` + `RolesGuard`, `JwtAuthGuard`
* [x] Unit test backend cho `AuthService`, `UsersService`, `JwtAuthGuard`
* [x] Room: CRUD có guard + DTO
* [~] Student, Contract, UtilityBill: có CRUD; từ commit `fde890e` đã có guard, DTO mới có một phần (xem 4.1, 4.2)
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
* [x] **1.9** (FE) Thêm `frontend/.env.example` (`REACT_APP_API_URL`, `REACT_APP_MANAGER_EMAIL`, `REACT_APP_MANAGER_PHONE`) — log `docs/1.9-frontend-env-example.md`
* [ ] **1.10** (Nhóm) Thêm file `LICENSE` có thông báo bản quyền ở gốc repo và `quan-ly-ktx/frontend/`; chọn loại license (VD MIT), ghi tên nhóm và năm; sửa trường `license` trong 2 `package.json` cho khớp **[Đề 3c]**
* [ ] **1.11** (BE) Gỡ `quan-ly-ktx/backend/storage/` khỏi git (`git rm -r --cached`): đang commit ảnh đồng hồ, biên lai thật của người dùng dù `.gitignore` đã chặn **[Đề 3d, 9]**

## 2. Chốt thiết kế & tổ chức nhóm

Đề xuất cho các mục 2.4–2.9 có trong [docs/ke-hoach.md](docs/ke-hoach.md) (đánh dấu **[Chốt 2.x]**). Phần này phải xong trước khi code phần 3. Các mục 2.12–2.14 là tài liệu thiết kế đề bắt buộc nộp, có thể làm song song với các phần sau.

* [~] **2.1** (Nhóm) Thu thập đề bài và tiêu chí chấm của giảng viên; đối chiếu và bổ sung checklist nếu thiếu — đã ghi đề vào `docs/de-bai.md`, gom tài liệu vào `docs/` (log `docs/2.1-de-bai-va-sap-xep-docs.md`); đã bổ sung checklist theo đề (bảng đối chiếu ở đầu file, log `docs/2.1-bo-sung-checklist-theo-de.md`); còn: hỏi giáo viên các điểm chưa rõ (2.15)
* [ ] **2.2** (Nhóm) Phân công theo người (ghi tên vào từng phần) và đặt mốc thời gian; hạn nộp đề cho là **09/11/2026** (bản cứng trước 17h, PDF trước 23h59)
* [ ] **2.3** (Nhóm) Thống nhất quy trình git (mỗi người một nhánh `feature/*` hay cùng đẩy `main`, ai merge, cách đặt tên commit)
* [ ] **2.4** (Nhóm) Quy ước đặt tên (đề xuất: thuộc tính camelCase trong TS, tên cột snake_case qua `name:`) và kiểu khóa chính cho từng bảng
* [ ] **2.5** (Nhóm) Liên kết `User 1–1 Student` (cột `user_id` trong Student), cách SV đã có hồ sơ được liên kết với tài khoản; bỏ cột `role` thừa trong Student
* [ ] **2.6** (Nhóm) Trạng thái hợp đồng: `PENDING | ACTIVE | EXPIRED | TERMINATED` thay cho `is_active`; giá thuê chốt khi ký (`monthly_price`)
* [ ] **2.7** (Nhóm) Hóa đơn điện nước: `UNPAID | PAID` (hay giữ `is_paid`), thu theo phòng hay chia đầu người, thanh toán điện nước có ghi vào `Payment` không
* [~] **2.8** (Nhóm) Đơn giá điện/nước lưu ở đâu (bảng `SETTINGS` hay hằng số) — code đã có bảng `utility_tariff` + API `utility-bill/tariff` (commit `fde890e`); nhóm xác nhận giữ cách này
* [ ] **2.9** (Nhóm) Phạm vi mở rộng: đơn đăng ký ở, yêu cầu sửa chữa, thông báo, xuất file (quyết định phần 8)
* [ ] **2.10** (Nhóm) React-Bootstrap đang cài nhưng chưa file nào dùng. **Đề 5b bắt buộc dùng `react-bootstrap`**: chốt phạm vi chuyển đổi (trang chủ theo mẫu React Native, layout, form, bảng…) **[Đề 5b]**
* [ ] **2.11** (Nhóm) Cập nhật `docs/ke-hoach.md` và UML trong readme theo các quyết định trên, đổi trạng thái `docs/ke-hoach.md` thành "đã duyệt" **[Đề 2b]**
* [~] **2.12** (Nhóm) User stories: tối thiểu 12 câu, đúng định dạng `Là <vai trò>, tôi muốn <hành động> (để <lợi ích>).`, đánh mã US-xx, mỗi câu ứng với API, màn hình, test **[Đề 1]** — bản nháp 24 câu ở `docs/user-stories.md` (log `docs/2.12-user-stories.md`); còn: nhóm duyệt
* [ ] **2.13** (Nhóm) Phân tích yêu cầu, đối tượng, quan hệ, phương thức; sơ đồ thuật toán (flowchart) cho các nghiệp vụ chính **[Đề 2a, 2b]**
* [ ] **2.14** (Nhóm) Wireframe các màn hình chính; sơ đồ luồng xử lý thông tin (người dùng → React → API → Controller → Service → DB) cho 2–3 luồng chính **[Đề 3a, 3b]**
* [ ] **2.15** (Nhóm) Hỏi giáo viên 5 điểm chưa rõ của đề, ghi câu trả lời vào mục 4 của `docs/de-bai.md`
* [ ] **2.16** (Nhóm) Chọn một trang chủ: `pages/landing/` trên `main` (Nam) hay `pages/public/` ở nhánh `feature/trang-chu-tandz` (Tân, chưa merge); merge hoặc bỏ nhánh còn lại **[Đề 5b]**

## 3. Database & dữ liệu (BE)

* [ ] **3.1** (BE) Nối quan hệ: Contract↔Room, Contract↔Payment, UtilityBill↔Room (đang comment trong entity)
* [ ] **3.2** (BE) Liên kết `User`–`Student` theo 2.5
* [ ] **3.3** (BE) Áp dụng quy ước tên/khóa (2.4) và trạng thái enum cho hợp đồng, hóa đơn (2.6, 2.7)
* [ ] **3.4** (BE) Bảng `SETTINGS` (nếu chốt ở 2.8) và các bảng mở rộng (nếu chốt ở 2.9)
* [ ] **3.5** (BE) Tạo bảng cho môi trường production: migration TypeORM hoặc `init.sql` đầy đủ (hiện `synchronize` tắt khi `NODE_ENV=production`, `init.sql` mới có bảng `users`)
* [ ] **3.6** (BE) Script seed: vài tòa, phòng, SV, HĐ, hóa đơn + tài khoản ADMIN đầu tiên và 3 tài khoản demo (admin/manager/student), dữ liệu dễ nhận ra
* [ ] **3.7** (Nhóm) Kiểm tra mọi thành viên chạy được backend với DB (máy cá nhân hoặc Aiven) theo readme
* [ ] **3.8** (BE) Viết phân tích ORM cho báo cáo: cấu hình DataSource, entity ↔ bảng, quan hệ ↔ khóa ngoại, repository; kèm câu SQL thật do TypeORM sinh ra (bật `logging` để lấy) **[Đề 6b]**

## 4. Backend API nền tảng

* [x] **4.1** (BE) Áp `JwtAuthGuard + RolesGuard` cho Student, Contract, UtilityBill — mọi controller nghiệp vụ đã có guard (commit `fde890e`)
* [~] **4.2** (BE) DTO + class-validator cho Student, Contract, UtilityBill, Payment — đã có DTO cho room, meter-reading, residence-request, tariff, general charge, hồ sơ SV; **còn** `POST/PUT` của Contract, Student, UtilityBill nhận `Partial<Entity>` (ValidationPipe bỏ qua kiểu này nên body **không được kiểm tra**, nguy cơ mass assignment) và `PATCH residence-requests/:id/reject` dùng kiểu inline **[Đề 3d, 4c]**
* [ ] **4.3** (BE) `PaymentModule`: CRUD, lọc theo hợp đồng
* [ ] **4.4** (BE) Mã lỗi nhất quán: 400 sai dữ liệu, 401, 403, 404 không tìm thấy, 409 vi phạm ràng buộc
* [ ] **4.5** (BE) API tài khoản cho ADMIN: `GET /users`, `POST /users` (tạo MANAGER), `PATCH /users/:id/role`
* [ ] **4.6** (BE) API đơn giá: `GET /settings` (ADMIN, MANAGER), `PUT /settings` (ADMIN)
* [ ] **4.7** (BE) API phòng còn chỗ và danh sách SV đang ở trong phòng
* [ ] **4.8** (BE) Phân trang + tìm kiếm + lọc (`?page=&limit=&q=&building=&status=`) cho danh sách
* [ ] **4.9** (BE) Bảo mật: giới hạn số lần đăng nhập sai, header bảo mật (`helmet`) **[Đề 3d, 4c]**
* [ ] **4.10** (BE) Tài liệu hóa API theo hướng dẫn trên lớp (tạm hiểu là Swagger/OpenAPI, chờ 2.15): endpoint, quyền, ví dụ request/response, mã lỗi **[Đề 4b]**
* [ ] **4.11** (BE + FE) Phiên đăng nhập và cookie: chốt giữ token ở `localStorage` hay chuyển sang cookie `httpOnly; Secure; SameSite` (khi đó cần chống CSRF); đăng xuất, hết hạn phiên; transaction DB cho thao tác ghi nhiều bảng **[Đề 4c]** (thay cho câu hỏi về token ở phần 11)
* [ ] **4.12** (BE) Exception filter chung: trả lỗi cùng một dạng, không lộ stack trace hay câu SQL ra client **[Đề 7a]**

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
* [ ] **5.10** (BE) Unit test cho **mọi user story** của 2.12, đặt trong thư mục `test/` (chờ 2.15 xác nhận); hiện còn thiếu spec cho room, contract, utility-bill, notification **[Đề 7b]**

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
* [ ] **6.12** (FE) Chuyển giao diện sang `react-bootstrap` theo phạm vi chốt ở 2.10; trang chủ theo mẫu React Native (3 ảnh chụp kèm đề) **[Đề 5b]**
* [ ] **6.13** (FE) Rà usability: mỗi tác vụ chính ≤ 4 thao tác, gợi ý / tự điền, thông báo không gây phiền; ghi bảng số thao tác vào báo cáo **[Đề 5c]**

## 7. Frontend cổng sinh viên (STUDENT)

* [~] **7.1** (FE) Trang chủ sinh viên: đăng nhập xong đã chuyển tới `#my-profile` (commit `1c56b71`); còn trang tóm tắt phòng, hạn HĐ, hóa đơn chưa đóng
* [~] **7.2** (FE) Hồ sơ cá nhân: đã có `ProfilePage` + `PUT student/me/profile` (commit `fde890e`), chưa kiểm thử; cần đối chiếu đủ ý — hiển thị hồ sơ Student, sửa SĐT/email, đổi mật khẩu
* [~] **7.3** (FE) Phòng của tôi: đã có `RoomPage` (commit `fde890e`), chưa kiểm thử; cần đối chiếu đủ ý — phòng, tòa, bạn cùng phòng, hợp đồng, ngày hết hạn
* [~] **7.4** (FE) Hóa đơn của tôi: đã có `student/BillsPage` (commit `fde890e`), chưa kiểm thử; cần đối chiếu đủ ý — tiền phòng + điện nước, đã/chưa đóng, lịch sử thanh toán

## 8. Mở rộng (theo phạm vi chốt ở 2.9)

* [~] **8.1** (BE + FE) Đơn đăng ký ở trực tuyến: SV chọn phòng còn chỗ → gửi đơn → cán bộ duyệt — đã có API `residence-requests` + `ResidenceRequestsPage` (commit `fde890e`), chưa kiểm thử
* [ ] **8.2** (BE + FE) Yêu cầu sửa chữa: SV gửi, cán bộ cập nhật trạng thái
* [~] **8.3** (BE + FE) Thông báo trong hệ thống (HĐ sắp hết hạn, có hóa đơn mới) — đã có API `notifications/me` (commit `fde890e`), chưa kiểm thử
* [ ] **8.4** (FE) Xuất Excel/PDF danh sách, hóa đơn

## 9. Kiểm thử & triển khai

* [ ] **9.1** (FE) Rà soát toàn bộ giao diện: 375px, không lỗi console, không render HTML từ dữ liệu người dùng, không `console.log` dữ liệu người dùng **[Đề 3d, 7e]**
* [ ] **9.2** (FE) Test component chính ở frontend (form, guard, xử lý phiên) **[Đề 7e]**
* [ ] **9.3** (Nhóm) E2E luồng chính: lập HĐ → nhập điện nước → SV xem hóa đơn → ghi thanh toán → kết thúc HĐ **[Đề 7c]**
* [ ] **9.4** (Nhóm) Triển khai backend, frontend, DB lên cloud; cấu hình CORS + biến môi trường
* [ ] **9.5** (Nhóm) Kiểm thử trên bản đã triển khai với 3 tài khoản demo
* [ ] **9.6** (Nhóm) *(Tùy chọn)* Tự chạy lint + test khi push (GitHub Actions)
* [ ] **9.7** (Nhóm) Bảng ca kiểm thử: đầu vào, kết quả mong đợi, kết quả thực tế, ảnh chụp; gồm cả ca lỗi và ca thành công **[Đề 7d]**

## 10. Tài liệu & bảo vệ

* [ ] **10.1** (Nhóm) Viết lại `readme.md` bản cuối: giới thiệu, công nghệ, cài đặt & chạy, tài khoản demo, link triển khai (gộp phần thiết kế từ `docs/ke-hoach.md`)
* [ ] **10.2** (Nhóm) Hướng dẫn sử dụng cho cán bộ và sinh viên (có ảnh chụp màn hình)
* [ ] **10.3** (Nhóm) Báo cáo cuối kỳ theo mẫu Phenikaa, trả lời đủ 10 câu của đề; có trang link demo, link GitHub, đóng góp từng thành viên **[Đề 8]**
* [ ] **10.4** (Nhóm) Video demo **dưới 8 phút** (đưa link vào báo cáo) + slide, kịch bản demo **[Đề 8]**
* [ ] **10.5** (Nhóm) Dọn dữ liệu thử còn sót (theo log), kiểm tra lần cuối
* [ ] **10.6** (Nhóm) Phần luật (VD Nghị định 13/2023 về dữ liệu cá nhân, Luật An ninh mạng, license thư viện), đạo đức nghề nghiệp, đạo đức xã hội; bảng tự kiểm tra an ninh an toàn của dự án **[Đề 9]**
* [ ] **10.7** (Nhóm) Bảng đóng góp từng thành viên, đối chiếu commit; **mỗi người phải có commit và đóng góp thật** (Sơn hiện mới có 2 commit, ngày 23/09) **[Đề 10a, 10b; điều kiện 0 điểm]**
* [ ] **10.8** (Nhóm) Nộp trước 09/11/2026: PDF lên Canvas, bản cứng mỗi người 1 bản tại phòng 2310 nhà A9, **ký danh sách nộp** **[điều kiện 0 điểm]**

## 11. Việc tồn đọng / cần xác nhận

* [ ] Nam xác nhận đã đổi mật khẩu Aiven (1.1); mật khẩu cũ vẫn nằm trong lịch sử git nên chỉ an toàn khi đã đổi
* [ ] Xác minh phiên bản Node.js tối thiểu cho NestJS 12 và ghi vào readme mục 7.1
* [ ] Token đang lưu ở `localStorage`: chấp nhận và ghi rủi ro XSS vào báo cáo, hay đổi sang cookie `httpOnly` (cần BE) — chuyển thành mục 4.11

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
│   ├── user-stories.md       # User stories US-xx (Đề 1)
│   ├── ke-hoach.md           # Thiết kế đích (bản đề xuất)
│   ├── baocao-bt-th-2.md     # Báo cáo bài thực hành số 2
│   └── luu-tru/              # Bản cũ không dùng nữa (checklist-v1.md)
├── checklist.md              # Bảng theo dõi tiến độ (file này)
└── readme.md                 # Hiện trạng, cài đặt và chạy dự án
```

---

## Current Milestone

**Cập nhật 26/10/2026:** Đã ghi đề thi vào `docs/de-bai.md` và đối chiếu với checklist (bảng ở đầu file). Code đã đi xa hơn checklist cũ (commit `fde890e`: chỉ số điện nước, đơn đăng ký ở, thông báo, đơn giá, trang sinh viên); các mục liên quan đã chuyển `[~]`, chưa kiểm thử. Còn khoảng 2 tuần đến hạn 09/11. **Việc gấp:** 2.2 phân công, 2.15 hỏi giáo viên, 1.10 LICENSE, duyệt 2.12 user stories, 2.10 + 6.12 react-bootstrap.

**Cập nhật 19/10/2026:** Xong phần 1 trừ 1.8, 1.9. Nền tảng đã có auth JWT + phân quyền, CRUD cơ bản 4 bảng và khung giao diện admin/cổng sinh viên; các bảng chưa nối quan hệ nên chưa có nghiệp vụ KTX thật. **Việc tiếp theo:** cả nhóm làm phần 2 (đề bài, phân công, duyệt `docs/ke-hoach.md`) trước khi backend bắt đầu phần 3.
