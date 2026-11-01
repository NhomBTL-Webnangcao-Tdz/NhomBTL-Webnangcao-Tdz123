# Ca kiểm thử — KTX Care

Trạng thái: bản nháp (checklist 9.7, Đề 7d). Chạy ngày 01/11/2026 trên nhánh `feature/tandz` (sau `9ff17dc`).

* Kết quả: backend 27/27 pass (`npm test`), frontend 25/25 pass (`CI=true npx react-scripts test --watchAll=false`).
* Đây là unit test, backend giả lập repository, frontend giả lập API. Chưa có E2E với DB thật (checklist 9.3).
* Định dạng mỗi ca: mã, loại (TC thành công / TL lỗi), đầu vào → mong đợi. Kết quả thực tế: đạt (trừ khi ghi khác).
* BE = file `*.spec.ts` trong `quan-ly-ktx/backend/src`, FE = `quan-ly-ktx/frontend/src/App.test.js`, TT = kiểm thử tay trên app với backend giả (log 6.3, 9.1).

## US-01 Trang giới thiệu

* TC-01 TC: mở `/` chưa đăng nhập → thấy trang giới thiệu, menu 6 mục, nút "Bắt đầu sử dụng" trỏ `#login`. FE

## US-02 Đăng ký

* TC-02 TC: đăng ký username hợp lệ → lưu username đã chuẩn hóa, chỉ lưu hash bcrypt, vai trò STUDENT. BE `auth.service`, `users.service`
* TC-03 TC: form đăng ký gửi đúng body tới `POST /auth/register`, báo thành công, không lưu token. FE
* TL-01 TL: username đã tồn tại → 409. BE `auth.service`
* TL-02 TL: hai request đăng ký trùng cùng lúc vi phạm ràng buộc duy nhất → 409. BE `users.service`

## US-03 Đăng nhập

* TC-04 TC: đúng mật khẩu → trả JWT và thông tin tài khoản, không có password. BE `auth.service`
* TC-05 TC: đăng nhập trên giao diện → lưu token, chuyển bảng điều khiển theo vai trò. FE
* TC-06 TC: chỉ truy vấn có chọn cột hash khi xác thực, các truy vấn khác không trả hash. BE `users.service`
* TL-03 TL: sai mật khẩu và username không tồn tại → cùng một thông báo 401 (không lộ username có tồn tại). BE `auth.service`
* TL-04 TL: sai mật khẩu trên giao diện → hiện thông báo backend, không hiện thông báo phiên. FE, TT

## US-04 Phiên đăng nhập, phân quyền

* TC-07 TC: header `Bearer <token hợp lệ>` → guard cho qua, gắn user vào request. BE `jwt-auth.guard`
* TL-05 TL: thiếu header, `Basic ...`, `Bearer` rỗng, `Bearer a b` → 401. BE `jwt-auth.guard`
* TL-06 TL: JWT sai chữ ký / hết hạn → 401. BE `jwt-auth.guard`
* TL-07 TL: token hết hạn lúc mở app → về đăng nhập, báo phiên hết hạn, xóa token. FE, TT
* TL-08 TL: token bị từ chối khi đang dùng (kể cả lúc tải ảnh biên lai) → đăng xuất. FE, TT
* TL-09 TL: API trả 403 → báo "Bạn không có quyền thực hiện thao tác này.", giữ phiên. FE, TT
* TL-10 TL: MANAGER mở `#settings` → "Không đủ quyền truy cập", sidebar không có Cài đặt. FE
* TL-11 TL: MANAGER mở `#students` (trang đã bỏ) → "Không tìm thấy trang", không gọi API sinh viên. FE
* TC-08 TC: ADMIN thấy link Cài đặt. FE

## US-06 Thông báo

* TC-09 TC: có thông báo chưa đọc → chấm đỏ; đánh dấu đã đọc → chấm mất. FE
* TC-10 TC: nội dung thông báo chứa `<img onerror>` → hiện dạng chữ, script không chạy. TT

