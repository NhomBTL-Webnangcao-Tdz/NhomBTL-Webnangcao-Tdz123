const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

// Cấu hình kết nối
const dbConfig = {
    host: process.env.DB_HOST,     // Hostname 
    port: process.env.DB_PORT,     // Port 
    user: process.env.DB_USER,     // Username 
    password: process.env.DB_PASSWORD, // Password
    database: process.env.DB_NAME,     // Tên database     
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
        console.log('Kết nối thành công!');
        connection.release();
    } catch (error) {
        console.error('Lỗi kết nối:', error.message);
    }
}

testConnection();

module.exports = pool;