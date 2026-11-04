# Phân tích ORM và truy vấn (Đề 6b)

Dự án dùng TypeORM với MySQL. Câu SQL dưới đây do TypeORM sinh thật từ code, lấy ngày 04/11/2026.

## Cấu hình DataSource

* File `quan-ly-ktx/backend/src/database/database.providers.ts` tạo `DataSource` loại `mysql`, đọc host, cổng, tài khoản từ `.env`.
* Bật SSL khi `DB_SSL=true`, có kiểm tra chứng chỉ qua `DB_SSL_CA`.
* `synchronize` lấy từ `DB_SYNCHRONIZE`; không đặt thì tắt khi `NODE_ENV=production`. Production tạo bảng bằng `database/init.sql`.
* Mỗi module khai báo repository qua provider, VD `ROOM_REPOSITORY`, rồi inject vào service.

## Entity ứng với bảng

* `User` → `users`, `Student` → `student`, `Room` → `rooms`
* `Contract` → `contract`, `Payment` → `payment`
* `UtilityBill` → `utility_bill`, `UtilityBillShare` → `utility_bill_share`, `UtilityTariff` → `utility_tariff`
* `ResidenceRequest` → `residence_requests`, `MeterReadingSubmission` → `meter_reading_submissions`, `Notification` → `notifications`

Thuộc tính camelCase ánh xạ sang cột snake_case qua `name`, VD `roomNumber` → `room_number`.

## Quan hệ ứng với khóa ngoại

* `Contract` nhiều–1 `Student`: `contract.sid` → `student.sid`
* `Contract` nhiều–1 `Room`: `contract.room_id` → `rooms.id`
* `Payment` nhiều–1 `Contract`: `payment.contract_id` → `contract.contract_id`
* `UtilityBill` nhiều–1 `Room`: `utility_bill.room_id` → `rooms.id`
* `UtilityBillShare` nhiều–1 `UtilityBill`, xóa theo: `utility_bill_share.bill_id` → `utility_bill.bill_id`
* `UtilityBillShare` nhiều–1 `Student`: `utility_bill_share.student_sid` → `student.sid`
* `ResidenceRequest` nhiều–1 `Student`: `residence_requests.student_sid` → `student.sid`
* `MeterReadingSubmission` nhiều–1 `Room`: `meter_reading_submissions.room_id` → `rooms.id`
* `User` liên kết `Student` qua cột `users.student_sid` có chỉ mục duy nhất, không khai báo khóa ngoại.

## Repository và câu SQL sinh ra

Lọc phòng còn chỗ. Code:

```ts
repository.createQueryBuilder('room')
  .where('room.building = :building', { building })
  .andWhere('room.currentOccupancy < room.maxCapacity')
  .orderBy('room.roomNumber');
```

SQL (rút gọn danh sách cột):

```sql
SELECT `room`.`id` AS `room_id`, `room`.`room_number` AS `room_room_number`, ...
FROM `rooms` `room`
WHERE `room`.`building` = ? AND `room`.`current_occupancy` < `room`.`max_capacity`
ORDER BY `room`.`room_number` ASC
```

Thêm phòng:

```sql
INSERT INTO `rooms`(`id`, `created_at`, `updated_at`, `room_number`, `building`, `max_capacity`, `current_occupancy`, `price`)
VALUES (?, DEFAULT, DEFAULT, ?, ?, ?, DEFAULT, ?)
```

Thanh lý hợp đồng:

```sql
UPDATE `contract` SET `is_active` = ? WHERE `contract_id` = ?
```

## Nhận xét

* Giá trị luôn đi qua tham số `?`, không ghép chuỗi, nên chống được SQL injection. Đã thử chuỗi `' OR 1=1 --` ở `GET /rooms?q=`.
* TypeORM tự đặt bí danh cột và đổi tên thuộc tính sang tên cột, code không phụ thuộc tên cột.
* Thao tác ghi nhiều bảng dùng transaction, VD duyệt đơn tạo hợp đồng và tăng sĩ số trong một `queryRunner`, có khóa `pessimistic_write` để hai người không xếp cùng chỗ cuối.
* `leftJoinAndSelect` lấy quan hệ trong một câu truy vấn, tránh truy vấn lặp theo từng dòng.
