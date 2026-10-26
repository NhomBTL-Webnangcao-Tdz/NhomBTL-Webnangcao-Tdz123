# Đề thi bài tập lớn cuối kỳ

Đề lớp N02, Trường CNTT, Đại học Phenikaa, năm học 2026-2027, học kỳ 1, lần thi 1. File này viết lại đề gốc thành các yêu cầu kiểm tra được. Không sửa nội dung đề; chỗ đề không rõ ghi ở mục "Điểm cần hỏi giáo viên".

* **Nhóm:** 3 sinh viên (Chu Thanh Tân, Đặng Hải Nam, Lê Hải Sơn)
* **Dự án:** KTX Care, hệ thống quản lý ký túc xá sinh viên
* **Tiến độ đối chiếu với đề:** `checklist.md`

---

## 1. Hạn nộp và điều kiện 0 điểm

Hạn nộp:

* Bản cứng: 09/11/2026, trước 17h, tại phòng giáo viên 2310, tầng 23, nhà A9; ký vào danh sách nộp trên bàn giáo viên
* Bản PDF: 09/11/2026, 23h59, nộp trên Canvas

Mỗi sinh viên nộp 1 bản cứng, bìa có 1 tên và 1 mã sinh viên. Nội dung là một trong hai:

* Báo cáo chung của nhóm, có phần đóng góp chi tiết (Contribution)
* Báo cáo riêng của từng sinh viên, đúng phần sinh viên đó đã làm

Điều kiện 0 điểm cả bài (thiếu một mục là 0 điểm):

* Không nộp bản PDF
* Không nộp bản cứng
* Báo cáo không có link GitHub
* Báo cáo không có link demo
* Sinh viên không có đóng góp trong dự án
* Sinh viên không ký vào danh sách nộp bản cứng

## 2. Công nghệ bắt buộc

* Backend: NestJS, mô hình phân lớp (module → controller → service → entity/repository)
* Frontend: React, giao diện dùng thư viện `react-bootstrap` (câu 5b)
* CSDL quan hệ, truy cập qua ORM (dự án dùng TypeORM + MySQL)
* Repo có file LICENSE kèm thông báo bản quyền (câu 3c)

## 3. Yêu cầu từng câu

Mỗi câu 1 điểm. "Nộp" cho biết sản phẩm nằm ở code, báo cáo, hay cả hai.

### Câu 1. User Stories (1đ). Nộp: báo cáo

* Nhóm 3 người: tối thiểu 12 câu chuyện người dùng, không giới hạn tối đa. Điểm chia theo tỷ lệ số câu đạt.
* Định dạng bắt buộc: "Là <vai trò>, tôi muốn <hành động>." (có thể thêm "để <lợi ích>"). Sai định dạng: 0 điểm.
* Ví dụ của đề: "Là người dùng, tôi muốn truy cập vào tài khoản của mình." và "Là người quản trị, tôi muốn quản lý tài khoản người dùng."
* Câu 1 là gốc của 2b, 3b, 7b: mỗi story nên có mã (US-01…) và ứng với API, màn hình, test. Bản nháp ở `docs/user-stories.md`.

### Câu 2. Phân tích và thiết kế (1đ). Nộp: báo cáo

* 2a: phân tích yêu cầu, đối tượng, mối quan hệ giữa các đối tượng, phương thức hoạt động.
* 2b: sơ đồ lớp UML (Class Diagram) và sơ đồ thuật toán (flowchart) mô tả bài toán ở câu 1 và 2a.
* UML phải khớp entity trong code lúc nộp.

### Câu 3. Giao diện, luồng xử lý, khung dự án (1đ)

* 3a (0.2đ, báo cáo): wireframe bố cục giao diện chính.
* 3b (0.25đ, báo cáo): luồng xử lý thông tin chính của bài toán ở câu 1 và 2.
* 3c (0.2đ, code): backend NestJS phân lớp, frontend React, có file LICENSE có thông báo bản quyền.
* 3d (0.35đ, code + báo cáo): backend NestJS có cấu hình Security; frontend React không lộ thông tin người dùng, không lộ dữ liệu khi gọi API.

Tiêu chí 3d phía frontend: không để bí mật trong code frontend, không đưa dữ liệu nhạy cảm lên URL, API không trả trường thừa (VD hash mật khẩu), token lưu an toàn, không `console.log` dữ liệu người dùng.

### Câu 4. API backend (1đ)

* 4a (0.5đ, code): API xử lý các thao tác nghiệp vụ (không chỉ CRUD).
* 4b (0.2đ, code/tài liệu): tài liệu hóa API theo hướng dẫn nghề nghiệp đã dạy trên lớp.
* 4c (0.3đ, code + báo cáo): 4a và 4b tuân thủ an ninh an toàn.

Danh sách an ninh đề nêu ở 4c. Mỗi mục cần ghi cách làm và vị trí trong code:

