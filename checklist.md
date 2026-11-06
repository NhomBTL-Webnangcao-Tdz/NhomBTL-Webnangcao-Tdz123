# KTX Care Development Checklist

Checklist này phản ánh kiến trúc và công nghệ hiện tại của dự án **Xây dựng và vận hành hệ thống quản lý ký túc xá sinh viên**:

* **Mô hình kiến trúc:** Client – Server tách rời (SPA + REST API)
* **Frontend:** React 19 (Create React App), CSS tự viết, hash routing tự viết, `fetch` + React Context
* **Backend:** NestJS 12, TypeORM, `@nestjs/config`, JWT + bcrypt, class-validator
* **Database:** MySQL 8 (máy cá nhân hoặc Cloud Aiven có SSL)
* **Quy mô nhân sự:** Nhóm 03 thành viên (Chu Thanh Tân, Đặng Hải Nam, Lê Hải Sơn)
* **Hạn nộp:** 09/11/2026
* **Tài liệu:** đề thi `docs/de-bai.md`, thiết kế đích `docs/ke-hoach.md`, hiện trạng code `readme.md`

Cách dùng:

* Làm từ trên xuống: xong một phần mới sang phần sau. Trong cùng một phần, FE và BE có thể làm song song.
* (FE) frontend, (BE) backend, (Nhóm) cả nhóm quyết hoặc cùng làm. Mục BE do FE đề xuất, người phụ trách backend quyết cách làm.
* [Đề x] là câu của đề thi mà mục đó phục vụ.
* Mỗi mục làm xong có log trong `docs/` (Mục tiêu → Đã làm → File thay đổi → Kiểm thử → Lưu ý). Mục lục và mã commit ở `docs/logs.md`.

Ký hiệu:

* `[x]` Đã hoàn thành
* `[~]` Đang thực hiện / đã có một phần, ghi rõ còn thiếu gì
* `[ ]` Chưa thực hiện

---

## Đối chiếu đề thi với checklist

Chi tiết từng câu: `docs/de-bai.md`.

* Câu 1, user stories ≥ 12: 2.12
* Câu 2, phân tích, UML lớp, sơ đồ thuật toán: 2.11, 2.13
* Câu 3a, 3b, wireframe và luồng xử lý: 2.14
* Câu 3c, NestJS phân lớp, React, LICENSE: phần 0 (đã có), 1.10
* Câu 3d, security backend, FE không lộ dữ liệu: 1.11, 4.1, 4.2, 4.9, 4.11, 9.1
* Câu 4a, API nghiệp vụ: 4.3 đến 4.8, 5.1 đến 5.8
* Câu 4b, tài liệu hóa API (Postman, Swagger): 4.10
* Câu 4c, token, hash, phiên, cookie, CORS, XSS/CSRF, xác thực: 4.9, 4.11, 6.3
* Câu 5a, bố cục FE khớp wireframe: 2.14, phần 6, phần 7
* Câu 5b, UI theo mẫu React Native, react-bootstrap: 2.10, 2.16, 6.12
* Câu 5c, usability (≤ 4 thao tác): 6.13
* Câu 6a, kết nối CSDL, ORM: phần 0 (đã có), 3.1 đến 3.6
* Câu 6b, phân tích ORM và truy vấn: 3.8
* Câu 7a, bắt lỗi: 4.4, 4.12, 6.2
* Câu 7b, unit test trong `test/` cho mọi chức năng câu 1: 5.9, 5.10
* Câu 7c, kiểm thử toàn bộ ứng dụng: 9.3, 9.5
* Câu 7d, phân tích ca lỗi và thành công: 9.7
* Câu 7e, kiểm thử giao diện FE: 9.1, 9.2
* Câu 8, báo cáo in, link demo < 8 phút, link GitHub, đóng góp: 10.3, 10.4, 10.7
* Câu 9, luật, đạo đức, tự kiểm tra an ninh: 10.6
* Câu 10, commit từng người, đóng góp, chuyên cần: 10.7
* Điều kiện 0 điểm (PDF, bản cứng, ký danh sách, link GitHub và demo, mỗi người có đóng góp): 10.7, 10.8

---

## Phân công (chốt 01/11/2026)

Từ 01/11 Tân được nhóm ủy quyền làm cả backend và frontend, chừa khối hợp đồng – thanh toán – báo cáo cho Nam và vài việc cho Sơn để mỗi người có đóng góp thật. Người phụ trách ghi trong ngoặc ở từng mục.

