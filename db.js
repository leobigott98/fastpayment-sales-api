require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: '34.170.145.243',
    port: 3306,
    user: 'root',
    password: process.env.MARIADBUSERPASSWORD,
    database: 'crm_fastpay',
});

module.exports = pool;