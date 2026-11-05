# Luật, đạo đức và an ninh an toàn — KTX Care

Trạng thái: bản nháp, chờ nhóm duyệt (checklist 10.6, Đề 9 phần 0.6 điểm). Cập nhật theo code nhánh `feature/tandz` ngày 05/11/2026.

## 1. Luật (0.2 điểm)

Bảo vệ dữ liệu cá nhân, Nghị định 13/2023/NĐ-CP:

* Hệ thống xử lý dữ liệu cá nhân cơ bản: họ tên, mã SV, email, số điện thoại, phòng ở, khoản nợ, ảnh đồng hồ điện nước.
* Đã làm theo: chỉ thu dữ liệu cần cho quản lý lưu trú; sinh viên tự xem và sửa hồ sơ (US-07); chỉ tài khoản có quyền mới đọc được (guard theo vai trò, sinh viên chỉ đọc dữ liệu của mình qua token); mật khẩu chỉ lưu dạng băm.
* Chưa làm: chưa có thông báo và lấy đồng ý khi đăng ký; chưa có chức năng yêu cầu xóa dữ liệu; chưa quy định thời gian lưu ảnh đồng hồ; ảnh thật đang nằm trong lịch sử git (checklist 1.11).

An toàn thông tin mạng (Luật An toàn thông tin mạng 2015) và Luật An ninh mạng 2018:

* Chủ hệ thống phải có biện pháp bảo vệ: xác thực, phân quyền, mã hóa đường truyền, giữ bí mật cấu hình. Mục 4 liệt kê những gì dự án đã và chưa làm.
* Khi triển khai thật phải chạy HTTPS và đặt máy chủ, DB theo quy định lưu trữ dữ liệu của người dùng Việt Nam.

Sở hữu trí tuệ, giấy phép phần mềm:

* Mã nguồn dự án phát hành theo MIT (`LICENSE`).
* Thư viện chính đều dùng giấy phép mở, cho phép dùng lại nếu giữ thông báo bản quyền: React, React-Bootstrap, Bootstrap, NestJS, TypeORM, mysql2, bcrypt, class-validator, multer (MIT); dotenv (BSD-2-Clause); rxjs (Apache-2.0).
* Giao diện theo mẫu trang React Native (Đề 5b): chỉ học bố cục, không chép logo, nhãn hiệu, hình ảnh và nội dung của trang gốc.

Hóa đơn trong hệ thống là thông báo khoản thu nội bộ ký túc xá, không phải hóa đơn điện tử theo Nghị định 123/2020/NĐ-CP.

## 2. Đạo đức nghề nghiệp (0.2 điểm)

* Bảo mật ngay từ thiết kế: băm mật khẩu, phân quyền ở backend, không tin dữ liệu từ client (DTO, server tự tính tiền).
* Trung thực về chất lượng: log mỗi mục ghi rõ phần nào đã kiểm thử, phần nào chưa; lỗi cố ý tạo khi thử được ghi là cố ý.
* Có trách nhiệm khi sai sót: mật khẩu DB Aiven từng bị commit lên git; nhóm đã gỡ khỏi code, chuyển sang `.env` và yêu cầu đổi mật khẩu (checklist 1.1, phần 11).
* Tôn trọng giấy phép: kiểm license của thư viện, giữ thông báo bản quyền, không dùng tài nguyên không rõ nguồn.
* Minh bạch đóng góp: mỗi người commit phần mình làm, có bảng đóng góp (checklist 10.7). Công cụ AI (Claude Code) được dùng hỗ trợ viết code và tài liệu; người dùng tự đọc, kiểm thử và chịu trách nhiệm phần mình commit.
* Không tự ý sửa phần người khác phụ trách: phát hiện lỗi ở phần backend thì ghi thành đề xuất trong checklist.

## 3. Đạo đức xã hội (0.2 điểm)

* Quyền riêng tư: số điện thoại chỉ hiện cho bạn cùng phòng và cán bộ; khoản nợ của sinh viên không công khai cho người khác; ảnh đồng hồ chỉ cán bộ và chính người gửi xem được.
* Công bằng, minh bạch: tiền điện nước tính theo công thức cố định và đơn giá lưu kèm hóa đơn; chia đều cho người đang ở, phần dư từng xu chia theo quy tắc cố định; chỉ số có ảnh làm bằng chứng.
* Không gây áp lực: chỉ được nhắc nợ sau khi hóa đơn quá hạn, nội dung nhắc lịch sự.
* Dễ tiếp cận: giao diện tiếng Việt, dùng được trên điện thoại 375px, mỗi việc chính không quá 4 thao tác (Đề 5c).
* Lợi ích chung: giảm giấy tờ và việc đi lại khi đăng ký ở, nộp chỉ số, xem hóa đơn.

## 4. Tự kiểm tra an ninh an toàn

Đã có:

* Mật khẩu băm bcrypt 12 vòng, giới hạn 72 byte; cột mật khẩu không trả ra API (`select: false`).
* JWT ký bằng `JWT_SECRET` bắt buộc dài ít nhất 32 ký tự, hết hạn sau 1 giờ.
* `JwtAuthGuard` + `RolesGuard` trên mọi controller nghiệp vụ; sinh viên được xác định qua token, không qua tham số URL.
* Đăng nhập sai trả cùng một thông báo, không lộ username có tồn tại hay không.
* `ValidationPipe` toàn cục (`whitelist`, `forbidNonWhitelisted`), DTO cho các API đang có.
* Exception filter chung không trả stack trace hay câu SQL cho client.
* CORS chỉ cho `localhost:3000` và các origin trong `FRONTEND_URL`; đã thử trên bản triển khai, địa chỉ lạ bị từ chối.
* Bản triển khai chạy HTTPS trên Vercel, Render.
* Thao tác ghi nhiều bảng chạy trong transaction, có khóa dòng để tránh duyệt trùng.
* Tải ảnh: chỉ nhận JPG/PNG/WEBP, tối đa 5 MB; ảnh chỉ tải được qua API có xác thực.
* Cấu hình bí mật nằm trong `.env`, không commit; kết nối DB có SSL.
* Frontend: không render HTML từ dữ liệu (đã thử chuỗi XSS ở 12 trang); 401 tự đăng xuất, 403 báo không có quyền; bản build không có source map; không `console.log` dữ liệu.

Chưa có hoặc còn rủi ro (kèm mục checklist):

* Token lưu ở `localStorage`, có thể bị đọc nếu trang dính XSS; cân nhắc cookie `httpOnly` (4.11).
* Chưa giới hạn số lần đăng nhập sai, chưa có header bảo mật `helmet` (4.9).
* Ảnh thật của người dùng đang được commit trong `backend/storage/` (1.11).
* Mật khẩu Aiven cũ còn trong lịch sử git của repo công khai và chưa được đổi; bản nộp đã chuyển sang DB khác, service cũ cần đổi mật khẩu hoặc tắt (1.1).
* Chưa có nhật ký thao tác (ai sửa, xóa gì).
* Đổi vai trò chỉ có hiệu lực đầy đủ khi token cũ hết hạn, tối đa 1 giờ.