* Tân kiểm: mục code đã có (thường do Nam làm ở `fde890e`), chỉ cần kiểm trên app thật rồi đánh dấu.
* Tân, đợt A (1–2/11), backend bảo mật, API: 4.2, 4.4, 4.12, 4.10, 4.5 + 6.11, 7.2
* Tân, đợt B (3/11), CSDL và test: 3.5, 3.6, 3.7, 3.8
* Tân, đợt C (4–5/11), frontend: 6.1, 6.2, 6.9, 6.10, 6.12 phần 2, 6.13
* Tân, đợt D (6–8/11), tích hợp, triển khai, tài liệu: 9.3, 9.4, 9.5, 9.6 (tùy chọn), 10.1, 10.3, 10.4, 10.5, phần 11
* Nam (xong trước 5/11 để chạy E2E): 4.3, 5.1, 5.2, 5.3, 5.8, 6.7; dọn 1.8, 1.11, lock file backend, license backend, xác nhận mật khẩu Aiven
* Nam, chuyển thêm 05/11: 4.8, 5.4, 5.6, 5.9, 5.10, 7.1, 7.3, 7.4, 8.3
* Sơn: 4.9, 5.7, 9.2, 8.4, 10.2; 8.2 nếu còn thời gian.
* Cả nhóm: 1.10, 2.1, 2.3, 2.9–2.15, 9.7, 10.6–10.8
* Bỏ (lý do ghi ở từng mục): 2.4–2.7, 3.3, 3.4, 4.11, 5.5, 6.6

---

## 0. Nền tảng đã có (trước khi lập checklist)

* [x] Phân tích bài toán: 5 thực thể, quan hệ, UML (bản BTTH2 ở `docs/baocao-bt-th-2.md`, UML hiện trạng trong `readme.md`)
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

* [~] 1.1 (Nhóm/BE) Đổi mật khẩu DB Aiven và bỏ thông tin DB khỏi code (code sạch từ commit `1c56b71`). Kiểm tra 04/11: mật khẩu Aiven của Nam chưa đổi, vẫn trùng lịch sử git. Bản nộp dùng Aiven khác của Tân. Còn: Nam đổi mật khẩu hoặc tắt service cũ
* [x] 1.2 (BE) Chuyển cấu hình sang `.env` (commit `1c56b71`)
* [x] 1.3 (FE) Xóa file thừa `App 2.js`, `logo.svg`, `reportWebVitals.js` (commit `1c56b71`)
* [x] 1.4 (FE) Rà soát `readme.md` cho khớp code hiện tại. Log `docs/Phan 1/1.4-ra-soat-readme.md`
* [x] 1.5 (FE) Tạo thư mục log + mục lục (nay là `docs/`)
* [x] 1.6 (FE) Viết `docs/ke-hoach.md`: thiết kế đích (vai trò, luồng L1–L6, quy tắc R1–R10, dữ liệu, API, giao diện). Log `docs/Phan 1/1.6-ke-hoach.md`
* [x] 1.7 (FE) Sắp xếp lại checklist theo giai đoạn, làm từ trên xuống. Log `docs/Phan 1/1.7-sap-xep-checklist.md`
* [~] 1.8 (BE, Nam) Thêm `backend/.env.example` (mẫu tạm có trong readme mục 7.2); quyết định có đọc lại `JWT_EXPIRES_IN` hay giữ cố định 1 giờ. Đã có file. Còn: xóa `JWT_EXPIRES_IN`, code không đọc biến này
* [x] 1.9 (FE) Thêm `frontend/.env.example` (`REACT_APP_API_URL`, `REACT_APP_MANAGER_EMAIL`, `REACT_APP_MANAGER_PHONE`). Log `docs/Phan 1/1.9-frontend-env-example.md`
* [~] 1.10 (Nhóm, cả nhóm xác nhận) Thêm file `LICENSE` có thông báo bản quyền ở gốc repo và `quan-ly-ktx/frontend/`; chọn loại license (VD MIT), ghi tên nhóm và năm; sửa trường `license` trong 2 `package.json` cho khớp [Đề 3c]. Đã thêm MIT (tạm), sửa `package.json` frontend. Còn: nhóm xác nhận MIT. Log `docs/Phan 1/1.10-license.md`
* [x] 1.11 (BE, Nam) Gỡ `quan-ly-ktx/backend/storage/` khỏi git (`git rm -r --cached`): đang commit ảnh đồng hồ, biên lai thật của người dùng dù `.gitignore` đã chặn [Đề 3d, 9]. Kiểm 06/11: `main` không còn file trong `storage/`, ảnh cũ vẫn nằm trong lịch sử git

## 2. Chốt thiết kế & tổ chức nhóm

Đề xuất cho các mục 2.4–2.9 có trong `docs/ke-hoach.md` (đánh dấu [Chốt 2.x]). Phần này phải xong trước khi code phần 3. Riêng 2.12–2.14 là tài liệu đề bắt buộc nộp, làm song song với các phần sau được.

