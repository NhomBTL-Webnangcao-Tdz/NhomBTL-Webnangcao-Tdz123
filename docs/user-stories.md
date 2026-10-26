# User stories — KTX Care

Trạng thái: bản nháp, chờ nhóm duyệt (checklist 2.12, phục vụ Đề 1).

* Đề yêu cầu nhóm 3 người có tối thiểu 12 câu, đúng định dạng "Là <vai trò>, tôi muốn <hành động>.". Sai định dạng là 0 điểm. Bản này có 24 câu.
* Phần "Code" ghi theo việc đọc code trên `main` ngày 26/10/2026, chưa kiểm thử trên app thật.
* Khi duyệt, nhóm có thể bỏ hoặc gộp câu, nhưng phải giữ ít nhất 12 câu.

Quy ước:

* Định dạng: Là <vai trò>, tôi muốn <hành động> để <lợi ích>.
* Vai trò: khách (chưa đăng nhập), người dùng (mọi vai trò đã đăng nhập), sinh viên (`STUDENT`), cán bộ quản lý (`MANAGER`; `ADMIN` cũng làm được), quản trị viên (`ADMIN`).
* Mã US-xx giữ cố định sau khi duyệt. API, màn hình, unit test (checklist 5.10) và ca kiểm thử (9.7) tham chiếu theo mã này.
* Code: có (đã có API + màn hình), một phần (ghi thiếu gì), chưa.

---

## Khách và người dùng chung

* US-01 Là khách, tôi muốn xem trang giới thiệu ký túc xá để biết các dịch vụ trước khi đăng ký tài khoản.
  Màn hình: trang chủ (`pages/landing`). Code: có (chờ chốt trang chủ, checklist 2.16).
* US-02 Là sinh viên, tôi muốn đăng ký tài khoản bằng tên đăng nhập và mật khẩu để sử dụng cổng sinh viên.
  API `POST /auth/register`. Màn hình `#register`. Code: có.
* US-03 Là người dùng, tôi muốn đăng nhập và được chuyển thẳng tới trang đúng vai trò để bắt đầu làm việc ngay.
  API `POST /auth/login`, `GET /auth/profile`. Màn hình `#login`. Code: có.
* US-04 Là người dùng, tôi muốn đăng xuất để người khác dùng chung máy không vào được tài khoản của tôi.
  Màn hình: header. Code: một phần, chỉ xóa token ở trình duyệt, server chưa thu hồi phiên (checklist 4.11).
* US-05 Là người dùng, tôi muốn đổi mật khẩu để giữ an toàn cho tài khoản.
  Code: chưa (checklist 5.7).
* US-06 Là người dùng, tôi muốn nhận thông báo trong hệ thống khi có việc liên quan đến mình để không bỏ lỡ hóa đơn hay kết quả duyệt đơn.
  API `GET /notifications/me`, `PATCH /notifications/me/:id/read`. Màn hình: header (chấm báo chưa đọc). Code: có.

## Sinh viên

* US-07 Là sinh viên, tôi muốn hoàn thiện hồ sơ cá nhân (mã SV, họ tên, email, số điện thoại) để ban quản lý có thông tin liên hệ.
  API `PUT /student/me/profile`. Màn hình `#my-profile`. Code: có.
* US-08 Là sinh viên, tôi muốn gửi đơn đăng ký ở ký túc xá trực tuyến để không phải đến văn phòng nộp giấy.
  API `POST /student/me/residence-request`. Màn hình `#my-room`. Code: có.
* US-09 Là sinh viên, tôi muốn xem phòng đang ở, bạn cùng phòng và hợp đồng của mình để nắm thông tin lưu trú.
  API `GET /student/me/portal`. Màn hình `#my-room`. Code: có (cần đối chiếu đủ ý, checklist 7.3).
* US-10 Là sinh viên, tôi muốn xem các hóa đơn của mình và trạng thái đã đóng hay chưa để đóng tiền đúng hạn.
  API `GET /student/me/portal`. Màn hình `#my-bills`. Code: có.
* US-11 Là sinh viên, tôi muốn tự nhập chỉ số điện nước kèm ảnh đồng hồ để hóa đơn được tính đúng và có bằng chứng.
  API `GET /meter-readings/me/current`, `POST /meter-readings/me`. Màn hình `#my-bills`. Code: có.
* US-12 Là sinh viên, tôi muốn xem ảnh biên lai của hóa đơn để đối chiếu số tiền phải đóng.
  API `GET /utility-bill/:id/receipt`. Màn hình `#my-bills`. Code: có.
* US-13 Là sinh viên, tôi muốn liên hệ nhanh ban quản lý qua email hoặc điện thoại để được hỗ trợ khi cần.
  Màn hình `#my-contact`. Code: có (cần cấu hình `REACT_APP_MANAGER_*`).

