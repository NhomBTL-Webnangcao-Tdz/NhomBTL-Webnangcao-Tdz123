# Triển khai KTX Care

Frontend trên Vercel, backend trên Render, database trên Aiven của Tân. Không ghi mật khẩu vào file này.

* Frontend: `https://ktx-care.vercel.app`
* Backend: `https://ktx-care-api.onrender.com`
* Tài liệu API: `https://ktx-care-api.onrender.com/api-docs`

## 1. Backend trên Render

* Đăng nhập Render bằng GitHub, cấp quyền repo của nhóm.
* Chọn New, Blueprint, chọn repo, nhánh `feature/tandz` (đổi sang `main` sau khi merge).
* Blueprint Path: `quan-ly-ktx/backend/render.yaml`.
* Điền `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` theo trang Overview của Aiven. `FRONTEND_URL` để tạm, điền ở bước 3.
* Vào Environment, Secret Files, tạo file tên `ca.pem`, dán nội dung `certs/ca_tan.pem`.
* Deploy xong, mở `<link Render>/api-docs` để kiểm tra.

## 2. Frontend trên Vercel

Repo thuộc acc phụ của nhóm nên Vercel không import được, deploy bằng CLI từ máy Tân. Mỗi lần cập nhật frontend phải chạy lại lệnh deploy, push không tự deploy.

* Trong `quan-ly-ktx/frontend` chạy `npx vercel login`, rồi `npx vercel link`, project `ktx-care`.
* Thêm link backend: `npx vercel env add REACT_APP_API_URL production`, giá trị không có dấu `/` ở cuối.
* Thêm `REACT_APP_MANAGER_EMAIL`, `REACT_APP_MANAGER_PHONE` nếu cần trang Liên hệ.
* Deploy: `npx vercel --prod`.

## 3. Nối hai bên

* Trên Render đặt `FRONTEND_URL` là link Vercel, không có dấu `/` ở cuối, rồi deploy lại.
* Mở link Vercel, đăng nhập `demo_admin`.

## Khi code có đổi bảng

Production không tự đổi bảng. Trước khi deploy code có đổi entity, phải đổi bảng trên Aiven trước, nếu không app lỗi.

Đưa `feature/gop-main` lên bản online: chạy câu sau trong Workbench, rồi đổi nhánh trên Render:

```sql
ALTER TABLE quan_ly_ktx.rooms ADD COLUMN is_maintenance tinyint NOT NULL DEFAULT 0;
```

## Lưu ý

* Bảng và dữ liệu demo đã có trong Aiven. DB mới thì chạy `database/init.sql` rồi `npm run seed`.
* Đổi `REACT_APP_*` phải build lại frontend.
* Render miễn phí ngủ khi không có người dùng, lần đầu mở chờ khoảng một phút.
* Ảnh tải lên lưu trên ổ đĩa server, có thể mất khi server khởi động lại.
* `JWT_SECRET` do Render tự sinh, khác máy cá nhân.