* [~] 2.1 (Nhóm, cả nhóm) Thu thập đề bài và tiêu chí chấm của giảng viên; đối chiếu và bổ sung checklist. Đã ghi đề vào `docs/de-bai.md` và bổ sung checklist theo đề (log `docs/Phan 2/2.1-de-bai-va-sap-xep-docs.md`, `docs/Phan 2/2.1-bo-sung-checklist-theo-de.md`). Còn: hỏi giáo viên các điểm chưa rõ (2.15)
* [x] 2.2 (Nhóm) Phân công theo người (ghi tên vào từng phần) và đặt mốc thời gian; hạn nộp 09/11/2026 (bản cứng trước 17h, PDF trước 23h59). Chốt 01/11/2026: xem phần "Phân công" ở đầu file, log `docs/Phan 2/2.2-phan-cong.md`
* [ ] 2.3 (Nhóm, cả nhóm) Thống nhất quy trình git (mỗi người một nhánh `feature/*` hay cùng đẩy `main`, ai merge, cách đặt tên commit)
* [ ] 2.4 (Nhóm, bỏ: không đổi schema sát hạn) Quy ước đặt tên (đề xuất: thuộc tính camelCase trong TS, tên cột snake_case qua `name:`) và kiểu khóa chính cho từng bảng
* [ ] 2.5 (Nhóm, bỏ: giữ liên kết qua studentSid) Liên kết `User 1–1 Student` (cột `user_id` trong Student), cách SV đã có hồ sơ được liên kết với tài khoản; bỏ cột `role` thừa trong Student
* [ ] 2.6 (Nhóm, bỏ: không đổi schema sát hạn) Trạng thái hợp đồng: `PENDING | ACTIVE | EXPIRED | TERMINATED` thay cho `is_active`; giá thuê chốt khi ký (`monthly_price`)
* [ ] 2.7 (Nhóm, bỏ: không đổi schema sát hạn) Hóa đơn điện nước: `UNPAID | PAID` (hay giữ `is_paid`), thu theo phòng hay chia đầu người, thanh toán điện nước có ghi vào `Payment` không
* [~] 2.8 (Nhóm, Tân kiểm) Đơn giá điện/nước lưu ở đâu. Code đã có bảng `utility_tariff` + API `utility-bill/tariff` (commit `fde890e`); nhóm xác nhận giữ cách này
* [ ] 2.9 (Nhóm, cả nhóm) Phạm vi mở rộng: đơn đăng ký ở, yêu cầu sửa chữa, thông báo, xuất file (quyết định phần 8)
* [~] 2.10 (Nhóm, cả nhóm) React-Bootstrap đang cài nhưng chưa file nào dùng, mà đề 5b bắt buộc dùng. Chốt 04/11: trang chủ theo mẫu React Native, các trang trong giữ giao diện Nam, dùng react-bootstrap cho layout, form, bảng (6.12) [Đề 5b]
* [ ] 2.11 (Nhóm, cả nhóm duyệt) Cập nhật `docs/ke-hoach.md` và UML trong readme theo các quyết định trên, đổi trạng thái `docs/ke-hoach.md` thành "đã duyệt" [Đề 2b]
* [~] 2.12 (Nhóm, cả nhóm duyệt) User stories: tối thiểu 12 câu, đúng định dạng "Là <vai trò>, tôi muốn <hành động> để <lợi ích>.", đánh mã US-xx, mỗi câu ứng với API, màn hình, test [Đề 1]. Bản nháp 24 câu ở `docs/user-stories.md` (log `docs/Phan 2/2.12-user-stories.md`). Còn: nhóm duyệt
* [~] 2.13 (Nhóm, cả nhóm duyệt) Phân tích yêu cầu, đối tượng, quan hệ, phương thức; sơ đồ thuật toán (flowchart) cho các nghiệp vụ chính [Đề 2a, 2b]. Bản nháp ở `docs/phan-tich-thiet-ke.md` (UML + 6 flowchart, log `docs/Phan 2/2.13-phan-tich-thiet-ke.md`). Còn: nhóm duyệt
* [~] 2.14 (Nhóm, cả nhóm duyệt) Wireframe các màn hình chính; sơ đồ luồng xử lý thông tin (người dùng → React → API → Controller → Service → DB) cho 2–3 luồng chính [Đề 3a, 3b]. Bản nháp ở `docs/wireframe-luong-xu-ly.md` (log `docs/Phan 2/2.14-wireframe-luong-xu-ly.md`). Cập nhật theo code 06/11, log `docs/Phan 10/10.3-cap-nhat-theo-code-nam.md`. Còn: nhóm duyệt
* [x] 2.15 (Nhóm, cả nhóm) Hỏi giáo viên 5 điểm chưa rõ của đề, ghi câu trả lời vào mục 4 của `docs/de-bai.md`. Log `docs/Phan 2/2.15-tra-loi-de.md`
* [x] 2.16 (Nhóm) Chọn một trang chủ: `pages/landing/` trên `main` (Nam) hay `pages/public/` ở nhánh `feature/trang-chu-tandz` (Tân, chưa merge); merge hoặc bỏ nhánh còn lại [Đề 5b]. Chốt 01/11/2026: dùng `pages/landing/` của Nam; nhánh `feature/trang-chu-tandz` không merge