## Cán bộ quản lý

* US-14 Là cán bộ quản lý, tôi muốn thêm, sửa, xóa và xem phòng theo tòa, tầng để nắm tình trạng chỗ ở.
  API `GET/POST/PATCH/DELETE /rooms`. Màn hình `#rooms`. Code: có.
* US-15 Là cán bộ quản lý, tôi muốn duyệt hoặc từ chối đơn đăng ký ở và chọn phòng còn chỗ cho sinh viên để xếp phòng nhanh.
  API `GET /residence-requests`, `PATCH /residence-requests/:id/approve`, `PATCH /residence-requests/:id/reject`. Màn hình `#requests`. Code: có.
* US-16 Là cán bộ quản lý, tôi muốn lập và theo dõi hợp đồng thuê phòng của sinh viên để quản lý thời hạn lưu trú.
  API `GET/POST/PUT /contract`. Màn hình `#contracts`. Code: một phần, chưa có DTO, trạng thái, gia hạn / kết thúc (checklist 4.2, 5.1, 5.2).
* US-17 Là cán bộ quản lý, tôi muốn xem ảnh đồng hồ, sửa và duyệt chỉ số điện nước sinh viên gửi để hóa đơn chính xác.
  API `GET /meter-readings`, `GET /meter-readings/:id/photo/:meter`, `PATCH /meter-readings/:id/review`. Màn hình `#utilities`. Code: có.
* US-18 Là cán bộ quản lý, tôi muốn lập hóa đơn điện nước và khoản thu chung cho từng phòng, hệ thống tự tính tiền, để không phải tính tay.
  API `POST /utility-bill`, `POST /utility-bill/general`. Màn hình `#invoices`. Code: có (`POST /utility-bill` chưa có DTO, checklist 4.2).
* US-19 Là cán bộ quản lý, tôi muốn đánh dấu từng sinh viên đã đóng phần tiền của mình và nhắc người chưa đóng để thu đủ tiền.
  API `PATCH /utility-bill/:id/shares/:sid`, `POST /utility-bill/:id/shares/:sid/remind`. Màn hình `#invoices`. Code: có.
* US-20 Là cán bộ quản lý, tôi muốn xem trang tổng quan số liệu phòng, hóa đơn, đơn chờ duyệt để biết việc cần làm trong ngày.
  API: các API danh sách. Màn hình `#overview`. Code: một phần, chưa có API báo cáo tổng hợp (checklist 5.8).
* US-21 Là cán bộ quản lý, tôi muốn ghi nhận các lần thu tiền cọc và tiền phòng để biết sinh viên còn nợ bao nhiêu.
  Code: chưa, Payment mới có entity (checklist 4.3).

## Quản trị viên

* US-22 Là quản trị viên, tôi muốn cấu hình đơn giá điện, nước để hóa đơn mới tính theo giá hiện hành.
  API `GET/PUT /utility-bill/tariff`. Màn hình `#settings`. Code: có. Lưu ý: backend đang cho cả `MANAGER` sửa, `docs/ke-hoach.md` đề xuất chỉ `ADMIN`.
* US-23 Là quản trị viên, tôi muốn tạo tài khoản cán bộ quản lý và đổi vai trò người dùng để phân quyền đúng người.
  Code: chưa (checklist 4.5).
* US-24 Là quản trị viên, tôi muốn là người duy nhất được xóa hồ sơ sinh viên, hợp đồng, hóa đơn để tránh mất dữ liệu do thao tác nhầm.
  API `DELETE /student/:id`, `DELETE /contract/:id`, `DELETE /utility-bill/:id` (`@Roles(ADMIN)`). Màn hình: các trang quản lý. Code: có.

---

## Tổng hợp

* Có code: 18 câu (US-01 đến 03, 06 đến 15, 17 đến 19, 22, 24)
* Một phần: 3 câu (US-04, 16, 20)
* Chưa: 3 câu (US-05, 21, 23)

US-18 xếp vào "có" nhưng còn thiếu DTO. Nếu nhóm chỉ giữ các câu đã có code, vẫn đủ 12 câu.

## Việc còn lại khi duyệt

* Nhóm đọc lại, sửa câu chữ, bỏ hoặc gộp câu; sau đó đổi trạng thái đầu file thành "đã duyệt".
* Câu "chưa" và "một phần": giữ lại (và làm thêm code) hay bỏ khỏi báo cáo.
* Đưa danh sách này vào báo cáo câu 1. Dùng mã US-xx cho UML / sơ đồ thuật toán (2.13), wireframe (2.14), unit test (5.10), ca kiểm thử (9.7).