## US-07, US-08 Hồ sơ, đơn đăng ký ở

* TC-11 TC: lưu hồ sơ → tạo Student và liên kết tài khoản trong một transaction. BE `student.service`
* TC-12 TC: gửi đơn → tạo đơn PENDING và thông báo cán bộ trong một transaction. BE `student.service`
* TC-13 TC: hoàn thiện hồ sơ rồi gửi đơn trên giao diện. FE
* TL-12 TL: tài khoản chưa liên kết hồ sơ → không trả danh sách bạn cùng phòng, hóa đơn. BE `student.service`

## US-09, US-10, US-12 Phòng, hóa đơn của sinh viên

* TC-14 TC: sinh viên chỉ thấy 4 mục cổng sinh viên, không thấy menu quản lý. FE
* TC-15 TC: hóa đơn chưa đóng hiện ngay, kể cả hạn còn hơn 7 ngày. BE `student.service`, FE
* TC-16 TC: khoản thu chung có ảnh biên lai → tải ảnh có xác thực, hiện link xem ảnh. FE

## US-11, US-17, US-18 Chỉ số điện nước, hóa đơn

* TC-17 TC: tiền điện nước = tiêu thụ × đơn giá. BE `meter-reading-calculations`
* TC-18 TC: tổng = điện nước + tiền phòng. BE `meter-reading-calculations`
* TC-19 TC: hạn đóng ngày 10 tháng sau, tháng 12 chuyển sang năm sau. BE `meter-reading-calculations`
* TC-20 TC: chia đều, phần dư xu chia cố định, tổng các phần bằng tổng hóa đơn. BE `meter-reading-calculations`
* TC-21 TC: phòng đã có khoản thu chung cùng kỳ vẫn tạo được hóa đơn điện nước. BE `meter-reading.service`
* TL-13 TL: tạo hóa đơn điện nước thứ hai cùng phòng, cùng kỳ → 409. BE `meter-reading.service`
* TC-22 TC: sinh viên nhập chỉ số và gửi kèm 2 ảnh. FE
* TC-23 TC: cán bộ xem ảnh, sửa chỉ số, duyệt. FE
* TC-24 TC: chưa có đơn giá → tạo mặc định trong transaction; đã có thì không ghi đè. BE `utility-tariff.service`

## US-15 Duyệt đơn, xếp phòng

* TC-25 TC: cán bộ chọn tòa → tầng → phòng còn chỗ rồi duyệt. FE
* TC-26 TC: chờ truy vấn đơn đã duyệt xong mới giải phóng kết nối. BE `student.service`

## US-16, US-19 Hợp đồng, thu tiền

* TC-27 TC: form hợp đồng dùng bộ chọn tòa/tầng/phòng chung. FE
* TC-28 TC: tạo khoản thu chung không cần ảnh. FE
* TC-29 TC: liên hệ sinh viên, nhắc nợ quá hạn, theo dõi phần tiền từng người. FE

## US-20 Tổng quan

* TL-14 TL: API lỗi 503 → bảng điều khiển hiện thông báo không tải được số liệu. FE

## Giao diện chung (Đề 7e)

* TC-30 TC: 12 trang ở khổ 375px không cuộn ngang, console không lỗi. TT
* TC-31 TC: dữ liệu chứa HTML/JS hiện dạng chữ ở mọi trang. TT
* TC-32 TC: bản build không có source map. TT

## Chưa có ca kiểm thử

* US-05 đổi mật khẩu, US-21 thanh toán, US-23 tài khoản cán bộ: chưa có chức năng.
* US-14 phòng, US-16 hợp đồng (backend), US-19 `updateSharePayment`, `remindStudent`, US-24 xóa: chưa có unit test backend (checklist 5.10).
* Lỗi khi duyệt đơn: phòng đầy, đơn đã xử lý; lỗi khi gửi chỉ số: quá hạn, chỉ số nhỏ hơn kỳ trước: chưa có test.
* E2E với DB thật: chưa (checklist 9.3).