## 3. Database & dữ liệu (BE)

* [x] 3.1 (BE, Tân kiểm) Nối quan hệ: Contract↔Room, Contract↔Payment, UtilityBill↔Room (đang comment trong entity). Đủ khóa ngoại trên DB thật. Log `docs/Phan 8/8.1-kiem-luong-nghiep-vu.md`
* [x] 3.2 (BE, Tân kiểm) Liên kết `User`–`Student` theo 2.5. Liên kết qua `users.student_sid`, có chỉ mục duy nhất. Log `docs/Phan 8/8.1-kiem-luong-nghiep-vu.md`
* [ ] 3.3 (BE, bỏ: không đổi schema sát hạn) Áp dụng quy ước tên/khóa (2.4) và trạng thái enum cho hợp đồng, hóa đơn (2.6, 2.7)
* [ ] 3.4 (BE, bỏ: đã có utility_tariff) Bảng `SETTINGS` (nếu chốt ở 2.8) và các bảng mở rộng (nếu chốt ở 2.9)
* [x] 3.5 (BE, Tân) Tạo bảng cho môi trường production: `database/init.sql` đủ 11 bảng. Log `docs/Phan 3/3.5-init-sql.md`
* [x] 3.6 (BE, Tân) Script seed: vài tòa, phòng, SV, HĐ, hóa đơn + 3 tài khoản demo (admin/manager/student), dữ liệu dễ nhận ra. Chạy `npm run seed`. Log `docs/Phan 3/3.6-seed.md`
* [ ] 3.7 (Nhóm, Tân) Kiểm tra mọi thành viên chạy được backend với DB (máy cá nhân hoặc Aiven) theo readme
* [x] 3.8 (BE, Tân) Viết phân tích ORM cho báo cáo: cấu hình DataSource, entity ↔ bảng, quan hệ ↔ khóa ngoại, repository; kèm câu SQL thật do TypeORM sinh ra (bật `logging` để lấy) [Đề 6b]. Xem `docs/phan-tich-orm.md`. Log `docs/Phan 3/3.8-phan-tich-orm.md`

## 4. Backend API nền tảng

* [x] 4.1 (BE) Áp `JwtAuthGuard + RolesGuard` cho Student, Contract, UtilityBill. Mọi controller nghiệp vụ đã có guard (commit `fde890e`)
* [x] 4.2 (BE, Tân) DTO + class-validator cho Student, Contract, UtilityBill, Payment [Đề 3d, 4c]. Đã có DTO cho room, meter-reading, residence-request, tariff, general charge, hồ sơ SV, Contract, Student, UtilityBill, từ chối đơn (log `docs/Phan 4/4.2-dto-contract.md`, `docs/Phan 4/4.2-dto-student-utility-bill.md`). DTO Payment ở `modules/payment/dto/`
* [x] 4.3 (BE, Nam) `PaymentModule`: CRUD, lọc theo hợp đồng
* [x] 4.4 (BE, Tân) Mã lỗi nhất quán: 400 sai dữ liệu, 401, 403, 404 không tìm thấy, 409 vi phạm ràng buộc. Log `docs/Phan 4/4.4-4.12-xu-ly-loi.md`. 404 của `/contract/:id` xong ở 9.3
* [x] 4.5 (BE, Tân) API tài khoản cho ADMIN: `GET /users`, `POST /users` (tạo MANAGER), `PATCH /users/:id/role`. Log `docs/Phan 4/4.5-api-tai-khoan.md`
* [x] 4.6 (BE, Tân kiểm) API đơn giá: `utility-bill/tariff`, `GET` và `PUT` cho ADMIN, MANAGER (Tân chốt 04/11). Log `docs/Phan 8/8.1-kiem-luong-nghiep-vu.md`
* [x] 4.7 (BE, Tân kiểm) API phòng còn chỗ và danh sách SV đang ở trong phòng. Có `GET /rooms?status=available`. Có `GET /rooms/:id/residents`. Log `docs/Phan 8/8.1-kiem-luong-nghiep-vu.md`
* [x] 4.8 (BE, Nam) Phân trang + tìm kiếm + lọc cho danh sách. `GET /contract` đã hỗ trợ `page`, `limit`, `q` theo mã hợp đồng, mã/tên sinh viên, phòng và tòa; log `docs/Phan 4/4.8-phan-trang-tim-kiem.md`
* [x] 4.9 (BE, Sơn) Bảo mật: giới hạn số lần đăng nhập sai, header bảo mật (`helmet`) [Đề 3d, 4c]
* [x] 4.10 (BE, Tân) Tài liệu hóa API theo hướng dẫn trên lớp (Postman): endpoint, quyền, ví dụ request/response, mã lỗi [Đề 4b]. Postman collection ở `docs/postman/`, Swagger ở `/api-docs`. Log `docs/Phan 4/4.10-swagger.md`, `docs/Phan 4/4.10-postman.md`
* [ ] 4.11 (BE + FE, bỏ: giữ localStorage, rủi ro ghi trong luat-dao-duc.md) Phiên đăng nhập và cookie: giữ token ở `localStorage` hay chuyển sang cookie `httpOnly; Secure; SameSite` (khi đó cần chống CSRF); đăng xuất, hết hạn phiên; transaction DB cho thao tác ghi nhiều bảng [Đề 4c]
* [x] 4.12 (BE, Tân) Exception filter chung: trả lỗi cùng một dạng, không lộ stack trace hay câu SQL ra client [Đề 7a]. Log `docs/Phan 4/4.4-4.12-xu-ly-loi.md`

