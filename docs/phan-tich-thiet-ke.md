# Phân tích và thiết kế — KTX Care

Trạng thái: bản nháp, chờ nhóm duyệt (checklist 2.13, phục vụ Đề 2a, 2b).

* Viết theo code trên `main` ngày 06/11/2026 (sau commit `f54e9c4`, đã gộp code hợp đồng, thanh toán, báo cáo). Khi backend đổi entity, phải cập nhật lại file này và UML.
* Mã US-xx lấy từ `docs/user-stories.md`.
* Sơ đồ viết bằng Mermaid (khối ` ```mermaid `). GitHub tự vẽ; muốn đưa vào báo cáo thì dán vào https://mermaid.live rồi xuất PNG/SVG.

---

## 1. Yêu cầu chức năng (Đề 2a)

Khách và người dùng chung:

* Xem trang giới thiệu (US-01).
* Đăng ký tài khoản sinh viên, đăng nhập, đăng xuất, đổi mật khẩu (US-02 đến US-05).
* Nhận và đánh dấu đã đọc thông báo (US-06).

Sinh viên:

* Hoàn thiện hồ sơ, liên kết tài khoản với mã sinh viên (US-07).
* Gửi đơn đăng ký ở (US-08).
* Xem phòng, bạn cùng phòng, hợp đồng (US-09).
* Xem hóa đơn, phần tiền của mình, ảnh biên lai (US-10, US-12).
* Gửi chỉ số điện nước kèm ảnh đồng hồ (US-11).
* Liên hệ ban quản lý (US-13).

Cán bộ quản lý:

* Quản lý phòng theo tòa, tầng (US-14).
* Duyệt hoặc từ chối đơn đăng ký ở, xếp phòng (US-15).
* Lập, gia hạn, kết thúc, thanh lý hợp đồng (US-16).
* Duyệt chỉ số điện nước, hệ thống tự tạo hóa đơn và chia tiền (US-17, US-18).
* Lập khoản thu chung, đánh dấu đã đóng, nhắc nợ quá hạn (US-18, US-19).
* Xem tổng quan (US-20), ghi nhận thanh toán theo hợp đồng (US-21).

Quản trị viên:

* Cấu hình đơn giá điện nước (US-22).
* Quản lý tài khoản cán bộ (US-23).
* Là người duy nhất được xóa hồ sơ, hợp đồng, hóa đơn (US-24).

## 2. Yêu cầu phi chức năng

* Bảo mật: mật khẩu băm bcrypt (12 vòng); xác thực bằng JWT 1 giờ; phân quyền `ADMIN | MANAGER | STUDENT` kiểm ở backend bằng `JwtAuthGuard` + `RolesGuard`; CORS chỉ cho origin cấu hình; `ValidationPipe` (whitelist) kiểm tra DTO; sinh viên chỉ đọc dữ liệu của mình (xác định qua token, không qua URL).
* Toàn vẹn dữ liệu: thao tác ghi nhiều bảng chạy trong transaction, có khóa dòng (`pessimistic_write`) để hai cán bộ không duyệt trùng.
* Khả dụng: giao diện tiếng Việt, dùng được ở khổ điện thoại 375px, có trạng thái đang tải / rỗng / lỗi, mỗi tác vụ chính không quá 4 thao tác (Đề 5c).
* Triển khai: cấu hình qua `.env`, MySQL 8 có SSL (Aiven).

## 3. Đối tượng và thuộc tính (Đề 2a)

Thuộc tính ghi theo tên trong code. Kiểu khóa chính khác nhau giữa các bảng, nhóm giữ nguyên để không đổi schema sát hạn (checklist 2.4).

* User (bảng `users`): `id`, `username` (duy nhất), `password` (hash, không trả ra API), `role`, `studentSid` (duy nhất, có thể trống), `createdAt`, `updatedAt`.
* Student (bảng `student`): `sid` (mã SV, khóa chính), `sname`, `email`, `phone`, `role` (thừa, giữ nguyên theo checklist 2.5).
* Room (bảng `rooms`): `id` (UUID), `roomNumber`, `building`, `maxCapacity`, `currentOccupancy`, `price`, `isMaintenance` (phòng đang bảo trì), `createdAt`, `updatedAt`.
* Contract (bảng `contract`): `contract_id`, `start_date`, `end_date`, `deposit_amount`, `is_active`.
* ResidenceRequest (bảng `residence_requests`): `id`, `status` (`PENDING | APPROVED | REJECTED`), `note`, `reviewNote`, `reviewedBy`, `requestedAt`, `reviewedAt`.
* MeterReadingSubmission (bảng `meter_reading_submissions`): `id`, `submittedBy`, `month`, `year`, `electricReading`, `waterReading`, `electricPhotoPath`, `waterPhotoPath`, `status`, `reviewedBy`, `reviewedAt`, `reviewNote`, `createdAt`.
* UtilityBill (bảng `utility_bill`): `bill_id`, `billType` (`UTILITY | GENERAL`), `title`, `description`, `receiptImagePath`, `month`, `year`, chỉ số điện nước cũ/mới, `electricUnitPrice`, `waterUnitPrice`, `roomRentAmount`, `total_amount`, `is_paid`, `dueDate`.
* UtilityBillShare (bảng `utility_bill_share`): `id`, `amount`, `roomRentAmount`, `isPaid`. Phần tiền của từng sinh viên trong một hóa đơn.
* UtilityTariff (bảng `utility_tariff`): `id` (luôn = 1), `electricPrice`, `waterPrice`, `updatedBy`, `updatedAt`.
* Notification (bảng `notifications`): `id` (UUID), `userId`, `title`, `message`, `isRead`, `createdAt`.
* Payment (bảng `payment`): `payment_id`, `amount`, `payment_date`, `payment_type` (tiền phòng, điện nước, sửa chữa, khoản thu khác). Giao dịch ghi theo hợp đồng.

## 4. Quan hệ giữa các đối tượng (Đề 2a)

Khóa ngoại thật (khai báo `@ManyToOne` trong entity):

* Student 1 – n Contract (`contract.sid`)
* Room 1 – n Contract (`contract.room_id`)
* Room 1 – n UtilityBill (`utility_bill.room_id`)
* Room 1 – n MeterReadingSubmission (`meter_reading_submissions.room_id`, xóa phòng thì xóa theo)
* Student 1 – n ResidenceRequest (`residence_requests.student_sid`, xóa SV thì xóa theo)
* UtilityBill 1 – n UtilityBillShare (`utility_bill_share.bill_id`, xóa hóa đơn thì xóa theo)
* Student 1 – n UtilityBillShare (`utility_bill_share.student_sid`, không cho xóa SV còn phần hóa đơn)
* Contract 1 – n Payment (`payment.contract_id`)

Liên kết logic (chỉ lưu số/mã, chưa khai báo khóa ngoại):

* User 0..1 – 0..1 Student qua `users.student_sid` (duy nhất). Liên kết khi sinh viên lưu hồ sơ lần đầu.
* User 1 – n Notification qua `notifications.user_id`.
* User 1 – n MeterReadingSubmission qua `submitted_by`, `reviewed_by`.
* User 1 – n ResidenceRequest qua `reviewed_by`; User 1 – n UtilityTariff qua `updated_by`.

Ràng buộc nghiệp vụ đang có trong code:

* Một sinh viên chỉ có một đơn đăng ký ở `PENDING` và không gửi đơn khi đang có hợp đồng còn hiệu lực.
* Sĩ số phòng (hợp đồng còn hiệu lực trong cùng thời gian) không vượt `maxCapacity`.
* Một sinh viên không có hai hợp đồng còn hiệu lực trùng thời gian.
* Không lập hợp đồng mới vào phòng đang bảo trì.
* Không gia hạn, kết thúc, thanh lý hợp đồng đã kết thúc. Ngày gia hạn phải sau ngày kết thúc hiện tại. Ngày thanh lý nằm từ ngày bắt đầu đến hôm nay.
* Không xóa phòng, sinh viên còn hợp đồng, còn nợ hoặc còn lịch sử. Không xóa hợp đồng đã có thanh toán.
* Mỗi phòng chỉ có một bản gửi chỉ số `PENDING/APPROVED` và một hóa đơn `UTILITY` cho mỗi (tháng, năm).
* Chỉ số mới không nhỏ hơn chỉ số của hóa đơn kỳ trước.
* Mỗi (hóa đơn, sinh viên) chỉ có một phần tiền.

## 5. Phương thức hoạt động (Đề 2a)

Mỗi module có Controller (nhận request, guard, DTO) → Service (nghiệp vụ) → Repository TypeORM (truy vấn). Phương thức nghiệp vụ chính ở tầng Service:

* AuthService: `register`, `login`, `getProfile`.
* StudentService: `saveMyProfile`, `requestResidence`, `listResidenceRequests`, `reviewResidenceRequest`, `getPortalData`, CRUD `findAll/findOne/create/update/remove`.
* RoomService: `create`, `findAll`, `findOne`, `findResidents`, `update`, `updatePrices`, `remove`.
* ContractService: `findAll`, `findOne`, `create`, `update`, `terminate`, `renew`, `liquidate`, `remove`.
* PaymentService: `findAll` (lọc theo hợp đồng), `findOne`, `create`, `update`, `remove`.
* ReportService: `getSummary`.
* MeterReadingService: `getCurrentForStudent`, `submit`, `listForManagers`, `getPhoto`, `review`.
* UtilityBillService: `findAll`, `findOne`, `create`, `createGeneralCharge`, `getReceiptImage`, `update`, `updateSharePayment`, `remindStudent`, `remove`.
* UtilityTariffService: `getCurrent`, `update`.
* NotificationService: `listForUser`, `markRead`.
* Hàm tính toán (`meter-reading-calculations.ts`): `calculateUtilityAmount`, `calculateMonthlyBillAmount`, `splitUtilityAmount`, `getNextMonthPaymentDate`.

---

## 6. Sơ đồ lớp UML (Đề 2b)

Sơ đồ thực thể theo code hiện tại. Nét liền là khóa ngoại thật, nét đứt là liên kết logic.

```mermaid
classDiagram
  direction LR
  class User {
    +int id
    +string username
    -string password
    +Role role
    +string studentSid
    +Date createdAt
    +Date updatedAt
  }
  class Student {
    +string sid
    +string sname
    +string email
    +string phone
    +Role role
  }
  class Room {
    +uuid id
    +string roomNumber
    +string building
    +int maxCapacity
    +int currentOccupancy
    +decimal price
    +bool isMaintenance
  }
  class Contract {
    +int contract_id
    +Date start_date
    +Date end_date
    +decimal deposit_amount
    +bool is_active
  }
  class ResidenceRequest {
    +int id
    +RequestStatus status
    +string note
    +string reviewNote
    +int reviewedBy
    +Date requestedAt
    +Date reviewedAt
  }
  class MeterReadingSubmission {
    +int id
    +int submittedBy
    +int month
    +int year
    +int electricReading
    +int waterReading
    +string electricPhotoPath
    +string waterPhotoPath
    +ReadingStatus status
    +int reviewedBy
    +string reviewNote
  }
  class UtilityBill {
    +int bill_id
    +string billType
    +string title
    +int month
    +int year
    +int old_electric_index
    +int new_electric_index
    +int old_water_index
    +int new_water_index
    +decimal electricUnitPrice
    +decimal waterUnitPrice
    +decimal roomRentAmount
    +decimal total_amount
    +bool is_paid
    +Date dueDate
  }
  class UtilityBillShare {
    +int id
    +decimal amount
    +decimal roomRentAmount
    +bool isPaid
  }
  class UtilityTariff {
    +int id
    +decimal electricPrice
    +decimal waterPrice
    +int updatedBy
  }
  class Notification {
    +uuid id
    +int userId
    +string title
    +string message
    +bool isRead
  }
  class Payment {
    +int payment_id
    +decimal amount
    +Date payment_date
    +string payment_type
  }

  Student "1" --> "*" Contract : ký
  Room "1" --> "*" Contract : lưu trú
  Room "1" --> "*" UtilityBill : phát sinh
  Room "1" --> "*" MeterReadingSubmission : gửi chỉ số
  Student "1" --> "*" ResidenceRequest : gửi đơn
  UtilityBill "1" *-- "*" UtilityBillShare : chia tiền
  Student "1" --> "*" UtilityBillShare : phần phải đóng
  Contract "1" --> "*" Payment : thanh toán
  User "0..1" ..> "0..1" Student : studentSid
  User "1" ..> "*" Notification : userId
  User "1" ..> "*" MeterReadingSubmission : submittedBy
```

Sơ đồ phân lớp của một module (ví dụ duyệt chỉ số điện nước), áp dụng chung cho các module:

```mermaid
classDiagram
  direction LR
  class MeterReadingController {
    +current(req)
    +submit(req, dto, files)
    +list()
    +photo(req, id, meter)
    +review(req, id, dto)
  }
  class MeterReadingService {
    +getCurrentForStudent(userId)
    +submit(userId, dto, photos)
    +listForManagers()
    +getPhoto(userId, role, id, meter)
    +review(id, reviewerId, dto)
  }
  class JwtAuthGuard {
    +canActivate(context) bool
  }
  class RolesGuard {
    +canActivate(context) bool
  }
  class DataSource {
    +createQueryRunner()
    +getRepository(entity)
  }
  MeterReadingController ..> JwtAuthGuard : UseGuards
  MeterReadingController ..> RolesGuard : UseGuards
  MeterReadingController --> MeterReadingService : gọi
  MeterReadingService --> DataSource : truy vấn qua TypeORM
```

---

## 7. Sơ đồ thuật toán (Đề 2b)

### 7.1 Đăng nhập (US-03)

```mermaid
flowchart TD
  A([Bắt đầu]) --> B["Người dùng nhập username, password"]
  B --> C{"DTO hợp lệ?<br/>không rỗng, độ dài cho phép"}
  C -- Không --> E1["400 Bad Request"] --> Z([Kết thúc])
  C -- Có --> D["Chuẩn hóa username: trim, chữ thường"]
  D --> F{"Mật khẩu quá 72 byte?"}
  F -- Có --> E2["401: Username hoặc mật khẩu không đúng"] --> Z
  F -- Không --> G["Tìm user theo username"]
  G --> H{"Có user?"}
  H -- Không --> E2
  H -- Có --> I{"bcrypt.compare đúng?"}
  I -- Không --> E2
  I -- Có --> J["Ký JWT: sub, username, role; hạn 1 giờ"]
  J --> K["Trả access_token + user, không có password"]
  K --> L["Frontend lưu token, gọi /auth/profile,<br/>chuyển trang theo vai trò"]
  L --> Z
```

### 7.2 Sinh viên gửi đơn đăng ký ở (US-07, US-08)

```mermaid
flowchart TD
  A([Bắt đầu]) --> B["Mở transaction, khóa dòng user"]
  B --> C{"Tài khoản đã liên kết mã SV?"}
  C -- Không --> E1["400: Hãy hoàn thiện hồ sơ trước"] --> R["Rollback"] --> Z([Kết thúc])
  C -- Có --> D{"Đã có đơn PENDING?"}
  D -- Có --> E2["409: Đã có yêu cầu đang chờ"] --> R
  D -- Không --> F{"Đang có hợp đồng còn hiệu lực?"}
  F -- Có --> E3["409: Đang có hợp đồng"] --> R
  F -- Không --> G["Tạo đơn trạng thái PENDING"]
  G --> H["Tạo thông báo cho mọi ADMIN, MANAGER"]
  H --> I["Commit"] --> Z
```

### 7.3 Cán bộ duyệt đơn đăng ký ở (US-15)

```mermaid
flowchart TD
  A([Bắt đầu]) --> B["Mở transaction, khóa dòng đơn"]
  B --> C{"Đơn tồn tại?"}
  C -- Không --> E1["404"] --> R["Rollback"] --> Z([Kết thúc])
  C -- Có --> D{"Đơn đang PENDING?"}
  D -- Không --> E2["409: Đã được xử lý"] --> R
  D -- Có --> P{"Quyết định?"}
  P -- Từ chối --> Q["status = REJECTED, lưu lý do"] --> N
  P -- Duyệt --> F{"Có phòng, ngày kết thúc, tiền cọc?<br/>Ngày kết thúc ở tương lai?"}
  F -- Không --> E3["400"] --> R
  F -- Có --> G["Khóa dòng phòng"]
  G --> H["Đếm hợp đồng còn hiệu lực của phòng"]
  H --> I{"Số người < sức chứa?"}
  I -- Không --> E4["409: Phòng đã đủ"] --> R
  I -- Có --> J["Tạo hợp đồng is_active, bắt đầu hôm nay"]
  J --> K["currentOccupancy = số người + 1"]
  K --> L["status = APPROVED"] --> N
  N["Lưu đơn; tạo thông báo cho tài khoản của SV"] --> O["Commit"] --> Z
```

### 7.4 Sinh viên gửi chỉ số điện nước (US-11)

```mermaid
flowchart TD
  A([Bắt đầu]) --> B{"Đủ 2 ảnh đúng định dạng, dung lượng?<br/>Chỉ số là số nguyên?"}
  B -- Không --> E1["400"] --> Z([Kết thúc])
  B -- Có --> C{"SV đang có phòng?"}
  C -- Không --> E2["400: Chưa được xếp phòng còn hiệu lực"] --> Z
  C -- Có --> D{"Còn trong hạn: trước hết tháng hiện tại?"}
  D -- Không --> E3["400: Quá hạn gửi"] --> Z
  D -- Có --> F["Mở transaction, khóa dòng phòng"]
  F --> G{"Phòng đã có bản PENDING/APPROVED kỳ này?"}
  G -- Có --> E4["409: Bạn cùng phòng đã gửi"] --> R["Rollback, xóa ảnh đã lưu"] --> Z
  G -- Không --> H["Lưu 2 ảnh vào storage"]
  H --> I["Tạo bản gửi PENDING"]
  I --> J["Thông báo cho ADMIN, MANAGER"]
  J --> K["Commit"] --> Z
```

### 7.5 Duyệt chỉ số, tạo hóa đơn và chia tiền (US-17, US-18)

Công thức (hàm trong `meter-reading-calculations.ts`):

* Tiền điện nước = (điện mới − điện cũ) × giá điện + (nước mới − nước cũ) × giá nước, làm tròn 2 chữ số.
* Tổng hóa đơn = tiền điện nước + giá phòng.
* Chia đều theo số SV có hợp đồng còn hiệu lực; tính bằng đơn vị xu, phần dư 1 xu chia cho các SV đầu tiên theo mã SV tăng dần, nên tổng các phần luôn bằng tổng hóa đơn.
* Hạn đóng = ngày 10 tháng kế tiếp.

```mermaid
flowchart TD
  A([Bắt đầu]) --> B["Mở transaction, khóa bản gửi"]
  B --> C{"Tồn tại và đang PENDING?"}
  C -- Không --> E1["404 / 409"] --> R["Rollback"] --> Z([Kết thúc])
  C -- Có --> D["Lấy chỉ số: cán bộ sửa hoặc giữ của SV"]
  D --> S["Lấy danh sách SV có hợp đồng còn hiệu lực trong phòng"]
  S --> P{"Quyết định?"}
  P -- Yêu cầu gửi lại --> Q["status = REJECTED"] --> N
  P -- Duyệt --> F["Lấy hóa đơn UTILITY gần nhất trước kỳ này<br/>chỉ số cũ = chỉ số mới của hóa đơn đó,<br/>nếu không có thì bằng chỉ số hiện tại"]
  F --> G{"Chỉ số mới ≥ chỉ số cũ?"}
  G -- Không --> E2["400"] --> R
  G -- Có --> H{"Phòng đã có hóa đơn kỳ này?"}
  H -- Có --> E3["409"] --> R
  H -- Không --> I{"Đã cấu hình đơn giá? Giá phòng hợp lệ?"}
  I -- Không --> E4["409"] --> R
  I -- Có --> J["Tính tiền điện nước, tổng, hạn đóng"]
  J --> K["Tạo UtilityBill, lưu đơn giá tại thời điểm lập"]
  K --> L["Chia tổng và tiền phòng cho từng SV,<br/>tạo UtilityBillShare"]
  L --> M["status = APPROVED"] --> N
  N["Lưu bản gửi; thông báo cho SV trong phòng<br/>kèm phần tiền của từng người"] --> O["Commit"] --> Z
```

### 7.6 Đánh dấu đã đóng tiền (US-19)

```mermaid
flowchart TD
  A([Bắt đầu]) --> B{"isPaid là true/false?"}
  B -- Không --> E1["400"] --> Z([Kết thúc])
  B -- Có --> C["Mở transaction, khóa phần tiền của SV"]
  C --> D{"Tìm thấy phần tiền?"}
  D -- Không --> E2["404"] --> R["Rollback"] --> Z
  D -- Có --> F["Cập nhật isPaid"]
  F --> G["Đếm phần chưa đóng của hóa đơn"]
  G --> H["Hóa đơn is_paid = (số phần chưa đóng = 0)"]
  H --> I["Commit, trả hóa đơn mới"] --> Z
```

### 7.7 Lập hợp đồng (US-16)

Hợp đồng tạo với `is_active = false` bỏ qua kiểm tra trùng thời gian, bảo trì và sức chứa.

```mermaid
flowchart TD
  A([Bắt đầu]) --> B{"DTO hợp lệ?"}
  B -- Không --> E1["400"] --> Z([Kết thúc])
  B -- Có --> C["Mở transaction, khóa dòng sinh viên"]
  C --> D{"Có sinh viên?"}
  D -- Không --> E2["404"] --> R["Rollback"] --> Z
  D -- Có --> F{"Ngày bắt đầu ≤ ngày kết thúc?"}
  F -- Không --> E3["400"] --> R
  F -- Có --> G{"SV đã có hợp đồng hiệu lực trùng thời gian?"}
  G -- Có --> E4["409"] --> R
  G -- Không --> H{"Có chọn phòng?"}
  H -- Không --> L
  H -- Có --> I["Khóa dòng phòng"]
  I --> J{"Có phòng?"}
  J -- Không --> E2
  J -- Có --> K{"Phòng đang bảo trì?"}
  K -- Có --> E5["409"] --> R
  K -- Không --> M{"Số hợp đồng trùng thời gian < sức chứa?"}
  M -- Không --> E6["409: Phòng đã đủ"] --> R
  M -- Có --> L["Lưu hợp đồng"]
  L --> N["Tính lại currentOccupancy của phòng"]
  N --> O["Commit, trả hợp đồng"] --> Z
```

### 7.8 Gia hạn, kết thúc, thanh lý hợp đồng (US-16)

```mermaid
flowchart TD
  A([Bắt đầu]) --> B["Mở transaction, khóa dòng hợp đồng"]
  B --> C{"Có hợp đồng?"}
  C -- Không --> E1["404"] --> R["Rollback"] --> Z([Kết thúc])
  C -- Có --> D{"is_active = true?"}
  D -- Không --> E2["409: Hợp đồng đã kết thúc"] --> R
  D -- Có --> P{"Thao tác?"}
  P -- Kết thúc --> Q["is_active = false"] --> N
  P -- Thanh lý --> F{"Ngày thanh lý từ ngày bắt đầu đến hôm nay?"}
  F -- Không --> E3["400"] --> R
  F -- Có --> G["end_date = ngày thanh lý, is_active = false"] --> N
  P -- Gia hạn --> H{"Ngày mới sau ngày kết thúc hiện tại?"}
  H -- Không --> E3
  H -- Có --> I{"Trùng hợp đồng khác của SV hoặc phòng hết chỗ?"}
  I -- Có --> E4["409"] --> R
  I -- Không --> J["end_date = ngày mới"] --> N
  N["Lưu hợp đồng, tính lại currentOccupancy"] --> O["Commit, trả hợp đồng"] --> Z
```

### 7.9 Ghi nhận thanh toán (US-21)

```mermaid
flowchart TD
  A([Bắt đầu]) --> B{"DTO hợp lệ?<br/>số tiền ≥ 0.01, ngày đúng định dạng, có loại khoản thu"}
  B -- Không --> E1["400"] --> Z([Kết thúc])
  B -- Có --> C{"Có hợp đồng?"}
  C -- Không --> E2["404"] --> Z
  C -- Có --> D["Lưu Payment gắn với hợp đồng"]
  D --> E["Trả giao dịch, frontend tải lại lịch sử thanh toán"] --> Z
```

---

## 8. Điểm cần nhóm xem lại

* Tên cột và khóa chính khác nhau (UUID, số tự tăng, mã chuỗi; camelCase lẫn snake_case). Nhóm giữ nguyên (checklist 2.4).
* User–Student là liên kết logic qua `studentSid`, không có khóa ngoại; `Student.role` thừa. Nhóm giữ nguyên (checklist 2.5).
* Hợp đồng chỉ có `is_active`, không có trạng thái `EXPIRED` (checklist 2.6). Quá hạn tính theo ngày ở frontend, không có tác vụ tự chuyển; `currentOccupancy` chỉ tính lại khi có thao tác ghi nên có thể cũ sau ngày hết hạn (checklist 5.2).
* Chưa có xóa mềm: còn lịch sử thì chặn xóa (checklist 5.3).
* Duyệt đơn đăng ký ở chưa kiểm `isMaintenance` ở backend, chỉ frontend loại phòng bảo trì khi chọn.
* `POST /payments` chỉ kiểm hợp đồng tồn tại, không đối chiếu với hóa đơn và không đổi `UtilityBillShare.isPaid`. Hai cách theo dõi tiền đang độc lập.
