# Thư mục docs

Tài liệu của dự án và log từng mục checklist. Ở gốc repo chỉ còn [readme.md](../readme.md) (hiện trạng, cài đặt) và [checklist.md](../checklist.md) (tiến độ).

## Tài liệu

| File | Nội dung |
|---|---|
| [de-bai.md](de-bai.md) | Đề thi cuối kỳ: yêu cầu từng câu, điều kiện 0 điểm, điểm cần hỏi giáo viên. **Nguồn yêu cầu gốc** |
| [user-stories.md](user-stories.md) | User stories US-xx kèm API, màn hình, hiện trạng code (Đề 1; bản nháp, chờ nhóm duyệt) |
| [ke-hoach.md](ke-hoach.md) | Thiết kế đích (bản đề xuất, chờ nhóm duyệt) |
| [baocao-bt-th-2.md](baocao-bt-th-2.md) | Báo cáo bài thực hành số 2 (thực thể, quan hệ, UML) |
| [luu-tru/](luu-tru/) | Bản cũ không dùng nữa: `checklist-v1.md` (checklist trước khi sắp xếp lại ở mục 1.7) |

## Mục lục log

Mỗi mục trong [checklist.md](../checklist.md) có một file log, đặt tên `<số mục>-<tên ngắn>.md`. Số mục trong các log cũ (trước 1.7) là số theo checklist bản cũ, xem bảng đổi số trong log 1.7. Bố cục: Mục tiêu → Đã làm → File thay đổi → Kiểm thử → Lưu ý.

Log cũ là lịch sử nên giữ nguyên đường dẫn lúc viết. Từ mục 2.1, `ke-hoach.md` và `baocao-bt-th-2.md` đã chuyển vào `docs/`, còn `checklist-2.md` đổi tên thành `checklist.md`.

| Mục | Nội dung | Log | Trạng thái | Commit |
|---|---|---|---|---|
| 1.4 + 1.5 | Rà soát readme khớp code; tạo thư mục log | [1.4-ra-soat-readme.md](1.4-ra-soat-readme.md) | Xong | `e6142ab` |
| 1.6 | Viết `ke-hoach.md` (thiết kế đích, bản đề xuất) | [1.6-ke-hoach.md](1.6-ke-hoach.md) | Xong | `3060127` |
| 1.7 | Sắp xếp lại checklist theo giai đoạn, làm từ trên xuống | [1.7-sap-xep-checklist.md](1.7-sap-xep-checklist.md) | Xong | `061bcad` |
| 2.1 (phần 1) | Ghi đề thi vào `docs/de-bai.md`, gom tài liệu vào `docs/`, thêm `.claude/CLAUDE.md` | [2.1-de-bai-va-sap-xep-docs.md](2.1-de-bai-va-sap-xep-docs.md) | Xong phần 1 | `85e32b4` |
| 1.9 | Thêm `quan-ly-ktx/frontend/.env.example`, cập nhật readme | [1.9-frontend-env-example.md](1.9-frontend-env-example.md) | Xong, chờ commit | _(điền sau)_ |
| 2.1 (phần 2) | Bổ sung checklist theo đề: bảng đối chiếu, mục mới có nhãn [Đề x], cập nhật trạng thái theo code | [2.1-bo-sung-checklist-theo-de.md](2.1-bo-sung-checklist-theo-de.md) | Xong phần 2, còn 2.15 | _(điền sau)_ |
| 2.12 | Nháp 24 user stories | [2.12-user-stories.md](2.12-user-stories.md) | Nháp xong, chờ nhóm duyệt | _(điền sau)_ |