## 5. Backend nghiệp vụ

Quy tắc R1–R10 xem `docs/ke-hoach.md` mục 4.

* [x] 5.1 (BE, Nam) Tạo hợp đồng: kiểm tra phòng còn chỗ, 1 SV chỉ 1 HĐ `ACTIVE`, cập nhật sĩ số trong transaction (R1–R4)
* [x] 5.2 (BE, Nam) Kết thúc / gia hạn hợp đồng, tự chuyển `EXPIRED` khi quá hạn. Đã có kết thúc, gia hạn, thanh lý. Chốt 06/11: không làm tác vụ tự chuyển khi quá hạn, ghi là hạn chế (`is_active` giữ nguyên, sĩ số phòng chỉ tính lại khi có thao tác ghi)
* [x] 5.3 (BE, Nam) Chặn xóa cứng phòng/SV còn HĐ hoặc còn nợ, dùng xóa mềm (R5). Đã chặn xóa khi còn HĐ, còn nợ, còn lịch sử. Chốt 06/11: không làm xóa mềm, còn lịch sử thì chặn xóa
* [x] 5.4 (BE, Nam) Hóa đơn điện nước: chỉ số mới ≥ cũ, server tự tính tiền theo đơn giá hiện hành và lưu snapshot đơn giá, không trùng kỳ, hóa đơn đã thu thì không sửa chỉ số (R6–R9). `POST /utility-bill` không nhận `total_amount` từ client; log `docs/Phan 5/5.9-5.10-unit-test.md`
* [ ] 5.5 (BE, bỏ: thay bằng SV tự gửi chỉ số) Nhập chỉ số hàng loạt cả tòa: `GET /utility-bill/draft`, `POST /utility-bill/batch`
* [~] 5.6 (BE, Nam) API cho sinh viên (R10). Đã có `GET /student/me/portal` (gồm phòng, hợp đồng hiện hành, hóa đơn), `PUT /student/me/profile`, `GET /me/payments`; phần hợp đồng hiển thị tại 7.3. Log `docs/Phan 7/7.4-lich-su-thanh-toan.md`
* [x] 5.7 (BE, Sơn) Đổi mật khẩu cho người dùng đang đăng nhập
* [~] 5.8 (BE, Nam) Báo cáo `GET /reports/summary?month=&year=` (lấp đầy theo tòa, đã thu, công nợ, HĐ sắp hết hạn). Có API nhưng bỏ qua `month`, `year`. Còn: lọc tháng, lấp đầy theo tòa, HĐ sắp hết hạn
* [x] 5.9 (BE, Nam) Unit test cho các quy tắc R1–R10. R1–R5, R6–R10 đã có test service/DTO, log `docs/Phan 5/5.9-5.10-unit-test.md`
* [~] 5.10 (BE, Nam) Unit test cho mọi user story của 2.12, đặt trong thư mục `test/` [Đề 7b]. Toàn bộ spec đã ở `test/unit/`; đã bổ sung US-16, US-21. Còn: US-05, US-24; US-04 và US-13 mới một phần. Log `docs/Phan 5/5.9-5.10-unit-test.md`

## 6. Frontend khu quản lý (ADMIN / MANAGER)

