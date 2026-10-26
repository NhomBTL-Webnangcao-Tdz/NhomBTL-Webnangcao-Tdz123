# Hướng dẫn cho AI — dự án KTX Care

Bài tập lớn cuối kỳ môn Web nâng cao (Phenikaa, lớp N02). Nhóm 3 người: Chu Thanh Tân, Đặng Hải Nam, Lê Hải Sơn. Hạn nộp: 09/11/2026.

## Đọc trước khi làm

* `docs/de-bai.md`: đề thi, yêu cầu từng câu, điều kiện 0 điểm. Đây là nguồn yêu cầu gốc.
* `checklist.md`: việc cần làm và tiến độ. Làm từ trên xuống.
* Khi cần thêm: `readme.md` (hiện trạng code, cài đặt, API), `docs/ke-hoach.md` (thiết kế đích), `docs/user-stories.md` (user stories US-xx; API, test, ca kiểm thử tham chiếu theo mã này).

## Quy tắc bắt buộc theo đề

* Backend: NestJS phân lớp (module → controller → service → entity), TypeORM + MySQL. Ở `quan-ly-ktx/backend`.
* Frontend: React, giao diện dùng `react-bootstrap` (đề 5b). Ở `quan-ly-ktx/frontend`.
* Mọi endpoint có guard + DTO. Không để lộ dữ liệu người dùng ở frontend (đề 3d, 4c).
* Khi làm một việc, ghi rõ việc đó phục vụ câu nào của đề (VD [Đề 4b]). Gặp chỗ đề chưa rõ thì xem mục 4 của `docs/de-bai.md`, không tự đoán.

## Tổ chức file

* Ở gốc repo chỉ có `readme.md`, `checklist.md`. Tài liệu khác để trong `docs/`. Bản cũ không dùng nữa để trong `docs/luu-tru/`.
* Mỗi mục checklist có một log `docs/<số mục>-<tên ngắn>.md`, bố cục: Mục tiêu → Đã làm → File thay đổi → Kiểm thử → Lưu ý. Mục lục ở `docs/readme.md`.
* Log cũ là lịch sử: không sửa đường dẫn hay số mục trong log cũ.

## Định dạng file md

Viết để đọc được trong text editor và khi xem diff, theo kiểu của `checklist.md`:

* Dùng tiêu đề `#`, `##`, `###` và danh sách `*`. Checklist dùng `* [ ]`, `* [~]`, `* [x]`.
* Không dùng bảng. Thay bằng danh sách, mỗi dòng một ý.
* Không dùng link dạng `[tên](đường-dẫn)`. Ghi đường dẫn trong dấu backtick, VD `docs/de-bai.md`.
* In đậm hạn chế: chỉ cho nhãn đầu dòng ở phần giới thiệu (VD `* **Backend:** ...`) và ngày ở phần cập nhật. Không in đậm giữa câu.
* Không dùng blockquote `>`, không lồng danh sách quá 2 cấp.
* Tên file, lệnh, đường dẫn, mã endpoint để trong backtick. Cây thư mục để trong khối ` ```text `.

## Làm việc với nhóm

* Mỗi thành viên tự commit và push. AI không tự commit, push, merge hay đổi nhánh.
* Không sửa phần người khác phụ trách (VD backend khi đang làm frontend): ghi thành đề xuất trong checklist hoặc log.
* Không commit file `.env`, thư mục `quan-ly-ktx/backend/storage/` hay dữ liệu thật của người dùng.
