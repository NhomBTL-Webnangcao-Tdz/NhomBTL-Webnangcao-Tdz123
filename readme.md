# KTX Care

Hệ thống quản lý ký túc xá sinh viên. Bài tập lớn môn Phát triển Ứng dụng Web Nâng cao, lớp N02, Đại học Phenikaa.

* **Ứng dụng:** `https://ktx-care.vercel.app`
* **API:** `https://ktx-care-api.onrender.com`
* **Tài liệu API:** `https://ktx-care-api.onrender.com/api-docs`
* **Video demo:** cập nhật khi quay xong

Backend chạy gói miễn phí, lần đầu mở sau một lúc không dùng có thể chờ khoảng một phút.

## Nhóm

* Chu Thanh Tân, MSSV 23010165
* Đặng Hải Nam, MSSV 23010068
* Lê Hải Sơn, MSSV 23010722

Giảng viên hướng dẫn: `@lethunguyen`

## Chức năng

Sinh viên:

* Đăng ký tài khoản, hoàn thiện hồ sơ, gửi đơn đăng ký ở
* Xem phòng, bạn cùng phòng, hóa đơn, thông báo
* Gửi chỉ số điện nước kèm ảnh đồng hồ

Cán bộ quản lý:

* Quản lý phòng, duyệt đơn và xếp phòng, theo dõi hợp đồng
* Duyệt chỉ số, hệ thống tự tạo hóa đơn và chia tiền cho sinh viên trong phòng
* Lập khoản thu chung, đánh dấu đã đóng, nhắc nợ, xem và in hóa đơn
* Xem tổng quan: lấp đầy theo tòa, tiền đã thu, việc cần làm

Quản trị viên:

* Toàn bộ quyền của cán bộ, xóa hồ sơ, hợp đồng, hóa đơn
* Tạo tài khoản cán bộ, đổi vai trò người dùng

## Công nghệ

* **Frontend:** React 19, `react-bootstrap`, triển khai trên Vercel
* **Backend:** NestJS 12, TypeORM, JWT, bcrypt, class-validator, Swagger, triển khai trên Render
* **CSDL:** MySQL 8 trên Aiven, kết nối SSL

## Cấu trúc thư mục

```text
NhomBTL-Webnangcao-Tdz123/
├── quan-ly-ktx/
│   ├── backend/      # NestJS: src/ (mã nguồn), test/ (unit test), database/ (init.sql)
│   └── frontend/     # React: src/ (api, components, context, pages)
├── docs/             # Đề bài, thiết kế, báo cáo, log từng việc
├── checklist.md      # Tiến độ
└── LICENSE
```

## Chạy trên máy

Cần Node.js từ bản 20 và MySQL 8 (trên máy hoặc Aiven).

### Backend

Tạo database:

```sql
CREATE DATABASE IF NOT EXISTS quan_ly_ktx CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Tạo file `quan-ly-ktx/backend/.env`. File này không đưa lên git.

```text
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=<mật khẩu MySQL>
DB_NAME=quan_ly_ktx
DB_SYNCHRONIZE=true
DB_SSL=false
JWT_SECRET=<chuỗi ngẫu nhiên ít nhất 32 ký tự>
SEED_DEMO_PASSWORD=<mật khẩu tài khoản demo, ít nhất 8 ký tự>
```

Dùng Aiven thì thêm `DB_SSL=true`, `DB_SSL_REJECT_UNAUTHORIZED=true`, `DB_SSL_CA=<đường dẫn file CA>`.

Cài đặt và chạy:

```bash
cd quan-ly-ktx/backend
npm install
npm run start:dev
```

Tạo dữ liệu demo, chạy một lần sau khi đã có bảng:

```bash
npm run seed
```

Lệnh tạo các tài khoản `demo_admin`, `demo_manager`, `demo_student`, dùng chung mật khẩu `SEED_DEMO_PASSWORD`.

### Frontend

```bash
cd quan-ly-ktx/frontend
npm install
npm start
```

Mở `http://localhost:3000`. Mặc định frontend gọi `http://localhost:5001`, đổi bằng `REACT_APP_API_URL`, xem `.env.example`.

## Kiểm thử

Backend, unit test nằm trong `test/unit`:

```bash
npm test
```

Frontend:

```bash
npm test -- --watchAll=false
```

Ca kiểm thử xem `docs/ca-kiem-thu.md`.

## Tài liệu API

* Swagger: chạy backend rồi mở `http://localhost:5001/api-docs`
* Postman: nhập `docs/postman/ktx-care.postman_collection.json`, điền biến `password`, chạy Đăng nhập trước
* Xuất lại Postman collection: `npm run postman:export`, backend phải đang chạy

## Triển khai

Xem `docs/trien-khai.md`. Production không tự tạo bảng, tạo bằng `database/init.sql`.

## Tài liệu khác

* `docs/de-bai.md`: đề bài
* `docs/user-stories.md`: user stories
* `docs/phan-tich-thiet-ke.md`: phân tích, UML, sơ đồ thuật toán
* `docs/wireframe-luong-xu-ly.md`: wireframe, luồng xử lý
* `docs/phan-tich-orm.md`: phân tích ORM
* `docs/luat-dao-duc.md`: luật, đạo đức, an ninh

## Giấy phép

MIT, xem `LICENSE`.