* [x] 6.1 (FE, Tân) Kiểm thử các trang admin hiện có trên app thật với API mới (tải / rỗng / lỗi, 375px, console, XSS), ghi lại lỗi. Log `docs/Phan 6/6.1-kiem-thu-trang-admin.md`
* [x] 6.2 (FE, Tân) Phần dùng chung: toast thành công/lỗi, hộp xác nhận trước khi xóa, validate form khớp DTO backend. Log `docs/Phan 6/6.2-toast-xac-nhan.md`
* [x] 6.3 (FE) Xử lý phiên: 401 → đăng xuất, về đăng nhập kèm thông báo; 403 → báo "Không có quyền" [Đề 3d, 4c]. Log `docs/Phan 6/6.3-xu-ly-phien.md`
* [x] 6.4 (FE) Sidebar theo vai trò: ẩn menu quản lý với STUDENT, ẩn mục chỉ-ADMIN với MANAGER. Code có từ `fde890e`, thêm test. Log `docs/Phan 6/6.4-sidebar-theo-vai-tro.md`
* [~] 6.5 (FE, Tân kiểm) Tòa nhà & Phòng: lưới phòng theo tòa/tầng, màu theo trạng thái, lọc, chi tiết phòng (SV đang ở, lịch sử HĐ). Đã có lưới phòng, lọc, thêm, sửa, xóa. Có danh sách SV đang ở. Còn: lịch sử HĐ. Log `docs/Phan 8/8.1-kiem-luong-nghiep-vu.md`
* [ ] 6.6 (FE, bỏ: Nam đã bỏ trang danh sách SV, hỏi lại Nam nếu cần) Sinh viên: tìm kiếm, lọc, trang chi tiết (hồ sơ, tài khoản liên kết, phòng, HĐ, công nợ)
* [~] 6.7 (FE, Nam) Hợp đồng: tab theo trạng thái, form theo bước (SV → phòng còn chỗ → thời hạn, cọc), Gia hạn / Kết thúc, ghi nhận thanh toán. Đã có lọc theo trạng thái, form 2 bước, Gia hạn, Thanh lý, ghi thanh toán. Còn: gộp form 1 bước, đổi `window.prompt` sang modal
* [x] 6.8 (FE, Tân kiểm) Chỉ số điện nước: bảng nhập nhanh cả tòa theo tháng, chỉ số cũ tự điền, báo lỗi ngay, xem trước số tiền. Đổi thành SV gửi chỉ số, cán bộ duyệt (5.5 bỏ); đã kiểm cả luồng. Log `docs/Phan 8/8.1-kiem-luong-nghiep-vu.md`
* [x] 6.9 (FE, Tân) Hóa đơn: lọc tháng/tòa/trạng thái, đánh dấu đã thu, xem/in hóa đơn. Log `docs/Phan 6/6.9-trang-hoa-don.md`
* [x] 6.10 (FE, Tân) Tổng quan: thẻ số liệu, biểu đồ lấp đầy theo tòa, thu tiền 6 tháng, danh sách việc cần làm. Log `docs/Phan 6/6.10-tong-quan.md`
* [x] 6.11 (FE, Tân) Cài đặt: đơn giá điện/nước, quản lý tài khoản cán bộ (chỉ ADMIN). Log `docs/Phan 6/6.11-cai-dat.md`
* [x] 6.12 (FE, Tân) Chuyển giao diện sang `react-bootstrap` theo phạm vi chốt ở 2.10; trang chủ theo mẫu React Native (3 ảnh chụp kèm đề) [Đề 5b]. Xong trang chủ (log `docs/Phan 6/6.12-landing-react-bootstrap.md`) và các trang sau đăng nhập (log `docs/Phan 6/6.12-react-bootstrap-trang-trong.md`). `ContractsPage`, `RoomsPage` xong ở 9.3
* [~] 6.13 (FE, Tân) Rà usability: mỗi tác vụ chính ≤ 4 thao tác, gợi ý / tự điền, thông báo không gây phiền; ghi số thao tác vào báo cáo [Đề 5c]. Đã đếm, log `docs/Phan 6/6.13-usability.md`. Còn: tạo hợp đồng 5 thao tác, chờ 6.7 của Nam

## 7. Frontend cổng sinh viên (STUDENT)

* [~] 7.1 (FE, Nam) Trang chủ sinh viên: đăng nhập xong đã chuyển tới `#my-profile` (commit `1c56b71`); còn trang tóm tắt phòng, hạn HĐ, hóa đơn chưa đóng
* [~] 7.2 (FE, Tân) Hồ sơ cá nhân: hiển thị hồ sơ Student, sửa SĐT/email, đổi mật khẩu. Đã có `ProfilePage` + `PUT student/me/profile` (commit `fde890e`), chưa kiểm thử, cần đối chiếu đủ ý
* [x] 7.3 (FE, Nam) Phòng của tôi: phòng, tòa, bạn cùng phòng, mã hợp đồng, ngày bắt đầu và ngày hết hạn. Hợp đồng lấy từ `GET /student/me/portal`; log `docs/Phan 7/7.3-hop-dong-phong-cua-toi.md`
* [x] 7.4 (FE, Nam) Hóa đơn của tôi: tiền phòng + điện nước, khoản chưa thanh toán và lịch sử giao dịch theo hợp đồng. Log `docs/Phan 7/7.4-lich-su-thanh-toan.md`

## 8. Mở rộng (theo phạm vi chốt ở 2.9)

