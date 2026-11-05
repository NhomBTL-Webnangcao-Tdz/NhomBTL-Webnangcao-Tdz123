# Báo cáo bài tập lớn: KTX Care

Trạng thái: bản nháp nội dung (checklist 10.3). Chưa áp mẫu trình bày của Phenikaa. Dòng `CẦN BỔ SUNG` là phần còn thiếu, không được để sót khi nộp.

Cách ghép: dòng `Chèn:` nghĩa là lấy nguyên phần đó từ tài liệu đã có, tránh viết hai nơi. Sơ đồ Mermaid dùng ảnh trong `docs/anh-bao-cao/`.

## Thông tin nộp bài

* Học phần: Web nâng cao, lớp N02, Trường CNTT, Đại học Phenikaa, học kỳ 1 năm học 2026-2027
* Nhóm: Chu Thanh Tân, Đặng Hải Nam, Lê Hải Sơn
* Mã sinh viên: CẦN BỔ SUNG
* Link GitHub: `https://github.com/NhomBTL-Webnangcao-Tdz/NhomBTL-Webnangcao-Tdz123`
* Link ứng dụng: `https://ktx-care.vercel.app`
* Link API: `https://ktx-care-api.onrender.com`, tài liệu ở `/api-docs`
* Link video demo dưới 8 phút: CẦN BỔ SUNG
* Tài khoản demo: `demo_admin`, `demo_manager`, `demo_student`. Mật khẩu: CẦN BỔ SUNG, chỉ ghi trong bản nộp, không ghi vào repo

## Giới thiệu

KTX Care là hệ thống quản lý ký túc xá sinh viên. Sinh viên đăng ký ở, xem phòng, gửi chỉ số điện nước và xem hóa đơn trực tuyến. Cán bộ duyệt đơn, xếp phòng, duyệt chỉ số và theo dõi thu tiền. Quản trị viên cấu hình đơn giá và quản lý tài khoản.

Công nghệ:

* Frontend: React 19, `react-bootstrap`, triển khai trên Vercel
* Backend: NestJS 12, TypeORM, JWT, bcrypt, triển khai trên Render
* CSDL: MySQL 8 trên Aiven, kết nối SSL

## Câu 1. User stories

Dự án có 24 user story đúng định dạng "Là <vai trò>, tôi muốn <hành động> để <lợi ích>.", đánh mã US-01 đến US-24 theo 4 nhóm: khách và người dùng chung, sinh viên, cán bộ quản lý, quản trị viên.

Chèn: `docs/user-stories.md`, từ "Khách và người dùng chung" tới hết "Quản trị viên".

## Câu 2. Phân tích và thiết kế

Chèn: `docs/phan-tich-thiet-ke.md`, mục 1 đến 7 (yêu cầu, đối tượng, quan hệ, phương thức, sơ đồ lớp UML, 9 sơ đồ thuật toán).

## Câu 3. Giao diện, luồng xử lý, khung dự án

### 3a. Wireframe

Chèn: `docs/wireframe-luong-xu-ly.md`, mục 1.

### 3b. Luồng xử lý thông tin

Chèn: `docs/wireframe-luong-xu-ly.md`, mục 2.

### 3c. Khung dự án

* Backend NestJS chia theo module, mỗi module có controller nhận request, service xử lý nghiệp vụ, entity ánh xạ bảng, DTO kiểm tra dữ liệu. Các module: `auth`, `room`, `student`, `contract`, `utility-bill`, `meter-reading`, `notification`, `payment`, `report`.
* Frontend React chia `api/` gọi REST, `components/` dùng chung, `context/` giữ phiên, `pages/` theo vai trò.
* Repo có file `LICENSE` giấy phép MIT kèm thông báo bản quyền.

### 3d. Security backend và frontend

Backend:

* `JwtAuthGuard` và `RolesGuard` trên các controller nghiệp vụ, phân quyền theo `@Roles`.
* `ValidationPipe` toàn cục với `whitelist`, `forbidNonWhitelisted`: từ chối trường lạ, chống gán thêm dữ liệu.
* Mật khẩu không bao giờ trả ra API nhờ `select: false`.
* `AllExceptionsFilter` không trả stack trace, câu SQL cho client.

Frontend:

* Không có bí mật trong code frontend. Biến `REACT_APP_*` chỉ chứa địa chỉ API và thông tin liên hệ công khai.
* Không đưa dữ liệu nhạy cảm lên URL, không `console.log` dữ liệu người dùng.
* React tự thoát HTML khi hiển thị, dự án không dùng `dangerouslySetInnerHTML`.
* Bản build không có source map (`.env.production`).
* Sinh viên chỉ đọc được dữ liệu của mình vì backend xác định người dùng qua token, không qua tham số URL.

