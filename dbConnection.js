const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

// Cấu hình kết nối
const dbConfig = {
    host: process.env.DB_HOST,     // Hostname lấy từ Aiven Console (ví dụ: mysql-abcxyz-group-dormitory.a.aivencloud.com)
    port: process.env.DB_PORT,     // Port (ví dụ: 10471)
    user: process.env.DB_USER,     // Username (thường là avnadmin)
    password: process.env.DB_PASSWORD, // Password
    database: process.env.DB_NAME,     // Tên database (ví dụ: Dormitory_Management)
    
    // Aiven Database thường yêu cầu SSL. Bạn cần tải file ca.pem từ Aiven Console
    ssl: {
        ca: fs.readFileSync('./ca.pem') 
    }
};

// Tạo pool kết nối
const pool = mysql.createPool(dbConfig);

// Kiểm tra kết nối
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối tới Aiven Database thành công!');
        connection.release();
    } catch (error) {
        console.error('❌ Lỗi kết nối tới Aiven Database:', error.message);
    }
}

testConnection();

module.exports = pool;