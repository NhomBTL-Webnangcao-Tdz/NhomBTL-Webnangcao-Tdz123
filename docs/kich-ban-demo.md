# Kịch bản video demo

Video dưới 8 phút [Đề 8]. Dự kiến 7 phút. Quay trên `https://ktx-care.vercel.app`.

## Chuẩn bị

* Mở app trước 2 phút để backend thức dậy.
* Chạy lại dữ liệu demo cho sạch; xóa dữ liệu nhóm đã thử.
* Tạo sẵn 1 tài khoản sinh viên mới để diễn luồng đăng ký, VD `sv_demo`.
* Mở 2 cửa sổ ẩn danh: 1 cho sinh viên, 1 cho cán bộ.
* Chuẩn bị 2 ảnh đồng hồ điện, nước. Không dùng ảnh thật có thông tin cá nhân.
* Ẩn thanh dấu trang, không để lộ mật khẩu hay file `.env` khi quay.

## Các đoạn

Giới thiệu, 0:00–0:30:

* Tên nhóm, tên dự án, bài toán: quản lý ký túc xá.
* Trang chủ, nêu công nghệ: React, react-bootstrap, NestJS, TypeORM, MySQL.

Sinh viên đăng ký ở, 0:30–1:45:

* Đăng nhập `sv_demo`, sau đó hoàn thiện hồ sơ.
* Vào Phòng của tôi, gửi yêu cầu lưu trú.
* Nói: đăng nhập xong tự chuyển trang theo vai trò, sinh viên chỉ thấy menu của mình.

Cán bộ duyệt đơn, 1:45–2:45:

* Đăng nhập `demo_manager`, trang tổng quan có việc cần làm, bấm vào yêu cầu chờ duyệt.
* Duyệt, chọn tòa, tầng, phòng còn chỗ; tiền cọc tự điền.
* Quay lại sinh viên: thấy phòng, bạn cùng phòng, có thông báo.

Chỉ số và hóa đơn, 2:45–4:15:

* Sinh viên gửi chỉ số điện nước kèm 2 ảnh.
* Cán bộ xem ảnh, duyệt chỉ số; hệ thống tự tính tiền, chia cho sinh viên trong phòng.
* Sinh viên thấy hóa đơn. Cán bộ đánh dấu đã thu, mở chi tiết, bấm In hóa đơn.

Hợp đồng, thanh toán, 4:15–5:00:

* Tạo hợp đồng, gia hạn hoặc thanh lý, ghi nhận thanh toán. Đoạn này quay sau khi Nam xong 4.3, 5.1, 5.2, 6.7.

Quản trị, 5:00–5:40:

* Đăng nhập `demo_admin`, trang Cài đặt: sửa đơn giá, tạo tài khoản cán bộ, đổi vai trò.
* Nói: không tự đổi được vai trò của mình, không hạ được ADMIN cuối cùng.

An toàn và lỗi, 5:40–6:30:

* Nhập giá âm: báo lỗi tiếng Việt.
* Xóa phòng còn hợp đồng: bị chặn, có thông báo.
* Sinh viên gõ `#settings`: không vào được.
* Nói ngắn: JWT, bcrypt, CORS, DTO, không lộ lỗi hệ thống.

Tài liệu và kiểm thử, 6:30–7:00:

* Mở `/api-docs`, chạy Đăng nhập trong Postman.
* Chạy `npm test`, cho thấy các test đạt.
* Khổ điện thoại: mở thử 1 trang ở 375px.
* Kết: link GitHub, link demo.

## Lưu ý khi quay

* Quay đoạn nào hỏng thì quay lại đoạn đó, ghép sau.
* Cả 3 thành viên nên có phần nói để thể hiện đóng góp.
* Kiểm tra thời lượng dưới 8 phút trước khi đưa link vào báo cáo.
