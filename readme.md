# BÁO CÁO BÀI TẬP THỰC HÀNH SỐ 2

## 1. Thông tin nhóm sinh viên
- Sinh viên 1: Chu Thanh Tan - 23010165
- Sinh viên 2: Dang Hai Nam - 23010068
- Sinh viên 3: Le Hai Son - 23010722
- Giảng viên phụ trách: @lethunguyen

## 2. Tên dự án cuối kỳ của Nhóm
Xây dựng và vận hành hệ thống quản lý ký túc xá sinh viên

## 3. Phân tích bài toán

### 3.1. Phân tích các đối tượng (Entities)
- **ToaNha (Tòa nhà ký túc xá):** Đại diện cho các khối nhà/khu ký túc xá (mã tòa, tên tòa, loại tòa dành cho nam/nữ, số tầng).
- **Phong (Phòng ở):** Quản lý chi tiết từng phòng trong từng tòa nhà (mã phòng, mã tòa, số phòng, sức chứa tối đa, số lượng sinh viên hiện tại, đơn giá thuê, trạng thái phòng).
- **SinhVien (Sinh viên nội trú):** Quản lý hồ sơ cá nhân của sinh viên đăng ký ở ký túc xá (mã sinh viên, họ tên, giới tính, ngày sinh, số điện thoại, email, lớp, quê quán).
- **NhanVien (Nhân viên / Ban quản lý):** Cán bộ phụ trách quản lý hợp đồng, kiểm tra phòng và thu các khoản phí (mã nhân viên, họ tên, số điện thoại, email, tài khoản, mật khẩu).
- **HopDong (Hợp đồng thuê phòng):** Ghi nhận thông tin giao kết giữa sinh viên và ban quản lý KTX (mã hợp đồng, mã sinh viên, mã phòng, mã nhân viên duyệt, ngày bắt đầu, ngày kết thúc, tiền cọc, trạng thái hợp đồng).
- **HoaDonDienNuoc (Hóa đơn dịch vụ điện nước):** Quản lý chi phí sử dụng hàng tháng của từng phòng (mã hóa đơn, mã phòng, tháng/năm, chỉ số điện đầu/cuối, chỉ số nước đầu/cuối, tổng tiền, hạn đóng, trạng thái thanh toán).

### 3.2. Mối quan hệ giữa các đối tượng
- **ToaNha - Phong (1 - N):** Mỗi tòa nhà bao gồm nhiều phòng ở; mỗi phòng ở chỉ thuộc về một tòa nhà duy nhất.
- **Phong - HopDong (1 - N):** Một phòng có thể gắn với nhiều hợp đồng thuê qua các kỳ học khác nhau; mỗi hợp đồng chỉ áp dụng cho một phòng cụ thể.
- **SinhVien - HopDong (1 - N):** Một sinh viên có thể đăng ký nhiều hợp đồng theo từng học kỳ/năm học; mỗi hợp đồng chỉ ký cho một sinh viên cụ thể.
- **NhanVien - HopDong (1 - N):** Một cán bộ quản lý có thể xét duyệt và lập nhiều hợp đồng thuê cho sinh viên.
- **Phong - HoaDonDienNuoc (1 - N):** Mỗi phòng phát sinh nhiều hóa đơn điện nước tương ứng với các tháng sử dụng; mỗi hóa đơn điện nước chỉ thuộc về một phòng.