* [x] 8.1 (BE + FE, Tân kiểm) Đơn đăng ký ở trực tuyến: SV chọn phòng còn chỗ → gửi đơn → cán bộ duyệt. Đã có API `residence-requests` + `ResidenceRequestsPage` (commit `fde890e`). Đã kiểm cả luồng trên API thật. Log `docs/Phan 8/8.1-kiem-luong-nghiep-vu.md`
* [ ] 8.2 (BE + FE, Sơn, nếu còn thời gian) Yêu cầu sửa chữa: SV gửi, cán bộ cập nhật trạng thái
* [x] 8.3 (BE + FE, Nam) Thông báo trong hệ thống (HĐ sắp hết hạn). Tác vụ khi khởi động và hằng ngày tạo nhắc cho hợp đồng còn hiệu lực, hết hạn trong 30 ngày; sinh viên nhận qua API/thanh thông báo sẵn có. Log `docs/Phan 8/8.3-thong-bao-hop-dong-sap-het-han.md`
* [x] 8.4 (FE, Sơn) Xuất Excel/PDF danh sách, hóa đơn

## 9. Kiểm thử & triển khai

* [x] 9.1 (FE) Rà soát toàn bộ giao diện: 375px, không lỗi console, không render HTML từ dữ liệu người dùng, không `console.log` dữ liệu người dùng [Đề 3d, 7e]. Thử với backend giả; sửa tải ảnh bỏ qua 401, thông báo tiếng Nga, tắt source map. Log `docs/Phan 9/9.1-ra-soat-frontend.md`
* [x] 9.2 (FE, Sơn) Test component chính ở frontend (form, guard, xử lý phiên) [Đề 7e]
* [x] 9.3 (Nhóm, Tân) E2E luồng chính: lập HĐ → nhập điện nước → SV xem hóa đơn → ghi thanh toán → kết thúc HĐ [Đề 7c]. Đạt 32/33 ca trên DB thử, ca còn lại thuộc 5.8. Log `docs/Phan 9/9.3-gop-main-e2e.md`. Chạy lại trên bản online ở 9.5
* [x] 9.4 (Nhóm, Tân) Triển khai backend, frontend, DB lên cloud; cấu hình CORS + biến môi trường. Đã có `render.yaml`, hướng dẫn `docs/trien-khai.md`, log `docs/Phan 9/9.4-chuan-bi-trien-khai.md`. Link: `https://ktx-care.vercel.app`, `https://ktx-care-api.onrender.com`
* [~] 9.5 (Nhóm, Tân) Kiểm thử trên bản đã triển khai với 3 tài khoản demo. Đã kiểm không đăng nhập: API có code Nam, 401, 404, CORS. Log `docs/Phan 9/9.5-kiem-thu-ban-online.md`. Còn: Tân thử lại 3 vai trò sau khi Nam, Sơn push
* [ ] 9.6 (Nhóm, Tân) (Tùy chọn) Tự chạy lint + test khi push (GitHub Actions)
* [~] 9.7 (Nhóm, cả nhóm) Danh sách ca kiểm thử: đầu vào, kết quả mong đợi, kết quả thực tế, ảnh chụp; gồm cả ca lỗi và ca thành công [Đề 7d]. Nháp `docs/ca-kiem-thu.md` (46 ca, BE 27/27, FE 25/25). Còn: ảnh chụp, ca E2E. Log `docs/Phan 9/9.7-ca-kiem-thu.md`

## 10. Tài liệu & bảo vệ

* [~] 10.1 (Nhóm, Tân) Viết lại `readme.md` bản cuối: giới thiệu, công nghệ, cài đặt & chạy, tài khoản demo, link triển khai. Log `docs/Phan 10/10.1-readme.md`. Còn: link video
* [x] 10.2 (Nhóm, Sơn) Hướng dẫn sử dụng cho cán bộ và sinh viên (có ảnh chụp màn hình)
* [~] 10.3 (Nhóm, Tân) Báo cáo cuối kỳ theo mẫu Phenikaa, trả lời đủ 10 câu của đề; có trang link demo, link GitHub, đóng góp từng thành viên [Đề 8]. Nháp `docs/bao-cao.md`, log `docs/Phan 10/10.3-bao-cao.md`. Còn: mẫu trình bày, các dòng CẦN BỔ SUNG
* [~] 10.4 (Nhóm, Tân) Video demo dưới 8 phút (đưa link vào báo cáo) + slide, kịch bản demo [Đề 8]. Có `docs/kich-ban-demo.md`, log `docs/Phan 10/10.4-kich-ban-anh-so-do.md`. Còn: quay video, slide
* [ ] 10.5 (Nhóm, Tân) Dọn dữ liệu thử còn sót (theo log), kiểm tra lần cuối
* [~] 10.6 (Nhóm, cả nhóm duyệt) Phần luật (VD Nghị định 13/2023 về dữ liệu cá nhân, Luật An ninh mạng, license thư viện), đạo đức nghề nghiệp, đạo đức xã hội; tự kiểm tra an ninh an toàn của dự án [Đề 9]. Nháp `docs/luat-dao-duc.md`. Còn: nhóm duyệt. Log `docs/Phan 10/10.6-luat-dao-duc.md`
* [ ] 10.7 (Nhóm, cả nhóm) Bảng đóng góp từng thành viên, đối chiếu commit. Mỗi người phải có commit và đóng góp thật (Sơn hiện mới có 2 commit, ngày 23/09) [Đề 10a, 10b; điều kiện 0 điểm]
* [ ] 10.8 (Nhóm, cả nhóm) Nộp trước 09/11/2026: PDF lên Canvas, bản cứng mỗi người 1 bản tại phòng 2310 nhà A9, ký danh sách nộp [điều kiện 0 điểm]

