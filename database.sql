CREATE DATABASE Dormitory_Management;
USE Dormitory_Management;

-- 1. Bảng Sinh viên (Lưu thông tin sinh viên nội trú)
CREATE TABLE Student (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    uni_student_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'Mã sinh viên',
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    gender ENUM('Male', 'Female') NOT NULL
);

-- 2. Bảng Phòng Ký túc xá
CREATE TABLE Room (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) NOT NULL,
    building VARCHAR(50) NOT NULL COMMENT 'Tên tòa nhà, ví dụ: Tòa A, Tòa B',
    max_capacity INT NOT NULL DEFAULT 8 COMMENT 'Sức chứa tối đa của phòng',
    current_occupancy INT DEFAULT 0 COMMENT 'Số người đang ở hiện tại',
    base_price DECIMAL(10, 2) NOT NULL COMMENT 'Mức giá thuê 1 tháng/1 sinh viên',
    room_gender ENUM('Male', 'Female') NOT NULL COMMENT 'Phân loại phòng nam/nữ'
);

-- 3. Bảng Hợp đồng thuê phòng
CREATE TABLE Contract (
    contract_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Active', 'Expired', 'Cancelled') DEFAULT 'Active',
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE
);

-- 4. Bảng Hóa đơn điện nước (Quản lý chi phí sinh hoạt hàng tháng theo phòng)
CREATE TABLE UtilityBill (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    bill_month INT NOT NULL,
    bill_year INT NOT NULL,
    old_electric_index INT NOT NULL COMMENT 'Chỉ số điện cũ',
    new_electric_index INT NOT NULL COMMENT 'Chỉ số điện mới',
    old_water_index INT NOT NULL COMMENT 'Chỉ số nước cũ',
    new_water_index INT NOT NULL COMMENT 'Chỉ số nước mới',
    total_amount DECIMAL(10, 2) NOT NULL COMMENT 'Tổng tiền phải thanh toán',
    status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE
);

-- 5. Bảng Thanh toán (Ghi nhận các đợt đóng tiền của sinh viên)
CREATE TABLE Payment (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    contract_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_type ENUM('Room_Fee', 'Deposit') NOT NULL COMMENT 'Phân loại: Tiền phòng hoặc Tiền cọc',
    FOREIGN KEY (contract_id) REFERENCES Contract(contract_id) ON DELETE CASCADE
);