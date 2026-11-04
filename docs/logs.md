# Thư mục docs

Tài liệu của dự án và log từng mục checklist. Ở gốc repo chỉ còn `readme.md` (hiện trạng, cài đặt) và `checklist.md` (tiến độ).

## Tài liệu

* `de-bai.md`: đề thi cuối kỳ, yêu cầu từng câu, điều kiện 0 điểm, điểm cần hỏi giáo viên. Nguồn yêu cầu gốc.
* `user-stories.md`: user stories US-xx kèm API, màn hình, hiện trạng code (Đề 1; bản nháp, chờ nhóm duyệt).
* `phan-tich-thiet-ke.md`: phân tích yêu cầu, đối tượng, quan hệ, phương thức, UML, sơ đồ thuật toán (Đề 2; bản nháp).
* `wireframe-luong-xu-ly.md`: wireframe màn hình chính và sơ đồ luồng xử lý thông tin (Đề 3a, 3b; bản nháp).
* `ca-kiem-thu.md`: ca kiểm thử thành công / lỗi kèm kết quả (Đề 7d; bản nháp).
* `luat-dao-duc.md`: luật, đạo đức nghề nghiệp, đạo đức xã hội, tự kiểm tra an ninh (Đề 9; bản nháp).
* `ke-hoach.md`: thiết kế đích (bản đề xuất, chờ nhóm duyệt).
* `baocao-bt-th-2.md`: báo cáo bài thực hành số 2 (thực thể, quan hệ, UML).
* `luu-tru/`: bản cũ không dùng nữa. `checklist-v1.md` là checklist trước khi sắp xếp lại ở mục 1.7.

## Mục lục log

* Mỗi mục trong `checklist.md` có một file log, đặt trong thư mục theo phần: `Phan <số phần>/<số mục>-<tên ngắn>.md` (VD `Phan 6/6.3-xu-ly-phien.md`).
* Bố cục log: Mục tiêu → Đã làm → File thay đổi → Kiểm thử → Lưu ý.
* Số mục trong các log cũ (trước 1.7) là số theo checklist bản cũ, xem bảng đổi số trong log 1.7.
* Log cũ là lịch sử nên giữ nguyên đường dẫn lúc viết. Từ mục 2.1, `ke-hoach.md` và `baocao-bt-th-2.md` đã chuyển vào `docs/`, còn `checklist-2.md` đổi tên thành `checklist.md`.

Danh sách (mục, nội dung, file log, trạng thái, commit):

* 1.4 + 1.5: rà soát readme khớp code, tạo thư mục log. `Phan 1/1.4-ra-soat-readme.md`. Xong, `e6142ab`
* 1.6: viết `ke-hoach.md` (thiết kế đích, bản đề xuất). `Phan 1/1.6-ke-hoach.md`. Xong, `3060127`
* 1.7: sắp xếp lại checklist theo giai đoạn, làm từ trên xuống. `Phan 1/1.7-sap-xep-checklist.md`. Xong, `061bcad`
* 2.1 (phần 1): ghi đề thi vào `docs/de-bai.md`, gom tài liệu vào `docs/`, thêm `.claude/CLAUDE.md`. `Phan 2/2.1-de-bai-va-sap-xep-docs.md`. Xong phần 1, `85e32b4`
* 1.9: thêm `quan-ly-ktx/frontend/.env.example`, cập nhật readme. `Phan 1/1.9-frontend-env-example.md`. Xong, `f1c2a14`
* 2.1 (phần 2): bổ sung checklist theo đề (đối chiếu đề, mục mới có nhãn [Đề x], cập nhật trạng thái theo code). `Phan 2/2.1-bo-sung-checklist-theo-de.md`. Xong phần 2, còn 2.15, `f1c2a14`
* 2.12: nháp 24 user stories. `Phan 2/2.12-user-stories.md`. Nháp xong, chờ nhóm duyệt, `f1c2a14`
* 6.3: xử lý phiên 401 đăng xuất, 403 báo không có quyền. `Phan 6/6.3-xu-ly-phien.md`. Xong, `2af40b4`
* 6.4: sidebar theo vai trò (code có sẵn, thêm test). `Phan 6/6.4-sidebar-theo-vai-tro.md`. Xong, `2af40b4`
* 2.13: nháp phân tích, UML, 6 sơ đồ thuật toán. `Phan 2/2.13-phan-tich-thiet-ke.md`. Nháp xong, chờ nhóm duyệt, `04fd5a1`
* 2.14: nháp wireframe và 4 sơ đồ luồng xử lý. `Phan 2/2.14-wireframe-luong-xu-ly.md`. Nháp xong, chờ nhóm duyệt, `04fd5a1`
* 1.10: LICENSE MIT (tạm) ở gốc và frontend. `Phan 1/1.10-license.md`. Chờ nhóm xác nhận, `9ff17dc`
* 9.1: rà soát bảo mật, giao diện FE; sửa 3 lỗi. `Phan 9/9.1-ra-soat-frontend.md`. Xong, `9ff17dc`
* 9.7: nháp 46 ca kiểm thử (BE 27/27, FE 25/25). `Phan 9/9.7-ca-kiem-thu.md`. Nháp xong, `3761e69`
* 10.6: nháp luật, đạo đức, tự kiểm tra an ninh. `Phan 10/10.6-luat-dao-duc.md`. Nháp xong, `3761e69`
* 2.16: chốt dùng trang chủ của Nam. Ghi trong checklist, không có log riêng. `93135ee`
* 6.12 (phần 1): trang chủ dùng react-bootstrap. `Phan 6/6.12-landing-react-bootstrap.md`. Xong phần 1, `93135ee`
* 2.2: phân công theo người, mốc thời gian 1–8/11. `Phan 2/2.2-phan-cong.md`. Xong, `23199ff`
* 4.2 (phần 1): DTO cho Contract. `Phan 4/4.2-dto-contract.md`. Xong phần 1, `26dbda7`
* 4.2 (phần 2): DTO cho Student, UtilityBill, từ chối đơn. `Phan 4/4.2-dto-student-utility-bill.md`. Xong phần 2, còn Payment, `499a811`
* 3.5: `database/init.sql` đủ 11 bảng. `Phan 3/3.5-init-sql.md`. Xong, `24d14a0`
* 3.6: script seed, 3 tài khoản demo. `Phan 3/3.6-seed.md`. Xong, `d55d190`
* 4.4 + 4.12: mã lỗi nhất quán, exception filter chung. `Phan 4/4.4-4.12-xu-ly-loi.md`. 4.12 xong, 4.4 còn contract, `36a326e`
* 4.10: tài liệu API bằng Swagger. `Phan 4/4.10-swagger.md`. Xong, `0467126`
* 4.5: API tài khoản cho ADMIN. `Phan 4/4.5-api-tai-khoan.md`. Xong, chờ commit

Việc ngoài checklist (không có log riêng):

* Đơn giản hóa định dạng các file md (bỏ bảng, bỏ in đậm thừa, bỏ link markdown) để dễ đọc trong text editor và khi xem diff. Xong, `8514e3d`