## 11. Việc tồn đọng / cần xác nhận

* [ ] (Nam) Nam xác nhận đã đổi mật khẩu Aiven (1.1); mật khẩu cũ vẫn nằm trong lịch sử git nên chỉ an toàn khi đã đổi
* [x] (Tân) Xác minh phiên bản Node.js tối thiểu cho NestJS 12 và ghi vào readme mục 7.1: từ Node 20
* [ ] Token đang lưu ở `localStorage`: đã chuyển thành mục 4.11
* [ ] (BE, Nam) `backend/package-lock.json` lệch `package.json`, `npm ci` lỗi (thiếu `@emnapi/core`, `@emnapi/runtime`): chạy `npm install` rồi commit lock file

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
│   │       └── modules/      # room, student, contract, utility-bill, payment, ...
│   └── frontend/             # React 19 (CRA)
│       └── src/
│           ├── api/          # Gọi REST API
│           ├── components/   # common, guards, layout
│           ├── context/      # AuthContext
│           ├── hooks/        # useApiResource
│           ├── pages/        # auth, admin, student, landing
│           └── utils/        # hashRoute
├── .claude/CLAUDE.md         # Hướng dẫn cho AI (Claude Code tự đọc)
├── docs/                     # Tài liệu + log từng mục checklist (mục lục: docs/logs.md)
│   ├── de-bai.md             # Đề thi cuối kỳ: yêu cầu từng câu, điều kiện 0 điểm
│   ├── user-stories.md       # User stories US-xx (Đề 1)
│   ├── phan-tich-thiet-ke.md # Phân tích, UML, sơ đồ thuật toán (Đề 2)
│   ├── wireframe-luong-xu-ly.md # Wireframe, luồng xử lý (Đề 3a, 3b)
│   ├── ca-kiem-thu.md        # Ca kiểm thử (Đề 7d)
│   ├── luat-dao-duc.md       # Luật, đạo đức, an ninh (Đề 9)
│   ├── ke-hoach.md           # Thiết kế đích (bản đề xuất)
│   ├── baocao-bt-th-2.md     # Báo cáo bài thực hành số 2
│   └── luu-tru/              # Bản cũ không dùng nữa (checklist-v1.md)
├── LICENSE                   # MIT (Đề 3c)
├── checklist.md              # Bảng theo dõi tiến độ (file này)
└── readme.md                 # Hiện trạng, cài đặt và chạy dự án
```

---

## Current Milestone

**Cập nhật 04/11/2026:** Backend bảo mật, tài liệu API, DB, seed, trang Cài đặt, hóa đơn, tổng quan, toast đã xong trên `feature/tandz`. DB bản nộp là Aiven của Tân. Đang chờ Nam push 4.3, 5.1–5.3, 5.8, 6.7 để chạy E2E. 4.9, 5.7, 9.2 để lại cho Sơn. Xem `docs/logs.md`.

**Cập nhật 01/11/2026:** Đã chốt phân công (phần "Phân công" ở đầu file). Đã xong trên nhánh `feature/tandz`: 6.3, 6.4, 9.1, 6.12 phần 1 (trang chủ react-bootstrap); nháp 2.12–2.14, 9.7, 10.6; LICENSE MIT. Việc tiếp theo của Tân: kiểm các mục "Tân kiểm", rồi đợt A.

**Cập nhật 26/10/2026:** Đã ghi đề thi vào `docs/de-bai.md` và đối chiếu với checklist (danh sách ở đầu file). Code đã đi xa hơn checklist cũ (commit `fde890e`: chỉ số điện nước, đơn đăng ký ở, thông báo, đơn giá, trang sinh viên); các mục liên quan đã chuyển `[~]`, chưa kiểm thử. Còn khoảng 2 tuần đến hạn 09/11. Việc gấp: 2.2 phân công, 2.15 hỏi giáo viên, 1.10 LICENSE, duyệt 2.12 user stories, 2.10 + 6.12 react-bootstrap.

**Cập nhật 19/10/2026:** Xong phần 1 trừ 1.8, 1.9. Nền tảng đã có auth JWT + phân quyền, CRUD cơ bản 4 bảng và khung giao diện admin/cổng sinh viên; các bảng chưa nối quan hệ nên chưa có nghiệp vụ KTX thật. Việc tiếp theo: cả nhóm làm phần 2 (đề bài, phân công, duyệt `docs/ke-hoach.md`) trước khi backend bắt đầu phần 3.