## Câu 4. API backend

### 4a. API nghiệp vụ

API không chỉ CRUD mà xử lý nghiệp vụ, ví dụ:

* Duyệt đơn đăng ký ở: kiểm tra đơn còn chờ, khóa phòng, kiểm tra còn chỗ, tạo hợp đồng, tăng sĩ số, gửi thông báo trong một transaction.
* Duyệt chỉ số điện nước: lấy chỉ số kỳ trước, kiểm tra không nhỏ hơn, tính tiền theo đơn giá, cộng tiền phòng, chia đều cho sinh viên đang ở, tạo hóa đơn và thông báo.
* Đánh dấu từng sinh viên đã đóng: hóa đơn tự chuyển đã thu khi mọi phần đã đóng.
* Quản lý tài khoản: không cho tự đổi vai trò của mình, không cho hạ ADMIN cuối cùng.
* Lập hợp đồng: khóa sinh viên và phòng trong một transaction, chặn hợp đồng trùng thời gian, phòng bảo trì, phòng đủ sức chứa, rồi tính lại sĩ số.
* Gia hạn, kết thúc, thanh lý hợp đồng: kiểm tra hợp đồng còn hiệu lực, kiểm tra ngày, tính lại sĩ số phòng.
* Thanh toán: ghi giao dịch theo hợp đồng, xem lịch sử; không cho xóa hợp đồng đã có thanh toán.
* Chặn xóa: không xóa phòng, sinh viên còn hợp đồng, còn nợ hoặc còn lịch sử.
* Báo cáo `GET /reports/summary`: số sinh viên, phòng, hợp đồng hiệu lực, công nợ, tiền thu trong tháng.

### 4b. Tài liệu API

* Postman collection: `docs/postman/ktx-care.postman_collection.json`, 57 request chia thành 12 nhóm, có biến và ví dụ, tự lưu token sau khi đăng nhập.
* Swagger: `https://ktx-care-api.onrender.com/api-docs`, ghi quyền, ví dụ, mã lỗi từng endpoint.

CẦN BỔ SUNG: ảnh chụp chạy API bằng Postman.

### 4c. An ninh an toàn

* Token: JWT ký bằng `JWT_SECRET` dài ít nhất 32 ký tự, hết hạn sau 1 giờ (`auth/auth.module.ts`). Frontend gửi qua header `Authorization` (`api/client.js`).
* Mã băm mật khẩu: bcrypt 12 vòng, giới hạn 72 byte (`auth/auth.service.ts`).
* Xử lý phiên: token hết hạn hoặc sai thì API trả 401, frontend tự đăng xuất và báo cho người dùng; 403 báo không có quyền (`api/client.js`, `context/AuthContext.js`).
* Transaction: thao tác ghi nhiều bảng dùng transaction, có khóa dòng `pessimistic_write` để tránh xếp trùng chỗ (`student.service.ts`, `contract.service.ts`, `meter-reading.service.ts`, `utility-bill.service.ts`).
* Cookies: dự án không dùng cookie cho xác thực, token nằm ở `localStorage` và gửi qua header. Cách này không bị CSRF kiểu tự gửi cookie, đổi lại token đọc được nếu trang dính XSS. Nhóm giảm rủi ro bằng cách không render HTML từ dữ liệu người dùng và cho token hết hạn nhanh.
* CORS: chỉ cho các địa chỉ khai báo trong `FRONTEND_URL` (`main.ts`). Đã thử trên bản triển khai: địa chỉ lạ không được phép.
* Xác thực, định danh: `JwtAuthGuard` xác thực, `RolesGuard` phân quyền theo 3 vai trò.
* Thêm: DTO kiểm tra đầu vào, lỗi tiếng Việt thống nhất, truy vấn dùng tham số chống SQL injection, ảnh tải lên chỉ nhận JPG, PNG, WEBP tối đa 5 MB.

CẦN BỔ SUNG: giới hạn đăng nhập sai, `helmet` sau khi xong 4.9.

## Câu 5. Frontend

### 5a. Bố cục

Bố cục chung gồm menu trái, header, nội dung; khớp wireframe ở 3a. Ở điện thoại, menu chuyển thành thanh ngang.

### 5b. Giao diện

* Trang chủ theo phong cách reactnative.dev.
* Các trang sau đăng nhập dùng `react-bootstrap`: `Modal`, `Table`, `Form`, `Button`, `Badge`, `Alert`, `Spinner`, `Nav`, `ProgressBar`, `Toast`.

CẦN BỔ SUNG: ảnh chụp trang chủ và các trang chính.

