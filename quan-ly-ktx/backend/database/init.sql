-- Tạo toàn bộ bảng cho môi trường production (DB_SYNCHRONIZE=false).
-- Xuất từ schema do TypeORM tạo. Khi đổi entity phải xuất lại file này.
-- Chạy: mysql -h <host> -P <port> -u <user> -p < database/init.sql

CREATE DATABASE IF NOT EXISTS quan_ly_ktx CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quan_ly_ktx;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `contract` (
  `contract_id` int NOT NULL AUTO_INCREMENT,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `deposit_amount` decimal(10,2) NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `sid` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`contract_id`),
  KEY `FK_c5fea843be2199ad4a2ebd4cc55` (`sid`),
  KEY `FK_f369f6fb7aa8836490e5bd4df66` (`room_id`),
  CONSTRAINT `FK_c5fea843be2199ad4a2ebd4cc55` FOREIGN KEY (`sid`) REFERENCES `student` (`sid`),
  CONSTRAINT `FK_f369f6fb7aa8836490e5bd4df66` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
);

CREATE TABLE IF NOT EXISTS `meter_reading_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submitted_by` int NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `electric_photo_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `water_photo_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `electric_reading` int NOT NULL,
  `water_reading` int NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `room_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_meter_reading_status_created` (`status`,`created_at`),
  KEY `idx_meter_reading_room_period_status` (`room_id`,`year`,`month`,`status`),
  CONSTRAINT `FK_c55799c6755a5b527abf83260a1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_created` (`user_id`,`created_at`)
);

CREATE TABLE IF NOT EXISTS `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `payment_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_id` int DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `FK_4a85b9df866c49165311420908e` (`contract_id`),
  CONSTRAINT `FK_4a85b9df866c49165311420908e` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`contract_id`)
);

CREATE TABLE IF NOT EXISTS `residence_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `review_note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `requested_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `reviewed_at` datetime DEFAULT NULL,
  `student_sid` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_residence_requests_student_date` (`student_sid`,`requested_at`),
  KEY `idx_residence_requests_status` (`status`),
  CONSTRAINT `FK_0645c9d98fc1021b155dec0c176` FOREIGN KEY (`student_sid`) REFERENCES `student` (`sid`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `room_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `building` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_capacity` int NOT NULL,
  `current_occupancy` int NOT NULL DEFAULT '0',
  `price` decimal(10,2) NOT NULL,
  `is_maintenance` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `student` (
  `sid` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','STUDENT','MANAGER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STUDENT',
  PRIMARY KEY (`sid`)
);

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','STUDENT','MANAGER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STUDENT',
  `student_sid` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fe0bb3f6520ee0469504521e71` (`username`),
  UNIQUE KEY `uq_users_student_sid` (`student_sid`)
);

CREATE TABLE IF NOT EXISTS `utility_bill` (
  `bill_id` int NOT NULL AUTO_INCREMENT,
  `bill_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UTILITY',
  `title` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_image_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `old_electric_index` int NOT NULL,
  `new_electric_index` int NOT NULL,
  `old_water_index` int NOT NULL,
  `new_water_index` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `room_rent_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `electric_unit_price` decimal(10,2) DEFAULT NULL,
  `water_unit_price` decimal(10,2) DEFAULT NULL,
  `is_paid` tinyint NOT NULL DEFAULT '0',
  `due_date` date DEFAULT NULL,
  `room_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`bill_id`),
  KEY `FK_6083de5a89c26c75d899205a302` (`room_id`),
  CONSTRAINT `FK_6083de5a89c26c75d899205a302` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
);

CREATE TABLE IF NOT EXISTS `utility_bill_share` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `room_rent_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_paid` tinyint NOT NULL DEFAULT '0',
  `bill_id` int DEFAULT NULL,
  `student_sid` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_utility_bill_share_bill_student` (`bill_id`,`student_sid`),
  KEY `FK_8ea17c3aef8120a9f47e82210ea` (`student_sid`),
  CONSTRAINT `FK_5709cfa8554ad59820a558f0115` FOREIGN KEY (`bill_id`) REFERENCES `utility_bill` (`bill_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_8ea17c3aef8120a9f47e82210ea` FOREIGN KEY (`student_sid`) REFERENCES `student` (`sid`) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS `utility_tariff` (
  `id` int NOT NULL DEFAULT '1',
  `electric_price` decimal(10,2) NOT NULL,
  `water_price` decimal(10,2) NOT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
);

SET FOREIGN_KEY_CHECKS = 1;