* Token
* Mã băm mật khẩu
* Xử lý phiên giao dịch
* Xử lý cookies
* Xử lý CORS
* Xử lý "XORs" (xem mục 4, điểm 1)
* Xác thực và định danh (authentication, authorization)
* "vv..": làm thêm được thì ghi rõ (VD helmet, giới hạn số lần đăng nhập sai, validate đầu vào)

### Câu 5. Frontend (1đ)

* 5a (0.3đ, code): bố cục logic phần hiển thị thống nhất với wireframe ở 3a.
* 5b (0.5đ, code): UI theo mẫu trang React Native "Learn once, write anywhere" (3 ảnh chụp kèm đề: `Screenshot_1-1.png`, `Screenshot_4-1.png`, `Screenshot_5-1.png`). Bắt buộc dùng `react-bootstrap`.
* 5c (0.2đ, code + báo cáo): usability. Không quá 4 thao tác cho một việc, ứng dụng thông minh, hiển thị không gây phiền.

Lưu ý 5b: đây là web React mô phỏng giao diện trang reactnative.dev, không phải viết app React Native. CSS tự viết không thay được yêu cầu dùng `react-bootstrap`.

### Câu 6. CSDL và ORM (1đ)

* 6a (0.5đ, code): kết nối CSDL, thực hiện ORM với CSDL quan hệ trong khung phân lớp của 3c.
* 6b (0.5đ, báo cáo): phân tích, diễn tả quá trình ORM và các truy vấn khi dùng cấu trúc 3c, 4a; làm nổi bật các bước kết nối chính.

6b nên có: cấu hình kết nối, entity ↔ bảng, quan hệ ↔ khóa ngoại, repository/query, và câu SQL thật do ORM sinh ra (bật logging để lấy).

### Câu 7. Kiểm thử và kiểm định (1đ, mỗi ý 0.2đ)

* 7a (code): bắt lỗi trong mọi trường hợp có thể.
* 7b (code): unit test trong thư mục `test` cho tất cả chức năng ở câu 1.
* 7c (code + báo cáo): kiểm thử toàn bộ ứng dụng.
* 7d (báo cáo): phân tích các trường hợp chạy lỗi và thành công.
* 7e (code + báo cáo): kiểm thử phần giao diện frontend.

### Câu 8. Báo cáo bản in (1đ). Nộp: báo cáo

* Đúng quy định trình bày của Đại học Phenikaa.
* Có trang gồm: link demo (video dưới 8 phút), link GitHub repo của nhóm, đóng góp cụ thể của từng thành viên.
* Code và API được tài liệu hóa hợp lý.

### Câu 9. Luật, đạo đức, an ninh (1đ)

* 0.6đ (báo cáo): đánh giá vấn đề khi nhóm xây dựng dự án. Luật 0.2đ, đạo đức nghề nghiệp 0.2đ, đạo đức xã hội 0.2đ. Kèm kiểm tra dự án đã đảm bảo, đã thiết lập các vấn đề an ninh an toàn chưa.
* 0.4đ: điểm thảo luận trên lớp, tính đúng 4 buổi, mỗi buổi 0.1đ. Không phụ thuộc code.

### Câu 10. Quá trình (1đ)

* 10a (0.25đ): lịch sử code của mỗi sinh viên thể hiện qua git commit.
* 10b (0.25đ): đóng góp của mỗi thành viên.
* 10c (0.5đ): điểm chuyên cần.

## 4. Điểm cần hỏi giáo viên

Khi có câu trả lời, ghi vào dòng "Trả lời" và sửa phần yêu cầu tương ứng ở mục 3.

1. Câu 4c: "XORs" là gì?
   * Tạm hiểu: có thể là XSS hoặc CSRF, làm cả hai.
   * Trả lời:
2. Câu 4b: tài liệu API theo định dạng nào đã hướng dẫn trên lớp?
   * Tạm hiểu: Swagger/OpenAPI.
   * Trả lời:
3. Câu 5b: dựng lại trang giống reactnative.dev, hay áp phong cách đó cho giao diện KTX? 3 ảnh chụp là phần nào?
   * Tạm hiểu: áp bố cục, phong cách đó cho trang chủ và giao diện KTX.
   * Trả lời:
4. Câu 7b: test có bắt buộc đặt trong thư mục `test/` không?
   * Tạm hiểu: đặt trong `test/` cho chắc.
   * Trả lời:
5. Câu 4c: "xử lý phiên giao dịch" là session hay transaction DB?
   * Tạm hiểu: làm cả hai.
   * Trả lời:

## 5. Cách dùng file này

* Đây là nguồn yêu cầu gốc của dự án. Mục checklist ghi phục vụ câu nào, VD [Đề 5b].
* Trước khi báo xong một việc, đối chiếu lại tiêu chí của câu tương ứng ở mục 3.
* Không xóa, không làm nhẹ yêu cầu của đề trong file này. Nếu đề có đính chính, ghi rõ ngày và nguồn đính chính.
