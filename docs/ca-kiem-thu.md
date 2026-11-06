# Ca kiểm thử — KTX Care

Trạng thái: bản nháp (checklist 9.7, Đề 7d). Cập nhật ngày 05/11/2026 trên nhánh `feature/tandz`.

* Kết quả: backend 136/136 pass (`npm test`), frontend 85/85 pass (`CI=true npx react-scripts test --watchAll=false`).
* Unit test giả lập repository, API. Ngoài ra có các ca chạy trên API và trình duyệt thật với DB thật (mục cuối). E2E đủ luồng hợp đồng chờ checklist 9.3.
* Định dạng mỗi ca: mã, loại (TC thành công / TL lỗi), đầu vào → mong đợi. Kết quả thực tế: đạt (trừ khi ghi khác).
* BE = file `*.spec.ts` trong `quan-ly-ktx/backend/test/unit`, FE = `quan-ly-ktx/frontend/src/App.test.js`, TT = kiểm thử tay trên app với backend giả (log 6.3, 9.1).

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

## US-05 Đổi mật khẩu

* TC-39 TC: nhập đúng mật khẩu hiện tại, mật khẩu mới hợp lệ → lưu mã băm mới, mật khẩu cũ không đăng nhập được. BE, Edge
* TL-24 TL: sai mật khẩu hiện tại → 400, báo trong hộp, không bị đăng xuất. BE, FE, Edge
* TL-25 TL: mật khẩu mới dưới 6 ký tự, trùng mật khẩu cũ, nhập lại không khớp → báo lỗi, không đổi. BE, FE
* TL-26 TL: sai mật khẩu hiện tại 5 lần → lần sau trả 429. BE, API
* TL-27 TL: không có token → 401. API

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

## Xuất Excel, PDF (8.4)

* TC-40 TC: bấm Xuất Excel ở trang phòng, hóa đơn → tải file đúng số dòng đang lọc, tiếng Việt đúng. FE, Edge
* TC-41 TC: bấm Xuất PDF → hiện bảng in đủ dòng, in xong bảng biến mất. FE, Edge
* TL-28 TL: không có dòng nào → khóa 2 nút. FE
* TL-29 TL: dữ liệu chứa HTML hoặc bắt đầu bằng `=` → hiện dạng chữ, không chạy. FE

## Giao diện chung (Đề 7e)

* TC-30 TC: 12 trang ở khổ 375px không cuộn ngang, console không lỗi. TT
* TC-31 TC: dữ liệu chứa HTML/JS hiện dạng chữ ở mọi trang. TT
* TC-32 TC: bản build không có source map. TT

## Kiểm thử trên API và trình duyệt thật (DB thật, 04/11/2026)

* TC-33 TC: sinh viên đăng ký, lưu hồ sơ, gửi đơn; cán bộ duyệt; sĩ số tăng, sinh viên thấy phòng, nhận thông báo. API
* TC-34 TC: sinh viên gửi chỉ số kèm ảnh, cán bộ duyệt, tạo hóa đơn, đánh dấu đã đóng thì hóa đơn thành đã thu. API
* TC-35 TC: thêm phòng, tạo và thanh lý hợp đồng qua giao diện, dữ liệu lưu đúng. Edge
* TC-36 TC: tạo cán bộ, đổi vai trò, MANAGER không thấy trang Cài đặt. Edge
* TC-37 TC: lọc hóa đơn theo tòa, kỳ, trạng thái; đánh dấu đã thu rồi hoàn tác. Edge
* TC-38 TC: phân trang, tìm kiếm; `limit` quá lớn, tham số lạ trả 400. API
* TL-15 TL: gửi đơn trùng, duyệt lại đơn đã xử lý → 409. API
* TL-16 TL: sinh viên gọi API duyệt đơn, xem hợp đồng, xem danh sách tài khoản → 403. API
* TL-17 TL: file không phải ảnh → 400. API
* TL-18 TL: sinh viên khác xem ảnh đồng hồ, biên lai → bị chặn. API
* TL-19 TL: mã sinh viên trùng, phòng đã có hóa đơn cùng kỳ, sửa chỉ số hóa đơn đã thu → 409. API
* TL-20 TL: xóa phòng còn hợp đồng → 409, toast báo lỗi, dữ liệu còn nguyên. Edge
* TL-21 TL: JSON sai cú pháp → 400, không trả lại nội dung đã gửi. API
* TL-22 TL: chuỗi `' OR 1=1 --` trong tìm kiếm → không lỗi, không lộ dữ liệu. API
* TL-23 TL: tên sinh viên chứa thẻ `img onerror` → hiện dạng chữ, script không chạy. Edge

Lỗi tìm được khi kiểm thử và đã sửa:

* Ảnh đồng hồ, biên lai luôn trả 404 trên Windows do so đường dẫn bằng dấu `/` cố định.
* `POST /student` trùng mã ghi đè sinh viên cũ.
* Xóa phòng thất bại không hiện thông báo.

## Chưa có ca kiểm thử

* US-21 thanh toán: chưa có chức năng.
* US-16 đủ nghiệp vụ hợp đồng: chờ checklist 5.1, 5.2.
* E2E đủ luồng và kiểm thử trên bản triển khai với 3 vai trò: chờ checklist 9.3, 9.5.
