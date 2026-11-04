# Triển khai KTX Care

Frontend trên Vercel, backend trên Render, database trên Aiven của Tân. Không ghi mật khẩu vào file này.

## 1. Backend trên Render

* Đăng nhập Render bằng GitHub, cấp quyền repo của nhóm.
* Chọn New, Blueprint, chọn repo, nhánh `feature/tandz` (đổi sang `main` sau khi merge).
* Blueprint Path: `quan-ly-ktx/backend/render.yaml`.
* Điền `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` theo trang Overview của Aiven. `FRONTEND_URL` để tạm, điền ở bước 3.
* Vào Environment, Secret Files, tạo file tên `ca.pem`, dán nội dung `certs/ca_tan.pem`.
* Deploy xong, mở `<link Render>/api-docs` để kiểm tra.

## 2. Frontend trên Vercel

* Đăng nhập Vercel bằng GitHub, Add New Project, chọn repo.
* Root Directory: `quan-ly-ktx/frontend`. Framework: Create React App.
* Thêm biến `REACT_APP_API_URL` là link Render, không có dấu `/` ở cuối.
* Thêm `REACT_APP_MANAGER_EMAIL`, `REACT_APP_MANAGER_PHONE` nếu cần trang Liên hệ.
* Settings, Git: đặt Production Branch là `feature/tandz` cho tới khi merge.

## 3. Nối hai bên

* Trên Render đặt `FRONTEND_URL` là link Vercel, không có dấu `/` ở cuối, rồi deploy lại.
* Mở link Vercel, đăng nhập `demo_admin`.

## Lưu ý

* Bảng và dữ liệu demo đã có trong Aiven. DB mới thì chạy `database/init.sql` rồi `npm run seed`.
* Đổi `REACT_APP_*` phải build lại frontend.
* Render miễn phí ngủ khi không có người dùng, lần đầu mở chờ khoảng một phút.
* Ảnh tải lên lưu trên ổ đĩa server, có thể mất khi server khởi động lại.
* `JWT_SECRET` do Render tự sinh, khác máy cá nhân.
