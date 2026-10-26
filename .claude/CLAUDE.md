# Hướng dẫn cho AI — dự án KTX Care

Bài tập lớn cuối kỳ môn Web nâng cao (Phenikaa, lớp N02). Nhóm 3 người: Chu Thanh Tân, Đặng Hải Nam, Lê Hải Sơn. **Hạn nộp: 09/11/2026.**

## Đọc trước khi làm
1. [docs/de-bai.md](../docs/de-bai.md): đề thi, yêu cầu từng câu, điều kiện 0 điểm. Đây là **nguồn yêu cầu gốc**.
2. [checklist.md](../checklist.md): việc cần làm và tiến độ. Làm từ trên xuống.
3. Khi cần thêm:
   - [readme.md](../readme.md): hiện trạng code, cài đặt, API.
   - [docs/ke-hoach.md](../docs/ke-hoach.md): thiết kế đích.
   - [docs/user-stories.md](../docs/user-stories.md): user stories US-xx (Đề 1); API, test, ca kiểm thử tham chiếu theo mã này.

## Quy tắc bắt buộc theo đề
- Backend: NestJS phân lớp (module → controller → service → entity), TypeORM + MySQL. Ở `quan-ly-ktx/backend`.
- Frontend: React, giao diện dùng **`react-bootstrap`** (đề 5b). Ở `quan-ly-ktx/frontend`.
- Mọi endpoint có guard + DTO. Không để lộ dữ liệu người dùng ở frontend (đề 3d, 4c).
- Khi làm một việc, ghi rõ việc đó phục vụ câu nào của đề (VD `[Đề 4b]`). Gặp chỗ đề chưa rõ thì xem mục 4 của `docs/de-bai.md`, không tự đoán.

## Tổ chức file
- Ở gốc repo chỉ có `readme.md`, `checklist.md`. Tài liệu khác để trong `docs/`. Bản cũ không dùng nữa để trong `docs/luu-tru/`.
- Mỗi mục checklist có một log `docs/<số mục>-<tên ngắn>.md`, bố cục: Mục tiêu → Đã làm → File thay đổi → Kiểm thử → Lưu ý. Mục lục ở [docs/readme.md](../docs/readme.md).
- Log cũ là lịch sử: không sửa đường dẫn hay số mục trong log cũ.

## Làm việc với nhóm
- Mỗi thành viên tự commit và push. AI không tự commit, push, merge hay đổi nhánh.
- Không sửa phần người khác phụ trách (VD backend khi đang làm frontend): ghi thành đề xuất trong checklist hoặc log.
- Không commit file `.env`, thư mục `quan-ly-ktx/backend/storage/` hay dữ liệu thật của người dùng.