### 5c. Usability

Quy ước: 1 thao tác là 1 lần bấm hoặc 1 lần điền xong một form.

Chèn: `docs/Phan 6/6.13-usability.md`, phần "Đã làm".

## Câu 6. CSDL và ORM

Chèn: `docs/phan-tich-orm.md`.

## Câu 7. Kiểm thử và kiểm định

### 7a. Bắt lỗi

* Backend: `AllExceptionsFilter` đưa mọi lỗi về một dạng, đổi lỗi MySQL thành 400, 409 có thông báo dễ hiểu, lỗi không lường trước trả 500 chung và chỉ ghi log ở server.
* Frontend: mọi trang có trạng thái đang tải, rỗng, lỗi; toast báo kết quả thao tác.

### 7b. Unit test

* Thư mục `quan-ly-ktx/backend/test/unit`: 126 test. Thư mục frontend: 41 test. Đạt hết, chạy lại ngày 06/11.
* Đối chiếu user story, quy tắc: chèn `docs/Phan 5/5.9-5.10-unit-test.md`, phần "Đối chiếu".

CẦN BỔ SUNG: cập nhật số test khi xong 5.9, 5.10, 9.2.

### 7c, 7d. Kiểm thử toàn bộ, ca lỗi và thành công

Chèn: `docs/ca-kiem-thu.md`.

E2E trên DB thử (9.3): lập hợp đồng → gửi và duyệt chỉ số → sinh viên xem hóa đơn → ghi thanh toán → gia hạn → kết thúc. Đạt 32/33 ca, gồm R1–R5, 404, 403. Ca chưa đạt: `GET /reports/summary?month=13` vẫn trả 200 vì API chưa lọc theo tháng (5.8).

CẦN BỔ SUNG: kết quả khi Nam xong 5.8, kiểm thử bản triển khai với 3 vai trò (9.5), ảnh chụp.

### 7e. Kiểm thử giao diện

* Chạy trên trình duyệt Edge với backend, DB thật: đi qua mọi trang của 3 vai trò ở desktop và khổ 375px, không lỗi console, không tràn ngang.
* Đã thử XSS bằng dữ liệu thật.
* So ảnh trước và sau khi chuyển `react-bootstrap` để bắt lỗi hiển thị mà test tự động không thấy.

## Câu 8. Báo cáo, link, đóng góp

Link ở phần "Thông tin nộp bài".

Đóng góp thành viên, theo phân công của nhóm. Trước khi nộp phải đối chiếu lại: mục chưa xong thì bỏ hoặc sửa.

Chu Thanh Tân:

* Tài liệu: đề bài, user stories, phân tích thiết kế, wireframe, ca kiểm thử, luật và đạo đức, báo cáo.
* Backend: DTO, mã lỗi, exception filter, API tài khoản, phân trang, tài liệu API, script tạo bảng, seed.
* Frontend: xử lý phiên, trang Cài đặt, hóa đơn, tổng quan, toast, chuyển `react-bootstrap`.
* Kiểm thử, triển khai: unit test, kiểm thử trên app thật, Vercel, Render.

Đặng Hải Nam:

* Đã làm: khung NestJS, CRUD phòng, phân quyền, đăng nhập, trang chủ, hóa đơn, chỉ số điện nước, đơn đăng ký ở, thông báo, `PaymentModule` (4.3), nghiệp vụ hợp đồng (5.1, 5.2), chặn xóa (5.3), bản đầu API báo cáo (5.8), trang hợp đồng (6.7).
* Đang làm, CẦN BỔ SUNG khi xong: báo cáo theo tháng (5.8) và các việc nhận thêm ngày 05/11 (4.8, 5.4, 5.6, 5.9, 5.10, 7.1, 7.3, 7.4, 8.3).

Lê Hải Sơn:

* Đã làm: entity Payment.
* Theo phân công, CẦN BỔ SUNG khi xong: xuất Excel, PDF (8.4), hướng dẫn sử dụng (10.2).
* Tân soạn bản đầu, Sơn tích hợp, kiểm thử: bảo mật đăng nhập (4.9), đổi mật khẩu (5.7), test frontend (9.2). CẦN BỔ SUNG khi xong.

## Câu 9. Luật, đạo đức, an ninh

Chèn: `docs/luat-dao-duc.md`.

## Câu 10. Quá trình

Lịch sử commit xem trên GitHub. Nhật ký từng việc ở `docs/logs.md`.

CẦN BỔ SUNG: số commit từng người lúc nộp.

## Kết luận

CẦN BỔ SUNG: kết quả đạt được, hạn chế, hướng phát triển, viết sau khi xong E2E.
