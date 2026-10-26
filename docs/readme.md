# Thư mục docs

Tài liệu của dự án và log từng mục checklist. Ở gốc repo chỉ còn `readme.md` (hiện trạng, cài đặt) và `checklist.md` (tiến độ).

## Tài liệu

* `de-bai.md`: đề thi cuối kỳ, yêu cầu từng câu, điều kiện 0 điểm, điểm cần hỏi giáo viên. Nguồn yêu cầu gốc.
* `user-stories.md`: user stories US-xx kèm API, màn hình, hiện trạng code (Đề 1; bản nháp, chờ nhóm duyệt).
* `ke-hoach.md`: thiết kế đích (bản đề xuất, chờ nhóm duyệt).
* `baocao-bt-th-2.md`: báo cáo bài thực hành số 2 (thực thể, quan hệ, UML).
* `luu-tru/`: bản cũ không dùng nữa. `checklist-v1.md` là checklist trước khi sắp xếp lại ở mục 1.7.

## Mục lục log

* Mỗi mục trong `checklist.md` có một file log, đặt tên `<số mục>-<tên ngắn>.md`.
* Bố cục log: Mục tiêu → Đã làm → File thay đổi → Kiểm thử → Lưu ý.
* Số mục trong các log cũ (trước 1.7) là số theo checklist bản cũ, xem bảng đổi số trong log 1.7.
* Log cũ là lịch sử nên giữ nguyên đường dẫn lúc viết. Từ mục 2.1, `ke-hoach.md` và `baocao-bt-th-2.md` đã chuyển vào `docs/`, còn `checklist-2.md` đổi tên thành `checklist.md`.

Danh sách (mục, nội dung, file log, trạng thái, commit):

* 1.4 + 1.5: rà soát readme khớp code, tạo thư mục log. `1.4-ra-soat-readme.md`. Xong, `e6142ab`
* 1.6: viết `ke-hoach.md` (thiết kế đích, bản đề xuất). `1.6-ke-hoach.md`. Xong, `3060127`
* 1.7: sắp xếp lại checklist theo giai đoạn, làm từ trên xuống. `1.7-sap-xep-checklist.md`. Xong, `061bcad`
* 2.1 (phần 1): ghi đề thi vào `docs/de-bai.md`, gom tài liệu vào `docs/`, thêm `.claude/CLAUDE.md`. `2.1-de-bai-va-sap-xep-docs.md`. Xong phần 1, `85e32b4`
* 1.9: thêm `quan-ly-ktx/frontend/.env.example`, cập nhật readme. `1.9-frontend-env-example.md`. Xong, `f1c2a14`
* 2.1 (phần 2): bổ sung checklist theo đề (đối chiếu đề, mục mới có nhãn [Đề x], cập nhật trạng thái theo code). `2.1-bo-sung-checklist-theo-de.md`. Xong phần 2, còn 2.15, `f1c2a14`
* 2.12: nháp 24 user stories. `2.12-user-stories.md`. Nháp xong, chờ nhóm duyệt, `f1c2a14`

Việc ngoài checklist (không có log riêng):

* Đơn giản hóa định dạng các file md (bỏ bảng, bỏ in đậm thừa, bỏ link markdown) để dễ đọc trong text editor và khi xem diff. Chờ commit.
